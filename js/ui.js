// ui.js
// User menu management (buttons, pop-ups).
// All styling lives in style.css; this file only builds the elements and assigns CSS classes.

import { saveScenario, getActiveScenarioName, listScenarios, loadScenario, deleteScenario } from './storage.js';
import { loadSquares, setCurrentColor, getCurrentColor, resetCurrentColor, selectedSquares } from './selection.js';
import { COLORS } from './config.js';

// Module variables: references to elements that are updated later
let activeScenarioDisplay = null;
let squareCountDisplay = null;   // Display of the number of selected squares
let colorCircleElements = {};    // colorId -> DOM element, for the active highlight

// ---------------------------------------------------------
// Small helpers for creating elements
// ---------------------------------------------------------

// Creates an element with an optional CSS class and text
function createElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.innerText = text;
    return element;
}

// Creates a button with a CSS class, text and click handler
function createButton(text, className, onClick) {
    const button = createElement('button', className, text);
    button.onclick = onClick;
    return button;
}

// ---------------------------------------------------------
// Pop-up frame shared by all pop-ups
// Returns { box, close }: "box" receives the content, "close()" removes the pop-up.
// The pop-up closes with the Escape key (wherever the focus is)
// and with a click on the dark background.
// ---------------------------------------------------------

function openPopup() {
    const overlay = createElement('div', 'popup-overlay');
    const box = createElement('div', 'popup-box');
    overlay.appendChild(box);
    document.body.appendChild(overlay);

    function onKeyDown(e) {
        if (e.key === 'Escape') close();
    }

    function close() {
        document.removeEventListener('keydown', onKeyDown);
        overlay.remove();
    }

    document.addEventListener('keydown', onKeyDown);

    // Click on the dark background (not on the box itself) closes the pop-up
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) close();
    });

    return { box, close };
}

// Area for error messages inside a pop-up
function createErrorMessage() {
    return createElement('div', 'error-msg');
}

// Row with two buttons side by side
function createButtonRow(...buttons) {
    const row = createElement('div', 'popup-buttons');
    buttons.forEach((button) => row.appendChild(button));
    return row;
}

// Resets the map and the menu after switching scenarios
// (new, loaded or deleted scenario)
function showSquares(squares) {
    loadSquares(squares);
    resetCurrentColor();
    updateColorSelectionDisplay();
    updateActiveScenarioDisplay();
    updateSquareCountDisplay();
}

// ---------------------------------------------------------
// Menu
// ---------------------------------------------------------

export function createMenu() {
    const menu = createElement('div', 'menu');

    menu.appendChild(createElement('h1', null, 'Swiss Grid App'));

    // Info button in the top-right corner
    createInfoButton(menu);

    // Display of the active scenario
    activeScenarioDisplay = createElement('div', 'menu-status');
    menu.appendChild(activeScenarioDisplay);
    updateActiveScenarioDisplay();

    // Display of the number of selected squares
    squareCountDisplay = createElement('div', 'menu-status menu-status-last');
    menu.appendChild(squareCountDisplay);
    updateSquareCountDisplay();

    // Scenario buttons
    menu.appendChild(createButton('Start new scenario', 'btn-dark menu-button', openNewScenarioPopup));
    menu.appendChild(createButton('Load existing scenario', 'btn-dark menu-button', openLoadScenarioPopup));
    menu.appendChild(createButton('Delete active scenario', 'btn-dark menu-button', openDeleteScenarioPopup));

    // Color palette
    menu.appendChild(createElement('div', 'color-palette-label', 'Color scheme:'));

    const colorPalette = createElement('div', 'color-palette');

    Object.keys(COLORS).forEach((colorId) => {
        const colorDef = COLORS[colorId];
        const colorCircle = createElement('div', 'color-circle');
        colorCircle.style.backgroundColor = colorDef.stroke; // color comes from config.js
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
// Update the active scenario display
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
    const infoButton = createElement('button', 'btn-dark info-button', 'i');
    infoButton.setAttribute('aria-label', 'About this app');

    // Explanation text, appears to the right of the menu
    const infoBox = createElement('div', 'info-box');
    infoBox.hidden = true;
    infoBox.innerHTML = `
        <strong>Swiss Grid App</strong> – Color 4 × 4 km squares on the map of Switzerland.
        <ul>
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
// Color selection and highlight
// ---------------------------------------------------------

function selectColor(colorId) {
    setCurrentColor(colorId);
    updateColorSelectionDisplay();
}

function updateColorSelectionDisplay() {
    const activeColor = getCurrentColor();

    Object.keys(colorCircleElements).forEach((colorId) => {
        colorCircleElements[colorId].classList.toggle('active', colorId === activeColor);
    });
}

// ---------------------------------------------------------
// Pop-up: new scenario
// ---------------------------------------------------------

function openNewScenarioPopup() {
    const { box, close } = openPopup();

    box.appendChild(createElement('label', 'popup-label', 'Name of the new scenario:'));

    const input = createElement('input', 'popup-input');
    input.type = 'text';
    box.appendChild(input);

    const errorMsg = createErrorMessage();
    box.appendChild(errorMsg);

    const saveButton = createButton('Save', 'btn-dark', () => {
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

        // New scenario starts empty
        showSquares([]);
        close();
    });

    const cancelButton = createButton('Cancel', 'btn-dark', close);

    box.appendChild(createButtonRow(saveButton, cancelButton));

    // Enter key in the text field triggers Save
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') saveButton.click();
    });

    // Put focus directly into the text field
    input.focus();
}

// ---------------------------------------------------------
// Pop-up: load existing scenario
// ---------------------------------------------------------

function openLoadScenarioPopup() {
    const scenarioNames = listScenarios();
    const { box, close } = openPopup();

    box.appendChild(createElement('label', 'popup-label', 'Select a scenario:'));

    const errorMsg = createErrorMessage();
    box.appendChild(errorMsg);

    if (scenarioNames.length === 0) {
        box.appendChild(createElement('div', 'popup-text popup-small', 'There are no saved scenarios yet.'));
    } else {
        const list = createElement('div', 'popup-list');

        scenarioNames.forEach((name) => {
            list.appendChild(createButton(name, 'popup-list-item', () => {
                const result = loadScenario(name);

                if (!result.success) {
                    errorMsg.innerText = result.error;
                    return;
                }

                // Display the saved squares on the map
                showSquares(result.squares);
                close();
            }));
        });

        box.appendChild(list);
    }

    box.appendChild(createButton('Cancel', 'btn-dark', close));
}

// ---------------------------------------------------------
// Pop-up: delete active scenario
// ---------------------------------------------------------

function openDeleteScenarioPopup() {
    const activeName = getActiveScenarioName();
    const { box, close } = openPopup();

    // No active scenario: say so right away instead of asking for confirmation
    if (!activeName) {
        box.appendChild(createElement('div', 'popup-text', 'No scenario is active.'));
        box.appendChild(createButton('OK', 'btn-dark', close));
        return;
    }

    box.appendChild(createElement('label', 'popup-text', `Do you want to delete the scenario "${activeName}"?`));

    const errorMsg = createErrorMessage();
    box.appendChild(errorMsg);

    const confirmButton = createButton('Yes, delete', 'btn-dark', () => {
        const result = deleteScenario(activeName);

        if (!result.success) {
            errorMsg.innerText = result.error;
            return;
        }

        // Clear the squares shown on the map
        showSquares([]);
        close();
    });

    const cancelButton = createButton('No, exit', 'btn-dark', close);

    box.appendChild(createButtonRow(confirmButton, cancelButton));
}
