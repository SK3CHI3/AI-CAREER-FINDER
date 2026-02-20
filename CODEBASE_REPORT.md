# AI-CAREER-FINDER — Codebase Report

**Generated:** Feb 20, 2025  
**Scope:** Full project structure, connections, and recommended fixes.

---

## 1. How the app is connected

### Entry flow
```
index.html
  → /src/main.tsx (mounts App, loads index.css)
  → App.tsx
      → QueryClientProvider → AuthProvider → TooltipProvider → Toaster/Sonner → BrowserRouter → Routes
```

### Routes (App.tsx)
| Path      | Component                          | Protection              |
|-----------|------------------------------------|-------------------------|
| `/`       | Index (landing)                    | None                    |
| `/auth`   | Auth (login/signup)                | None                    |
| `/student`| StudentDashboard                   | ProtectedRoute (student) + PaymentGate |
| `/admin`  | AdminDashboard                     | ProtectedRoute (admin)  |
| `*`       | NotFound                           | None                    |

**Note:** There is **no route** for `/dashboard`. The file `Dashboard.tsx` exists but is never used in routing.

### Context & auth
- **AuthContext** wraps the app and provides: `user`, `profile`, `loading`, `signIn`, `signOut`, `updateProfile`, etc.
- **Session checks:** AuthContext uses `isSessionValid()` from `src/lib/session-utils.ts` in a `setInterval` to detect invalid sessions and trigger silent refresh or logout.
- **ProtectedRoute** reads `useAuth()`, checks `profile?.role` against `requiredRole`, and shows “Loading profile...” when `user` exists but `profile` is null.

### Connection map for modified files (git status)

| File               | Used by / uses |
|--------------------|----------------|
| **AIChat.tsx**     | **Used in:** StudentDashboard only. **Imported but not rendered:** Index.tsx (dead import). Uses: AuthContext, ai-service, supabase. |
| **AuthContext.tsx**| **Used in:** App (AuthProvider), ProtectedRoute, PaymentGate, LoginForm, SignupForm, Navigation, Hero, ProfileSetup, PaymentWall, GradesManager, CourseRecommendations, AIChat, StudentDashboard, Dashboard, AdminDashboard, Auth, useActivityTracking. **Uses:** session-utils (`isSessionValid`). |
| **session-utils.ts**| **Used in:** AuthContext only (`isSessionValid`). Exports: `SESSION_CONFIG`, `isSessionValid`, default `getSessionManager` (default never imported). |
| **StudentDashboard.tsx** | **Used in:** App.tsx at route `/student`. Imports: useAuth, AIChat, ReportGenerator, ProfileSetup, GradesManager, CareerDetailModal, CourseRecommendations, GradesModal, supabase, aiCareerService, aiCacheService, dashboardService, useActivityTracking. |

---

## 2. Necessary fixes and recommendations

### High priority (bugs / dead code)

| # | Issue | Location | Fix |
|---|--------|----------|-----|
| 1 | **Unused import** — `AIChat` is imported but the page only renders `GuestAIChat`. | `src/pages/Index.tsx` line 5 | Remove the `AIChat` import. |
| 2 | **Dead page** — `Dashboard.tsx` is never mounted; no route points to it. Navigation sends users to `/student` directly. | `src/pages/Dashboard.tsx` | Either add a route (e.g. `/dashboard` → `<Dashboard />`) if you want a single “dashboard” entry that redirects by role, or delete `Dashboard.tsx` and any references. |
| 3 | **Profile load failure** — If `fetchProfile` in AuthContext fails or never returns, ProtectedRoute shows “Loading profile...” indefinitely. | `AuthContext.tsx` + `ProtectedRoute.tsx` | Add error state in AuthContext when profile fetch fails, and in ProtectedRoute show “Could not load profile” / retry or redirect to auth after a timeout. |

### Medium priority (maintainability / production)

| # | Issue | Location | Fix |
|---|--------|----------|-----|
| 4 | **Console logging in production** — Multiple `console.log` calls in AuthContext. | `src/contexts/AuthContext.tsx` (e.g. lines 95, 99, 107, 114, 122, 169, 231, 263) | Remove or wrap in `if (import.meta.env.DEV)` so they don’t run in production. |
| 5 | **Unsafe type cast** — Profile update uses `as any`, bypassing type safety. | `src/contexts/AuthContext.tsx` line 246 (`.update(updates as any)`) | Define a proper type for profile updates (e.g. `Partial<Profile>` or a dedicated update type) and use it instead of `any`. |
| 6 | **SessionManager never torn down** — `SessionManager` starts a refresh timer in the constructor; `getSessionManager()` and `destroy()` are never called on logout. | `src/lib/session-utils.ts` | Optional: expose a way to call `getSessionManager().destroy()` from AuthContext on sign-out so the interval is cleared. Otherwise document that the timer is process-long. |
| 7 | **Unused default export** — `getSessionManager` is the default export of session-utils but is never imported. | `src/lib/session-utils.ts` | Either use it (e.g. for `destroy()` on logout) or remove the default export and keep only `SESSION_CONFIG` and `isSessionValid`. |

### Lower priority (consistency / strictness)

| # | Issue | Location | Fix |
|---|--------|----------|-----|
| 8 | **Quote style** — Mix of `"@/..."` and `'@/...'` in imports across the codebase. | Various files | Pick one style (e.g. double quotes) and apply consistently, or rely on a formatter. |
| 9 | **TypeScript strictness** — `noUnusedLocals`, `noUnusedParameters`, and `strictNullChecks` are disabled. | `tsconfig.json` | Enabling these (at least gradually) would catch the unused `AIChat` import and improve null safety. |
| 10 | **AIChat error handling** — Errors are caught and logged; no user-visible error state or boundary. | `src/components/AIChat.tsx` | Consider an error state UI or an error boundary so the chat doesn’t stay blank or stuck on failure. |

---

## 3. Summary table

| Priority   | Count | Action |
|------------|-------|--------|
| High       | 3     | Remove dead import, decide on Dashboard route or remove file, handle profile load failure. |
| Medium     | 4     | Reduce console logs, type profile updates, optional SessionManager cleanup, document or remove unused default export. |
| Lower      | 3     | Consistent quotes, stricter TS options, AIChat error UX. |

---

## 4. File structure (reference)

```
src/
├── main.tsx, App.tsx, index.css
├── pages/       → Index, Auth, NotFound, StudentDashboard, AdminDashboard, Dashboard (unused in routes)
├── contexts/    → AuthContext
├── components/  → AIChat, GuestAIChat, Navigation, Hero, Footer, ProfileSetup, PaymentGate, PaymentWall, etc.
├── components/auth/  → ProtectedRoute, LoginForm, SignupForm
├── components/ui/    → shadcn-style components
├── lib/         → supabase, session-utils, auth-utils, ai-service, ai-cache-service, dashboard-service, etc.
├── types/       → supabase, database
└── integrations/supabase/  → client, types
```

---

**Next steps:** Address high-priority items first (unused import, Dashboard usage, profile load error handling), then medium-priority cleanup and typing. If you want, I can apply the concrete code changes for items 1–5.
