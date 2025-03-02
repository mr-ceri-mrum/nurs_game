// Main entry point for the game
document.addEventListener('DOMContentLoaded', () => {
    // Create and initialize the game
    window.gameLogic = new GameLogic();
    window.gameLogic.init();
    
    // Add debug controls (for development)
    addDebugControls();
});

// Add debug controls for testing
function addDebugControls() {
    if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
        const debugPanel = document.createElement('div');
        debugPanel.style.position = 'fixed';
        debugPanel.style.top = '10px';
        debugPanel.style.right = '10px';
        debugPanel.style.background = '#333';
        debugPanel.style.padding = '10px';
        debugPanel.style.borderRadius = '5px';
        debugPanel.style.color = 'white';
        debugPanel.style.zIndex = '1000';
        
        const title = document.createElement('h3');
        title.textContent = 'Debug Controls';
        debugPanel.appendChild(title);
        
        // Add elixir button
        const addElixirBtn = document.createElement('button');
        addElixirBtn.textContent = '+5 Elixir';
        addElixirBtn.style.margin = '5px';
        addElixirBtn.addEventListener('click', () => {
            if (window.gameLogic) {
                window.gameLogic.elixir = Math.min(window.gameLogic.maxElixir, window.gameLogic.elixir + 5);
            }
        });
        debugPanel.appendChild(addElixirBtn);
        
        // Spawn unit buttons for player
        const unitTypes = ['knight', 'archer', 'giant', 'minions'];
        unitTypes.forEach(type => {
            const spawnBtn = document.createElement('button');
            spawnBtn.textContent = `Spawn ${type}`;
            spawnBtn.style.margin = '5px';
            spawnBtn.addEventListener('click', () => {
                if (window.gameLogic && window.gameLogic.gameState === 'playing') {
                    // Random position on player's side
                    const x = 50 + Math.random() * (GAME_DATA.arena.width - 100);
                    const y = GAME_DATA.arena.riverY + 50 + Math.random() * 100;
                    
                    window.gameLogic.deployCard(type, x, y);
                }
            });
            debugPanel.appendChild(spawnBtn);
        });
        
        // Add toggle for AI
        const toggleAiBtn = document.createElement('button');
        toggleAiBtn.textContent = 'Toggle AI';
        toggleAiBtn.style.margin = '5px';
        let aiEnabled = true;
        toggleAiBtn.addEventListener('click', () => {
            if (window.gameLogic) {
                aiEnabled = !aiEnabled;
                toggleAiBtn.textContent = aiEnabled ? 'Disable AI' : 'Enable AI';
                
                // Override the updateAI method
                if (!aiEnabled) {
                    window.gameLogic._originalUpdateAI = window.gameLogic.updateAI;
                    window.gameLogic.updateAI = () => {}; // Do nothing
                } else {
                    window.gameLogic.updateAI = window.gameLogic._originalUpdateAI;
                }
            }
        });
        debugPanel.appendChild(toggleAiBtn);
        
        // Get FPS display
        const fpsDisplay = document.createElement('div');
        fpsDisplay.textContent = 'FPS: --';
        debugPanel.appendChild(fpsDisplay);
        
        // FPS counter
        let frameCount = 0;
        let lastTime = performance.now();
        let fps = 0;
        
        function updateFPS() {
            frameCount++;
            const now = performance.now();
            const delta = now - lastTime;
            
            if (delta >= 1000) {
                fps = Math.round((frameCount * 1000) / delta);
                frameCount = 0;
                lastTime = now;
                fpsDisplay.textContent = `FPS: ${fps}`;
            }
            
            requestAnimationFrame(updateFPS);
        }
        
        updateFPS();
        
        document.body.appendChild(debugPanel);
    }
}