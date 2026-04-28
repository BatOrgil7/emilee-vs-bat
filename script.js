const canvas = document.getElementById("tennis-court");
const ctx = canvas.getContext("2d");

const matchStatus = document.getElementById("match-status");
const emileeScoreNode = document.getElementById("emilee-score");
const batScoreNode = document.getElementById("bat-score");
const emileePointTextNode = document.getElementById("emilee-point-text");
const batPointTextNode = document.getElementById("bat-point-text");
const commentaryList = document.getElementById("commentary-list");
const wishesBand = document.getElementById("wishes");
const wishSectionTag = document.getElementById("wish-section-tag");
const wishTitle = document.getElementById("wish-title");
const lockBanner = document.getElementById("lock-banner");
const wishHeading = document.getElementById("wish-heading");
const wishMessage = document.getElementById("wish-message");
const wishGrid = document.getElementById("wish-grid");
const wishBoard = document.getElementById("wish-board");
const playAgainButton = document.getElementById("play-again");
const victoryPop = document.getElementById("victory-pop");
const victoryTitle = document.getElementById("victory-title");
const victoryMessage = document.getElementById("victory-message");
const closeVictoryButton = document.getElementById("close-victory");
const restartMatchButton = document.getElementById("restart-match");
const gamesToWinSet = 6;
const tiebreakTarget = 7;
const tennisPointLabels = ["0", "15", "30", "40", "Ad"];

const bounds = {
  groundY: 430,
  netX: canvas.width / 2,
  netTopY: 286,
  emileeMinX: 90,
  emileeMaxX: canvas.width / 2 - 76,
  batMinX: canvas.width / 2 + 76,
  batMaxX: canvas.width - 90,
};

const birthdayWishes = [
  "I hope 20 gives you the kind of laughs that make your cheeks hurt.",
  "I hope this year feels light, exciting, and so fully yours.",
  "I hope good people keep showing up for you in obvious ways.",
  "I hope you get more slow, lovely days than rushed ones.",
  "I hope your favorite songs keep finding you at the perfect time.",
  "I hope you get all A's on your finals.",
  "I hope fun finds you even on completely ordinary days.",
  "I hope your plans work out, and your detours turn out even better.",
  "I hope you keep collecting little memories you never want to forget.",
  "I hope there is always something beautiful ahead of you.",
  "I hope your heart feels safe, seen, and very loved.",
  "I hope your confidence keeps getting louder in all the best ways.",
  "I hope you laugh a lot, sleep well, and eat something amazing.",
  "I hope the next year feels like a fresh start in the sweetest way.",
  "I hope people celebrate you the way you deserve to be celebrated.",
  "I hope you keep making rooms feel warmer just by being in them.",
  "I hope this year brings easy joy and a few unforgettable moments.",
  "I hope you trust how much good is still coming your way.",
  "I hope 20 feels soft where it should and exciting where it counts.",
  "I hope this whole year loves you back.",
];

const commentaryPresets = {
  opening: [
    "The umpire clears her throat. Turner Center belongs to Emilee tonight.",
    "Bat bounces the ball twice and already looks like he is second-guessing this matchup.",
    "The crowd settles in, the strings are fresh, and Turner Center is ready for chaos.",
    "One set decides it all tonight, and Turner Center knows the stakes.",
  ],
  emilee: [
    "Emilee whips a glittery forehand past Bat. The crowd screams like it practiced.",
    "Bat lunges. Emilee paints the sideline anyway. Turner Center tennis is ruthless.",
    "A moonbeam lob from Emilee drops right behind Bat. Pure mischief.",
    "Emilee sends a candy-colored winner cross-court. Bat is left arguing with the breeze.",
    "That return was so neat the scoreboard practically curtseyed for Emilee.",
    "Emilee drills one deep and Bat is suddenly just jogging after bad news.",
    "A clean backhand from Emilee skims the line and leaves Bat staring at it.",
    "Emilee takes the ball early and turns the whole rally into her highlight reel.",
    "Bat guesses wrong and Emilee zips the ball into the open court without mercy.",
  ],
  bat: [
    "Bat sneaks a lucky point while the crowd groans in disbelief.",
    "A wobble from Emilee hands Bat a point, and he celebrates way too early.",
    "Bat catches one on the frame and somehow gets away with it. Suspicious, honestly.",
    "Bat steals that rally by inches and starts acting like he planned it.",
    "One awkward bounce catches Emilee out and Bat grabs the point with a grin.",
  ],
  replays: [
    "Bat tries to claim another point, but the chair ump calls for a replay.",
    "The ref checks the line. Nope. Bat does not get that one. Replay.",
  ],
  serves: [
    "Bat serves first, looking brave in a way that feels temporary.",
    "Emilee bounces on her toes. Match energy is warming up.",
    "Another rally loads with suspiciously strong main-character energy in the air.",
    "The next point starts with Turner Center buzzing a little louder.",
    "Fresh rally. Fresh nerves for Bat.",
    "Emilee resets, exhales, and gets ready to send another one back.",
  ],
};

const state = {
  emileeGames: 0,
  batGames: 0,
  emileePoints: 0,
  batPoints: 0,
  rallyActive: false,
  winner: null,
  commentary: [],
  keys: {
    left: false,
    right: false,
  },
  emilee: {
    x: 190,
    homeX: 190,
    swingTimer: 0,
    trailTimer: 0,
  },
  bat: {
    x: 760,
    homeX: 760,
    swingTimer: 0,
    trailTimer: 0,
  },
  ball: {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    radius: 12,
    lastHitter: "bat",
    lastBounceSide: null,
    bouncesOnCurrentSide: 0,
  },
  server: "bat",
  gameServer: "bat",
  tiebreak: false,
  serveTimer: 44,
  pointPause: 0,
  lastFrame: 0,
  confettiFired: false,
  recentCommentaryByBucket: {},
};

function populateWishes() {
  const fragment = document.createDocumentFragment();
  birthdayWishes.forEach((wish, index) => {
    const item = document.createElement("li");
    item.className = "wish-item";
    item.style.setProperty("--delay", `${120 + index * 45}ms`);

    const number = document.createElement("span");
    number.className = "wish-number";
    number.textContent = String(index + 1);

    const text = document.createElement("p");
    text.textContent = wish;

    item.append(number, text);
    fragment.appendChild(item);
  });
  wishGrid.appendChild(fragment);
}

function setStatus(text) {
  matchStatus.textContent = text;
}

function addCommentary(text) {
  state.commentary.unshift(text);
  state.commentary = state.commentary.slice(0, 5);
  commentaryList.innerHTML = "";
  state.commentary.forEach((entry) => {
    const item = document.createElement("li");
    item.textContent = entry;
    commentaryList.appendChild(item);
  });
}

function chooseLine(bucket) {
  const lines = commentaryPresets[bucket];
  const recent = state.recentCommentaryByBucket[bucket] || [];
  const available = lines.filter((line) => !recent.includes(line));
  const pool = available.length > 0 ? available : lines;
  const line = pool[Math.floor(Math.random() * pool.length)];

  state.recentCommentaryByBucket[bucket] = [
    line,
    ...recent,
  ].slice(0, Math.min(3, Math.max(1, lines.length - 1)));

  return line;
}

function otherPlayer(player) {
  return player === "emilee" ? "bat" : "emilee";
}

function playerName(player) {
  return player === "emilee" ? "Emilee" : "Bat";
}

function getGames(player) {
  return player === "emilee" ? state.emileeGames : state.batGames;
}

function setGames(player, value) {
  if (player === "emilee") {
    state.emileeGames = value;
    return;
  }
  state.batGames = value;
}

function getPoints(player) {
  return player === "emilee" ? state.emileePoints : state.batPoints;
}

function setPoints(player, value) {
  if (player === "emilee") {
    state.emileePoints = value;
    return;
  }
  state.batPoints = value;
}

function formatSetScore() {
  return `${state.emileeGames}-${state.batGames}`;
}

function formatPointDisplay(player) {
  if (state.tiebreak) {
    return String(getPoints(player));
  }
  return tennisPointLabels[Math.min(getPoints(player), tennisPointLabels.length - 1)];
}

function formatPointText(player) {
  if (state.tiebreak) {
    return `Tiebreak ${getPoints(player)}`;
  }
  return `Points ${formatPointDisplay(player)}`;
}

function formatPointCall() {
  if (state.tiebreak) {
    return `Tiebreak ${state.emileePoints}-${state.batPoints}.`;
  }

  if (state.emileePoints >= 3 && state.batPoints >= 3) {
    if (state.emileePoints === state.batPoints) {
      return "Deuce.";
    }
    return state.emileePoints > state.batPoints ? "Advantage Emilee." : "Advantage Bat.";
  }

  return `${formatPointDisplay("emilee")}-${formatPointDisplay("bat")}.`;
}

function formatSetLeaderStatus() {
  if (state.emileeGames === state.batGames) {
    return `The set is level at ${formatSetScore()}.`;
  }

  const leader = state.emileeGames > state.batGames ? "Emilee" : "Bat";
  return `${leader} leads the set ${formatSetScore()}.`;
}

function getUpcomingServer() {
  if (!state.tiebreak) {
    return state.gameServer;
  }

  const totalTiebreakPoints = state.emileePoints + state.batPoints;
  if (totalTiebreakPoints === 0) {
    return state.gameServer;
  }

  const alternateServer = otherPlayer(state.gameServer);
  const serviceBlock = Math.floor((totalTiebreakPoints - 1) / 2);
  return serviceBlock % 2 === 0 ? alternateServer : state.gameServer;
}

function shouldStartTiebreak() {
  return state.emileeGames === gamesToWinSet && state.batGames === gamesToWinSet;
}

function hasWonSet(player) {
  const playerGames = getGames(player);
  const opponentGames = getGames(otherPlayer(player));

  if (playerGames < gamesToWinSet) {
    return false;
  }

  if (playerGames === 7) {
    return true;
  }

  return playerGames - opponentGames >= 2;
}

function hasWonTiebreak(player) {
  const playerPoints = getPoints(player);
  const opponentPoints = getPoints(otherPlayer(player));
  return playerPoints >= tiebreakTarget && playerPoints - opponentPoints >= 2;
}

function describeRallyResult(scorer, reason) {
  if (scorer === "emilee") {
    if (reason === "net") {
      return "Bat clips the net.";
    }
    if (reason === "second-bounce") {
      return "Bat cannot chase down the second bounce.";
    }
    return "Emilee takes the point.";
  }

  if (reason === "net") {
    return "Emilee clips the net.";
  }
  if (reason === "second-bounce") {
    return "Bat squeezes out the rally after Emilee cannot reach the second bounce.";
  }
  return "Bat takes the point.";
}

function syncScoreUI() {
  emileeScoreNode.textContent = String(state.emileeGames);
  batScoreNode.textContent = String(state.batGames);
  emileePointTextNode.textContent = formatPointText("emilee");
  batPointTextNode.textContent = formatPointText("bat");
}

function resetBallForServe(server) {
  state.server = server;
  state.serveTimer = 44;
  state.rallyActive = false;
  state.ball.lastHitter = server;
  state.ball.lastBounceSide = null;
  state.ball.bouncesOnCurrentSide = 0;

  if (server === "bat") {
    state.ball.x = state.bat.x - 18;
    state.ball.y = 235;
  } else {
    state.ball.x = state.emilee.x + 18;
    state.ball.y = 235;
  }
  state.ball.vx = 0;
  state.ball.vy = 0;
}

function startRally() {
  state.rallyActive = true;
  state.ball.lastHitter = state.server;
  if (state.server === "bat") {
    state.ball.vx = -4.8;
    state.ball.vy = -7.4;
  } else {
    state.ball.vx = 6.3;
    state.ball.vy = -8.35;
  }
  setStatus(
    state.tiebreak
      ? `${playerName(state.server)} serves in the tiebreak. ${formatSetLeaderStatus()}`
      : `${playerName(state.server)} serves. ${formatSetLeaderStatus()}`
  );
}

function queueNextServe() {
  const nextServer = getUpcomingServer();
  addCommentary(chooseLine("serves"));
  resetBallForServe(nextServer);
}

function getRevealScrollTarget() {
  return window.matchMedia("(max-width: 720px)").matches ? wishBoard : wishesBand;
}

function unlockBirthdayWall() {
  wishesBand.classList.remove("hidden");
  wishesBand.classList.remove("locked");
  wishesBand.classList.remove("is-revealed");
  document.body.classList.add("victory-mode");
  wishSectionTag.textContent = "Birthday Reveal";
  wishTitle.textContent = "Happy 20th Birthday, Emilee";
  lockBanner.textContent = "Unlocked: Bat has officially been defeated, and the message is wide open.";
  wishHeading.textContent = "Happy 20th Birthday, Emilee";
  wishMessage.textContent =
    "Happy 20th Birthday, Emilee. I hope this year feels light, exciting, and full of people who love you well. You deserve the kind of days that make you laugh hard, feel proud of yourself, and remember how deeply loved you are.";
  playAgainButton.classList.remove("hidden");

  requestAnimationFrame(() => {
    wishesBand.classList.add("is-revealed");
  });

  setTimeout(() => {
    getRevealScrollTarget().scrollIntoView({ behavior: "smooth", block: "start" });
  }, 320);
}

function openVictoryDialog() {
  victoryTitle.textContent = "Emilee beat Bat. Happy 20th Birthday!";
  victoryMessage.textContent =
    "She did it. Emilee won, Bat got sent packing, and now the whole court gets to say it properly: happy 20th birthday, Emilee.";
  victoryPop.classList.add("is-open");
}

function closeVictoryDialog() {
  victoryPop.classList.remove("is-open");

  if (state.winner === "emilee" && window.matchMedia("(max-width: 720px)").matches) {
    requestAnimationFrame(() => {
      wishBoard.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
}

function spawnConfetti() {
  if (state.confettiFired) {
    return;
  }

  state.confettiFired = true;
  const colors = ["#ff8faa", "#ffd675", "#88d9ff", "#d5f2d2", "#f86b86"];

  for (let index = 0; index < 80; index += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.background = colors[index % colors.length];
    piece.style.setProperty("--drift", `${(Math.random() - 0.5) * 28}vw`);
    piece.style.setProperty("--spin", `${Math.random() * 720 - 360}deg`);
    piece.style.animationDuration = `${3 + Math.random() * 2.6}s`;
    piece.style.animationDelay = `${Math.random() * 0.4}s`;
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 6200);
  }
}

function winMatch() {
  if (state.winner) {
    return;
  }

  state.winner = "emilee";
  state.rallyActive = false;
  setStatus(`Emilee wins the set ${formatSetScore()} and the whole adorable thing.`);
  addCommentary(`Set Emilee, ${formatSetScore()}. Bat swings, misses, and the confetti takes over.`);
  unlockBirthdayWall();
  openVictoryDialog();
  spawnConfetti();
}

function loseMatch() {
  if (state.winner) {
    return;
  }

  state.winner = "bat";
  state.rallyActive = false;
  setStatus(`Bat steals the set ${formatSetScore()}. Hit restart and let Emilee get her revenge.`);
  addCommentary(`Set Bat, ${formatSetScore()}. The crowd instantly demands an immediate rematch.`);
}

function awardGame(winner) {
  const nextServer = otherPlayer(state.gameServer);

  setGames(winner, getGames(winner) + 1);
  state.emileePoints = 0;
  state.batPoints = 0;
  state.tiebreak = false;
  state.gameServer = nextServer;

  if (hasWonSet(winner)) {
    return { type: "set" };
  }

  if (shouldStartTiebreak()) {
    state.tiebreak = true;
    return {
      type: "game",
      status: `Game ${playerName(winner)}. Six-all, so Turner Center is headed to a tiebreak.`,
    };
  }

  return {
    type: "game",
    status: `Game ${playerName(winner)}. ${formatSetLeaderStatus()}`,
  };
}

function awardStandardPoint(scorer) {
  const opponent = otherPlayer(scorer);
  const scorerPoints = getPoints(scorer);
  const opponentPoints = getPoints(opponent);

  if (scorerPoints < 3) {
    setPoints(scorer, scorerPoints + 1);
    return { type: "point" };
  }

  if (scorerPoints === 3) {
    if (opponentPoints < 3) {
      return awardGame(scorer);
    }
    if (opponentPoints === 3) {
      setPoints(scorer, 4);
      return { type: "point" };
    }
    if (opponentPoints === 4) {
      setPoints(opponent, 3);
      return { type: "point" };
    }
  }

  return awardGame(scorer);
}

function awardTiebreakPoint(scorer) {
  setPoints(scorer, getPoints(scorer) + 1);
  if (hasWonTiebreak(scorer)) {
    return awardGame(scorer);
  }
  return { type: "point" };
}

function scorePoint(scorer, reason) {
  state.rallyActive = false;
  state.pointPause = 38;

  addCommentary(chooseLine(scorer === "emilee" ? "emilee" : "bat"));

  const outcome = state.tiebreak ? awardTiebreakPoint(scorer) : awardStandardPoint(scorer);
  syncScoreUI();

  if (outcome.type === "set") {
    if (scorer === "emilee") {
      winMatch();
    } else {
      loseMatch();
    }
    return;
  }

  if (outcome.type === "game") {
    setStatus(outcome.status);
    return;
  }

  setStatus(`${describeRallyResult(scorer, reason)} ${formatPointCall()}`);
}

function handleGroundBounce() {
  const bounceSide = state.ball.x < bounds.netX ? "emilee" : "bat";

  if (state.ball.lastBounceSide !== bounceSide) {
    state.ball.lastBounceSide = bounceSide;
    state.ball.bouncesOnCurrentSide = 0;
  }

  state.ball.bouncesOnCurrentSide += 1;

  if (state.ball.lastHitter === bounceSide || state.ball.bouncesOnCurrentSide > 1) {
    scorePoint(bounceSide === "emilee" ? "bat" : "emilee", "second-bounce");
    return;
  }

  state.ball.vy = -Math.max(4.3, Math.abs(state.ball.vy) * 0.75);
  state.ball.vx *= 0.98;
}

function handleNetCollision() {
  const emileeHitNet = state.ball.lastHitter === "emilee";
  scorePoint(emileeHitNet ? "bat" : "emilee", "net");
}

function moveTowards(current, target, maxStep) {
  if (Math.abs(target - current) <= maxStep) {
    return target;
  }
  return current + Math.sign(target - current) * maxStep;
}

function beginFreshShot(hitter) {
  state.ball.lastHitter = hitter;
  state.ball.lastBounceSide = null;
  state.ball.bouncesOnCurrentSide = 0;
}

function swingByEmilee() {
  state.emilee.swingTimer = 14;
  const distance = Math.hypot(state.ball.x - state.emilee.x, state.ball.y - 334);
  const ballInReach =
    state.ball.x < bounds.netX + 32 &&
    state.ball.y > 226 &&
    state.ball.y < 404 &&
    distance < 118;

  if (!state.rallyActive || !ballInReach) {
    return;
  }

  const aim = Math.max(-1, Math.min(1, (state.ball.x - state.emilee.x) / 44));
  const moveBias = (state.keys.right ? 1 : 0) - (state.keys.left ? 1 : 0);
  beginFreshShot("emilee");
  state.ball.vx = 6.9 + aim * 1.35 + moveBias * 0.55;
  state.ball.vy = -7.9 - Math.abs(aim) * 0.75;
}

function maybeBatReturn() {
  const closeEnoughX = Math.abs(state.ball.x - state.bat.x) < 82;
  const closeEnoughY = state.ball.y > 252 && state.ball.y < 400;
  const movingTowardBat = state.ball.vx > 0;

  if (!state.rallyActive || !movingTowardBat || !closeEnoughX || !closeEnoughY) {
    return;
  }

  const missChance = Math.min(
    0.6,
    0.15 +
      state.emileeGames * 0.03 +
      (state.emileeGames > state.batGames ? 0.06 : 0) +
      (state.emileePoints > state.batPoints ? 0.04 : 0) +
      (state.tiebreak ? 0.03 : 0) +
      (state.ball.bouncesOnCurrentSide === 1 ? 0.08 : 0)
  );
  const shouldMiss = Math.random() < missChance;

  state.bat.swingTimer = 12;

  if (shouldMiss) {
    state.bat.trailTimer = 16;
    return;
  }

  const targetBias = Math.max(-1, Math.min(1, (state.emilee.x - state.ball.x) / 160));
  beginFreshShot("bat");
  state.ball.vx = -5.2 - Math.random() * 1 + targetBias * 0.25;
  state.ball.vy = -6.35 - Math.random() * 1.1;
}

function updateGame(dt) {
  if (state.winner) {
    return;
  }

  const emileeSpeed = 4.7 * dt;
  if (state.keys.left) {
    state.emilee.x = Math.max(bounds.emileeMinX, state.emilee.x - emileeSpeed);
  }
  if (state.keys.right) {
    state.emilee.x = Math.min(bounds.emileeMaxX, state.emilee.x + emileeSpeed);
  }

  const projectedLanding = projectLandingPoint();
  const batTarget =
    projectedLanding && projectedLanding.side === "bat"
      ? projectedLanding.x - 8
      : state.ball.x > bounds.netX
        ? state.ball.x - 8
        : state.bat.homeX;
  const batSpeed =
    Math.max(
      2.2,
      4.35 - state.emileeGames * 0.12 - (state.emileePoints > state.batPoints ? 0.08 : 0)
    ) * dt;
  state.bat.x = moveTowards(
    state.bat.x,
    Math.min(bounds.batMaxX, Math.max(bounds.batMinX, batTarget)),
    batSpeed
  );

  if (state.emilee.swingTimer > 0) {
    state.emilee.swingTimer -= dt;
  }
  if (state.bat.swingTimer > 0) {
    state.bat.swingTimer -= dt;
  }
  if (state.bat.trailTimer > 0) {
    state.bat.trailTimer -= dt;
  }

  if (state.serveTimer > 0) {
    state.serveTimer -= dt;
    const baseX = state.server === "bat" ? state.bat.x - 18 : state.emilee.x + 18;
    const arc = Math.sin((1 - state.serveTimer / 44) * Math.PI);
    state.ball.x = baseX;
    state.ball.y = 246 - arc * 34;
    if (state.serveTimer <= 0) {
      startRally();
    }
    return;
  }

  if (state.pointPause > 0) {
    state.pointPause -= dt;
    if (state.pointPause <= 0) {
      queueNextServe();
    }
    return;
  }

  if (!state.rallyActive) {
    return;
  }

  state.ball.vy += 0.28 * dt;
  state.ball.x += state.ball.vx * dt;
  state.ball.y += state.ball.vy * dt;

  if (state.ball.x < 24 || state.ball.x > canvas.width - 24) {
    scorePoint(state.ball.x < 24 ? "bat" : "emilee", "out");
    return;
  }

  const crossingNet =
    Math.abs(state.ball.x - bounds.netX) < Math.abs(state.ball.vx) * dt + 3 &&
    state.ball.y + state.ball.radius > bounds.netTopY;

  if (crossingNet) {
    handleNetCollision();
    return;
  }

  maybeBatReturn();

  if (state.ball.y + state.ball.radius >= bounds.groundY) {
    state.ball.y = bounds.groundY - state.ball.radius;
    handleGroundBounce();
  }
}

function drawRoundedRect(x, y, width, height, radius, fillStyle) {
  ctx.fillStyle = fillStyle;
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
  ctx.fill();
}

function drawScene() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBackdrop();
  drawCourtSurface();
  drawNetStructure();

  drawBadge();
  drawLandingGuide();
  drawBallShadow();
  drawCharacter(state.emilee.x, "#ff8faa", "Emilee", state.emilee.swingTimer > 0, true);
  drawCharacter(state.bat.x, "#69c9ba", "Bat", state.bat.swingTimer > 0, false, state.bat.trailTimer > 0);
  drawBall();
}

function drawBackdrop() {
  const skyGradient = ctx.createLinearGradient(0, 0, 0, 296);
  skyGradient.addColorStop(0, "#7bcfff");
  skyGradient.addColorStop(0.6, "#dff3ff");
  skyGradient.addColorStop(1, "#edfaff");
  drawRoundedRect(0, 0, canvas.width, 308, 0, skyGradient);

  const sunGlow = ctx.createRadialGradient(760, 70, 18, 760, 70, 180);
  sunGlow.addColorStop(0, "rgba(255, 244, 176, 0.88)");
  sunGlow.addColorStop(0.55, "rgba(255, 229, 143, 0.34)");
  sunGlow.addColorStop(1, "rgba(255, 229, 143, 0)");
  ctx.fillStyle = sunGlow;
  ctx.fillRect(560, -10, 330, 260);

  for (let cloudIndex = 0; cloudIndex < 4; cloudIndex += 1) {
    const cloudX = 110 + cloudIndex * 208;
    const cloudY = 78 + (cloudIndex % 2) * 28;
    ctx.fillStyle = "rgba(255, 255, 255, 0.88)";
    ctx.beginPath();
    ctx.arc(cloudX, cloudY, 34, 0, Math.PI * 2);
    ctx.arc(cloudX + 28, cloudY - 12, 28, 0, Math.PI * 2);
    ctx.arc(cloudX + 58, cloudY, 30, 0, Math.PI * 2);
    ctx.fill();
  }

  const standsGradient = ctx.createLinearGradient(0, 150, 0, 232);
  standsGradient.addColorStop(0, "#d5c6ff");
  standsGradient.addColorStop(1, "#f7d7d4");
  ctx.fillStyle = standsGradient;
  ctx.fillRect(0, 164, canvas.width, 60);

  for (let row = 0; row < 3; row += 1) {
    for (let seat = 0; seat < 52; seat += 1) {
      const seatX = 16 + seat * 18 + (row % 2) * 8;
      const seatY = 170 + row * 15;
      const palette = ["#ff9bb5", "#ffd675", "#8ed9ff", "#d6f2d3", "#ffffff"];
      ctx.fillStyle = palette[(seat + row) % palette.length];
      ctx.fillRect(seatX, seatY, 12, 8);
    }
  }

  ctx.fillStyle = "#3c6e56";
  ctx.fillRect(0, 224, canvas.width, 18);

  ctx.fillStyle = "#77bf8f";
  ctx.beginPath();
  ctx.moveTo(0, 250);
  ctx.bezierCurveTo(80, 214, 160, 212, 250, 250);
  ctx.bezierCurveTo(340, 212, 430, 204, 520, 252);
  ctx.bezierCurveTo(610, 218, 700, 214, 820, 252);
  ctx.bezierCurveTo(890, 218, 930, 216, 960, 242);
  ctx.lineTo(960, 294);
  ctx.lineTo(0, 294);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
  ctx.lineWidth = 2;
  for (let post = 0; post <= 11; post += 1) {
    const x = 66 + post * 76;
    ctx.beginPath();
    ctx.moveTo(x, 214);
    ctx.lineTo(x, 300);
    ctx.stroke();
  }
  for (let row = 0; row < 6; row += 1) {
    const y = 220 + row * 12;
    ctx.beginPath();
    ctx.moveTo(34, y);
    ctx.lineTo(926, y);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
  ctx.lineWidth = 1;
  for (let diag = -10; diag < 20; diag += 1) {
    ctx.beginPath();
    ctx.moveTo(40 + diag * 48, 214);
    ctx.lineTo(140 + diag * 48, 300);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(140 + diag * 48, 214);
    ctx.lineTo(40 + diag * 48, 300);
    ctx.stroke();
  }
}

function drawCourtSurface() {
  const court = {
    left: 64,
    top: 282,
    width: canvas.width - 128,
    height: 154,
  };
  const courtBottom = court.top + court.height;
  const singlesLeft = court.left + 62;
  const singlesRight = court.left + court.width - 62;
  const serviceTop = 332;
  const serviceBottom = 386;

  drawRoundedRect(
    court.left - 18,
    court.top - 16,
    court.width + 36,
    court.height + 38,
    28,
    "rgba(64, 111, 96, 0.18)"
  );

  const outerGradient = ctx.createLinearGradient(0, court.top, 0, courtBottom);
  outerGradient.addColorStop(0, "#5eab88");
  outerGradient.addColorStop(1, "#4e9a79");
  drawRoundedRect(court.left, court.top, court.width, court.height, 24, outerGradient);

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(court.left, court.top, court.width, court.height, 24);
  ctx.clip();

  const innerGradient = ctx.createLinearGradient(0, court.top, 0, courtBottom);
  innerGradient.addColorStop(0, "#6fc1c6");
  innerGradient.addColorStop(0.55, "#68b5c6");
  innerGradient.addColorStop(1, "#5da0bb");
  ctx.fillStyle = innerGradient;
  ctx.fillRect(singlesLeft, court.top + 12, singlesRight - singlesLeft, court.height - 24);

  for (let stripe = 0; stripe < 16; stripe += 1) {
    ctx.fillStyle = stripe % 2 === 0 ? "rgba(255,255,255,0.035)" : "rgba(0,0,0,0.03)";
    ctx.fillRect(court.left + stripe * 52, court.top, 26, court.height);
  }

  const shine = ctx.createLinearGradient(court.left, court.top, court.left, courtBottom);
  shine.addColorStop(0, "rgba(255,255,255,0.16)");
  shine.addColorStop(0.3, "rgba(255,255,255,0.02)");
  shine.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = shine;
  ctx.fillRect(court.left, court.top, court.width, court.height);

  ctx.restore();

  ctx.strokeStyle = "rgba(242, 250, 255, 0.92)";
  ctx.lineWidth = 5;
  ctx.strokeRect(court.left + 2.5, court.top + 2.5, court.width - 5, court.height - 5);

  ctx.lineWidth = 4;
  ctx.strokeRect(singlesLeft, court.top + 12, singlesRight - singlesLeft, court.height - 24);

  ctx.beginPath();
  ctx.moveTo(court.left + 20, bounds.groundY);
  ctx.lineTo(court.left + court.width - 20, bounds.groundY);
  ctx.moveTo(singlesLeft, serviceTop);
  ctx.lineTo(singlesRight, serviceTop);
  ctx.moveTo(singlesLeft, serviceBottom);
  ctx.lineTo(singlesRight, serviceBottom);
  ctx.moveTo(bounds.netX, serviceTop);
  ctx.lineTo(bounds.netX, serviceBottom);
  ctx.moveTo(court.left + court.width / 2 - 10, courtBottom - 12);
  ctx.lineTo(court.left + court.width / 2 + 10, courtBottom - 12);
  ctx.stroke();

  ctx.fillStyle = "rgba(28, 71, 60, 0.16)";
  ctx.fillRect(court.left + 34, courtBottom - 22, court.width - 68, 12);
}

function drawNetStructure() {
  ctx.fillStyle = "rgba(32, 53, 76, 0.18)";
  ctx.beginPath();
  ctx.ellipse(bounds.netX, bounds.groundY + 8, 72, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#f6f0d9";
  ctx.fillRect(bounds.netX - 6, bounds.netTopY - 12, 12, bounds.groundY - bounds.netTopY + 12);

  ctx.fillStyle = "#fffdf2";
  ctx.fillRect(bounds.netX - 70, bounds.netTopY - 12, 140, 8);

  ctx.strokeStyle = "rgba(255, 255, 255, 0.86)";
  ctx.lineWidth = 2;
  for (let band = 0; band < 8; band += 1) {
    const y = bounds.netTopY + 8 + band * 18;
    ctx.beginPath();
    ctx.moveTo(bounds.netX - 64, y);
    ctx.lineTo(bounds.netX + 64, y);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(255, 255, 255, 0.34)";
  ctx.lineWidth = 1;
  for (let strand = -6; strand <= 6; strand += 1) {
    ctx.beginPath();
    ctx.moveTo(bounds.netX + strand * 10, bounds.netTopY - 4);
    ctx.lineTo(bounds.netX + strand * 10, bounds.groundY);
    ctx.stroke();
  }
}

function drawBadge() {
  drawRoundedRect(28, 22, 220, 100, 22, "rgba(255, 253, 248, 0.8)");
  ctx.fillStyle = "rgba(90, 50, 89, 0.68)";
  ctx.font = '700 20px "Baloo 2"';
  ctx.fillText("Turner Center", 48, 52);
  ctx.fillStyle = "#5a3259";
  ctx.font = '700 18px "Baloo 2"';
  ctx.fillText(`Set ${state.emileeGames}-${state.batGames}`, 48, 78);
  ctx.font = '800 20px "Baloo 2"';
  ctx.fillText(`Pts ${formatPointDisplay("emilee")}  •  ${formatPointDisplay("bat")}`, 48, 104);
}

function drawCharacter(x, color, label, swinging, leftSide, missed = false) {
  const baseY = 364;
  const sway = swinging ? 12 : 0;
  const bodyX = x - 28;

  ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
  ctx.beginPath();
  ctx.ellipse(x, 418, 34, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffd7bc";
  ctx.beginPath();
  ctx.arc(x, baseY - 74, 22, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(bodyX, baseY - 48, 56, 70, 22);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(bodyX + 4, baseY + 8, 48, 20);

  ctx.strokeStyle = "#5a3259";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(x - 14, baseY + 28);
  ctx.lineTo(x - 10, baseY + 64);
  ctx.moveTo(x + 14, baseY + 28);
  ctx.lineTo(x + 10, baseY + 64);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x - 18, baseY - 26);
  ctx.lineTo(x - (leftSide ? 34 : 20), baseY + 4);
  ctx.moveTo(x + 18, baseY - 26);
  ctx.lineTo(x + (leftSide ? 26 + sway : 38 + sway), baseY - 8);
  ctx.stroke();

  const racketHandX = x + (leftSide ? 32 + sway : 38 + sway);
  const racketHandY = baseY - 6;

  ctx.strokeStyle = missed ? "#ff7a95" : "#ffd76a";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(racketHandX, racketHandY);
  ctx.lineTo(racketHandX + (leftSide ? 18 : -18), racketHandY - 26);
  ctx.stroke();

  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.ellipse(racketHandX + (leftSide ? 28 : -28), racketHandY - 38, 20, 25, 0.3, 0, Math.PI * 2);
  ctx.stroke();

  if (missed) {
    ctx.fillStyle = "#ff7a95";
    ctx.font = '700 24px "Baloo 2"';
    ctx.fillText("!", x - 4, baseY - 112);
  }

  ctx.fillStyle = "#5a3259";
  ctx.font = '700 20px "Baloo 2"';
  ctx.textAlign = "center";
  ctx.fillText(label, x, 454);
  ctx.textAlign = "left";
}

function drawBallShadow() {
  const shadowSpread = Math.max(18, 30 - (bounds.groundY - state.ball.y) * 0.05);
  ctx.fillStyle = "rgba(90, 50, 89, 0.14)";
  ctx.beginPath();
  ctx.ellipse(state.ball.x, bounds.groundY + 10, shadowSpread, 8, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(state.ball.x, state.ball.y, state.ball.radius, 0, Math.PI * 2);
  const ballGradient = ctx.createRadialGradient(
    state.ball.x - 4,
    state.ball.y - 6,
    2,
    state.ball.x,
    state.ball.y,
    state.ball.radius + 2
  );
  ballGradient.addColorStop(0, "#fffce1");
  ballGradient.addColorStop(1, "#def05f");
  ctx.fillStyle = ballGradient;
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.9)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(state.ball.x, state.ball.y, state.ball.radius - 3, 0.2, Math.PI + 0.9);
  ctx.stroke();
}

function projectLandingPoint() {
  if (!state.rallyActive) {
    return null;
  }

  let x = state.ball.x;
  let y = state.ball.y;
  let vx = state.ball.vx;
  let vy = state.ball.vy;

  for (let step = 0; step < 240; step += 1) {
    vy += 0.28;
    x += vx;
    y += vy;

    if (x < 0 || x > canvas.width) {
      return null;
    }

    if (Math.abs(x - bounds.netX) < Math.abs(vx) + 3 && y + state.ball.radius > bounds.netTopY) {
      return { x: bounds.netX, side: x < bounds.netX ? "emilee" : "bat", net: true };
    }

    if (y + state.ball.radius >= bounds.groundY) {
      return { x, side: x < bounds.netX ? "emilee" : "bat", net: false };
    }
  }

  return null;
}

function drawLandingGuide() {
  const landing = projectLandingPoint();
  if (!landing || landing.side !== "emilee" || landing.net) {
    return;
  }

  ctx.save();
  ctx.strokeStyle = "rgba(255, 214, 117, 0.95)";
  ctx.lineWidth = 4;
  ctx.setLineDash([8, 7]);
  ctx.beginPath();
  ctx.ellipse(landing.x, bounds.groundY + 10, 24, 8, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function loop(timestamp) {
  const rawDelta = timestamp - state.lastFrame;
  state.lastFrame = timestamp;
  const dt = Math.min(2, rawDelta / 16.6667 || 1);
  updateGame(dt);
  drawScene();
  window.requestAnimationFrame(loop);
}

function onKeyChange(event, isDown) {
  if (event.code === "ArrowLeft" || event.code === "KeyA") {
    state.keys.left = isDown;
    event.preventDefault();
  }
  if (event.code === "ArrowRight" || event.code === "KeyD") {
    state.keys.right = isDown;
    event.preventDefault();
  }
  if ((event.code === "Space" || event.code === "ArrowUp" || event.code === "KeyW") && isDown) {
    swingByEmilee();
    event.preventDefault();
  }
}

function attachHoldButton(button, keyName) {
  const turnOn = (event) => {
    event.preventDefault();
    state.keys[keyName] = true;
  };
  const turnOff = (event) => {
    event.preventDefault();
    state.keys[keyName] = false;
  };

  button.addEventListener("pointerdown", turnOn);
  button.addEventListener("pointerup", turnOff);
  button.addEventListener("pointercancel", turnOff);
  button.addEventListener("pointerleave", turnOff);
}

function wireScrollButtons() {
  document.querySelectorAll("[data-scroll-to]").forEach((button) => {
    button.addEventListener("click", () => {
      const targetId = button.getAttribute("data-scroll-to");
      const target = document.getElementById(targetId);
      if (!target) {
        return;
      }
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function resetMatch() {
  state.emileeGames = 0;
  state.batGames = 0;
  state.emileePoints = 0;
  state.batPoints = 0;
  state.winner = null;
  state.commentary = [];
  state.emilee.x = state.emilee.homeX;
  state.bat.x = state.bat.homeX;
  state.emilee.swingTimer = 0;
  state.bat.swingTimer = 0;
  state.bat.trailTimer = 0;
  state.pointPause = 0;
  state.confettiFired = false;
  state.recentCommentaryByBucket = {};
  state.gameServer = "bat";
  state.tiebreak = false;

  wishesBand.classList.add("locked");
  wishesBand.classList.add("hidden");
  wishesBand.classList.remove("is-revealed");
  document.body.classList.remove("victory-mode");
  wishSectionTag.textContent = "Locked Finale";
  wishTitle.textContent = "A note waits behind the trophy ribbon";
  lockBanner.textContent = "Beat Bat to unlock the final message for Emilee.";
  wishHeading.textContent = "A note is waiting";
  wishMessage.textContent = "The full reveal stays locked until Emilee beats Bat at Turner Center.";
  playAgainButton.classList.add("hidden");
  closeVictoryDialog();

  syncScoreUI();
  commentaryList.innerHTML = "";
  commentaryPresets.opening.forEach((line) => addCommentary(line));
  setStatus("Opening game at Turner Center. Bat to serve.");
  resetBallForServe(state.gameServer);
}

function setup() {
  populateWishes();
  syncScoreUI();
  wireScrollButtons();
  resetMatch();

  window.addEventListener("keydown", (event) => onKeyChange(event, true));
  window.addEventListener("keyup", (event) => onKeyChange(event, false));
  canvas.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    swingByEmilee();
  });

  document.querySelectorAll("[data-hold]").forEach((button) => {
    attachHoldButton(button, button.getAttribute("data-hold"));
  });

  document.querySelectorAll("[data-tap='swing']").forEach((button) => {
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      swingByEmilee();
    });
  });

  restartMatchButton.addEventListener("click", resetMatch);
  playAgainButton.addEventListener("click", () => {
    resetMatch();
    document.getElementById("game").scrollIntoView({ behavior: "smooth", block: "start" });
  });
  closeVictoryButton.addEventListener("click", closeVictoryDialog);
  victoryPop.addEventListener("click", (event) => {
    if (event.target === victoryPop) {
      closeVictoryDialog();
    }
  });

  window.requestAnimationFrame((timestamp) => {
    state.lastFrame = timestamp;
    window.requestAnimationFrame(loop);
  });
}

setup();
