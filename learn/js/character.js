import { Sprite } from './sprite.js';
import { getMapRenderSize, easeInOutQuad } from './config.js';

class PositionHelper {
    constructor(gridX, gridY) {
        this.gridX = gridX;
        this.gridY = gridY;
        this.visualX = gridX;
        this.visualY = gridY;
        this.isMoving = false;
        this.moveStart = { x: gridX, y: gridY, time: 0 };
        this.moveTarget = { x: gridX, y: gridY };
        this.moveDuration = 500;
    }
    
    startMove(targetX, targetY) {
        this.moveStart.x = this.visualX;
        this.moveStart.y = this.visualY;
        this.moveStart.time = performance.now();
        this.moveTarget.x = targetX;
        this.moveTarget.y = targetY;
        this.isMoving = true;
    }
    
    updateMovement() {
        if (!this.isMoving) return false;
        
        const elapsed = performance.now() - this.moveStart.time;
        const progress = Math.min(elapsed / this.moveDuration, 1.0);
        const eased = easeInOutQuad(progress);
        
        this.visualX = this.moveStart.x + (this.moveTarget.x - this.moveStart.x) * eased;
        this.visualY = this.moveStart.y + (this.moveTarget.y - this.moveStart.y) * eased;
        
        if (progress >= 1.0) {
            this.isMoving = false;
            this.visualX = this.moveTarget.x;
            this.visualY = this.moveTarget.y;
            this.gridX = this.moveTarget.x;
            this.gridY = this.moveTarget.y;
            return true; // Movement completed
        }
        
        return false;
    }
}

export class Character {
    constructor(spriteKey, gridX, gridY, instructions = []) {
        this.sprite = new Sprite(spriteKey);
        this.position = new PositionHelper(gridX, gridY);
        this.id = Date.now() + Math.random();
        
        // Instructions-based behavior
        this.instructions = [...instructions];
        this.currentInstruction = 0;
        this.stepCount = 0;
        this.isWaiting = false;
        this.waitUntil = 0;
        
        this.sprite.setIdle();
    }
    
    update(currentTime, currentMap) {
        this.sprite.update();
        
        const movementFinished = this.position.updateMovement();
        if (movementFinished) {
            this.sprite.setIdle();
        }
        
        this.processInstructions(currentTime, currentMap);
    }
    
    processInstructions(currentTime, currentMap) {
        if (this.position.isMoving || this.isWaiting) {
            if (this.isWaiting && currentTime >= this.waitUntil) {
                this.isWaiting = false;
            }
            return;
        }
        
        if (this.instructions.length === 0) return;
        
        if (this.currentInstruction >= this.instructions.length) {
            this.currentInstruction = 0;
            this.stepCount = 0;
        }
        
        const instruction = this.instructions[this.currentInstruction];
        this.executeInstruction(instruction, currentTime, currentMap);
    }
    
    executeInstruction(instruction, currentTime, currentMap) {
        switch(instruction.type) {
            case 'move':
                if (this.stepCount < instruction.steps) {
                    this.moveInDirection(instruction.direction, currentMap);
                    this.stepCount++;
                } else {
                    this.nextInstruction();
                }
                break;
                
            case 'wait':
                this.isWaiting = true;
                this.waitUntil = currentTime + instruction.duration;
                this.sprite.setCelebrate();
                this.nextInstruction();
                break;
                
            case 'look':
                this.sprite.setDirection(instruction.direction);
                this.nextInstruction();
                break;
                
            case 'idle':
                this.sprite.setIdle();
                this.nextInstruction();
                break;
        }
    }
    
    nextInstruction() {
        this.currentInstruction++;
        this.stepCount = 0;
    }
    
    moveInDirection(direction, currentMap) {
        if (!currentMap) return;
        
        let newX = this.position.gridX;
        let newY = this.position.gridY;
        
        switch(direction) {
            case 'up': newY = Math.max(0, newY - 1); break;
            case 'down': newY = Math.min(currentMap.gridHeight - 1, newY + 1); break;
            case 'left': newX = Math.max(0, newX - 1); break;
            case 'right': newX = Math.min(currentMap.gridWidth - 1, newX + 1); break;
        }
        
        if (newX !== this.position.gridX || newY !== this.position.gridY) {
            this.position.startMove(newX, newY);
            this.sprite.setDirection(direction);
        }
    }
    
    render(ctx, currentMap) {
        if (!currentMap) return;
        
        const renderSize = getMapRenderSize(currentMap);
        const pixelX = renderSize.offsetX + this.position.visualX * renderSize.tileSize;
        const pixelY = renderSize.offsetY + this.position.visualY * renderSize.tileSize;
        
        this.sprite.render(ctx, pixelX, pixelY, renderSize.tileSize);
    }
    
    setPosition(gridX, gridY) {
        this.position.gridX = gridX;
        this.position.gridY = gridY;
        this.position.visualX = gridX;
        this.position.visualY = gridY;
        this.currentInstruction = 0;
        this.stepCount = 0;
    }
}