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
