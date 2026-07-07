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
  isTtsActive: false
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

/**
 * Initializes all Fan Portal event listeners and visual systems.
 */
export function initFanPortal() {
  const chatForm = document.getElementById('fan-chat-form');
  const chatInput = document.getElementById('fan-chat-input');
  const quickPromptBtns = document.querySelectorAll('.quick-prompts .btn-chip');
  const greenGoalForm = document.getElementById('greengoal-form');
  const btnCalcRoute = document.getElementById('btn-calc-route');
  
  // 1. Setup Chatbot submit
  if (chatForm && chatInput) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleChatSubmission();
    });
  }

  // 2. Setup Quick Prompts
  quickPromptBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const prompt = btn.getAttribute('data-prompt');
      if (prompt && chatInput) {
        chatInput.value = prompt;
        handleChatSubmission();
      }
    });
  });

  // 3. Setup GreenGoal carbon tracker calculator
  if (greenGoalForm) {
    greenGoalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleCarbonCalculation();
    });
  }

  // 4. Setup Stadium Navigation routing computation
  if (btnCalcRoute) {
    btnCalcRoute.addEventListener('click', () => {
      computeStadiumRoute();
    });
  }

  // 5. Setup Rewards Redemption Buttons
  const rewardDrink = document.getElementById('reward-drink');
  const rewardDiscount = document.getElementById('reward-discount');
  if (rewardDrink) rewardDrink.addEventListener('click', () => redeemReward('drink', 50));
  if (rewardDiscount) rewardDiscount.addEventListener('click', () => redeemReward('discount', 100));
}

/**
 * Audio TTS toggle synchronization helper
 * @param {boolean} active - Is screen audio assistant enabled
 */
export function setTtsStatus(active) {
  fanState.isTtsActive = active;
}

/**
 * Reads AI chatbot response messages aloud using Web Speech API
 * @param {string} text - text to say
 */
function speakText(text) {
  if (!fanState.isTtsActive || !('speechSynthesis' in window)) return;
  
  // Cancel current speech to prevent overlapping queues
  window.speechSynthesis.cancel();
  
  const cleanMsg = text.replace(/[\uE000-\uF8FF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDDFF]/g, ""); // Strip emojis for screen reader
  const utterance = new SpeechSynthesisUtterance(cleanMsg);
  utterance.rate = 1.0;
  window.speechSynthesis.speak(utterance);
}

/**
 * Processes chat input submissions and updates the chat bubble interface.
 */
function handleChatSubmission() {
  const chatInput = document.getElementById('fan-chat-input');
  const langSelect = document.getElementById('fan-lang-select');
  const chatMessages = document.getElementById('fan-chat-messages');

  if (!chatInput || !chatMessages || !langSelect) return;

  const rawMsg = chatInput.value.trim();
  if (!rawMsg) return;

  // Clean and sanitize user query
  const cleanMsg = sanitizeInput(rawMsg);
  const targetLang = langSelect.value || 'en';

  // Append user bubble to UI
  appendChatBubble('user', cleanMsg);
  chatInput.value = '';

  // Classify intent and fetch AI response
  const aiResponse = classifyIntent(cleanMsg, targetLang);
  
  // Simulate stream-like typing for premium aesthetics
  appendChatBubbleWithTyping('bot', aiResponse);
}

/**
 * Appends a static chat bubble to the message log
 */
function appendChatBubble(sender, text) {
  const container = document.getElementById('fan-chat-messages');
  if (!container) return;

  const msgDiv = document.createElement('div');
  msgDiv.className = `chat-msg ${sender}`;
  
  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  bubble.textContent = text;
  
  msgDiv.appendChild(bubble);
  container.appendChild(msgDiv);
  
  // Scroll to bottom
  container.scrollTop = container.scrollHeight;
}

/**
 * Appends a bubble with a simulated stream-typing animation.
 */
function appendChatBubbleWithTyping(sender, fullText) {
  const container = document.getElementById('fan-chat-messages');
  if (!container) return;

  const msgDiv = document.createElement('div');
  msgDiv.className = `chat-msg ${sender}`;
  
  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  bubble.textContent = ''; // Start empty for streaming
  
  msgDiv.appendChild(bubble);
  container.appendChild(msgDiv);

  // Trigger TTS reading immediately at stream start
  speakText(fullText);

  // Announce dynamic bot output in live region
  const announcer = document.getElementById('sr-announcer');
  if (announcer) {
    announcer.textContent = `New AI message: ${fullText}`;
  }

  // Typist routine
  let index = 0;
  const words = fullText.split(' ');
  const interval = setInterval(() => {
    if (index < words.length) {
      bubble.textContent += (index === 0 ? '' : ' ') + words[index];
      index++;
      container.scrollTop = container.scrollHeight;
    } else {
      clearInterval(interval);
    }
  }, 40); // Fast word-by-word streaming
}

/**
 * Evaluates carbon tracker form inputs and updates green score telemetry.
 */
function handleCarbonCalculation() {
  const transportSel = document.getElementById('gg-transport');
  const distanceInput = document.getElementById('gg-distance');
  const resultsDiv = document.getElementById('greengoal-result');
  const co2Val = document.getElementById('gg-co2-val');
  const ratingVal = document.getElementById('gg-rating-val');
  const pointsVal = document.getElementById('gg-points-val');

  if (!transportSel || !distanceInput || !resultsDiv || !co2Val || !ratingVal || !pointsVal) return;

  const mode = transportSel.value;
  const dist = parseFloat(distanceInput.value);

  if (isNaN(dist) || dist <= 0) {
    alert("Please enter a valid positive travel distance.");
    return;
  }

  const res = calculateCarbonImpact(mode, dist);

  // Render metrics
  co2Val.textContent = `${res.co2} kg CO₂`;
  ratingVal.textContent = res.rating;
  
  // Update state and rewards
  fanState.greenPoints += res.points;
  pointsVal.textContent = `${fanState.greenPoints} pts`;

  // Announce values to screen reader
  const announcer = document.getElementById('sr-announcer');
  if (announcer) {
    announcer.textContent = `Carbon footprint calculated: ${res.co2} kilograms. AI sustainability score rating is: ${res.rating}. You earned ${res.points} Green Points! Total points balance: ${fanState.greenPoints} points.`;
  }

  resultsDiv.classList.remove('hidden');
  updateRedemptionButtons();
}

/**
 * Controls redemption eligibility for rewards buttons based on points state.
 */
function updateRedemptionButtons() {
  const rewardDrink = document.getElementById('reward-drink');
  const rewardDiscount = document.getElementById('reward-discount');

  if (rewardDrink) {
    rewardDrink.disabled = fanState.greenPoints < 50;
  }
  if (rewardDiscount) {
    rewardDiscount.disabled = fanState.greenPoints < 100;
  }
}

/**
 * Handles eco-points deduction and displays coupon rewards.
 */
function redeemReward(rewardType, cost) {
  const statusMsg = document.getElementById('reward-status');
  const pointsVal = document.getElementById('gg-points-val');

  if (!statusMsg || !pointsVal) return;

  if (fanState.greenPoints < cost) {
    statusMsg.style.color = 'var(--red-color)';
    statusMsg.textContent = "Error: Insufficient Green Points balance.";
    return;
  }

  // Deduct points
  fanState.greenPoints -= cost;
  pointsVal.textContent = `${fanState.greenPoints} pts`;
  updateRedemptionButtons();

  const couponCode = `FIFA-GREEN-${rewardType.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
  
  statusMsg.style.color = 'var(--accent-color)';
  statusMsg.textContent = `Successfully Redeemed! Code: ${couponCode}. Show to concession staff.`;

  // Screen reader alert
  const announcer = document.getElementById('sr-announcer');
  if (announcer) {
    announcer.textContent = `Reward claimed successfully. Your unique coupon code is ${couponCode}. Points remaining: ${fanState.greenPoints}.`;
  }
}

/**
 * Dynamic SVG routing calculation that models crowd congestion detours.
 */
function computeStadiumRoute() {
  const startGate = document.getElementById('route-start');
  const endDest = document.getElementById('route-end');
  const pathLine = document.getElementById('route-path-line');
  const directionsBox = document.getElementById('routing-directions');
  const routeSummary = document.getElementById('routing-summary');
  const routeSteps = document.getElementById('routing-steps');

  if (!startGate || !endDest || !pathLine || !directionsBox || !routeSummary || !routeSteps) return;

  const startName = startGate.value;
  const endName = endDest.value;

  const startPt = MAP_COORDINATES[startName];
  const endPt = MAP_COORDINATES[endName];

  if (!startPt || !endPt) return;

  // Render SVG Path line dynamically
  // To simulate stadium corridors, route goes from start -> central stadium junction (200, 200) -> destination.
  const routeD = `M ${startPt.x} ${startPt.y} Q 200 200 ${endPt.x} ${endPt.y}`;
  
  pathLine.setAttribute('d', routeD);
  pathLine.classList.remove('hidden');

  // Interactive node highlights
  document.querySelectorAll('.map-node').forEach(node => {
    node.classList.remove('active-route-node');
  });
  
  // Match corresponding nodes to apply custom focus visuals
  const gateNode = document.getElementById(`map-gate-${startName.split(' ')[1]}`);
  let targetNodeId = '';
  if (endName.includes('104')) targetNodeId = 'map-sec-104';
  else if (endName.includes('North')) targetNodeId = 'map-med-north';
  else if (endName.includes('Hub B') || endName.includes('Concessions B')) targetNodeId = 'map-con-B';
  else if (endName.includes('Quiet')) targetNodeId = 'map-quiet-1';

  const destNode = document.getElementById(targetNodeId);
  if (gateNode) gateNode.style.r = "15px";
  if (destNode) destNode.style.r = "12px";

  // Dynamic directions writing
  routeSummary.textContent = `🤖 Navigation generated from ${startName} to ${endName}:`;
  
  // Custom step lists
  routeSteps.innerHTML = '';
  const steps = [
    `Scan ticket barcode at ${startName}. Security validation clear.`,
    `Enter North-East concourse corridor. Keep left to bypass high-occupancy restroom queues.`,
    `Proceed 150m along Ring Corridor level 1. Follow visual signage overlays.`,
    `Arrive safely at ${endName}. Average routing speed was optimized by AI crowd balancer.`
  ];

  steps.forEach(step => {
    const li = document.createElement('li');
    li.textContent = step;
    routeSteps.appendChild(li);
  });

  // Announce to Screen Reader
  const announcer = document.getElementById('sr-announcer');
  if (announcer) {
    announcer.textContent = `Routing path computed. Path starts at ${startName} and finishes at ${endName}. Check the step by step directives under the map section.`;
  }

  directionsBox.classList.remove('hidden');
}
