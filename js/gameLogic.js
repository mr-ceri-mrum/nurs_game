// Main game logic
class GameLogic {
    constructor() {
        this.gameState = 'menu'; // menu, playing, gameOver
        this.gameTime = 0;
        this.lastUpdateTime = 0;
        this.battleDuration = GAME_DATA.battleDuration;
        this.remainingTime = this.battleDuration;
        
        this.elixir = 5;
        this.maxElixir = GAME_DATA.maxElixir;
        this.elixirGenerationRate = GAME_DATA.elixirGenerationRate;
        this.lastElixirUpdate = 0;
        
        this.battlefield = {
            entities: [],
            towers: [],
            projectiles: [],
            spells: []
        };
        
        this.selectedCard = null;
        this.deck = ['knight', 'archer', 'giant', 'fireball', 'minions'];
        this.currentDeck = this.deck.slice(0, 4);
        this.nextCard = this.deck[4];
        
        this.score = {
            player: 0,
            opponent: 0
        };
        
        // AI behavior
        this.aiElixir = 5;
        this.aiLastAction = 0;
        this.aiActionInterval = 3000; // ms
    }
    
    init() {
        // Initialize towers
        this.createTowers();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Setup renderer
        this.renderer = new Renderer(this);
        
        // Start menu
        this.showMenu();
    }
    
    createTowers() {
        const positions = GAME_DATA.arena.towerPositions;
        
        // Player towers
        this.battlefield.towers.push(new Tower('kingTower', positions.playerKing.x, positions.playerKing.y, true));
        this.battlefield.towers.push(new Tower('princeTower', positions.playerLeft.x, positions.playerLeft.y, true));
        this.battlefield.towers.push(new Tower('princeTower', positions.playerRight.x, positions.playerRight.y, true));
        
        // Opponent towers
        this.battlefield.towers.push(new Tower('kingTower', positions.opponentKing.x, positions.opponentKing.y, false));
        this.battlefield.towers.push(new Tower('princeTower', positions.opponentLeft.x, positions.opponentLeft.y, false));
        this.battlefield.towers.push(new Tower('princeTower', positions.opponentRight.x, positions.opponentRight.y, false));
    }
    
    setupEventListeners() {
        // Menu buttons
        document.getElementById('start-game').addEventListener('click', () => this.startGame());
        
        // Card selection
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            card.addEventListener('click', () => {
                const cardType = card.getAttribute('data-card');
                if (!this.selectedCard && this.currentDeck.includes(cardType)) {
                    const cardCost = GAME_DATA.cards[cardType].cost;
                    if (this.elixir >= cardCost) {
                        this.selectedCard = cardType;
                        card.classList.add('selected');
                    }
                }
            });
        });
        
        // Battlefield for deployment
        const battlefield = document.querySelector('.battlefield');
        battlefield.addEventListener('click', (e) => {
            if (this.selectedCard) {
                const rect = battlefield.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                // Check if within player's deployment area
                if (y < GAME_DATA.arena.playerDeployBoundary) {
                    this.deployCard(this.selectedCard, x, y);
                    
                    // Remove selection
                    document.querySelectorAll('.card.selected').forEach(card => {
                        card.classList.remove('selected');
                    });
                    this.selectedCard = null;
                }
            }
        });
    }
    
    startGame() {
        this.gameState = 'playing';
        this.gameTime = 0;
        this.lastUpdateTime = performance.now();
        this.remainingTime = this.battleDuration;
        this.elixir = 5;
        this.aiElixir = 5;
        
        // Clear battlefield
        this.battlefield.entities = [];
        this.battlefield.projectiles = [];
        this.battlefield.spells = [];
        
        // Reset towers
        this.createTowers();
        
        // Hide menu, show game
        document.querySelector('.menu-screen').style.display = 'none';
        document.querySelector('.game-container').style.display = 'block';
        
        // Start game loop
        this.gameLoop();
    }
    
    gameLoop() {
        if (this.gameState !== 'playing') return;
        
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastUpdateTime;
        this.lastUpdateTime = currentTime;
        
        // Update game time
        this.gameTime += deltaTime;
        this.remainingTime = Math.max(0, this.battleDuration - Math.floor(this.gameTime / 1000));
        
        // Generate elixir
        this.updateElixir(deltaTime);
        
        // Update all entities
        this.updateEntities(this.gameTime);
        
        // AI moves
        this.updateAI(this.gameTime);
        
        // Check win conditions
        this.checkWinConditions();
        
        // Update UI
        this.renderer.update();
        
        // Continue loop
        if (this.gameState === 'playing') {
            requestAnimationFrame(() => this.gameLoop());
        }
    }
    
    updateElixir(deltaTime) {
        // Player elixir
        if (this.elixir < this.maxElixir) {
            this.elixir += deltaTime / (this.elixirGenerationRate * 1000);
            if (this.elixir > this.maxElixir) {
                this.elixir = this.maxElixir;
            }
        }
        
        // AI elixir
        if (this.aiElixir < this.maxElixir) {
            this.aiElixir += deltaTime / (this.elixirGenerationRate * 1000);
            if (this.aiElixir > this.maxElixir) {
                this.aiElixir = this.maxElixir;
            }
        }
    }
    
    updateEntities(gameTime) {
        // Update troops/buildings
        for (let i = this.battlefield.entities.length - 1; i >= 0; i--) {
            const entity = this.battlefield.entities[i];
            entity.update(gameTime, this.battlefield);
            
            // Remove dead entities
            if (entity.health <= 0 && entity.state === 'dying') {
                this.battlefield.entities.splice(i, 1);
            }
        }
        
        // Update towers
        for (let i = 0; i < this.battlefield.towers.length; i++) {
            const tower = this.battlefield.towers[i];
            tower.update(gameTime, this.battlefield);
        }
        
        // Update projectiles
        for (let i = this.battlefield.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.battlefield.projectiles[i];
            const finished = projectile.update();
            if (finished) {
                this.battlefield.projectiles.splice(i, 1);
            }
        }
        
        // Update spells
        for (let i = this.battlefield.spells.length - 1; i >= 0; i--) {
            const spell = this.battlefield.spells[i];
            const finished = spell.update(gameTime, this.battlefield);
            if (finished) {
                this.battlefield.spells.splice(i, 1);
            }
        }
    }
    
    deployCard(cardType, x, y) {
        const card = GAME_DATA.cards[cardType];
        
        // Check if enough elixir
        if (this.elixir < card.cost) return;
        
        // Deduct elixir
        this.elixir -= card.cost;
        
        // Deploy based on card type
        if (card.type === 'troop') {
            // For multiple units (e.g., archers, minions)
            if (card.count > 1) {
                const spreadX = 20; // pixels between units
                const baseX = x - ((card.count - 1) * spreadX) / 2;
                
                for (let i = 0; i < card.count; i++) {
                    const entity = new GameEntity(cardType, baseX + (i * spreadX), y, true);
                    this.battlefield.entities.push(entity);
                }
            } else {
                const entity = new GameEntity(cardType, x, y, true);
                this.battlefield.entities.push(entity);
            }
        } else if (card.type === 'spell') {
            const spell = new Spell(cardType, x, y, true);
            this.battlefield.spells.push(spell);
        }
        
        // Cycle cards
        this.cycleCards(cardType);
    }
    
    cycleCards(usedCard) {
        // Remove used card from current deck
        const index = this.currentDeck.indexOf(usedCard);
        if (index !== -1) {
            this.currentDeck.splice(index, 1);
            this.currentDeck.push(this.nextCard);
            
            // Get new next card
            const availableCards = this.deck.filter(card => !this.currentDeck.includes(card));
            this.nextCard = availableCards[Math.floor(Math.random() * availableCards.length)];
        }
    }
    
    updateAI(gameTime) {
        // Check if it's time for AI to make a move
        if (gameTime - this.aiLastAction >= this.aiActionInterval) {
            this.aiLastAction = gameTime;
            
            // Simple AI: randomly deploy a card if enough elixir
            const aiDeck = ['knight', 'archer', 'giant', 'fireball', 'minions'];
            const possibleCards = aiDeck.filter(cardType => {
                const card = GAME_DATA.cards[cardType];
                return this.aiElixir >= card.cost;
            });
            
            if (possibleCards.length > 0) {
                // Choose a random card
                const cardType = possibleCards[Math.floor(Math.random() * possibleCards.length)];
                const card = GAME_DATA.cards[cardType];
                
                // Choose a random position on the opponent's side
                const x = Math.random() * GAME_DATA.arena.width;
                const y = Math.random() * (GAME_DATA.arena.riverY - 50) + 50; // Keep away from the very top
                
                // Deploy the card
                this.aiElixir -= card.cost;
                
                if (card.type === 'troop') {
                    // For multiple units
                    if (card.count > 1) {
                        const spreadX = 20;
                        const baseX = x - ((card.count - 1) * spreadX) / 2;
                        
                        for (let i = 0; i < card.count; i++) {
                            const entity = new GameEntity(cardType, baseX + (i * spreadX), y, false);
                            this.battlefield.entities.push(entity);
                        }
                    } else {
                        const entity = new GameEntity(cardType, x, y, false);
                        this.battlefield.entities.push(entity);
                    }
                } else if (card.type === 'spell') {
                    // For spells, target player units if possible
                    let targetX = x;
                    let targetY = y;
                    
                    // Find a good target for the spell
                    const playerUnits = this.battlefield.entities.filter(e => e.isPlayer);
                    if (playerUnits.length > 0) {
                        // Find a cluster of units
                        const randomUnit = playerUnits[Math.floor(Math.random() * playerUnits.length)];
                        targetX = randomUnit.x;
                        targetY = randomUnit.y;
                    }
                    
                    const spell = new Spell(cardType, targetX, targetY, false);
                    this.battlefield.spells.push(spell);
                }
            }
        }
    }
    
    createProjectile(fromX, fromY, toX, toY) {
        const projectile = {
            fromX: fromX,
            fromY: fromY,
            toX: toX,
            toY: toY,
            progress: 0,
            speed: 0.05, // progress per frame
            element: null,
            update: function() {
                this.progress += this.speed;
                if (this.progress >= 1) {
                    if (this.element && this.element.parentNode) {
                        this.element.parentNode.removeChild(this.element);
                    }
                    return true; // Finished
                }
                return false;
            }
        };
        
        this.battlefield.projectiles.push(projectile);
        return projectile;
    }
    
    checkWinConditions() {
        // Check if the battle time has ended
        if (this.remainingTime <= 0) {
            this.endGame();
            return;
        }
        
        // Count alive towers for each side
        const playerTowers = this.battlefield.towers.filter(t => t.isPlayer && t.health > 0).length;
        const opponentTowers = this.battlefield.towers.filter(t => !t.isPlayer && t.health > 0).length;
        
        // Check if all opponent towers are destroyed
        if (opponentTowers === 0) {
            this.score.player = 3;
            this.endGame();
            return;
        }
        
        // Check if all player towers are destroyed
        if (playerTowers === 0) {
            this.score.opponent = 3;
            this.endGame();
            return;
        }
        
        // Update crown count
        this.score.player = 3 - opponentTowers;
        this.score.opponent = 3 - playerTowers;
    }
    
    endGame() {
        this.gameState = 'gameOver';
        
        // Determine winner
        let resultMessage = '';
        if (this.score.player > this.score.opponent) {
            resultMessage = 'You Win!';
        } else if (this.score.player < this.score.opponent) {
            resultMessage = 'You Lose!';
        } else {
            resultMessage = 'Draw!';
        }
        
        // Show results
        setTimeout(() => {
            alert(`Game Over! ${resultMessage}\nCrowns: ${this.score.player} - ${this.score.opponent}`);
            this.showMenu();
        }, 1000);
    }
    
    showMenu() {
        this.gameState = 'menu';
        document.querySelector('.game-container').style.display = 'none';
        document.querySelector('.menu-screen').style.display = 'flex';
    }
}