// characterArt.js - Enhanced stylized 2D character rendering system for Lane Storm

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
                try {
                    this.generateUnitTexture(type, team);
                } catch (e) {
                    console.error(`Failed to generate texture for ${team}_${type}:`, e);
                    this.generateFallbackTexture(type, team);
                }
            });
        });
    }
    
    // Fallback texture if generation fails
    generateFallbackTexture(unitType, team) {
        const key = `${team}_${unitType}`;
        if (this.scene.textures.exists(key)) return key;
        
        const size = 80;
        const g = this.scene.add.graphics();
        const isEnemy = team === 'enemy';
        const color = isEnemy ? 0xcc4455 : 0x4488cc;
        const cx = size / 2, cy = size / 2;
        
        // Simple fallback silhouette
        g.fillStyle(color, 1);
        g.fillCircle(cx, cy - 10, 12); // Head
        g.fillRoundedRect(cx - 10, cy, 20, 24, 6); // Body
        g.lineStyle(2, 0x1a1a2e, 1);
        g.strokeCircle(cx, cy - 10, 12);
        g.strokeRoundedRect(cx - 10, cy, 20, 24, 6);
        
        g.generateTexture(key, size, size);
        g.destroy();
        this.textureCache[key] = true;
        console.log(`Created fallback texture for ${key}`);
        return key;
    }
    
    // Color palette for units
    getUnitColors(unitType, isEnemy) {
        // Team colors
        const team = {
            primary: isEnemy ? 0xc94455 : 0x4488cc,
            secondary: isEnemy ? 0xe86677 : 0x66aaee,
            dark: isEnemy ? 0x7a2233 : 0x2a5588,
            highlight: isEnemy ? 0xff8899 : 0x88ccff,
            skin: 0xf4d4b8,
            skinShade: 0xd4a488
        };
        
        // Unit-specific accent colors
        const accents = {
            runner: { main: 0x44dd44, glow: 0x88ff88, detail: 0x228822 },
            guardian: { main: 0x5566ee, glow: 0x8899ff, detail: 0x334488 },
            slingbot: { main: 0xffaa22, glow: 0xffcc66, detail: 0xaa6600 },
            sparkMage: { main: 0xaa44ff, glow: 0xdd88ff, detail: 0x6622aa },
            bomberBug: { main: 0xff4444, glow: 0xff8888, detail: 0xaa2222 },
            healerDrone: { main: 0x44ffaa, glow: 0x88ffcc, detail: 0x22aa66 }
        };
        
        return { ...team, accent: accents[unitType] };
    }
    
    // === TEXTURE GENERATION ===
    
    generateUnitTexture(unitType, team) {
        const key = `${team}_${unitType}`;
        if (this.scene.textures.exists(key)) return key;
        
        const size = 80;
        const g = this.scene.add.graphics();
        const c = this.getUnitColors(unitType, team === 'enemy');
        const cx = size / 2, cy = size / 2;
        
        try {
            // Draw character based on type
            switch (unitType) {
                case 'runner': this.drawRunner(g, cx, cy, c); break;
                case 'guardian': this.drawGuardian(g, cx, cy, c); break;
                case 'slingbot': this.drawSlingbot(g, cx, cy, c); break;
                case 'sparkMage': this.drawSparkMage(g, cx, cy, c); break;
                case 'bomberBug': this.drawBomberBug(g, cx, cy, c); break;
                case 'healerDrone': this.drawHealerDrone(g, cx, cy, c); break;
            }
            
            g.generateTexture(key, size, size);
            g.destroy();
            this.textureCache[key] = true;
            return key;
        } catch (e) {
            g.destroy();
            console.error(`Error drawing ${unitType}:`, e);
            return this.generateFallbackTexture(unitType, team);
        }
    }
    
    // === CHARACTER DRAWING ===
    
    drawRunner(g, cx, cy, c) {
        const outline = 0x1a1a2e;
        
        // --- LEGS ---
        // Left leg
        g.fillStyle(c.dark, 1);
        g.fillRoundedRect(cx - 8, cy + 12, 6, 14, 2);
        g.fillStyle(0x333333, 1); // Boot
        g.fillRoundedRect(cx - 9, cy + 22, 8, 5, 2);
        
        // Right leg (slightly forward - running pose)
        g.fillStyle(c.dark, 1);
        g.fillRoundedRect(cx + 2, cy + 10, 6, 14, 2);
        g.fillStyle(0x333333, 1);
        g.fillRoundedRect(cx + 1, cy + 20, 8, 5, 2);
        
        // --- BODY ---
        // Main body (slim, tapered)
        g.fillStyle(c.primary, 1);
        g.beginPath();
        g.moveTo(cx - 10, cy - 4);
        g.lineTo(cx - 8, cy + 14);
        g.lineTo(cx + 8, cy + 14);
        g.lineTo(cx + 10, cy - 4);
        g.closePath();
        g.fillPath();
        
        // Body highlight (left side)
        g.fillStyle(c.secondary, 0.5);
        g.beginPath();
        g.moveTo(cx - 9, cy - 2);
        g.lineTo(cx - 7, cy + 12);
        g.lineTo(cx - 2, cy + 12);
        g.lineTo(cx - 2, cy - 2);
        g.closePath();
        g.fillPath();
        
        // Body shadow (right side)
        g.fillStyle(c.dark, 0.3);
        g.beginPath();
        g.moveTo(cx + 2, cy - 2);
        g.lineTo(cx + 7, cy + 12);
        g.lineTo(cx + 9, cy - 2);
        g.closePath();
        g.fillPath();
        
        // Belt
        g.fillStyle(0x444444, 1);
        g.fillRoundedRect(cx - 9, cy + 6, 18, 4, 1);
        g.fillStyle(c.accent.main, 1);
        g.fillRect(cx - 2, cy + 6, 4, 4); // Belt buckle
        
        // --- ARMS ---
        // Left arm (back)
        g.fillStyle(c.skinShade, 1);
        g.fillEllipse(cx - 12, cy + 2, 4, 7);
        
        // Right arm (forward with dagger)
        g.fillStyle(c.skin, 1);
        g.fillEllipse(cx + 13, cy - 2, 5, 7);
        
        // Glove
        g.fillStyle(0x333333, 1);
        g.fillCircle(cx + 14, cy + 4, 4);
        
        // Dagger blade
        g.fillStyle(0xcccccc, 1);
        g.beginPath();
        g.moveTo(cx + 16, cy + 2);
        g.lineTo(cx + 26, cy - 4);
        g.lineTo(cx + 16, cy - 2);
        g.closePath();
        g.fillPath();
        g.fillStyle(0xffffff, 0.5);
        g.fillTriangle(cx + 17, cy + 1, cx + 23, cy - 2, cx + 17, cy - 1);
        
        // Dagger handle
        g.fillStyle(0x664422, 1);
        g.fillRoundedRect(cx + 12, cy, 5, 3, 1);
        
        // --- HEAD ---
        // Neck
        g.fillStyle(c.skinShade, 1);
        g.fillRect(cx - 4, cy - 8, 8, 6);
        
        // Head base
        g.fillStyle(c.skin, 1);
        g.fillCircle(cx, cy - 14, 11);
        
        // Head highlight
        g.fillStyle(0xffffff, 0.15);
        g.fillCircle(cx - 3, cy - 17, 5);
        
        // Hair/headband
        g.fillStyle(c.accent.main, 1);
        g.fillRoundedRect(cx - 10, cy - 20, 20, 5, 2);
        
        // Scarf/bandana tail
        g.fillStyle(c.accent.main, 1);
        g.beginPath();
        g.moveTo(cx + 8, cy - 17);
        g.lineTo(cx + 20, cy - 12);
        g.lineTo(cx + 18, cy - 8);
        g.lineTo(cx + 8, cy - 14);
        g.closePath();
        g.fillPath();
        g.fillStyle(c.accent.detail, 1);
        g.fillTriangle(cx + 12, cy - 14, cx + 19, cy - 11, cx + 17, cy - 9);
        
        // Eyes (determined look)
        g.fillStyle(0xffffff, 1);
        g.fillEllipse(cx - 4, cy - 14, 3, 2);
        g.fillEllipse(cx + 4, cy - 14, 3, 2);
        g.fillStyle(0x222222, 1);
        g.fillCircle(cx - 3, cy - 14, 1.5);
        g.fillCircle(cx + 5, cy - 14, 1.5);
        
        // Mouth (slight grin)
        g.lineStyle(1, 0x885544, 1);
        g.beginPath();
        g.arc(cx, cy - 9, 3, 0.2, Math.PI - 0.2);
        g.strokePath();
        
        // --- OUTLINE ---
        g.lineStyle(2.5, outline, 1);
        g.strokeCircle(cx, cy - 14, 11);
        g.strokeRoundedRect(cx - 10, cy - 5, 20, 20, 4);
    }
    
    drawGuardian(g, cx, cy, c) {
        const outline = 0x1a1a2e;
        
        // --- LEGS (wide stance) ---
        g.fillStyle(c.dark, 1);
        g.fillRoundedRect(cx - 12, cy + 10, 9, 14, 3);
        g.fillRoundedRect(cx + 3, cy + 10, 9, 14, 3);
        
        // Boots (armored)
        g.fillStyle(0x444444, 1);
        g.fillRoundedRect(cx - 14, cy + 20, 12, 6, 2);
        g.fillRoundedRect(cx + 2, cy + 20, 12, 6, 2);
        g.fillStyle(0x666666, 0.5);
        g.fillRect(cx - 12, cy + 21, 4, 4);
        g.fillRect(cx + 8, cy + 21, 4, 4);
        
        // --- BODY (bulky) ---
        g.fillStyle(c.primary, 1);
        g.fillRoundedRect(cx - 16, cy - 6, 32, 22, 6);
        
        // Chest plate
        g.fillStyle(c.secondary, 1);
        g.fillRoundedRect(cx - 12, cy - 4, 24, 16, 4);
        
        // Chest shadow
        g.fillStyle(c.dark, 0.4);
        g.fillRoundedRect(cx - 10, cy + 4, 20, 8, 3);
        
        // Center emblem
        g.fillStyle(c.accent.main, 1);
        g.fillCircle(cx, cy + 2, 6);
        g.fillStyle(c.accent.glow, 0.6);
        g.fillCircle(cx, cy + 1, 3);
        
        // Belt
        g.fillStyle(0x554422, 1);
        g.fillRoundedRect(cx - 14, cy + 10, 28, 5, 2);
        g.fillStyle(c.accent.main, 1);
        g.fillRoundedRect(cx - 4, cy + 10, 8, 5, 1);
        
        // --- SHOULDER PADS ---
        // Left shoulder
        g.fillStyle(c.accent.main, 1);
        g.fillEllipse(cx - 18, cy - 2, 10, 12);
        g.fillStyle(c.accent.glow, 0.4);
        g.fillEllipse(cx - 20, cy - 4, 4, 6);
        g.fillStyle(c.accent.detail, 0.5);
        g.fillEllipse(cx - 16, cy + 2, 5, 6);
        
        // Right shoulder  
        g.fillStyle(c.accent.main, 1);
        g.fillEllipse(cx + 18, cy - 2, 10, 12);
        g.fillStyle(c.accent.glow, 0.4);
        g.fillEllipse(cx + 16, cy - 4, 4, 6);
        g.fillStyle(c.accent.detail, 0.5);
        g.fillEllipse(cx + 20, cy + 2, 5, 6);
        
        // Shoulder spikes
        g.fillStyle(0x666666, 1);
        g.fillTriangle(cx - 22, cy - 8, cx - 18, cy - 2, cx - 14, cy - 8);
        g.fillTriangle(cx + 22, cy - 8, cx + 18, cy - 2, cx + 14, cy - 8);
        
        // --- ARMS ---
        g.fillStyle(c.primary, 1);
        g.fillEllipse(cx - 20, cy + 6, 5, 8);
        g.fillEllipse(cx + 20, cy + 6, 5, 8);
        
        // Gauntlets
        g.fillStyle(0x555555, 1);
        g.fillRoundedRect(cx - 24, cy + 10, 8, 6, 2);
        g.fillRoundedRect(cx + 16, cy + 10, 8, 6, 2);
        
        // --- SHIELD (front) ---
        g.fillStyle(0x556677, 1);
        g.beginPath();
        g.moveTo(cx - 8, cy + 16);
        g.lineTo(cx - 14, cy + 20);
        g.lineTo(cx - 14, cy + 30);
        g.lineTo(cx, cy + 34);
        g.lineTo(cx + 14, cy + 30);
        g.lineTo(cx + 14, cy + 20);
        g.lineTo(cx + 8, cy + 16);
        g.closePath();
        g.fillPath();
        
        // Shield highlight
        g.fillStyle(0x778899, 0.6);
        g.fillTriangle(cx - 12, cy + 21, cx - 6, cy + 18, cx - 6, cy + 28);
        
        // Shield emblem
        g.fillStyle(c.accent.main, 1);
        g.fillCircle(cx, cy + 26, 5);
        g.lineStyle(2, c.accent.detail, 1);
        g.strokeCircle(cx, cy + 26, 5);
        
        // --- HEAD (helmet) ---
        g.fillStyle(c.primary, 1);
        g.fillCircle(cx, cy - 14, 13);
        
        // Helmet top
        g.fillStyle(c.secondary, 1);
        g.fillEllipse(cx, cy - 22, 10, 6);
        
        // Visor
        g.fillStyle(0x1a1a2e, 1);
        g.fillRoundedRect(cx - 10, cy - 18, 20, 8, 3);
        g.fillStyle(c.accent.glow, 0.8);
        g.fillRoundedRect(cx - 8, cy - 17, 16, 5, 2);
        
        // Visor shine
        g.fillStyle(0xffffff, 0.3);
        g.fillRoundedRect(cx - 7, cy - 17, 6, 2, 1);
        
        // Helmet crest
        g.fillStyle(c.accent.main, 1);
        g.beginPath();
        g.moveTo(cx, cy - 28);
        g.lineTo(cx - 4, cy - 20);
        g.lineTo(cx + 4, cy - 20);
        g.closePath();
        g.fillPath();
        
        // Chin guard
        g.fillStyle(c.dark, 1);
        g.fillRoundedRect(cx - 8, cy - 6, 16, 4, 2);
        
        // --- OUTLINE ---
        g.lineStyle(3, outline, 1);
        g.strokeCircle(cx, cy - 14, 13);
        g.strokeRoundedRect(cx - 16, cy - 6, 32, 22, 6);
    }
    
    drawSlingbot(g, cx, cy, c) {
        const outline = 0x1a1a2e;
        
        // --- BACKPACK (behind body) ---
        g.fillStyle(0x445566, 1);
        g.fillRoundedRect(cx - 2, cy - 8, 16, 22, 4);
        g.fillStyle(0x556677, 0.5);
        g.fillRoundedRect(cx, cy - 6, 6, 18, 2);
        
        // Backpack straps
        g.fillStyle(0x664422, 1);
        g.fillRect(cx + 2, cy - 6, 3, 16);
        g.fillRect(cx + 8, cy - 6, 3, 16);
        
        // Ammo pouches
        g.fillStyle(c.accent.main, 1);
        g.fillRoundedRect(cx + 10, cy - 2, 6, 8, 2);
        g.fillRoundedRect(cx + 10, cy + 8, 6, 6, 2);
        
        // --- LEGS ---
        g.fillStyle(c.dark, 1);
        g.fillRoundedRect(cx - 8, cy + 12, 6, 12, 2);
        g.fillRoundedRect(cx + 2, cy + 12, 6, 12, 2);
        
        // Boots
        g.fillStyle(0x443322, 1);
        g.fillRoundedRect(cx - 9, cy + 20, 8, 5, 2);
        g.fillRoundedRect(cx + 1, cy + 20, 8, 5, 2);
        
        // --- BODY ---
        g.fillStyle(c.primary, 1);
        g.fillRoundedRect(cx - 11, cy - 4, 22, 18, 5);
        
        // Vest/jacket
        g.fillStyle(c.secondary, 1);
        g.fillRoundedRect(cx - 9, cy - 2, 8, 14, 3);
        g.fillRoundedRect(cx + 1, cy - 2, 8, 14, 3);
        
        // Chest stripe
        g.fillStyle(c.accent.main, 1);
        g.fillRect(cx - 1, cy - 2, 2, 14);
        
        // Utility belt
        g.fillStyle(0x554433, 1);
        g.fillRoundedRect(cx - 10, cy + 8, 20, 4, 1);
        
        // Belt pouches
        g.fillStyle(0x665544, 1);
        g.fillRoundedRect(cx - 9, cy + 6, 5, 6, 1);
        g.fillRoundedRect(cx + 4, cy + 6, 5, 6, 1);
        
        // --- LAUNCHER ARM ---
        // Arm
        g.fillStyle(c.skin, 1);
        g.fillEllipse(cx - 14, cy + 2, 4, 7);
        
        // Launcher device
        g.fillStyle(0x556666, 1);
        g.fillRoundedRect(cx - 26, cy - 6, 14, 10, 3);
        
        // Launcher barrel
        g.fillStyle(0x444444, 1);
        g.fillRoundedRect(cx - 28, cy - 4, 4, 6, 1);
        
        // Launcher glow
        g.fillStyle(c.accent.glow, 0.7);
        g.fillCircle(cx - 26, cy - 1, 3);
        
        // Targeting sight
        g.fillStyle(c.accent.main, 1);
        g.fillCircle(cx - 19, cy - 4, 2);
        
        // --- OTHER ARM ---
        g.fillStyle(c.skin, 1);
        g.fillEllipse(cx + 13, cy + 4, 4, 6);
        g.fillStyle(0x443322, 1);
        g.fillCircle(cx + 14, cy + 8, 3);
        
        // --- HEAD ---
        g.fillStyle(c.skin, 1);
        g.fillCircle(cx, cy - 12, 10);
        
        // Hair (messy)
        g.fillStyle(0x553322, 1);
        g.fillEllipse(cx, cy - 20, 9, 5);
        g.fillCircle(cx - 6, cy - 18, 3);
        g.fillCircle(cx + 5, cy - 19, 2);
        
        // Goggles strap
        g.fillStyle(0x333333, 1);
        g.fillRoundedRect(cx - 10, cy - 16, 20, 3, 1);
        
        // Goggles
        g.fillStyle(0x445566, 1);
        g.fillCircle(cx - 5, cy - 13, 5);
        g.fillCircle(cx + 5, cy - 13, 5);
        
        // Goggle lenses
        g.fillStyle(c.accent.glow, 0.9);
        g.fillCircle(cx - 5, cy - 13, 3);
        g.fillCircle(cx + 5, cy - 13, 3);
        
        // Lens shine
        g.fillStyle(0xffffff, 0.4);
        g.fillCircle(cx - 6, cy - 14, 1);
        g.fillCircle(cx + 4, cy - 14, 1);
        
        // Nose
        g.fillStyle(c.skinShade, 1);
        g.fillEllipse(cx, cy - 8, 2, 1.5);
        
        // Smile
        g.lineStyle(1, 0x885544, 1);
        g.beginPath();
        g.arc(cx, cy - 5, 3, 0.3, Math.PI - 0.3);
        g.strokePath();
        
        // --- OUTLINE ---
        g.lineStyle(2.5, outline, 1);
        g.strokeCircle(cx, cy - 12, 10);
        g.strokeRoundedRect(cx - 11, cy - 4, 22, 18, 5);
    }
    
    drawSparkMage(g, cx, cy, c) {
        const outline = 0x1a1a2e;
        
        // --- ROBE (flowing) ---
        g.fillStyle(c.primary, 1);
        g.beginPath();
        g.moveTo(cx - 14, cy - 6);
        g.lineTo(cx - 18, cy + 24);
        g.lineTo(cx - 8, cy + 28);
        g.lineTo(cx + 8, cy + 28);
        g.lineTo(cx + 18, cy + 24);
        g.lineTo(cx + 14, cy - 6);
        g.closePath();
        g.fillPath();
        
        // Robe inner shadow
        g.fillStyle(c.dark, 0.5);
        g.beginPath();
        g.moveTo(cx - 6, cy);
        g.lineTo(cx - 10, cy + 22);
        g.lineTo(cx, cy + 24);
        g.lineTo(cx + 10, cy + 22);
        g.lineTo(cx + 6, cy);
        g.closePath();
        g.fillPath();
        
        // Robe highlight
        g.fillStyle(c.secondary, 0.4);
        g.beginPath();
        g.moveTo(cx - 12, cy - 4);
        g.lineTo(cx - 14, cy + 16);
        g.lineTo(cx - 6, cy + 16);
        g.lineTo(cx - 6, cy - 4);
        g.closePath();
        g.fillPath();
        
        // Robe trim
        g.fillStyle(c.accent.main, 1);
        g.fillRoundedRect(cx - 8, cy - 4, 16, 3, 1);
        
        // Arcane symbols on robe
        g.fillStyle(c.accent.glow, 0.4);
        g.fillCircle(cx - 4, cy + 10, 3);
        g.fillCircle(cx + 4, cy + 14, 2);
        g.fillCircle(cx, cy + 18, 2);
        
        // Belt/sash
        g.fillStyle(c.accent.detail, 1);
        g.fillRoundedRect(cx - 10, cy + 4, 20, 4, 1);
        
        // --- HOOD ---
        g.fillStyle(c.primary, 1);
        g.beginPath();
        g.moveTo(cx - 14, cy - 8);
        g.lineTo(cx - 8, cy - 24);
        g.lineTo(cx, cy - 28);
        g.lineTo(cx + 8, cy - 24);
        g.lineTo(cx + 14, cy - 8);
        g.lineTo(cx + 12, cy);
        g.lineTo(cx - 12, cy);
        g.closePath();
        g.fillPath();
        
        // Hood shadow inside
        g.fillStyle(c.dark, 0.8);
        g.beginPath();
        g.moveTo(cx - 10, cy - 6);
        g.lineTo(cx - 6, cy - 18);
        g.lineTo(cx, cy - 20);
        g.lineTo(cx + 6, cy - 18);
        g.lineTo(cx + 10, cy - 6);
        g.lineTo(cx + 8, cy - 2);
        g.lineTo(cx - 8, cy - 2);
        g.closePath();
        g.fillPath();
        
        // Hood highlight
        g.fillStyle(c.secondary, 0.3);
        g.beginPath();
        g.moveTo(cx - 12, cy - 10);
        g.lineTo(cx - 8, cy - 22);
        g.lineTo(cx - 2, cy - 24);
        g.lineTo(cx - 4, cy - 10);
        g.closePath();
        g.fillPath();
        
        // Face shadow area
        g.fillStyle(0x0a0a1e, 1);
        g.fillEllipse(cx, cy - 10, 8, 6);
        
        // Glowing eyes
        g.fillStyle(c.accent.glow, 1);
        g.fillCircle(cx - 4, cy - 11, 2.5);
        g.fillCircle(cx + 4, cy - 11, 2.5);
        
        // Eye glow effect
        g.fillStyle(c.accent.glow, 0.3);
        g.fillCircle(cx - 4, cy - 11, 5);
        g.fillCircle(cx + 4, cy - 11, 5);
        
        // --- STAFF ARM ---
        g.fillStyle(c.skin, 1);
        g.fillEllipse(cx + 14, cy + 2, 4, 6);
        
        // Staff
        g.fillStyle(0x553322, 1);
        g.fillRoundedRect(cx + 16, cy - 24, 4, 48, 2);
        
        // Staff detail bands
        g.fillStyle(c.accent.detail, 1);
        g.fillRect(cx + 16, cy - 18, 4, 3);
        g.fillRect(cx + 16, cy + 10, 4, 3);
        
        // Staff crystal/orb
        g.fillStyle(c.accent.glow, 0.4);
        g.fillCircle(cx + 18, cy - 28, 10);
        g.fillStyle(c.accent.main, 1);
        g.fillCircle(cx + 18, cy - 28, 7);
        g.fillStyle(c.accent.glow, 1);
        g.fillCircle(cx + 18, cy - 28, 4);
        g.fillStyle(0xffffff, 0.7);
        g.fillCircle(cx + 16, cy - 30, 2);
        
        // Spark particles around orb
        g.fillStyle(c.accent.glow, 0.8);
        g.fillCircle(cx + 12, cy - 32, 1.5);
        g.fillCircle(cx + 24, cy - 30, 1);
        g.fillCircle(cx + 20, cy - 36, 1);
        
        // --- OTHER ARM (hidden in robe) ---
        g.fillStyle(c.dark, 1);
        g.fillEllipse(cx - 12, cy + 4, 4, 6);
        
        // --- OUTLINE ---
        g.lineStyle(2.5, outline, 1);
        g.beginPath();
        g.moveTo(cx - 14, cy - 8);
        g.lineTo(cx - 8, cy - 24);
        g.lineTo(cx, cy - 28);
        g.lineTo(cx + 8, cy - 24);
        g.lineTo(cx + 14, cy - 8);
        g.strokePath();
    }
    
    drawBomberBug(g, cx, cy, c) {
        const outline = 0x1a1a2e;
        
        // --- ANTENNAE ---
        g.lineStyle(3, c.dark, 1);
        g.beginPath();
        g.moveTo(cx - 6, cy - 22);
        g.lineTo(cx - 8, cy - 30);
        g.lineTo(cx - 8, cy - 36);
        g.strokePath();
        g.beginPath();
        g.moveTo(cx + 6, cy - 22);
        g.lineTo(cx + 8, cy - 30);
        g.lineTo(cx + 8, cy - 36);
        g.strokePath();
        
        // Antenna tips
        g.fillStyle(c.accent.glow, 1);
        g.fillCircle(cx - 8, cy - 36, 4);
        g.fillCircle(cx + 8, cy - 36, 4);
        g.fillStyle(c.accent.main, 1);
        g.fillCircle(cx - 8, cy - 36, 2);
        g.fillCircle(cx + 8, cy - 36, 2);
        
        // --- BODY (round bug body) ---
        // Main body
        g.fillStyle(c.primary, 1);
        g.fillCircle(cx, cy + 4, 18);
        
        // Body segments
        g.lineStyle(2, c.dark, 0.4);
        g.beginPath();
        g.arc(cx, cy + 4, 14, -0.5, Math.PI + 0.5);
        g.strokePath();
        g.beginPath();
        g.arc(cx, cy + 4, 8, -0.3, Math.PI + 0.3);
        g.strokePath();
        
        // Body highlight
        g.fillStyle(c.secondary, 0.5);
        g.fillEllipse(cx - 6, cy - 2, 8, 10);
        
        // Body shadow
        g.fillStyle(c.dark, 0.4);
        g.fillEllipse(cx + 6, cy + 8, 8, 8);
        
        // Belly marking
        g.fillStyle(c.accent.main, 0.3);
        g.fillEllipse(cx, cy + 10, 10, 6);
        
        // --- BOMB SATCHEL ---
        g.fillStyle(0x443333, 1);
        g.fillRoundedRect(cx - 8, cy + 2, 16, 14, 4);
        
        // Bomb
        g.fillStyle(0x222222, 1);
        g.fillCircle(cx, cy + 8, 7);
        g.fillStyle(0x333333, 0.5);
        g.fillCircle(cx - 2, cy + 6, 3);
        
        // Fuse
        g.lineStyle(2, 0x665544, 1);
        g.beginPath();
        g.moveTo(cx, cy + 1);
        g.lineTo(cx + 3, cy - 3);
        g.lineTo(cx + 2, cy - 8);
        g.strokePath();
        
        // Fuse spark
        g.fillStyle(0xffff44, 1);
        g.fillCircle(cx + 2, cy - 8, 3);
        g.fillStyle(0xffaa00, 1);
        g.fillCircle(cx + 2, cy - 8, 2);
        g.fillStyle(0xffffff, 0.8);
        g.fillCircle(cx + 1, cy - 9, 1);
        
        // --- LITTLE LEGS ---
        g.fillStyle(c.dark, 1);
        g.fillEllipse(cx - 12, cy + 18, 5, 8);
        g.fillEllipse(cx + 12, cy + 18, 5, 8);
        g.fillEllipse(cx - 6, cy + 20, 4, 6);
        g.fillEllipse(cx + 6, cy + 20, 4, 6);
        
        // --- HEAD ---
        g.fillStyle(c.primary, 1);
        g.fillCircle(cx, cy - 14, 12);
        
        // Head highlight
        g.fillStyle(c.secondary, 0.4);
        g.fillCircle(cx - 4, cy - 17, 5);
        
        // Big bug eyes
        g.fillStyle(0xffffff, 1);
        g.fillCircle(cx - 6, cy - 14, 6);
        g.fillCircle(cx + 6, cy - 14, 6);
        
        // Pupils
        g.fillStyle(c.accent.main, 1);
        g.fillCircle(cx - 5, cy - 14, 4);
        g.fillCircle(cx + 7, cy - 14, 4);
        
        // Pupil detail
        g.fillStyle(0x000000, 1);
        g.fillCircle(cx - 4, cy - 14, 2);
        g.fillCircle(cx + 8, cy - 14, 2);
        
        // Eye shine
        g.fillStyle(0xffffff, 0.7);
        g.fillCircle(cx - 7, cy - 16, 2);
        g.fillCircle(cx + 5, cy - 16, 2);
        
        // Mandibles/mouth
        g.fillStyle(c.dark, 1);
        g.fillEllipse(cx - 4, cy - 6, 3, 2);
        g.fillEllipse(cx + 4, cy - 6, 3, 2);
        
        // --- OUTLINE ---
        g.lineStyle(3, outline, 1);
        g.strokeCircle(cx, cy - 14, 12);
        g.strokeCircle(cx, cy + 4, 18);
    }
    
    drawHealerDrone(g, cx, cy, c) {
        const outline = 0x1a1a2e;
        
        // --- HALO RING (behind) ---
        g.lineStyle(4, c.accent.glow, 0.5);
        g.strokeEllipse(cx, cy - 20, 18, 7);
        g.lineStyle(2, c.accent.main, 0.8);
        g.strokeEllipse(cx, cy - 20, 18, 7);
        
        // Halo glow particles
        g.fillStyle(c.accent.glow, 0.6);
        g.fillCircle(cx - 16, cy - 20, 2);
        g.fillCircle(cx + 16, cy - 20, 2);
        g.fillCircle(cx, cy - 26, 1.5);
        
        // --- ANTENNA ---
        g.fillStyle(0x556666, 1);
        g.fillRoundedRect(cx - 2, cy - 32, 4, 16, 2);
        
        // Antenna tip
        g.fillStyle(c.accent.glow, 0.6);
        g.fillCircle(cx, cy - 34, 6);
        g.fillStyle(c.accent.main, 1);
        g.fillCircle(cx, cy - 34, 4);
        
        // --- MAIN BODY (floating bot) ---
        // Body base
        g.fillStyle(c.primary, 1);
        g.fillRoundedRect(cx - 16, cy - 10, 32, 24, 8);
        
        // Body panels
        g.fillStyle(c.secondary, 0.4);
        g.fillRoundedRect(cx - 14, cy - 8, 12, 20, 4);
        g.fillStyle(c.dark, 0.3);
        g.fillRoundedRect(cx + 2, cy - 8, 12, 20, 4);
        
        // Panel lines
        g.lineStyle(1, c.dark, 0.4);
        g.lineBetween(cx - 14, cy, cx + 14, cy);
        g.lineBetween(cx, cy - 8, cx, cy + 12);
        
        // Vent grills
        g.fillStyle(0x1a1a2e, 0.6);
        for (let i = 0; i < 3; i++) {
            g.fillRect(cx - 12, cy + 4 + i * 3, 8, 1.5);
        }
        
        // --- CORE (pulsing center) ---
        g.fillStyle(c.accent.glow, 0.4);
        g.fillCircle(cx, cy, 10);
        g.fillStyle(c.accent.main, 1);
        g.fillCircle(cx, cy, 7);
        g.fillStyle(c.accent.glow, 1);
        g.fillCircle(cx, cy, 4);
        g.fillStyle(0xffffff, 0.8);
        g.fillCircle(cx - 1, cy - 2, 2);
        
        // Cross symbol overlay
        g.fillStyle(0xffffff, 0.6);
        g.fillRoundedRect(cx - 5, cy - 1, 10, 2, 0.5);
        g.fillRoundedRect(cx - 1, cy - 5, 2, 10, 0.5);
        
        // --- EYE/SENSOR ---
        g.fillStyle(0x223344, 1);
        g.fillRoundedRect(cx - 10, cy - 16, 20, 8, 3);
        
        // Eye lens
        g.fillStyle(c.accent.glow, 0.9);
        g.fillRoundedRect(cx - 8, cy - 15, 16, 6, 2);
        
        // Eye detail
        g.fillStyle(0xffffff, 0.5);
        g.fillRoundedRect(cx - 6, cy - 15, 6, 2, 1);
        
        // Scanning line
        g.fillStyle(c.accent.main, 0.8);
        g.fillRect(cx - 6, cy - 13, 12, 1);
        
        // --- SIDE THRUSTERS ---
        // Left thruster
        g.fillStyle(0x445566, 1);
        g.fillRoundedRect(cx - 22, cy - 2, 8, 12, 3);
        g.fillStyle(0x334455, 1);
        g.fillRoundedRect(cx - 21, cy, 6, 8, 2);
        
        // Right thruster
        g.fillStyle(0x445566, 1);
        g.fillRoundedRect(cx + 14, cy - 2, 8, 12, 3);
        g.fillStyle(0x334455, 1);
        g.fillRoundedRect(cx + 15, cy, 6, 8, 2);
        
        // Thruster glow
        g.fillStyle(c.accent.glow, 0.6);
        g.fillEllipse(cx - 18, cy + 14, 5, 8);
        g.fillEllipse(cx + 18, cy + 14, 5, 8);
        g.fillStyle(c.accent.main, 0.8);
        g.fillEllipse(cx - 18, cy + 12, 3, 5);
        g.fillEllipse(cx + 18, cy + 12, 3, 5);
        
        // --- OUTLINE ---
        g.lineStyle(2.5, outline, 1);
        g.strokeRoundedRect(cx - 16, cy - 10, 32, 24, 8);
    }
    
    // === CHARACTER CONTAINER CREATION ===
    
    createCharacter(unitType, isEnemy, x, y) {
        const team = isEnemy ? 'enemy' : 'player';
        const textureKey = this.generateUnitTexture(unitType, team);
        const c = this.getUnitColors(unitType, isEnemy);
        
        const container = this.scene.add.container(x, y);
        container.setDepth(20);
        container.unitType = unitType;
        
        // Shadow
        const shadow = this.scene.add.ellipse(0, 18, 26, 8, 0x000000, 0.35);
        container.add(shadow);
        container.shadow = shadow;
        
        // Character sprite
        const sprite = this.scene.add.image(0, 0, textureKey);
        sprite.setScale(0.45);
        container.add(sprite);
        container.sprite = sprite;
        
        // For healer: add separate pulsing core element
        if (unitType === 'healerDrone') {
            const core = this.scene.add.circle(0, 0, 4, c.accent.glow, 0.8);
            container.add(core);
            container.core = core;
        }
        
        // Animation state
        container.animState = {
            idle: true,
            walking: false,
            attacking: false,
            bobPhase: Math.random() * Math.PI * 2,
            blinkTimer: 2000 + Math.random() * 3000
        };
        
        // Start idle animation
        this.startIdleAnimation(container);
        
        return container;
    }
    
    // === ANIMATIONS ===
    
    startIdleAnimation(container) {
        this.stopAnimations(container);
        
        // Breathing bob
        container.idleTween = this.scene.tweens.add({
            targets: container.sprite,
            y: { from: 0, to: -2 },
            scaleY: { from: 0.45, to: 0.46 },
            duration: 1200,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Shadow breathing
        this.scene.tweens.add({
            targets: container.shadow,
            scaleX: { from: 1, to: 0.95 },
            duration: 1200,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Blink timer
        this.scheduleBlink(container);
        
        // Healer core pulse
        if (container.core) {
            container.coreTween = this.scene.tweens.add({
                targets: container.core,
                scale: { from: 1, to: 1.4 },
                alpha: { from: 0.8, to: 0.4 },
                duration: 800,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
    }
    
    scheduleBlink(container) {
        if (!container || !container.sprite) return;
        
        const blinkDelay = 2000 + Math.random() * 4000;
        container.blinkEvent = this.scene.time.delayedCall(blinkDelay, () => {
            if (container && container.sprite) {
                this.doBlink(container);
                this.scheduleBlink(container);
            }
        });
    }
    
    doBlink(container) {
        // Quick scale squash for "blink"
        this.scene.tweens.add({
            targets: container.sprite,
            scaleY: 0.42,
            duration: 60,
            yoyo: true,
            ease: 'Quad.easeInOut'
        });
    }
    
    startWalkAnimation(container, direction) {
        this.stopAnimations(container);
        container.animState.walking = true;
        
        // Bouncy walk
        container.walkTween = this.scene.tweens.add({
            targets: container.sprite,
            y: { from: 0, to: -5 },
            scaleX: { from: 0.45, to: 0.47 },
            scaleY: { from: 0.45, to: 0.43 },
            duration: 180,
            yoyo: true,
            repeat: -1,
            ease: 'Quad.easeOut'
        });
        
        // Lean in direction
        const leanAngle = direction > 0 ? 0.08 : -0.08;
        this.scene.tweens.add({
            targets: container.sprite,
            rotation: leanAngle,
            duration: 150,
            ease: 'Quad.easeOut'
        });
        
        // Shadow follows
        this.scene.tweens.add({
            targets: container.shadow,
            scaleX: { from: 1, to: 0.85 },
            scaleY: { from: 1, to: 1.1 },
            duration: 180,
            yoyo: true,
            repeat: -1
        });
    }
    
    stopWalkAnimation(container) {
        this.stopAnimations(container);
        container.animState.walking = false;
        
        // Reset
        this.scene.tweens.add({
            targets: container.sprite,
            rotation: 0,
            scaleX: 0.45,
            scaleY: 0.45,
            y: 0,
            duration: 100
        });
        
        this.scene.tweens.add({
            targets: container.shadow,
            scaleX: 1,
            scaleY: 1,
            duration: 100
        });
        
        this.startIdleAnimation(container);
    }
    
    playAttackAnimation(container, isMelee) {
        if (container.attackTween && container.attackTween.isPlaying()) return;
        
        const unitType = container.unitType;
        
        // Class-specific attack animations
        switch (unitType) {
            case 'runner':
                this.playSlashAttack(container);
                break;
            case 'guardian':
                this.playShieldBash(container);
                break;
            case 'slingbot':
                this.playRecoilAttack(container);
                break;
            case 'sparkMage':
                this.playStaffZap(container);
                break;
            case 'bomberBug':
                this.playTossAttack(container);
                break;
            case 'healerDrone':
                this.playPulseAttack(container);
                break;
            default:
                this.playGenericAttack(container, isMelee);
        }
    }
    
    playSlashAttack(container) {
        // Quick forward lunge + slash
        container.attackTween = this.scene.tweens.add({
            targets: container.sprite,
            x: 6,
            rotation: 0.3,
            scaleX: 0.5,
            duration: 80,
            yoyo: true,
            ease: 'Quad.easeOut',
            onComplete: () => this.resetAttack(container)
        });
        
        // Create slash trail VFX
        this.createSlashTrail(container);
    }
    
    playShieldBash(container) {
        // Heavy forward bash
        container.attackTween = this.scene.tweens.add({
            targets: container.sprite,
            x: 8,
            scaleX: 0.52,
            scaleY: 0.42,
            duration: 120,
            yoyo: true,
            ease: 'Back.easeOut',
            onComplete: () => this.resetAttack(container)
        });
    }
    
    playRecoilAttack(container) {
        // Backwards recoil
        container.attackTween = this.scene.tweens.add({
            targets: container.sprite,
            x: -5,
            rotation: -0.15,
            duration: 100,
            yoyo: true,
            ease: 'Quad.easeOut',
            onComplete: () => this.resetAttack(container)
        });
    }
    
    playStaffZap(container) {
        // Staff raise + flash
        container.attackTween = this.scene.tweens.add({
            targets: container.sprite,
            y: -6,
            scaleY: 0.48,
            duration: 150,
            yoyo: true,
            ease: 'Quad.easeOut',
            onStart: () => {
                // Flash effect
                container.sprite.setTint(0xddaaff);
                this.scene.time.delayedCall(100, () => {
                    if (container.sprite) container.sprite.clearTint();
                });
            },
            onComplete: () => this.resetAttack(container)
        });
    }
    
    playTossAttack(container) {
        // Wind up + toss
        container.attackTween = this.scene.tweens.timeline({
            targets: container.sprite,
            tweens: [
                { x: -4, rotation: -0.2, duration: 80 },
                { x: 6, rotation: 0.25, duration: 100 },
                { x: 0, rotation: 0, duration: 80 }
            ],
            onComplete: () => this.resetAttack(container)
        });
    }
    
    playPulseAttack(container) {
        // Pulse outward
        container.attackTween = this.scene.tweens.add({
            targets: container.sprite,
            scaleX: 0.52,
            scaleY: 0.52,
            duration: 150,
            yoyo: true,
            ease: 'Quad.easeOut',
            onComplete: () => this.resetAttack(container)
        });
        
        // Core flash
        if (container.core) {
            this.scene.tweens.add({
                targets: container.core,
                scale: 2,
                alpha: 1,
                duration: 150,
                yoyo: true
            });
        }
        
        // Heal pulse ring VFX
        this.createHealPulse(container);
    }
    
    playGenericAttack(container, isMelee) {
        const dist = isMelee ? 6 : -4;
        const rot = isMelee ? 0.3 : -0.1;
        
        container.attackTween = this.scene.tweens.add({
            targets: container.sprite,
            x: dist,
            rotation: rot,
            duration: 100,
            yoyo: true,
            ease: 'Quad.easeOut',
            onComplete: () => this.resetAttack(container)
        });
    }
    
    resetAttack(container) {
        if (!container || !container.sprite) return;
        container.attackTween = null;
        container.sprite.x = 0;
        container.sprite.rotation = 0;
        container.sprite.scaleX = 0.45;
        container.sprite.scaleY = 0.45;
    }
    
    playHitAnimation(container) {
        // White flash
        if (container.sprite) {
            container.sprite.setTint(0xffffff);
            this.scene.time.delayedCall(60, () => {
                if (container.sprite) container.sprite.clearTint();
            });
        }
        
        // Knockback
        this.scene.tweens.add({
            targets: container,
            x: container.x - 6,
            duration: 40,
            yoyo: true,
            ease: 'Quad.easeOut'
        });
        
        // Squash
        this.scene.tweens.add({
            targets: container.sprite,
            scaleX: 0.5,
            scaleY: 0.4,
            duration: 40,
            yoyo: true
        });
    }
    
    playDeathAnimation(container, onComplete) {
        this.stopAnimations(container);
        
        // Squash down + fade
        this.scene.tweens.add({
            targets: container.sprite,
            scaleX: 0.6,
            scaleY: 0.2,
            y: 12,
            alpha: 0,
            rotation: (Math.random() - 0.5) * 0.5,
            duration: 250,
            ease: 'Quad.easeIn'
        });
        
        // Shadow shrink
        this.scene.tweens.add({
            targets: container.shadow,
            scaleX: 0.3,
            scaleY: 0.3,
            alpha: 0,
            duration: 250,
            onComplete: () => {
                // Death particles
                this.createDeathParticles(container);
                if (onComplete) onComplete();
            }
        });
        
        // Core fade for healer
        if (container.core) {
            this.scene.tweens.add({
                targets: container.core,
                alpha: 0,
                scale: 0,
                duration: 200
            });
        }
    }
    
    stopAnimations(container) {
        if (container.idleTween) {
            container.idleTween.stop();
            container.idleTween = null;
        }
        if (container.walkTween) {
            container.walkTween.stop();
            container.walkTween = null;
        }
        if (container.blinkEvent) {
            container.blinkEvent.remove();
            container.blinkEvent = null;
        }
        if (container.coreTween) {
            container.coreTween.stop();
            container.coreTween = null;
        }
    }
    
    // === VFX ===
    
    createSlashTrail(container) {
        const x = container.x + 10;
        const y = container.y;
        
        const arc = this.scene.add.graphics();
        arc.lineStyle(3, 0xffffff, 0.8);
        arc.beginPath();
        arc.arc(x, y, 16, -0.8, 0.8);
        arc.strokePath();
        arc.setDepth(25);
        
        this.scene.tweens.add({
            targets: arc,
            alpha: 0,
            scaleX: 1.5,
            scaleY: 1.5,
            duration: 150,
            onComplete: () => arc.destroy()
        });
    }
    
    createHealPulse(container) {
        const ring = this.scene.add.circle(container.x, container.y, 8, 0x44ffaa, 0);
        ring.setStrokeStyle(3, 0x44ffaa, 0.8);
        ring.setDepth(15);
        
        this.scene.tweens.add({
            targets: ring,
            scale: 4,
            alpha: 0,
            duration: 400,
            ease: 'Quad.easeOut',
            onComplete: () => ring.destroy()
        });
    }
    
    createDeathParticles(container) {
        const colors = [0xffffff, 0xaaaaaa, 0x666666];
        
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const color = colors[Math.floor(Math.random() * colors.length)];
            const particle = this.scene.add.circle(container.x, container.y, 3, color);
            particle.setDepth(25);
            
            this.scene.tweens.add({
                targets: particle,
                x: container.x + Math.cos(angle) * 25,
                y: container.y + Math.sin(angle) * 20 - 10,
                alpha: 0,
                scale: 0.3,
                duration: 300,
                ease: 'Quad.easeOut',
                onComplete: () => particle.destroy()
            });
        }
    }
    
    // Chain lightning effect
    createChainLightning(x1, y1, x2, y2) {
        const graphics = this.scene.add.graphics();
        graphics.setDepth(28);
        
        // Zig-zag line
        const segments = 5;
        const dx = (x2 - x1) / segments;
        const dy = (y2 - y1) / segments;
        
        graphics.lineStyle(3, 0xaa44ff, 0.9);
        graphics.beginPath();
        graphics.moveTo(x1, y1);
        
        for (let i = 1; i < segments; i++) {
            const px = x1 + dx * i + (Math.random() - 0.5) * 20;
            const py = y1 + dy * i + (Math.random() - 0.5) * 20;
            graphics.lineTo(px, py);
        }
        graphics.lineTo(x2, y2);
        graphics.strokePath();
        
        // Inner bright line
        graphics.lineStyle(1.5, 0xdd88ff, 1);
        graphics.beginPath();
        graphics.moveTo(x1, y1);
        for (let i = 1; i < segments; i++) {
            const px = x1 + dx * i + (Math.random() - 0.5) * 15;
            const py = y1 + dy * i + (Math.random() - 0.5) * 15;
            graphics.lineTo(px, py);
        }
        graphics.lineTo(x2, y2);
        graphics.strokePath();
        
        this.scene.tweens.add({
            targets: graphics,
            alpha: 0,
            duration: 150,
            onComplete: () => graphics.destroy()
        });
    }
    
    // Bomb explosion effect
    createBombExplosion(x, y) {
        // Flash
        const flash = this.scene.add.circle(x, y, 30, 0xffaa00, 0.8);
        flash.setDepth(28);
        
        this.scene.tweens.add({
            targets: flash,
            scale: 2,
            alpha: 0,
            duration: 200,
            onComplete: () => flash.destroy()
        });
        
        // Smoke puffs
        const smokeColors = [0x444444, 0x666666, 0x888888];
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const dist = 15 + Math.random() * 20;
            const color = smokeColors[Math.floor(Math.random() * smokeColors.length)];
            
            const puff = this.scene.add.circle(x, y, 6 + Math.random() * 4, color, 0.7);
            puff.setDepth(27);
            
            this.scene.tweens.add({
                targets: puff,
                x: x + Math.cos(angle) * dist,
                y: y + Math.sin(angle) * dist - 15,
                scale: 2,
                alpha: 0,
                duration: 350,
                ease: 'Quad.easeOut',
                onComplete: () => puff.destroy()
            });
        }
    }
    
    // === ICON GENERATION ===
    
    generateIconTexture(unitType) {
        const iconKey = `icon_${unitType}`;
        if (this.scene.textures.exists(iconKey)) return iconKey;
        
        const size = 40;
        const g = this.scene.add.graphics();
        const c = this.getUnitColors(unitType, false);
        const cx = size / 2, cy = size / 2;
        
        // Background circle
        g.fillStyle(c.primary, 1);
        g.fillCircle(cx, cy, size/2 - 2);
        g.lineStyle(2, c.accent.main, 1);
        g.strokeCircle(cx, cy, size/2 - 2);
        
        // Inner highlight
        g.fillStyle(c.secondary, 0.4);
        g.fillCircle(cx - 4, cy - 4, size/4);
        
        // Unit-specific icon detail
        g.fillStyle(c.accent.glow, 1);
        switch (unitType) {
            case 'runner':
                g.fillTriangle(cx - 6, cy + 6, cx + 8, cy, cx - 6, cy - 6);
                break;
            case 'guardian':
                g.fillRoundedRect(cx - 8, cy - 6, 16, 14, 3);
                g.fillStyle(c.primary, 1);
                g.fillCircle(cx, cy + 2, 4);
                break;
            case 'slingbot':
                g.fillCircle(cx + 4, cy, 6);
                g.fillCircle(cx - 6, cy - 4, 3);
                g.fillCircle(cx - 6, cy + 4, 3);
                break;
            case 'sparkMage':
                g.fillCircle(cx, cy - 6, 5);
                g.fillRoundedRect(cx - 1.5, cy - 2, 3, 12, 1);
                break;
            case 'bomberBug':
                g.fillCircle(cx, cy + 2, 8);
                g.fillStyle(0xffff00, 1);
                g.fillCircle(cx, cy - 6, 3);
                break;
            case 'healerDrone':
                g.fillRoundedRect(cx - 7, cy - 1.5, 14, 3, 1);
                g.fillRoundedRect(cx - 1.5, cy - 7, 3, 14, 1);
                break;
        }
        
        g.generateTexture(iconKey, size, size);
        g.destroy();
        this.iconCache[unitType] = true;
        return iconKey;
    }
    
    createCardIcon(unitType, x, y, scale = 1) {
        const iconKey = this.generateIconTexture(unitType);
        const icon = this.scene.add.image(x, y, iconKey);
        icon.setScale(scale);
        return icon;
    }
}

window.CharacterArt = CharacterArt;
