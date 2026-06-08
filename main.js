// ===== TERRAIN & TRUCK SCENE =====
const heroCanvas = document.getElementById('hero-canvas');
const hCtx = heroCanvas.getContext('2d');

function resizeHero() {
  heroCanvas.width = window.innerWidth;
  heroCanvas.height = window.innerHeight;
}
resizeHero();
window.addEventListener('resize', resizeHero);

// --- Terrain generator ---
function buildTerrain(w, h, roughness, seed) {
  const pts = [];
  const segments = 80;
  for (let i = 0; i <= segments; i++) {
    const x = (i / segments) * w;
    const noise =
      Math.sin(i * 0.18 + seed) * 28 +
      Math.sin(i * 0.42 + seed * 1.3) * 14 +
      Math.sin(i * 0.9 + seed * 0.7) * 7 +
      Math.sin(i * 2.1 + seed * 2) * 3;
    pts.push({ x, y: h - 160 + noise * roughness });
  }
  return pts;
}

// --- Truck class ---
class Truck {
  constructor(lane, speed, scale, color) {
    this.lane = lane;       // 0 = far, 1 = mid, 2 = near
    this.speed = speed;
    this.scale = scale;
    this.color = color;
    this.x = -200 * scale;
    this.bounce = 0;
    this.bounceV = 0;
    this.dustParticles = [];
    this.lightFlicker = 1;
  }

  getY(terrain) {
    const idx = Math.min(Math.floor((this.x / heroCanvas.width) * terrain.length), terrain.length - 1);
    return idx >= 0 ? terrain[Math.max(0, idx)].y : heroCanvas.height - 160;
  }

  update(terrain) {
    this.x += this.speed;
    if (this.x > heroCanvas.width + 300) this.x = -300 * this.scale;

    // Terrain-driven bounce
    const ty = this.getY(terrain);
    const slope = terrain[Math.min(Math.floor((this.x / heroCanvas.width) * terrain.length) + 1, terrain.length - 1)]?.y - ty || 0;
    this.bounceV += (slope * 0.04 - this.bounce) * 0.3;
    this.bounceV *= 0.7;
    this.bounce += this.bounceV;
    this.bounce = Math.max(-12, Math.min(12, this.bounce));

    // Headlight flicker
    this.lightFlicker = 0.85 + Math.random() * 0.15;

    // Dust
    if (Math.random() < 0.4) {
      this.dustParticles.push({
        x: this.x - 10 * this.scale,
        y: ty + this.bounce - 5 * this.scale,
        vx: -1.5 - Math.random() * 1.5,
        vy: -0.5 - Math.random(),
        alpha: 0.35,
        r: (3 + Math.random() * 6) * this.scale
      });
    }

    this.dustParticles.forEach(d => {
      d.x += d.vx; d.y += d.vy; d.alpha -= 0.012; d.r += 0.4;
    });
    this.dustParticles = this.dustParticles.filter(d => d.alpha > 0);
  }

  draw(terrain) {
    const ty = this.getY(terrain);
    const bx = this.x;
    const by = ty + this.bounce;
    const s = this.scale;
    const c = hCtx;

    // Dust
    this.dustParticles.forEach(d => {
      c.beginPath();
      c.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      c.fillStyle = `rgba(160,130,80,${d.alpha})`;
      c.fill();
    });

    // Shadow
    c.beginPath();
    c.ellipse(bx, by + 4 * s, 55 * s, 6 * s, 0, 0, Math.PI * 2);
    c.fillStyle = 'rgba(0,0,0,0.4)';
    c.fill();

    // Body
    c.save();
    c.translate(bx, by);

    // Cab
    c.beginPath();
    c.moveTo(-90 * s, 0);
    c.lineTo(-90 * s, -38 * s);
    c.lineTo(-50 * s, -38 * s);
    c.lineTo(-30 * s, -56 * s);
    c.lineTo(20 * s, -56 * s);
    c.lineTo(20 * s, 0);
    c.closePath();
    c.fillStyle = this.color;
    c.fill();

    // Cargo box
    c.beginPath();
    c.rect(20 * s, -48 * s, 80 * s, 48 * s);
    c.fillStyle = this.color;
    c.fill();
    c.strokeStyle = 'rgba(0,0,0,0.3)';
    c.lineWidth = 1.5 * s;
    c.stroke();

    // Cargo ribs
    for (let i = 0; i < 3; i++) {
      c.beginPath();
      c.moveTo((40 + i * 22) * s, -48 * s);
      c.lineTo((40 + i * 22) * s, 0);
      c.strokeStyle = 'rgba(0,0,0,0.2)';
      c.lineWidth = s;
      c.stroke();
    }

    // Windshield
    c.beginPath();
    c.moveTo(-48 * s, -38 * s);
    c.lineTo(-32 * s, -53 * s);
    c.lineTo(16 * s, -53 * s);
    c.lineTo(16 * s, -38 * s);
    c.closePath();
    c.fillStyle = 'rgba(100,160,200,0.35)';
    c.fill();
    c.strokeStyle = 'rgba(0,0,0,0.3)';
    c.lineWidth = s;
    c.stroke();

    // Wheels
    const wheels = [[-65 * s, 0], [-20 * s, 0], [45 * s, 0], [80 * s, 0]];
    wheels.forEach(([wx, wy]) => {
      c.beginPath();
      c.arc(wx, wy, 16 * s, 0, Math.PI * 2);
      c.fillStyle = '#1a1a1a';
      c.fill();
      c.beginPath();
      c.arc(wx, wy, 10 * s, 0, Math.PI * 2);
      c.fillStyle = '#333';
      c.fill();
      c.beginPath();
      c.arc(wx, wy, 5 * s, 0, Math.PI * 2);
      c.fillStyle = '#555';
      c.fill();
    });

    // Headlights
    const hAlpha = this.lightFlicker * 0.9;
    c.beginPath();
    c.arc(-90 * s, -20 * s, 5 * s, 0, Math.PI * 2);
    c.fillStyle = `rgba(255,240,180,${hAlpha})`;
    c.fill();
    c.beginPath();
    c.arc(-92 * s, -20 * s, 18 * s, -Math.PI * 0.35, Math.PI * 0.35);
    const grad = c.createRadialGradient(-92 * s, -20 * s, 0, -92 * s - 60 * s, -20 * s, 70 * s);
    grad.addColorStop(0, `rgba(255,240,180,${0.18 * hAlpha})`);
    grad.addColorStop(1, 'rgba(255,240,180,0)');
    c.fillStyle = grad;
    c.fill();

    c.restore();
  }
}

// --- Lightning ---
let lightning = null;
let lightningTimer = 0;

function triggerLightning() {
  lightning = {
    x: Math.random() * heroCanvas.width,
    alpha: 1,
    bolts: buildBolt(Math.random() * heroCanvas.width, 0, 60)
  };
}

function buildBolt(x, y, depth) {
  if (depth <= 0) return [];
  const segments = [];
  let cx = x, cy = y;
  while (cy < heroCanvas.height * 0.65) {
    const nx = cx + (Math.random() - 0.5) * 80;
    const ny = cy + 20 + Math.random() * 30;
    segments.push({ x1: cx, y1: cy, x2: nx, y2: ny });
    if (Math.random() < 0.3 && depth > 10) {
      segments.push(...buildBolt(nx, ny, depth - 25));
    }
    cx = nx; cy = ny;
  }
  return segments;
}

// --- Rain ---
let rainDrops = [];
for (let i = 0; i < 350; i++) {
  rainDrops.push({
    x: Math.random() * 2000,
    y: Math.random() * 1000,
    len: 12 + Math.random() * 22,
    speed: 18 + Math.random() * 14,
    alpha: 0.15 + Math.random() * 0.25
  });
}

// --- Fog layers ---
let fogOffset = 0;

// --- Main scene draw ---
const terrain0 = buildTerrain(2000, 700, 0.5, 1.2);   // far bg
const terrain1 = buildTerrain(2000, 700, 0.85, 2.7);  // mid
const terrain2 = buildTerrain(2000, 700, 1.2, 4.1);   // near

const trucks = [
  new Truck(0, 1.1, 0.42, '#2a2a2a'),
  new Truck(1, 1.9, 0.65, '#1c3a1c'),
  new Truck(2, 2.8, 1.0, '#2c2c1a'),
];
trucks[0].x = 800;
trucks[1].x = 200;
trucks[2].x = 1400;

function getTerrainY(terrain, px, canvasW) {
  const t = terrain;
  const idx = Math.floor((px / canvasW) * (t.length - 1));
  return t[Math.max(0, Math.min(idx, t.length - 1))].y;
}

function drawTerrainFill(terrain, canvasW, canvasH, fillStyle) {
  hCtx.beginPath();
  hCtx.moveTo(0, canvasH);
  terrain.forEach(p => hCtx.lineTo(p.x * (canvasW / 2000), p.y));
  hCtx.lineTo(canvasW, canvasH);
  hCtx.closePath();
  hCtx.fillStyle = fillStyle;
  hCtx.fill();
}

function sceneLoop() {
  const W = heroCanvas.width;
  const H = heroCanvas.height;
  hCtx.clearRect(0, 0, W, H);

  // Sky gradient — stormy
  const sky = hCtx.createLinearGradient(0, 0, 0, H * 0.7);
  sky.addColorStop(0, '#0a0b0f');
  sky.addColorStop(0.4, '#111520');
  sky.addColorStop(0.7, '#1a1a0f');
  sky.addColorStop(1, '#0d0d08');
  hCtx.fillStyle = sky;
  hCtx.fillRect(0, 0, W, H);

  // Lightning flash on sky
  if (lightning) {
    hCtx.fillStyle = `rgba(180,200,255,${lightning.alpha * 0.15})`;
    hCtx.fillRect(0, 0, W, H);
    lightning.bolts.forEach(b => {
      hCtx.beginPath();
      hCtx.moveTo(b.x1, b.y1);
      hCtx.lineTo(b.x2, b.y2);
      hCtx.strokeStyle = `rgba(200,220,255,${lightning.alpha * 0.9})`;
      hCtx.lineWidth = 1.5;
      hCtx.stroke();
      hCtx.strokeStyle = `rgba(255,255,255,${lightning.alpha * 0.5})`;
      hCtx.lineWidth = 0.5;
      hCtx.stroke();
    });
    lightning.alpha -= 0.06;
    if (lightning.alpha <= 0) lightning = null;
  }

  // Far terrain
  const scaledTerrain0 = terrain0.map(p => ({ x: p.x * (W / 2000), y: H * 0.55 + (p.y - 540) * 0.4 }));
  drawTerrainFill(scaledTerrain0, W, H, 'rgba(18,20,16,0.9)');

  // Far truck
  trucks[0].update(scaledTerrain0);
  trucks[0].draw(scaledTerrain0);

  // Fog layer 1
  fogOffset = (fogOffset + 0.2) % W;
  const fog1 = hCtx.createLinearGradient(0, H * 0.45, 0, H * 0.65);
  fog1.addColorStop(0, 'rgba(20,22,18,0)');
  fog1.addColorStop(0.5, 'rgba(20,22,18,0.55)');
  fog1.addColorStop(1, 'rgba(20,22,18,0)');
  hCtx.fillStyle = fog1;
  hCtx.fillRect(0, H * 0.45, W, H * 0.2);

  // Mid terrain
  const scaledTerrain1 = terrain1.map(p => ({ x: p.x * (W / 2000), y: H * 0.68 + (p.y - 540) * 0.6 }));
  drawTerrainFill(scaledTerrain1, W, H, 'rgba(22,26,18,0.95)');

  // Mid truck
  trucks[1].update(scaledTerrain1);
  trucks[1].draw(scaledTerrain1);

  // Fog layer 2
  const fog2 = hCtx.createLinearGradient(0, H * 0.6, 0, H * 0.8);
  fog2.addColorStop(0, 'rgba(15,18,12,0)');
  fog2.addColorStop(0.5, 'rgba(15,18,12,0.4)');
  fog2.addColorStop(1, 'rgba(15,18,12,0)');
  hCtx.fillStyle = fog2;
  hCtx.fillRect(0, H * 0.6, W, H * 0.2);

  // Near terrain
  const scaledTerrain2 = terrain2.map(p => ({ x: p.x * (W / 2000), y: H * 0.8 + (p.y - 540) * 0.9 }));
  drawTerrainFill(scaledTerrain2, W, H, '#0d0e0b');

  // Near truck
  trucks[2].update(scaledTerrain2);
  trucks[2].draw(scaledTerrain2);

  // Rain
  rainDrops.forEach(d => {
    d.y += d.speed;
    d.x -= d.speed * 0.25;
    if (d.y > H + 40) { d.y = -30; d.x = Math.random() * W; }
    if (d.x < -10) { d.x = W + 10; }

    hCtx.beginPath();
    hCtx.moveTo(d.x, d.y);
    hCtx.lineTo(d.x - d.len * 0.25, d.y + d.len);
    hCtx.strokeStyle = `rgba(160,180,200,${d.alpha})`;
    hCtx.lineWidth = 0.7;
    hCtx.stroke();
  });

  // Vignette
  const vig = hCtx.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, H * 0.85);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(0,0,0,0.75)');
  hCtx.fillStyle = vig;
  hCtx.fillRect(0, 0, W, H);

  requestAnimationFrame(sceneLoop);
}
sceneLoop();

// Lightning timer
setInterval(() => {
  if (Math.random() < 0.35) triggerLightning();
}, 3000);

// ===== NAV SCROLL =====
window.addEventListener('scroll', () => {
  document.getElementById('nav').classList.toggle('scrolled', window.scrollY > 60);
});

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});

// ===== HERO STAGGER =====
window.addEventListener('DOMContentLoaded', () => {
  const lines = document.querySelectorAll('.hero-title span');
  lines.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(40px)';
    el.style.transition = `opacity 0.9s cubic-bezier(0.16,1,0.3,1) ${0.4 + i * 0.22}s, transform 0.9s cubic-bezier(0.16,1,0.3,1) ${0.4 + i * 0.22}s`;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }));
  });
  ['hero-eyebrow', 'hero-sub', 'hero-actions', 'hero-hud'].forEach((cls, i) => {
    const el = document.querySelector('.' + cls);
    if (!el) return;
    el.style.opacity = '0';
    el.style.transition = `opacity 1s ease ${0.2 + i * 0.15}s`;
    requestAnimationFrame(() => requestAnimationFrame(() => { el.style.opacity = '1'; }));
  });
});

// ===== SCROLL FADE =====
const fadeObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.cap-card, .stat-block, .contact-left, .contact-right, .mission-inner').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(28px)';
  el.style.transition = 'opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)';
  fadeObs.observe(el);
});

// ===== COUNTER =====
function animateCounter(el, target, suffix) {
  let start = null;
  const step = (ts) => {
    if (!start) start = ts;
    const p = Math.min((ts - start) / 1400, 1);
    el.innerHTML = Math.floor(p * target) + '<span>' + suffix + '</span>';
    if (p < 1) requestAnimationFrame(step);
    else el.innerHTML = target + '<span>' + suffix + '</span>';
  };
  requestAnimationFrame(step);
}

const cObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, raw = el.textContent.trim();
    if (raw.includes('%')) animateCounter(el, parseInt(raw), '%');
    else if (raw.includes('/7')) animateCounter(el, 24, '/7');
    else if (raw.includes('+')) animateCounter(el, parseInt(raw), '+');
    else animateCounter(el, parseInt(raw), '');
    cObs.unobserve(el);
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-num').forEach(el => cObs.observe(el));

// ===== FORM =====
document.getElementById('contact-form').addEventListener('submit', e => {
  e.preventDefault();
  const s = document.getElementById('form-status');
  s.textContent = '// TRANSMISSION RECEIVED — STANDBY FOR CONTACT';
  e.target.reset();
  setTimeout(() => { s.textContent = ''; }, 6000);
});
