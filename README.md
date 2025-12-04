# Chess 2.0 - Premium Chess Game

A fully functional chess game with beautiful modern UI and complete chess rule implementation.

## 🎮 Features




### Complete Chess Rules
- ✅ All piece movements (King, Queen, Rook, Bishop, Knight, Pawn)
- ✅ Special moves:
  - Castling (kingside and queenside)
  - En passant capture
  - Pawn promotion with piece selection
- ✅ Check and checkmate detection
- ✅ Stalemate detection
- ✅ Move validation (prevents illegal moves)
- ✅ Turn-based gameplay

### Premium UI
- 🎨 Modern dark theme with vibrant gradients
- ✨ Glassmorphism effects
- 🌟 Smooth animations and transitions
- 💫 Interactive move highlighting
- 📱 Responsive design
- ⚡ Visual feedback for:
  - Selected pieces
  - Valid moves
  - Last move
  - King in check

### Interactive Features
- 🔄 New game
- ↶ Undo move
- 💡 Hint system (suggests random valid move)
- 📜 Move history with notation
- 🎯 Captured pieces display
- ⌨️ Keyboard shortcuts:
  - `Ctrl+N`: New game
  - `Ctrl+Z`: Undo move
  - `Ctrl+H`: Show hint
  - `Esc`: Deselect piece

## 📁 Project Structure

```
chess2.0/
├── index.html      # Main HTML structure
├── style.css       # Premium styling and animations
├── chess.js        # Chess game logic and rules
├── ui.js           # UI controller and interactions
└── README.md       # This file
```

## 🚀 How to Run

1. Open `index.html` in a modern web browser
2. Start playing! Click on a piece to select it, then click on a highlighted square to move

## 🎯 How to Play

1. **Select a piece**: Click on any piece of your color (white starts first)
2. **View valid moves**: Valid moves are highlighted with blue dots
3. **Make a move**: Click on a highlighted square to move
4. **Special moves**:
   - **Castling**: Move the king two squares toward a rook
   - **En passant**: Capture an opponent's pawn that just moved two squares
   - **Promotion**: When a pawn reaches the opposite end, choose a piece to promote to

## 🏗️ Architecture

### chess.js - Game Logic
- `ChessGame` class manages the entire game state
- Board representation using 8x8 array
- Piece movement validation for all piece types
- Check/checkmate/stalemate detection
- Special move handling (castling, en passant, promotion)
- Move history tracking

### ui.js - User Interface
- Board rendering with piece positions
- Click event handling for piece selection and movement
- Visual highlighting for valid moves and game states
- Pawn promotion modal
- Game status updates
- Captured pieces display
- Move history display

### style.css - Design System
- CSS custom properties for consistent theming
- Responsive grid layout
- Smooth animations and transitions
- Glassmorphism effects
- Hover states and visual feedback

## 🎨 Design Features

- **Color Palette**: Dark theme with indigo/purple gradients
- **Typography**: Inter font family for modern look
- **Animations**: 
  - Piece hover effects
  - Selected piece pulse
  - Valid move indicators
  - Check warning blink
  - Modal slide-in
- **Visual Hierarchy**: Clear separation of game board, controls, and information panels

## 🔧 Technical Details

- **No dependencies**: Pure vanilla JavaScript, HTML, and CSS
- **Modern ES6+**: Uses classes, arrow functions, destructuring
- **Event-driven**: Responsive to user interactions
- **Modular design**: Separation of game logic and UI

## 🎓 Code Highlights

### Move Validation
The game validates all moves to ensure they follow chess rules and don't leave the king in check.

### Check Detection
Efficiently detects when a king is under attack by scanning all opponent pieces.

### Special Moves
Properly implements complex chess rules like castling (with all conditions), en passant, and pawn promotion.

## 📝 Future Enhancements (Optional)

- AI opponent with different difficulty levels
- Online multiplayer support
- Move timer/clock
- Game save/load functionality
- Chess notation export (PGN format)
- Move analysis and suggestions
- Opening book integration

---

**Enjoy playing Chess 2.0!** ♟️
