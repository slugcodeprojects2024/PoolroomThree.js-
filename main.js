// main.js - Fixed Three.js Poolrooms Application Entry Point
import * as THREE from 'three';
import { CameraControls } from './camera-controls.js';
import { PoolroomWorld } from './poolroom-world.js';
import { WaterSystem } from './water-system.js';
import { CollectiblesManager } from './collectibles-manager.js';
import { GoldfishSystem } from './goldfish-system.js';

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
        this.goldfishSystem = null;
        
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
            this.poolroomWorld.addSunAndLight();
            
            // Setup camera controls
            this.cameraControls = new CameraControls(
                this.camera,
                this.renderer.domElement,
                this.poolroomWorld.getPoolBottomMesh(),
                this.poolroomWorld.invisibleWalls
            );
            this.cameraControls.init();
            
            // Initialize water system
            this.waterSystem = new WaterSystem(this.scene);
            this.waterSystem.init();
            
            // Initialize collectibles
            this.collectiblesManager = new CollectiblesManager(this.scene);
            this.collectiblesManager.init();

            // Setup lighting controls
            this.setupLightingControls();
            
            // After poolroomWorld is created and pool is initialized
            this.goldfishSystem = new GoldfishSystem(this.scene, this.poolroomWorld.getPoolBounds(), 8);
            
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
        this.camera.position.set(0, 50, 250); // x=0 (center), y=30 (higher above floor), z=250 (back from pool)
        
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
        
        // Animate art gallery shapes
        if (this.poolroomWorld && this.poolroomWorld.updateAnimatedShapes) {
            this.poolroomWorld.updateAnimatedShapes(deltaTime);
        }
        
        // Update SpotLightHelper every frame
        if (this.poolroomWorld && this.poolroomWorld.updatePoolSpotLightHelper) {
            this.poolroomWorld.updatePoolSpotLightHelper();
        }
        
        // Update goldfish system
        if (this.goldfishSystem) this.goldfishSystem.update(deltaTime);
        
        // Update UI
        this.updateUI();
        
        // Render scene
        this.renderer.render(this.scene, this.camera);
    }
    
    updateUI() {
        // Removed status and environment UI update since #status no longer exists
        // Only update collectibles counter
        if (this.collectiblesManager) {
            const collected = this.collectiblesManager.getCollectedCount();
            const total = this.collectiblesManager.getTotalCount();
            document.getElementById('collectibles-counter').textContent = 
                `Collectibles: ${collected}/${total}`;
        }
        // Underwater overlay
        const overlay = document.getElementById('underwater-overlay');
        let isUnderwater = false;
        if (this.cameraControls && typeof this.cameraControls.isInWater === 'function') {
            isUnderwater = this.cameraControls.isInWater();
        } else if (this.camera) {
            isUnderwater = this.camera.position.y < -0.5;
        }
        overlay.style.display = isUnderwater ? 'block' : 'none';
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

    setupLightingControls() {
        const ambientSlider = document.getElementById('ambient-slider');
        const sunSlider = document.getElementById('sun-slider');
        const ambientValue = document.getElementById('ambient-value');
        const sunValue = document.getElementById('sun-value');
        // Ambient
        if (ambientSlider && ambientValue && this.poolroomWorld.ambientLight) {
            ambientSlider.value = this.poolroomWorld.ambientLight.intensity;
            ambientValue.textContent = this.poolroomWorld.ambientLight.intensity.toFixed(2);
            ambientSlider.addEventListener('input', () => {
                this.poolroomWorld.ambientLight.intensity = parseFloat(ambientSlider.value);
                ambientValue.textContent = ambientSlider.value;
            });
        }
        // Sun
        if (sunSlider && sunValue && this.poolroomWorld.sunLight) {
            sunSlider.value = this.poolroomWorld.sunLight.intensity;
            sunValue.textContent = this.poolroomWorld.sunLight.intensity.toFixed(2);
            sunSlider.addEventListener('input', () => {
                this.poolroomWorld.sunLight.intensity = parseFloat(sunSlider.value);
                sunValue.textContent = sunSlider.value;
            });
        }
    }
}

// Initialize application when page loads
const app = new PoolroomsApp();

// Start the application
window.addEventListener('DOMContentLoaded', () => {
    app.init();
});

// Make app available globally for debugging
window.poolroomsApp = app;