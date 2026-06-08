/* ============================================================
   KOG — main.js
   Techniques: scroll-driven image expansion, fake-3D parallax,
   zoom depth, multi-speed layers, cinematic timing (0.6–1.2s)
============================================================ */

// ── Utility ──────────────────────────────────────────────────
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const map = (v, a, b, c, d) => c + ((v - a) / (b - a)) * (d - c);

// ── Scroll state ─────────────────────────────────────────────
let scrollY = window.scrollY;
let targetScrollY = scrollY;
let raf;

function tick() {
  scrollY = lerp(scrollY, targetScrollY, 0.09); // smooth inertia
  updateAll();
  raf = requestAnimationFrame(tick);
}

window.addEventListener('scroll', () => {
  targetScrollY = window.scrollY;
}, { passive: true });

// ── NAV ──────────────────────────────────────────────────────
function updateNav() {
  $('#nav').classList.toggle('scrolled', targetScrollY > 60);
}

// ── HERO — 3-layer multi-speed parallax ──────────────────────
const lSky = $('#l-sky');
const lMid = $('#l-mid');
const lFg  = $('#l-fg');

function updateHeroParallax() {
  const progress = clamp(scrollY / window.innerHeight, 0, 1);
  // Sky (slowest), mid (medium), fg (fastest) — each at different speed
  if (lSky) lSky.style.transform = `translate3d(0, ${progress * 12}%, 0)`;
  if (lMid) lMid.style.transform = `translate3d(0, ${progress * 28}%, 0)`;
  // Zoom mid layer as hero scrolls out — creates depth pull
  const zoom = lerp(1, 1.12, progress);
  if (lMid) lMid.style.transform = `translate3d(0, ${progress * 28}%, 0) scale(${zoom})`;
}

// ── EXPAND SECTIONS — image scale on scroll ───────────────────
// As section enters and moves through viewport, image scales from 1.08 → 1.0 (or zooms in)
function updateExpandImg(imgEl, wrapEl, zoomIn = false) {
  if (!imgEl || !wrapEl) return;
  const rect = wrapEl.getBoundingClientRect();
  const vh   = window.innerHeight;
  // progress: 0 when bottom of section hits bottom of viewport → 1 when top hits top
  const progress = clamp(map(rect.top, vh, -rect.height, 0, 1), 0, 1);

  let scale;
  if (zoomIn) {
    // zoom in as you scroll down (hero-style pull)
    scale = lerp(1.0, 1.14, progress);
  } else {
    // expand from compressed to full as section rises into view
    scale = lerp(1.1, 1.0, clamp(map(rect.top, vh * 0.8, 0, 0, 1), 0, 1));
  }
  imgEl.style.transform = `scale(${scale})`;
}

// ── CAPABILITIES — each card image expands as it scrolls in ──
function updateCapCards() {
  $$('.cap-card').forEach(card => {
    const rect = card.getBoundingClientRect();
    const vh   = window.innerHeight;
    const inView = rect.top < vh * 0.85 && rect.bottom > 0;

    if (inView && !card.classList.contains('in-view')) {
      card.classList.add('in-view');
    }
  });
}

// ── SCROLL REVEALS ────────────────────────────────────────────
// data-delay on hero elements handled by CSS animation-delay
function triggerHeroReveals() {
  $$('[data-delay]').forEach(el => {
    const delay = parseFloat(el.dataset.delay) * 180; // ms stagger
    setTimeout(() => el.classList.add('revealed'), delay + 200);
  });
}

// IntersectionObserver for below-hero reveals
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const delay = parseFloat(e.target.dataset.revealDelay || 0);
      setTimeout(() => e.target.classList.add('revealed'), delay);
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });

function setupRevealTargets() {
  // Terrain copy
  const terrainCopy = $('#terrain-copy');
  if (terrainCopy) {
    terrainCopy.classList.add('reveal-left');
    terrainCopy.dataset.revealDelay = '0';
    io.observe(terrainCopy);
  }
  // Stats rows
  $$('.stat-block, .pull').forEach((el, i) => {
    el.classList.add('reveal-up');
    el.dataset.revealDelay = String(i * 80);
    io.observe(el);
  });
  // Contact
  const cl = $('.contact-l');
  const cr = $('.contact-r');
  if (cl) { cl.dataset.revealDelay = '0'; io.observe(cl); }
  if (cr) { cr.dataset.revealDelay = '150'; io.observe(cr); }
}

// ── COUNTER ANIMATION ─────────────────────────────────────────
const cio = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    const target = parseInt(el.dataset.target);
    const suf    = el.dataset.suf || '';
    let start = null;
    const anim = ts => {
      if (!start) start = ts;
      const p    = clamp((ts - start) / 1600, 0, 1);
      const ease = 1 - Math.pow(1 - p, 4); // ease-out quart
      el.textContent = Math.floor(ease * target) + suf;
      if (p < 1) requestAnimationFrame(anim);
      else el.textContent = target + suf;
    };
    requestAnimationFrame(anim);
    cio.unobserve(el);
  });
}, { threshold: 0.5 });

$$('.stat-n').forEach(el => cio.observe(el));

// ── LIVE HUD ──────────────────────────────────────────────────
function updateHUD() {
  const etaEl = $('#eta'), spdEl = $('#spd');
  if (etaEl) {
    const now  = new Date();
    const mFwd = (now.getMinutes() + 47) % 60;
    const hFwd = (now.getHours() + (now.getMinutes() + 47 >= 60 ? 1 : 0)) % 24;
    etaEl.textContent = `${String(hFwd).padStart(2,'0')}:${String(mFwd).padStart(2,'0')}`;
  }
  if (spdEl) spdEl.textContent = `${66 + Math.floor(Math.random() * 9)} MPH`;
}
updateHUD();
setInterval(updateHUD, 4500);

// ── STEAM / EXHAUST CANVAS ────────────────────────────────────
const steamCanvas = $('#steam');
if (steamCanvas) {
  const sc = steamCanvas.getContext('2d');
  const puffs = [];

  function resizeSteam() {
    steamCanvas.width  = steamCanvas.offsetWidth;
    steamCanvas.height = steamCanvas.offsetHeight;
  }
  resizeSteam();
  window.addEventListener('resize', resizeSteam);

  function addPuff(x, y) {
    puffs.push({
      x, y,
      vx: (Math.random() - 0.45) * 0.65,
      vy: -(0.9 + Math.random() * 1.3),
      r:  9 + Math.random() * 10,
      alpha: 0.22 + Math.random() * 0.15,
      grow: 0.55 + Math.random() * 0.85,
      life: 1,
      decay: 0.006 + Math.random() * 0.004
    });
  }

  function steamLoop() {
    sc.clearRect(0, 0, steamCanvas.width, steamCanvas.height);
    const ex = steamCanvas.width * 0.17;
    const ey = steamCanvas.height * 0.7;
    if (Math.random() < 0.38) addPuff(ex + (Math.random() - .5) * 14, ey);
    if (Math.random() < 0.18) addPuff(ex + 22 + (Math.random() - .5) * 9, ey - 8);

    for (let i = puffs.length - 1; i >= 0; i--) {
      const p = puffs[i];
      p.x += p.vx; p.y += p.vy; p.r += p.grow; p.life -= p.decay;
      if (p.life <= 0) { puffs.splice(i, 1); continue; }
      const g = sc.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
      g.addColorStop(0,   `rgba(215,205,190,${p.life * p.alpha})`);
      g.addColorStop(0.5, `rgba(200,195,180,${p.life * p.alpha * 0.5})`);
      g.addColorStop(1,   `rgba(200,195,180,0)`);
      sc.beginPath();
      sc.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      sc.fillStyle = g;
      sc.fill();
    }
    requestAnimationFrame(steamLoop);
  }
  steamLoop();
}

// ── SMOOTH SCROLL ─────────────────────────────────────────────
$$('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = $(a.getAttribute('href'));
    if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});

// ── FORM ──────────────────────────────────────────────────────
$('#cform').addEventListener('submit', e => {
  e.preventDefault();
  const s = $('#fstatus');
  s.textContent = '// TRANSMISSION RECEIVED — WE WILL BE IN CONTACT SHORTLY';
  e.target.reset();
  setTimeout(() => { s.textContent = ''; }, 7000);
});

// ── MASTER UPDATE LOOP ────────────────────────────────────────
function updateAll() {
  updateNav();
  updateHeroParallax();
  updateExpandImg($('#terrain-img'), $('#terrain-wrap'));
  updateExpandImg($('#stats-img'),   $('#stats-wrap'), true);
  updateCapCards();
}

// ── INIT ──────────────────────────────────────────────────────
triggerHeroReveals();
setupRevealTargets();
tick(); // start RAF loop
