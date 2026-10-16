(() => {
  "use strict";

  const W = 960;
  const H = 540;
  const STORAGE_KEY = "roadster-kickflip-best-v1";
  const ROUND_ATTEMPTS = 8;

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const elScore = document.getElementById("score");
  const elCombo = document.getElementById("combo");
  const elBest = document.getElementById("best");
  const elFlips = document.getElementById("flips");
  const overlay = document.getElementById("overlay");
  const panelStart = document.getElementById("panel-start");
  const panelResult = document.getElementById("panel-result");
  const panelPause = document.getElementById("panel-pause");
  const resultTitle = document.getElementById("result-title");
  const resultMsg = document.getElementById("result-msg");
  const resultScore = document.getElementById("result-score");

  let best = Number(localStorage.getItem(STORAGE_KEY) || 0);
  elBest.textContent = String(best);

  /** @type {'menu'|'playing'|'airborne'|'landed'|'wipeout'|'pause'|'result'} */
  let state = "menu";
  let score = 0;
  let combo = 0;
  let flips = 0;
  let attempt = 0;
  let lastGrade = "";
  let flashText = "";
  let flashTimer = 0;
  let shake = 0;

  // World
  let camX = 0;
  let car = { x: 80, y: 0, vx: 0, rot: 0, flipRot: 0, grounded: false };
  let particles = [];
  let stars = [];
  let timing = 0; // 0..1 approach progress into jump window
  let jumpPhase = 0; // airborne progress 0..1
  let inputLocked = false;
  let pressedThisAttempt = false;
  let grade = null; // perfect | good | early | late | miss
  let approachSpeed = 1;
  let rampX = 520;
  let groundY = 400;
  let lastTs = 0;
  let spitfire = false; // thruster flare on perfect

  for (let i = 0; i < 60; i++) {
    stars.push({
      x: Math.random() * 2000,
      y: Math.random() * 280,
      r: Math.random() * 1.6 + 0.3,
      a: Math.random() * 0.6 + 0.2,
    });
  }

  function showPanel(which) {
    panelStart.classList.toggle("hidden", which !== "start");
    panelResult.classList.toggle("hidden", which !== "result");
    panelPause.classList.toggle("hidden", which !== "pause");
    overlay.classList.toggle("hidden", !which);
  }

  function updateHud() {
    elScore.textContent = String(score);
    elCombo.textContent = "×" + combo;
    elFlips.textContent = String(flips);
    if (score > best) {
      best = score;
      localStorage.setItem(STORAGE_KEY, String(best));
      elBest.textContent = String(best);
    } else {
      elBest.textContent = String(best);
    }
  }

  function resetCarForAttempt() {
    car.x = 40;
    car.y = groundY - 28;
    car.vx = 0;
    car.rot = 0;
    car.flipRot = 0;
    car.flipped = false;
    timing = 0;
    jumpPhase = 0;
    inputLocked = false;
    pressedThisAttempt = false;
    grade = null;
    spitfire = false;
    approachSpeed = 0.85 + Math.min(attempt, 6) * 0.06 + Math.random() * 0.08;
    particles = particles.filter((p) => p.life > 0.4);
  }

  function startRound() {
    score = 0;
    combo = 0;
    flips = 0;
    attempt = 0;
    flashText = "";
    flashTimer = 0;
    shake = 0;
    resetCarForAttempt();
    state = "playing";
    showPanel(null);
    updateHud();
  }

  function endRound() {
    state = "result";
    const msg =
      flips === 0
        ? "No flips landed — try again in the green window."
        : flips >= 6
          ? "Insane session. Roadster would be proud (fan-wise)."
          : flips >= 3
            ? "Solid kickflips. Share and challenge a friend."
            : "Not bad — nail more Perfects for combos.";
    resultTitle.textContent = flips >= 5 ? "Legendary!" : flips >= 2 ? "Nice!" : "Round over";
    resultMsg.textContent = msg;
    resultScore.textContent = String(score);
    showPanel("result");
    updateHud();
  }

  function spawnBurst(x, y, color, n, speed) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = Math.random() * speed;
      particles.push({
        x, y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s - Math.random() * 2,
        life: 1,
        decay: 0.012 + Math.random() * 0.02,
        color,
        size: Math.random() * 3 + 1.5,
      });
    }
  }

  function spawnSmoke(x, y) {
    particles.push({
      x: x + (Math.random() - 0.5) * 10,
      y: y + (Math.random() - 0.5) * 4,
      vx: -1.5 - Math.random() * 2,
      vy: -0.5 - Math.random(),
      life: 1,
      decay: 0.02,
      color: "rgba(180,190,210,0.45)",
      size: 6 + Math.random() * 8,
      smoke: true,
    });
  }

  function spawnThruster(x, y) {
    particles.push({
      x, y,
      vx: -4 - Math.random() * 5,
      vy: (Math.random() - 0.5) * 3,
      life: 1,
      decay: 0.04,
      color: Math.random() > 0.4 ? "#5bb8ff" : "#ffd166",
      size: 2 + Math.random() * 3,
    });
  }

  /** Timing window: perfect center band, good around it */
  function evaluateTiming(t) {
    // Ideal hit around 0.72–0.88 of approach (just as wheels leave ramp)
    const perfectCenter = 0.80;
    const d = Math.abs(t - perfectCenter);
    if (d <= 0.045) return "perfect";
    if (d <= 0.10) return "good";
    if (t < perfectCenter) return "early";
    return "late";
  }

  function onFlipInput() {
    if (state === "menu" || state === "result") return;
    if (state === "pause") return;
    if (state !== "playing" && state !== "airborne") return;
    if (pressedThisAttempt || inputLocked) return;

    // Only valid during approach near jump or early air
    if (state === "playing") {
      if (timing < 0.55) {
        // Too early while still on ground far from ramp — count as early wipeout soon
        pressedThisAttempt = true;
        grade = "early";
        applyGrade();
        return;
      }
      pressedThisAttempt = true;
      grade = evaluateTiming(timing);
      applyGrade();
    } else if (state === "airborne" && jumpPhase < 0.25 && !pressedThisAttempt) {
      pressedThisAttempt = true;
      grade = evaluateTiming(0.80 + jumpPhase * 0.15);
      applyGrade();
    }
  }

  function applyGrade() {
    inputLocked = true;
    const g = grade;
    lastGrade = g;

    if (g === "perfect" || g === "good") {
      state = "airborne";
      jumpPhase = Math.max(jumpPhase, 0.02);
      car.flipped = true;
      spitfire = g === "perfect";
      const base = g === "perfect" ? 250 : 120;
      const mult = Math.max(1, combo);
      const gained = Math.round(base * (1 + (mult - 1) * 0.35));
      score += gained;
      combo += 1;
      flips += 1;
      flashText = g === "perfect" ? "PERFECT + " + gained : "GOOD + " + gained;
      flashTimer = 1.2;
      spawnBurst(car.x + 40, car.y - 20, g === "perfect" ? "#ffd166" : "#5bb8ff", 28, 6);
      shake = g === "perfect" ? 8 : 4;
    } else {
      state = "wipeout";
      combo = 0;
      jumpPhase = Math.max(jumpPhase, 0.05);
      flashText = g === "early" ? "EARLY!" : g === "late" ? "LATE!" : "MISS!";
      flashTimer = 1.2;
      spawnBurst(car.x + 30, car.y, "#ff5b6a", 20, 5);
      shake = 12;
    }
    updateHud();
  }

  function nextAttemptOrEnd() {
    attempt += 1;
    if (attempt >= ROUND_ATTEMPTS) {
      endRound();
      return;
    }
    resetCarForAttempt();
    state = "playing";
  }

  function tick(dt) {
    if (state === "pause" || state === "menu" || state === "result") return;

    if (flashTimer > 0) flashTimer -= dt;
    if (shake > 0) shake = Math.max(0, shake - dt * 30);

    // Particles
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.smoke ? -0.02 : 0.08;
      p.life -= p.decay;
    }
    particles = particles.filter((p) => p.life > 0);

    if (state === "playing") {
      // Approach ramp
      car.vx = 280 * approachSpeed;
      car.x += car.vx * dt;
      // Follow ground / ramp profile
      const rel = car.x - rampX;
      if (rel < 0) {
        car.y = groundY - 28;
        car.rot = 0;
        timing = Math.max(0, Math.min(1, (car.x - (rampX - 280)) / 280));
      } else if (rel < 90) {
        // On ramp rising
        const t = rel / 90;
        car.y = groundY - 28 - t * 70;
        car.rot = -t * 0.55;
        timing = 0.55 + t * 0.35;
      } else {
        // Left ramp without input — miss / late
        if (!pressedThisAttempt) {
          pressedThisAttempt = true;
          grade = "late";
          applyGrade();
        }
      }
      if (Math.random() < 0.5) spawnSmoke(car.x - 10, car.y + 18);
      if (spitfire || Math.random() < 0.3) spawnThruster(car.x - 8, car.y + 8);
      camX = car.x - 220;
    }

    if (state === "airborne") {
      jumpPhase += dt * 0.72;
      const t = Math.min(1, jumpPhase);
      // Arc
      const lift = Math.sin(t * Math.PI) * 140;
      car.x += 220 * approachSpeed * dt;
      car.y = groundY - 28 - 70 - lift;
      // Kickflip rotation ~360deg
      car.flipRot = t * Math.PI * 2;
      car.rot = -0.4 + t * 0.5;
      if (spitfire) {
        spawnThruster(car.x, car.y + 10);
        spawnThruster(car.x + 20, car.y + 12);
      }
      camX = car.x - 260;
      if (t >= 1) {
        state = "landed";
        car.y = groundY - 28;
        car.flipRot = 0;
        car.rot = 0;
        spawnBurst(car.x + 20, car.y + 20, "#2ee59d", 16, 4);
        setTimeout(nextAttemptOrEnd, 550);
      }
    }

    if (state === "wipeout") {
      jumpPhase += dt * 0.9;
      const t = Math.min(1, jumpPhase);
      car.x += 160 * dt;
      car.y = groundY - 28 - 40 + t * t * 80;
      car.rot += dt * 8;
      car.flipRot += dt * 3;
      camX = car.x - 240;
      if (Math.random() < 0.4) spawnSmoke(car.x, car.y);
      if (t >= 1 || car.y > groundY + 40) {
        state = "landed";
        setTimeout(nextAttemptOrEnd, 500);
      }
    }
  }

  function drawBackground() {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#0b1020");
    g.addColorStop(0.55, "#141a2a");
    g.addColorStop(1, "#1a1520");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // Stars (parallax)
    for (const s of stars) {
      const sx = ((s.x - camX * 0.15) % 2000 + 2000) % 2000 - 40;
      ctx.globalAlpha = s.a;
      ctx.fillStyle = "#cfd8ff";
      ctx.beginPath();
      ctx.arc(sx, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Texas night glow
    const glow = ctx.createRadialGradient(W * 0.7, H * 0.2, 10, W * 0.7, H * 0.2, 260);
    glow.addColorStop(0, "rgba(232,33,39,0.12)");
    glow.addColorStop(1, "transparent");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);
  }

  function worldX(x) {
    return x - camX;
  }

  function drawGround() {
    // Desert floor
    ctx.fillStyle = "#2a2430";
    ctx.fillRect(0, groundY + 20, W, H - groundY);

    // Road strip
    ctx.fillStyle = "#3a3545";
    ctx.fillRect(0, groundY + 8, W, 28);
    ctx.strokeStyle = "rgba(255,209,102,0.35)";
    ctx.setLineDash([18, 16]);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, groundY + 22);
    ctx.lineTo(W, groundY + 22);
    ctx.stroke();
    ctx.setLineDash([]);

    // Ramp
    const rx = worldX(rampX);
    ctx.fillStyle = "#4a4558";
    ctx.beginPath();
    ctx.moveTo(rx, groundY + 8);
    ctx.lineTo(rx + 90, groundY + 8 - 70);
    ctx.lineTo(rx + 110, groundY + 8 - 70);
    ctx.lineTo(rx + 20, groundY + 8);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#e82127";
    ctx.fillRect(rx + 4, groundY - 4, 14, 10);

    // Landing pad markings
    const lx = worldX(rampX + 220);
    ctx.fillStyle = "rgba(46,229,157,0.15)";
    ctx.fillRect(lx, groundY + 6, 160, 20);
  }

  function drawCar() {
    const x = worldX(car.x);
    const y = car.y;
    ctx.save();
    ctx.translate(x + 40, y);
    ctx.rotate(car.rot + (car.flipped ? car.flipRot : 0));

    // Shadow
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.beginPath();
    ctx.ellipse(0, 26, 48, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body — low Roadster silhouette
    ctx.fillStyle = "#e82127";
    ctx.beginPath();
    ctx.moveTo(-42, 8);
    ctx.lineTo(-38, -6);
    ctx.lineTo(-10, -14);
    ctx.lineTo(18, -16);
    ctx.lineTo(40, -8);
    ctx.lineTo(46, 4);
    ctx.lineTo(42, 12);
    ctx.lineTo(-40, 12);
    ctx.closePath();
    ctx.fill();

    // Cockpit
    ctx.fillStyle = "#1a2233";
    ctx.beginPath();
    ctx.moveTo(-6, -12);
    ctx.lineTo(14, -14);
    ctx.lineTo(20, -4);
    ctx.lineTo(-2, -2);
    ctx.closePath();
    ctx.fill();

    // Nose accent
    ctx.fillStyle = "#ffd166";
    ctx.fillRect(34, -2, 10, 4);

    // Wheels
    ctx.fillStyle = "#111";
    ctx.beginPath();
    ctx.arc(-24, 12, 10, 0, Math.PI * 2);
    ctx.arc(28, 12, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#888";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(-24, 12, 6, 0, Math.PI * 2);
    ctx.arc(28, 12, 6, 0, Math.PI * 2);
    ctx.stroke();

    // Thruster glow when flipping
    if (spitfire && (state === "airborne" || state === "playing")) {
      const tg = ctx.createRadialGradient(-40, 4, 0, -40, 4, 28);
      tg.addColorStop(0, "rgba(120,200,255,0.9)");
      tg.addColorStop(0.4, "rgba(255,180,60,0.5)");
      tg.addColorStop(1, "transparent");
      ctx.fillStyle = tg;
      ctx.beginPath();
      ctx.arc(-44, 4, 28, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  function drawParticles() {
    for (const p of particles) {
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(worldX(p.x), p.y, p.size * p.life, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawTimingMeter() {
    if (state !== "playing" && !(state === "airborne" && jumpPhase < 0.2)) return;
    if (attempt >= ROUND_ATTEMPTS) return;

    const mx = W / 2 - 140;
    const my = 36;
    const mw = 280;
    const mh = 18;

    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.fillRect(mx - 4, my - 4, mw + 8, mh + 8);
    ctx.strokeStyle = "#3a4258";
    ctx.strokeRect(mx, my, mw, mh);

    // Zones: early | good | perfect | good | late  mapped onto 0.55..1.0 of timing
    // Meter shows timing from 0.55 to 1.0
    const t0 = 0.55;
    const t1 = 1.0;
    const map = (t) => ((t - t0) / (t1 - t0)) * mw;

    // late/early base
    ctx.fillStyle = "#4a3040";
    ctx.fillRect(mx, my, mw, mh);

    // good zones around perfect 0.80 ± 0.10
    ctx.fillStyle = "rgba(91,184,255,0.55)";
    ctx.fillRect(mx + map(0.70), my, map(0.90) - map(0.70), mh);

    // perfect
    ctx.fillStyle = "rgba(46,229,157,0.85)";
    ctx.fillRect(mx + map(0.755), my, map(0.845) - map(0.755), mh);

    // needle
    const needleT = Math.max(t0, Math.min(t1, timing || 0.55 + jumpPhase * 0.2));
    const nx = mx + map(needleT);
    ctx.fillStyle = "#fff";
    ctx.fillRect(nx - 2, my - 4, 4, mh + 8);

    ctx.fillStyle = "#cfd6e6";
    ctx.font = "600 12px Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("FLIP WINDOW — hit Space / tap in green", W / 2, my + mh + 16);
  }

  function drawFlash() {
    if (flashTimer <= 0 || !flashText) return;
    ctx.save();
    ctx.globalAlpha = Math.min(1, flashTimer * 2);
    ctx.font = "800 42px Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = lastGrade === "perfect" ? "#ffd166" : lastGrade === "good" ? "#5bb8ff" : "#ff5b6a";
    ctx.fillText(flashText, W / 2, H * 0.38);
    ctx.restore();
  }

  function drawAttemptBadge() {
    if (state === "menu" || state === "result") return;
    ctx.font = "600 14px Segoe UI, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.textAlign = "left";
    ctx.fillText("Attempt " + (attempt + 1) + " / " + ROUND_ATTEMPTS, 16, 24);
  }

  function draw() {
    ctx.save();
    if (shake > 0) {
      ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
    }
    drawBackground();
    drawGround();
    drawParticles();
    if (state !== "menu") drawCar();
    drawTimingMeter();
    drawFlash();
    drawAttemptBadge();

    // Idle preview car on menu
    if (state === "menu") {
      car.x = camX + 280;
      car.y = groundY - 28;
      car.rot = 0;
      car.flipRot = 0;
      drawCar();
      // Demo ramp visible
    }
    ctx.restore();
  }

  function loop(ts) {
    if (!lastTs) lastTs = ts;
    let dt = (ts - lastTs) / 1000;
    lastTs = ts;
    if (dt > 0.05) dt = 0.05;
    tick(dt);
    draw();
    requestAnimationFrame(loop);
  }

  // Input
  function handleKey(e) {
    if (e.code === "Space" || e.key === " ") {
      e.preventDefault();
      if (state === "menu") {
        startRound();
        return;
      }
      if (state === "result") {
        startRound();
        return;
      }
      onFlipInput();
    }
    if (e.key === "p" || e.key === "P") {
      if (state === "playing" || state === "airborne" || state === "wipeout") {
        state = "pause";
        showPanel("pause");
      } else if (state === "pause") {
        state = "playing";
        showPanel(null);
      }
    }
    if (e.key === "r" || e.key === "R") {
      if (state !== "menu") startRound();
    }
  }

  document.addEventListener("keydown", handleKey);

  canvas.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    if (state === "menu" || state === "result") return;
    if (state === "pause") return;
    onFlipInput();
  });

  document.getElementById("btn-start").addEventListener("click", startRound);
  document.getElementById("btn-again").addEventListener("click", startRound);
  document.getElementById("btn-resume").addEventListener("click", () => {
    state = "playing";
    showPanel(null);
  });

  // Boot
  showPanel("start");
  camX = 0;
  car.x = 200;
  car.y = groundY - 28;
  requestAnimationFrame(loop);
})();
