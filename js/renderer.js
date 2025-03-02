// Renderer class for handling visual updates
class Renderer {
    constructor(gameLogic) {
        this.gameLogic = gameLogic;
        this.battlefieldElement = document.querySelector('.battlefield');
        this.elixirBarElement = document.querySelector('.elixir-bar-fill');
        this.elixirCountElement = document.querySelector('.elixir-count');
        this.timerElement = document.querySelector('.battle-timer');
        this.cardsElement = document.querySelector('.cards');
        
        // Initialize unit elements
        this.unitElements = new Map(); // Map entity ID to DOM element
        this.projectileElements = new Map();
        this.spellElements = new Map();
        
        // Tower elements
        this.towerElements = {
            player: {
                king: document.querySelector('.player-side .king-tower'),
                left: document.querySelector('.player-side .left-tower'),
                right: document.querySelector('.player-side .right-tower')
            },
            opponent: {
                king: document.querySelector('.opponent-side .king-tower'),
                left: document.querySelector('.opponent-side .left-tower'),
                right: document.querySelector('.opponent-side .right-tower')
            }
        };
        
        // Initialize towers with health bars
        this.initTowers();
    }
    
    initTowers() {
        // Add health bars to towers
        const addHealthBar = (tower) => {
            const healthBar = document.createElement('div');
            healthBar.className = 'health-bar';
            
            const healthFill = document.createElement('div');
            healthFill.className = 'health-fill';
            healthBar.appendChild(healthFill);
            
            tower.appendChild(healthBar);
        };
        
        // Player towers
        addHealthBar(this.towerElements.player.king);
        addHealthBar(this.towerElements.player.left);
        addHealthBar(this.towerElements.player.right);
        
        // Opponent towers
        addHealthBar(this.towerElements.opponent.king);
        addHealthBar(this.towerElements.opponent.left);
        addHealthBar(this.towerElements.opponent.right);
    }
    
    update() {
        // Update elixir bar
        const elixirPercent = (this.gameLogic.elixir / this.gameLogic.maxElixir) * 100;
        this.elixirBarElement.style.width = `${elixirPercent}%`;
        this.elixirCountElement.textContent = Math.floor(this.gameLogic.elixir);
        
        // Update battle timer
        const minutes = Math.floor(this.gameLogic.remainingTime / 60);
        const seconds = this.gameLogic.remainingTime % 60;
        this.timerElement.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        
        // Update cards
        this.updateCards();
        
        // Update entities
        this.updateEntities();
        
        // Update towers
        this.updateTowers();
        
        // Update projectiles
        this.updateProjectiles();
        
        // Update spells
        this.updateSpells();
    }
    
    updateCards() {
        // Update card states based on current deck
        const cardElements = this.cardsElement.querySelectorAll('.card');
        
        // First four cards are the current deck
        for (let i = 0; i < 4; i++) {
            const cardType = this.gameLogic.currentDeck[i];
            const cardElement = cardElements[i];
            
            // Update card image and cost
            cardElement.setAttribute('data-card', cardType);
            const costElement = cardElement.querySelector('.card-cost');
            costElement.textContent = GAME_DATA.cards[cardType].cost;
            
            // Highlight cards that can be played
            if (this.gameLogic.elixir >= GAME_DATA.cards[cardType].cost) {
                cardElement.classList.add('available');
            } else {
                cardElement.classList.remove('available');
            }
        }
        
        // Next card
        const nextCardElement = cardElements[4];
        nextCardElement.setAttribute('data-card', this.gameLogic.nextCard);
        const nextCostElement = nextCardElement.querySelector('.card-cost');
        nextCostElement.textContent = GAME_DATA.cards[this.gameLogic.nextCard].cost;
    }
    
    updateEntities() {
        // Create elements for new entities
        for (const entity of this.gameLogic.battlefield.entities) {
            if (!this.unitElements.has(entity.id)) {
                this.createUnitElement(entity);
            }
        }
        
        // Update positions and states
        for (const entity of this.gameLogic.battlefield.entities) {
            const element = this.unitElements.get(entity.id);
            if (element) {
                // Update position
                element.style.left = `${entity.x - 20}px`; // Center the element (40px width / 2)
                element.style.top = `${entity.y - 20}px`; // Center the element (40px height / 2)
                
                // Update health bar
                const healthBar = element.querySelector('.health-fill');
                const healthPercent = (entity.health / entity.maxHealth) * 100;
                healthBar.style.width = `${Math.max(0, healthPercent)}%`;
                
                // Add state classes
                element.classList.remove('moving', 'attacking', 'dying');
                element.classList.add(entity.state);
            }
        }
        
        // Remove elements for dead entities
        for (const [id, element] of this.unitElements) {
            const entity = this.gameLogic.battlefield.entities.find(e => e.id === id);
            if (!entity || entity.health <= 0) {
                if (element.parentNode) {
                    element.classList.add('dying');
                    setTimeout(() => {
                        if (element.parentNode) {
                            element.parentNode.removeChild(element);
                        }
                        this.unitElements.delete(id);
                    }, 500);
                }
            }
        }
    }
    
    createUnitElement(entity) {
        const element = document.createElement('div');
        element.className = `unit ${entity.type} ${entity.isPlayer ? 'player-unit' : 'opponent-unit'}`;
        element.style.left = `${entity.x - 20}px`; // Center the element
        element.style.top = `${entity.y - 20}px`;
        
        // Add health bar
        const healthBar = document.createElement('div');
        healthBar.className = 'health-bar';
        
        const healthFill = document.createElement('div');
        healthFill.className = 'health-fill';
        healthBar.appendChild(healthFill);
        
        element.appendChild(healthBar);
        
        // Store reference to DOM element in entity
        entity.element = element;
        
        // Store in map
        this.unitElements.set(entity.id, element);
        
        // Add to battlefield
        this.battlefieldElement.appendChild(element);
        
        return element;
    }
    
    updateTowers() {
        // Map tower positions to the DOM elements
        const towerMapping = [
            { index: 0, isPlayer: true, element: this.towerElements.player.king },
            { index: 1, isPlayer: true, element: this.towerElements.player.left },
            { index: 2, isPlayer: true, element: this.towerElements.player.right },
            { index: 3, isPlayer: false, element: this.towerElements.opponent.king },
            { index: 4, isPlayer: false, element: this.towerElements.opponent.left },
            { index: 5, isPlayer: false, element: this.towerElements.opponent.right }
        ];
        
        // Update tower health bars
        for (let i = 0; i < this.gameLogic.battlefield.towers.length; i++) {
            const tower = this.gameLogic.battlefield.towers[i];
            const mapping = towerMapping.find(m => m.index === i);
            if (mapping) {
                const element = mapping.element;
                
                // Store reference to DOM element in tower
                tower.element = element;
                
                // Update health bar
                const healthBar = element.querySelector('.health-fill');
                const healthPercent = (tower.health / tower.maxHealth) * 100;
                healthBar.style.width = `${Math.max(0, healthPercent)}%`;
                
                // Add destroyed class if health is 0
                if (tower.health <= 0) {
                    element.classList.add('destroyed');
                }
            }
        }
    }
    
    updateProjectiles() {
        // Create elements for new projectiles
        for (const projectile of this.gameLogic.battlefield.projectiles) {
            if (!this.projectileElements.has(projectile) && !projectile.element) {
                this.createProjectileElement(projectile);
            }
        }
        
        // Update positions
        for (const projectile of this.gameLogic.battlefield.projectiles) {
            const element = projectile.element;
            if (element) {
                // Interpolate position
                const x = projectile.fromX + (projectile.toX - projectile.fromX) * projectile.progress;
                const y = projectile.fromY + (projectile.toY - projectile.fromY) * projectile.progress;
                
                element.style.left = `${x - 7.5}px`; // Center the element (15px width / 2)
                element.style.top = `${y - 7.5}px`; // Center the element (15px height / 2)
            }
        }
    }
    
    createProjectileElement(projectile) {
        const element = document.createElement('div');
        element.className = 'projectile';
        
        // Position at start point
        element.style.left = `${projectile.fromX - 7.5}px`; // Center the element
        element.style.top = `${projectile.fromY - 7.5}px`;
        
        // Store reference to DOM element in projectile
        projectile.element = element;
        
        // Store in map
        this.projectileElements.set(projectile, element);
        
        // Add to battlefield
        this.battlefieldElement.appendChild(element);
        
        return element;
    }
    
    updateSpells() {
        // Create elements for new spells
        for (const spell of this.gameLogic.battlefield.spells) {
            if (!this.spellElements.has(spell.id) && !spell.element) {
                this.createSpellElement(spell);
            }
        }
    }
    
    createSpellElement(spell) {
        const element = document.createElement('div');
        element.className = `spell-effect ${spell.type}`;
        
        // Size based on spell radius
        const radius = spell.stats.radius * 20; // Convert tiles to pixels
        element.style.width = `${radius * 2}px`;
        element.style.height = `${radius * 2}px`;
        
        // Position at center of effect
        element.style.left = `${spell.x - radius}px`;
        element.style.top = `${spell.y - radius}px`;
        
        // Store reference to DOM element in spell
        spell.element = element;
        
        // Store in map
        this.spellElements.set(spell.id, element);
        
        // Add to battlefield
        this.battlefieldElement.appendChild(element);
        
        // Remove after animation completes
        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
            this.spellElements.delete(spell.id);
        }, 1000);
        
        return element;
    }
}