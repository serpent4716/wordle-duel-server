const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { nanoid } = require('nanoid');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

app.get('/', (req, res) => res.send('Wordle Duel Server Running ✅'));

// In-memory room store
const rooms = {};

const ANSWER_WORDS = [
  "CRANE","SLATE","TRACE","STARE","SNARE","PLANE","GLOBE","CRAVE","GRACE","PLACE",
  "DANCE","FLAME","BRAVE","GRADE","SHADE","FLARE","SPINE","STALE","BLAZE","PRIDE",
  "GLARE","SCORE","STORE","SHORE","SHARE","SPARE","SCALE","BLAME","CHASE","SMILE",
  "WHILE","DRIVE","PRICE","TWICE","TRUCE","FORCE","HORSE","HOUSE","MOUSE","GRAZE",
  "BRAND","STAND","GRAND","BLIND","GRIND","SHINE","BRINE","CLONE","DRONE","STONE",
];

function randomWord() {
  return ANSWER_WORDS[Math.floor(Math.random() * ANSWER_WORDS.length)];
}

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('room:create', ({ playerName }) => {
    let roomCode;
    do { roomCode = generateRoomCode(); } while (rooms[roomCode]);

    const word = randomWord();
    rooms[roomCode] = {
      code: roomCode,
      word,
      players: [{
        id: socket.id,
        name: playerName,
        guessCount: null,
        solved: null,
      }],
      started: false,
      results: {},
    };

    socket.join(roomCode);
    socket.roomCode = roomCode;
    socket.emit('room:joined', { roomCode, word });
    console.log(`Room ${roomCode} created by ${playerName}`);
  });

  socket.on('room:join', ({ roomCode, playerName }) => {
    const room = rooms[roomCode];
    if (!room) {
      socket.emit('room:error', { message: 'Room not found' });
      return;
    }
    if (room.players.length >= 2) {
      socket.emit('room:error', { message: 'Room is full' });
      return;
    }

    room.players.push({
      id: socket.id,
      name: playerName,
      guessCount: null,
      solved: null,
    });

    socket.join(roomCode);
    socket.roomCode = roomCode;
    room.started = true;

    // Tell the joiner what the word is and who they're playing
    socket.emit('room:joined', { roomCode, word: room.word });

    // Tell the creator that opponent joined
    socket.to(roomCode).emit('room:opponent_joined', { name: playerName });
    socket.emit('game:start', { word: room.word, opponentName: room.players[0].name });

    console.log(`${playerName} joined room ${roomCode}`);
  });

  socket.on('game:submit_result', ({ roomCode, guessCount, solved }) => {
    const room = rooms[roomCode];
    if (!room) return;

    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;

    player.guessCount = guessCount;
    player.solved = solved;

    // Tell opponent this player is done
    socket.to(roomCode).emit('game:opponent_done', { guessCount, solved });

    // Check if both done
    const allDone = room.players.every(p => p.guessCount !== null || p.solved === false);
    if (allDone && room.players.length === 2) {
      const [p1, p2] = room.players;
      const g1 = p1.solved ? p1.guessCount : 99;
      const g2 = p2.solved ? p2.guessCount : 99;

      let winner = 'tie';
      if (g1 < g2) winner = p1.id;
      else if (g2 < g1) winner = p2.id;

      room.players.forEach(p => {
        const opponent = room.players.find(x => x.id !== p.id);
        const isWinner = winner === p.id || winner === 'tie' ? winner === 'tie' ? 'tie' : 'me' : 'opponent';
        io.to(p.id).emit('game:result', {
          winner: winner === 'tie' ? 'tie' : winner === p.id ? 'me' : 'opponent',
          myGuesses: p.solved ? p.guessCount : null,
          opponentGuesses: opponent?.solved ? opponent.guessCount : null,
          word: room.word,
        });
      });

      // Clean up room after delay
      setTimeout(() => { delete rooms[roomCode]; }, 30000);
    }
  });

  socket.on('disconnect', () => {
    const roomCode = socket.roomCode;
    if (roomCode && rooms[roomCode]) {
      socket.to(roomCode).emit('room:opponent_left');
      delete rooms[roomCode];
    }
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Wordle Duel server running on port ${PORT}`);
});
