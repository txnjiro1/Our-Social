const canvas = document.getElementById('threads');
const ctx = canvas.getContext('2d', { alpha: true });
const dot = document.getElementById('cursorDot');
const ring = document.getElementById('cursorRing');

let width = 0;
let height = 0;
let dpr = 1;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// Lightweight thread renderer: fewer points, no per-frame gradients/shadows,
// fixed-size render buffer, and a modest frame cap keep the visual effect smooth.
const lineCount = 8;
const blobs = [];
const palettes = [
  { r: 182, g: 108, b: 255, a: 0.24 },
  { r: 78, g: 231, b: 255, a: 0.22 },
  { r: 255, g: 98, b: 196, a: 0.19 }
];
const linePaths = [];
let lastFrame = 0;
const frameInterval = 1000 / 45;

function resize() {
  width = window.innerWidth;
  height = window.innerHeight;

  // Never render the background at more than 1.25x DPR; this dramatically
  // reduces canvas work on high-density displays while looking essentially identical.
  dpr = Math.min(window.devicePixelRatio || 1, 1.25);
  canvas.width = Math.max(1, Math.floor(width * dpr));
  canvas.height = Math.max(1, Math.floor(height * dpr));
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  buildPaths();
}

function initLines() {
  blobs.length = 0;
  for (let i = 0; i < lineCount; i++) {
    blobs.push({
      y: Math.random() * height,
      amplitude: 30 + Math.random() * 72,
      speed: 0.00045 + Math.random() * 0.0007,
      phase: Math.random() * Math.PI * 2,
      hue: i % palettes.length,
      drift: (Math.random() - 0.5) * 0.00018,
      width: 0.5 + Math.random() * 0.7
    });
  }
  buildPaths();
}

function buildPaths() {
  linePaths.length = 0;
  // Cache x positions once instead of recreating them every animation frame.
  const step = Math.max(34, Math.min(52, width / 18));
  const xs = [];
  for (let x = -50; x <= width + 50; x += step) xs.push(x);
  linePaths.push(xs);
}

function draw(time) {
  requestAnimationFrame(draw);
  if (reduceMotion.matches) return;
  if (time - lastFrame < frameInterval) return;
  lastFrame = time;

  ctx.clearRect(0, 0, width, height);
  const xs = linePaths[0] || [];

  blobs.forEach((line, idx) => {
    const c = palettes[line.hue];
    ctx.beginPath();

    for (let p = 0; p < xs.length; p++) {
      const x = xs[p];
      const nx = x / Math.max(width, 1);
      const primary = Math.sin(nx * Math.PI * 3.2 + time * line.speed + line.phase);
      const secondary = Math.sin(nx * Math.PI * 7 + time * line.speed * 1.45 + idx) * 9;
      const y = line.y + primary * line.amplitude + secondary + Math.sin(time * line.drift + idx) * 8;
      if (p === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }

    ctx.strokeStyle = `rgba(${c.r},${c.g},${c.b},${c.a})`;
    ctx.lineWidth = line.width;
    ctx.stroke();
  });
}

function syncLayout() {
  resize();
  initLines();
}

window.addEventListener('resize', syncLayout, { passive: true });
resize();
initLines();
requestAnimationFrame(draw);

// Cursor updates are batched into animation frames instead of forcing a layout
// write for every mouse event.
let pointerX = innerWidth / 2;
let pointerY = innerHeight / 2;
let cursorPending = false;

function updateCursor() {
  cursorPending = false;
  dot.style.left = `${pointerX}px`;
  dot.style.top = `${pointerY}px`;
  ring.style.left = `${pointerX}px`;
  ring.style.top = `${pointerY}px`;
}

window.addEventListener('pointermove', (e) => {
  pointerX = e.clientX;
  pointerY = e.clientY;
  if (!cursorPending) {
    cursorPending = true;
    requestAnimationFrame(updateCursor);
  }
}, { passive: true });

document.addEventListener('pointerdown', () => {
  ring.classList.add('pressed');
}, { passive: true });
document.addEventListener('pointerup', () => {
  ring.classList.remove('pressed');
}, { passive: true });

const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const cookieInput = document.getElementById('cookieName');
const message = document.getElementById('formMessage');
const emailHint = document.getElementById('emailHint');
const cookieHint = document.getElementById('cookieHint');
const loginPage = document.getElementById('loginPage');
const mainPage = document.getElementById('mainPage');
const profileEmail = document.getElementById('profileEmail');
const toast = document.getElementById('toast');

function validGmail(value) {
  const email = value.trim().toLowerCase();
  const before = email.split('@gmail.com')[0] || '';
  return email.endsWith('@gmail.com') && before.length >= 4 && !/\s/.test(email);
}

function validCookieName(value) {
  const cookie = value.trim();
  if (!cookie) return false;

  // A cookie name made entirely of numbers is not allowed.
  // This rejects both random numeric strings and ordered numeric strings
  // such as 1234567890 or 9876543210.
  if (/^\d+$/.test(cookie)) return false;

  // Any name containing at least one non-number character is allowed,
  // regardless of which numbers it contains (for example cookie123 or abc987).
  return /\D/.test(cookie);
}


emailInput.addEventListener('input', () => {
  const value = emailInput.value.trim();
  if (!value) {
    emailHint.textContent = 'Use a Gmail address with at least 4 characters before @gmail.com.';
    emailHint.dataset.state = '';
    return;
  }
  if (!validGmail(value)) {
    emailHint.textContent = 'Please enter a valid Gmail address (4+ characters before @gmail.com).';
    emailHint.dataset.state = 'bad';
  } else {
    emailHint.textContent = 'Gmail format looks good.';
    emailHint.dataset.state = 'good';
  }
});

cookieInput.addEventListener('input', () => {
  const value = cookieInput.value.trim();

  if (!value) {
    cookieHint.textContent = 'Numbers are fine, but the name cannot contain numbers only.';
    cookieHint.dataset.state = '';
  } else if (!validCookieName(value)) {
    cookieHint.textContent = 'Use at least one letter or other non-number character; numbers-only names are not allowed.';
    cookieHint.dataset.state = 'bad';
  } else {
    cookieHint.textContent = 'Cookie name looks good.';
    cookieHint.dataset.state = 'good';
  }
});

document.querySelectorAll('.provider').forEach(btn => {
  btn.addEventListener('click', () => {
    if (btn.dataset.provider === 'GitHub') {
      showToast('GitHub login will be added next.');
      return;
    }
    document.querySelectorAll('.provider').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = emailInput.value.trim();
  const cookie = cookieInput.value.trim();
  message.textContent = '';

  if (!validGmail(email)) {
    message.textContent = 'Use a valid Gmail address with at least 4 characters before @gmail.com.';
    emailInput.focus();
    return;
  }
  if (!validCookieName(cookie)) {
    message.textContent = 'Choose a profile name with at least one letter; number-only names are not allowed.';
    cookieInput.focus();
    return;
  }

  // Save the non-secret profile information when the database is configured.
  // No password is collected or stored anywhere.
  const saved = await saveAccountProfile(email, cookie);
  if (!saved) return;

  profileEmail.textContent = email;
  loginPage.classList.remove('active');
  mainPage.classList.add('active');
  showToast(`Welcome to OurSocial, ${email.split('@')[0]}!`);
});

async function saveAccountProfile(email, profileName) {
  const cleanEmail = email.toLowerCase();
  const cleanProfileName = profileName.trim();
  const localProfile = {
    email: cleanEmail,
    profileName: cleanProfileName,
    savedAt: new Date().toISOString()
  };

  // The app can still be used when the database is unavailable.
  // This fallback stores the non-secret profile data only in this browser.
  const saveLocally = () => {
    try {
      localStorage.setItem('oursocial_profile', JSON.stringify(localProfile));
      return true;
    } catch (storageError) {
      console.error('OurSocial local save error:', storageError);
      return false;
    }
  };

  const client = window.ourSocialSupabase;

  if (!client) {
    saveLocally();
    showToast('Database not connected — saved on this browser');
    return true;
  }

  const { error } = await client
    .from('oursocial_accounts')
    .insert({
      email: cleanEmail,
      // Keep the existing database column name so the current table stays compatible.
      cookie_name: cleanProfileName
    });

  if (error) {
    console.error('OurSocial save error:', error);
    saveLocally();
    showToast('Database save failed — saved on this browser');
    return true;
  }

  try {
    localStorage.setItem('oursocial_profile', JSON.stringify(localProfile));
  } catch (storageError) {
    console.warn('OurSocial local cache error:', storageError);
  }

  return true;
}

function showToast(text) {
  toast.textContent = text;
  toast.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove('show'), 2400);
}

document.getElementById('postButton').addEventListener('click', () => showToast('Post composer is a demo for now.'));
document.getElementById('composeButton').addEventListener('click', () => showToast('Post composer is a demo for now.'));

document.querySelectorAll('.nav-item').forEach(btn => btn.addEventListener('click', () => {
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  showToast(`${btn.textContent.trim()} is a demo section.`);
}));

document.querySelectorAll('.person button').forEach(btn => btn.addEventListener('click', () => {
  btn.textContent = btn.textContent === 'Follow' ? 'Following' : 'Follow';
}));

document.querySelectorAll('.post-actions button').forEach(btn => btn.addEventListener('click', () => showToast('Demo action')));
