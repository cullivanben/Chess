const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const uuid = require('uuid');
const session = require('express-session');
const config = require('./config');

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
    console.log("guest from route ", req.session.guest);
    if (req.session.guest === undefined) {
        req.session.guest = uuid.v1();
    }
    res.send({msg: "yay"});
});

// set up the server and socket.io
const server = http.createServer(app);
const io = socketIO(server);

// socket.io 
var roomOpen = false;
var currentId = uuid.v1();
var rooms = new Map();

// access session store within incoming socket.io connections
io.use((socket, next) => sessionMiddleWare(socket.request, socket.request.res || {}, next));

// handle connection to the socket
io.on("connection", socket => {
    console.log("guest from socket", socket.request.session.guest);

    // if this user is already part of a game, add them to the same room
    if (rooms.has(socket.request.session.guest)) socket.join(rooms.get(socket.request.session.guest).room);
    // if the user is not currently part of a game
    else {
        // add them to the open game
        if (!roomOpen) currentId = uuid.v1();
        roomOpen = !roomOpen;
        let roomId = currentId;
        socket.join(roomId);
        // determine the color of this user
        let color = roomOpen ? "black" : "white";
        // save the user's room and color
        rooms.set(socket.request.session.guest, { room: roomId, color: color });
    }

    // send the color to the user
    socket.emit("color", rooms.get(socket.request.session.guest).color);

    // when the board is updated, send the board update to the other user connected to this room
    socket.on("outgoing-board-update", data => {
        socket.to(rooms.get(socket.request.session.guest).room).emit("incoming-board-update", data);
        //socket.broadcast.to(roomId).emit("incoming-board-update", data);
    });

    // inform the user when it is their turn
    socket.on("outgoing-turn", data => {
        socket.to(rooms.get(socket.request.session.guest).room).emit("incoming-turn", data);
    });

    // when a client disconnects
    socket.on("disconnect", () => {
        console.log("client disconnected");
    });
});

// start listening on the specified port
server.listen(config.port, () => {
    console.log(`Listening on port ${config.port}`);
});