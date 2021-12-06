const { clear } = require('console');
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
})

let rooms = {};
let k = 5; // speed

function isEmpty(obj) {
  for(var key in obj) {
    if(obj.hasOwnProperty(key))
      return false;
  }
  return true;
}

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('login', (msg) => {
    socket.username = msg.name;
    socket.roomId = msg.roomId;
    socket.join(`${socket.roomId}`);
    socket.emit('success', socket.roomId);
    if (!rooms[socket.roomId])
      rooms[socket.roomId] = {
	players: {},
        angle: 0,
        acc: 0,
        vel: 0,
        wind: 0,
        alive: 0,
        playing: false,
      };
    rooms[socket.roomId].players[socket.id] = 0;
    console.log(`room ${socket.roomId}: ${Object.keys(rooms[socket.roomId].players).length}`);
    io.to(socket.roomId).emit('newUser', Object.keys(rooms[socket.roomId].players).length);
    //console.log(io.of("/").adapter.rooms);
  });

  socket.on("newGame", () => {
    try {
      rooms[socket.roomId].players[socket.id] = 0;
      rooms[socket.roomId].acc = 0;
      rooms[socket.roomId].vel = 0;
      rooms[socket.roomId].angle = 0;
      rooms[socket.roomId].alive = 0;
      rooms[socket.roomId].playing = true;
      console.log(`new game: ${socket.roomId}!`);
    }
    catch(err) {
      console.log('newGameError');
    }
  });

  socket.on("endGame", () => {
    try {
      rooms[socket.roomId].acc = 0;
      rooms[socket.roomId].vel = 0;
      rooms[socket.roomId].angle = 0;
      rooms[socket.roomId].alive = 0;
      rooms[socket.roomId].playing = false;
      //console.log(`endGame: ${socket.roomId}`);
    }
    catch(err) {
      console.log('endGameError');
    }
  })

  socket.on('angleUp', (acc) => {
    try {
      rooms[socket.roomId].players[socket.id] = acc;
    }
    catch(err) {
      console.log('angleUpErr');
    }
  });

  socket.on('leftRoom', () => {
    console.log('delete');
    let skId = socket.id;
    if (socket.roomId) {
      delete rooms[socket.roomId].players[skId];
      io.to(socket.roomId).emit('userLeft', Object.keys(rooms[socket.roomId].players).length);
    }
    socket.leave(socket.roomId);
    //console.log(io.of("/").adapter.rooms);
  });

  socket.on('disconnect', () => {
    console.log('disconnect');
    let skId = socket.id;
    if (socket.roomId) {
      delete rooms[socket.roomId].players[skId];
      io.to(socket.roomId).emit('userLeft', Object.keys(rooms[socket.roomId].players).length);
    }
  });
});

setInterval(() => {
  for (const [key, value] of Object.entries(rooms)) {
    if (isEmpty(value.players)) {
      value.acc = 0;
      value.vel = 0;
      value.angle = 0;
      value.alive = 0;
      continue;
    }
    if (!value.playing) {
      continue;
    }
    let total = Object.values(value.players).reduce((a, b) => a + b);
    value.acc = total / Object.keys(value.players).length;
    if (value.alive % 50 === 0) {
      value.wind = (Math.random() < 0.5 ? -0.5 : 0.5) * ((value.alive / 50)+1);
    }
    if (value.alive % 10 === 0)
      value.acc += value.wind;
    let fix = 1;
    if (Math.abs(value.angle) >= 30 && Math.sign(value.acc) * Math.sign(value.vel) === -1)
      fix = 2;
    value.vel += 0.1 * value.acc * fix;
    value.angle += value.vel * 0.1* (k+Math.floor(value.alive/50));
    value.alive += 1;
    io.to(key).emit('angleDown', {angle: value.angle, wind: value.wind, vel: value.vel, record:value.alive});
  }
}, 1000/10);

const port = process.env.PORT || 4001;
server.listen(port, () => {
  console.log(`listening on port ${port}`);
});
