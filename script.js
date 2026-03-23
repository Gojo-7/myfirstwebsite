const svg = document.getElementById('omiSvg');
const hint = document.getElementById('touchHint');

// ── Pixel face expressions ──
// Each expression modifies the SVG elements directly

const expressions = [
  {
    name: 'happy',
    hint: 'heehee 😊',
    apply() {
      // Big curved smile - more pixels
      setMouth([
        [224,162],[228,166],[232,168],[236,170],[240,170],[244,170],[248,170],[252,168],[256,166],[260,162]
      ]);
      // Eyebrows raised - happy
      setEyebrows(true, false);
      setScreenColor('#d0f0e0');
    }
  },
  {
    name: 'surprised',
    hint: 'woah!! 😮',
    apply() {
      // O mouth
      setMouth([
        [236,158],[240,158],[244,158],
        [234,162],[246,162],
        [234,166],[246,166],
        [236,170],[240,170],[244,170],
      ]);
      setEyebrows(false, true);
      setScreenColor('#ffeedd');
    }
  },
  {
    name: 'thinking',
    hint: 'hmm... 🤔',
    apply() {
      // Squiggly mouth
      setMouth([
        [228,164],[232,162],[236,164],[240,162],[244,164],[248,162],[252,164]
      ]);
      setEyebrows(false, false);
      setScreenColor('#e8e8ff');
    }
  },
  {
    name: 'sleepy',
    hint: 'zzz 😴',
    apply() {
      // Flat mouth
      setMouth([
        [228,164],[232,164],[236,164],[240,164],[244,164],[248,164],[252,164],[256,164]
      ]);
      setEyebrows(false, false);
      setScreenColor('#e0ddf5');
      // Half-close eyes
      halfCloseEyes();
    }
  },
  {
    name: 'default',
    hint: 'tap Omi ✦',
    apply() {
      setDefaultMouth();
      setEyebrows(true, false);
      setScreenColor('#c8e8f5');
      openEyes();
    }
  }
];

let exprIndex = 0;

function setScreenColor(color) {
  const stop1 = document.querySelector('#screenBg stop:first-child');
  const stop2 = document.querySelector('#screenBg stop:last-child');
  if (stop1) stop1.setAttribute('stop-color', color);
  if (stop2) stop2.setAttribute('stop-color', adjustColor(color, -20));
}

function adjustColor(hex, amount) {
  // Slightly darken a hex color
  const num = parseInt(hex.replace('#',''), 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + amount));
  const b = Math.max(0, Math.min(255, (num & 0xff) + amount));
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function setMouth(pixels) {
  const mouthGroup = document.getElementById('mouth');
  mouthGroup.innerHTML = '';
  pixels.forEach(([x, y]) => {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', x);
    rect.setAttribute('y', y);
    rect.setAttribute('width', 4);
    rect.setAttribute('height', 4);
    rect.setAttribute('rx', 1);
    rect.setAttribute('fill', '#2a2a2a');
    mouthGroup.appendChild(rect);
  });
}

function setDefaultMouth() {
  setMouth([
    [228,158],[232,162],[236,164],[240,164],[244,164],[248,164],[252,162],[256,158]
  ]);
}

function setEyebrows(happy, raised) {
  // Left eyebrow
  const lBrow1 = document.querySelector('#leftEye rect:first-child');
  const lBrow2 = document.querySelector('#leftEye rect:nth-child(2)');
  const rBrow1 = document.querySelector('#rightEye rect:first-child');
  const rBrow2 = document.querySelector('#rightEye rect:nth-child(2)');

  if (raised) {
    lBrow1 && lBrow1.setAttribute('y', 104);
    lBrow2 && lBrow2.setAttribute('y', 102);
    rBrow1 && rBrow1.setAttribute('y', 102);
    rBrow2 && rBrow2.setAttribute('y', 104);
  } else {
    lBrow1 && lBrow1.setAttribute('y', 108);
    lBrow2 && lBrow2.setAttribute('y', 106);
    rBrow1 && rBrow1.setAttribute('y', 106);
    rBrow2 && rBrow2.setAttribute('y', 108);
  }
}

function halfCloseEyes() {
  ['#leftEye rect:nth-child(3)', '#rightEye rect:nth-child(3)'].forEach(sel => {
    const el = document.querySelector(sel);
    if (el) {
      el.setAttribute('height', 10);
      el.setAttribute('ry', 8);
    }
  });
}

function openEyes() {
  ['#leftEye rect:nth-child(3)', '#rightEye rect:nth-child(3)'].forEach(sel => {
    const el = document.querySelector(sel);
    if (el) {
      el.setAttribute('height', 18);
      el.setAttribute('ry', 3);
    }
  });
}

// Tap handler
svg.addEventListener('click', () => {
  exprIndex = (exprIndex + 1) % expressions.length;
  const expr = expressions[exprIndex];
  openEyes();
  expr.apply();
  hint.textContent = expr.hint;

  // Wiggle animation
  svg.style.transform = 'rotate(-3deg) scale(0.96)';
  setTimeout(() => {
    svg.style.transform = 'rotate(2deg) scale(1.02)';
    setTimeout(() => {
      svg.style.transform = '';
    }, 100);
  }, 80);
});

// ── Idle random pupil movement ──
setInterval(() => {
  const dx = (Math.random() - 0.5) * 5;
  const dy = (Math.random() - 0.5) * 3;
  ['lPupil', 'rPupil'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      const baseX = id === 'lPupil' ? 176 : 316;
      const baseY = 118;
      el.setAttribute('x', baseX + dx);
      el.setAttribute('y', baseY + dy);
    }
  });
}, 2200);

// ── Idle blink ──
function blink() {
  ['#leftEye rect:nth-child(3)', '#rightEye rect:nth-child(3)'].forEach(sel => {
    const el = document.querySelector(sel);
    if (!el) return;
    const origH = el.getAttribute('height');
    el.setAttribute('height', 1);
    setTimeout(() => el.setAttribute('height', origH), 120);
  });
  setTimeout(blink, 3000 + Math.random() * 3000);
}
setTimeout(blink, 2000);

// ── Set initial mouth ──
setDefaultMouth();