// Class for game entities (troops, buildings, spells)
class GameEntity {
    constructor(type, x, y, isPlayer) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.isPlayer = isPlayer;
        this.id = Math.random().toString(36).substr(2, 9);
        this.stats = GAME_DATA.cards[type];
        this.health = this.stats.health;
        this.maxHealth = this.stats.health;
        this.state = 'moving'; // moving, attacking, dying
        this.target = null;
        this.lastAttackTime = 0;
        this.element = null;
        this.isAir = this.stats.isAir || false;
    }
    
    update(gameTime, battlefield) {
        if (this.state === 'dying') return;
        
        // Find target if none
        if (!this.target || this.target.health <= 0) {
            this.findTarget(battlefield);
        }
        
        // Attack target if in range
        if (this.target && this.state === 'attacking') {
            if (gameTime - this.lastAttackTime >= this.stats.hitSpeed * 1000) {
                this.attack(gameTime);
            }
        }
        
        // Move if not attacking
        if (this.state === 'moving') {
            this.move();
            
            // Check if can attack
            if (this.target && this.inRange(this.target)) {
                this.state = 'attacking';
            }
        }
    }
    
    findTarget(battlefield) {
        let closestTarget = null;
        let closestDistance = Infinity;
        
        // Filter potential targets based on this unit's targeting preference
        const potentialTargets = battlefield.entities.filter(entity => {
            // Skip if same team
            if (entity.isPlayer === this.isPlayer) return false;
            
            // Skip if dead
            if (entity.health <= 0) return false;
            
            // Handle targeting restrictions
            if (this.stats.targets === 'buildings' && entity.type !== 'building') return false;
            if (this.stats.targets === 'ground' && entity.isAir) return false;
            
            return true;
        });
        
        // Find closest target
        for (const target of potentialTargets) {
            const distance = this.getDistance(target);
            if (distance < closestDistance) {
                closestTarget = target;
                closestDistance = distance;
            }
        }
        
        this.target = closestTarget;
        
        // Default to towers if no other targets
        if (!this.target) {
            const towers = battlefield.towers.filter(tower => tower.isPlayer !== this.isPlayer);
            for (const tower of towers) {
                const distance = this.getDistance(tower);
                if (distance < closestDistance) {
                    closestTarget = tower;
                    closestDistance = distance;
                }
            }
            this.target = closestTarget;
        }
        
        this.state = this.target && this.inRange(this.target) ? 'attacking' : 'moving';
    }
    
    move() {
        if (!this.target) return;
        
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 5) { // Don't move if very close
            const speed = this.stats.speed / 60; // Convert to pixels per frame (assuming 60fps)
            const vx = (dx / distance) * speed;
            const vy = (dy / distance) * speed;
            
            this.x += vx;
            this.y += vy;
        }
    }
    
    attack(gameTime) {
        if (!this.target) return;
        
        // Apply damage to target
        this.target.takeDamage(this.stats.damage);
        this.lastAttackTime = gameTime;
        
        // Create projectile effect
        if (this.stats.range > 1) {
            gameLogic.createProjectile(this.x, this.y, this.target.x, this.target.y);
        }
    }
    
    takeDamage(amount) {
        this.health -= amount;
        
        // Update health bar
        if (this.element) {
            const healthBar = this.element.querySelector('.health-fill');
            const healthPercent = (this.health / this.maxHealth) * 100;
            healthBar.style.width = `${Math.max(0, healthPercent)}%`;
        }
        
        if (this.health <= 0) {
            this.die();
        }
    }
    
    die() {
        this.state = 'dying';
        this.health = 0;
        
        // Add death animation
        if (this.element) {
            this.element.classList.add('dying');
            setTimeout(() => {
                if (this.element && this.element.parentNode) {
                    this.element.parentNode.removeChild(this.element);
                }
            }, 500);
        }
    }
    
    getDistance(target) {
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    inRange(target) {
        const distance = this.getDistance(target);
        const rangeInPixels = this.stats.range * 20; // Convert tiles to pixels
        return distance <= rangeInPixels;
    }
}

// Tower class
class Tower {
    constructor(type, x, y, isPlayer) {
        this.type = type; // 'kingTower' or 'princeTower'
        this.x = x;
        this.y = y;
        this.isPlayer = isPlayer;
        this.id = Math.random().toString(36).substr(2, 9);
        
        // Set stats based on tower type
        this.stats = GAME_DATA.towers[type];
        this.health = this.stats.health;
        this.maxHealth = this.stats.health;
        this.state = 'idle'; // idle, attacking
        this.target = null;
        this.lastAttackTime = 0;
        this.element = null;
    }
    
    update(gameTime, battlefield) {
        if (this.health <= 0) return;
        
        // Find target if none
        if (!this.target || this.target.health <= 0 || !this.inRange(this.target)) {
            this.findTarget(battlefield);
        }
        
        // Attack target if in range
        if (this.target && this.state === 'attacking') {
            if (gameTime - this.lastAttackTime >= this.stats.hitSpeed * 1000) {
                this.attack(gameTime);
            }
        }
    }
    
    findTarget(battlefield) {
        let closestTarget = null;
        let closestDistance = Infinity;
        
        // Find closest enemy unit
        for (const entity of battlefield.entities) {
            if (entity.isPlayer !== this.isPlayer && entity.health > 0) {
                const distance = this.getDistance(entity);
                if (distance <= this.stats.range * 20 && distance < closestDistance) {
                    closestTarget = entity;
                    closestDistance = distance;
                }
            }
        }
        
        this.target = closestTarget;
        this.state = this.target ? 'attacking' : 'idle';
    }
    
    attack(gameTime) {
        if (!this.target) return;
        
        // Apply damage to target
        this.target.takeDamage(this.stats.damage);
        this.lastAttackTime = gameTime;
        
        // Create projectile effect
        gameLogic.createProjectile(this.x, this.y, this.target.x, this.target.y);
    }
    
    takeDamage(amount) {
        this.health -= amount;
        
        // Update health bar
        if (this.element) {
            const healthBar = this.element.querySelector('.health-fill');
            const healthPercent = (this.health / this.maxHealth) * 100;
            healthBar.style.width = `${Math.max(0, healthPercent)}%`;
        }
        
        if (this.health <= 0) {
            this.die();
        }
    }
    
    die() {
        this.health = 0;
        
        // Update visual
        if (this.element) {
            this.element.classList.add('destroyed');
        }
    }
    
    getDistance(target) {
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    inRange(target) {
        const distance = this.getDistance(target);
        const rangeInPixels = this.stats.range * 20; // Convert tiles to pixels
        return distance <= rangeInPixels;
    }
}

// Spell class
class Spell {
    constructor(type, x, y, isPlayer) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.isPlayer = isPlayer;
        this.id = Math.random().toString(36).substr(2, 9);
        this.stats = GAME_DATA.cards[type];
        this.duration = 1000; // ms
        this.startTime = performance.now();
        this.element = null;
    }
    
    update(gameTime, battlefield) {
        const elapsed = gameTime - this.startTime;
        
        // Apply damage at the beginning
        if (elapsed < 50) {
            this.applyEffect(battlefield);
        }
        
        // Remove after duration
        if (elapsed >= this.duration) {
            this.remove();
            return true; // Signal to remove from game
        }
        
        return false;
    }
    
    applyEffect(battlefield) {
        const radiusInPixels = this.stats.radius * 20; // Convert tiles to pixels
        
        // Apply damage to all entities within radius
        for (const entity of battlefield.entities.concat(battlefield.towers)) {
            if (entity.isPlayer !== this.isPlayer && entity.health > 0) {
                const distance = this.getDistance(entity);
                if (distance <= radiusInPixels) {
                    entity.takeDamage(this.stats.damage);
                }
            }
        }
    }
    
    getDistance(target) {
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    remove() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}