/**
 * ==========================================================================
 * FIFA World Cup 2026 Smart Stadium Companion - Orchestrator & Bootstrapper
 * Focuses on: Modular imports, tab accessibility, and safe error boundaries.
 * ==========================================================================
 */

import { initAccessibilityService } from './modules/accessibility.js';
import { initFanPortal } from './modules/fan-portal.js';
import { initStaffPortal } from './modules/staff-portal.js';

document.addEventListener('DOMContentLoaded', () => {
  try {
    // 1. Initialize modular services
    initAccessibilityService();
    initFanPortal();
    initStaffPortal();

    // 2. Setup Dashboard view tab navigation
    initTabNavigation();

  } catch (error) {
    console.error("Critical failure during App boot checklist:", error);
    // Display global recovery message in case of script exceptions
    const announcer = document.getElementById('sr-announcer');
    if (announcer) {
      announcer.textContent = "Application failed to load completely. Please reload the webpage.";
    }
  }
});

/**
 * Implements accessible, keyboard-compliant tab toggles for the dashboard panels.
 * Complies with W3C WAI-ARIA tab practices.
 */
function initTabNavigation() {
  const tabs = document.querySelectorAll('.nav-tab');
  const tabList = document.querySelector('.nav-tabs');

  if (!tabs.length || !tabList) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      activateTab(tab);
    });

    // Arrow navigation inside tabs row
    tab.addEventListener('keydown', (e) => {
      let index = Array.from(tabs).indexOf(tab);

      if (e.key === 'ArrowRight') {
        let nextIndex = (index + 1) % tabs.length;
        tabs[nextIndex].focus();
        e.preventDefault();
      } else if (e.key === 'ArrowLeft') {
        let prevIndex = (index - 1 + tabs.length) % tabs.length;
        tabs[prevIndex].focus();
        e.preventDefault();
      } else if (e.key === 'Enter' || e.key === ' ') {
        activateTab(tab);
        e.preventDefault();
      }
    });
  });
}

/**
 * Switches current active tab panel.
 * @param {HTMLElement} activeTabBtn - Selected button node.
 */
function activateTab(activeTabBtn) {
  const tabs = document.querySelectorAll('.nav-tab');
  const panels = document.querySelectorAll('.view-panel');

  if (!activeTabBtn || !tabs.length || !panels.length) return;

  // 1. Update tab list active state
  tabs.forEach(tab => {
    tab.classList.remove('active');
    tab.setAttribute('aria-selected', 'false');
    tab.setAttribute('tabindex', '-1');
  });

  activeTabBtn.classList.add('active');
  activeTabBtn.setAttribute('aria-selected', 'true');
  activeTabBtn.setAttribute('tabindex', '0');

  // 2. Toggle visual content views
  const targetPanelId = activeTabBtn.getAttribute('aria-controls');
  
  panels.forEach(panel => {
    if (panel.id === targetPanelId) {
      panel.classList.add('active');
      panel.removeAttribute('hidden');
      
      // Accessibility: notify screen readers of panel swap
      const announcer = document.getElementById('sr-announcer');
      const panelTitle = panel.querySelector('h2')?.textContent || "new portal section";
      if (announcer) {
        announcer.textContent = `Switched to portal: ${panelTitle}. Content ready.`;
      }
    } else {
      panel.classList.remove('active');
      panel.setAttribute('hidden', 'true');
    }
  });
}
