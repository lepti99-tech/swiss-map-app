// fileio.js
// Download and upload of scenarios as JSON files.
//
// File format (formatVersion 1):
// {
//   "app": "swiss-grid-app",
//   "formatVersion": 1,
//   "name": "<scenario name or null>",
//   "gridSize": 4000,
//   "exportedAt": "<ISO date>",
//   "squares": [ ["idX/idY", "colorId"], ... ]
// }

import { GRID_SIZE, COLORS, DEFAULT_COLOR_ID } from './config.js';

const APP_ID = "swiss-grid-app";
const FORMAT_VERSION = 1;

// Square IDs are kilometre coordinates of the lower-left corner, e.g. "2600/1200"
const SQUARE_ID_PATTERN = /^\d+\/\d+$/;

// Today's date as YYYY-MM-DD (local time)
function todayString() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Replaces characters that are not allowed in file names
function toSafeFileName(name) {
  const safe = name.replace(/[\\/:*?"<>|]/g, "_").trim();
  return safe || "scenario";
}

/**
 * Returns the file name used for a download.
 * Without a name: unnamed-scenario-<date>.json
 */
export function getDownloadFileName(name) {
  return name
    ? `${toSafeFileName(name)}.json`
    : `unnamed-scenario-${todayString()}.json`;
}

/**
 * Creates a JSON file with the given squares and lets the browser download it.
 * name: scenario name, or null for an unnamed selection.
 * squares: array of [id, color] pairs.
 */
export function downloadScenario(name, squares) {
  const header = {
    app: APP_ID,
    formatVersion: FORMAT_VERSION,
    name: name || null,
    gridSize: GRID_SIZE,
    exportedAt: new Date().toISOString(),
  };

  // Readable layout: header fields on separate lines, one square per line
  const headerLines = Object.keys(header).map(
    (key) => `  ${JSON.stringify(key)}: ${JSON.stringify(header[key])}`
  );
  const squareLines = squares.map((square) => `    ${JSON.stringify(square)}`);
  const json =
    "{\n" +
    headerLines.join(",\n") +
    ',\n  "squares": [\n' +
    squareLines.join(",\n") +
    "\n  ]\n}\n";

  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = getDownloadFileName(name);
  document.body.appendChild(link);
  link.click();
  link.remove();

  // Release the temporary file after the download has started
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Reads and checks the content of an uploaded file.
 * fileText: content of the file as text.
 * fileName: name of the file (used as scenario name if the file has none).
 * Returns { success: true, name, squares } or { success: false, error: "..." }.
 */
export function parseScenarioFile(fileText, fileName) {
  let data;
  try {
    data = JSON.parse(fileText);
  } catch (e) {
    return { success: false, error: "The file is not a valid scenario file (no valid JSON)." };
  }

  if (typeof data !== "object" || data === null || !Array.isArray(data.squares)) {
    return { success: false, error: "The file is not a valid scenario file (no squares found)." };
  }

  if (typeof data.formatVersion === "number" && data.formatVersion > FORMAT_VERSION) {
    return { success: false, error: "The file was created with a newer version of the app." };
  }

  const gridSize = data.gridSize === undefined ? GRID_SIZE : data.gridSize;
  if (gridSize !== GRID_SIZE) {
    return {
      success: false,
      error: `The file uses a square size of ${gridSize / 1000} km. Only ${GRID_SIZE / 1000} km is supported.`,
    };
  }

  // Check every square; unknown colors fall back to the default color
  const seen = new Set();
  const squares = [];

  for (const entry of data.squares) {
    const id = Array.isArray(entry) ? entry[0] : undefined;

    if (typeof id !== "string" || !SQUARE_ID_PATTERN.test(id)) {
      return { success: false, error: "The file contains invalid squares." };
    }

    if (seen.has(id)) continue; // ignore duplicates
    seen.add(id);

    const color = COLORS[entry[1]] ? entry[1] : DEFAULT_COLOR_ID;
    squares.push([id, color]);
  }

  // Name from the file, otherwise from the file name (without .json)
  let name = typeof data.name === "string" ? data.name.trim() : "";
  if (!name) {
    name = fileName.replace(/\.json$/i, "").trim() || "Uploaded scenario";
  }

  return { success: true, name, squares };
}
