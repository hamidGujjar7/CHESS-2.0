// Chess Game Logic - chess.js

class ChessGame {
    constructor() {
        this.board = this.initializeBoard();
        this.currentTurn = 'white';
        this.selectedSquare = null;
        this.validMoves = [];
        this.moveHistory = [];
        this.capturedPieces = { white: [], black: [] };
        this.kingPositions = { white: { row: 7, col: 4 }, black: { row: 0, col: 4 } };
        this.castlingRights = {
            white: { kingSide: true, queenSide: true },
            black: { kingSide: true, queenSide: true }
        };
        this.enPassantTarget = null;
        this.gameOver = false;
        this.checkState = { white: false, black: false };
    }

    initializeBoard() {
        const board = Array(8).fill(null).map(() => Array(8).fill(null));
        
        // Black pieces (row 0 and 1)
        board[0] = ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'];
        board[1] = Array(8).fill('♟');
        
        // White pieces (row 6 and 7)
        board[6] = Array(8).fill('♙');
        board[7] = ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖'];
        
        return board;
    }

    getPieceColor(piece) {
        if (!piece) return null;
        // White pieces: ♔♕♖♗♘♙
        // Black pieces: ♚♛♜♝♞♟
        const whitePieces = ['♔', '♕', '♖', '♗', '♘', '♙'];
        return whitePieces.includes(piece) ? 'white' : 'black';
    }

    getPieceType(piece) {
        const pieceTypes = {
            '♔': 'king', '♚': 'king',
            '♕': 'queen', '♛': 'queen',
            '♖': 'rook', '♜': 'rook',
            '♗': 'bishop', '♝': 'bishop',
            '♘': 'knight', '♞': 'knight',
            '♙': 'pawn', '♟': 'pawn'
        };
        return pieceTypes[piece] || null;
    }

    isValidSquare(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }

    getValidMoves(row, col) {
        const piece = this.board[row][col];
        if (!piece || this.getPieceColor(piece) !== this.currentTurn) {
            return [];
        }

        const pieceType = this.getPieceType(piece);
        let moves = [];

        switch (pieceType) {
            case 'pawn':
                moves = this.getPawnMoves(row, col);
                break;
            case 'knight':
                moves = this.getKnightMoves(row, col);
                break;
            case 'bishop':
                moves = this.getBishopMoves(row, col);
                break;
            case 'rook':
                moves = this.getRookMoves(row, col);
                break;
            case 'queen':
                moves = this.getQueenMoves(row, col);
                break;
            case 'king':
                moves = this.getKingMoves(row, col);
                break;
        }

        // Filter out moves that would leave king in check
        return moves.filter(move => !this.wouldBeInCheck(row, col, move.row, move.col));
    }

    getPawnMoves(row, col) {
        const moves = [];
        const piece = this.board[row][col];
        const color = this.getPieceColor(piece);
        const direction = color === 'white' ? -1 : 1;
        const startRow = color === 'white' ? 6 : 1;

        // Forward move
        if (this.isValidSquare(row + direction, col) && !this.board[row + direction][col]) {
            moves.push({ row: row + direction, col });
            
            // Double move from start
            if (row === startRow && !this.board[row + 2 * direction][col]) {
                moves.push({ row: row + 2 * direction, col });
            }
        }

        // Captures
        for (const dcol of [-1, 1]) {
            const newRow = row + direction;
            const newCol = col + dcol;
            if (this.isValidSquare(newRow, newCol)) {
                const target = this.board[newRow][newCol];
                if (target && this.getPieceColor(target) !== color) {
                    moves.push({ row: newRow, col: newCol });
                }
                
                // En passant
                if (this.enPassantTarget && 
                    this.enPassantTarget.row === newRow && 
                    this.enPassantTarget.col === newCol) {
                    moves.push({ row: newRow, col: newCol, enPassant: true });
                }
            }
        }

        return moves;
    }

    getKnightMoves(row, col) {
        const moves = [];
        const piece = this.board[row][col];
        const color = this.getPieceColor(piece);
        const offsets = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
        ];

        for (const [drow, dcol] of offsets) {
            const newRow = row + drow;
            const newCol = col + dcol;
            if (this.isValidSquare(newRow, newCol)) {
                const target = this.board[newRow][newCol];
                if (!target || this.getPieceColor(target) !== color) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        }

        return moves;
    }

    getBishopMoves(row, col) {
        return this.getLineMoves(row, col, [[-1, -1], [-1, 1], [1, -1], [1, 1]]);
    }

    getRookMoves(row, col) {
        return this.getLineMoves(row, col, [[-1, 0], [1, 0], [0, -1], [0, 1]]);
    }

    getQueenMoves(row, col) {
        return this.getLineMoves(row, col, [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1], [0, 1],
            [1, -1], [1, 0], [1, 1]
        ]);
    }

    getLineMoves(row, col, directions) {
        const moves = [];
        const piece = this.board[row][col];
        const color = this.getPieceColor(piece);

        for (const [drow, dcol] of directions) {
            let newRow = row + drow;
            let newCol = col + dcol;

            while (this.isValidSquare(newRow, newCol)) {
                const target = this.board[newRow][newCol];
                if (!target) {
                    moves.push({ row: newRow, col: newCol });
                } else {
                    if (this.getPieceColor(target) !== color) {
                        moves.push({ row: newRow, col: newCol });
                    }
                    break;
                }
                newRow += drow;
                newCol += dcol;
            }
        }

        return moves;
    }

    getKingMoves(row, col) {
        const moves = [];
        const piece = this.board[row][col];
        const color = this.getPieceColor(piece);

        // Normal king moves
        for (let drow = -1; drow <= 1; drow++) {
            for (let dcol = -1; dcol <= 1; dcol++) {
                if (drow === 0 && dcol === 0) continue;
                const newRow = row + drow;
                const newCol = col + dcol;
                if (this.isValidSquare(newRow, newCol)) {
                    const target = this.board[newRow][newCol];
                    if (!target || this.getPieceColor(target) !== color) {
                        moves.push({ row: newRow, col: newCol });
                    }
                }
            }
        }

        // Castling
        if (!this.checkState[color]) {
            const castlingRow = color === 'white' ? 7 : 0;
            
            // King-side castling
            if (this.castlingRights[color].kingSide &&
                !this.board[castlingRow][5] &&
                !this.board[castlingRow][6] &&
                !this.isSquareUnderAttack(castlingRow, 5, color) &&
                !this.isSquareUnderAttack(castlingRow, 6, color)) {
                moves.push({ row: castlingRow, col: 6, castling: 'king' });
            }
            
            // Queen-side castling
            if (this.castlingRights[color].queenSide &&
                !this.board[castlingRow][1] &&
                !this.board[castlingRow][2] &&
                !this.board[castlingRow][3] &&
                !this.isSquareUnderAttack(castlingRow, 2, color) &&
                !this.isSquareUnderAttack(castlingRow, 3, color)) {
                moves.push({ row: castlingRow, col: 2, castling: 'queen' });
            }
        }

        return moves;
    }

    wouldBeInCheck(fromRow, fromCol, toRow, toCol) {
        // Simulate move
        const piece = this.board[fromRow][fromCol];
        const captured = this.board[toRow][toCol];
        const color = this.getPieceColor(piece);
        
        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;
        
        // Update king position if moving king
        let oldKingPos = null;
        if (this.getPieceType(piece) === 'king') {
            oldKingPos = { ...this.kingPositions[color] };
            this.kingPositions[color] = { row: toRow, col: toCol };
        }
        
        const inCheck = this.isKingInCheck(color);
        
        // Undo move
        this.board[fromRow][fromCol] = piece;
        this.board[toRow][toCol] = captured;
        if (oldKingPos) {
            this.kingPositions[color] = oldKingPos;
        }
        
        return inCheck;
    }

    isKingInCheck(color) {
        const kingPos = this.kingPositions[color];
        return this.isSquareUnderAttack(kingPos.row, kingPos.col, color);
    }

    isSquareUnderAttack(row, col, color) {
        const opponentColor = color === 'white' ? 'black' : 'white';
        
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = this.board[r][c];
                if (piece && this.getPieceColor(piece) === opponentColor) {
                    const moves = this.getPieceMoves(r, c, true);
                    if (moves.some(move => move.row === row && move.col === col)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    getPieceMoves(row, col, ignoreCheck = false) {
        const piece = this.board[row][col];
        const pieceType = this.getPieceType(piece);
        let moves = [];

        switch (pieceType) {
            case 'pawn':
                moves = this.getPawnMoves(row, col);
                break;
            case 'knight':
                moves = this.getKnightMoves(row, col);
                break;
            case 'bishop':
                moves = this.getBishopMoves(row, col);
                break;
            case 'rook':
                moves = this.getRookMoves(row, col);
                break;
            case 'queen':
                moves = this.getQueenMoves(row, col);
                break;
            case 'king':
                // For attack detection, only basic king moves
                if (ignoreCheck) {
                    const color = this.getPieceColor(piece);
                    moves = [];
                    for (let drow = -1; drow <= 1; drow++) {
                        for (let dcol = -1; dcol <= 1; dcol++) {
                            if (drow === 0 && dcol === 0) continue;
                            const newRow = row + drow;
                            const newCol = col + dcol;
                            if (this.isValidSquare(newRow, newCol)) {
                                const target = this.board[newRow][newCol];
                                if (!target || this.getPieceColor(target) !== color) {
                                    moves.push({ row: newRow, col: newCol });
                                }
                            }
                        }
                    }
                } else {
                    moves = this.getKingMoves(row, col);
                }
                break;
        }

        return moves;
    }

    makeMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        const captured = this.board[toRow][toCol];
        const color = this.getPieceColor(piece);
        const pieceType = this.getPieceType(piece);

        // Handle en passant capture
        let enPassantCapture = null;
        if (pieceType === 'pawn' && this.enPassantTarget &&
            toRow === this.enPassantTarget.row && toCol === this.enPassantTarget.col) {
            const captureRow = color === 'white' ? toRow + 1 : toRow - 1;
            enPassantCapture = this.board[captureRow][toCol];
            this.board[captureRow][toCol] = null;
        }

        // Move piece
        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;

        // Handle castling
        const move = this.validMoves.find(m => m.row === toRow && m.col === toCol);
        if (move && move.castling) {
            const rookRow = toRow;
            if (move.castling === 'king') {
                this.board[rookRow][5] = this.board[rookRow][7];
                this.board[rookRow][7] = null;
            } else {
                this.board[rookRow][3] = this.board[rookRow][0];
                this.board[rookRow][0] = null;
            }
        }

        // Update king position
        if (pieceType === 'king') {
            this.kingPositions[color] = { row: toRow, col: toCol };
            this.castlingRights[color].kingSide = false;
            this.castlingRights[color].queenSide = false;
        }

        // Update castling rights if rook moves
        if (pieceType === 'rook') {
            if (color === 'white') {
                if (fromCol === 0) this.castlingRights.white.queenSide = false;
                if (fromCol === 7) this.castlingRights.white.kingSide = false;
            } else {
                if (fromCol === 0) this.castlingRights.black.queenSide = false;
                if (fromCol === 7) this.castlingRights.black.kingSide = false;
            }
        }

        // Set en passant target
        this.enPassantTarget = null;
        if (pieceType === 'pawn' && Math.abs(toRow - fromRow) === 2) {
            this.enPassantTarget = {
                row: (fromRow + toRow) / 2,
                col: toCol
            };
        }

        // Handle captures
        if (captured) {
            const capturedColor = this.getPieceColor(captured);
            const capturingColor = capturedColor === 'white' ? 'black' : 'white';
            this.capturedPieces[capturingColor].push(captured);
        }
        if (enPassantCapture) {
            const capturedColor = this.getPieceColor(enPassantCapture);
            const capturingColor = capturedColor === 'white' ? 'black' : 'white';
            this.capturedPieces[capturingColor].push(enPassantCapture);
        }

        // Record move
        const moveNotation = this.getMoveNotation(piece, fromRow, fromCol, toRow, toCol, captured || enPassantCapture);
        this.moveHistory.push({
            piece, fromRow, fromCol, toRow, toCol,
            captured: captured || enPassantCapture,
            notation: moveNotation
        });

        // Check for pawn promotion
        if (pieceType === 'pawn' && (toRow === 0 || toRow === 7)) {
            return { promotion: true, row: toRow, col: toCol };
        }

        // Switch turn
        this.currentTurn = this.currentTurn === 'white' ? 'black' : 'white';
        
        // Update check state
        this.checkState.white = this.isKingInCheck('white');
        this.checkState.black = this.isKingInCheck('black');

        // Check for checkmate/stalemate
        this.checkGameOver();

        return { promotion: false };
    }

    promotePawn(row, col, pieceType) {
        const color = this.currentTurn === 'white' ? 'black' : 'white'; // Promotion happens before turn switch
        const pieces = {
            queen: color === 'white' ? '♕' : '♛',
            rook: color === 'white' ? '♖' : '♜',
            bishop: color === 'white' ? '♗' : '♝',
            knight: color === 'white' ? '♘' : '♞'
        };
        this.board[row][col] = pieces[pieceType];
        
        // Now switch turn
        this.currentTurn = this.currentTurn === 'white' ? 'black' : 'white';
        
        // Update check state
        this.checkState.white = this.isKingInCheck('white');
        this.checkState.black = this.isKingInCheck('black');
        
        this.checkGameOver();
    }

    getMoveNotation(piece, fromRow, fromCol, toRow, toCol, captured) {
        const files = 'abcdefgh';
        const pieceSymbol = this.getPieceType(piece) === 'pawn' ? '' : piece;
        const captureSymbol = captured ? 'x' : '';
        const from = files[fromCol] + (8 - fromRow);
        const to = files[toCol] + (8 - toRow);
        return `${pieceSymbol}${from}${captureSymbol}${to}`;
    }

    checkGameOver() {
        // Check if current player has any legal moves
        let hasLegalMoves = false;
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = this.board[r][c];
                if (piece && this.getPieceColor(piece) === this.currentTurn) {
                    const moves = this.getValidMoves(r, c);
                    if (moves.length > 0) {
                        hasLegalMoves = true;
                        break;
                    }
                }
            }
            if (hasLegalMoves) break;
        }

        if (!hasLegalMoves) {
            this.gameOver = true;
            if (this.checkState[this.currentTurn]) {
                this.gameOverReason = 'checkmate';
            } else {
                this.gameOverReason = 'stalemate';
            }
        }
    }

    reset() {
        this.board = this.initializeBoard();
        this.currentTurn = 'white';
        this.selectedSquare = null;
        this.validMoves = [];
        this.moveHistory = [];
        this.capturedPieces = { white: [], black: [] };
        this.kingPositions = { white: { row: 7, col: 4 }, black: { row: 0, col: 4 } };
        this.castlingRights = {
            white: { kingSide: true, queenSide: true },
            black: { kingSide: true, queenSide: true }
        };
        this.enPassantTarget = null;
        this.gameOver = false;
        this.checkState = { white: false, black: false };
    }
}
