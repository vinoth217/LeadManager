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
      <div class="ilw-launcher-icon" id="ilw-launcher-icon">
        ${launcherChatIcon}
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
