/**
 * main.js
 * Client-side behaviour shared across every page.
 *
 * Features:
 *  1. Mobile menu toggle  (hamburger ↔ drawer)
 *  2. Navbar scroll shadow  (adds shadow when page is scrolled)
 *  3. IntersectionObserver scroll-reveal  (.reveal → .visible)
 *  4. Animated stat counters  ([data-counter])
 *  5. Accordion handler  ([data-accordion])
 *  6. Back-to-top button  (#back-to-top)
 *
 * Depends on:
 *  - components.js (must run first so the header/footer DOM exists)
 *  - custom.css     (provides .reveal, .visible, .nav-link-active)
 *
 * Load order at bottom of <body>:
 *   <script src="assets/js/components.js"></script>
 *   <script src="assets/js/main.js"></script>
 */

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* Utility: wait until components.js has injected the header */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initNavbarScroll();
  initScrollReveal();
  initStatCounters();
  initAccordions();
  initBackToTop();
});

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* 1. Mobile menu toggle                                     */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function initMobileMenu() {
  const toggle  = document.getElementById('menu-toggle');
  const drawer  = document.getElementById('mobile-drawer');
  const iconOpen  = document.getElementById('icon-open');
  const iconClose = document.getElementById('icon-close');

  if (!toggle || !drawer) return; // header not yet rendered (edge case)

  function openMenu() {
    drawer.classList.remove('hidden');
    toggle.setAttribute('aria-expanded', 'true');
    iconOpen.classList.add('hidden');
    iconClose.classList.remove('hidden');
    // Trap focus inside the drawer
    drawer.querySelectorAll('a, button')[0]?.focus();
  }

  function closeMenu() {
    drawer.classList.add('hidden');
    toggle.setAttribute('aria-expanded', 'false');
    iconOpen.classList.remove('hidden');
    iconClose.classList.add('hidden');
  }

  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    isOpen ? closeMenu() : openMenu();
  });

  // Close drawer when any nav link is tapped
  drawer.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      toggle.focus();
    }
  });

  // Close when clicking outside the navbar
  document.addEventListener('click', (e) => {
    const navbar = document.getElementById('navbar');
    if (navbar && !navbar.contains(e.target)) {
      closeMenu();
    }
  });
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* 2. Navbar scroll shadow                                   */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const SCROLL_THRESHOLD = 20; // px

  function updateNavbar() {
    if (window.scrollY > SCROLL_THRESHOLD) {
      navbar.classList.add('shadow-soft');
      navbar.classList.remove('shadow-soft-sm');
    } else {
      navbar.classList.remove('shadow-soft');
      navbar.classList.add('shadow-soft-sm');
    }
  }

  window.addEventListener('scroll', updateNavbar, { passive: true });
  updateNavbar(); // run once on load
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* 3. IntersectionObserver scroll-reveal                     */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

/**
 * Usage in HTML:
 *   <div class="reveal">...</div>
 *   <div class="reveal reveal-left">...</div>
 *   <div class="reveal reveal-right">...</div>
 *   <div class="reveal reveal-scale">...</div>
 *   <ul class="reveal-stagger">...</ul>  <!-- children animate in sequence -->
 *
 * CSS transitions are defined in custom.css.
 */
function initScrollReveal() {
  // Respect reduced-motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const targets = document.querySelectorAll('.reveal, .reveal-stagger');
  if (!targets.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Stop observing once revealed (one-shot animation)
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,    // 12 % of element must be visible
      rootMargin: '0px 0px -40px 0px', // trigger slightly before reaching viewport bottom
    }
  );

  targets.forEach((el) => observer.observe(el));
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* 4. Animated stat counters                                 */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

/**
 * Usage in HTML:
 *   <span data-counter="1200" data-suffix="+" data-duration="1800">0</span>
 *
 * Attributes:
 *   data-counter   – target number (required)
 *   data-suffix    – appended after the number, e.g. "+" or "%" (optional)
 *   data-prefix    – prepended before the number, e.g. "KSh" (optional)
 *   data-duration  – animation duration in ms, default 1600 (optional)
 *
 * The counter starts when the element enters the viewport.
 */
function initStatCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  if (!counters.length) return;

  // Ease-out quad for a natural deceleration
  function easeOutQuad(t) {
    return t * (2 - t);
  }

  function animateCounter(el) {
    const target   = parseFloat(el.dataset.counter);
    const suffix   = el.dataset.suffix   || '';
    const prefix   = el.dataset.prefix   || '';
    const duration = parseInt(el.dataset.duration, 10) || 1600;
    const start    = performance.now();

    // Determine decimal places from the target value
    const decimals = (el.dataset.counter.includes('.'))
      ? (el.dataset.counter.split('.')[1]?.length ?? 0)
      : 0;

    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const value    = easeOutQuad(progress) * target;

      el.textContent = `${prefix}${value.toFixed(decimals)}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        // Ensure we land exactly on the target
        el.textContent = `${prefix}${target.toFixed(decimals)}${suffix}`;
      }
    }

    requestAnimationFrame(step);
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // Just set the final value immediately
    counters.forEach((el) => {
      const target = el.dataset.counter;
      const suffix = el.dataset.suffix || '';
      const prefix = el.dataset.prefix || '';
      el.textContent = `${prefix}${target}${suffix}`;
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((el) => observer.observe(el));
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* 5. Accordion handler                                      */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

/**
 * Usage in HTML:
 *
 *  <div data-accordion>
 *    <div data-accordion-item>
 *      <button data-accordion-trigger aria-expanded="false">
 *        Question text
 *        <!-- chevron icon (optional) -->
 *        <svg data-accordion-icon ...>...</svg>
 *      </button>
 *      <div data-accordion-panel class="hidden">
 *        Answer text
 *      </div>
 *    </div>
 *    <!-- more items … -->
 *  </div>
 *
 * By default only one item may be open at a time (exclusive).
 * Add data-accordion="multi" to allow multiple open items.
 */
function initAccordions() {
  const accordions = document.querySelectorAll('[data-accordion]');

  accordions.forEach((accordion) => {
    const isMulti = accordion.dataset.accordion === 'multi';
    const triggers = accordion.querySelectorAll('[data-accordion-trigger]');

    triggers.forEach((trigger) => {
      trigger.addEventListener('click', () => {
        const isExpanded = trigger.getAttribute('aria-expanded') === 'true';

        // Close all siblings (unless multi-mode)
        if (!isMulti) {
          triggers.forEach((t) => {
            if (t !== trigger) {
              closeAccordionItem(t);
            }
          });
        }

        // Toggle clicked item
        isExpanded ? closeAccordionItem(trigger) : openAccordionItem(trigger);
      });

      // Keyboard: Space / Enter already handled by button,
      // but also support ArrowDown / ArrowUp for list navigation
      trigger.addEventListener('keydown', (e) => {
        const triggerList = Array.from(triggers);
        const idx = triggerList.indexOf(trigger);
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          triggerList[(idx + 1) % triggerList.length].focus();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          triggerList[(idx - 1 + triggerList.length) % triggerList.length].focus();
        }
      });
    });
  });
}

function openAccordionItem(trigger) {
  const panel = trigger.closest('[data-accordion-item]')
                       ?.querySelector('[data-accordion-panel]');
  const icon  = trigger.querySelector('[data-accordion-icon]');

  trigger.setAttribute('aria-expanded', 'true');
  if (panel) panel.classList.remove('hidden');
  if (icon)  icon.style.transform = 'rotate(180deg)';
}

function closeAccordionItem(trigger) {
  const panel = trigger.closest('[data-accordion-item]')
                       ?.querySelector('[data-accordion-panel]');
  const icon  = trigger.querySelector('[data-accordion-icon]');

  trigger.setAttribute('aria-expanded', 'false');
  if (panel) panel.classList.add('hidden');
  if (icon)  icon.style.transform = 'rotate(0deg)';
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* 6. Back-to-top button                                     */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

/**
 * Injects a #back-to-top button dynamically (no HTML needed).
 * The button appears after scrolling 400 px down.
 */
function initBackToTop() {
  // Create the button
  const btn = document.createElement('button');
  btn.id = 'back-to-top';
  btn.type = 'button';
  btn.setAttribute('aria-label', 'Back to top');
  btn.className = [
    'fixed bottom-24 right-6 z-40',   // above content, below WhatsApp
    'flex items-center justify-center',
    'w-11 h-11 rounded-full',
    'bg-sky-500 hover:bg-sky-600',
    'text-white shadow-soft',
    'transition-all duration-300',
    'opacity-0 pointer-events-none translate-y-4', // hidden initially
  ].join(' ');

  btn.innerHTML = `
    <svg class="w-5 h-5" fill="none" stroke="currentColor"
         stroke-width="2.5" viewBox="0 0 24 24" aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7"/>
    </svg>`;

  document.body.appendChild(btn);

  // Show / hide on scroll
  const SHOW_AFTER = 400;

  function updateVisibility() {
    if (window.scrollY > SHOW_AFTER) {
      btn.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-4');
      btn.classList.add('opacity-100', 'translate-y-0');
    } else {
      btn.classList.add('opacity-0', 'pointer-events-none', 'translate-y-4');
      btn.classList.remove('opacity-100', 'translate-y-0');
    }
  }

  window.addEventListener('scroll', updateVisibility, { passive: true });
  updateVisibility();

  // Scroll to top on click
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
