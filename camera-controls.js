// camera-controls.js - First Person Camera Controls for Poolrooms
export class CameraControls {
    constructor(camera, domElement) {
        this.camera = camera;
        this.domElement = domElement;
        
        // Movement state
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.canJump = false;
        this.isSwimming = false;
        
        // Physics
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        this.walkSpeed = 400.0;
        this.swimSpeed = 200.0;
        this.jumpVelocity = 350;
        this.gravity = 9.8 * 100.0;
        this.damping = 10.0;
        
        // Mouse sensitivity
        this.mouseSensitivity = 0.002;
        
        // Pointer lock
        this.isPointerLocked = false;
        
        // Collision boundaries - updated for massive scale
        this.roomBoundary = 380;     // Room walls  
        this.poolBoundary = 180;     // Pool edges (400/2 - 20 for safety)
        this.poolDepth = -18;        // Pool bottom
        this.floorLevel = 5;         // Walking height (taller for scale)
        this.waterLevel = -1;        // Water surface
        
        // Water physics
        this.waterDamping = 15.0;
        this.buoyancy = 200.0;
    }
    
    init() {
        this.setupPointerLock();
        this.setupKeyboardControls();
        console.log('🎮 Camera controls initialized');
    }
    
    setupPointerLock() {
        // Click to request pointer lock
        this.domElement.addEventListener('click', () => {
            this.domElement.requestPointerLock();
        });
        
        // Handle pointer lock changes
        document.addEventListener('pointerlockchange', () => {
            this.isPointerLocked = document.pointerLockElement === this.domElement;
        });
        
        // Handle mouse movement
        document.addEventListener('mousemove', (event) => {
            if (!this.isPointerLocked) return;
            
            const movementX = event.movementX || 0;
            const movementY = event.movementY || 0;
            
            // Update camera rotation - FIXED DIRECTION
            this.camera.rotation.y -= movementX * this.mouseSensitivity;  // Correct horizontal
            this.camera.rotation.x -= movementY * this.mouseSensitivity;  // Correct vertical
            
            // Limit vertical rotation
            this.camera.rotation.x = Math.max(
                -Math.PI / 2, 
                Math.min(Math.PI / 2, this.camera.rotation.x)
            );
        });
    }
    
    setupKeyboardControls() {
        // Keydown events
        document.addEventListener('keydown', (event) => {
            switch(event.code) {
                case 'KeyW':
                    this.moveForward = true;
                    break;
                case 'KeyS':
                    this.moveBackward = true;
                    break;
                case 'KeyA':
                    this.moveLeft = true;
                    break;
                case 'KeyD':
                    this.moveRight = true;
                    break;
                case 'KeyQ':
                    // Turn left
                    this.camera.rotation.y += 0.05;
                    break;
                case 'KeyE':
                    // Turn right
                    this.camera.rotation.y -= 0.05;
                    break;
                case 'Space':
                    event.preventDefault();
                    this.handleJump();
                    break;
                case 'ShiftLeft':
                    // Sprint/swim faster
                    this.walkSpeed = 600.0;
                    this.swimSpeed = 300.0;
                    break;
            }
        });
        
        // Keyup events
        document.addEventListener('keyup', (event) => {
            switch(event.code) {
                case 'KeyW':
                    this.moveForward = false;
                    break;
                case 'KeyS':
                    this.moveBackward = false;
                    break;
                case 'KeyA':
                    this.moveLeft = false;
                    break;
                case 'KeyD':
                    this.moveRight = false;
                    break;
                case 'ShiftLeft':
                    // Return to normal speed
                    this.walkSpeed = 400.0;
                    this.swimSpeed = 200.0;
                    break;
            }
        });
    }
    
    handleJump() {
        if (this.isSwimming) {
            // Swimming up
            this.velocity.y += this.jumpVelocity * 0.7;
        } else if (this.canJump) {
            // Jumping on land
            this.velocity.y += this.jumpVelocity;
            this.canJump = false;
        }
    }
    
    update(deltaTime) {
        this.updateMovement(deltaTime);
        this.handleCollisions();
        this.updateSwimmingState();
    }
    
    updateMovement(deltaTime) {
        // Determine current speed based on environment
        const currentSpeed = this.isSwimming ? this.swimSpeed : this.walkSpeed;
        const currentDamping = this.isSwimming ? this.waterDamping : this.damping;
        
        // Apply damping
        this.velocity.x -= this.velocity.x * currentDamping * deltaTime;
        this.velocity.z -= this.velocity.z * currentDamping * deltaTime;
        
        // Apply gravity or buoyancy
        if (this.isSwimming) {
            // Buoyancy force when underwater
            if (this.camera.position.y < this.waterLevel) {
                this.velocity.y += this.buoyancy * deltaTime;
            }
            // Reduced gravity in water
            this.velocity.y -= (this.gravity * 0.3) * deltaTime;
        } else {
            // Normal gravity on land
            this.velocity.y -= this.gravity * deltaTime;
        }
        
        // Calculate movement direction
        this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
        this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
        this.direction.normalize();
        
        // Apply movement
        if (this.moveForward || this.moveBackward) {
            this.velocity.z -= this.direction.z * currentSpeed * deltaTime;
        }
        if (this.moveLeft || this.moveRight) {
            this.velocity.x -= this.direction.x * currentSpeed * deltaTime;
        }
        
        // Convert to world coordinates - FIXED MOVEMENT DIRECTIONS
        const forward = new THREE.Vector3(0, 0, 1);  // FIXED: Changed from -1 to 1
        forward.applyQuaternion(this.camera.quaternion);
        forward.y = 0;
        forward.normalize();
        
        const right = new THREE.Vector3(-1, 0, 0);   // FIXED: Changed from 1 to -1
        right.applyQuaternion(this.camera.quaternion);
        right.y = 0;
        right.normalize();
        
        // Apply movement to camera - FIXED DIRECTIONS
        const movement = new THREE.Vector3();
        movement.addScaledVector(forward, this.velocity.z * deltaTime);
        movement.addScaledVector(right, this.velocity.x * deltaTime);
        
        this.camera.position.add(movement);
        this.camera.position.y += this.velocity.y * deltaTime;
    }
    
    handleCollisions() {
        const pos = this.camera.position;
        
        // Room boundary collision
        const maxBoundary = this.roomBoundary;
        if (pos.x > maxBoundary) pos.x = maxBoundary;
        if (pos.x < -maxBoundary) pos.x = -maxBoundary;
        if (pos.z > maxBoundary) pos.z = maxBoundary;
        if (pos.z < -maxBoundary) pos.z = -maxBoundary;
        
        // Check if in pool area
        const inPoolArea = Math.abs(pos.x) < this.poolBoundary && Math.abs(pos.z) < this.poolBoundary;
        
        if (inPoolArea) {
            // In pool area - handle pool collisions
            this.handlePoolCollisions();
        } else {
            // On deck - handle floor collision
            if (pos.y < this.floorLevel) {
                pos.y = this.floorLevel;
                this.velocity.y = 0;
                this.canJump = true;
            }
        }
    }
    
    handlePoolCollisions() {
        const pos = this.camera.position;
        
        // Pool bottom collision
        if (pos.y < this.poolDepth) {
            pos.y = this.poolDepth;
            this.velocity.y = 0;
            this.canJump = true;
        }
        
        // Pool deck level (can climb out)
        if (pos.y > this.floorLevel) {
            // Allow jumping out of pool onto deck
            if (pos.y < this.floorLevel + 0.5) {
                pos.y = this.floorLevel;
                this.velocity.y = 0;
                this.canJump = true;
            }
        }
    }
    
    updateSwimmingState() {
        const pos = this.camera.position;
        const inPoolArea = Math.abs(pos.x) < this.poolBoundary && Math.abs(pos.z) < this.poolBoundary;
        
        // Update swimming state based on position
        this.isSwimming = inPoolArea && pos.y < this.waterLevel;
        
        // Visual feedback for swimming
        if (this.isSwimming) {
            // Add subtle underwater effect (could add fog color change here)
            // For now, just ensure proper physics
        }
    }
    
    // Public methods for other systems
    getPosition() {
        return this.camera.position.clone();
    }
    
    isInWater() {
        return this.isSwimming;
    }
    
    isInPoolArea() {
        const pos = this.camera.position;
        return Math.abs(pos.x) < this.poolBoundary && Math.abs(pos.z) < this.poolBoundary;
    }
    
    // Set camera position (useful for teleporting to specific areas)
    setPosition(x, y, z) {
        this.camera.position.set(x, y, z);
        this.velocity.set(0, 0, 0);
    }
    
    // Reset to starting position
    reset() {
        this.setPosition(50, 2, 50);
        this.camera.rotation.set(0, 0, 0);
    }
}