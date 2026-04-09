const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

// ── CORS ─────────────────────────────────────────────
const ALLOWED_ORIGIN = "https://aarondenuto.github.io";

const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGIN,
    methods: ["GET", "POST"]
  }
});

app.get("/", (req, res) => res.send("Have You Ever — server running"));

// ── QUESTIONS ────────────────────────────────────────
const questions = [
"Have you ever held hands romantically?",
"Have you ever been on a date?",
"Have you ever been in a relationship?",
"Have you ever danced without leaving room for Jesus?",
"Have you ever kissed a non-family member?",
"Have you ever kissed a non-family member on the lips?",
"Have you ever french kissed?",
"Have you ever french kissed in public?",
"Have you ever kissed on the neck?",
"Have you ever kissed horizontally?",
"Have you ever given or received a hickey?",
"Have you ever kissed or been kissed on the breast?",
"Have you ever kissed someone below the belt?",
"Have you ever kissed for more than two hours consecutively?",
"Have you ever played a game involving stripping?",
"Have you ever been seen in a sensual context?",
"Have you ever masturbated?",
"Have you ever masturbated to a picture or video?",
"Have you ever masturbated while someone else was in the room?",
"Have you ever been caught masturbating?",
"Have you ever masturbated with an object?",
"Have you ever seen pornographic material?",
"Have you ever been massaged sensually?",
"Have you ever simulated intercourse while clothed?",
"Have you ever undressed someone?",
"Have you ever showered with someone?",
"Have you ever fondled or been fondled?",
"Have you ever had an orgasm due to someone else?",
"Have you ever sent a sexually explicit text?",
"Have you ever sent or received explicit photos?",
"Have you ever done explicit video chat?",
"Have you ever cheated on a partner?",
"Have you ever purchased contraceptives?",
"Have you ever given oral sex?",
"Have you ever received oral sex?",
"Have you ever used a sex toy with a partner?",
"Have you ever spent the night with someone?",
"Have you ever been walked in on?",
"Have you ever drank alcohol?",
"Have you ever played a drinking game?",
"Have you ever been drunk?",
"Have you ever faked sobriety?",
"Have you ever had memory loss due to alcohol?",
"Have you ever used tobacco?",
"Have you ever used marijuana?",
"Have you ever used a stronger drug?",
"Have you ever been sent to the principal?",
"Have you ever been suspended?",
"Have you ever urinated in public?",
"Have you ever gone skinny dipping?",
"Have you ever gone streaking?",
"Have you ever seen a stripper?",
"Have you ever had police called on you?",
"Have you ever run from police?",
"Have you ever been questioned by police?",
"Have you ever been handcuffed?",
"Have you ever been arrested?",
"Have you ever been convicted of a crime?",
"Have you ever committed vandalism?",
"Have you ever had sexual intercourse?",
"Have you ever had sex 3+ times in one night?",
"Have you ever had sex 10+ times?",
"Have you ever had sex in multiple positions?",
"Have you ever had sex with a stranger?",
"Have you ever had sex in a car?",
"Have you ever had sex outdoors?",
"Have you ever had sex in public?",
"Have you ever had sex in a pool or hot tub?",
"Have you ever had sex in someone else's bed?",
"Have you ever had sex with parents home?",
"Have you ever had sex with someone else in the room?",
"Have you ever joined the mile high club?",
"Have you ever had a booty call?",
"Have you ever traveled for sex?",
"Have you ever had sex with an age gap of 3+ years?",
"Have you ever had sex with a virgin?",
"Have you ever had sex without protection?",
"Have you ever taken an STI test?",
"Have you ever had an STI?",
"Have you ever had a threesome?",
"Have you ever attended an orgy?",
"Have you ever had multiple partners in 24 hours?",
"Have you ever had 5+ partners?",
"Have you ever been filmed during sex?",
"Have you ever had period sex?",
"Have you ever had anal sex?",
"Have you ever had a pregnancy scare?",
"Have you ever impregnated or been impregnated?",
"Have you ever paid or been paid for sex?",
"Have you ever committed voyeurism?",
"Have you ever committed incest?",
"Have you ever engaged in bestiality?"
];

// ── ROOM STATE ───────────────────────────────────────
const rooms = {};

function generateRoomId() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let id = "";
  for (let i = 0; i < 4; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return rooms[id] ? generateRoomId() : id;
}

function getRoomPlayers(room) {
  return room.players.map(p => ({ id: p.id, name: p.name, isHost: p.isHost }));
}

function allVoted(room) {
  return room.players.length > 0 && room.players.every(p => p.vote !== null);
}

// ── SOCKET EVENTS ────────────────────────────────────
io.on("connection", (socket) => {

  // CREATE ROOM
  socket.on("create_room", ({ name }) => {
    if (!name) return;

    const roomId = generateRoomId();

    rooms[roomId] = {
      hostId: socket.id,
      players: [{ id: socket.id, name: name.slice(0,20), isHost: true, vote: null }],
      questionIndex: 0,
      state: "lobby",
      results: []
    };

    socket.join(roomId);
    socket.emit("room_created", { roomId });
    io.to(roomId).emit("room_update", { players: getRoomPlayers(rooms[roomId]) });
  });

  // JOIN ROOM (now allowed mid-game)
  socket.on("join_room", ({ name, roomId }) => {
    const room = rooms[roomId];
    if (!room) return socket.emit("error", { message: "Room not found" });
    if (room.players.length >= 20) return socket.emit("error", { message: "Room is full" });

    room.players.push({ id: socket.id, name: name.slice(0,20), isHost: false, vote: null });

    socket.join(roomId);
    socket.emit("room_joined", { roomId });

    io.to(roomId).emit("room_update", { players: getRoomPlayers(room) });

    // sync current question if mid-game
    if (room.state === "question") {
      socket.emit("new_question", {
        question: questions[room.questionIndex],
        index: room.questionIndex,
        total: questions.length
      });
    }
  });

  // START GAME
  socket.on("start_game", ({ roomId }) => {
    const room = rooms[roomId];
    if (!room || room.hostId !== socket.id) return;

    room.state = "question";
    room.questionIndex = 0;
    room.players.forEach(p => p.vote = null);

    io.to(roomId).emit("game_started");
    io.to(roomId).emit("new_question", {
      question: questions[0],
      index: 0,
      total: questions.length
    });
  });

  // VOTE
  socket.on("submit_vote", ({ roomId, vote }) => {
    const room = rooms[roomId];
    if (!room || room.state !== "question") return;

    const player = room.players.find(p => p.id === socket.id);
    if (!player || player.vote !== null) return;

    player.vote = vote;

    if (allVoted(room)) {
      const yes = room.players.filter(p => p.vote === "yes").length;
      const total = room.players.length;
      const isLast = room.questionIndex >= questions.length - 1;

      room.results.push({ question: questions[room.questionIndex], yes, total });
      room.state = "result";

      io.to(roomId).emit("round_result", { yes, total, isLast });
    }
  });

  // NEXT
  socket.on("next_round", ({ roomId }) => {
    const room = rooms[roomId];
    if (!room || room.hostId !== socket.id || room.state !== "result") return;

    advance(roomId);
  });

  // SKIP (NEW)
  socket.on("skip_question", ({ roomId }) => {
    const room = rooms[roomId];
    if (!room || room.hostId !== socket.id) return;

    advance(roomId, true);
  });

  function advance(roomId, skipped = false) {
    const room = rooms[roomId];

    if (!skipped) {
      const yes = room.players.filter(p => p.vote === "yes").length;
      const total = room.players.length;
      room.results.push({ question: questions[room.questionIndex], yes, total });
    }

    room.questionIndex++;

    if (room.questionIndex >= questions.length) {
      room.state = "over";
      io.to(roomId).emit("game_over", { results: room.results });
    } else {
      room.state = "question";
      room.players.forEach(p => p.vote = null);

      io.to(roomId).emit("new_question", {
        question: questions[room.questionIndex],
        index: room.questionIndex,
        total: questions.length
      });
    }
  }

  // DISCONNECT
  socket.on("disconnect", () => {
    for (const [roomId, room] of Object.entries(rooms)) {
      const idx = room.players.findIndex(p => p.id === socket.id);
      if (idx === -1) continue;

      room.players.splice(idx, 1);

      if (room.players.length === 0) {
        delete rooms[roomId];
        break;
      }

      if (room.hostId === socket.id) {
        room.players[0].isHost = true;
        room.hostId = room.players[0].id;
      }

      io.to(roomId).emit("room_update", { players: getRoomPlayers(room) });

      if (room.state === "question" && allVoted(room)) {
        const yes = room.players.filter(p => p.vote === "yes").length;
        const total = room.players.length;
        const isLast = room.questionIndex >= questions.length - 1;

        room.results.push({ question: questions[room.questionIndex], yes, total });
        room.state = "result";

        io.to(roomId).emit("round_result", { yes, total, isLast });
      }

      break;
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT);
