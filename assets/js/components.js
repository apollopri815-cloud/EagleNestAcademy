/**
 * components.js
 * Injects the shared site header, footer, and floating WhatsApp button.
 *
 * How it works:
 *   1. renderHeader()  → fills <div id="site-header">
 *   2. renderFooter()  → fills <div id="site-footer">
 *   3. renderWhatsApp()→ appends a floating button to <body>
 *
 * Call order (bottom of every page, before main.js):
 *   <script src="assets/js/components.js"></script>
 *   <script src="assets/js/main.js"></script>
 *
 * Active-link detection uses window.location.pathname to match
 * the current filename against each nav href.
 */

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* Config – edit these without touching markup               */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const SITE = {
  name:      'EagleNest Academy',
  tagline:   'Soaring to Greater Heights',
  phone:     '+254XXXXXXXXX',          // placeholder – replace before launch
  email:     'info@eaglenest.ac.ke',   // placeholder
  address:   'P.O. Box 1234, Nairobi, Kenya',
  hours:     'Mon – Fri: 7 am – 5 pm',
  logoSrc:   'assets/images/logo/logo.png',
  logoAlt:   'EagleNest Academy logo',
  whatsapp:  '+254XXXXXXXXX',          // same placeholder
};

/* Six primary navigation links */
const NAV_LINKS = [
  { label: 'Home',       href: 'index.html'      },
  { label: 'About',      href: 'about.html'       },
  { label: 'Academics',  href: 'academics.html'   },
  { label: 'Admissions', href: 'admissions.html'  },
  { label: 'Gallery',    href: 'gallery.html'     },
  { label: 'Contact',    href: 'contact.html'     },
];

/* Footer quick links (can differ from the main nav) */
const FOOTER_QUICK_LINKS = [
  { label: 'Home',             href: 'index.html'      },
  { label: 'About Us',         href: 'about.html'      },
  { label: 'Academic Programmes', href: 'academics.html'},
  { label: 'Admissions',       href: 'admissions.html' },
  { label: 'Gallery',          href: 'gallery.html'    },
  { label: 'Contact',          href: 'contact.html'    },
];

/* Social media (href = '#' until real URLs are known) */
const SOCIALS = [
  { label: 'Facebook',  href: '#', icon: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>` },
  { label: 'Twitter/X', href: '#', icon: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>` },
  { label: 'Instagram', href: '#', icon: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>` },
  { label: 'YouTube',   href: '#', icon: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>` },
];

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* Helpers                                                   */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

/**
 * Returns true when the link's href matches the current page filename.
 * Handles both "index.html" style and bare "/" for the home page.
 */
function isActiveLink(href) {
  const path = window.location.pathname;
  const current = path.split('/').pop() || 'index.html';
  return current === href;
}

/**
 * Builds the <li> elements for a nav list.
 * @param {boolean} mobile – applies mobile-drawer-specific classes when true
 */
function buildNavItems(mobile = false) {
  return NAV_LINKS.map(({ label, href }) => {
    const active = isActiveLink(href);

    if (mobile) {
      return `
        <li>
          <a href="${href}"
             class="block px-4 py-3 rounded-lg text-base font-medium transition-colors duration-200
                    ${active
                      ? 'bg-leaf-100 text-leaf-600 font-semibold'
                      : 'text-ink hover:bg-sky-50 hover:text-sky-600'}"
             ${active ? 'aria-current="page"' : ''}>
            ${label}
          </a>
        </li>`;
    }

    return `
      <li>
        <a href="${href}"
           class="text-sm font-medium transition-colors duration-200 pb-0.5
                  ${active
                    ? 'nav-link-active'
                    : 'text-ink hover:text-leaf-500'}"
           ${active ? 'aria-current="page"' : ''}>
          ${label}
        </a>
      </li>`;
  }).join('');
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* 1. Header / Navbar                                        */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function renderHeader() {
  const target = document.getElementById('site-header');
  if (!target) return;

  target.innerHTML = `
    <!-- ── Sticky navbar ── -->
    <header id="navbar"
            class="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-md
                   shadow-soft-sm transition-shadow duration-300"
            role="banner">

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16 md:h-20">

          <!-- Logo -->
          <a href="index.html" class="flex items-center gap-3 shrink-0" aria-label="${SITE.name} – home">
            <img src="${SITE.logoSrc}"
                 alt="${SITE.logoAlt}"
                 class="h-10 w-auto"
                 onerror="this.style.display='none'">
            <span class="font-heading text-lg md:text-xl text-ink leading-tight hidden sm:block">
              ${SITE.name}
            </span>
          </a>

          <!-- Desktop nav -->
          <nav aria-label="Primary navigation" class="hidden lg:block">
            <ul class="flex items-center gap-7" role="list">
              ${buildNavItems(false)}
            </ul>
          </nav>

          <!-- Desktop CTA -->
          <a href="admissions.html"
             class="hidden lg:inline-flex items-center gap-2 bg-leaf-500 hover:bg-leaf-600
                    text-white text-sm font-semibold px-5 py-2.5 rounded-full
                    transition-colors duration-200 shadow-soft-sm">
            Apply Now
          </a>

          <!-- Mobile hamburger button -->
          <button id="menu-toggle"
                  type="button"
                  aria-controls="mobile-drawer"
                  aria-expanded="false"
                  aria-label="Open navigation menu"
                  class="lg:hidden inline-flex items-center justify-center
                         p-2 rounded-lg text-ink hover:bg-sky-50 transition-colors">
            <!-- Hamburger icon (three lines) -->
            <svg id="icon-open" class="w-6 h-6" fill="none" stroke="currentColor"
                 stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
            <!-- Close icon (X) – hidden by default -->
            <svg id="icon-close" class="w-6 h-6 hidden" fill="none" stroke="currentColor"
                 stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round"
                    d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>

        </div><!-- /flex row -->
      </div><!-- /container -->

      <!-- Mobile drawer -->
      <div id="mobile-drawer"
           role="dialog"
           aria-label="Mobile navigation"
           aria-modal="true"
           class="lg:hidden hidden border-t border-sky-100 bg-white shadow-soft">
        <nav class="max-w-7xl mx-auto px-4 py-4" aria-label="Mobile primary navigation">
          <ul class="space-y-1" role="list">
            ${buildNavItems(true)}
          </ul>
          <!-- Mobile CTA -->
          <div class="mt-4 pt-4 border-t border-sky-100">
            <a href="admissions.html"
               class="flex items-center justify-center gap-2 bg-leaf-500 hover:bg-leaf-600
                      text-white font-semibold px-5 py-3 rounded-full
                      transition-colors duration-200 text-sm">
              Apply Now
            </a>
          </div>
        </nav>
      </div><!-- /mobile-drawer -->

    </header><!-- /navbar -->

    <!-- Spacer so content doesn't hide under fixed navbar -->
    <div class="h-16 md:h-20" aria-hidden="true"></div>
  `;
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* 2. Footer                                                 */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function renderFooter() {
  const target = document.getElementById('site-footer');
  if (!target) return;

  const year = new Date().getFullYear();

  const socialLinks = SOCIALS.map(({ label, href, icon }) => `
    <a href="${href}"
       aria-label="${SITE.name} on ${label}"
       class="text-sky-100 hover:text-white transition-colors duration-200">
      ${icon}
    </a>`).join('');

  const quickLinks = FOOTER_QUICK_LINKS.map(({ label, href }) => `
    <li>
      <a href="${href}"
         class="text-sky-100 hover:text-white text-sm transition-colors duration-200 flex items-center gap-2">
        <span aria-hidden="true" class="text-leaf-500">›</span>${label}
      </a>
    </li>`).join('');

  target.innerHTML = `
    <footer class="bg-ink text-white" role="contentinfo">

      <!-- Main footer grid -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          <!-- Column 1: About blurb -->
          <div>
            <!-- Logo in footer -->
            <a href="index.html" class="flex items-center gap-3 mb-4" aria-label="${SITE.name} – home">
              <img src="${SITE.logoSrc}"
                   alt="${SITE.logoAlt}"
                   class="h-10 w-auto brightness-0 invert"
                   onerror="this.style.display='none'">
              <span class="font-heading text-lg text-white leading-tight">${SITE.name}</span>
            </a>
            <p class="text-sky-100 text-sm leading-relaxed">
              ${SITE.name} is dedicated to nurturing confident, compassionate, and
              academically excellent learners. We partner with families to build
              the next generation of leaders.
            </p>
            <p class="mt-2 text-xs text-sky-100/70 italic">"${SITE.tagline}"</p>
          </div>

          <!-- Column 2: Quick links -->
          <div>
            <h3 class="font-heading text-white text-base mb-4 uppercase tracking-wider">
              Quick Links
            </h3>
            <ul class="space-y-2" role="list">
              ${quickLinks}
            </ul>
          </div>

          <!-- Column 3: Contact details -->
          <div>
            <h3 class="font-heading text-white text-base mb-4 uppercase tracking-wider">
              Contact Us
            </h3>
            <ul class="space-y-3 text-sm text-sky-100" role="list">
              <li class="flex items-start gap-3">
                <!-- Location icon -->
                <svg class="w-4 h-4 mt-0.5 shrink-0 text-leaf-500" fill="none"
                     stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0zm6 0c0 7-9 13-9 13S3 18 3 11a9 9 0 0118 0z"/>
                </svg>
                <span>${SITE.address}</span>
              </li>
              <li class="flex items-center gap-3">
                <!-- Phone icon -->
                <svg class="w-4 h-4 shrink-0 text-leaf-500" fill="none"
                     stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round"
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498A1 1 0 0121 15.72V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
                <a href="tel:${SITE.phone}" class="hover:text-white transition-colors">
                  ${SITE.phone}
                </a>
              </li>
              <li class="flex items-center gap-3">
                <!-- Email icon -->
                <svg class="w-4 h-4 shrink-0 text-leaf-500" fill="none"
                     stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                <a href="mailto:${SITE.email}" class="hover:text-white transition-colors">
                  ${SITE.email}
                </a>
              </li>
            </ul>
          </div>

          <!-- Column 4: Hours + social icons -->
          <div>
            <h3 class="font-heading text-white text-base mb-4 uppercase tracking-wider">
              School Hours
            </h3>
            <ul class="space-y-1 text-sm text-sky-100 mb-6" role="list">
              <li>${SITE.hours}</li>
              <li class="text-sky-100/70 text-xs">Closed on public holidays</li>
            </ul>

            <h3 class="font-heading text-white text-base mb-3 uppercase tracking-wider">
              Follow Us
            </h3>
            <div class="flex items-center gap-4">
              ${socialLinks}
            </div>
          </div>

        </div><!-- /grid -->
      </div><!-- /container -->

      <!-- Bottom bar -->
      <div class="border-t border-white/10">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4
                    flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-sky-100/60">
          <p>&copy; ${year} ${SITE.name}. All rights reserved.</p>
          <p>Designed with <span aria-label="love">&#9829;</span> in Kenya</p>
        </div>
      </div>

    </footer>
  `;
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* 3. Floating WhatsApp button                               */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function renderWhatsApp() {
  // Sanitise phone: strip everything except digits and leading +
  const phone = SITE.whatsapp.replace(/[^\d+]/g, '');
  const message = encodeURIComponent(`Hello ${SITE.name}, I'd like to know more about admissions.`);
  const href = `https://wa.me/${phone}?text=${message}`;

  const btn = document.createElement('a');
  btn.href = href;
  btn.target = '_blank';
  btn.rel = 'noopener noreferrer';
  btn.setAttribute('aria-label', 'Chat with us on WhatsApp');
  btn.className = [
    'fixed bottom-6 right-6 z-50',
    'flex items-center justify-center',
    'w-14 h-14 rounded-full shadow-soft-lg',
    'bg-[#25D366] hover:bg-[#1da851]',
    'text-white transition-transform duration-200',
    'hover:scale-110 focus:scale-110',
  ].join(' ');

  btn.innerHTML = `
    <!-- WhatsApp SVG logo -->
    <svg class="w-7 h-7" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
      <path d="M12.004 2C6.477 2 2 6.477 2 12.004c0 1.77.463 3.43 1.268 4.875L2 22l5.236-1.244A9.952 9.952 0 0012.004 22C17.531 22 22 17.523 22 12.004 22 6.477 17.531 2 12.004 2zm0 18.18a8.149 8.149 0 01-4.15-1.137l-.298-.176-3.085.734.765-3.007-.195-.31A8.187 8.187 0 013.82 12.004c0-4.514 3.67-8.183 8.184-8.183 4.513 0 8.182 3.669 8.182 8.183 0 4.514-3.669 8.176-8.182 8.176z"/>
    </svg>
  `;

  document.body.appendChild(btn);
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* Bootstrap – run when the DOM is ready                     */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

document.addEventListener('DOMContentLoaded', () => {
  renderHeader();
  renderFooter();
  renderWhatsApp();
});
