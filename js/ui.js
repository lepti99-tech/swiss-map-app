// ui.js
// User menu management (buttons, pop-ups)

import { saveScenario, getActiveScenarioName, listScenarios, loadScenario, deleteScenario } from './storage.js';
import { loadSquares, setCurrentColor, getCurrentColor, resetCurrentColor, selectedSquares } from './selection.js';
import { COLORS, DEFAULT_COLOR_ID } from './config.js';

// Module variable: reference to the display element for the active scenario
let activeScenarioDisplay = null;
let squareCountDisplay = null; // Display of the number of selected squares
let colorCircleElements = {}; // colorId -> DOM element, for the border highlight

// Creates the menu
export function createMenu() {
    const menu = document.createElement('div');
    menu.style.position = 'absolute';
    menu.style.top = '0';
    menu.style.left = '0';
    menu.style.width = '5cm'; // height adapts to the content
    menu.style.backgroundColor = '#d3d3d3'; // light grey
    menu.style.padding = '10px';
    menu.style.boxShadow = '2px 2px 5px rgba(0, 0, 0, 0.5)';
    menu.style.zIndex = '1000'; // keeps the menu above the map
    menu.style.display = 'flex';
    menu.style.flexDirection = 'column';
 
    const title = document.createElement('h1');
    title.innerText = 'Swiss Grid App';
    title.style.fontSize = '14pt';
    title.style.margin = '0 0 6px 0';
    title.style.paddingRight = '24px'; // space for the info button
    menu.appendChild(title);

    // Info button in the top-right corner
    createInfoButton(menu);

    // Display of the active scenario
    activeScenarioDisplay = document.createElement('div');
    activeScenarioDisplay.style.fontSize = '13px';
    activeScenarioDisplay.style.fontStyle = 'italic';
    menu.appendChild(activeScenarioDisplay);

    // Set initial state (neutral if no scenario is active)
    updateActiveScenarioDisplay();

    // Display of the number of selected squares
    squareCountDisplay = document.createElement('div');
    squareCountDisplay.style.fontSize = '13px';
    squareCountDisplay.style.marginBottom = '8px';
    squareCountDisplay.style.fontStyle = 'italic';
    menu.appendChild(squareCountDisplay);

    updateSquareCountDisplay();

    // Button for a new scenario
    const newScenarioButton = document.createElement('button');
    newScenarioButton.innerText = 'Start new scenario';
    newScenarioButton.style.backgroundColor = '#4a4a4a';
    newScenarioButton.style.color = 'white';
    newScenarioButton.style.width = '4.5cm';
    newScenarioButton.style.marginTop = '0';
    newScenarioButton.style.marginBottom = '4px';
    newScenarioButton.onclick = () => openNewScenarioPopup();
    menu.appendChild(newScenarioButton);

    // Button for an existing scenario
    const loadScenarioButton = document.createElement('button');
    loadScenarioButton.innerText = 'Load existing scenario';
    loadScenarioButton.style.backgroundColor = '#4a4a4a';
    loadScenarioButton.style.color = 'white';
    loadScenarioButton.style.width = '4.5cm';
    loadScenarioButton.style.marginTop = '0';
    loadScenarioButton.style.marginBottom = '4px';
    loadScenarioButton.onclick = () => openLoadScenarioPopup();
    menu.appendChild(loadScenarioButton);

    // Button for deleting a scenario
    const deleteScenarioButton = document.createElement('button');
    deleteScenarioButton.innerText = 'Delete active scenario';
    deleteScenarioButton.style.backgroundColor = '#4a4a4a';
    deleteScenarioButton.style.color = 'white';
    deleteScenarioButton.style.width = '4.5cm';
    deleteScenarioButton.style.marginTop = '0';
    deleteScenarioButton.style.marginBottom = '8px';
    deleteScenarioButton.onclick = () => openDeleteScenarioPopup();
    menu.appendChild(deleteScenarioButton);

    // Color palette
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

    // Set initial highlight (default color is active on start)
    updateColorSelectionDisplay();
 
    document.body.appendChild(menu);
}
 
// ---------------------------------------------------------
// Helper: update the active scenario display
// ---------------------------------------------------------
 
function updateActiveScenarioDisplay() {
    if (!activeScenarioDisplay) return;
 
    const activeName = getActiveScenarioName();
    activeScenarioDisplay.innerText = activeName
        ? `Active scenario: ${activeName}`
        : 'Active scenario: –';
}

// ---------------------------------------------------------
// Update the number of selected squares
// (also called by main.js after every click on the map)
// ---------------------------------------------------------

export function updateSquareCountDisplay() {
    if (!squareCountDisplay) return;

    const count = Object.keys(selectedSquares).length;
    squareCountDisplay.innerText = `Selected squares: ${count}`;
}

// ---------------------------------------------------------
// Info button with explanation text (hover, or tap on touch devices)
// ---------------------------------------------------------

function createInfoButton(menu) {
    const infoButton = document.createElement('button');
    infoButton.innerText = 'i';
    infoButton.setAttribute('aria-label', 'About this app');
    infoButton.style.position = 'absolute';
    infoButton.style.top = '10px';
    infoButton.style.right = '10px';
    infoButton.style.width = '20px';
    infoButton.style.height = '20px';
    infoButton.style.padding = '0';
    infoButton.style.margin = '0';
    infoButton.style.borderRadius = '50%';
    infoButton.style.backgroundColor = '#4a4a4a';
    infoButton.style.color = 'white';
    infoButton.style.fontSize = '13px';
    infoButton.style.fontWeight = 'bold';
    infoButton.style.fontStyle = 'italic';
    infoButton.style.fontFamily = 'Georgia, serif'; // classic "i" symbol
    infoButton.style.lineHeight = '20px';

    // Explanation text, appears to the right of the menu
    const infoBox = document.createElement('div');
    infoBox.hidden = true;
    infoBox.style.position = 'absolute';
    infoBox.style.top = '0';
    infoBox.style.left = 'calc(100% + 8px)';
    infoBox.style.width = '280px';
    infoBox.style.backgroundColor = 'white';
    infoBox.style.padding = '10px 12px';
    infoBox.style.borderRadius = '6px';
    infoBox.style.boxShadow = '2px 2px 10px rgba(0, 0, 0, 0.5)';
    infoBox.style.fontSize = '13px';
    infoBox.style.lineHeight = '1.4';
    infoBox.innerHTML = `
        <strong>Swiss Grid App</strong> – Color 4 × 4 km squares on the map of Switzerland.
        <ul style="margin: 6px 0 0 0; padding-left: 18px;">
            <li>Click a square to color it; click again to remove it.</li>
            <li>Choose a color from the color scheme before clicking.</li>
            <li>Start a new scenario to save your squares under a name. Changes are saved automatically.</li>
            <li>Load or delete scenarios at any time.</li>
            <li>Your scenarios are stored only in this browser on this device.</li>
        </ul>`;

    infoButton.onmouseenter = () => { infoBox.hidden = false; };
    infoButton.onmouseleave = () => { infoBox.hidden = true; };
    infoButton.onclick = () => { infoBox.hidden = !infoBox.hidden; };

    menu.appendChild(infoButton);
    menu.appendChild(infoBox);
}

// ---------------------------------------------------------
// Helper: update the active color highlight
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
// Pop-up: new scenario
// ---------------------------------------------------------
 
function openNewScenarioPopup() {
    // Overlay (darkened background)
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
 
    // Pop-up box
    const box = document.createElement('div');
    box.style.backgroundColor = 'white';
    box.style.padding = '20px';
    box.style.borderRadius = '6px';
    box.style.boxShadow = '2px 2px 10px rgba(0, 0, 0, 0.5)';
    box.style.display = 'flex';
    box.style.flexDirection = 'column';
    box.style.minWidth = '250px';
 
    const label = document.createElement('label');
    label.innerText = 'Name of the new scenario:';
    label.style.marginBottom = '8px';
    box.appendChild(label);
 
    const input = document.createElement('input');
    input.type = 'text';
    input.style.marginBottom = '8px';
    input.style.padding = '5px';
    box.appendChild(input);
 
    // Area for error messages
    const errorMsg = document.createElement('div');
    errorMsg.style.color = 'red';
    errorMsg.style.fontSize = '12px';
    errorMsg.style.marginBottom = '8px';
    errorMsg.style.minHeight = '14px';
    box.appendChild(errorMsg);
 
    // Button row
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
 
    // Put focus directly into the text field
    input.focus();
 
    // Save
    saveButton.onclick = () => {
        const name = input.value.trim();
 
        if (name === '') {
            errorMsg.innerText = 'Please enter a name.';
            return;
        }
 
        const result = saveScenario(name);
 
        if (!result.success) {
            errorMsg.innerText = result.error;
            return;
        }
 
        // Reset the squares shown from the previous scenario
        loadSquares([]);
        resetCurrentColor();
        updateColorSelectionDisplay();

        // Saved successfully -> close pop-up
        updateActiveScenarioDisplay();
        updateSquareCountDisplay();
        document.body.removeChild(overlay);
    };
 
    // Cancel
    cancelButton.onclick = () => {
        document.body.removeChild(overlay);
    };
 
    // Enter key in the text field triggers Save
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            saveButton.click();
        }
    });
 
    // Escape key closes the pop-up
    overlay.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            cancelButton.click();
        }
    });
}

// ---------------------------------------------------------
// Pop-up: load existing scenario
// ---------------------------------------------------------

function openLoadScenarioPopup() {
    const scenarioNames = listScenarios();

    // Overlay (darkened background)
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

    // Pop-up box
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
    title.innerText = 'Select a scenario:';
    title.style.marginBottom = '8px';
    box.appendChild(title);

    // Area for error messages
    const errorMsg = document.createElement('div');
    errorMsg.style.color = 'red';
    errorMsg.style.fontSize = '12px';
    errorMsg.style.marginBottom = '8px';
    errorMsg.style.minHeight = '14px';
    box.appendChild(errorMsg);

    if (scenarioNames.length === 0) {
        const emptyMsg = document.createElement('div');
        emptyMsg.innerText = 'There are no saved scenarios yet.';
        emptyMsg.style.fontSize = '13px';
        emptyMsg.style.marginBottom = '12px';
        box.appendChild(emptyMsg);
    } else {
        // List of scenarios
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

                // Display the selected squares on the map
                loadSquares(result.squares);
                resetCurrentColor();
                updateColorSelectionDisplay();

                // Update display and close pop-up
                updateActiveScenarioDisplay();
                updateSquareCountDisplay();
                document.body.removeChild(overlay);
            };

            list.appendChild(item);
        });

        box.appendChild(list);
    }

    // Cancel button
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

    // Escape key closes the pop-up
    overlay.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            cancelButton.click();
        }
    });
}

// ---------------------------------------------------------
// Pop-up: delete active scenario
// ---------------------------------------------------------

function openDeleteScenarioPopup() {
    // Overlay (darkened background)
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

    // Pop-up box
    const box = document.createElement('div');
    box.style.backgroundColor = 'white';
    box.style.padding = '20px';
    box.style.borderRadius = '6px';
    box.style.boxShadow = '2px 2px 10px rgba(0, 0, 0, 0.5)';
    box.style.display = 'flex';
    box.style.flexDirection = 'column';
    box.style.minWidth = '250px';

    // Area for error messages
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

    // Button row
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


    // Confirm deletion
    confirmButton.onclick = () => {
        const activeName = getActiveScenarioName();

        if (!activeName) {
            errorMsg.innerText = 'No scenario is active.';
            return;
        }

        const result = deleteScenario(activeName);

        if (!result.success) {
            errorMsg.innerText = result.error;
            return;
        }

        // Reset the squares shown on the map
        loadSquares([]);
        resetCurrentColor();
        updateColorSelectionDisplay();

        // Update display and close pop-up
        updateActiveScenarioDisplay();
        updateSquareCountDisplay();
        document.body.removeChild(overlay);
    };


    // Cancel
    cancelButton.onclick = () => {
        document.body.removeChild(overlay);
    };

    // Escape key closes the pop-up
    overlay.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            cancelButton.click();
        }
    });
}

// Color selection
function selectColor(colorId) {
    setCurrentColor(colorId);
    updateColorSelectionDisplay();
    console.log("Color selected:", colorId);
}