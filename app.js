/* =============================================
   PORTFOLIO JS — Faruk Burak Öğretici
   Canvas grid, navbar scroll, mobile nav
   ============================================= */

'use strict';

/* ---- Utility: requestAnimationFrame polyfill ---- */
const raf = window.requestAnimationFrame.bind(window);

/* ============================================
   1. NAVBAR — Scroll glass effect & mobile
   ============================================ */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger-btn');
  const navLinks = document.querySelector('.nav-links');
  const allNavLinks = document.querySelectorAll('.nav-link');

  // Scroll state
  let ticking = false;
  function onScroll() {
    if (!ticking) {
      raf(() => {
        navbar.classList.toggle('scrolled', window.scrollY > 20);
        ticking = false;
      });
      ticking = true;
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile menu toggle
  function toggleMenu(force) {
    const isOpen = force !== undefined ? force : !navLinks.classList.contains('open');
    navLinks.classList.toggle('open', isOpen);
    hamburger.classList.toggle('active', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  hamburger.addEventListener('click', () => toggleMenu());

  allNavLinks.forEach(link => {
    link.addEventListener('click', () => toggleMenu(false));
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (navLinks.classList.contains('open') &&
        !navLinks.contains(e.target) &&
        !hamburger.contains(e.target)) {
      toggleMenu(false);
    }
  });
})();

/* ============================================
   2. HERO CANVAS — Animated Tech Grid
   ============================================ */
(function initCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, dots = [], animId;
  const DOT_SPACING = 40;        // grid spacing in px
  const DOT_RADIUS   = 1.2;
  const LINE_DIST    = 120;      // max distance to draw a line between dots
  const MOUSE_RADIUS = 160;      // mouse repel radius
  const SPEED        = 0.3;      // dot base speed

  const COLOR_BLUE   = 'rgba(61,139,255,';
  const COLOR_PURPLE = 'rgba(168,85,247,';

  let mouse = { x: -9999, y: -9999 };

  /* Resize */
  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    buildDots();
  }

  /* Build dot grid */
  function buildDots() {
    dots = [];
    const cols = Math.ceil(W / DOT_SPACING) + 1;
    const rows = Math.ceil(H / DOT_SPACING) + 1;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        dots.push({
          ox: c * DOT_SPACING,   // origin x
          oy: r * DOT_SPACING,   // origin y
          x:  c * DOT_SPACING,
          y:  r * DOT_SPACING,
          vx: (Math.random() - 0.5) * SPEED,
          vy: (Math.random() - 0.5) * SPEED,
          // Random hue between blue and purple
          hue: Math.random() < 0.6 ? 'blue' : 'purple',
          opacity: 0.15 + Math.random() * 0.4,
        });
      }
    }
  }

  /* Animate */
  function tick() {
    ctx.clearRect(0, 0, W, H);

    // Update positions — wander + mouse repel
    for (const d of dots) {
      // Wander: tiny random push + return to origin
      d.vx += (Math.random() - 0.5) * 0.015;
      d.vy += (Math.random() - 0.5) * 0.015;

      // Spring back toward origin
      const dx0 = d.ox - d.x;
      const dy0 = d.oy - d.y;
      d.vx += dx0 * 0.0008;
      d.vy += dy0 * 0.0008;

      // Mouse repel
      const mdx = d.x - mouse.x;
      const mdy = d.y - mouse.y;
      const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
      if (mdist < MOUSE_RADIUS && mdist > 0) {
        const force = (MOUSE_RADIUS - mdist) / MOUSE_RADIUS * 0.8;
        d.vx += (mdx / mdist) * force;
        d.vy += (mdy / mdist) * force;
      }

      // Damping
      d.vx *= 0.95;
      d.vy *= 0.95;

      d.x += d.vx;
      d.y += d.vy;
    }

    // Draw connections
    for (let i = 0; i < dots.length; i++) {
      const a = dots[i];
      for (let j = i + 1; j < dots.length; j++) {
        const b = dots[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < LINE_DIST) {
          const alpha = (1 - dist / LINE_DIST) * 0.18;
          const color = a.hue === 'purple' ? COLOR_PURPLE : COLOR_BLUE;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = color + alpha + ')';
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    // Draw dots
    for (const d of dots) {
      const color = d.hue === 'purple' ? COLOR_PURPLE : COLOR_BLUE;
      ctx.beginPath();
      ctx.arc(d.x, d.y, DOT_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = color + d.opacity + ')';
      ctx.fill();
    }

    animId = raf(tick);
  }

  /* Mouse tracking */
  window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  }, { passive: true });

  window.addEventListener('mouseleave', () => {
    mouse.x = -9999; mouse.y = -9999;
  });

  /* Touch support */
  window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.touches[0].clientX - rect.left;
      mouse.y = e.touches[0].clientY - rect.top;
    }
  }, { passive: true });

  /* Pause when tab not visible */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animId);
    } else {
      tick();
    }
  });

  /* ResizeObserver */
  const ro = new ResizeObserver(() => {
    cancelAnimationFrame(animId);
    resize();
    tick();
  });
  ro.observe(canvas.parentElement || document.body);

  resize();
  tick();
})();

/* ============================================
   3. SCROLL REVEAL — for reveal-section class
   ============================================ */
(function initReveal() {
  const sections = document.querySelectorAll('.reveal-section, .placeholder-section');

  if (!('IntersectionObserver' in window)) {
    // Fallback: just show everything
    sections.forEach(el => {
      el.classList.add('in-view');
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    return;
  }

  // Placeholder sections: simple fade
  document.querySelectorAll('.placeholder-section').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
  });

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        // Also handle inline-style placeholders
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  sections.forEach(el => obs.observe(el));
})();

/* ============================================
   4. CONTACT FORM — Validation & Submit UX
   ============================================ */
(function initContactForm() {
  const form       = document.getElementById('contact-form');
  if (!form) return;

  const nameInput  = document.getElementById('field-name');
  const emailInput = document.getElementById('field-email');
  const msgInput   = document.getElementById('field-message');
  const submitBtn  = document.getElementById('btn-send-message');
  const sendText   = document.getElementById('btn-send-text');
  const successBox = document.getElementById('form-success');

  const errorEls = {
    name:    document.getElementById('error-name'),
    email:   document.getElementById('error-email'),
    message: document.getElementById('error-message'),
  };

  /* --- Helpers --- */
  function setError(field, input, msg) {
    errorEls[field].textContent = msg;
    input.classList.toggle('is-error', !!msg);
  }

  function validateEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  /* Live clear on input */
  nameInput.addEventListener('input',  () => setError('name',    nameInput,  ''));
  emailInput.addEventListener('input', () => setError('email',   emailInput, ''));
  msgInput.addEventListener('input',   () => setError('message', msgInput,   ''));

  /* Submit */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name    = nameInput.value.trim();
    const email   = emailInput.value.trim();
    const message = msgInput.value.trim();
    let valid = true;

    // Validate
    if (!name) {
      setError('name', nameInput, 'Please enter your name.');
      valid = false;
    }
    if (!email) {
      setError('email', emailInput, 'Please enter your email address.');
      valid = false;
    } else if (!validateEmail(email)) {
      setError('email', emailInput, 'Please enter a valid email address.');
      valid = false;
    }
    if (!message) {
      setError('message', msgInput, 'Please write a message before sending.');
      valid = false;
    }

    if (!valid) return;

    /* Sending state */
    submitBtn.disabled = true;
    sendText.textContent = 'Sending…';

    /* Simulate async send (replace with real API call) */
    await new Promise(resolve => setTimeout(resolve, 1400));

    /* Success state */
    form.style.opacity = '0';
    form.style.transform = 'translateY(8px)';
    form.style.transition = 'opacity 0.3s, transform 0.3s';

    setTimeout(() => {
      form.hidden = true;
      successBox.hidden = false;
    }, 320);
  });
})();

/* ============================================
   5. FOOTER — Dynamic copyright year
   ============================================ */
(function initFooterYear() {
  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
