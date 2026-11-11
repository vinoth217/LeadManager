/**
 * Impiger LeadManager - Embeddable Chat Design Lead Form Widget
 * 
 * Embed anywhere with:
 * <script src="https://your-domain.com/lead-widget.js" data-portal-url="https://your-domain.com"></script>
 */
(function () {
  'use strict';

  // Prevent multiple instantiations
  if (window.__IMPIGER_LEAD_WIDGET_LOADED__) return;
  window.__IMPIGER_LEAD_WIDGET_LOADED__ = true;

  // Find the executing script tag to extract data-* configuration attributes
  const currentScript =
    document.currentScript ||
    (function () {
      const scripts = document.getElementsByTagName('script');
      return scripts[scripts.length - 1];
    })();

  const scriptSrc = (currentScript && currentScript.src) || '';
  let defaultPortalUrl = '';
  try {
    if (scriptSrc) {
      const parsedUrl = new URL(scriptSrc, window.location.href);
      defaultPortalUrl = parsedUrl.origin;
    } else {
      defaultPortalUrl = window.location.origin;
    }
  } catch (e) {
    defaultPortalUrl = window.location.origin;
  }

  // Configuration options (supports window.LEAD_WIDGET_CONFIG or data-* attributes)
  const userConfig = window.LEAD_WIDGET_CONFIG || {};
  const config = {
    portalUrl:
      currentScript?.getAttribute('data-portal-url') ||
      userConfig.portalUrl ||
      defaultPortalUrl,
    primaryColor:
      currentScript?.getAttribute('data-primary-color') ||
      userConfig.primaryColor ||
      '#6C47FF',
    accentColor:
      currentScript?.getAttribute('data-accent-color') ||
      userConfig.accentColor ||
      '#5935ED',
    position:
      currentScript?.getAttribute('data-position') ||
      userConfig.position ||
      'right', // 'right' or 'left'
    greeting:
      currentScript?.getAttribute('data-greeting') ||
      userConfig.greeting ||
      'Thank you! 😊 Fill out your contact details and we will be in touch with you shortly! *',
    privacyUrl:
      currentScript?.getAttribute('data-privacy-url') ||
      userConfig.privacyUrl ||
      '#',
    companyName:
      currentScript?.getAttribute('data-company-name') ||
      userConfig.companyName ||
      'Impiger Technologies',
    autoOpen:
      currentScript?.getAttribute('data-auto-open') === 'true' ||
      userConfig.autoOpen === true,
  };

  // Create isolated container host element
  const host = document.createElement('div');
  host.id = 'impiger-lead-widget-container';
  host.style.position = 'fixed';
  host.style.zIndex = '2147483647'; // Max safe z-index
  host.style.bottom = '0';
  if (config.position === 'left') {
    host.style.left = '0';
  } else {
    host.style.right = '0';
  }
  host.style.pointerEvents = 'none';

  // Attach Shadow DOM for complete CSS isolation from host webpage
  let root = host;
  if (host.attachShadow) {
    root = host.attachShadow({ mode: 'open' });
  }

  const WIDGET_LOGO_DATA_URI = 'data:image/png;base64,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';

  // SVG Icons
  const launcherChatIcon = `
    <svg viewBox="0 0 100 100" width="34" height="34" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M50 12C29.013 12 12 29.013 12 50C12 58.125 14.549 65.656 18.91 71.823L14.28 85.719C13.882 86.914 14.978 88.01 16.173 87.612L30.07 82.982C36.009 86.963 43.197 89.286 50.887 88C69.349 84.912 83.218 69.176 84.819 50.584C86.711 28.618 69.839 12 50 12ZM41 33C34.373 33 29 38.373 29 45C29 51.627 34.373 57 41 57C47.627 57 53 51.627 53 45C53 38.373 47.627 33 41 33Z" fill="white"/>
    </svg>
  `;

  const closeIcon = `
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  `;

  const backIcon = `
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="19" y1="12" x2="5" y2="12"></line>
      <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
  `;

  const checkCircleIcon = `
    <svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  `;

  // Inject Isolated Styles
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
    }

    .ilw-wrapper {
      position: fixed;
      bottom: 24px;
      ${config.position === 'left' ? 'left: 24px;' : 'right: 24px;'}
      display: flex;
      flex-direction: column;
      align-items: ${config.position === 'left' ? 'flex-start' : 'flex-end'};
      gap: 14px;
      pointer-events: auto;
      font-size: 14px;
      color: #1e293b;
    }

    /* Floating Circular Launcher Button */
    .ilw-launcher {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: ${config.primaryColor};
      background: linear-gradient(135deg, ${config.primaryColor} 0%, ${config.accentColor} 100%);
      color: white;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 24px rgba(108, 71, 255, 0.38), 0 2px 6px rgba(0, 0, 0, 0.08);
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      position: relative;
      user-select: none;
      outline: none;
    }

    .ilw-launcher:hover {
      transform: scale(1.06) translateY(-2px);
      box-shadow: 0 12px 28px rgba(108, 71, 255, 0.48), 0 4px 10px rgba(0, 0, 0, 0.12);
    }

    .ilw-launcher:active {
      transform: scale(0.96);
    }

    .ilw-launcher-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.25s ease;
    }

        .ilw-launcher-inner {
      width: 54px;
      height: 54px;
      border-radius: 50%;
      background: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
      overflow: hidden;
      padding: 6px;
    }

    .ilw-launcher-img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: block;
      pointer-events: none;
    }

    .ilw-header-brand {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .ilw-header-logo {
      height: 22px;
      width: auto;
      object-fit: contain;
    }

    .ilw-header-title {
      font-size: 13px;
      font-weight: 700;
      color: #0f172a;
      letter-spacing: -0.01em;
    }

    .ilw-badge-dot {
      position: absolute;
      top: 2px;
      right: 2px;
      width: 13px;
      height: 13px;
      background: #10b981;
      border: 2.5px solid #ffffff;
      border-radius: 50%;
    }

    /* Main Chat Lead Form Card */
    .ilw-card {
      width: 410px;
      max-width: calc(100vw - 32px);
      background: #ffffff;
      border-radius: 20px;
      box-shadow: 0 18px 45px -8px rgba(15, 23, 42, 0.2), 0 4px 14px -2px rgba(15, 23, 42, 0.08);
      border: 1px solid #f0f2f5;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      opacity: 0;
      transform: translateY(20px) scale(0.96);
      pointer-events: none;
      transition: opacity 0.24s cubic-bezier(0.16, 1, 0.3, 1), transform 0.24s cubic-bezier(0.16, 1, 0.3, 1);
      transform-origin: bottom ${config.position === 'left' ? 'left' : 'right'};
      max-height: calc(100vh - 100px);
    }

    .ilw-card.ilw-open {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: auto;
    }

    /* Header */
    .ilw-header {
      padding: 10px 16px 8px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #f8fafc;
      background: #ffffff;
    }

    .ilw-icon-btn {
      background: transparent;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      padding: 6px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;
    }

    .ilw-icon-btn:hover {
      color: #334155;
      background: #f1f5f9;
    }

    /* Chat bubble prompt box */
    .ilw-prompt-box {
      margin: 4px 16px 10px 16px;
      padding: 11px 13px;
      background: #fafafc;
      border: 1px solid #edf0f5;
      border-radius: 12px;
      font-size: 13px;
      line-height: 1.45;
      color: #1e293b;
      font-weight: 500;
      position: relative;
    }

    /* Body / Form */
    .ilw-body {
      padding: 0 16px 16px 16px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-height: calc(100vh - 240px);
    }

    .ilw-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    @media (max-width: 380px) {
      .ilw-row {
        grid-template-columns: 1fr;
      }
    }

    .ilw-field {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .ilw-label {
      font-size: 12px;
      font-weight: 600;
      color: #0f172a;
      display: flex;
      align-items: center;
    }

    .ilw-req {
      color: #ef4444;
      margin-left: 3px;
      font-weight: bold;
    }

    .ilw-input, .ilw-textarea {
      width: 100%;
      padding: 8.5px 12px;
      font-size: 13px;
      color: #1e293b;
      background: #f8fafc;
      border: 1.5px solid #e2e8f0;
      border-radius: 9px;
      outline: none;
      transition: all 0.15s ease;
    }

    .ilw-input::placeholder, .ilw-textarea::placeholder {
      color: #94a3b8;
      font-weight: 400;
    }

    .ilw-input:focus, .ilw-textarea:focus {
      background: #ffffff;
      border-color: ${config.primaryColor};
      box-shadow: 0 0 0 3px rgba(108, 71, 255, 0.12);
    }

    .ilw-input.ilw-error, .ilw-textarea.ilw-error {
      border-color: #ef4444;
      background: #fef2f2;
    }

    /* Phone container with country dropdown */
    .ilw-phone-box {
      display: flex;
      align-items: center;
      background: #f8fafc;
      border: 1.5px solid #e2e8f0;
      border-radius: 9px;
      overflow: hidden;
      transition: all 0.15s ease;
    }

    .ilw-phone-box:focus-within {
      background: #ffffff;
      border-color: ${config.primaryColor};
      box-shadow: 0 0 0 3px rgba(108, 71, 255, 0.12);
    }

    .ilw-country-select {
      background: #f1f5f9;
      border: none;
      border-right: 1.5px solid #e2e8f0;
      padding: 8.5px 8px;
      font-size: 12.5px;
      font-weight: 500;
      color: #1e293b;
      outline: none;
      cursor: pointer;
    }

    .ilw-phone-input {
      flex: 1;
      border: none;
      background: transparent;
      padding: 8.5px 12px;
      font-size: 13px;
      color: #1e293b;
      outline: none;
    }

    .ilw-phone-input::placeholder {
      color: #94a3b8;
    }

    .ilw-textarea {
      min-height: 60px;
      resize: vertical;
    }

    /* Privacy policy note */
    .ilw-privacy-note {
      font-size: 10.5px;
      color: #64748b;
      line-height: 1.35;
      margin-top: 1px;
      padding: 0 2px;
    }

    .ilw-privacy-note a {
      color: #475569;
      text-decoration: underline;
      cursor: pointer;
    }

    /* Submit Button */
    .ilw-submit-btn {
      width: 100%;
      margin-top: 4px;
      padding: 11px 18px;
      background: ${config.primaryColor};
      color: #ffffff;
      border: none;
      border-radius: 9999px;
      font-size: 13.5px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      box-shadow: 0 4px 14px rgba(108, 71, 255, 0.28);
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .ilw-submit-btn:hover:not(:disabled) {
      background: ${config.accentColor};
      transform: translateY(-1px);
      box-shadow: 0 6px 18px rgba(108, 71, 255, 0.38);
    }

    .ilw-submit-btn:active:not(:disabled) {
      transform: translateY(0);
    }

    .ilw-submit-btn:disabled {
      opacity: 0.65;
      cursor: not-allowed;
    }

    /* Spinner */
    .ilw-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #ffffff;
      border-radius: 50%;
      animation: ilw-spin 0.65s linear infinite;
    }

    @keyframes ilw-spin {
      to { transform: rotate(360deg); }
    }

    /* Success confirmation view */
    .ilw-success-view {
      padding: 28px 16px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }

    .ilw-success-title {
      font-size: 17px;
      font-weight: 700;
      color: #0f172a;
    }

    .ilw-success-desc {
      font-size: 13px;
      color: #475569;
      line-height: 1.5;
    }

    .ilw-success-routing {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 10px 14px;
      text-align: left;
      font-size: 12px;
      width: 100%;
      margin-top: 4px;
    }

    .ilw-success-routing strong {
      color: #0f172a;
      display: block;
      margin-bottom: 2px;
    }

    .ilw-reset-btn {
      margin-top: 6px;
      padding: 8px 16px;
      background: #f1f5f9;
      color: #334155;
      font-size: 12.5px;
      font-weight: 600;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.15s ease;
    }

    .ilw-reset-btn:hover {
      background: #e2e8f0;
    }

    /* Error banner */
    .ilw-error-banner {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #b91c1c;
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 12px;
      display: none;
    }

    .ilw-error-banner.ilw-show {
      display: block;
    }
  `;
  root.appendChild(styleEl);

  // Build DOM Structure
  const wrapper = document.createElement('div');
  wrapper.className = 'ilw-wrapper';

  wrapper.innerHTML = `
    <!-- Floating Card Form -->
    <div class="ilw-card" id="ilw-card" role="dialog" aria-modal="true" aria-label="Contact us">
      <!-- Header with back arrow and close button -->
      <div class="ilw-header">
        <button class="ilw-icon-btn" id="ilw-btn-back" title="Reset form" aria-label="Reset form">
          ${backIcon}
        </button>
        <div class="ilw-header-brand">
          <img src="${WIDGET_LOGO_DATA_URI}" alt="Logo" class="ilw-header-logo" />
          <span class="ilw-header-title">${config.companyName}</span>
        </div>
        <button class="ilw-icon-btn" id="ilw-btn-close" title="Close" aria-label="Close dialog">
          ${closeIcon}
        </button>
      </div>

      <!-- Main Form Container -->
      <div id="ilw-form-container">
        <!-- Chat Bubble Prompt -->
        <div class="ilw-prompt-box">
          ${config.greeting}
        </div>

        <!-- Form Fields matching user's exact specification -->
        <form id="ilw-lead-form" class="ilw-body">
          <div class="ilw-error-banner" id="ilw-error-banner"></div>

          <!-- Row 1: First name & Last name -->
          <div class="ilw-row">
            <div class="ilw-field">
              <label class="ilw-label" for="ilw-field-firstname">
                First name <span class="ilw-req">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                id="ilw-field-firstname"
                class="ilw-input"
                placeholder="Enter first name here"
                required
                autocomplete="given-name"
              />
            </div>
            <div class="ilw-field">
              <label class="ilw-label" for="ilw-field-lastname">
                Last name <span class="ilw-req">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                id="ilw-field-lastname"
                class="ilw-input"
                placeholder="Enter last name here"
                required
                autocomplete="family-name"
              />
            </div>
          </div>

          <!-- Row 2: Company name -->
          <div class="ilw-field">
            <label class="ilw-label" for="ilw-field-company">
              Company name <span class="ilw-req">*</span>
            </label>
            <input
              type="text"
              name="company"
              id="ilw-field-company"
              class="ilw-input"
              placeholder="Enter company name here"
              required
              autocomplete="organization"
            />
          </div>

          <!-- Row 3: Email ID -->
          <div class="ilw-field">
            <label class="ilw-label" for="ilw-field-email">
              Email ID <span class="ilw-req">*</span>
            </label>
            <input
              type="email"
              name="email"
              id="ilw-field-email"
              class="ilw-input"
              placeholder="Enter email ID here"
              required
              autocomplete="email"
            />
          </div>

          <!-- Row 4: Mobile number with country dial code -->
          <div class="ilw-field">
            <label class="ilw-label" for="ilw-field-phone">
              Mobile number <span class="ilw-req">*</span>
            </label>
            <div class="ilw-phone-box">
              <select id="ilw-field-country" class="ilw-country-select" title="Country code">
                <option value="+91" selected>🇮🇳 +91</option>
                <option value="+1">🇺🇸 +1</option>
                <option value="+44">🇬🇧 +44</option>
                <option value="+971">🇦🇪 +971</option>
                <option value="+65">🇸🇬 +65</option>
                <option value="+61">🇦🇺 +61</option>
                <option value="+49">🇩🇪 +49</option>
                <option value="+33">🇫🇷 +33</option>
                <option value="+81">🇯🇵 +81</option>
                <option value="+966">🇸🇦 +966</option>
              </select>
              <input
                type="tel"
                name="phone"
                id="ilw-field-phone"
                class="ilw-phone-input"
                placeholder="Enter mobile number here"
                required
                autocomplete="tel"
              />
            </div>
          </div>

          <!-- Row 5: Message -->
          <div class="ilw-field">
            <label class="ilw-label" for="ilw-field-message">
              Message
            </label>
            <textarea
              name="message"
              id="ilw-field-message"
              class="ilw-textarea"
              placeholder="Enter message here"
              rows="3"
            ></textarea>
          </div>

          <div class="ilw-privacy-note">
            * Your data will be managed according to our <a href="${config.privacyUrl}" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
          </div>

          <button type="submit" id="ilw-submit-btn" class="ilw-submit-btn">
            <span id="ilw-btn-label">Send contact request</span>
            <div id="ilw-btn-spinner" class="ilw-spinner" style="display: none;"></div>
          </button>
        </form>
      </div>

      <!-- Success Screen -->
      <div id="ilw-success-container" class="ilw-success-view" style="display: none;">
        ${checkCircleIcon}
        <h3 class="ilw-success-title" id="ilw-success-name">Thank you!</h3>
        <p class="ilw-success-desc">
          We have received your details. Our Solutions Architect team will be in touch with you shortly!
        </p>
        <div id="ilw-routing-info" class="ilw-success-routing" style="display: none;">
          <strong>AI Triage Assignment:</strong>
          <span id="ilw-assigned-specialist" style="color: #ea580c; font-weight: 600;"></span>
        </div>
        <button type="button" id="ilw-btn-reset" class="ilw-reset-btn">
          Send another inquiry
        </button>
      </div>
    </div>

    <!-- Floating Circular Launcher Button -->
    <button class="ilw-launcher" id="ilw-launcher" aria-label="Open contact form" title="Chat with us">
      <div class="ilw-launcher-inner">
        <img src="${WIDGET_LOGO_DATA_URI}" alt="Logo" class="ilw-launcher-img" />
      </div>
      <div class="ilw-badge-dot"></div>
    </button>
  `;

  root.appendChild(wrapper);
  document.body.appendChild(host);

  // References to DOM elements inside the shadow root
  const card = root.getElementById('ilw-card');
  const launcher = root.getElementById('ilw-launcher');
  const btnClose = root.getElementById('ilw-btn-close');
  const btnBack = root.getElementById('ilw-btn-back');
  const formContainer = root.getElementById('ilw-form-container');
  const successContainer = root.getElementById('ilw-success-container');
  const form = root.getElementById('ilw-lead-form');
  const submitBtn = root.getElementById('ilw-submit-btn');
  const btnLabel = root.getElementById('ilw-btn-label');
  const btnSpinner = root.getElementById('ilw-btn-spinner');
  const errorBanner = root.getElementById('ilw-error-banner');
  const btnReset = root.getElementById('ilw-btn-reset');
  const successName = root.getElementById('ilw-success-name');
  const routingInfo = root.getElementById('ilw-routing-info');
  const assignedSpecialist = root.getElementById('ilw-assigned-specialist');

  let isOpen = false;

  function openWidget() {
    isOpen = true;
    card.classList.add('ilw-open');
    launcher.style.transform = 'scale(0.92)';
    setTimeout(() => {
      launcher.style.transform = '';
      const firstInput = root.getElementById('ilw-field-firstname');
      if (firstInput) firstInput.focus();
    }, 200);
  }

  function closeWidget() {
    isOpen = false;
    card.classList.remove('ilw-open');
  }

  function toggleWidget() {
    if (isOpen) {
      closeWidget();
    } else {
      openWidget();
    }
  }

  function resetForm() {
    form.reset();
    errorBanner.classList.remove('ilw-show');
    errorBanner.textContent = '';
    formContainer.style.display = 'block';
    successContainer.style.display = 'none';
    submitBtn.disabled = false;
    btnLabel.textContent = 'Send contact request';
    btnSpinner.style.display = 'none';
  }

  launcher.addEventListener('click', toggleWidget);
  btnClose.addEventListener('click', closeWidget);
  btnBack.addEventListener('click', resetForm);
  btnReset.addEventListener('click', resetForm);

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) {
      closeWidget();
    }
  });

  // Close when clicking outside widget
  document.addEventListener('mousedown', (e) => {
    if (!isOpen) return;
    const path = e.composedPath ? e.composedPath() : [];
    if (!path.includes(host) && !path.includes(wrapper)) {
      closeWidget();
    }
  });

  // Handle Form Submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBanner.classList.remove('ilw-show');

    const firstName = (root.getElementById('ilw-field-firstname').value || '').trim();
    const lastName = (root.getElementById('ilw-field-lastname').value || '').trim();
    const company = (root.getElementById('ilw-field-company').value || '').trim();
    const email = (root.getElementById('ilw-field-email').value || '').trim();
    const countryCode = root.getElementById('ilw-field-country').value || '+91';
    const phoneNum = (root.getElementById('ilw-field-phone').value || '').trim();
    const message = (root.getElementById('ilw-field-message').value || '').trim();

    if (!firstName || !lastName || !company || !email || !phoneNum) {
      errorBanner.textContent = 'Please fill out all required fields (*).';
      errorBanner.classList.add('ilw-show');
      return;
    }

    const fullPhone = `${countryCode} ${phoneNum}`.trim();
    const fullName = `${firstName} ${lastName}`.trim();

    // Set loading state
    submitBtn.disabled = true;
    btnLabel.textContent = 'Sending request...';
    btnSpinner.style.display = 'block';

    const endpoint = `${config.portalUrl.replace(/\/+$/, '')}/api/leads`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          firstName: firstName,
          lastName: lastName,
          name: fullName,
          customer: fullName,
          company: company,
          email: email,
          phone: fullPhone,
          message: message || 'Inquiry submitted via chat widget',
          source: 'Website',
          focusArea: 'Cloud & Digital Transformation',
        }),
      });

      const data = await response.json();

      if (!response.ok || (data && data.error)) {
        throw new Error(data.error || 'Failed to submit contact request');
      }

      // Success
      formContainer.style.display = 'none';
      successContainer.style.display = 'flex';
      successName.textContent = `Thank you, ${firstName}!`;

      if (data.lead && data.lead.manager) {
        assignedSpecialist.textContent = `${data.lead.manager} (Score: ${data.lead.score || 8}/10)`;
        routingInfo.style.display = 'block';
      } else {
        routingInfo.style.display = 'none';
      }
    } catch (err) {
      console.error('[ImpigerLeadWidget] Submission error:', err);
      errorBanner.textContent =
        err.message || 'Unable to connect to lead server. Please try again.';
      errorBanner.classList.add('ilw-show');
    } finally {
      submitBtn.disabled = false;
      btnLabel.textContent = 'Send contact request';
      btnSpinner.style.display = 'none';
    }
  });

  // Auto-open if configured
  if (config.autoOpen) {
    setTimeout(openWidget, 800);
  }

  // Public JavaScript API
  window.ImpigerLeadWidget = {
    open: openWidget,
    close: closeWidget,
    toggle: toggleWidget,
    reset: resetForm,
    config: config,
  };
  window.LeadWidget = window.ImpigerLeadWidget;
})();
