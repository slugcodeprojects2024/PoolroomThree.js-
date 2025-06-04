// poolroom-world.js - Single Story with Temple Walkway
export class PoolroomWorld {
    constructor(scene) {
        this.scene = scene;
        this.materials = {};
        
        // Main poolroom dimensions
        this.roomSize = 960;
        this.wallHeight = 150;
        this.poolWidth = 480;
        this.poolDepth = 480;
        this.poolDepthValue = 20;
        this.openingSize = 240;
        
        // NEW: Walkway and temple dimensions - EXPANDED
        this.walkwayLength = 800;    // DOUBLED from 400
        this.walkwayWidth = 80;
        this.templeSize = 960;       // SAME SIZE AS POOLROOM
        this.grottoPoolSize = 120;
        this.artGallerySize = 400;   // NEW: Art gallery wing
        
        // Groups
        this.architectureGroup = new THREE.Group();
        this.poolGroup = new THREE.Group();
        this.walkwayGroup = new THREE.Group();
        this.templeGroup = new THREE.Group();
        
        scene.add(this.architectureGroup);
        scene.add(this.poolGroup);
        scene.add(this.walkwayGroup);
        scene.add(this.templeGroup);
    }
    
    async init() {
        console.log('🏗️ Creating single-story poolroom with temple...');
        
        await this.loadTextures();
        this.createTexturedMaterials();
        this.createBasicSkybox();
        
        // Main poolroom
        this.createBasicFloor();
        this.createBasicWalls();
        this.createBasicCeiling();
        this.createBasicPool();
        this.createBasicPillars();
        this.createWallOpenings();
        
        // NEW: Door, walkway, and temple
        this.createDoor();
        this.createWalkway();
        this.createTempleArea();
        this.createGrottoPool();
        
        console.log('✅ Single-story poolroom with temple complete');
    }
    
    async loadTextures() {
        this.textureLoader = new THREE.TextureLoader();
        this.textures = {};
        
        try {
            console.log('🔄 Loading textures...');
            
            this.textures.endStoneBricks = await new Promise((resolve, reject) => {
                this.textureLoader.load(
                    'textures/end_stone_bricks.png',
                    (texture) => {
                        console.log('✅ End stone bricks loaded');
                        resolve(texture);
                    },
                    undefined,
                    (error) => {
                        console.warn('❌ Failed to load end_stone_bricks.png:', error);
                        reject(error);
                    }
                );
            });
            
            this.textures.darkPrismarine = await new Promise((resolve, reject) => {
                this.textureLoader.load(
                    'textures/dark_prismarine.png',
                    (texture) => {
                        console.log('✅ Dark prismarine loaded');
                        resolve(texture);
                    },
                    undefined,
                    (error) => {
                        console.warn('❌ Failed to load dark_prismarine.png:', error);
                        reject(error);
                    }
                );
            });
            
            Object.values(this.textures).forEach(texture => {
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.magFilter = THREE.LinearFilter;
                texture.minFilter = THREE.LinearMipMapLinearFilter;
                texture.generateMipmaps = true;
                texture.needsUpdate = true;
            });
            
            console.log('✅ All textures loaded and configured successfully');
            
        } catch (error) {
            console.warn('⚠️ Could not load textures, using fallback colors:', error);
            this.textures = null;
        }
    }
    
    createTexturedMaterials() {
        const createFloorTiles = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 512;
            canvas.height = 512;
            const ctx = canvas.getContext('2d');
            
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, 512, 512);
            
            const tilesPerSide = 16;
            const tileSize = 512 / tilesPerSide;
            
            ctx.strokeStyle = '#cccccc';
            ctx.lineWidth = 2;
            
            for (let i = 0; i <= tilesPerSide; i++) {
                const x = i * tileSize;
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, 512);
                ctx.stroke();
            }
            
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
            const pillarTexture = this.textures.darkPrismarine.clone();
            pillarTexture.repeat.set(2, 8);
            pillarTexture.wrapS = THREE.RepeatWrapping;
            pillarTexture.wrapT = THREE.RepeatWrapping;
            pillarTexture.magFilter = THREE.LinearFilter;
            pillarTexture.minFilter = THREE.LinearMipMapLinearFilter;
            pillarTexture.generateMipmaps = true;
            pillarTexture.needsUpdate = true;
            
            this.materials = {
                floor: new THREE.MeshPhongMaterial({
                    map: floorTexture,
                    shininess: 30
                }),
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
                // NEW: Temple materials
                temple: new THREE.MeshPhongMaterial({
                    color: 0xffffff,
                    shininess: 80
                }),
                vaporwave: new THREE.MeshPhongMaterial({
                    color: 0xff69b4, // Hot pink
                    shininess: 100,
                    emissive: 0x330066 // Purple glow
                }),
                door: new THREE.MeshPhongMaterial({
                    color: 0x8b4513,
                    shininess: 20
                })
            };
            
            console.log('Materials created with temple elements');
        } else {
            this.createBasicMaterials();
        }
    }
    
    createBasicMaterials() {
        this.materials = {
            floor: new THREE.MeshLambertMaterial({ color: 0xf5f5f0 }),
            wall: new THREE.MeshLambertMaterial({ color: 0xe8e8e8 }),
            ceiling: new THREE.MeshLambertMaterial({ color: 0xe8e8e8 }),
            pool: new THREE.MeshLambertMaterial({ color: 0xb0d0ff }),
            pillar: new THREE.MeshLambertMaterial({ color: 0xd0d0d0 }),
            temple: new THREE.MeshLambertMaterial({ color: 0xffffff }),
            vaporwave: new THREE.MeshLambertMaterial({ color: 0xff69b4 }),
            door: new THREE.MeshLambertMaterial({ color: 0x8b4513 })
        };
    }
    
    createBasicFloor() {
        const roomSize = this.roomSize;
        const poolSize = this.poolWidth;
        
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#f5f5f0';
        ctx.fillRect(0, 0, 32, 32);
        
        ctx.strokeStyle = '#cccccc';
        ctx.lineWidth = 1;
        ctx.strokeRect(0, 0, 32, 32);
        
        const tileTexture = new THREE.CanvasTexture(canvas);
        tileTexture.wrapS = THREE.RepeatWrapping;
        tileTexture.wrapT = THREE.RepeatWrapping;
        tileTexture.magFilter = THREE.NearestFilter;
        tileTexture.minFilter = THREE.NearestFilter;
        
        const sideWidth = (roomSize - poolSize) / 2;
        const tileSize = 2.5;
        
        const floorSections = [
            { 
                geometry: new THREE.PlaneGeometry(roomSize, sideWidth),
                position: [0, 0, -(poolSize/2 + sideWidth/2)],
                repeatX: roomSize / tileSize,
                repeatY: sideWidth / tileSize
            },
            { 
                geometry: new THREE.PlaneGeometry(roomSize, sideWidth),
                position: [0, 0, poolSize/2 + sideWidth/2],
                repeatX: roomSize / tileSize,
                repeatY: sideWidth / tileSize
            },
            { 
                geometry: new THREE.PlaneGeometry(sideWidth, poolSize),
                position: [poolSize/2 + sideWidth/2, 0, 0],
                repeatX: sideWidth / tileSize,
                repeatY: poolSize / tileSize
            },
            { 
                geometry: new THREE.PlaneGeometry(sideWidth, poolSize),
                position: [-(poolSize/2 + sideWidth/2), 0, 0],
                repeatX: sideWidth / tileSize,
                repeatY: poolSize / tileSize
            }
        ];
        
        floorSections.forEach((section, index) => {
            const material = new THREE.MeshLambertMaterial({
                map: tileTexture.clone()
            });
            
            const floor = new THREE.Mesh(section.geometry, material);
            floor.rotation.x = -Math.PI / 2;
            floor.position.set(...section.position);
            
            floor.material.map.repeat.set(section.repeatX, section.repeatY);
            floor.material.map.needsUpdate = true;
            
            this.architectureGroup.add(floor);
        });
        
        console.log('Floor created');
    }
    
    createBasicWalls() {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#f5f5f0';
        ctx.fillRect(0, 0, 32, 32);
        
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
        const tileSize = 2.5;
        const wallOffset = 2;
        
        // Create walls but with a gap in the north wall for the door
        const doorWidth = 100;
        const doorOffset = 0; // CENTER THE DOOR
        
        // North wall - split around centered door
        const northWallSections = [
            // Left section
            {
                width: (roomSize/2) - (doorWidth/2),
                position: [-roomSize/2 + wallOffset + ((roomSize/2) - (doorWidth/2))/2, wallHeight/2, -roomSize/2 + wallOffset],
                rotation: [0, 0, 0]
            },
            // Right section  
            {
                width: (roomSize/2) - (doorWidth/2),
                position: [(doorWidth/2) + ((roomSize/2) - (doorWidth/2))/2, wallHeight/2, -roomSize/2 + wallOffset],
                rotation: [0, 0, 0]
            }
        ];
        
        northWallSections.forEach(section => {
            const material = new THREE.MeshLambertMaterial({
                map: tileTexture.clone(),
                emissive: 0x606060
            });
            
            const wall = new THREE.Mesh(new THREE.PlaneGeometry(section.width, wallHeight), material);
            wall.position.set(...section.position);
            wall.rotation.set(...section.rotation);
            
            wall.material.map.repeat.set(section.width / tileSize, wallHeight / tileSize);
            wall.material.map.needsUpdate = true;
            
            this.architectureGroup.add(wall);
        });
        
        // Other walls (no changes)
        const otherWalls = [
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
        
        otherWalls.forEach((wallData, index) => {
            const material = new THREE.MeshLambertMaterial({
                map: tileTexture.clone(),
                emissive: 0x606060
            });
            
            const wall = new THREE.Mesh(wallData.geometry, material);
            wall.position.set(...wallData.position);
            wall.rotation.set(...wallData.rotation);
            
            wall.material.map.repeat.set(roomSize / tileSize, wallHeight / tileSize);
            wall.material.map.needsUpdate = true;
            
            this.architectureGroup.add(wall);
        });
        
        console.log('Walls with centered door opening created');
    }
    
    createBasicCeiling() {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#f5f5f0';
        ctx.fillRect(0, 0, 32, 32);
        
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
        
        // Simple ceiling with central opening (no stair holes needed)
        const ceilingSections = [
            // North section
            { 
                geometry: new THREE.PlaneGeometry(roomSize, (roomSize - openingSize) / 2),
                position: [0, ceilingY, -roomSize/4 - openingSize/4]
            },
            // South section
            { 
                geometry: new THREE.PlaneGeometry(roomSize, (roomSize - openingSize) / 2),
                position: [0, ceilingY, roomSize/4 + openingSize/4]
            },
            // East section
            { 
                geometry: new THREE.PlaneGeometry((roomSize - openingSize) / 2, openingSize),
                position: [roomSize/4 + openingSize/4, ceilingY, 0]
            },
            // West section
            { 
                geometry: new THREE.PlaneGeometry((roomSize - openingSize) / 2, openingSize),
                position: [-roomSize/4 - openingSize/4, ceilingY, 0]
            }
        ];
        
        ceilingSections.forEach(section => {
            const ceiling = new THREE.Mesh(section.geometry, ceilingMaterial.clone());
            ceiling.rotation.x = Math.PI / 2;
            ceiling.position.set(...section.position);
            
            const width = section.geometry.parameters.width;
            const height = section.geometry.parameters.height;
            ceiling.material.map.repeat.set(width / tileSize, height / tileSize);
            ceiling.material.map.needsUpdate = true;
            
            this.architectureGroup.add(ceiling);
        });
        
        console.log('Simple ceiling with central opening created');
    }
    
    createBasicPool() {
        // Pool floor
        const poolFloor = new THREE.Mesh(
            new THREE.PlaneGeometry(this.poolWidth, this.poolDepth),
            this.materials.pool
        );
        poolFloor.rotation.x = -Math.PI / 2;
        poolFloor.position.y = -this.poolDepthValue;
        this.poolGroup.add(poolFloor);
        
        // Pool walls
        const poolWallHeight = this.poolDepthValue;
        
        const poolWalls = [
            { pos: [0, -poolWallHeight/2, -this.poolDepth/2], rot: [0, 0, 0] },
            { pos: [0, -poolWallHeight/2, this.poolDepth/2], rot: [0, Math.PI, 0] },
            { pos: [this.poolWidth/2, -poolWallHeight/2, 0], rot: [0, -Math.PI/2, 0] },
            { pos: [-this.poolWidth/2, -poolWallHeight/2, 0], rot: [0, Math.PI/2, 0] }
        ];
        
        poolWalls.forEach(wall => {
            const poolWall = new THREE.Mesh(
                new THREE.PlaneGeometry(this.poolWidth, poolWallHeight),
                this.materials.pool
            );
            poolWall.position.set(...wall.pos);
            poolWall.rotation.set(...wall.rot);
            this.poolGroup.add(poolWall);
        });
        
        // Pool edges
        const edgeHeight = 0.2;
        const edgeWidth = 2;
        
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
        
        console.log('Pool created');
    }
    
    createBasicPillars() {
        const pillarRadius = 8;
        const pillarHeight = this.wallHeight + this.poolDepthValue;
        
        const positions = [
            [-180, 0, -180],
            [180, 0, -180],
            [-180, 0, 180],
            [180, 0, 180]
        ];
        
        positions.forEach(pos => {
            const pillar = new THREE.Mesh(
                new THREE.CylinderGeometry(pillarRadius, pillarRadius, pillarHeight, 12),
                this.materials.pillar
            );
            pillar.position.set(pos[0], (pillarHeight/2) - this.poolDepthValue, pos[2]);
            this.architectureGroup.add(pillar);
        });
        
        console.log('Pillars created');
    }
    
    createWallOpenings() {
        const openingWidth = 80;
        const openingSpacing = 160;
        const wallHeight = this.wallHeight;
        const roomSize = this.roomSize;
        
        const frameMaterial = new THREE.MeshLambertMaterial({
            color: 0xc0c0c0
        });
        
        const skyMaterial = new THREE.MeshBasicMaterial({
            color: 0x87ceeb,
            transparent: true,
            opacity: 0.1
        });
        
        const wallConfigs = [
            // Skip north wall (has door)
            { wall: 'south', basePos: [0, 0, roomSize/2 - 2], direction: 'x' },
            { wall: 'east', basePos: [roomSize/2 - 2, 0, 0], direction: 'z' },
            { wall: 'west', basePos: [-roomSize/2 + 2, 0, 0], direction: 'z' }
        ];
        
        wallConfigs.forEach(config => {
            for (let i = -1; i <= 1; i++) {
                const openingGroup = new THREE.Group();
                
                const frameGeometry = new THREE.PlaneGeometry(openingWidth + 4, wallHeight);
                const frame = new THREE.Mesh(frameGeometry, frameMaterial);
                
                const skyGeometry = new THREE.PlaneGeometry(openingWidth, wallHeight);
                const sky = new THREE.Mesh(skyGeometry, skyMaterial);
                sky.position.z = 0.1;
                
                openingGroup.add(frame);
                openingGroup.add(sky);
                
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
        
        console.log('Wall openings created');
    }
    
    createBasicSkybox() {
        const skyboxGeometry = new THREE.SphereGeometry(2000, 32, 32);
        
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        // Vaporwave gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, 512);
        gradient.addColorStop(0, '#ff69b4');    // Hot pink
        gradient.addColorStop(0.5, '#9370db');  // Medium purple
        gradient.addColorStop(1, '#4b0082');    // Indigo
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 512);
        
        const skyTexture = new THREE.CanvasTexture(canvas);
        skyTexture.wrapS = THREE.RepeatWrapping;
        skyTexture.wrapT = THREE.RepeatWrapping;
        
        const skyboxMaterial = new THREE.MeshBasicMaterial({
            map: skyTexture,
            side: THREE.BackSide,
            fog: false
        });
        
        this.skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
        this.skybox.position.y = 200;
        
        this.scene.add(this.skybox);
        
        console.log('🌈 Vaporwave skybox created');
    }
    
    // NEW: Door, walkway, and temple creation methods
    
    createDoor() {
        console.log('🚪 Creating door...');
        
        const doorWidth = 80;
        const doorHeight = 120;
        const doorThickness = 5;
        const doorOffset = 0; // CENTER THE DOOR
        
        // Door frame
        const frameGeometry = new THREE.BoxGeometry(doorWidth + 10, doorHeight + 10, doorThickness + 2);
        const frame = new THREE.Mesh(frameGeometry, this.materials.wall);
        frame.position.set(doorOffset, doorHeight/2, -this.roomSize/2 + 1);
        this.architectureGroup.add(frame);
        
        // Door itself
        const doorGeometry = new THREE.BoxGeometry(doorWidth, doorHeight, doorThickness);
        const door = new THREE.Mesh(doorGeometry, this.materials.door);
        door.position.set(doorOffset, doorHeight/2, -this.roomSize/2);
        this.architectureGroup.add(door);
        
        console.log('✅ Door created and centered');
    }
    
    createWalkway() {
        console.log('🛤️ Creating walkway...');
        
        const walkwayStart = -this.roomSize/2;
        const walkwayEnd = walkwayStart - this.walkwayLength;
        
        // Walkway floor - CENTERED AT X=0
        const walkwayFloor = new THREE.Mesh(
            new THREE.PlaneGeometry(this.walkwayWidth, this.walkwayLength),
            this.materials.floor
        );
        walkwayFloor.rotation.x = -Math.PI / 2;
        walkwayFloor.position.set(0, 0, walkwayStart - this.walkwayLength/2); // X=0 instead of 200
        this.walkwayGroup.add(walkwayFloor);
        
        // NO WALLS - removed the walkway walls completely
        
        console.log('✅ Walkway created (centered, no walls)');
    }
    
    createTempleArea() {
        console.log('🏛️ Creating refactored Greco-Roman temple complex...');
        const templeZ = -this.roomSize/2 - this.walkwayLength - this.templeSize/2;
        // Main temple floor
        const templeFloor = new THREE.Mesh(
            new THREE.PlaneGeometry(this.templeSize, this.templeSize),
            this.materials.temple
        );
        templeFloor.rotation.x = -Math.PI / 2;
        templeFloor.position.set(0, 0, templeZ);
        this.templeGroup.add(templeFloor);

        // Perimeter walls (with wide north opening)
        this.createTempleWallsRefactored(templeZ);

        // Main altar (centered)
        this.createTempleAltar(templeZ);

        // Portal arches to wings
        this.createPortalArch(-this.templeSize/2 + 10, 0, templeZ, 'west'); // to grotto
        this.createPortalArch(this.templeSize/2 - 10, 0, templeZ, 'east'); // to gallery

        // Grotto (west wing)
        this.createTempleGrottoAreaRefactored(templeZ);
        // Gallery (east wing)
        this.createArtGalleryWingRefactored(templeZ);

        // Main colonnade around temple
        this.createMainTempleColumnsRefactored(templeZ);

        // Lighting
        this.createVaporwaveLighting(templeZ);
        this.createTorchLights(templeZ);

        // Classic Greek exterior facade (single row colonnade front and back)
        this.createGreekTempleFacade(templeZ);

        console.log('✅ Refactored temple complex created');
    }

    createGreekTempleFacade(templeZ) {
        // Single row of columns at the front (north)
        const colZFront = templeZ - this.templeSize/2 - 20;
        for (let x = -440; x <= 440; x += 80) {
            this.createTempleColumn(x, 0, colZFront);
        }
        // Single row of columns at the back (south)
        const colZBack = templeZ + this.templeSize/2 + 20;
        for (let x = -440; x <= 440; x += 80) {
            this.createTempleColumn(x, 0, colZBack);
        }
    }

    // New/refactored helpers
    createTempleWallsRefactored(templeZ) {
        // No walls: leave the temple open, only columns will define the space
    }

    createPortalArch(x, y, z, dir) {
        // Simple archway for portals to wings
        const arch = new THREE.Mesh(
            new THREE.TorusGeometry(40, 6, 12, 32, Math.PI),
            this.materials.temple
        );
        arch.position.set(x, 60, z);
        arch.rotation.z = dir === 'west' ? Math.PI/2 : -Math.PI/2;
        this.templeGroup.add(arch);
    }

    createMainTempleColumnsRefactored(templeZ) {
        // Perimeter colonnade
        const colDist = this.templeSize/2 - 40;
        for (let x = -colDist; x <= colDist; x += 100) {
            this.createTempleColumn(x, 0, templeZ - colDist);
            this.createTempleColumn(x, 0, templeZ + colDist);
        }
        for (let z = -colDist + 100; z <= colDist - 100; z += 100) {
            this.createTempleColumn(-colDist, 0, templeZ + z);
            this.createTempleColumn(colDist, 0, templeZ + z);
        }
    }

    createTempleGrottoAreaRefactored(templeZ) {
        // Grotto in west wing, more organic
        const grottoX = -this.templeSize/2 - 120;
        const grottoZ = templeZ;
        // Grotto floor
        const grottoFloor = new THREE.Mesh(
            new THREE.CircleGeometry(120, 24),
            this.materials.vaporwave
        );
        grottoFloor.rotation.x = -Math.PI / 2;
        grottoFloor.position.set(grottoX, -8, grottoZ);
        this.templeGroup.add(grottoFloor);
        // Grotto pool (deeper)
        const grottoPool = new THREE.Mesh(
            new THREE.CylinderGeometry(60, 60, 24, 24),
            this.materials.vaporwave
        );
        grottoPool.position.set(grottoX, -20, grottoZ);
        this.templeGroup.add(grottoPool);
        // Rocks
        for (let i = 0; i < 10; i++) {
            const angle = (i / 10) * Math.PI * 2;
            const r = 90 + Math.random() * 30;
            const rock = new THREE.Mesh(
                new THREE.DodecahedronGeometry(10 + Math.random() * 8),
                this.materials.temple
            );
            rock.position.set(
                grottoX + Math.cos(angle) * r,
                -2 + Math.random() * 8,
                grottoZ + Math.sin(angle) * r
            );
            this.templeGroup.add(rock);
        }
        // Grotto columns
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2;
            this.createGrottoColumn(
                grottoX + Math.cos(angle) * 60,
                0,
                grottoZ + Math.sin(angle) * 60
            );
        }
    }

    createArtGalleryWingRefactored(templeZ) {
        // Gallery in east wing
        const galleryX = this.templeSize/2 + 120;
        const galleryZ = templeZ;
        // Gallery floor
        const galleryFloor = new THREE.Mesh(
            new THREE.PlaneGeometry(this.artGallerySize, this.artGallerySize),
            this.materials.floor
        );
        galleryFloor.rotation.x = -Math.PI / 2;
        galleryFloor.position.set(galleryX, 0, galleryZ);
        this.templeGroup.add(galleryFloor);
        // (Removed gallery walls)
        // Art pedestals and pieces
        for (let i = 0; i < 8; i++) {
            const pedestal = new THREE.Mesh(
                new THREE.CylinderGeometry(15, 20, 30, 8),
                this.materials.temple
            );
            pedestal.position.set(
                galleryX + (i % 4 - 1.5) * 80,
                15,
                galleryZ + (Math.floor(i / 4) - 0.5) * 120
            );
            this.templeGroup.add(pedestal);
            const artPiece = new THREE.Mesh(
                new THREE.BoxGeometry(20, 25, 20),
                this.materials.vaporwave
            );
            artPiece.position.set(
                galleryX + (i % 4 - 1.5) * 80,
                42,
                galleryZ + (Math.floor(i / 4) - 0.5) * 120
            );
            this.templeGroup.add(artPiece);
        }
    }

    createTorchLights(templeZ) {
        // Torch lights at entrances
        const torchPositions = [
            [0, 30, templeZ - this.templeSize/2 + 40], // main entrance
            [-this.templeSize/2 + 10, 30, templeZ],    // west portal
            [this.templeSize/2 - 10, 30, templeZ]      // east portal
        ];
        torchPositions.forEach(pos => {
            const torch = new THREE.Mesh(
                new THREE.SphereGeometry(7, 8, 6),
                new THREE.MeshBasicMaterial({ color: 0xffa500, emissive: 0xffa500, emissiveIntensity: 1 })
            );
            torch.position.set(...pos);
            this.templeGroup.add(torch);
        });
    }
    
    createTempleColumn(x, baseY, z) {
        // Column base
        const base = new THREE.Mesh(
            new THREE.CylinderGeometry(8, 10, 6, 8),
            this.materials.temple
        );
        base.position.set(x, baseY + 3, z);
        this.templeGroup.add(base);
        
        // Column shaft
        const shaft = new THREE.Mesh(
            new THREE.CylinderGeometry(6, 6, 40, 8),
            this.materials.vaporwave
        );
        shaft.position.set(x, baseY + 26, z);
        this.templeGroup.add(shaft);
        
        // Column capital
        const capital = new THREE.Mesh(
            new THREE.CylinderGeometry(10, 8, 6, 8),
            this.materials.temple
        );
        capital.position.set(x, baseY + 49, z);
        this.templeGroup.add(capital);
    }
    
    createGrottoColumn(x, baseY, z) {
        // More organic, twisted column for grotto area
        const segments = 8;
        for (let i = 0; i < segments; i++) {
            const segmentHeight = 6;
            const twist = (i / segments) * Math.PI * 0.5;
            const radius = 8 + Math.sin(i * 0.5) * 2;
            
            const segment = new THREE.Mesh(
                new THREE.CylinderGeometry(radius, radius + 1, segmentHeight, 8),
                this.materials.vaporwave
            );
            segment.position.set(
                x + Math.cos(twist) * 2,
                baseY + 3 + i * segmentHeight,
                z + Math.sin(twist) * 2
            );
            segment.rotation.y = twist;
            this.templeGroup.add(segment);
        }
    }
    
    createVaporwaveLighting(templeZ) {
        const neonColors = [0xff1493, 0x00ffff, 0xff69b4, 0x9370db, 0x32cd32];
        
        // Perimeter accent lights
        for (let i = 0; i < 16; i++) {
            const angle = (i / 16) * Math.PI * 2;
            const radius = 400;
            const light = new THREE.Mesh(
                new THREE.SphereGeometry(8, 8, 6),
                new THREE.MeshBasicMaterial({
                    color: neonColors[i % neonColors.length],
                    emissive: neonColors[i % neonColors.length],
                    emissiveIntensity: 0.6
                })
            );
            light.position.set(
                Math.cos(angle) * radius,
                40,
                templeZ + Math.sin(angle) * radius
            );
            this.templeGroup.add(light);
        }
        
        // Central lighting above altar
        for (let i = 0; i < 5; i++) {
            const centralLight = new THREE.Mesh(
                new THREE.SphereGeometry(6, 8, 6),
                new THREE.MeshBasicMaterial({
                    color: neonColors[i],
                    emissive: neonColors[i],
                    emissiveIntensity: 0.8
                })
            );
            centralLight.position.set(
                (i - 2) * 20,
                80,
                templeZ
            );
            this.templeGroup.add(centralLight);
        }
    }
    
    createTempleAltar(templeZ) {
        // Central raised altar area
        const altarPlatform = new THREE.Mesh(
            new THREE.CylinderGeometry(80, 90, 8, 12),
            this.materials.temple
        );
        altarPlatform.position.set(0, 4, templeZ);
        this.templeGroup.add(altarPlatform);
        
        // Altar itself
        const altar = new THREE.Mesh(
            new THREE.BoxGeometry(40, 20, 20),
            this.materials.vaporwave
        );
        altar.position.set(0, 18, templeZ);
        this.templeGroup.add(altar);
        
        // Decorative braziers around altar
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const radius = 60;
            const brazier = new THREE.Mesh(
                new THREE.CylinderGeometry(8, 12, 20, 8),
                this.materials.vaporwave
            );
            brazier.position.set(
                Math.cos(angle) * radius,
                10,
                templeZ + Math.sin(angle) * radius
            );
            this.templeGroup.add(brazier);
        }
    }
    
    createGrottoPool() {
        // This is now handled in createTempleGrottoArea()
        console.log('✅ Grotto pool integrated into temple complex');
    }
    
    // Utility methods
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
    
    getWalkwayBounds() {
        return {
            x: 0,        // CENTERED
            startZ: -this.roomSize/2,
            endZ: -this.roomSize/2 - this.walkwayLength,
            width: this.walkwayWidth
        };
    }
    
    getTempleBounds() {
        const templeZ = -this.roomSize/2 - this.walkwayLength - this.templeSize/2;
        return {
            x: 0,        // CENTERED
            z: templeZ,
            size: this.templeSize,
            grottoX: 0,  // CENTERED
            grottoZ: templeZ,
            grottoSize: this.grottoPoolSize
        };
    }
}