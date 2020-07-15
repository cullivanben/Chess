// this file contains helper export functions for the movement methods of the chess pieces

// returns whether a pawn can be moved from the start to the destination
export function canMovePawn(start, destination, board) {
    // if this piece is on the home row and there are no pieces in the two spots directly infront of it, 
    // moving two spots ahead is legal
    if (start.row === 6 && destination.row === 4 && start.column === destination.column && 
        destination.piece === null && board[5][start.column].piece === null) return true;
    // if the destination is occupied, the move must be diagonal and forward and the piece must not be friendly
    if (destination.piece !== null) {
        // if the piece is friendly this pawn cannot move there
        if (destination.piece.friendly) return false;
        // this piece can move to one of the two spots diagonally in front of it
        return (start.row - 1 === destination.row && (destination.column === start.column + 1 
            || destination.column === start.column - 1));
    } 
    // if the destination is not occupied, diagonal moves are not legal
    else {  
        // this piece can only move to the spot directly in front of it
        return start.row - 1 === destination.row && start.column === destination.column;
    }
}

// returns whether a rook can be moved from the start to the destination
export function canMoveRook(start, destination, board) {
    if (start.row !== destination.row && start.column !== destination.column) return false;
    // if the destination contains a friendly piece, the rook cannot move there
    if (destination.piece !== null && destination.piece.friendly) return false;
    // if there is a piece between the rook and the destination, the rook cannot move there
    if (start.row === destination.row) {
        if (start.column < destination.column) {
            for (let i = start.column+1; i < destination.column; i++) {
                if (board[start.row][i].piece !== null) return false;
            }
        } 
        else if (start.column > destination.column) {
            for (let i = start.column-1; i > destination.column; i--) {
                if (board[start.row][i].piece !== null) return false;
            }
        } 
        else return false;
    } 
    else {
        if (start.row < destination.row) {
            for (let i = start.row+1; i < destination.row; i++) {
                if (board[i][start.column].piece !== null) return false;
            }
        } 
        else if (start.row > destination.row) {
            for (let i = start.row-1; i > destination.row; i--) {
                if (board[i][start.column].piece !== null) return false;
            }
        } 
        else return false;
    }
    // if none of the above conditions were met, the rook can move to the destination 
    return true;
}

// returns whether a knight can be moved from the start to the destination
export function canMoveKnight(start, destination, board) {
    // if the destination contains a friendly piece, the knight cannot be moved there
    if (destination.piece !== null && destination.piece.friendly) return false;
    // check if the destination is one of the eight valid moves
    if ((destination.row === start.row-2 && destination.column === start.column+1) ||
        (destination.row === start.row-1 && destination.column === start.column+2) ||
        (destination.row === start.row+1 && destination.column === start.column+2) ||
        (destination.row === start.row+2 && destination.column === start.column+1) ||
        (destination.row === start.row+2 && destination.column === start.column-1) ||
        (destination.row === start.row+1 && destination.column === start.column-2) ||
        (destination.row === start.row-1 && destination.column === start.column-2) ||
        (destination.row === start.row-2 && destination.column === start.column-1))
        return true;
    // the knight cannot be moved
    return false;
}

// returns whether a bishop can be moved from the start to the destination
export function canMoveBishop(start, destination, board) {
    // if the destination contains a friendly piece the bishop cannot move there
    if (destination.piece !== null && destination.piece.friendly) return false;
    // if the destination is not on a diagonal from the start the bishop cannot move there
    if (Math.abs(destination.row - start.row) !== Math.abs(destination.column - start.column)) return false;
    // make sure that there are no pieces between the destination and start
    if (start.column < destination.column) {
        if (start.row < destination.row) {
            for (let i = start.row+1, j = start.column+1; i < destination.row; i++) {
                if (board[i][j++].piece !== null) return false;
            }
        }
        else if (start.row > destination.row) {
            for (let i = start.row-1, j = start.column+1; i > destination.row; i--) {
                if (board[i][j++].piece !== null) return false;
            }
        }
        else return false;
    }  
    else {
        if (start.row < destination.row) {
            for (let i = start.row+1, j = start.column-1; i < destination.row; i++) {
                if (board[i][j--].piece !== null) return false;
            }
        }
        else if (start.row > destination.row) {
            for (let i = start.row-1, j = start.column-1; i > destination.row; i--) {
                if (board[i][j--].piece != null) return false;
            }
        }
        else return false;
    }
    // if none of the above conditions were met, the bishop can be moved to the destination
    return true;
}

// returns whether a king can be moved from the start to the destination
export function canMoveKing(start, destination, board) {
    // if the destination is occupied by a friendly piece, the king cannot move there
    if (destination.piece !== null && destination.piece.friendly) return false;
    // if the destination is not adjacent to the king, it cannot move there
    if (destination.row < start.row-1 || destination.row > start.row+1 || destination.column < start.column-1 
        || destination.column > start.column+1) return false;
    // if the king will be attacked at the destination, it cannot move there
    // if there are no threatening pieces at the destination, it king can move there
    return !board.dangerous(destination);
}