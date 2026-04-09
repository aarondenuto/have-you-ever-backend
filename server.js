const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

// ── CORS ─────────────────────────────────────────────────────────────────────
// Replace with your GitHub Pages URL after deploying
const ALLOWED_ORIGIN = "https://aarondenuto.github.io";

const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGIN,
    methods: ["GET", "POST"]
  }
});

app.get("/", (req, res) => res.send("Have You Ever — server running"));

// ── QUESTIONS ────────────────────────────────────────────────────────────────
const questions = [
  "Held hands with someone romantically?",
  "Kissed someone on the first date?",
  "Pulled an all-nighter studying?",
  "Lied to get out of plans?",
  "Cried at a movie?",
  "Drunk-texted someone you regret?",
  "Ghosted someone?",
  "Eaten food that fell on the floor?",
  "Cheated on a test?",
  "Stayed up past 4 AM for no reason?",
  "Pretended not to see someone in public?",
  "Told someone you loved them first?",
  "Quit something before finishing it?",
  "Made up a story to impress someone?",
  "Snuck out of the house?"
];

// ── ROOM STATE ────────────────────────────────────────────────────────────────
// {
//   ABCD: {
//     hostId: "socket1",
//     players: [{ id, name, isHost, vote }],
//     questionIndex: 0,
//     state: "lobby" | "question" | "result" | "over",
//     results: [{ question, yes, total }]
//   }
// }
const rooms = {};

function generateRoomId() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
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

// ── SOCKET EVENTS ─────────────────────────────────────────────────────────────
io.on("connection", (socket) => {
  console.log("connect", socket.id);

  // CREATE ROOM
  socket.on("create_room", ({ name }) => {
    if (!name) return;
    const roomId = generateRoomId();
    rooms[roomId] = {
      hostId: socket.id,
      players: [{ id: socket.id, name: name.slice(0, 20), isHost: true, vote: null }],
      questionIndex: 0,
      state: "lobby",
      results: []
    };
    socket.join(roomId);
    socket.emit("room_created", { roomId });
    io.to(roomId).emit("room_update", { players: getRoomPlayers(rooms[roomId]) });
  });

  // JOIN ROOM
  socket.on("join_room", ({ name, roomId }) => {
    const room = rooms[roomId];
    if (!room) return socket.emit("error", { message: "Room not found" });
    if (room.state !== "lobby") return socket.emit("error", { message: "Game already in progress" });
    if (room.players.length >= 20) return socket.emit("error", { message: "Room is full" });

    room.players.push({ id: socket.id, name: name.slice(0, 20), isHost: false, vote: null });
    socket.join(roomId);
    socket.emit("room_joined", { roomId });
    io.to(roomId).emit("room_update", { players: getRoomPlayers(room) });
  });

  // START GAME
  socket.on("start_game", ({ roomId }) => {
    const room = rooms[roomId];
    if (!room || room.hostId !== socket.id) return;
    if (room.players.length < 1) return socket.emit("error", { message: "Need at least 1 player" });

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

  // SUBMIT VOTE
  socket.on("submit_vote", ({ roomId, vote }) => {
    const room = rooms[roomId];
    if (!room || room.state !== "question") return;
    const player = room.players.find(p => p.id === socket.id);
    if (!player || player.vote !== null) return;
    if (vote !== "yes" && vote !== "no") return;

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

  // NEXT ROUND
  socket.on("next_round", ({ roomId }) => {
    const room = rooms[roomId];
    if (!room || room.hostId !== socket.id || room.state !== "result") return;

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
  });

  // DISCONNECT
  socket.on("disconnect", () => {
    console.log("disconnect", socket.id);

    for (const [roomId, room] of Object.entries(rooms)) {
      const idx = room.players.findIndex(p => p.id === socket.id);
      if (idx === -1) continue;

      room.players.splice(idx, 1);

      if (room.players.length === 0) {
        delete rooms[roomId];
        break;
      }

      // If host left, promote next player
      if (room.hostId === socket.id) {
        room.players[0].isHost = true;
        room.hostId = room.players[0].id;
      }

      io.to(roomId).emit("room_update", { players: getRoomPlayers(room) });

      // If mid-game and all remaining players voted, resolve
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
server.listen(PORT, () => console.log(`Server on port ${PORT}`));
