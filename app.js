const http = require('http');
const express = require('express');
const session = require('express-session');
const socketIO = require('socket.io');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo')(session);
const uuid = require('uuid');
const path = require('path');
require('dotenv').config();

// the port to listen on
const PORT = process.env.PORT || 5000;

// connect to the db
mongoose.connect(
    process.env.MONGODB_CONNECTION,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
);

// set up the middleware for recognizing user sessions
var sessionMiddleWare = session({
    secret: process.env.COOKIE_SECRET,
    saveUninitialized: true,
    resave: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }) // use mongodb for session storage
});

// set up express
const app = express();
app.use(sessionMiddleWare);

// serve the react client
app.use(express.static(path.join(__dirname, '../client/build')));

// DEVELOPMENT
app.get('/test', (req, res) => {
    // make sure the user has a guest id 
    console.log('guest from route ', req.session.guest);
    if (req.session.guest === undefined) {
        req.session.guest = uuid.v1();
    }
    res.send({ msg: 'yay' });
});

app.get('/robots.txt', (req, res) => {
    res.sendFile(path.join(__dirname, 'robots.txt'));
});

app.get('*', (req, res) => {
    if (req.session.guest === undefined) {
        req.session.guest = uuid.v1();
    }
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// set up the server and socket.io
const server = http.createServer(app);
const io = socketIO(server);

// socket.io 
var roomOpen = false;
var currentId = uuid.v1();
// maps each guest id to their room and color
var guestInfo = new Map();

// access session store within incoming socket.io connections
io.use((socket, next) => sessionMiddleWare(socket.request, socket.request.res || {}, next));

// handle connection to the socket
io.on('connection', socket => {

    // get the guest id
    let guest = socket.request.session.guest;

    console.log('guest from socket', guest);
    // if this user is already part of a game, add them to the same room
    if (guestInfo.has(guest)) socket.join(guestInfo.get(guest).room);

    // if the user is not currently part of a game
    else {
        // add them to the open game
        if (!roomOpen) currentId = uuid.v1();
        roomOpen = !roomOpen;
        let roomId = currentId;
        socket.join(roomId);

        // determine the color of this user
        let color = roomOpen ? 'white' : 'black';

        // save the user's room and color
        guestInfo.set(guest, { room: roomId, color: color });

        // send the color to the user
        socket.emit('color', guestInfo.get(guest).color);

        // if this is the second player to enter the room, tell both players that an opponent has connected
        if (!roomOpen) io.in(roomId).emit('enemy-connected');
    }

    // when the board is updated, send the board update to the other user connected to this room
    socket.on('outgoing-board-update', data => {
        socket.to(guestInfo.get(guest).room).emit('incoming-board-update', data);
    });

    // when a message is recieved, send the message to the other user
    socket.on('outgoing-message', data => {
        socket.to(guestInfo.get(guest).room).emit('incoming-message', data);
    });

    // when the user emits their name, tell the other user
    socket.on('outgoing-name', data => {
        socket.to(guestInfo.get(guest).room).emit('incoming-enemy-name', data);
    });

    // when the user is requesting a draw with the other user
    socket.on('outgoing-draw-request', () => {
        socket.to(guestInfo.get(guest).room).emit('incoming-draw-request');
    });

    // when a user accepts another user's draw request
    socket.on('its-a-draw', () => {
        socket.to(guestInfo.get(guest).room).emit('match-was-draw');
        // remove this player from the map of guest info
        if (guestInfo.has(guest)) guestInfo.delete(guest);
        // disconnect the socket
        socket.disconnect(true);
    })

    // when a user loses, tell the other user that they have won
    socket.on('i-lost', () => {
        socket.to(guestInfo.get(guest).room).emit('you-won');
        // remove this player from the map of guest info
        if (guestInfo.has(guest)) guestInfo.delete(guest);
        // disconnect the socket
        socket.disconnect(true);
    });

    // forcibly disconnect the user
    socket.on('force-disconnect', () => {
        // inform the other player that this player left the room
        socket.to(guestInfo.get(guest).room).emit('enemy-left');
        // remove this player from the map of guest info
        if (guestInfo.has(guest)) guestInfo.delete(guest);
        // disconnect the socket
        socket.disconnect(true);
    });

    // handles when this user is the second user to disconnect
    socket.on('secondary-disconnect', () => {
        // remove this player from the map of guest info
        if (guestInfo.has(guest)) guestInfo.delete(guest);
        // disconnect the socket
        socket.disconnect(true);
    });

    // forcibly disconnect the message socket
    socket.on('disconnect-message', () => {
        socket.disconnect(true);
    });
});

if (process.env.NODE_ENV === 'production') {
    
}

// start listening on the specified port
server.listen(PORT);