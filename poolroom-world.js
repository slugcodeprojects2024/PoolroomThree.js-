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
        this.stairsGroup = new THREE.Group();  // NEW: Just add stairs group
        
        scene.add(this.architectureGroup);
        scene.add(this.poolGroup);
        scene.add(this.stairsGroup);  // NEW: Add to scene
    }
    
    async init() {
        console.log('🏗️ Creating basic poolroom...');
        
        await this.loadTextures(); // Load textures first
        this.createTexturedMaterials();
        this.createBasicSkybox();      // Add skybox early
        this.createBasicFloor();
        this.createBasicWalls();
        this.createBasicCeiling();
        this.createBasicPool();
        this.createBasicPillars();
        this.createWallOpenings();
        
        // NEW: Just add stairs
        this.createCornerStaircases();
        
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
                }),
                
                // NEW: Just add stair material
                stair: new THREE.MeshPhongMaterial({
                    color: 0xe0e0e0,
                    shininess: 40
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
            }),
            
            // NEW: Just add stair material
            stair: new THREE.MeshLambertMaterial({
                color: 0xe0e0e0
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
        // Create a simple tile texture - just a white square with black border
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        
        // White tile - EXACT SAME AS FLOOR
        ctx.fillStyle = '#f5f5f0';
        ctx.fillRect(0, 0, 32, 32);
        
        // Thin black border - EXACT SAME AS FLOOR
        ctx.strokeStyle = '#cccccc';
        ctx.lineWidth = 1;
        ctx.strokeRect(0, 0, 32, 32);
        
        const tileTexture = new THREE.CanvasTexture(canvas);
        tileTexture.wrapS = THREE.RepeatWrapping;
        tileTexture.wrapT = THREE.RepeatWrapping;
        tileTexture.magFilter = THREE.NearestFilter;
        tileTexture.minFilter = THREE.NearestFilter;
        
        const roomSize = this.roomSize;
        const wallHeight = this.wallHeight;
        const tileSize = 2.5; // Same as floor tiles
        
        // Create 4 walls - move them closer to room center to fix collision
        const wallOffset = 2; // Move walls 2 units inward
        const walls = [
            // North wall
            {
                geometry: new THREE.PlaneGeometry(roomSize, wallHeight),
                position: [0, wallHeight/2, -roomSize/2 + wallOffset],
                rotation: [0, 0, 0]
            },
            // South wall  
            {
                geometry: new THREE.PlaneGeometry(roomSize, wallHeight),
                position: [0, wallHeight/2, roomSize/2 - wallOffset],
                rotation: [0, Math.PI, 0]
            },
            // East wall
            {
                geometry: new THREE.PlaneGeometry(roomSize, wallHeight),
                position: [roomSize/2 - wallOffset, wallHeight/2, 0],
                rotation: [0, -Math.PI/2, 0]
            },
            // West wall
            {
                geometry: new THREE.PlaneGeometry(roomSize, wallHeight),
                position: [-roomSize/2 + wallOffset, wallHeight/2, 0],
                rotation: [0, Math.PI/2, 0]
            }
        ];
        
        walls.forEach((wallData, index) => {
            // Same material as floor but with moderate emissive 
            const material = new THREE.MeshLambertMaterial({
                map: tileTexture.clone(),
                emissive: 0x606060  // Middle ground between 0x404040 and 0x808080
            });
            
            const wall = new THREE.Mesh(wallData.geometry, material);
            wall.position.set(...wallData.position);
            wall.rotation.set(...wallData.rotation);
            
            // Set tile repeat for walls
            const repeatX = roomSize / tileSize;
            const repeatY = wallHeight / tileSize;
            
            wall.material.map.repeat.set(repeatX, repeatY);
            wall.material.map.needsUpdate = true;
            
            this.architectureGroup.add(wall);
        });
        
        console.log('Walls with moderate emissive lighting');
    }
    
    createBasicCeiling() {
        // Create the same tile texture
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        
        // White tile - same as floor
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
        
        const ceilingMaterial = new THREE.MeshLambertMaterial({
            map: tileTexture
        });
        
        const ceilingY = this.wallHeight;
        const openingSize = this.openingSize;
        const roomSize = this.roomSize;
        const tileSize = 2.5;
        
        // North section - WITH HOLES FOR NW AND NE STAIRS
        this.createNorthCeilingWithStairHoles(ceilingMaterial, ceilingY, openingSize, roomSize, tileSize);
        
        // South section - WITH HOLES FOR SW AND SE STAIRS
        this.createSouthCeilingWithStairHoles(ceilingMaterial, ceilingY, openingSize, roomSize, tileSize);
        
        // East section (no stairs here)
        const eastCeiling = new THREE.Mesh(
            new THREE.PlaneGeometry((roomSize - openingSize) / 2, openingSize),
            ceilingMaterial.clone()
        );
        eastCeiling.rotation.x = Math.PI / 2;
        eastCeiling.position.set(roomSize/4 + openingSize/4, ceilingY, 0);
        eastCeiling.material.map.repeat.set(((roomSize - openingSize) / 2) / tileSize, openingSize / tileSize);
        eastCeiling.material.map.needsUpdate = true;
        this.architectureGroup.add(eastCeiling);
        
        // West section (no stairs here)
        const westCeiling = new THREE.Mesh(
            new THREE.PlaneGeometry((roomSize - openingSize) / 2, openingSize),
            ceilingMaterial.clone()
        );
        westCeiling.rotation.x = Math.PI / 2;
        westCeiling.position.set(-roomSize/4 - openingSize/4, ceilingY, 0);
        westCeiling.material.map.repeat.set(((roomSize - openingSize) / 2) / tileSize, openingSize / tileSize);
        westCeiling.material.map.needsUpdate = true;
        this.architectureGroup.add(westCeiling);
        
        console.log('Tiled ceiling with all 4 stair openings created');
    }
    
    createNorthCeilingWithStairHoles(ceilingMaterial, ceilingY, openingSize, roomSize, tileSize) {
        // North section has stairs at: NW (-350, -350) and NE (350, -350)
        const northSectionZ = -roomSize/4 - openingSize/4; // -360
        const sectionWidth = roomSize; // 960
        const sectionHeight = (roomSize - openingSize) / 2; // 360
        const holeSize = 100;
        
        // NW stair hole at x: -350
        const nwHoleX = -350;
        const nwHoleZ = -350;
        
        // NE stair hole at x: 350  
        const neHoleX = 350;
        const neHoleZ = -350;
        
        // Create ceiling pieces - we need 5 pieces to avoid both holes
        
        // Far west piece (west of NW hole)
        const farWestWidth = (sectionWidth/2) + nwHoleX - holeSize/2;
        if (farWestWidth > 0) {
            this.createCeilingPiece(ceilingMaterial, farWestWidth, sectionHeight, 
                                  -sectionWidth/2 + farWestWidth/2, ceilingY, northSectionZ, tileSize);
        }
        
        // Middle piece (between the two holes)
        const middleWidth = neHoleX - nwHoleX - holeSize;
        if (middleWidth > 0) {
            this.createCeilingPiece(ceilingMaterial, middleWidth, sectionHeight,
                                  (nwHoleX + neHoleX)/2, ceilingY, northSectionZ, tileSize);
        }
        
        // Far east piece (east of NE hole)
        const farEastWidth = (sectionWidth/2) - neHoleX - holeSize/2;
        if (farEastWidth > 0) {
            this.createCeilingPiece(ceilingMaterial, farEastWidth, sectionHeight,
                                  neHoleX + holeSize/2 + farEastWidth/2, ceilingY, northSectionZ, tileSize);
        }
        
        // North strips above holes (if needed)
        const northStripHeight = sectionHeight/2 - holeSize/2;
        if (northStripHeight > 0) {
            // Above NW hole
            this.createCeilingPiece(ceilingMaterial, holeSize, northStripHeight,
                                  nwHoleX, ceilingY, northSectionZ - sectionHeight/2 + northStripHeight/2, tileSize);
            // Above NE hole  
            this.createCeilingPiece(ceilingMaterial, holeSize, northStripHeight,
                                  neHoleX, ceilingY, northSectionZ - sectionHeight/2 + northStripHeight/2, tileSize);
        }
        
        // South strips below holes (if needed)
        const southStripHeight = sectionHeight/2 - holeSize/2;
        if (southStripHeight > 0) {
            // Below NW hole
            this.createCeilingPiece(ceilingMaterial, holeSize, southStripHeight,
                                  nwHoleX, ceilingY, northSectionZ + sectionHeight/2 - southStripHeight/2, tileSize);
            // Below NE hole
            this.createCeilingPiece(ceilingMaterial, holeSize, southStripHeight,
                                  neHoleX, ceilingY, northSectionZ + sectionHeight/2 - southStripHeight/2, tileSize);
        }
        
        console.log('Created north ceiling with NW and NE stair holes');
    }
    
    createSouthCeilingWithStairHoles(ceilingMaterial, ceilingY, openingSize, roomSize, tileSize) {
        // South section now has NO stair holes - create one solid piece
        const southSectionZ = roomSize/4 + openingSize/4; // 360
        const sectionWidth = roomSize; // 960
        const sectionHeight = (roomSize - openingSize) / 2; // 360
        
        // Create one solid ceiling piece for entire south section
        this.createCeilingPiece(ceilingMaterial, sectionWidth, sectionHeight,
                              0, ceilingY, southSectionZ, tileSize);
        
        console.log('Created solid south ceiling (no stair holes)');
    }
    
    createCeilingPiece(material, width, height, x, y, z, tileSize) {
        if (width <= 0 || height <= 0) return; // Skip invalid pieces
        
        const piece = new THREE.Mesh(
            new THREE.PlaneGeometry(width, height),
            material.clone()
        );
        piece.rotation.x = Math.PI / 2;
        piece.position.set(x, y, z);
        piece.material.map.repeat.set(width / tileSize, height / tileSize);
        piece.material.map.needsUpdate = true;
        this.architectureGroup.add(piece);
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
            opacity: 0.1  // Much more transparent to show skybox behind
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
    
    createBasicSkybox() {
        // Create a large sphere that surrounds the entire scene
        const skyboxGeometry = new THREE.SphereGeometry(1500, 32, 32); // Much larger than room
        
        // Create a simple gradient sky material
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        // Create vertical gradient from light blue to white
        const gradient = ctx.createLinearGradient(0, 0, 0, 512);
        gradient.addColorStop(0, '#87CEEB');    // Sky blue at top
        gradient.addColorStop(0.7, '#B0E0E6');  // Powder blue
        gradient.addColorStop(1, '#F0F8FF');    // Alice blue at horizon
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 512);
        
        // Add some simple cloud-like texture
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 256; // Only in upper half
            const radius = 20 + Math.random() * 40;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }
        
        const skyTexture = new THREE.CanvasTexture(canvas);
        skyTexture.wrapS = THREE.RepeatWrapping;
        skyTexture.wrapT = THREE.RepeatWrapping;
        
        const skyboxMaterial = new THREE.MeshBasicMaterial({
            map: skyTexture,
            side: THREE.BackSide, // Render on inside of sphere
            fog: false // Don't apply fog to skybox
        });
        
        this.skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
        this.skybox.position.y = 200; // Lift it up a bit
        
        this.scene.add(this.skybox);
        
        console.log('🌤️ Basic gradient skybox with clouds created');
    }
    
    // ===== NEW: JUST THE STAIRS =====
    
    createCornerStaircases() {
        console.log('🏗️ Creating corner staircases...');
        
        // Only keep north section stairs - remove both south stairs
        const stairPositions = [
            { x: -350, z: -350, name: 'northwest' },  // North section has opening
            { x: 350, z: -350, name: 'northeast' }    // North section has opening
            // Removed: { x: -350, z: 350, name: 'southwest' }
            // Removed: { x: 350, z: 350, name: 'southeast' }
        ];
        
        stairPositions.forEach(stairPos => {
            this.createSingleStaircase(stairPos.x, stairPos.z, stairPos.name);
        });
        
        console.log('✅ Corner staircases created (2 stairs: NW, NE only)');
    }
    
    createSingleStaircase(x, z, name) {
        const stairGroup = new THREE.Group();
        stairGroup.name = `staircase-${name}`;
        
        // Stairs going up to ceiling level
        const targetHeight = this.wallHeight;  // Just go to ceiling level for now
        const stepHeight = 8;
        const stepDepth = 12;
        const stairWidth = 40;
        const numSteps = Math.ceil(targetHeight / stepHeight);
        
        // Create each step
        for (let i = 0; i < numSteps; i++) {
            const stepY = i * stepHeight;
            
            // Step geometry - wider for comfort
            const stepGeometry = new THREE.BoxGeometry(
                stairWidth, 
                stepHeight, 
                stepDepth
            );
            
            const step = new THREE.Mesh(stepGeometry, this.materials.stair);
            
            // Position step - NOTE THE ACTUAL POSITIONING
            step.position.set(
                x, 
                stepY + stepHeight/2, 
                z + (i * stepDepth) - (numSteps * stepDepth / 2)
            );
            
            stairGroup.add(step);
        }
        
        // Add simple railings
        this.createStairRailings(stairGroup, x, z, numSteps, stepHeight, stepDepth, stairWidth);
        
        // Add landing at the top
        const landingGeometry = new THREE.BoxGeometry(
            stairWidth + 20, 
            4, 
            stairWidth + 20
        );
        const landing = new THREE.Mesh(landingGeometry, this.materials.stair);
        landing.position.set(x, targetHeight + 2, z);
        stairGroup.add(landing);
        
        this.stairsGroup.add(stairGroup);
        console.log(`📐 Created ${name} staircase with ${numSteps} steps`);
        console.log(`📐 Staircase spans from Z: ${z - (numSteps * stepDepth / 2)} to Z: ${z + (numSteps * stepDepth / 2)}`);
    }
    
    createStairRailings(stairGroup, x, z, numSteps, stepHeight, stepDepth, stairWidth) {
        const railHeight = 12;
        const railWidth = 2;
        
        // Side railings
        for (let side = -1; side <= 1; side += 2) {
            const railGeometry = new THREE.BoxGeometry(
                railWidth, 
                railHeight, 
                numSteps * stepDepth
            );
            
            const railing = new THREE.Mesh(railGeometry, this.materials.stair);
            railing.position.set(
                x + side * (stairWidth/2 + railWidth/2),
                (numSteps * stepHeight) / 2 + railHeight/2,
                z
            );
            
            stairGroup.add(railing);
        }
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
    
    // NEW: Utility methods for stairs
    getStaircasePositions() {
        // Return only the 2 stairs that actually exist
        return [
            { x: -350, z: -350, name: 'northwest' },
            { x: 350, z: -350, name: 'northeast' }
            // Removed southwest and southeast staircases
        ];
    }
    
    isNearStaircase(position, threshold = 50) {
        const stairs = this.getStaircasePositions();
        return stairs.some(stair => {
            const dx = position.x - stair.x;
            const dz = position.z - stair.z;
            return Math.sqrt(dx*dx + dz*dz) < threshold;
        });
    }
}