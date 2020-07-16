import React from 'react';
import Board from './Board';

// ChessSide
// this component will contain everything on the chess side of the screen
class ChessSide extends React.Component {
    render() {
        return (<div>
                    <Board />
                </div>);
    }
}

export default ChessSide;