// main.js - Fixed Three.js Poolrooms Application Entry Point
import { CameraControls } from './camera-controls.js';
import { PoolroomWorld } from './poolroom-world.js';
import { WaterSystem } from './water-system.js';
import { CollectiblesManager } from './collectibles-manager.js';

class PoolroomsApp {
    constructor() {
        // Core Three.js components
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = new THREE.Clock();
        
        // Game systems
        this.cameraControls = null;
        this.poolroomWorld = null;
        this.waterSystem = null;
        this.collectiblesManager = null;
        
        // State
        this.isInitialized = false;
    }
    
    async init() {
        console.log('🏊‍♂️ Initializing Poolrooms Three.js Application...');
        
        try {
            // Initialize Three.js core
            this.initThreeJS();
            
            // Create world
            this.poolroomWorld = new PoolroomWorld(this.scene);
            await this.poolroomWorld.init();
            
            // Setup camera controls
            this.cameraControls = new CameraControls(this.camera, this.renderer.domElement);
            this.cameraControls.init();
            
            // Initialize water system
            this.waterSystem = new WaterSystem(this.scene);
            this.waterSystem.init();
            
            // Initialize collectibles
            this.collectiblesManager = new CollectiblesManager(this.scene);
            this.collectiblesManager.init();
            
            // Setup lighting
            this.setupLighting();
            
            // Start render loop
            this.animate();
            
            // Hide loading screen
            document.getElementById('loading').style.display = 'none';
            
            this.isInitialized = true;
            console.log('✅ Poolrooms application initialized successfully!');
            
        } catch (error) {
            console.error('❌ Failed to initialize poolrooms:', error);
            document.getElementById('loading').innerHTML = 
                '<div style="color: red;">❌ Failed to load poolrooms</div>';
        }
    }
    
    initThreeJS() {
        // Create scene with bright background
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xE6F3FF);  // Very light blue-white background
        
        // Create camera - FIXED STARTING POSITION
        this.camera = new THREE.PerspectiveCamera(
            75, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            2000
        );
        // Start ABOVE GROUND at edge of pool area with good view
        this.camera.position.set(0, 15, 250); // x=0 (center), y=15 (above floor), z=250 (back from pool)
        
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.LinearToneMapping;
        this.renderer.toneMappingExposure = 1.5;  // Bright but not blown out
        
        // Add to DOM
        document.getElementById('canvas-container').appendChild(this.renderer.domElement);
        
        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize(), false);
        
        console.log('🎮 Three.js core initialized with fixed camera position');
    }
    
    setupLighting() {
        // Much dimmer lighting to see tile details
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.2); // Very low ambient
        this.scene.add(ambientLight);
        
        // Single directional light - much dimmer
        const mainLight = new THREE.DirectionalLight(0xffffff, 0.4); // Much lower
        mainLight.position.set(0, 100, 0);
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 2048;
        mainLight.shadow.mapSize.height = 2048;
        mainLight.shadow.camera.near = 0.1;
        mainLight.shadow.camera.far = 200;
        mainLight.shadow.camera.left = -300;
        mainLight.shadow.camera.right = 300;
        mainLight.shadow.camera.top = 300;
        mainLight.shadow.camera.bottom = -300;
        this.scene.add(mainLight);
        
        // Remove all other lights for now to see the tiles clearly
        
        console.log('💡 Minimal lighting for tile visibility');
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        if (!this.isInitialized) return;
        
        const deltaTime = this.clock.getDelta();
        
        // Update systems
        if (this.cameraControls) {
            this.cameraControls.update(deltaTime);
        }
        
        if (this.waterSystem) {
            this.waterSystem.update(deltaTime);
        }
        
        if (this.collectiblesManager) {
            this.collectiblesManager.update(deltaTime, this.camera.position);
        }
        
        // Update UI
        this.updateUI();
        
        // Render scene
        this.renderer.render(this.scene, this.camera);
    }
    
    updateUI() {
        const pos = this.camera.position;
        // Updated bounds for the larger pool
        const isInWater = pos.y < 0 && Math.abs(pos.x) < 200 && Math.abs(pos.z) < 200;
        const isPointerLocked = this.cameraControls ? this.cameraControls.isPointerLocked : false;
        
        document.getElementById('status').innerHTML = `
            <strong>Position:</strong> ${pos.x.toFixed(1)}, ${pos.y.toFixed(1)}, ${pos.z.toFixed(1)}<br>
            <strong>Environment:</strong> ${isInWater ? '🏊‍♂️ Swimming in Pool' : '🚶‍♂️ Walking on Deck'}<br>
            <strong>Pointer Lock:</strong> ${isPointerLocked ? '🔒 Locked' : '🔓 Unlocked (click to lock)'}<br>
            <strong>Phase 1:</strong> ✅ Basic Architecture Complete
        `;
        
        // Update collectibles counter
        if (this.collectiblesManager) {
            const collected = this.collectiblesManager.getCollectedCount();
            const total = this.collectiblesManager.getTotalCount();
            document.getElementById('collectibles-counter').textContent = 
                `Collectibles: ${collected}/${total}`;
        }
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    // Public API for debugging
    getCamera() { return this.camera; }
    getScene() { return this.scene; }
    getRenderer() { return this.renderer; }
}

// Initialize application when page loads
const app = new PoolroomsApp();

// Start the application
window.addEventListener('DOMContentLoaded', () => {
    app.init();
});

// Make app available globally for debugging
window.poolroomsApp = app;