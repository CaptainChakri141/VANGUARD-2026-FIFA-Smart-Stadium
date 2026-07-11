# 🏆 FIFA World Cup 2026 - Smart Stadium Command & Fan Companion

### 🔗 Live Demo: [VANGUARD 2026 FIFA Smart Stadium](https://captainchakri141.github.io/VANGUARD-2026-FIFA-Smart-Stadium/)

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://html.spec.whatwg.org/)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://www.w3.org/Style/CSS/)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![WCAG 2.1 AA](https://img.shields.io/badge/WCAG%202.1-AA%20Compliant-blue?style=for-the-badge)](https://www.w3.org/WAI/standards-guidelines/wcag/)

Welcome to the **FIFA World Cup 2026 Smart Stadium Companion & Operations Command** web application. Designed for the MetLife host venue, this premium, client-side application utilizes simulated Generative AI to optimize stadium navigation, streamline incident reporting, calculate carbon footprint sustainability, and manage gate density load-balancing.

---

## 🌟 Key Features

### 1. Fan Experience Portal
*   🤖 **AI Multilingual Concierge**: Ask stadium directions or ticketing questions in English, Spanish, French, Portuguese, Arabic, or Japanese. Features dynamic typing streams and integrated Text-to-Speech audio support.
*   🗺️ **Dynamic Crowd-Aware Routing**: Select your starting gate and destination to view live, interactive pathfinding overlaid directly onto an SVG stadium layout.
*   🌱 **GreenGoal Carbon Calculator**: Log your distance and mode of travel to calculate carbon impact, receive rating telemetry, and redeem dynamic green rewards.

### 2. Operations Command Center (Staff & Organizers)
*   🚨 **Incident Analyzer & Auto-Dispatcher**: Enter raw, unstructured speech-to-text logs. The simulated AI instantly extracts categories, rates severity (Low, Medium, Critical), determines the location, selects response staff, and draft protocols.
*   📊 **Crowd Density Balancer**: Monitor live incoming queue metrics across Gates A, B, C, and D. Simulate gate rushes and trigger AI redirect notifications to balance the crowd load.
*   🔋 **Telemetry & telemetry logs**: Track kinetic floor arrays, waste diversion metrics, and mobility shuttle telemetry.

### 3. Accessible Layout
*   ♿ **WCAG 2.1 AA Compliance**: Complete semantic structures, high-contrast outlines, screen reader live announcement notifications (`#sr-announcer`), keyboard arrow navigations for tabs, and root-level font size scaling.

---

## 📂 Project Architecture

```bash
├── index.html            # Main markup portal, navigation, SVG layout, and forms
├── styles.css            # Premium glassmorphic styling system & responsive layout variables
├── app.js                # Core app bootstrapper and tab navigations
├── server.js             # Zero-dependency local dev server
├── modules/
│   ├── ai-engine.js      # Natural Language Processing & carbon calculations algorithms
│   ├── accessibility.js  # Text-to-speech, high contrast themes, and root font scaling
│   ├── fan-portal.js     # Chatbot dialogs, SVG routing, and points redemption
│   └── staff-portal.js   # Incident queues, simulation triggers, and progress meters
└── tests/
    └── app.test.js       # Fast, zero-dependency unit test suite
```

---

## 🛠️ Installation & Usage

### Running Locally
To launch the zero-dependency dev server:
1. Ensure Node.js is installed on your system.
2. In the project directory, run:
   ```bash
   node server.js
   ```
3. Open your browser and navigate to: [http://localhost:8080](http://localhost:8080)

### Running the Test Suite
To run the automated tests verifying sanitization, intent classification, and carbon algorithms:
```bash
node tests/app.test.js
```

---

## 🧩 Technology Specs
| Tech Layer | Focus Area | Features |
| :--- | :--- | :--- |
| **Vanilla JS** | Client Execution | ES Modules, Custom Event Handlers, LocalStorage caching |
| **SVG** | Stadium Layout | Coordinate routing, color sensors, accessibility scaling |
| **CSS3** | Aesthetics | Custom theme tokens, Glassmorphism, CSS grid/flexbox, keyframes |
| **HTML5** | Access & SEO | ARIA roles, live regions, WCAG compliance elements |
| **Node.js** | Infrastructure | Zero-dependency Server & custom assert-based testing suite |
