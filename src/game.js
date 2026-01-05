// game.js - Main game scene and logic for Lane Storm

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }
    
    init(data) {
        this.difficulty = data.difficulty || 'normal';
    }
    
    create() {
        // Game dimensions
        this.gameWidth = this.cameras.main.width;
        this.gameHeight = this.cameras.main.height;
        this.hudHeight = 100;
        this.playAreaHeight = this.gameHeight - this.hudHeight;
        this.midY = this.playAreaHeight / 2;
        
        // Lane positions (left = top lane, right = bottom lane)
        this.topLaneX = this.gameWidth * 0.3;
        this.bottomLaneX = this.gameWidth * 0.7;
        
        // Base positions
        this.playerBaseY = this.playAreaHeight - 50;
        this.aiBaseY = 50;
        
        // Game state
        this.gameTime = 150; // 2:30 in seconds
        this.timeRemaining = this.gameTime;
        this.doubleElixir = false;
        this.gameOver = false;
        this.gamePaused = false;
        
        // Elixir
        this.playerElixir = 5;
        this.aiElixir = 5;
        this.elixirRegenRate = 0.35; // per second
        
        // Momentum
        this.playerMomentum = 0;
        this.aiMomentum = 0;
        this.playerBuff = null;
        this.aiBuff = null;
        this.playerBuffEndTime = 0;
        this.aiBuffEndTime = 0;
        
        // Object pools
        this.playerUnits = [];
        this.aiUnits = [];
        this.projectiles = [];
        this.effects = [];
        this.tactics = [];
        
        // Decks
        this.playerDeck = new DeckManager();
        this.aiController = new AIController(this.difficulty);
        
        // Create game elements
        this.createBackground();
        this.createLanes();
        this.createTowers();
        
        // Get UI scene reference
        this.uiScene = this.scene.get('UIScene');
        
        // Create tower HP bars after a short delay to ensure UI is ready
        this.time.delayedCall(100, () => this.createTowerHPBars());
        
        // Set up game timer
        this.gameTimer = this.time.addEvent({
            delay: 1000,
            callback: this.updateGameTime,
            callbackScope: this,
            loop: true
        });
        
        // Set up momentum buttons
        this.setupMomentumButtons();
        
        // Main game loop
        this.lastUpdateTime = Date.now();
    }
    
    createBackground() {
        // Arena background
        this.add.rectangle(
            this.gameWidth / 2,
            this.playAreaHeight / 2,
            this.gameWidth,
            this.playAreaHeight,
            0x2d4a3e
        );
        
        // Player side (darker)
        this.add.rectangle(
            this.gameWidth / 2,
            this.playAreaHeight * 0.75,
            this.gameWidth,
            this.playAreaHeight / 2,
            0x1a3a2e,
            0.5
        );
        
        // Middle line
        this.add.rectangle(
            this.gameWidth / 2,
            this.midY,
            this.gameWidth,
            4,
            0x4a90d9,
            0.7
        );
        
        // Grid pattern
        const gridGraphics = this.add.graphics();
        gridGraphics.lineStyle(1, 0x3a5a4e, 0.3);
        
        for (let x = 0; x < this.gameWidth; x += 40) {
            gridGraphics.lineBetween(x, 0, x, this.playAreaHeight);
        }
        for (let y = 0; y < this.playAreaHeight; y += 40) {
            gridGraphics.lineBetween(0, y, this.gameWidth, y);
        }
    }
    
    createLanes() {
        // Lane visual indicators
        const laneWidth = 80;
        
        // Top lane (left side)
        this.add.rectangle(
            this.topLaneX,
            this.playAreaHeight / 2,
            laneWidth,
            this.playAreaHeight - 100,
            0x4a6a5e,
            0.3
        );
        
        // Bottom lane (right side)
        this.add.rectangle(
            this.bottomLaneX,
            this.playAreaHeight / 2,
            laneWidth,
            this.playAreaHeight - 100,
            0x4a6a5e,
            0.3
        );
    }
    
    createTowers() {
        this.towers = {
            playerCore: this.createTower(this.gameWidth / 2, this.playerBaseY, false, true),
            playerTop: this.createTower(this.topLaneX, this.playerBaseY - 60, false, false),
            playerBottom: this.createTower(this.bottomLaneX, this.playerBaseY - 60, false, false),
            aiCore: this.createTower(this.gameWidth / 2, this.aiBaseY, true, true),
            aiTop: this.createTower(this.topLaneX, this.aiBaseY + 60, true, false),
            aiBottom: this.createTower(this.bottomLaneX, this.aiBaseY + 60, true, false)
        };
    }
    
    createTower(x, y, isEnemy, isCore) {
        const size = isCore ? 35 : 25;
        const maxHP = isCore ? 2000 : 1000;
        const damage = isCore ? 80 : 60;
        const range = 150;
        
        const tower = {
            x: x,
            y: y,
            hp: maxHP,
            maxHP: maxHP,
            damage: damage,
            range: range,
            attackSpeed: 0.8,
            lastAttackTime: 0,
            isEnemy: isEnemy,
            isCore: isCore,
            size: size,
            destroyed: false
        };
        
        // Visual
        const color = isEnemy ? 0xcc4444 : 0x4444cc;
        
        if (isCore) {
            tower.visual = this.add.polygon(x, y, [
                0, -size, size*0.87, -size/2, size*0.87, size/2,
                0, size, -size*0.87, size/2, -size*0.87, -size/2
            ], color);
        } else {
            tower.visual = this.add.rectangle(x, y, size * 1.5, size * 1.5, color);
        }
        
        tower.visual.setStrokeStyle(3, isEnemy ? 0xff6666 : 0x6666ff);
        tower.visual.setDepth(10);
        
        // Tower glow
        tower.glow = this.add.circle(x, y, size + 5, color, 0.2);
        tower.glow.setDepth(9);
        
        return tower;
    }
    
    createTowerHPBars() {
        if (!this.uiScene) return;
        
        Object.keys(this.towers).forEach(key => {
            const tower = this.towers[key];
            if (!tower.destroyed) {
                tower.hpBar = this.uiScene.createTowerHPBar(tower.x, tower.y, tower.isEnemy);
            }
        });
    }
    
    setupMomentumButtons() {
        const furyBtn = document.getElementById('fury-btn');
        const fortifyBtn = document.getElementById('fortify-btn');
        
        furyBtn.addEventListener('click', () => this.activatePlayerMomentum('fury'));
        fortifyBtn.addEventListener('click', () => this.activatePlayerMomentum('fortify'));
    }
    
    activatePlayerMomentum(type) {
        if (this.playerMomentum < 100) return;
        
        this.playerMomentum = 0;
        this.playerBuff = type;
        this.playerBuffEndTime = Date.now() + 5000;
        
        this.uiScene.hideMomentumChoice();
        
        // Visual feedback
        this.cameras.main.flash(300, type === 'fury' ? 255 : 0, type === 'fury' ? 100 : 200, type === 'fury' ? 100 : 200);
        
        // Show floating text
        this.showFloatingText(
            this.gameWidth / 2,
            this.playAreaHeight / 2,
            type === 'fury' ? '⚔️ FURY!' : '🛡️ FORTIFY!',
            type === 'fury' ? '#ff6b6b' : '#4ecdc4'
        );
    }
    
    activateAIMomentum(type) {
        this.aiMomentum = 0;
        this.aiBuff = type;
        this.aiBuffEndTime = Date.now() + 5000;
        this.aiController.setMomentumUsed();
        this.aiController.activateBuff(type, 5000);
    }
    
    updateGameTime() {
        if (this.gameOver || this.gamePaused) return;
        
        this.timeRemaining--;
        
        // Check for double elixir (after 1:15 = 75 seconds remaining)
        if (this.timeRemaining <= 75 && !this.doubleElixir) {
            this.doubleElixir = true;
            this.showFloatingText(this.gameWidth / 2, this.midY, '⚡ DOUBLE ELIXIR! ⚡', '#ffd700');
        }
        
        // Check for time up
        if (this.timeRemaining <= 0) {
            this.endGame('timeout');
        }
    }
    
    update(time, delta) {
        if (this.gameOver || this.gamePaused) return;
        
        const currentTime = Date.now();
        const dt = delta / 1000;
        
        // Update elixir
        this.updateElixir(dt);
        
        // Update buffs
        this.updateBuffs(currentTime);
        
        // Update AI
        this.updateAI(currentTime);
        
        // Update units
        this.updateUnits(currentTime, dt);
        
        // Update projectiles
        this.updateProjectiles(dt);
        
        // Update towers
        this.updateTowers(currentTime);
        
        // Update tactics
        this.updateTactics(currentTime);
        
        // Update effects
        this.updateEffects(dt);
        
        // Clean up destroyed objects
        this.cleanupObjects();
        
        // Update UI
        this.updateUI();
        
        // Check win conditions
        this.checkWinConditions();
    }
    
    updateElixir(dt) {
        const rate = this.doubleElixir ? this.elixirRegenRate * 2 : this.elixirRegenRate;
        
        this.playerElixir = Math.min(10, this.playerElixir + rate * dt);
        this.aiElixir = Math.min(10, this.aiElixir + rate * dt);
    }
    
    updateBuffs(currentTime) {
        if (this.playerBuff && currentTime > this.playerBuffEndTime) {
            this.playerBuff = null;
        }
        if (this.aiBuff && currentTime > this.aiBuffEndTime) {
            this.aiBuff = null;
        }
    }
    
    updateAI(currentTime) {
        const gameState = {
            aiElixir: this.aiElixir,
            aiMomentum: this.aiMomentum,
            playerUnits: this.playerUnits.map(u => ({
                x: u.x, y: u.y, hp: u.hp, lane: u.lane
            })),
            aiUnits: this.aiUnits.map(u => ({
                x: u.x, y: u.y, hp: u.hp, lane: u.lane
            })),
            aiBaseY: this.aiBaseY,
            playerBaseY: this.playerBaseY,
            midY: this.midY,
            topLaneX: this.topLaneX,
            bottomLaneX: this.bottomLaneX
        };
        
        const action = this.aiController.update(gameState, currentTime);
        
        if (action) {
            if (action.type === 'playCard') {
                this.aiPlayCard(action);
            } else if (action.type === 'momentum') {
                if (this.aiMomentum >= 100) {
                    this.activateAIMomentum(action.choice);
                }
            }
        }
    }
    
    aiPlayCard(action) {
        const card = this.aiController.executeAction(action);
        if (!card) return;
        
        this.aiElixir -= card.cost;
        
        if (card.type === CARD_TYPES.UNIT) {
            this.spawnUnit(card, action.x, action.y, true, action.lane);
        } else if (card.type === CARD_TYPES.TACTIC) {
            this.placeTactic(card, action.x, action.y, true);
        }
    }
    
    playerPlayCard(handIndex, x, y, lane) {
        if (!this.playerDeck.canAfford(handIndex, this.playerElixir)) return;
        
        const card = this.playerDeck.playCard(handIndex);
        if (!card) return;
        
        this.playerElixir -= card.cost;
        
        if (card.type === CARD_TYPES.UNIT) {
            this.spawnUnit(card, x, y, false, lane);
        } else if (card.type === CARD_TYPES.TACTIC) {
            this.placeTactic(card, x, y, false);
        }
    }
    
    spawnUnit(card, x, y, isEnemy, lane) {
        const stats = { ...card.stats };
        
        const unit = {
            x: x,
            y: y,
            card: card,
            hp: stats.hp,
            maxHP: stats.hp,
            shield: 0,
            damage: stats.damage,
            attackSpeed: stats.attackSpeed,
            moveSpeed: stats.moveSpeed,
            range: stats.range,
            size: stats.size,
            isEnemy: isEnemy,
            lane: lane,
            target: null,
            lastAttackTime: 0,
            lastHealTime: 0,
            healReceived: 0,
            following: null,
            stats: stats
        };
        
        // Create visual
        unit.visual = this.createUnitVisual(card, x, y, isEnemy);
        
        // Create HP bar
        unit.hpBar = this.createUnitHPBar(unit);
        
        if (isEnemy) {
            this.aiUnits.push(unit);
        } else {
            this.playerUnits.push(unit);
        }
        
        // Spawn effect
        this.createSpawnEffect(x, y, card.color);
    }
    
    createUnitVisual(card, x, y, isEnemy) {
        const size = card.stats.size;
        let visual;
        
        switch (card.shape) {
            case 'triangle':
                visual = this.add.triangle(x, y, 0, size, size, size, size/2, 0, card.color);
                if (isEnemy) visual.setRotation(Math.PI);
                break;
            case 'hexagon':
                visual = this.add.polygon(x, y, [
                    0, -size, size*0.87, -size/2, size*0.87, size/2,
                    0, size, -size*0.87, size/2, -size*0.87, -size/2
                ], card.color);
                break;
            case 'square':
                visual = this.add.rectangle(x, y, size, size, card.color);
                break;
            case 'diamond':
                visual = this.add.polygon(x, y, [0, -size, size, 0, 0, size, -size, 0], card.color);
                break;
            case 'circle':
                visual = this.add.circle(x, y, size/2, card.color);
                break;
            case 'plus':
                const container = this.add.container(x, y);
                container.add(this.add.rectangle(0, 0, size, size/3, card.color));
                container.add(this.add.rectangle(0, 0, size/3, size, card.color));
                visual = container;
                break;
            default:
                visual = this.add.circle(x, y, size/2, card.color);
        }
        
        if (visual.setStrokeStyle) {
            visual.setStrokeStyle(2, isEnemy ? 0xff0000 : 0x0000ff, 0.7);
        }
        visual.setDepth(20);
        
        return visual;
    }
    
    createUnitHPBar(unit) {
        const barWidth = unit.size * 2;
        const barHeight = 4;
        
        const container = this.add.container(unit.x, unit.y - unit.size - 8);
        container.setDepth(25);
        
        const bg = this.add.rectangle(0, 0, barWidth, barHeight, 0x333333);
        const fill = this.add.rectangle(-barWidth/2, 0, barWidth, barHeight - 1, unit.isEnemy ? 0xff4444 : 0x44ff44);
        fill.setOrigin(0, 0.5);
        
        container.add(bg);
        container.add(fill);
        
        return { container, fill, barWidth };
    }
    
    placeTactic(card, x, y, isEnemy) {
        const tactic = {
            x: x,
            y: y,
            card: card,
            isEnemy: isEnemy,
            startTime: Date.now(),
            duration: card.stats.duration,
            hp: card.stats.hp || Infinity
        };
        
        if (card.id === 'barrierPad') {
            // Create barrier zone visual
            tactic.visual = this.add.circle(x, y, card.stats.radius, card.color, 0.3);
            tactic.visual.setStrokeStyle(3, card.color);
            tactic.visual.setDepth(5);
            tactic.radius = card.stats.radius;
            tactic.shieldAmount = card.stats.shieldAmount;
        } else if (card.id === 'decoyBeacon') {
            // Create decoy visual
            tactic.visual = this.add.triangle(x, y, 0, card.stats.size, card.stats.size, card.stats.size, card.stats.size/2, 0, card.color);
            tactic.visual.setStrokeStyle(2, 0xffffff);
            tactic.visual.setDepth(15);
            tactic.tauntRadius = card.stats.tauntRadius;
            tactic.size = card.stats.size;
            
            // Decoy acts like a targetable object
            tactic.isDecoy = true;
        }
        
        this.tactics.push(tactic);
        this.createSpawnEffect(x, y, card.color);
    }
    
    createSpawnEffect(x, y, color) {
        const particles = [];
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const particle = this.add.circle(x, y, 4, color);
            particle.setDepth(30);
            particles.push({
                visual: particle,
                vx: Math.cos(angle) * 100,
                vy: Math.sin(angle) * 100,
                life: 0.5
            });
        }
        this.effects.push(...particles.map(p => ({ ...p, type: 'particle' })));
    }
    
    updateUnits(currentTime, dt) {
        const allUnits = [...this.playerUnits, ...this.aiUnits];
        
        allUnits.forEach(unit => {
            if (unit.hp <= 0) return;
            
            // Find target
            unit.target = this.findTarget(unit);
            
            // Healer drone special behavior
            if (unit.card.id === 'healerDrone') {
                this.updateHealerDrone(unit, currentTime);
            }
            
            if (unit.target) {
                const dx = unit.target.x - unit.x;
                const dy = unit.target.y - unit.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist <= unit.range) {
                    // Attack
                    this.attackTarget(unit, currentTime);
                } else {
                    // Move towards target
                    this.moveUnit(unit, dx / dist, dy / dist, dt);
                }
            } else {
                // Move towards enemy base
                const targetY = unit.isEnemy ? this.playerBaseY : this.aiBaseY;
                const dy = targetY - unit.y;
                const direction = dy > 0 ? 1 : -1;
                this.moveUnit(unit, 0, direction, dt);
            }
            
            // Update visual position
            if (unit.visual.setPosition) {
                unit.visual.setPosition(unit.x, unit.y);
            } else {
                unit.visual.x = unit.x;
                unit.visual.y = unit.y;
            }
            
            // Update HP bar
            if (unit.hpBar) {
                unit.hpBar.container.setPosition(unit.x, unit.y - unit.size - 8);
                const percent = Math.max(0, unit.hp / unit.maxHP);
                unit.hpBar.fill.width = unit.hpBar.barWidth * percent;
            }
        });
    }
    
    findTarget(unit) {
        const enemies = unit.isEnemy ? this.playerUnits : this.aiUnits;
        const enemyTowers = unit.isEnemy ? 
            [this.towers.playerTop, this.towers.playerBottom, this.towers.playerCore] :
            [this.towers.aiTop, this.towers.aiBottom, this.towers.aiCore];
        
        // Check for decoys first
        const decoys = this.tactics.filter(t => 
            t.isDecoy && t.isEnemy !== unit.isEnemy && t.hp > 0
        );
        
        for (const decoy of decoys) {
            const dist = this.getDistance(unit, decoy);
            if (dist <= decoy.tauntRadius) {
                return decoy;
            }
        }
        
        let closestTarget = null;
        let closestDist = Infinity;
        
        // Check enemy units
        enemies.forEach(enemy => {
            if (enemy.hp <= 0) return;
            const dist = this.getDistance(unit, enemy);
            if (dist < closestDist) {
                closestDist = dist;
                closestTarget = enemy;
            }
        });
        
        // Check towers (prioritize lane tower first)
        const laneTower = unit.lane === 'top' ? 
            (unit.isEnemy ? this.towers.playerTop : this.towers.aiTop) :
            (unit.isEnemy ? this.towers.playerBottom : this.towers.aiBottom);
        
        if (laneTower && !laneTower.destroyed) {
            const dist = this.getDistance(unit, laneTower);
            if (dist < closestDist) {
                closestDist = dist;
                closestTarget = laneTower;
            }
        }
        
        // Check core if lane tower is destroyed
        if (!closestTarget || laneTower.destroyed) {
            const core = unit.isEnemy ? this.towers.playerCore : this.towers.aiCore;
            if (core && !core.destroyed) {
                const dist = this.getDistance(unit, core);
                if (dist < closestDist) {
                    closestTarget = core;
                }
            }
        }
        
        return closestTarget;
    }
    
    moveUnit(unit, dx, dy, dt) {
        unit.x += dx * unit.moveSpeed * dt;
        unit.y += dy * unit.moveSpeed * dt;
        
        // Clamp to play area
        unit.x = Phaser.Math.Clamp(unit.x, 20, this.gameWidth - 20);
        unit.y = Phaser.Math.Clamp(unit.y, 20, this.playAreaHeight - 20);
    }
    
    attackTarget(unit, currentTime) {
        let attackSpeed = unit.attackSpeed;
        
        // Apply buff
        const buff = unit.isEnemy ? this.aiBuff : this.playerBuff;
        if (buff === 'fury') {
            attackSpeed *= 1.5;
        }
        
        const attackCooldown = 1000 / attackSpeed;
        
        if (currentTime - unit.lastAttackTime < attackCooldown) return;
        
        unit.lastAttackTime = currentTime;
        
        let damage = unit.damage;
        
        // Check if target has damage reduction
        const targetBuff = unit.target.isEnemy ? this.aiBuff : this.playerBuff;
        if (targetBuff === 'fortify') {
            damage *= 0.5;
        }
        
        // Ranged units fire projectiles
        if (unit.range > 50) {
            this.fireProjectile(unit, unit.target, damage);
        } else {
            // Melee attack
            this.dealDamage(unit.target, damage, unit);
        }
    }
    
    fireProjectile(source, target, damage) {
        const projectile = {
            x: source.x,
            y: source.y,
            target: target,
            damage: damage,
            speed: source.stats.projectileSpeed || 300,
            source: source,
            chainLightning: source.stats.chainLightning,
            maxChains: source.stats.maxChains,
            chainRange: source.stats.chainRange,
            chainDamageFalloff: source.stats.chainDamageFalloff,
            splashRadius: source.stats.splashRadius,
            chainsRemaining: source.stats.maxChains || 0
        };
        
        // Create projectile visual
        const color = source.card.color;
        projectile.visual = this.add.circle(source.x, source.y, 5, color);
        projectile.visual.setDepth(25);
        
        this.projectiles.push(projectile);
    }
    
    updateProjectiles(dt) {
        this.projectiles.forEach(proj => {
            if (!proj.target || (proj.target.hp !== undefined && proj.target.hp <= 0 && !proj.target.isCore)) {
                proj.destroy = true;
                return;
            }
            
            const dx = proj.target.x - proj.x;
            const dy = proj.target.y - proj.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < 10) {
                // Hit target
                this.dealDamage(proj.target, proj.damage, proj.source);
                
                // Chain lightning
                if (proj.chainLightning && proj.chainsRemaining > 0) {
                    this.chainLightning(proj);
                }
                
                // Splash damage
                if (proj.splashRadius) {
                    this.dealSplashDamage(proj.target.x, proj.target.y, proj.damage * 0.5, proj.splashRadius, proj.source);
                }
                
                proj.destroy = true;
            } else {
                // Move towards target
                proj.x += (dx / dist) * proj.speed * dt;
                proj.y += (dy / dist) * proj.speed * dt;
                proj.visual.setPosition(proj.x, proj.y);
            }
        });
    }
    
    chainLightning(proj) {
        const enemies = proj.source.isEnemy ? this.playerUnits : this.aiUnits;
        const alreadyHit = [proj.target];
        
        let currentTarget = proj.target;
        let currentDamage = proj.damage;
        
        for (let i = 0; i < proj.maxChains; i++) {
            let nextTarget = null;
            let nextDist = Infinity;
            
            enemies.forEach(enemy => {
                if (enemy.hp <= 0 || alreadyHit.includes(enemy)) return;
                
                const dist = this.getDistance(currentTarget, enemy);
                if (dist < proj.chainRange && dist < nextDist) {
                    nextDist = dist;
                    nextTarget = enemy;
                }
            });
            
            if (nextTarget) {
                currentDamage *= proj.chainDamageFalloff;
                this.dealDamage(nextTarget, currentDamage, proj.source);
                
                // Lightning effect
                this.createLightningEffect(currentTarget.x, currentTarget.y, nextTarget.x, nextTarget.y);
                
                alreadyHit.push(nextTarget);
                currentTarget = nextTarget;
            } else {
                break;
            }
        }
    }
    
    dealSplashDamage(x, y, damage, radius, source) {
        const enemies = source.isEnemy ? this.playerUnits : this.aiUnits;
        
        enemies.forEach(enemy => {
            if (enemy.hp <= 0) return;
            
            const dist = this.getDistance({ x, y }, enemy);
            if (dist <= radius) {
                const falloff = 1 - (dist / radius) * 0.5;
                this.dealDamage(enemy, damage * falloff, source);
            }
        });
        
        // Splash effect
        this.createSplashEffect(x, y, radius);
    }
    
    dealDamage(target, damage, source) {
        // Check for fortify buff
        const targetBuff = target.isEnemy ? this.aiBuff : this.playerBuff;
        if (targetBuff === 'fortify') {
            damage *= 0.5;
        }
        
        // Check shield first
        if (target.shield > 0) {
            const shieldDamage = Math.min(target.shield, damage);
            target.shield -= shieldDamage;
            damage -= shieldDamage;
        }
        
        target.hp -= damage;
        
        // Check if it's a tower
        if (target.isCore !== undefined) {
            // Add momentum for tower damage
            const momentumGain = damage / 20;
            if (source.isEnemy) {
                this.aiMomentum = Math.min(100, this.aiMomentum + momentumGain);
            } else {
                this.playerMomentum = Math.min(100, this.playerMomentum + momentumGain);
                
                // Show momentum choice when full
                if (this.playerMomentum >= 100 && !this.playerBuff) {
                    this.uiScene.showMomentumChoice();
                }
            }
            
            // Tower destruction
            if (target.hp <= 0) {
                this.destroyTower(target);
            }
        } else if (target.isDecoy) {
            // Decoy takes damage
            if (target.hp <= 0) {
                target.destroy = true;
            }
        } else {
            // Unit death
            if (target.hp <= 0) {
                this.destroyUnit(target);
            }
        }
        
        // Damage number
        this.showDamageNumber(target.x, target.y, Math.floor(damage));
    }
    
    destroyTower(tower) {
        tower.destroyed = true;
        tower.hp = 0;
        
        // Visual destruction
        this.tweens.add({
            targets: [tower.visual, tower.glow],
            alpha: 0,
            scale: 1.5,
            duration: 500,
            onComplete: () => {
                tower.visual.destroy();
                tower.glow.destroy();
                if (tower.hpBar) {
                    tower.hpBar.container.destroy();
                }
            }
        });
        
        // Explosion effect
        this.createExplosionEffect(tower.x, tower.y, tower.isEnemy ? 0xff4444 : 0x4444ff);
        
        // Check for core destruction
        if (tower.isCore) {
            this.endGame(tower.isEnemy ? 'player_core' : 'ai_core');
        }
    }
    
    destroyUnit(unit) {
        // Death effect
        this.createExplosionEffect(unit.x, unit.y, unit.card.color, true);
        
        // Remove visual
        unit.visual.destroy();
        if (unit.hpBar) {
            unit.hpBar.container.destroy();
        }
        
        unit.destroy = true;
    }
    
    updateTowers(currentTime) {
        Object.values(this.towers).forEach(tower => {
            if (tower.destroyed) return;
            
            // Find target
            const enemies = tower.isEnemy ? this.playerUnits : this.aiUnits;
            let target = null;
            let closestDist = Infinity;
            
            // Prioritize units with taunt
            enemies.forEach(enemy => {
                if (enemy.hp <= 0) return;
                
                const dist = this.getDistance(tower, enemy);
                if (dist <= tower.range) {
                    if (enemy.stats.taunt || dist < closestDist) {
                        if (enemy.stats.taunt || !target || !target.stats.taunt) {
                            closestDist = dist;
                            target = enemy;
                        }
                    }
                }
            });
            
            if (target) {
                const attackCooldown = 1000 / tower.attackSpeed;
                if (currentTime - tower.lastAttackTime >= attackCooldown) {
                    tower.lastAttackTime = currentTime;
                    
                    // Fire at target
                    const proj = {
                        x: tower.x,
                        y: tower.y,
                        target: target,
                        damage: tower.damage,
                        speed: 400,
                        source: { isEnemy: tower.isEnemy },
                        visual: this.add.circle(tower.x, tower.y, 6, tower.isEnemy ? 0xff6666 : 0x6666ff)
                    };
                    proj.visual.setDepth(25);
                    this.projectiles.push(proj);
                }
            }
            
            // Update HP bar
            if (tower.hpBar) {
                this.uiScene.updateTowerHP(tower.hpBar, tower.hp, tower.maxHP);
            }
        });
    }
    
    updateHealerDrone(unit, currentTime) {
        if (currentTime - unit.lastHealTime < unit.stats.healCooldown) return;
        
        const allies = unit.isEnemy ? this.aiUnits : this.playerUnits;
        
        allies.forEach(ally => {
            if (ally === unit || ally.hp <= 0) return;
            if (ally.hp >= ally.maxHP) return;
            if (ally.healReceived >= unit.stats.maxHealPerUnit) return;
            
            const dist = this.getDistance(unit, ally);
            if (dist <= unit.stats.healRadius) {
                const healAmount = Math.min(
                    unit.stats.healAmount,
                    ally.maxHP - ally.hp,
                    unit.stats.maxHealPerUnit - ally.healReceived
                );
                
                ally.hp += healAmount;
                ally.healReceived += healAmount;
                
                // Heal effect
                this.createHealEffect(ally.x, ally.y);
            }
        });
        
        unit.lastHealTime = currentTime;
    }
    
    updateTactics(currentTime) {
        this.tactics.forEach(tactic => {
            const elapsed = currentTime - tactic.startTime;
            
            if (elapsed >= tactic.duration || tactic.hp <= 0) {
                tactic.destroy = true;
                return;
            }
            
            // Barrier pad effect
            if (tactic.card.id === 'barrierPad') {
                const allies = tactic.isEnemy ? this.aiUnits : this.playerUnits;
                
                allies.forEach(ally => {
                    if (ally.hp <= 0) return;
                    
                    const dist = this.getDistance(tactic, ally);
                    if (dist <= tactic.radius && ally.shield < tactic.shieldAmount) {
                        ally.shield = tactic.shieldAmount;
                    }
                });
                
                // Fade out near end
                const remaining = tactic.duration - elapsed;
                if (remaining < 500) {
                    tactic.visual.setAlpha(remaining / 500 * 0.3);
                }
            }
        });
    }
    
    updateEffects(dt) {
        this.effects.forEach(effect => {
            if (effect.type === 'particle') {
                effect.x += effect.vx * dt;
                effect.y += effect.vy * dt;
                effect.life -= dt;
                effect.visual.setPosition(effect.x, effect.y);
                effect.visual.setAlpha(effect.life * 2);
                
                if (effect.life <= 0) {
                    effect.destroy = true;
                }
            }
        });
    }
    
    cleanupObjects() {
        // Clean up projectiles
        this.projectiles = this.projectiles.filter(proj => {
            if (proj.destroy) {
                proj.visual.destroy();
                return false;
            }
            return true;
        });
        
        // Clean up units
        this.playerUnits = this.playerUnits.filter(u => !u.destroy);
        this.aiUnits = this.aiUnits.filter(u => !u.destroy);
        
        // Clean up tactics
        this.tactics = this.tactics.filter(t => {
            if (t.destroy) {
                t.visual.destroy();
                return false;
            }
            return true;
        });
        
        // Clean up effects
        this.effects = this.effects.filter(e => {
            if (e.destroy) {
                e.visual.destroy();
                return false;
            }
            return true;
        });
    }
    
    updateUI() {
        if (!this.uiScene) return;
        
        const gameState = {
            timeRemaining: this.timeRemaining,
            doubleElixir: this.doubleElixir,
            playerElixir: this.playerElixir,
            playerMomentum: this.playerMomentum,
            playerBuff: this.playerBuff,
            playerBuffRemaining: this.playerBuff ? this.playerBuffEndTime - Date.now() : 0
        };
        
        this.uiScene.updateHUD(gameState);
    }
    
    checkWinConditions() {
        // Already handled by tower destruction
    }
    
    endGame(reason) {
        if (this.gameOver) return;
        
        this.gameOver = true;
        
        let result, detail;
        
        if (reason === 'player_core') {
            result = '🏆 VICTORY!';
            detail = 'Enemy Core Tower destroyed!';
        } else if (reason === 'ai_core') {
            result = '💀 DEFEAT';
            detail = 'Your Core Tower was destroyed!';
        } else if (reason === 'timeout') {
            // Compare total tower HP
            const playerHP = this.getTotalTowerHP(false);
            const aiHP = this.getTotalTowerHP(true);
            
            if (playerHP > aiHP) {
                result = '🏆 VICTORY!';
                detail = `Time up! Your towers: ${playerHP} HP vs Enemy: ${aiHP} HP`;
            } else if (aiHP > playerHP) {
                result = '💀 DEFEAT';
                detail = `Time up! Your towers: ${playerHP} HP vs Enemy: ${aiHP} HP`;
            } else {
                result = '🤝 DRAW';
                detail = 'Both sides have equal tower HP!';
            }
        }
        
        // Show game over screen
        document.getElementById('game-result').textContent = result;
        document.getElementById('game-result-detail').textContent = detail;
        document.getElementById('game-over-screen').classList.remove('hidden');
    }
    
    getTotalTowerHP(isEnemy) {
        const towers = isEnemy ? 
            [this.towers.aiCore, this.towers.aiTop, this.towers.aiBottom] :
            [this.towers.playerCore, this.towers.playerTop, this.towers.playerBottom];
        
        return towers.reduce((sum, t) => sum + Math.max(0, t.hp), 0);
    }
    
    getDistance(a, b) {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    // Visual effects
    showFloatingText(x, y, text, color) {
        const textObj = this.add.text(x, y, text, {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: color,
            stroke: '#000000',
            strokeThickness: 4
        });
        textObj.setOrigin(0.5);
        textObj.setDepth(100);
        
        this.tweens.add({
            targets: textObj,
            y: y - 50,
            alpha: 0,
            duration: 1500,
            onComplete: () => textObj.destroy()
        });
    }
    
    showDamageNumber(x, y, damage) {
        const textObj = this.add.text(x + (Math.random() - 0.5) * 20, y, `-${damage}`, {
            fontSize: '14px',
            fontFamily: 'Arial',
            color: '#ff4444',
            stroke: '#000000',
            strokeThickness: 2
        });
        textObj.setOrigin(0.5);
        textObj.setDepth(100);
        
        this.tweens.add({
            targets: textObj,
            y: y - 30,
            alpha: 0,
            duration: 800,
            onComplete: () => textObj.destroy()
        });
    }
    
    createExplosionEffect(x, y, color, isSmall = false) {
        const count = isSmall ? 6 : 12;
        const speed = isSmall ? 80 : 150;
        
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const particle = this.add.circle(x, y, isSmall ? 3 : 5, color);
            particle.setDepth(30);
            
            this.effects.push({
                type: 'particle',
                visual: particle,
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 0.5
            });
        }
    }
    
    createLightningEffect(x1, y1, x2, y2) {
        const graphics = this.add.graphics();
        graphics.lineStyle(2, 0xaa44ff, 0.8);
        graphics.lineBetween(x1, y1, x2, y2);
        graphics.setDepth(28);
        
        this.tweens.add({
            targets: graphics,
            alpha: 0,
            duration: 200,
            onComplete: () => graphics.destroy()
        });
    }
    
    createSplashEffect(x, y, radius) {
        const circle = this.add.circle(x, y, radius, 0xff4444, 0.3);
        circle.setDepth(15);
        
        this.tweens.add({
            targets: circle,
            scale: 1.5,
            alpha: 0,
            duration: 300,
            onComplete: () => circle.destroy()
        });
    }
    
    createHealEffect(x, y) {
        const plus = this.add.text(x, y, '+', {
            fontSize: '20px',
            color: '#44ffaa'
        });
        plus.setOrigin(0.5);
        plus.setDepth(30);
        
        this.tweens.add({
            targets: plus,
            y: y - 20,
            alpha: 0,
            duration: 500,
            onComplete: () => plus.destroy()
        });
    }
}

// Export for use in other modules
window.GameScene = GameScene;
