// main.js - Phaser game configuration and initialization for Lane Storm

// Game configuration
const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: 800,
    height: 600,
    backgroundColor: '#1a1a2e',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [GameScene, UIScene]
};

// Global game instance
let game = null;
let currentDifficulty = 'normal';

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initializeGame();
    setupMenuListeners();
    checkTutorial();
});

function initializeGame() {
    // Don't start Phaser yet, wait for play button
}

function setupMenuListeners() {
    // Play button
    const playBtn = document.getElementById('play-btn');
    playBtn.addEventListener('click', startGame);
    
    // Difficulty select
    const difficultySelect = document.getElementById('difficulty-select');
    difficultySelect.addEventListener('change', (e) => {
        currentDifficulty = e.target.value;
    });
    
    // Rematch button
    const rematchBtn = document.getElementById('rematch-btn');
    rematchBtn.addEventListener('click', () => {
        document.getElementById('game-over-screen').classList.add('hidden');
        restartGame();
    });
    
    // Menu button
    const menuBtn = document.getElementById('menu-btn');
    menuBtn.addEventListener('click', () => {
        document.getElementById('game-over-screen').classList.add('hidden');
        returnToMenu();
    });
    
    // Tutorial close button
    const tutorialCloseBtn = document.getElementById('tutorial-close-btn');
    tutorialCloseBtn.addEventListener('click', closeTutorial);
}

function checkTutorial() {
    const dontShow = localStorage.getItem('laneStorm_hideTutorial');
    if (!dontShow) {
        // Will show tutorial when game starts
    }
}

function showTutorial() {
    const dontShow = localStorage.getItem('laneStorm_hideTutorial');
    if (dontShow === 'true') return;
    
    document.getElementById('tutorial-overlay').classList.remove('hidden');
}

function closeTutorial() {
    const checkbox = document.getElementById('dont-show-tutorial');
    if (checkbox.checked) {
        localStorage.setItem('laneStorm_hideTutorial', 'true');
    }
    document.getElementById('tutorial-overlay').classList.add('hidden');
}

function startGame() {
    // Hide start screen
    document.getElementById('start-screen').classList.add('hidden');
    
    // Show tutorial on first play
    const hasPlayed = localStorage.getItem('laneStorm_hasPlayed');
    if (!hasPlayed) {
        localStorage.setItem('laneStorm_hasPlayed', 'true');
        showTutorial();
    }
    
    // Create Phaser game if not exists
    if (!game) {
        game = new Phaser.Game(config);
    }
    
    // Start the game scene with difficulty
    game.scene.start('GameScene', { difficulty: currentDifficulty });
    game.scene.start('UIScene');
}

function restartGame() {
    if (game) {
        // Stop current scenes
        game.scene.stop('GameScene');
        game.scene.stop('UIScene');
        
        // Restart with current difficulty
        game.scene.start('GameScene', { difficulty: currentDifficulty });
        game.scene.start('UIScene');
    }
}

function returnToMenu() {
    if (game) {
        // Stop game scenes
        game.scene.stop('GameScene');
        game.scene.stop('UIScene');
        
        // Destroy game instance
        game.destroy(true);
        game = null;
    }
    
    // Show start screen
    document.getElementById('start-screen').classList.remove('hidden');
}

// Prevent default touch behaviors for better mobile experience
document.addEventListener('touchmove', (e) => {
    if (e.target.closest('#game-container')) {
        e.preventDefault();
    }
}, { passive: false });

// Handle visibility change (pause when tab is not visible)
document.addEventListener('visibilitychange', () => {
    if (game) {
        if (document.hidden) {
            game.scene.pause('GameScene');
        } else {
            game.scene.resume('GameScene');
        }
    }
});

// Export functions for debugging
window.LaneStorm = {
    restart: restartGame,
    menu: returnToMenu,
    getDifficulty: () => currentDifficulty
};
