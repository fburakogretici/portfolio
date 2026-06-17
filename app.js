/* =============================================
   PORTFOLIO JS — Burak Öğretici
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

/* ============================================
   6. I18N (LANGUAGE SWITCHER)
   ============================================ */
(function initI18n() {
  const translations = {
    en: {
      navHome: "Home",
      navAbout: "About",
      navProjects: "Projects",
      navContact: "Contact",
      heroBadge: "<span class=\"badge-dot\" aria-hidden=\"true\"></span> Available for new opportunities",
      heroTitle: "Full Stack Developer",
      heroDesc: "Solving complex problems with elegant code; building scalable SaaS platforms, automation systems, and end-to-end digital solutions.",
      btnProjects: "View Projects",
      btnContact: "Contact Me",
      aboutEyebrow: "About & Expertise",
      aboutP1: "With a strong foundation in both software architecture and business processes, backed by a high-honors degree in Management Information Systems (MIS).",
      aboutP2: "This includes <strong>Hospital Information Management Systems (HBYS)</strong> — mission-critical healthcare infrastructure — alongside complex, multi-party <strong>API integration platforms</strong> that connect fragmented enterprise ecosystems into seamless, automated pipelines.",
      aboutP3: "My work sits at the intersection of software architecture, process automation, and AI — turning operational complexity into clean, maintainable solutions that scale with the business.",
      techHeading: "Tech Stack & Toolbox",
      groupTitleBackend: "Backend & Database",
      groupSubBackend: "Server logic, data persistence & query optimization",
      projEyebrow: "Featured Work",
      projHeading: "Projects that <span class=\"heading-accent\">Ship</span>",
      projNoCodeDesc: "A modern, full-featured website builder and SaaS platform that empowers anyone to create, publish, and scale professional web pages — without writing a single line of code. Built with a sharp focus on UX, performance, and scalability.",
      projAuroxDesc: "End-to-end digital solutions designed to digitalize and streamline operational processes for businesses. From bespoke software development to automation pipelines, Aurox bridges the gap between business complexity and elegant, efficient systems.",
      projACEDesc: "A fully autonomous, end-to-end video and content production workflow that operates with <strong>zero human intervention</strong>. Powered by n8n orchestration and Generative AI, it researches topics, writes scripts, generates visuals, edits, and publishes — on its own schedule.",
      contactEyebrow: "Contact",
      contactHeading: "Let's Build Something <span class=\"heading-accent\">Great</span>",
      contactDesc: "I'm currently open for new projects and collaborations. Whether you have a specific idea in mind or just want to explore possibilities, I'd love to hear from you.",
      formName: "Name",
      formEmail: "Email Address",
      formMsg: "Your Message",
      formSubmit: "Send Message",
      footerMade: "Crafted with <span class=\"footer-heart\" aria-label=\"love\">♥</span> & clean code."
    },
    tr: {
      navHome: "Ana Sayfa",
      navAbout: "Hakkımda",
      navProjects: "Projeler",
      navContact: "İletişim",
      heroBadge: "<span class=\"badge-dot\" aria-hidden=\"true\"></span> Yeni fırsatlara açık",
      heroTitle: "Full Stack Geliştirici",
      heroDesc: "Zarif kodlarla karmaşık sorunları çözüyor; ölçeklenebilir SaaS platformları, otomasyon sistemleri ve uçtan uca dijital çözümler üretiyorum.",
      btnProjects: "Projeleri İncele",
      btnContact: "Benimle İletişime Geç",
      aboutEyebrow: "Hakkımda & Uzmanlık",
      aboutP1: "Yönetim Bilişim Sistemleri (YBS) bölümünden yüksek onur derecesi ile mezun oldum. Hem yazılım mimarisi hem de iş süreçleri konusunda güçlü bir temele sahibim.",
      aboutP2: "Görev kritik sağlık altyapıları olan <strong>Hastane Bilgi Yönetim Sistemleri (HBYS)</strong> geliştirmelerinin yanı sıra, parçalanmış kurumsal ekosistemleri kesintisiz, otomatik süreçlere bağlayan karmaşık, çok taraflı <strong>API entegrasyon platformları</strong> inşa ediyorum.",
      aboutP3: "Çalışmalarım yazılım mimarisi, süreç otomasyonu ve yapay zekanın kesişim noktasında yer alıyor; operasyonel karmaşıklığı işletmeyle birlikte ölçeklenebilen temiz, sürdürülebilir çözümlere dönüştürüyorum.",
      techHeading: "Teknoloji Yığını & Araç Kutusu",
      groupTitleBackend: "Backend & Veritabanı",
      groupSubBackend: "Sunucu mantığı, veri kalıcılığı ve sorgu optimizasyonu",
      projEyebrow: "Öne Çıkan Çalışmalar",
      projHeading: "Hayata Geçen <span class=\"heading-accent\">Projeler</span>",
      projNoCodeDesc: "Herkesin tek satır kod yazmadan profesyonel web sayfaları oluşturmasına, yayınlamasına ve ölçeklendirmesine olanak tanıyan modern, tam özellikli bir web sitesi oluşturucu ve SaaS platformu. Kullanıcı deneyimi, performans ve ölçeklenebilirlik odaklı geliştirildi.",
      projAuroxDesc: "İşletmelerin operasyonel süreçlerini dijitalleştirmek ve kolaylaştırmak için tasarlanmış uçtan uca dijital çözümler. Özel yazılım geliştirmeden otomasyon süreçlerine kadar Aurox, iş karmaşıklığı ile zarif, verimli sistemler arasındaki boşluğu doldurur.",
      projACEDesc: "Sıfır insan müdahalesi ile çalışan tamamen otonom, uçtan uca bir video ve içerik üretim iş akışı. N8n orkestrasyonu ve Üretken Yapay Zeka (GenAI) ile güçlendirilmiştir; kendi programına göre konuları araştırır, metinler yazar, görseller oluşturur, düzenler ve yayınlar.",
      contactEyebrow: "İletişim",
      contactHeading: "Harika Bir Şey <span class=\"heading-accent\">İnşa Edelim</span>",
      contactDesc: "Şu anda yeni projelere ve işbirliklerine açığım. Aklınızda belirli bir fikir varsa veya sadece olasılıkları keşfetmek istiyorsanız, sizden haber almaktan memnuniyet duyarım.",
      formName: "İsim",
      formEmail: "E-posta Adresi",
      formMsg: "Mesajınız",
      formSubmit: "Mesaj Gönder",
      footerMade: "<span class=\"footer-heart\" aria-label=\"love\">♥</span> ve temiz kod ile hazırlandı."
    }
  };

  const selectors = {
    navHome: '#nav-home',
    navAbout: '#nav-about',
    navProjects: '#nav-projects',
    navContact: '#nav-contact',
    heroBadge: '#hero-badge',
    heroTitle: '#title-text',
    heroDesc: '.hero-desc',
    btnProjects: '#hero-cta-primary .btn-text',
    btnContact: '#hero-cta-secondary .btn-text',
    aboutEyebrow: '#about-eyebrow .eyebrow-text',
    aboutP1: '#about-para-1',
    aboutP2: '#about-para-2',
    aboutP3: '#about-para-3',
    techHeading: '#tech-heading',
    groupTitleBackend: '#group-title-backend',
    groupSubBackend: '#tech-group-backend .tech-group-sub',
    projEyebrow: '#projects-eyebrow .eyebrow-text',
    projHeading: '#projects-heading',
    projNoCodeDesc: '#proj-nocodepage .pc-desc',
    projAuroxDesc: '#proj-aurox .pc-desc',
    projACEDesc: '#proj-ace .pc-desc',
    contactEyebrow: '#contact-eyebrow .eyebrow-text',
    contactHeading: '#contact-heading',
    contactDesc: '#contact-desc',
    formName: 'label[for="field-name"]',
    formEmail: 'label[for="field-email"]',
    formMsg: 'label[for="field-message"]',
    formSubmit: '#contact-form button[type="submit"] span.btn-text',
    footerMade: '.footer-made'
  };

  const btnTr = document.getElementById('lang-tr');
  const btnEn = document.getElementById('lang-en');
  if (!btnTr || !btnEn) return;

  const btnToggle = document.getElementById('lang-toggle-btn');

  function setLanguage(lang) {
    document.documentElement.lang = lang;
    localStorage.setItem('pref-lang', lang);

    // Update UI toggle
    if (lang === 'tr') {
      btnTr.classList.add('lang-active');
      btnEn.classList.remove('lang-active');
    } else {
      btnEn.classList.add('lang-active');
      btnTr.classList.remove('lang-active');
    }

    // Replace text
    const dict = translations[lang];
    for (const key in selectors) {
      const el = document.querySelector(selectors[key]);
      if (el && dict[key]) {
        el.innerHTML = dict[key];
      }
    }
  }

  // Listeners
  if (btnToggle) {
    btnToggle.addEventListener('click', () => {
      const current = document.documentElement.lang || 'en';
      setLanguage(current === 'tr' ? 'en' : 'tr');
    });
  }

  // Init
  const savedLang = localStorage.getItem('pref-lang') || 'en';
  setLanguage(savedLang);
})();
