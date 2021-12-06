import React from 'react'
import { useState, useEffect, useContext } from 'react';
import socket from '../socket';
import { useSelector, useDispatch } from 'react-redux';

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
  useHistory,
  useLocation
} from "react-router-dom";
import '../App.css';

const Entry = ({ name, setName }) => {

  const [roomId, setRoomId] = useState('');
  const [login, setLogin] = useState(false);

  useEffect(() => {
    let isSubscribed = true;
    socket.on('success', () => {
      setLogin(true);
    });
    return (() => {
      isSubscribed = false;
    })
  }, [socket]);
  
  const handleSetRoomId = (e) => setRoomId(e.target.value);
  const handleSetName = (e) => setName(e.target.value);
  const handleEnterRoomClick = (e) => {
    if (roomId === "" || name === "") {
      alert("Please enter room id and your name.");
    }
    else {
      socket.emit("login", {
        roomId,
        name
      });
    }
  };


  return (
    <React.Fragment>
      {login ?
        <Redirect to={`/game/${roomId}`}></Redirect>
        : <React.Fragment>
          <div className="entry">
            <div>
              相見歡小遊戲
            </div>
            <div>
              <label>
                Enter room ID:
              </label>
              <input
                type="text"
                onChange={handleSetRoomId}
              />
            </div>
            <div>
              <label>
                Enter your name:
              </label>
              <input
                type="text"
                onChange={handleSetName}
              />
              <button
                className="box btn"
                onClick={handleEnterRoomClick}
              >
                Go!
              </button>
            </div>
          </div>
        </React.Fragment>

      }
    </React.Fragment>
  );
}

export default Entry;
