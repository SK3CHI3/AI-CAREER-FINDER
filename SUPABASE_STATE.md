# Supabase Database State – AI Career Finder

**Project:** `ai-career-finder`  
**Project ID:** `yrgtkuwejsaxhsfozxfh`  
**Region:** us-east-1  
**Status:** ACTIVE_HEALTHY  
**Captured via:** Supabase MCP (live)

---

## 1. Public schema – tables (15)

| Table | Rows (approx) | Purpose |
|-------|----------------|---------|
| **profiles** | 2 | User profile: id (= auth.users.id), email, full_name, avatar_url, **role** (enum), payment_*, school_level, current_grade, cbe_subjects, career_interests, career_goals, subjects, interests |
| **student_grades** | 0 | Grades per student: user_id, subject_name, subject_code, term, academic_year, grade_value, grade_letter, max_marks, exam_type, teacher_comment |
| **user_activities** | 18 | Activity feed: user_id, activity_type, activity_title, activity_description, progress_percentage, activity_data (jsonb) |
| **user_stats** | 5 | Aggregated stats: user_id, stat_type, stat_value, stat_change, stat_trend, calculated_at |
| **user_sessions** | 667 | Session tracking: user_id, session_start, session_end, page_views, actions_count, device_type, browser |
| **career_recommendations** | 0 | Stored recommendations: user_id, career_name, match_percentage, description, salary_range, growth_prospect, education_required, skills_required, expires_at |
| **cached_career_recommendations** | 0 | Cache: user_id, career_name, match_percentage, description, salary_range, education, growth, why_recommended |
| **cached_career_details** | 0 | Cache: user_id, career_name, details (jsonb) |
| **cached_course_recommendations** | 0 | Cache: user_id, courses (jsonb) – unique on user_id |
| **cache_invalidation** | 0 | user_id, cache_type, invalidated_at, reason |
| **career_paths** | 0 | Reference: title, category, demand_level, salary_range, growth_percentage, skills_required, description, education_requirements, career_level |
| **cbe_subjects** | 0 | Reference: subject_name, subject_code, category, description |
| **career_interests** | 0 | Reference: interest_name, category, description, related_subjects |
| **grade_categories** | 0 | Reference: category_name, grade_scale (jsonb), description |
| **academic_terms** | 0 | Reference: term_name, term_order, start_date, end_date |
| **platform_analytics** | 0 | Admin metrics: metric_name, metric_value, metric_period, metric_date, additional_data |

**Note:** There is **no `ai_conversations` table** in the database. The app types (`src/types/supabase.ts`) define it, but the table was never created. The app currently uses **localStorage** for chat persistence (see AIChat).

---

## 2. Auth schema (Supabase managed)

- **auth.users** – 5 users; id (uuid) is the main key; links to **public.profiles.id** (1:1).
- **profiles.id** has FK to **auth.users.id** (profiles.id = auth user id).

---

## 3. Enums

| Enum | Values |
|------|--------|
| **user_role** | `student`, `admin` |

Used on **profiles.role** (default `'student'`). No `school`, `teacher`, or `parent` yet.

---

## 4. Profiles – full column list (public.profiles)

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | – (FK auth.users.id) |
| email | text | NO | – |
| full_name | text | YES | – |
| avatar_url | text | YES | – |
| role | user_role | NO | 'student' |
| created_at | timestamptz | YES | now() |
| updated_at | timestamptz | YES | now() |
| payment_status | text | YES | 'pending' (check: pending, completed, failed, refunded) |
| payment_reference | text | YES | – |
| payment_date | timestamptz | YES | – |
| payment_amount | numeric | YES | – |
| payment_currency | text | YES | 'KES' |
| intasend_transaction_id | text | YES | – |
| school_level | text | YES | – |
| current_grade | text | YES | – |
| cbe_subjects | text[] | YES | – |
| career_interests | text[] | YES | – |
| career_goals | text | YES | – |
| subjects | text[] | YES | – |
| interests | text[] | YES | – |

---

## 5. RLS (Row Level Security)

All listed **public** tables have **RLS enabled**.

### Profiles
- **Service role can do everything** – `auth.role() = 'service_role'`
- **Users can insert own profile** – INSERT (no qual)
- **Users can update own profile** – UPDATE where `auth.uid() = id`
- **Users can view own profile** – SELECT where `auth.uid() = id`  

There is **no policy** that lets admins SELECT all profiles. If the admin dashboard lists all users, it likely uses the **service role** key (server-side or env) or a different mechanism.

### User-scoped tables (student_grades, user_activities, user_stats, user_sessions, career_recommendations, cached_*)
- **SELECT / INSERT / UPDATE / DELETE** only where **auth.uid() = user_id** (own row).

### Reference tables (academic_terms, grade_categories, cbe_subjects, career_paths, career_interests)
- **SELECT** for **authenticated** users only (`auth.role() = 'authenticated'`).

### platform_analytics
- **SELECT** – only if `EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')`
- **INSERT** – no qual (any authenticated can insert; consider restricting to admin in pivot).

### cache_invalidation
- **SELECT** – auth.uid() = user_id  
- **INSERT** – no qual

---

## 6. Migrations applied (order)

1. **create_grades_system** – grades, terms, categories
2. **create_dynamic_dashboard_tables** – dashboard-related tables
3. **add_profiles_insert_policy** – profile insert for new users
4. **fix_handle_new_user_function** – trigger/handler for new auth users

---

## 7. Security advisors (Supabase)

- **Function search_path mutable** – `public.handle_updated_at`, `public.update_updated_at_column`, `private.is_admin` – set explicit `search_path` in function definitions.
- **Leaked password protection disabled** – Enable in Auth settings (HaveIBeenPwned check).
- **Postgres version** – Security patches available; consider upgrade via Supabase dashboard.

---

## 8. Pivot relevance (summary)

| Current | For school-integrated pivot |
|---------|-----------------------------|
| **Roles** = student, admin only | Extend **user_role** with school, teacher (no parent – parents share student dashboard) and **profiles** (e.g. school_id) |
| **profiles** = single user profile | Keep; add optional **school_id**, possibly **school_role** (for teacher/school_admin) |
| **student_grades** = user_id only, no source | Add **source** (student_self / teacher_upload / teacher_edit), **upload_batch_id**, **verified_at**, **verified_by**; optionally link to **class** |
| No school/teacher | New tables: **schools**, **school_members**, **classes**, **class_enrollments**, **school_subscriptions** (no parent role/table – parents share student dashboard) |
| RLS = “own row” or “authenticated read” | New RLS: school-scoped (teacher sees school/classes), admin sees platform + schools |
| No **ai_conversations** in DB | Optional: add table if you want server-side chat history; else keep localStorage |

This document reflects the **current** Supabase state and can be updated as you apply migrations for the pivot.

---

## 9. Phase 0 migrations applied (school pivot)

- **extend_user_role_school_teacher** – Added `school` and `teacher` to `user_role` enum.
- **create_schools_and_members** – `schools` (name, code, region, subscription_tier, status, settings), `school_members` (school_id, user_id, role: school_admin | teacher).
- **create_classes_and_enrollments** – `classes` (school_id, name, grade_level, academic_year, teacher_id), `class_enrollments` (class_id, student_user_id, source: manual | spreadsheet).
- **create_school_subscriptions_alter_profiles_grades** – `school_subscriptions` (school_id, tier, started_at, expires_at); `profiles.school_id` (FK schools); `student_grades.source`, `upload_batch_id`, `verified_at`, `verified_by`.
- **rls_school_tables** – RLS for schools, school_members, classes, class_enrollments, school_subscriptions.
- **rls_school_members_insert_creator_only** – First member of a school can be self (creator).
