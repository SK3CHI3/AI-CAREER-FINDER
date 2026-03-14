# Changelog

## [2.0.0] - 2026-03-14

### Major Features & Improvements
*   **Unified Brand Identity**: Complete replacement of generic placeholders with the official CareerGuide AI logo across all touchpoints (Auth, Dashboards, Header, and Loading states).
*   **Dashboard Analytics Reimagined**:
    *   Optimized **Ecosystem Growth** chart with refined timeline density (5-day intervals) for crystal-clear readability.
    *   Polished Admin Dashboard sidebar with improved logo visibility and spacing for a premium feel.
*   **Premium User Experience**: Redesigned the **404 Page** with brand-consistent gradients, smooth floating animations, and improved navigation options.

### Technical Fixes & Security
*   **Invite Flow Reliability**:
    *   Fixed critical **RLS (Row Level Security)** policies for `school_members` and `teacher_invites` tables, enabling seamless school/teacher onboarding.
    *   Enhanced **Invite Acceptance** security with mandatory password confirmation validation.
    *   Resolved auto-sign-in race conditions; users are now immediately redirected to their respective dashboards upon successful invite acceptance.
*   **Global Feedback System**:
    *   Implemented a persistence-ready site-wide **Feedback Widget** for direct user-to-admin communication.
    *   Fixed TypeScript definition mismatch for the `feedbacks` table by synchronizing local types with the current Supabase schema.

### Maintenance
*   Removed temporary build artifacts, test files, and legacy `vite.config` timestamps to clean up the repository.
*   Improved ESLint configuration for better development environment stability.
*   Enhanced error handling and loading feedback across authentication and dashboard modules.

---
*Shaping the future of Kenyan education · CareerGuide AI*
