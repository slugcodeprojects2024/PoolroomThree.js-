// water-system.js - Simple Water System (NO FLOATING OBJECTS)
export class WaterSystem {
    constructor(scene) {
        this.scene = scene;
        this.waterGroup = new THREE.Group();
        scene.add(this.waterGroup);
    }
    
    init() {
        console.log('💧 Creating simple water surface...');
        this.createSimpleWater();
        console.log('✅ Simple water system ready');
    }
    
    createSimpleWater() {
        // Simple water surface - matches the 480x480 pool
        const waterGeometry = new THREE.PlaneGeometry(480, 480);
        const waterMaterial = new THREE.MeshLambertMaterial({
            color: 0x4488cc,
            transparent: true,
            opacity: 0.7
        });
        
        this.waterSurface = new THREE.Mesh(waterGeometry, waterMaterial);
        this.waterSurface.rotation.x = -Math.PI / 2;
        this.waterSurface.position.y = -0.5; // Just slightly below floor level for visibility
        
        this.waterGroup.add(this.waterSurface);
        
        console.log('🌊 Simple water surface created');
    }
    
    update(deltaTime) {
        // Simple color animation
        if (this.waterSurface) {
            const time = Date.now() * 0.001;
            this.waterSurface.material.color.setHSL(0.55, 0.8, 0.4 + Math.sin(time) * 0.1);
        }
    }
    
    isInWater(position) {
        return position.y < -0.5 && 
               Math.abs(position.x) < 240 && 
               Math.abs(position.z) < 240;
    }
}