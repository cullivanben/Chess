import React from 'react';
import sources from '../chess-classes/pieces/sources';
import '../stylesheets/css/DeadSquare.css';


const DeadSquare = props => {
    // get the svg source
    let src = (props.src === "null" ? sources.blackKnight : props.src);
    let name = (props.src === "null" ? "dead-transparent" : "dead-opaque");
    return (<button
                className="dead-square">
                <img 
                    className={name}
                    src={src}
                    alt="Chess Piece"
                />
            </button>);
}

export default DeadSquare;