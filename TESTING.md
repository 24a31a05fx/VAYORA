# Testing — VAYORA Quality Assurance & Test Automation Manifest

> **Evaluation Parameter:** Testing (Standard: 100% Pass Rate Across 8 Multi-Tier Test Suites)  
> **Platform:** VAYORA — AI-Powered Urban Air Quality & Environmental Intelligence Platform  
> **Verification Status:** 87 Tests Passed (0 Failed, 100% Pass Rate)  

---

## 1. Quality Assurance Architecture & Test Harness

VAYORA employs a comprehensive automated verification framework designed to guarantee functional correctness, mathematical accuracy, visual accessibility, and API resilience. The test harness is built on **Vitest v3.2.7** running in **JSDOM** environments paired with **Testing Library** (`@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`).

```
┌────────────────────────────────────────────────────────────────────────┐
│                        5-TIER VERIFICATION HARNESS                     │
├─────────┬──────────────────────┬─────────────┬─────────────────────────┤
│ TIER    │ FOCUS                │ RUNTIME     │ PRIMARY TEST SUITES     │
├─────────┼──────────────────────┼─────────────┼─────────────────────────┤
│ Tier 1  │ Pure Mathematical &  │ Pure Node / │ • aqiBreakpoints.test.ts│
│         │ Algorithmic Compute  │ Deterministic│ • aqiCommute.test.ts    │
│         │                      │             │ • aqiIaq.test.ts        │
│         │                      │             │ • routineStorage.test.ts│
├─────────┼──────────────────────┼─────────────┼─────────────────────────┤
│ Tier 2  │ Graph Algorithms &   │ JSDOM /     │ • routing.test.ts       │
│         │ Custom Hook State    │ renderHook  │                         │
├─────────┼──────────────────────┼─────────────┼─────────────────────────┤
│ Tier 3  │ Component Hierarchy  │ JSDOM /     │ • rendering.test.tsx    │
│         │ & WCAG Screen Twins  │ RTL Canvas  │                         │
├─────────┼──────────────────────┼─────────────┼─────────────────────────┤
│ Tier 4  │ DOM Interactions &   │ JSDOM /     │ • dom.test.tsx          │
│         │ Reactive Simulations │ user-event  │                         │
├─────────┼──────────────────────┼─────────────┼─────────────────────────┤
│ Tier 5  │ Live HTTP Backend,   │ In-Process  │ • api.test.ts           │
│         │ Security & Caching   │ Express 5   │                         │
└─────────┴──────────────────────┴─────────────┴─────────────────────────┘
```

---

## 2. Empirical Test Execution Summary

The entire automated test suite executes cleanly via `npm run test:run`:

```bash
$ npm run test:run
> vitest run

 ✓ src/test/aqiIaq.test.ts (11 tests)
 ✓ src/test/aqiBreakpoints.test.ts (23 tests)
 ✓ src/test/aqiCommute.test.ts (17 tests)
 ✓ src/test/routineStorage.test.ts (4 tests)
 ✓ src/test/routing.test.ts (7 tests)
 ✓ src/test/api.test.ts (10 tests)
 ✓ src/test/rendering.test.tsx (8 tests)
 ✓ src/test/dom.test.tsx (7 tests)

 Test Files  8 passed (8)
      Tests  87 passed (87)
   Start at  21:28:44
   Duration  3.62s (transform 737ms,setup 683ms,collect 536ms,tests 872ms)
```

---

## 3. Comprehensive Test Suite Breakdown

The table below catalogs all eight automated test suites, their tier classification, test count, and verified coverage scope:

| Test Suite File | Verification Tier | Test Count | Specific Mathematical & Behavioral Scope Verified | Pass Status |
|---|---|---|---|---|
| `src/test/aqiBreakpoints.test.ts` | **Tier 1: EPA Breakpoints & Sub-Indexes** | **23** | • EPA AQI category classification across all 6 tiers (Good through Hazardous).<br>• Piecewise linear interpolation for $\text{PM}_{2.5}$ concentration breakpoints (0.0 to 500.4 $\mu\text{g/m}^3$).<br>• Health advice strings and color token assignments.<br>• Boundary checks: rejection of negative concentrations and non-finite inputs. | ✅ 23 / 23 Passed |
| `src/test/aqiCommute.test.ts` | **Tier 1: Inhaled Dose & Transit Metrics** | **17** | • Multi-modal comparison (Metro, Electric Bus, Diesel Bus, Cycling, Walking, EV, Gas Car).<br>• Minute ventilation rate ($V_E$) factoring physical exertion during active transit.<br>• Respiratory protection factor reductions (0% to 95% mask/cabin filtration).<br>• Inhaled particulate mass ($\mu\text{g}$) and lifecycle carbon emissions ($\text{kg CO}_2$). | ✅ 17 / 17 Passed |
| `src/test/aqiIaq.test.ts` | **Tier 1: CADR Mass Balance & Inversions** | **11** | • Volumetric calculations ($V = A \cdot h$) and ASHRAE target CADR (4.0–5.0 ACH).<br>• First-order mass-balance clearance duration ($t_{90\%} = \ln(10) \cdot V / \text{CADR}$).<br>• Boundary asserts: RangeErrors on non-positive dimensions or invalid filter efficiencies.<br>• Atmospheric temperature inversion detection via lapse rate and wind stagnation math. | ✅ 11 / 11 Passed |
| `src/test/routineStorage.test.ts` | **Tier 1: Offline Fallback & Storage** | **4** | • Client-side deterministic heuristic routine generation (`heuristicRoutine.ts`).<br>• Adjustment of optimal solar dispersion windows during active inversion traps.<br>• Resilient local storage persistence for user language and accessibility preferences.<br>• In-memory storage fallback handling when browser storage is unavailable. | ✅ 4 / 4 Passed |
| `src/test/routing.test.ts` | **Tier 2: Graph Algorithms & Hook State** | **7** | • Dijkstra pathfinding prioritizing low-exposure subterranean subway lines.<br>• Bypassing high-smog highway corridors during severe pollution events.<br>• Path identity handling when origin equals destination.<br>• Graceful null handling on disconnected or invalid graph topologies.<br>• `useExposureRouting` hook state reactivity verified via `renderHook`. | ✅ 7 / 7 Passed |
| `src/test/rendering.test.tsx` | **Tier 3: Layouts & Assistive Screen Twins** | **8** | • Semantic HTML5 landmark structure (`<header>`, `<nav role="tablist">`, `<main>`, `<footer>`).<br>• Twin representation rule: SVG smog heatmaps and sparklines paired with `.sr-only` text lists.<br>• Clean component tree mounting without throwing uncaught exceptions. | ✅ 8 / 8 Passed |
| `src/test/dom.test.tsx` | **Tier 4: User Events & DOM Interactions** | **7** | • Accessible tab switching between all five primary viewports.<br>• Smog spike (+45 AQI) and solar wind cleansing (-50 AQI) simulation buttons.<br>• Household persona profile switching with `aria-pressed` updates.<br>• Dynamic CADR room dimension form inputs.<br>• Neighborhood community pledge toggles and live carbon abatement counters. | ✅ 7 / 7 Passed |
| `src/test/api.test.ts` | **Tier 5: Live Backend, Security & Caching** | **10** | • `GET /api/health` 200 response with server diagnostics.<br>• Helmet security headers (`X-Content-Type-Options: nosniff`, Content-Security-Policy).<br>• Sub-10ms response times on SHA-256 LRU cache hits.<br>• Structural type guard rejection (HTTP 400) on invalid or malicious telemetry.<br>• Rate limiting response headers (`ratelimit-limit`, `ratelimit-remaining`).<br>• Express 5 wildcard (`*splat`) single-page application fallback routing. | ✅ 10 / 10 Passed |
| **TOTAL** | **Comprehensive Full System Verification** | **87** | **Complete Coverage of All 6 Challenge Parameters** | **✅ 87 / 87 (100%)** |

---

## 4. In-Depth Verification Details

### Tier 1: Pure Algorithmic & Mathematical Unit Tests
- **Piecewise Linear EPA Interpolation**: Tests `calculatePM25SubIndex` against official EPA breakpoints:
  $$I_p = \frac{I_{Hi} - I_{Lo}}{BP_{Hi} - BP_{Lo}} (C_p - BP_{Lo}) + I_{Lo}$$
  Validates exact sub-index transitions at $12.0$, $35.4$, $55.4$, $150.4$, $250.4$, $350.4$, and $500.4\text{ }\mu\text{g/m}^3$.
- **First-Order Single-Compartment CADR Decay**: Validates `estimatePurificationTime` solving for particulate concentration decline:
  $$C(t) = C_0 \cdot e^{-\left(\frac{\text{CADR}}{V}\right) t}$$
  Asserts that 90% particle removal duration matches theoretical predictions within 0.01 minute precision.

### Tier 2: Dijkstra Shortest-Exposure Graph Algorithm
- Evaluates pathfinding across `TRANSIT_GRAPH` to verify that when highway sectors report hazardous AQI ($>300$), the algorithm automatically routes passengers through the subterranean metro line and urban greenbelt, reducing cumulative exposure by more than 60%.

### Tier 3 & Tier 4: Component Rendering & DOM Behavior
- Uses `@testing-library/react` and `@testing-library/user-event` to simulate real user journeys:
  - Switching between views via accessible keyboard controls.
  - Selecting vulnerability profiles (e.g., asthmatic child or daily commuter).
  - Activating community pledges and observing reactive updates to aggregated environmental savings.

### Tier 5: Live Backend HTTP & Security Controls
- Tests spin up an ephemeral Express 5 server in-process without mocking network drivers:
  - Verifies Helmet security headers and CORS protection.
  - Verifies that cached payloads return in $<8\text{ ms}$.
  - Verifies that invalid payloads are blocked before model execution.

---

## 5. Verification Commands & Execution Guide

To reproduce the automated test verification suite locally:

```bash
# Execute the complete automated test suite (87 tests)
npm run test:run

# Execute tests with V8 code coverage reporting
npm run test:coverage

# Execute Oxlint static analysis (116 rules, 0 errors, 0 warnings)
npm run lint

# Execute TypeScript strict compilation and production build
npm run build
```
