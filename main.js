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

/* ─── STEAM CANVAS ───────────────────────────────── */
function initSteam() {
  const c = $('#steam');
  if (!c) return;
  const ctx = c.getContext('2d');
  const puffs = [];

  function resize() {
    c.width  = c.offsetWidth  || c.parentElement.offsetWidth;
    c.height = c.offsetHeight || c.parentElement.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function add(x, y) {
    puffs.push({
      x, y,
      vx: (Math.random() - .42) * .7,
      vy: -(1 + Math.random() * 1.4),
      r: 8 + Math.random() * 10,
      a: .2 + Math.random() * .15,
      g: .5 + Math.random() * .9,
      life: 1, decay: .006 + Math.random() * .004
    });
  }

  (function loop() {
    ctx.clearRect(0, 0, c.width, c.height);
    const ex = c.width * .2, ey = c.height * .72;
    if (Math.random() < .4) add(ex + (Math.random() - .5) * 14, ey);
    if (Math.random() < .2) add(ex + 22 + (Math.random() - .5) * 9, ey - 6);

    for (let i = puffs.length - 1; i >= 0; i--) {
      const p = puffs[i];
      p.x += p.vx; p.y += p.vy; p.r += p.g; p.life -= p.decay;
      if (p.life <= 0) { puffs.splice(i, 1); continue; }
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
      g.addColorStop(0, `rgba(220,210,195,${p.life * p.a})`);
      g.addColorStop(1, `rgba(220,210,195,0)`);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
    }
    requestAnimationFrame(loop);
  })();
}
initSteam();

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
