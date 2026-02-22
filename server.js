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
let mobs = {};

mobs["mob1"] = {
    x: 300,
    y: 300,
    dirX: 0,
    dirY: 0,
    speed: 1.5
};

io.on('connection', (socket) => {
    console.log('Nowy gracz:', socket.id);

    // Dodanie gracza
    players[socket.id] = {
        x: Math.random() * 500,
        y: Math.random() * 500
    };

    // Wyślij wszystkim info o nowym graczu
    io.emit('currentPlayers', players);

    socket.emit("mobsUpdate", mobs);

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

const TICK_RATE = 1000 / 30; // 30 ticków na sekundę

setInterval(() => {

    for (let id in mobs) {
        let mob = mobs[id];

        // 5% szansy na zmianę kierunku
        if (Math.random() < 0.05) {
            mob.dirX = (Math.random() - 0.5) * 2;
            mob.dirY = (Math.random() - 0.5) * 2;
        }

        // Normalizacja kierunku (żeby nie był szybszy na skos)
        let length = Math.sqrt(mob.dirX * mob.dirX + mob.dirY * mob.dirY);
        if (length > 0) {
            mob.dirX /= length;
            mob.dirY /= length;
        }

        mob.x += mob.dirX * mob.speed;
        mob.y += mob.dirY * mob.speed;

        // Odbicie od ścian
        if (mob.x < 0 || mob.x > 1000) mob.dirX *= -1;
        if (mob.y < 0 || mob.y > 1000) mob.dirY *= -1;
    }

    io.emit("mobsUpdate", mobs);

}, TICK_RATE);

server.listen(3537, '0.0.0.0', () => {
    console.log('Serwer działa na porcie 3537');
});
