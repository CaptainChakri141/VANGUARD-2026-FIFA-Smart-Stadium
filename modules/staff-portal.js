/**
 * ==========================================================================
 * Operations Command Center - Dispatch and Crowd Balance Systems
 * Focuses on: Modular handlers, input validation, and proper accessibility.
 * ==========================================================================
 */

import { processIncidentReport, sanitizeInput } from './ai-engine.js';

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

/**
 * Bootstraps all operations-related event listeners and seeds the tables.
 */
export function initStaffPortal() {
  const incidentForm = document.getElementById('incident-form');
  const simRushBtn = document.getElementById('sim-rush-gateC');
  const simResetBtn = document.getElementById('sim-reset-crowds');
  const btnReroute = document.getElementById('btn-trigger-rerouting');

  // 1. Submit structured logs from unstructured reporting text
  if (incidentForm) {
    incidentForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleIncidentReporting();
    });
  }

  // 2. Gate Congestion simulation events
  if (simRushBtn) {
    simRushBtn.addEventListener('click', () => simulateRushGateC());
  }

  if (simResetBtn) {
    simResetBtn.addEventListener('click', () => resetCrowds());
  }

  // 3. AI-guided load balancing event
  if (btnReroute) {
    btnReroute.addEventListener('click', () => triggerAIRerouting());
  }

  // Seed baseline records on startup
  renderInitialIncidents();
  updateCrowdProgressMeters();
}

/**
 * Pre-seeds baseline data into incidents table queue on start.
 */
function renderInitialIncidents() {
  const tbody = document.getElementById('incidents-tbody');
  if (!tbody) return;

  tbody.innerHTML = '';
  initialIncidents.forEach(inc => {
    appendIncidentRow(inc);
  });
}

/**
 * Logic to process unstructured reports entered by volunteers/staff.
 */
function handleIncidentReporting() {
  const rawTextArea = document.getElementById('incident-raw-text');
  const outputBox = document.getElementById('dispatch-output');
  
  if (!rawTextArea || !outputBox) return;

  const rawText = rawTextArea.value.trim();
  if (!rawText) {
    alert("Please enter incident details first.");
    return;
  }

  // Sanitize and analyze using AI simulated heuristics
  const cleanInput = sanitizeInput(rawText);
  const analysis = processIncidentReport(cleanInput);

  // Render dispatch intelligence block
  document.getElementById('ai-disp-class').textContent = analysis.category;
  document.getElementById('ai-disp-severity').textContent = analysis.severity;
  document.getElementById('ai-disp-loc').textContent = analysis.location;
  document.getElementById('ai-disp-assignee').textContent = analysis.assignee;
  document.getElementById('ai-disp-action').textContent = analysis.plan;

  // Apply custom severity styling
  const severityBadge = document.getElementById('ai-disp-severity');
  severityBadge.className = 'd-val'; // reset
  if (analysis.severity === 'Critical') severityBadge.style.color = 'var(--red-color)';
  else if (analysis.severity === 'Medium') severityBadge.style.color = 'var(--gold-color)';
  else severityBadge.style.color = 'var(--primary-color)';

  outputBox.classList.remove('hidden');

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
  rawTextArea.value = '';

  // Broadcast dispatch to screen reader
  const announcer = document.getElementById('sr-announcer');
  if (announcer) {
    announcer.textContent = `New incident logged. Class: ${analysis.category}, Location: ${analysis.location}, Assigned volunteer: ${analysis.assignee}. Action plan generated successfully.`;
  }
}

/**
 * Programmatically appends a row to the incident registry table.
 */
function appendIncidentRow(incident) {
  const tbody = document.getElementById('incidents-tbody');
  if (!tbody) return;

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
  tbody.insertBefore(tr, tbody.firstChild);
}

/**
 * Resolves an active incident, updating visual state.
 */
function resolveIncident(id, statusCell, resolveBtn) {
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
  const announcer = document.getElementById('sr-announcer');
  if (announcer) {
    announcer.textContent = `Incident #${id} has been resolved successfully.`;
  }
}

/**
 * Render gate metrics to progress bars and coordinate SVG sensor status colors.
 */
function updateCrowdProgressMeters() {
  ['A', 'B', 'C', 'D'].forEach(letter => {
    const statsSpan = document.getElementById(`gate-${letter}-stats`);
    const progressDiv = document.getElementById(`gate-${letter}-progress`);
    const svgSensorNode = document.getElementById(`stadium-map` === null ? null : `map-gate-${letter}`);
    
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
    }
  });
}

/**
 * Simulates a rush event on Gate C (South Corridor).
 */
function simulateRushGateC() {
  gateState["C"].load = 98;
  gateState["C"].wait = 50;

  updateCrowdProgressMeters();

  const announcer = document.getElementById('sr-announcer');
  if (announcer) {
    announcer.textContent = "System Alert: Gate C congestion has spiked to critical capacity! Wait times are currently 50 minutes. AI recommending immediate traffic redirection.";
  }
}

/**
 * Restores congestion state to default metrics.
 */
function resetCrowds() {
  gateState["A"] = { load: 15, wait: 2 };
  gateState["B"] = { load: 60, wait: 15 };
  gateState["C"] = { load: 22, wait: 4 }; // reset Gate C back to clear
  gateState["D"] = { load: 25, wait: 4 };

  updateCrowdProgressMeters();

  const announcer = document.getElementById('sr-announcer');
  if (announcer) {
    announcer.textContent = "Crowd metrics reset to default stadium operations baseline values.";
  }
}

/**
 * Triggers AI-Guided load balancing and redistributes incoming visitor queues.
 */
function triggerAIRerouting() {
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

  const announcer = document.getElementById('sr-announcer');
  if (announcer) {
    announcer.textContent = "AI Redirection alert broadcasting to incoming ticket-holders. Crowd load balanced successfully: Gate C wait decreased. Gates A and D absorbing redirected traffic.";
  }

  alert("🤖 FIFA AI Balancer: Alert dispatched! Incoming fans redirected to Gates A & D. Gate C congestion resolved.");
}
