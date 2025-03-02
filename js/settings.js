// Settings management for the game
class GameSettings {
    constructor() {
        this.defaultSettings = {
            sound: true,
            music: true,
            gameSpeed: 1.0,
            difficulty: 'normal', // easy, normal, hard
            username: 'Player'
        };
        
        this.settings = this.loadSettings() || {...this.defaultSettings};
        this.settingsScreen = null;
    }
    
    loadSettings() {
        const savedSettings = localStorage.getItem('nursGame_settings');
        if (savedSettings) {
            try {
                return JSON.parse(savedSettings);
            } catch (e) {
                console.error('Error loading settings:', e);
                return null;
            }
        }
        return null;
    }
    
    saveSettings() {
        localStorage.setItem('nursGame_settings', JSON.stringify(this.settings));
    }
    
    getSetting(key) {
        return this.settings[key];
    }
    
    updateSetting(key, value) {
        if (key in this.settings) {
            this.settings[key] = value;
            this.saveSettings();
            
            // Apply setting changes immediately
            this.applySettings();
            
            return true;
        }
        return false;
    }
    
    resetSettings() {
        this.settings = {...this.defaultSettings};
        this.saveSettings();
        this.applySettings();
    }
    
    applySettings() {
        // Apply game speed
        if (window.gameLogic) {
            window.gameLogic.setGameSpeed(this.settings.gameSpeed);
        }
        
        // Apply difficulty
        if (window.gameLogic) {
            switch (this.settings.difficulty) {
                case 'easy':
                    window.gameLogic.aiActionInterval = 4000;
                    break;
                case 'normal':
                    window.gameLogic.aiActionInterval = 3000;
                    break;
                case 'hard':
                    window.gameLogic.aiActionInterval = 2000;
                    break;
            }
        }
        
        // Apply username
        document.querySelector('.player-name').textContent = this.settings.username;
    }
    
    showSettingsScreen() {
        // Create settings screen if it doesn't exist
        if (!this.settingsScreen) {
            this.createSettingsScreen();
        }
        
        // Update settings form with current values
        this.updateSettingsForm();
        
        // Show the settings screen
        this.settingsScreen.style.display = 'flex';
    }
    
    hideSettingsScreen() {
        if (this.settingsScreen) {
            this.settingsScreen.style.display = 'none';
        }
    }
    
    createSettingsScreen() {
        // Create settings screen element
        this.settingsScreen = document.createElement('div');
        this.settingsScreen.className = 'settings-screen';
        
        // Create settings content
        const content = `
            <div class="settings-container">
                <h2>Game Settings</h2>
                <form id="settings-form">
                    <div class="setting-group">
                        <label for="setting-username">Username</label>
                        <input type="text" id="setting-username" value="${this.settings.username}">
                    </div>
                    
                    <div class="setting-group">
                        <label for="setting-difficulty">Difficulty</label>
                        <select id="setting-difficulty">
                            <option value="easy">Easy</option>
                            <option value="normal">Normal</option>
                            <option value="hard">Hard</option>
                        </select>
                    </div>
                    
                    <div class="setting-group">
                        <label for="setting-gamespeed">Game Speed</label>
                        <input type="range" id="setting-gamespeed" min="0.5" max="2" step="0.1" value="${this.settings.gameSpeed}">
                        <span id="gamespeed-value">${this.settings.gameSpeed}x</span>
                    </div>
                    
                    <div class="setting-group checkbox">
                        <input type="checkbox" id="setting-sound" ${this.settings.sound ? 'checked' : ''}>
                        <label for="setting-sound">Sound Effects</label>
                    </div>
                    
                    <div class="setting-group checkbox">
                        <input type="checkbox" id="setting-music" ${this.settings.music ? 'checked' : ''}>
                        <label for="setting-music">Background Music</label>
                    </div>
                    
                    <div class="settings-buttons">
                        <button type="button" id="settings-save">Save</button>
                        <button type="button" id="settings-cancel">Cancel</button>
                        <button type="button" id="settings-reset">Reset to Default</button>
                    </div>
                </form>
            </div>
        `;
        
        this.settingsScreen.innerHTML = content;
        document.body.appendChild(this.settingsScreen);
        
        // Add event listeners
        document.getElementById('settings-save').addEventListener('click', () => this.saveSettingsForm());
        document.getElementById('settings-cancel').addEventListener('click', () => this.hideSettingsScreen());
        document.getElementById('settings-reset').addEventListener('click', () => this.resetSettings());
        
        // Game speed update display
        document.getElementById('setting-gamespeed').addEventListener('input', (e) => {
            document.getElementById('gamespeed-value').textContent = `${e.target.value}x`;
        });
    }
    
    updateSettingsForm() {
        if (!this.settingsScreen) return;
        
        document.getElementById('setting-username').value = this.settings.username;
        document.getElementById('setting-difficulty').value = this.settings.difficulty;
        document.getElementById('setting-gamespeed').value = this.settings.gameSpeed;
        document.getElementById('gamespeed-value').textContent = `${this.settings.gameSpeed}x`;
        document.getElementById('setting-sound').checked = this.settings.sound;
        document.getElementById('setting-music').checked = this.settings.music;
    }
    
    saveSettingsForm() {
        // Get values from form
        const username = document.getElementById('setting-username').value || 'Player';
        const difficulty = document.getElementById('setting-difficulty').value;
        const gameSpeed = parseFloat(document.getElementById('setting-gamespeed').value);
        const sound = document.getElementById('setting-sound').checked;
        const music = document.getElementById('setting-music').checked;
        
        // Update settings
        this.settings = {
            username,
            difficulty,
            gameSpeed,
            sound,
            music
        };
        
        // Save settings
        this.saveSettings();
        
        // Apply settings
        this.applySettings();
        
        // Hide settings screen
        this.hideSettingsScreen();
    }
}