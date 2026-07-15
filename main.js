// Smooth scroll for nav links
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// Contact form
document.getElementById('contact-form').addEventListener('submit', e => {
  e.preventDefault();
  const status = document.getElementById('form-status');
  status.textContent = 'Message sent. We will be in touch.';
  e.target.reset();
  setTimeout(() => { status.textContent = ''; }, 5000);
});

// Divisions dropdown
const dropdown = document.querySelector('.nav-dropdown');
if (dropdown) {
  const toggle = dropdown.querySelector('.nav-drop-toggle');
  toggle.addEventListener('click', e => {
    e.stopPropagation();
    const open = dropdown.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
  });
  // Close on outside click or when a menu item is chosen
  document.addEventListener('click', () => {
    dropdown.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  });
  dropdown.querySelectorAll('.nav-menu a').forEach(a =>
    a.addEventListener('click', () => dropdown.classList.remove('open'))
  );
}

// Header shadow on scroll
window.addEventListener('scroll', () => {
  document.querySelector('header').style.boxShadow =
    window.scrollY > 10 ? '0 4px 20px rgba(33,65,75,0.08)' : 'none';
});
