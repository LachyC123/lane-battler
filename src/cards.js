// cards.js - Card definitions and deck management for Lane Storm

const CARD_TYPES = {
    UNIT: 'unit',
    TACTIC: 'tactic'
};

// Unit card definitions
const CARDS = {
    runner: {
        id: 'runner',
        name: 'Runner',
        type: CARD_TYPES.UNIT,
        cost: 2,
        color: 0x44ff44,
        shape: 'triangle',
        stats: {
            hp: 150,
            damage: 35,
            attackSpeed: 0.8, // attacks per second
            moveSpeed: 120,
            range: 30, // melee
            size: 12
        },
        description: 'Fast melee unit with low HP'
    },
    guardian: {
        id: 'guardian',
        name: 'Guardian',
        type: CARD_TYPES.UNIT,
        cost: 4,
        color: 0x6666ff,
        shape: 'hexagon',
        stats: {
            hp: 600,
            damage: 50,
            attackSpeed: 0.5,
            moveSpeed: 50,
            range: 35,
            size: 20,
            taunt: true // Towers prefer targeting this unit
        },
        description: 'Tanky unit that draws tower fire'
    },
    slingbot: {
        id: 'slingbot',
        name: 'Slingbot',
        type: CARD_TYPES.UNIT,
        cost: 3,
        color: 0xffaa00,
        shape: 'square',
        stats: {
            hp: 200,
            damage: 60,
            attackSpeed: 0.7,
            moveSpeed: 70,
            range: 180,
            size: 14,
            projectileSpeed: 300
        },
        description: 'Ranged unit, single target'
    },
    sparkMage: {
        id: 'sparkMage',
        name: 'Spark Mage',
        type: CARD_TYPES.UNIT,
        cost: 5,
        color: 0xaa44ff,
        shape: 'diamond',
        stats: {
            hp: 250,
            damage: 80,
            attackSpeed: 0.6,
            moveSpeed: 60,
            range: 150,
            size: 16,
            projectileSpeed: 250,
            chainLightning: true,
            maxChains: 2,
            chainRange: 100,
            chainDamageFalloff: 0.6
        },
        description: 'Chain lightning hits up to 3 enemies'
    },
    bomberBug: {
        id: 'bomberBug',
        name: 'Bomber Bug',
        type: CARD_TYPES.UNIT,
        cost: 3,
        color: 0xff4444,
        shape: 'circle',
        stats: {
            hp: 180,
            damage: 70,
            attackSpeed: 0.6,
            moveSpeed: 75,
            range: 80, // short range
            size: 14,
            splashRadius: 50,
            projectileSpeed: 200
        },
        description: 'Short-range AoE splash damage'
    },
    healerDrone: {
        id: 'healerDrone',
        name: 'Healer Drone',
        type: CARD_TYPES.UNIT,
        cost: 4,
        color: 0x44ffaa,
        shape: 'plus',
        stats: {
            hp: 220,
            damage: 20,
            attackSpeed: 0.4,
            moveSpeed: 80,
            range: 100,
            size: 14,
            healAmount: 25,
            healRadius: 80,
            healCooldown: 2000, // 2 seconds cooldown
            maxHealPerUnit: 150 // Prevents infinite stacking abuse
        },
        description: 'Heals nearby allies periodically'
    },
    
    // Tactic cards
    barrierPad: {
        id: 'barrierPad',
        name: 'Barrier Pad',
        type: CARD_TYPES.TACTIC,
        cost: 2,
        color: 0x00aaff,
        shape: 'zone',
        stats: {
            radius: 60,
            duration: 4000, // 4 seconds
            shieldAmount: 100, // temporary shield HP
            size: 60
        },
        description: 'Place a zone that shields allies inside'
    },
    decoyBeacon: {
        id: 'decoyBeacon',
        name: 'Decoy Beacon',
        type: CARD_TYPES.TACTIC,
        cost: 2,
        color: 0xffff44,
        shape: 'beacon',
        stats: {
            hp: 200,
            duration: 3500, // 3.5 seconds
            tauntRadius: 120,
            size: 18
        },
        description: 'Distracts nearby enemies briefly'
    }
};

// Default deck configuration
const DEFAULT_DECK = [
    'runner',
    'guardian',
    'slingbot',
    'sparkMage',
    'bomberBug',
    'healerDrone',
    'barrierPad',
    'decoyBeacon'
];

// Deck Manager class
class DeckManager {
    constructor(deckCards = DEFAULT_DECK) {
        this.deck = [...deckCards];
        this.hand = [];
        this.nextCard = null;
        this.usedCards = [];
        
        this.initializeHand();
    }
    
    initializeHand() {
        // Shuffle deck
        this.shuffleDeck();
        
        // Draw 4 cards to hand
        for (let i = 0; i < 4; i++) {
            this.hand.push(this.drawFromDeck());
        }
        
        // Set next card
        this.nextCard = this.drawFromDeck();
    }
    
    shuffleDeck() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }
    
    drawFromDeck() {
        if (this.deck.length === 0) {
            // Reshuffle used cards back into deck
            this.deck = [...this.usedCards];
            this.usedCards = [];
            this.shuffleDeck();
        }
        return this.deck.pop();
    }
    
    playCard(handIndex) {
        if (handIndex < 0 || handIndex >= this.hand.length) return null;
        
        const playedCardId = this.hand[handIndex];
        this.usedCards.push(playedCardId);
        
        // Replace with next card
        this.hand[handIndex] = this.nextCard;
        
        // Draw new next card
        this.nextCard = this.drawFromDeck();
        
        return CARDS[playedCardId];
    }
    
    getHandCards() {
        return this.hand.map(id => CARDS[id]);
    }
    
    getNextCard() {
        return CARDS[this.nextCard];
    }
    
    canAfford(handIndex, elixir) {
        if (handIndex < 0 || handIndex >= this.hand.length) return false;
        const card = CARDS[this.hand[handIndex]];
        return elixir >= card.cost;
    }
}

// Export for use in other modules
window.CARDS = CARDS;
window.CARD_TYPES = CARD_TYPES;
window.DEFAULT_DECK = DEFAULT_DECK;
window.DeckManager = DeckManager;
