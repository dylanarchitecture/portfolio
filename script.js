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


// ── IMAGE PARALLAX ────────────────────────────────────────────────────────
function updateParallax() {
  document.querySelectorAll('.proj-img img').forEach(img => {
    const rect = img.closest('.proj-img').getBoundingClientRect();
    const centre = rect.top + rect.height / 2 - window.innerHeight / 2;
    img.style.transform = `translateY(${centre * 0.07}px) scale(1.12)`;
  });
}
window.addEventListener('scroll', updateParallax, { passive: true });
updateParallax();


// ── PROJECT HOVER OVERLAY ─────────────────────────────────────────────────
document.querySelectorAll('.project-row').forEach(row => {
  const imgWrap = row.querySelector('.proj-img');
  if (!imgWrap) return;
  const title = row.querySelector('.proj-title')?.textContent || '';
  const meta  = row.querySelector('.proj-meta')?.textContent.split('\n')[0] || '';

  const overlay = document.createElement('div');
  overlay.className = 'proj-overlay';
  overlay.innerHTML =
    `<span class="overlay-title">${title}</span>` +
    `<span class="overlay-meta">${meta}</span>`;
  imgWrap.appendChild(overlay);
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


// ── PROJECT NUMBER FADE IN ────────────────────────────────────────────────
const numObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.style.opacity = '1';
  });
}, { threshold: 0.5 });

document.querySelectorAll('.proj-num').forEach(el => {
  el.style.cssText += 'opacity:0; transition: opacity 0.6s ease;';
  numObserver.observe(el);
});
