// Karten-Initialisierung und Layer-Verwaltung

import {
  RESOLUTIONS,
  EXTENT,
  PROJECTION_CODE,
  PROJECTION_DEF,
  PIXELKARTE_CONFIG
} from './config.js';

// Globale Variablen
export let map;
export let gridSource;
export let gridLayer;
export let selectedSquaresSource;
export let selectedSquaresLayer;

// Projektion registrieren
function setupProjection() {
  const olProj4 = ol.proj.proj4;
  proj4.defs(PROJECTION_CODE, PROJECTION_DEF);
  olProj4.register(proj4);

  const projection = ol.proj.get(PROJECTION_CODE);
  projection.setExtent(EXTENT);
  return projection;
}

// WMTS Layer erstellen
function createWMTSLayer(layerConfig, projection) {
  const matrixIds = RESOLUTIONS.map((_, i) => i.toString());

  return new ol.layer.Tile({
    source: new ol.source.WMTS({
      layer: layerConfig.serverLayerName,
      crossOrigin: "anonymous",
      url:
        "https://wmts.geo.admin.ch/1.0.0/{Layer}/default/current/2056/{TileMatrix}/{TileCol}/{TileRow}.jpeg",
      projection: projection,
      matrixSet: "swissgrid",
      format: layerConfig.format,
      tileGrid: new ol.tilegrid.WMTS({
        origin: ol.extent.getTopLeft(EXTENT),
        extent: EXTENT,
        resolutions: RESOLUTIONS,
        matrixIds: matrixIds
      }),
      requestEncoding: "REST"
    })
  });
}

// Raster-Layer erstellen
function createGridLayer() {
  gridSource = new ol.source.Vector();

  gridLayer = new ol.layer.Vector({
    source: gridSource,
    style: new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: "rgba(0, 0, 139, 0.7)", // dunkelblau
        width: 1.5
      })
    })
  });

  return gridLayer;
}

// Layer für ausgefüllte Quadrate erstellen
function createSelectedSquaresLayer() {
  selectedSquaresSource = new ol.source.Vector();

  selectedSquaresLayer = new ol.layer.Vector({
    source: selectedSquaresSource,
    style: new ol.style.Style({
      fill: new ol.style.Fill({
        color: "rgba(255, 0, 0, 0.3)" // transparent rot
      }),
      stroke: new ol.style.Stroke({
        color: "rgba(255, 0, 0, 0.7)", // roter Rand
        width: 2
      })
    })
  });

  return selectedSquaresLayer;
}

// Karte initialisieren
export function initMap() {
  const projection = setupProjection();
  const wmtsLayer = createWMTSLayer(PIXELKARTE_CONFIG, projection);
  const gridLayer = createGridLayer();
  const squaresLayer = createSelectedSquaresLayer();

  map = new ol.Map({
    target: "map",
    layers: [wmtsLayer],
    view: new ol.View({
      center: [2660000, 1190000],
      projection: projection,
      resolution: 10,
      extent: EXTENT
    }),
    logo: false
  });

  map.addLayer(gridLayer);
  map.addLayer(squaresLayer);

  return map;
}
