// characterArt.js - Stylized 2D character rendering system for Lane Storm

class CharacterArt {
    constructor(scene) {
        this.scene = scene;
        this.textureCache = {};
        this.iconCache = {};
    }
    
    // Generate and cache all unit textures
    generateAllTextures() {
        const unitTypes = ['runner', 'guardian', 'slingbot', 'sparkMage', 'bomberBug', 'healerDrone'];
        const teams = ['player', 'enemy'];
        
        teams.forEach(team => {
            unitTypes.forEach(type => {
                const key = `${team}_${type}`;
                if (!this.textureCache[key]) {
                    this.generateUnitTexture(type, team);
                }
            });
        });
    }
    
    // Generate texture for a specific unit type and team
    generateUnitTexture(unitType, team) {
        const key = `${team}_${unitType}`;
        if (this.scene.textures.exists(key)) {
            return key;
        }
        
        const size = 64;
        const graphics = this.scene.add.graphics();
        
        const isEnemy = team === 'enemy';
        const colors = this.getUnitColors(unitType, isEnemy);
        
        // Draw the character based on type
        switch (unitType) {
            case 'runner':
                this.drawRunner(graphics, size, colors);
                break;
            case 'guardian':
                this.drawGuardian(graphics, size, colors);
                break;
            case 'slingbot':
                this.drawSlingbot(graphics, size, colors);
                break;
            case 'sparkMage':
                this.drawSparkMage(graphics, size, colors);
                break;
            case 'bomberBug':
                this.drawBomberBug(graphics, size, colors);
                break;
            case 'healerDrone':
                this.drawHealerDrone(graphics, size, colors);
                break;
        }
        
        // Generate texture from graphics
        graphics.generateTexture(key, size, size);
        graphics.destroy();
        
        this.textureCache[key] = true;
        return key;
    }
    
    // Get colors for unit type
    getUnitColors(unitType, isEnemy) {
        const teamPrimary = isEnemy ? 0xcc4455 : 0x4488cc;
        const teamSecondary = isEnemy ? 0xff6677 : 0x66aaff;
        const teamDark = isEnemy ? 0x882233 : 0x224488;
        
        const accents = {
            runner: { accent: 0x44ff44, glow: 0x88ff88 },
            guardian: { accent: 0x6666ff, glow: 0x8888ff },
            slingbot: { accent: 0xffaa00, glow: 0xffcc44 },
            sparkMage: { accent: 0xaa44ff, glow: 0xcc88ff },
            bomberBug: { accent: 0xff4444, glow: 0xff8888 },
            healerDrone: { accent: 0x44ffaa, glow: 0x88ffcc }
        };
        
        return {
            primary: teamPrimary,
            secondary: teamSecondary,
            dark: teamDark,
            accent: accents[unitType].accent,
            glow: accents[unitType].glow,
            outline: 0x1a1a2e,
            skin: 0xffddbb,
            eye: 0xffffff
        };
    }
    
    // === UNIT DRAWING METHODS ===
    
    drawRunner(g, size, c) {
        const cx = size / 2, cy = size / 2;
        
        // Outline/stroke layer
        g.lineStyle(3, c.outline, 1);
        
        // Slim body (capsule)
        g.fillStyle(c.primary, 1);
        g.fillRoundedRect(cx - 8, cy - 6, 16, 24, 6);
        g.strokeRoundedRect(cx - 8, cy - 6, 16, 24, 6);
        
        // Body highlight
        g.fillStyle(c.secondary, 0.4);
        g.fillRoundedRect(cx - 6, cy - 4, 6, 18, 4);
        
        // Head
        g.fillStyle(c.skin, 1);
        g.fillCircle(cx, cy - 14, 10);
        g.lineStyle(2, c.outline, 1);
        g.strokeCircle(cx, cy - 14, 10);
        
        // Hair/helmet
        g.fillStyle(c.primary, 1);
        g.fillEllipse(cx, cy - 20, 12, 6);
        
        // Eyes (visor style)
        g.fillStyle(c.accent, 1);
        g.fillRoundedRect(cx - 7, cy - 16, 14, 4, 2);
        
        // Arm with dagger
        g.lineStyle(2, c.outline, 1);
        g.fillStyle(c.skin, 1);
        g.fillCircle(cx + 12, cy, 5);
        g.strokeCircle(cx + 12, cy, 5);
        
        // Dagger
        g.fillStyle(0xcccccc, 1);
        g.fillTriangle(cx + 14, cy - 8, cx + 18, cy, cx + 14, cy + 2);
        g.lineStyle(1, c.outline, 1);
        g.strokeTriangle(cx + 14, cy - 8, cx + 18, cy, cx + 14, cy + 2);
        
        // Arm band (accent)
        g.fillStyle(c.accent, 1);
        g.fillRoundedRect(cx + 8, cy - 2, 4, 6, 1);
        
        // Legs
        g.fillStyle(c.dark, 1);
        g.fillRoundedRect(cx - 6, cy + 16, 5, 10, 2);
        g.fillRoundedRect(cx + 1, cy + 16, 5, 10, 2);
    }
    
    drawGuardian(g, size, c) {
        const cx = size / 2, cy = size / 2;
        
        g.lineStyle(3, c.outline, 1);
        
        // Wide body
        g.fillStyle(c.primary, 1);
        g.fillRoundedRect(cx - 14, cy - 4, 28, 26, 8);
        g.strokeRoundedRect(cx - 14, cy - 4, 28, 26, 8);
        
        // Body highlight
        g.fillStyle(c.secondary, 0.3);
        g.fillRoundedRect(cx - 10, cy - 2, 10, 20, 4);
        
        // Shoulder pads
        g.fillStyle(c.accent, 1);
        g.fillEllipse(cx - 14, cy, 8, 10);
        g.fillEllipse(cx + 14, cy, 8, 10);
        g.lineStyle(2, c.outline, 1);
        g.strokeEllipse(cx - 14, cy, 8, 10);
        g.strokeEllipse(cx + 14, cy, 8, 10);
        
        // Head with helmet
        g.fillStyle(c.primary, 1);
        g.fillCircle(cx, cy - 14, 12);
        g.lineStyle(2, c.outline, 1);
        g.strokeCircle(cx, cy - 14, 12);
        
        // Helmet visor
        g.fillStyle(c.glow, 0.8);
        g.fillRoundedRect(cx - 8, cy - 17, 16, 6, 2);
        
        // Shield plate (in front)
        g.fillStyle(c.accent, 1);
        g.lineStyle(2, c.outline, 1);
        g.fillRoundedRect(cx - 10, cy + 4, 20, 14, 4);
        g.strokeRoundedRect(cx - 10, cy + 4, 20, 14, 4);
        
        // Shield emblem
        g.fillStyle(c.secondary, 1);
        g.fillCircle(cx, cy + 10, 4);
        
        // Legs
        g.fillStyle(c.dark, 1);
        g.fillRoundedRect(cx - 8, cy + 20, 7, 8, 2);
        g.fillRoundedRect(cx + 1, cy + 20, 7, 8, 2);
    }
    
    drawSlingbot(g, size, c) {
        const cx = size / 2, cy = size / 2;
        
        g.lineStyle(2, c.outline, 1);
        
        // Backpack
        g.fillStyle(c.dark, 1);
        g.fillRoundedRect(cx - 4, cy - 8, 14, 18, 4);
        g.strokeRoundedRect(cx - 4, cy - 8, 14, 18, 4);
        
        // Body (medium)
        g.fillStyle(c.primary, 1);
        g.fillRoundedRect(cx - 10, cy - 4, 20, 22, 6);
        g.strokeRoundedRect(cx - 10, cy - 4, 20, 22, 6);
        
        // Body stripe
        g.fillStyle(c.accent, 1);
        g.fillRoundedRect(cx - 8, cy + 2, 16, 4, 1);
        
        // Head
        g.fillStyle(c.skin, 1);
        g.fillCircle(cx, cy - 12, 9);
        g.lineStyle(2, c.outline, 1);
        g.strokeCircle(cx, cy - 12, 9);
        
        // Goggles
        g.fillStyle(c.accent, 1);
        g.fillCircle(cx - 4, cy - 13, 4);
        g.fillCircle(cx + 4, cy - 13, 4);
        g.fillStyle(c.eye, 1);
        g.fillCircle(cx - 4, cy - 13, 2);
        g.fillCircle(cx + 4, cy - 13, 2);
        
        // Sling/Launcher arm
        g.fillStyle(c.skin, 1);
        g.fillCircle(cx - 14, cy + 2, 4);
        
        // Launcher
        g.fillStyle(0x666666, 1);
        g.fillRoundedRect(cx - 20, cy - 4, 8, 12, 2);
        g.fillStyle(c.accent, 1);
        g.fillCircle(cx - 16, cy - 6, 3);
        
        // Legs
        g.fillStyle(c.dark, 1);
        g.fillRoundedRect(cx - 6, cy + 16, 5, 10, 2);
        g.fillRoundedRect(cx + 1, cy + 16, 5, 10, 2);
    }
    
    drawSparkMage(g, size, c) {
        const cx = size / 2, cy = size / 2;
        
        g.lineStyle(2, c.outline, 1);
        
        // Robe body
        g.fillStyle(c.primary, 1);
        g.beginPath();
        g.moveTo(cx - 12, cy - 4);
        g.lineTo(cx - 16, cy + 22);
        g.lineTo(cx + 16, cy + 22);
        g.lineTo(cx + 12, cy - 4);
        g.closePath();
        g.fillPath();
        g.strokePath();
        
        // Robe pattern
        g.fillStyle(c.accent, 0.3);
        g.fillTriangle(cx, cy + 2, cx - 8, cy + 20, cx + 8, cy + 20);
        
        // Hood
        g.fillStyle(c.primary, 1);
        g.beginPath();
        g.moveTo(cx - 12, cy - 10);
        g.lineTo(cx, cy - 24);
        g.lineTo(cx + 12, cy - 10);
        g.lineTo(cx + 10, cy - 2);
        g.lineTo(cx - 10, cy - 2);
        g.closePath();
        g.fillPath();
        g.lineStyle(2, c.outline, 1);
        g.strokePath();
        
        // Face shadow in hood
        g.fillStyle(c.dark, 1);
        g.fillEllipse(cx, cy - 10, 8, 6);
        
        // Glowing eyes
        g.fillStyle(c.glow, 1);
        g.fillCircle(cx - 3, cy - 11, 2);
        g.fillCircle(cx + 3, cy - 11, 2);
        
        // Staff
        g.fillStyle(0x664422, 1);
        g.fillRoundedRect(cx + 14, cy - 20, 4, 40, 2);
        g.lineStyle(1, c.outline, 1);
        g.strokeRoundedRect(cx + 14, cy - 20, 4, 40, 2);
        
        // Staff tip glow
        g.fillStyle(c.glow, 0.6);
        g.fillCircle(cx + 16, cy - 22, 8);
        g.fillStyle(c.accent, 1);
        g.fillCircle(cx + 16, cy - 22, 5);
        g.fillStyle(0xffffff, 0.8);
        g.fillCircle(cx + 15, cy - 24, 2);
    }
    
    drawBomberBug(g, size, c) {
        const cx = size / 2, cy = size / 2;
        
        g.lineStyle(2, c.outline, 1);
        
        // Round body
        g.fillStyle(c.primary, 1);
        g.fillCircle(cx, cy + 4, 16);
        g.strokeCircle(cx, cy + 4, 16);
        
        // Body segments
        g.fillStyle(c.dark, 0.5);
        g.fillEllipse(cx, cy + 8, 14, 6);
        
        // Body highlight
        g.fillStyle(c.secondary, 0.4);
        g.fillEllipse(cx - 4, cy, 6, 8);
        
        // Head
        g.fillStyle(c.primary, 1);
        g.fillCircle(cx, cy - 12, 10);
        g.strokeCircle(cx, cy - 12, 10);
        
        // Antennae
        g.lineStyle(2, c.outline, 1);
        g.lineBetween(cx - 4, cy - 20, cx - 6, cy - 26);
        g.lineBetween(cx + 4, cy - 20, cx + 6, cy - 26);
        g.fillStyle(c.accent, 1);
        g.fillCircle(cx - 6, cy - 26, 3);
        g.fillCircle(cx + 6, cy - 26, 3);
        
        // Eyes
        g.fillStyle(c.accent, 1);
        g.fillCircle(cx - 4, cy - 13, 4);
        g.fillCircle(cx + 4, cy - 13, 4);
        g.fillStyle(0x000000, 1);
        g.fillCircle(cx - 4, cy - 13, 2);
        g.fillCircle(cx + 4, cy - 13, 2);
        
        // Bomb icon on body
        g.fillStyle(0x333333, 1);
        g.fillCircle(cx, cy + 6, 7);
        g.fillStyle(c.accent, 1);
        g.fillRoundedRect(cx - 2, cy - 2, 4, 6, 1);
        
        // Fuse spark
        g.fillStyle(0xffff00, 1);
        g.fillCircle(cx, cy - 4, 2);
        
        // Little legs
        g.fillStyle(c.dark, 1);
        g.fillEllipse(cx - 10, cy + 18, 4, 6);
        g.fillEllipse(cx + 10, cy + 18, 4, 6);
    }
    
    drawHealerDrone(g, size, c) {
        const cx = size / 2, cy = size / 2;
        
        // Halo ring (behind)
        g.lineStyle(3, c.glow, 0.6);
        g.strokeEllipse(cx, cy - 18, 16, 6);
        
        g.lineStyle(2, c.outline, 1);
        
        // Floating bot body
        g.fillStyle(c.primary, 1);
        g.fillRoundedRect(cx - 12, cy - 8, 24, 20, 8);
        g.strokeRoundedRect(cx - 12, cy - 8, 24, 20, 8);
        
        // Body panel lines
        g.lineStyle(1, c.dark, 0.5);
        g.lineBetween(cx - 10, cy, cx + 10, cy);
        g.lineBetween(cx, cy - 6, cx, cy + 10);
        
        // Cross symbol (heal)
        g.fillStyle(c.accent, 1);
        g.fillRoundedRect(cx - 6, cy - 2, 12, 4, 1);
        g.fillRoundedRect(cx - 2, cy - 6, 4, 12, 1);
        
        // Eye/sensor
        g.fillStyle(c.glow, 1);
        g.fillCircle(cx, cy - 12, 6);
        g.fillStyle(c.eye, 1);
        g.fillCircle(cx, cy - 12, 3);
        g.fillStyle(c.accent, 1);
        g.fillCircle(cx, cy - 12, 1);
        
        // Antenna
        g.lineStyle(2, c.outline, 1);
        g.lineBetween(cx, cy - 18, cx, cy - 26);
        g.fillStyle(c.accent, 1);
        g.fillCircle(cx, cy - 26, 4);
        g.fillStyle(c.glow, 0.8);
        g.fillCircle(cx, cy - 26, 6);
        
        // Side thrusters
        g.fillStyle(c.dark, 1);
        g.fillRoundedRect(cx - 16, cy + 2, 6, 8, 2);
        g.fillRoundedRect(cx + 10, cy + 2, 6, 8, 2);
        
        // Thruster glow
        g.fillStyle(c.glow, 0.5);
        g.fillEllipse(cx - 13, cy + 14, 4, 6);
        g.fillEllipse(cx + 13, cy + 14, 4, 6);
    }
    
    // === CHARACTER CONTAINER CREATION ===
    
    createCharacter(unitType, isEnemy, x, y) {
        const team = isEnemy ? 'enemy' : 'player';
        const textureKey = this.generateUnitTexture(unitType, team);
        
        const container = this.scene.add.container(x, y);
        container.setDepth(20);
        
        // Shadow
        const shadow = this.scene.add.ellipse(0, 20, 28, 10, 0x000000, 0.3);
        container.add(shadow);
        container.shadow = shadow;
        
        // Character sprite
        const sprite = this.scene.add.image(0, 0, textureKey);
        sprite.setScale(0.5); // Scale down for game
        container.add(sprite);
        container.sprite = sprite;
        
        // Store animation state
        container.animState = {
            idle: true,
            walking: false,
            attacking: false,
            bobPhase: Math.random() * Math.PI * 2
        };
        
        // Start idle animation
        this.startIdleAnimation(container);
        
        return container;
    }
    
    // === ANIMATIONS ===
    
    startIdleAnimation(container) {
        if (container.idleTween) container.idleTween.stop();
        
        container.idleTween = this.scene.tweens.add({
            targets: container.sprite,
            y: -2,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
    
    startWalkAnimation(container, direction) {
        if (container.idleTween) container.idleTween.stop();
        if (container.walkTween) container.walkTween.stop();
        
        // Bounce effect
        container.walkTween = this.scene.tweens.add({
            targets: container.sprite,
            y: -4,
            scaleX: 0.52,
            scaleY: 0.48,
            duration: 150,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Lean in direction
        const leanAngle = direction > 0 ? 0.1 : -0.1;
        this.scene.tweens.add({
            targets: container.sprite,
            rotation: leanAngle,
            duration: 100
        });
    }
    
    stopWalkAnimation(container) {
        if (container.walkTween) {
            container.walkTween.stop();
            container.walkTween = null;
        }
        
        // Reset rotation
        this.scene.tweens.add({
            targets: container.sprite,
            rotation: 0,
            scaleX: 0.5,
            scaleY: 0.5,
            y: 0,
            duration: 100
        });
        
        this.startIdleAnimation(container);
    }
    
    playAttackAnimation(container, isMelee) {
        if (container.attackTween) return;
        
        const swingAngle = isMelee ? 0.4 : 0.2;
        const duration = isMelee ? 150 : 100;
        
        container.attackTween = this.scene.tweens.add({
            targets: container.sprite,
            rotation: swingAngle,
            scaleX: 0.55,
            scaleY: 0.45,
            duration: duration,
            yoyo: true,
            ease: 'Quad.easeOut',
            onComplete: () => {
                container.attackTween = null;
                container.sprite.rotation = 0;
                container.sprite.scaleX = 0.5;
                container.sprite.scaleY = 0.5;
            }
        });
    }
    
    playHitAnimation(container) {
        // Flash white
        container.sprite.setTint(0xffffff);
        
        // Small knockback
        const knockback = this.scene.tweens.add({
            targets: container,
            x: container.x - 4,
            duration: 50,
            yoyo: true,
            ease: 'Quad.easeOut'
        });
        
        this.scene.time.delayedCall(80, () => {
            if (container.sprite) {
                container.sprite.clearTint();
            }
        });
    }
    
    playDeathAnimation(container, onComplete) {
        // Stop all other animations
        if (container.idleTween) container.idleTween.stop();
        if (container.walkTween) container.walkTween.stop();
        
        // Fall and fade
        this.scene.tweens.add({
            targets: container.sprite,
            rotation: Math.PI / 2,
            scaleX: 0.3,
            scaleY: 0.3,
            alpha: 0,
            y: 10,
            duration: 300,
            ease: 'Quad.easeIn'
        });
        
        // Fade shadow
        this.scene.tweens.add({
            targets: container.shadow,
            alpha: 0,
            scaleX: 0.5,
            duration: 300,
            onComplete: () => {
                if (onComplete) onComplete();
            }
        });
    }
    
    // === ICON GENERATION FOR CARDS ===
    
    generateIconTexture(unitType) {
        const iconKey = `icon_${unitType}`;
        if (this.scene.textures.exists(iconKey)) {
            return iconKey;
        }
        
        const size = 32;
        const graphics = this.scene.add.graphics();
        
        // Use player colors for icons
        const colors = this.getUnitColors(unitType, false);
        
        // Draw mini version
        graphics.fillStyle(colors.primary, 1);
        graphics.fillCircle(size/2, size/2, size/2 - 2);
        graphics.lineStyle(2, colors.accent, 1);
        graphics.strokeCircle(size/2, size/2, size/2 - 2);
        
        // Simple icon indicator
        graphics.fillStyle(colors.accent, 1);
        switch (unitType) {
            case 'runner':
                graphics.fillTriangle(size/2 - 6, size/2 + 6, size/2 + 6, size/2 + 6, size/2, size/2 - 8);
                break;
            case 'guardian':
                graphics.fillRoundedRect(size/2 - 8, size/2 - 6, 16, 12, 2);
                break;
            case 'slingbot':
                graphics.fillCircle(size/2, size/2, 6);
                graphics.fillStyle(colors.glow, 1);
                graphics.fillCircle(size/2 - 8, size/2, 3);
                break;
            case 'sparkMage':
                graphics.fillStyle(colors.glow, 1);
                graphics.fillCircle(size/2, size/2 - 4, 5);
                graphics.fillRoundedRect(size/2 - 1, size/2, 2, 10, 1);
                break;
            case 'bomberBug':
                graphics.fillCircle(size/2, size/2 + 2, 7);
                graphics.fillStyle(0xffff00, 1);
                graphics.fillCircle(size/2, size/2 - 6, 2);
                break;
            case 'healerDrone':
                graphics.fillRoundedRect(size/2 - 6, size/2 - 1, 12, 3, 1);
                graphics.fillRoundedRect(size/2 - 1, size/2 - 6, 3, 12, 1);
                break;
        }
        
        graphics.generateTexture(iconKey, size, size);
        graphics.destroy();
        
        this.iconCache[unitType] = true;
        return iconKey;
    }
    
    // Create icon image for cards
    createCardIcon(unitType, x, y, scale = 1) {
        const iconKey = this.generateIconTexture(unitType);
        const icon = this.scene.add.image(x, y, iconKey);
        icon.setScale(scale);
        return icon;
    }
}

// Export
window.CharacterArt = CharacterArt;
