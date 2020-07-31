import { BrowserRouter, Switch, Route } from 'react-router-dom';
import React from 'react';
import HomeScreen from './components/HomeScreen';
import GameScreen from './components/GameScreen';
import './stylesheets/App.scss';

/**
 *The main App Component.
 *
 * @export
 * @returns The main App React Component.
 */
export default function App() {
  // useEffect(() => {
  //   // TODO: ONLY FOR DEV
  //   fetch('/test').then(res => console.log(res)).catch(err => console.log(err));
  // });

  return (
    <BrowserRouter>
      <Switch>
        <Route path="/leaderboard">
          <h1>This is the leaderboard</h1>
        </Route>
        {/* Render the game screen */}
        <Route path="/play">
          <GameScreen />
        </Route>
        {/* Render the home screen where the user can login */}
        <Route path="/">
          <HomeScreen />
        </Route>
      </Switch>
    </BrowserRouter>
  );
}
