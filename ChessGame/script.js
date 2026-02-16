// --- 1. Classes de Pièces (INCHANGÉES) ---
class Piece {
    constructor(color, type) {
        this.color = color;
        this.type = type;
        this.hasMoved = false;
    }
    isPathClear(board, r1, c1, r2, c2) {
        const dr = Math.sign(r2 - r1);
        const dc = Math.sign(c2 - c1);
        let r = r1 + dr, c = c1 + dc;
        while (r !== r2 || c !== c2) {
            if (board[r][c]) return false;
            r += dr; c += dc;
        }
        return true;
    }
    isValidMove(r1, c1, r2, c2, board) { return false; }
}

class Pawn extends Piece {
    constructor(color) { super(color, 'p'); }
    isValidMove(r1, c1, r2, c2, board) {
        const dir = this.color === 'w' ? -1 : 1;
        const start = this.color === 'w' ? 6 : 1;
        const target = board[r2][c2];
        if (c1 === c2 && r2 === r1 + dir && !target) return true;
        if (c1 === c2 && r2 === r1 + 2*dir && r1 === start && !target && !board[r1+dir][c1]) return true;
        if (Math.abs(c1 - c2) === 1 && r2 === r1 + dir && target && target.color !== this.color) return true;
        return false;
    }
}
class Rook extends Piece {
    constructor(color) { super(color, 'r'); }
    isValidMove(r1, c1, r2, c2, board) {
        if (r1 !== r2 && c1 !== c2) return false;
        return this.isPathClear(board, r1, c1, r2, c2);
    }
}
class Bishop extends Piece {
    constructor(color) { super(color, 'b'); }
    isValidMove(r1, c1, r2, c2, board) {
        if (Math.abs(r1 - r2) !== Math.abs(c1 - c2)) return false;
        return this.isPathClear(board, r1, c1, r2, c2);
    }
}
class Knight extends Piece {
    constructor(color) { super(color, 'n'); }
    isValidMove(r1, c1, r2, c2, board) {
        const dr = Math.abs(r1 - r2), dc = Math.abs(c1 - c2);
        return (dr === 2 && dc === 1) || (dr === 1 && dc === 2);
    }
}
class Queen extends Piece {
    constructor(color) { super(color, 'q'); }
    isValidMove(r1, c1, r2, c2, board) {
        if (r1 !== r2 && c1 !== c2 && Math.abs(r1 - r2) !== Math.abs(c1 - c2)) return false;
        return this.isPathClear(board, r1, c1, r2, c2);
    }
}
class King extends Piece {
    constructor(color) { super(color, 'k'); }
    isValidMove(r1, c1, r2, c2, board) {
        return Math.abs(r1 - r2) <= 1 && Math.abs(c1 - c2) <= 1;
    }
}

// --- 2. Moteur du Jeu ---

const SYMBOLS = {
    w: { k: '♔', q: '♕', r: '♖', b: '♗', n: '♘', p: '♙' },
    b: { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' }
};

class ChessGame {
    constructor() {
        this.boardElement = document.getElementById('chessboard');
        this.statusElement = document.getElementById('status');
        this.historyElement = document.getElementById('move-history');
        this.capturedW = document.getElementById('captured-w');
        this.capturedB = document.getElementById('captured-b');
        this.promotionModal = document.getElementById('promotion-modal');
        
        this.turn = 'w'; 
        this.board = []; 
        this.possibleMoves = []; 
        this.selectedSquare = null;
        this.gameOver = false;
        
        // Stockage temporaire pour la promotion
        this.pendingPromotion = null; // {r, c, color}

        this.initGame();
    }

    initGame() {
        this.createBoard();
        this.turn = 'w';
        this.gameOver = false;
        this.updateStatus("Tour : Blancs");
        this.historyElement.innerHTML = '';
        this.capturedW.innerHTML = '';
        this.capturedB.innerHTML = '';
        this.promotionModal.classList.add('hidden');
        this.renderBoard();
    }

    createBoard() {
        this.board = Array(8).fill(null).map(() => Array(8).fill(null));
        const setup = (row, color) => {
            const types = [Rook, Knight, Bishop, Queen, King, Bishop, Knight, Rook];
            types.forEach((T, i) => this.board[row][i] = new T(color));
        };
        setup(0, 'b');
        setup(7, 'w');
        for (let i = 0; i < 8; i++) {
            this.board[1][i] = new Pawn('b');
            this.board[6][i] = new Pawn('w');
        }
    }

    isSquareAttacked(r, c, opponentColor) {
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const piece = this.board[i][j];
                if (piece && piece.color === opponentColor) {
                    if (piece.isValidMove(i, j, r, c, this.board)) return true;
                }
            }
        }
        return false;
    }

    isKingInCheck(color) {
        let kingRow, kingCol;
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const p = this.board[i][j];
                if (p && p.type === 'k' && p.color === color) {
                    kingRow = i; kingCol = j;
                    break;
                }
            }
        }
        const opponent = color === 'w' ? 'b' : 'w';
        return this.isSquareAttacked(kingRow, kingCol, opponent);
    }

    calculatePossibleMoves(r, c) {
        const piece = this.board[r][c];
        const validMoves = [];
        if (!piece) return validMoves;

        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if (i === r && j === c) continue;
                const target = this.board[i][j];
                if (target && target.color === piece.color) continue;

                if (piece.isValidMove(r, c, i, j, this.board)) {
                    const originalTarget = this.board[i][j];
                    this.board[i][j] = piece;
                    this.board[r][c] = null;
                    if (!this.isKingInCheck(piece.color)) {
                        validMoves.push({ r: i, c: j });
                    }
                    this.board[r][c] = piece;
                    this.board[i][j] = originalTarget;
                }
            }
        }
        return validMoves;
    }

    renderBoard() {
        this.boardElement.innerHTML = '';
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const square = document.createElement('div');
                square.className = `square ${(r + c) % 2 === 0 ? 'white-square' : 'black-square'}`;
                square.dataset.row = r; square.dataset.col = c;

                square.addEventListener('dragover', (e) => { e.preventDefault(); square.classList.add('drag-over'); });
                square.addEventListener('dragleave', () => square.classList.remove('drag-over'));
                square.addEventListener('drop', (e) => this.handleDrop(e, r, c));

                if (this.possibleMoves.some(m => m.r === r && m.c === c)) square.classList.add('hint');
                if (this.selectedSquare && this.selectedSquare.r === r && this.selectedSquare.c === c) square.classList.add('selected');

                const piece = this.board[r][c];
                if (piece) {
                    const span = document.createElement('span');
                    span.className = `piece ${piece.color === 'w' ? 'white' : 'black'}`;
                    span.innerText = SYMBOLS[piece.color][piece.type];
                    span.draggable = true;
                    
                    span.addEventListener('dragstart', (e) => this.handleDragStart(e, r, c));
                    span.addEventListener('click', (e) => { e.stopPropagation(); this.handleSquareClick(r, c); });
                    square.appendChild(span);
                }
                square.addEventListener('click', () => this.handleSquareClick(r, c));
                this.boardElement.appendChild(square);
            }
        }
    }

    handleSquareClick(row, col) {
        if (this.gameOver) return;
        const clickedPiece = this.board[row][col];

        if (this.possibleMoves.some(m => m.r === row && m.c === col)) {
            this.executeMove(this.selectedSquare.r, this.selectedSquare.c, row, col);
            return;
        }
        if (clickedPiece && clickedPiece.color === this.turn) {
            this.selectedSquare = { r: row, c: col };
            this.possibleMoves = this.calculatePossibleMoves(row, col);
            this.renderBoard();
        } else {
            this.selectedSquare = null;
            this.possibleMoves = [];
            this.renderBoard();
        }
    }

    handleDragStart(e, r, c) {
        if (this.gameOver) { e.preventDefault(); return; }
        const piece = this.board[r][c];
        if (piece.color !== this.turn) { e.preventDefault(); return; }
        
        this.draggedPiece = piece;
        this.dragSource = { r, c };
        this.possibleMoves = this.calculatePossibleMoves(r, c);
        this.selectedSquare = { r, c };
        setTimeout(() => e.target.classList.add('dragging'), 0);
    }

    handleDrop(e, r, c) {
        e.preventDefault();
        if (this.possibleMoves.some(m => m.r === r && m.c === c)) {
            this.executeMove(this.dragSource.r, this.dragSource.c, r, c);
        } else {
            this.renderBoard();
        }
    }

    // --- EXECUTION ET PROMOTION ---

    executeMove(r1, c1, r2, c2) {
        const piece = this.board[r1][c1];
        const target = this.board[r2][c2];

        // Mouvement physique
        this.board[r2][c2] = piece;
        this.board[r1][c1] = null;
        piece.hasMoved = true;

        // Gestion Visuelle Capture
        if (target) {
            const span = document.createElement('span');
            span.innerText = SYMBOLS[target.color][target.type];
            span.style.marginRight = "5px";
            if (target.color === 'w') this.capturedW.appendChild(span);
            else this.capturedB.appendChild(span);
        }

        // --- DETECTION PROMOTION ---
        // Si c'est un pion ET qu'il est sur la dernière ligne (0 ou 7)
        if (piece.type === 'p' && (r2 === 0 || r2 === 7)) {
            this.pendingPromotion = { r: r2, c: c2, color: piece.color };
            this.promotionModal.classList.remove('hidden'); // Afficher la modale
            this.renderBoard();
            return; // ON STOPPE TOUT ICI ! On attend que l'utilisateur clique sur le bouton.
        }

        // Si pas de promotion, on termine le tour normalement
        this.finalizeTurn(piece, r1, c1, r2, c2, target);
    }

    // Fonction appelée quand le joueur clique sur un bouton de la fenêtre de promotion
    promotePawn(type) {
        if (!this.pendingPromotion) return;

        const { r, c, color } = this.pendingPromotion;
        let newPiece;

        switch(type) {
            case 'q': newPiece = new Queen(color); break;
            case 'r': newPiece = new Rook(color); break;
            case 'b': newPiece = new Bishop(color); break;
            case 'n': newPiece = new Knight(color); break;
        }

        this.board[r][c] = newPiece; // Remplacer le pion
        this.promotionModal.classList.add('hidden'); // Cacher la modale
        this.pendingPromotion = null;

        // On termine le tour manuellement maintenant que la promotion est faite
        // Note: r1, c1 sont perdus ici mais ce n'est pas grave pour l'historique simple
        // On va juste loguer la promotion
        this.finalizeTurn(newPiece, -1, -1, r, c, null, true);
    }

    finalizeTurn(piece, r1, c1, r2, c2, captured, isPromotion = false) {
        // Historique
        const cols = ['a','b','c','d','e','f','g','h'];
        const rows = ['8','7','6','5','4','3','2','1'];
        
        let moveText;
        if (isPromotion) {
            moveText = `Promotion en ${SYMBOLS[piece.color][piece.type]} (${cols[c2]}${rows[r2]})`;
        } else {
            moveText = `${SYMBOLS[piece.color][piece.type]} ${cols[c1]}${rows[r1]} → ${cols[c2]}${rows[r2]}`;
            if (captured) moveText += ` (Capture ${SYMBOLS[captured.color][captured.type]})`;
        }
        
        const li = document.createElement('li');
        li.innerText = moveText;
        this.historyElement.prepend(li);

        // Changement de tour
        this.turn = this.turn === 'w' ? 'b' : 'w';
        this.selectedSquare = null;
        this.possibleMoves = [];

        this.checkGameStatus();
        this.renderBoard();
    }

    checkGameStatus() {
        const inCheck = this.isKingInCheck(this.turn);
        let hasValidMoves = false;
        
        // Optimisation : on ne cherche que si le joueur peut bouger
        outerLoop:
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const p = this.board[r][c];
                if (p && p.color === this.turn) {
                    if (this.calculatePossibleMoves(r, c).length > 0) {
                        hasValidMoves = true;
                        break outerLoop;
                    }
                }
            }
        }

        if (!hasValidMoves) {
            this.gameOver = true;
            if (inCheck) {
                this.updateStatus(`ÉCHEC ET MAT ! Les ${this.turn === 'w' ? 'Noirs' : 'Blancs'} gagnent !`, true);
            } else {
                this.updateStatus("PAT ! Match nul.", true);
            }
        } else {
            if (inCheck) {
                this.updateStatus(`ÉCHEC au Roi ${this.turn === 'w' ? 'Blanc' : 'Noir'} !`);
            } else {
                this.updateStatus(`Tour : ${this.turn === 'w' ? 'Blancs' : 'Noirs'}`);
            }
        }
    }

    updateStatus(msg, isAlert = false) {
        this.statusElement.innerText = msg;
        if (isAlert) {
            this.statusElement.style.color = "red";
            this.statusElement.style.fontWeight = "bold";
            alert(msg);
        } else {
            this.statusElement.style.color = "white";
        }
    }

    resetGame() {
        this.initGame();
    }
}

const game = new ChessGame();