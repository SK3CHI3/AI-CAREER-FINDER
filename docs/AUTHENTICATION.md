# CareerGuide AI - Authentication Architecture

## 1. Overview
CareerGuide AI implements a robust, deeply integrated Authentication architecture powered by **Supabase Auth (GoTrue)**. The platform strictly leverages JSON Web Tokens (JWTs), Row Level Security (RLS) policies, and Postgres Database Triggers to provide seamless experiences for completely different user segments (Students, Schools, Teachers, and Admins).

The core authentication logic is centralized in the React Context provider located at `src/contexts/AuthContext.tsx`.

---

## 2. User Roles & Identity Access
The authentication system assigns immutable `role` classifications stored directly inside incoming JWT tokens via user metadata upon signup. This guarantees zero-latency, secure client-side and database-side identity resolution.

### Recognized Roles:
- **`student`**: Primary end-users utilizing the AI counseling system.
- **`school`**: Institutional accounts that manage aggregate student analytics and school metrics.
- **`teacher`**: Administrative faculty accounts linked to a parent `school`.
- **`admin`**: Global system administrators capable of publishing blogs and resolving support.

All user profiles sync from the protected `auth.users` pool to a public-facing `public.profiles` dataset, bridged securely via Postgres functions.

---

## 3. Dynamic Identification (The "Triple Threat" Login)
Because students in Kenya may not possess functional email addresses, the platform implements unified identifier resolution. A user can universally log in using:
1. **Standard Email**: Used primarily by Teachers, Schools, and Admins.
2. **UPI Number (NEMIS)**: Students log in exclusively using their 4–12 string alphanumeric Unique Personal Identifier.
3. **Phone Number**: An alternative authentication fallback.

**How it works (under the hood):**
When a user submits their identity string to `signIn()` in `AuthContext.tsx`, the application performs a regex validation. If it determines the string is not an email (e.g., it is a UPI or Phone), it executes a zero-latency `SELECT` query against the `public.profiles` RLS bypassing table to resolve the associated hidden email hash, before passing that internal email back to Supabase's `signInWithPassword`.

---

## 4. Student Onboarding & The Pseudo-Domain Bypass
Supabase strictly requires a standard email structure during the `auth.signUp()` pipeline. Since Students sign up via their UPI, the system dynamically fabricates a standard email using the verified CareerGuide routing suffix:
`[lower_case_upi]@student.careerguideai.co.ke`

### Auto-Confirmation Database Trigger
Supabase heavily restricts automatic logins if **Email Confirmations** are mandated for the project. By intentionally forcing students into pseudo-domains, they inherently cannot check standard email inboxes.

To solve this while retaining strict Email confirmations for `school` and `teacher` accounts, the platform implements a `SECURITY DEFINER` Postgres Trigger on the `auth.users` core table:

```sql
CREATE OR REPLACE FUNCTION public.auto_confirm_student_emails()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email LIKE '%@student.careerguideai.co.ke' THEN
    NEW.email_confirmed_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER auto_confirm_student_emails_trigger
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_confirm_student_emails();
```
* **Mechanism:** The second a Student registers with a UPI, the database intercepts the request and instantly validates their email, permitting standard token injection without verification barriers.*

---

## 5. Security Protocols

### Multi-Factor Authentication (MFA)
The `AuthContext.tsx` provider actively listens for `AAL2` (Authenticator Assurance Level 2) elevation events on the current user session (`hasMFAEnabled`).

### JSON Web Tokens (JWT) Validation
Persistent sessions span an implicit 30-day lifecycle. The system implements a polling verification loop iterating every `60000ms`, verifying token integrity using `isSessionValid()` and silently resolving `refreshSession()` API injections to prevent destructive UX disconnects in the background.

### Row Level Security (RLS)
The database operates under strict, explicitly defined default-deny properties.
- `blog_posts`: Anyone can `SELECT` published records. Only users matching `role = 'admin'` can `INSERT`/`UPDATE`/`DELETE`.
- `profiles`: Users can fundamentally only mutate their own `id` profiles validated against `auth.uid()`.

---

## 6. Component Hierarchy (Auth Forms)
The frontend user interface utilizes responsive validation powered by **Zod** schema assertions integrated deeply with `react-hook-form`.

`SignupForm.tsx` & `LoginForm.tsx`:
- Render dynamic `<Input>` permutations determined by the selected Role toggle (i.e. 'School Name' over 'Full Name').
- Pre-parse internal routing schemas prior to invoking the API wrapper.
- Inject real-time UI/UX modal toasts using Radix primitives.
