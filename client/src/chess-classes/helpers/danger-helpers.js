import Pawn from '../pieces/Pawn';
import Knight from '../pieces/Knight';
import King from '../pieces/King';

// whether a given spot on the board is being attacked by the enemy
export function dangerous(location, board) {
    // check every piece on the board and see if it can attack the specified location
    for (let i = 0; i < board.length; i++) {
        if (board[i].piece !== null && !board[i].piece.friendly && 
            board[i].piece.canMove(board[i], location, board)) return true;
    }
    return false;
}

// returns whether the king would be in check if this move took place
export function cantMove(start, destination, board, kingPosition) {
    for (let i = 0; i < board.length; i++) {
        if (board[i].piece !== null && !board[i].piece.friendly && board[i].position !== destination.position
            && !(board[i].piece instanceof Pawn) && !(board[i].piece instanceof Knight) && !(board[i].piece instanceof King)
            && board[i].piece.willAttackKing(board[i], kingPosition, board, start, destination)) 
            return true;
    }
    return false;
}

// returns whether the rook will be able to attack the king after ignoreOne moves to ignoreTwo
export function rookWillAttack(position, kingPosition, board, ignoreOne, ignoreTwo) {
    // convert the positions to rows and columns
    let thisRow = Math.floor(position.position / 8);
    let thisColumn = position.position % 8;
    let kingRow = Math.floor(kingPosition.position / 8);
    let kingColumn = kingPosition.position % 8;
    let ignoreRow = Math.floor(ignoreOne.position / 8);
    let ignoreColumn = ignoreOne.position % 8;
    let blockedRow = Math.floor(ignoreTwo.position / 8);
    let blockedColumn = ignoreTwo.position % 8;
    // if the king is not in either the same row or column, the rook cannot attack
    if (thisRow !== kingRow && thisColumn !== kingColumn) return false;
    // if there is a piece between this rook and the king, then it cannot attack
    if (thisRow === kingRow) {
        if (thisColumn < kingColumn) {
            for (let i = thisColumn+1; i < kingColumn; i++) {
                if ((thisRow !== ignoreRow || i !== ignoreColumn) &&
                    board[thisRow * 8 + i].piece !== null) return false;
                if (thisRow === blockedRow && i === blockedColumn) return false;
            }
        } 
        else if (thisColumn > kingColumn) {
            for (let i = thisColumn-1; i > kingColumn; i--) {
                if ((thisRow !== ignoreRow || i !== ignoreColumn) &&
                    board[thisRow * 8 + i].piece !== null) return false;
                if (thisRow === blockedRow && i === blockedColumn) return false;
            }
        }
        else return false;
    } 
    else {
        if (thisRow < kingRow) {
            for (let i = thisRow+1; i < kingRow; i++) {
                if ((i !== ignoreRow || thisColumn !== ignoreColumn) && 
                    board[i * 8 + thisColumn].piece !== null) return false;
                if (i === blockedRow && thisColumn === blockedColumn) return false;
            }
        } 
        else if (thisColumn > kingColumn) {
            for (let i = thisRow-1; i > kingRow; i--) {
                if ((i !== ignoreRow || thisColumn !== ignoreColumn) && 
                    board[i * 8 + thisColumn].piece !== null) return false;
                if (i === blockedRow && thisColumn === blockedColumn) return false;
            }
        }
        else return false;
    }
    // if none of the above conditions were met 
    // this rook will be able to attack the king
    return true;
}

// returns whether the bishop will be able to attack the king after ignoreOne moves to ignoreTwo
export function bishopWillAttack(position, kingPosition, board, ignoreOne, ignoreTwo) {
    // convert the positions to rows and columns
    let thisRow = Math.floor(position.position / 8);
    let thisColumn = position.position % 8;
    let kingRow = Math.floor(kingPosition.position / 8);
    let kingColumn = kingPosition.position % 8;
    let ignoreRow = Math.floor(ignoreOne.position / 8);
    let ignoreColumn = ignoreOne.position % 8;
    let blockedRow = Math.floor(ignoreTwo.position / 8);
    let blockedColumn = ignoreTwo.position % 8;
    // if the king is not on a diagonal from this bishop, this bishop cannot attack
    if (Math.abs(kingRow - thisRow) !== Math.abs(kingColumn - thisColumn)) return false;
    // if there is a piece bwtween this bishop and the king, this bishop cannot attack
    if (thisColumn < kingColumn) {
        if (thisRow < kingRow) {
            for (let i = thisRow+1, j = startColumn+1; i < kingRow; i++) {
                if ((i !== ignoreRow || j !== ignoreColumn) &&
                    board[i * 8 + j].piece !== null) return false;
                if (i === blockedRow && j++ === blockedColumn) return false;
            }
        }
        else if (thisRow > kingRow) {
            for (let i = thisRow-1, j = thisColumn+1; i > kingRow; i--) {
                if ((i !== ignoreRow || j !== ignoreColumn) && 
                    board[i * 8 + j].piece !== null) return false;
                if (i === blockedRow && j++ === blockedColumn) return false;
            }
        }
        else return false;
    }
    else {
        if (thisRow < kingRow) {
            for (let i = thisRow+1, j = thisColumn-1; i < kingRow; i++) {
                if ((i !== ignoreRow || j !== ignoreColumn) &&
                    board[i * 8 + j].piece !== null) return false;
                if (i === blockedRow && j-- === blockedColumn) return false;

            }
        }
        else if (thisRow > kingRow) {
            for (let i = thisRow-1, j = thisColumn-1; i > kingRow; i--) {
                if ((i !== ignoreRow || j !== ignoreColumn) && 
                    board[i * 8 + j].piece !== null) return false;
                if (i === blockedRow && j-- === blockedColumn) return false;
            }
        }
        else return false;
    }
    // if none of the above conditions were met
    // this bishop will be able to attack the king
    return true;
}