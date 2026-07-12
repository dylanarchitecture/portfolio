/*
  Van der Laan Plastic Number  ψ ≈ 1.3247
  x³ = x + 1
*/

const PSI = 1.3247;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;

// Motion styles are gated behind .js so a no-script visit stays fully readable
document.body.classList.add('js');


// ── PROPORTIONAL LINE SYSTEM ──────────────────────────────────────────────
// ψ-spaced guidelines that draw themselves in as they enter the viewport.
const lineObserver = ('IntersectionObserver' in window)
  ? new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          en.target.classList.add('drawn');
          lineObserver.unobserve(en.target);
        }
      });
    }, { threshold: 0 })
  : null;

function drawProportionalLines() {
  document.querySelectorAll('.pn-line').forEach(l => l.remove());
  const totalHeight = document.body.scrollHeight;
  const base = 57;
  let pos = base;
  while (pos < totalHeight) {
    const line = document.createElement('div');
    line.className = 'pn-line';
    line.style.top = Math.round(pos) + 'px';
    if (reduceMotion || !lineObserver) line.classList.add('drawn');
    document.body.appendChild(line);
    if (!reduceMotion && lineObserver) lineObserver.observe(line);
    pos = pos * PSI;
  }
}

drawProportionalLines();
window.addEventListener('resize', drawProportionalLines);
window.addEventListener('load', drawProportionalLines);


// ── TYPOGRAPHIC SPLIT (character-level reveals) ───────────────────────────
function splitChars(el, baseDelay, step) {
  if (reduceMotion || !el) return;
  el.setAttribute('aria-label', el.textContent.trim());
  const walk = node => {
    Array.from(node.childNodes).forEach(child => {
      if (child.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        for (const ch of child.textContent) {
          if (ch.trim() === '') {
            frag.appendChild(document.createTextNode(ch));
          } else {
            const s = document.createElement('span');
            s.className = 'ch';
            s.setAttribute('aria-hidden', 'true');
            s.textContent = ch;
            frag.appendChild(s);
          }
        }
        child.replaceWith(frag);
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        walk(child);
      }
    });
  };
  walk(el);
  el.querySelectorAll('.ch').forEach((s, i) => {
    s.style.transitionDelay = (baseDelay + i * step).toFixed(3) + 's';
  });
  el.classList.add('split');
}

// Index hero — characters rise one by one
const heroTitle = document.querySelector('.hero-title');
if (heroTitle && !reduceMotion) {
  splitChars(heroTitle, 0.15, 0.05);
  heroTitle.classList.add('is-split');
  requestAnimationFrame(() => requestAnimationFrame(() => {
    heroTitle.classList.add('chars-in');
  }));
}

// Case-study hero title
const projHeroH1 = document.querySelector('.project-hero-title h1');
if (projHeroH1 && !reduceMotion) {
  splitChars(projHeroH1, 0.25, 0.035);
  requestAnimationFrame(() => requestAnimationFrame(() => {
    projHeroH1.classList.add('chars-in');
  }));
}

// Index entry titles — revealed when their entry scrolls in
document.querySelectorAll('.entry-title').forEach(t => splitChars(t, 0.2, 0.028));


// ── FIGURE CHOREOGRAPHY PREP ──────────────────────────────────────────────
// Wipe direction follows position: singles open downward, pairs open
// outward from their shared gutter, trios stagger left to right.
document.querySelectorAll('.project-images > .project-figure').forEach(f => {
  f.classList.add('wipe-up');
});

document.querySelectorAll('.project-figure-pair, .project-figure-trio').forEach(group => {
  group.querySelectorAll('.project-figure').forEach((f, i) => {
    f.classList.add(i === 0 ? 'wipe-left' : i === 1 ? 'wipe-right' : 'wipe-up');
    if (i > 0) f.style.transitionDelay = (i * 0.12).toFixed(2) + 's';
  });
});

// Monograph-style figure numbering, generated from document order
document.querySelectorAll('.project-images figcaption').forEach((cap, i) => {
  const span = document.createElement('span');
  span.className = 'fig-index';
  span.textContent = 'Fig. ' + String(i + 1).padStart(2, '0') + ' —';
  cap.prepend(span, ' ');
});

// Narrative column and footer nav join the reveal system
document.querySelectorAll('.project-narrative, .project-nav').forEach(el => {
  el.classList.add('reveal');
});


// ── NUMERAL TICKER ────────────────────────────────────────────────────────
function tickNumber(el) {
  const target = parseInt(el.textContent, 10);
  if (isNaN(target)) return;
  let n = 0;
  const iv = setInterval(() => {
    el.textContent = String(Math.min(n, target)).padStart(2, '0');
    if (n >= target) clearInterval(iv);
    n++;
  }, 60);
}


// ── SETTLE ELEMENTS ALREADY IN VIEW ───────────────────────────────────────
// When arriving mid-page (back navigation, #work anchor) the elements in
// view render settled immediately so view transitions land on real content.
function settle(el) {
  el.classList.add('visible', 'fig-in');
  const t = el.querySelector && el.querySelector('.entry-title.split');
  if (t) t.classList.add('chars-in');
}

(function settleInitial() {
  let viewTop = window.scrollY;
  if (location.hash) {
    try {
      const anchor = document.querySelector(location.hash);
      if (anchor) viewTop = anchor.getBoundingClientRect().top + window.scrollY;
    } catch (e) { /* malformed hash — ignore */ }
  }
  if (viewTop < 50) return; // fresh top-of-page load keeps its entrance
  const viewBottom = viewTop + window.innerHeight;
  document.querySelectorAll('.project-entry, .reveal, .project-figure, .project-meta-bar, .section-label')
    .forEach(el => {
      const r = el.getBoundingClientRect();
      const top = r.top + window.scrollY;
      if (top < viewBottom && top + r.height > viewTop) settle(el);
    });
})();


// ── SCROLL REVEAL ─────────────────────────────────────────────────────────
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    revealObserver.unobserve(el);
    if (el.classList.contains('visible')) return; // pre-settled
    el.classList.add('visible');
    const title = el.querySelector('.entry-title.split');
    if (title) title.classList.add('chars-in');
    const num = el.querySelector('.entry-num');
    if (num && !reduceMotion) tickNumber(num);
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal, .project-entry, .project-meta-bar, .section-label')
  .forEach(el => revealObserver.observe(el));

const figObserver = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (!en.isIntersecting) return;
    figObserver.unobserve(en.target);
    en.target.classList.add('fig-in');
  });
}, { threshold: 0.12 });

document.querySelectorAll('.project-figure').forEach(f => {
  if (!f.classList.contains('fig-in')) figObserver.observe(f);
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
lightbox.innerHTML = '<button class="lightbox-close" aria-label="Close">&#215;</button>'
  + '<figure class="lightbox-figure"><img src="" alt=""><figcaption class="lightbox-caption"></figcaption></figure>';
document.body.appendChild(lightbox);

const lbImg = lightbox.querySelector('img');
const lbCaption = lightbox.querySelector('.lightbox-caption');

function openLightbox(img) {
  lbImg.src = img.src;
  lbImg.alt = img.alt || '';
  const fig = img.closest('figure');
  const cap = fig ? fig.querySelector('figcaption') : null;
  lbCaption.textContent = cap ? cap.textContent : (img.alt || '');
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
    openLightbox(img);
  });
});


// ── INDEX RAIL ────────────────────────────────────────────────────────────
// A fixed index of the seven projects; the active tick tracks the entry
// currently in view, echoing the ψ guideline system.
const workSection = document.querySelector('.work');
const entryEls = Array.from(document.querySelectorAll('.project-entry'));
let rail = null;
const railItems = [];

if (workSection && entryEls.length) {
  rail = document.createElement('aside');
  rail.className = 'work-rail';
  rail.setAttribute('aria-label', 'Project index');
  entryEls.forEach((en, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'rail-item';
    const t = en.querySelector('.entry-title');
    if (t) b.title = t.textContent.trim();
    b.innerHTML = '<span class="rail-tick"></span><span class="rail-num">'
      + String(i + 1).padStart(2, '0') + '</span>';
    b.addEventListener('click', () => {
      en.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    });
    rail.appendChild(b);
    railItems.push(b);
  });
  document.body.appendChild(rail);
}


// ── CASE-STUDY READING PROGRESS ───────────────────────────────────────────
let progressFill = null;
if (document.body.classList.contains('project-page-body')) {
  const pp = document.createElement('div');
  pp.className = 'page-progress';
  pp.setAttribute('aria-hidden', 'true');
  pp.innerHTML = '<span></span>';
  document.body.appendChild(pp);
  progressFill = pp.querySelector('span');
}


// ── SCROLL ENGINE ─────────────────────────────────────────────────────────
// One rAF loop drives nav behaviour, hero parallax, poster drift,
// the index rail, and the reading progress line.
const siteNav = document.querySelector('.site-nav');
const heroInner = document.querySelector('.hero-inner');
const hero = document.querySelector('.hero');
const projectHero = document.querySelector('.project-hero');
const projectHeroMedia = document.querySelector('.project-hero-media');
const projectHeroContain = !!(projectHero && projectHero.classList.contains('project-hero--contain'));
const projectHeroTitle = document.querySelector('.project-hero-title');
const mediaLinks = Array.from(document.querySelectorAll('.entry-media-link'));

let lastY = window.scrollY;

(function frame() {
  const y = window.scrollY;
  const vh = window.innerHeight;
  const desktop = window.innerWidth > 768;
  const dy = y - lastY;

  // Nav: border after the fold; recedes on scroll down, returns on scroll up
  if (siteNav) {
    siteNav.classList.toggle('nav-scrolled', y > 60);
    if (reduceMotion || y < 160 || dy < -2) {
      siteNav.classList.remove('nav-hidden');
    } else if (dy > 2 && y > 300) {
      siteNav.classList.add('nav-hidden');
    }
  }

  if (!reduceMotion && desktop) {
    // Index hero lifts away and dissolves at its own rate
    if (heroInner && hero) {
      const p = Math.min(y / (hero.offsetHeight || vh), 1);
      heroInner.style.transform = 'translateY(' + (-y * 0.22).toFixed(1) + 'px)';
      heroInner.style.opacity = Math.max(1 - p * 1.4, 0).toFixed(3);
    }

    // Case-study hero: image lags behind the scroll, title holds then slips
    // beneath the fold line
    if (projectHero) {
      const hh = projectHero.offsetHeight || vh;
      const p = Math.min(Math.max(y / hh, 0), 1);
      if (projectHeroMedia) {
        projectHeroMedia.style.transform = projectHeroContain
          ? 'translateY(' + (p * 30).toFixed(1) + 'px)'
          : 'translateY(' + (p * 5).toFixed(2) + '%) scale(1.12)';
      }
      if (projectHeroTitle) {
        projectHeroTitle.style.transform = 'translateY(' + (y * 0.42).toFixed(1) + 'px)';
        projectHeroTitle.style.opacity = Math.max(1 - p * 1.1, 0).toFixed(3);
      }
    }

    // Posters drift gently against the scroll as they cross the viewport
    mediaLinks.forEach(link => {
      const r = link.getBoundingClientRect();
      if (r.bottom < -80 || r.top > vh + 80) return;
      const rel = (r.top + r.height / 2 - vh / 2) / vh;
      link.style.transform = 'translateY(' + (rel * -20).toFixed(1) + 'px)';
    });
  } else {
    if (heroInner) { heroInner.style.transform = ''; heroInner.style.opacity = ''; }
    if (projectHeroMedia) projectHeroMedia.style.transform = '';
    if (projectHeroTitle) { projectHeroTitle.style.transform = ''; projectHeroTitle.style.opacity = ''; }
    mediaLinks.forEach(link => { link.style.transform = ''; });
  }

  // Index rail visibility + active project
  if (rail && workSection) {
    const wr = workSection.getBoundingClientRect();
    rail.classList.toggle('on', wr.top < vh * 0.6 && wr.bottom > vh * 0.4);
    let active = -1;
    entryEls.forEach((en, i) => {
      const r = en.getBoundingClientRect();
      if (r.top < vh * 0.55 && r.bottom > vh * 0.35) active = i;
    });
    railItems.forEach((it, i) => it.classList.toggle('active', i === active));
  }

  // Reading progress on case-study pages
  if (progressFill) {
    const max = document.documentElement.scrollHeight - vh;
    progressFill.style.transform = 'scaleX(' + (max > 0 ? Math.min(y / max, 1) : 0).toFixed(4) + ')';
  }

  lastY = y;
  requestAnimationFrame(frame);
})();


// ── CURSOR ────────────────────────────────────────────────────────────────
// A quiet dot that becomes a ring over links and a labelled disc over media.
if (finePointer && !reduceMotion) {
  document.body.classList.add('has-cursor');

  const cursor = document.createElement('div');
  cursor.className = 'cursor';
  cursor.innerHTML = '<div class="cursor-core"><span class="cursor-label"></span></div>';
  document.body.appendChild(cursor);
  const cursorLabel = cursor.querySelector('.cursor-label');

  let mx = 0, my = 0, cx = 0, cy = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    cursor.classList.add('awake');
  });

  (function animateCursor() {
    cx += (mx - cx) * 0.16;
    cy += (my - cy) * 0.16;
    cursor.style.transform = 'translate(' + cx + 'px, ' + cy + 'px)';
    requestAnimationFrame(animateCursor);
  })();

  document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('is-link'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('is-link'));
  });

  function bindCursorLabel(selector, getLabel) {
    document.querySelectorAll(selector).forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursorLabel.textContent = getLabel(el);
        cursor.classList.add('has-label');
      });
      el.addEventListener('mouseleave', () => cursor.classList.remove('has-label'));
    });
  }

  bindCursorLabel('.entry-media-link', el =>
    el.querySelector('video source') ? 'Play' : 'View');
  bindCursorLabel('.project-figure img', () => 'Zoom');

  // Magnetic pull on small interactive targets
  document.querySelectorAll('.nav-links a, .nav-name, .entry-cta, .project-nav-prev, .project-nav-next, .project-nav-all, .contact-details a, .rail-item')
    .forEach(el => {
      el.classList.add('magnetic');
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dyy = e.clientY - (r.top + r.height / 2);
        el.style.transform = 'translate(' + (dx * 0.18).toFixed(1) + 'px, ' + (dyy * 0.3).toFixed(1) + 'px)';
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
}
