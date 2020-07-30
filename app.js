const http = require('http');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const socketIO = require('socket.io');
const redis = require('redis');
const asyncRedis = require('async-redis');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo')(session);
const uuid = require('uuid');
const path = require('path');
require('dotenv').config();
const guestIdRoute = '/set_guestid_46e5a98a-37a1-42d8-bb24-18be79ee95b0f99bf926-2b0a-4a82-a-da1833803723';
const colorRoute = '/get_color_46e5a98a-37a1-42d8-bb24-18be79ee95b0f99bf926-2b0a-4a82-a-da1833803723';

// connect to redis
var client = redis.createClient(process.env.REDIS_URL);
var asyncClient = asyncRedis.decorate(client);


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
app.use(bodyParser.json());

// serve the react app
app.use(express.static(path.join(__dirname, 'client/build')));

// serve the robots.txt file
app.get('/robots.txt', (req, res) => {
    res.sendFile(path.join(__dirname, 'robots.txt'));
});

// send a user's color back to them
app.get(colorRoute, async (req, res) => {
    let color = await asyncClient.get(req.session.guest + '$color');
    res.json({ color: color });
});

// set the guest id
app.post(guestIdRoute, async (req, res) => {
    // give them a guest id if they don't have one
    if (req.session.guest === undefined || req.session.guest === null) {
        //console.log('set the guest iddddd')
        req.session.guest = uuid.v1();
    }

    // get the game id from the request
    let gameId = req.body.gameId;
    //console.log(gameId, req.session.guest);

    // see if the other player is already in the game
    let notEmpty = await asyncClient.exists(gameId);

    // if this player is not the first to join the game
    if (notEmpty === 1) {
        // get the number of players in the game
        let count = await asyncClient.get(gameId);

        // if there is only one player
        if (count === '1') {
            //console.log('oneplayerr')
            let notFirstTime = await asyncClient.exists(req.session.guest);
            // if it is this player's first time joining
            if (notFirstTime !== 1) {
                //console.log('first time black', req.session.guest)
                // update the number of players in the game and this player's color
                await Promise.all([
                    asyncClient.set(gameId, '2'),
                    asyncClient.expire(gameId, 30000),
                    asyncClient.set(req.session.guest + '$color', 'black'),
                    asyncClient.expire(req.session.guest + '$color', 30000)
                ]);
            }
            //console.log('we have a re join without opponent')
        }
        // we do not need to update the number of players in the game if this
        // is not the player's first time joining
        //else console.log('bruh, the count is', count);
    }
    // if this player is the first to join the game
    else {
        //console.log('first to join whiteeeeeee', req.session.guest)
        // set the number of players in the game and 
        // set this player's color
        await Promise.all([
            asyncClient.set(gameId, '1'),
            asyncClient.expire(gameId, 30000),
            asyncClient.set(req.session.guest + '$color', 'white'),
            asyncClient.expire(req.session.guest + '$color', 30000)
        ]);
    }

    // see if this player has already been added to redis
    let alreadyAdded = await asyncClient.exists(req.session.guest);

    // if they have, see if we need to update their game id
    if (alreadyAdded === 1) {
        //console.log('already added', req.session.guest);
        let oldId = await asyncClient.get(req.session.guest);
        //console.log(oldId, 'diffff', gameId)
        if (oldId !== gameId) await asyncClient.set(req.session.guest, gameId);
    }
    // if they haven't, add them
    else {
        //console.log('havent been added yet', req.session.guest)
        await Promise.all([
            asyncClient.set(req.session.guest, gameId),
            asyncClient.expire(req.session.guest, 30000)
        ]);
    }
    res.json({ data: 'id set' });
});

// serve the react app on all other requests
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build/index.html'));
});

// set up the server and socket.io
const server = http.createServer(app);
const io = socketIO(server);

// access session store within incoming socket.io connections
io.use((socket, next) => sessionMiddleWare(socket.request, socket.request.res || {}, next));

// handle connection to the socket
io.on('connection', async socket => {

    // get the guest id
    let guest = socket.request.session.guest;

    // get the room id and join the room
    let roomId = await asyncClient.get(guest);
    socket.join(roomId);

    // get the number of players in the room, if it is two, start the game
    let num = await asyncClient.get(roomId);
    if (num === '2') {
        // inform both users that they can start the game
        io.in(roomId).emit('enemy-connected');
    }

    // when the board is updated, send the board update to the other user connected to this room
    socket.on('outgoing-board-update', data => {
        socket.to(roomId).emit('incoming-board-update', data);
    });

    // when a message is recieved, send the message to the other user
    socket.on('outgoing-message', data => {
        socket.to(roomId).emit('incoming-message', data);
    });

    // when the user emits their name, tell the other user
    socket.on('outgoing-name', data => {
        socket.to(roomId).emit('incoming-enemy-name', data);
    });

    // when the user is requesting a draw with the other user
    socket.on('outgoing-draw-request', () => {
        socket.to(roomId).emit('incoming-draw-request');
    });

    // when a user accepts another user's draw request
    socket.on('its-a-draw', async () => {
        // tell the other user that the match was a draw
        socket.to(roomId).emit('match-was-draw');
        // disconnect the socket
        socket.disconnect(true);
        // remove this player and their game id from redis
        await Promise.all([
            asyncClient.del(guest),
            asyncClient.del(guest + '$color'),
            asyncClient.del(roomId)
        ]);
    });

    // when a user loses
    socket.on('i-lost', async () => {
        // tell the other user that they have won
        socket.to(roomId).emit('you-won');
        // disconnect the socket
        socket.disconnect(true);
        // remove this player and their game id from redis
        await Promise.all([
            asyncClient.del(guest),
            asyncClient.del(guest + '$color'),
            asyncClient.del(roomId)
        ]);
    });

    // forcibly disconnect the user
    socket.on('force-disconnect', async () => {
        let exists = await asyncClient.exists(guest);
        // if this user is still in redis
        if (exists === 1) {
            // tell the other user that this user left
            socket.to(roomId).emit('enemy-left');
            // disconnect this socket
            socket.disconnect(true);
            // remove this player and their game id from redis
            await Promise.all([
                asyncClient.del(guest),
                asyncClient.del(guest + '$color'),
                asyncClient.del(roomId)
            ]);
        }
        else socket.disconnect(true);
    });

    // handles when this user is the second user to disconnect
    socket.on('secondary-disconnect', async () => {
        // remove this player from redis
        await Promise.all([
            asyncClient.del(guest),
            asyncClient.del(guest + '$color'),
            asyncClient.del(roomId)
        ]);
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
