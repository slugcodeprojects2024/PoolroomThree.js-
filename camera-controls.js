// camera-controls.js - Enhanced with stair and pillar collision
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
        this.roomBoundary = 460;     // Room walls
        this.poolBoundary = 180;     // Pool edges
        this.poolDepth = -18;        // Pool bottom
        this.floorLevel = 5;         // Walking height
        this.waterLevel = -1;        // Water surface
        this.playerRadius = 20;      // Player collision radius
        
        // Stair collision data (from poolroom-world.js)
        this.stairPositions = [
            { x: -350, z: -350, name: 'northwest' },
            { x: 350, z: -350, name: 'northeast' }
        ];
        
        // Pillar collision data
        this.pillarPositions = [
            { x: -200, z: -200 },
            { x: 200, z: -200 },
            { x: -200, z: 200 },
            { x: 200, z: 200 }
        ];
        this.pillarRadius = 25; // Pillar collision radius
        
        // Water physics
        this.waterDamping = 15.0;
        this.buoyancy = 200.0;
    }
    
    init() {
        this.setupPointerLock();
        this.setupKeyboardControls();
        console.log('🎮 Camera controls initialized with enhanced collision');
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
        
        // Handle mouse movement - EXPLICIT EULER ANGLES
        document.addEventListener('mousemove', (event) => {
            if (!this.isPointerLocked) return;
            
            const mouseX = event.movementX || 0;
            const mouseY = event.movementY || 0;
            
            // Get current rotation as Euler angles
            const euler = new THREE.Euler().setFromQuaternion(this.camera.quaternion, 'YXZ');
            
            // Update rotations
            euler.y -= mouseX * this.mouseSensitivity;  // Horizontal look
            euler.x -= mouseY * this.mouseSensitivity;  // Vertical look
            euler.z = 0; // Force Z rotation to always be 0
            
            // Clamp vertical look
            euler.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, euler.x));
            
            // Apply back to camera
            this.camera.quaternion.setFromEuler(euler);
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
        // Store previous position for collision resolution
        const prevPosition = this.camera.position.clone();
        
        this.updateMovement(deltaTime);
        this.handleCollisions(prevPosition);
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
    
    handleCollisions(prevPosition) {
        const pos = this.camera.position;
        
        // Check all collisions and resolve them
        let collisionOccurred = false;
        
        // Room boundary collision
        if (pos.x > this.roomBoundary) {
            pos.x = this.roomBoundary;
            this.velocity.x = 0;
            collisionOccurred = true;
        }
        if (pos.x < -this.roomBoundary) {
            pos.x = -this.roomBoundary;
            this.velocity.x = 0;
            collisionOccurred = true;
        }
        if (pos.z > this.roomBoundary) {
            pos.z = this.roomBoundary;
            this.velocity.z = 0;
            collisionOccurred = true;
        }
        if (pos.z < -this.roomBoundary) {
            pos.z = -this.roomBoundary;
            this.velocity.z = 0;
            collisionOccurred = true;
        }
        
        // Pillar collision
        if (this.checkPillarCollisions(pos, prevPosition)) {
            collisionOccurred = true;
        }
        
        // Check if in pool area - FIXED: Use larger pool boundary
        const inPoolArea = Math.abs(pos.x) < 240 && Math.abs(pos.z) < 240; // Match water system
        
        if (inPoolArea) {
            // In pool area - handle pool collisions
            this.handlePoolCollisions();
        } else {
            // On deck - handle stair and floor collisions
            const stairHeight = this.getStairHeightAtPosition(pos.x, pos.z);
            if (stairHeight !== null) {
                // On stairs - use stair height with some tolerance
                if (pos.y < stairHeight + 2) { // Allow small gap above stairs
                    pos.y = stairHeight + 2;
                    this.velocity.y = 0;
                    this.canJump = true;
                }
            } else {
                // On regular floor
                if (pos.y < this.floorLevel) {
                    pos.y = this.floorLevel;
                    this.velocity.y = 0;
                    this.canJump = true;
                }
            }
        }
    }
    
    checkPillarCollisions(pos, prevPosition) {
        let collisionOccurred = false;
        
        for (const pillar of this.pillarPositions) {
            const distance = Math.sqrt(
                Math.pow(pos.x - pillar.x, 2) + 
                Math.pow(pos.z - pillar.z, 2)
            );
            
            if (distance < this.pillarRadius + this.playerRadius) {
                // Collision detected - push player away from pillar
                const pushDirection = new THREE.Vector2(
                    pos.x - pillar.x,
                    pos.z - pillar.z
                ).normalize();
                
                const pushDistance = (this.pillarRadius + this.playerRadius) - distance + 1;
                
                pos.x += pushDirection.x * pushDistance;
                pos.z += pushDirection.y * pushDistance;
                
                // Stop velocity in direction of collision
                this.velocity.x *= 0.5;
                this.velocity.z *= 0.5;
                
                collisionOccurred = true;
            }
        }
        
        return collisionOccurred;
    }
    
    getStairHeightAtPosition(x, z) {
        for (const stair of this.stairPositions) {
            // Check if position is within stair bounds
            const stairSize = 100; // Stair footprint
            const halfSize = stairSize / 2;
            
            if (x >= stair.x - halfSize && x <= stair.x + halfSize &&
                z >= stair.z - halfSize && z <= stair.z + halfSize) {
                
                // Calculate height based on distance from stair center
                // The closer to center, the higher the step
                const distanceFromCenterX = Math.abs(x - stair.x);
                const distanceFromCenterZ = Math.abs(z - stair.z);
                const distanceFromEdge = Math.min(
                    halfSize - distanceFromCenterX,
                    halfSize - distanceFromCenterZ
                );
                
                // Each 10 units from edge = 1 step up (8 units high)
                const stepNumber = Math.floor(distanceFromEdge / 10);
                const stepHeight = stepNumber * 8; // 8 units per step
                
                return this.floorLevel + stepHeight;
            }
        }
        
        return null; // Not on stairs
    }
    
    handlePoolCollisions() {
        const pos = this.camera.position;
        
        // Pool bottom collision
        if (pos.y < this.poolDepth) {
            pos.y = this.poolDepth;
            this.velocity.y = 0;
            this.canJump = true;
        }
        
        // REMOVED the problematic pool deck collision that was preventing entry
        // Players can now enter and exit the pool freely
    }
    
    updateSwimmingState() {
        const pos = this.camera.position;
        // FIXED: Match the actual pool boundaries from water system
        const inPoolArea = Math.abs(pos.x) < 240 && Math.abs(pos.z) < 240;
        
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