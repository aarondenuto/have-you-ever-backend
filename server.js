<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Have You Ever — Aaron DeNuto</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&display=block">
<script src="https://cdn.socket.io/4.7.5/socket.io.min.js"></script>

<style>
  :root {
    --bg: #0a0a0a;
    --surface: #111;
    --border: #222;
    --accent: #e8ff47;
    --accent2: #ff4d6d;
    --green: #3ddc84;
    --red: #ff4d6d;
    --text: #f0f0f0;
    --muted: #555;
    --radius: 4px;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  html, body { height: 100%; overscroll-behavior: none; }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'DM Mono', monospace;
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
    opacity: 0;
    transition: opacity 0.15s ease;
  }
  body.fonts-ready { opacity: 1; }

  body::before {
    content: "";
    position: fixed;
    inset: 0;
    background:
      radial-gradient(circle at 20% 20%, rgba(232,255,71,0.04) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(255,77,109,0.04) 0%, transparent 50%);
    pointer-events: none;
  }

  /* Screens that overflow naturally scroll; fixed-height screens stay locked */
  .screen { display: none; width: 100%; max-width: 480px; }
  .screen.active { display: flex; flex-direction: column; gap: 16px; }

  /* Game + lobby don't need scroll — content fits on one screen */
  #screen-game.active, #screen-lobby.active {
    max-height: 100dvh;
    overflow: hidden;
  }

  /* ── TYPOGRAPHY ── */
  .logo {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(3rem, 12vw, 5.5rem);
    letter-spacing: 0.05em;
    line-height: 1;
    color: var(--accent);
  }
  .logo span { color: var(--accent2); }

  .tagline {
    font-size: 11px;
    letter-spacing: 0.2em;
    color: var(--muted);
    text-transform: uppercase;
    margin-top: -8px;
  }

  /* ── CARDS / INPUTS ── */
  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .card-label {
    font-size: 10px;
    letter-spacing: 0.25em;
    color: var(--muted);
    text-transform: uppercase;
  }

  input {
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    color: var(--text);
    font-family: 'DM Mono', monospace;
    font-size: 14px;
    padding: 12px 14px;
    outline: none;
    transition: border-color 0.2s;
    width: 100%;
    letter-spacing: 0.05em;
  }
  input::placeholder { color: var(--muted); }
  input:focus { border-color: var(--accent); }

  /* ── BUTTONS ── */
  .btn {
    background: var(--accent);
    border: none;
    border-radius: var(--radius);
    color: #0a0a0a;
    cursor: pointer;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 18px;
    letter-spacing: 0.12em;
    padding: 14px 20px;
    transition: all 0.15s ease;
    width: 100%;
  }
  .btn:hover { background: #f5ff70; transform: translateY(-1px); }
  .btn:active { transform: translateY(0); }
  .btn:disabled { opacity: 0.5; cursor: default; transform: none; }

  .btn-ghost {
    background: transparent;
    border: 1px solid var(--border);
    color: var(--text);
  }
  .btn-ghost:hover { background: #1a1a1a; }

  .btn-red { background: var(--accent2); color: #fff; }
  .btn-red:hover { background: #ff6b84; }

  .btn-sm {
    background: transparent;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    color: var(--muted);
    cursor: pointer;
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.1em;
    padding: 8px 14px;
    transition: all 0.15s ease;
  }
  .btn-sm:hover { color: var(--text); border-color: #444; }

  /* Touch active states for vote buttons — give tactile feedback on mobile */
  @media (hover: none) {
    .vote-half:active.yes { background: rgba(61,220,132,0.18) !important; border-color: var(--green) !important; }
    .vote-half:active.no  { background: rgba(255,77,109,0.18) !important; border-color: var(--red) !important; }
    /* Suppress lingering hover styles that get stuck after tap */
    .vote-half.yes:hover:not(:active) { background: var(--surface) !important; border-color: var(--border) !important; }
    .vote-half.no:hover:not(:active)  { background: var(--surface) !important; border-color: var(--border) !important; }
    .btn:hover:not(:active)      { background: var(--accent) !important; transform: none !important; }
    .btn-ghost:hover:not(:active){ background: transparent !important; }
    .btn-sm:hover:not(:active)   { color: var(--muted) !important; border-color: var(--border) !important; }
  }

  .host-actions { display: flex; gap: 8px; }
  .host-actions .btn { flex: 1; }

  /* ── LOBBY ── */
  .room-id-display {
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 16px;
    text-align: center;
  }
  .room-id-display .code {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 3rem;
    letter-spacing: 0.3em;
    color: var(--accent);
  }

  /* ── PLAYER LIST ── */
  .player-list { display: flex; flex-direction: column; gap: 6px; }

  .player-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    font-size: 13px;
  }

  .player-dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    flex-shrink: 0;
    transition: background 0.3s;
  }
  .player-dot.online  { background: var(--green); }
  .player-dot.offline { background: var(--muted); }

  .host-badge {
    margin-left: auto;
    font-size: 9px;
    letter-spacing: 0.15em;
    color: var(--accent2);
    text-transform: uppercase;
  }

  /* ── TOGGLE ── */
  .toggle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 14px;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    font-size: 12px;
    letter-spacing: 0.08em;
    color: var(--muted);
  }

  .toggle-switch {
    position: relative;
    width: 40px; height: 22px;
    flex-shrink: 0;
  }
  .toggle-switch input { opacity: 0; width: 0; height: 0; }
  .toggle-track {
    position: absolute;
    inset: 0;
    background: var(--border);
    border-radius: 22px;
    cursor: pointer;
    transition: background 0.2s;
  }
  .toggle-track::before {
    content: "";
    position: absolute;
    left: 3px; top: 3px;
    width: 16px; height: 16px;
    background: var(--muted);
    border-radius: 50%;
    transition: transform 0.2s, background 0.2s;
  }
  .toggle-switch input:checked + .toggle-track { background: rgba(232,255,71,0.2); }
  .toggle-switch input:checked + .toggle-track::before { transform: translateX(18px); background: var(--accent); }

  /* ── GAME BANNER ── */
  .game-banner {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 11px;
    letter-spacing: 0.35em;
    color: var(--muted);
    text-transform: uppercase;
    text-align: center;
    padding-bottom: 4px;
    border-bottom: 1px solid var(--border);
  }
  .game-banner span { color: var(--accent); }

  .question-num {
    font-size: 11px;
    letter-spacing: 0.2em;
    color: var(--muted);
    text-transform: uppercase;
  }

  .question-text {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(1.8rem, 6vw, 2.8rem);
    line-height: 1.1;
    letter-spacing: 0.04em;
  }

  /* ── VOTE BUTTONS ── */
  .vote-area {
    height: 100px;
    border-radius: var(--radius);
    overflow: hidden;
    margin-top: 4px;
  }

  .vote-track {
    width: 100%; height: 100%;
    display: flex;
  }

  .vote-half {
    flex: 1;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 32px;
    letter-spacing: 0.12em;
    border: 2px solid var(--border);
    transition: flex 0.35s cubic-bezier(0.4, 0, 0.2, 1),
                background 0.2s, color 0.2s, border-color 0.2s;
    user-select: none;
    overflow: hidden;
    white-space: nowrap;
    -webkit-tap-highlight-color: transparent;
  }

  .vote-half.yes { background: var(--surface); color: var(--green); border-color: var(--border); }
  .vote-half.no  { background: var(--surface); color: var(--red);   border-color: var(--border); }

  .vote-half.yes:hover { background: rgba(61,220,132,0.08);  border-color: var(--green); }
  .vote-half.no:hover  { background: rgba(255,77,109,0.08);  border-color: var(--red); }

  .vote-track.voted-yes .vote-half.yes { flex: 2; background: rgba(61,220,132,0.18); border-color: var(--green); }
  .vote-track.voted-yes .vote-half.no  { flex: 0; }
  .vote-track.voted-no  .vote-half.no  { flex: 2; background: rgba(255,77,109,0.18); border-color: var(--red); }
  .vote-track.voted-no  .vote-half.yes { flex: 0; }

  .vote-area.locked .vote-half { cursor: default; pointer-events: none; }

  /* ── VOTE COUNT INDICATOR ── */
  .vote-progress {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 11px;
    color: var(--muted);
    letter-spacing: 0.1em;
  }
  .vote-pip-row { display: flex; gap: 4px; flex-wrap: wrap; }
  .vote-pip {
    width: 8px; height: 8px;
    border-radius: 50%;
    background: var(--border);
    transition: background 0.2s;
  }
  .vote-pip.done { background: var(--accent); }

  /* ── RESULT SECTION ── */
  .result-block {
    display: flex;
    flex-direction: column;
    gap: 10px;
    opacity: 0;
    transform: translateY(6px);
    transition: opacity 0.25s ease, transform 0.25s ease;
    pointer-events: none;
  }
  .result-block.visible {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
  }

  .result-bar-wrap {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 20px;
  }
  .result-label {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: var(--muted);
    margin-bottom: 10px;
    letter-spacing: 0.1em;
  }
  .result-label .big {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 2.4rem;
    color: var(--accent);
    line-height: 1;
  }
  .bar-track {
    background: var(--bg);
    border-radius: 2px;
    height: 8px;
    overflow: hidden;
  }
  .bar-fill {
    background: var(--accent);
    height: 100%;
    border-radius: 2px;
    transition: width 0.6s cubic-bezier(0.25, 1, 0.5, 1);
  }

  .waiting-text {
    font-size: 12px;
    color: var(--muted);
    letter-spacing: 0.1em;
    text-align: center;
    padding: 10px 0;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }
  .pulsing { animation: pulse 1.5s ease infinite; }

  /* ── FINAL SCREEN ── */
  .final-list { display: flex; flex-direction: column; gap: 8px; }

  .score-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    font-size: 13px;
  }
  .score-rank {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 1.4rem;
    color: var(--muted);
    width: 28px;
    text-align: right;
    flex-shrink: 0;
  }
  .score-rank.gold   { color: #ffd700; }
  .score-rank.silver { color: #c0c0c0; }
  .score-rank.bronze { color: #cd7f32; }
  .score-name { flex: 1; }
  .score-val {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 1.8rem;
    color: var(--accent);
  }

  /* ── TABS ── */
  .tab-bar {
    display: flex;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
  }
  .tab-btn {
    flex: 1;
    background: transparent;
    border: none;
    color: var(--muted);
    cursor: pointer;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 16px;
    letter-spacing: 0.12em;
    padding: 12px;
    transition: all 0.15s ease;
  }
  .tab-btn:not(:last-child) { border-right: 1px solid var(--border); }
  .tab-btn.active { background: var(--surface); color: var(--accent); }
  .tab-btn:hover:not(.active) { background: #1a1a1a; color: var(--text); }

  .tab-panel { display: none; flex-direction: column; gap: 8px; }
  .tab-panel.active { display: flex; }

  .q-rank-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    font-size: 12px;
  }
  .q-rank-num {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 1.2rem;
    color: var(--muted);
    width: 24px;
    text-align: right;
    flex-shrink: 0;
  }
  .q-rank-text { flex: 1; line-height: 1.4; color: var(--text); }
  .q-rank-pct {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 1.4rem;
    color: var(--accent);
    flex-shrink: 0;
  }

  /* ── MISC ── */
  .error-msg {
    font-size: 12px;
    color: var(--accent2);
    letter-spacing: 0.05em;
    min-height: 16px;
  }
  .status-bar {
    font-size: 11px;
    color: var(--muted);
    letter-spacing: 0.1em;
    text-align: center;
  }
  .game-player-panel {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 12px 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .game-player-row {
    display: flex; align-items: center; gap: 8px; font-size: 12px;
  }
  .panel-section-label {
    font-size: 9px;
    letter-spacing: 0.2em;
    color: var(--muted);
    text-transform: uppercase;
    padding-top: 6px;
    border-top: 1px solid var(--border);
    margin-top: 2px;
  }
  .spectator-badge {
    margin-left: auto;
    font-size: 9px;
    letter-spacing: 0.15em;
    color: var(--muted);
    text-transform: uppercase;
  }
</style>
</head>
<body>

<!-- ── HOME ── -->
<div class="screen active" id="screen-home">
  <div class="logo">Have<br>You<br><span>Ever</span></div>
  <div class="tagline">Multiplayer · Real-time · Uncensored</div>

  <div class="card">
    <div class="card-label">Create a room</div>
    <input id="host-name" type="text" placeholder="Your name" maxlength="20">
    <button class="btn" onclick="createRoom()">Create Room</button>
  </div>

  <div class="card">
    <div class="card-label">Join a room</div>
    <input id="join-name" type="text" placeholder="Your name" maxlength="20">
    <input id="join-code" type="text" placeholder="Room code" maxlength="4" style="text-transform:uppercase">
    <button class="btn btn-ghost" onclick="joinRoom()">Join Room</button>
  </div>

  <div class="error-msg" id="home-error"></div>
  <div class="status-bar" id="conn-status">Connecting…</div>
</div>

<!-- ── LOBBY ── -->
<div class="screen" id="screen-lobby">
  <div class="logo" style="font-size:2.5rem">Lobby</div>

  <div class="room-id-display">
    <div class="card-label" style="margin-bottom:6px">Room Code</div>
    <div class="code" id="lobby-code">----</div>
  </div>

  <div class="card">
    <div class="card-label">Players <span id="player-count" style="color:var(--accent)">0</span></div>
    <div class="player-list" id="player-list"></div>
  </div>

  <div class="toggle-row" id="order-toggle-row" style="display:none">
    <span>Shuffle</span>
    <label class="toggle-switch">
      <input type="checkbox" id="random-toggle">
      <span class="toggle-track"></span>
    </label>
  </div>

  <button class="btn" id="start-btn" onclick="startGame()" style="display:none">Start Game</button>
  <button class="btn btn-ghost" id="spectate-toggle-btn" onclick="toggleSpectate()" style="display:none">Spectate</button>
  <div class="waiting-text pulsing" id="wait-msg">Waiting for host to start…</div>
  <button class="btn-sm" onclick="leaveRoom()" style="align-self:center;margin-top:4px">Leave Room</button>
  <div class="error-msg" id="lobby-error"></div>
</div>

<!-- ── GAME ── -->
<div class="screen" id="screen-game">
  <div class="game-banner">Have You <span>Ever…</span></div>

  <div class="question-num" id="q-num">Question 1 / 100</div>
  <div class="question-text" id="q-text">Loading…</div>

  <div class="vote-area" id="vote-area">
    <div class="vote-track" id="vote-track">
      <div class="vote-half yes" onclick="vote('yes')">YES</div>
      <div class="vote-half no"  onclick="vote('no')">NO</div>
    </div>
  </div>

  <div class="vote-progress" id="vote-progress">
    <span id="vote-count-text">0/0 answered</span>
    <div class="vote-pip-row" id="vote-pips"></div>
  </div>

  <div class="result-block" id="result-block">
    <div class="result-bar-wrap">
      <div class="result-label">
        <div><div class="big" id="res-pct">0%</div><div>said YES</div></div>
        <div style="text-align:right">
          <div id="res-count" style="font-size:1.5rem;font-family:'Bebas Neue',sans-serif;color:var(--text)">0/0</div>
          <div>players</div>
        </div>
      </div>
      <div class="bar-track"><div class="bar-fill" id="bar-fill" style="width:0%"></div></div>
    </div>

    <div class="host-actions" id="host-next-actions" style="display:none">
      <button class="btn" id="next-btn" onclick="nextRound()" style="display:none">Next Question</button>
      <button class="btn btn-red" id="finish-btn" onclick="nextRound()" style="display:none">See Results</button>
    </div>
    <div class="waiting-text pulsing" id="next-wait" style="display:none">Waiting for host…</div>
  </div>

  <div class="game-player-panel">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2px">
      <div class="card-label">Players</div>
      <div style="font-family:'Bebas Neue',sans-serif;font-size:1.2rem;letter-spacing:0.25em;color:var(--accent)" id="game-room-code"></div>
    </div>
    <div id="game-player-list"></div>
    <!-- Spectator section — hidden when no spectators -->
    <div id="spectator-section" style="display:none">
      <div class="panel-section-label">Spectators</div>
      <div id="game-spectator-list" style="display:flex;flex-direction:column;gap:4px;margin-top:6px"></div>
    </div>
    <!-- Spectate button — shown only to non-host non-spectators during game -->
    <button class="btn-sm" id="game-spectate-btn" onclick="becomeSpectator()" style="display:none;margin-top:4px;align-self:flex-start">Spectate</button>
  </div>

  <div style="display:flex;gap:8px;margin-top:4px;align-items:center;flex-wrap:wrap">
    <button class="btn-sm" id="end-question-btn" onclick="endQuestion()" style="display:none">End Question</button>
    <button class="btn-sm" id="skip-btn" onclick="skipQuestion()" style="display:none">Skip</button>
    <button class="btn-sm" id="end-btn" onclick="endGame()" style="display:none">End Game</button>
    <button class="btn-sm" onclick="leaveRoom()">Leave Room</button>
    <div id="midgame-shuffle-row" style="display:none;align-items:center;gap:8px;margin-left:auto">
      <span style="font-size:11px;color:var(--muted);letter-spacing:0.1em">Shuffle</span>
      <label class="toggle-switch">
        <input type="checkbox" id="midgame-shuffle-toggle" onchange="toggleMidgameShuffle()">
        <span class="toggle-track"></span>
      </label>
    </div>
  </div>
</div>

<!-- ── FINAL ── -->
<div class="screen" id="screen-final">
  <div class="logo" style="font-size:2.5rem">Results</div>

  <div class="tab-bar">
    <button class="tab-btn active" id="tab-scores-btn" onclick="switchTab('scores')">Scores</button>
    <button class="tab-btn" id="tab-questions-btn" onclick="switchTab('questions')">Questions</button>
  </div>

  <div class="tab-panel active" id="tab-scores">
    <div class="final-list" id="final-list"></div>
  </div>

  <div class="tab-panel" id="tab-questions">
    <div class="final-list" id="question-rank-list"></div>
  </div>

  <!-- Play Again panel — always visible on end screen -->
  <div class="card" id="play-again-panel">
    <div class="card-label">Playing Again</div>
    <!-- Names of people who've opted in appear here -->
    <div id="play-again-names" class="player-list"></div>
    <!-- Shown after opting in, while waiting for others -->
    <div class="waiting-text pulsing" id="play-again-wait-msg" style="display:none">Waiting for others to join…</div>
    <div style="display:flex;gap:8px">
      <button class="btn" id="play-again-btn" onclick="optInPlayAgain()" style="flex:1">Play Again</button>
      <button class="btn btn-ghost" id="leave-play-again-btn" onclick="leavePlayAgain()" style="flex:1;display:none">Leave</button>
    </div>
    <button class="btn btn-ghost" onclick="goHome()">Main Menu</button>
  </div>
</div>

<script>
// ── CONFIG ───────────────────────────────────────────────────────────────────
const BACKEND = "https://have-you-ever-backend.onrender.com";

// ── STATE ────────────────────────────────────────────────────────────────────
const socket = io(BACKEND, { transports: ["websocket", "polling"] });

let myName        = "";
let myRoom        = "";
let isHost        = false;
let isSpectator   = false;
let currentVote   = null;
let totalPlayers  = 0;
let gameResults   = [];
let pendingQuestion = null;  // new_question received while tabbed out
let pendingResult  = null;   // round_result received while tabbed out

// ── CONNECTION ───────────────────────────────────────────────────────────────
socket.on("connect", () => {
  document.getElementById("conn-status").textContent = "Connected ✓";
  document.getElementById("conn-status").style.color = "#3ddc84";
  // If we were in a room and got disconnected, try to rejoin
  if (myRoom && myName) {
    socket.emit("rejoin_room", { roomId: myRoom, name: myName, wasSpectator: isSpectator });
  }
});
socket.on("connect_error", () => {
  document.getElementById("conn-status").textContent = "Connection failed — check backend URL";
  document.getElementById("conn-status").style.color = "var(--accent2)";
});
socket.on("disconnect", () => {
  document.getElementById("conn-status").textContent = "Disconnected";
});

// ── ROOM EVENTS ──────────────────────────────────────────────────────────────
socket.on("room_created", ({ roomId }) => {
  myRoom = roomId;
  isHost = true;
  isSpectator = false;
  showLobby();
});

socket.on("room_joined", ({ roomId }) => {
  myRoom = roomId;
  isHost = false;
  isSpectator = false;  // always enter new game as a player
  showLobby();
});

socket.on("joined_midgame", ({ roomId, questionIndex, question, total, state, lastResult }) => {
  myRoom = roomId;
  isHost = false;
  currentVote = null;

  setQuestion(question, questionIndex, total);
  resetVoteUI();
  hideResult();
  document.getElementById("skip-btn").style.display = "none";
  document.getElementById("end-btn").style.display = "none";
  document.getElementById("end-question-btn").style.display = "none";
  document.getElementById("midgame-shuffle-row").style.display = "none";

  if (state === "result" && lastResult) {
    document.getElementById("vote-area").style.display = "none";
    document.getElementById("vote-progress").style.display = "none";
    showResult(lastResult.yes, lastResult.total, lastResult.isLast, false);
    lockVoteArea();
  } else {
    document.getElementById("vote-area").style.display = "";
    document.getElementById("vote-progress").style.display = "flex";
  }

  document.getElementById("game-room-code").textContent = myRoom;
  showScreen("screen-game");
});

socket.on("error", ({ message }) => {
  setError("home-error", message);
  setError("lobby-error", message);
});

socket.on("room_update", ({ players, spectators = [] }) => {
  totalPlayers = players.filter(p => p.connected).length;

  // Lobby player list — show players and spectators together
  const allLobbyRows = [
    ...players.map(p => `
      <div class="player-item">
        <div class="player-dot ${p.connected ? 'online' : 'offline'}"></div>
        <span style="${p.connected ? '' : 'opacity:0.45'}">${p.name}</span>
        ${p.isHost ? '<span class="host-badge">host</span>' : ''}
        ${!p.isHost ? '' : ''}
      </div>`),
    ...spectators.map(s => `
      <div class="player-item">
        <div class="player-dot ${s.connected ? 'online' : 'offline'}"></div>
        <span style="${s.connected ? 'color:var(--muted)' : 'opacity:0.45;color:var(--muted)'}">${s.name}</span>
        <span class="host-badge" style="color:var(--muted)">spectator</span>
      </div>`)
  ];
  document.getElementById("player-count").textContent = players.length;
  document.getElementById("player-list").innerHTML = allLobbyRows.join("");

  // Game player list (players only)
  document.getElementById("game-player-list").innerHTML = players.map(p => `
    <div class="game-player-row">
      <div class="player-dot ${p.connected ? 'online' : 'offline'}"></div>
      <span style="${p.connected ? '' : 'opacity:0.45;text-decoration:line-through'}">${p.name}</span>
      ${p.isHost ? '<span style="margin-left:6px;font-size:9px;color:var(--accent2);letter-spacing:0.12em">HOST</span>' : ''}
    </div>
  `).join("");

  // Spectator section — shown below players when spectators exist
  const specSection = document.getElementById("spectator-section");
  specSection.style.display = spectators.length > 0 ? "" : "none";
  document.getElementById("game-spectator-list").innerHTML = spectators.map(s => `
    <div class="game-player-row">
      <div class="player-dot ${s.connected ? 'online' : 'offline'}"></div>
      <span style="${s.connected ? 'color:var(--muted)' : 'opacity:0.45;color:var(--muted);text-decoration:line-through'}">${s.name}</span>
    </div>
  `).join("");

  // Promoted to host mid-game?
  const me = players.find(p => p.id === socket.id);
  if (me && me.isHost && !isHost) {
    isHost = true;
    const rb = document.getElementById("result-block");
    if (rb.classList.contains("visible")) {
      document.getElementById("host-next-actions").style.display = "flex";
      document.getElementById("next-wait").style.display = "none";
      document.getElementById("next-btn").style.display = "block";
    }
    document.getElementById("end-question-btn").style.display = "block";
    document.getElementById("skip-btn").style.display = "block";
    document.getElementById("end-btn").style.display = "block";
    document.getElementById("midgame-shuffle-row").style.display = "flex";
    document.getElementById("game-spectate-btn").style.display = "none";
  }

  // Show spectate button during game for active non-host players only
  if (!isHost && !isSpectator) {
    document.getElementById("game-spectate-btn").style.display = "inline-block";
  }

  rebuildPips(totalPlayers);
});

socket.on("game_started", () => {
  document.getElementById("game-room-code").textContent = myRoom;
  document.getElementById("midgame-shuffle-row").style.display = isHost ? "flex" : "none";
  document.getElementById("end-question-btn").style.display = isHost ? "inline-block" : "none";
  // Spectators skip vote area; show spectate button for regular players
  if (isSpectator) {
    document.getElementById("vote-area").style.display = "none";
    document.getElementById("vote-progress").style.display = "none";
    document.getElementById("game-spectate-btn").style.display = "none";
  } else if (!isHost) {
    document.getElementById("game-spectate-btn").style.display = "inline-block";
  }
  if (isHost) {
    document.getElementById("midgame-shuffle-toggle").checked =
      document.getElementById("random-toggle").checked;
  }
  showScreen("screen-game");
});

socket.on("new_question", ({ question, index, total }) => {
  currentVote = null;
  if (document.hidden) {
    pendingQuestion = { question, index, total };
    return;
  }
  applyNewQuestion(question, index, total);
});

function applyNewQuestion(question, index, total) {
  setQuestion(question, index, total);
  resetVoteUI();
  hideResult();
  // Spectators never see the vote buttons
  document.getElementById("vote-area").style.display = isSpectator ? "none" : "";
  document.getElementById("vote-progress").style.display = "flex";
  document.getElementById("end-question-btn").style.display = isHost ? "inline-block" : "none";
  document.getElementById("skip-btn").style.display = isHost ? "inline-block" : "none";
  document.getElementById("end-btn").style.display  = isHost ? "inline-block" : "none";
  document.getElementById("midgame-shuffle-row").style.display = isHost ? "flex" : "none";
  rebuildPips(totalPlayers);
  updatePips(0);
  pendingQuestion = null;
}

socket.on("vote_count", ({ voted, total }) => {
  totalPlayers = total;
  rebuildPips(total);
  updatePips(voted);
  document.getElementById("vote-count-text").textContent = `${voted}/${total} answered`;
});

socket.on("round_result", ({ yes, total, isLast }) => {
  document.getElementById("end-question-btn").style.display = "none";
  document.getElementById("skip-btn").style.display = "none";
  if (document.hidden) {
    pendingResult = { yes, total, isLast };
    return;
  }
  showResult(yes, total, isLast, isHost);
});

socket.on("game_over", ({ scores, results }) => {
  gameResults = results || [];
  showFinal(scores, results);
});

// First player opted in — update button text for those still on end screen
socket.on("play_again_available", () => {
  const btn = document.getElementById("play-again-btn");
  if (!btn.disabled) {
    btn.textContent = "Play Again";  // keep label consistent
  }
});

// Server confirms we are now a spectator
socket.on("now_spectating", () => {
  isSpectator = true;
  document.getElementById("vote-area").style.display = "none";
  document.getElementById("vote-progress").style.display = "none";
  document.getElementById("game-spectate-btn").style.display = "none";
  // Update lobby toggle button
  const tb = document.getElementById("spectate-toggle-btn");
  if (tb) { tb.textContent = "Join as Player"; tb.style.display = "block"; }
});

// Server confirms we reverted to player (lobby only)
socket.on("now_playing", () => {
  isSpectator = false;
  const tb = document.getElementById("spectate-toggle-btn");
  if (tb) { tb.textContent = "Spectate"; tb.style.display = "block"; }
});

// Opt-in list changed (someone left the waiting panel)
socket.on("play_again_update", ({ optInNames }) => {
  renderPlayAgainNames(optInNames);
});

// Server confirms shuffle mode updated
socket.on("shuffle_updated", ({ randomOrder }) => {
  document.getElementById("midgame-shuffle-toggle").checked = randomOrder;
});

// ── ACTIONS ──────────────────────────────────────────────────────────────────
function createRoom() {
  const name = document.getElementById("host-name").value.trim();
  if (!name) return setError("home-error", "Enter your name");
  myName = name;
  isHost = true;
  socket.emit("create_room", { name });
}

function joinRoom() {
  const name = document.getElementById("join-name").value.trim();
  const code = document.getElementById("join-code").value.trim().toUpperCase();
  if (!name) return setError("home-error", "Enter your name");
  if (!code) return setError("home-error", "Enter a room code");
  myName = name;
  socket.emit("join_room", { name, roomId: code });
}

function startGame() {
  const randomOrder = document.getElementById("random-toggle").checked;
  socket.emit("start_game", { roomId: myRoom, randomOrder });
}

function vote(choice) {
  const area = document.getElementById("vote-area");
  if (area.classList.contains("locked")) return;
  if (currentVote === choice) {
    currentVote = null;
    document.getElementById("vote-track").className = "vote-track";
    socket.emit("submit_vote", { roomId: myRoom, vote: choice });
  } else {
    currentVote = choice;
    document.getElementById("vote-track").className =
      "vote-track " + (choice === "yes" ? "voted-yes" : "voted-no");
    socket.emit("submit_vote", { roomId: myRoom, vote: choice });
  }
}

function nextRound() {
  // Don't hide buttons immediately — result block fades out first via applyNewQuestion
  // Just disable them to prevent double-click
  document.getElementById("next-btn").disabled = true;
  document.getElementById("finish-btn").disabled = true;
  socket.emit("next_round", { roomId: myRoom });
}

function endQuestion() {
  socket.emit("end_question", { roomId: myRoom });
}

function skipQuestion() {
  socket.emit("skip_question", { roomId: myRoom });
}

function toggleMidgameShuffle() {
  const on = document.getElementById("midgame-shuffle-toggle").checked;
  socket.emit("set_shuffle", { roomId: myRoom, shuffle: on });
}

function endGame() {
  socket.emit("end_game", { roomId: myRoom });
}

function toggleSpectate() {
  if (isSpectator) {
    socket.emit("leave_spectator", { roomId: myRoom });
  } else {
    socket.emit("become_spectator", { roomId: myRoom });
  }
}

function becomeSpectator() {
  // Game-screen spectate (one-way, irreversible during game)
  socket.emit("become_spectator", { roomId: myRoom });
}

function leaveRoom() {
  socket.emit("leave_room", { roomId: myRoom });
  myRoom = "";
  isHost = false;
  isSpectator = false;
  currentVote = null;
  document.getElementById("host-name").value = myName;
  document.getElementById("join-name").value = myName;
  document.getElementById("join-code").value = "";
  showScreen("screen-home");
}

function goHome() {
  myRoom = "";
  isHost = false;
  isSpectator = false;
  currentVote = null;
  document.getElementById("host-name").value = myName;
  document.getElementById("join-name").value = myName;
  document.getElementById("join-code").value = "";
  showScreen("screen-home");
}

function optInPlayAgain() {
  if (!myName || !myRoom) { goHome(); return; }
  const btn = document.getElementById("play-again-btn");
  btn.disabled = true;
  btn.textContent = "Joining…";
  document.getElementById("leave-play-again-btn").style.display = "";
  document.getElementById("play-again-wait-msg").style.display = "block";
  socket.emit("opt_in_play_again", { roomId: myRoom });
}

function leavePlayAgain() {
  socket.emit("leave_play_again", { roomId: myRoom });
  // Reset panel back to initial state
  const btn = document.getElementById("play-again-btn");
  btn.disabled = false;
  btn.textContent = "Play Again";
  document.getElementById("leave-play-again-btn").style.display = "none";
  document.getElementById("play-again-wait-msg").style.display = "none";
  renderPlayAgainNames([]);
}

// ── UI HELPERS ───────────────────────────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function showLobby() {
  document.getElementById("lobby-code").textContent = myRoom;
  document.getElementById("start-btn").style.display = isHost ? "block" : "none";
  document.getElementById("order-toggle-row").style.display = isHost ? "flex" : "none";
  document.getElementById("wait-msg").style.display = isHost ? "none" : "block";
  // Spectate toggle: non-host players can toggle spectator status in lobby
  const tb = document.getElementById("spectate-toggle-btn");
  if (!isHost) {
    tb.style.display = "block";
    tb.textContent = isSpectator ? "Join as Player" : "Spectate";
  } else {
    tb.style.display = "none";
  }
  showScreen("screen-lobby");
}

function setQuestion(question, index, total) {
  document.getElementById("q-num").textContent = `Question ${index + 1} / ${total}`;
  document.getElementById("q-text").textContent = question;
}

function resetVoteUI() {
  document.getElementById("vote-track").className = "vote-track";
  document.getElementById("vote-area").classList.remove("locked");
}

function lockVoteArea() {
  document.getElementById("vote-area").classList.add("locked");
}

function hideResult() {
  document.getElementById("result-block").classList.remove("visible");
  document.getElementById("host-next-actions").style.display = "none";
  const nb = document.getElementById("next-btn");
  const fb = document.getElementById("finish-btn");
  nb.style.display = "none";
  nb.disabled = false;
  fb.style.display = "none";
  fb.disabled = false;
  document.getElementById("next-wait").style.display = "none";
}

function showResult(yes, total, isLast, hostControls) {
  const pct = total > 0 ? Math.round((yes / total) * 100) : 0;
  document.getElementById("res-pct").textContent = pct + "%";
  document.getElementById("res-count").textContent = `${yes}/${total}`;
  requestAnimationFrame(() => {
    document.getElementById("bar-fill").style.width = pct + "%";
  });

  if (hostControls) {
    document.getElementById("host-next-actions").style.display = "flex";
    document.getElementById(isLast ? "finish-btn" : "next-btn").style.display = "block";
    document.getElementById("next-wait").style.display = "none";
  } else {
    document.getElementById("host-next-actions").style.display = "none";
    document.getElementById("next-wait").style.display = "block";
  }

  lockVoteArea();
  requestAnimationFrame(() => {
    document.getElementById("result-block").classList.add("visible");
  });
}

function rebuildPips(count) {
  const container = document.getElementById("vote-pips");
  container.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const pip = document.createElement("div");
    pip.className = "vote-pip";
    container.appendChild(pip);
  }
}

function updatePips(voted) {
  document.querySelectorAll(".vote-pip").forEach((pip, i) => {
    pip.classList.toggle("done", i < voted);
  });
}

function renderPlayAgainNames(names) {
  document.getElementById("play-again-names").innerHTML = names.map(n => `
    <div class="player-item">
      <div class="player-dot online"></div>
      <span>${n}</span>
    </div>
  `).join("");
}

function showFinal(scores, results) {
  switchTab("scores");

  // Reset play-again panel
  const btn = document.getElementById("play-again-btn");
  btn.disabled = false;
  btn.textContent = "Play Again";
  document.getElementById("leave-play-again-btn").style.display = "none";
  document.getElementById("play-again-wait-msg").style.display = "none";
  renderPlayAgainNames([]);

  // Scores tab
  const rankClass = i => i === 0 ? "gold" : i === 1 ? "silver" : i === 2 ? "bronze" : "";
  document.getElementById("final-list").innerHTML = scores.map((s, i) => `
    <div class="score-item">
      <div class="score-rank ${rankClass(i)}">${i + 1}</div>
      <div class="score-name">${s.name}</div>
      <div class="score-val">${s.score}%</div>
    </div>
  `).join("");

  // Questions tab
  const qList = document.getElementById("question-rank-list");
  if (results && results.length > 0) {
    const sorted = [...results].sort((a, b) => {
      const pA = a.total > 0 ? a.yes / a.total : 0;
      const pB = b.total > 0 ? b.yes / b.total : 0;
      return pB - pA;
    });
    qList.innerHTML = sorted.map((r, i) => {
      const pct = r.total > 0 ? Math.round((r.yes / r.total) * 100) : 0;
      return `
        <div class="q-rank-item">
          <div class="q-rank-num">${i + 1}</div>
          <div class="q-rank-text">${r.question}</div>
          <div class="q-rank-pct">${pct}%</div>
        </div>`;
    }).join("");
  } else {
    qList.innerHTML = '<div class="waiting-text">No questions answered yet.</div>';
  }

  showScreen("screen-final");
}

function switchTab(tab) {
  document.getElementById("tab-scores-btn").classList.toggle("active", tab === "scores");
  document.getElementById("tab-questions-btn").classList.toggle("active", tab === "questions");
  document.getElementById("tab-scores").classList.toggle("active", tab === "scores");
  document.getElementById("tab-questions").classList.toggle("active", tab === "questions");
}

function setError(id, msg) {
  const el = document.getElementById(id);
  if (el) { el.textContent = msg; setTimeout(() => el.textContent = "", 3000); }
}

// ── FONT LOAD + VISIBILITY CHANGE ────────────────────────────────────────────
document.fonts.ready.then(() => document.body.classList.add("fonts-ready"));

document.addEventListener("visibilitychange", () => {
  if (document.hidden) return;
  // A new question arrived while tabbed out — apply it (takes priority over result)
  if (pendingQuestion) {
    const { question, index, total } = pendingQuestion;
    pendingResult = null;
    applyNewQuestion(question, index, total);
  } else if (pendingResult) {
    // A round result arrived while tabbed out — show it
    const { yes, total, isLast } = pendingResult;
    pendingResult = null;
    document.getElementById("end-question-btn").style.display = "none";
    document.getElementById("skip-btn").style.display = "none";
    showResult(yes, total, isLast, isHost);
  }
});
</script>
</body>
</html>
