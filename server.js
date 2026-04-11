const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const ALLOWED_ORIGIN = "https://aarondenuto.github.io";

const io = new Server(server, {
  cors: { origin: ALLOWED_ORIGIN, methods: ["GET", "POST"] }
});

app.get("/", (req, res) => res.send("Have You Ever — server running"));

// ── QUESTIONS ─────────────────────────────────────────────────────────────────
const questions = [
  { n: 1,   q: "Held hands romantically?" },
  { n: 2,   q: "Been on a date?" },
  { n: 3,   q: "Been in a relationship?" },
  { n: 4,   q: "Danced without leaving room for Jesus?" },
  { n: 5,   q: "Kissed a non-family member?" },
  { n: 6,   q: "Kissed a non-family member on the lips?" },
  { n: 7,   q: "French kissed?" },
  { n: 8,   q: "French kissed in public?" },
  { n: 9,   q: "Kissed on the neck?" },
  { n: 10,  q: "Kissed horizontally?" },
  { n: 11,  q: "Given or received a hickey?" },
  { n: 12,  q: "Kissed or been kissed on the breast?" },
  { n: 13,  q: "Kissed someone below the belt?" },
  { n: 14,  q: "Kissed for more than two hours consecutively?" },
  { n: 15,  q: "Played a game involving stripping?" },
  { n: 16,  q: "Seen or been seen by another person in a sensual context?" },
  { n: 17,  q: "Masturbated?" },
  { n: 18,  q: "Masturbated to a picture or video?" },
  { n: 19,  q: "Masturbated while someone else was in the room?" },
  { n: 20,  q: "Been caught masturbating?" },
  { n: 21,  q: "Masturbated with an inanimate object?" },
  { n: 22,  q: "Seen or read pornographic material?" },
  { n: 23,  q: "Massaged or been massaged sensually?" },
  { n: 24,  q: "Gone through the motions of intercourse while fully dressed?" },
  { n: 25,  q: "Undressed or been undressed by a MPS?" },
  { n: 26,  q: "Showered with a MPS?" },
  { n: 27,  q: "Fondled or had your butt cheeks fondled?" },
  { n: 28,  q: "Fondled or had your breasts fondled?" },
  { n: 29,  q: "Fondled or had your genitals fondled?" },
  { n: 30,  q: 'Had or given "blue balls"?' },
  { n: 31,  q: "Had an orgasm due to someone else's manipulation?" },
  { n: 32,  q: "Sent a sexually explicit text or instant message?" },
  { n: 33,  q: "Sent or received sexually explicit photographs?" },
  { n: 34,  q: "Engaged in sexually explicit activity over video chat?" },
  { n: 35,  q: "Cheated on a significant other during a relationship?" },
  { n: 36,  q: "Purchased contraceptives?" },
  { n: 37,  q: "Gave oral sex?" },
  { n: 38,  q: "Received oral sex?" },
  { n: 39,  q: "Ingested someone else's genital secretion?" },
  { n: 40,  q: "Used a sex toy with a partner?" },
  { n: 41,  q: "Spent the night with a MPS?" },
  { n: 42,  q: "Been walked in on while engaging in a sexual act?" },
  { n: 43,  q: "Kicked a roommate out to commit a sexual act?" },
  { n: 44,  q: "Ingested alcohol in a non-religious context?" },
  { n: 45,  q: "Played a drinking game?" },
  { n: 46,  q: "Been drunk?" },
  { n: 47,  q: "Faked sobriety to parents or teachers?" },
  { n: 48,  q: "Had severe memory loss due to alcohol?" },
  { n: 49,  q: "Used tobacco?" },
  { n: 50,  q: "Used marijuana?" },
  { n: 51,  q: "Used a drug stronger than marijuana?" },
  { n: 52,  q: "Used methamphetamine, crack cocaine, PCP, horse tranquilizers or heroin?" },
  { n: 53,  q: "Been sent to the office of a principal, dean or judicial affairs representative for a disciplinary infraction?" },
  { n: 54,  q: "Been put on disciplinary probation or suspended?" },
  { n: 55,  q: "Urinated in public?" },
  { n: 56,  q: "Gone skinny-dipping?" },
  { n: 57,  q: "Gone streaking?" },
  { n: 58,  q: "Seen a stripper?" },
  { n: 59,  q: "Had the police called on you?" },
  { n: 60,  q: "Run from the police?" },
  { n: 61,  q: "Had the police question you?" },
  { n: 62,  q: "Had the police handcuff you?" },
  { n: 63,  q: "Been arrested?" },
  { n: 64,  q: "Been convicted of a crime?" },
  { n: 65,  q: "Been convicted of a felony?" },
  { n: 66,  q: "Committed an act of vandalism?" },
  { n: 67,  q: "Had sexual intercourse?" },
  { n: 68,  q: "Had sexual intercourse three or more times in one night?" },
  { n: 69,  q: "?" },
  { n: 70,  q: "Had sexual intercourse 10 or more times?" },
  { n: 71,  q: "Had sexual intercourse in four or more positions?" },
  { n: 72,  q: "Had sexual intercourse with a stranger or person you met within 24 hours?" },
  { n: 73,  q: "Had sexual intercourse in a motor vehicle?" },
  { n: 74,  q: "Had sexual intercourse outdoors?" },
  { n: 75,  q: "Had sexual intercourse in public?" },
  { n: 76,  q: "Had sexual intercourse in a swimming pool or hot tub?" },
  { n: 77,  q: "Had sexual intercourse in a bed not belonging to you or your partner?" },
  { n: 78,  q: "Had sexual intercourse while you or your partner's parents were in the same home?" },
  { n: 79,  q: "Had sexual intercourse with non-participating third party in the same room?" },
  { n: 80,  q: "Joined the mile high club?" },
  { n: 81,  q: "Participated in a 'booty call' with a partner whom you were not in a relationship with?" },
  { n: 82,  q: "Traveled 100 or more miles for the primary purpose of sexual intercourse?" },
  { n: 83,  q: "Had sexual intercourse with a partner with a 3 or more year age difference?" },
  { n: 84,  q: "Had sexual intercourse with a virgin?" },
  { n: 85,  q: "Had sexual intercourse without a condom?" },
  { n: 86,  q: "Had a STI test due to reasonable suspicion?" },
  { n: 87,  q: "Had a STI?" },
  { n: 88,  q: "Had a threesome?" },
  { n: 89,  q: "Attended an orgy?" },
  { n: 90,  q: "Had two or more distinct acts of sexual intercourse with two or more people within 24 hours?" },
  { n: 91,  q: "Had sexual intercourse with five or more partners?" },
  { n: 92,  q: "Been photographed or filmed during sexual intercourse by yourself or others?" },
  { n: 93,  q: "Had period sex?" },
  { n: 94,  q: "Had anal sex?" },
  { n: 95,  q: "Had a pregnancy scare?" },
  { n: 96,  q: "Impregnated someone or been impregnated?" },
  { n: 97,  q: "Paid or been paid for a sexual act?" },
  { n: 98,  q: "Committed an act of voyeurism?" },
  { n: 99,  q: "Committed an act of incest?" },
  { n: 100, q: "Engaged in bestiality?" }
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── ROOM STATE ────────────────────────────────────────────────────────────────
// players: { id, name, isHost, vote, connected, yesCount }
const rooms = {};

// socket.id → roomId (for fast disconnect lookup)
const socketRoom = {};

function generateRoomId() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  let id = "";
  for (let i = 0; i < 4; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return rooms[id] ? generateRoomId() : id;
}

function getPlayersPayload(room) {
  return room.players.map(p => ({
    id: p.id, name: p.name, isHost: p.isHost, connected: p.connected
  }));
}

function votedCount(room) {
  return room.players.filter(p => p.vote !== null).length;
}

function allVoted(room) {
  return room.players.length > 0 && room.players.every(p => p.vote !== null);
}

function broadcastVoteCount(roomId) {
  const room = rooms[roomId];
  if (!room) return;
  io.to(roomId).emit("vote_count", {
    voted: votedCount(room),
    total: room.players.length
  });
}

function resolveRound(roomId) {
  const room = rooms[roomId];
  const yes = room.players.filter(p => p.vote === "yes").length;
  const total = room.players.length;
  const isLast = room.questionIndex >= room.queue.length - 1;
  const q = room.queue[room.questionIndex];
  // accumulate per-player yes counts
  room.players.forEach(p => { if (p.vote === "yes") p.yesCount++; });
  room.results.push({ question: `${q.n}: ${q.q}`, yes, total });
  room.state = "result";
  io.to(roomId).emit("round_result", { yes, total, isLast });
}

function advanceToQuestion(roomId) {
  const room = rooms[roomId];
  room.state = "question";
  room.players.forEach(p => p.vote = null);
  const q = room.queue[room.questionIndex];
  io.to(roomId).emit("new_question", {
    question: `${q.n}: ${q.q}`,
    index: room.questionIndex,
    total: room.queue.length
  });
  broadcastVoteCount(roomId);
}

function promoteNewHost(room) {
  // Find first connected player; fall back to any player
  const next = room.players.find(p => p.connected) || room.players[0];
  if (!next) return;
  room.players.forEach(p => p.isHost = false);
  next.isHost = true;
  room.hostId = next.id;
}

// ── SOCKET EVENTS ─────────────────────────────────────────────────────────────
io.on("connection", (socket) => {
  console.log("connect", socket.id);

  socket.on("create_room", ({ name }) => {
    if (!name) return;
    const roomId = generateRoomId();
    rooms[roomId] = {
      hostId: socket.id,
      players: [{ id: socket.id, name: name.slice(0, 20), isHost: true, vote: null, connected: true, yesCount: 0 }],
      questionIndex: 0,
      queue: [],
      randomOrder: false,
      state: "lobby",
      results: []
    };
    socketRoom[socket.id] = roomId;
    socket.join(roomId);
    socket.emit("room_created", { roomId });
    io.to(roomId).emit("room_update", { players: getPlayersPayload(rooms[roomId]) });
  });

  socket.on("join_room", ({ name, roomId }) => {
    const room = rooms[roomId];
    if (!room) return socket.emit("error", { message: "Room not found" });
    if (room.state === "over") return socket.emit("error", { message: "Game is already over" });
    if (room.players.length >= 20) return socket.emit("error", { message: "Room is full" });

    room.players.push({ id: socket.id, name: name.slice(0, 20), isHost: false, vote: null, connected: true, yesCount: 0 });
    socketRoom[socket.id] = roomId;
    socket.join(roomId);
    io.to(roomId).emit("room_update", { players: getPlayersPayload(room) });

    if (room.state === "lobby") {
      socket.emit("room_joined", { roomId });
    } else {
      const lastResult = room.state === "result" && room.results.length > 0
        ? { yes: room.results[room.results.length - 1].yes, total: room.results[room.results.length - 1].total, isLast: room.questionIndex >= room.queue.length - 1 }
        : null;
      const jq = room.queue[room.questionIndex];
      socket.emit("joined_midgame", {
        roomId,
        questionIndex: room.questionIndex,
        question: `${jq.n}: ${jq.q}`,
        total: room.queue.length,
        state: room.state,
        lastResult
      });
      // mid-game joiner counts as not-yet-voted; broadcast updated count
      broadcastVoteCount(roomId);
      // if they joined during "question" and everyone else already voted, resolve
      if (room.state === "question" && allVoted(room)) resolveRound(roomId);
    }
  });

  socket.on("leave_room", ({ roomId }) => {
    handleLeave(socket, roomId, true);
  });

  socket.on("start_game", ({ roomId, randomOrder }) => {
    const room = rooms[roomId];
    if (!room || room.hostId !== socket.id) return;
    room.randomOrder = !!randomOrder;
    room.queue = randomOrder ? shuffle(questions) : [...questions];
    room.state = "question";
    room.questionIndex = 0;
    room.players.forEach(p => { p.vote = null; p.yesCount = 0; });
    io.to(roomId).emit("game_started");
    advanceToQuestion(roomId);
  });

  socket.on("submit_vote", ({ roomId, vote }) => {
    const room = rooms[roomId];
    if (!room || room.state !== "question") return;
    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;
    // allow toggling: if same vote, deselect (set null); if different or null, set it
    if (player.vote === vote) {
      player.vote = null;
    } else {
      player.vote = vote;
    }
    broadcastVoteCount(roomId);
    if (allVoted(room)) resolveRound(roomId);
  });

  socket.on("skip_question", ({ roomId }) => {
    const room = rooms[roomId];
    if (!room || room.hostId !== socket.id) return;
    if (room.state !== "question" && room.state !== "result") return;
    room.questionIndex++;
    if (room.questionIndex >= room.queue.length) {
      room.state = "over";
      io.to(roomId).emit("game_over", { results: room.results, scores: buildScores(room) });
    } else {
      advanceToQuestion(roomId);
    }
  });

  socket.on("next_round", ({ roomId }) => {
    const room = rooms[roomId];
    if (!room || room.hostId !== socket.id || room.state !== "result") return;
    room.questionIndex++;
    if (room.questionIndex >= room.queue.length) {
      room.state = "over";
      io.to(roomId).emit("game_over", { results: room.results, scores: buildScores(room) });
    } else {
      advanceToQuestion(roomId);
    }
  });

  socket.on("disconnect", () => {
    console.log("disconnect", socket.id);
    const roomId = socketRoom[socket.id];
    if (roomId) handleLeave(socket, roomId, false);
  });
});

function buildScores(room) {
  return room.players
    .map(p => ({ name: p.name, yesCount: p.yesCount, score: 100 - p.yesCount }))
    .sort((a, b) => b.score - a.score);
}

function handleLeave(socket, roomId, permanent) {
  const room = rooms[roomId];
  if (!room) return;
  delete socketRoom[socket.id];

  if (permanent) {
    // Full removal
    socket.leave(roomId);
    const idx = room.players.findIndex(p => p.id === socket.id);
    if (idx === -1) return;
    const wasHost = room.players[idx].isHost;
    room.players.splice(idx, 1);
    if (room.players.length === 0) { delete rooms[roomId]; return; }
    if (wasHost) promoteNewHost(room);
    io.to(roomId).emit("room_update", { players: getPlayersPayload(room) });
    if (room.state === "question" && allVoted(room)) resolveRound(roomId);
  } else {
    // Disconnected but keep in room — mark offline, possibly promote host
    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;
    player.connected = false;
    const wasHost = player.isHost;
    if (wasHost) {
      player.isHost = false;
      promoteNewHost(room);
    }
    io.to(roomId).emit("room_update", { players: getPlayersPayload(room) });
    // If they hadn't voted yet and everyone else has, treat as abstain so game doesn't stall
    if (room.state === "question" && player.vote === null) {
      player.vote = "abstain";
      broadcastVoteCount(roomId);
      if (allVoted(room)) resolveRound(roomId);
    }
  }
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server on port ${PORT}`));
