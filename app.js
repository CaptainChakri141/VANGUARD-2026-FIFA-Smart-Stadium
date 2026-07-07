/**
 * ==========================================================================
 * FIFA World Cup 2026 Smart Stadium Companion & Operations Command
 * Unified Self-Contained Script (CORS-immune, works via file:// and http://)
 * Focuses on: Modular organization, accessibility, security, and high performance.
 * ==========================================================================
 */

// ==========================================================================
// 1. APPLICATION GLOBAL STATE
// ==========================================================================
const state = {
  greenPoints: 0,
  isTtsActive: false,
  contrastMode: 'inactive',
  textScale: 'normal',
  incidentCounter: 1093,
  gateState: {
    "A": { load: 15, wait: 2 },
    "B": { load: 60, wait: 15 },
    "C": { load: 92, wait: 45 },
    "D": { load: 22, wait: 4 }
  }
};

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

// ==========================================================================
// 2. SIMULATED GENERATIVE AI UTILITIES & TRANSLATION ENGINE
// ==========================================================================

/**
 * Sanitizes input text to prevent Cross-Site Scripting (XSS) and injection vulnerabilities.
 * @param {string} input - Raw user input.
 * @returns {string} Sanitized string.
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

const TRANSLATION_DB = {
  es: {
    "Welcome!": "¡Bienvenido al Estadio FIFA 2026! Soy tu conserje de IA.",
    "medical_station": "🏥 La estación médica más cercana está ubicada detrás del Sector 104, accesible por el pasillo principal del Norte.",
    "gate_congestion": "🗺️ Puertas A y D están descongestionadas (espera < 5 mins). Evite la Puerta C debido al tráfico intenso.",
    "transit_eco": "🚆 Recomendación ecológica: Tome la Línea Metro-Estadio 2 desde el centro de la ciudad. Ahorra 4.2 kg de CO₂ y gana 30 Puntos Verdes.",
    "quiet_zone": "🧘 Las zonas sensoriales tranquilas están ubicadas en el Sector 120 (Nivel 2) y Sector 202 (Nivel 4). Hay auriculares con cancelación de ruido disponibles.",
    "food_options": "🍔 Concesión Hub B ofrece opciones Halal, Veganas y Sin Gluten. Las filas son actualmente bajas (espera < 5 mins).",
    "fallback": "🤖 Entiendo su consulta. Recomiendo dirigirse al mostrador de asistencia al cliente en el vestíbulo principal o consultar nuestra sección de navegación del estadio."
  },
  fr: {
    "Welcome!": "Bienvenue au Stade FIFA 2026! Je suis votre concierge IA.",
    "medical_station": "🏥 Le poste médical le plus proche se trouve derrière la Section 104, accessible par le couloir principal Nord.",
    "gate_congestion": "🗺️ Les portes A et D sont fluides (attente < 5 min). Évitez la porte C en raison d'une forte affluence.",
    "transit_eco": "🚆 Recommandation verte: Prenez la ligne 2 du métro du stade depuis le centre-ville. Économisez 4.2 kg de CO₂ et gagnez 30 points verts.",
    "quiet_zone": "🧘 Les zones calmes sensorielles sont situées dans la section 120 (niveau 2) et la section 202 (niveau 4). Des casques anti-bruit sont disponibles.",
    "food_options": "🍔 Le hub de restauration B propose des options halal, végétaliennes et sans gluten. Les files d'attente sont actuellement courtes (< 5 min).",
    "fallback": "🤖 J'ai bien compris votre demande. Je vous conseille de vous rendre au bureau d'assistance dans le hall principal ou de consulter notre carte de navigation."
  },
  pt: {
    "Welcome!": "Bem-vindo ao Estádio FIFA 2026! Sou o seu concierge de IA.",
    "medical_station": "🏥 O posto médico mais próximo fica atrás do Setor 104, acessível pelo corredor principal Norte.",
    "gate_congestion": "🗺️ Portões A e D estão livres (espera < 5 min). Evite o Portão C devido ao tráfego pesado.",
    "transit_eco": "🚆 Recomendação ecológica: Pegue a Linha 2 do Metrô do Estádio no centro da cidade. Economiza 4,2 kg de CO₂ e concede 30 Pontos Verdes.",
    "quiet_zone": "🧘 Salas de quietude sensorial estão no Setor 120 (Nível 2) e Setor 202 (Nível 4). Abafadores de ruído disponíveis.",
    "food_options": "🍔 O hub de alimentação B oferece opções Halal, Veganas e Sem Glúten. Filas baixas (espera < 5 min).",
    "fallback": "🤖 Compreendi a sua pergunta. Recomendo dirigir-se ao balcão de suporte ao cliente no corredor principal ou verificar o nosso mapa interactivo."
  },
  ar: {
    "Welcome!": "مرحباً بكم في ملعب فيفا 2026! أنا مساعد الذكاء الاصطناعي الخاص بك.",
    "medical_station": "🏥 تقع أقرب محطة طبية خلف القسم 104، ويمكن الوصول إليها عبر الممر الشمالي الرئيسي.",
    "gate_congestion": "🗺️ البوابتان A و D غير مزدحمتين (الانتظار أقل من 5 دقائق). يرجى تجنب البوابة C بسبب الازدحام الشديد.",
    "transit_eco": "🚆 توصية بيئية: استقل خط مترو الملعب 2 من وسط المدينة. ستوفر 4.2 كجم من الكربون وتكسب 30 نقطة خضراء.",
    "quiet_zone": "🧘 تقع غرف الهدوء الحسي في القسم 120 (المستوى 2) والقسم 202 (المستوى 4). تتوفر سماعات إلغاء الضوضاء.",
    "food_options": "🍔 يقدم مركز الأغذية B خيارات حلال، نباتية، وخالية من الغلوتين. الطوابير قصيرة حالياً (أقل من 5 دقائق).",
    "fallback": "🤖 تفهمت استفسارك. أنصحك بالتوجه إلى مكتب علاقات المشجعين في البهو الرئيسي أو مراجعة خريطة التنقل التفاعلية."
  },
  ja: {
    "Welcome!": "FIFAワールドカップ2026スタジアムへようこそ！私はAIコンシェルジュです。",
    "medical_station": "🏥 最寄りの救護所はセクション104の裏手にあります。北メインコンコースからアクセス可能です。",
    "gate_congestion": "🗺️ ゲートAとDは空いています（待ち時間5分未満）。混雑のためゲートCは避けてください。",
    "transit_eco": "🚆 環境配慮ルート：市内中心部からスタジアムメトロ2号線をご利用ください。4.2kgのCO2を削減し、30グリーンポイントを獲得できます。",
    "quiet_zone": "🧘 センサリー静音室はセクション120（2階）およびセクション202（4階）にあります。防音用ヘッドホンが利用可能です。",
    "food_options": "🍔 フードハブBでは、ハラール、ヴィーガン、グルテンフリーの食事を提供しています。待ち時間は現在短いです（5分未満）。",
    "fallback": "🤖 ご質問ありがとうございます。メインコンコースの総合案内所にお越しいただくか、インタラクティブマップをご活用ください。"
  },
  en: {
    "Welcome!": "Welcome to the MetLife FIFA 2026 Smart Stadium Companion. I'm your GenAI concierge.",
    "medical_station": "🏥 The nearest medical station is located behind Section 104, accessible via the North main corridor.",
    "gate_congestion": "🗺️ Gates A and D are currently clear (wait < 5 mins). Avoid Gate C due to heavy inflow.",
    "transit_eco": "🚆 Eco recommendation: Take the Stadium Metro Line 2 from downtown. Saves 4.2 kg of CO₂ and awards 30 Green Points.",
    "quiet_zone": "🧘 Sensory quiet zones are located in Section 120 (Level 2) and Section 202 (Level 4). Noise-cancelling headphones are available.",
    "food_options": "🍔 Concession Hub B offers Halal, Vegan, and Gluten-Free selections. Lines are currently low (wait < 5 mins).",
    "fallback": "🤖 Understood your inquiry. I recommend heading to the Fan Relations Support Desk in the main concourse or checking the navigation dashboard."
  }
};

/**
 * Classifies fan queries and returns dynamic AI responses.
 */
function classifyIntent(text, targetLang = 'en') {
  const query = text.toLowerCase();
  const lang = TRANSLATION_DB[targetLang] ? targetLang : 'en';
  const dict = TRANSLATION_DB[lang];

  if (query.includes('medical') || query.includes('doctor') || query.includes('nurse') || query.includes('hurt') || query.includes('faint') || query.includes('hospital') || query.includes('aid') || query.includes('médico') || query.includes('médecin')) {
    return dict.medical_station;
  }
  if (query.includes('gate') || query.includes('entrance') || query.includes('crowd') || query.includes('congestion') || query.includes('queue') || query.includes('wait') || query.includes('line') || query.includes('puerta') || query.includes('porte')) {
    return dict.gate_congestion;
  }
  if (query.includes('transit') || query.includes('bus') || query.includes('subway') || query.includes('metro') || query.includes('train') || query.includes('carpool') || query.includes('carbon') || query.includes('footprint') || query.includes('green') || query.includes('sustainable') || query.includes('eco')) {
    return dict.transit_eco;
  }
  if (query.includes('quiet') || query.includes('sensory') || query.includes('wheelchair') || query.includes('disability') || query.includes('accessible') || query.includes('deaf') || query.includes('blind') || query.includes('audio') || query.includes('calm') || query.includes('silla')) {
    return dict.quiet_zone;
  }
  if (query.includes('food') || query.includes('eat') || query.includes('concession') || query.includes('drink') || query.includes('vegan') || query.includes('halal') || query.includes('water') || query.includes('gluten') || query.includes('comida')) {
    return dict.food_options;
  }

  return dict.fallback;
}

/**
 * Parses unstructured incident logs entered by operations staff.
 */
function processIncidentReport(rawReport) {
  const cleanText = sanitizeInput(rawReport).trim();
  const text = cleanText.toLowerCase();

  let category = "Facilities";
  let severity = "Low";
  let location = "General Area";
  let assignee = "Volunteer Standby";
  let plan = "";

  if (text.includes('medical') || text.includes('hurt') || text.includes('fainted') || text.includes('bleeding') || text.includes('heart') || text.includes('injury')) {
    category = "Medical";
  } else if (text.includes('fight') || text.includes('barrier') || text.includes('barricade') || text.includes('security') || text.includes('hazard') || text.includes('danger') || text.includes('trespass')) {
    category = "Security";
  } else if (text.includes('crowd') || text.includes('bottleneck') || text.includes('jam') || text.includes('congest') || text.includes('queue') || text.includes('gate rush')) {
    category = "Crowd Control";
  } else if (text.includes('spill') || text.includes('trash') || text.includes('leak') || text.includes('broken') || text.includes('restroom lock') || text.includes('maintenance')) {
    category = "Facilities";
  }

  if (text.includes('severe') || text.includes('critical') || text.includes('emergency') || text.includes('fainted') || text.includes('fight') || text.includes('injury') || text.includes('collapse') || text.includes('danger') || text.includes('weapon')) {
    severity = "Critical";
  } else if (text.includes('crowded') || text.includes('congested') || text.includes('broken') || text.includes('leak') || text.includes('spill') || text.includes('blocked')) {
    severity = "Medium";
  }

  const gateMatch = cleanText.match(/gate\s*[a-d]/i);
  const sectionMatch = cleanText.match(/section\s*\d{3}/i);
  const concessionMatch = cleanText.match(/concession\s*[a-z]/i);

  if (gateMatch) {
    location = gateMatch[0].toUpperCase();
  } else if (sectionMatch) {
    location = sectionMatch[0].replace(/section\s*/i, 'Sec. ');
  } else if (concessionMatch) {
    location = concessionMatch[0].replace(/concession\s*/i, 'Concess. ');
  }

  const assignees = {
    "Medical": ["Paramedic Team B", "Dr. Clara Diaz (Unit 4)", "First-Aid Response 2"],
    "Security": ["Officer Jack Adams", "Security Squad Delta", "Gate Supervisor"],
    "Crowd Control": ["Volunteer Crowd-Staff A", "Gate Logistics Unit", "Section Marshal"],
    "Facilities": ["Janitorial Crew 3", "Maintenance Ops", "Volunteer Steward C"]
  };
  const list = assignees[category] || ["General Support Staff"];
  assignee = list[cleanText.length % list.length];

  if (category === "Medical") {
    plan = `1. Alert ${assignee} to dispatch immediately to ${location}. 2. Open barrier access near ${location} for emergency services. 3. Redirect surrounding crowd to minimize bottleneck.`;
  } else if (category === "Security") {
    plan = `1. Request ${assignee} approach ${location} immediately. 2. Inform central command of security breach. 3. If escalating, prepare gate containment protocols.`;
  } else if (category === "Crowd Control") {
    plan = `1. Dispatch ${assignee} to set up auxiliary queue lines at ${location}. 2. Fire AI routing advice update notification to incoming visitors. 3. Open bypass gates.`;
  } else {
    plan = `1. Signal ${assignee} to clean/repair ${location}. 2. Mark zone with caution signs. 3. Report completed tasks via local operations dashboard.`;
  }

  return { category, severity, location, plan, assignee };
}

/**
 * Calculates transit carbon footprints based on travel parameters.
 */
function calculateCarbonImpact(mode, distanceKm) {
  const parsedDistance = Math.max(0, parseFloat(distanceKm)) || 0;
  
  const emissionFactors = {
    metro: 0.02,
    bus: 0.04,
    carpool: 0.08,
    single: 0.19,
    flight: 0.25
  };

  const factor = emissionFactors[mode] || 0.15;
  const emittedCo2 = parseFloat((parsedDistance * factor).toFixed(2));
  
  let rating = "Good 🌱";
  let points = 0;

  if (mode === 'metro') {
    rating = "Excellent 🌱🌱";
    points = Math.round(parsedDistance * 2) + 15;
  } else if (mode === 'bus') {
    rating = "Great 🌱";
    points = Math.round(parsedDistance * 1.5) + 10;
  } else if (mode === 'carpool') {
    rating = "Fair 🚗";
    points = Math.round(parsedDistance * 0.5) + 5;
  } else if (mode === 'single') {
    rating = "High Impact ⚠️";
    points = 0;
  } else if (mode === 'flight') {
    rating = "Critical Impact 🚨";
    points = 0;
  }

  return {
    co2: emittedCo2,
    rating,
    points: Math.min(250, points)
  };
}

// ==========================================================================
// 3. ACCESSIBILITY SERVICES
// ==========================================================================

function initAccessibilityService() {
  const contrastBtn = document.getElementById('contrast-toggle');
  const sizeSelector = document.getElementById('font-size-selector');
  const ttsBtn = document.getElementById('tts-toggle');

  restorePreferences();

  if (contrastBtn) {
    contrastBtn.addEventListener('click', () => toggleContrastMode(contrastBtn));
  }

  if (sizeSelector) {
    sizeSelector.addEventListener('change', (e) => applyFontScale(e.target.value));
  }

  if (ttsBtn) {
    if (!('speechSynthesis' in window)) {
      ttsBtn.disabled = true;
      ttsBtn.title = "Text-to-speech is unsupported on this browser";
    } else {
      ttsBtn.addEventListener('click', () => toggleSpeechAssistance(ttsBtn));
    }
  }

  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'a') {
      announceAccessibilityStatus();
    }
  });
}

function toggleContrastMode(btn) {
  const isHighContrast = document.body.classList.toggle('high-contrast');
  btn.setAttribute('aria-pressed', isHighContrast ? 'true' : 'false');
  safeSetItem('fifa-contrast', isHighContrast ? 'active' : 'inactive');

  const announcer = document.getElementById('sr-announcer');
  if (announcer) {
    announcer.textContent = isHighContrast 
      ? "High contrast theme activated. Color scheme changed to high-visibility black, yellow, and green." 
      : "Standard theme restored. Translucent glass style activated.";
  }
}

function applyFontScale(scaleValue) {
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

function toggleSpeechAssistance(btn) {
  const isPressed = btn.getAttribute('aria-pressed') === 'true';
  const nextState = !isPressed;

  btn.setAttribute('aria-pressed', nextState ? 'true' : 'false');
  state.isTtsActive = nextState;

  if (nextState) {
    btn.classList.add('tts-active');
    btn.innerHTML = `
      <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" width="18" height="18">
        <path fill="currentColor" d="M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.85 14,18.71V20.77C18,19.86 21,16.28 21,12C21,7.72 18,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16C15.5,15.29 16.5,13.77 16.5,12M3,9V15H7L12,20V4L7,9H3Z"/>
      </svg>
      Audio Assist: On
    `;
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
    const announcer = document.getElementById('sr-announcer');
    if (announcer) announcer.textContent = "Audio assistance disabled.";
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  safeSetItem('fifa-audiott', nextState ? 'active' : 'inactive');
}

function restorePreferences() {
  const contrastPref = safeGetItem('fifa-contrast');
  const contrastBtn = document.getElementById('contrast-toggle');
  if (contrastPref === 'active' && contrastBtn) {
    document.body.classList.add('high-contrast');
    contrastBtn.setAttribute('aria-pressed', 'true');
  }

  const scalePref = safeGetItem('fifa-textscale');
  const sizeSelector = document.getElementById('font-size-selector');
  if (scalePref && sizeSelector) {
    sizeSelector.value = scalePref;
    applyFontScale(scalePref);
  }

  const ttsPref = safeGetItem('fifa-audiott');
  const ttsBtn = document.getElementById('tts-toggle');
  if (ttsPref === 'active' && ttsBtn && ('speechSynthesis' in window)) {
    toggleSpeechAssistance(ttsBtn);
  }
}

function announceAccessibilityStatus() {
  const contrast = document.body.classList.contains('high-contrast') ? "active" : "inactive";
  const size = document.getElementById('font-size-selector')?.value || "normal";
  const speech = document.getElementById('tts-toggle')?.getAttribute('aria-pressed') === 'true' ? "enabled" : "disabled";

  const announcer = document.getElementById('sr-announcer');
  if (announcer) {
    announcer.textContent = `Accessibility Profile: High contrast is ${contrast}. Text scaling is set to ${size}. Audio assist read-aloud is ${speech}. Navigate portals using tabs.`;
  }
}

// ==========================================================================
// 4. FAN COMPANION BUSINESS LOGIC
// ==========================================================================

function initFanPortal() {
  const chatForm = document.getElementById('fan-chat-form');
  const chatInput = document.getElementById('fan-chat-input');
  const quickPromptBtns = document.querySelectorAll('.quick-prompts .btn-chip');
  const greenGoalForm = document.getElementById('greengoal-form');
  const btnCalcRoute = document.getElementById('btn-calc-route');
  
  if (chatForm) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleChatSubmission();
    });
  }

  quickPromptBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const prompt = btn.getAttribute('data-prompt');
      if (prompt && chatInput) {
        chatInput.value = prompt;
        handleChatSubmission();
      }
    });
  });

  if (greenGoalForm) {
    greenGoalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleCarbonCalculation();
    });
  }

  if (btnCalcRoute) {
    btnCalcRoute.addEventListener('click', () => {
      computeStadiumRoute();
    });
  }

  const rewardDrink = document.getElementById('reward-drink');
  const rewardDiscount = document.getElementById('reward-discount');
  if (rewardDrink) rewardDrink.addEventListener('click', () => redeemReward('drink', 50));
  if (rewardDiscount) rewardDiscount.addEventListener('click', () => redeemReward('discount', 100));
}

function speakText(text) {
  if (!state.isTtsActive || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  
  const cleanMsg = text.replace(/[\uE000-\uF8FF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDDFF]/g, "");
  const utterance = new SpeechSynthesisUtterance(cleanMsg);
  utterance.rate = 1.0;
  window.speechSynthesis.speak(utterance);
}

function handleChatSubmission() {
  const chatInput = document.getElementById('fan-chat-input');
  const langSelect = document.getElementById('fan-lang-select');
  
  if (!chatInput || !langSelect) return;

  const rawMsg = chatInput.value.trim();
  if (!rawMsg) return;

  const cleanMsg = sanitizeInput(rawMsg);
  const targetLang = langSelect.value || 'en';

  appendChatBubble('user', cleanMsg);
  chatInput.value = '';

  const aiResponse = classifyIntent(cleanMsg, targetLang);
  appendChatBubbleWithTyping('bot', aiResponse);
}

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
  container.scrollTop = container.scrollHeight;
}

function appendChatBubbleWithTyping(sender, fullText) {
  const container = document.getElementById('fan-chat-messages');
  if (!container) return;

  const msgDiv = document.createElement('div');
  msgDiv.className = `chat-msg ${sender}`;
  
  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  bubble.textContent = '';
  
  msgDiv.appendChild(bubble);
  container.appendChild(msgDiv);

  speakText(fullText);

  const announcer = document.getElementById('sr-announcer');
  if (announcer) {
    announcer.textContent = `New AI message: ${fullText}`;
  }

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
  }, 40);
}

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

  co2Val.textContent = `${res.co2} kg CO₂`;
  ratingVal.textContent = res.rating;
  
  state.greenPoints += res.points;
  pointsVal.textContent = `${state.greenPoints} pts`;

  const announcer = document.getElementById('sr-announcer');
  if (announcer) {
    announcer.textContent = `Carbon footprint calculated: ${res.co2} kilograms. AI sustainability score rating is: ${res.rating}. You earned ${res.points} Green Points! Total points balance: ${state.greenPoints} points.`;
  }

  resultsDiv.classList.remove('hidden');
  updateRedemptionButtons();
}

function updateRedemptionButtons() {
  const rewardDrink = document.getElementById('reward-drink');
  const rewardDiscount = document.getElementById('reward-discount');

  if (rewardDrink) rewardDrink.disabled = state.greenPoints < 50;
  if (rewardDiscount) rewardDiscount.disabled = state.greenPoints < 100;
}

function redeemReward(rewardType, cost) {
  const statusMsg = document.getElementById('reward-status');
  const pointsVal = document.getElementById('gg-points-val');

  if (!statusMsg || !pointsVal) return;

  if (state.greenPoints < cost) {
    statusMsg.style.color = 'var(--red-color)';
    statusMsg.textContent = "Error: Insufficient Green Points balance.";
    return;
  }

  state.greenPoints -= cost;
  pointsVal.textContent = `${state.greenPoints} pts`;
  updateRedemptionButtons();

  const couponCode = `FIFA-GREEN-${rewardType.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
  
  statusMsg.style.color = 'var(--accent-color)';
  statusMsg.textContent = `Successfully Redeemed! Code: ${couponCode}. Show to concession staff.`;

  const announcer = document.getElementById('sr-announcer');
  if (announcer) {
    announcer.textContent = `Reward claimed successfully. Your unique coupon code is ${couponCode}. Points remaining: ${state.greenPoints}.`;
  }
}

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

  const routeD = `M ${startPt.x} ${startPt.y} Q 200 200 ${endPt.x} ${endPt.y}`;
  
  pathLine.setAttribute('d', routeD);
  pathLine.classList.remove('hidden');

  // Reset previously scaled node sizes
  document.querySelectorAll('.map-node').forEach(node => {
    node.style.r = "";
  });
  
  const startLetter = startName.split(' ')[1];
  const gateNode = document.getElementById(`map-gate-${startLetter}`);
  
  let targetNodeId = '';
  if (endName.includes('104')) targetNodeId = 'map-sec-104';
  else if (endName.includes('North') || endName.includes('Medical')) targetNodeId = 'map-med-north';
  else if (endName.includes('Hub B') || endName.includes('Concessions B')) targetNodeId = 'map-con-B';
  else if (endName.includes('Quiet')) targetNodeId = 'map-quiet-1';

  const destNode = document.getElementById(targetNodeId);
  if (gateNode) gateNode.style.r = "15px";
  if (destNode) destNode.style.r = "12px";

  routeSummary.textContent = `🤖 Navigation generated from ${startName} to ${endName}:`;
  
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

  const announcer = document.getElementById('sr-announcer');
  if (announcer) {
    announcer.textContent = `Routing path computed. Path starts at ${startName} and finishes at ${endName}. Check the step by step directives under the map section.`;
  }

  directionsBox.classList.remove('hidden');
}

// ==========================================================================
// 5. STAFF OPERATIONS BUSINESS LOGIC
// ==========================================================================

function initStaffPortal() {
  const incidentForm = document.getElementById('incident-form');
  const simRushBtn = document.getElementById('sim-rush-gateC');
  const simResetBtn = document.getElementById('sim-reset-crowds');
  const btnReroute = document.getElementById('btn-trigger-rerouting');

  if (incidentForm) {
    incidentForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleIncidentReporting();
    });
  }

  if (simRushBtn) {
    simRushBtn.addEventListener('click', () => simulateRushGateC());
  }

  if (simResetBtn) {
    simResetBtn.addEventListener('click', () => resetCrowds());
  }

  if (btnReroute) {
    btnReroute.addEventListener('click', () => triggerAIRerouting());
  }

  renderInitialIncidents();
  updateCrowdProgressMeters();
}

function renderInitialIncidents() {
  const tbody = document.getElementById('incidents-tbody');
  if (!tbody) return;

  tbody.innerHTML = '';
  initialIncidents.forEach(inc => {
    appendIncidentRow(inc);
  });
}

function handleIncidentReporting() {
  const rawTextArea = document.getElementById('incident-raw-text');
  const outputBox = document.getElementById('dispatch-output');
  
  if (!rawTextArea || !outputBox) return;

  const rawText = rawTextArea.value.trim();
  if (!rawText) {
    alert("Please enter incident details first.");
    return;
  }

  const cleanInput = sanitizeInput(rawText);
  const analysis = processIncidentReport(cleanInput);

  document.getElementById('ai-disp-class').textContent = analysis.category;
  document.getElementById('ai-disp-severity').textContent = analysis.severity;
  document.getElementById('ai-disp-loc').textContent = analysis.location;
  document.getElementById('ai-disp-assignee').textContent = analysis.assignee;
  document.getElementById('ai-disp-action').textContent = analysis.plan;

  const severityBadge = document.getElementById('ai-disp-severity');
  severityBadge.className = 'd-val';
  if (analysis.severity === 'Critical') severityBadge.style.color = 'var(--red-color)';
  else if (analysis.severity === 'Medium') severityBadge.style.color = 'var(--gold-color)';
  else severityBadge.style.color = 'var(--primary-color)';

  outputBox.classList.remove('hidden');

  const newInc = {
    id: state.incidentCounter++,
    location: analysis.location,
    category: analysis.category,
    severity: analysis.severity,
    assignee: analysis.assignee,
    status: "Dispatched"
  };

  appendIncidentRow(newInc);
  rawTextArea.value = '';

  const announcer = document.getElementById('sr-announcer');
  if (announcer) {
    announcer.textContent = `New incident logged. Class: ${analysis.category}, Location: ${analysis.location}, Assigned volunteer: ${analysis.assignee}. Action plan generated successfully.`;
  }
}

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

  tbody.insertBefore(tr, tbody.firstChild);
}

function resolveIncident(id, statusCell, resolveBtn) {
  statusCell.textContent = 'Resolved';
  statusCell.style.color = 'var(--accent-color)';
  statusCell.style.fontWeight = 'bold';
  resolveBtn.disabled = true;

  const row = document.getElementById(`inc-row-${id}`);
  if (row) {
    row.style.opacity = '0.65';
  }

  const announcer = document.getElementById('sr-announcer');
  if (announcer) {
    announcer.textContent = `Incident #${id} has been resolved successfully.`;
  }
}

function updateCrowdProgressMeters() {
  ['A', 'B', 'C', 'D'].forEach(letter => {
    const statsSpan = document.getElementById(`gate-${letter}-stats`);
    const progressDiv = document.getElementById(`gate-${letter}-progress`);
    const svgSensorNode = document.getElementById(`map-gate-${letter}`);
    
    if (!statsSpan || !progressDiv) return;

    const data = state.gateState[letter];
    
    statsSpan.textContent = `${data.load}% capacity (${data.wait}m wait)`;
    
    progressDiv.style.width = `${data.load}%`;
    progressDiv.className = 'progress-bar';
    
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

    if (svgSensorNode) {
      svgSensorNode.setAttribute('class', sensorClass);
    }
  });
}

function simulateRushGateC() {
  state.gateState["C"].load = 98;
  state.gateState["C"].wait = 50;

  updateCrowdProgressMeters();

  const announcer = document.getElementById('sr-announcer');
  if (announcer) {
    announcer.textContent = "System Alert: Gate C congestion has spiked to critical capacity! Wait times are currently 50 minutes. AI recommending immediate traffic redirection.";
  }
}

function resetCrowds() {
  state.gateState["A"] = { load: 15, wait: 2 };
  state.gateState["B"] = { load: 60, wait: 15 };
  state.gateState["C"] = { load: 22, wait: 4 };
  state.gateState["D"] = { load: 25, wait: 4 };

  updateCrowdProgressMeters();

  const announcer = document.getElementById('sr-announcer');
  if (announcer) {
    announcer.textContent = "Crowd metrics reset to default stadium operations baseline values.";
  }
}

function triggerAIRerouting() {
  if (state.gateState["C"].load < 40) {
    alert("Gate balance normal. Rerouting is only required when gate queues spike.");
    return;
  }

  state.gateState["C"].load = 45;
  state.gateState["C"].wait = 18;

  state.gateState["A"].load += 15;
  state.gateState["A"].wait += 5;

  state.gateState["D"].load += 20;
  state.gateState["D"].wait += 6;

  updateCrowdProgressMeters();

  const announcer = document.getElementById('sr-announcer');
  if (announcer) {
    announcer.textContent = "AI Redirection alert broadcasting to incoming ticket-holders. Crowd load balanced successfully: Gate C wait decreased. Gates A and D absorbing redirected traffic.";
  }

  alert("🤖 FIFA AI Balancer: Alert dispatched! Incoming fans redirected to Gates A & D. Gate C congestion resolved.");
}

// ==========================================================================
// 6. MAIN APPLICATION ORCHESTRATION & INITIALIZER
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  try {
    initAccessibilityService();
    initFanPortal();
    initStaffPortal();
    initTabNavigation();
  } catch (error) {
    console.error("Critical failure during App boot checklist:", error);
    const announcer = document.getElementById('sr-announcer');
    if (announcer) {
      announcer.textContent = "Application failed to load completely. Please reload the webpage.";
    }
  }
});

function initTabNavigation() {
  const tabs = document.querySelectorAll('.nav-tab');
  const tabList = document.querySelector('.nav-tabs');

  if (!tabs.length || !tabList) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      activateTab(tab);
    });

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

function activateTab(activeTabBtn) {
  const tabs = document.querySelectorAll('.nav-tab');
  const panels = document.querySelectorAll('.view-panel');

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

// Local storage protection helpers
function safeSetItem(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (e) {}
}

function safeGetItem(key) {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    return null;
  }
}
