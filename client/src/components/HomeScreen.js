import React from 'react';
import '../stylesheets/HomeScreen.scss';

export default class HomeScreen extends React.Component {
    render() {
        return (
            <div className="home-screen">
                <h1 className="logo-header">Live Chess</h1>
                <button>Sign in</button>
                <button>Play as guest</button>
            </div>
        );
    }
}
