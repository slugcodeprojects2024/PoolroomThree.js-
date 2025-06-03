// poolroom-world.js - Poolroom Architecture Generation
export class PoolroomWorld {
    constructor(scene) {
        this.scene = scene;
        this.textureLoader = new THREE.TextureLoader();
        this.materials = {};
        
        // Architecture dimensions - MASSIVE scale for proper poolrooms feel
        this.roomSize = 800;          // Much larger room
        this.wallHeight = 40;         // Taller ceilings
        this.poolWidth = 400;         // Huge pool
        this.poolDepth = 400;
        this.poolDepthValue = 20;     // Deeper pool
        this.openingSize = 200;       // Larger ceiling opening
        
        // Components
        this.architectureGroup = new THREE.Group();
        this.poolGroup = new THREE.Group();
        this.pillarGroup = new THREE.Group();
        
        scene.add(this.architectureGroup);
        scene.add(this.poolGroup);
        scene.add(this.pillarGroup);
    }
    
    async init() {
        console.log('🏗️ Initializing poolroom world architecture...');
        
        try {
            // Skip textures for now - use solid colors
            this.createMaterialsWithoutTextures();
            
            // Build architecture
            this.createMainStructure();
            this.createMainPool();
            this.createPillars();
            this.createCornerStaircases();
            this.createSkybox();
            
            console.log('✅ Poolroom world architecture complete');
            
        } catch (error) {
            console.error('❌ Failed to create poolroom world:', error);
            throw error;
        }
    }
    
    async loadTextures() {
        const texturePaths = {
            brick: 'textures/end_stone_bricks.png'
        };
        
        this.textures = {};
        
        for (const [name, path] of Object.entries(texturePaths)) {
            try {
                this.textures[name] = await new Promise((resolve, reject) => {
                    this.textureLoader.load(path, resolve, undefined, () => {
                        console.log(`Texture ${path} not found, creating fallback`);
                        resolve(this.createFallbackTexture());
                    });
                });
                
                // Configure texture
                this.textures[name].wrapS = THREE.RepeatWrapping;
                this.textures[name].wrapT = THREE.RepeatWrapping;
                
            } catch (error) {
                console.log(`Creating fallback for ${name}`);
                this.textures[name] = this.createFallbackTexture();
            }
        }
        
        console.log('📦 Textures loaded');
    }
    
    createFallbackTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        
        // Create brick pattern similar to end_stone_bricks
        ctx.fillStyle = '#e8e8d8';
        ctx.fillRect(0, 0, 64, 64);
        
        // Add subtle brick lines
        ctx.strokeStyle = '#d0d0c8';
        ctx.lineWidth = 1;
        
        // Horizontal lines
        for (let y = 0; y < 64; y += 16) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(64, y);
            ctx.stroke();
        }
        
        // Vertical lines (offset every other row)
        for (let x = 0; x < 64; x += 16) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, 16);
            ctx.moveTo(x + 8, 16);
            ctx.lineTo(x + 8, 32);
            ctx.moveTo(x, 32);
            ctx.lineTo(x, 48);
            ctx.moveTo(x + 8, 48);
            ctx.lineTo(x + 8, 64);
            ctx.stroke();
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }
    
    createMaterialsWithoutTextures() {
        // Wall material - bright white without texture
        this.materials.wall = new THREE.MeshPhongMaterial({
            color: 0xffffff,  // Pure white
            side: THREE.DoubleSide,
            shininess: 30,
            specular: 0x111111
        });
        
        // Floor material - light gray
        this.materials.floor = new THREE.MeshPhongMaterial({
            color: 0xf0f0f0,  // Light gray
            shininess: 50,
            specular: 0x222222
        });
        
        // Pool material - light blue-gray
        this.materials.pool = new THREE.MeshPhongMaterial({
            color: 0xe0e8f0,  // Light blue-gray
            side: THREE.DoubleSide,
            shininess: 60,
            specular: 0x333333
        });
        
        // Window material - bright blue sky
        this.materials.window = new THREE.MeshBasicMaterial({
            color: 0x87CEEB,
            transparent: true,
            opacity: 0.7
        });
        
        console.log('🎨 Simple materials created (no textures)');
    }
    
    createMainStructure() {
        // Simple bright floor
        const floorGeometry = new THREE.PlaneGeometry(this.roomSize, this.roomSize);
        const floor = new THREE.Mesh(floorGeometry, this.materials.floor);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = 0;
        floor.receiveShadow = true;
        this.architectureGroup.add(floor);
        
        // Create simple visible walls
        this.createSimpleWalls();
        
        // Create simple ceiling with opening
        this.createSimpleCeiling();
        
        console.log('🏢 Simple structure created');
    }
    
    createSimpleWalls() {
        // Bright colored walls for visibility
        const wallMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        
        // North wall (red tint for identification)
        const northWall = new THREE.Mesh(
            new THREE.PlaneGeometry(this.roomSize, this.wallHeight),
            new THREE.MeshBasicMaterial({ color: 0xffcccc })
        );
        northWall.position.set(0, this.wallHeight/2, -this.roomSize/2);
        this.architectureGroup.add(northWall);
        
        // South wall (green tint)
        const southWall = new THREE.Mesh(
            new THREE.PlaneGeometry(this.roomSize, this.wallHeight),
            new THREE.MeshBasicMaterial({ color: 0xccffcc })
        );
        southWall.position.set(0, this.wallHeight/2, this.roomSize/2);
        southWall.rotation.y = Math.PI;
        this.architectureGroup.add(southWall);
        
        // East wall (blue tint)
        const eastWall = new THREE.Mesh(
            new THREE.PlaneGeometry(this.roomSize, this.wallHeight),
            new THREE.MeshBasicMaterial({ color: 0xccccff })
        );
        eastWall.position.set(this.roomSize/2, this.wallHeight/2, 0);
        eastWall.rotation.y = -Math.PI/2;
        this.architectureGroup.add(eastWall);
        
        // West wall (yellow tint)
        const westWall = new THREE.Mesh(
            new THREE.PlaneGeometry(this.roomSize, this.wallHeight),
            new THREE.MeshBasicMaterial({ color: 0xffffcc })
        );
        westWall.position.set(-this.roomSize/2, this.wallHeight/2, 0);
        westWall.rotation.y = Math.PI/2;
        this.architectureGroup.add(westWall);
    }
    
    createSimpleCeiling() {
        // Simple ceiling with opening
        const ceilingMaterial = new THREE.MeshBasicMaterial({ color: 0xf0f0f0 });
        const openingSize = this.openingSize;
        
        // North ceiling section
        const northCeiling = new THREE.Mesh(
            new THREE.PlaneGeometry(this.roomSize, (this.roomSize - openingSize) / 2),
            ceilingMaterial
        );
        northCeiling.rotation.x = Math.PI / 2;
        northCeiling.position.set(0, this.wallHeight, -this.roomSize/4 - openingSize/4);
        this.architectureGroup.add(northCeiling);
        
        // South ceiling section
        const southCeiling = new THREE.Mesh(
            new THREE.PlaneGeometry(this.roomSize, (this.roomSize - openingSize) / 2),
            ceilingMaterial
        );
        southCeiling.rotation.x = Math.PI / 2;
        southCeiling.position.set(0, this.wallHeight, this.roomSize/4 + openingSize/4);
        this.architectureGroup.add(southCeiling);
        
        // East ceiling section
        const eastCeiling = new THREE.Mesh(
            new THREE.PlaneGeometry((this.roomSize - openingSize) / 2, openingSize),
            ceilingMaterial
        );
        eastCeiling.rotation.x = Math.PI / 2;
        eastCeiling.position.set(this.roomSize/4 + openingSize/4, this.wallHeight, 0);
        this.architectureGroup.add(eastCeiling);
        
        // West ceiling section
        const westCeiling = new THREE.Mesh(
            new THREE.PlaneGeometry((this.roomSize - openingSize) / 2, openingSize),
            ceilingMaterial
        );
        westCeiling.rotation.x = Math.PI / 2;
        westCeiling.position.set(-this.roomSize/4 - openingSize/4, this.wallHeight, 0);
        this.architectureGroup.add(westCeiling);
    }
    
    createWindows() {
        const windowWidth = 80;      // Much larger windows for massive scale
        const windowSpacing = 120;   // More spacing for larger room
        
        // Windows on north and south walls
        for (let x = -this.roomSize/2 + windowSpacing; x < this.roomSize/2; x += windowSpacing) {
            // North windows
            const northWindow = new THREE.Mesh(
                new THREE.PlaneGeometry(windowWidth, this.wallHeight * 0.8),
                this.materials.window
            );
            northWindow.position.set(x, this.wallHeight/2, -this.roomSize/2 + 0.1);
            this.architectureGroup.add(northWindow);
            
            // South windows
            const southWindow = new THREE.Mesh(
                new THREE.PlaneGeometry(windowWidth, this.wallHeight * 0.8),
                this.materials.window
            );
            southWindow.position.set(x, this.wallHeight/2, this.roomSize/2 - 0.1);
            southWindow.rotation.y = Math.PI;
            this.architectureGroup.add(southWindow);
        }
        
        // Windows on east and west walls
        for (let z = -this.roomSize/2 + windowSpacing; z < this.roomSize/2; z += windowSpacing) {
            // East windows
            const eastWindow = new THREE.Mesh(
                new THREE.PlaneGeometry(windowWidth, this.wallHeight * 0.8),
                this.materials.window
            );
            eastWindow.position.set(this.roomSize/2 - 0.1, this.wallHeight/2, z);
            eastWindow.rotation.y = -Math.PI/2;
            this.architectureGroup.add(eastWindow);
            
            // West windows
            const westWindow = new THREE.Mesh(
                new THREE.PlaneGeometry(windowWidth, this.wallHeight * 0.8),
                this.materials.window
            );
            westWindow.position.set(-this.roomSize/2 + 0.1, this.wallHeight/2, z);
            westWindow.rotation.y = Math.PI/2;
            this.architectureGroup.add(westWindow);
        }
    }
    
    createCeilingWithOpening() {
        const ceilingY = this.wallHeight;
        
        // Create ceiling in sections around the opening
        const sections = [
            // North section
            { 
                width: this.roomSize, 
                depth: (this.roomSize - this.openingSize) / 2,
                x: 0, 
                z: -this.roomSize/2 + (this.roomSize - this.openingSize) / 4 
            },
            // South section
            { 
                width: this.roomSize, 
                depth: (this.roomSize - this.openingSize) / 2,
                x: 0, 
                z: this.roomSize/2 - (this.roomSize - this.openingSize) / 4 
            },
            // East section (middle strip)
            { 
                width: (this.roomSize - this.openingSize) / 2, 
                depth: this.openingSize,
                x: this.roomSize/2 - (this.roomSize - this.openingSize) / 4, 
                z: 0 
            },
            // West section (middle strip)
            { 
                width: (this.roomSize - this.openingSize) / 2, 
                depth: this.openingSize,
                x: -this.roomSize/2 + (this.roomSize - this.openingSize) / 4, 
                z: 0 
            }
        ];
        
        sections.forEach(section => {
            const ceilingGeo = new THREE.PlaneGeometry(section.width, section.depth);
            const ceiling = new THREE.Mesh(ceilingGeo, this.materials.wall);
            ceiling.rotation.x = Math.PI / 2;
            ceiling.position.set(section.x, ceilingY, section.z);
            ceiling.receiveShadow = true;
            this.architectureGroup.add(ceiling);
        });
    }
    
    createMainPool() {
        // Simple visible pool
        const poolMaterial = new THREE.MeshBasicMaterial({ color: 0x0099ff });
        
        // Pool floor (bright blue)
        const poolFloor = new THREE.Mesh(
            new THREE.PlaneGeometry(this.poolWidth, this.poolDepth),
            new THREE.MeshBasicMaterial({ color: 0x0066cc })
        );
        poolFloor.rotation.x = -Math.PI / 2;
        poolFloor.position.y = -this.poolDepthValue;
        this.poolGroup.add(poolFloor);
        
        // Pool walls (visible boundaries)
        const poolWallHeight = this.poolDepthValue;
        
        // North pool wall
        const northPoolWall = new THREE.Mesh(
            new THREE.PlaneGeometry(this.poolWidth, poolWallHeight),
            new THREE.MeshBasicMaterial({ color: 0x0088dd })
        );
        northPoolWall.position.set(0, -poolWallHeight/2, -this.poolDepth/2);
        this.poolGroup.add(northPoolWall);
        
        // South pool wall
        const southPoolWall = new THREE.Mesh(
            new THREE.PlaneGeometry(this.poolWidth, poolWallHeight),
            new THREE.MeshBasicMaterial({ color: 0x0088dd })
        );
        southPoolWall.position.set(0, -poolWallHeight/2, this.poolDepth/2);
        southPoolWall.rotation.y = Math.PI;
        this.poolGroup.add(southPoolWall);
        
        // East pool wall
        const eastPoolWall = new THREE.Mesh(
            new THREE.PlaneGeometry(this.poolDepth, poolWallHeight),
            new THREE.MeshBasicMaterial({ color: 0x0088dd })
        );
        eastPoolWall.position.set(this.poolWidth/2, -poolWallHeight/2, 0);
        eastPoolWall.rotation.y = -Math.PI/2;
        this.poolGroup.add(eastPoolWall);
        
        // West pool wall
        const westPoolWall = new THREE.Mesh(
            new THREE.PlaneGeometry(this.poolDepth, poolWallHeight),
            new THREE.MeshBasicMaterial({ color: 0x0088dd })
        );
        westPoolWall.position.set(-this.poolWidth/2, -poolWallHeight/2, 0);
        westPoolWall.rotation.y = Math.PI/2;
        this.poolGroup.add(westPoolWall);
        
        console.log('🏊‍♂️ Simple visible pool created');
    }
    
    createPoolSteps() {
        const stepCount = 8;
        const stepWidth = 20;
        const stepDepth = 3;
        const stepHeight = this.poolDepthValue / stepCount;
        
        // Create steps on north side
        for (let i = 0; i < stepCount; i++) {
            const stepGeo = new THREE.BoxGeometry(stepWidth, stepHeight, stepDepth);
            const step = new THREE.Mesh(stepGeo, this.materials.pool);
            step.position.set(
                0, 
                -stepHeight * (i + 0.5), 
                -this.poolDepth/2 + stepDepth * (i + 0.5)
            );
            this.poolGroup.add(step);
        }
    }
    
    createPillars() {
        const pillarHeight = this.wallHeight;
        const pillarRadius = 6;
        
        // Just a few visible pillars for now
        const positions = [
            [-100, 0, -100],
            [100, 0, -100], 
            [-100, 0, 100],
            [100, 0, 100],
            [0, 0, -120],
            [0, 0, 120]
        ];
        
        positions.forEach(pos => {
            const pillar = new THREE.Mesh(
                new THREE.CylinderGeometry(pillarRadius, pillarRadius, pillarHeight, 16),
                new THREE.MeshBasicMaterial({ color: 0xdddddd })
            );
            pillar.position.set(pos[0], pillarHeight/2, pos[2]);
            this.pillarGroup.add(pillar);
        });
        
        console.log('🏛️ Simple pillars created');
    }
    
    createCornerStaircases() {
        // This will be implemented in Phase 2
        // For now, just log that this feature is planned
        console.log('🔄 Corner staircases planned for Phase 2');
    }
    
    createSkybox() {
        // Bright poolrooms skybox - endless bright sky
        const skyGeometry = new THREE.SphereGeometry(2000, 32, 32);
        const skyMaterial = new THREE.MeshBasicMaterial({
            color: 0xE6F3FF,  // Very light blue-white sky
            side: THREE.BackSide,
            fog: false
        });
        const skybox = new THREE.Mesh(skyGeometry, skyMaterial);
        this.scene.add(skybox);
        
        console.log('🌌 Bright poolrooms skybox created');
    }
    
    // Public methods for other systems to interact with the world
    getPoolBounds() {
        return {
            width: this.poolWidth,
            depth: this.poolDepth,
            depthValue: this.poolDepthValue,
            waterLevel: -0.5
        };
    }
    
    getRoomBounds() {
        return {
            size: this.roomSize,
            height: this.wallHeight
        };
    }
    
    // Method to add objects to specific groups
    addToArchitecture(object) {
        this.architectureGroup.add(object);
    }
    
    addToPool(object) {
        this.poolGroup.add(object);
    }
    
    addToPillars(object) {
        this.pillarGroup.add(object);
    }
}