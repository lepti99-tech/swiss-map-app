// ui.js

// Funktion zum Erstellen des Menüs
function createMenu() {
    const menu = document.createElement('div');
    menu.style.position = 'absolute';
    menu.style.top = '0';
    menu.style.left = '0';
    menu.style.width = '5cm'; // etwa 5x7cm
    menu.style.height = '7cm';
    menu.style.backgroundColor = '#d3d3d3'; // hellgrau
    menu.style.padding = '10px';
    menu.style.boxShadow = '2px 2px 5px rgba(0, 0, 0, 0.5)';

    const title = document.createElement('h1');
    title.innerText = 'Swiss Grid App';
    menu.appendChild(title);

    // Button für neues Szenario
    const newScenarioButton = document.createElement('button');
    newScenarioButton.innerText = 'Start new scenario';
    newScenarioButton.style.backgroundColor = '#4a4a4a'; // dunkelgrau
    newScenarioButton.style.color = 'white';
    newScenarioButton.onclick = () => openNewScenarioPopup();
    menu.appendChild(newScenarioButton);

    // Button für bestehendes Szenario
    const loadScenarioButton = document.createElement('button');
    loadScenarioButton.innerText = 'Load existing scenario';
    loadScenarioButton.style.backgroundColor = '#4a4a4a';
    loadScenarioButton.style.color = 'white';
    loadScenarioButton.onclick = () => openLoadScenarioPopup();
    menu.appendChild(loadScenarioButton);

    // Farbpalette
    const colorPalette = document.createElement('div');
    colorPalette.innerText = 'Color scheme:';
    const colors = ['red', 'green', 'blue'];
    colors.forEach(color => {
        const colorCircle = document.createElement('div');
        colorCircle.style.width = '20px';
        colorCircle.style.height = '20px';
        colorCircle.style.backgroundColor = color;
        colorCircle.style.borderRadius = '50%';
        colorCircle.style.display = 'inline-block';
        colorCircle.style.margin = '5px';
        colorCircle.onclick = () => selectColor(color);
        colorPalette.appendChild(colorCircle);
    });
    menu.appendChild(colorPalette);

    document.body.appendChild(menu);
}

// Funktion zum Öffnen des Pop-ups für neues Szenario
function openNewScenarioPopup() {
    // Popup-Logik hier
}

// Funktion zum Öffnen des Pop-ups für bestehendes Szenario
function openLoadScenarioPopup() {
    // Popup-Logik hier
}

// Funktion zur Farbauswahl
function selectColor(color) {
    // Logik zur Farbauswahl hier
}

// Menü erstellen, wenn die Seite geladen wird
window.onload = createMenu;