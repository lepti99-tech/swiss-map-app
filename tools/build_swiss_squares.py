"""
Computes which grid squares touch Swiss national territory and writes
js/swiss-squares.js (one list of square IDs per square size).

A square counts as "Swiss" if the Swiss area inside it is larger than
MIN_AREA_M2 (i.e. more than just a line or a point on the border).
The exact swisstopo border is used, no simplification.

Input: swissBOUNDARIES3D (GeoPackage) from swisstopo, layer "tlm_landesgebiet",
feature icc = "CH": Swiss national territory.
- Liechtenstein and the enclaves Buesingen (DE) and Campione d'Italia (IT)
  are not part of it and therefore count as abroad.
- Border lakes are Swiss up to the border. For Lake Constance the dataset
  includes the Swiss share up to the middle of the lake.

Download (not committed, see .gitignore):
  https://data.geo.admin.ch/ch.swisstopo.swissboundaries3d/
  swissboundaries3d_2026-01/swissboundaries3d_2026-01_2056_5728.gpkg.zip
Unzip it into tools/data/.

Usage (from the project folder, plain Python 3, no extra packages):
  python tools/build_swiss_squares.py
"""

import glob
import math
import os
import sqlite3
import struct
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(ROOT, "tools", "data")
OUTPUT = os.path.join(ROOT, "js", "swiss-squares.js")

# Must match GRID_SIZES and GRID_ORIGIN in js/config.js
GRID_SIZES = [4000, 5000, 10000, 20000]
GRID_ORIGIN = (2600000, 1200000)

# A square needs more Swiss area than this to count (filters out
# rounding noise where two borders meet exactly on a grid line)
MIN_AREA_M2 = 1.0

# Squares with less Swiss area than this share are listed for manual review
REVIEW_SHARE = 0.01  # 1 %

# Manual corrections per square size, applied after the calculation.
# Example: MANUAL_ADD = {4000: ["2600/1200"]}
MANUAL_ADD = {}
MANUAL_REMOVE = {}


# ---------------------------------------------------------------------------
# Reading the GeoPackage (geometry = GeoPackage header + WKB)
# ---------------------------------------------------------------------------

def read_polygons(blob):
    """Returns the polygons of a (multi)polygon geometry.
    Each polygon is a list of rings; the first ring is the outline, the others are holes.
    Each ring is a list of (x, y)."""
    if blob[:2] != b"GP":
        raise ValueError("Not a GeoPackage geometry")
    flags = blob[3]
    envelope_size = {0: 0, 1: 32, 2: 48, 3: 48, 4: 64}[(flags >> 1) & 0x07]
    polygons = []
    parse_wkb(blob[8 + envelope_size:], 0, polygons)
    return polygons


def parse_wkb(data, offset, polygons):
    order = "<" if data[offset] == 1 else ">"
    (geom_type,) = struct.unpack_from(order + "I", data, offset + 1)
    offset += 5

    # Z/M flags: ISO (1000/2000/3000) or EWKB (high bits)
    has_z = bool(geom_type & 0x80000000)
    has_m = bool(geom_type & 0x40000000)
    geom_type &= 0x0FFFFFFF
    if geom_type >= 3000:
        has_z = has_m = True
    elif geom_type >= 2000:
        has_m = True
    elif geom_type >= 1000:
        has_z = True
    base_type = geom_type % 1000
    dims = 2 + has_z + has_m

    if base_type == 3:  # Polygon
        (num_rings,) = struct.unpack_from(order + "I", data, offset)
        offset += 4
        rings = []
        for _ in range(num_rings):
            (num_points,) = struct.unpack_from(order + "I", data, offset)
            offset += 4
            values = struct.unpack_from(order + "d" * (num_points * dims), data, offset)
            offset += 8 * num_points * dims
            rings.append([(values[i], values[i + 1]) for i in range(0, len(values), dims)])
        polygons.append(rings)
        return offset

    if base_type == 6:  # MultiPolygon
        (num_polygons,) = struct.unpack_from(order + "I", data, offset)
        offset += 4
        for _ in range(num_polygons):
            offset = parse_wkb(data, offset, polygons)
        return offset

    raise ValueError(f"Unsupported geometry type {geom_type}")


def load_territory():
    """Returns the Swiss territory as a list of (ring, sign):
    sign +1 = area counts as Swiss, -1 = area is subtracted (holes, e.g. enclaves)."""
    files = glob.glob(os.path.join(DATA_DIR, "*.gpkg"))
    if not files:
        sys.exit(f"No .gpkg file found in {DATA_DIR} (see the instructions at the top of this script).")
    print(f"Reading {os.path.basename(files[0])}")
    connection = sqlite3.connect(files[0])

    rows = connection.execute("SELECT geom FROM tlm_landesgebiet WHERE icc = 'CH'").fetchall()
    if len(rows) != 1:
        sys.exit(f"Expected exactly one feature with icc = 'CH', found {len(rows)}.")
    territory = []
    for polygon in read_polygons(rows[0][0]):
        territory.append((polygon[0], +1))
        territory.extend((hole, -1) for hole in polygon[1:])

    return territory


# ---------------------------------------------------------------------------
# Area of the territory inside each square
# (Sutherland-Hodgman clipping: first into rows, then into columns)
# ---------------------------------------------------------------------------

def clip(points, axis, limit, keep_above):
    """Clips a closed ring (list of points, first != last) at x or y = limit."""
    if not points:
        return points
    inside = (lambda p: p[axis] >= limit) if keep_above else (lambda p: p[axis] <= limit)
    result = []
    previous = points[-1]
    previous_inside = inside(previous)
    for current in points:
        current_inside = inside(current)
        if current_inside != previous_inside:
            t = (limit - previous[axis]) / (current[axis] - previous[axis])
            result.append((previous[0] + t * (current[0] - previous[0]),
                           previous[1] + t * (current[1] - previous[1])))
        if current_inside:
            result.append(current)
        previous, previous_inside = current, current_inside
    return result


def ring_area(points):
    n = len(points)
    return abs(sum(points[i][0] * points[(i + 1) % n][1] - points[(i + 1) % n][0] * points[i][1]
                   for i in range(n))) / 2


def compute_areas(territory, size):
    """Returns {(ix, iy): Swiss area in m2} for all squares with area > 0."""
    ox, oy = GRID_ORIGIN
    all_x = [x for ring, _ in territory for x, _ in ring]
    all_y = [y for ring, _ in territory for _, y in ring]
    ix_min = math.floor((min(all_x) - ox) / size)
    ix_max = math.floor((max(all_x) - ox) / size)
    iy_min = math.floor((min(all_y) - oy) / size)
    iy_max = math.floor((max(all_y) - oy) / size)

    areas = {}
    for ring, sign in territory:
        points = ring[:-1]  # WKB rings repeat the first point at the end
        for iy in range(iy_min, iy_max + 1):
            y0 = oy + iy * size
            row = clip(clip(points, 1, y0, True), 1, y0 + size, False)
            if len(row) < 3:
                continue
            for ix in range(ix_min, ix_max + 1):
                x0 = ox + ix * size
                cell = clip(clip(row, 0, x0, True), 0, x0 + size, False)
                if len(cell) >= 3:
                    area = ring_area(cell)
                    if area > 0:
                        areas[(ix, iy)] = areas.get((ix, iy), 0.0) + sign * area
    return areas


def square_id(ix, iy, size):
    x = GRID_ORIGIN[0] + ix * size
    y = GRID_ORIGIN[1] + iy * size
    return f"{x // 1000}/{y // 1000}"


def compute_squares(territory, size):
    areas = compute_areas(territory, size)
    full = size * size

    ids = set()
    review = []
    for (ix, iy), area in areas.items():
        if area > MIN_AREA_M2:
            ids.add(square_id(ix, iy, size))
            if area < REVIEW_SHARE * full:
                review.append((square_id(ix, iy, size), area))

    ids |= set(MANUAL_ADD.get(size, []))
    ids -= set(MANUAL_REMOVE.get(size, []))

    total_km2 = sum(a for a in areas.values() if a > 0) / 1e6
    return ids, sorted(review, key=lambda r: r[1]), total_km2


# ---------------------------------------------------------------------------
# Output
# ---------------------------------------------------------------------------

def sort_key(square):
    x, y = map(int, square.split("/"))
    return (-y, x)  # north to south, west to east


def write_output(result):
    lines = [
        "// swiss-squares.js",
        "// GENERATED by tools/build_swiss_squares.py - do not edit by hand,",
        "// use MANUAL_ADD / MANUAL_REMOVE in the script and run it again.",
        "//",
        "// Square IDs (lower-left corner in km, EPSG:2056) of all squares that touch",
        "// Swiss national territory (swissBOUNDARIES3D, border lakes up to the border),",
        "// per square size in meters. One line per row of squares, from north to south.",
        "",
        "export const SWISS_SQUARES = {",
    ]
    for size in GRID_SIZES:
        ids = sorted(result[size], key=sort_key)
        rows = {}
        for square in ids:
            rows.setdefault(square.split("/")[1], []).append(square)
        lines.append(f"  {size}: [")
        lines.append(",\n".join("    " + ", ".join(f'"{s}"' for s in row) for row in rows.values()))
        lines.append("  ],")
    lines.append("};")
    with open(OUTPUT, "w", encoding="utf-8", newline="\n") as f:
        f.write("\n".join(lines) + "\n")


def main():
    territory = load_territory()
    result = {}
    for size in GRID_SIZES:
        ids, review, total_km2 = compute_squares(territory, size)
        result[size] = ids
        print(f"\n{size // 1000} km: {len(ids)} squares (Swiss area counted: {total_km2:.1f} km2)")
        if review:
            print(f"  Squares with less than {REVIEW_SHARE:.0%} Swiss area (please check):")
            for square, area in review:
                print(f"    {square:>10}  {area / 1e6:8.4f} km2  ({area / (size * size):.3%})")
    write_output(result)
    print(f"\nWritten to {os.path.relpath(OUTPUT, ROOT)}")


if __name__ == "__main__":
    main()
