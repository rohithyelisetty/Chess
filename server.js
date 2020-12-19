const express = require('express');
const app = express();
const path = require("path");
var http = require('http').Server(app);
var io = require('socket.io')(http);
app.use(express.static(__dirname + '/public'));
var rooms = {};

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

io.on('connection', function(socket) {
    console.log('A user connected');

    socket.on('move', function(move, roomId) {
        console.log(move, roomId);
        socket.to(roomId).emit('move', move);
    });

    socket.on('removeCheck', function(roomId) {
        socket.to(roomId).emit('removeCheck');
    });

    socket.on('checkmate', function(roomId, html) {
        socket.to(roomId).emit('mate', html);
    });


    socket.on('movesHistory', function(roomId, html, turnNumber, lineBool) {
        socket.to(roomId).emit('movesHistory', html, turnNumber, lineBool);
    });

    socket.on('castle', function(roomId, side, color) {
        socket.to(roomId).emit('castle', side, color);
    })

    socket.on("join", function(roomId) {
        var color;
        socket.join(roomId);
        socket.room = roomId;
        socket.emit("roomId", roomId)
        if (rooms[roomId] === undefined) {
            rooms[roomId] = 1;
        } else {
            rooms[roomId]++;
        }
        if (rooms[roomId] === 3) {
            socket.emit('tooManyUsers');
        } else {
            io.in(roomId).emit("roomUsers", rooms[roomId]);
            if (rooms[roomId] === 1) {
                color = "white";
            } else {
                color = "black";
            }
            socket.emit("color", color);
        }

        socket.on('disconnecting', function() {
            rooms[roomId]--;
            io.to(roomId).emit('roomUsers', rooms[roomId]);
            if (rooms[roomId] === 0) {
                delete rooms[roomId];
            }
            console.log('A user disconnected');
        });
    });

    socket.on("random", function() {
        console.log("here")
        for (var key in rooms) {
            if (rooms.hasOwnProperty(key)) {
                if (rooms[key] === 1) {
                    socket.emit("randomJoin", key);
                    return;
                }
            }
        }
        socket.emit("noEmpty");
    });

});

http.listen(PORT, function() {
    console.log(`listening on ${PORT}`);
});