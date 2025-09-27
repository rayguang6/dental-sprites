import { MapRenderer } from './mapRenderer.js';
import { MapManager } from './mapManager.js';
import { DebugRenderer } from './debug.js';

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        this.mapManager = new MapManager();
        this.mapRenderer = new MapRenderer(this.ctx);
        this.debugRenderer = new DebugRenderer(this.ctx);
        
        this.showGrid = true;
        
        this.loadCurrentMap();
        console.log('Game initialized');
    }
    
    loadCurrentMap() {
        const currentMap = this.mapManager.getCurrentMap();
        this.mapRenderer.loadMap(currentMap, () => {
            this.render();
        });
        this.render();
    }
    
    switchMap(mapKey) {
        if (this.mapManager.setMap(mapKey)) {
            this.loadCurrentMap();
            return true;
        }
        return false;
    }
    
    render() {
        this.mapRenderer.clear();
        this.mapRenderer.render();
        
        if (this.showGrid) {
            const currentMap = this.mapRenderer.getCurrentMap();
            this.debugRenderer.drawGrid(currentMap);
        }
    }
    
    toggleGrid() {
        this.showGrid = !this.showGrid;
        console.log('Grid:', this.showGrid ? 'ON' : 'OFF');
        this.render();
    }
    
    forceRender() {
        this.render();
    }
    
    getCurrentMapInfo() {
        return this.mapManager.getMapInfo();
    }
    
    getAvailableMaps() {
        return this.mapManager.getAvailableMaps();
    }
}