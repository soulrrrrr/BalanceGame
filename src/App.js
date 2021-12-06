import React from 'react'
import { useState } from 'react'
import socket from './socket'
import Game from './pages/Game';
import { useSelector } from 'react-redux'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
  useParams,
  useRouteMatch
} from 'react-router-dom';
import { useEffect } from 'react';
import Entry from './pages/Entry';

const App = () => {

  useEffect(() => {
    socket.connect();
    return () => {
      socket.disconnect();
    }
  }, []);

  useEffect(() => {
    document.title = "相見歡小遊戲"
  }, [])

  const [name, setName] = useState('');

  const SetName = (name) => {
    console.log("Name", name);
    setName(name);
  }

  return (
    <Router>
      <div className="login">
        <h4>If cannot login, please refresh the website.</h4>
	<noscript>Your browser does not support JavaScript!</noscript>
        <div>
          <Link to="/login">Login</Link>
        </div>
        <div>
          <Link to="/topics">How to play</Link>
        </div>
        <div className="content">
          <Switch>
            <Route exact path="/login">
              <Entry name={name} setName={SetName}/>
            </Route>
            <Route path="/topics">
	      <h4>{'Press left and right to move character.\n'}</h4>
	      <h4>{`Keep balance!`}</h4>
            </Route>
            <Route path="/game/:id">
              {name ?
                <React.Fragment>
                  <Game name={name}/>
                </React.Fragment>
                :
                <Redirect to="/login" />
              }
            </Route>
          </Switch>
        </div>
      </div>
    </Router>
  )
}

export default App;
