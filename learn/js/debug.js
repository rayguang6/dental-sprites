import { getMapRenderSize } from './config.js';

export class DebugRenderer {
    constructor(ctx) {
        this.ctx = ctx;
    }
    
    drawGrid(currentMap) {
        if (!currentMap) return;
        
        const renderSize = getMapRenderSize(currentMap);
        
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.lineWidth = 1;
        
        for (let x = 0; x <= currentMap.gridWidth; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(
                renderSize.offsetX + x * renderSize.tileSize, 
                renderSize.offsetY
            );
            this.ctx.lineTo(
                renderSize.offsetX + x * renderSize.tileSize, 
                renderSize.offsetY + renderSize.height
            );
            this.ctx.stroke();
        }
        
        for (let y = 0; y <= currentMap.gridHeight; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(
                renderSize.offsetX, 
                renderSize.offsetY + y * renderSize.tileSize
            );
            this.ctx.lineTo(
                renderSize.offsetX + renderSize.width, 
                renderSize.offsetY + y * renderSize.tileSize
            );
            this.ctx.stroke();
        }
        
        this.drawGridCoordinates(currentMap, renderSize);
    }
    
    drawGridCoordinates(currentMap, renderSize) {
        if (renderSize.tileSize < 25) return;
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.font = '10px Arial';
        this.ctx.textAlign = 'left';
        
        for (let x = 0; x < currentMap.gridWidth; x++) {
            for (let y = 0; y < currentMap.gridHeight; y++) {
                this.ctx.fillText(
                    `${x},${y}`, 
                    renderSize.offsetX + x * renderSize.tileSize + 2, 
                    renderSize.offsetY + y * renderSize.tileSize + 12
                );
            }
        }
    }
}