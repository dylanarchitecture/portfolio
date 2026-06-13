/*
  Van der Laan Plastic Number  ψ ≈ 1.3247
  x³ = x + 1

  Proportional lines are drawn at positions that grow by ψ each step,
  starting from the horizontal margin (57px), creating a rhythm across
  the full scroll height of the page — analogous to the wall/void
  intervals in Van der Laan's spatial sequence.
*/

const PSI = 1.3247;

// ── PROPORTIONAL LINE SYSTEM ──────────────────────────────────────────────
function drawProportionalLines() {
  // Remove any existing lines
  document.querySelectorAll('.pn-line').forEach(l => l.remove());

  const totalHeight = document.body.scrollHeight;
  const base = 57; // --p8, the horizontal margin, used as base unit

  let pos = base;
  while (pos < totalHeight) {
    const line = document.createElement('div');
    line.className = 'pn-line';
    line.style.top = Math.round(pos) + 'px';
    document.body.appendChild(line);
    pos = pos * PSI;
  }
}

drawProportionalLines();
window.addEventListener('resize', drawProportionalLines);
window.addEventListener('load', drawProportionalLines);


// ── SCROLL REVEAL ─────────────────────────────────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));


// ── NAV BORDER ON SCROLL ──────────────────────────────────────────────────
const nav = document.querySelector('nav');
window.addEventListener('scroll', () => {
  nav.style.borderBottom = window.scrollY > 60
    ? '0.5px solid #E0DDD8'
    : 'none';
}, { passive: true });


// ── SHUFFLE PROJECTS ──────────────────────────────────────────────────────
const workSection = document.querySelector('.work');
const projectRows = Array.from(workSection.querySelectorAll('.project-row'));
for (let i = projectRows.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [projectRows[i], projectRows[j]] = [projectRows[j], projectRows[i]];
}
projectRows.forEach(row => workSection.appendChild(row));


// ── IMAGE SLIDE-IN ────────────────────────────────────────────────────────
document.querySelectorAll('.project-row').forEach((row, i) => {
  const img = row.querySelector('.proj-img');
  if (img) img.classList.add(i % 2 === 0 ? 'from-left' : 'from-right');
});

const slideObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    entry.target.classList.toggle('in-view', entry.isIntersecting);
  });
}, { threshold: 0.15 });

document.querySelectorAll('.proj-img, .proj-info').forEach(el => {
  slideObserver.observe(el);
});


// ── PROJECT HOVER OVERLAY ─────────────────────────────────────────────────
document.querySelectorAll('.project-row').forEach(row => {
  const heroImg = row.querySelector('.proj-hero-img');
  if (!heroImg) return;
  const title = row.querySelector('.proj-title')?.textContent || '';

  const overlay = document.createElement('div');
  overlay.className = 'proj-overlay';
  overlay.innerHTML = `<span class="overlay-title">${title}</span>`;
  heroImg.appendChild(overlay);
});


// ── EXPAND / COLLAPSE PROJECT IMAGES ──────────────────────────────────────
document.querySelectorAll('.proj-hero-img').forEach(heroImg => {
  heroImg.addEventListener('click', () => {
    const projImg = heroImg.closest('.proj-img');
    if (!projImg.querySelector('.proj-images-expanded')) return;

    if (projImg.classList.contains('expanded')) {
      // Fade images out first, then collapse the grid layout
      projImg.classList.remove('animated');
      setTimeout(() => projImg.classList.remove('expanded'), 420);
    } else {
      // Switch to grid layout, then trigger cascading fade-in via double RAF
      projImg.classList.add('expanded');
      requestAnimationFrame(() => requestAnimationFrame(() => {
        projImg.classList.add('animated');
      }));
      setTimeout(() => {
        window.scrollBy({ top: 100, behavior: 'smooth' });
      }, 300);
    }
  });
});


// ── LIGHTBOX ──────────────────────────────────────────────────────────────
const lightbox = document.createElement('div');
lightbox.className = 'lightbox';
lightbox.innerHTML = '<button class="lightbox-close" aria-label="Close">&#215;</button><div class="lightbox-img-wrap"><img src="" alt=""></div>';
document.body.appendChild(lightbox);

const lbImg = lightbox.querySelector('img');

function openLightbox(src, alt) {
  lbImg.src = src;
  lbImg.alt = alt || '';
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
}

lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

document.querySelectorAll('.proj-images-expanded img').forEach(img => {
  img.addEventListener('click', e => {
    e.stopPropagation();
    openLightbox(img.src, img.alt);
  });
});


// ── CURSOR FOLLOWER ───────────────────────────────────────────────────────
const cursor = document.createElement('div');
cursor.className = 'cursor-dot';
document.body.appendChild(cursor);

let mx = 0, my = 0, cx = 0, cy = 0;

document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

(function animateCursor() {
  cx += (mx - cx) * 0.12;
  cy += (my - cy) * 0.12;
  cursor.style.transform = `translate(${cx}px, ${cy}px)`;
  requestAnimationFrame(animateCursor);
})();

document.querySelectorAll('a, .proj-img').forEach(el => {
  el.addEventListener('mouseenter', () => cursor.classList.add('cursor-grow'));
  el.addEventListener('mouseleave', () => cursor.classList.remove('cursor-grow'));
});


