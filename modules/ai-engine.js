/**
 * ==========================================================================
 * FIFA World Cup 2026 Simulated Generative AI Engine
 * Focuses on: Modular structures, security input sanitization, and type checking.
 * ==========================================================================
 */

/**
 * Sanitizes input text to prevent Cross-Site Scripting (XSS) and injection vulnerabilities.
 * @param {string} input - Raw user input.
 * @returns {string} Sanitized string.
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  // Truncate length to prevent Denial of Service (DoS) via CPU exhaustion from large inputs
  const truncated = input.slice(0, 500);
  return truncated
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Predefined multi-lingual translation dictionary for GenAI simulated responses
 */
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
 * Classifies fan queries and returns dynamic AI-like responses.
 * Supports multi-language translation outputs.
 * @param {string} text - Cleaned user message.
 * @param {string} targetLang - Two-letter language code ('en', 'es', 'fr', 'pt', 'ar', 'ja').
 * @returns {string} Simulated GenAI response.
 */
export function classifyIntent(text, targetLang = 'en') {
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

  // Default fallback response
  return dict.fallback;
}

/**
 * Natural language processing parser for operations incidents.
 * @typedef {Object} IncidentAnalysis
 * @property {string} category - Incident type category
 * @property {string} severity - Rating: Low, Medium, Critical
 * @property {string} location - Extracted physical stadium location
 * @property {string} plan - suggested action plan
 * @property {string} assignee - Assigned volunteer or staff
 * 
 * @param {string} rawReport - Freeform text input from staff
 * @returns {IncidentAnalysis}
 */
export function processIncidentReport(rawReport) {
  const cleanText = sanitizeInput(rawReport).trim();
  const text = cleanText.toLowerCase();

  let category = "Facilities";
  let severity = "Low";
  let location = "General Area";
  let assignee = "Volunteer Standby";
  let plan = "";

  // 1. Categorization NLP Rules
  if (text.includes('medical') || text.includes('hurt') || text.includes('fainted') || text.includes('bleeding') || text.includes('heart') || text.includes('injury')) {
    category = "Medical";
  } else if (text.includes('fight') || text.includes('barrier') || text.includes('barricade') || text.includes('security') || text.includes('hazard') || text.includes('danger') || text.includes('trespass')) {
    category = "Security";
  } else if (text.includes('crowd') || text.includes('bottleneck') || text.includes('jam') || text.includes('congest') || text.includes('queue') || text.includes('gate rush')) {
    category = "Crowd Control";
  } else if (text.includes('spill') || text.includes('trash') || text.includes('leak') || text.includes('broken') || text.includes('restroom lock') || text.includes('maintenance')) {
    category = "Facilities";
  }

  // 2. Severity evaluation rules
  if (text.includes('severe') || text.includes('critical') || text.includes('emergency') || text.includes('fainted') || text.includes('fight') || text.includes('injury') || text.includes('collapse') || text.includes('danger') || text.includes('weapon')) {
    severity = "Critical";
  } else if (text.includes('crowded') || text.includes('congested') || text.includes('broken') || text.includes('leak') || text.includes('spill') || text.includes('blocked')) {
    severity = "Medium";
  }

  // 3. Location extraction rules
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

  // 4. Assignee dispatch logic based on Category
  const assignees = {
    "Medical": ["Paramedic Team B", "Dr. Clara Diaz (Unit 4)", "First-Aid Response 2"],
    "Security": ["Officer Jack Adams", "Security Squad Delta", "Gate Supervisor"],
    "Crowd Control": ["Volunteer Crowd-Staff A", "Gate Logistics Unit", "Section Marshal"],
    "Facilities": ["Janitorial Crew 3", "Maintenance Ops", "Volunteer Steward C"]
  };
  const list = assignees[category] || ["General Support Staff"];
  // Deterministic selector based on text length to simulate a smart routing assignment
  assignee = list[cleanText.length % list.length];

  // 5. Generate action plan
  if (category === "Medical") {
    plan = `1. Alert ${assignee} to dispatch immediately to ${location}. 2. Open barrier access near ${location} for emergency services. 3. Redirect surrounding crowd to minimize bottleneck.`;
  } else if (category === "Security") {
    plan = `1. Request ${assignee} approach ${location} immediately. 2. Inform central command of security breach. 3. If escalating, prepare gate containment protocols.`;
  } else if (category === "Crowd Control") {
    plan = `1. Dispatch ${assignee} to set up auxiliary queue lines at ${location}. 2. Fire AI routing advice update notification to incoming visitors. 3. Open bypass gates.`;
  } else {
    // Facilities
    plan = `1. Signal ${assignee} to clean/repair ${location}. 2. Mark zone with caution signs. 3. Report completed tasks via local operations dashboard.`;
  }

  return {
    category,
    severity,
    location,
    plan,
    assignee
  };
}

/**
 * Calculates transit carbon footprints based on travel parameters.
 * @param {string} mode - Mode of travel.
 * @param {number} distanceKm - Travel distance in kilometers.
 * @returns {Object} Metric output including CO2 emitted and offset points.
 */
export function calculateCarbonImpact(mode, distanceKm) {
  const parsedDistance = Math.max(0, parseFloat(distanceKm)) || 0;
  
  // CO2 Emitted in kg per kilometer
  const emissionFactors = {
    metro: 0.02,     // Electric subway
    bus: 0.04,       // Electric BRT
    carpool: 0.08,   // Petrol car shared
    single: 0.19,    // Petrol car single occupancy
    flight: 0.25     // Jet flight
  };

  const factor = emissionFactors[mode] || 0.15;
  const emittedCo2 = parseFloat((parsedDistance * factor).toFixed(2));
  
  // Calculate Points (inverse relationship: lower carbon + longer transit = more reward points)
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
    points: Math.min(250, points) // Cap points at 250 per transaction
  };
}
