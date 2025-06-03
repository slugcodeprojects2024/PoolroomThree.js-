// collectibles-manager.js - NO COLLECTIBLES (Clean Room)
export class CollectiblesManager {
    constructor(scene) {
        this.scene = scene;
        this.collectibles = [];
        this.collected = 0;
        this.totalCount = 0; // No collectibles for now
    }
    
    init() {
        console.log('💎 No collectibles - clean room...');
        // Don't create any collectibles
        console.log('✅ Clean room ready');
    }
    
    update(deltaTime, cameraPosition) {
        // No collectibles to update
    }
    
    collectItem(collectible) {
        // No items to collect
    }
    
    getCollectedCount() { return this.collected; }
    getTotalCount() { return this.totalCount; }
}