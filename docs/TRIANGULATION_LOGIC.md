# Core Feature: Realistic Triangulation Logic

Realistic Triangulation is the proprietary logic used by CareerPath AI to ensure that career advice is not just "dreamy" but "doable." It moves beyond simple interest matching by cross-referencing four critical dimensions.

## The Pillars of Triangulation

### 1. Personality (The "Who")
- **Framework**: Holland Codes (RIASEC).
- **Collection**: Interactive assessment in `ProfileSetup.tsx`.
- **Logic**: Maps human traits (Artistic, Investigative, etc.) to successful work environments.

### 2. Academic Performance (The "Can")
- **Framework**: CBE Subject Analysis & Grade Trends.
- **Collection**: `GradesManager.tsx` and Supabase `student_grades`.
- **Logic**: Filters careers based on academic strengths. If a student wants Engineering but is weak in Physics, the AI suggests bridging courses or alternative technical paths.

### 3. Values & Constraints (The "How")
- **Framework**: Personal Meaning & Socio-Economic Reality.
- **Collection**: Values and Constraints steps in profile setup.
- **Logic**: An "Actionability Score" is calculated. If a student values "Stability" and has "Financial Constraints," the AI prioritizes high-growth, stable sectors with scholarship availability in Kenya.

### 4. Market Reality (The "Reality")
- **Framework**: Kenyan Economic Trends (Vision 2030).
- **Knowledge Base**: Updates on Digital Superhighway, Manufacturing, and **Creative Economy** (Content Creation, Digital Art, Gig Economy).
- **Logic**: Ensures students aren't steered toward oversaturated or automation-risky fields, prioritizing emerging high-growth sectors where a degree might be secondary to skills.

## How the Logic works in Code
In `src/lib/ai-service.ts`, the `generateCareerRecommendations` function constructs a prompt that explicitly requires the AI to:
1. Weight RIASEC fit.
2. Filter through constraints.
3. Align with core values.
4. Project a "Growth Trajectory."
5. **Prioritize Emerging Fields**: Explicitly look for "unconventional" but high-value roles like **Creative Economy** positions if they fit the profile.
6. Return an **Actionability Score (1-100)**.

## Visualizing the Triangulation
The Student Dashboard renders a Radar Chart to show the RIASEC profile and an Actionability Meter to show the feasibility of each recommendation, bringing the complex logic to a simple, understandable visual.

---
*For details on how these recommendations are cached and updated, see [HYBRID_CACHING_LOGIC.md](./HYBRID_CACHING_LOGIC.md).*
