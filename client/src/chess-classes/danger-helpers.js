// whether a given spot on the board is being attacked by the enemy
export function dangerous(location, board) {
    // check every piece on the board and see if it can attack the specified location
    for (let i = 0; i < board.length; i++) {
        if (board[i].piece !== null && !board[i].piece.friendly && 
            board[i].piece.canMove(board[i], location, board)) return true;
    }
    // for (let i = 0; i < board.length; i++) {
    //     for (let j = 0; j < board[0].length; j++) {
    //         // if there is no piece here or the piece here is friendly, we can skip this location
    //         if (board[i][j].piece === null || board[i][j].piece.friendly) continue;
    //         // if an enemy piece can move to the specified location, the location is dangerous
    //         if (board[i][j].piece.canMove(board[i][j], location, board)) return true;
    //     }
    // }
    return false;
}