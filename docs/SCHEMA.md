# Database schema (Phase 1)

## users
| Field | Type | Notes |
|---|---|---|
| fullName, email (unique, lowercase), password (bcrypt, select:false) | string | |
| role | `student` \| `faculty` \| `admin` | indexed |
| department (indexed), course, semester (1-10), studentId | | studentId unique only when present |
| headline, bio, skills[], interests[], achievements[{title, description, year}] | | |
| avatar, cover | `{ url, publicId }` | Cloudinary id, or `local:` path in development |
| isEmailVerified, facultyVerified, isActive, reputation | | reputation is used by the forum module |
| emailVerifyTokenHash/Expires, passwordResetTokenHash/Expires | select:false | SHA-256 hashes only |
| refreshTokens[{hash, expiresAt}] | select:false | max 5 sessions |
| createdAt, updatedAt | | |

Indexes: `email` unique; `role`; `department`; `{department, semester}`; text on `fullName, skills, interests`; partial unique on `studentId`.

Later modules add: posts, comments, connections, resources, discussions, answers, studygroups, groupmemberships, events, eventregistrations, conversations, messages, notifications, reports.
