# Career Guide AI – School-Integrated Pivot Plan

**Version:** 1.0  
**Status:** Planning  
**Last updated:** Feb 2025

---

## 1. Executive Summary

Career Guide AI is evolving from a **standalone student career tool** into a **school-integrated career intelligence platform** aligned with Kenya’s Competency-Based Curriculum (CBE) for Grades 7–12.

| Before (current) | After (target) |
|------------------|----------------|
| Student-only, self-input | School-driven, competency-verified |
| Self-reported interests/strengths | Academic data + teacher input + student interests |
| General AI career suggestions | Structured, CBE-aligned career pathway insights |
| No school/teacher/parent | School onboarding, teacher management, parent visibility |
| Individual discovery tool | Institutional platform with tiered subscriptions |

**Core transformation:** From *self-input career suggestions* → *competency-based, school-verified career intelligence* at institutional scale.

---

## 2. Current System Snapshot (Pre-Pivot)

### 2.1 Roles & access
- **Roles:** `student` | `admin` only (`AuthContext`, `ProtectedRoute`, DB).
- **Auth:** Supabase Auth (email/password); profile in `profiles` keyed by user id.
- **Routes:** `/` (landing), `/auth`, `/student` (PaymentGate + StudentDashboard), `/admin` (AdminDashboard), `/dashboard` (redirect by role).

### 2.2 Data (main entities)
- **profiles** – user profile (role, school_level, grade, subjects, interests, payment_*, etc.).
- **student_grades** – grades per subject/term (user_id, subject_name, term, grade_value, teacher_comment).
- **ai_conversations**, **cached_career_recommendations**, **cached_course_recommendations** – AI outputs.
- **user_activities**, **user_stats**, **platform_analytics** – dashboard/analytics.
- **grade_categories**, **academic_terms**, **cbe_subjects** – reference data.

### 2.3 Gaps for pivot
- No **school** entity or onboarding.
- No **teacher** role or teacher–student/school link.
- No **parent** role or parent–student link.
- Grades are **student-entered** (or single user); no **teacher-managed** or **bulk (spreadsheet) upload**.
- No **school subscription**; payment is per-student (IntaSend one-time).
- No **verified competency** layer (e.g. “school/teacher verified” vs “self-reported”).

---

## 3. Target Architecture (Post-Pivot)

### 3.1 Role model (new)

| Role | Purpose | Primary actions |
|------|--------|-----------------|
| **school** | Institution admin | Onboard school, manage teachers, subscription tier, view school analytics, optional SSO/settings. |
| **teacher** | Per-school educator | Manage class(es), upload/verify grades (spreadsheet MVP), view students’ career insights (aggregate/anonymized or per-student per policy). |
| **student** | Learner in a school | View own competency-based career insights, AI chat, grades (teacher-verified where applicable), share with linked parent. |
| **parent** | Guardian | Read-only view of linked student(s): grades, career recommendations, progress (no edit). |
| **admin** | Platform super-admin | Existing: platform analytics, user management; extended: school list, subscription oversight, support. |

### 3.2 High-level structure

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        PLATFORM (admin)                                  │
└─────────────────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  SCHOOL (school admin)                                                    │
│  • Onboarding, subscription tier, teachers, settings                    │
└─────────────────────────────────────────────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│  TEACHER    │ │  TEACHER    │ │  TEACHER    │  … (per school)
│  Classes    │ │  Classes    │ │  Classes    │
│  Grade upload│ │  Grade upload│ │  Grade upload│
└─────────────┘ └─────────────┘ └─────────────┘
        │               │               │
        ▼               ▼               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STUDENTS (per class/school)                                             │
│  • Verified grades + interests → AI career intelligence                 │
│  • Student dashboard; optional link to PARENT (read-only)               │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.3 Data model (new / extended)

**New tables (conceptual)**  
*(Exact names and columns to be finalized in DB design phase.)*

| Entity | Purpose |
|--------|---------|
| **schools** | id, name, code, region, subscription_tier, status, settings, created_at, updated_at. |
| **school_members** | school_id, user_id (auth id), role (school_admin \| teacher), invited_by, joined_at. |
| **classes** | school_id, name, grade_level, academic_year, teacher_id (optional), created_at. |
| **class_enrollments** | class_id, student_user_id, enrolled_at, source (manual \| spreadsheet). |
| **parent_students** | parent_user_id, student_user_id, relationship, status (pending \| linked), created_at. |
| **grade_sources** | Enum or column: `student_self` \| `teacher_upload` \| `teacher_edit` (for verified vs self-reported). |
| **school_subscriptions** | school_id, tier, started_at, expires_at, payment_reference (or link to payments). |

**Extended existing**

| Table | Changes |
|-------|---------|
| **profiles** | Add optional `school_id` (for students/teachers); add `role` = student \| admin \| school \| teacher \| parent; keep backward compatibility during migration. |
| **student_grades** | Add `source` (student_self \| teacher_upload \| teacher_edit), optional `upload_batch_id`, `verified_at`, `verified_by` (teacher user id); link to class/term. |
| **profiles** (payment) | Keep per-student payment for “individual” tier; add or link to school_subscriptions for school-paid tiers. |

### 3.4 Feature map (current → target)

| Area | Current | Target (MVP then later) |
|------|---------|--------------------------|
| **Onboarding** | Student signup → profile → pay | **School onboarding** (create school, invite teachers); **teacher onboarding** (accept invite, create classes); **student** (invite by school/teacher or self-register and link to school). |
| **Grades** | Student enters own grades (GradesManager) | **MVP:** Teacher spreadsheet upload (CSV/Excel) → parse → map to subjects/terms → create/update `student_grades` with source=teacher_upload. **Later:** Teacher inline edit, bulk approve, competency rubrics. |
| **Career intelligence** | AI from profile + self-reported data | **MVP:** AI input = verified grades (teacher_upload) + student interests; mark insights as “based on verified data” where applicable. **Later:** CBE competency codes, learning outcomes mapping. |
| **Student dashboard** | Single student view | Keep; add “verified by school” badges; optional **parent view** (read-only link). |
| **Parent** | None | **MVP:** Parent account, link to student(s) (invite/accept), read-only dashboard (grades, career summary). **Later:** Notifications, reports. |
| **Payments** | IntaSend one-time per student | **MVP:** Keep individual payment; add **school subscription** (tier: e.g. Basic / Standard / Premium), school pays → students under that school get access without individual pay. **Later:** Invoicing, usage caps per tier. |

---

## 4. Phased Implementation Plan

### Phase 0: Foundation (no UX change)
- **DB schema design** – Finalize new tables (schools, school_members, classes, class_enrollments, parent_students, grade_sources, school_subscriptions) and migrations.
- **RLS & policies** – School-scoped access: teachers see only their school/classes; school admin sees school; parents see only linked students; students see self (+ school context).
- **Role enum** – Extend from `student \| admin` to `student \| admin \| school \| teacher \| parent` in DB and app (profiles.role or equivalent).
- **Backward compatibility** – Existing students remain valid; `school_id` and new roles nullable/defaulted so current flows still work.

**Deliverables:** Migration scripts, RLS policies, updated TypeScript types (e.g. `src/types/supabase.ts`), role checks in `AuthContext` and `ProtectedRoute` for new roles (routes can 404 or redirect until UI exists).

---

### Phase 1: School & teacher (MVP)
- **School onboarding** – New flow: create school (name, code, region), subscription tier selection; first user becomes school admin; store in `schools` + `school_members`.
- **Teacher invite & onboarding** – School admin invites teacher (email); teacher signs up or logs in, accepts invite; role set to `teacher`, linked to school in `school_members`.
- **Classes** – Teachers create classes (name, grade_level, academic_year); students can be assigned to classes (manual add by email/user id for MVP).
- **Spreadsheet upload (grades)** – Teacher selects class + term; uploads CSV/Excel; columns mapped to subject, student (email or id), grade; rows create/update `student_grades` with `source = teacher_upload` and optional `upload_batch_id`. Validation and error report (e.g. unknown student, duplicate).
- **Routes & UI** – `/school` (school admin dashboard), `/teacher` (teacher dashboard: classes, upload grades, view class list). `ProtectedRoute` for `school` and `teacher`; post-login redirect by role.

**Deliverables:** School onboarding page, teacher invite/accept flow, class CRUD, spreadsheet upload UI + parser, school and teacher dashboards (minimal), docs for CSV/Excel template.

---

### Phase 2: Competency-powered student experience
- **Student–school link** – Students linked to school via class enrollment or profile.school_id; if school has active subscription, skip individual payment (PaymentGate logic update).
- **Verified vs self-reported** – Dashboard and AI input distinguish teacher-uploaded grades vs student self-entry; show “verified by school” where applicable.
- **AI integration** – `ai-service` / `dashboard-service` pass verified grades and source into prompts; career insights labeled when based on verified data.
- **Student dashboard tweaks** – Grades section shows source (teacher/school vs self); career cards can show “based on your school-reported performance.”

**Deliverables:** PaymentGate respects school subscription; student dashboard and AI use verified grades; clear labeling in UI.

---

### Phase 3: Parent & tiered subscriptions
- **Parent role** – Signup/login as parent; “Link to student” (invite by student email or code); student accepts link → row in `parent_students`.
- **Parent dashboard** – Read-only: list linked students; per student: grades, career summary, progress (no edit, no payment).
- **Tiered school subscription** – Define tiers (e.g. Basic / Standard / Premium); school_subscriptions table; payment flow (IntaSend or other) for school; limit features or student count per tier if needed.
- **Admin** – Platform admin can see schools, subscription status, basic analytics per school.

**Deliverables:** Parent registration, link flow, parent read-only dashboard; school subscription tiers and payment; admin school list and subscription oversight.

---

### Phase 4 (later): Scale & polish
- **CBE alignment** – Map subjects/grades to competency codes or learning outcomes; expose in career insights.
- **SSO / school directory** – Optional SAML/OAuth or “select your school” directory for faster onboarding.
- **Notifications** – Email/in-app for parents (e.g. new report), teachers (upload result), schools (subscription expiry).
- **Reporting** – School-level and platform-level reports (usage, career distribution, engagement).

---

## 5. File & Code Structure (Recommendations)

### 5.1 Keep, then extend
- **Auth:** `AuthContext` – extend Profile type and role union; add `schoolId`, `schoolRole` if needed; keep session/profile flow.
- **Routing:** `App.tsx` – add routes for `/school`, `/teacher`, `/parent`; extend redirect logic in Auth/Dashboard by role.
- **Lib:** `supabase.ts`, `session-utils.ts`, `auth-utils.ts` – keep; add school/teacher/parent in RLS.
- **AI:** `ai-service.ts`, `ai-cache-service.ts` – keep; add “verified grades” and source in context passed to AI.

### 5.2 New modules (suggested)
- **`src/lib/school-service.ts`** – Schools CRUD, school_members, invites, subscription status.
- **`src/lib/class-service.ts`** – Classes, class_enrollments, student list per class.
- **`src/lib/grade-upload-service.ts`** – Parse spreadsheet, validate, write student_grades with source and batch.
- **`src/lib/parent-service.ts`** – parent_students link, list linked students, read-only data for parent.
- **`src/pages/SchoolDashboard.tsx`** – School admin UI.
- **`src/pages/TeacherDashboard.tsx`** – Teacher UI (classes, upload, student list).
- **`src/pages/ParentDashboard.tsx`** – Parent read-only dashboard.
- **`src/components/school/`** – School onboarding, invite teacher, subscription.
- **`src/components/teacher/`** – Class list, grade upload (file picker + mapping + confirm).
- **`src/components/parent/`** – Link student, student cards, read-only views.

### 5.3 Shared types
- **`src/types/supabase.ts`** (or generated from DB) – Add schools, school_members, classes, class_enrollments, parent_students, school_subscriptions, and extended student_grades (source, upload_batch_id, etc.).
- **`src/types/roles.ts`** – Centralize role union and role-based route config (e.g. which path each role lands on).

---

## 6. Risk & Migration Notes

- **Data migration** – Existing `profiles` rows: add `school_id` (null), extend `role` enum; existing students continue as before until linked to a school.
- **Payment** – Keep existing IntaSend one-time for individual students; add separate flow for school subscription (same or different product).
- **RLS** – Critical: teachers must only see their school’s data; parents only linked students; students only self (+ school context). Test thoroughly.
- **Spreadsheet format** – Publish and maintain a canonical CSV/Excel template; version it if columns change.

---

## 7. Success Criteria (MVP)

- [ ] A school can be created and at least one teacher invited and linked.
- [ ] A teacher can create a class and upload a spreadsheet of grades; grades appear in DB with `source = teacher_upload`.
- [ ] A student linked to that class sees teacher-uploaded grades and can use AI career insights that use verified data.
- [ ] Optional: One school subscription tier works (school pays → students under school skip individual payment).
- [ ] Optional: Parent can link to a student and view read-only grades/career summary.

---

## 8. Next Steps

1. **Stakeholder sign-off** on this plan and phased scope.
2. **DB design** – Finalize schema (columns, indexes, RLS) and create migration(s) in Supabase.
3. **Phase 0** – Implement migrations, RLS, and role enum extension in codebase (no new UI).
4. **Phase 1** – Implement school onboarding, teacher flow, classes, and spreadsheet upload; then iterate on Phase 2–3.

If you want, the next concrete step can be: **detailed DB schema (SQL/migrations)** or **Phase 0 task list (file-by-file changes)**.
