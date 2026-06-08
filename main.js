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

// Header shadow on scroll
window.addEventListener('scroll', () => {
  document.querySelector('header').style.boxShadow =
    window.scrollY > 10 ? '0 2px 20px rgba(0,0,0,0.6)' : 'none';
});
