import React from 'react';
import Board from './Board';
import '../stylesheets/GameScreen.scss';


/**
 *Wrapper component for the chess board.
 *
 * @export
 * @returns A GameScreen React Component.
 */
export default function GameScreen() {
    return (<div className="game-wrapper">
        <Board />
    </div>);
}
