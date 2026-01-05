// ui.js - UI Scene and HUD management for Lane Storm

class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene' });
    }
    
    create() {
        this.gameScene = this.scene.get('GameScene');
        
        // Initialize CharacterArt for card icons
        this.characterArt = new CharacterArt(this);
        
        // UI dimensions
        this.hudHeight = 110;
        this.cardWidth = 64;
        this.cardHeight = 85;
        
        // Colors
        this.colors = {
            hudBg: 0x0f1523,
            hudBorder: 0x4a90d9,
            cardBg: 0x1a2744,
            cardBgAfford: 0x243656,
            cardBorder: 0x3a5a8a,
            cardSelected: 0x50c878,
            elixirBg: 0x1a1a2e,
            elixirFill: 0x9b59b6,
            elixirTick: 0x2a2a4e,
            momentumFill: 0xffd700,
            towerHpPlayer: 0x4ecdc4,
            towerHpEnemy: 0xff6b6b
        };
        
        // Create HUD elements
        this.createHUDBackground();
        this.createTimer();
        this.createElixirBar();
        this.createMomentumMeter();
        this.createCardHand();
        this.createTowerHPDisplays();
        this.setupEventListeners();
        
        // Selected card tracking
        this.selectedCardIndex = -1;
        this.dragCard = null;
        
        // Create placement preview
        this.createPlacementPreview();
        
        // Momentum glow animation
        this.momentumGlowTween = null;
    }
    
    createHUDBackground() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Main HUD background with gradient effect
        this.hudBg = this.add.rectangle(
            width / 2,
            height - this.hudHeight / 2,
            width,
            this.hudHeight,
            this.colors.hudBg,
            0.98
        );
        this.hudBg.setDepth(100);
        
        // Top accent line
        this.hudAccent = this.add.rectangle(
            width / 2,
            height - this.hudHeight,
            width,
            3,
            this.colors.hudBorder
        );
        this.hudAccent.setDepth(101);
        
        // Subtle inner glow
        const glowGraphics = this.add.graphics();
        glowGraphics.fillGradientStyle(0x4a90d9, 0x4a90d9, 0x0f1523, 0x0f1523, 0.15, 0.15, 0, 0);
        glowGraphics.fillRect(0, height - this.hudHeight, width, 20);
        glowGraphics.setDepth(100);
    }
    
    createTimer() {
        const centerX = this.cameras.main.width / 2;
        
        // Timer background pill
        this.timerBg = this.add.graphics();
        this.timerBg.fillStyle(0x0f1523, 0.8);
        this.timerBg.fillRoundedRect(centerX - 50, 8, 100, 36, 18);
        this.timerBg.lineStyle(2, 0x4a90d9, 0.6);
        this.timerBg.strokeRoundedRect(centerX - 50, 8, 100, 36, 18);
        this.timerBg.setDepth(100);
        
        this.timerText = this.add.text(centerX, 26, '2:30', {
            fontSize: '22px',
            fontFamily: 'Exo 2, Arial',
            fontStyle: 'bold',
            color: '#ffffff'
        });
        this.timerText.setOrigin(0.5);
        this.timerText.setDepth(101);
        
        // Double elixir indicator
        this.doubleElixirText = this.add.text(centerX, 52, '⚡ 2X ELIXIR ⚡', {
            fontSize: '11px',
            fontFamily: 'Exo 2, Arial',
            fontStyle: 'bold',
            color: '#ffd700'
        });
        this.doubleElixirText.setOrigin(0.5);
        this.doubleElixirText.setDepth(101);
        this.doubleElixirText.setVisible(false);
    }
    
    createElixirBar() {
        const height = this.cameras.main.height;
        const barWidth = 180;
        const barHeight = 24;
        const startX = 16;
        const startY = height - this.hudHeight + 32;
        
        // Container for elixir elements
        this.elixirContainer = this.add.container(startX, startY);
        this.elixirContainer.setDepth(102);
        
        // Elixir icon
        const icon = this.add.text(-2, 0, '💧', { fontSize: '18px' });
        icon.setOrigin(0.5);
        this.elixirContainer.add(icon);
        
        // Background with rounded corners
        const bgGraphics = this.add.graphics();
        bgGraphics.fillStyle(0x1a1a2e, 1);
        bgGraphics.fillRoundedRect(12, -barHeight/2, barWidth, barHeight, 6);
        bgGraphics.lineStyle(2, 0x3a3a5e, 1);
        bgGraphics.strokeRoundedRect(12, -barHeight/2, barWidth, barHeight, 6);
        this.elixirContainer.add(bgGraphics);
        
        // Tick marks for each elixir point
        const tickGraphics = this.add.graphics();
        tickGraphics.lineStyle(1, 0x4a4a6e, 0.5);
        for (let i = 1; i < 10; i++) {
            const tickX = 12 + (barWidth / 10) * i;
            tickGraphics.lineBetween(tickX, -barHeight/2 + 4, tickX, barHeight/2 - 4);
        }
        this.elixirContainer.add(tickGraphics);
        
        // Fill bar (will be updated)
        this.elixirFill = this.add.rectangle(
            14, 0, 0, barHeight - 6, this.colors.elixirFill
        );
        this.elixirFill.setOrigin(0, 0.5);
        this.elixirContainer.add(this.elixirFill);
        
        // Shine effect on fill
        this.elixirShine = this.add.rectangle(
            14, -barHeight/4, 0, barHeight/4, 0xffffff, 0.15
        );
        this.elixirShine.setOrigin(0, 0.5);
        this.elixirContainer.add(this.elixirShine);
        
        // Text overlay
        this.elixirText = this.add.text(12 + barWidth/2, 0, '5', {
            fontSize: '16px',
            fontFamily: 'Exo 2, Arial',
            fontStyle: 'bold',
            color: '#ffffff'
        });
        this.elixirText.setOrigin(0.5);
        this.elixirContainer.add(this.elixirText);
        
        this.elixirBarWidth = barWidth - 4;
    }
    
    createMomentumMeter() {
        const height = this.cameras.main.height;
        const width = this.cameras.main.width;
        const barWidth = 130;
        const barHeight = 20;
        const startX = width - barWidth - 24;
        const startY = height - this.hudHeight + 32;
        
        this.momentumContainer = this.add.container(startX, startY);
        this.momentumContainer.setDepth(102);
        
        // Label
        const label = this.add.text(barWidth/2, -16, '⚡ MOMENTUM', {
            fontSize: '10px',
            fontFamily: 'Exo 2, Arial',
            fontStyle: 'bold',
            color: '#ffd700'
        });
        label.setOrigin(0.5);
        this.momentumContainer.add(label);
        
        // Background
        const bgGraphics = this.add.graphics();
        bgGraphics.fillStyle(0x1a1a2e, 1);
        bgGraphics.fillRoundedRect(0, -barHeight/2, barWidth, barHeight, 5);
        bgGraphics.lineStyle(2, 0x5a5a3e, 1);
        bgGraphics.strokeRoundedRect(0, -barHeight/2, barWidth, barHeight, 5);
        this.momentumContainer.add(bgGraphics);
        
        // Fill bar
        this.momentumFill = this.add.rectangle(
            2, 0, 0, barHeight - 4, this.colors.momentumFill
        );
        this.momentumFill.setOrigin(0, 0.5);
        this.momentumContainer.add(this.momentumFill);
        
        // Glow overlay (for full momentum)
        this.momentumGlow = this.add.rectangle(
            barWidth/2, 0, barWidth, barHeight, 0xffd700, 0
        );
        this.momentumContainer.add(this.momentumGlow);
        
        // Percentage text
        this.momentumText = this.add.text(barWidth/2, 0, '0%', {
            fontSize: '12px',
            fontFamily: 'Exo 2, Arial',
            fontStyle: 'bold',
            color: '#ffffff'
        });
        this.momentumText.setOrigin(0.5);
        this.momentumContainer.add(this.momentumText);
        
        // Buff indicator below
        this.buffIndicator = this.add.text(barWidth/2, 20, '', {
            fontSize: '11px',
            fontFamily: 'Exo 2, Arial',
            fontStyle: 'bold',
            color: '#ffffff'
        });
        this.buffIndicator.setOrigin(0.5);
        this.momentumContainer.add(this.buffIndicator);
        
        this.momentumBarWidth = barWidth - 4;
    }
    
    createCardHand() {
        const height = this.cameras.main.height;
        const width = this.cameras.main.width;
        const totalCardsWidth = 4 * this.cardWidth + 3 * 8;
        const startX = (width - totalCardsWidth) / 2 + this.cardWidth / 2;
        const cardY = height - 54;
        
        this.cardSlots = [];
        this.cardContainers = [];
        
        for (let i = 0; i < 4; i++) {
            const x = startX + i * (this.cardWidth + 8);
            
            // Card container
            const container = this.add.container(x, cardY);
            container.setDepth(103);
            container.setSize(this.cardWidth, this.cardHeight);
            container.setInteractive();
            container.cardIndex = i;
            
            this.cardSlots.push(container);
            this.cardContainers.push(container);
        }
        
        // Next card
        const nextX = startX + 4 * (this.cardWidth + 8) + 20;
        
        this.nextCardLabel = this.add.text(nextX, cardY - 38, 'NEXT', {
            fontSize: '9px',
            fontFamily: 'Exo 2, Arial',
            fontStyle: 'bold',
            color: '#6a7a8a',
            letterSpacing: 1
        });
        this.nextCardLabel.setOrigin(0.5);
        this.nextCardLabel.setDepth(105);
        
        this.nextCardContainer = this.add.container(nextX, cardY);
        this.nextCardContainer.setDepth(103);
    }
    
    createTowerHPDisplays() {
        this.towerHPBars = {};
    }
    
    createPlacementPreview() {
        this.placementPreview = this.add.container(0, 0);
        this.placementPreview.setDepth(50);
        
        const ring = this.add.circle(0, 0, 24, 0x50c878, 0);
        ring.setStrokeStyle(3, 0x50c878, 0.8);
        this.placementPreview.add(ring);
        
        const innerRing = this.add.circle(0, 0, 16, 0x50c878, 0.2);
        this.placementPreview.add(innerRing);
        
        this.placementPreview.setVisible(false);
    }
    
    setupEventListeners() {
        this.cardSlots.forEach((container, index) => {
            container.on('pointerdown', () => this.onCardClick(index));
        });
        
        this.input.on('pointerdown', (pointer) => this.onFieldClick(pointer));
        this.input.on('pointermove', (pointer) => this.onPointerMove(pointer));
        this.input.on('pointerup', (pointer) => this.onPointerUp(pointer));
    }
    
    onCardClick(index) {
        if (!this.gameScene || !this.gameScene.playerDeck) return;
        
        const card = this.gameScene.playerDeck.getHandCards()[index];
        if (!card) return;
        
        if (!this.gameScene.playerDeck.canAfford(index, this.gameScene.playerElixir)) {
            this.flashCardRed(index);
            return;
        }
        
        if (this.selectedCardIndex === index) {
            this.deselectCard();
        } else {
            this.selectCard(index);
        }
    }
    
    selectCard(index) {
        this.deselectCard();
        this.selectedCardIndex = index;
        
        // Animate selection
        this.tweens.add({
            targets: this.cardContainers[index],
            y: this.cardContainers[index].y - 12,
            scaleX: 1.08,
            scaleY: 1.08,
            duration: 100,
            ease: 'Back.easeOut'
        });
    }
    
    deselectCard() {
        if (this.selectedCardIndex >= 0) {
            const container = this.cardContainers[this.selectedCardIndex];
            const originalY = this.cameras.main.height - 54;
            
            this.tweens.add({
                targets: container,
                y: originalY,
                scaleX: 1,
                scaleY: 1,
                duration: 100
            });
        }
        this.selectedCardIndex = -1;
        this.placementPreview.setVisible(false);
    }
    
    flashCardRed(index) {
        const container = this.cardContainers[index];
        
        this.tweens.add({
            targets: container,
            x: container.x - 4,
            duration: 50,
            yoyo: true,
            repeat: 2
        });
    }
    
    onPointerMove(pointer) {
        if (this.selectedCardIndex >= 0) {
            if (this.isValidPlacement(pointer.x, pointer.y)) {
                this.placementPreview.setPosition(pointer.x, pointer.y);
                this.placementPreview.setVisible(true);
            } else {
                this.placementPreview.setVisible(false);
            }
        }
    }
    
    onPointerUp(pointer) {
        if (this.dragCard) {
            if (this.isValidPlacement(pointer.x, pointer.y)) {
                this.placeCard(this.dragCard.index, pointer.x, pointer.y);
            }
            this.dragCard = null;
            this.deselectCard();
        }
    }
    
    onFieldClick(pointer) {
        if (pointer.y > this.cameras.main.height - this.hudHeight) {
            return;
        }
        
        if (this.selectedCardIndex >= 0) {
            if (this.isValidPlacement(pointer.x, pointer.y)) {
                this.placeCard(this.selectedCardIndex, pointer.x, pointer.y);
            }
            this.deselectCard();
        }
    }
    
    isValidPlacement(x, y) {
        if (!this.gameScene) return false;
        const height = this.cameras.main.height;
        const midY = (height - this.hudHeight) / 2;
        return y > midY && y < height - this.hudHeight - 10;
    }
    
    placeCard(cardIndex, x, y) {
        if (!this.gameScene) return;
        const width = this.cameras.main.width;
        const lane = x < width / 2 ? 'top' : 'bottom';
        this.gameScene.playerPlayCard(cardIndex, x, y, lane);
    }
    
    updateHUD(gameState) {
        if (!gameState) return;
        
        // Timer
        const minutes = Math.floor(gameState.timeRemaining / 60);
        const seconds = Math.floor(gameState.timeRemaining % 60);
        this.timerText.setText(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        
        if (gameState.timeRemaining <= 30) {
            this.timerText.setColor('#ff4757');
        } else if (gameState.timeRemaining <= 60) {
            this.timerText.setColor('#ffa502');
        } else {
            this.timerText.setColor('#ffffff');
        }
        
        this.doubleElixirText.setVisible(gameState.doubleElixir);
        
        // Elixir bar with smooth animation
        const elixirPercent = gameState.playerElixir / 10;
        const targetWidth = this.elixirBarWidth * elixirPercent;
        this.elixirFill.width = targetWidth;
        this.elixirShine.width = targetWidth;
        this.elixirText.setText(Math.floor(gameState.playerElixir).toString());
        
        // Momentum meter
        const momentumPercent = gameState.playerMomentum / 100;
        this.momentumFill.width = this.momentumBarWidth * momentumPercent;
        this.momentumText.setText(`${Math.floor(gameState.playerMomentum)}%`);
        
        // Glow when full
        if (gameState.playerMomentum >= 100) {
            if (!this.momentumGlowTween) {
                this.momentumGlow.setAlpha(0.3);
                this.momentumGlowTween = this.tweens.add({
                    targets: this.momentumGlow,
                    alpha: 0,
                    duration: 500,
                    yoyo: true,
                    repeat: -1
                });
            }
        } else {
            if (this.momentumGlowTween) {
                this.momentumGlowTween.stop();
                this.momentumGlowTween = null;
                this.momentumGlow.setAlpha(0);
            }
        }
        
        // Buff indicator
        if (gameState.playerBuff) {
            const remaining = Math.ceil(gameState.playerBuffRemaining / 1000);
            if (gameState.playerBuff === 'fury') {
                this.buffIndicator.setText(`⚔️ FURY ${remaining}s`);
                this.buffIndicator.setColor('#ff6b6b');
            } else {
                this.buffIndicator.setText(`🛡️ FORTIFY ${remaining}s`);
                this.buffIndicator.setColor('#4ecdc4');
            }
        } else {
            this.buffIndicator.setText('');
        }
        
        this.updateCardDisplay(gameState);
    }
    
    updateCardDisplay(gameState) {
        if (!this.gameScene || !this.gameScene.playerDeck) return;
        
        const hand = this.gameScene.playerDeck.getHandCards();
        const nextCard = this.gameScene.playerDeck.getNextCard();
        
        hand.forEach((card, index) => {
            this.renderCard(
                this.cardContainers[index],
                card,
                this.gameScene.playerDeck.canAfford(index, gameState.playerElixir),
                index === this.selectedCardIndex
            );
        });
        
        if (nextCard) {
            this.renderCard(this.nextCardContainer, nextCard, false, false, true);
        }
    }
    
    renderCard(container, card, canAfford, isSelected, isSmall = false) {
        container.removeAll(true);
        
        const scale = isSmall ? 0.65 : 1;
        const w = this.cardWidth * scale;
        const h = this.cardHeight * scale;
        
        // Card shadow
        if (!isSmall) {
            const shadow = this.add.ellipse(0, h/2 - 2, w * 0.8, 8, 0x000000, 0.3);
            container.add(shadow);
        }
        
        // Card background with gradient
        const bgColor = canAfford ? this.colors.cardBgAfford : this.colors.cardBg;
        const borderColor = isSelected ? this.colors.cardSelected : this.colors.cardBorder;
        
        const cardBg = this.add.graphics();
        cardBg.fillStyle(bgColor, 1);
        cardBg.fillRoundedRect(-w/2, -h/2, w, h, 8 * scale);
        cardBg.lineStyle(2 * scale, borderColor, 1);
        cardBg.strokeRoundedRect(-w/2, -h/2, w, h, 8 * scale);
        container.add(cardBg);
        
        // Inner highlight
        const highlight = this.add.graphics();
        highlight.fillStyle(0xffffff, 0.05);
        highlight.fillRoundedRect(-w/2 + 3, -h/2 + 3, w - 6, h/3, 6 * scale);
        container.add(highlight);
        
        // Card icon - use CharacterArt for units
        const iconY = -h/4 - 2;
        const iconSize = 18 * scale;
        
        if (card.type === CARD_TYPES.UNIT && this.characterArt) {
            const iconKey = this.characterArt.generateIconTexture(card.id);
            const charIcon = this.add.image(0, iconY, iconKey);
            charIcon.setScale(0.7 * scale);
            container.add(charIcon);
        } else {
            this.createCardIcon(container, card, iconY, iconSize);
        }
        
        // Card name
        const name = this.add.text(0, h/4 - 6 * scale, card.name, {
            fontSize: `${10 * scale}px`,
            fontFamily: 'Exo 2, Arial',
            fontStyle: 'bold',
            color: '#ffffff'
        });
        name.setOrigin(0.5);
        container.add(name);
        
        // Cost badge
        const badgeSize = 18 * scale;
        const badgeX = -w/2 + badgeSize/2 + 4;
        const badgeY = -h/2 + badgeSize/2 + 4;
        
        const costBadge = this.add.graphics();
        costBadge.fillStyle(0x9b59b6, 1);
        costBadge.fillCircle(badgeX, badgeY, badgeSize/2);
        costBadge.lineStyle(2 * scale, 0xc27be8, 1);
        costBadge.strokeCircle(badgeX, badgeY, badgeSize/2);
        container.add(costBadge);
        
        const costText = this.add.text(badgeX, badgeY, card.cost.toString(), {
            fontSize: `${12 * scale}px`,
            fontFamily: 'Exo 2, Arial',
            fontStyle: 'bold',
            color: '#ffffff'
        });
        costText.setOrigin(0.5);
        container.add(costText);
        
        // Darken if can't afford
        if (!canAfford && !isSmall) {
            const overlay = this.add.graphics();
            overlay.fillStyle(0x000000, 0.5);
            overlay.fillRoundedRect(-w/2, -h/2, w, h, 8);
            container.add(overlay);
        }
    }
    
    createCardIcon(container, card, y, size) {
        let icon;
        
        switch (card.shape) {
            case 'triangle':
                icon = this.add.triangle(0, y, -size/2, size/2, size/2, size/2, 0, -size/2, card.color);
                break;
            case 'hexagon':
                icon = this.add.polygon(0, y, [
                    0, -size, size*0.87, -size/2, size*0.87, size/2,
                    0, size, -size*0.87, size/2, -size*0.87, -size/2
                ], card.color);
                icon.setScale(0.6);
                break;
            case 'square':
                icon = this.add.rectangle(0, y, size, size, card.color);
                break;
            case 'diamond':
                icon = this.add.polygon(0, y, [0, -size, size, 0, 0, size, -size, 0], card.color);
                icon.setScale(0.6);
                break;
            case 'circle':
                icon = this.add.circle(0, y, size/2, card.color);
                break;
            case 'plus':
                const h = this.add.rectangle(0, y, size, size/3, card.color);
                const v = this.add.rectangle(0, y, size/3, size, card.color);
                container.add(h);
                container.add(v);
                return;
            case 'zone':
                icon = this.add.circle(0, y, size/2, card.color, 0.4);
                icon.setStrokeStyle(2, card.color);
                break;
            case 'beacon':
                icon = this.add.triangle(0, y, -size/2, size/2, size/2, size/2, 0, -size/2, card.color);
                icon.setStrokeStyle(2, 0xffffff);
                break;
            default:
                icon = this.add.circle(0, y, size/2, card.color);
        }
        
        if (icon) {
            container.add(icon);
        }
    }
    
    createTowerHPBar(x, y, isEnemy, isCore = false) {
        const barWidth = isCore ? 60 : 45;
        const barHeight = 7;
        
        const container = this.add.container(x, y - (isCore ? 45 : 35));
        container.setDepth(90);
        
        // Background
        const bg = this.add.graphics();
        bg.fillStyle(0x1a1a2e, 0.9);
        bg.fillRoundedRect(-barWidth/2, -barHeight/2, barWidth, barHeight, 3);
        bg.lineStyle(1, 0x3a3a5e, 1);
        bg.strokeRoundedRect(-barWidth/2, -barHeight/2, barWidth, barHeight, 3);
        container.add(bg);
        
        // Fill
        const fillColor = isEnemy ? this.colors.towerHpEnemy : this.colors.towerHpPlayer;
        const fill = this.add.rectangle(-barWidth/2 + 2, 0, barWidth - 4, barHeight - 3, fillColor);
        fill.setOrigin(0, 0.5);
        container.add(fill);
        
        // Crown icon for core
        if (isCore) {
            const crown = this.add.text(0, -12, '👑', { fontSize: '10px' });
            crown.setOrigin(0.5);
            container.add(crown);
        }
        
        return { container, fill, barWidth: barWidth - 4 };
    }
    
    updateTowerHP(bar, currentHP, maxHP) {
        if (!bar || !bar.fill) return;
        const percent = Math.max(0, currentHP / maxHP);
        bar.fill.width = bar.barWidth * percent;
        
        // Color change based on HP
        if (percent < 0.3) {
            bar.fill.setFillStyle(0xff4757);
        } else if (percent < 0.6) {
            bar.fill.setFillStyle(0xffa502);
        }
    }
    
    showMomentumChoice() {
        document.getElementById('momentum-choice').classList.remove('hidden');
    }
    
    hideMomentumChoice() {
        document.getElementById('momentum-choice').classList.add('hidden');
    }
}

window.UIScene = UIScene;
