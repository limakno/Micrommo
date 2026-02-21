const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

app.use(express.static("public"));

let players = {};

io.on('connection', (socket) => {
    console.log('Nowy gracz:', socket.id);

    // Dodanie gracza
    players[socket.id] = {
        x: Math.random() * 500,
        y: Math.random() * 500
    };

    // Wyślij wszystkim info o nowym graczu
    io.emit('currentPlayers', players);

    socket.on('move', (data) => {
        if (players[socket.id]) {
            players[socket.id].x = data.x;
            players[socket.id].y = data.y;

            io.emit('playerMoved', {
                id: socket.id,
                x: data.x,
                y: data.y
            });
        }
    });

    socket.on('disconnect', () => {
        console.log('Rozłączono:', socket.id);
        delete players[socket.id];
        io.emit('playerLeft', socket.id);
    });
});

server.listen(3537, '0.0.0.0', () => {
    console.log('Serwer działa na porcie 3537');
});
