// ui.js
// Verwaltung des User-Menüs (Buttons, Pop-ups)

import { saveScenario, getActiveScenarioName, listScenarios, loadScenario, deleteScenario } from './storage.js';
import { loadSquares, setCurrentColor, getCurrentColor, resetCurrentColor } from './selection.js';
import { COLORS, DEFAULT_COLOR_ID } from './config.js';

// Modul-Variable: Referenz auf das Anzeige-Element für das aktive Szenario
let activeScenarioDisplay = null;
let colorCircleElements = {}; // colorId -> DOM-Element, für die Umrandungs-Markierung

// Funktion zum Erstellen des Menüs
export function createMenu() {
    const menu = document.createElement('div');
    menu.style.position = 'absolute';
    menu.style.top = '0';
    menu.style.left = '0';
    menu.style.width = '5cm';
    menu.style.height = '7cm';
    menu.style.backgroundColor = '#d3d3d3'; // hellgrau
    menu.style.padding = '10px';
    menu.style.boxShadow = '2px 2px 5px rgba(0, 0, 0, 0.5)';
    menu.style.zIndex = '1000'; // damit das Menü über der Karte liegt
    menu.style.display = 'flex';
    menu.style.flexDirection = 'column';
 
    const title = document.createElement('h1');
    title.innerText = 'Swiss Grid App';
    title.style.fontSize = '16px'; // etwas kleiner, damit es ins Menü passt
    menu.appendChild(title);
 
    // Anzeige des aktiven Szenarios
    activeScenarioDisplay = document.createElement('div');
    activeScenarioDisplay.style.fontSize = '13px';
    activeScenarioDisplay.style.marginBottom = '10px';
    activeScenarioDisplay.style.fontStyle = 'italic';
    menu.appendChild(activeScenarioDisplay);
 
    // Initialen Zustand setzen (neutral, falls kein Szenario aktiv)
    updateActiveScenarioDisplay();
 
    // Button für neues Szenario
    const newScenarioButton = document.createElement('button');
    newScenarioButton.innerText = 'Start new scenario';
    newScenarioButton.style.backgroundColor = '#4a4a4a';
    newScenarioButton.style.color = 'white';
    newScenarioButton.style.width = '4.5cm';
    newScenarioButton.style.marginBottom = '5px';
    newScenarioButton.onclick = () => openNewScenarioPopup();
    menu.appendChild(newScenarioButton);
 
    // Button für bestehendes Szenario
    const loadScenarioButton = document.createElement('button');
    loadScenarioButton.innerText = 'Load existing scenario';
    loadScenarioButton.style.backgroundColor = '#4a4a4a';
    loadScenarioButton.style.color = 'white';
    loadScenarioButton.style.width = '4.5cm';
    loadScenarioButton.style.marginBottom = '5px';
    loadScenarioButton.onclick = () => openLoadScenarioPopup();
    menu.appendChild(loadScenarioButton);
 
    // Button zum Löschen eines Szenarios
    const deleteScenarioButton = document.createElement('button');
    deleteScenarioButton.innerText = 'Delete active scenario';
    deleteScenarioButton.style.backgroundColor = '#4a4a4a';
    deleteScenarioButton.style.color = 'white';
    deleteScenarioButton.style.width = '4.5cm';
    deleteScenarioButton.style.marginBottom = '8px';
    deleteScenarioButton.onclick = () => openDeleteScenarioPopup();
    menu.appendChild(deleteScenarioButton);

    // Farbpalette
    const colorPaletteLabel = document.createElement('div');
    colorPaletteLabel.innerText = 'Color scheme:';
    colorPaletteLabel.style.fontSize = '13px';
    colorPaletteLabel.style.marginTop = '4px';
    menu.appendChild(colorPaletteLabel);

    const colorPalette = document.createElement('div');
    colorPalette.style.display = 'flex';
    colorPalette.style.flexWrap = 'wrap';

    Object.keys(COLORS).forEach((colorId) => {
        const colorDef = COLORS[colorId];
        const colorCircle = document.createElement('div');
        colorCircle.style.width = '20px';
        colorCircle.style.height = '20px';
        colorCircle.style.backgroundColor = colorDef.stroke;
        colorCircle.style.borderRadius = '50%';
        colorCircle.style.display = 'inline-block';
        colorCircle.style.margin = '5px';
        colorCircle.style.cursor = 'pointer';
        colorCircle.style.boxSizing = 'border-box';
        colorCircle.title = colorDef.label;
        colorCircle.onclick = () => selectColor(colorId);

        colorCircleElements[colorId] = colorCircle;
        colorPalette.appendChild(colorCircle);
    });

    menu.appendChild(colorPalette);

    // Initiale Markierung setzen (Standardfarbe ist beim Start aktiv)
    updateColorSelectionDisplay();
 
    document.body.appendChild(menu);
}
 
// ---------------------------------------------------------
// Hilfsfunktion: Anzeige des aktiven Szenarios aktualisieren
// ---------------------------------------------------------
 
function updateActiveScenarioDisplay() {
    if (!activeScenarioDisplay) return;
 
    const activeName = getActiveScenarioName();
    activeScenarioDisplay.innerText = activeName
        ? `Active scenario: ${activeName}`
        : 'Active scenario: –';
}

// ---------------------------------------------------------
// Hilfsfunktion: Markierung der aktiven Farbe aktualisieren
// ---------------------------------------------------------

function updateColorSelectionDisplay() {
    const activeColor = getCurrentColor();

    Object.keys(colorCircleElements).forEach((colorId) => {
        const circle = colorCircleElements[colorId];
        if (colorId === activeColor) {
            circle.style.border = '2px solid black';
        } else {
            circle.style.border = '2px solid transparent';
        }
    });
}

// ---------------------------------------------------------
// Pop-up: Neues Szenario
// ---------------------------------------------------------
 
function openNewScenarioPopup() {
    // Overlay (abgedunkelter Hintergrund)
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.4)';
    overlay.style.zIndex = '2000';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
 
    // Pop-up-Box
    const box = document.createElement('div');
    box.style.backgroundColor = 'white';
    box.style.padding = '20px';
    box.style.borderRadius = '6px';
    box.style.boxShadow = '2px 2px 10px rgba(0, 0, 0, 0.5)';
    box.style.display = 'flex';
    box.style.flexDirection = 'column';
    box.style.minWidth = '250px';
 
    const label = document.createElement('label');
    label.innerText = 'Name des neuen Szenarios:';
    label.style.marginBottom = '8px';
    box.appendChild(label);
 
    const input = document.createElement('input');
    input.type = 'text';
    input.style.marginBottom = '8px';
    input.style.padding = '5px';
    box.appendChild(input);
 
    // Bereich für Fehlermeldungen
    const errorMsg = document.createElement('div');
    errorMsg.style.color = 'red';
    errorMsg.style.fontSize = '12px';
    errorMsg.style.marginBottom = '8px';
    errorMsg.style.minHeight = '14px';
    box.appendChild(errorMsg);
 
    // Button-Reihe
    const buttonRow = document.createElement('div');
    buttonRow.style.display = 'flex';
    buttonRow.style.justifyContent = 'space-between';
 
    const saveButton = document.createElement('button');
    saveButton.innerText = 'Save';
    saveButton.style.backgroundColor = '#4a4a4a';
    saveButton.style.color = 'white';
    saveButton.style.width = '48%';
 
    const cancelButton = document.createElement('button');
    cancelButton.innerText = 'Cancel';
    cancelButton.style.backgroundColor = '#4a4a4a';
    cancelButton.style.color = 'white';
    cancelButton.style.width = '48%';
 
    buttonRow.appendChild(saveButton);
    buttonRow.appendChild(cancelButton);
    box.appendChild(buttonRow);
 
    overlay.appendChild(box);
    document.body.appendChild(overlay);
 
    // Fokus direkt ins Textfeld setzen
    input.focus();
 
    // Speichern
    saveButton.onclick = () => {
        const name = input.value.trim();
 
        if (name === '') {
            errorMsg.innerText = 'Bitte einen Namen eingeben.';
            return;
        }
 
        const result = saveScenario(name);
 
        if (!result.success) {
            errorMsg.innerText = result.error;
            return;
        }
 
        // Angezeigte Quadrate des vorherigen Szenarios zurücksetzen
        loadSquares([]);
        resetCurrentColor();
        updateColorSelectionDisplay();

        // Erfolgreich gespeichert -> Pop-up schliessen
        updateActiveScenarioDisplay();
        document.body.removeChild(overlay);
    };
 
    // Abbrechen
    cancelButton.onclick = () => {
        document.body.removeChild(overlay);
    };
 
    // Enter-Taste im Textfeld löst Save aus
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            saveButton.click();
        }
    });
 
    // Escape-Taste schliesst Pop-up
    overlay.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            cancelButton.click();
        }
    });
}

// ---------------------------------------------------------
// Pop-up: Bestehendes Szenario laden
// ---------------------------------------------------------

function openLoadScenarioPopup() {
    const scenarioNames = listScenarios();

    // Overlay (abgedunkelter Hintergrund)
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.4)';
    overlay.style.zIndex = '2000';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';

    // Pop-up-Box
    const box = document.createElement('div');
    box.style.backgroundColor = 'white';
    box.style.padding = '20px';
    box.style.borderRadius = '6px';
    box.style.boxShadow = '2px 2px 10px rgba(0, 0, 0, 0.5)';
    box.style.display = 'flex';
    box.style.flexDirection = 'column';
    box.style.minWidth = '250px';
    box.style.maxHeight = '70vh';
    box.style.overflowY = 'auto';

    const title = document.createElement('label');
    title.innerText = 'Szenario auswählen:';
    title.style.marginBottom = '8px';
    box.appendChild(title);

    // Bereich für Fehlermeldungen
    const errorMsg = document.createElement('div');
    errorMsg.style.color = 'red';
    errorMsg.style.fontSize = '12px';
    errorMsg.style.marginBottom = '8px';
    errorMsg.style.minHeight = '14px';
    box.appendChild(errorMsg);

    if (scenarioNames.length === 0) {
        const emptyMsg = document.createElement('div');
        emptyMsg.innerText = 'Es sind noch keine Szenarien vorhanden.';
        emptyMsg.style.fontSize = '13px';
        emptyMsg.style.marginBottom = '12px';
        box.appendChild(emptyMsg);
    } else {
        // Liste der Szenarien
        const list = document.createElement('div');
        list.style.display = 'flex';
        list.style.flexDirection = 'column';
        list.style.marginBottom = '12px';

        scenarioNames.forEach((name) => {
            const item = document.createElement('button');
            item.innerText = name;
            item.style.backgroundColor = '#eeeeee';
            item.style.color = '#000000';
            item.style.textAlign = 'left';
            item.style.padding = '6px';
            item.style.marginBottom = '4px';
            item.style.border = '1px solid #cccccc';
            item.style.cursor = 'pointer';

            item.onclick = () => {
                const result = loadScenario(name);

                if (!result.success) {
                    errorMsg.innerText = result.error;
                    return;
                }

                // Ausgewählte Quadrate auf der Karte darstellen
                loadSquares(result.squares);
                resetCurrentColor();
                updateColorSelectionDisplay();

                // Anzeige aktualisieren und Pop-up schliessen
                updateActiveScenarioDisplay();
                document.body.removeChild(overlay);
            };

            list.appendChild(item);
        });

        box.appendChild(list);
    }

    // Abbrechen-Button
    const cancelButton = document.createElement('button');
    cancelButton.innerText = 'Cancel';
    cancelButton.style.backgroundColor = '#4a4a4a';
    cancelButton.style.color = 'white';
    cancelButton.style.width = '100%';

    cancelButton.onclick = () => {
        document.body.removeChild(overlay);
    };

    box.appendChild(cancelButton);

    overlay.appendChild(box);
    document.body.appendChild(overlay);

    // Escape-Taste schliesst Pop-up
    overlay.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            cancelButton.click();
        }
    });
}

// ---------------------------------------------------------
// Pop-up: Aktives Szenario löschen
// ---------------------------------------------------------

function openDeleteScenarioPopup() {
    // Overlay (abgedunkelter Hintergrund)
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.4)';
    overlay.style.zIndex = '2000';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';

    // Pop-up-Box
    const box = document.createElement('div');
    box.style.backgroundColor = 'white';
    box.style.padding = '20px';
    box.style.borderRadius = '6px';
    box.style.boxShadow = '2px 2px 10px rgba(0, 0, 0, 0.5)';
    box.style.display = 'flex';
    box.style.flexDirection = 'column';
    box.style.minWidth = '250px';

    // Bereich für Fehlermeldungen
    const errorMsg = document.createElement('div');
    errorMsg.style.color = 'red';
    errorMsg.style.fontSize = '12px';
    errorMsg.style.marginBottom = '8px';
    errorMsg.style.minHeight = '14px';

    const question = document.createElement('label');
    question.innerText = 'Do you want to delete the active scenario?';
    question.style.marginBottom = '12px';
    box.appendChild(question);

    box.appendChild(errorMsg);

    // Button-Reihe
    const buttonRow = document.createElement('div');
    buttonRow.style.display = 'flex';
    buttonRow.style.justifyContent = 'space-between';

    const confirmButton = document.createElement('button');
    confirmButton.innerText = 'Yes, delete';
    confirmButton.style.backgroundColor = '#4a4a4a';
    confirmButton.style.color = 'white';
    confirmButton.style.width = '48%';

    const cancelButton = document.createElement('button');
    cancelButton.innerText = 'No, exit';
    cancelButton.style.backgroundColor = '#4a4a4a';
    cancelButton.style.color = 'white';
    cancelButton.style.width = '48%';

    buttonRow.appendChild(confirmButton);
    buttonRow.appendChild(cancelButton);
    box.appendChild(buttonRow);

    overlay.appendChild(box);
    document.body.appendChild(overlay);


    // Löschen bestätigen
    confirmButton.onclick = () => {
        const activeName = getActiveScenarioName();

        if (!activeName) {
            errorMsg.innerText = 'Es ist kein Szenario aktiv.';
            return;
        }

        const result = deleteScenario(activeName);

        if (!result.success) {
            errorMsg.innerText = result.error;
            return;
        }

        // Angezeigte Quadrate auf der Karte zurücksetzen
        loadSquares([]);
        resetCurrentColor();
        updateColorSelectionDisplay();

        // Anzeige aktualisieren und Pop-up schliessen
        updateActiveScenarioDisplay();
        document.body.removeChild(overlay);
    };


    // Abbrechen
    cancelButton.onclick = () => {
        document.body.removeChild(overlay);
    };

    // Escape-Taste schliesst Pop-up
    overlay.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            cancelButton.click();
        }
    });
}

// Funktion zur Farbauswahl
function selectColor(colorId) {
    setCurrentColor(colorId);
    updateColorSelectionDisplay();
    console.log("Farbe gewählt:", colorId);
}