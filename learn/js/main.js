import { Game } from './game.js';

let game = null;

function init() {
    console.log('Initializing 2D Sprite System - Step 1...');
    
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error('Canvas element not found!');
        return;
    }
    
    game = new Game(canvas);
    setupUI();
    window.game = game;
    
    console.log('Initialization complete!');
    console.log('Available maps:', game.getAvailableMaps());
    console.log('Current map:', game.getCurrentMapInfo());
}

function setupUI() {
    const gridToggle = document.getElementById('gridToggle');
    if (gridToggle) {
        gridToggle.addEventListener('click', () => {
            game.toggleGrid();
        });
    }
    
    const mapSelect = document.getElementById('mapSelect');
    if (mapSelect) {
        mapSelect.addEventListener('change', (event) => {
            const selectedMap = event.target.value;
            console.log(`Switching to map: ${selectedMap}`);
            game.switchMap(selectedMap);
        });
    }
}

document.addEventListener('DOMContentLoaded', init);