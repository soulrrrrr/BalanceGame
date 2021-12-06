import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, useParams } from 'react-router-dom';
import arrow from '../images/arrow.png';
import jw from '../images/jw.png';

import socket from '../socket';
import '../App.css';

const Game = ({ name }) => {
  let { id } = useParams();

  const [angle, setAngle] = useState(0);
  const [vel, setVel] = useState(0.0);
  const [record, setRecord] = useState(0.0);
  const [wind, setWind] = useState(0.0);
  const [notification, setNotification] = useState([]);
  const [roomPeople, setRoomPeople] = useState(1);

  const updateNotification = (msg) => {
    if (notification.length >= 5) {
      let newNotification = notification;
      newNotification.shift();
      newNotification.push(msg);
      console.log(newNotification);
      setNotification(newNotification);
    }
    else {
      let newNotification = [...notification, msg];
      console.log(newNotification);
      setNotification(newNotification);
    }
  };

  useEffect(() => {
    let isSubscribed = true;

    socket.on('name', (msg) => {
      console.log(msg);
    });

    socket.on('newUser', (msg) => {
      if (isSubscribed) setRoomPeople(msg);
    });

    socket.on('userLeft', (msg) => {
      if (isSubscribed) setRoomPeople(msg);
    });

    socket.on('angleDown', (data) => {
      if (data.angle >= 90 || data.angle <= -90) {
        if (isSubscribed) {
          setAngle(0);
          if (record < data.record) setRecord(data.record);
          updateNotification(`Score: ${data.record}`);
          socket.emit('endGame', '');
          alert(`Game Over! Your score: ${data.record}`);
        }
      }
      else if (isSubscribed) {
        setAngle(data.angle);
	setWind(data.wind);
        setVel(Math.round(data.vel * 100) / 100);
      };
    });
    return () => {
      isSubscribed = false;
    };
  }, [socket, notification, record, roomPeople, wind]);

  useEffect(() => {
    return () => {
      socket.emit('leftRoom', '');
    };
  }, [])

  return (
    <div>
    <div className="game">
      <div>
        {record !== 0 && <h3 className="alert" key={record}>Record: {record}</h3>}
      </div>
      <div>
        <h4>Room People: {roomPeople}</h4>
        <h4>{vel}</h4>
	<h4>Wind: {wind}</h4>
      </div>
      <div>
        <img id="arrow" src={jw} alt="arrow"
          style={{ transform: `rotate(${angle}deg)`, transformOrigin: 'bottom center', transitionDuration: '100ms' }}
        />
      </div>
      <div>
        <button color="primary" onClick={() => socket.emit('angleUp', -1)}>Left</button>
        <button color="primary" onClick={() => socket.emit('angleUp', 0)}>None</button>
        <button color="primary" onClick={() => socket.emit('angleUp', 1)}>Right</button>
      </div>
      <div>
        {name === "admin" ?
	<div>
          <button onClick={() => {
            socket.emit('newGame', '');
          }}>Start</button>
          <button onClick={() => {
            socket.emit('endGame', '');
          }}>Stop</button></div> : ""
        } 
      </div>
    </div>
      <div>
	{angle === 0 ? <h4>Please wait admin to start.</h4>:""}
      </div>
    </div> 
    // <div>
    //   <div className="info">
    //     <ul>
    //       <li>
    //         <h3>RoomID: {id}</h3>
    //         <h3>{`Name: ${name}`}</h3>
    //       </li>
    //       <li>
    //         <div className="notify">
    //           <h3>
    //             {record !== 0 && <h3 className="alert" key={record}>Record: {record}</h3>}
    //             {(notification || []).map((n) => (
    //               <h3 key={n+Math.random(1, 10)}>{n}</h3>
    //             ))}
    //           </h3>
    //         </div>
    //       </li>
    //     </ul>
    //   </div>
    //   <div className="content">
    //     <div>
    //       <h3>{vel}</h3>
    //     </div>
    //     <div>
    //       <img id="arrow" src={arrow} alt="arrow" style={{ transform: `rotate(${angle}deg)`, transformOrigin: 'bottom center', margin: '100px', transitionDuration: '100ms' }} />
    //     </div>
    //     <div>
    //       <button className="button" color="primary" onClick={() => {
    //         socket.emit('newGame', '');
    //         updateNotification("Restart!");
    //       }}>Restart</button>
    //     </div>
    //     <div className="leftTitle">
    //       <button color="primary" onClick={() => socket.emit('angleUp', -3)}>SuperLeft</button>
    //       <button color="primary" onClick={() => socket.emit('angleUp', -1)}>Left</button>
    //       <button color="primary" onClick={() => socket.emit('angleUp', 0)}>None</button>
    //       <button color="primary" onClick={() => socket.emit('angleUp', 1)}>Right</button>
    //       <button color="primary" onClick={() => socket.emit('angleUp', 3)}>SuperRight</button>
    //     </div>
    //   </div>
    // </div>  
  );
}

export default Game;
