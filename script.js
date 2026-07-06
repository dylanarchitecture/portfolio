/*
  Van der Laan Plastic Number  ψ ≈ 1.3247
  x³ = x + 1
*/

const PSI = 1.3247;

// ── PROPORTIONAL LINE SYSTEM ──────────────────────────────────────────────
function drawProportionalLines() {
  document.querySelectorAll('.pn-line').forEach(l => l.remove());
  const totalHeight = document.body.scrollHeight;
  const base = 57;
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


// ── NAV BORDER ON SCROLL ──────────────────────────────────────────────────
const nav = document.querySelector('nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.style.borderBottom = window.scrollY > 60
      ? '0.5px solid #E0DDD8'
      : 'none';
  }, { passive: true });
}


// ── SCROLL REVEAL ─────────────────────────────────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 60);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.reveal, .project-entry').forEach(el => {
  revealObserver.observe(el);
});


// ── VIDEO HOVER-TO-PLAY ───────────────────────────────────────────────────
document.querySelectorAll('.entry-media').forEach(media => {
  const video = media.querySelector('video');
  const entry = media.closest('.project-entry');
  if (!video || !entry) return;

  const hasSource = video.querySelector('source') !== null;

  entry.addEventListener('mouseenter', () => {
    if (hasSource) {
      video.play().catch(() => {});
      media.classList.add('playing');
    }
  });

  entry.addEventListener('mouseleave', () => {
    if (hasSource) {
      video.pause();
      media.classList.remove('playing');
    }
  });
});


// ── PROJECT PAGE: AUTOPLAY HERO VIDEO ────────────────────────────────────
const heroVideo = document.querySelector('.project-hero-media video');
if (heroVideo && heroVideo.querySelector('source')) {
  heroVideo.play().catch(() => {});
  heroVideo.addEventListener('canplay', () => heroVideo.classList.add('loaded'));
}


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

document.querySelectorAll('.project-figure img, .project-images img').forEach(img => {
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

document.querySelectorAll('a, .entry-media').forEach(el => {
  el.addEventListener('mouseenter', () => cursor.classList.add('cursor-grow'));
  el.addEventListener('mouseleave', () => cursor.classList.remove('cursor-grow'));
});
