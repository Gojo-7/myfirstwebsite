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
  document.querySelectorAll('.nav-item').forEach(link => {
    link.classList.toggle('active', parseInt(link.dataset.slide) === current);
  });
  dots.forEach((dot, i) => dot.classList.toggle('active', i === current));
}

// ── Initial state ──
slides[0].classList.add('active');
updateUI();

// ══════════════════════════════
// SCROLL — mousewheel & touch
// (blocked when inside carousel)
// ══════════════════════════════
let touchStartY = 0;
let lastScrollTime = 0;
const SCROLL_COOLDOWN = 900;

window.addEventListener('wheel', (e) => {
  // If horizontal scroll on gallery slide, let carousel handle it
  if (current === 2 && Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
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
  // left/right arrows navigate carousel when on gallery slide
  if (current === 2) {
    if (e.key === 'ArrowLeft')  carouselGoTo(carouselIndex - 1);
    if (e.key === 'ArrowRight') carouselGoTo(carouselIndex + 1);
  }
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
  silver: { name: 'Silver',      image: 'omi-silver.png' },
  black:  { name: 'Slate Black', image: 'omi-black.png' },
  sand:   { name: 'Warm Sand',   image: 'omi-sand.png' },
  pink:   { name: 'Rose Pink',   image: 'omi-pink.png' },
};

colorBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    colorBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const { name, image } = colorMap[btn.dataset.color];
    colorNameEl.textContent = name;
    omiImg.style.opacity = '0';
    omiImg.style.transform = 'scale(0.95)';
    setTimeout(() => {
      omiImg.src = image;
      omiImg.style.opacity = '1';
      omiImg.style.transform = '';
    }, 200);
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

// ══════════════════════════════
// GALLERY CAROUSEL — Horizontal 3D Slideshow
// ══════════════════════════════
(function () {
  const track          = document.getElementById('carouselTrack');
  const prevBtn        = document.getElementById('carouselPrev');
  const nextBtn        = document.getElementById('carouselNext');
  const dotsEl         = document.getElementById('carouselDots');
  const counterEl      = document.getElementById('carouselCounter');
  const captionTextEl  = document.getElementById('carouselCaptionText');
  const items          = track.querySelectorAll('.carousel-item');
  const COUNT          = items.length;

  // Caption texts for each image
  const captions = ['Front view', 'Front view', 'Side view', 'On your desk', 'LCD close-up', 'In hand'];

  // Build indicator dots
  items.forEach((_, i) => {
    const d = document.createElement('button');
    d.classList.add('carousel-dot');
    d.setAttribute('aria-label', `Image ${i + 1}`);
    d.addEventListener('click', () => carouselGoTo(i));
    dotsEl.appendChild(d);
  });

  const cdots = dotsEl.querySelectorAll('.carousel-dot');

  // ── Update carousel transforms ──
  function updateCarousel() {
    items.forEach((item, i) => {
      item.classList.remove('active');
      
      // Calculate relative position to active image
      let distance = i - carouselIndex;
      
      // Wrap around for circular carousel feel
      if (distance > COUNT / 2) distance -= COUNT;
      if (distance < -COUNT / 2) distance += COUNT;
      
      if (distance === 0) {
        // Active center image
        item.classList.add('active');
        item.style.transform = 'translateX(0) scale(1) translateZ(0)';
        item.style.opacity = '1';
        item.style.zIndex = '10';
      } else if (distance === 1) {
        // Next image on right
        item.style.transform = 'translateX(380px) scale(0.75) translateZ(-400px)';
        item.style.opacity = '0.5';
        item.style.zIndex = '5';
      } else if (distance === -1) {
        // Previous image on left
        item.style.transform = 'translateX(-380px) scale(0.75) translateZ(-400px)';
        item.style.opacity = '0.5';
        item.style.zIndex = '5';
      } else {
        // Hidden images
        item.style.transform = 'translateX(0) scale(0.5) translateZ(-600px)';
        item.style.opacity = '0';
        item.style.zIndex = '1';
      }
    });

    // Update caption
    if (captionTextEl) {
      captionTextEl.textContent = captions[carouselIndex] || '';
    }

    // Update dots
    cdots.forEach((d, i) => d.classList.toggle('active', i === carouselIndex));

    // Counter
    counterEl.textContent = `${carouselIndex + 1} / ${COUNT}`;
  }

  function carouselGoTo(index) {
    // Wrap around using modulo for infinite loop
    carouselIndex = ((index % COUNT) + COUNT) % COUNT;
    updateCarousel();
  }

  // expose index globally so keyboard can use it
  window.carouselIndex = 0;
  window.carouselGoTo  = carouselGoTo;

  // Arrow buttons
  prevBtn.addEventListener('click', () => carouselGoTo(carouselIndex - 1));
  nextBtn.addEventListener('click', () => carouselGoTo(carouselIndex + 1));

  // ── Mouse drag ──
  let dragStartX   = 0;
  let isDragging   = false;
  let dragThreshold = 0;

  track.addEventListener('mousedown', (e) => {
    isDragging   = true;
    dragStartX   = e.clientX;
    dragThreshold = 0;
    track.classList.add('dragging');
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const delta = dragStartX - e.clientX;
    dragThreshold = delta;
  });

  window.addEventListener('mouseup', (e) => {
    if (!isDragging) return;
    isDragging = false;
    track.classList.remove('dragging');
    
    if (dragThreshold > 50)       carouselGoTo(carouselIndex + 1);
    else if (dragThreshold < -50) carouselGoTo(carouselIndex - 1);
    else                          updateCarousel(); // snap back
  });

  // ── Touch swipe (horizontal) ──
  let touchStartX = 0;

  track.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (diff > 40)       carouselGoTo(carouselIndex + 1);
    else if (diff < -40) carouselGoTo(carouselIndex - 1);
  }, { passive: true });

  // ── Init ──
  carouselGoTo(0);

  // Recalculate on resize
  window.addEventListener('resize', () => carouselGoTo(carouselIndex));
})();