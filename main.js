/* ════════════════════════════════════════════════════
   KOG — main.js
════════════════════════════════════════════════════ */

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* ─── INTRO ─────────────────────────────────────── */
window.addEventListener('load', () => {
  setTimeout(() => $('#intro').classList.add('gone'), 1400);
});

/* ─── CUSTOM CURSOR ─────────────────────────────── */
const ring = $('#cur-ring');
const dot  = $('#cur-dot');
let mx = window.innerWidth / 2, my = window.innerHeight / 2;
let rx = mx, ry = my;

window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

(function cursorLoop() {
  rx = lerp(rx, mx, 0.12);
  ry = lerp(ry, my, 0.12);
  ring.style.left = rx + 'px';
  ring.style.top  = ry + 'px';
  dot.style.left  = mx + 'px';
  dot.style.top   = my + 'px';
  requestAnimationFrame(cursorLoop);
})();

// Hover detection for interactive elements
const hoverEls = 'a, button, .cap-item, .num-dot, input, textarea, select, .submit-btn';
document.addEventListener('mouseover', e => {
  if (e.target.closest(hoverEls)) document.body.classList.add('hovering');
});
document.addEventListener('mouseout', e => {
  if (e.target.closest(hoverEls)) document.body.classList.remove('hovering');
});

/* ─── NAV ───────────────────────────────────────── */
window.addEventListener('scroll', () => {
  $('#nav').classList.toggle('scrolled', window.scrollY > 80);
}, { passive: true });

/* ─── SMOOTH SCROLL ─────────────────────────────── */
$$('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = $(a.getAttribute('href'));
    if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); }
  });
});

/* ─── HERO SCROLL ZOOM ──────────────────────────── */
const heroImg = $('#hero-img');
window.addEventListener('scroll', () => {
  if (!heroImg) return;
  const p = clamp(window.scrollY / window.innerHeight, 0, 1);
  heroImg.style.transform = `scale(${1 + p * 0.1})`;
}, { passive: true });

/* ─── MANIFESTO WORD REVEAL ──────────────────────── */
function initManifesto() {
  const el = $('#manifesto-text');
  if (!el) return;
  const words = el.textContent.trim().split(/\s+/);
  el.innerHTML = words.map(w => `<span class="word">${w} </span>`).join('');

  const spans = $$('#manifesto-text .word');
  const total = spans.length;

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      startManifestoReveal(spans, total);
    });
  }, { threshold: 0.15 });
  io.observe(el);
}

function startManifestoReveal(spans, total) {
  const manifesto = $('#manifesto');

  function update() {
    const rect = manifesto.getBoundingClientRect();
    const progress = clamp(
      (-rect.top) / (rect.height - window.innerHeight * 0.5), 0, 1
    );
    const lit = Math.floor(progress * total * 1.3);
    spans.forEach((s, i) => {
      s.classList.toggle('lit', i < lit);
    });
    requestAnimationFrame(update);
  }
  update();
}
initManifesto();

/* ─── CAPABILITIES HOVER REVEAL ─────────────────── */
function initCapabilities() {
  const items = $$('.cap-item');
  const imgs  = $$('.cap-img-item');

  function activate(idx) {
    items.forEach((it, i) => it.classList.toggle('active', i === idx));
    imgs.forEach((im, i)  => im.classList.toggle('active',  i === idx));
  }

  items.forEach((item, i) => {
    item.addEventListener('mouseenter', () => activate(i));
  });

  // Auto-cycle when not hovering
  let cycle = 0, timer;
  function startCycle() {
    timer = setInterval(() => {
      // Only cycle if nothing is being hovered
      cycle = (cycle + 1) % items.length;
      activate(cycle);
    }, 3500);
  }

  const capSection = $('#capabilities');
  capSection.addEventListener('mouseenter', () => clearInterval(timer));
  capSection.addEventListener('mouseleave', () => startCycle());
  startCycle();
}
initCapabilities();

/* ─── NUMBERS TICKER ─────────────────────────────── */
function initNumbers() {
  const items = $$('.num-item');
  const dots  = $$('.num-dot');
  let current = 0, timer;

  function goTo(idx) {
    items.forEach((it, i) => it.classList.toggle('active', i === idx));
    dots.forEach((d, i)   => d.classList.toggle('active',  i === idx));
    current = idx;
  }

  dots.forEach((d, i) => d.addEventListener('click', () => {
    clearInterval(timer);
    goTo(i);
    startTimer();
  }));

  function startTimer() {
    timer = setInterval(() => {
      goTo((current + 1) % items.length);
    }, 4000);
  }
  startTimer();

  // Counter animation on first entry
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      animateCounters();
      io.disconnect();
    });
  }, { threshold: 0.3 });
  const numbersSection = $('#numbers');
  if (numbersSection) io.observe(numbersSection);
}

function animateCounters() {
  $$('.big-num[data-target]').forEach(el => {
    const target = parseInt(el.dataset.target);
    const suf    = el.dataset.suf || '';
    let start = null;
    const step = ts => {
      if (!start) start = ts;
      const p = clamp((ts - start) / 1500, 0, 1);
      const ease = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.floor(ease * target) + suf;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target + suf;
    };
    requestAnimationFrame(step);
  });
}
initNumbers();

/* ─── NUMBERS PARALLAX ───────────────────────────── */
const numsBg = $('.numbers-bg');
window.addEventListener('scroll', () => {
  if (!numsBg) return;
  const rect = $('#numbers').getBoundingClientRect();
  const p = clamp((window.innerHeight / 2 - rect.top - rect.height / 2) / rect.height, -0.5, 0.5);
  numsBg.style.transform = `translateY(${p * 18}%)`;
}, { passive: true });

/* ─── SCROLL-DRIVEN TRUCK TERRAIN ────────────────── */
function initDrive() {
  const section = $('#drive');
  const canvas  = $('#drive-canvas');
  if (!section || !canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // ── Terrain ──────────────────────────────────────
  // Returns Y position for a world X coordinate on a given layer
  function tY(worldX, layer) {
    const configs = [
      { base: 0.60, freqs: [0.00045, 0.0009,  0.003  ], amps: [55, 30, 10] }, // far
      { base: 0.72, freqs: [0.0007,  0.0018,  0.006  ], amps: [60, 35, 12] }, // mid
      { base: 0.82, freqs: [0.0012,  0.003,   0.012  ], amps: [45, 22, 8  ] }, // ground
    ];
    const c = configs[layer];
    return H * c.base
      + c.freqs.reduce((sum, f, i) => sum + Math.sin(worldX * f * Math.PI * 2) * c.amps[i], 0);
  }

  // Draw filled terrain polygon
  function drawTerrain(worldOffset, layer) {
    const palette = [
      ['#0e1018', '#0a0c14'],
      ['#131510', '#0f110d'],
      ['#1a1610', '#13100b'],
    ];
    ctx.beginPath();
    ctx.moveTo(0, H);
    for (let x = 0; x <= W; x += 3) {
      ctx.lineTo(x, tY(x + worldOffset, layer));
    }
    ctx.lineTo(W, H);
    ctx.closePath();
    const g = ctx.createLinearGradient(0, H * 0.55, 0, H);
    g.addColorStop(0, palette[layer][0]);
    g.addColorStop(1, palette[layer][1]);
    ctx.fillStyle = g;
    ctx.fill();
  }

  // Rocks scattered on terrain
  function drawRocks(worldOffset, layer) {
    const seed = layer * 17;
    for (let i = 0; i < 18; i++) {
      const wx = ((i * 1847 + seed) % (W * 3)) - worldOffset * (layer === 1 ? 0.5 : 0.25);
      const x  = ((wx % (W + 200)) + W + 200) % (W + 200) - 100;
      const gy = tY(wx + worldOffset, layer);
      const rs = (3 + (i % 5) * 2.5) * (layer + 0.5);
      ctx.beginPath();
      ctx.ellipse(x, gy - rs * 0.4, rs * 1.3, rs * 0.8, (i % 3) * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${20 + (i%3)*5},${18 + (i%4)*4},${15},0.85)`;
      ctx.fill();
    }
  }

  // ── Scroll progress ───────────────────────────────
  function getProgress() {
    const rect  = section.getBoundingClientRect();
    const total = section.offsetHeight - H;
    return clamp(-rect.top / total, 0, 1);
  }

  // ── Particle pools ─────────────────────────────────
  const exhaustPool = [];
  const dustPool    = [];

  function spawnExhaust(x, y) {
    exhaustPool.push({
      x, y,
      vx: -0.4 - Math.random() * 0.6,
      vy: -(1.3 + Math.random() * 1.6),
      r:   7 + Math.random() * 9,
      a:   0.28 + Math.random() * 0.14,
      grow: 0.55 + Math.random() * 0.75,
      life: 1, decay: 0.007 + Math.random() * 0.005
    });
  }

  function spawnDust(x, y) {
    dustPool.push({
      x, y,
      vx: -1.8 - Math.random() * 2.5,
      vy: -0.5 - Math.random() * 0.8,
      r:   4 + Math.random() * 6,
      a:   0.35 + Math.random() * 0.2,
      grow: 0.5 + Math.random() * 0.6,
      life: 1, decay: 0.022 + Math.random() * 0.012
    });
  }

  function drawParticles(pool, rBase, rMid) {
    for (let i = pool.length - 1; i >= 0; i--) {
      const p = pool[i];
      p.x += p.vx; p.y += p.vy;
      p.r += p.grow; p.life -= p.decay;
      if (p.life <= 0) { pool.splice(i, 1); continue; }
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
      g.addColorStop(0,   `rgba(${rBase},${p.life * p.a})`);
      g.addColorStop(0.5, `rgba(${rMid},${p.life * p.a * 0.5})`);
      g.addColorStop(1,   `rgba(${rMid},0)`);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
    }
  }

  // ── Truck drawing ─────────────────────────────────
  // Truck faces RIGHT. bx,by is the base center (ground contact).
  // Exhaust stacks are drawn AT known positions so particles spawn there.
  let stack1 = { x: 0, y: 0 }; // filled each frame so particles match
  let stack2 = { x: 0, y: 0 };

  function drawTruck(bx, by, angle, s) {
    ctx.save();
    ctx.translate(bx, by);
    ctx.rotate(angle);

    // Ground shadow
    ctx.beginPath();
    ctx.ellipse(-80*s, 6*s, 105*s, 7*s, 0, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fill();

    // ── TRAILER ────────────────────────────────────
    ctx.beginPath();
    ctx.roundRect(-215*s, -52*s, 135*s, 52*s, 2*s);
    ctx.fillStyle = '#1e2228';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // Trailer ribs
    for (let i = 1; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo((-215 + i*25)*s, -52*s);
      ctx.lineTo((-215 + i*25)*s, 0);
      ctx.strokeStyle = 'rgba(0,0,0,0.25)';
      ctx.lineWidth = s;
      ctx.stroke();
    }
    // Trailer top highlight
    ctx.beginPath();
    ctx.moveTo(-215*s, -52*s);
    ctx.lineTo(-80*s, -52*s);
    ctx.strokeStyle = 'rgba(255,255,255,0.07)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // ── CAB ─────────────────────────────────────────
    ctx.beginPath();
    ctx.moveTo(-80*s, 0);
    ctx.lineTo(-80*s, -55*s);
    ctx.lineTo(-42*s, -55*s);
    ctx.lineTo(-20*s, -72*s);
    ctx.lineTo(32*s,  -72*s);
    ctx.lineTo(32*s,  0);
    ctx.closePath();
    ctx.fillStyle = '#252b33';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.07)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Cab top highlight
    ctx.beginPath();
    ctx.moveTo(-80*s, -55*s);
    ctx.lineTo(-42*s, -55*s);
    ctx.lineTo(-20*s, -72*s);
    ctx.lineTo(32*s,  -72*s);
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Windshield
    ctx.beginPath();
    ctx.moveTo(-40*s, -55*s);
    ctx.lineTo(-18*s, -70*s);
    ctx.lineTo(28*s,  -70*s);
    ctx.lineTo(28*s,  -55*s);
    ctx.closePath();
    ctx.fillStyle = 'rgba(120,170,220,0.28)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(200,230,255,0.12)';
    ctx.lineWidth = s;
    ctx.stroke();
    // Windshield reflection
    ctx.beginPath();
    ctx.moveTo(-30*s, -58*s);
    ctx.lineTo(-15*s, -68*s);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 2*s;
    ctx.stroke();

    // Grille / bumper
    ctx.fillStyle = '#111518';
    ctx.fillRect(20*s, -42*s, 12*s, 28*s);
    ctx.fillStyle = '#0a0c0e';
    ctx.fillRect(22*s, -14*s, 10*s, 8*s);  // bumper
    for (let r = 0; r < 6; r++) {
      ctx.beginPath();
      ctx.moveTo(20*s, (-40 + r*5)*s);
      ctx.lineTo(32*s, (-40 + r*5)*s);
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = .8;
      ctx.stroke();
    }

    // Side mirror
    ctx.fillStyle = '#1a1e24';
    ctx.fillRect(30*s, -62*s, 5*s, 8*s);

    // ── EXHAUST STACKS ──────────────────────────────
    // Two chrome stacks behind cab roof — exact positions tracked for particles
    const stackPositions = [[-62, -56], [-52, -56]];
    stackPositions.forEach(([sx, sy], idx) => {
      const stackHeight = 22*s;
      // Pipe body
      ctx.fillStyle = '#2e3438';
      ctx.fillRect((sx-2.5)*s, (sy - stackHeight/s)*s, 5*s, stackHeight);
      // Chrome sheen
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.fillRect((sx-1)*s, (sy - stackHeight/s)*s, 1.5*s, stackHeight);
      // Flare at top
      ctx.beginPath();
      ctx.moveTo((sx-4.5)*s, (sy - stackHeight/s)*s);
      ctx.lineTo((sx+4.5)*s, (sy - stackHeight/s)*s);
      ctx.lineTo((sx+3)*s, (sy - stackHeight/s + 5)*s);
      ctx.lineTo((sx-3)*s, (sy - stackHeight/s + 5)*s);
      ctx.closePath();
      ctx.fillStyle = '#3a4248';
      ctx.fill();
    });

    // ── HEADLIGHTS ─────────────────────────────────
    ctx.save();
    ctx.shadowColor  = 'rgba(255,240,180,0.7)';
    ctx.shadowBlur   = 22*s;
    ctx.beginPath();
    ctx.arc(32*s, -25*s, 5*s, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(255,248,210,0.95)';
    ctx.fill();
    ctx.restore();
    // Light cone
    const lc = ctx.createRadialGradient(32*s, -25*s, 0, 80*s, -22*s, 80*s);
    lc.addColorStop(0, 'rgba(255,248,200,0.10)');
    lc.addColorStop(1, 'rgba(255,248,200,0)');
    ctx.beginPath();
    ctx.moveTo(32*s, -25*s);
    ctx.lineTo(120*s, -10*s);
    ctx.lineTo(120*s, -38*s);
    ctx.closePath();
    ctx.fillStyle = lc;
    ctx.fill();

    // ── WHEELS ─────────────────────────────────────
    const wheels = [
      [16, 0, 15],    // front
      [-62, 0, 15],   // rear cab 1
      [-73, 0, 15],   // rear cab 2
      [-168, 0, 15],  // trailer rear 1
      [-180, 0, 15],  // trailer rear 2
    ];
    wheels.forEach(([wx, wy, wr]) => {
      // Tire
      ctx.beginPath();
      ctx.arc(wx*s, wy*s, wr*s, 0, Math.PI*2);
      ctx.fillStyle = '#0e1012';
      ctx.fill();
      // Sidewall
      ctx.beginPath();
      ctx.arc(wx*s, wy*s, wr*s, 0, Math.PI*2);
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 2*s;
      ctx.stroke();
      // Rim
      ctx.beginPath();
      ctx.arc(wx*s, wy*s, wr*s*0.58, 0, Math.PI*2);
      ctx.fillStyle = '#292e36';
      ctx.fill();
      // Spokes
      for (let sp = 0; sp < 6; sp++) {
        const a = (sp / 6) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(wx*s, wy*s);
        ctx.lineTo(wx*s + Math.cos(a)*wr*s*0.52, wy*s + Math.sin(a)*wr*s*0.52);
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = s*0.8;
        ctx.stroke();
      }
      // Center cap
      ctx.beginPath();
      ctx.arc(wx*s, wy*s, wr*s*0.18, 0, Math.PI*2);
      ctx.fillStyle = '#555';
      ctx.fill();
    });

    ctx.restore();

    // After restoring, record world-space stack positions for particle emission
    // We approximate: transform the local stack tip to world space
    const cosA = Math.cos(angle), sinA = Math.sin(angle);
    stackPositions.forEach(([sx, sy], idx) => {
      const lx = sx * s;
      const ly = (sy - 22) * s; // top of stack
      const wx2 = bx + lx * cosA - ly * sinA;
      const wy2 = by + lx * sinA + ly * cosA;
      if (idx === 0) { stack1.x = wx2; stack1.y = wy2; }
      else           { stack2.x = wx2; stack2.y = wy2; }
    });
  }

  // ── Physics state ─────────────────────────────────
  let truckY = 0, truckVY = 0, truckAngle = 0;
  let prevProgress = 0;
  let active = false;

  // Only run RAF when section is in view
  const io = new IntersectionObserver(entries => {
    active = entries[0].isIntersecting;
  }, { threshold: 0 });
  io.observe(section);

  // ── Main render loop ──────────────────────────────
  function draw() {
    requestAnimationFrame(draw);
    if (!active) return;

    const progress  = getProgress();
    const worldOff  = progress * W * 2.8;   // how far terrain has scrolled
    const truckX    = W * 0.40;

    // Ground Y at truck position
    const groundY   = tY(truckX + worldOff, 2);

    // Spring physics — truck follows terrain
    truckVY += (groundY - truckY) * 0.30;
    truckVY *= 0.70;
    truckY  += truckVY;

    // Slope → rotation
    const dy = tY(truckX + worldOff + 22, 2) - tY(truckX + worldOff - 22, 2);
    truckAngle += (Math.atan2(dy, 44) * 0.55 - truckAngle) * 0.18;

    // ── Draw ─────────────────────────────────────────
    ctx.clearRect(0, 0, W, H);

    // Sky gradient
    const sky = ctx.createLinearGradient(0, 0, 0, H * 0.62);
    sky.addColorStop(0,   '#060810');
    sky.addColorStop(0.5, '#0c1220');
    sky.addColorStop(1,   '#131812');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H * 0.62);

    // Stars
    ctx.fillStyle = 'rgba(210,215,230,0.5)';
    for (let i = 0; i < 70; i++) {
      const sx = (i * 173.3 + worldOff * 0.02) % W;
      const sy = (i * 97.1) % (H * 0.48);
      ctx.beginPath();
      ctx.arc(sx, sy, i % 4 === 0 ? 1.1 : 0.5, 0, Math.PI*2);
      ctx.fill();
    }

    // Far mountain layer
    drawTerrain(worldOff * 0.18, 0);

    // Mid terrain layer
    drawTerrain(worldOff * 0.45, 1);
    drawRocks(worldOff * 0.45, 1);

    // Dust (emitted behind truck, draw before truck so truck is on top)
    drawParticles(dustPool, '145,115,72', '120,92,55');

    // Near terrain (ground)
    drawTerrain(worldOff, 2);
    drawRocks(worldOff, 2);

    // Truck
    const s = clamp(W / 1200, 0.55, 1.1);
    drawTruck(truckX, truckY, truckAngle, s);

    // Exhaust (drawn after truck so it sits on top)
    drawParticles(exhaustPool, '215,205,190', '185,178,165');

    // Vignette
    const vig = ctx.createRadialGradient(W/2, H/2, H*0.15, W/2, H/2, H*0.85);
    vig.addColorStop(0.5, 'rgba(8,8,8,0)');
    vig.addColorStop(1,   'rgba(8,8,8,0.7)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, W, H);

    // ── Particle emission ─────────────────────────────
    const speed = Math.abs(progress - prevProgress);
    if (speed > 0.0008) {
      // Exhaust from both stacks (exact world positions set by drawTruck)
      if (Math.random() < 0.6) spawnExhaust(stack1.x, stack1.y);
      if (Math.random() < 0.5) spawnExhaust(stack2.x, stack2.y);
      // Dust from rear wheels
      if (Math.random() < 0.8) {
        const cosA = Math.cos(truckAngle), sinA = Math.sin(truckAngle);
        [[-62, 0], [-73, 0], [-168, 0]].forEach(([wx, wy]) => {
          const wS = s;
          const dx = truckX + (wx*wS)*cosA - (wy*wS)*sinA;
          const dy2 = truckY + (wx*wS)*sinA + (wy*wS)*cosA;
          if (Math.random() < 0.6) spawnDust(dx, dy2);
        });
      }
    }
    prevProgress = progress;

    // Progress bar
    const bar = $('#drive-bar');
    if (bar) bar.style.width = (progress * 100) + '%';
  }

  // Init truck Y
  truckY = tY(W * 0.4, 2);
  draw();
}
initDrive();

/* ─── SCROLL REVEALS ─────────────────────────────── */
function initReveal() {
  const targets = [
    '.field-text', '.field-stat-pill',
    '.contact-header', '.contact-meta', '.contact-form',
    '.big-label'
  ];
  targets.forEach(sel => {
    $$(sel).forEach((el, i) => {
      el.classList.add('will-reveal');
      el.style.transitionDelay = `${i * 0.07}s`;
    });
  });

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('revealed');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  $$('.will-reveal').forEach(el => io.observe(el));
}
initReveal();

/* ─── FORM ───────────────────────────────────────── */
$('#cform').addEventListener('submit', e => {
  e.preventDefault();
  const s = $('#fstatus');
  s.textContent = '// TRANSMISSION RECEIVED';
  e.target.reset();
  setTimeout(() => { s.textContent = ''; }, 6000);
});
