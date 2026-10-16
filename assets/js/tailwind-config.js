/**
 * tailwind-config.js
 * Inline Tailwind CSS v3 configuration loaded via the CDN build.
 * Must be loaded BEFORE the Tailwind CDN script so the config is
 * picked up by the play CDN at runtime.
 *
 * Usage in HTML:
 *   <script src="assets/js/tailwind-config.js"></script>
 *   <script src="https://cdn.tailwindcss.com"></script>
 */

window.tailwind = window.tailwind || {};

window.tailwind.config = {
  /* ── Theme ──────────────────────────────────────────────── */
  theme: {
    extend: {

      /* ── Brand colours ──────────────────────────────────── */
      colors: {
        sky: {
          50:  '#F0F9FF',
          100: '#E0F2FE',
          500: '#0EA5E9',
          600: '#0284C7',
        },
        leaf: {
          50:  '#F0FDF4',
          100: '#DCFCE7',
          500: '#22C55E',
          600: '#16A34A',
        },
        ink: '#0F2A43',   // deep navy – primary text / dark backgrounds
      },

      /* ── Typography ─────────────────────────────────────── */
      fontFamily: {
        heading: ['"Century Gothic"', 'Questrial', 'sans-serif'],
        body:    ['Montserrat',                    'sans-serif'],
      },

      /* ── Soft shadow utilities ──────────────────────────── */
      boxShadow: {
        'soft-sm': '0 1px 4px 0 rgba(15,42,67,0.08)',
        'soft':    '0 4px 16px 0 rgba(15,42,67,0.10)',
        'soft-lg': '0 8px 32px 0 rgba(15,42,67,0.12)',
        'soft-xl': '0 16px 48px 0 rgba(15,42,67,0.14)',
      },

      /* ── Rounded sizes ──────────────────────────────────── */
      borderRadius: {
        'xs':  '0.25rem',   // 4 px  – tight chips
        'sm':  '0.375rem',  // 6 px  – inputs
        DEFAULT: '0.5rem',  // 8 px  – cards
        'md':  '0.75rem',   // 12 px – modals
        'lg':  '1rem',      // 16 px – sections
        'xl':  '1.5rem',    // 24 px – hero cards
        '2xl': '2rem',      // 32 px – hero blobs
        'full':'9999px',    // pills / avatars
      },
    },
  },

  /* ── Plugins (none for CDN; extend here if needed) ──────── */
  plugins: [],
};
