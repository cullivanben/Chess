import React from 'react';
import color from './color';
import '../stylesheets/Square.scss';

const Square = (props) => {
    // set the style of this component based on the props
    let style = {};
    if (props.shade === "light") {
        if (props.selected) style.background = color.lightSquareHighlight;
        else style.background = color.lightSquareColor;
        if (props.highlighted) style.border = ("2px solid " + color.blue);
        else style.border = ("2px solid " + (props.selected ? color.lightSquareHighlight : color.lightSquareColor));
    } else {
        if (props.selected) style.background = color.darkSquareHighlight;
        else style.background = color.darkSquareColor;
        if (props.highlighted) style.border = ("2px solid " + color.blue);
        else style.border = ("2px solid " + (props.selected ? color.darkSquareHighlight : color.darkSquareColor));
    }

    // render the square 
    if (props.src === "null") {
        return (<button 
                    className={"square-"+props.shade} 
                    onMouseDown={props.handleMouseDown} 
                    style={style}
                />);
    } else {
        return (<button 
                    className={"square-"+props.shade} 
                    onMouseDown={props.handleMouseDown}
                    style={style}>
                        <img 
                            src={props.src}
                            alt="chess piece"
                        />
                </button>);
    }
}

export default Square;
