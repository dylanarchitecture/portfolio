// ── SCROLL REVEAL ──
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, i * 80);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ── NAV BORDER ON SCROLL ──
const nav = document.querySelector('nav');
window.addEventListener('scroll', () => {
  nav.style.borderBottom = window.scrollY > 60
    ? '1px solid #E0DDD8'
    : 'none';
});

// ── PARALLAX ON PROJECT IMAGES ──
function updateParallax() {
  document.querySelectorAll('.proj-img img').forEach(img => {
    const rect = img.closest('.proj-img').getBoundingClientRect();
    const center = rect.top + rect.height / 2 - window.innerHeight / 2;
    const offset = center * 0.08;
    img.style.transform = `translateY(${offset}px) scale(1.12)`;
  });
}
window.addEventListener('scroll', updateParallax, { passive: true });
updateParallax();

// ── PROJECT HOVER OVERLAY ──
document.querySelectorAll('.project-row').forEach(row => {
  const imgWrap = row.querySelector('.proj-img');
  const title   = row.querySelector('.proj-title')?.textContent || '';
  const meta    = row.querySelector('.proj-meta')?.textContent.split('\n')[0] || '';

  // Build overlay
  const overlay = document.createElement('div');
  overlay.className = 'proj-overlay';
  overlay.innerHTML = `<span class="overlay-title">${title}</span><span class="overlay-meta">${meta}</span>`;
  imgWrap.appendChild(overlay);
});

// ── CURSOR FOLLOWER ──
const cursor = document.createElement('div');
cursor.className = 'cursor-dot';
document.body.appendChild(cursor);

let mx = 0, my = 0, cx = 0, cy = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX;
  my = e.clientY;
});

function animateCursor() {
  cx += (mx - cx) * 0.12;
  cy += (my - cy) * 0.12;
  cursor.style.transform = `translate(${cx}px, ${cy}px)`;
  requestAnimationFrame(animateCursor);
}
animateCursor();

// Grow cursor on hoverable elements
document.querySelectorAll('a, .proj-img, button').forEach(el => {
  el.addEventListener('mouseenter', () => cursor.classList.add('cursor-grow'));
  el.addEventListener('mouseleave', () => cursor.classList.remove('cursor-grow'));
});

// ── SMOOTH COUNTER ON PROJECT NUMBERS ──
document.querySelectorAll('.proj-num').forEach(el => {
  el.style.opacity = '0';
  el.style.transition = 'opacity 0.6s ease';
});

const numObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.proj-num').forEach(el => numObserver.observe(el));
