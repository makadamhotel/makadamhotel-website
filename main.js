// ========================================
// MAKADAM HOTEL — Main JS
// ========================================

// ---------- LANGUAGE ----------
const SUPPORTED_LANGS = ['en', 'al', 'de', 'tr', 'bs', 'it'];

function detectLanguage() {
  const stored = localStorage.getItem('makadam_lang');
  if (stored && SUPPORTED_LANGS.includes(stored)) return stored;
  const browser = (navigator.language || 'en').toLowerCase().split('-')[0];
  if (browser === 'sq') return 'al';
  if (browser === 'bs' || browser === 'hr' || browser === 'sr') return 'bs';
  if (SUPPORTED_LANGS.includes(browser)) return browser;
  return 'en';
}

function applyLanguage(lang) {
  if (!translations[lang]) lang = 'en';
  const dict = translations[lang];

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key] !== undefined) el.innerHTML = dict[key];
  });

  document.querySelectorAll('[data-i18n-aria]').forEach(el => {
    const key = el.getAttribute('data-i18n-aria');
    if (dict[key] !== undefined) el.setAttribute('aria-label', dict[key].replace(/<[^>]*>/g, ''));
  });

  document.documentElement.setAttribute('lang', lang);

  // Update language switcher UI
  const current = document.querySelector('.lang-current-code');
  if (current) current.textContent = lang.toUpperCase();
  document.querySelectorAll('.lang-menu button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  localStorage.setItem('makadam_lang', lang);
}

// ---------- NAVIGATION ----------
function initNav() {
  const nav = document.querySelector('.nav');
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');

  // Scroll effect
  const onScroll = () => {
    if (window.scrollY > 50) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Hamburger
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      navLinks.classList.toggle('open');
    });
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        hamburger.classList.remove('open');
        navLinks.classList.remove('open');
      });
    });
  }

  // Language switcher
  const langSwitch = document.querySelector('.lang-switch');
  if (langSwitch) {
    const trigger = langSwitch.querySelector('.lang-current');
    trigger.addEventListener('click', e => {
      e.stopPropagation();
      langSwitch.classList.toggle('open');
    });
    document.addEventListener('click', () => langSwitch.classList.remove('open'));

    langSwitch.querySelectorAll('.lang-menu button').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const lang = btn.dataset.lang;
        applyLanguage(lang);
        langSwitch.classList.remove('open');
      });
    });
  }
}

// ---------- ROOM GALLERIES ----------
function initRoomGalleries() {
  document.querySelectorAll('.room-gallery').forEach(gallery => {
    const slides = gallery.querySelectorAll('.room-gallery-slide');
    const prevBtn = gallery.querySelector('.gallery-prev');
    const nextBtn = gallery.querySelector('.gallery-next');
    const counter = gallery.querySelector('.room-gallery-counter');

    let idx = 0;
    const total = slides.length;

    const show = (i) => {
      idx = (i + total) % total;
      slides.forEach((s, si) => s.classList.toggle('active', si === idx));
      if (counter) counter.textContent = `${String(idx + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
    };

    if (prevBtn) prevBtn.addEventListener('click', () => show(idx - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => show(idx + 1));

    // Touch swipe
    let startX = 0;
    gallery.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    gallery.addEventListener('touchend', e => {
      const diff = e.changedTouches[0].clientX - startX;
      if (Math.abs(diff) > 50) show(idx + (diff < 0 ? 1 : -1));
    });

    // Auto-advance every 7s, paused on hover
    let timer = setInterval(() => show(idx + 1), 7000);
    gallery.addEventListener('mouseenter', () => clearInterval(timer));
    gallery.addEventListener('mouseleave', () => { timer = setInterval(() => show(idx + 1), 7000); });

    show(0);
  });
}

// ---------- REVEAL ON SCROLL ----------
function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -80px 0px' });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ---------- SMOOTH ANCHOR SCROLL ----------
function initAnchors() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (href.length < 2) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const navH = document.querySelector('.nav').offsetHeight;
      const top = target.getBoundingClientRect().top + window.scrollY - navH + 1;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

// ---------- COOKIE CONSENT + DEFERRED META PIXEL ----------
const CONSENT_KEY = 'makadam_consent_v1';

function loadMetaPixel() {
  if (window.fbq || !window.MAKADAM_PIXEL_ID) return;
  // Standard Meta Pixel snippet, executed only after consent
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', window.MAKADAM_PIXEL_ID);
  fbq('track', 'PageView');
  // Once loaded, the event-tracking listeners (initPixelTracking) can fire fbq calls
}

function showCookieBanner() {
  const banner = document.querySelector('.cookie-banner');
  if (!banner) return;
  // Slight delay so it slides in after page loads
  setTimeout(() => banner.classList.add('show'), 600);
}

function hideCookieBanner() {
  const banner = document.querySelector('.cookie-banner');
  if (banner) banner.classList.remove('show');
}

function initCookieConsent() {
  const consent = localStorage.getItem(CONSENT_KEY);

  if (consent === 'accepted') {
    loadMetaPixel();
  } else if (consent === 'declined') {
    // Do not load Pixel
  } else {
    // No choice yet — show banner
    showCookieBanner();
  }

  // Wire buttons
  document.querySelector('.cookie-accept')?.addEventListener('click', () => {
    localStorage.setItem(CONSENT_KEY, 'accepted');
    hideCookieBanner();
    loadMetaPixel();
  });
  document.querySelector('.cookie-decline')?.addEventListener('click', () => {
    localStorage.setItem(CONSENT_KEY, 'declined');
    hideCookieBanner();
  });

  // "Cookie Settings" link in footer — clear choice and show banner again
  document.querySelectorAll('.cookie-settings-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem(CONSENT_KEY);
      showCookieBanner();
    });
  });
}
function safeFbqTrack() {
  if (typeof fbq === 'undefined') return;
  fbq.apply(this, arguments);
}

function initPixelTracking() {
  // Listeners are always attached; fbq calls no-op safely until Pixel loads (after consent)

  // Track all "Book Now" / "Reserve" clicks → InitiateCheckout
  // These all link to the TheLobbyBoy reservation system
  document.querySelectorAll('a[href*="thelobbyboy.com"]').forEach(link => {
    link.addEventListener('click', () => {
      const card = link.closest('.room-card');
      const roomName = card ? (card.querySelector('h3')?.innerText || '').trim() : null;
      safeFbqTrack('track', 'InitiateCheckout', {
        content_category: 'Hotel Booking',
        content_name: roomName || 'General Booking',
        content_ids: card ? [card.id] : ['general']
      });
    });
  });

  // Track WhatsApp clicks → Contact event
  document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
    link.addEventListener('click', () => {
      safeFbqTrack('track', 'Contact', { contact_method: 'whatsapp' });
    });
  });

  // Track email clicks → Contact event
  document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
    link.addEventListener('click', () => {
      safeFbqTrack('track', 'Contact', { contact_method: 'email' });
    });
  });

  // Track room views → ViewContent (when a room card scrolls into view)
  const trackedRooms = new Set();
  const roomObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !trackedRooms.has(entry.target.id)) {
        trackedRooms.add(entry.target.id);
        const roomName = (entry.target.querySelector('h3')?.innerText || '').trim();
        safeFbqTrack('track', 'ViewContent', {
          content_category: 'Hotel Room',
          content_name: roomName,
          content_ids: [entry.target.id]
        });
      }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.room-card[id]').forEach(card => roomObserver.observe(card));
}

// ---------- ROOM SHARE / COPY LINK ----------
function initRoomShare() {
  document.querySelectorAll('.room-share').forEach(btn => {
    btn.addEventListener('click', async () => {
      const permalink = btn.dataset.permalink;
      const roomId = btn.dataset.room;
      // Prefer clean URL like /DeluxeKing; fall back to anchor #room-x
      let url;
      if (permalink) {
        // Use the site root + clean slug. When running on a real host,
        // /DeluxeKing serves DeluxeKing.html (Netlify Pretty URLs).
        const origin = window.location.origin;
        const baseDir = window.location.pathname.replace(/\/[^/]*$/, '/');
        url = origin + baseDir + permalink;
      } else {
        url = window.location.origin + window.location.pathname + '#' + roomId;
      }

      const label = btn.querySelector('.room-share-label');
      const originalKey = label.getAttribute('data-i18n');
      const lang = document.documentElement.getAttribute('lang') || 'en';
      const copiedText = (translations[lang] && translations[lang]['room.share.copied']) || 'Link copied';

      try {
        await navigator.clipboard.writeText(url);
      } catch (e) {
        const ta = document.createElement('textarea');
        ta.value = url;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch (_) {}
        document.body.removeChild(ta);
      }

      label.removeAttribute('data-i18n');
      label.textContent = copiedText;
      btn.classList.add('copied');
      setTimeout(() => {
        label.setAttribute('data-i18n', originalKey);
        label.textContent = (translations[lang] && translations[lang][originalKey]) || 'Copy Link';
        btn.classList.remove('copied');
      }, 2000);
    });
  });
}

// Briefly highlight a room when arriving via deep link (#room-xxx)
function highlightDeepLinkedRoom() {
  if (!window.location.hash) return;
  const id = window.location.hash.replace('#', '');
  const target = document.getElementById(id);
  if (!target || !target.classList.contains('room-card')) return;
  // Wait a beat for layout, then scroll + highlight
  setTimeout(() => {
    target.classList.add('in-view', 'highlight-arrived');
    setTimeout(() => target.classList.remove('highlight-arrived'), 2400);
  }, 400);
}

// ---------- INIT ----------
document.addEventListener('DOMContentLoaded', () => {
  applyLanguage(detectLanguage());
  initNav();
  initRoomGalleries();
  initReveal();
  initAnchors();
  initRoomShare();
  highlightDeepLinkedRoom();
  initPixelTracking();
  initCookieConsent();
});




/* ── PROMO STICKER ─────────────────────────── */
document.addEventListener('DOMContentLoaded', function () {
  const copyBtn = document.getElementById('promoCopy');
  const codeEl  = document.getElementById('promoCode');
  if (!copyBtn || !codeEl) return;
  copyBtn.addEventListener('click', function () {
    navigator.clipboard?.writeText('MAKADAM').catch(() => {
      const r = document.createRange();
      r.selectNodeContents(codeEl);
      const s = window.getSelection();
      s.removeAllRanges(); s.addRange(r);
      document.execCommand('copy');
      s.removeAllRanges();
    });
    copyBtn.textContent = '✓';
    setTimeout(() => { copyBtn.textContent = 'Copy'; }, 2000);
  });
});
