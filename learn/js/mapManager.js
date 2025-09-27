import { MAPS, DEFAULT_MAP } from './config.js';

export class MapManager {
    constructor() {
        this.currentMapKey = DEFAULT_MAP;
        this.currentMap = MAPS[this.currentMapKey];
    }
    
    setMap(mapKey) {
        if (!MAPS[mapKey]) {
            console.error(`Map "${mapKey}" not found`);
            return false;
        }
        
        this.currentMapKey = mapKey;
        this.currentMap = MAPS[mapKey];
        console.log(`Switched to map: ${this.currentMap.name}`);
        return true;
    }
    
    getCurrentMap() {
        return this.currentMap;
    }
    
    getCurrentMapKey() {
        return this.currentMapKey;
    }
    
    getAvailableMaps() {
        return Object.keys(MAPS);
    }
    
    getMapInfo(mapKey = null) {
        const map = mapKey ? MAPS[mapKey] : this.currentMap;
        if (!map) return null;
        
        return {
            name: map.name,
            gridWidth: map.gridWidth,
            gridHeight: map.gridHeight,
            spawnPoint: map.spawnPoint,
            features: this.getMapFeatures(map)
        };
    }
    
    getMapFeatures(map) {
        const features = {};
        Object.keys(map).forEach(key => {
            if (key !== 'name' && key !== 'imagePath' && key !== 'gridWidth' && key !== 'gridHeight') {
                features[key] = map[key];
            }
        });
        return features;
    }
}