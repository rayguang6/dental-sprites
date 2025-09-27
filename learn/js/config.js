export const GAME_CONFIG = {
    CANVAS_WIDTH: 640,
    CANVAS_HEIGHT: 640,
    MIN_TILE_SIZE: 20,
    MAX_TILE_SIZE: 80,
    SPRITE_SIZE: 32
};

export const SPRITE_CONFIG = {
    FRAME_WIDTH: 32,
    FRAME_HEIGHT: 32
};

export const INSTRUCTION_EXAMPLES = {
    testWalk: [
        { type: 'move', direction: 'up', steps: 2 },
        { type: 'move', direction: 'right', steps: 3 },
        { type: 'move', direction: 'down', steps: 2 },
        { type: 'move', direction: 'left', steps: 3 },
        { type: 'wait', duration: 1000 }
    ],
    
    receptionist: [
        { type: 'idle' },
        { type: 'wait', duration: 3000 },
        { type: 'look', direction: 'down' },
        { type: 'wait', duration: 1000 },
        { type: 'look', direction: 'left' },
        { type: 'wait', duration: 2000 }
    ],
    
    guard: [
        { type: 'move', direction: 'up', steps: 3 },
        { type: 'wait', duration: 500 },
        { type: 'move', direction: 'down', steps: 3 },
        { type: 'wait', duration: 500 }
    ],
    
    idleCustomer: [
        { type: 'look', direction: 'left' },
        { type: 'wait', duration: 2000 },
        { type: 'look', direction: 'right' },
        { type: 'wait', duration: 2000 },
        { type: 'look', direction: 'down' },
        { type: 'wait', duration: 1000 }
    ]
};

export const SPRITES = {
    people1: {
        imagePath: 'images/avatar/people1.png',
        frameCount: 16
    }
};

export const MAPS = {
    dental: {
        name: 'Dental Clinic',
        imagePath: 'images/Dental Map.png',
        gridWidth: 10,
        gridHeight: 10,
        spawnPoint: { x: 4, y: 9 },
        chairs: [
            { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 1, y: 3 }, { x: 1, y: 4 },
            { x: 1, y: 5 }, { x: 1, y: 6 }, { x: 1, y: 7 }, { x: 1, y: 8 }
        ],
        beds: [
            { x: 5, y: 1 }, { x: 6, y: 1 }
        ],
        npcs: [
            { spriteKey: 'people1', x: 8, y: 6, behavior: 'receptionist' },
            { spriteKey: 'people1', x: 3, y: 3, behavior: 'testWalk' },
            { spriteKey: 'people1', x: 2, y: 8, behavior: 'guard' }
        ]
    },
    restaurant: {
        name: 'Restaurant',
        imagePath: 'images/Restaurant Map.png',
        gridWidth: 12,
        gridHeight: 8,
        spawnPoint: { x: 6, y: 7 },
        tables: [
            { x: 2, y: 2 }, { x: 2, y: 4 }, { x: 2, y: 6 },
            { x: 10, y: 2 }, { x: 10, y: 4 }, { x: 10, y: 6 }
        ],
        kitchen: [
            { x: 6, y: 1 }
        ],
        npcs: [
            { spriteKey: 'people1', x: 1, y: 4, behavior: 'idleCustomer' },
            { spriteKey: 'people1', x: 11, y: 2, behavior: 'idleCustomer' },
            { spriteKey: 'people1', x: 6, y: 2, behavior: 'guard' }
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

export function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}