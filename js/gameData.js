// Game data and constants
const GAME_DATA = {
    // Game settings
    battleDuration: 180, // seconds
    elixirGenerationRate: 2.8, // seconds per elixir
    maxElixir: 10,
    
    // Card data
    cards: {
        knight: {
            name: "Knight",
            cost: 3,
            health: 1450,
            damage: 159,
            hitSpeed: 1.1, // seconds
            speed: 60, // pixels per second
            range: 1, // melee
            targets: "ground",
            count: 1,
            deployTime: 1, // seconds
            type: "troop"
        },
        archer: {
            name: "Archers",
            cost: 3,
            health: 254,
            damage: 89,
            hitSpeed: 1.2,
            speed: 60,
            range: 5.5, // tiles
            targets: "air & ground",
            count: 2,
            deployTime: 1,
            type: "troop"
        },
        giant: {
            name: "Giant",
            cost: 5,
            health: 3275,
            damage: 147,
            hitSpeed: 1.5,
            speed: 45,
            range: 1,
            targets: "buildings",
            count: 1,
            deployTime: 1,
            type: "troop"
        },
        fireball: {
            name: "Fireball",
            cost: 4,
            damage: 572,
            radius: 2.5, // tiles
            type: "spell"
        },
        minions: {
            name: "Minions",
            cost: 3,
            health: 190,
            damage: 84,
            hitSpeed: 1,
            speed: 90,
            range: 2,
            targets: "air & ground",
            count: 3,
            deployTime: 1,
            type: "troop",
            isAir: true
        }
    },
    
    // Tower data
    towers: {
        kingTower: {
            health: 4000,
            damage: 90,
            hitSpeed: 1,
            range: 7
        },
        princeTower: {
            health: 2400,
            damage: 90,
            hitSpeed: 0.8,
            range: 7.5
        }
    },
    
    // Arena dimensions
    arena: {
        width: 375,
        height: 470, // Battlefield height (excluding card deck and header)
        riverY: 235, // Y position of the river
        playerDeployBoundary: 300, // Y position limit for player deployment
        towerPositions: {
            playerKing: { x: 187, y: 420 },
            playerLeft: { x: 70, y: 350 },
            playerRight: { x: 305, y: 350 },
            opponentKing: { x: 187, y: 50 },
            opponentLeft: { x: 70, y: 120 },
            opponentRight: { x: 305, y: 120 }
        }
    }
};