# Nurs Game - Clash Royale Style

A JavaScript-based card battle game inspired by Clash Royale. This simple implementation features:

- Real-time tower defense gameplay
- Card-based unit deployment
- Elixir resource management
- Battle timer and win conditions
- Simple AI opponent

## Game Features

### Basic Gameplay
- Deploy units by selecting cards and clicking on the battlefield
- Manage your elixir (purple resource) which regenerates over time
- Destroy enemy towers to win
- Defend your own towers from enemy units

### Unit Types
- **Knight**: Melee unit with balanced stats
- **Archer**: Ranged unit that can attack air units
- **Giant**: Tank unit with high health that targets buildings
- **Minions**: Flying units that can attack both ground and air
- **Fireball**: Spell that damages an area

### Win Conditions
- Destroy more towers than your opponent when time runs out
- Destroy all enemy towers before time runs out

## Getting Started

1. Clone this repository
2. Open `index.html` in your web browser
3. Click "Start Battle" to begin playing

For local development, you'll need to add image assets:

- Add card images (100x120px) in the `assets/cards/` folder
- Add unit images (40x40px) in the `assets/units/` folder

## Development

The game is built using vanilla JavaScript with a component-based architecture:

- `gameData.js`: Contains game constants, card stats, and arena configuration
- `units.js`: Defines the classes for game entities (troops, towers, spells)
- `gameLogic.js`: Core game mechanics and AI
- `renderer.js`: Handles DOM updates and animations
- `main.js`: Entry point and initialization

## Future Improvements

- Add more card varieties
- Implement deck building
- Add card leveling system
- Improve AI strategy
- Add sound effects and music
- Add multiplayer support

## License

This project is open source and available for educational purposes.

## Credits

This game was created as a learning project inspired by Supercell's Clash Royale.