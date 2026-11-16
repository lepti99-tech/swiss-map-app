// storage.js
// Scenario management via localStorage.
// Data structure:
// localStorage["swissGridScenarios"] = {
//   "<name>": {
//     squares: [ [id, color], [id, color], ... ]
//   },
//   ...
// }

const STORAGE_KEY = "swissGridScenarios";

// Name of the active scenario. null = no scenario active (neutral start state).
let activeScenarioName = null;

/**
 * Reads the whole scenarios object from localStorage.
 * Returns an empty object if nothing has been saved yet
 * or if the saved data is invalid.
 */
function readAllScenarios() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch (e) {
    console.error("Error reading scenarios from localStorage:", e);
    return {};
  }
}

/**
 * Writes the whole scenarios object back to localStorage.
 */
function writeAllScenarios(scenarios) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios));
}

/**
 * Returns the name of the active scenario (or null).
 */
export function getActiveScenarioName() {
  return activeScenarioName;
}

/**
 * Returns a list of all existing scenario names (e.g. for a load list).
 */
export function listScenarios() {
  const scenarios = readAllScenarios();
  return Object.keys(scenarios);
}

/**
 * Returns true if a scenario with this name exists.
 */
export function scenarioExists(name) {
  return Object.prototype.hasOwnProperty.call(readAllScenarios(), name.trim());
}

/**
 * Creates a new scenario with the given name and makes it active.
 * squares: optional initial list of [id, color] pairs (e.g. an uploaded file
 * or a selection made before the scenario existed). Default: empty.
 * Returns { success: true, name } on success,
 * or { success: false, error: "..." } if the name is empty or already exists.
 */
export function saveScenario(name, squares = []) {
  const trimmedName = name.trim();

  if (!trimmedName) {
    return { success: false, error: "Please enter a valid name." };
  }

  const scenarios = readAllScenarios();

  if (Object.prototype.hasOwnProperty.call(scenarios, trimmedName)) {
    return {
      success: false,
      error: `A scenario named "${trimmedName}" already exists.`,
    };
  }

  scenarios[trimmedName] = { squares: squares };
  writeAllScenarios(scenarios);

  activeScenarioName = trimmedName;

  return { success: true, name: trimmedName };
}

/**
 * Renames a scenario. The position in the stored list stays the same.
 * If it is the active scenario, it stays active under the new name.
 * Returns { success: true, name } or { success: false, error: "..." }.
 */
export function renameScenario(oldName, newName) {
  const trimmedName = newName.trim();

  if (!trimmedName) {
    return { success: false, error: "Please enter a valid name." };
  }

  const scenarios = readAllScenarios();

  if (!Object.prototype.hasOwnProperty.call(scenarios, oldName)) {
    return { success: false, error: `Scenario "${oldName}" was not found.` };
  }

  // Same name: nothing to do
  if (trimmedName === oldName) {
    return { success: true, name: trimmedName };
  }

  if (Object.prototype.hasOwnProperty.call(scenarios, trimmedName)) {
    return {
      success: false,
      error: `A scenario named "${trimmedName}" already exists.`,
    };
  }

  // Rebuild the object so the renamed scenario keeps its position
  const renamed = {};
  Object.keys(scenarios).forEach((key) => {
    if (key === oldName) {
      renamed[trimmedName] = scenarios[key];
    } else {
      renamed[key] = scenarios[key];
    }
  });
  writeAllScenarios(renamed);

  if (activeScenarioName === oldName) {
    activeScenarioName = trimmedName;
  }

  return { success: true, name: trimmedName };
}

/**
 * Loads an existing scenario and makes it active.
 * Returns the saved squares ([[id, color], ...]) so the UI
 * can display the selection on the map.
 * Returns { success: false, error: "..." } if the scenario does not exist.
 */
export function loadScenario(name) {
  const scenarios = readAllScenarios();

  if (!Object.prototype.hasOwnProperty.call(scenarios, name)) {
    return { success: false, error: `Scenario "${name}" was not found.` };
  }

  activeScenarioName = name;

  return { success: true, squares: scenarios[name].squares };
}

/**
 * Deletes a scenario.
 * If it is the active scenario, the app returns to the neutral state
 * (no active scenario).
 * Returns { success: false, error: "..." } if the scenario does not exist.
 */
export function deleteScenario(name) {
  const scenarios = readAllScenarios();

  if (!Object.prototype.hasOwnProperty.call(scenarios, name)) {
    return { success: false, error: `Scenario "${name}" was not found.` };
  }

  delete scenarios[name];
  writeAllScenarios(scenarios);

  if (activeScenarioName === name) {
    activeScenarioName = null;
  }

  return { success: true };
}

/**
 * Updates the square list of the active scenario and saves it
 * automatically to localStorage. Called every time a square is toggled.
 * squares: array of [id, color] pairs reflecting the current selection.
 * Does nothing if no scenario is active.
 */
export function updateActiveScenario(squares) {
  if (!activeScenarioName) return;

  const scenarios = readAllScenarios();

  if (!Object.prototype.hasOwnProperty.call(scenarios, activeScenarioName)) {
    // Should not normally happen, but just in case:
    console.warn(`Active scenario "${activeScenarioName}" not found in localStorage.`);
    return;
  }

  scenarios[activeScenarioName].squares = squares;
  writeAllScenarios(scenarios);
}