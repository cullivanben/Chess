import React from 'react';
import ChessSide from './ChessSide';
import '../stylesheets/GameScreen.scss';

// this class will contain most of the components on the screen
export default class GameScreen extends React.Component {
    render() {
        return (<div className="game-wrapper">
                    <ChessSide />
                </div>);
    }
}
