import { MapRenderer } from './mapRenderer.js';
import { MapManager } from './mapManager.js';
import { DebugRenderer } from './debug.js';
import { Character } from './character.js';
import { INSTRUCTION_EXAMPLES } from './config.js';

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        this.mapManager = new MapManager();
        this.mapRenderer = new MapRenderer(this.ctx);
        this.debugRenderer = new DebugRenderer(this.ctx);
        
        this.showGrid = true;
        this.characters = [];
        
        this.loadCurrentMap();
        console.log('Game initialized');
    }
    
    createCharactersForCurrentMap() {
        this.clearCharacters();
        
        const currentMap = this.mapManager.getCurrentMap();
        const mapConfig = this.mapManager.getCurrentMap();
        
        // Get NPCs defined for this map
        const npcs = mapConfig.npcs || [];
        
        npcs.forEach(npcConfig => {
            const character = new Character(
                npcConfig.spriteKey,
                npcConfig.x,
                npcConfig.y,
                INSTRUCTION_EXAMPLES[npcConfig.behavior] || []
            );
            this.characters.push(character);
            console.log(`Created NPC: ${npcConfig.behavior} at (${npcConfig.x}, ${npcConfig.y})`);
        });
    }
    
    clearCharacters() {
        this.characters = [];
    }
    
    loadCurrentMap() {
        const currentMap = this.mapManager.getCurrentMap();
        this.mapRenderer.loadMap(currentMap, () => {
            this.render();
        });
        this.createCharactersForCurrentMap();
        this.render();
    }
    
    switchMap(mapKey) {
        if (this.mapManager.setMap(mapKey)) {
            this.loadCurrentMap();
            return true;
        }
        return false;
    }
    
    update() {
        const currentTime = performance.now();
        const currentMap = this.mapRenderer.getCurrentMap();
        
        if (currentMap) {
            this.characters.forEach(character => {
                character.update(currentTime, currentMap);
            });
        }
    }
    
    render() {
        this.update();
        
        this.mapRenderer.clear();
        this.mapRenderer.render();
        
        const currentMap = this.mapRenderer.getCurrentMap();
        if (currentMap) {
            this.characters.forEach(character => {
                character.render(this.ctx, currentMap);
            });
        }
        
        if (this.showGrid) {
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