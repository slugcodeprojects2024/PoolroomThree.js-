// water-system.js - Water Physics and Visual Effects
export class WaterSystem {
    constructor(scene) {
        this.scene = scene;
        this.waterMesh = null;
        this.clock = new THREE.Clock();
        
        // Water properties - updated for massive scale
        this.poolWidth = 400;        // Massive pool
        this.poolDepth = 400;
        this.waterLevel = -1;        // Water surface
        this.waveAmplitude = 0.2;    // Larger waves for bigger pool
        this.waveFrequency = 0.3;    // Slower waves for scale
        
        // Animation properties
        this.time = 0;
        this.animationSpeed = 1.0;
        
        // Water effects
        this.caustics = null;
        this.ripples = [];
    }
    
    init() {
        console.log('💧 Initializing water system...');
        
        this.createWaterSurface();
        this.createUnderwaterEffects();
        
        console.log('✅ Water system initialized');
    }
    
    createWaterSurface() {
        // Create water geometry
        const waterGeometry = new THREE.PlaneGeometry(
            this.poolWidth * 0.95, 
            this.poolDepth * 0.95,
            64, // width segments for wave animation
            64  // height segments for wave animation
        );
        
        // Create water material with transparency and reflection-like properties
        const waterMaterial = new THREE.MeshLambertMaterial({
            color: 0x006994,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });
        
        // Enhanced water material for better visuals
        if (this.scene.userData.advancedMaterials) {
            // Use more advanced material if supported
            waterMaterial.color.setHex(0x0077AA);
            waterMaterial.opacity = 0.7;
            waterMaterial.transparent = true;
        }
        
        // Create water mesh
        this.waterMesh = new THREE.Mesh(waterGeometry, waterMaterial);
        this.waterMesh.rotation.x = -Math.PI / 2;
        this.waterMesh.position.y = this.waterLevel;
        this.waterMesh.receiveShadow = true;
        
        // Store original vertex positions for animation
        this.originalPositions = this.waterMesh.geometry.attributes.position.array.slice();
        
        this.scene.add(this.waterMesh);
        
        console.log('🌊 Water surface created');
    }
    
    createUnderwaterEffects() {
        // Create caustic light patterns (simplified version)
        this.createCausticLights();
        
        // Add underwater particles (bubbles)
        this.createBubbleSystem();
        
        console.log('🫧 Underwater effects created');
    }
    
    createCausticLights() {
        // Create moving light patterns that simulate underwater caustics
        const causticPositions = [
            [0, -5, 0],
            [20, -8, 20],
            [-20, -8, -20],
            [20, -8, -20],
            [-20, -8, 20]
        ];
        
        this.caustics = [];
        
        causticPositions.forEach((pos, index) => {
            const causticLight = new THREE.PointLight(0x88DDFF, 0.3, 30);
            causticLight.position.set(pos[0], pos[1], pos[2]);
            
            // Store original position for animation
            causticLight.userData.originalPosition = pos.slice();
            causticLight.userData.animationOffset = index * Math.PI / 3;
            
            this.scene.add(causticLight);
            this.caustics.push(causticLight);
        });
    }
    
    createBubbleSystem() {
        // Create a simple bubble effect
        const bubbleCount = 50;
        const bubbleGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const bubbleMaterial = new THREE.MeshBasicMaterial({
            color: 0xAADDFF,
            transparent: true,
            opacity: 0.6
        });
        
        this.bubbles = [];
        
        for (let i = 0; i < bubbleCount; i++) {
            const bubble = new THREE.Mesh(bubbleGeometry, bubbleMaterial);
            
            // Random position within pool
            bubble.position.set(
                (Math.random() - 0.5) * this.poolWidth * 0.8,
                Math.random() * -10 - 2, // Between 2 and 12 units underwater
                (Math.random() - 0.5) * this.poolDepth * 0.8
            );
            
            // Store animation properties
            bubble.userData.speed = Math.random() * 0.5 + 0.1;
            bubble.userData.originalY = bubble.position.y;
            bubble.userData.floatOffset = Math.random() * Math.PI * 2;
            
            this.scene.add(bubble);
            this.bubbles.push(bubble);
        }
        
        console.log(`🫧 Created ${bubbleCount} bubbles`);
    }
    
    update(deltaTime) {
        this.time += deltaTime * this.animationSpeed;
        
        // Update water surface animation
        this.updateWaterWaves();
        
        // Update underwater effects
        this.updateCaustics();
        this.updateBubbles(deltaTime);
    }
    
    updateWaterWaves() {
        if (!this.waterMesh || !this.waterMesh.geometry) return;
        
        const positions = this.waterMesh.geometry.attributes.position;
        const positionsArray = positions.array;
        
        // Animate water surface with waves
        for (let i = 0; i < positionsArray.length; i += 3) {
            const x = this.originalPositions[i];
            const z = this.originalPositions[i + 2];
            
            // Create wave pattern
            const wave1 = Math.sin((x * 0.1) + (this.time * this.waveFrequency)) * this.waveAmplitude;
            const wave2 = Math.sin((z * 0.1) + (this.time * this.waveFrequency * 1.3)) * this.waveAmplitude * 0.5;
            const wave3 = Math.sin(((x + z) * 0.05) + (this.time * this.waveFrequency * 0.7)) * this.waveAmplitude * 0.3;
            
            positionsArray[i + 1] = wave1 + wave2 + wave3;
        }
        
        positions.needsUpdate = true;
        
        // Update normals for proper lighting
        this.waterMesh.geometry.computeVertexNormals();
    }
    
    updateCaustics() {
        if (!this.caustics) return;
        
        this.caustics.forEach((light, index) => {
            const offset = light.userData.animationOffset;
            const original = light.userData.originalPosition;
            
            // Animate caustic lights with wave-like motion
            light.position.x = original[0] + Math.sin(this.time + offset) * 3;
            light.position.z = original[2] + Math.cos(this.time * 1.3 + offset) * 3;
            
            // Vary intensity
            light.intensity = 0.2 + Math.sin(this.time * 2 + offset) * 0.1;
        });
    }
    
    updateBubbles(deltaTime) {
        if (!this.bubbles) return;
        
        this.bubbles.forEach(bubble => {
            // Float bubbles upward
            bubble.position.y += bubble.userData.speed * deltaTime;
            
            // Add floating motion
            bubble.position.x += Math.sin(this.time + bubble.userData.floatOffset) * deltaTime * 0.5;
            bubble.position.z += Math.cos(this.time * 1.2 + bubble.userData.floatOffset) * deltaTime * 0.3;
            
            // Reset bubble if it reaches surface
            if (bubble.position.y > this.waterLevel) {
                bubble.position.y = bubble.userData.originalY;
                
                // Randomize position slightly
                bubble.position.x = (Math.random() - 0.5) * this.poolWidth * 0.8;
                bubble.position.z = (Math.random() - 0.5) * this.poolDepth * 0.8;
            }
        });
    }
    
    // Public methods for interaction with other systems
    
    isInWater(position) {
        const inPoolX = Math.abs(position.x) < this.poolWidth / 2;
        const inPoolZ = Math.abs(position.z) < this.poolDepth / 2;
        const belowWaterLevel = position.y < this.waterLevel;
        
        return inPoolX && inPoolZ && belowWaterLevel;
    }
    
    getWaterLevel() {
        return this.waterLevel;
    }
    
    getPoolBounds() {
        return {
            width: this.poolWidth,
            depth: this.poolDepth,
            waterLevel: this.waterLevel
        };
    }
    
    // Create ripple effect at position (for when objects enter water)
    createRipple(position) {
        // Simple ripple effect
        const rippleGeometry = new THREE.RingGeometry(0, 2, 16);
        const rippleMaterial = new THREE.MeshBasicMaterial({
            color: 0xFFFFFF,
            transparent: true,
            opacity: 0.5,
            side: THREE.DoubleSide
        });
        
        const ripple = new THREE.Mesh(rippleGeometry, rippleMaterial);
        ripple.position.set(position.x, this.waterLevel + 0.01, position.z);
        ripple.rotation.x = -Math.PI / 2;
        
        // Store animation data
        ripple.userData.startTime = this.time;
        ripple.userData.duration = 2.0;
        
        this.scene.add(ripple);
        this.ripples.push(ripple);
        
        // Remove ripple after animation
        setTimeout(() => {
            this.scene.remove(ripple);
            const index = this.ripples.indexOf(ripple);
            if (index > -1) {
                this.ripples.splice(index, 1);
            }
        }, 2000);
    }
    
    // Adjust water properties
    setWaveAmplitude(amplitude) {
        this.waveAmplitude = Math.max(0, Math.min(1, amplitude));
    }
    
    setWaveFrequency(frequency) {
        this.waveFrequency = Math.max(0.1, Math.min(5, frequency));
    }
    
    setAnimationSpeed(speed) {
        this.animationSpeed = Math.max(0, Math.min(3, speed));
    }
    
    // Toggle underwater effects
    toggleBubbles(enabled) {
        if (this.bubbles) {
            this.bubbles.forEach(bubble => {
                bubble.visible = enabled;
            });
        }
    }
    
    toggleCaustics(enabled) {
        if (this.caustics) {
            this.caustics.forEach(light => {
                light.visible = enabled;
            });
        }
    }
}