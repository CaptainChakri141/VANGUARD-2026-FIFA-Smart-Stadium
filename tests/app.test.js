/**
 * ==========================================================================
 * FIFA World Cup 2026 Smart Stadium Companion - Test Suite
 * Executed via: npm test (or node tests/app.test.js)
 * Focuses on: Zero dependencies, fast verification, and edge-case coverage.
 * ==========================================================================
 */

import assert from 'assert';
import { 
  sanitizeInput, 
  classifyIntent, 
  processIncidentReport, 
  calculateCarbonImpact 
} from '../modules/ai-engine.js';

console.log("--------------------------------------------------");
console.log("🏃 Running FIFA Stadium Companion Automated Tests...");
console.log("--------------------------------------------------");

let testsPassed = 0;
let totalTests = 0;

function runTest(description, fn) {
  totalTests++;
  try {
    fn();
    console.log(`✅ PASS: ${description}`);
    testsPassed++;
  } catch (error) {
    console.error(`❌ FAIL: ${description}`);
    console.error(error);
  }
}

// ==========================================================
// 1. INPUT SANITIZATION TESTS (XSS Prevention)
// ==========================================================
runTest("sanitizeInput - escapes HTML tags", () => {
  const dangerous = "<script>alert('hack')</script>";
  const expected = "&lt;script&gt;alert(&#x27;hack&#x27;)&lt;&#x2F;script&gt;";
  assert.strictEqual(sanitizeInput(dangerous), expected);
});

runTest("sanitizeInput - handles non-string inputs gracefully", () => {
  assert.strictEqual(sanitizeInput(null), '');
  assert.strictEqual(sanitizeInput(undefined), '');
  assert.strictEqual(sanitizeInput(123), '');
});


// ==========================================================
// 2. INTENT CLASSIFICATION & TRANSLATION TESTS
// ==========================================================
runTest("classifyIntent - classifies medical requests in English", () => {
  const query = "I need a doctor, my leg hurts near Section 100";
  const result = classifyIntent(query, 'en');
  assert.ok(result.includes("medical station"));
  assert.ok(result.includes("Section 104"));
});

runTest("classifyIntent - classifies quiet rooms in Spanish", () => {
  const query = "Is there a quiet sensory room?";
  const result = classifyIntent(query, 'es');
  // Should return Spanish quiet room description
  assert.ok(result.includes("sensoriales"));
  assert.ok(result.includes("Sector 120"));
});

runTest("classifyIntent - falls back correctly for unknown terms", () => {
  const query = "What is the score of the match?";
  const result = classifyIntent(query, 'en');
  assert.ok(result.includes("concierge") || result.includes("inquiry"));
});


// ==========================================================
// 3. UNSTRUCTURED INCIDENT PARSING (AI Dispatch) TESTS
// ==========================================================
runTest("processIncidentReport - extracts security incidents", () => {
  const rawText = "There is a fight and security hazard at Gate C";
  const analysis = processIncidentReport(rawText);
  
  assert.strictEqual(analysis.category, "Security");
  assert.strictEqual(analysis.severity, "Critical");
  assert.strictEqual(analysis.location, "GATE C");
  assert.ok(analysis.plan.includes("security breach"));
  assert.ok(analysis.assignee);
});

runTest("processIncidentReport - extracts medical incidents and sections", () => {
  const rawText = "Medical emergency: fan has fainted at Section 104";
  const analysis = processIncidentReport(rawText);
  
  assert.strictEqual(analysis.category, "Medical");
  assert.strictEqual(analysis.severity, "Critical");
  assert.strictEqual(analysis.location, "Sec. 104");
  assert.ok(analysis.plan.includes("dispatch"));
});

runTest("processIncidentReport - falls back for empty details", () => {
  const analysis = processIncidentReport("");
  assert.strictEqual(analysis.category, "Facilities");
  assert.strictEqual(analysis.severity, "Low");
  assert.strictEqual(analysis.location, "General Area");
});


// ==========================================================
// 4. CARBON FOOTPRINT & POINTS REWARDS CALCULATIONS
// ==========================================================
runTest("calculateCarbonImpact - metro calculations are high reward, low carbon", () => {
  const metroImpact = calculateCarbonImpact("metro", 20); // 20 km on subway
  
  assert.strictEqual(metroImpact.co2, 0.4); // 20 * 0.02 = 0.4 kg
  assert.ok(metroImpact.rating.includes("Excellent"));
  assert.strictEqual(metroImpact.points, 55); // Math.round(20 * 2) + 15 = 55
});

runTest("calculateCarbonImpact - petrol car calculations have zero rewards, high carbon", () => {
  const carImpact = calculateCarbonImpact("single", 20); // 20 km driving alone
  
  assert.strictEqual(carImpact.co2, 3.8); // 20 * 0.19 = 3.8 kg
  assert.ok(carImpact.rating.includes("High Impact"));
  assert.strictEqual(carImpact.points, 0); // 0 points for single petrol car
});


// ==========================================================
// 5. INPUT LENGTH LIMITATION & DOS PREVENTION TESTS
// ==========================================================
runTest("sanitizeInput - truncates inputs exceeding 500 characters", () => {
  const hugeInput = "a".repeat(1000);
  const result = sanitizeInput(hugeInput);
  assert.strictEqual(result.length, 500);
});

// ==========================================================
// 6. CARBON CALCULATOR DISTANCE BOUNDARY TESTS
// ==========================================================
runTest("calculateCarbonImpact - handles negative values by resetting to 0", () => {
  const result = calculateCarbonImpact("metro", -50);
  assert.strictEqual(result.co2, 0);
  assert.strictEqual(result.points, 15); // Metro base points is 15
});

runTest("calculateCarbonImpact - caps maximum reward points to 250", () => {
  const result = calculateCarbonImpact("metro", 5000);
  assert.strictEqual(result.points, 250);
});

// ==========================================================
// 7. PATH TRAVERSAL DEFENSE HEURISTICS
// ==========================================================
runTest("pathTraversalDefense - blocks directory traversal attacks", () => {
  const PUBLIC_DIR = "c:\\users\\capta\\downloads\\fifa";
  const pathSep = "\\";
  
  // Test helper replicating path.resolve(path.join(PUBLIC_DIR, safeUrl)) behavior
  const checkSafePath = (safeUrl) => {
    let rawPath = PUBLIC_DIR + safeUrl.replace(/\//g, pathSep);
    
    // Normalize relative segments like \..\
    while (rawPath.includes(pathSep + '..' + pathSep) || rawPath.includes(pathSep + '..')) {
      const idx = rawPath.indexOf(pathSep + '..');
      if (idx === -1) break;
      const before = rawPath.substring(0, idx);
      const after = rawPath.substring(idx + 3);
      const lastSep = before.lastIndexOf(pathSep);
      if (lastSep === -1) {
        rawPath = after;
      } else {
        rawPath = before.substring(0, lastSep) + (after.startsWith(pathSep) ? '' : pathSep) + after;
      }
    }
    
    return rawPath === PUBLIC_DIR || rawPath.startsWith(PUBLIC_DIR + pathSep);
  };

  assert.ok(checkSafePath("/index.html"));
  assert.ok(checkSafePath("/modules/accessibility.js"));
  assert.ok(!checkSafePath("/../package.json"));
  assert.ok(!checkSafePath("/../fifa-secrets/db.json"));
});


// ==========================================================
// 8. GERMAN TRANSLATION SUPPORT TESTS
// ==========================================================
runTest("classifyIntent - classifies food options in German", () => {
  const query = "Ich habe Hunger und möchte etwas veganes essen";
  const result = classifyIntent(query, 'de');
  assert.ok(result.includes("Food-Hub B") || result.includes("vegane"));
});

runTest("classifyIntent - falls back correctly for unknown German query", () => {
  const query = "Wie spät ist es?";
  const result = classifyIntent(query, 'de');
  assert.ok(result.includes("KI-Concierge") || result.includes("Fan-Service"));
});

// ==========================================================
// 9. REWARD CARBON SAVINGS & CHATBOT DYNAMIC GATE DIRECTIONS
// ==========================================================
runTest("calculateCarbonImpact - correctly calculates carbon offset/savings", () => {
  const result = calculateCarbonImpact("metro", 100);
  assert.strictEqual(result.saved, 17); // (0.19 - 0.02) * 100 = 17
});

runTest("classifyIntent - appends gate-specific directions for Gate A", () => {
  const query = "Where is the nearest medical station from Gate A?";
  const result = classifyIntent(query, 'en');
  assert.ok(result.includes("short 1-minute walk along the North main corridor"));
});

runTest("classifyIntent - appends gate-specific directions for Gate B in German", () => {
  const query = "Wo ist die Sanitätsstation bei Tor B?";
  const result = classifyIntent(query, 'de');
  assert.ok(result.includes("nördlichen Korridors (ca. 3 Minuten zu Fuß)"));
});


// ==========================================================
// RESULTS SUMMARY
// ==========================================================
console.log("--------------------------------------------------");
console.log(`🏁 Test run completed: ${testsPassed} / ${totalTests} assertions passed.`);
console.log("--------------------------------------------------");

if (testsPassed === totalTests) {
  console.log("✨ All tests passed successfully!");
  process.exit(0);
} else {
  console.error("⚠️ Some tests failed. Please review details.");
  process.exit(1);
}
