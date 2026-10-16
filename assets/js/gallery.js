/**
 * gallery.js
 * Filterable masonry photo gallery + accessible lightbox modal.
 *
 * Features:
 *  1. Category filter buttons (All / Events / Sports / Classroom / Facilities)
 *     - Filters items with a CSS fade+scale transition
 *     - Accessible: aria-pressed on each button, role="status" live region
 *
 *  2. Lightbox modal
 *     - Opens on image click
 *     - Next / Prev navigation (wraps around)
 *     - Keyboard: ArrowRight, ArrowLeft, Escape
 *     - Focus trap inside the modal while open
 *     - Click outside the image (backdrop) closes it
 *     - ARIA: role="dialog", aria-modal, aria-label, aria-live for caption
 *
 *  3. Lazy loading
 *     - Gallery images use data-src; IntersectionObserver swaps to src
 *     - A low-quality placeholder bg is shown until the real image loads
 *
 * HTML contract:
 *   Gallery wrapper:  <div id="photo-gallery">
 *   Filter buttons:   <button data-filter="all|events|sports|classroom|facilities">
 *   Gallery items:    <div class="gallery-item" data-category="events" data-caption="…">
 *                       <img data-src="…" alt="…" class="gallery-img">
 *                     </div>
 *   Live region:      <p id="gallery-status" role="status" aria-live="polite">
 */

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* State                                                      */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

let currentFilter   = 'all';   // active filter key
let visibleItems    = [];      // array of currently-visible gallery item elements
let lightboxIndex   = 0;       // index within visibleItems
let lightboxOpen    = false;
let lastFocused     = null;    // element to return focus to when lightbox closes

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* 1. Lazy image loading                                      */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function initLazyImages() {
  const images = document.querySelectorAll('img[data-src]');
  if (!images.length) return;

  if (!('IntersectionObserver' in window)) {
    // Fallback: load all immediately
    images.forEach(img => {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        img.addEventListener('load', () => {
          img.classList.add('lazy-loaded');
          img.closest('.gallery-item')?.classList.add('img-ready');
        }, { once: true });
        observer.unobserve(img);
      });
    },
    { rootMargin: '200px 0px' }  // start loading 200px before entering viewport
  );

  images.forEach(img => observer.observe(img));
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* 2. Filter                                                  */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function applyFilter(filter) {
  currentFilter = filter;

  const allItems = document.querySelectorAll('.gallery-item');
  const buttons  = document.querySelectorAll('[data-filter]');
  const status   = document.getElementById('gallery-status');

  // Update button states
  buttons.forEach(btn => {
    const isActive = btn.dataset.filter === filter;
    btn.setAttribute('aria-pressed', String(isActive));
    if (isActive) {
      btn.classList.add('bg-leaf-500', 'text-white', 'border-leaf-500');
      btn.classList.remove('bg-white', 'text-ink', 'border-sky-200',
                           'hover:bg-sky-50', 'hover:border-sky-400');
    } else {
      btn.classList.remove('bg-leaf-500', 'text-white', 'border-leaf-500');
      btn.classList.add('bg-white', 'text-ink', 'border-sky-200',
                        'hover:bg-sky-50', 'hover:border-sky-400');
    }
  });

  // Show / hide items with animation
  visibleItems = [];
  allItems.forEach((item) => {
    const cat     = item.dataset.category || '';
    const matches = filter === 'all' || cat === filter;

    if (matches) {
      item.classList.remove('gallery-hidden');
      item.classList.add('gallery-visible');
      visibleItems.push(item);
    } else {
      item.classList.add('gallery-hidden');
      item.classList.remove('gallery-visible');
    }
  });

  // Trigger lazy-load for newly-visible items
  initLazyImages();

  // Announce to screen readers
  if (status) {
    const count = visibleItems.length;
    const label = filter === 'all' ? 'all categories' : filter;
    status.textContent = `Showing ${count} photo${count !== 1 ? 's' : ''} in ${label}.`;
  }
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* 3. Lightbox                                                */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

/* ── DOM references ── */
function getLightbox()  { return document.getElementById('lightbox'); }
function getLbImg()     { return document.getElementById('lb-img'); }
function getLbCaption() { return document.getElementById('lb-caption'); }
function getLbCounter() { return document.getElementById('lb-counter'); }

/** Open lightbox at the given index within visibleItems */
function openLightbox(index) {
  const lb = getLightbox();
  if (!lb) return;

  lightboxIndex = ((index % visibleItems.length) + visibleItems.length) % visibleItems.length;
  lightboxOpen  = true;

  // Remember what had focus before opening
  lastFocused = document.activeElement;

  // Set content
  renderLightboxSlide();

  // Show
  lb.classList.remove('hidden');
  lb.removeAttribute('aria-hidden');
  document.body.classList.add('overflow-hidden');   // prevent scroll

  // Focus the close button first
  document.getElementById('lb-close')?.focus();
}

/** Close lightbox */
function closeLightbox() {
  const lb = getLightbox();
  if (!lb) return;

  lb.classList.add('hidden');
  lb.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('overflow-hidden');
  lightboxOpen = false;

  // Return focus
  lastFocused?.focus();
  lastFocused = null;
}

/** Navigate to adjacent slide */
function navigateLightbox(direction) {
  // direction: +1 (next) or -1 (prev)
  lightboxIndex =
    ((lightboxIndex + direction + visibleItems.length) % visibleItems.length);
  renderLightboxSlide();
}

/** Update the lightbox image, caption and counter */
function renderLightboxSlide() {
  const item    = visibleItems[lightboxIndex];
  if (!item) return;

  const img     = item.querySelector('img');
  const caption = item.dataset.caption || img?.alt || '';
  const src     = img?.src || img?.dataset.src || '';

  const lbImg     = getLbImg();
  const lbCaption = getLbCaption();
  const lbCounter = getLbCounter();

  if (lbImg) {
    // Fade transition
    lbImg.style.opacity = '0';
    lbImg.src = src;
    lbImg.alt = caption;
    lbImg.onload  = () => { lbImg.style.opacity = '1'; };
    lbImg.onerror = () => { lbImg.style.opacity = '1'; }; // show broken img
  }

  if (lbCaption) lbCaption.textContent = caption;
  if (lbCounter) lbCounter.textContent = `${lightboxIndex + 1} / ${visibleItems.length}`;
}

/** Focus trap: keep Tab inside the lightbox while it's open */
function handleFocusTrap(e) {
  if (!lightboxOpen) return;
  const lb = getLightbox();
  if (!lb) return;

  const focusable = Array.from(
    lb.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
  ).filter(el => !el.disabled && el.offsetParent !== null);

  if (!focusable.length) return;

  const first = focusable[0];
  const last  = focusable[focusable.length - 1];

  if (e.key === 'Tab') {
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* 4. Event listeners                                         */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function attachGalleryListeners() {
  // Filter buttons
  document.querySelectorAll('[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => applyFilter(btn.dataset.filter));
  });

  // Gallery item clicks → open lightbox
  document.getElementById('photo-gallery')?.addEventListener('click', (e) => {
    const item = e.target.closest('.gallery-item');
    if (!item) return;
    const idx = visibleItems.indexOf(item);
    if (idx > -1) openLightbox(idx);
  });

  // Gallery keyboard: Enter / Space on focused item
  document.getElementById('photo-gallery')?.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const item = e.target.closest('.gallery-item');
    if (!item) return;
    e.preventDefault();
    const idx = visibleItems.indexOf(item);
    if (idx > -1) openLightbox(idx);
  });

  // Lightbox controls
  document.getElementById('lb-close')?.addEventListener('click', closeLightbox);
  document.getElementById('lb-prev')?.addEventListener('click',  () => navigateLightbox(-1));
  document.getElementById('lb-next')?.addEventListener('click',  () => navigateLightbox(+1));

  // Backdrop click closes
  getLightbox()?.addEventListener('click', (e) => {
    if (e.target === getLightbox() || e.target.id === 'lb-backdrop') {
      closeLightbox();
    }
  });

  // Keyboard: arrows, escape
  document.addEventListener('keydown', (e) => {
    if (!lightboxOpen) return;

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        closeLightbox();
        break;
      case 'ArrowRight':
        e.preventDefault();
        navigateLightbox(+1);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        navigateLightbox(-1);
        break;
    }
  });

  // Focus trap
  document.addEventListener('keydown', handleFocusTrap);
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* 5. Bootstrap                                               */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

document.addEventListener('DOMContentLoaded', () => {
  attachGalleryListeners();
  applyFilter('all');     // initialise with all items visible
});
