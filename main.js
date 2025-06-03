// main.js - Three.js Poolrooms Application Entry Point
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
        // Create scene with no fog for maximum brightness
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xE6F3FF);  // Very light blue-white background
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            75, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            1000
        );
        this.camera.position.set(150, 5, 150); // Start position in the massive poolroom
        
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.LinearToneMapping;  // Change to linear for brighter output
        this.renderer.toneMappingExposure = 2.0;  // Increase exposure for brightness
        
        // Add to DOM
        document.getElementById('canvas-container').appendChild(this.renderer.domElement);
        
        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize(), false);
        
        console.log('🎮 Three.js core initialized');
    }
    
    setupLighting() {
        // EXTREMELY bright ambient light for poolrooms aesthetic
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);  // Very bright white ambient
        this.scene.add(ambientLight);
        
        // Main directional light (sun through ceiling opening) - extremely bright
        const mainLight = new THREE.DirectionalLight(0xffffff, 2.0);
        mainLight.position.set(0, 100, 0);
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 4096;
        mainLight.shadow.mapSize.height = 4096;
        mainLight.shadow.camera.near = 0.1;
        mainLight.shadow.camera.far = 200;
        mainLight.shadow.camera.left = -400;
        mainLight.shadow.camera.right = 400;
        mainLight.shadow.camera.top = 400;
        mainLight.shadow.camera.bottom = -400;
        this.scene.add(mainLight);
        
        // Additional VERY bright lights around the massive room
        const roomLightPositions = [
            [-200, 30, -200],
            [200, 30, -200],
            [-200, 30, 200],
            [200, 30, 200],
            [0, 30, -300],
            [0, 30, 300],
            [-300, 30, 0],
            [300, 30, 0],
            // Extra lights for corners
            [-300, 30, -300],
            [300, 30, -300],
            [-300, 30, 300],
            [300, 30, 300]
        ];
        
        roomLightPositions.forEach(pos => {
            const roomLight = new THREE.DirectionalLight(0xffffff, 0.8);  // Much brighter
            roomLight.position.set(pos[0], pos[1], pos[2]);
            roomLight.target.position.set(0, 0, 0);
            this.scene.add(roomLight);
            this.scene.add(roomLight.target);
        });
        
        // Very bright hemisphere light for overall bright atmosphere
        const hemisphereLight = new THREE.HemisphereLight(0xffffbb, 0x444444, 1.0);  // Much brighter
        this.scene.add(hemisphereLight);
        
        // Add point lights throughout the space for even more brightness
        const pointLightPositions = [
            [0, 20, 0],      // Center above pool
            [-150, 25, -150],
            [150, 25, -150],
            [-150, 25, 150],
            [150, 25, 150],
            [0, 25, -200],
            [0, 25, 200],
            [-200, 25, 0],
            [200, 25, 0]
        ];
        
        pointLightPositions.forEach(pos => {
            const pointLight = new THREE.PointLight(0xffffff, 0.8, 300);
            pointLight.position.set(pos[0], pos[1], pos[2]);
            this.scene.add(pointLight);
        });
        
        console.log('💡 VERY bright poolrooms lighting system initialized');
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
        const isInWater = pos.y < 0 && Math.abs(pos.x) < 45 && Math.abs(pos.z) < 45;
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