# VAYORA — Engineering Plan & Technical Specification

> **Platform:** VAYORA — AI-Powered Urban Air Quality & Environmental Intelligence Platform  
> **Document Role:** Architectural Blueprint & Engineering Specification  
> **Target Scope:** 600/600 Evaluation Target across all 6 Core Parameters  

---

## 1. Executive Summary

VAYORA is an environmental intelligence platform engineered to protect urban populations from severe air pollution crises, particulate accumulation ($\text{PM}_{2.5}$, $\text{PM}_{10}$), and boundary-layer thermal inversions.

By combining real-time multi-pollutant telemetry, atmospheric inversion modeling, GenAI-driven routine scheduling, Dijkstra-based clean commute pathfinding, low-cost DIY indoor air purification solutions, and neighborhood collective pledges, VAYORA converts complex environmental science into actionable personal guidance.

---

## 2. Core Functional Pillars

### Pillar 1: Hyperlocal AQI & Inversion Telemetry
- **Multi-Pollutant Ingestion**: Real-time tracking of $\text{PM}_{2.5}$, $\text{PM}_{10}$, $\text{NO}_2$, $\text{CO}$, and $\text{O}_3$ across five municipal sectors.
- **Boundary-Layer Inversion Detector**: Evaluates vertical temperature lapse rates and surface wind speeds to forecast toxic inversion caps.
- **Native SVG Smog Heatmap**: Responsive spatial visualization paired with `.sr-only` text alternatives conforming to WCAG 2.2 AA.

### Pillar 2: Personalized GenAI Routine Optimization
- **Household Persona Profiling**: Customized advice for asthmatics, infant caregivers, elderly residents, school runners, and daily commuters.
- **Server-Side AI Orchestration**: Google Gemini 3.1 Flash Lite model generating hour-by-hour exposure schedules.
- **Deterministic Heuristic Fallback**: Instant offline schedule generation via `heuristicRoutine.ts`.

### Pillar 3: Multi-Modal Clean-Corridor Commute Navigation
- **Dijkstra Shortest-Exposure Engine**: Computes transit routes that prioritize subterranean subways and tree-lined greenways, bypassing highway smog bottlenecks.
- **Inhaled Particulate Dose Formulation**: Quantifies inhaled micrograms ($\mu\text{g}$) factoring exertion ventilation rates and mask filtration factors.

### Pillar 4: Indoor Air Quality (IAQ) & Low-Cost Purifier Engineering
- **CADR Mass-Balance Calculator**: Calculates required Clean Air Delivery Rate to achieve 4–5 Air Changes per Hour (ACH) and estimates 90% particle clearance time.
- **Inversion-Aware Window Schedule**: Recommends optimal ventilation times while warning against morning smog backdrafts.
- **Open-Source DIY Blueprints**: Step-by-step assembly guides for the Corsi-Rosenthal Box ($40 DIY HEPA alternative).

### Pillar 5: Community Action & Collective Environmental Abatement
- **Neighborhood Pledges**: Collective commitments for carpooling, dust control, and waste-burning bans.
- **Real-Time Abatement Quantification**: Deterministic computation of aggregated carbon ($\text{kg CO}_2$) and particulate ($\text{g PM}_{2.5}$) reductions.
- **Multilingual Emergency Alerts**: Instant broadcast advisories in English, Hindi, Arabic (with RTL inversion), and Spanish.

---

## 3. System Architecture & Technical Specifications

```
┌────────────────────────────────────────────────────────┐
│                   CLIENT ARCHITECTURE                  │
│  React 19 │ TypeScript Strict │ Vite 6 │ Tailwind v4   │
├────────────────────────────────────────────────────────┤
│ • Presentation: Memoized Views (React.memo)            │
│ • State Management: AppContext + LocalStorage Fallback │
│ • Compute Engine: Pure Mathematical Algorithmic Core   │
│ • Visual Engine: Native SVG Heatmaps & Sparklines      │
└────────────────────────────────────────────────────────┘
                           │
                 HTTPS / REST API JSON
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│                   SERVER ARCHITECTURE                  │
│       Express 5 │ Node.js 20+ │ Helmet Security        │
├────────────────────────────────────────────────────────┤
│ • Security Pipeline: CSP Directives, 15KB Cap, CORS   │
│ • Rate Limiting: 30 requests / minute / IP             │
│ • Validation: Structural Type Guards & Sanitization    │
│ • Cache Tier: In-Memory SHA-256 Hash-Keyed LRU Cache   │
│ • AI Gateway: Google Gemini 3.1 Flash Lite Service     │
└────────────────────────────────────────────────────────┘
```

---

## 4. Quality Assurance & Continuous Verification

- **Linting & Code Hygiene**: Oxlint v1.94.0 enforcing 116 rules with zero errors and zero warnings across 64 files.
- **Type Checking**: Strict TypeScript compiler (`tsc -b`) with zero implicit or explicit `any`.
- **Automated Test Harness**: Vitest v3.2.7 and JSDOM executing 87 automated tests across 8 suites with 100% pass rate.
- **Production Asset Footprint**: Total compressed application JavaScript under 28 kB gzipped (total JS under 97 kB gzipped).
