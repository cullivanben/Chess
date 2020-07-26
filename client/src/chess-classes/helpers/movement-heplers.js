import { dangerous, cantMove } from './danger-helpers';


// returns whether a pawn can be moved from the start to the destination
export function canMovePawn(start, destination, board, kingPosition, attackingFriendlyKing) {
    if (start.piece === null) return false;
    let shift = start.piece.friendly ? -1 : 1;
    // convert the positions to rows and columns
    let startRow = Math.floor(start.position / 8);
    let startColumn = start.position % 8;
    let destinationRow = Math.floor(destination.position / 8);
    let destinationColumn = destination.position % 8;
    // if this piece is on the home row and there are no pieces in the two spots directly infront of it, 
    // moving two spots ahead is legal
    if (start.piece.friendly && startRow === 6 && destinationRow === 4 && startColumn === destinationColumn
        && destination.piece === null && board[40 + startColumn].piece === null) {
        if (attackingFriendlyKing.size > 0) return;
        return !cantMove(start, destination, board, kingPosition);
    }
    if (!start.piece.friendly && startRow === 1 && destinationRow === 3 && startColumn === destinationColumn
        && destination.piece === null && board[16 + startColumn].piece === null) {
        if (attackingFriendlyKing.size > 0) return;
        return !cantMove(start, destination, board, kingPosition);
    }
    // if the destination is occupied, the move must be diagonal and forward and the piece must not be friendly
    if (destination.piece !== null) {
        // if the piece is on the same team, this pawn cannot move there
        if (teammates(start, destination)) return false;
        // this piece can move to one of the two spots diagonally in front of it
        if (startRow + shift !== destinationRow || (destinationColumn !== startColumn - 1
            && destinationColumn !== startColumn + 1)) return false;
        if (attackingFriendlyKing.size > 0) return;
        return !cantMove(start, destination, board, kingPosition);
    }
    // if the destination is not occupied, diagonal moves are not legal
    else {
        // this piece can only move to the spot directly in front of it
        if (startRow + shift !== destinationRow || startColumn !== destinationColumn) return false;
        if (attackingFriendlyKing.size > 0) return;
        return !cantMove(start, destination, board, kingPosition);
    }
}


// returns whether a rook can be moved from the start to the destination
export function canMoveRook(start, destination, board, kingPosition, attackingFriendlyKing) {
    if (start.piece === null) return false;
    // if the destination contains a piece on the same team, the rook cannot move there
    if (destination.piece !== null && teammates(start, destination)) return false;
    // convert the positions to rows and columns
    let startRow = Math.floor(start.position / 8);
    let startColumn = start.position % 8;
    let destinationRow = Math.floor(destination.position / 8);
    let destinationColumn = destination.position % 8;
    // if the destination is not in either the same row or same column, the rook cannot move there
    if (startRow !== destinationRow && startColumn !== destinationColumn) return false;
    // if there is a piece between the rook and the destination, the rook cannot move there
    if (startRow === destinationRow) {
        if (startColumn < destinationColumn) {
            for (let i = startColumn + 1; i < destinationColumn; i++) {
                if (board[startRow * 8 + i].piece !== null) return false;
            }
        }
        else if (startColumn > destinationColumn) {
            for (let i = startColumn - 1; i > destinationColumn; i--) {
                if (board[startRow * 8 + i].piece !== null) return false;
            }
        }
        else return false;
    }
    else {
        if (startRow < destinationRow) {
            for (let i = startRow + 1; i < destinationRow; i++) {
                if (board[i * 8 + startColumn].piece !== null) return false;
            }
        }
        else if (startRow > destinationRow) {
            for (let i = startRow - 1; i > destinationRow; i--) {
                if (board[i * 8 + startColumn].piece !== null) return false;
            }
        }
        else return false;
    }
    // if the king is in check, the rook can move to the destination 
    // if this move brings the king out of check
    if (attackingFriendlyKing.size > 0) return;
    // if none of the above conditions were met, the rook can move 
    // to the destination if it doesn't place the king in jeopardy
    return !cantMove(start, destination, board, kingPosition);
}


// returns whether a knight can be moved from the start to the destination
export function canMoveKnight(start, destination, board, kingPosition, attackingFriendlyKing) {
    if (start.piece === null) return false;
    // if the destination contains a piece on the same team, the knight cannot be moved there
    if (destination.piece !== null && teammates(start, destination)) return false;
    // convert the positions to rows and columns
    let startRow = Math.floor(start.position / 8);
    let startColumn = start.position % 8;
    let destinationRow = Math.floor(destination.position / 8);
    let destinationColumn = destination.position % 8;
    // if the destination is not one of the eight valid moves, the knight cannot be moved
    if (!((destinationRow === startRow - 2 && destinationColumn === startColumn + 1) ||
        (destinationRow === startRow - 1 && destinationColumn === startColumn + 2) ||
        (destinationRow === startRow + 1 && destinationColumn === startColumn + 2) ||
        (destinationRow === startRow + 2 && destinationColumn === startColumn + 1) ||
        (destinationRow === startRow + 2 && destinationColumn === startColumn - 1) ||
        (destinationRow === startRow + 1 && destinationColumn === startColumn - 2) ||
        (destinationRow === startRow - 1 && destinationColumn === startColumn - 2) ||
        (destinationRow === startRow - 2 && destinationColumn === startColumn - 1)))
        return false;
    // if the king is in check, the rook can move to the destination 
    // if this move brings the king out of check
    if (attackingFriendlyKing.size > 0) return;
    // the knight can be moved if this move doesn't place the king in jeopardy
    return !cantMove(start, destination, board, kingPosition);
}


// returns whether a bishop can be moved from the start to the destination
export function canMoveBishop(start, destination, board, kingPosition, attackingFriendlyKing) {
    if (start.piece === null) return false;
    // if the destination contains a piece on the same team, the bishop cannot be moved there
    if (destination.piece !== null && teammates(start, destination)) return false;
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
            for (let i = startRow + 1, j = startColumn + 1; i < destinationRow; i++) {
                if (board[i * 8 + j++].piece !== null) return false;
            }
        }
        else if (startRow > destinationRow) {
            for (let i = startRow - 1, j = startColumn + 1; i > destinationRow; i--) {
                if (board[i * 8 + j++].piece !== null) return false;
            }
        }
        else return false;
    }
    else {
        if (startRow < destinationRow) {
            for (let i = startRow + 1, j = startColumn - 1; i < destinationRow; i++) {
                if (board[i * 8 + j--].piece !== null) return false;
            }
        }
        else if (startRow > destinationRow) {
            for (let i = startRow - 1, j = startColumn - 1; i > destinationRow; i--) {
                if (board[i * 8 + j--].piece != null) return false;
            }
        }
        else return false;
    }
    // if the king is in check, the rook can move to the destination 
    // if this move brings the king out of check
    if (attackingFriendlyKing.size > 0) return;
    // if none of the above conditions were met 
    // the bishop can be moved to the destination
    // if this move doesn't place the king in jeopardy
    return !cantMove(start, destination, board, kingPosition);
}


// returns whether a king can be moved from the start to the destination
export function canMoveKing(start, destination, board, kingPosition, attackingFriendlyKing) {
    if (start.piece === null) return false;
    // if the destination is occupied by a piece on the same team, the king cannot move there
    if (destination.piece !== null && teammates(start, destination)) return false;
    // convert the positions to rows and columns
    let startRow = Math.floor(start.position / 8);
    let startColumn = start.position % 8;
    let destinationRow = Math.floor(destination.position / 8);
    let destinationColumn = destination.position % 8;
    // if the destination is not adjacent to the king, it cannot move there
    if (destinationRow < startRow - 1 || destinationRow > startRow + 1 || destinationColumn < startColumn - 1
        || destinationColumn > startColumn + 1) return false;
    // if the king will be attacked at the destination, it cannot move there
    // if there are no threatening pieces at the destination, it king can move there
    return !dangerous(destination, board, start.piece.friendly);
}


// determines whether two pieces whould be able to attack each other
function teammates(start, destination) {
    return ((start.piece.friendly && destination.piece.friendly) ||
        (!start.piece.friendly && !destination.piece.friendly));
}