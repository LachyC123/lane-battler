// ui.js - UI Scene and HUD management for Lane Storm

class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene' });
    }
    
    create() {
        this.gameScene = this.scene.get('GameScene');
        
        // UI dimensions
        this.hudHeight = 100;
        this.cardWidth = 70;
        this.cardHeight = 90;
        
        // Create HUD background
        this.createHUDBackground();
        
        // Create timer display
        this.createTimer();
        
        // Create elixir bar
        this.createElixirBar();
        
        // Create momentum meter
        this.createMomentumMeter();
        
        // Create card hand display
        this.createCardHand();
        
        // Create tower HP displays
        this.createTowerHPDisplays();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Selected card tracking
        this.selectedCardIndex = -1;
        this.selectedCardVisual = null;
        this.dragCard = null;
        
        // Create placement preview
        this.createPlacementPreview();
    }
    
    createHUDBackground() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Bottom HUD bar
        this.hudBg = this.add.rectangle(
            width / 2,
            height - this.hudHeight / 2,
            width,
            this.hudHeight,
            0x1a1a2e,
            0.95
        );
        this.hudBg.setDepth(100);
        
        // HUD border
        this.hudBorder = this.add.rectangle(
            width / 2,
            height - this.hudHeight,
            width,
            3,
            0x4a90d9
        );
        this.hudBorder.setDepth(101);
    }
    
    createTimer() {
        this.timerText = this.add.text(
            this.cameras.main.width / 2,
            20,
            '2:30',
            {
                fontSize: '28px',
                fontFamily: 'Arial',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 3
            }
        );
        this.timerText.setOrigin(0.5);
        this.timerText.setDepth(101);
        
        // Double elixir indicator
        this.doubleElixirText = this.add.text(
            this.cameras.main.width / 2,
            48,
            '⚡ DOUBLE ELIXIR ⚡',
            {
                fontSize: '14px',
                fontFamily: 'Arial',
                color: '#ffd700'
            }
        );
        this.doubleElixirText.setOrigin(0.5);
        this.doubleElixirText.setDepth(101);
        this.doubleElixirText.setVisible(false);
    }
    
    createElixirBar() {
        const height = this.cameras.main.height;
        const barWidth = 200;
        const barHeight = 20;
        const startX = 20;
        const startY = height - 30;
        
        // Background
        this.elixirBg = this.add.rectangle(
            startX + barWidth / 2,
            startY,
            barWidth,
            barHeight,
            0x333333
        );
        this.elixirBg.setDepth(102);
        
        // Fill bar
        this.elixirFill = this.add.rectangle(
            startX + 2,
            startY,
            0,
            barHeight - 4,
            0x9b59b6
        );
        this.elixirFill.setOrigin(0, 0.5);
        this.elixirFill.setDepth(103);
        
        // Border
        this.elixirBorder = this.add.rectangle(
            startX + barWidth / 2,
            startY,
            barWidth,
            barHeight,
            0x4a90d9
        );
        this.elixirBorder.setStrokeStyle(2, 0x4a90d9);
        this.elixirBorder.setFillStyle();
        this.elixirBorder.setDepth(104);
        
        // Text
        this.elixirText = this.add.text(
            startX + barWidth / 2,
            startY,
            '5/10',
            {
                fontSize: '14px',
                fontFamily: 'Arial',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 2
            }
        );
        this.elixirText.setOrigin(0.5);
        this.elixirText.setDepth(105);
        
        // Icon
        this.add.text(startX - 15, startY, '💧', { fontSize: '16px' })
            .setOrigin(0.5)
            .setDepth(105);
    }
    
    createMomentumMeter() {
        const height = this.cameras.main.height;
        const width = this.cameras.main.width;
        const barWidth = 150;
        const barHeight = 16;
        const startX = width - 170;
        const startY = height - 30;
        
        // Background
        this.momentumBg = this.add.rectangle(
            startX + barWidth / 2,
            startY,
            barWidth,
            barHeight,
            0x333333
        );
        this.momentumBg.setDepth(102);
        
        // Fill bar
        this.momentumFill = this.add.rectangle(
            startX + 2,
            startY,
            0,
            barHeight - 4,
            0xffd700
        );
        this.momentumFill.setOrigin(0, 0.5);
        this.momentumFill.setDepth(103);
        
        // Border
        this.momentumBorder = this.add.rectangle(
            startX + barWidth / 2,
            startY,
            barWidth,
            barHeight,
            0xffd700
        );
        this.momentumBorder.setStrokeStyle(2, 0xffd700);
        this.momentumBorder.setFillStyle();
        this.momentumBorder.setDepth(104);
        
        // Text
        this.momentumText = this.add.text(
            startX + barWidth / 2,
            startY,
            '0%',
            {
                fontSize: '12px',
                fontFamily: 'Arial',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 2
            }
        );
        this.momentumText.setOrigin(0.5);
        this.momentumText.setDepth(105);
        
        // Label
        this.add.text(startX + barWidth / 2, startY - 14, '⚡ MOMENTUM', {
            fontSize: '10px',
            fontFamily: 'Arial',
            color: '#ffd700'
        }).setOrigin(0.5).setDepth(105);
        
        // Active buff indicator
        this.buffIndicator = this.add.text(
            startX + barWidth / 2,
            startY + 18,
            '',
            {
                fontSize: '12px',
                fontFamily: 'Arial',
                color: '#ffffff'
            }
        );
        this.buffIndicator.setOrigin(0.5);
        this.buffIndicator.setDepth(105);
    }
    
    createCardHand() {
        const height = this.cameras.main.height;
        const width = this.cameras.main.width;
        const startX = 240;
        const cardY = height - 55;
        
        this.cardSlots = [];
        this.cardGraphics = [];
        
        for (let i = 0; i < 4; i++) {
            const x = startX + i * (this.cardWidth + 10);
            
            // Card background/slot
            const slot = this.add.rectangle(
                x, cardY,
                this.cardWidth, this.cardHeight,
                0x2a2a4e
            );
            slot.setStrokeStyle(2, 0x4a90d9);
            slot.setDepth(102);
            slot.setInteractive();
            slot.cardIndex = i;
            
            this.cardSlots.push(slot);
            
            // Card content container
            const cardContainer = this.add.container(x, cardY);
            cardContainer.setDepth(103);
            this.cardGraphics.push(cardContainer);
        }
        
        // Next card indicator
        const nextX = startX + 4 * (this.cardWidth + 10) + 30;
        this.nextCardLabel = this.add.text(
            nextX, cardY - 35,
            'NEXT',
            {
                fontSize: '10px',
                fontFamily: 'Arial',
                color: '#aaaaaa'
            }
        );
        this.nextCardLabel.setOrigin(0.5);
        this.nextCardLabel.setDepth(105);
        
        this.nextCardSlot = this.add.rectangle(
            nextX, cardY,
            this.cardWidth * 0.7, this.cardHeight * 0.7,
            0x1a1a2e
        );
        this.nextCardSlot.setStrokeStyle(2, 0x666666);
        this.nextCardSlot.setDepth(102);
        
        this.nextCardContainer = this.add.container(nextX, cardY);
        this.nextCardContainer.setDepth(103);
    }
    
    createTowerHPDisplays() {
        // These will be positioned by the game scene
        this.towerHPBars = {
            playerCore: null,
            playerTop: null,
            playerBottom: null,
            aiCore: null,
            aiTop: null,
            aiBottom: null
        };
    }
    
    createPlacementPreview() {
        this.placementPreview = this.add.circle(0, 0, 20, 0x44ff44, 0.3);
        this.placementPreview.setStrokeStyle(2, 0x44ff44);
        this.placementPreview.setVisible(false);
        this.placementPreview.setDepth(50);
    }
    
    setupEventListeners() {
        // Card slot interactions
        this.cardSlots.forEach((slot, index) => {
            slot.on('pointerdown', () => this.onCardClick(index));
        });
        
        // Game field interaction
        this.input.on('pointerdown', (pointer) => this.onFieldClick(pointer));
        this.input.on('pointermove', (pointer) => this.onPointerMove(pointer));
        this.input.on('pointerup', (pointer) => this.onPointerUp(pointer));
        
        // Drag handling
        this.input.on('dragstart', (pointer, gameObject) => {
            if (gameObject.cardIndex !== undefined) {
                this.startDrag(gameObject.cardIndex, pointer);
            }
        });
    }
    
    onCardClick(index) {
        if (!this.gameScene || !this.gameScene.playerDeck) return;
        
        const card = this.gameScene.playerDeck.getHandCards()[index];
        if (!card) return;
        
        // Check if can afford
        if (!this.gameScene.playerDeck.canAfford(index, this.gameScene.playerElixir)) {
            this.flashCardRed(index);
            return;
        }
        
        // Toggle selection
        if (this.selectedCardIndex === index) {
            this.deselectCard();
        } else {
            this.selectCard(index);
        }
    }
    
    selectCard(index) {
        this.deselectCard();
        this.selectedCardIndex = index;
        
        // Visual feedback
        this.cardSlots[index].setStrokeStyle(3, 0x44ff44);
        
        // Scale up
        this.tweens.add({
            targets: [this.cardSlots[index], this.cardGraphics[index]],
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 100
        });
    }
    
    deselectCard() {
        if (this.selectedCardIndex >= 0) {
            const slot = this.cardSlots[this.selectedCardIndex];
            slot.setStrokeStyle(2, 0x4a90d9);
            
            this.tweens.add({
                targets: [slot, this.cardGraphics[this.selectedCardIndex]],
                scaleX: 1,
                scaleY: 1,
                duration: 100
            });
        }
        this.selectedCardIndex = -1;
        this.placementPreview.setVisible(false);
    }
    
    flashCardRed(index) {
        const slot = this.cardSlots[index];
        slot.setStrokeStyle(3, 0xff4444);
        this.time.delayedCall(200, () => {
            if (this.selectedCardIndex !== index) {
                slot.setStrokeStyle(2, 0x4a90d9);
            }
        });
    }
    
    startDrag(cardIndex, pointer) {
        if (!this.gameScene || !this.gameScene.playerDeck) return;
        
        const card = this.gameScene.playerDeck.getHandCards()[cardIndex];
        if (!card) return;
        
        if (!this.gameScene.playerDeck.canAfford(cardIndex, this.gameScene.playerElixir)) {
            this.flashCardRed(cardIndex);
            return;
        }
        
        this.dragCard = {
            index: cardIndex,
            card: card
        };
        
        this.selectCard(cardIndex);
    }
    
    onPointerMove(pointer) {
        if (this.selectedCardIndex >= 0 || this.dragCard) {
            const inPlacementArea = this.isValidPlacement(pointer.x, pointer.y);
            
            if (inPlacementArea) {
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
        // Ignore clicks on HUD
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
        
        // Player can only place on their half (bottom)
        return y > midY && y < height - this.hudHeight - 10;
    }
    
    placeCard(cardIndex, x, y) {
        if (!this.gameScene) return;
        
        // Determine lane based on x position
        const width = this.cameras.main.width;
        const lane = x < width / 2 ? 'top' : 'bottom';
        
        this.gameScene.playerPlayCard(cardIndex, x, y, lane);
    }
    
    updateHUD(gameState) {
        if (!gameState) return;
        
        // Update timer
        const minutes = Math.floor(gameState.timeRemaining / 60);
        const seconds = Math.floor(gameState.timeRemaining % 60);
        this.timerText.setText(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        
        // Flash timer when low
        if (gameState.timeRemaining <= 30) {
            this.timerText.setColor('#ff4444');
        } else if (gameState.timeRemaining <= 60) {
            this.timerText.setColor('#ffaa00');
        } else {
            this.timerText.setColor('#ffffff');
        }
        
        // Double elixir indicator
        this.doubleElixirText.setVisible(gameState.doubleElixir);
        
        // Update elixir bar
        const elixirPercent = gameState.playerElixir / 10;
        this.elixirFill.width = (200 - 4) * elixirPercent;
        this.elixirText.setText(`${Math.floor(gameState.playerElixir)}/10`);
        
        // Update momentum meter
        const momentumPercent = gameState.playerMomentum / 100;
        this.momentumFill.width = (150 - 4) * momentumPercent;
        this.momentumText.setText(`${Math.floor(gameState.playerMomentum)}%`);
        
        // Glow effect when momentum is full
        if (gameState.playerMomentum >= 100) {
            this.momentumFill.setFillStyle(0xffff00);
            this.momentumBorder.setStrokeStyle(3, 0xffff00);
        } else {
            this.momentumFill.setFillStyle(0xffd700);
            this.momentumBorder.setStrokeStyle(2, 0xffd700);
        }
        
        // Update buff indicator
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
        
        // Update cards
        this.updateCardDisplay(gameState);
    }
    
    updateCardDisplay(gameState) {
        if (!this.gameScene || !this.gameScene.playerDeck) return;
        
        const hand = this.gameScene.playerDeck.getHandCards();
        const nextCard = this.gameScene.playerDeck.getNextCard();
        
        // Update hand cards
        hand.forEach((card, index) => {
            this.updateSingleCard(
                this.cardGraphics[index],
                card,
                this.gameScene.playerDeck.canAfford(index, gameState.playerElixir)
            );
        });
        
        // Update next card
        if (nextCard) {
            this.updateSingleCard(this.nextCardContainer, nextCard, false, true);
        }
    }
    
    updateSingleCard(container, card, canAfford, isSmall = false) {
        // Clear existing graphics
        container.removeAll(true);
        
        const scale = isSmall ? 0.7 : 1;
        const w = this.cardWidth * scale;
        const h = this.cardHeight * scale;
        
        // Card background
        const bg = this.add.rectangle(0, 0, w - 4, h - 4, canAfford ? 0x3a3a5e : 0x2a2a3e);
        container.add(bg);
        
        // Card icon (shape based on card)
        const iconY = -h/4;
        const iconSize = 16 * scale;
        
        let icon;
        switch (card.shape) {
            case 'triangle':
                icon = this.add.triangle(0, iconY, 0, iconSize, iconSize, iconSize, iconSize/2, 0, card.color);
                break;
            case 'hexagon':
                icon = this.add.polygon(0, iconY, [
                    0, -iconSize, iconSize*0.87, -iconSize/2, iconSize*0.87, iconSize/2,
                    0, iconSize, -iconSize*0.87, iconSize/2, -iconSize*0.87, -iconSize/2
                ], card.color);
                break;
            case 'square':
                icon = this.add.rectangle(0, iconY, iconSize, iconSize, card.color);
                break;
            case 'diamond':
                icon = this.add.polygon(0, iconY, [0, -iconSize, iconSize, 0, 0, iconSize, -iconSize, 0], card.color);
                break;
            case 'circle':
                icon = this.add.circle(0, iconY, iconSize/2, card.color);
                break;
            case 'plus':
                icon = this.add.rectangle(0, iconY, iconSize, iconSize/3, card.color);
                const plusV = this.add.rectangle(0, iconY, iconSize/3, iconSize, card.color);
                container.add(plusV);
                break;
            case 'zone':
                icon = this.add.circle(0, iconY, iconSize/2, card.color, 0.5);
                icon.setStrokeStyle(2, card.color);
                break;
            case 'beacon':
                icon = this.add.triangle(0, iconY, 0, iconSize, iconSize, iconSize, iconSize/2, 0, card.color);
                icon.setStrokeStyle(2, 0xffffff);
                break;
            default:
                icon = this.add.circle(0, iconY, iconSize/2, card.color);
        }
        container.add(icon);
        
        // Card name
        const nameText = this.add.text(0, h/4 - 10, card.name, {
            fontSize: `${10 * scale}px`,
            fontFamily: 'Arial',
            color: '#ffffff',
            align: 'center'
        });
        nameText.setOrigin(0.5);
        container.add(nameText);
        
        // Elixir cost
        const costBg = this.add.circle(-w/2 + 12, -h/2 + 12, 10 * scale, 0x9b59b6);
        const costText = this.add.text(-w/2 + 12, -h/2 + 12, card.cost.toString(), {
            fontSize: `${12 * scale}px`,
            fontFamily: 'Arial',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        costText.setOrigin(0.5);
        container.add(costBg);
        container.add(costText);
        
        // Dim if can't afford
        if (!canAfford && !isSmall) {
            const overlay = this.add.rectangle(0, 0, w - 4, h - 4, 0x000000, 0.5);
            container.add(overlay);
        }
    }
    
    createTowerHPBar(x, y, isEnemy) {
        const barWidth = 50;
        const barHeight = 8;
        
        const container = this.add.container(x, y - 30);
        container.setDepth(90);
        
        const bg = this.add.rectangle(0, 0, barWidth, barHeight, 0x333333);
        const fill = this.add.rectangle(-barWidth/2 + 1, 0, barWidth - 2, barHeight - 2, isEnemy ? 0xff4444 : 0x44ff44);
        fill.setOrigin(0, 0.5);
        
        const border = this.add.rectangle(0, 0, barWidth, barHeight);
        border.setStrokeStyle(1, 0xffffff);
        border.setFillStyle();
        
        container.add(bg);
        container.add(fill);
        container.add(border);
        
        return { container, fill, barWidth };
    }
    
    updateTowerHP(bar, currentHP, maxHP) {
        if (!bar || !bar.fill) return;
        const percent = Math.max(0, currentHP / maxHP);
        bar.fill.width = (bar.barWidth - 2) * percent;
    }
    
    showMomentumChoice() {
        document.getElementById('momentum-choice').classList.remove('hidden');
    }
    
    hideMomentumChoice() {
        document.getElementById('momentum-choice').classList.add('hidden');
    }
}

// Export for use in other modules
window.UIScene = UIScene;
