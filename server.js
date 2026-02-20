const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer();
const io = new Server(server, {
    cors: {
        origin: "*",  // lokalnie dla testów
    }
});

let players = {}; // prosta baza graczy w pamięci

io.on('connection', (socket) => {
    console.log('Nowy gracz połączony:', socket.id);

    // Dodanie gracza
    players[socket.id] = { x: 0, y: 0 };

    // Odbiór ruchu gracza
    socket.on('move', (data) => {
        players[socket.id].x = data.x;
        players[socket.id].y = data.y;

        // Rozgłaszanie innym graczom
        socket.broadcast.emit('playerMoved', { id: socket.id, x: data.x, y: data.y });
    });

    // Rozłączenie gracza
    socket.on('disconnect', () => {
        console.log('Gracz rozłączony:', socket.id);
        delete players[socket.id];
        socket.broadcast.emit('playerLeft', socket.id);
    });
});

server.listen(3000, () => {
    console.log('Serwer MMO działa na porcie 3000');
});
