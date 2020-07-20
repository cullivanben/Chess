import React from 'react';
import color from './helpers/color';
import sources from '../chess-classes/pieces/sources';
import '../stylesheets/Square.scss';

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

    let src = (props.src === 'null' ? sources.blackKnight : props.src);
    let name = (props.src === 'null' ? 'transparent' : 'opaque');

    return (<button
        className="square"
        onMouseDown={props.handleMouseDown}
        style={style}>
            <img 
                className={name}
                src={src}
                alt="Chess Piece"
            />
    </button>);
}
