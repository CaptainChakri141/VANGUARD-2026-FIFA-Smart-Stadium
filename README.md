# FIFA World Cup 2026 - Smart Stadium Companion & Operations Command

Welcome to the **FIFA World Cup 2026 Smart Stadium Companion & Operations Command** web application. This application enhances stadium operations and the overall tournament experience for fans, organizers, volunteers, and venue staff by leveraging a client-side simulated Generative AI engine.

## 🚀 Key Features

### 1. Fan Experience Portal
*   🤖 **AI Multilingual Stadium Companion**: An interactive, conversational interface that answers fans' questions in multiple languages (English, Spanish, French, Arabic, German, Japanese) with built-in text-to-speech reading support.
*   🗺️ **Interactive Gate & Transit Pathfinding**: A dynamic stadium floorplan rendering displaying wait times at Gates and routing directions optimized for low density.
*   🌱 **GreenGoal Transit & Carbon Tracker**: Calculates carbon footprints based on travel modes and rewards fans with "Green Points" for stadium rewards.

### 2. Operations Command Center (Staff & Organizers)
*   🚨 **AI-Powered Incident Dispatch**: A smart text analysis module that parses free-text incidents (e.g., *"Medical issue: fan fainted near Section 104"* or *"Water spill near Concession Stand B"*), categorizes them, rates severity, and generates an actionable response plan.
*   📊 **Crowd Density & Gate Balance Control**: Visual indicators representing queue levels, allowing coordinators to trigger load-balancing rerouting alerts.

### 3. Accessibility & Inclusivity Features
*   ♿ **Full WCAG Accessibility**: Complete semantic HTML5 layouts, robust keyboard navigation support (`Tab`/`Shift+Tab` focus outlines), dark/high-contrast mode toggles, font size adjustment, and ARIA labels.

---

## 🛠️ Tech Stack & Structure

*   **Core Logic**: Vanilla JavaScript (ES Modules)
*   **Design System**: Custom CSS variables, responsive Grid/Flex layout, and glassmorphism styling
*   **Testing**: Custom, zero-dependency Node.js test suite for lightning-fast regression checks

---

## 💻 Getting Started

To run the application locally:
1. Double-click or open `index.html` directly in any web browser.
2. Alternatively, run a local web server in this directory:
   ```bash
   npx local-server
   ```

### Running Tests
To execute the automated unit testing suite:
```bash
npm test
```
