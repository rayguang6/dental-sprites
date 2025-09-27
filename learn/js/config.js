export const GAME_CONFIG = {
    CANVAS_WIDTH: 640,
    CANVAS_HEIGHT: 640,
    MIN_TILE_SIZE: 20,
    MAX_TILE_SIZE: 80
};

export const MAPS = {
    dental: {
        name: 'Dental Clinic',
        imagePath: 'images/dental.png',
        gridWidth: 10,
        gridHeight: 10,
        spawnPoint: { x: 4, y: 9 },
        chairs: [
            { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 1, y: 3 }, { x: 1, y: 4 },
            { x: 1, y: 5 }, { x: 1, y: 6 }, { x: 1, y: 7 }, { x: 1, y: 8 }
        ],
        beds: [
            { x: 5, y: 1 }, { x: 6, y: 1 }
        ]
    },
    restaurant: {
        name: 'Restaurant',
        imagePath: 'images/test.png',
        gridWidth: 11,
        gridHeight: 12,
        spawnPoint: { x: 6, y: 7 },
        tables: [
            { x: 2, y: 2 }, { x: 2, y: 4 }, { x: 2, y: 6 },
            { x: 10, y: 2 }, { x: 10, y: 4 }, { x: 10, y: 6 }
        ],
        kitchen: [
            { x: 6, y: 1 }
        ]
    }
};

export const DEFAULT_MAP = 'dental';

export function getTileSize(map) {
    const tileWidth = GAME_CONFIG.CANVAS_WIDTH / map.gridWidth;
    const tileHeight = GAME_CONFIG.CANVAS_HEIGHT / map.gridHeight;
    const tileSize = Math.min(tileWidth, tileHeight);
    
    return Math.max(GAME_CONFIG.MIN_TILE_SIZE, Math.min(GAME_CONFIG.MAX_TILE_SIZE, tileSize));
}

export function getMapRenderSize(map) {
    const tileSize = getTileSize(map);
    return {
        width: map.gridWidth * tileSize,
        height: map.gridHeight * tileSize,
        tileSize: tileSize,
        offsetX: (GAME_CONFIG.CANVAS_WIDTH - map.gridWidth * tileSize) / 2,
        offsetY: (GAME_CONFIG.CANVAS_HEIGHT - map.gridHeight * tileSize) / 2
    };
}