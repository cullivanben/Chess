import React from 'react';
import Board from './Board';

// this component will contain everything on the chess side of the screen
export default class ChessSide extends React.Component {
    render() {
        return (<div>
                    <Board />
                </div>);
    }
}
