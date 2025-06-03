// collectibles-manager.js - Collectible Items and Puzzle System
export class CollectiblesManager {
    constructor(scene) {
        this.scene = scene;
        this.collectibles = [];
        this.collectedCount = 0;
        this.totalCount = 10;
        
        // Collection properties
        this.collectionDistance = 3.0;
        this.rotationSpeed = 1.0;
        this.bobSpeed = 2.0;
        this.bobHeight = 0.3;
        this.glowIntensity = 1.0;
        
        // Animation
        this.time = 0;
        
        // Puzzle elements
        this.switches = [];
        this.doors = [];
        this.elevator = null;
        
        // Collectible group for organization
        this.collectiblesGroup = new THREE.Group();
        this.puzzleGroup = new THREE.Group();
        
        scene.add(this.collectiblesGroup);
        scene.add(this.puzzleGroup);
    }
    
    init() {
        console.log('📦 Initializing collectibles system...');
        
        this.createCollectibles();
        this.createPuzzleElements();
        this.createElevator();
        
        console.log(`✅ Collectibles system initialized - ${this.totalCount} items to find`);
    }
    
    createCollectibles() {
        const collectibleData = [
            // Format: [x, y, z, type, color, name]
            // Poolroom deck area - scaled for massive room
            [150, 8, 150, 'sphere', 0xff6b6b, 'Red Orb'],
            [-150, 8, 150, 'sphere', 0x4ecdc4, 'Cyan Orb'],
            [150, 8, -150, 'sphere', 0x45b7d1, 'Blue Orb'],
            [-150, 8, -150, 'sphere', 0xf7dc6f, 'Golden Orb'],
            
            // Floating above massive pool
            [0, 10, 0, 'cube', 0x6c5ce7, 'Purple Cube'],
            [80, 3, 0, 'sphere', 0xa8e6cf, 'Green Orb'],
            [-80, 3, 0, 'sphere', 0xffa8a8, 'Pink Orb'],
            
            // Underwater collectibles in massive pool
            [50, -12, 50, 'cube', 0x00d2d3, 'Aqua Cube'],
            [-50, -12, -50, 'cube', 0x55a3ff, 'Ocean Cube'],
            [0, -15, 0, 'sphere', 0xffcc02, 'Deep Golden Orb']
        ];
        
        collectibleData.forEach((data, index) => {
            const [x, y, z, type, color, name] = data;
            
            const collectible = this.createCollectibleMesh(type, color);
            collectible.position.set(x, y, z);
            
            // Store collectible data
            collectible.userData = {
                id: index,
                type: type,
                name: name,
                originalPosition: [x, y, z],
                baseY: y,
                collected: false,
                rotationY: 0,
                glowPhase: Math.random() * Math.PI * 2
            };
            
            this.collectibles.push(collectible);
            this.collectiblesGroup.add(collectible);
        });
        
        console.log(`📦 Created ${this.collectibles.length} collectibles`);
    }
    
    createCollectibleMesh(type, color) {
        let geometry, material;
        
        if (type === 'sphere') {
            geometry = new THREE.SphereGeometry(0.8, 16, 16);
        } else if (type === 'cube') {
            geometry = new THREE.BoxGeometry(1.2, 1.2, 1.2);
        }
        
        material = new THREE.MeshLambertMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.2
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        
        return mesh;
    }
    
    createPuzzleElements() {
        // Simple switches that unlock doors
        this.createSwitches();
        this.createDoors();
        
        console.log('🔧 Puzzle elements created');
    }
    
    createSwitches() {
        const switchPositions = [
            [300, 10, 0],    // East wall
            [-300, 10, 0],   // West wall
            [0, 10, 300],    // South wall
        ];
        
        switchPositions.forEach((pos, index) => {
            const switchGroup = new THREE.Group();
            
            // Switch base
            const baseGeometry = new THREE.BoxGeometry(2, 3, 1);
            const baseMaterial = new THREE.MeshLambertMaterial({ color: 0x444444 });
            const base = new THREE.Mesh(baseGeometry, baseMaterial);
            switchGroup.add(base);
            
            // Switch button
            const buttonGeometry = new THREE.BoxGeometry(1, 1, 0.5);
            const buttonMaterial = new THREE.MeshLambertMaterial({ color: 0xff4444 });
            const button = new THREE.Mesh(buttonGeometry, buttonMaterial);
            button.position.z = 0.75;
            switchGroup.add(button);
            
            switchGroup.position.set(pos[0], pos[1], pos[2]);
            switchGroup.userData = {
                id: index,
                activated: false,
                button: button,
                originalButtonColor: 0xff4444,
                activatedButtonColor: 0x44ff44
            };
            
            this.switches.push(switchGroup);
            this.puzzleGroup.add(switchGroup);
        });
    }
    
    createDoors() {
        const doorPositions = [
            [0, 20, 350],   // South door
            [350, 20, 0],   // East door
        ];
        
        doorPositions.forEach((pos, index) => {
            const doorGeometry = new THREE.BoxGeometry(8, 10, 2);
            const doorMaterial = new THREE.MeshLambertMaterial({ 
                color: 0x8B4513,
                transparent: true,
                opacity: 0.8
            });
            const door = new THREE.Mesh(doorGeometry, doorMaterial);
            door.position.set(pos[0], pos[1], pos[2]);
            
            door.userData = {
                id: index,
                isOpen: false,
                originalPosition: pos.slice(),
                openOffset: index === 0 ? [0, 10, 0] : [10, 0, 0] // Move up or sideways
            };
            
            this.doors.push(door);
            this.puzzleGroup.add(door);
        });
    }
    
    createElevator() {
        // Elevator built into one of the pillars
        const elevatorGeometry = new THREE.BoxGeometry(4, 8, 4);
        const elevatorMaterial = new THREE.MeshLambertMaterial({
            color: 0x333333,
            transparent: true,
            opacity: 0.9
        });
        
        this.elevator = new THREE.Mesh(elevatorGeometry, elevatorMaterial);
        this.elevator.position.set(-120, 20, -120); // Near a pillar in massive room
        
        this.elevator.userData = {
            isActive: false,
            requiresAllCollectibles: true
        };
        
        this.puzzleGroup.add(this.elevator);
        
        console.log('🛗 Elevator created');
    }
    
    update(deltaTime, playerPosition) {
        this.time += deltaTime;
        
        // Update collectible animations
        this.updateCollectibles(deltaTime, playerPosition);
        
        // Update puzzle elements
        this.updatePuzzleElements(playerPosition);
        
        // Check collection
        this.checkCollections(playerPosition);
        
        // Update elevator state
        this.updateElevator();
    }
    
    updateCollectibles(deltaTime, playerPosition) {
        this.collectibles.forEach(collectible => {
            if (collectible.userData.collected) return;
            
            // Rotation animation
            collectible.userData.rotationY += this.rotationSpeed * deltaTime;
            collectible.rotation.y = collectible.userData.rotationY;
            
            // Bobbing animation
            const bobOffset = Math.sin(this.time * this.bobSpeed + collectible.userData.glowPhase) * this.bobHeight;
            collectible.position.y = collectible.userData.baseY + bobOffset;
            
            // Glow effect
            const glowIntensity = 0.2 + 0.3 * Math.sin(this.time * 3 + collectible.userData.glowPhase);
            collectible.material.emissiveIntensity = glowIntensity;
            
            // Scale pulsing for nearby items
            const distance = playerPosition.distanceTo(collectible.position);
            if (distance < this.collectionDistance * 2) {
                const scaleMultiplier = 1 + 0.2 * Math.sin(this.time * 4);
                collectible.scale.setScalar(scaleMultiplier);
            } else {
                collectible.scale.setScalar(1);
            }
        });
    }
    
    updatePuzzleElements(playerPosition) {
        // Check switch interactions
        this.switches.forEach(switchObj => {
            const distance = playerPosition.distanceTo(switchObj.position);
            
            if (distance < 5 && !switchObj.userData.activated) {
                // Show interaction hint
                switchObj.userData.button.material.emissiveIntensity = 0.5;
            } else {
                switchObj.userData.button.material.emissiveIntensity = 0;
            }
        });
        
        // Animate doors based on switch states
        this.updateDoors();
    }
    
    updateDoors() {
        this.doors.forEach((door, index) => {
            const shouldOpen = this.switches[index] && this.switches[index].userData.activated;
            
            if (shouldOpen && !door.userData.isOpen) {
                // Open door
                const offset = door.userData.openOffset;
                door.position.add(new THREE.Vector3(offset[0], offset[1], offset[2]));
                door.userData.isOpen = true;
            }
        });
    }
    
    checkCollections(playerPosition) {
        this.collectibles.forEach(collectible => {
            if (collectible.userData.collected) return;
            
            const distance = playerPosition.distanceTo(collectible.position);
            
            if (distance < this.collectionDistance) {
                this.collectItem(collectible);
            }
        });
        
        // Check switch activations
        this.switches.forEach(switchObj => {
            if (switchObj.userData.activated) return;
            
            const distance = playerPosition.distanceTo(switchObj.position);
            
            if (distance < 3) {
                this.activateSwitch(switchObj);
            }
        });
    }
    
    collectItem(collectible) {
        if (collectible.userData.collected) return;
        
        collectible.userData.collected = true;
        this.collectedCount++;
        
        // Remove from scene
        this.collectiblesGroup.remove(collectible);
        
        // Show collection effect
        this.showCollectionEffect(collectible);
        
        console.log(`✨ Collected ${collectible.userData.name}! (${this.collectedCount}/${this.totalCount})`);
        
        // Check if all collected
        if (this.collectedCount === this.totalCount) {
            this.onAllCollected();
        }
    }
    
    activateSwitch(switchObj) {
        switchObj.userData.activated = true;
        
        // Change button color
        switchObj.userData.button.material.color.setHex(switchObj.userData.activatedButtonColor);
        
        console.log(`🔧 Switch ${switchObj.userData.id} activated!`);
    }
    
    showCollectionEffect(collectible) {
        // Create sparkle effect
        const sparkleCount = 10;
        const sparkles = [];
        
        for (let i = 0; i < sparkleCount; i++) {
            const sparkleGeometry = new THREE.SphereGeometry(0.1, 8, 8);
            const sparkleMaterial = new THREE.MeshBasicMaterial({
                color: 0xffff00,
                transparent: true,
                opacity: 1
            });
            
            const sparkle = new THREE.Mesh(sparkleGeometry, sparkleMaterial);
            sparkle.position.copy(collectible.position);
            
            // Random velocity
            sparkle.userData.velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 10,
                Math.random() * 5 + 2,
                (Math.random() - 0.5) * 10
            );
            
            sparkles.push(sparkle);
            this.scene.add(sparkle);
        }
        
        // Animate sparkles
        let sparkleTime = 0;
        const animateSparkles = () => {
            sparkleTime += 0.016;
            
            sparkles.forEach(sparkle => {
                sparkle.position.add(sparkle.userData.velocity.clone().multiplyScalar(0.016));
                sparkle.userData.velocity.y -= 9.8 * 0.016;
                sparkle.material.opacity = Math.max(0, 1 - sparkleTime * 2);
            });
            
            if (sparkleTime < 1) {
                requestAnimationFrame(animateSparkles);
            } else {
                // Clean up sparkles
                sparkles.forEach(sparkle => {
                    this.scene.remove(sparkle);
                });
            }
        };
        
        animateSparkles();
    }
    
    updateElevator() {
        if (!this.elevator) return;
        
        const allCollected = this.collectedCount === this.totalCount;
        
        if (allCollected && !this.elevator.userData.isActive) {
            this.elevator.userData.isActive = true;
            
            // Change elevator appearance to show it's active
            this.elevator.material.color.setHex(0x00ff00);
            this.elevator.material.emissive.setHex(0x004400);
            this.elevator.material.emissiveIntensity = 0.3;
            
            console.log('🛗 Elevator is now active!');
        }
    }
    
    onAllCollected() {
        console.log('🎉 All collectibles found! Elevator unlocked!');
        
        // Could trigger end game sequence here
        setTimeout(() => {
            if (window.confirm('🎉 Congratulations! You found all collectibles!\n\nThis completes the basic poolrooms experience.\n\nReady for Phase 2: Temple level?')) {
                console.log('🏛️ Ready for Phase 2 development!');
            }
        }, 1000);
    }
    
    // Public methods for UI and other systems
    getCollectedCount() {
        return this.collectedCount;
    }
    
    getTotalCount() {
        return this.totalCount;
    }
    
    getProgress() {
        return this.collectedCount / this.totalCount;
    }
    
    getNearestCollectible(position) {
        let nearest = null;
        let nearestDistance = Infinity;
        
        this.collectibles.forEach(collectible => {
            if (collectible.userData.collected) return;
            
            const distance = position.distanceTo(collectible.position);
            if (distance < nearestDistance) {
                nearest = collectible;
                nearestDistance = distance;
            }
        });
        
        return { collectible: nearest, distance: nearestDistance };
    }
    
    // Debug methods
    collectAll() {
        this.collectibles.forEach(collectible => {
            if (!collectible.userData.collected) {
                this.collectItem(collectible);
            }
        });
    }
    
    resetCollectibles() {
        this.collectibles.forEach(collectible => {
            if (collectible.userData.collected) {
                collectible.userData.collected = false;
                this.collectiblesGroup.add(collectible);
            }
        });
        this.collectedCount = 0;
    }
}