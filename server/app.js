const express = require('express')
const app = express()
const http = require('http')
const socketIO = require('socket.io')

// establish the port to listen on
let PORT = process.env.PORT || 3000

// create the server 
const server = http.createServer(app)

// create the socket using the instance of the server
const io = socketIO(server)

// handle connection to the socket
io.listen('connection', (socket) => {
    console.log('connection established')
})

// start listening on the specified port
server.listen(port, () => {
    console.log(`Listening on port ${PORT}`)
})


