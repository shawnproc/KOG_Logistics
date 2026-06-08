// ===== NAV SCROLL =====
window.addEventListener('scroll', () => {
  document.getElementById('nav').classList.toggle('scrolled', window.scrollY > 60);
  parallaxBgs();
});

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});

// ===== PARALLAX =====
function parallaxBgs() {
  document.querySelectorAll('.scene-bg.parallax').forEach(el => {
    const section = el.closest('.scene');
    const rect = section.getBoundingClientRect();
    const speed = parseFloat(el.dataset.speed) || 0.3;
    const offset = (window.innerHeight / 2 - rect.top - rect.height / 2) * speed;
    el.style.transform = `translateY(${offset}px)`;
  });
}
parallaxBgs();

// ===== HUD LIVE ETA =====
function updateHUD() {
  const eta = document.getElementById('eta');
  const spd = document.getElementById('speed');
  if (eta) {
    const now = new Date();
    const mins = (now.getMinutes() + 47) % 60;
    const hrs  = (now.getHours() + (now.getMinutes() + 47 >= 60 ? 1 : 0)) % 24;
    eta.textContent = `${String(hrs).padStart(2,'0')}:${String(mins).padStart(2,'0')}`;
  }
  if (spd) {
    const base = 68;
    const jitter = Math.floor(Math.random() * 7) - 2;
    spd.textContent = `${base + jitter} MPH`;
  }
}
updateHUD();
setInterval(updateHUD, 4000);

// ===== STEAM / EXHAUST CANVAS =====
const steamCanvas = document.getElementById('steam-canvas');
if (steamCanvas) {
  const sCtx = steamCanvas.getContext('2d');

  function resizeSteam() {
    steamCanvas.width  = steamCanvas.offsetWidth;
    steamCanvas.height = steamCanvas.offsetHeight;
  }
  resizeSteam();
  window.addEventListener('resize', resizeSteam);

  const puffs = [];

  function spawnPuff(x, y) {
    puffs.push({
      x, y,
      vx: (Math.random() - 0.4) * 0.6,
      vy: -(0.8 + Math.random() * 1.2),
      r:  8 + Math.random() * 12,
      alpha: 0.28 + Math.random() * 0.18,
      grow: 0.6 + Math.random() * 0.8,
      life: 1
    });
  }

  // Spawn points — bottom-left area (simulating truck exhaust stacks)
  function steamLoop() {
    sCtx.clearRect(0, 0, steamCanvas.width, steamCanvas.height);

    const ex = steamCanvas.width * 0.18;
    const ey = steamCanvas.height * 0.72;

    if (Math.random() < 0.35) spawnPuff(ex + (Math.random() - 0.5) * 12, ey);
    if (Math.random() < 0.18) spawnPuff(ex + 18 + (Math.random() - 0.5) * 8, ey - 5);

    puffs.forEach((p, i) => {
      p.x += p.vx;
      p.y += p.vy;
      p.r  += p.grow;
      p.life -= 0.007;
      p.alpha = p.life * 0.3;

      const grad = sCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
      grad.addColorStop(0, `rgba(210,200,185,${p.alpha})`);
      grad.addColorStop(1, `rgba(210,200,185,0)`);
      sCtx.beginPath();
      sCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      sCtx.fillStyle = grad;
      sCtx.fill();

      if (p.life <= 0) puffs.splice(i, 1);
    });

    requestAnimationFrame(steamLoop);
  }
  steamLoop();
}

// ===== SCROLL REVEAL =====
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('revealed');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.cap, .stat, .terrain-left, .contact-left, .contact-right, .pull-quote').forEach((el, i) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${i * 0.07}s, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${i * 0.07}s`;
  el.classList.add('will-reveal');
  revealObs.observe(el);
});

document.addEventListener('animationend', () => {}, { once: true });

// Inject revealed styles
const style = document.createElement('style');
style.textContent = '.revealed { opacity: 1 !important; transform: translateY(0) !important; }';
document.head.appendChild(style);

// ===== COUNTER ANIMATION =====
const counterObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    const target = parseInt(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    let start = null;
    const anim = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / 1600, 1);
      const ease = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.floor(ease * target) + suffix;
      if (p < 1) requestAnimationFrame(anim);
      else el.textContent = target + suffix;
    };
    requestAnimationFrame(anim);
    counterObs.unobserve(el);
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-figure').forEach(el => counterObs.observe(el));

// ===== CONTACT FORM =====
document.getElementById('contact-form').addEventListener('submit', e => {
  e.preventDefault();
  const s = document.getElementById('form-status');
  s.textContent = '// TRANSMISSION RECEIVED — WE WILL BE IN CONTACT SHORTLY';
  e.target.reset();
  setTimeout(() => { s.textContent = ''; }, 7000);
});
