/**
 * ==========================================================================
 * Accessibility Service - Contrast, Font Scaling, and Speech Synthesis
 * Focuses on: WCAG compliance, persistent preferences, and screen reader cues.
 * ==========================================================================
 */

import { setTtsStatus } from './fan-portal.js';

/**
 * Boots the accessibility framework and restores cached settings.
 */
export function initAccessibilityService() {
  const contrastBtn = document.getElementById('contrast-toggle');
  const sizeSelector = document.getElementById('font-size-selector');
  const ttsBtn = document.getElementById('tts-toggle');

  // Restore persistent settings
  restorePreferences();

  // 1. Contrast Toggle handler
  if (contrastBtn) {
    contrastBtn.addEventListener('click', () => {
      toggleContrastMode(contrastBtn);
    });
  }

  // 2. Font Size Scaling handler
  if (sizeSelector) {
    sizeSelector.addEventListener('change', (e) => {
      applyFontScale(e.target.value);
    });
  }

  // 3. Text-To-Speech reader toggles
  if (ttsBtn) {
    if (!('speechSynthesis' in window)) {
      // Gracefully disable TTS button if platform doesn't support Web Speech
      ttsBtn.disabled = true;
      ttsBtn.querySelector('span') ? ttsBtn.querySelector('span').textContent = 'Audio Assist: N/A' : null;
      ttsBtn.title = "Text-to-speech is unsupported on this browser";
    } else {
      ttsBtn.addEventListener('click', () => {
        toggleSpeechAssistance(ttsBtn);
      });
    }
  }

  // Add listener for global key combination (Ctrl + Alt + A) to open accessibility help
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'a') {
      announceAccessibilityStatus();
    }
  });
}

/**
 * Toggles dark high contrast colors.
 */
function toggleContrastMode(btn) {
  const isHighContrast = document.body.classList.toggle('high-contrast');
  
  // Update button attributes
  btn.setAttribute('aria-pressed', isHighContrast ? 'true' : 'false');
  
  // Persist choice
  safeSetItem('fifa-contrast', isHighContrast ? 'active' : 'inactive');

  // Voice announcement in live region
  const announcer = document.getElementById('sr-announcer');
  if (announcer) {
    announcer.textContent = isHighContrast 
      ? "High contrast theme activated. Color scheme changed to high-visibility black, yellow, and green." 
      : "Standard theme restored. Translucent glass style activated.";
  }
}

/**
 * Modifies font size classes on the body container.
 */
function applyFontScale(scaleValue) {
  // Clear previous size settings
  document.body.classList.remove('font-large', 'font-xlarge');

  if (scaleValue === 'large') {
    document.body.classList.add('font-large');
  } else if (scaleValue === 'xlarge') {
    document.body.classList.add('font-xlarge');
  }

  safeSetItem('fifa-textscale', scaleValue);

  const announcer = document.getElementById('sr-announcer');
  if (announcer) {
    announcer.textContent = `Font scaling changed to: ${scaleValue}. App layout adjusted.`;
  }
}

/**
 * Connects the user speech assist status to fan-portal state.
 */
function toggleSpeechAssistance(btn) {
  const isPressed = btn.getAttribute('aria-pressed') === 'true';
  const nextState = !isPressed;

  btn.setAttribute('aria-pressed', nextState ? 'true' : 'false');
  setTtsStatus(nextState);

  // Update UI appearance
  if (nextState) {
    btn.classList.add('tts-active');
    btn.innerHTML = `
      <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" width="18" height="18">
        <path fill="currentColor" d="M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.85 14,18.71V20.77C18,19.86 21,16.28 21,12C21,7.72 18,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16C15.5,15.29 16.5,13.77 16.5,12M3,9V15H7L12,20V4L7,9H3Z"/>
      </svg>
      Audio Assist: On
    `;
    
    // Announce
    const announcer = document.getElementById('sr-announcer');
    if (announcer) announcer.textContent = "Audio assistance enabled. AI responses will be read aloud.";
  } else {
    btn.classList.remove('tts-active');
    btn.innerHTML = `
      <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" width="18" height="18">
        <path fill="currentColor" d="M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.85 14,18.71V20.77C18,19.86 21,16.28 21,12C21,7.72 18,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16C15.5,15.29 16.5,13.77 16.5,12M3,9V15H7L12,20V4L7,9H3Z"/>
      </svg>
      Audio Assist: Off
    `;
    
    // Announce
    const announcer = document.getElementById('sr-announcer');
    if (announcer) announcer.textContent = "Audio assistance disabled.";
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop talking immediately
    }
  }

  safeSetItem('fifa-audiott', nextState ? 'active' : 'inactive');
}

/**
 * Restores user configurations saved in local storage.
 */
function restorePreferences() {
  // 1. Contrast
  const contrastPref = safeGetItem('fifa-contrast');
  const contrastBtn = document.getElementById('contrast-toggle');
  if (contrastPref === 'active' && contrastBtn) {
    document.body.classList.add('high-contrast');
    contrastBtn.setAttribute('aria-pressed', 'true');
  }

  // 2. Text Scaling
  const scalePref = safeGetItem('fifa-textscale');
  const sizeSelector = document.getElementById('font-size-selector');
  if (scalePref && sizeSelector) {
    sizeSelector.value = scalePref;
    applyFontScale(scalePref);
  }

  // 3. Speech Assist
  const ttsPref = safeGetItem('fifa-audiott');
  const ttsBtn = document.getElementById('tts-toggle');
  if (ttsPref === 'active' && ttsBtn && ('speechSynthesis' in window)) {
    toggleSpeechAssistance(ttsBtn);
  }
}

/**
 * Verbose accessibility hotkey layout status announcer.
 */
function announceAccessibilityStatus() {
  const contrast = document.body.classList.contains('high-contrast') ? "active" : "inactive";
  const size = document.getElementById('font-size-selector')?.value || "normal";
  const speech = document.getElementById('tts-toggle')?.getAttribute('aria-pressed') === 'true' ? "enabled" : "disabled";

  const announcer = document.getElementById('sr-announcer');
  if (announcer) {
    announcer.textContent = `Accessibility Profile: High contrast is ${contrast}. Text scaling is set to ${size}. Audio assist read-aloud is ${speech}. Navigate portals using tabs.`;
  }
}

/**
 * Safe local storage setter.
 */
function safeSetItem(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    // Ignore storage blocker errors
  }
}

/**
 * Safe local storage getter.
 */
function safeGetItem(key) {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    return null;
  }
}
