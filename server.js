const express = require('express');
const app = express();
const path = require("path");
var http = require('http').Server(app);
var io = require('socket.io')(http);
app.use(express.static(__dirname + '/public'));
var rooms = {};
var room;
var color;

const PORT = process.ENV.PORT || 3000;

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

io.on('connection', function(socket) {
    console.log('A user connected');

    socket.on('move', function(move, roomId) {
        console.log(move, roomId);
        socket.to(roomId).emit('move', move);
    });

    socket.on("join", function(roomId) {
        socket.join(roomId);
        socket.room = roomId;
        room = roomId;
        if (rooms[roomId] === undefined) {
            rooms[roomId] = 1;
            socket.emit("color", color);
        } else {
            rooms[roomId]++;
        }
        if (rooms[roomId] === 3) {
            socket.emit('tooManyUsers', rooms[roomId]);
        } else {
            io.in(roomId).emit("roomUsers", rooms[roomId]);
            if (rooms[roomId] === 1) {
                color = "white";
            } else {
                color = "black";
            }
            socket.emit("color", color);
        }
    })

    socket.on('disconnect', function() {
        console.log('A user disconnected');
    });
});

http.listen(PORT, function() {
    console.log('listening on localhost:3000');
});