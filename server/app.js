const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const uuid = require('uuid');

// establish the port to listen on
const port = process.env.PORT || 5000;

// set up express and socket.io
const app = express();
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
server.listen(port, () => {
    console.log(`Listening on port ${port}`);
});


