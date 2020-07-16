import { dangerous } from './danger-helpers';

// this file contains helper export functions for the movement methods of the chess pieces

// returns whether a pawn can be moved from the start to the destination
export function canMovePawn(start, destination, board) {
    // convert the positions to rows and columns
    let startRow = Math.floor(start.position / 8);
    let startColumn = start.position % 8;
    let destinationRow = Math.floor(destination.position / 8);
    let destinationColumn = destination.position % 8;
    // if this piece is on the home row and there are no pieces in the two spots directly infront of it, 
    // moving two spots ahead is legal
    if (startRow === 6 && destinationRow === 4 && startColumn === destinationColumn && 
        destination.piece === null && board[40+startColumn].piece === null) return true;
    // if the destination is occupied, the move must be diagonal and forward and the piece must not be friendly
    if (destination.piece !== null) {
        // if the piece is friendly this pawn cannot move there
        if (destination.piece.friendly) return false;
        // this piece can move to one of the two spots diagonally in front of it
        return (startRow - 1 === destinationRow && (destinationColumn === startColumn + 1 
            || destinationColumn === startColumn - 1));
    } 
    // if the destination is not occupied, diagonal moves are not legal
    else {  
        // this piece can only move to the spot directly in front of it
        return startRow - 1 === destinationRow && startColumn === destinationColumn;
    }
}

// returns whether a rook can be moved from the start to the destination
export function canMoveRook(start, destination, board) {
    // if the destination contains a friendly piece, the rook cannot move there
    if (destination.piece !== null && destination.piece.friendly) return false;
    // convert the positions to rows and columns
    let startRow = Math.floor(start.position / 8);
    let startColumn = start.position % 8;
    let destinationRow = Math.floor(destination.position / 8);
    let destinationColumn = destination.position % 8;
    // if the detination is not in either the same row or same column, the rook cannot move there
    if (startRow !== destinationRow && startColumn !== destinationColumn) return false;
    // if there is a piece between the rook and the destination, the rook cannot move there
    if (startRow === destinationRow) {
        if (startColumn < destinationColumn) {
            for (let i = startColumn+1; i < destinationColumn; i++) {
                if (board[startRow * 8 + i].piece !== null) return false;
            }
        } 
        else if (startColumn > destinationColumn) {
            for (let i = startColumn-1; i > destinationColumn; i--) {
                if (board[startRow * 8 + i].piece !== null) return false;
            }
        } 
        else return false;
    } 
    else {
        if (startRow < destinationRow) {
            for (let i = startRow+1; i < destinationRow; i++) {
                if (board[i * 8 + startColumn].piece !== null) return false;
            }
        } 
        else if (startRow > destinationRow) {
            for (let i = startRow-1; i > destinationRow; i--) {
                if (board[i * 8 + startColumn].piece !== null) return false;
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
    // convert the positions to rows and columns
    let startRow = Math.floor(start.position / 8);
    let startColumn = start.position % 8;
    let destinationRow = Math.floor(destination.position / 8);
    let destinationColumn = destination.position % 8;
    // if the destination is not one of the eight valid moves, the knight cannot be moved
    if (!((destinationRow === startRow-2 && destinationColumn === startColumn+1) ||
        (destinationRow === startRow-1 && destinationColumn === startColumn+2) ||
        (destinationRow === startRow+1 && destinationColumn === startColumn+2) ||
        (destinationRow === startRow+2 && destinationColumn === startColumn+1) ||
        (destinationRow === startRow+2 && destinationColumn === startColumn-1) ||
        (destinationRow === startRow+1 && destinationColumn === startColumn-2) ||
        (destinationRow === startRow-1 && destinationColumn === startColumn-2) ||
        (destinationRow === startRow-2 && destinationColumn === startColumn-1)))
        return false;
    // the knight can be moved
    return true;
}

// returns whether a bishop can be moved from the start to the destination
export function canMoveBishop(start, destination, board) {
    // if the destination contains a friendly piece the bishop cannot move there
    if (destination.piece !== null && destination.piece.friendly) return false;
    // convert the positions to rows and columns
    let startRow = Math.floor(start.position / 8);
    let startColumn = start.position % 8;
    let destinationRow = Math.floor(destination.position / 8);
    let destinationColumn = destination.position % 8;
    // if the destination is not on a diagonal from the start the bishop cannot move there
    if (Math.abs(destinationRow - startRow) !== Math.abs(destinationColumn - startColumn)) return false;
    // make sure that there are no pieces between the destination and start
    if (startColumn < destinationColumn) {
        if (startRow < destinationRow) {
            for (let i = startRow+1, j = startColumn+1; i < destinationRow; i++) {
                if (board[i * 8 + j++].piece !== null) return false;
            }
        }
        else if (startRow > destinationRow) {
            for (let i = startRow-1, j = startColumn+1; i > destinationRow; i--) {
                if (board[i * 8 + j++].piece !== null) return false;
            }
        }
        else return false;
    }  
    else {
        if (startRow < destinationRow) {
            for (let i = startRow+1, j = startColumn-1; i < destinationRow; i++) {
                if (board[i * 8 + j--].piece !== null) return false;
            }
        }
        else if (startRow > destinationRow) {
            for (let i = startRow-1, j = startColumn-1; i > destinationRow; i--) {
                if (board[i * 8 + j--].piece != null) return false;
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
    // convert the positions to rows and columns
    let startRow = Math.floor(start.position / 8);
    let startColumn = start.position % 8;
    let destinationRow = Math.floor(destination.position / 8);
    let destinationColumn = destination.position % 8;
    // if the destination is not adjacent to the king, it cannot move there
    if (destinationRow < startRow-1 || destinationRow > startRow+1 || destinationColumn < startColumn-1 
        || destinationColumn > startColumn+1) return false;
    // if the king will be attacked at the destination, it cannot move there
    // if there are no threatening pieces at the destination, it king can move there
    return !dangerous(destination, board);
}

