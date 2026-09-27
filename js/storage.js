// storage.js
// Verwaltung der Szenarien via localStorage.
// Datenstruktur:
// localStorage["swissGridScenarios"] = {
//   "<name>": {
//     squares: [ [id, color], [id, color], ... ]
//   },
//   ...
// }

const STORAGE_KEY = "swissGridScenarios";

// Name des aktuell aktiven Szenarios. null = kein Szenario aktiv (neutraler Startzustand).
let activeScenarioName = null;

/**
 * Liest das gesamte Szenarien-Objekt aus dem localStorage.
 * Gibt ein leeres Objekt zurück, falls noch nichts gespeichert ist
 * oder die gespeicherten Daten fehlerhaft sind.
 */
function readAllScenarios() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch (e) {
    console.error("Fehler beim Lesen der Szenarien aus localStorage:", e);
    return {};
  }
}

/**
 * Schreibt das gesamte Szenarien-Objekt zurück in den localStorage.
 */
function writeAllScenarios(scenarios) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios));
}

/**
 * Gibt den Namen des aktuell aktiven Szenarios zurück (oder null).
 */
export function getActiveScenarioName() {
  return activeScenarioName;
}

/**
 * Liefert eine Liste aller vorhandenen Szenario-Namen (z. B. für ein Load-Dropdown).
 */
export function listScenarios() {
  const scenarios = readAllScenarios();
  return Object.keys(scenarios);
}

/**
 * Legt ein neues, leeres Szenario mit dem angegebenen Namen an und setzt es aktiv.
 * Gibt { success: true } zurück bei Erfolg,
 * oder { success: false, error: "..." } bei einem Namenskonflikt.
 */
export function saveScenario(name) {
  const trimmedName = name.trim();

  if (!trimmedName) {
    return { success: false, error: "Bitte einen gültigen Namen eingeben." };
  }

  const scenarios = readAllScenarios();

  if (Object.prototype.hasOwnProperty.call(scenarios, trimmedName)) {
    return {
      success: false,
      error: `Ein Szenario mit dem Namen "${trimmedName}" existiert bereits.`,
    };
  }

  scenarios[trimmedName] = { squares: [] };
  writeAllScenarios(scenarios);

  activeScenarioName = trimmedName;

  return { success: true };
}

/**
 * Lädt ein bestehendes Szenario und setzt es aktiv.
 * Gibt die gespeicherten Quadrate ([[id, color], ...]) zurück, damit die UI
 * die Auswahl auf der Karte entsprechend darstellen kann.
 * Gibt { success: false, error: "..." } zurück, falls das Szenario nicht existiert.
 */
export function loadScenario(name) {
  const scenarios = readAllScenarios();

  if (!Object.prototype.hasOwnProperty.call(scenarios, name)) {
    return { success: false, error: `Szenario "${name}" wurde nicht gefunden.` };
  }

  activeScenarioName = name;

  return { success: true, squares: scenarios[name].squares };
}

/**
 * Löscht ein Szenario.
 * Falls es das aktuell aktive Szenario ist, wird auf den neutralen Zustand
 * zurückgesetzt (kein aktives Szenario mehr).
 * Gibt { success: false, error: "..." } zurück, falls das Szenario nicht existiert.
 */
export function deleteScenario(name) {
  const scenarios = readAllScenarios();

  if (!Object.prototype.hasOwnProperty.call(scenarios, name)) {
    return { success: false, error: `Szenario "${name}" wurde nicht gefunden.` };
  }

  delete scenarios[name];
  writeAllScenarios(scenarios);

  if (activeScenarioName === name) {
    activeScenarioName = null;
  }

  return { success: true };
}

/**
 * Aktualisiert die Quadrat-Liste des aktuell aktiven Szenarios und speichert
 * sie automatisch im localStorage. Wird bei jedem Toggle eines Quadrats aufgerufen.
 * squares: Array von [id, color]-Paaren, das den aktuellen Auswahlzustand widerspiegelt.
 * Macht nichts, falls kein Szenario aktiv ist.
 */
export function updateActiveScenario(squares) {
  if (!activeScenarioName) return;

  const scenarios = readAllScenarios();

  if (!Object.prototype.hasOwnProperty.call(scenarios, activeScenarioName)) {
    // Sollte im Normalfall nicht vorkommen, aber zur Sicherheit:
    console.warn(`Aktives Szenario "${activeScenarioName}" nicht in localStorage gefunden.`);
    return;
  }

  scenarios[activeScenarioName].squares = squares;
  writeAllScenarios(scenarios);
}