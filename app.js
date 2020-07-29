const http = require('http');
const express = require('express');
const session = require('express-session');
const socketIO = require('socket.io');
const redis = require('redis');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo')(session);
const uuid = require('uuid');
const path = require('path');
require('dotenv').config();

// connect to redis
var client = redis.createClient();

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
app.use(express.static(path.join(__dirname, 'client/build')));

// serve the robots.txt file
app.get('/robots.txt', (req, res) => {
    res.sendFile(path.join(__dirname, 'robots.txt'));
});

// serve the react app
app.get('*', (req, res) => {
    if (req.session.guest === undefined) {
        req.session.guest = uuid.v1();
    }
    res.sendFile(path.join(__dirname, 'client/build/index.html'));
});

// set up the server and socket.io
const server = http.createServer(app);
const io = socketIO(server);

// socket.io 
var roomOpen = false;
var currentId = uuid.v1();

// access session store within incoming socket.io connections
io.use((socket, next) => sessionMiddleWare(socket.request, socket.request.res || {}, next));

// handle connection to the socket
io.on('connection', socket => {

    // get the guest id
    let guest = socket.request.session.guest;

    client.exists(guest, (err, reply) => {
        // if this user is already part of a game, add them to the same room
        if (reply === 1) {
            console.log('joining same room');

            // get the room id from redis and join the room
            client.get(guest, (err, reply) => socket.join(reply));
        }

        // if the user is not currently part of a game, add them to the open game
        // and save the roomId to redis with their guestId
        else {
            // add them to the open game
            if (!roomOpen) currentId = uuid.v1();
            roomOpen = !roomOpen;
            let roomId = currentId;
            socket.join(roomId);

            // determine the color of this user
            let color = roomOpen ? 'white' : 'black';

            // save this user's room to redis
            client.set(guest, roomId);

            // send the color to the user
            socket.emit('color', color);

            // if this is the second player to enter the room, tell both players that an opponent has connected
            if (!roomOpen) io.in(roomId).emit('enemy-connected');
        }
    });

    // when the board is updated, send the board update to the other user connected to this room
    socket.on('outgoing-board-update', data => {
        client.get(guest, (err, reply) => {
            socket.to(reply).emit('incoming-board-update', data);
        });
    });

    // when a message is recieved, send the message to the other user
    socket.on('outgoing-message', data => {
        client.get(guest, (err, reply) => {
            socket.to(reply).emit('incoming-message', data);
        });
    });

    // when the user emits their name, tell the other user
    socket.on('outgoing-name', data => {
        client.get(guest, (err, reply) => {
            socket.to(reply).emit('incoming-enemy-name', data);
        });
    });

    // when the user is requesting a draw with the other user
    socket.on('outgoing-draw-request', () => {
        client.get(guest, (err, reply) => {
            socket.to(reply).emit('incoming-draw-request');
        });
    });

    // when a user accepts another user's draw request
    socket.on('its-a-draw', () => {
        // tell the other user that the match was a draw
        client.get(guest, (err, reply) => {
            socket.to(reply).emit('match-was-draw');
        });
        // remove this player from redis
        client.del(guest);
        // disconnect the socket
        socket.disconnect(true);
    });

    // when a user loses
    socket.on('i-lost', () => {
        // tell the other user that they have won
        client.get(guest, (err, reply) => {
            socket.to(reply).emit('you-won');
        });
        // remove this player from redis
        client.del(guest);
        // disconnect the socket
        socket.disconnect(true);
    });

    // forcibly disconnect the user
    socket.on('force-disconnect', () => {
        // if this user is still in redis
        client.exists(guest, (err, reply) => {
            if (reply === 1) {
                // tell the other user that this user left
                client.get(guest, (err, reply) => {
                    socket.to(reply).emit('enemy-left');
                    socket.disconnect(true);
                });
                // remove this player from redis
                client.del(guest);
            } 
            else socket.disconnect(true);
        });
    });

    // handles when this user is the second user to disconnect
    socket.on('secondary-disconnect', () => {
        // remove this player from redis
        client.del(guest);
        // disconnect the socket
        socket.disconnect(true);
    });

    // forcibly disconnect the message socket
    socket.on('disconnect-message', () => {
        socket.disconnect(true);
    });
});

// start listening on the specified port
server.listen(process.env.PORT || 5000);



    // // if this user is already part of a game, add them to the same room
    // if (guestInfo.has(guest)) socket.join(guestInfo.get(guest).room);


    // if the user is not currently part of a game
    // else {
    //     // add them to the open game
    //     if (!roomOpen) currentId = uuid.v1();
    //     roomOpen = !roomOpen;
    //     let roomId = currentId;
    //     socket.join(roomId);

    //     // determine the color of this user
    //     let color = roomOpen ? 'white' : 'black';

    //     // // save the user's room and color
    //     // guestInfo.set(guest, { room: roomId, color: color });

    //     // save this user's room

    //     // send the color to the user
    //     socket.emit('color', guestInfo.get(guest).color);

    //     // if this is the second player to enter the room, tell both players that an opponent has connected
    //     if (!roomOpen) io.in(roomId).emit('enemy-connected');
    // }




       // // when the board is updated, send the board update to the other user connected to this room
    // socket.on('outgoing-board-update', data => {
    //     socket.to(guestInfo.get(guest).room).emit('incoming-board-update', data);
    // });

    // // when a message is recieved, send the message to the other user
    // socket.on('outgoing-message', data => {
    //     socket.to(guestInfo.get(guest).room).emit('incoming-message', data);
    // });

    // // when the user emits their name, tell the other user
    // socket.on('outgoing-name', data => {
    //     socket.to(guestInfo.get(guest).room).emit('incoming-enemy-name', data);
    // });

    // // when the user is requesting a draw with the other user
    // socket.on('outgoing-draw-request', () => {
    //     socket.to(guestInfo.get(guest).room).emit('incoming-draw-request');
    // });

    // // when a user accepts another user's draw request
    // socket.on('its-a-draw', () => {
    //     socket.to(guestInfo.get(guest).room).emit('match-was-draw');
    //     // remove this player from the map of guest info
    //     if (guestInfo.has(guest)) guestInfo.delete(guest);
    //     // disconnect the socket
    //     socket.disconnect(true);
    // });

    // // when a user loses, tell the other user that they have won
    // socket.on('i-lost', () => {
    //     socket.to(guestInfo.get(guest).room).emit('you-won');
    //     // remove this player from the map of guest info
    //     if (guestInfo.has(guest)) guestInfo.delete(guest);
    //     // disconnect the socket
    //     socket.disconnect(true);
    // });

    // // forcibly disconnect the user
    // socket.on('force-disconnect', () => {
    //     // inform the other player that this player left the room
    //     socket.to(guestInfo.get(guest).room).emit('enemy-left');
    //     // remove this player from the map of guest info
    //     if (guestInfo.has(guest)) guestInfo.delete(guest);
    //     // disconnect the socket
    //     socket.disconnect(true);
    // });

    // // handles when this user is the second user to disconnect
    // socket.on('secondary-disconnect', () => {
    //     // remove this player from the map of guest info
    //     if (guestInfo.has(guest)) guestInfo.delete(guest);
    //     // disconnect the socket
    //     socket.disconnect(true);
    // });

    // // forcibly disconnect the message socket
    // socket.on('disconnect-message', () => {
    //     socket.disconnect(true);
    // });


    // // maps each guest id to their room and color
// var guestInfo = new Map();

// // DEVELOPMENT
// app.get('/test', (req, res) => {
//     // make sure the user has a guest id 
//     console.log('guest from route ', req.session.guest);
//     if (req.session.guest === undefined) {
//         req.session.guest = uuid.v1();
//     }
//     res.send({ msg: 'yay' });
// });