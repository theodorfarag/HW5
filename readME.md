**Github Link**
https://github.com/theodorfarag/HW5

**Live Website**
https://theodorfarag.github.io/HW5/

## Implemented Features

This project implements a functional, interactive Scrabble-style word game using HTML, CSS (Tailwind CSS), JavaScript, jQuery, and jQuery UI. The application closely follows core Scrabble mechanics while adapting them to a simplified single-row board format.

### Game Board and Tile Interaction
- The game board consists of 15 fixed drop zones, representing a single Scrabble row.
- Tiles are implemented as draggable elements using jQuery UI.
- Each board square functions as a droppable target, allowing tiles to snap into place.
- Tiles can be freely moved between the tile rack and the board.
- Invalid placements automatically revert to their previous position, ensuring a consistent game state.

### Tile Rack and Hand Management
- Each player hand contains up to 7 tiles, drawn randomly from the remaining tile pool.
- Tile distribution and point values follow official Scrabble rules, including blank tiles.
- The tile rack dynamically updates when:
  - A new hand is requested
  - A word is successfully submitted
  - The game is reset
- Used tiles are correctly removed from the hand after a valid word submission.

### Dictionary Validation
- A full English dictionary is loaded asynchronously from a text file using $.get.
- Dictionary words are stored in a JavaScript Set, allowing constant-time lookup.
- Words placed on the board are validated against the dictionary before scoring.
- Invalid words trigger a visible error message and are not scored.

### Word Detection Logic
- The game scans the board to determine the leftmost and rightmost placed tiles.
- The current word is constructed dynamically from contiguous board positions.
- Gaps between placed tiles are handled correctly during word construction.
- The detected word is displayed live as tiles are placed or removed.

### Scoring System
- Letter values are calculated using a predefined lookup table for efficiency.
- The game supports board multipliers, including:
  - Double Letter (DL)
  - Double Word (DW)
- Scores are calculated only when a word is valid.
- The current score, added points, and high score are updated dynamically after each turn.

### Game Controls
- NEXT — Submits the current word, validates it, applies scoring, and generates new tiles.
- NEW HAND — Returns all tiles to the pool and generates a fresh hand.
- RESET GAME — Resets the entire game state, including scores, tiles, and board.

### User Interface and Responsiveness
- The user interface is styled using Tailwind CSS for responsiveness and modern design.
- Google Fonts are used to enhance readability and visual consistency.
- Clear visual feedback is provided for:
  - Active drop zones
  - Invalid word submissions
  - Score updates and tile changes

### Code Structure and Design
- Core game logic is encapsulated within a dedicated Scrabble class.
- UI interaction and event handling are separated from game logic.
- Private class fields are used to protect internal state.
- The codebase is modular, readable, and well-commented for maintainability.



