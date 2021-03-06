import React from 'react';
import color from './helpers/color';
import sources from '../chess-classes/pieces/sources';
import '../stylesheets/Square.scss';

/**
 *This component represents an individual square on the chess board.
 *
 * @export
 * @param {object} props
 * @returns A Square React Component.
 */
export default function Square(props) {
    // set the style of this component based on the props
    let style = {};
    if (props.shade === 'light') {
        if (props.selected || props.enemySelected) style.background = color.lightSquareSelect;
        else if (props.highlighted) style.background = color.lightSqareHighlight;
        else if (props.enemyHighlighted) style.background = color.lightEnemyHighlight;
        else style.background = color.lightSquareColor;
    }
    else {
        if (props.selected || props.enemySelected) style.background = color.darkSquareSelect;
        else if (props.highlighted) style.background = color.darkSquareHighlight;
        else if (props.enemyHighlighted) style.background = color.darkEnemyHighlight;
        else style.background = color.darkSquareColor;
    }

    // if the king is in check, override the background color
    if (props.inCheck) style.background = color.orange;

    // set the svg source and className
    let src, name;
    if (props.src === 'null') {
        src = sources.whiteKnight;
        name = 'transparent';
    }
    else {
        src = props.src;
        name = 'opaque';
    }

    return (<button
        className="square"
        onMouseDown={props.handleMouseDown}
        style={style}>
        <img
            className={name}
            src={src}
            alt="Chess Piece"
            draggable="false"
        />
    </button>);
}
