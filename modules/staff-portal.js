/**
 * ==========================================================================
 * Operations Command Center - Dispatch and Crowd Balance Systems
 * Focuses on: Modular handlers, input validation, and proper accessibility.
 * ==========================================================================
 */

import { processIncidentReport, sanitizeInput } from './ai-engine.js';
import { updateNodeAriaLabel } from './fan-portal.js';

// Pre-seeded Operational Incidents
const initialIncidents = [
  {
    id: 1091,
    location: "Sec. 102",
    category: "Crowd Control",
    severity: "Medium",
    assignee: "Section Marshal A",
    status: "Dispatched"
  },
  {
    id: 1092,
    location: "Gate B",
    category: "Facilities",
    severity: "Low",
    assignee: "Janitorial Crew 3",
    status: "Resolved"
  }
];

let incidentCounter = 1093;

// Live Gate Congestion State
const gateState = {
  "A": { load: 15, wait: 2 },
  "B": { load: 60, wait: 15 },
  "C": { load: 92, wait: 45 },
  "D": { load: 22, wait: 4 }
};

// DOM Cache
const elements = {
  incidentForm: null,
  simRushBtn: null,
  simResetBtn: null,
  btnReroute: null,
  tbody: null,
  rawTextArea: null,
  outputBox: null,
  aiDispClass: null,
  aiDispSeverity: null,
  aiDispLoc: null,
  aiDispAssignee: null,
  aiDispAction: null,
  announcer: null
};

/**
 * Bootstraps all operations-related event listeners and seeds the tables.
 */
export function initStaffPortal() {
  try {
    // Cache all DOM references
    elements.incidentForm = document.getElementById('incident-form');
    elements.simRushBtn = document.getElementById('sim-rush-gateC');
    elements.simResetBtn = document.getElementById('sim-reset-crowds');
    elements.btnReroute = document.getElementById('btn-trigger-rerouting');
    elements.tbody = document.getElementById('incidents-tbody');
    elements.rawTextArea = document.getElementById('incident-raw-text');
    elements.outputBox = document.getElementById('dispatch-output');
    elements.aiDispClass = document.getElementById('ai-disp-class');
    elements.aiDispSeverity = document.getElementById('ai-disp-severity');
    elements.aiDispLoc = document.getElementById('ai-disp-loc');
    elements.aiDispAssignee = document.getElementById('ai-disp-assignee');
    elements.aiDispAction = document.getElementById('ai-disp-action');
    elements.announcer = document.getElementById('sr-announcer');

    // 1. Submit structured logs from unstructured reporting text
    if (elements.incidentForm) {
      elements.incidentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleIncidentReporting();
      });
    }

    // 2. Gate Congestion simulation events
    if (elements.simRushBtn) {
      elements.simRushBtn.addEventListener('click', () => simulateRushGateC());
    }

    if (elements.simResetBtn) {
      elements.simResetBtn.addEventListener('click', () => resetCrowds());
    }

    // 3. AI-guided load balancing event
    if (elements.btnReroute) {
      elements.btnReroute.addEventListener('click', () => triggerAIRerouting());
    }

    // Seed baseline records on startup
    renderInitialIncidents();
    updateCrowdProgressMeters();

  } catch (error) {
    console.error("Error booting Staff Portal:", error);
  }
}

/**
 * Pre-seeds baseline data into incidents table queue on start.
 */
function renderInitialIncidents() {
  if (!elements.tbody) return;

  elements.tbody.innerHTML = '';
  initialIncidents.forEach(inc => {
    appendIncidentRow(inc);
  });
}

/**
 * Logic to process unstructured reports entered by volunteers/staff.
 */
function handleIncidentReporting() {
  try {
    if (!elements.rawTextArea || !elements.outputBox) return;

    const rawText = elements.rawTextArea.value.trim();
    if (!rawText) {
      alert("Please enter incident details first.");
      return;
    }

    // Sanitize and analyze using AI simulated heuristics
    const cleanInput = sanitizeInput(rawText);
    const analysis = processIncidentReport(cleanInput);

    // Render dispatch intelligence block
    if (elements.aiDispClass) elements.aiDispClass.textContent = analysis.category;
    if (elements.aiDispSeverity) elements.aiDispSeverity.textContent = analysis.severity;
    if (elements.aiDispLoc) elements.aiDispLoc.textContent = analysis.location;
    if (elements.aiDispAssignee) elements.aiDispAssignee.textContent = analysis.assignee;
    if (elements.aiDispAction) elements.aiDispAction.textContent = analysis.plan;

    // Apply custom severity styling
    if (elements.aiDispSeverity) {
      elements.aiDispSeverity.className = 'd-val'; // reset
      if (analysis.severity === 'Critical') elements.aiDispSeverity.style.color = 'var(--red-color)';
      else if (analysis.severity === 'Medium') elements.aiDispSeverity.style.color = 'var(--gold-color)';
      else elements.aiDispSeverity.style.color = 'var(--primary-color)';
    }

    elements.outputBox.classList.remove('hidden');

    // Append new item to active queue list
    const newInc = {
      id: incidentCounter++,
      location: analysis.location,
      category: analysis.category,
      severity: analysis.severity,
      assignee: analysis.assignee,
      status: "Dispatched"
    };

    appendIncidentRow(newInc);
    elements.rawTextArea.value = '';

    // Broadcast dispatch to screen reader
    if (elements.announcer) {
      elements.announcer.textContent = `New incident logged. Class: ${analysis.category}, Location: ${analysis.location}, Assigned volunteer: ${analysis.assignee}. Action plan generated successfully.`;
    }
  } catch (error) {
    console.error("Error processing incident report:", error);
  }
}

/**
 * Programmatically appends a row to the incident registry table.
 * @param {Object} incident - Incident data structure
 */
function appendIncidentRow(incident) {
  if (!elements.tbody) return;

  const tr = document.createElement('tr');
  tr.id = `inc-row-${incident.id}`;

  const tdId = document.createElement('td');
  tdId.textContent = `#${incident.id}`;
  tr.appendChild(tdId);

  const tdLoc = document.createElement('td');
  tdLoc.textContent = incident.location;
  tr.appendChild(tdLoc);

  const tdCat = document.createElement('td');
  tdCat.textContent = incident.category;
  tr.appendChild(tdCat);

  // Severity Badge markup
  const tdSev = document.createElement('td');
  const badge = document.createElement('span');
  badge.className = `badge-severity ${incident.severity.toLowerCase()}`;
  badge.textContent = incident.severity;
  tdSev.appendChild(badge);
  tr.appendChild(tdSev);

  const tdAssign = document.createElement('td');
  tdAssign.textContent = incident.assignee;
  tr.appendChild(tdAssign);

  const tdStatus = document.createElement('td');
  tdStatus.className = 'col-status';
  tdStatus.textContent = incident.status;
  if (incident.status === 'Resolved') {
    tdStatus.style.color = 'var(--accent-color)';
    tdStatus.style.fontWeight = 'bold';
  }
  tr.appendChild(tdStatus);

  // Operations actions button cell
  const tdActions = document.createElement('td');
  const resolveBtn = document.createElement('button');
  resolveBtn.className = 'btn btn-secondary btn-chip';
  resolveBtn.textContent = 'Resolve';
  resolveBtn.setAttribute('aria-label', `Mark incident ${incident.id} at ${incident.location} as resolved`);
  
  if (incident.status === 'Resolved') {
    resolveBtn.disabled = true;
  } else {
    resolveBtn.addEventListener('click', () => {
      resolveIncident(incident.id, tdStatus, resolveBtn);
    });
  }

  tdActions.appendChild(resolveBtn);
  tr.appendChild(tdActions);

  // Prepend to show newest first in visual queue
  elements.tbody.insertBefore(tr, elements.tbody.firstChild);
}

/**
 * Resolves an active incident, updating visual state.
 * @param {number} id - incident ID
 * @param {Element} statusCell - TD element representing status
 * @param {Element} resolveBtn - button triggering resolution
 */
function resolveIncident(id, statusCell, resolveBtn) {
  try {
    statusCell.textContent = 'Resolved';
    statusCell.style.color = 'var(--accent-color)';
    statusCell.style.fontWeight = 'bold';
    resolveBtn.disabled = true;

    // Add subtle fade strike-through styling to resolved rows
    const row = document.getElementById(`inc-row-${id}`);
    if (row) {
      row.style.opacity = '0.65';
    }

    // Speak resolution to screen reader
    if (elements.announcer) {
      elements.announcer.textContent = `Incident #${id} has been resolved successfully.`;
    }
  } catch (error) {
    console.error("Error resolving incident:", error);
  }
}

/**
 * Render gate metrics to progress bars and coordinate SVG sensor status colors.
 */
function updateCrowdProgressMeters() {
  try {
    ['A', 'B', 'C', 'D'].forEach(letter => {
      const statsSpan = document.getElementById(`gate-${letter}-stats`);
      const progressDiv = document.getElementById(`gate-${letter}-progress`);
      const svgSensorNode = document.getElementById(`map-gate-${letter}`);
      
      if (!statsSpan || !progressDiv) return;

      const data = gateState[letter];
      
      // 1. Update text info
      statsSpan.textContent = `${data.load}% capacity (${data.wait}m wait)`;
      
      // 2. Adjust progress bar length and coloring classes
      progressDiv.style.width = `${data.load}%`;
      progressDiv.className = 'progress-bar'; // reset class
      
      let colorClass = 'bar-green';
      let sensorClass = 'map-node node-gate sensor-green';

      if (data.load > 80) {
        colorClass = 'bar-red';
        sensorClass = 'map-node node-gate sensor-red';
      } else if (data.load > 40) {
        colorClass = 'bar-yellow';
        sensorClass = 'map-node node-gate sensor-yellow';
      }

      progressDiv.classList.add(colorClass);

      // 3. Coordinate SVG map nodes classes (if elements exist on active DOM view)
      if (svgSensorNode) {
        svgSensorNode.setAttribute('class', sensorClass);
        // Sync the accessibility attributes dynamically!
        updateNodeAriaLabel(svgSensorNode);
      }
    });
  } catch (error) {
    console.error("Error updating crowd progress meters:", error);
  }
}

/**
 * Simulates a rush event on Gate C (South Corridor).
 */
function simulateRushGateC() {
  try {
    gateState["C"].load = 98;
    gateState["C"].wait = 50;

    updateCrowdProgressMeters();

    if (elements.announcer) {
      elements.announcer.textContent = "System Alert: Gate C congestion has spiked to critical capacity! Wait times are currently 50 minutes. AI recommending immediate traffic redirection.";
    }
  } catch (error) {
    console.error("Error simulating rush on Gate C:", error);
  }
}

/**
 * Restores congestion state to default metrics.
 */
function resetCrowds() {
  try {
    gateState["A"] = { load: 15, wait: 2 };
    gateState["B"] = { load: 60, wait: 15 };
    gateState["C"] = { load: 22, wait: 4 }; // reset Gate C back to clear
    gateState["D"] = { load: 25, wait: 4 };

    updateCrowdProgressMeters();

    if (elements.announcer) {
      elements.announcer.textContent = "Crowd metrics reset to default stadium operations baseline values.";
    }
  } catch (error) {
    console.error("Error resetting crowd density:", error);
  }
}

/**
 * Triggers AI-Guided load balancing and redistributes incoming visitor queues.
 */
function triggerAIRerouting() {
  try {
    if (gateState["C"].load < 40) {
      alert("Gate balance normal. Rerouting is only required when gate queues spike.");
      return;
    }

    // Simulated optimization redirecting 50% load from Gate C to Gates A & D
    gateState["C"].load = 45;
    gateState["C"].wait = 18;

    gateState["A"].load += 15;
    gateState["A"].wait += 5;

    gateState["D"].load += 20;
    gateState["D"].wait += 6;

    updateCrowdProgressMeters();

    if (elements.announcer) {
      elements.announcer.textContent = "AI Redirection alert broadcasting to incoming ticket-holders. Crowd load balanced successfully: Gate C wait decreased. Gates A and D absorbing redirected traffic.";
    }

    alert("🤖 FIFA AI Balancer: Alert dispatched! Incoming fans redirected to Gates A & D. Gate C congestion resolved.");
  } catch (error) {
    console.error("Error triggering AI rerouting:", error);
  }
}
