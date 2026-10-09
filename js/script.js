// Año actual en el footer
document.getElementById('year').textContent = new Date().getFullYear();

// Menú móvil
const burger = document.getElementById('burger');
const nav = document.getElementById('nav');

function setMenuOpen(open) {
  nav.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', String(open));
  burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
}

burger.addEventListener('click', () => setMenuOpen(!nav.classList.contains('open')));

// Cerrar menú al hacer clic en un enlace
document.querySelectorAll('.nav a').forEach(link => {
  link.addEventListener('click', () => setMenuOpen(false));
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && nav.classList.contains('open')) {
    setMenuOpen(false);
    burger.focus();
  }
});

window.matchMedia('(max-width: 720px)').addEventListener('change', () => setMenuOpen(false));

// Cambiar fondo del header al hacer scroll
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  if (window.scrollY > 40) {
    header.style.background = 'rgba(11, 26, 51, 0.98)';
  } else {
    header.style.background = 'rgba(11, 26, 51, 0.92)';
  }
});

// Animación de aparición al hacer scroll
const revealEls = document.querySelectorAll('.servicio-card, .galeria__item, .video-card, .badge');
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealEls.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
}
