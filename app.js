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
const guestIdRoute = '/set_guestid_46e5a98a-37a1-42d8-bb24-18be79ee95b0f99bf926-2b0a-4a82-a-da1833803723';

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

// serve the react app
app.use(express.static(path.join(__dirname, 'client/build')));

// serve the robots.txt file
app.get('/robots.txt', (req, res) => {
    res.sendFile(path.join(__dirname, 'robots.txt'));
});

// set the guest id
app.get(guestIdRoute, (req, res) => {
    console.log('guest req received');
    console.log(req.session.guest);
    if (req.session.guest === undefined || req.session.guest === null) {
        req.session.guest = uuid.v1();
    }
    res.send('success');
});

// serve the react app on all other requests
app.get('*', (req, res) => {
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

    console.log('connection', guest);

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
