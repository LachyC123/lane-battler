// main.js - Phaser game configuration and initialization for Lane Storm

class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    create() {
        // Intentionally empty: we wait for the user to press Play.
    }
}

function ensureOverlayDisabled(el) {
    if (!el) return;
    el.classList.add('hidden');
    el.style.display = 'none';
    el.style.pointerEvents = 'none';
}

function showOnScreenError(err) {
    const message =
        err instanceof Error ? (err.stack || err.message) : String(err);

    let box = document.getElementById('runtime-error-box');
    if (!box) {
        box = document.createElement('div');
        box.id = 'runtime-error-box';
        box.style.position = 'fixed';
        box.style.left = '12px';
        box.style.top = '12px';
        box.style.maxWidth = 'min(720px, calc(100vw - 24px))';
        box.style.maxHeight = 'min(60vh, calc(100vh - 24px))';
        box.style.overflow = 'auto';
        box.style.padding = '12px 14px';
        box.style.borderRadius = '10px';
        box.style.border = '2px solid #ff4757';
        box.style.background = 'rgba(10, 10, 16, 0.92)';
        box.style.color = '#ffffff';
        box.style.fontFamily = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';
        box.style.fontSize = '12px';
        box.style.lineHeight = '1.35';
        box.style.whiteSpace = 'pre-wrap';
        box.style.zIndex = '5000';
        box.style.pointerEvents = 'auto';

        const closeBtn = document.createElement('button');
        closeBtn.textContent = '×';
        closeBtn.setAttribute('aria-label', 'Close error');
        closeBtn.style.position = 'absolute';
        closeBtn.style.right = '8px';
        closeBtn.style.top = '6px';
        closeBtn.style.width = '28px';
        closeBtn.style.height = '28px';
        closeBtn.style.borderRadius = '50%';
        closeBtn.style.border = '1px solid rgba(255,255,255,0.25)';
        closeBtn.style.background = 'rgba(0,0,0,0.35)';
        closeBtn.style.color = '#fff';
        closeBtn.style.cursor = 'pointer';
        closeBtn.addEventListener('click', () => box.remove());
        box.appendChild(closeBtn);

        const pre = document.createElement('div');
        pre.id = 'runtime-error-text';
        box.appendChild(pre);

        document.body.appendChild(box);
    }

    const textEl = box.querySelector('#runtime-error-text');
    if (textEl) {
        textEl.textContent = `Startup/runtime error:\n\n${message}`;
    }

    console.error(err);
}

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
    // BootScene starts first; match only starts after Play.
    scene: [BootScene, GameScene, UIScene]
};

// Global game instance
let game = null;
let currentDifficulty = 'normal';

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initializeGame();
    setupMenuListeners();
    checkTutorial();

    window.addEventListener('error', (e) => {
        // Avoid double-reporting if already handled elsewhere.
        showOnScreenError(e.error || e.message || e);
    });
    window.addEventListener('unhandledrejection', (e) => {
        showOnScreenError(e.reason || e);
    });
});

function initializeGame() {
    // Boot Phaser immediately so scene transitions on Play are reliable.
    if (!game) {
        try {
            game = new Phaser.Game(config);
        } catch (err) {
            showOnScreenError(err);
        }
    }
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
    try {
        // Hide start screen (fully disable it so it cannot block the canvas)
        ensureOverlayDisabled(document.getElementById('start-screen'));
    
    // Show tutorial on first play
    const hasPlayed = localStorage.getItem('laneStorm_hasPlayed');
    if (!hasPlayed) {
        localStorage.setItem('laneStorm_hasPlayed', 'true');
        showTutorial();
    }
    
        // Ensure Phaser is initialized
        initializeGame();

        // Start the game scene with difficulty
        if (game) {
            if (game.scene.isActive('BootScene')) {
                game.scene.stop('BootScene');
            }
            game.scene.start('GameScene', { difficulty: currentDifficulty });
            // UI runs alongside the match scene
            game.scene.launch('UIScene');
        }
    } catch (err) {
        showOnScreenError(err);
    }
}

function restartGame() {
    try {
        if (game) {
            // Stop current scenes
            if (game.scene.isActive('GameScene')) game.scene.stop('GameScene');
            if (game.scene.isActive('UIScene')) game.scene.stop('UIScene');

            // Restart with current difficulty
            game.scene.start('GameScene', { difficulty: currentDifficulty });
            game.scene.launch('UIScene');
        }
    } catch (err) {
        showOnScreenError(err);
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
    const startScreen = document.getElementById('start-screen');
    if (startScreen) {
        startScreen.classList.remove('hidden');
        startScreen.style.display = '';
        startScreen.style.pointerEvents = '';
    }
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
