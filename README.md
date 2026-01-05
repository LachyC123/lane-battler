# ⚡ Lane Storm ⚡

A 2D lane battler game built with Phaser 3. Deploy units, cast tactics, and destroy the enemy Core Tower!

![Lane Storm Game](https://img.shields.io/badge/Game-Lane%20Storm-blue) ![Phaser 3](https://img.shields.io/badge/Phaser-3.60-green) ![JavaScript](https://img.shields.io/badge/JavaScript-ES6-yellow)

## 🎮 Gameplay

### Objective
- **Win by destroying the enemy Core Tower** OR having more total tower HP when the 2:30 timer ends.

### Controls (Mobile-First)
- **Tap a card** in your hand, then **tap on your half** of the field to deploy
- **Drag a card** directly to your placement area
- Cards cost **Elixir** (shown on each card)

### Game Mechanics

#### Elixir System
- Starts at **5/10**, regenerates over time
- After **1:15** remaining, elixir regeneration **doubles!**

#### Momentum Meter ⚡
- Fills when you damage enemy towers
- When full, choose ONE power-up (lasts 5 seconds):
  - **⚔️ Fury**: +50% attack speed for all your units
  - **🛡️ Fortify**: 50% damage reduction for all your units

#### Towers
- **2 Lane Towers** (one per lane) - destroy these first!
- **1 Core Tower** (center) - destroying this wins the game!

### Cards

#### Units (6)
| Card | Cost | Description |
|------|------|-------------|
| 🏃 Runner | 2 | Fast melee unit with low HP |
| 🛡️ Guardian | 4 | Tank that draws tower fire (Taunt) |
| 🎯 Slingbot | 3 | Ranged single-target attacker |
| ⚡ Spark Mage | 5 | Chain lightning hits up to 3 enemies |
| 💥 Bomber Bug | 3 | Short-range AoE splash damage |
| 💚 Healer Drone | 4 | Heals nearby allies periodically |

#### Tactics (2)
| Card | Cost | Description |
|------|------|-------------|
| 🔵 Barrier Pad | 2 | Zone that grants temporary shield |
| 🟡 Decoy Beacon | 2 | Distracts enemies briefly |

### AI Difficulty
- **Easy**: Slower reactions, waits for more elixir
- **Normal**: Balanced gameplay
- **Hard**: Fast reactions, smarter placements

---

## 🚀 How to Run Locally

### Option 1: Direct File Open (Simplest)
1. Download or clone this repository
2. Open `index.html` directly in your web browser
3. Play!

### Option 2: Local Server (Recommended for development)

Using Python:
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

Using Node.js:
```bash
npx serve .
# or
npx http-server .
```

Using VS Code:
- Install "Live Server" extension
- Right-click `index.html` → "Open with Live Server"

Then open `http://localhost:8000` in your browser.

---

## 🌐 Deploy to GitHub Pages

### Step-by-Step Instructions

1. **Push this repository to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/lane-storm.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**
   - Go to your repository on GitHub
   - Click **Settings** (tab at the top)
   - Scroll down to **Pages** (in the left sidebar)
   - Under **Source**, select:
     - **Deploy from a branch**
     - Branch: **main**
     - Folder: **/ (root)**
   - Click **Save**

3. **Wait for deployment** (1-2 minutes)
   - GitHub will build and deploy your site
   - You'll see a green checkmark when ready

4. **Access your game**
   - Your game will be available at: `https://YOUR_USERNAME.github.io/lane-storm/`

---

## 🔧 Troubleshooting

### "I only see the README text, not the game!"
- Make sure `index.html` is in the **root** of your repository (not in a subfolder)
- Check that GitHub Pages is set to deploy from the **root** folder, not `/docs`

### "The game doesn't load / shows a blank screen"
- Check browser console for errors (F12 → Console)
- Make sure you have internet connection (Phaser 3 loads from CDN)
- Try a different browser (Chrome, Firefox, Edge recommended)

### "Cards don't respond to clicks"
- Make sure you're tapping/clicking on the cards at the bottom
- Wait for the game to fully load (you should see the timer counting down)

### "Game is laggy on mobile"
- The game uses simple shapes and minimal effects for performance
- Close other apps/tabs to free up memory
- Try reducing the number of units on screen

---

## 📁 Project Structure

```
lane-storm/
├── index.html      # Main HTML file (entry point)
├── style.css       # UI styling
├── README.md       # This file
└── src/
    ├── main.js     # Phaser config & game initialization
    ├── game.js     # Main game scene & logic
    ├── ui.js       # UI scene & HUD
    ├── cards.js    # Card definitions & deck management
    └── ai.js       # AI opponent logic
```

---

## 🎯 Tips & Strategy

1. **Don't overspend** - Keep some elixir in reserve for defense
2. **Use Guardian wisely** - Its taunt draws tower fire, protecting other units
3. **Save Momentum** - Wait for the right moment to use your power-up
4. **Lane control** - Focus on one lane to overwhelm defenses
5. **Counter cards** - Use Bomber Bug against grouped enemies, Slingbot for sniping

---

## 📜 License

This is an original game. No copyrighted assets or names used.
Feel free to use, modify, and learn from this code!

---

Made with ❤️ using Phaser 3
