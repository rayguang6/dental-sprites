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
        this.doctorSprite = null; // Doctor sprite
        this.doctors = []; // Array of doctors
        this.bedSprite = null; // Bed sprite
        this.beds = []; // Array of bed positions
        this.effects = []; // Array of visual effects (confetti, money, etc.)
        
        // Patience system
        this.patienceMax = 100; // Maximum patience level
        this.patienceDecayRate = 0.1; // How fast patience decreases per frame
        this.patienceColors = {
            happy: '#4CAF50',    // Green
            neutral: '#FFC107',  // Yellow
            angry: '#F44336'     // Red
        };
        
        // Movement sequence
        this.movementSequence = [
            // { direction: 'up', steps: 2 },
            // { direction: 'left', steps: 2 },
            // { direction: 'down', steps: 2 },
            // { direction: 'right', steps: 2 },
            // { action: 'celebrate' }
            { direction: 'left', steps: 1 },
            { direction: 'up', steps: 1 },
            { direction: 'right', steps: 2 },
            { direction: 'down', steps: 1 },
            { direction: 'left', steps: 1 },
            { direction: 'right', steps: 1 },
            { direction: 'up', steps: 1 },
            { direction: 'left', steps: 2 },
            { direction: 'down', steps: 1 },
            { direction: 'right', steps: 1 },

        ];
        this.currentStep = 0;
        this.stepsInCurrentDirection = 0;
        this.lastMoveTime = 0;
        this.moveDelay = 50; // Faster delay between moves
        this.moveDuration = 300; // Faster move animation
        this.celebrationDuration = 2000; // Celebrate for 2 seconds
        this.celebrationStartTime = 0;
        
        // Patient spawning
        this.spawnTimer = 0;
        this.spawnInterval = 3000; // Spawn a patient every 3 seconds
        
        // Chair positions (available seats) - vertical column, ordered by distance from door
        this.chairPositions = [
            {x: 1, y: 8}, {x: 1, y: 7}, {x: 1, y: 6}, {x: 1, y: 5},
            {x: 1, y: 4}, {x: 1, y: 3}, {x: 1, y: 2}, {x: 1, y: 1}
        ];
        this.occupiedChairs = new Set(); // Track which chairs are taken
        
        // Treatment beds
        this.treatmentBeds = [
            {x: 5, y: 2}, {x: 6, y: 2} //for patient to find
        ];
        this.occupiedBeds = new Set(); // Track which beds are taken
        
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
        
        // Load doctor sprite
        this.loadDoctorSprite();
        
        // Load bed sprite
        this.loadBedSprite();
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
    
    loadDoctorSprite() {
        // Load doctor sprite
        this.doctorSprite = new Image();
        this.doctorSprite.onload = () => {
            console.log('Doctor sprite loaded successfully');
            this.initializeDoctors();
        };
        this.doctorSprite.onerror = () => {
            console.error('Failed to load doctor sprite');
            this.initializeDoctors();
        };
        this.doctorSprite.src = 'images/avatar/doctor.png';
    }
    
    initializeDoctors() {
        // Create doctors at (4,2) and (7,2)
        this.doctors = [
            {
                id: 'doctor1',
                gridX: 5,
                gridY: 1,
                pixelX: 5 * this.tileSize,
                pixelY: 1 * this.tileSize - 10,
                direction: 'down',
                currentFrame: 0,
                frameCount: 0,
                animationState: 'celebrate'
            },
            {
                id: 'doctor3',
                gridX: 6,
                gridY: 1,
                pixelX: 6 * this.tileSize,
                pixelY: 1 * this.tileSize - 10,
                direction: 'down',
                currentFrame: 0,
                frameCount: 0,
                animationState: 'celebrate'
            },
        ];
        console.log('Doctors initialized at (4,2) and (7,2)');
    }
    
    loadBedSprite() {
        // Load bed sprite
        this.bedSprite = new Image();
        this.bedSprite.onload = () => {
            console.log('Bed sprite loaded successfully');
            this.initializeBeds();
        };
        this.bedSprite.onerror = () => {
            console.error('Failed to load bed sprite');
            this.initializeBeds();
        };
        this.bedSprite.src = 'images/bed.png';
    }
    
    initializeBeds() {
        // Create beds at treatment bed positions
        this.beds = [
            {
                id: 'bed1',
                gridX: 5,
                gridY: 1,
                pixelX: 5 * this.tileSize,
                pixelY: 1 * this.tileSize
            },
            {
                id: 'bed2',
                gridX: 6,
                gridY: 1,
                pixelX: 6 * this.tileSize,
                pixelY: 1 * this.tileSize
            }
        ];
        console.log('Beds initialized at (5,2) and (6,2)');
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
        this.updatePatients();
        this.updateDoctors();
        this.updateEffects();
        
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
        
        // Draw all doctors
        this.drawDoctors();
        
        // Draw all beds (on top of doctors)
        this.drawBeds();
        
        // Draw all effects (on top of everything)
        this.drawEffects();
        
        // Draw patience bars (on top of everything)
        this.drawPatienceBars();
        
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
            gridX: 4,
            gridY: 9,
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
            moveToY: 9 * this.tileSize,
            // Walking to chair
            targetChair: null,
            targetBed: null,
            path: [],
            currentPathIndex: 0,
            state: 'spawned', // 'spawned', 'walking', 'sitting', 'walking_to_treatment', 'treating'
            waitTime: 0,
            treatmentTime: 0,
            // Patience system
            patience: this.patienceMax,
            patienceState: 'happy' // happy, neutral, angry
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
    
    updatePatients() {
        this.patients.forEach(patient => {
            // Update patience for all patients
            this.updatePatientPatience(patient);
            if (patient.state === 'spawned') {
                // Find an available chair
                const availableChair = this.findAvailableChair();
                if (availableChair) {
                    patient.targetChair = availableChair;
                    patient.path = this.generatePath(patient.gridX, patient.gridY, availableChair.x, availableChair.y);
                    patient.currentPathIndex = 0;
                    patient.state = 'walking';
                    patient.animationState = 'walking';
                    console.log(`Patient ${patient.spriteKey} heading to chair (${availableChair.x}, ${availableChair.y})`);
                }
            } else if (patient.state === 'walking') {
                this.updatePatientMovement(patient);
            } else if (patient.state === 'sitting') {
                // Wait in chair, then go to treatment
                patient.waitTime += 16; // Assuming 60fps
                if (patient.waitTime >= 2000) { // Wait 2 seconds
                    const availableBed = this.findAvailableBed();
                    if (availableBed) {
                        patient.targetBed = availableBed;
                        patient.path = this.generatePathToBed(patient.gridX, patient.gridY, availableBed.x, availableBed.y);
                        patient.currentPathIndex = 0;
                        patient.state = 'walking_to_treatment';
                        patient.animationState = 'walking';
                        // Free up the chair
                        const chairKey = `${patient.targetChair.x},${patient.targetChair.y}`;
                        this.occupiedChairs.delete(chairKey);
                        console.log(`Patient ${patient.spriteKey} heading to treatment bed (${availableBed.x}, ${availableBed.y})`);
                    }
                }
            } else if (patient.state === 'walking_to_treatment') {
                this.updatePatientMovement(patient);
            } else if (patient.state === 'treating') {
                // Treatment in progress
                patient.treatmentTime += 16;
                if (patient.treatmentTime >= 5000) { // Treatment takes 5 seconds
                    // Treatment finished, create success effect
                    this.createSuccessEffect(patient.gridX, patient.gridY);
                    
                    // Remove patient
                    const bedKey = `${patient.targetBed.x},${patient.targetBed.y}`;
                    this.occupiedBeds.delete(bedKey);
                    const patientIndex = this.patients.indexOf(patient);
                    this.patients.splice(patientIndex, 1);
                    console.log(`Patient ${patient.spriteKey} treatment finished, leaving clinic`);
                }
            }
        });
    }
    
    updateDoctors() {
        this.doctors.forEach(doctor => {
            // Doctors continuously celebrate (treating animation)
            doctor.frameCount++;
            if (doctor.frameCount >= 15) { // Slower celebration animation
                doctor.frameCount = 0;
                doctor.currentFrame++;
                if (doctor.currentFrame >= 4) { // Celebrate has 4 frames
                    doctor.currentFrame = 0;
                }
            }
        });
    }
    
    drawDoctors() {
        this.doctors.forEach(doctor => {
            const pixelX = Math.round(doctor.pixelX);
            const pixelY = Math.round(doctor.pixelY);
            
            if (this.doctorSprite && this.doctorSprite.complete) {
                // Get celebrate animation frame (frames 12-15)
                const celebrateFrames = [12, 13, 14, 15];
                const frameNumber = celebrateFrames[doctor.currentFrame];
                const frameX = frameNumber * 32; // Each frame is 32px wide
                
                this.ctx.drawImage(
                    this.doctorSprite,
                    frameX, 0, 32, 32,  // Source: current celebration frame
                    pixelX, pixelY, 32, 32  // Destination: position on canvas
                );
            } else {
                // Draw fallback rectangle if sprite not loaded
                this.ctx.fillStyle = '#4A90E2';
                this.ctx.fillRect(pixelX + 4, pixelY + 4, 24, 24);
                
                this.ctx.strokeStyle = '#333';
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(pixelX + 4, pixelY + 4, 24, 24);
            }
        });
    }
    
    drawBeds() {
        this.beds.forEach(bed => {
            const pixelX = Math.round(bed.pixelX);
            const pixelY = Math.round(bed.pixelY);
            
            if (this.bedSprite && this.bedSprite.complete) {
                // Draw bed sprite (32x32)
                this.ctx.drawImage(
                    this.bedSprite,
                    0, 0, 32, 32,  // Source: full bed sprite
                    pixelX, pixelY, 32, 32  // Destination: position on canvas
                );
            } else {
                // Draw fallback rectangle if bed sprite not loaded
                this.ctx.fillStyle = '#87CEEB';
                this.ctx.fillRect(pixelX + 2, pixelY + 2, 28, 28);
                
                this.ctx.strokeStyle = '#4682B4';
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(pixelX + 2, pixelY + 2, 28, 28);
            }
        });
    }
    
    createSuccessEffect(x, y) {
        // Create confetti/money effect at treatment completion
        const effect = {
            id: Date.now() + Math.random(),
            x: x * this.tileSize + this.tileSize / 2, // Center of tile
            y: y * this.tileSize + this.tileSize / 2,
            particles: [],
            life: 60, // 60 frames (1 second at 60fps)
            maxLife: 60
        };
        
        // Create multiple particles for confetti effect
        for (let i = 0; i < 8; i++) {
            effect.particles.push({
                x: effect.x,
                y: effect.y,
                vx: (Math.random() - 0.5) * 4, // Random horizontal velocity
                vy: (Math.random() - 0.5) * 4 - 2, // Random vertical velocity (upward bias)
                color: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'][Math.floor(Math.random() * 6)],
                size: Math.random() * 4 + 2
            });
        }
        
        this.effects.push(effect);
        console.log(`Success effect created at (${x}, ${y})`);
    }
    
    updateEffects() {
        this.effects.forEach((effect, index) => {
            effect.life--;
            
            // Update particles
            effect.particles.forEach(particle => {
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.vy += 0.1; // Gravity
            });
            
            // Remove effect when life expires
            if (effect.life <= 0) {
                this.effects.splice(index, 1);
            }
        });
    }
    
    drawEffects() {
        this.effects.forEach(effect => {
            const alpha = effect.life / effect.maxLife; // Fade out over time
            
            effect.particles.forEach(particle => {
                this.ctx.save();
                this.ctx.globalAlpha = alpha;
                this.ctx.fillStyle = particle.color;
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.restore();
            });
        });
    }
    
    updatePatientPatience(patient) {
        // Decrease patience over time
        patient.patience -= this.patienceDecayRate;
        
        // Clamp patience between 0 and max
        patient.patience = Math.max(0, Math.min(this.patienceMax, patient.patience));
        
        // Update patience state based on current patience level
        if (patient.patience > 60) {
            patient.patienceState = 'happy';
        } else if (patient.patience > 30) {
            patient.patienceState = 'neutral';
        } else {
            patient.patienceState = 'angry';
        }
        
        // If patience reaches 0, patient leaves (angry)
        if (patient.patience <= 0 && patient.state !== 'treating') {
            console.log(`Patient ${patient.spriteKey} left angry!`);
            this.removePatient(patient);
        }
    }
    
    removePatient(patient) {
        // Free up chair if patient was sitting
        if (patient.targetChair) {
            const chairKey = `${patient.targetChair.x},${patient.targetChair.y}`;
            this.occupiedChairs.delete(chairKey);
        }
        
        // Free up bed if patient was being treated
        if (patient.targetBed) {
            const bedKey = `${patient.targetBed.x},${patient.targetBed.y}`;
            this.occupiedBeds.delete(bedKey);
        }
        
        // Remove patient from array
        const index = this.patients.indexOf(patient);
        if (index > -1) {
            this.patients.splice(index, 1);
        }
    }
    
    drawPatienceBars() {
        this.patients.forEach(patient => {
            const pixelX = Math.round(patient.pixelX);
            const pixelY = Math.round(patient.pixelY);
            
            // Position bar above patient
            const barX = pixelX;
            const barY = pixelY - 8;
            const barWidth = 32;
            const barHeight = 6;
            
            // Background (dark)
            this.ctx.fillStyle = '#333';
            this.ctx.fillRect(barX, barY, barWidth, barHeight);
            
            // Patience bar
            const patiencePercent = patient.patience / this.patienceMax;
            const fillWidth = barWidth * patiencePercent;
            
            // Color based on patience state
            let barColor = this.patienceColors.happy;
            if (patient.patienceState === 'neutral') {
                barColor = this.patienceColors.neutral;
            } else if (patient.patienceState === 'angry') {
                barColor = this.patienceColors.angry;
            }
            
            this.ctx.fillStyle = barColor;
            this.ctx.fillRect(barX, barY, fillWidth, barHeight);
            
            // Emoji indicator
            const emojiX = pixelX + 16;
            const emojiY = pixelY - 20;
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'center';
            
            let emoji = '😊'; // Happy
            if (patient.patienceState === 'neutral') {
                emoji = '😐'; // Neutral
            } else if (patient.patienceState === 'angry') {
                emoji = '😠'; // Angry
            }
            
            this.ctx.fillText(emoji, emojiX, emojiY);
        });
    }
    
    findAvailableChair() {
        for (const chair of this.chairPositions) {
            const chairKey = `${chair.x},${chair.y}`;
            if (!this.occupiedChairs.has(chairKey)) {
                this.occupiedChairs.add(chairKey);
                return chair;
            }
        }
        return null; // No available chairs
    }
    
    findAvailableBed() {
        for (const bed of this.treatmentBeds) {
            const bedKey = `${bed.x},${bed.y}`;
            if (!this.occupiedBeds.has(bedKey)) {
                this.occupiedBeds.add(bedKey);
                return bed;
            }
        }
        return null; // No available beds
    }
    
    generatePath(startX, startY, endX, endY) {
        // Path using column 2 as the main corridor
        const path = [];
        
        // Step 1: Go left to column 2 (the main corridor)
        for (let x = startX - 1; x >= 2; x--) {
            path.push({x: x, y: startY});
        }
        
        // Step 2: Move up/down in column 2 to reach target row
        if (startY > endY) {
            // Go up in column 2
            for (let y = startY - 1; y >= endY; y--) {
                path.push({x: 2, y: y});
            }
        } else if (startY < endY) {
            // Go down in column 2
            for (let y = startY + 1; y <= endY; y++) {
                path.push({x: 2, y: y});
            }
        }
        
        // Step 3: Move left from column 2 to target column (1)
        if (endX < 2) {
            for (let x = 2 - 1; x >= endX; x--) {
                path.push({x: x, y: endY});
            }
        }
        
        return path;
    }
    
    generatePathToBed(startX, startY, endX, endY) {
        // Special pathfinding for treatment beds: col 2 → row 5 → right → up → face down
        const path = [];
        
        // Step 1: Go to column 2 (main corridor)
        for (let x = startX - 1; x >= 2; x--) {
            path.push({x: x, y: startY});
        }
        
        // Step 2: Walk up or down to row 5 in column 2
        if (startY < 5) {
            // Go down to row 5
            for (let y = startY + 1; y <= 5; y++) {
                path.push({x: 2, y: y});
            }
        } else if (startY > 5) {
            // Go up to row 5
            for (let y = startY - 1; y >= 5; y--) {
                path.push({x: 2, y: y});
            }
        }
        
        // Step 3: Walk right until reaching target column
        for (let x = 2 + 1; x <= endX; x++) {
            path.push({x: x, y: 5});
        }
        
        // Step 4: Walk up to target row
        for (let y = 5 - 1; y >= endY; y--) {
            path.push({x: endX, y: y});
        }
        
        return path;
    }
    
    updatePatientMovement(patient) {
        if (patient.currentPathIndex >= patient.path.length) {
            // Reached destination
            if (patient.state === 'walking') {
                patient.state = 'sitting';
                patient.animationState = 'idle';
                patient.direction = 'right'; // Face right when sitting
                console.log(`Patient ${patient.spriteKey} reached chair and is sitting`);
            } else if (patient.state === 'walking_to_treatment') {
                patient.state = 'treating';
                patient.animationState = 'idle';
                patient.direction = 'down'; // Face down when on treatment bed
                console.log(`Patient ${patient.spriteKey} reached treatment bed and is being treated`);
            }
            return;
        }
        
        const currentTime = performance.now();
        const targetPos = patient.path[patient.currentPathIndex];
        
        if (!patient.isMoving) {
            // Start moving to next position in path
            const direction = this.getDirection(patient.gridX, patient.gridY, targetPos.x, targetPos.y);
            patient.direction = direction;
            patient.gridX = targetPos.x;
            patient.gridY = targetPos.y;
            patient.moveFromX = patient.pixelX;
            patient.moveFromY = patient.pixelY;
            patient.moveToX = targetPos.x * this.tileSize;
            patient.moveToY = targetPos.y * this.tileSize;
            patient.isMoving = true;
            patient.moveStartTime = currentTime;
        } else {
            // Update smooth movement
            const elapsed = currentTime - patient.moveStartTime;
            const progress = Math.min(elapsed / this.moveDuration, 1.0);
            const easedProgress = this.easeInOutQuad(progress);
            
            patient.pixelX = patient.moveFromX + (patient.moveToX - patient.moveFromX) * easedProgress;
            patient.pixelY = patient.moveFromY + (patient.moveToY - patient.moveFromY) * easedProgress;
            
            if (progress >= 1.0) {
                patient.isMoving = false;
                patient.pixelX = patient.moveToX;
                patient.pixelY = patient.moveToY;
                patient.currentPathIndex++;
            }
        }
    }
    
    getDirection(fromX, fromY, toX, toY) {
        if (toY < fromY) return 'up';
        if (toY > fromY) return 'down';
        if (toX < fromX) return 'left';
        if (toX > fromX) return 'right';
        return 'down';
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