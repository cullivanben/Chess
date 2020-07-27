import React from 'react';
import { withRouter } from 'react-router-dom';
import sources from '../chess-classes/pieces/sources';
import '../stylesheets/HomeScreen.scss';

class HomeScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            playing: false
        }
        this.inputRef = React.createRef();
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick() {
        // save the guest name to local storage
        let input = this.inputRef.current.value.trim();
        if (input === '') {
            input = 'Guest ' + (Math.floor(Math.random() * 90000) + 10000);
        }
        localStorage.setItem('guest-name', input);

        // navigate to the game screen
        this.props.history.push('/play');
    }

    render() {
        return (<div className="home-wrapper">
            <div className="br-wrapper">
                <img
                    src={sources.blackRook}
                    alt="Black Rook"
                    className="home-br"
                    draggable="false"
                />
            </div>
            <div className="home-screen">
                <h1 className="logo-header">Live Chess</h1>
                <div className="play-button-wrapper">
                    <button className="play-button">Sign in</button>
                    <h5 className="guest-prompt">Or enter a guest name and play as a guest.</h5>
                    <input
                        className="guest-name-input"
                        placeholder="Guest name"
                        type="text"
                        maxLength="20"
                        ref={this.inputRef}
                    />
                    <div>
                        <button className="play-button" onClick={this.handleClick}>Play as guest</button>
                    </div>
                </div>
            </div>
            <div className="wr-wrapper">
                <img
                    src={sources.whiteRook}
                    alt="White Rook"
                    className="home-br"
                    draggable="false"
                />
            </div>
        </div>);
    }
}

export default withRouter(HomeScreen);
