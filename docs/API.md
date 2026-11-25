# API reference (Phase 1)

Base URL: `/api`. JSON in and out. Errors: `{ message, code?, errors? }` where `errors` maps field name to message (HTTP 422 for validation).
Protected routes need `Authorization: Bearer <accessToken>`.

## Auth
| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | /auth/register | public | multipart: fullName, email, password, role (student/faculty), department, course*, semester*, studentId?, avatar? (*students) |
| POST | /auth/verify-email | public | `{ token }` |
| POST | /auth/resend-verification | public | `{ email }` always returns the same message |
| POST | /auth/login | public | returns `{ accessToken, user }`, sets refresh cookie. 403 `EMAIL_NOT_VERIFIED` if unverified |
| POST | /auth/refresh | cookie | rotates refresh token, returns `{ accessToken, user }` |
| POST | /auth/logout | cookie | revokes the current refresh token |
| POST | /auth/forgot-password | public | `{ email }` |
| POST | /auth/reset-password | public | `{ token, password }`, signs out all devices |
| GET | /auth/me | user | current user |
| PATCH | /auth/password | user | `{ currentPassword, newPassword }` |

## Users and profiles
| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | /meta | public | departments and semesters |
| GET | /users/suggestions | user | study-partner matches (students) with `matchScore` and `sharedTopics` |
| PATCH | /users/me | user | fullName, headline, bio, department, course, semester, skills[], interests[], achievements[] |
| POST | /users/me/avatar | user | multipart field `image` (jpg/png/webp, 2 MB) |
| POST | /users/me/cover | user | same as avatar |
| GET | /users/:id | user | public profile; email and student ID only visible to the owner and admins |

## Dashboard
| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | /dashboard | user | profile completeness checklist |
| GET | /dashboard/admin | admin | user counts and recent registrations |
