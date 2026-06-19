/* ══════════════════════════════════════════════
   PREMIUM PORTFOLIO · app.js
   Animation Engine
   ══════════════════════════════════════════════ */

const html = document.documentElement;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── Easing & utilities ─────────────────────── */
const ease = {
  outExpo: t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
  outBack: t => {
    const c = 1.70158;
    return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
  },
};

function lerp(a, b, t) { return a + (b - a) * t; }

function animateValue({ from, to, duration, easeFn, onUpdate, onComplete }) {
  const start = performance.now();
  function tick(now) {
    const p = Math.min((now - start) / duration, 1);
    const v = lerp(from, to, easeFn(p));
    onUpdate(v);
    if (p < 1) requestAnimationFrame(tick);
    else onComplete?.();
  }
  requestAnimationFrame(tick);
}

function splitChars(el) {
  const text = el.textContent;
  el.innerHTML = text.split('').map(c =>
    `<span class="hero-char">${c === ' ' ? '&nbsp;' : c}</span>`
  ).join('');
  return el.querySelectorAll('.hero-char');
}

function splitSectionChars(el) {
  const text = el.textContent;
  el.innerHTML = text.split('').map(c =>
    `<span class="char">${c === ' ' ? '&nbsp;' : c}</span>`
  ).join('');
  return el.querySelectorAll('.char');
}

function stagger(items, delay, cb) {
  items.forEach((item, i) => setTimeout(() => cb(item, i), i * delay));
}

/* ── LOADER ─────────────────────────────────── */
const loader = document.getElementById('loader');
const loaderProgress = document.getElementById('loader-progress');
const loaderLabel = document.getElementById('loader-label');
const navbar = document.getElementById('navbar');

const loaderSteps = [
  { pct: 20, label: 'Loading assets…' },
  { pct: 45, label: 'Rendering UI…' },
  { pct: 70, label: 'Connecting magic…' },
  { pct: 90, label: 'Almost there…' },
  { pct: 100, label: 'Welcome!' },
];

let stepIdx = 0;
const loaderTick = setInterval(() => {
  if (stepIdx >= loaderSteps.length) {
    clearInterval(loaderTick);
    setTimeout(finishLoader, 350);
    return;
  }
  const s = loaderSteps[stepIdx++];
  loaderProgress.style.width = s.pct + '%';
  loaderLabel.textContent = s.label;
}, 320);

function finishLoader() {
  loader.classList.add('hidden');
  navbar.classList.add('loaded');
  if (reducedMotion) {
    document.querySelectorAll('.hero-heading .line').forEach(l => l.classList.add('visible'));
    document.querySelector('.hero-left')?.classList.add('enter');
    document.querySelector('.hero-right')?.classList.add('enter');
    document.querySelector('.hero-scroll-hint')?.classList.add('show');
    document.querySelectorAll('.chip').forEach(c => c.classList.add('pop'));
    runCounters();
    return;
  }
  playHeroEntrance();
  runCounters();
}

/* ── HERO ENTRANCE ──────────────────────────── */
function playHeroEntrance() {
  const lines = document.querySelectorAll('.hero-heading .line');
  const heroLeft = document.querySelector('.hero-left');
  const heroRight = document.querySelector('.hero-right');
  const scrollHint = document.querySelector('.hero-scroll-hint');
  const chips = document.querySelectorAll('.chip');

  lines.forEach(line => {
    const inner = line.querySelector('.line-inner');
    if (inner) splitChars(inner);
  });

  stagger(lines, 200, (line, i) => {
    line.classList.add('visible');
    const chars = line.querySelectorAll('.hero-char');
    stagger(chars, 35, char => char.classList.add('show'));
  });

  setTimeout(() => heroLeft?.classList.add('enter'), 300);
  setTimeout(() => heroRight?.classList.add('enter'), 500);
  setTimeout(() => {
    stagger(chips, 120, chip => chip.classList.add('pop'));
  }, 900);
  setTimeout(() => scrollHint?.classList.add('show'), 1100);
}

/* ── THEME ──────────────────────────────────── */
const saved = localStorage.getItem('pf-theme') || 'dark';
html.setAttribute('data-theme', saved);

document.getElementById('theme-toggle').addEventListener('click', () => {
  const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('pf-theme', next);
});

/* ── CUSTOM CURSOR ──────────────────────────── */
const cursor = document.getElementById('cursor');
const cursorDot = document.getElementById('cursor-dot');
let cx = 0, cy = 0, tx = 0, ty = 0;

if (!reducedMotion) {
  document.addEventListener('mousemove', e => {
    tx = e.clientX; ty = e.clientY;
    cursorDot.style.left = tx + 'px';
    cursorDot.style.top = ty + 'px';
  });

  function animateCursor() {
    cx += (tx - cx) * 0.12;
    cy += (ty - cy) * 0.12;
    cursor.style.left = cx + 'px';
    cursor.style.top = cy + 'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  document.querySelectorAll('a, button, .pcard, .info-card, .exp-card, .sk, .clink').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
  });
}

/* ── SCROLL PROGRESS (smoothed) ─────────────── */
const scrollBar = document.getElementById('scroll-progress');
let scrollPct = 0, targetScrollPct = 0;

window.addEventListener('scroll', () => {
  const total = document.documentElement.scrollHeight - window.innerHeight;
  targetScrollPct = total > 0 ? (window.scrollY / total) * 100 : 0;

  const scrollHint = document.querySelector('.hero-scroll-hint');
  if (scrollHint) scrollHint.classList.toggle('hide', window.scrollY > 80);
}, { passive: true });

function smoothScrollBar() {
  scrollPct = lerp(scrollPct, targetScrollPct, 0.12);
  scrollBar.style.width = scrollPct + '%';
  requestAnimationFrame(smoothScrollBar);
}
smoothScrollBar();

/* ── NAVBAR ─────────────────────────────────── */
const navItems = document.querySelectorAll('.nav-item');
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('solid', window.scrollY > 30);
  const pos = window.scrollY + 120;
  sections.forEach(sec => {
    if (pos >= sec.offsetTop && pos < sec.offsetTop + sec.offsetHeight) {
      navItems.forEach(n => n.classList.remove('active'));
      document.querySelector(`.nav-item[href="#${sec.id}"]`)?.classList.add('active');
    }
  });
}, { passive: true });

/* ── MOBILE MENU ────────────────────────────── */
const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobile-menu');

burger.addEventListener('click', () => {
  burger.classList.toggle('open');
  mobileMenu.classList.toggle('open');
});
mobileMenu.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    burger.classList.remove('open');
    mobileMenu.classList.remove('open');
  });
});

/* ── COUNTER ANIMATION ──────────────────────── */
function runCounters() {
  document.querySelectorAll('.meta-num').forEach(el => {
    const target = +el.dataset.count;
    animateValue({
      from: 0, to: target, duration: 1800, easeFn: ease.outExpo,
      onUpdate: v => { el.textContent = Math.round(v); },
      onComplete: () => {
        el.classList.add('counting');
        setTimeout(() => el.classList.remove('counting'), 400);
      },
    });
  });
}

/* ── SCROLL REVEAL ENGINE ───────────────────── */
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('up');
    revealObs.unobserve(entry.target);
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

function initReveals() {
  document.querySelectorAll('.section-label').forEach(el => {
    el.classList.add('reveal-label');
    revealObs.observe(el);
  });

  document.querySelectorAll('.about-left .about-body, .about-left .btn-outline-pill').forEach((el, i) => {
    el.classList.add('reveal-left');
    el.style.transitionDelay = i * 80 + 'ms';
    revealObs.observe(el);
  });

  document.querySelectorAll('.info-card').forEach((el, i) => {
    el.classList.add('reveal-scale');
    el.style.transitionDelay = i * 90 + 'ms';
    revealObs.observe(el);
  });

  document.querySelectorAll('.about-quote').forEach(el => {
    el.classList.add('reveal-flip');
    revealObs.observe(el);
  });

  document.querySelectorAll('.pcard').forEach((el, i) => {
    el.classList.add('reveal-scale');
    el.style.transitionDelay = (i % 3) * 100 + 'ms';
    revealObs.observe(el);
  });

  document.querySelectorAll('.exp-card').forEach((el, i) => {
    el.classList.add('reveal-left');
    el.style.transitionDelay = i * 120 + 'ms';
    revealObs.observe(el);
  });

  document.querySelectorAll('.clink').forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = i * 80 + 'ms';
    revealObs.observe(el);
  });

  document.querySelectorAll('.contact-form, .contact-sub').forEach(el => {
    el.classList.add('reveal-flip');
    revealObs.observe(el);
  });

  document.querySelectorAll('.about-left .section-heading, .work-header .section-heading, .exp-section .section-heading, .contact-left .section-heading, .skills-section .section-heading').forEach(el => {
    el.classList.add('reveal');
    revealObs.observe(el);
  });

  document.querySelectorAll('.work-filters .wf-btn').forEach((el, i) => {
    el.classList.add('reveal-scale');
    el.style.transitionDelay = i * 60 + 'ms';
    revealObs.observe(el);
  });

  const footer = document.querySelector('.footer-inner');
  if (footer) {
    footer.classList.add('reveal');
    revealObs.observe(footer);
  }
}
initReveals();

/* ── SECTION HEADING CHAR ANIMATION ─────────── */
const headingObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const chars = entry.target.querySelectorAll('.char');
    stagger(chars, 25, char => char.classList.add('show'));
    headingObs.unobserve(entry.target);
  });
}, { threshold: 0.3 });

document.querySelectorAll('.section-heading .text-stroke, .section-heading em').forEach(el => {
  splitSectionChars(el);
});
document.querySelectorAll('.section-heading').forEach(h => headingObs.observe(h));

/* ── EXPERIENCE TIMELINE ────────────────────── */
const expObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const items = entry.target.querySelectorAll('.exp-item');
    stagger(items, 200, (item, i) => {
      item.classList.add('drawn');
      item.style.opacity = '1';
      item.style.transform = 'translateX(0)';
    });
    expObs.unobserve(entry.target);
  });
}, { threshold: 0.15 });

const expList = document.querySelector('.exp-list');
if (expList) {
  expList.querySelectorAll('.exp-item').forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateX(-40px)';
    el.style.transition = `opacity .8s var(--expo-out) ${i * 100}ms, transform .8s var(--spring) ${i * 100}ms`;
  });
  expObs.observe(expList);
}

/* ── SKILLS BAR FILL ────────────────────────── */
const skillObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const skills = entry.target.querySelectorAll('.sk');
    stagger(skills, 70, (sk, i) => {
      sk.style.opacity = '1';
      sk.style.transform = 'translateX(0)';
      const bar = sk.querySelector('.sk-bar');
      if (bar) {
        sk.style.setProperty('--w', bar.style.getPropertyValue('--w') || '0%');
        requestAnimationFrame(() => sk.classList.add('bar-fill'));
      }
    });
    skillObs.unobserve(entry.target);
  });
}, { threshold: 0.1 });

document.querySelectorAll('.skill-col').forEach(col => {
  col.querySelectorAll('.sk').forEach(sk => {
    sk.style.opacity = '0';
    sk.style.transform = 'translateX(-24px)';
    sk.style.transition = 'opacity .6s var(--expo-out), transform .6s var(--spring)';
  });
  skillObs.observe(col);
});

/* ── 3D TILT ON PROJECT CARDS ───────────────── */
if (!reducedMotion) {
  document.querySelectorAll('.pcard').forEach(card => {
    const spotlight = card.querySelector('.pcard-spotlight');
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `translateY(-10px) perspective(1000px) rotateX(${-y * 8}deg) rotateY(${x * 8}deg)`;
      if (spotlight) {
        spotlight.style.setProperty('--mx', `${e.clientX - r.left}px`);
        spotlight.style.setProperty('--my', `${e.clientY - r.top}px`);
      }
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
}

/* ── MAGNETIC BUTTONS ───────────────────────── */
if (!reducedMotion) {
  document.querySelectorAll('.btn-glow, .btn-ghost, .nav-cta, .btn-outline-pill').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.3;
      const y = (e.clientY - r.top - r.height / 2) * 0.3;
      btn.style.transform = `translate(${x}px, ${y}px) translateY(-3px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });
}

/* ── AVATAR PARALLAX TILT ───────────────────── */
const avatarFrame = document.getElementById('avatar-frame');
if (avatarFrame && !reducedMotion) {
  avatarFrame.addEventListener('mousemove', e => {
    const r = avatarFrame.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    avatarFrame.style.transform = `perspective(800px) rotateY(${x * 14}deg) rotateX(${-y * 14}deg)`;
  });
  avatarFrame.addEventListener('mouseleave', () => { avatarFrame.style.transform = ''; });
}

/* ── AURORA + SCROLL PARALLAX ───────────────── */
let mouseX = 0.5, mouseY = 0.5;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX / window.innerWidth - 0.5;
  mouseY = e.clientY / window.innerHeight - 0.5;
});

function parallaxLoop() {
  if (!reducedMotion) {
    document.querySelectorAll('.aurora-orb').forEach((orb, i) => {
      const factor = (i + 1) * 20;
      orb.style.transform = `translate(${mouseX * factor}px, ${mouseY * factor}px)`;
    });

    const scrollY = window.scrollY;
    const heroLeft = document.querySelector('.hero-left');
    if (heroLeft && scrollY > 50 && scrollY < window.innerHeight) {
      heroLeft.style.transform = `translateY(${scrollY * 0.15}px)`;
    } else if (heroLeft && scrollY <= 50) {
      heroLeft.style.transform = '';
    }
  }
  requestAnimationFrame(parallaxLoop);
}
parallaxLoop();

/* ── PROJECT FILTER (animated) ──────────────── */
document.querySelectorAll('.wf-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.wf-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.dataset.f;
    const cards = document.querySelectorAll('.pcard');

    cards.forEach((card, i) => {
      const match = f === 'all' || card.dataset.cat === f;
      if (match) {
        card.classList.remove('filtered-out');
        card.style.position = '';
        card.style.visibility = '';
        card.style.transitionDelay = i * 60 + 'ms';
        requestAnimationFrame(() => card.classList.add('up'));
      } else {
        card.classList.remove('up');
        card.classList.add('filtered-out');
      }
    });
  });
});

/* ── CARD GLOW ON HOVER ─────────────────────── */
document.querySelectorAll('.info-card, .exp-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    card.style.background = `radial-gradient(circle at ${e.clientX - r.left}px ${e.clientY - r.top}px, rgba(124,58,237,.12), var(--glass) 55%)`;
  });
  card.addEventListener('mouseleave', () => { card.style.background = ''; });
});

/* ── CONTACT FORM ───────────────────────────── */
const form = document.getElementById('contact-form');
const cfSubmit = document.getElementById('cf-submit');
const cfSuccess = document.getElementById('cf-success');

form.addEventListener('submit', e => {
  e.preventDefault();
  const btnText = cfSubmit.querySelector('.btn-text');
  const spinner = cfSubmit.querySelector('.btn-spinner');
  cfSubmit.disabled = true;
  btnText.style.display = 'none';
  spinner.style.display = 'inline-flex';
  spinner.style.alignItems = 'center';
  spinner.style.gap = '8px';

  setTimeout(() => {
    form.reset();
    cfSubmit.disabled = false;
    btnText.style.display = '';
    spinner.style.display = 'none';
    cfSuccess.style.display = 'block';
    cfSuccess.classList.add('show');
    setTimeout(() => {
      cfSuccess.style.display = 'none';
      cfSuccess.classList.remove('show');
    }, 5000);
  }, 2000);
});

/* ── FORM FIELD FOCUS ANIMATION ─────────────── */
document.querySelectorAll('.cf-field input, .cf-field textarea').forEach(field => {
  field.addEventListener('focus', () => field.parentElement.classList.add('focused'));
  field.addEventListener('blur', () => field.parentElement.classList.remove('focused'));
});

navItems.forEach(item => {
  item.addEventListener('click', () => {
    navItems.forEach(n => n.classList.remove('active'));
    item.classList.add('active');
  });
});

/* ── SECTION CHAR CSS ───────────────────────── */
const style = document.createElement('style');
style.textContent = `
  .char{display:inline-block;opacity:0;transform:translateY(24px) rotate(6deg);transition:opacity .5s var(--expo-out),transform .5s var(--spring);}
  .char.show{opacity:1;transform:translateY(0) rotate(0);}
  .cf-field.focused label{color:var(--p);transform:translateX(4px);transition:color .3s ease,transform .3s var(--spring);}
  .cf-field label{transition:color .3s ease,transform .3s var(--spring);}
`;
document.head.appendChild(style);

console.log('%c✦ Aryan\'s Portfolio ✦', 'font-size:16px;font-weight:bold;color:#7c3aed;');
console.log('%cHello curious developer! 👋', 'color:#06b6d4;font-size:12px;');
