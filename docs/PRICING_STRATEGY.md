# CareerGuide AI Pricing & Revenue Strategy

This document outlines the current technical implementation of pricing and the proposed strategy for scaling the platform's revenue model.

## 1. Current Implementation (v1.0)

The current version handles two distinct payment tracks:

| Tier | Target | Price | Frequency | Tech File |
| :--- | :--- | :--- | :--- | :--- |
| **Institutional** | Schools | **KES 10** / student | Termly | `school-service` |
| **Individual Pro** | Students/Parents | **KES 1,500** | One-time | `PaymentWall` |

### Billing Logistics
- **Platform**: [IntaSend](https://intasend.com) handles all M-Pesa, Visa, and Mastercard transactions.
- **Verification**: Database triggers (`profiles.payment_status`) automate access control.
- **Institutional Billing**: Dynamically calculated based on the `student_count` in the School Admin dashboard.

---

## 2. Strategic Recommendations

To increase Transparency and Conversion, we recommend the following shifts:

### A. The "Freemium" Bridge
Students should not encounter a raw paywall.
- **Recommendation**: Allow the **Quick Assessment** and **Top 3 Career Matches** to be free.
- **The Upsell**: Lock the **RIASEC Diagnostic Report**, **Counselor Booking**, and **Live Chat** behind the KES 1,500 "Pro" license.

### B. Tiered Institutional Packages (School)
A single 10 bob fee is excellent for volume, but doesn't capture value from "Elite" institutions.
1. **Standard (KES 10/student/term)**: Basic AI Career Roster + Teacher Dashboard.
2. **Premium (KES 25/student/term)**: Includes:
    - **Parent Access**: Parents can log in to view their child's career trajectory.
    - **CBE Alignment**: Mapping assessment results directly to the Kenyan CBC pathway choices.
    - **Offline Reports**: PDF batch downloads for every student in the school.

### C. The "Family" Bundle
Targeting households with multiple children (Middle-class parents).
- **Offer**: **KES 2,400** for up to 3 siblings (33% discount vs 3 individual licenses).
- **Benefit**: Increases immediate cash flow and locks in long-term household usage.

---

## 3. UI/UX Roadmap

### Dedicated Pricing Page (`/pricing`)
We need a professional, high-conversion landing page that:
1.  **Displays Tiers side-by-side**: Individual vs School.
2.  **Lists Features clearly**: Checkmarks for "What’s included."
3.  **Includes a M-Pesa QR/Logo**: Lowers friction for Kenyan mobile-first users.
4.  **FAQ Section**: Addressing "Can I pay for just one term?", "Is student data safe?", and "Refund Policy."

---

## 4. Technical Constants (Reference)

Developers should maintain these values in the following files:
- **School Pricing**: `src/lib/school-service.ts` -> `PRICE_PER_STUDENT_PER_TERM`
- **Student Pricing**: `src/components/PaymentWall.tsx` (Manual constant in component state)
