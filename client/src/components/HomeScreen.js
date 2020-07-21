import React from 'react';
import { Link } from 'react-router-dom';
import '../stylesheets/HomeScreen.scss';

export default class HomeScreen extends React.Component {
    render() {
        return (
            <div className="home-screen">
                <h1 className="logo-header">Live Chess</h1>
                <div className="play-button-wrapper">
                    <button className="play-button">Sign in</button>
                    <Link to="/play">
                        <button className="play-button">Play as guest</button>
                    </Link>
                </div>
            </div>
        );
    }
}
