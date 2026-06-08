// ===== PARTICLE CANVAS =====
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
let particles = [];

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

function randomBetween(a, b) { return a + Math.random() * (b - a); }

function spawnParticle() {
  return {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: randomBetween(0.3, 1.2),
    vx: randomBetween(-0.15, 0.15),
    vy: randomBetween(-0.3, -0.05),
    alpha: randomBetween(0.1, 0.6),
    life: 1,
    decay: randomBetween(0.0008, 0.003)
  };
}

for (let i = 0; i < 120; i++) particles.push(spawnParticle());

function drawParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach((p, i) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(200,168,75,${p.alpha * p.life})`;
    ctx.fill();
    p.x += p.vx;
    p.y += p.vy;
    p.life -= p.decay;
    if (p.life <= 0) particles[i] = spawnParticle();
  });

  // Draw faint connecting lines between nearby particles
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(200,168,75,${0.04 * (1 - dist / 120)})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }
  requestAnimationFrame(drawParticles);
}
drawParticles();

// ===== NAV SCROLL =====
window.addEventListener('scroll', () => {
  document.getElementById('nav').classList.toggle('scrolled', window.scrollY > 60);
});

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ===== HERO TITLE STAGGER =====
window.addEventListener('DOMContentLoaded', () => {
  const lines = document.querySelectorAll('.hero-title span');
  lines.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform += ' translateY(30px)';
    el.style.transition = `opacity 0.8s ease ${0.3 + i * 0.2}s, transform 0.8s ease ${0.3 + i * 0.2}s`;
    setTimeout(() => {
      el.style.opacity = '1';
      el.style.transform = el.style.transform.replace('translateY(30px)', 'translateY(0)');
    }, 50);
  });

  const eyebrow = document.querySelector('.hero-eyebrow');
  eyebrow.style.opacity = '0';
  eyebrow.style.transition = 'opacity 1s ease 0.1s';
  setTimeout(() => { eyebrow.style.opacity = '1'; }, 50);
});

// ===== INTERSECTION OBSERVER — fade in sections =====
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.cap-card, .stat-block, .contact-left, .contact-right').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(el);
});

// ===== COUNTER ANIMATION =====
function animateCounter(el, target, suffix = '') {
  let start = 0;
  const duration = 1500;
  const step = (timestamp) => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    const val = Math.floor(progress * target);
    el.innerHTML = val + '<span>' + suffix + '</span>';
    if (progress < 1) requestAnimationFrame(step);
    else el.innerHTML = target + '<span>' + suffix + '</span>';
  };
  requestAnimationFrame(step);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const el = e.target;
      const raw = el.textContent;
      if (raw.includes('%')) animateCounter(el, parseInt(raw), '%');
      else if (raw.includes('/7')) animateCounter(el, 24, '/7');
      else if (raw.includes('+')) animateCounter(el, parseInt(raw), '+');
      else animateCounter(el, parseInt(raw), '');
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-num').forEach(el => counterObserver.observe(el));

// ===== CONTACT FORM =====
document.getElementById('contact-form').addEventListener('submit', e => {
  e.preventDefault();
  const status = document.getElementById('form-status');
  status.textContent = '// TRANSMISSION RECEIVED — STANDBY FOR CONTACT';
  e.target.reset();
  setTimeout(() => { status.textContent = ''; }, 6000);
});
