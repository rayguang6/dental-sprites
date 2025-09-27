import { GAME_CONFIG, getMapRenderSize } from './config.js';

export class MapRenderer {
    constructor(ctx) {
        this.ctx = ctx;
        this.currentMap = null;
        this.mapImage = null;
        this.isLoaded = false;
        this.onMapLoadedCallback = null;
    }
    
    loadMap(mapConfig, onLoaded = null) {
        this.currentMap = mapConfig;
        this.onMapLoadedCallback = onLoaded;
        this.isLoaded = false;
        
        this.mapImage = new Image();
        this.mapImage.onload = () => {
            console.log(`Map loaded: ${mapConfig.name}`);
            this.isLoaded = true;
            if (this.onMapLoadedCallback) {
                this.onMapLoadedCallback();
            }
        };
        this.mapImage.onerror = () => {
            console.log(`Map failed to load: ${mapConfig.name} - using fallback`);
            this.isLoaded = false;
            if (this.onMapLoadedCallback) {
                this.onMapLoadedCallback();
            }
        };
        this.mapImage.src = mapConfig.imagePath;
    }
    
    clear() {
        this.ctx.clearRect(0, 0, GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.CANVAS_HEIGHT);
    }
    
    render() {
        if (!this.currentMap) return;
        
        const renderSize = getMapRenderSize(this.currentMap);
        
        if (this.mapImage && this.mapImage.complete && this.mapImage.naturalWidth > 0) {
            this.ctx.drawImage(
                this.mapImage, 
                renderSize.offsetX, 
                renderSize.offsetY, 
                renderSize.width, 
                renderSize.height
            );
        } else {
            this.renderFallback(renderSize);
        }
    }
    
    renderFallback(renderSize) {
        this.ctx.fillStyle = '#f0f0f0';
        this.ctx.fillRect(0, 0, GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.CANVAS_HEIGHT);
        
        this.ctx.fillStyle = '#E8F4FD';
        this.ctx.fillRect(renderSize.offsetX, renderSize.offsetY, renderSize.width, renderSize.height);
        
        this.ctx.fillStyle = '#D0E7F5';
        for (let x = 0; x < this.currentMap.gridWidth; x++) {
            for (let y = 0; y < this.currentMap.gridHeight; y++) {
                if ((x + y) % 2 === 0) {
                    this.ctx.fillRect(
                        renderSize.offsetX + x * renderSize.tileSize, 
                        renderSize.offsetY + y * renderSize.tileSize, 
                        renderSize.tileSize, 
                        renderSize.tileSize
                    );
                }
            }
        }
        
        this.ctx.fillStyle = '#666';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'center';
        
        if (!this.isLoaded) {
            this.ctx.fillText(`Loading ${this.currentMap.name}...`, GAME_CONFIG.CANVAS_WIDTH / 2, GAME_CONFIG.CANVAS_HEIGHT / 2 - 10);
            this.ctx.fillText('(fallback)', GAME_CONFIG.CANVAS_WIDTH / 2, GAME_CONFIG.CANVAS_HEIGHT / 2 + 10);
        } else {
            this.ctx.fillText(`${this.currentMap.name}`, GAME_CONFIG.CANVAS_WIDTH / 2, GAME_CONFIG.CANVAS_HEIGHT / 2 - 10);
            this.ctx.fillText(`${this.currentMap.gridWidth}x${this.currentMap.gridHeight} tiles`, GAME_CONFIG.CANVAS_WIDTH / 2, GAME_CONFIG.CANVAS_HEIGHT / 2 + 10);
            this.ctx.fillText(`${renderSize.tileSize.toFixed(0)}px per tile`, GAME_CONFIG.CANVAS_WIDTH / 2, GAME_CONFIG.CANVAS_HEIGHT / 2 + 30);
        }
    }
    
    getCurrentMap() {
        return this.currentMap;
    }
    
    isMapLoaded() {
        return this.isLoaded;
    }
}