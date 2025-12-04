// UI Controller - ui.js

let game;
let selectedSquare = null;
let promotionCallback = null;

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    game = new ChessGame();
    initializeUI();
    renderBoard();
    updateGameStatus();
});

function initializeUI() {
    // New Game button
    document.getElementById('new-game-btn').addEventListener('click', () => {
        if (confirm('Start a new game? Current progress will be lost.')) {
            game.reset();
            selectedSquare = null;
            renderBoard();
            updateGameStatus();
            updateCapturedPieces();
            updateMoveHistory();
        }
    });

    // Undo button
    document.getElementById('undo-btn').addEventListener('click', undoMove);

    // Hint button
    document.getElementById('hint-btn').addEventListener('click', showHints);

    // Promotion modal
    document.querySelectorAll('.promotion-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const pieceType = e.currentTarget.dataset.piece;
            if (promotionCallback) {
                promotionCallback(pieceType);
            }
            closePromotionModal();
        });
    });
}

function renderBoard() {
    const boardElement = document.getElementById('chess-board');
    boardElement.innerHTML = '';

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.className = 'square';
            square.classList.add((row + col) % 2 === 0 ? 'light' : 'dark');
            square.dataset.row = row;
            square.dataset.col = col;

            // Add piece if present
            const piece = game.board[row][col];
            if (piece) {
                const pieceElement = document.createElement('span');
                pieceElement.className = 'piece';
                pieceElement.textContent = piece;
                square.appendChild(pieceElement);
            }

            // Highlight selected square
            if (selectedSquare && selectedSquare.row === row && selectedSquare.col === col) {
                square.classList.add('selected');
            }

            // Highlight valid moves
            if (game.validMoves.some(move => move.row === row && move.col === col)) {
                square.classList.add('valid-move');
                if (piece) {
                    square.classList.add('has-piece');
                }
            }

            // Highlight last move
            if (game.moveHistory.length > 0) {
                const lastMove = game.moveHistory[game.moveHistory.length - 1];
                if ((lastMove.fromRow === row && lastMove.fromCol === col) ||
                    (lastMove.toRow === row && lastMove.toCol === col)) {
                    square.classList.add('last-move');
                }
            }

            // Highlight king in check
            if (piece && game.getPieceType(piece) === 'king') {
                const color = game.getPieceColor(piece);
                if (game.checkState[color]) {
                    square.classList.add('in-check');
                }
            }

            // Add click handler
            square.addEventListener('click', () => handleSquareClick(row, col));

            boardElement.appendChild(square);
        }
    }
}

function handleSquareClick(row, col) {
    if (game.gameOver) {
        return;
    }

    const piece = game.board[row][col];
    const pieceColor = game.getPieceColor(piece);

    // If no square selected, select this square if it has a piece of current turn
    if (!selectedSquare) {
        if (piece && pieceColor === game.currentTurn) {
            selectedSquare = { row, col };
            game.validMoves = game.getValidMoves(row, col);
            renderBoard();
        }
        return;
    }

    // If clicking the same square, deselect
    if (selectedSquare.row === row && selectedSquare.col === col) {
        selectedSquare = null;
        game.validMoves = [];
        renderBoard();
        return;
    }

    // If clicking another piece of same color, select that instead
    if (piece && pieceColor === game.currentTurn) {
        selectedSquare = { row, col };
        game.validMoves = game.getValidMoves(row, col);
        renderBoard();
        return;
    }

    // Try to make a move
    const isValidMove = game.validMoves.some(move => move.row === row && move.col === col);
    if (isValidMove) {
        const result = game.makeMove(selectedSquare.row, selectedSquare.col, row, col);

        if (result.promotion) {
            // Show promotion modal
            showPromotionModal(result.row, result.col);
        } else {
            selectedSquare = null;
            game.validMoves = [];
            renderBoard();
            updateGameStatus();
            updateCapturedPieces();
            updateMoveHistory();
        }
    } else {
        // Invalid move, deselect
        selectedSquare = null;
        game.validMoves = [];
        renderBoard();
    }
}

function showPromotionModal(row, col) {
    const modal = document.getElementById('promotion-modal');
    modal.classList.add('active');

    // Update promotion buttons to show correct color
    const color = game.currentTurn === 'white' ? 'black' : 'white'; // Piece color before turn switch
    const pieces = {
        queen: color === 'white' ? '♕' : '♛',
        rook: color === 'white' ? '♖' : '♜',
        bishop: color === 'white' ? '♗' : '♝',
        knight: color === 'white' ? '♘' : '♞'
    };

    document.querySelectorAll('.promotion-btn').forEach(btn => {
        const pieceType = btn.dataset.piece;
        btn.textContent = pieces[pieceType];
    });

    promotionCallback = (pieceType) => {
        game.promotePawn(row, col, pieceType);
        selectedSquare = null;
        game.validMoves = [];
        renderBoard();
        updateGameStatus();
        updateCapturedPieces();
        updateMoveHistory();
    };
}

function closePromotionModal() {
    const modal = document.getElementById('promotion-modal');
    modal.classList.remove('active');
    promotionCallback = null;
}

function updateGameStatus() {
    const turnDisplay = document.getElementById('turn-display');
    const turnIcon = document.querySelector('.turn-icon');
    const gameMessage = document.getElementById('game-message');

    if (game.gameOver) {
        if (game.gameOverReason === 'checkmate') {
            const winner = game.currentTurn === 'white' ? 'Black' : 'White';
            turnDisplay.textContent = `${winner} Wins!`;
            turnIcon.textContent = winner === 'White' ? '♔' : '♚';
            gameMessage.textContent = `Checkmate! ${winner} wins the game!`;
            gameMessage.style.background = 'rgba(34, 197, 94, 0.2)';
            gameMessage.style.borderColor = 'rgba(34, 197, 94, 0.4)';
            gameMessage.style.color = '#22c55e';
        } else {
            turnDisplay.textContent = 'Draw';
            turnIcon.textContent = '🤝';
            gameMessage.textContent = 'Stalemate! The game is a draw.';
            gameMessage.style.background = 'rgba(251, 191, 36, 0.2)';
            gameMessage.style.borderColor = 'rgba(251, 191, 36, 0.4)';
            gameMessage.style.color = '#fbbf24';
        }
    } else {
        const currentPlayer = game.currentTurn.charAt(0).toUpperCase() + game.currentTurn.slice(1);
        turnDisplay.textContent = `${currentPlayer}'s Turn`;
        turnIcon.textContent = game.currentTurn === 'white' ? '♔' : '♚';

        if (game.checkState[game.currentTurn]) {
            gameMessage.textContent = `${currentPlayer} is in check!`;
            gameMessage.style.background = 'rgba(239, 68, 68, 0.2)';
            gameMessage.style.borderColor = 'rgba(239, 68, 68, 0.4)';
            gameMessage.style.color = '#ef4444';
        } else {
            gameMessage.textContent = '';
            gameMessage.style.background = 'rgba(99, 102, 241, 0.1)';
            gameMessage.style.borderColor = 'rgba(99, 102, 241, 0.2)';
            gameMessage.style.color = 'var(--accent-primary)';
        }
    }
}

function updateCapturedPieces() {
    const whiteCaptured = document.getElementById('white-captured');
    const blackCaptured = document.getElementById('black-captured');

    whiteCaptured.innerHTML = game.capturedPieces.white
        .map(piece => `<span class="captured-piece">${piece}</span>`)
        .join('');

    blackCaptured.innerHTML = game.capturedPieces.black
        .map(piece => `<span class="captured-piece">${piece}</span>`)
        .join('');
}

function updateMoveHistory() {
    const historyElement = document.getElementById('move-history');
    historyElement.innerHTML = game.moveHistory
        .map((move, index) => {
            const moveNumber = Math.floor(index / 2) + 1;
            const isWhiteMove = index % 2 === 0;
            const prefix = isWhiteMove ? `${moveNumber}.` : '';
            return `<div class="move-entry">${prefix} ${move.notation}</div>`;
        })
        .join('');

    // Scroll to bottom
    historyElement.scrollTop = historyElement.scrollHeight;
}

function undoMove() {
    if (game.moveHistory.length === 0) {
        alert('No moves to undo!');
        return;
    }

    // For simplicity, we'll just reset and replay all moves except the last one
    const moves = [...game.moveHistory];
    moves.pop();

    game.reset();

    for (const move of moves) {
        const result = game.makeMove(move.fromRow, move.fromCol, move.toRow, move.toCol);
        if (result.promotion) {
            // Determine what piece was promoted to
            const promotedPiece = game.board[move.toRow][move.toCol];
            const pieceType = game.getPieceType(promotedPiece);
            game.promotePawn(move.toRow, move.toCol, pieceType);
        }
    }

    selectedSquare = null;
    game.validMoves = [];
    renderBoard();
    updateGameStatus();
    updateCapturedPieces();
    updateMoveHistory();
}

function showHints() {
    if (game.gameOver) {
        alert('Game is over!');
        return;
    }

    // Find all pieces of current player and their valid moves
    let allMoves = [];
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = game.board[row][col];
            if (piece && game.getPieceColor(piece) === game.currentTurn) {
                const moves = game.getValidMoves(row, col);
                if (moves.length > 0) {
                    allMoves.push({ piece, row, col, moves });
                }
            }
        }
    }

    if (allMoves.length === 0) {
        alert('No legal moves available!');
        return;
    }

    // Pick a random piece with valid moves
    const randomPiece = allMoves[Math.floor(Math.random() * allMoves.length)];
    selectedSquare = { row: randomPiece.row, col: randomPiece.col };
    game.validMoves = randomPiece.moves;
    renderBoard();

    const files = 'abcdefgh';
    const from = files[randomPiece.col] + (8 - randomPiece.row);
    const pieceType = game.getPieceType(randomPiece.piece);

    const gameMessage = document.getElementById('game-message');
    gameMessage.textContent = `Hint: Try moving the ${pieceType} at ${from}`;
    gameMessage.style.background = 'rgba(139, 92, 246, 0.2)';
    gameMessage.style.borderColor = 'rgba(139, 92, 246, 0.4)';
    gameMessage.style.color = '#8b5cf6';
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        selectedSquare = null;
        game.validMoves = [];
        renderBoard();
    } else if (e.key === 'n' && e.ctrlKey) {
        e.preventDefault();
        document.getElementById('new-game-btn').click();
    } else if (e.key === 'z' && e.ctrlKey) {
        e.preventDefault();
        undoMove();
    } else if (e.key === 'h' && e.ctrlKey) {
        e.preventDefault();
        showHints();
    }
});
