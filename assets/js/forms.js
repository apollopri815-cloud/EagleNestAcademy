/**
 * forms.js
 * Admission inquiry form — validation, submission, and feedback.
 *
 * Two submission paths (configured at the top of FORM_CONFIG):
 *   1. POST to a backend/form-service endpoint  (FORM_CONFIG.endpoint)
 *   2. Open a pre-filled WhatsApp message        (FORM_CONFIG.whatsapp)
 *
 * Both run on submit. The endpoint POST is attempted first; WhatsApp
 * is opened after a short delay so the browser doesn't block it as a
 * popup. Either path can be disabled by setting its value to null/false.
 *
 * Usage:
 *   Load after components.js and main.js at the bottom of admissions.html.
 *   The form must have id="admission-form".
 */

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* Configuration — edit without touching the logic below      */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const FORM_CONFIG = {
  /**
   * Backend / form-service endpoint.
   * Replace [FORM_ENDPOINT] with the real URL before going live.
   * Popular options: Formspree (https://formspree.io/f/YOUR_ID),
   *                  Netlify Forms, EmailJS, or your own server.
   * Set to null to disable the HTTP POST path.
   */
  endpoint: '[FORM_ENDPOINT]',   // e.g. 'https://formspree.io/f/xabc1234'

  /**
   * WhatsApp phone number (international format, no + or spaces).
   * Set to null to disable the WhatsApp path.
   */
  whatsapp: '254XXXXXXXXX',      // replace with real number

  /**
   * Delay (ms) before opening WhatsApp after a successful endpoint POST,
   * so the browser doesn't block it as an unsolicited popup.
   */
  whatsappDelay: 600,

  /**
   * Whether to show WhatsApp even when the endpoint POST fails.
   * Useful as a fallback so the user can always reach you.
   */
  whatsappOnError: true,
};

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* Validation rules                                           */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

/**
 * Each entry maps a field name to { validate(value):string|null }.
 * validate() returns an error message string, or null if valid.
 */
const VALIDATORS = {
  parent_name: {
    label: 'Parent / Guardian Name',
    validate(v) {
      if (!v.trim()) return 'Please enter your full name.';
      if (v.trim().length < 3) return 'Name must be at least 3 characters.';
      return null;
    },
  },
  phone: {
    label: 'Phone Number',
    validate(v) {
      const stripped = v.replace(/[\s\-().+]/g, '');
      if (!stripped) return 'Please enter your phone number.';
      if (!/^\d{7,15}$/.test(stripped)) return 'Enter a valid phone number (7–15 digits).';
      return null;
    },
  },
  email: {
    label: 'Email Address',
    validate(v) {
      if (!v.trim()) return 'Please enter your email address.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())) {
        return 'Enter a valid email address.';
      }
      return null;
    },
  },
  child_name: {
    label: "Child's Full Name",
    validate(v) {
      if (!v.trim()) return "Please enter your child's full name.";
      if (v.trim().length < 2) return 'Name must be at least 2 characters.';
      return null;
    },
  },
  child_age: {
    label: "Child's Age",
    validate(v) {
      const age = parseInt(v, 10);
      if (!v.trim()) return "Please enter your child's age.";
      if (isNaN(age) || age < 2 || age > 18) return 'Age must be between 2 and 18.';
      return null;
    },
  },
  class_applying: {
    label: 'Class Applying For',
    validate(v) {
      if (!v || v === '') return 'Please select the class applying for.';
      return null;
    },
  },
  // message is optional — no required validation
};

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* DOM helpers                                                */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function getField(name) {
  return document.querySelector(`[name="${name}"]`);
}

function getErrorEl(name) {
  return document.getElementById(`error-${name}`);
}

/**
 * Show a validation error under a field.
 * Adds aria-invalid and aria-describedby for screen readers.
 */
function showError(name, message) {
  const field = getField(name);
  const errEl = getErrorEl(name);
  if (!field || !errEl) return;

  errEl.textContent = message;
  errEl.classList.remove('hidden');
  field.setAttribute('aria-invalid', 'true');
  field.setAttribute('aria-describedby', `error-${name}`);
  field.classList.add('border-red-400', 'bg-red-50');
  field.classList.remove('border-sky-200');
}

/**
 * Clear the validation error for a field.
 */
function clearError(name) {
  const field = getField(name);
  const errEl = getErrorEl(name);
  if (!field || !errEl) return;

  errEl.textContent = '';
  errEl.classList.add('hidden');
  field.removeAttribute('aria-invalid');
  field.removeAttribute('aria-describedby');
  field.classList.remove('border-red-400', 'bg-red-50');
  field.classList.add('border-sky-200');
}

/**
 * Validate a single field and return true if it passes.
 */
function validateField(name) {
  const field = getField(name);
  if (!field) return true;
  const rule = VALIDATORS[name];
  if (!rule) return true;

  const error = rule.validate(field.value);
  if (error) {
    showError(name, error);
    return false;
  }
  clearError(name);
  return true;
}

/**
 * Validate all fields; returns true if every field passes.
 * Focuses the first invalid field.
 */
function validateAll() {
  let valid = true;
  let firstInvalid = null;

  Object.keys(VALIDATORS).forEach((name) => {
    if (!validateField(name) && !firstInvalid) {
      firstInvalid = getField(name);
    }
    if (!validateField(name)) valid = false;
  });

  if (firstInvalid) firstInvalid.focus();
  return valid;
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* UI state helpers                                           */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function setSubmitting(btn, loading) {
  const textEl  = btn.querySelector('[data-btn-text]');
  const spinEl  = btn.querySelector('[data-btn-spinner]');
  btn.disabled  = loading;
  btn.setAttribute('aria-busy', String(loading));
  if (textEl)  textEl.textContent = loading ? 'Sending…' : 'Send Enquiry';
  if (spinEl)  spinEl.classList.toggle('hidden', !loading);
}

function showFormState(state) {
  // state: 'idle' | 'success' | 'error'
  const formEl    = document.getElementById('admission-form');
  const successEl = document.getElementById('form-success');
  const errorEl   = document.getElementById('form-error');

  if (!formEl) return;

  if (state === 'success') {
    formEl.classList.add('hidden');
    successEl?.classList.remove('hidden');
    errorEl?.classList.add('hidden');
    // Scroll to success message
    successEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } else if (state === 'error') {
    errorEl?.classList.remove('hidden');
    // Keep the form visible so the user can retry
  } else {
    formEl.classList.remove('hidden');
    successEl?.classList.add('hidden');
    errorEl?.classList.add('hidden');
  }
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* WhatsApp message builder                                   */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function buildWhatsAppURL(data) {
  const lines = [
    `*Admission Enquiry – EagleNest Academy*`,
    ``,
    `*Parent/Guardian:* ${data.parent_name}`,
    `*Phone:* ${data.phone}`,
    `*Email:* ${data.email}`,
    `*Child's Name:* ${data.child_name}`,
    `*Child's Age:* ${data.child_age}`,
    `*Class Applying For:* ${data.class_applying}`,
  ];

  if (data.message && data.message.trim()) {
    lines.push(``, `*Message:*`, data.message.trim());
  }

  const text = encodeURIComponent(lines.join('\n'));
  return `https://wa.me/${FORM_CONFIG.whatsapp}?text=${text}`;
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* Endpoint POST                                              */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

async function postToEndpoint(data) {
  const endpoint = FORM_CONFIG.endpoint;

  // Skip if endpoint is still the placeholder or not set
  if (!endpoint || endpoint === '[FORM_ENDPOINT]') {
    return { ok: false, skipped: true };
  }

  const response = await fetch(endpoint, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body:    JSON.stringify(data),
  });

  return { ok: response.ok, status: response.status, skipped: false };
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* Collect form data                                          */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function collectFormData() {
  return {
    parent_name:    getField('parent_name')?.value.trim()  || '',
    phone:          getField('phone')?.value.trim()        || '',
    email:          getField('email')?.value.trim()        || '',
    child_name:     getField('child_name')?.value.trim()   || '',
    child_age:      getField('child_age')?.value.trim()    || '',
    class_applying: getField('class_applying')?.value      || '',
    message:        getField('message')?.value.trim()      || '',
    // Metadata
    _subject:       'EagleNest Admission Enquiry',
    _timestamp:     new Date().toISOString(),
    _source:        window.location.href,
  };
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* Main submit handler                                        */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

async function handleSubmit(e) {
  e.preventDefault();

  // 1. Validate
  if (!validateAll()) return;

  const form = e.currentTarget;
  const btn  = form.querySelector('[type="submit"]');

  // 2. Set loading state
  setSubmitting(btn, true);
  showFormState('idle'); // hide any previous error banner

  // 3. Collect data
  const data = collectFormData();

  // 4. POST to endpoint
  let endpointResult = { ok: false, skipped: true };
  try {
    endpointResult = await postToEndpoint(data);
  } catch (err) {
    console.warn('Endpoint POST failed:', err);
    endpointResult = { ok: false, skipped: false };
  }

  setSubmitting(btn, false);

  const endpointSucceeded = endpointResult.skipped || endpointResult.ok;

  // 5. Show result UI
  if (endpointSucceeded) {
    showFormState('success');
  } else {
    // Show error banner but keep form editable for retry
    showFormState('error');
  }

  // 6. Open WhatsApp (with delay to avoid popup blocker)
  const shouldOpenWA =
    FORM_CONFIG.whatsapp &&
    FORM_CONFIG.whatsapp !== '254XXXXXXXXX' && // skip if placeholder
    (endpointSucceeded || FORM_CONFIG.whatsappOnError);

  if (shouldOpenWA) {
    const waURL = buildWhatsAppURL(data);
    setTimeout(() => {
      window.open(waURL, '_blank', 'noopener,noreferrer');
    }, FORM_CONFIG.whatsappDelay);
  }
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* Live per-field validation (on blur)                        */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function attachLiveValidation(form) {
  Object.keys(VALIDATORS).forEach((name) => {
    const field = getField(name);
    if (!field) return;

    // Validate on blur (when user leaves the field)
    field.addEventListener('blur', () => validateField(name));

    // Clear error on input so feedback disappears as soon as the user
    // starts correcting a mistake
    field.addEventListener('input', () => {
      if (field.getAttribute('aria-invalid') === 'true') {
        validateField(name);
      }
    });
  });
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* Bootstrap                                                  */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('admission-form');
  if (!form) return;

  form.addEventListener('submit', handleSubmit);
  attachLiveValidation(form);

  // "Try again" button in error banner resets the error state
  document.getElementById('form-retry-btn')?.addEventListener('click', () => {
    showFormState('idle');
  });
});
