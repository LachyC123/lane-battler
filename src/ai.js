// ai.js - AI opponent logic for Lane Storm

const AI_DIFFICULTY = {
    easy: {
        reactionDelay: 2500, // ms before responding
        elixirThreshold: 8, // Wait until this much elixir
        placementRandomness: 40, // pixels of placement variance
        defendThreshold: 0.4, // % of lane progress before defending
        momentumUseDelay: 3000 // How long to wait before using momentum
    },
    normal: {
        reactionDelay: 1500,
        elixirThreshold: 6,
        placementRandomness: 20,
        defendThreshold: 0.5,
        momentumUseDelay: 1500
    },
    hard: {
        reactionDelay: 800,
        elixirThreshold: 4,
        placementRandomness: 10,
        defendThreshold: 0.6,
        momentumUseDelay: 500
    }
};

class AIController {
    constructor(difficulty = 'normal') {
        this.difficulty = AI_DIFFICULTY[difficulty] || AI_DIFFICULTY.normal;
        this.deckManager = new DeckManager();
        this.lastActionTime = 0;
        this.elixir = 5;
        this.momentum = 0;
        this.momentumReady = false;
        this.activeBuff = null;
        this.buffEndTime = 0;
        
        // Track threats
        this.threatLevel = { top: 0, bottom: 0 };
        this.pushStrength = { top: 0, bottom: 0 };
    }
    
    update(gameState, currentTime) {
        // Check if buff expired
        if (this.activeBuff && currentTime > this.buffEndTime) {
            this.activeBuff = null;
        }
        
        // Update elixir (handled by game, but track locally too)
        this.elixir = gameState.aiElixir;
        this.momentum = gameState.aiMomentum;
        this.momentumReady = this.momentum >= 100;
        
        // Check if enough time has passed since last action
        if (currentTime - this.lastActionTime < this.difficulty.reactionDelay) {
            return null;
        }
        
        // Analyze game state
        this.analyzeThreats(gameState);
        
        // Decide on action
        const action = this.decideAction(gameState, currentTime);
        
        if (action) {
            this.lastActionTime = currentTime;
        }
        
        return action;
    }
    
    analyzeThreats(gameState) {
        // Reset threat levels
        this.threatLevel = { top: 0, bottom: 0 };
        this.pushStrength = { top: 0, bottom: 0 };
        
        // Analyze player units
        const playerUnits = gameState.playerUnits || [];
        const aiUnits = gameState.aiUnits || [];
        
        const aiTowerY = gameState.aiBaseY;
        const midY = gameState.midY;
        
        playerUnits.forEach(unit => {
            const lane = unit.lane;
            const distanceToBase = Math.abs(unit.y - aiTowerY);
            const progress = 1 - (distanceToBase / (midY - aiTowerY));
            
            // Higher threat = closer to AI base + more HP
            const threat = (progress * 100) + (unit.hp / 10);
            this.threatLevel[lane] += threat;
        });
        
        // Analyze AI units for push strength
        aiUnits.forEach(unit => {
            const lane = unit.lane;
            const distanceToEnemy = Math.abs(unit.y - gameState.playerBaseY);
            const progress = 1 - (distanceToEnemy / (gameState.playerBaseY - midY));
            
            this.pushStrength[lane] += (progress * 50) + (unit.hp / 10);
        });
    }
    
    decideAction(gameState, currentTime) {
        // Priority 1: Use momentum if ready
        if (this.momentumReady) {
            return this.decideMomentumUse(gameState, currentTime);
        }
        
        // Priority 2: Check if we have enough elixir
        if (this.elixir < 2) {
            return null;
        }
        
        // Priority 3: Defend if threatened
        const topThreat = this.threatLevel.top;
        const bottomThreat = this.threatLevel.bottom;
        const maxThreat = Math.max(topThreat, bottomThreat);
        
        if (maxThreat > this.difficulty.defendThreshold * 100) {
            // Defend the WEAKER lane: higher threat relative to our defense
            const topVulnerability = topThreat - this.pushStrength.top;
            const bottomVulnerability = bottomThreat - this.pushStrength.bottom;
            const defendLane = topVulnerability > bottomVulnerability ? 'top' : 'bottom';
            return this.decideDefense(gameState, defendLane);
        }
        
        // Priority 4: Push in advantageous lane (only when elixir is high enough)
        if (this.elixir >= this.difficulty.elixirThreshold) {
            return this.decidePush(gameState);
        }
        
        // Priority 5: Save elixir if nothing urgent
        return null;
    }
    
    decideMomentumUse(gameState, currentTime) {
        // Decide between Fury and Fortify based on game state
        const totalThreat = this.threatLevel.top + this.threatLevel.bottom;
        const totalPush = this.pushStrength.top + this.pushStrength.bottom;
        
        // If being pushed, prefer Fortify (shield)
        // If pushing, prefer Fury (attack speed)
        const useFury = totalPush > totalThreat || totalThreat < 50;
        
        return {
            type: 'momentum',
            choice: useFury ? 'fury' : 'fortify'
        };
    }
    
    decideDefense(gameState, lane) {
        const hand = this.deckManager.getHandCards();
        
        // Prioritize: Guardian (tank), Bomber Bug (AoE), Runner (fast response)
        const defensePriority = ['guardian', 'bomberBug', 'runner', 'slingbot', 'sparkMage', 'healerDrone'];
        
        for (const cardId of defensePriority) {
            const handIndex = hand.findIndex(c => c.id === cardId);
            if (handIndex !== -1 && this.deckManager.canAfford(handIndex, this.elixir)) {
                return this.createPlayAction(handIndex, lane, 'defense', gameState);
            }
        }
        
        // Don't spam random cards - wait for a good defensive card
        return null;
    }
    
    decidePush(gameState) {
        const hand = this.deckManager.getHandCards();
        
        // Choose lane with more push strength, or random
        let lane = this.pushStrength.top >= this.pushStrength.bottom ? 'top' : 'bottom';
        
        // Sometimes switch lanes to be unpredictable
        if (Math.random() < 0.3) {
            lane = lane === 'top' ? 'bottom' : 'top';
        }
        
        // Prioritize: Guardian (tank), then damage dealers
        const pushPriority = ['guardian', 'sparkMage', 'slingbot', 'bomberBug', 'runner', 'healerDrone', 'barrierPad', 'decoyBeacon'];
        
        for (const cardId of pushPriority) {
            const handIndex = hand.findIndex(c => c.id === cardId);
            if (handIndex !== -1 && this.deckManager.canAfford(handIndex, this.elixir)) {
                return this.createPlayAction(handIndex, lane, 'push', gameState);
            }
        }
        
        // Don't spam - wait for better cards
        return null;
    }
    
    playAnyAffordable(lane, reason, gameState) {
        const hand = this.deckManager.getHandCards();
        
        for (let i = 0; i < hand.length; i++) {
            if (this.deckManager.canAfford(i, this.elixir)) {
                return this.createPlayAction(i, lane, reason, gameState);
            }
        }
        
        return null;
    }
    
    createPlayAction(handIndex, lane, reason, gameState) {
        const card = this.deckManager.getHandCards()[handIndex];
        
        // Calculate placement position
        let x, y;
        const laneX = lane === 'top' ? gameState.topLaneX : gameState.bottomLaneX;
        
        // Add randomness based on difficulty
        const randX = (Math.random() - 0.5) * this.difficulty.placementRandomness * 2;
        x = laneX + randX;
        
        // Place in AI's half, but position varies by reason
        if (reason === 'defense') {
            // Place closer to AI towers
            y = gameState.aiBaseY + 80 + Math.random() * 60;
        } else {
            // Place further forward for pushes
            y = gameState.aiBaseY + 40 + Math.random() * 40;
        }
        
        return {
            type: 'playCard',
            handIndex: handIndex,
            x: x,
            y: y,
            lane: lane,
            card: card
        };
    }
    
    executeAction(action) {
        if (action.type === 'playCard') {
            const card = this.deckManager.playCard(action.handIndex);
            this.elixir -= card.cost;
            return card;
        }
        return null;
    }
    
    setMomentumUsed() {
        this.momentum = 0;
        this.momentumReady = false;
    }
    
    activateBuff(buffType, duration) {
        this.activeBuff = buffType;
        this.buffEndTime = Date.now() + duration;
    }
}

// Export for use in other modules
window.AIController = AIController;
window.AI_DIFFICULTY = AI_DIFFICULTY;
