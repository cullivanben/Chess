import React from 'react';
import { withRouter } from 'react-router-dom';
import Modal from './Modal';
import Loader from './Loader';
import sources from '../chess-classes/pieces/sources';
import '../stylesheets/HomeScreen.scss';
const guestIdRoute = '/set_guestid_46e5a98a-37a1-42d8-bb24-18be79ee95b0f99bf926-2b0a-4a82-a-da1833803723';

/**
 *The component that comprises the entire home screen.
 The home screen is mainly static.
 *
 * @export
 * @class HomeScreen
 * @extends {React.Component}
 */
class HomeScreen extends React.Component {
    /**
     *Creates an instance of HomeScreen.
     * @param {object} props
     * @memberof HomeScreen
     */
    constructor(props) {
        super(props);
        this.state = {
            playing: false,
            showModal: false,
            randNum: 0,
            loading: false
        }
        this.inputRef = React.createRef();
        this.idRef = React.createRef();
        this.handleClick = this.handleClick.bind(this);
    }

    /**
     *Handles when the user clicks 'Play as guest'.
     *
     * @memberof HomeScreen
     */
    async handleClick() {
        // save the guest name to local storage
        let input = this.inputRef.current.value.trim();
        if (input === '') {
            input = 'Guest ' + (Math.floor(Math.random() * 90000) + 10000);
        }
        localStorage.clear();
        localStorage.setItem('name', JSON.stringify(input));
        // save the guest id to local storage
        let gameId = this.idRef.current.value.trim();
        if (gameId === '') return;
        localStorage.setItem('gameId', JSON.stringify(gameId));

        this.inputRef.current.value = '';
        this.idRef.current.value = '';

        // tell the server that this gameid corresponds to this user
        this.setState({ loading: true });
        await fetch(guestIdRoute, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                gameId: gameId
            })
        });
        this.setState({ loading: false });

        // navigate to the game screen
        this.props.history.push('/play');
    }

    render() {
        // display loading screen if in the middle of a fetch call
        if (this.state.loading) return <Loader message="Setting color." />;
        // else, display the home screen 
        return (<div className="outer-home">
            <Modal
                handleClose={() => this.setState({ showModal: false })}
                show={this.state.showModal}
                randNum={this.state.randNum}
            />
            <div className="home-wrapper">
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
                        <button className="generate" onClick={() => {
                            this.setState({
                                showModal: true,
                                randNum: (Math.floor(Math.random() * 900000) + 100000)
                            });
                        }}>Generate Game ID</button>
                        <input
                            className="game-id-input"
                            placeholder="Enter your game id"
                            type="text"
                            maxLength="10"
                            ref={this.idRef}
                        />
                        <input
                            className="guest-name-input"
                            placeholder="Enter your name"
                            type="text"
                            maxLength="20"
                            ref={this.inputRef}
                        />
                        <div>
                            <button className="play-button" onClick={this.handleClick}>Play</button>
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
            </div>
        </div>);
    }
}

export default withRouter(HomeScreen);
