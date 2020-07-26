import Pawn from '../pieces/Pawn';
import Knight from '../pieces/Knight';
import King from '../pieces/King';

// whether a given spot on the board is being attacked by the enemy
export function dangerous(location, board, friendly) {
    // check every piece on the board and see if it can attack the specified location
    for (let i = 0; i < board.length; i++) {
        if (board[i].piece !== null && friendly !== board[i].piece.friendly &&
            board[i].piece.canMove(board[i], location, board)) return true;
    }
    return false;
}

// returns whether the king would be in check if this move took place
export function cantMove(start, destination, board, kingPosition) {
    // loop over every spot on the board.
    // at any given spot, if there is a piece and it is on the opposite team as the piece that is moving
    // if it is not in the distination spot (i.e. is not about to be killed) and will be able to attack the king 
    // once this move is made, then this move cannot be made, return true
    // it is important to note that if a given piece is a pawn, knight, or king a move by the other team
    // will not enable them to attack the king because kings and pawns must be directly adjacent to a piece in order
    // to attack it, thus if they are able to attack the king they must have alread been able to attack it before this move.
    // In the case of the knight it is not possible to block it by placing a piece between it and the king because knights
    // can jump over other pieces, thus if a knight is not able to attack the king it is not possible for this player to 
    // make a move that will suddenly enable an enemy knight to put their king in check
    for (let i = 0; i < board.length; i++) {
        if (board[i].piece !== null && (start.piece.friendly !== board[i].piece.friendly) && board[i].position !== destination.position
            && !(board[i].piece instanceof Pawn) && !(board[i].piece instanceof Knight) && !(board[i].piece instanceof King)
            && board[i].piece.willAttackKing(board[i], kingPosition, board, start, destination))
            return true;
    }
    return false;
}

// determines if making this move will remove the king from check
export function willRemoveCheck(start, destination, board, kingPosition, attackerPositions) {
    // if there is only one attacker and this piece is about to kill the attacker, 
    // this move will remove the king from check
    if (attackerPositions.size === 1 && attackerPositions.has(destination.position)) return true;
    // if there is more than one attacker and this piece is about to kill one of them,
    // this move will not remove the king from check
    if (attackerPositions.size > 1 && attackerPositions.has(destination.position)) return false;
    // now that we know that none of the attackers are being killed,
    // if the piece is an instanceof knight or pawn then this move will not remove the king from check
    // because it is not killing them 
    // this is because it is not possible to stop a knight or pawn from
    // attacking the king without moving the king or killing them - in this situation we know that 
    // neither of these conditions are true so we must return false
    // if the piece is an instanceof Rook, Bishop, or Queen we check to see if it will be able to attack
    // we will ignore the start location because there will not be a piece there after this move, 
    // we know that the destination will be occupied, so it is blocking any king attack attempts
    // thus, we will ignore the start location and hypothetically fill the destination position
    // if the piece will be able to attack the king after this move, then this move does not remove 
    // the king from check, return false
    it = attackerPositions.values();
    num = it.next();
    while (!it.done()) {
        if (board[num.value].piece !== null && (board[num.value].piece instanceof Pawn ||
            board[num.value].piece instanceof Knight || board[num.value].piece.willAttackKing(board[num.value],
                kingPosition, board, start, destination))) return false;
        num = it.next();
    }
    // if execution made it this far, then the attackers can no longer attack the king
    return true;
}

// returns whether the rook will be able to attack the king after ignoreOne moves to ignoreTwo
export function rookWillAttack(position, kingPosition, board, ignore, blocked) {
    // convert the positions to rows and columns
    let thisRow = Math.floor(position.position / 8);
    let thisColumn = position.position % 8;
    let kingRow = Math.floor(kingPosition / 8);
    let kingColumn = kingPosition % 8;
    let ignoreRow = Math.floor(ignore.position / 8);
    let ignoreColumn = ignore.position % 8;
    let blockedRow = Math.floor(blocked.position / 8);
    let blockedColumn = blocked.position % 8;
    // if the king is not in either the same row or column, the rook cannot attack
    if (thisRow !== kingRow && thisColumn !== kingColumn) return false;
    // if there is a piece between this rook and the king, then it cannot attack
    if (thisRow === kingRow) {
        if (thisColumn < kingColumn) {
            for (let i = thisColumn + 1; i < kingColumn; i++) {
                if ((thisRow !== ignoreRow || i !== ignoreColumn) &&
                    board[thisRow * 8 + i].piece !== null) return false;
                if (thisRow === blockedRow && i === blockedColumn) return false;
            }
        }
        else if (thisColumn > kingColumn) {
            for (let i = thisColumn - 1; i > kingColumn; i--) {
                if ((thisRow !== ignoreRow || i !== ignoreColumn) &&
                    board[thisRow * 8 + i].piece !== null) return false;
                if (thisRow === blockedRow && i === blockedColumn) return false;
            }
        }
        else return false;
    }
    else {
        if (thisRow < kingRow) {
            for (let i = thisRow + 1; i < kingRow; i++) {
                if ((i !== ignoreRow || thisColumn !== ignoreColumn) &&
                    board[i * 8 + thisColumn].piece !== null) return false;
                if (i === blockedRow && thisColumn === blockedColumn) return false;
            }
        }
        else if (thisColumn > kingColumn) {
            for (let i = thisRow - 1; i > kingRow; i--) {
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
export function bishopWillAttack(position, kingPosition, board, ignore, blocked) {
    // convert the positions to rows and columns
    let thisRow = Math.floor(position.position / 8);
    let thisColumn = position.position % 8;
    let kingRow = Math.floor(kingPosition / 8);
    let kingColumn = kingPosition % 8;
    let ignoreRow = Math.floor(ignore.position / 8);
    let ignoreColumn = ignore.position % 8;
    let blockedRow = Math.floor(blocked.position / 8);
    let blockedColumn = blocked.position % 8;
    // if the king is not on a diagonal from this bishop, this bishop cannot attack
    if (Math.abs(kingRow - thisRow) !== Math.abs(kingColumn - thisColumn)) return false;
    // if there is a piece bwtween this bishop and the king, this bishop cannot attack
    if (thisColumn < kingColumn) {
        if (thisRow < kingRow) {
            for (let i = thisRow + 1, j = thisColumn + 1; i < kingRow; i++) {
                if ((i !== ignoreRow || j !== ignoreColumn) &&
                    board[i * 8 + j].piece !== null) return false;
                if (i === blockedRow && j++ === blockedColumn) return false;
            }
        }
        else if (thisRow > kingRow) {
            for (let i = thisRow - 1, j = thisColumn + 1; i > kingRow; i--) {
                if ((i !== ignoreRow || j !== ignoreColumn) &&
                    board[i * 8 + j].piece !== null) return false;
                if (i === blockedRow && j++ === blockedColumn) return false;
            }
        }
        else return false;
    }
    else {
        if (thisRow < kingRow) {
            for (let i = thisRow + 1, j = thisColumn - 1; i < kingRow; i++) {
                if ((i !== ignoreRow || j !== ignoreColumn) &&
                    board[i * 8 + j].piece !== null) return false;
                if (i === blockedRow && j-- === blockedColumn) return false;

            }
        }
        else if (thisRow > kingRow) {
            for (let i = thisRow - 1, j = thisColumn - 1; i > kingRow; i--) {
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

