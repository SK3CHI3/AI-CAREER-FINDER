# Workflow Logic: School, Teacher, and Student Connection 

This document explains the seamless connection between the School, the Teacher, and the Student inside the AI Career Finder platform.

The entire ecosystem is bridged by one crucial piece of information: **The Student's NEMIS UPI Number**.

---

## 1. School & Teacher Setup
1. **School Registration**: A school registers on the platform.
2. **Teacher Invitation**: The school administrator invites a teacher to join the platform under their school.
3. **Class Creation**: The teacher logs in and creates a new class (e.g., "Form 3A - 2026"). At this point, the class is empty.

## 2. Linking the Students to the Class (The Teacher's Side)
Teachers don't have to wait for students to sign up to start managing them.

**How does the Teacher see the students?**
1. **Bulk Uploading Grades**: The primary way students appear in the Teacher Dashboard is when the teacher uploads an Academic Results Spreadsheet (Excel/CSV).
2. **Auto-Enrollment**: When the teacher uploads a row containing a `student_upi`, a `subject`, a `grade_value`, and (optionally) a `student_name`:
   - The system checks if the student is already in the class.
   - **If not**, the system *silently* and automatically enrolls that UPI into the class.
   - It saves the `student_name` directly to the class roster.
3. **The Result**: The teacher instantly sees the student's name, their grades, and their class statistics on their dashboard! **This happens even if the student has never heard of the app or created an account yet.**

*Alternatively, the teacher can click "Add Student" and manually type a student's UPI and Name to add them to the roster without uploading grades.*

## 3. The Student's Journey (The Student's Side)

Students can sign up at any time—either *before* or *after* the teacher uploads their data.

**Scenario A: Student signs up AFTER the teacher uploads their grades**
1. A student goes to the platform and signs up using their **NEMIS UPI Number**.
2. Because the teacher already uploaded data tied to that exact UPI number, the system instantly links the new student account to those existing records.
3. As soon as the student logs in for the first time, they will immediately see their academic results, the class they belong to, and the AI Career Recommendations based on the data the teacher uploaded!

**Scenario B: Student signs up BEFORE the teacher uploads grades**
1. A student signs up using their UPI. Their dashboard shows no grades yet.
2. The teacher later uploads a spreadsheet with that student's UPI.
3. The system maps the uploaded grades to the student's existing profile.
4. The next time the student refreshes their dashboard, their grades and new AI recommendations will be waiting for them.

---

## Summary
- **Who bridges the gap?** The `student_upi` acts as the universal key.
- **Does the teacher have to manually add students one-by-one?** No, simply uploading a spreadsheet of grades will auto-enroll the entire class.
- **Can a teacher see student names without the student creating an account?** Yes! If the teacher includes names in their bulk-upload spreadsheet, the system stores those names and displays them perfectly.
- **How does a student access their data?** By simply signing up with their UPI, the system automatically pulls any data any school/teacher has uploaded containing that UPI.
