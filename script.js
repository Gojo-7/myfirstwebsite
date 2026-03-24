// ══════════════════════════════
// FULLSCREEN SLIDE ENGINE
// ══════════════════════════════

const container  = document.getElementById('slidesContainer');
const navbar     = document.getElementById('navbar');
const dotsWrap   = document.getElementById('slideDots');
const slides     = document.querySelectorAll('.slide');
const TOTAL      = slides.length;

let current      = 0;
let isAnimating  = false;
const ANIM_DURATION = 800;

// ── Build dots ──
slides.forEach((_, i) => {
  const dot = document.createElement('button');
  dot.classList.add('dot');
  dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
  dot.addEventListener('click', () => goTo(i));
  dotsWrap.appendChild(dot);
});

const dots = document.querySelectorAll('.dot');

// ── Go to a slide ──
function goTo(index) {
  if (index === current || isAnimating) return;
  isAnimating = true;

  slides[current].classList.remove('active');
  current = Math.max(0, Math.min(index, TOTAL - 1));
  container.style.transform = `translateY(-${current * 100}vh)`;
  slides[current].classList.add('active');

  updateUI();
  setTimeout(() => { isAnimating = false; }, ANIM_DURATION);
}

function updateUI() {
  // Nav links
  document.querySelectorAll('.nav-item').forEach(link => {
    link.classList.toggle('active', parseInt(link.dataset.slide) === current);
  });

  // Dots
  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === current);
  });
}

// ── Initial state ──
slides[0].classList.add('active');
updateUI();

// ══════════════════════════════
// SCROLL — mousewheel & touch
// ══════════════════════════════
let touchStartY = 0;
let lastScrollTime = 0;
const SCROLL_COOLDOWN = 900;

window.addEventListener('wheel', (e) => {
  e.preventDefault();
  const now = Date.now();
  if (now - lastScrollTime < SCROLL_COOLDOWN) return;
  lastScrollTime = now;

  if (e.deltaY > 30)       goTo(current + 1);
  else if (e.deltaY < -30) goTo(current - 1);
}, { passive: false });

window.addEventListener('touchstart', (e) => {
  touchStartY = e.touches[0].clientY;
}, { passive: true });

window.addEventListener('touchend', (e) => {
  const diff = touchStartY - e.changedTouches[0].clientY;
  const now = Date.now();
  if (now - lastScrollTime < SCROLL_COOLDOWN) return;
  lastScrollTime = now;

  if (diff > 40)       goTo(current + 1);
  else if (diff < -40) goTo(current - 1);
}, { passive: true });

// ══════════════════════════════
// KEYBOARD
// ══════════════════════════════
window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowDown' || e.key === 'PageDown') goTo(current + 1);
  if (e.key === 'ArrowUp'   || e.key === 'PageUp')   goTo(current - 1);
});

// ══════════════════════════════
// NAV + BUTTON CLICKS
// ══════════════════════════════
document.querySelectorAll('[data-slide]').forEach(el => {
  el.addEventListener('click', (e) => {
    e.preventDefault();
    goTo(parseInt(el.dataset.slide));
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
  });
});

// ══════════════════════════════
// HAMBURGER
// ══════════════════════════════
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mobileMenu.classList.toggle('open');
});

// ══════════════════════════════
// COLOR PICKER
// ══════════════════════════════
const colorBtns  = document.querySelectorAll('.color-btn');
const colorNameEl = document.getElementById('colorName');
const omiImg     = document.getElementById('omiImg');

const colorMap = {
  silver: { name: 'Silver',      filter: 'none' },
  black:  { name: 'Slate Black', filter: 'brightness(0.35) contrast(1.1)' },
  sand:   { name: 'Warm Sand',   filter: 'sepia(0.5) saturate(0.8) brightness(1.05)' },
};

colorBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    colorBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const { name, filter } = colorMap[btn.dataset.color];
    colorNameEl.textContent = name;

    omiImg.style.opacity = '0';
    omiImg.style.transform = 'scale(0.95)';
    setTimeout(() => {
      const base = 'drop-shadow(0 20px 44px rgba(0,0,0,0.6))';
      omiImg.style.filter = filter === 'none' ? base : `${filter} ${base}`;
      omiImg.style.opacity = '1';
      omiImg.style.transform = '';
    }, 180);
  });
});

// ══════════════════════════════
// FAQ ACCORDION
// ══════════════════════════════
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.parentElement;
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});