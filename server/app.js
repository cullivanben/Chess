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

// set up express
const app = express();
app.use(session({
    secret: process.env.COOKIE_SECRET,
    saveUninitialized: true,
    resave: false
}));

// set up routes
// TODO: replace '/test' with '/' for production
app.get('/test', (req, res) => {
    // make sure the user has a guest id 
    console.log(req.session.guest);
    if (req.session.guest === undefined) {
        req.session.guest = uuid.v1();
    }
    res.send({msg: "yay"});
});

// set up the server and socket.io
const server = http.createServer(app);
const io = socketIO(server);

// the number of rooms
var numConnections = 0;
var currentId = uuid.v1();

// handle connection to the socket
io.on("connection", socket => {
    numConnections++;
    console.log("client connected",  numConnections);

    // update the current room id if necessary
    if (numConnections % 2 !== 0) currentId = uuid.v1();
    let roomId = currentId;
    console.log("uuid", currentId);

    // connect to the current room
    socket.join(roomId);

    // when the board is updated, send the board update to the other user connected to this room
    socket.on("outgoing-board-update", data => {
        socket.to(roomId).emit("incoming-board-update", data);
    });

    // when a client disconnects
    socket.on("disconnect", () => {
        numConnections--;
        console.log("client disconnected", numConnections);
    });
});

// start listening on the specified port
server.listen(5000, () => {
    console.log(`Listening on port ${5000}`);
});