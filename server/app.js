const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const uuid = require('uuid');
const session = require('express-session');
const cors = require('cors');
// const google = require('googleapis').google;
// const path = require('path');
// const jwt = require('jsonwebtoken');
require('dotenv/config');

const app = express();

var sessionMiddleWare = session({
    secret: process.env.COOKIE_SECRET,
    saveUninitialized: true,
    resave: false
});

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
// TODO: ONLY FOR DEV
io.origins('*:*');

var roomOpen = false;
var currentId = uuid.v1();
var rooms = new Map();

// access session store within incoming socket.io connections
io.use((socket, next) => {
    sessionMiddleWare(socket.request, socket.request.res || {}, next);
});

// handle connection to the socket
io.on("connection", socket => {
    console.log("guest from socket", socket.request.session.guest);

    // if this user is already part of a game, add them to the same room
    if (rooms.has(socket.request.session.guest)) {
        console.log("added to same room: ", rooms.get(socket.request.session.guest).room);
        socket.join(rooms.get(socket.request.session.guest).room);
    }
    // if the user is not currently part of a game, add them to the open game
    else {
        if (!roomOpen) currentId = uuid.v1();
        roomOpen = !roomOpen;
        let roomId = currentId;
        socket.join(roomId);

        console.log('room id: ', roomId);
        console.log('socket id: ', socket.id);

        // determine the color of this user
        let color = roomOpen ? "black" : "white";

        // save that this user is in this room
        rooms.set(socket.request.session.guest, { room: roomId, color: color });
    }

    // // update the current room id if necessary
    // if (!roomOpen) currentId = uuid.v1();
    // roomOpen = !roomOpen;
    // let roomId = currentId;
    // console.log("uuid", currentId);

    // // connect to the current room
    // socket.join(roomId);

    // send the color to the user
    socket.emit("color", rooms.get(socket.request.session.guest).color);

    // when the board is updated, send the board update to the other user connected to this room
    socket.on("outgoing-board-update", data => {
        socket.to(rooms.get(socket.request.session.guest).room).emit("incoming-board-update", data);
        //socket.broadcast.to(roomId).emit("incoming-board-update", data);
    });

    // when a client disconnects
    socket.on("disconnect", () => {
        console.log("client disconnected");
    });
});

// start listening on the specified port
server.listen(5000, () => {
    console.log(`Listening on port ${5000}`);
});