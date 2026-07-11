/**
 * ==========================================================================
 * Fan Experience Portal - Controller & Interactive Components
 * Focuses on: Modular organization, input sanitization, and clean execution.
 * ==========================================================================
 */

import { sanitizeInput, classifyIntent, calculateCarbonImpact } from './ai-engine.js';

// Application State for Fan
const fanState = {
  greenPoints: 0,
  isTtsActive: false,
  typingInterval: null // track active typing to clear/prevent races
};

// Coordinate coordinates matching SVG nodes
const MAP_COORDINATES = {
  "Gate A": { x: 200, y: 25 },
  "Gate B": { x: 375, y: 200 },
  "Gate C": { x: 200, y: 375 },
  "Gate D": { x: 25, y: 200 },
  "Section 104": { x: 120, y: 120 },
  "Medical Zone North": { x: 280, y: 120 },
  "Concessions B": { x: 280, y: 280 },
  "Quiet Room 1": { x: 120, y: 280 }
};

// DOM Cache
const elements = {
  chatForm: null,
  chatInput: null,
  chatMessages: null,
  langSelect: null,
  greenGoalForm: null,
  btnCalcRoute: null,
  transportSel: null,
  distanceInput: null,
  resultsDiv: null,
  co2Val: null,
  ratingVal: null,
  pointsVal: null,
  rewardDrink: null,
  rewardDiscount: null,
  rewardStatus: null,
  startGate: null,
  endDest: null,
  pathLine: null,
  directionsBox: null,
  routeSummary: null,
  routeSteps: null,
  announcer: null,
  quickPromptBtns: []
};

/**
 * Initializes all Fan Portal event listeners and visual systems.
 */
export function initFanPortal() {
  try {
    // Cache all DOM references
    elements.chatForm = document.getElementById('fan-chat-form');
    elements.chatInput = document.getElementById('fan-chat-input');
    elements.chatMessages = document.getElementById('fan-chat-messages');
    elements.langSelect = document.getElementById('fan-lang-select');
    elements.greenGoalForm = document.getElementById('greengoal-form');
    elements.btnCalcRoute = document.getElementById('btn-calc-route');
    elements.transportSel = document.getElementById('gg-transport');
    elements.distanceInput = document.getElementById('gg-distance');
    elements.resultsDiv = document.getElementById('greengoal-result');
    elements.co2Val = document.getElementById('gg-co2-val');
    elements.ratingVal = document.getElementById('gg-rating-val');
    elements.pointsVal = document.getElementById('gg-points-val');
    elements.rewardDrink = document.getElementById('reward-drink');
    elements.rewardDiscount = document.getElementById('reward-discount');
    elements.rewardStatus = document.getElementById('reward-status');
    elements.startGate = document.getElementById('route-start');
    elements.endDest = document.getElementById('route-end');
    elements.pathLine = document.getElementById('route-path-line');
    elements.directionsBox = document.getElementById('routing-directions');
    elements.routeSummary = document.getElementById('routing-summary');
    elements.routeSteps = document.getElementById('routing-steps');
    elements.announcer = document.getElementById('sr-announcer');
    elements.quickPromptBtns = document.querySelectorAll('.quick-prompts .btn-chip');

    // 1. Setup Chatbot submit
    if (elements.chatForm && elements.chatInput) {
      elements.chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleChatSubmission();
      });
    }

    // 2. Setup Quick Prompts
    elements.quickPromptBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const prompt = btn.getAttribute('data-prompt');
        if (prompt && elements.chatInput) {
          elements.chatInput.value = prompt;
          handleChatSubmission();
        }
      });
    });

    // 3. Setup GreenGoal carbon tracker calculator
    if (elements.greenGoalForm) {
      elements.greenGoalForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleCarbonCalculation();
      });
    }

    // 4. Setup Stadium Navigation routing computation
    if (elements.btnCalcRoute) {
      elements.btnCalcRoute.addEventListener('click', () => {
        computeStadiumRoute();
      });
    }

    if (elements.startGate) {
      elements.startGate.addEventListener('change', () => {
        computeStadiumRoute();
      });
    }

    if (elements.endDest) {
      elements.endDest.addEventListener('change', () => {
        computeStadiumRoute();
      });
    }

    // 5. Setup Rewards Redemption Buttons
    if (elements.rewardDrink) {
      elements.rewardDrink.addEventListener('click', () => redeemReward('drink', 50));
    }
    if (elements.rewardDiscount) {
      elements.rewardDiscount.addEventListener('click', () => redeemReward('discount', 100));
    }

    // 6. Setup Interactive Map Elements Keyboard & Click Navigation
    initMapInteractions();

  } catch (error) {
    console.error("Error booting Fan Portal:", error);
  }
}

/**
 * Audio TTS toggle synchronization helper
 * @param {boolean} active - Is screen audio assistant enabled
 */
export function setTtsStatus(active) {
  fanState.isTtsActive = active;
  if (!active && window && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Reads AI chatbot response messages aloud using Web Speech API
 * @param {string} text - text to say
 */
function speakText(text) {
  try {
    if (!fanState.isTtsActive || !window || !('speechSynthesis' in window)) return;
    
    // Cancel current speech to prevent overlapping queues
    window.speechSynthesis.cancel();
    
    const cleanMsg = text.replace(/[\uE000-\uF8FF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDDFF]/g, ""); // Strip emojis for screen reader
    const utterance = new SpeechSynthesisUtterance(cleanMsg);
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  } catch (error) {
    console.error("Text-to-speech error:", error);
  }
}

/**
 * Processes chat input submissions and updates the chat bubble interface.
 */
function handleChatSubmission() {
  try {
    if (!elements.chatInput || !elements.chatMessages || !elements.langSelect) return;

    const rawMsg = elements.chatInput.value.trim();
    if (!rawMsg) return;

    // Clean and sanitize user query
    const cleanMsg = sanitizeInput(rawMsg);
    const targetLang = elements.langSelect.value || 'en';

    // Append user bubble to UI
    appendChatBubble('user', cleanMsg);
    elements.chatInput.value = '';

    // Classify intent and fetch AI response
    const aiResponse = classifyIntent(cleanMsg, targetLang);
    
    // Simulate stream-like typing for premium aesthetics
    appendChatBubbleWithTyping('bot', aiResponse);
  } catch (error) {
    console.error("Chatbot processing error:", error);
  }
}

/**
 * Appends a static chat bubble to the message log
 * @param {string} sender - 'user' or 'bot'
 * @param {string} text - message content
 */
function appendChatBubble(sender, text) {
  if (!elements.chatMessages) return;

  const msgDiv = document.createElement('div');
  msgDiv.className = `chat-msg ${sender}`;
  
  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  bubble.textContent = text;
  
  msgDiv.appendChild(bubble);
  elements.chatMessages.appendChild(msgDiv);
  
  // Scroll to bottom
  elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
}

/**
 * Appends a bubble with a simulated stream-typing animation.
 * @param {string} sender - 'user' or 'bot'
 * @param {string} fullText - message content to stream
 */
function appendChatBubbleWithTyping(sender, fullText) {
  if (!elements.chatMessages) return;

  // Clear any existing typing interval to avoid race conditions
  if (fanState.typingInterval) {
    clearInterval(fanState.typingInterval);
    fanState.typingInterval = null;
  }

  const msgDiv = document.createElement('div');
  msgDiv.className = `chat-msg ${sender}`;
  
  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  bubble.textContent = ''; // Start empty for streaming
  
  msgDiv.appendChild(bubble);
  elements.chatMessages.appendChild(msgDiv);

  // Trigger TTS reading immediately at stream start
  speakText(fullText);

  // Announce dynamic bot output in live region
  if (elements.announcer) {
    elements.announcer.textContent = `New AI message: ${fullText}`;
  }

  // Typist routine
  let index = 0;
  const words = fullText.split(' ');
  fanState.typingInterval = setInterval(() => {
    try {
      if (index < words.length) {
        bubble.textContent += (index === 0 ? '' : ' ') + words[index];
        index++;
        elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
      } else {
        clearInterval(fanState.typingInterval);
        fanState.typingInterval = null;
      }
    } catch (e) {
      clearInterval(fanState.typingInterval);
      fanState.typingInterval = null;
    }
  }, 40); // Fast word-by-word streaming
}

/**
 * Evaluates carbon tracker form inputs and updates green score telemetry.
 */
function handleCarbonCalculation() {
  try {
    if (!elements.transportSel || !elements.distanceInput || !elements.resultsDiv || !elements.co2Val || !elements.ratingVal || !elements.pointsVal) return;

    const mode = elements.transportSel.value;
    const dist = parseFloat(elements.distanceInput.value);

    // Validate travel distance boundaries (0 to 15000 km)
    if (isNaN(dist) || dist <= 0) {
      alert("Please enter a valid positive travel distance.");
      return;
    }
    if (dist > 15000) {
      alert("Distance exceeds maximum range (15,000 km). Please enter a realistic distance.");
      return;
    }

    const res = calculateCarbonImpact(mode, dist);

    // Render metrics
    elements.co2Val.textContent = `${res.co2} kg CO₂`;
    elements.ratingVal.textContent = res.rating;
    
    // Update state and rewards
    fanState.greenPoints += res.points;
    elements.pointsVal.textContent = `${fanState.greenPoints} pts`;

    // Announce values to screen reader
    if (elements.announcer) {
      elements.announcer.textContent = `Carbon footprint calculated: ${res.co2} kilograms. AI sustainability score rating is: ${res.rating}. You earned ${res.points} Green Points! Total points balance: ${fanState.greenPoints} points.`;
    }

    elements.resultsDiv.classList.remove('hidden');
    updateRedemptionButtons();
  } catch (error) {
    console.error("Carbon calculation error:", error);
  }
}

/**
 * Controls redemption eligibility for rewards buttons based on points state.
 */
function updateRedemptionButtons() {
  if (elements.rewardDrink) {
    elements.rewardDrink.disabled = fanState.greenPoints < 50;
  }
  if (elements.rewardDiscount) {
    elements.rewardDiscount.disabled = fanState.greenPoints < 100;
  }
}

/**
 * Handles eco-points deduction and displays coupon rewards.
 * @param {string} rewardType - 'drink' or 'discount'
 * @param {number} cost - point cost
 */
function redeemReward(rewardType, cost) {
  try {
    if (!elements.rewardStatus || !elements.pointsVal) return;

    if (fanState.greenPoints < cost) {
      elements.rewardStatus.style.color = 'var(--red-color)';
      elements.rewardStatus.textContent = "Error: Insufficient Green Points balance.";
      return;
    }

    // Deduct points
    fanState.greenPoints -= cost;
    elements.pointsVal.textContent = `${fanState.greenPoints} pts`;
    updateRedemptionButtons();

    const couponCode = `FIFA-GREEN-${rewardType.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    
    elements.rewardStatus.style.color = 'var(--accent-color)';
    elements.rewardStatus.textContent = `Successfully Redeemed! Code: ${couponCode}. Show to concession staff.`;

    // Screen reader alert
    if (elements.announcer) {
      elements.announcer.textContent = `Reward claimed successfully. Your unique coupon code is ${couponCode}. Points remaining: ${fanState.greenPoints}.`;
    }
  } catch (error) {
    console.error("Reward redemption error:", error);
  }
}

/**
 * Dynamic SVG routing calculation that models crowd congestion detours.
 */
export function computeStadiumRoute() {
  try {
    if (!elements.startGate || !elements.endDest || !elements.pathLine || !elements.directionsBox || !elements.routeSummary || !elements.routeSteps) return;

    const startName = elements.startGate.value;
    const endName = elements.endDest.value;

    const startPt = MAP_COORDINATES[startName];
    const endPt = MAP_COORDINATES[endName];

    if (!startPt || !endPt) return;

    // Render SVG Path line dynamically
    // To simulate stadium corridors, route goes from start -> central stadium junction (200, 200) -> destination.
    const routeD = `M ${startPt.x} ${startPt.y} Q 200 200 ${endPt.x} ${endPt.y}`;
    
    elements.pathLine.setAttribute('d', routeD);
    elements.pathLine.classList.remove('hidden');

    // Interactive node highlights
    document.querySelectorAll('.map-node').forEach(node => {
      node.classList.remove('active-route-node');
      node.style.r = ""; // reset inline scale styles
    });
    
    // Match corresponding nodes to apply custom focus visuals
    const startLetter = startName.split(' ')[1];
    const gateNode = document.getElementById(`map-gate-${startLetter}`);
    
    let targetNodeId = '';
    if (endName.includes('104')) targetNodeId = 'map-sec-104';
    else if (endName.includes('North') || endName.includes('Medical')) targetNodeId = 'map-med-north';
    else if (endName.includes('Hub B') || endName.includes('Concessions B')) targetNodeId = 'map-con-B';
    else if (endName.includes('Quiet')) targetNodeId = 'map-quiet-1';

    const destNode = document.getElementById(targetNodeId);
    if (gateNode) {
      gateNode.classList.add('active-route-node');
      gateNode.style.r = "15px";
    }
    if (destNode) {
      destNode.classList.add('active-route-node');
      destNode.style.r = "12px";
    }

    // Dynamic directions writing
    elements.routeSummary.textContent = `🤖 Navigation generated from ${startName} to ${endName}:`;
    
    // Live gate queue telemetry evaluation
    const statsSpan = document.getElementById(`gate-${startLetter}-stats`);
    const statsText = statsSpan ? statsSpan.textContent.trim() : "15% load (2m wait)";
    
    let densityAdvice = "low queue wait time. Proceed directly.";
    if (statsText.includes('92%') || statsText.includes('98%') || statsText.includes('Heavy') || statsText.includes('50m') || statsText.includes('45m')) {
      densityAdvice = `⚠️ heavy queue congestion (${statsText}). Expect delays. AI recommends slow approach or gate redistribution.`;
    } else if (statsText.includes('60%') || statsText.includes('Med') || statsText.includes('15m')) {
      densityAdvice = `moderate queue load (${statsText}). Normal security processing speed.`;
    } else {
      densityAdvice = `low queue load (${statsText}). Clear pathway to ticket checkpoints.`;
    }

    // Custom step lists
    elements.routeSteps.innerHTML = '';
    const steps = [
      `Scan ticket barcode at ${startName}. Security checkpoint status: ${densityAdvice}`,
      `Enter North-East concourse corridor. Keep left to bypass high-occupancy restroom queues.`,
      `Proceed 150m along Ring Corridor level 1. Follow visual signage overlays.`,
      `Arrive safely at ${endName}. Average routing speed was optimized by AI crowd balancer.`
    ];

    steps.forEach(step => {
      const li = document.createElement('li');
      li.textContent = step;
      elements.routeSteps.appendChild(li);
    });

    // Announce to Screen Reader
    if (elements.announcer) {
      elements.announcer.textContent = `Routing path computed. Path starts at ${startName} and finishes at ${endName}. Check the step by step directives under the map section.`;
    }

    elements.directionsBox.classList.remove('hidden');
  } catch (error) {
    console.error("Routing computation error:", error);
  }
}

/**
 * Installs handlers for SVG map node selections (clicking & keyboard focus)
 */
function initMapInteractions() {
  const mapNodes = document.querySelectorAll('.map-node');
  
  mapNodes.forEach(node => {
    const name = node.getAttribute('data-name');
    if (!name) return;

    // Make node focusable for keyboard users
    node.setAttribute('tabindex', '0');
    node.setAttribute('role', 'button');
    
    // Set appropriate initial ARIA labels
    updateNodeAriaLabel(node);

    // Click handler to select location
    node.addEventListener('click', () => {
      selectMapNode(node);
    });

    // Keyboard handlers (Space & Enter)
    node.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectMapNode(node);
      }
    });
  });
}

/**
 * Handle node selection, update selectors, and trigger route generation
 * @param {Element} node - SVG element clicked/focused
 */
function selectMapNode(node) {
  const name = node.getAttribute('data-name');
  if (!name) return;

  const isGate = node.classList.contains('node-gate');
  
  if (isGate) {
    if (elements.startGate) {
      elements.startGate.value = name;
      if (elements.announcer) {
        elements.announcer.textContent = `Selected ${name} as starting gate.`;
      }
    }
  } else {
    if (elements.endDest) {
      elements.endDest.value = name;
      if (elements.announcer) {
        elements.announcer.textContent = `Selected ${name} as target destination.`;
      }
    }
  }

  // Trigger routing calculation
  computeStadiumRoute();
}

/**
 * Update the accessible description of map sensors based on real-time loads
 * @param {Element} node - SVG Element to modify
 */
export function updateNodeAriaLabel(node) {
  try {
    const name = node.getAttribute('data-name');
    if (!name) return;

    const isGate = node.classList.contains('node-gate');
    if (isGate) {
      const letter = name.split(' ')[1];
      const progressLabel = document.getElementById(`gate-${letter}-stats`);
      const statusText = progressLabel ? progressLabel.textContent : "Standard wait";
      node.setAttribute('aria-label', `${name}. Current Queue: ${statusText}. Press Space or Enter to select as starting gate.`);
    } else {
      node.setAttribute('aria-label', `${name} destination. Press Space or Enter to select as target destination.`);
    }
  } catch (error) {
    console.error("Error setting node ARIA label:", error);
  }
}
