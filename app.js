/**
 * ==========================================================================
 * FIFA World Cup 2026 Smart Stadium Companion & Operations Command
 * Orchestrator Entrypoint Module
 * Focuses on: Modular structure, clean bootstrapping, and tab routing.
 * ==========================================================================
 */

import { initAccessibilityService } from './modules/accessibility.js';
import { initFanPortal } from './modules/fan-portal.js';
import { initStaffPortal } from './modules/staff-portal.js';

// Cache for DOM elements
const elements = {
  announcer: null,
  tabs: [],
  panels: []
};

/**
 * Main application orchestration & initializer
 */
document.addEventListener('DOMContentLoaded', () => {
  try {
    elements.announcer = document.getElementById('sr-announcer');
    
    // Initialize component services
    initAccessibilityService();
    initFanPortal();
    initStaffPortal();
    
    // Initialize tab router
    initTabNavigation();
  } catch (error) {
    console.error("Critical failure during App boot checklist:", error);
    if (elements.announcer) {
      elements.announcer.textContent = "Application failed to load completely. Please reload the webpage.";
    }
  }
});

/**
 * Sets up accessibility key listeners and clicks for main portal tabs
 */
function initTabNavigation() {
  const tabsList = document.querySelector('.nav-tabs');
  elements.tabs = document.querySelectorAll('.nav-tab');
  elements.panels = document.querySelectorAll('.view-panel');

  if (!elements.tabs.length || !tabsList) return;

  elements.tabs.forEach(tab => {
    // Click listener
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      activateTab(tab);
    });

    // Keyboard Arrow navigation for tablist (following WCAG guidelines)
    tab.addEventListener('keydown', (e) => {
      let index = Array.from(elements.tabs).indexOf(tab);

      if (e.key === 'ArrowRight') {
        let nextIndex = (index + 1) % elements.tabs.length;
        elements.tabs[nextIndex].focus();
        e.preventDefault();
      } else if (e.key === 'ArrowLeft') {
        let prevIndex = (index - 1 + elements.tabs.length) % elements.tabs.length;
        elements.tabs[prevIndex].focus();
        e.preventDefault();
      } else if (e.key === 'Enter' || e.key === ' ') {
        activateTab(tab);
        e.preventDefault();
      }
    });
  });
}

/**
 * Handles toggling active states of tabs and their linked viewpanels
 * @param {Element} activeTabBtn - The button tab to activate
 */
function activateTab(activeTabBtn) {
  const tabs = elements.tabs && elements.tabs.length ? elements.tabs : document.querySelectorAll('.nav-tab');
  const panels = elements.panels && elements.panels.length ? elements.panels : document.querySelectorAll('.view-panel');
  const announcer = elements.announcer || document.getElementById('sr-announcer');

  if (!activeTabBtn || !tabs.length || !panels.length) return;

  tabs.forEach(tab => {
    tab.classList.remove('active');
    tab.setAttribute('aria-selected', 'false');
    tab.setAttribute('tabindex', '-1');
  });

  activeTabBtn.classList.add('active');
  activeTabBtn.setAttribute('aria-selected', 'true');
  activeTabBtn.setAttribute('tabindex', '0');

  const targetPanelId = activeTabBtn.getAttribute('aria-controls');
  
  panels.forEach(panel => {
    if (panel.id === targetPanelId) {
      panel.classList.add('active');
      panel.removeAttribute('hidden');
      
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
