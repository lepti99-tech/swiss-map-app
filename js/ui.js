// ui.js
// User menu management (buttons, pop-ups).
// All styling lives in style.css; this file only builds the elements and assigns CSS classes.

import {
    saveScenario, getActiveScenarioName, listScenarios, loadScenario,
    deleteScenario, renameScenario, scenarioExists
} from './storage.js';
import {
    loadSquares, setCurrentColor, getCurrentColor, resetCurrentColor,
    selectedSquares, getSquaresAsArray, clearAllSquares
} from './selection.js';
import { getGridSize, setGridSize } from './grid.js';
import { downloadScenario, getDownloadFileName, parseScenarioFile } from './fileio.js';
import { COLORS, GRID_SIZES } from './config.js';

// Module variables: references to elements that are updated later
let activeScenarioDisplay = null;
let renameButton = null;         // Pencil button next to the active scenario
let squareCountDisplay = null;   // Display of the number of selected squares
let colorCircleElements = {};    // colorId -> DOM element, for the active highlight
let gridSizeLabel = null;        // "Square size: 4 km"
let gridSizeSlider = null;       // Slider for the square size (only usable without active scenario)
let gridSizeTickLabels = [];     // Labels "4 km" ... "20 km" below the slider (the chosen one is bold)
let noScenarioHintShown = false; // Hint "no active scenario" is shown once per page load

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

// Creates a text input, optionally pre-filled
function createTextInput(value = '') {
    const input = createElement('input', 'popup-input');
    input.type = 'text';
    input.value = value;
    return input;
}

// Number of currently selected squares
function getSquareCount() {
    return Object.keys(selectedSquares).length;
}

// "1 square" / "5 squares"
function squaresText(count) {
    return count === 1 ? '1 square' : `${count} squares`;
}

// 4000 -> "4 km"
function sizeText(gridSize) {
    return `${gridSize / 1000} km`;
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

// Simple pop-up with a message and an OK button
function openMessagePopup(message) {
    const { box, close } = openPopup();
    box.appendChild(createElement('div', 'popup-text', message));
    const okButton = createButton('OK', 'btn-dark', close);
    box.appendChild(okButton);
    okButton.focus();
}

// Resets the map and the menu after switching scenarios
// (new, loaded, uploaded or deleted scenario).
// gridSize: square size of the scenario; without it, the current size is kept.
function showSquares(squares, gridSize = getGridSize()) {
    setGridSize(gridSize); // must be set before the squares are drawn
    loadSquares(squares);
    resetCurrentColor();
    updateColorSelectionDisplay();
    updateActiveScenarioDisplay();
    updateSquareCountDisplay();
}

// Enter key in a text field triggers the given button
function submitOnEnter(input, button) {
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') button.click();
    });
}

// ---------------------------------------------------------
// Menu
// ---------------------------------------------------------

export function createMenu() {
    const menu = createElement('div', 'menu');

    menu.appendChild(createElement('h1', null, 'Swiss Grid App'));

    // Info button in the top-right corner
    createInfoButton(menu);

    // Display of the active scenario, with pencil button for renaming
    const scenarioRow = createElement('div', 'menu-scenario-row');
    activeScenarioDisplay = createElement('div', 'menu-status');
    renameButton = createButton('✎', 'icon-button', openRenameScenarioPopup);
    renameButton.title = 'Rename scenario';
    renameButton.setAttribute('aria-label', 'Rename scenario');
    scenarioRow.appendChild(activeScenarioDisplay);
    scenarioRow.appendChild(renameButton);
    menu.appendChild(scenarioRow);
    updateActiveScenarioDisplay();

    // Display of the number of selected squares
    squareCountDisplay = createElement('div', 'menu-status menu-status-last');
    menu.appendChild(squareCountDisplay);
    updateSquareCountDisplay();

    // Scenario buttons
    menu.appendChild(createButton('Start new scenario', 'btn-dark menu-button', openNewScenarioPopup));
    menu.appendChild(createButton('Load existing scenario', 'btn-dark menu-button', openLoadScenarioPopup));
    menu.appendChild(createButton('Download scenario', 'btn-dark menu-button', openDownloadPopup));
    menu.appendChild(createButton('Delete active scenario', 'btn-dark menu-button', openDeleteScenarioPopup));

    // Square size
    createGridSizeSlider(menu);

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
// Update the active scenario display (and show the pencil only if a scenario is active)
// ---------------------------------------------------------

function updateActiveScenarioDisplay() {
    if (!activeScenarioDisplay) return;

    const activeName = getActiveScenarioName();
    activeScenarioDisplay.innerText = activeName
        ? `Active scenario: ${activeName}`
        : 'Active scenario: –';
    renameButton.hidden = !activeName;
    updateGridSizeDisplay(); // the slider is locked while a scenario is active
}

// ---------------------------------------------------------
// Update the number of selected squares
// (also called by main.js after every click on the map)
// ---------------------------------------------------------

export function updateSquareCountDisplay() {
    if (!squareCountDisplay) return;

    squareCountDisplay.innerText = `Selected squares: ${getSquareCount()}`;
}

// ---------------------------------------------------------
// Square size slider.
// Only usable without an active scenario; a scenario keeps its size for good.
// Changing the size removes the current (unsaved) selection.
// ---------------------------------------------------------

// Layout: a thin line with a tick mark per size, the (invisible) slider on top,
// and a label centered below each tick mark. See style.css "Square size slider".
function createGridSizeSlider(menu) {
    gridSizeLabel = createElement('div', 'grid-size-label');
    menu.appendChild(gridSizeLabel);

    const control = createElement('div', 'grid-size-control');

    // Line and tick marks
    const track = createElement('div', 'grid-size-track');
    // Labels below the tick marks
    const labels = createElement('div', 'grid-size-tick-labels');

    gridSizeTickLabels = [];
    GRID_SIZES.forEach((size, index) => {
        const position = `${(index / (GRID_SIZES.length - 1)) * 100}%`;

        const tick = createElement('div', 'grid-size-tick');
        tick.style.left = position;
        track.appendChild(tick);

        const label = createElement('span', 'grid-size-tick-label', sizeText(size));
        label.style.left = position;
        labels.appendChild(label);
        gridSizeTickLabels.push(label);
    });

    gridSizeSlider = createElement('input', 'grid-size-slider');
    gridSizeSlider.type = 'range';
    gridSizeSlider.min = 0;
    gridSizeSlider.max = GRID_SIZES.length - 1;
    gridSizeSlider.step = 1;
    gridSizeSlider.setAttribute('aria-label', 'Square size');

    control.appendChild(track);
    control.appendChild(gridSizeSlider);
    control.appendChild(labels);
    menu.appendChild(control);

    // While dragging: show the size in the label and in bold below the slider
    gridSizeSlider.oninput = () => {
        const index = Number(gridSizeSlider.value);
        gridSizeLabel.innerText = `Square size: ${sizeText(GRID_SIZES[index])}`;
        highlightTickLabel(index);
    };

    // Slider released: change the size (with confirmation if squares would be lost)
    gridSizeSlider.onchange = () => {
        const newSize = GRID_SIZES[gridSizeSlider.value];
        updateGridSizeDisplay(); // back to the current size until the change is done
        if (newSize === getGridSize() || getActiveScenarioName()) return;

        if (getSquareCount() === 0) {
            changeGridSize(newSize);
        } else {
            openChangeGridSizePopup(newSize);
        }
    };

    updateGridSizeDisplay();
}

function updateGridSizeDisplay() {
    if (!gridSizeSlider) return;

    const locked = Boolean(getActiveScenarioName());
    gridSizeLabel.innerText = `Square size: ${sizeText(getGridSize())}`;
    gridSizeSlider.value = GRID_SIZES.indexOf(getGridSize());
    highlightTickLabel(GRID_SIZES.indexOf(getGridSize()));
    gridSizeSlider.disabled = locked;
    gridSizeSlider.title = locked
        ? 'The square size is fixed for the active scenario.'
        : 'Choose the square size';
}

// Shows the label of the given size index in bold
function highlightTickLabel(activeIndex) {
    gridSizeTickLabels.forEach((label, index) => {
        label.classList.toggle('active', index === activeIndex);
    });
}

// Changes the size without an active scenario; the current selection is removed
function changeGridSize(newSize) {
    clearAllSquares();
    setGridSize(newSize);
    updateGridSizeDisplay();
    updateSquareCountDisplay();
}

function openChangeGridSizePopup(newSize) {
    const { box, close } = openPopup();

    box.appendChild(createElement('div', 'popup-text',
        `Changing the square size to ${sizeText(newSize)} removes your current selection ` +
        `(${squaresText(getSquareCount())}).`));

    const changeButton = createButton('Change size', 'btn-dark', () => {
        changeGridSize(newSize);
        close();
    });
    const cancelButton = createButton('Cancel', 'btn-dark', close);

    box.appendChild(createButtonRow(changeButton, cancelButton));
    cancelButton.focus();
}

// ---------------------------------------------------------
// Hint when squares are selected without an active scenario.
// Called by main.js after a square was toggled; shown once per page load.
// ---------------------------------------------------------

export function showNoScenarioHintOnce() {
    if (noScenarioHintShown || getActiveScenarioName()) return;
    noScenarioHintShown = true;

    openMessagePopup(
        'No active scenario. Your selection will not be saved.\n\n' +
        'To save it, click "Start new scenario" – your current selection will be ' +
        'taken over. Or use "Download scenario" to save it as a file.'
    );
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
        <strong>Swiss Grid App</strong> – Color squares on the map of Switzerland.
        <ul>
            <li>Click a square to color it; click again to remove it.</li>
            <li>Squares are 4, 5, 10 or 20 km in size. The size is chosen when starting a
                scenario and stays fixed for it. Without an active scenario, use the slider.</li>
            <li>Choose a color from the color scheme before clicking.</li>
            <li>Start a new scenario to save your squares under a name. Changes are saved automatically.</li>
            <li>Load, rename (✎) or delete scenarios at any time.</li>
            <li>Your scenarios are stored only in this browser on this device.
                Use "Download scenario" to keep a copy as a file, and
                "Load existing scenario" → "Upload from file" to load it again.</li>
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
// Without an active scenario, the current selection is taken over into the new scenario.
// With an active scenario, the new scenario starts empty.
// ---------------------------------------------------------

function openNewScenarioPopup() {
    const takeOverSelection = !getActiveScenarioName() && getSquareCount() > 0;
    const { box, close } = openPopup();

    box.appendChild(createElement('label', 'popup-label', 'Name of the new scenario:'));

    const input = createTextInput();
    box.appendChild(input);

    // Square size, fixed for the lifetime of the scenario
    box.appendChild(createElement('label', 'popup-label', 'Square size:'));
    const sizeSelect = createElement('select', 'popup-select popup-select-spaced');
    GRID_SIZES.forEach((size) => {
        const option = createElement('option', null, sizeText(size));
        option.value = size;
        sizeSelect.appendChild(option);
    });
    sizeSelect.value = getGridSize();
    box.appendChild(sizeSelect);

    if (takeOverSelection) {
        // The selection was made with the current size, so the size cannot be changed here
        sizeSelect.disabled = true;
        box.appendChild(createElement('div', 'popup-text popup-small',
            `Your current selection (${squaresText(getSquareCount())}) will be saved in the new scenario. ` +
            'The square size cannot be changed later.'));
    } else {
        box.appendChild(createElement('div', 'popup-text popup-small',
            'The square size cannot be changed later.'));
    }

    const errorMsg = createErrorMessage();
    box.appendChild(errorMsg);

    const saveButton = createButton('Save', 'btn-dark', () => {
        const name = input.value.trim();

        if (name === '') {
            errorMsg.innerText = 'Please enter a name.';
            return;
        }

        const squares = takeOverSelection ? getSquaresAsArray() : [];
        const gridSize = Number(sizeSelect.value);
        const result = saveScenario(name, squares, gridSize);

        if (!result.success) {
            errorMsg.innerText = result.error;
            return;
        }

        if (takeOverSelection) {
            // Squares stay on the map, only the menu changes
            updateActiveScenarioDisplay();
            updateSquareCountDisplay();
        } else {
            // New scenario starts empty
            showSquares([], gridSize);
        }
        close();
    });

    const cancelButton = createButton('Cancel', 'btn-dark', close);

    box.appendChild(createButtonRow(saveButton, cancelButton));
    submitOnEnter(input, saveButton);
    input.focus();
}

// ---------------------------------------------------------
// Pop-up: rename the active scenario (pencil button)
// ---------------------------------------------------------

function openRenameScenarioPopup() {
    const activeName = getActiveScenarioName();
    if (!activeName) return;

    const { box, close } = openPopup();

    box.appendChild(createElement('label', 'popup-label', 'New name for the scenario:'));

    const input = createTextInput(activeName);
    box.appendChild(input);

    const errorMsg = createErrorMessage();
    box.appendChild(errorMsg);

    const saveButton = createButton('Save', 'btn-dark', () => {
        const result = renameScenario(activeName, input.value);

        if (!result.success) {
            errorMsg.innerText = result.error;
            return;
        }

        updateActiveScenarioDisplay();
        close();
    });

    const cancelButton = createButton('Cancel', 'btn-dark', close);

    box.appendChild(createButtonRow(saveButton, cancelButton));
    submitOnEnter(input, saveButton);
    input.focus();
    input.select();
}

// ---------------------------------------------------------
// Pop-up: download the active scenario (or the unsaved selection) as a file
// ---------------------------------------------------------

function openDownloadPopup() {
    const activeName = getActiveScenarioName();
    const count = getSquareCount();

    if (!activeName && count === 0) {
        openMessagePopup('There is nothing to download. Select squares or load a scenario first.');
        return;
    }

    const { box, close } = openPopup();

    const intro = activeName
        ? `The scenario "${activeName}" (${squaresText(count)}) will be saved as a file in your download folder:`
        : `No scenario is active. The current selection (${squaresText(count)}) will be saved as a file in your download folder:`;
    box.appendChild(createElement('div', 'popup-label', intro));
    box.appendChild(createElement('div', 'popup-filename', getDownloadFileName(activeName)));
    box.appendChild(createElement('div', 'popup-text popup-small',
        'You can load the file again later via "Load existing scenario" → "Upload from file".'));

    const downloadButton = createButton('Download', 'btn-dark', () => {
        downloadScenario(activeName, getSquaresAsArray(), getGridSize());
        close();
    });
    const cancelButton = createButton('Cancel', 'btn-dark', close);

    box.appendChild(createButtonRow(downloadButton, cancelButton));
    downloadButton.focus();
}

// ---------------------------------------------------------
// Pop-up: load a scenario from this browser (dropdown) or from a file (upload)
// ---------------------------------------------------------

function openLoadScenarioPopup() {
    const scenarioNames = listScenarios().sort((a, b) => a.localeCompare(b));
    const { box, close } = openPopup();

    // Part 1: scenarios saved in this browser
    box.appendChild(createElement('label', 'popup-label', 'Scenarios saved in this browser:'));

    const errorMsg = createErrorMessage();

    if (scenarioNames.length === 0) {
        box.appendChild(createElement('div', 'popup-text popup-small', 'There are no saved scenarios yet.'));
    } else {
        const select = createElement('select', 'popup-select');
        scenarioNames.forEach((name) => {
            const option = createElement('option', null, name);
            option.value = name;
            select.appendChild(option);
        });

        // Pre-select the active scenario, if any
        const activeName = getActiveScenarioName();
        if (activeName && scenarioNames.includes(activeName)) {
            select.value = activeName;
        }

        box.appendChild(select);

        const loadButton = createButton('Load selected scenario', 'btn-dark', () => {
            const result = loadScenario(select.value);

            if (!result.success) {
                errorMsg.innerText = result.error;
                return;
            }

            showSquares(result.squares, result.gridSize);
            close();
        });
        box.appendChild(loadButton);
        select.focus();
    }

    // Part 2: upload from a file
    box.appendChild(createElement('div', 'popup-separator'));
    box.appendChild(createElement('label', 'popup-label', 'Or load a downloaded scenario file (.json):'));

    const fileInput = createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json,application/json';
    fileInput.hidden = true;
    box.appendChild(fileInput);

    const uploadButton = createButton('Upload from file', 'btn-dark', () => {
        errorMsg.innerText = '';
        fileInput.click();
    });
    box.appendChild(uploadButton);

    fileInput.onchange = async () => {
        const file = fileInput.files[0];
        fileInput.value = ''; // allows choosing the same file again
        if (!file) return;

        let text;
        try {
            text = await file.text();
        } catch (e) {
            errorMsg.innerText = 'The file could not be read.';
            return;
        }

        const parsed = parseScenarioFile(text, file.name);
        if (!parsed.success) {
            errorMsg.innerText = parsed.error;
            return;
        }

        if (scenarioExists(parsed.name)) {
            // Name conflict: ask for a different name in the same pop-up
            showUploadNameConflict(box, close, parsed);
            return;
        }

        saveUploadedScenario(parsed.name, parsed.squares, parsed.gridSize, errorMsg, close);
    };

    box.appendChild(errorMsg);
    box.appendChild(createButton('Cancel', 'btn-dark', close));
}

// Saves an uploaded scenario in the browser, makes it active and shows it
function saveUploadedScenario(name, squares, gridSize, errorMsg, close) {
    const result = saveScenario(name, squares, gridSize);

    if (!result.success) {
        errorMsg.innerText = result.error;
        return;
    }

    showSquares(squares, gridSize);
    close();
}

// Suggests a free name: "Name (2)", "Name (3)", ...
function suggestFreeName(baseName) {
    let number = 2;
    while (scenarioExists(`${baseName} (${number})`)) {
        number++;
    }
    return `${baseName} (${number})`;
}

// Replaces the content of the load pop-up with the name conflict form
function showUploadNameConflict(box, close, parsed) {
    box.replaceChildren();

    box.appendChild(createElement('div', 'popup-text',
        `A scenario named "${parsed.name}" already exists in this browser. ` +
        'Two scenarios cannot have the same name.'));
    box.appendChild(createElement('label', 'popup-label', 'Name for the uploaded scenario:'));

    const input = createTextInput(suggestFreeName(parsed.name));
    box.appendChild(input);

    const errorMsg = createErrorMessage();
    box.appendChild(errorMsg);

    const saveButton = createButton('Save', 'btn-dark', () => {
        if (input.value.trim() === '') {
            errorMsg.innerText = 'Please enter a name.';
            return;
        }
        saveUploadedScenario(input.value.trim(), parsed.squares, parsed.gridSize, errorMsg, close);
    });
    const cancelButton = createButton('Cancel', 'btn-dark', close);

    box.appendChild(createButtonRow(saveButton, cancelButton));
    submitOnEnter(input, saveButton);
    input.focus();
    input.select();
}

// ---------------------------------------------------------
// Pop-up: delete active scenario
// ---------------------------------------------------------

function openDeleteScenarioPopup() {
    const activeName = getActiveScenarioName();

    // No active scenario: say so right away instead of asking for confirmation
    if (!activeName) {
        openMessagePopup('No scenario is active.');
        return;
    }

    const { box, close } = openPopup();

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
