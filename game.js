// Dental Simulation - Smooth Movement Version
class DentalSimulation {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Tile system settings
        this.tileSize = 32;
        this.gridWidth = 10;
        this.gridHeight = 10;
        
        // Character starting position
        this.characterStartX = 7;
        this.characterStartY = 6;
        
        // Map image
        this.mapImage = null;
        
        // Character position (now with smooth interpolation)
        this.character = this.createCharacter();
        
        // Sprite images
        this.spriteImage = null;
        this.patientSprites = {}; // Store all patient sprites
        this.patients = []; // Array of spawned patients
        
        // Movement sequence
        this.movementSequence = [
            { direction: 'up', steps: 2 },
            { direction: 'left', steps: 2 },
            { direction: 'down', steps: 2 },
            { direction: 'right', steps: 2 },
            { action: 'celebrate' }
        ];
        this.currentStep = 0;
        this.stepsInCurrentDirection = 0;
        this.lastMoveTime = 0;
        this.moveDelay = 100; // Minimal delay between moves for smooth continuous movement
        this.moveDuration = 500; // Time for each move animation
        this.celebrationDuration = 2000; // Celebrate for 2 seconds
        this.celebrationStartTime = 0;
        
        // Patient spawning
        this.spawnTimer = 0;
        this.spawnInterval = 3000; // Spawn a patient every 3 seconds
        
        this.loadMap();
        this.startGameLoop();
    }
    
    startGameLoop() {
        const gameLoop = () => {
            this.render();
            requestAnimationFrame(gameLoop);
        };
        gameLoop();
    }
    
    loadMap() {
        // Load the dental map image
        this.mapImage = new Image();
        this.mapImage.onload = () => {
            console.log('Dental map loaded successfully');
            this.loadSprite();
        };
        this.mapImage.onerror = () => {
            console.error('Failed to load dental map image');
            this.loadSprite();
        };
        this.mapImage.src = 'images/Dental Map.png';
    }
    
    loadSprite() {
        // Load the patient sprite
        this.spriteImage = new Image();
        this.spriteImage.onload = () => {
            console.log('Patient sprite loaded successfully');
            this.render();
        };
        this.spriteImage.onerror = () => {
            console.error('Failed to load patient sprite');
            this.render();
        };
        this.spriteImage.src = 'images/avatar/patient1.png';
        
        // Load all patient sprites
        this.loadAllPatientSprites();
    }
    
    loadAllPatientSprites() {
        // Load patient1-5 sprites
        for (let i = 1; i <= 5; i++) {
            const sprite = new Image();
            sprite.onload = () => {
                console.log(`Patient${i} sprite loaded successfully`);
            };
            sprite.onerror = () => {
                console.error(`Failed to load patient${i} sprite`);
            };
            sprite.src = `images/avatar/patient${i}.png`;
            this.patientSprites[`patient${i}`] = sprite;
        }
    }
    
    createCharacter() {
        return {
            // Grid position (target)
            gridX: this.characterStartX,
            gridY: this.characterStartY,
            // Pixel position (current visual position)
            pixelX: this.characterStartX * this.tileSize,
            pixelY: this.characterStartY * this.tileSize,
            // Animation state
            isMoving: false,
            moveStartTime: 0,
            moveFromX: this.characterStartX * this.tileSize,
            moveFromY: this.characterStartY * this.tileSize,
            moveToX: this.characterStartX * this.tileSize,
            moveToY: this.characterStartY * this.tileSize,
            // Animation properties
            direction: 'down',
            currentFrame: 0,
            frameCount: 0,
            animationState: 'idle' // 'idle', 'walking', 'celebrate'
        };
    }
    
    // Easing function for smooth animation
    easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }
    
    render() {
        // Update movement and animation
        this.updateMovement();
        this.updateAnimation();
        this.updateSpawning();
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw the dental map if loaded
        if (this.mapImage && this.mapImage.complete) {
            // Scale the map to fit our 320x320 canvas (10x10 tiles of 32x32)
            this.ctx.drawImage(this.mapImage, 0, 0, 320, 320);
        } else {
            // Draw placeholder if map not loaded
            this.ctx.fillStyle = '#E8F4FD';
            this.ctx.fillRect(0, 0, 320, 320);
            
            this.ctx.fillStyle = '#333';
            this.ctx.font = '16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Loading Dental Map...', 160, 160);
        }
        
        // Draw character
        this.drawCharacter();
        
        // Draw all patients
        this.drawPatients();
        
        // Draw grid overlay to show tile boundaries
        this.drawGrid();
    }
    
    drawGrid() {
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.lineWidth = 1;
        
        // Draw vertical lines
        for (let x = 0; x <= this.gridWidth; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.tileSize, 0);
            this.ctx.lineTo(x * this.tileSize, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Draw horizontal lines
        for (let y = 0; y <= this.gridHeight; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * this.tileSize);
            this.ctx.lineTo(this.canvas.width, y * this.tileSize);
            this.ctx.stroke();
        }
    }
    
    drawCharacter() {
        // Use the smooth pixel position instead of grid position
        const pixelX = Math.round(this.character.pixelX);
        const pixelY = Math.round(this.character.pixelY);
        
        if (this.spriteImage && this.spriteImage.complete) {
            // Get frame based on animation state
            let frameX = 0;
            if (this.character.animationState === 'celebrate') {
                // Celebrate animation: frames 13-16 (0-indexed as 12-15)
                const celebrateFrames = [12, 13, 14, 15];
                frameX = celebrateFrames[this.character.currentFrame] * 32;
            } else if (this.character.isMoving || this.character.animationState === 'walking') {
                // Walking animation: cycle through 3 frames for each direction
                const walkFrames = {
                    'up': [6, 7, 8],
                    'down': [0, 1, 2], 
                    'left': [3, 4, 5],
                    'right': [9, 10, 11]
                };
                frameX = walkFrames[this.character.direction][this.character.currentFrame] * 32;
            } else {
                // Idle animation: first frame of direction
                const idleFrames = {
                    'up': 6,
                    'down': 0,
                    'left': 3, 
                    'right': 9
                };
                frameX = idleFrames[this.character.direction] * 32;
            }
            
            this.ctx.drawImage(
                this.spriteImage,
                frameX, 0, 32, 32,  // Source: current frame
                pixelX, pixelY, 32, 32  // Destination: smooth position on canvas
            );
        } else {
            // Draw fallback rectangle if sprite not loaded
            this.ctx.fillStyle = '#FF6B6B';
            this.ctx.fillRect(pixelX + 4, pixelY + 4, 24, 24);
            
            this.ctx.strokeStyle = '#333';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(pixelX + 4, pixelY + 4, 24, 24);
        }
    }
    
    updateMovement() {
        const currentTime = performance.now();
        
        // Update smooth movement animation
        if (this.character.isMoving) {
            const elapsed = currentTime - this.character.moveStartTime;
            const progress = Math.min(elapsed / this.moveDuration, 1.0);
            const easedProgress = this.easeInOutQuad(progress);
            
            // Interpolate between start and end positions
            this.character.pixelX = this.character.moveFromX + 
                (this.character.moveToX - this.character.moveFromX) * easedProgress;
            this.character.pixelY = this.character.moveFromY + 
                (this.character.moveToY - this.character.moveFromY) * easedProgress;
            
            // Check if movement is complete
            if (progress >= 1.0) {
                this.character.isMoving = false;
                this.character.pixelX = this.character.moveToX;
                this.character.pixelY = this.character.moveToY;
                console.log(`Movement complete to grid [${this.character.gridX}, ${this.character.gridY}]`);
            }
        }
        
        // Handle movement sequence logic
        if (!this.character.isMoving && currentTime - this.lastMoveTime >= this.moveDelay) {
            if (this.currentStep >= this.movementSequence.length) {
                // Sequence finished, restart after celebration
                console.log('Movement sequence finished, restarting...');
                this.currentStep = 0;
                this.stepsInCurrentDirection = 0;
                this.resetCharacterPosition();
                this.lastMoveTime = currentTime;
                return;
            }
            
            const currentMove = this.movementSequence[this.currentStep];
            
            if (currentMove.action === 'celebrate') {
                // Start celebrating if not already
                if (this.character.animationState !== 'celebrate') {
                    console.log('🎉 Starting CELEBRATION! 🎉');
                    this.setAnimation('celebrate');
                    this.celebrationStartTime = currentTime;
                } else {
                    // Check if celebration time is over
                    if (currentTime - this.celebrationStartTime >= this.celebrationDuration) {
                        console.log('🎉 Celebration finished! 🎉');
                        this.currentStep++;
                        this.lastMoveTime = currentTime;
                    }
                }
            } else {
                // Movement step
                if (this.stepsInCurrentDirection < currentMove.steps) {
                    // Start moving one step in current direction
                    this.startMoveCharacter(currentMove.direction);
                    this.stepsInCurrentDirection++;
                    console.log(`Starting move ${currentMove.direction} (step ${this.stepsInCurrentDirection}/${currentMove.steps})`);
                } else {
                    // Finished this direction, move to next
                    this.currentStep++;
                    this.stepsInCurrentDirection = 0;
                    console.log(`Finished ${currentMove.direction} direction`);
                }
                this.lastMoveTime = currentTime;
            }
        }
    }
    
    updateAnimation() {
        // Different animation speeds for different states
        let frameSpeed = 10; // Default frame speed (slower = more frames per animation frame)
        
        if (this.character.animationState === 'walking' || this.character.isMoving) {
            frameSpeed = 8; // Faster walking animation
        } else if (this.character.animationState === 'celebrate') {
            frameSpeed = 15; // Slower celebration animation for dramatic effect
        } else {
            // Idle state - no frame animation needed
            this.character.currentFrame = 0;
            return;
        }
        
        // Animate frames
        this.character.frameCount++;
        if (this.character.frameCount >= frameSpeed) {
            this.character.frameCount = 0;
            this.character.currentFrame++;
            
            // Different frame limits for different animations
            let maxFrames = 3; // Default for walking (frames 0, 1, 2)
            if (this.character.animationState === 'celebrate') {
                maxFrames = 4; // Celebrate has 4 frames (0, 1, 2, 3)
            }
            
            if (this.character.currentFrame >= maxFrames) {
                this.character.currentFrame = 0;
            }
        }
    }
    
    setAnimation(animationName) {
        if (animationName === 'celebrate') {
            this.character.animationState = 'celebrate';
            this.character.currentFrame = 0;
            this.character.frameCount = 0;
            console.log('🎉 Starting celebrate animation! 🎉');
        } else if (animationName === 'walking') {
            this.character.animationState = 'walking';
            this.character.currentFrame = 0;
            this.character.frameCount = 0;
        } else if (animationName === 'idle') {
            this.character.animationState = 'idle';
            this.character.currentFrame = 0;
            this.character.frameCount = 0;
        }
    }
    
    updateSpawning() {
        // Update spawn timer
        this.spawnTimer += 16; // Assuming 60fps, so ~16ms per frame
        
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnPatient();
            this.spawnTimer = 0;
        }
    }
    
    spawnPatient() {
        // Randomly select patient sprite (1-5)
        const patientNumber = Math.floor(Math.random() * 5) + 1;
        const spriteKey = `patient${patientNumber}`;
        
        // Create new patient
        const patient = {
            id: Date.now() + Math.random(), // Unique ID
            gridX: 6,
            gridY: 7,
            pixelX: 4 * this.tileSize,
            pixelY: 9 * this.tileSize,
            spriteKey: spriteKey,
            direction: 'down',
            currentFrame: 0,
            frameCount: 0,
            animationState: 'idle',
            isMoving: false,
            moveStartTime: 0,
            moveFromX: 4 * this.tileSize,
            moveFromY: 9 * this.tileSize,
            moveToX: 4 * this.tileSize,
            moveToY: 9 * this.tileSize
        };
        
        this.patients.push(patient);
        console.log(`Spawned ${spriteKey} at (4,9)`);
    }
    
    drawPatients() {
        this.patients.forEach(patient => {
            const pixelX = Math.round(patient.pixelX);
            const pixelY = Math.round(patient.pixelY);
            
            const sprite = this.patientSprites[patient.spriteKey];
            if (sprite && sprite.complete) {
                // Get frame based on animation state
                let frameX = 0;
                if (patient.animationState === 'idle') {
                    // Idle animation: first frame of direction
                    const idleFrames = {
                        'up': 6,
                        'down': 0,
                        'left': 3, 
                        'right': 9
                    };
                    frameX = idleFrames[patient.direction] * 32;
                } else if (patient.animationState === 'walking') {
                    // Walking animation: cycle through 3 frames
                    const walkFrames = {
                        'up': [6, 7, 8],
                        'down': [0, 1, 2], 
                        'left': [3, 4, 5],
                        'right': [9, 10, 11]
                    };
                    frameX = walkFrames[patient.direction][patient.currentFrame] * 32;
                }
                
                this.ctx.drawImage(
                    sprite,
                    frameX, 0, 32, 32,  // Source: current frame
                    pixelX, pixelY, 32, 32  // Destination: position on canvas
                );
            } else {
                // Draw fallback rectangle if sprite not loaded
                this.ctx.fillStyle = '#FF6B6B';
                this.ctx.fillRect(pixelX + 4, pixelY + 4, 24, 24);
                
                this.ctx.strokeStyle = '#333';
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(pixelX + 4, pixelY + 4, 24, 24);
            }
        });
    }
    
    resetCharacterPosition() {
        // Reset character to starting position
        this.character.gridX = this.characterStartX;
        this.character.gridY = this.characterStartY;
        this.character.pixelX = this.characterStartX * this.tileSize;
        this.character.pixelY = this.characterStartY * this.tileSize;
        this.character.isMoving = false;
        this.character.animationState = 'idle';
        this.character.direction = 'down';
        this.character.currentFrame = 0;
    }
    
    startMoveCharacter(direction) {
        // Calculate new grid position
        let newGridX = this.character.gridX;
        let newGridY = this.character.gridY;
        
        switch(direction) {
            case 'up':
                newGridY = Math.max(0, this.character.gridY - 1);
                break;
            case 'down':
                newGridY = Math.min(this.gridHeight - 1, this.character.gridY + 1);
                break;
            case 'left':
                newGridX = Math.max(0, this.character.gridX - 1);
                break;
            case 'right':
                newGridX = Math.min(this.gridWidth - 1, this.character.gridX + 1);
                break;
        }
        
        // Only move if position actually changed
        if (newGridX !== this.character.gridX || newGridY !== this.character.gridY) {
            // Update direction and start walking animation
            this.character.direction = direction;
            this.setAnimation('walking');
            
            // Set up smooth movement animation
            this.character.gridX = newGridX;
            this.character.gridY = newGridY;
            this.character.moveFromX = this.character.pixelX;
            this.character.moveFromY = this.character.pixelY;
            this.character.moveToX = newGridX * this.tileSize;
            this.character.moveToY = newGridY * this.tileSize;
            this.character.isMoving = true;
            this.character.moveStartTime = performance.now();
            
            console.log(`Starting smooth move to grid [${newGridX}, ${newGridY}]`);
        }
    }
}

// Initialize the game when page loads
window.addEventListener('load', () => {
    new DentalSimulation();
});