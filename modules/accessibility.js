/**
 * ==========================================================================
 * Accessibility Service - Contrast, Font Scaling, and Speech Synthesis
 * Focuses on: WCAG compliance, persistent preferences, and screen reader cues.
 * ==========================================================================
 */

import { setTtsStatus } from './fan-portal.js';

// Cache for DOM elements
const elements = {
  contrastBtn: null,
  sizeSelector: null,
  ttsBtn: null,
  announcer: null
};

/**
 * Boots the accessibility framework and restores cached settings.
 */
export function initAccessibilityService() {
  try {
    elements.contrastBtn = document.getElementById('contrast-toggle');
    elements.sizeSelector = document.getElementById('font-size-selector');
    elements.ttsBtn = document.getElementById('tts-toggle');
    elements.announcer = document.getElementById('sr-announcer');

    // Restore persistent settings
    restorePreferences();

    // 1. Contrast Toggle handler
    if (elements.contrastBtn) {
      elements.contrastBtn.addEventListener('click', () => {
        toggleContrastMode();
      });
    }

    // 2. Font Size Scaling handler
    if (elements.sizeSelector) {
      elements.sizeSelector.addEventListener('change', (e) => {
        applyFontScale(e.target.value);
      });
    }

    // 3. Text-To-Speech reader toggles
    if (elements.ttsBtn) {
      if (!window || !('speechSynthesis' in window)) {
        // Gracefully disable TTS button if platform doesn't support Web Speech
        elements.ttsBtn.disabled = true;
        const textSpan = elements.ttsBtn.querySelector('span');
        if (textSpan) textSpan.textContent = 'Audio Assist: N/A';
        elements.ttsBtn.title = "Text-to-speech is unsupported on this browser";
      } else {
        elements.ttsBtn.addEventListener('click', () => {
          toggleSpeechAssistance();
        });
      }
    }

    // Add listener for global key combination (Ctrl + Alt + A) to open accessibility help
    window.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'a') {
        announceAccessibilityStatus();
      }
    });
  } catch (error) {
    console.error("Failed to initialize Accessibility Service:", error);
  }
}

/**
 * Toggles dark high contrast colors.
 */
function toggleContrastMode() {
  try {
    if (!elements.contrastBtn) return;
    const isHighContrast = document.body.classList.toggle('high-contrast');
    
    // Update button attributes
    elements.contrastBtn.setAttribute('aria-pressed', isHighContrast ? 'true' : 'false');
    
    // Persist choice
    safeSetItem('fifa-contrast', isHighContrast ? 'active' : 'inactive');

    // Voice announcement in live region
    if (elements.announcer) {
      elements.announcer.textContent = isHighContrast 
        ? "High contrast theme activated. Color scheme changed to high-visibility black, yellow, and green." 
        : "Standard theme restored. Translucent glass style activated.";
    }
  } catch (error) {
    console.error("Error toggling contrast mode:", error);
  }
}

/**
 * Modifies font size classes on the body container.
 * @param {string} scaleValue - The selected scaling level ('normal', 'large', 'xlarge')
 */
function applyFontScale(scaleValue) {
  try {
    // Clear previous size settings
    document.documentElement.classList.remove('font-large', 'font-xlarge');

    if (scaleValue === 'large') {
      document.documentElement.classList.add('font-large');
    } else if (scaleValue === 'xlarge') {
      document.documentElement.classList.add('font-xlarge');
    }

    safeSetItem('fifa-textscale', scaleValue);

    if (elements.announcer) {
      elements.announcer.textContent = `Font scaling changed to: ${scaleValue}. App layout adjusted.`;
    }
  } catch (error) {
    console.error("Error applying font scale:", error);
  }
}

/**
 * Connects the user speech assist status to fan-portal state.
 */
function toggleSpeechAssistance() {
  try {
    if (!elements.ttsBtn) return;
    const isPressed = elements.ttsBtn.getAttribute('aria-pressed') === 'true';
    const nextState = !isPressed;

    elements.ttsBtn.setAttribute('aria-pressed', nextState ? 'true' : 'false');
    setTtsStatus(nextState);

    // Update UI appearance
    if (nextState) {
      elements.ttsBtn.classList.add('tts-active');
      elements.ttsBtn.innerHTML = `
        <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" width="18" height="18">
          <path fill="currentColor" d="M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.85 14,18.71V20.77C18,19.86 21,16.28 21,12C21,7.72 18,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16C15.5,15.29 16.5,13.77 16.5,12M3,9V15H7L12,20V4L7,9H3Z"/>
        </svg>
        Audio Assist: On
      `;
      
      if (elements.announcer) elements.announcer.textContent = "Audio assistance enabled. AI responses will be read aloud.";
    } else {
      elements.ttsBtn.classList.remove('tts-active');
      elements.ttsBtn.innerHTML = `
        <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" width="18" height="18">
          <path fill="currentColor" d="M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.85 14,18.71V20.77C18,19.86 21,16.28 21,12C21,7.72 18,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16C15.5,15.29 16.5,13.77 16.5,12M3,9V15H7L12,20V4L7,9H3Z"/>
        </svg>
        Audio Assist: Off
      `;
      
      if (elements.announcer) elements.announcer.textContent = "Audio assistance disabled.";
      if (window && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // Stop talking immediately
      }
    }

    safeSetItem('fifa-audiott', nextState ? 'active' : 'inactive');
  } catch (error) {
    console.error("Error toggling speech assistance:", error);
  }
}

/**
 * Restores user configurations saved in local storage.
 */
function restorePreferences() {
  try {
    // 1. Contrast
    const contrastPref = safeGetItem('fifa-contrast');
    if (contrastPref === 'active' && elements.contrastBtn) {
      document.body.classList.add('high-contrast');
      elements.contrastBtn.setAttribute('aria-pressed', 'true');
    }

    // 2. Text Scaling
    const scalePref = safeGetItem('fifa-textscale');
    if (scalePref && elements.sizeSelector) {
      elements.sizeSelector.value = scalePref;
      applyFontScale(scalePref);
    }

    // 3. Speech Assist
    const ttsPref = safeGetItem('fifa-audiott');
    if (ttsPref === 'active' && elements.ttsBtn && window && ('speechSynthesis' in window)) {
      toggleSpeechAssistance();
    }
  } catch (error) {
    console.error("Error restoring preferences:", error);
  }
}

/**
 * Verbose accessibility hotkey layout status announcer.
 */
function announceAccessibilityStatus() {
  try {
    const contrast = document.body.classList.contains('high-contrast') ? "active" : "inactive";
    const size = elements.sizeSelector ? elements.sizeSelector.value : "normal";
    const speech = elements.ttsBtn ? (elements.ttsBtn.getAttribute('aria-pressed') === 'true' ? "enabled" : "disabled") : "disabled";

    if (elements.announcer) {
      elements.announcer.textContent = `Accessibility Profile: High contrast is ${contrast}. Text scaling is set to ${size}. Audio assist read-aloud is ${speech}. Navigate portals using tabs.`;
    }
  } catch (error) {
    console.error("Error announcing accessibility status:", error);
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
