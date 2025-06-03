// poolroom-world.js - Simple Basic Poolroom Layout (LARGER)
export class PoolroomWorld {
    constructor(scene) {
        this.scene = scene;
        this.materials = {};
        
        // Just make everything bigger
        this.roomSize = 960;          // Double the size (480 * 2)
        this.wallHeight = 150;        // Keep height the same
        this.poolWidth = 480;         // Double the pool (240 * 2)
        this.poolDepth = 480;
        this.poolDepthValue = 20;     // Much deeper pool
        this.openingSize = 240;       // Double the opening (120 * 2)
        
        // Simple groups
        this.architectureGroup = new THREE.Group();
        this.poolGroup = new THREE.Group();
        
        scene.add(this.architectureGroup);
        scene.add(this.poolGroup);
    }
    
    async init() {
        console.log('🏗️ Creating basic poolroom...');
        
        await this.loadTextures(); // Load textures first
        this.createTexturedMaterials();
        this.createBasicFloor();
        this.createBasicWalls();
        this.createBasicCeiling();
        this.createBasicPool();
        this.createBasicPillars();
        this.createWallOpenings();
        
        console.log('✅ Basic poolroom complete');
    }
    
    async loadTextures() {
        this.textureLoader = new THREE.TextureLoader();
        this.textures = {};
        
        try {
            console.log('🔄 Loading textures...');
            
            // Load end stone bricks for walls/floors/ceilings
            this.textures.endStoneBricks = await new Promise((resolve, reject) => {
                this.textureLoader.load(
                    'textures/end_stone_bricks.png',
                    (texture) => {
                        console.log('✅ End stone bricks loaded');
                        console.log('Texture dimensions:', texture.image.width, 'x', texture.image.height);
                        resolve(texture);
                    },
                    undefined,
                    (error) => {
                        console.warn('❌ Failed to load end_stone_bricks.png:', error);
                        reject(error);
                    }
                );
            });
            
            // Load dark prismarine for pillars
            this.textures.darkPrismarine = await new Promise((resolve, reject) => {
                this.textureLoader.load(
                    'textures/dark_prismarine.png',
                    (texture) => {
                        console.log('✅ Dark prismarine loaded');
                        console.log('Texture dimensions:', texture.image.width, 'x', texture.image.height);
                        resolve(texture);
                    },
                    undefined,
                    (error) => {
                        console.warn('❌ Failed to load dark_prismarine.png:', error);
                        reject(error);
                    }
                );
            });
            
            // Configure textures properly
            Object.values(this.textures).forEach(texture => {
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.magFilter = THREE.LinearFilter; // Try linear instead of nearest
                texture.minFilter = THREE.LinearMipMapLinearFilter;
                texture.generateMipmaps = true;
                texture.needsUpdate = true; // Force update
            });
            
            console.log('✅ All textures loaded and configured successfully');
            
        } catch (error) {
            console.warn('⚠️ Could not load textures, using fallback colors:', error);
            this.textures = null;
        }
    }
    
    createTexturedMaterials() {
        // Go back to the grid texture that was working
        const createFloorTiles = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 512;  // High resolution
            canvas.height = 512;
            const ctx = canvas.getContext('2d');
            
            // Fill with white base
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, 512, 512);
            
            // Draw a grid of tiles - 16x16 tiles = 32px per tile
            const tilesPerSide = 16;
            const tileSize = 512 / tilesPerSide; // 32px per tile
            
            ctx.strokeStyle = '#cccccc';
            ctx.lineWidth = 2;
            
            // Draw vertical lines
            for (let i = 0; i <= tilesPerSide; i++) {
                const x = i * tileSize;
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, 512);
                ctx.stroke();
            }
            
            // Draw horizontal lines
            for (let i = 0; i <= tilesPerSide; i++) {
                const y = i * tileSize;
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(512, y);
                ctx.stroke();
            }
            
            const texture = new THREE.CanvasTexture(canvas);
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.magFilter = THREE.LinearFilter;
            texture.minFilter = THREE.LinearFilter;
            return texture;
        };
        
        const floorTexture = createFloorTiles();
        
        if (this.textures) {
            // Pillar texture (keep as is)
            const pillarTexture = this.textures.darkPrismarine.clone();
            pillarTexture.repeat.set(2, 8);
            pillarTexture.wrapS = THREE.RepeatWrapping;
            pillarTexture.wrapT = THREE.RepeatWrapping;
            pillarTexture.magFilter = THREE.LinearFilter;
            pillarTexture.minFilter = THREE.LinearMipMapLinearFilter;
            pillarTexture.generateMipmaps = true;
            pillarTexture.needsUpdate = true;
            
            this.materials = {
                // Floor material with single tile texture
                floor: new THREE.MeshPhongMaterial({
                    map: floorTexture,
                    shininess: 30
                }),
                
                // Simple colors for everything else
                wall: new THREE.MeshPhongMaterial({
                    color: 0xf0f0f0,
                    shininess: 30
                }),
                
                ceiling: new THREE.MeshPhongMaterial({
                    color: 0xf0f0f0,
                    shininess: 30
                }),
                
                pool: new THREE.MeshPhongMaterial({
                    color: 0xb0d0ff,
                    shininess: 100
                }),
                
                pillar: new THREE.MeshPhongMaterial({
                    map: pillarTexture,
                    shininess: 50
                })
            };
            
            console.log('Single tile texture created for perfect repeating');
        } else {
            this.createBasicMaterials();
        }
    }
    
    createBasicMaterials() {
        this.materials = {
            // Light cream floor
            floor: new THREE.MeshLambertMaterial({
                color: 0xf5f5f0
            }),
            
            // Light walls
            wall: new THREE.MeshLambertMaterial({
                color: 0xe8e8e8
            }),
            
            // Pool blue
            pool: new THREE.MeshLambertMaterial({
                color: 0xb0d0ff
            }),
            
            // Gray pillars
            pillar: new THREE.MeshLambertMaterial({
                color: 0xd0d0d0
            })
        };
    }
    
    createBasicFloor() {
        // Create 4 sections with very small tiles
        const roomSize = this.roomSize;
        const poolSize = this.poolWidth;
        
        // Create a simple tile texture - just a white square with black border
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        
        // White tile
        ctx.fillStyle = '#f5f5f0';
        ctx.fillRect(0, 0, 32, 32);
        
        // Thin black border
        ctx.strokeStyle = '#cccccc';
        ctx.lineWidth = 1;
        ctx.strokeRect(0, 0, 32, 32);
        
        const tileTexture = new THREE.CanvasTexture(canvas);
        tileTexture.wrapS = THREE.RepeatWrapping;
        tileTexture.wrapT = THREE.RepeatWrapping;
        tileTexture.magFilter = THREE.NearestFilter;
        tileTexture.minFilter = THREE.NearestFilter;
        
        // Calculate section dimensions
        const sideWidth = (roomSize - poolSize) / 2;
        
        // Much smaller tiles - 2.5 world units per tile
        const tileSize = 2.5;
        
        const floorSections = [
            // North section (960 x 240)
            { 
                geometry: new THREE.PlaneGeometry(roomSize, sideWidth),
                position: [0, 0, -(poolSize/2 + sideWidth/2)],
                repeatX: roomSize / tileSize,  // 384 tiles
                repeatY: sideWidth / tileSize  // 96 tiles
            },
            // South section (960 x 240)
            { 
                geometry: new THREE.PlaneGeometry(roomSize, sideWidth),
                position: [0, 0, poolSize/2 + sideWidth/2],
                repeatX: roomSize / tileSize,  // 384 tiles
                repeatY: sideWidth / tileSize  // 96 tiles
            },
            // East section (240 x 480)
            { 
                geometry: new THREE.PlaneGeometry(sideWidth, poolSize),
                position: [poolSize/2 + sideWidth/2, 0, 0],
                repeatX: sideWidth / tileSize, // 96 tiles
                repeatY: poolSize / tileSize   // 192 tiles
            },
            // West section (240 x 480)
            { 
                geometry: new THREE.PlaneGeometry(sideWidth, poolSize),
                position: [-(poolSize/2 + sideWidth/2), 0, 0],
                repeatX: sideWidth / tileSize, // 96 tiles
                repeatY: poolSize / tileSize   // 192 tiles
            }
        ];
        
        floorSections.forEach((section, index) => {
            const material = new THREE.MeshLambertMaterial({
                map: tileTexture.clone()
            });
            
            const floor = new THREE.Mesh(section.geometry, material);
            floor.rotation.x = -Math.PI / 2;
            floor.position.set(...section.position);
            
            // Set the repeat based on section dimensions
            floor.material.map.repeat.set(section.repeatX, section.repeatY);
            floor.material.map.needsUpdate = true;
            
            this.architectureGroup.add(floor);
        });
        
        console.log('Floor with tiny 2.5x2.5 tiles created');
    }
    
    createBasicWalls() {
        // Four simple walls
        const wallHeight = this.wallHeight;
        const roomSize = this.roomSize;
        
        // North wall
        const northWall = new THREE.Mesh(
            new THREE.PlaneGeometry(roomSize, wallHeight),
            this.materials.wall
        );
        northWall.position.set(0, wallHeight/2, -roomSize/2);
        this.architectureGroup.add(northWall);
        
        // South wall
        const southWall = new THREE.Mesh(
            new THREE.PlaneGeometry(roomSize, wallHeight),
            this.materials.wall
        );
        southWall.position.set(0, wallHeight/2, roomSize/2);
        southWall.rotation.y = Math.PI;
        this.architectureGroup.add(southWall);
        
        // East wall
        const eastWall = new THREE.Mesh(
            new THREE.PlaneGeometry(roomSize, wallHeight),
            this.materials.wall
        );
        eastWall.position.set(roomSize/2, wallHeight/2, 0);
        eastWall.rotation.y = -Math.PI/2;
        this.architectureGroup.add(eastWall);
        
        // West wall
        const westWall = new THREE.Mesh(
            new THREE.PlaneGeometry(roomSize, wallHeight),
            this.materials.wall
        );
        westWall.position.set(-roomSize/2, wallHeight/2, 0);
        westWall.rotation.y = Math.PI/2;
        this.architectureGroup.add(westWall);
        
        console.log('Basic walls created');
    }
    
    createBasicCeiling() {
        // Simple ceiling with square opening in center
        const ceilingY = this.wallHeight;
        const openingSize = this.openingSize;
        const roomSize = this.roomSize;
        
        // Four ceiling sections around the opening
        
        // North section
        const northCeiling = new THREE.Mesh(
            new THREE.PlaneGeometry(roomSize, (roomSize - openingSize) / 2),
            this.materials.wall
        );
        northCeiling.rotation.x = Math.PI / 2;
        northCeiling.position.set(0, ceilingY, -roomSize/4 - openingSize/4);
        this.architectureGroup.add(northCeiling);
        
        // South section
        const southCeiling = new THREE.Mesh(
            new THREE.PlaneGeometry(roomSize, (roomSize - openingSize) / 2),
            this.materials.wall
        );
        southCeiling.rotation.x = Math.PI / 2;
        southCeiling.position.set(0, ceilingY, roomSize/4 + openingSize/4);
        this.architectureGroup.add(southCeiling);
        
        // East section
        const eastCeiling = new THREE.Mesh(
            new THREE.PlaneGeometry((roomSize - openingSize) / 2, openingSize),
            this.materials.wall
        );
        eastCeiling.rotation.x = Math.PI / 2;
        eastCeiling.position.set(roomSize/4 + openingSize/4, ceilingY, 0);
        this.architectureGroup.add(eastCeiling);
        
        // West section
        const westCeiling = new THREE.Mesh(
            new THREE.PlaneGeometry((roomSize - openingSize) / 2, openingSize),
            this.materials.wall
        );
        westCeiling.rotation.x = Math.PI / 2;
        westCeiling.position.set(-roomSize/4 - openingSize/4, ceilingY, 0);
        this.architectureGroup.add(westCeiling);
        
        console.log('Basic ceiling with opening created');
    }
    
    createBasicPool() {
        // Pool that's recessed into the floor
        
        // Pool floor (deeper)
        const poolFloor = new THREE.Mesh(
            new THREE.PlaneGeometry(this.poolWidth, this.poolDepth),
            this.materials.pool
        );
        poolFloor.rotation.x = -Math.PI / 2;
        poolFloor.position.y = -this.poolDepthValue;
        this.poolGroup.add(poolFloor);
        
        // Pool walls - these go from floor level down to pool floor
        const poolWallHeight = this.poolDepthValue;
        
        // North pool wall
        const northPoolWall = new THREE.Mesh(
            new THREE.PlaneGeometry(this.poolWidth, poolWallHeight),
            this.materials.pool
        );
        northPoolWall.position.set(0, -poolWallHeight/2, -this.poolDepth/2);
        this.poolGroup.add(northPoolWall);
        
        // South pool wall
        const southPoolWall = new THREE.Mesh(
            new THREE.PlaneGeometry(this.poolWidth, poolWallHeight),
            this.materials.pool
        );
        southPoolWall.position.set(0, -poolWallHeight/2, this.poolDepth/2);
        southPoolWall.rotation.y = Math.PI;
        this.poolGroup.add(southPoolWall);
        
        // East pool wall
        const eastPoolWall = new THREE.Mesh(
            new THREE.PlaneGeometry(this.poolDepth, poolWallHeight),
            this.materials.pool
        );
        eastPoolWall.position.set(this.poolWidth/2, -poolWallHeight/2, 0);
        eastPoolWall.rotation.y = -Math.PI/2;
        this.poolGroup.add(eastPoolWall);
        
        // West pool wall
        const westPoolWall = new THREE.Mesh(
            new THREE.PlaneGeometry(this.poolDepth, poolWallHeight),
            this.materials.pool
        );
        westPoolWall.position.set(-this.poolWidth/2, -poolWallHeight/2, 0);
        westPoolWall.rotation.y = Math.PI/2;
        this.poolGroup.add(westPoolWall);
        
        // Add pool edge/coping around the rim
        const edgeHeight = 0.2;
        const edgeWidth = 2;
        
        // Create raised edges around pool at floor level
        const edges = [
            { pos: [0, edgeHeight/2, -this.poolDepth/2 - edgeWidth/2], size: [this.poolWidth + edgeWidth*2, edgeHeight, edgeWidth] },
            { pos: [0, edgeHeight/2, this.poolDepth/2 + edgeWidth/2], size: [this.poolWidth + edgeWidth*2, edgeHeight, edgeWidth] },
            { pos: [this.poolWidth/2 + edgeWidth/2, edgeHeight/2, 0], size: [edgeWidth, edgeHeight, this.poolDepth] },
            { pos: [-this.poolWidth/2 - edgeWidth/2, edgeHeight/2, 0], size: [edgeWidth, edgeHeight, this.poolDepth] }
        ];
        
        edges.forEach(edge => {
            const edgeGeometry = new THREE.BoxGeometry(...edge.size);
            const edgeMesh = new THREE.Mesh(edgeGeometry, this.materials.floor);
            edgeMesh.position.set(...edge.pos);
            this.poolGroup.add(edgeMesh);
        });
        
        console.log('Visible recessed pool created');
    }
    
    createBasicPillars() {
        // Thicker pillars that go all the way down through the pool
        const pillarRadius = 8;
        const pillarHeight = this.wallHeight + this.poolDepthValue; // Extend below pool floor
        
        // Pillar positions scaled up for larger room
        const positions = [
            [-180, 0, -180],  // Was -90, now -180
            [180, 0, -180],   // Was 90, now 180
            [-180, 0, 180],
            [180, 0, 180]
        ];
        
        positions.forEach(pos => {
            const pillar = new THREE.Mesh(
                new THREE.CylinderGeometry(pillarRadius, pillarRadius, pillarHeight, 12),
                this.materials.pillar
            );
            // Position so pillar goes from pool floor up to ceiling
            pillar.position.set(pos[0], (pillarHeight/2) - this.poolDepthValue, pos[2]);
            this.architectureGroup.add(pillar);
        });
        
        console.log('Full-height pillars created (floor to ceiling through pool)');
    }
    
    createWallOpenings() {
        // Wall openings scaled up for larger room
        const openingWidth = 80;      // Was 40, now 80
        const openingSpacing = 160;   // Was 80, now 160
        const wallHeight = this.wallHeight;
        const roomSize = this.roomSize;
        
        // Material for opening frames
        const frameMaterial = new THREE.MeshLambertMaterial({
            color: 0xc0c0c0
        });
        
        // Sky material for openings
        const skyMaterial = new THREE.MeshBasicMaterial({
            color: 0x87ceeb,
            transparent: true,
            opacity: 0.7
        });
        
        // Create openings on each wall
        const wallConfigs = [
            { wall: 'north', basePos: [0, 0, -roomSize/2 + 2], direction: 'x' },
            { wall: 'south', basePos: [0, 0, roomSize/2 - 2], direction: 'x' },
            { wall: 'east', basePos: [roomSize/2 - 2, 0, 0], direction: 'z' },
            { wall: 'west', basePos: [-roomSize/2 + 2, 0, 0], direction: 'z' }
        ];
        
        wallConfigs.forEach(config => {
            // Create 3 openings per wall
            for (let i = -1; i <= 1; i++) {
                const openingGroup = new THREE.Group();
                
                // Opening frame
                const frameGeometry = new THREE.PlaneGeometry(openingWidth + 4, wallHeight);
                const frame = new THREE.Mesh(frameGeometry, frameMaterial);
                
                // Sky view through opening
                const skyGeometry = new THREE.PlaneGeometry(openingWidth, wallHeight);
                const sky = new THREE.Mesh(skyGeometry, skyMaterial);
                sky.position.z = 0.1;
                
                openingGroup.add(frame);
                openingGroup.add(sky);
                
                // Position the opening
                if (config.direction === 'x') {
                    openingGroup.position.set(i * openingSpacing, wallHeight/2, config.basePos[2]);
                    if (config.wall === 'south') openingGroup.rotation.y = Math.PI;
                } else {
                    openingGroup.position.set(config.basePos[0], wallHeight/2, i * openingSpacing);
                    if (config.wall === 'east') openingGroup.rotation.y = -Math.PI/2;
                    if (config.wall === 'west') openingGroup.rotation.y = Math.PI/2;
                }
                
                this.architectureGroup.add(openingGroup);
            }
        });
        
        console.log('Floor-to-ceiling wall openings created');
    }
    
    // Simple getters
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
}