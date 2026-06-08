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

  // ── Load truck SVG as image ───────────────────────
  // SVG viewBox: 0 0 520 192
  // Rotation pivot = midpoint of wheelbase at ground:
  //   front wheel x=464, drive wheel x=233 → pivot SVG x≈348
  //   ground line y=185 in SVG
  // Exhaust stack tips (SVG coords): stack1=(271,4)  stack2=(287,6)
  const SVG_W = 520, SVG_H = 192;
  const PIVOT_X = 348, PIVOT_Y = 185;   // in SVG space
  const STACK1 = { x: 271, y: 4  };
  const STACK2 = { x: 287, y: 6  };
  const DUST_WHEELS = [
    { x: 233, y: 185 },   // drive axle
    { x: 63,  y: 185 },   // trailer rear
  ];

  const truckImg = new Image();
  truckImg.src = 'truck.svg';

  // ── Terrain ──────────────────────────────────────
  function tY(worldX, layer) {
    const configs = [
      { base: 0.58, freqs: [0.00042, 0.00088, 0.0028 ], amps: [55, 28, 9 ] },
      { base: 0.70, freqs: [0.00065, 0.0016,  0.0055 ], amps: [62, 32, 11] },
      { base: 0.81, freqs: [0.0011,  0.0028,  0.011  ], amps: [44, 20, 7 ] },
    ];
    const c = configs[layer];
    return H * c.base + c.freqs.reduce((s, f, i) =>
      s + Math.sin(worldX * f * Math.PI * 2) * c.amps[i], 0);
  }

  function drawTerrain(worldOffset, layer) {
    const pal = [
      ['#0e1018','#0a0c14'],
      ['#131510','#0f110d'],
      ['#1c1810','#141008'],
    ];
    ctx.beginPath();
    ctx.moveTo(0, H);
    for (let x = 0; x <= W; x += 3) ctx.lineTo(x, tY(x + worldOffset, layer));
    ctx.lineTo(W, H); ctx.closePath();
    const g = ctx.createLinearGradient(0, H * 0.52, 0, H);
    g.addColorStop(0, pal[layer][0]);
    g.addColorStop(1, pal[layer][1]);
    ctx.fillStyle = g; ctx.fill();
  }

  function drawRocks(worldOffset, layer) {
    for (let i = 0; i < 20; i++) {
      const wx = (i * 1847 + layer * 431) % (W * 3);
      const rx = ((wx - worldOffset * (layer === 2 ? 1 : 0.4)) % (W + 240) + W + 240) % (W + 240) - 120;
      const ry = tY(wx + worldOffset * (layer === 2 ? 1 : 0.4), layer);
      const rs = (3 + (i % 5) * 2.8) * (layer * 0.5 + 0.6);
      ctx.beginPath();
      ctx.ellipse(rx, ry - rs * 0.35, rs * 1.4, rs * 0.75, (i % 4) * 0.45, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${18+(i%4)*4},${16+(i%3)*3},12,0.88)`;
      ctx.fill();
    }
  }

  // ── Scroll progress ───────────────────────────────
  function getProgress() {
    const rect  = section.getBoundingClientRect();
    return clamp(-rect.top / (section.offsetHeight - H), 0, 1);
  }

  // ── Particles ─────────────────────────────────────
  const exhaust = [], dust = [];

  function spawnExhaust(x, y) {
    exhaust.push({ x, y,
      vx: -0.35 - Math.random() * 0.55,
      vy: -(1.2 + Math.random() * 1.5),
      r: 6 + Math.random() * 8, grow: 0.5 + Math.random() * 0.7,
      a: 0.25 + Math.random() * 0.13, life: 1,
      decay: 0.007 + Math.random() * 0.005 });
  }

  function spawnDust(x, y) {
    dust.push({ x, y,
      vx: -1.6 - Math.random() * 2.2,
      vy: -0.4 - Math.random() * 0.7,
      r: 3 + Math.random() * 5, grow: 0.45 + Math.random() * 0.55,
      a: 0.3 + Math.random() * 0.2, life: 1,
      decay: 0.02 + Math.random() * 0.012 });
  }

  function tickParticles(pool, rgb1, rgb2) {
    for (let i = pool.length - 1; i >= 0; i--) {
      const p = pool[i];
      p.x += p.vx; p.y += p.vy; p.r += p.grow; p.life -= p.decay;
      if (p.life <= 0) { pool.splice(i, 1); continue; }
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
      g.addColorStop(0,   `rgba(${rgb1},${p.life * p.a})`);
      g.addColorStop(0.5, `rgba(${rgb2},${p.life * p.a * 0.5})`);
      g.addColorStop(1,   `rgba(${rgb2},0)`);
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fillStyle = g; ctx.fill();
    }
  }

  // ── Draw truck SVG via drawImage ──────────────────
  // Rotation is around the pivot point (wheelbase midpoint at ground).
  // All particle spawn positions are derived from SVG coords after rotation.
  let stack1 = {x:0,y:0}, stack2 = {x:0,y:0};
  const dustSpawns = DUST_WHEELS.map(() => ({x:0,y:0}));

  function drawTruck(cx, cy, angle, s) {
    if (!truckImg.complete) return;

    const dW = SVG_W * s, dH = SVG_H * s;
    // Offset from pivot to top-left of image (in local/unrotated space)
    const offX = -PIVOT_X * s;
    const offY = -PIVOT_Y * s;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.drawImage(truckImg, offX, offY, dW, dH);
    ctx.restore();

    // Compute world-space positions of stack tips and dust wheels
    // after applying the same translate+rotate
    const cosA = Math.cos(angle), sinA = Math.sin(angle);
    function toWorld(svgX, svgY) {
      const lx = (svgX - PIVOT_X) * s;
      const ly = (svgY - PIVOT_Y) * s;
      return { x: cx + lx*cosA - ly*sinA,
               y: cy + lx*sinA + ly*cosA };
    }
    stack1 = toWorld(STACK1.x, STACK1.y);
    stack2 = toWorld(STACK2.x, STACK2.y);
    DUST_WHEELS.forEach((w, i) => { dustSpawns[i] = toWorld(w.x, w.y); });
  }

  // ── Physics state ─────────────────────────────────
  let truckY = 0, truckVY = 0, truckAngle = 0;
  let prevProgress = 0;
  let active = false;

  const io = new IntersectionObserver(e => { active = e[0].isIntersecting; }, { threshold: 0 });
  io.observe(section);

  function draw() {
    requestAnimationFrame(draw);
    if (!active) return;

    const progress = getProgress();
    const worldOff = progress * W * 2.6;
    const truckX   = W * 0.40;

    // Terrain-following spring
    const groundY = tY(truckX + worldOff, 2);
    truckVY += (groundY - truckY) * 0.28;
    truckVY *= 0.72;
    truckY  += truckVY;

    // Slope angle
    const dSlope = tY(truckX + worldOff + 24, 2) - tY(truckX + worldOff - 24, 2);
    truckAngle  += (Math.atan2(dSlope, 48) * 0.52 - truckAngle) * 0.16;

    // Clear
    ctx.clearRect(0, 0, W, H);

    // Sky
    const sky = ctx.createLinearGradient(0, 0, 0, H * 0.60);
    sky.addColorStop(0,   '#060810');
    sky.addColorStop(0.5, '#0c1220');
    sky.addColorStop(1,   '#131812');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H * 0.60);

    // Stars (shift slightly with world for parallax feel)
    ctx.fillStyle = 'rgba(210,215,235,0.55)';
    for (let i = 0; i < 80; i++) {
      const sx = ((i * 173.3 + worldOff * 0.015) % (W + 20) + W + 20) % (W + 20);
      const sy = (i * 91.7) % (H * 0.46);
      ctx.beginPath();
      ctx.arc(sx, sy, i % 5 === 0 ? 1.1 : 0.5, 0, Math.PI*2);
      ctx.fill();
    }

    // Terrain layers
    drawTerrain(worldOff * 0.16, 0);
    drawTerrain(worldOff * 0.42, 1);
    drawRocks(worldOff * 0.42, 1);

    // Dust (behind truck — draw before truck)
    tickParticles(dust, '148,118,74', '118,90,52');

    // Near ground
    drawTerrain(worldOff, 2);
    drawRocks(worldOff, 2);

    // Scale truck to viewport
    const s = clamp(W / 1100, 0.52, 1.05);
    drawTruck(truckX, truckY, truckAngle, s);

    // Exhaust (on top of truck)
    tickParticles(exhaust, '215,207,194', '188,180,166');

    // Vignette
    const vig = ctx.createRadialGradient(W/2, H/2, H*0.12, W/2, H/2, H*0.86);
    vig.addColorStop(0.5, 'rgba(8,8,8,0)');
    vig.addColorStop(1,   'rgba(8,8,8,0.65)');
    ctx.fillStyle = vig; ctx.fillRect(0, 0, W, H);

    // Emit particles (only while scrolling)
    const speed = Math.abs(progress - prevProgress);
    if (speed > 0.0006) {
      if (Math.random() < 0.6) spawnExhaust(stack1.x, stack1.y);
      if (Math.random() < 0.5) spawnExhaust(stack2.x, stack2.y);
      dustSpawns.forEach(sp => { if (Math.random() < 0.65) spawnDust(sp.x, sp.y); });
    }
    prevProgress = progress;

    // Progress bar
    const bar = $('#drive-bar');
    if (bar) bar.style.width = (progress * 100) + '%';
  }

  truckImg.onload = () => {
    truckY = tY(W * 0.4, 2);
    draw();
  };
  // Fallback if already cached
  if (truckImg.complete) { truckY = tY(W * 0.4, 2); draw(); }
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
