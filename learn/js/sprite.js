import { SPRITE_CONFIG, SPRITES } from './config.js';

export class Sprite {
    constructor(spriteKey) {
        this.spriteKey = spriteKey;
        this.spriteConfig = SPRITES[spriteKey];
        this.image = null;
        this.isLoaded = false;
        
        this.animations = {
            walkDown: { frames: [0, 1, 2], speed: 8 },
            walkLeft: { frames: [3, 4, 5], speed: 8 },
            walkUp: { frames: [6, 7, 8], speed: 8 },
            walkRight: { frames: [9, 10, 11], speed: 8 },
            celebrate: { frames: [12, 13, 14, 15], speed: 12 },
            idle: { frames: [0], speed: 0 }
        };
        
        this.currentAnimation = 'idle';
        this.frameIndex = 0;
        this.frameTimer = 0;
        this.currentFrame = 0;
        
        this.loadSprite();
    }
    
    loadSprite() {
        if (!this.spriteConfig) {
            console.error(`Sprite "${this.spriteKey}" not found in config`);
            return;
        }
        
        this.image = new Image();
        this.image.onload = () => {
            console.log(`Sprite loaded: ${this.spriteKey}`);
            this.isLoaded = true;
        };
        this.image.onerror = () => {
            console.error(`Failed to load sprite: ${this.spriteKey}`);
            this.isLoaded = false;
        };
        this.image.src = this.spriteConfig.imagePath;
    }
    
    playAnimation(animationName) {
        if (this.currentAnimation !== animationName && this.animations[animationName]) {
            this.currentAnimation = animationName;
            this.frameIndex = 0;
            this.frameTimer = 0;
            this.updateCurrentFrame();
        }
    }
    
    update() {
        const animation = this.animations[this.currentAnimation];
        if (!animation || animation.speed === 0) return;
        
        this.frameTimer++;
        if (this.frameTimer >= animation.speed) {
            this.frameTimer = 0;
            this.frameIndex++;
            
            if (this.frameIndex >= animation.frames.length) {
                this.frameIndex = 0;
            }
            
            this.updateCurrentFrame();
        }
    }
    
    updateCurrentFrame() {
        const animation = this.animations[this.currentAnimation];
        this.currentFrame = animation.frames[this.frameIndex];
    }
    
    render(ctx, x, y, size) {
        if (!this.isLoaded || !this.image) {
            this.renderFallback(ctx, x, y, size);
            return;
        }
        
        const sourceX = this.currentFrame * SPRITE_CONFIG.FRAME_WIDTH;
        const sourceY = 0;
        
        ctx.drawImage(
            this.image,
            sourceX, sourceY, SPRITE_CONFIG.FRAME_WIDTH, SPRITE_CONFIG.FRAME_HEIGHT,
            x, y, size, size
        );
    }
    
    renderFallback(ctx, x, y, size) {
        ctx.fillStyle = '#FF6B6B';
        ctx.fillRect(x + 2, y + 2, size - 4, size - 4);
        
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 2, y + 2, size - 4, size - 4);
        
        ctx.fillStyle = 'white';
        ctx.font = `${Math.max(8, size / 4)}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText('?', x + size / 2, y + size / 2 + 2);
    }
    
    setDirection(direction) {
        const directionAnimations = {
            'up': 'walkUp',
            'down': 'walkDown',
            'left': 'walkLeft',
            'right': 'walkRight'
        };
        
        const animationName = directionAnimations[direction];
        if (animationName) {
            this.playAnimation(animationName);
        }
    }
    
    setIdle() {
        this.playAnimation('idle');
    }
    
    setCelebrate() {
        this.playAnimation('celebrate');
    }
    
    isReady() {
        return this.isLoaded;
    }
}