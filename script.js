/* ============================================================
   AFTERDAWN — Motion Layer
   Lenis smooth scroll + GSAP ScrollTrigger + Splitting + custom cursor
   ============================================================ */

(function () {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  /* ============================================================
     1. SCROLLTRIGGER SMOOTH SCROLL (free alternative to ScrollSmoother)
     ============================================================ */
  let smoothScroll;
  if (!prefersReduced) {
    gsap.registerPlugin(ScrollTrigger);

    const wrapper = document.querySelector('#smooth-wrapper');
    const content = document.querySelector('#smooth-content');

    if (wrapper && content) {
      // Build a tall spacer so the native scrollbar reflects the full content height
      const setHeight = () => {
        document.body.style.height = content.offsetHeight + 'px';
      };
      setHeight();
      window.addEventListener('resize', setHeight);

      // Smooth interpolation state
      const state = { y: 0 };

      // RAF loop: smoothly interpolate toward the real scroll position
      function smoothRaf() {
        const target = window.scrollY || window.pageYOffset;
        state.y += (target - state.y) * 0.08; // lerp factor
        content.style.transform = 'translate3d(0, ' + (-state.y) + 'px, 0)';
        ScrollTrigger.update();
        requestAnimationFrame(smoothRaf);
      }
      requestAnimationFrame(smoothRaf);

      // Proxy ScrollTrigger to the smooth-scroll content
      ScrollTrigger.scrollerProxy(wrapper, {
        scrollTop(value) {
          if (arguments.length) {
            window.scrollTo(0, value);
          }
          return state.y;
        },
        getBoundingClientRect() {
          return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
        },
        pinType: 'transform'
      });

      // Keep ScrollTrigger in sync with the smooth content
      ScrollTrigger.addEventListener('refresh', () => setHeight());
      ScrollTrigger.refresh();

      smoothScroll = { wrapper, content, state };
    }
  } else {
    // No smooth scroll for reduced-motion users
    gsap.registerPlugin(ScrollTrigger);
  }

  /* ============================================================
     2. SPLITTING — split headlines into words
     Preserves inline elements (e.g. <span class="accent">) so
     colour accents survive the split.
     ============================================================ */
  function wrapWords(node, isLast) {
    // Returns an array of DOM nodes with each word wrapped
    const out = [];
    node.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const parts = child.textContent.split(/(\s+)/);
        parts.forEach((part) => {
          if (part === '') return;
          if (/^\s+$/.test(part)) {
            out.push(document.createTextNode(' '));
          } else {
            const outer = document.createElement('span');
            outer.className = 'word';
            const inner = document.createElement('span');
            inner.className = 'word-inner';
            inner.textContent = part;
            outer.appendChild(inner);
            out.push(outer);
          }
        });
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        // Preserve the element (and its classes) but wrap its words
        const clone = child.cloneNode(false);
        wrapWords(child, isLast).forEach((n) => clone.appendChild(n));
        out.push(clone);
      }
    });
    return out;
  }

  function splitHeadlines() {
    document.querySelectorAll('[data-splitting]').forEach((el) => {
      if (el._split) return;
      const nodes = wrapWords(el, true);
      el.innerHTML = '';
      nodes.forEach((n) => el.appendChild(n));
      el._split = true;
    });
  }
  splitHeadlines();

  /* ============================================================
     3. CUSTOM CURSOR
     ============================================================ */
  if (!isTouch) {
    const dot = document.querySelector('.cursor-dot');
    const ring = document.querySelector('.cursor-ring');
    if (dot && ring) {
      document.body.classList.add('cursor-active');

      let mouseX = 0, mouseY = 0;
      let ringX = 0, ringY = 0;
      let dotX = 0, dotY = 0;

      document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
      });

      function animateCursor() {
        dotX += (mouseX - dotX) * 0.35;
        dotY += (mouseY - dotY) * 0.35;
        ringX += (mouseX - ringX) * 0.12;
        ringY += (mouseY - ringY) * 0.12;

        dot.style.transform = `translate(${dotX}px, ${dotY}px) translate(-50%, -50%)`;
        ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;

        requestAnimationFrame(animateCursor);
      }
      animateCursor();

      // Hover states
      document.querySelectorAll('a, button, .btn, .service-row, .project-card').forEach((el) => {
        el.addEventListener('mouseenter', () => ring.classList.add('is-hover'));
        el.addEventListener('mouseleave', () => ring.classList.remove('is-hover'));
      });

      document.querySelectorAll('.project-card').forEach((el) => {
        el.addEventListener('mouseenter', () => {
          ring.classList.remove('is-hover');
          ring.classList.add('is-view');
        });
        el.addEventListener('mouseleave', () => ring.classList.remove('is-view'));
      });
    }
  }

  /* ============================================================
     4. NAVIGATION
     ============================================================ */
  const nav = document.getElementById('nav');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  // Scroll background
  function updateNav() {
    if (window.scrollY > 60) {
      nav.classList.add('is-scrolled');
    } else {
      nav.classList.remove('is-scrolled');
    }
  }
  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  // Mobile toggle
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const open = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!open));
      navLinks.classList.toggle('is-open', !open);
    });

    // Close on link click
    navLinks.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        navToggle.setAttribute('aria-expanded', 'false');
        navLinks.classList.remove('is-open');
      });
    });
  }

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const offset = nav ? nav.offsetHeight : 0;
        const targetY = target.getBoundingClientRect().top + window.scrollY - offset;
        if (smoothScroll) {
          // Tween a plain object and write the value to the scroll position,
          // so we don't need the extra ScrollToPlugin.
          const proxy = { y: window.scrollY };
          gsap.to(proxy, {
            y: targetY,
            duration: 1.1,
            ease: 'power3.inOut',
            onUpdate: () => window.scrollTo(0, proxy.y),
          });
        } else {
          window.scrollTo({ top: targetY, behavior: 'smooth' });
        }
      }
    });
  });

  /* ============================================================
     5. GSAP ANIMATIONS
     ============================================================ */

  // --- 5a. Page load sequence ---
  // Set initial states BEFORE creating the timeline
  gsap.set('.hero-headline .word-inner', { y: 40, opacity: 0 });
  gsap.set('.hero-eyebrow', { y: 20, opacity: 0 });
  gsap.set('.hero-sub', { y: 20, opacity: 0 });
  gsap.set('.hero-ctas', { y: 20, opacity: 0 });

  const loadTl = gsap.timeline({ delay: 0.15 });

  loadTl
    .to('.nav', { opacity: 1, duration: 0.5, ease: 'power2.out' })
    .to('.hero-video', { opacity: 1, duration: 1, ease: 'power2.out' }, 0.2)
    .to('.hero-eyebrow', { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 0.5)
    .to('.hero-headline .word-inner', {
      y: 0,
      opacity: 1,
      duration: 0.8,
      stagger: 0.08,
      ease: 'power3.out',
    }, 0.6)
    .to('.hero-sub', { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 1.0)
    .to('.hero-ctas', { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 1.2)
    .to('.scroll-indicator', { opacity: 1, duration: 0.5, ease: 'power2.out' }, 1.6);

  // --- 5b. Section headlines (word reveal on scroll) ---
  // Skip hero headline — already animated in loadTl
  document.querySelectorAll('section .h1[data-splitting], section .display[data-splitting]').forEach((el) => {
    const inners = el.querySelectorAll('.word-inner');
    if (!inners.length) return;

    gsap.set(inners, { y: 40, opacity: 0 });
    gsap.to(inners, {
      y: 0,
      opacity: 1,
      duration: 0.75,
      stagger: 0.06,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 82%',
        once: true,
      },
    });
  });

  // --- 5c. Generic reveal (fade + slide up) ---
  document.querySelectorAll('[data-reveal]').forEach((el) => {
    gsap.set(el, { y: 50, opacity: 0 });
    gsap.to(el, {
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 82%',
        once: true,
      },
    });
  });

  // --- 5d. Service rows (slide from left with stagger) ---
  document.querySelectorAll('.service-row').forEach((row, i) => {
    gsap.set(row, { x: -40, opacity: 0 });
    gsap.to(row, {
      x: 0,
      opacity: 1,
      duration: 0.7,
      delay: i * 0.1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: row,
        start: 'top 85%',
        once: true,
      },
    });
  });

  // --- 5d-bis. Service row hover: slide description + link right ---
  if (!prefersReduced && !isTouch) {
    document.querySelectorAll('.service-row').forEach((row) => {
      const desc = row.querySelector('.service-desc');
      const link = row.querySelector('.service-link');
      const targets = [desc, link].filter(Boolean);
      if (!targets.length) return;

      const shift = (el) => (el === link ? 22 : 34);

      row.addEventListener('mouseenter', () => {
        targets.forEach((el) => {
          gsap.to(el, {
            x: shift(el),
            duration: 0.5,
            ease: 'power3.out',
            overwrite: 'auto',
          });
        });
      });

      row.addEventListener('mouseleave', () => {
        targets.forEach((el) => {
          gsap.to(el, {
            x: 0,
            duration: 0.45,
            ease: 'power3.out',
            overwrite: 'auto',
          });
        });
      });
    });
  }

  // --- 5e. Project cards (staggered columns) ---
  document.querySelectorAll('.project-col').forEach((col, colIndex) => {
    col.querySelectorAll('.project-card').forEach((card, cardIndex) => {
      gsap.set(card, { y: 60, opacity: 0 });
      gsap.to(card, {
        y: 0,
        opacity: 1,
        duration: 0.9,
        delay: colIndex * 0.2 + cardIndex * 0.15,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          once: true,
        },
      });
    });
  });

  // --- 5f. Testimonial cards (scale up) ---
  document.querySelectorAll('.testimonial-card').forEach((card, i) => {
    gsap.set(card, { scale: 0.95, opacity: 0 });
    gsap.to(card, {
      scale: 1,
      opacity: 1,
      duration: 0.7,
      delay: i * 0.15,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: card,
        start: 'top 85%',
        once: true,
      },
    });
  });

  // --- 5g. About content (slide from sides) ---
  const aboutText = document.querySelector('.about-text');
  const aboutImage = document.querySelector('.about-image');
  if (aboutText) {
    gsap.set(aboutText, { x: -30, opacity: 0 });
    gsap.to(aboutText, {
      x: 0,
      opacity: 1,
      duration: 0.9,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: aboutText,
        start: 'top 80%',
        once: true,
      },
    });
  }
  if (aboutImage) {
    gsap.set(aboutImage, { x: 30, opacity: 0 });
    gsap.to(aboutImage, {
      x: 0,
      opacity: 1,
      duration: 0.9,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: aboutImage,
        start: 'top 80%',
        once: true,
      },
    });
  }

  // --- 5h. Contact columns (slide from sides) ---
  const contactInfo = document.querySelector('.contact-info');
  const contactForm = document.querySelector('.contact-form');
  if (contactInfo) {
    gsap.set(contactInfo, { x: -30, opacity: 0 });
    gsap.to(contactInfo, {
      x: 0,
      opacity: 1,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: contactInfo,
        start: 'top 80%',
        once: true,
      },
    });
  }
  if (contactForm) {
    gsap.set(contactForm, { x: 30, opacity: 0 });
    gsap.to(contactForm, {
      x: 0,
      opacity: 1,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: contactForm,
        start: 'top 80%',
        once: true,
      },
    });
  }

  // --- 5i. Stats counter animation ---
  document.querySelectorAll('.stat-number').forEach((stat) => {
    const target = parseInt(stat.dataset.target, 10);
    const suffix = stat.dataset.suffix || '';

    ScrollTrigger.create({
      trigger: stat,
      start: 'top 80%',
      once: true,
      onEnter: () => {
        gsap.to(
          { val: 0 },
          {
            val: target,
            duration: 2,
            ease: 'power2.out',
            onUpdate: function () {
              stat.textContent = Math.round(this.targets()[0].val) + suffix;
            },
          }
        );
      },
    });
  });

  // --- 5j. Parallax images ---
  if (!prefersReduced) {
    document.querySelectorAll('.parallax-img').forEach((img) => {
      gsap.to(img, {
        yPercent: -12,
        ease: 'none',
        scrollTrigger: {
          trigger: img.closest('.project-img-wrap, .about-image'),
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    });
  }

  /* ============================================================
     6. FORM HANDLING
     ============================================================ */
  const form = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn.textContent;

      // Simple validation
      const name = form.querySelector('#name').value.trim();
      const email = form.querySelector('#email').value.trim();
      const service = form.querySelector('#service').value;
      const message = form.querySelector('#message').value.trim();

      if (!name || !email || !service || !message) {
        formStatus.textContent = 'Please fill in all fields.';
        return;
      }

      // Simulate submit
      btn.textContent = 'Sending...';
      btn.disabled = true;

      setTimeout(() => {
        btn.textContent = originalText;
        btn.disabled = false;
        formStatus.textContent = 'Message sent! We\'ll be in touch soon.';
        form.reset();

        setTimeout(() => {
          formStatus.textContent = '';
        }, 4000);
      }, 1200);
    });
  }

  /* ============================================================
     7. HERO VIDEO FALLBACK
     ============================================================ */
  const heroVideo = document.querySelector('.hero-video');
  if (heroVideo) {
    heroVideo.addEventListener('loadeddata', () => {
      heroVideo.classList.add('is-ready');
    });
    // Fallback if video fails or is blocked
    heroVideo.addEventListener('error', () => {
      heroVideo.classList.add('is-ready');
    });
    // Fallback after short timeout
    setTimeout(() => {
      if (!heroVideo.classList.contains('is-ready')) {
        heroVideo.classList.add('is-ready');
      }
    }, 800);
  }

  /* ============================================================
     8. ACCESSIBILITY: main landmark id
     (skip-link lives in the HTML so it works without JS)
     ============================================================ */
  const main = document.querySelector('main');
  if (main && !main.id) main.id = 'main';
})();
