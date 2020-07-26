const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const uuid = require('uuid');
const session = require('express-session');
const config = require('./config');
const path = require('path');

// set up the middleware for recognizing user sessions
var sessionMiddleWare = session({
    secret: config.secret.cookie,
    saveUninitialized: true,
    resave: false
});

// set up express
const app = express();
app.use(sessionMiddleWare);

// set up routes
// TODO: replace '/test' with '/' for production
app.get('/test', (req, res) => {
    // make sure the user has a guest id 
    console.log('guest from route ', req.session.guest);
    if (req.session.guest === undefined) {
        req.session.guest = uuid.v1();
    }
    res.send({msg: 'yay'});
});

app.get('/robots.txt', (req, res) => {
    res.sendFile(path.join(__dirname, 'robots.txt'));
})

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
    console.log('guest from socket', socket.request.session.guest);
    // if this user is already part of a game, add them to the same room
    if (guestInfo.has(socket.request.session.guest)) socket.join(guestInfo.get(socket.request.session.guest).room);
    // if the user is not currently part of a game
    else {
        // add them to the open game
        if (!roomOpen) currentId = uuid.v1();
        roomOpen = !roomOpen;
        let roomId = currentId;
        socket.join(roomId);
        // determine the color of this user
        let color = roomOpen ? 'black' : 'white';
        // save the user's room and color
        guestInfo.set(socket.request.session.guest, { room: roomId, color: color });
        // send the color to the user
        socket.emit('color', guestInfo.get(socket.request.session.guest).color);
    }

    // when the board is updated, send the board update to the other user connected to this room
    socket.on('outgoing-board-update', data => {
        socket.to(guestInfo.get(socket.request.session.guest).room).emit('incoming-board-update', data);
        //socket.broadcast.to(roomId).emit('incoming-board-update', data);
    });

    // inform the user when it is their turn
    socket.on('outgoing-turn', () => {
        socket.to(guestInfo.get(socket.request.session.guest).room).emit('incoming-turn');
    });

    // when a message is recieved, send the message to the other user
    socket.on('outgoing-message', data => {
        socket.to(guestInfo.get(socket.request.session.guest).room).emit('incoming-message', data);
    });

    // forcibly disconnect the user
    socket.on('force-disconnect', () => {
        console.log('force-disconnect');
        // inform the other player that this player left the room
        console.log(guestInfo.has(socket.request.session.guest));
        socket.to(guestInfo.get(socket.request.session.guest).room).emit('enemy-left');
        // remove this player from the map of guest info
        if (guestInfo.has(socket.request.session.guest)) guestInfo.delete(socket.request.session.guest);
        // disconnect the socket
        socket.disconnect(true);
    });

    // forcibly disconnect the message socket
    socket.on('disconnect-message', () => {
        socket.disconnect(true);
    });

    // when a client disconnects
    socket.on('disconnect', (reason) => {
        console.log('actual-disconnect');
        console.log(reason);
    });
}); 

// start listening on the specified port
server.listen(config.port, () => {
    console.log(`Listening on port ${config.port}`);
});