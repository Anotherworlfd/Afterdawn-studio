(function () {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  gsap.registerPlugin(ScrollTrigger);

  let smoothScroll = null;
  if (!prefersReduced && !isTouch) {
    const wrapper = document.querySelector('#smooth-wrapper');
    const content = document.querySelector('#smooth-content');

    if (wrapper && content) {
      const setHeight = () => { document.body.style.height = content.offsetHeight + 'px'; };
      setHeight();
      window.addEventListener('resize', setHeight);

      const state = { y: 0 };

      function smoothRaf() {
        const target = window.scrollY || window.pageYOffset;
        state.y += (target - state.y) * 0.08;
        content.style.transform = 'translate3d(0, ' + (-state.y) + 'px, 0)';
        ScrollTrigger.update();
        requestAnimationFrame(smoothRaf);
      }
      requestAnimationFrame(smoothRaf);

      ScrollTrigger.scrollerProxy(wrapper, {
        scrollTop(value) {
          if (arguments.length) { window.scrollTo(0, value); }
          return state.y;
        },
        getBoundingClientRect() {
          return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
        },
        pinType: 'transform'
      });

      ScrollTrigger.addEventListener('refresh', () => setHeight());
      ScrollTrigger.refresh();

      smoothScroll = { wrapper, content, state };
    }
  }

  function wrapWords(node, isLast) {
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

      document.querySelectorAll('.hero-headline').forEach(el => {
        const textNodes = el.querySelectorAll('.word-inner');
        textNodes.forEach(text => {
          text.addEventListener('mouseenter', () => ring.classList.add('is-text-hover'));
          text.addEventListener('mouseleave', () => ring.classList.remove('is-text-hover'));
        });
      });

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

  const root = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = themeToggle ? themeToggle.querySelector('svg') : null;

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    themeToggle.setAttribute('aria-pressed', String(theme === 'light'));
  }
  if (themeToggle && themeIcon) {
    applyTheme(root.getAttribute('data-theme') || 'dark');
    themeToggle.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      applyTheme(next);
      localStorage.setItem('theme', next);
    });
  }

  const nav = document.getElementById('nav');
  const menuToggle = document.getElementById('menuToggle');
  const menuLabel = document.getElementById('menuLabel');
  const navDrawer = document.getElementById('navDrawer');
  const drawerLinks = navDrawer ? navDrawer.querySelectorAll('a') : [];
  let focusedBeforeOpen = null;

  function setLock(lock) {
    document.documentElement.style.overflow = lock ? 'hidden' : '';
    document.body.style.overflow = lock ? 'hidden' : '';
  }

  function closeMenu() {
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open menu');
    menuLabel.textContent = 'MENU';
    navDrawer.classList.remove('is-open');
    navDrawer.setAttribute('aria-hidden', 'true');
    nav.classList.remove('nav--drawer-open');
    setLock(false);
    if (focusedBeforeOpen) {
      focusedBeforeOpen.focus();
      focusedBeforeOpen = null;
    }
  }

  function openMenu() {
    focusedBeforeOpen = document.activeElement;
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.setAttribute('aria-label', 'Close menu');
    menuLabel.textContent = 'CLOSE';
    navDrawer.classList.add('is-open');
    navDrawer.setAttribute('aria-hidden', 'false');
    nav.classList.add('nav--drawer-open');
    setLock(window.innerWidth < 768);
    const firstLink = navDrawer.querySelector('.nav-drawer-link');
    if (firstLink) firstLink.focus();
  }

  function updateNav() {
    if (window.scrollY > 60) {
      nav.classList.add('is-scrolled');
    } else {
      nav.classList.remove('is-scrolled');
    }
  }
  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  // IntersectionObserver toggles .nav--on-hero while the hero is behind the navbar
  const heroSection = document.querySelector('.hero');
  if (heroSection && nav) {
    const heroObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          nav.classList.toggle('nav--on-hero', entry.isIntersecting);
        });
      },
      { threshold: 0, rootMargin: `-${nav.offsetHeight || 72}px 0px 0px 0px` }
    );
    heroObserver.observe(heroSection);
  }

  if (menuToggle && navDrawer) {
    menuToggle.addEventListener('click', () => {
      if (menuToggle.getAttribute('aria-expanded') === 'true') closeMenu();
      else openMenu();
    });

    drawerLinks.forEach((link) => link.addEventListener('click', closeMenu));

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') closeMenu();
    });

    // Close when clicking outside the drawer (and not on the toggle)
    document.addEventListener('click', (e) => {
      if (menuToggle.getAttribute('aria-expanded') !== 'true') return;
      if (navDrawer.contains(e.target) || menuToggle.contains(e.target)) return;
      closeMenu();
    });
  }

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
      y: 0, opacity: 1, duration: 0.8, stagger: 0.08, ease: 'power3.out',
    }, 0.6)
    .to('.hero-sub', { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 1.0)
    .to('.hero-ctas', { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 1.2)
    .to('.scroll-indicator', { opacity: 1, duration: 0.5, ease: 'power2.out' }, 1.6);

  document.querySelectorAll('section .h1[data-splitting], section .display[data-splitting]').forEach((el) => {
    const inners = el.querySelectorAll('.word-inner');
    if (!inners.length) return;

    gsap.set(inners, { y: 40, opacity: 0 });
    gsap.to(inners, {
      y: 0, opacity: 1, duration: 0.75, stagger: 0.06, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 82%', once: true },
    });
  });

  document.querySelectorAll('[data-reveal]').forEach((el) => {
    gsap.set(el, { y: 50, opacity: 0 });
    gsap.to(el, {
      y: 0, opacity: 1, duration: 0.8, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 82%', once: true },
    });
  });

  document.querySelectorAll('.service-row').forEach((row, i) => {
    gsap.set(row, { x: -40, opacity: 0 });
    gsap.to(row, {
      x: 0, opacity: 1, duration: 0.7, delay: i * 0.1, ease: 'power2.out',
      scrollTrigger: { trigger: row, start: 'top 85%', once: true },
    });
  });

  if (!prefersReduced && !isTouch) {
    document.querySelectorAll('.service-row').forEach((row) => {
      const desc = row.querySelector('.service-desc');
      const link = row.querySelector('.service-link');
      const targets = [desc, link].filter(Boolean);
      if (!targets.length) return;

      const shift = (el) => (el === link ? 22 : 34);

      row.addEventListener('mouseenter', () => {
        targets.forEach((el) => {
          gsap.to(el, { x: shift(el), duration: 0.5, ease: 'power3.out', overwrite: 'auto' });
        });
      });
      row.addEventListener('mouseleave', () => {
        targets.forEach((el) => {
          gsap.to(el, { x: 0, duration: 0.45, ease: 'power3.out', overwrite: 'auto' });
        });
      });
    });
  }

  const workSection = document.querySelector('.work');
  if (workSection && !prefersReduced && !isTouch) {
    const workCards = Array.from(workSection.querySelectorAll('.project-card'));

    workCards.forEach((card, i) => {
      const dir = i % 2 === 0 ? -1 : 1;
      gsap.set(card, {
        xPercent: dir * 38,
        yPercent: (i % 4) * 3 - 4,
        rotation: dir * 2.4,
        scale: 0.82,
        opacity: 0,
      });
    });

    gsap.to(workCards, {
      xPercent: 0, yPercent: 0, rotation: 0, scale: 1, opacity: 1,
      duration: 1.15, ease: 'power3.out', stagger: 0.09,
      scrollTrigger: { trigger: workSection, start: 'top 70%', once: true },
    });

    const workDepth = (i) => 0.4 + (i / Math.max(1, workCards.length - 1)) * 0.9;
    const quickX = workCards.map((card) =>
      gsap.quickTo(card, 'x', { duration: 1.2, ease: 'power2.out' }));
    const quickY = workCards.map((card) =>
      gsap.quickTo(card, 'y', { duration: 1.2, ease: 'power2.out' }));

    window.addEventListener('mousemove', (e) => {
      const px = (e.clientX / window.innerWidth) * 2 - 1;
      const py = (e.clientY / window.innerHeight) * 2 - 1;
      workCards.forEach((card, i) => {
        const d = workDepth(i);
        quickX[i](-px * 22 * d);
        quickY[i](-py * 18 * d);
      });
    }, { passive: true });
  } else {
    document.querySelectorAll('.project-card').forEach((card) => {
      gsap.set(card, { opacity: 0, y: 24 });
      gsap.to(card, {
        y: 0, opacity: 1, duration: 0.7, ease: 'power2.out',
        scrollTrigger: { trigger: card, start: 'top 85%', once: true },
      });
    });
  }

  const testimonialMarquee = document.querySelector('.testimonial-marquee');
  const testimonialTrack = document.querySelector('.testimonial-track');

  if (testimonialMarquee && testimonialTrack) {
    const originalCards = Array.from(testimonialTrack.children);
    const useNativeScroll = prefersReduced || isTouch;

    gsap.set(testimonialMarquee, { opacity: 0, y: 20 });
    gsap.set(originalCards, { scale: 0.95, opacity: 0 });
    gsap.timeline({
      scrollTrigger: { trigger: testimonialMarquee, start: 'top 85%', once: true },
    })
      .to(testimonialMarquee, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' })
      .to(originalCards, {
        scale: 1,
        opacity: 1,
        duration: 0.7,
        stagger: 0.15,
        ease: 'power2.out',
      }, 0.1);

    const getGap = () => parseFloat(getComputedStyle(testimonialTrack).columnGap) || 0;

    const getSetWidth = () =>
      originalCards.reduce((sum, card) => sum + card.offsetWidth, 0) +
      originalCards.length * getGap();

    const getDuration = () => {
      const value = getComputedStyle(testimonialMarquee).getPropertyValue('--t-duration').trim();
      const seconds = parseFloat(value);
      return Number.isFinite(seconds) && seconds > 0 ? seconds : 55;
    };

    const makeClone = (card) => {
      const clone = card.cloneNode(true);
      gsap.set(clone, { clearProps: 'transform,opacity,scale' });
      clone.setAttribute('aria-hidden', 'true');
      return clone;
    };

    if (useNativeScroll) {
      testimonialMarquee.classList.add('is-native-scroll');
      originalCards.forEach((card) => testimonialTrack.appendChild(makeClone(card)));
    } else {
      let marqueeTl = null;

      const cloneSets = () => {
        const viewport = window.innerWidth;
        const setWidth = getSetWidth();
        const existing = Math.floor(testimonialTrack.children.length / originalCards.length);
        const needed = Math.max(2, Math.ceil((viewport * 2) / setWidth));
        for (let i = existing; i < needed; i++) {
          originalCards.forEach((card) => testimonialTrack.appendChild(makeClone(card)));
        }
      };

      const buildTween = (startX, paused) => {
        if (marqueeTl) marqueeTl.kill();
        marqueeTl = gsap.to(testimonialTrack, {
          x: startX - getSetWidth(),
          duration: getDuration(),
          ease: 'none',
          repeat: -1,
          paused: !!paused,
        });
      };

      cloneSets();
      buildTween(0, false);
      ScrollTrigger.refresh();

      const stopMarquee = () => marqueeTl.pause();
      const startMarquee = () => marqueeTl.play();

      testimonialMarquee.addEventListener('mouseenter', stopMarquee);
      testimonialMarquee.addEventListener('mouseleave', startMarquee);
      testimonialMarquee.addEventListener('focusin', stopMarquee);
      testimonialMarquee.addEventListener('focusout', startMarquee);

      document.addEventListener('visibilitychange', () => {
        document.hidden ? stopMarquee() : startMarquee();
      });

      let resizeTimer = null;
      const recalc = () => {
        const currentX = marqueeTl ? gsap.getProperty(testimonialTrack, 'x') : 0;
        const wasPaused = marqueeTl ? marqueeTl.paused() : false;
        cloneSets();
        buildTween(currentX, wasPaused);
        ScrollTrigger.refresh();
      };
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(recalc, 150);
      });
      window.addEventListener('load', recalc);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(recalc);
    }
  }

  const aboutText = document.querySelector('.about-text');
  const aboutImage = document.querySelector('.about-image');
  if (aboutText) {
    gsap.set(aboutText, { x: -30, opacity: 0 });
    gsap.to(aboutText, {
      x: 0, opacity: 1, duration: 0.9, ease: 'power2.out',
      scrollTrigger: { trigger: aboutText, start: 'top 80%', once: true },
    });
  }
  if (aboutImage) {
    gsap.set(aboutImage, { x: 30, opacity: 0 });
    gsap.to(aboutImage, {
      x: 0, opacity: 1, duration: 0.9, ease: 'power2.out',
      scrollTrigger: { trigger: aboutImage, start: 'top 80%', once: true },
    });
  }

  const contactInfo = document.querySelector('.contact-info');
  const contactForm = document.querySelector('.contact-form');
  if (contactInfo) {
    gsap.set(contactInfo, { x: -30, opacity: 0 });
    gsap.to(contactInfo, {
      x: 0, opacity: 1, duration: 0.8, ease: 'power2.out',
      scrollTrigger: { trigger: contactInfo, start: 'top 80%', once: true },
    });
  }
  if (contactForm) {
    gsap.set(contactForm, { x: 30, opacity: 0 });
    gsap.to(contactForm, {
      x: 0, opacity: 1, duration: 0.8, ease: 'power2.out',
      scrollTrigger: { trigger: contactForm, start: 'top 80%', once: true },
    });
  }

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

  if (!prefersReduced && !isTouch) {
    document.querySelectorAll('.about-image .parallax-img').forEach((img) => {
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

  const form = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn.textContent;

      const name = form.querySelector('#name').value.trim();
      const email = form.querySelector('#email').value.trim();
      const format = form.querySelector('#format').value;
      const message = form.querySelector('#message').value.trim();

      if (!name || !email || !format || !message) {
        formStatus.textContent = 'Please fill in all fields.';
        return;
      }

      btn.textContent = 'Sending...';
      btn.disabled = true;

      setTimeout(() => {
        btn.textContent = originalText;
        btn.disabled = false;
        formStatus.textContent = 'Message sent! We\'ll be in touch soon.';
        form.reset();
        setTimeout(() => { formStatus.textContent = ''; }, 4000);
      }, 1200);
    });
  }

  const heroSlideshow = document.querySelector('.hero-slideshow');
  if (heroSlideshow) {
    const slides = heroSlideshow.querySelectorAll('.hero-slide');
    if (slides.length > 1) {
      let currentIdx = 0;
      let timer = null;

      const show = (idx) => {
        slides[currentIdx].classList.remove('is-active');
        currentIdx = ((idx % slides.length) + slides.length) % slides.length;
        slides[currentIdx].classList.add('is-active');
      };
      const next = () => show(currentIdx + 1);
      const prev = () => show(currentIdx - 1);
      const start = () => { if (!timer) timer = setInterval(next, 5000); };
      const stop = () => { clearInterval(timer); timer = null; };

      ScrollTrigger.create({
        trigger: '.hero',
        start: 'top bottom',
        end: 'bottom top',
        onEnter: start,
        onEnterBack: start,
        onLeave: stop,
        onLeaveBack: stop,
      });

      document.addEventListener('visibilitychange', () => {
        document.hidden ? stop() : start();
      });

      let touchStartX = 0;
      heroSlideshow.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });
      heroSlideshow.addEventListener('touchend', (e) => {
        const dx = e.changedTouches[0].screenX - touchStartX;
        if (Math.abs(dx) > 40) {
          stop();
          dx < 0 ? next() : prev();
          start();
        }
      }, { passive: true });

      start();
    }
  }

  const main = document.querySelector('main');
  if (main && !main.id) main.id = 'main';
})();
