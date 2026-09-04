# TechGram Backend API Documentation

This document describes all HTTP and Socket.IO APIs currently implemented in this backend.

## Connection and global rules

Base URL: http://localhost:3000

REST prefix: /api/v1

Swagger UI: http://localhost:3000/api/docs

Local startup:

~~~
npm install
docker compose up -d postgres redis minio minio-init
npm run start:dev
~~~

The Compose file exposes PostgreSQL on host port 5433, Redis on 6379, and MinIO on 9000. Use .env.example for configuration. Never expose database credentials, JWT secrets, object-storage secrets, or FCM service-account JSON in a client app.

Every successful response is wrapped by the global interceptor:

~~~
{ "success": true, "data": <controller-result> }
~~~

Errors are wrapped as:

~~~
{ "success": false, "error": <error-details> }
~~~

The error value can be a string, object, or validation response.

### Authentication

The JWT guard is global. Public routes are:

- POST /api/v1/auth/register
- POST /api/v1/auth/login
- POST /api/v1/auth/refresh
- POST /api/v1/auth/forgot-password
- POST /api/v1/auth/reset-password
- GET /api/v1/auth/verify-email

All other HTTP routes require:

~~~
Authorization: Bearer <accessToken>
~~~

Access tokens default to 15 minutes and refresh tokens to 7 days. Refresh tokens are stored hashed, rotated on success, and family-revoked on reuse.

### Validation and limits

- JSON requests use Content-Type: application/json.
- Unknown body fields are rejected.
- Query values are converted to declared number/boolean DTO types.
- Rate limit: 10 requests per second and 100 requests per minute.
- Helmet and CORS are enabled. Restrict CORS_ORIGINS in production.
- Common statuses: 200 success, 201 created, 400 invalid request, 401 authentication failure, 403 authorization failure, 404 not found, 409 conflict, 429 throttled, 500 server error.

## Roles and permissions

| Role | Seeded access |
|---|---|
| super_admin | All seeded permissions |
| admin | All operational, analytics, audit, finance, event, user, role, and settings permissions |
| finance_manager | expense:approve, expense:manage_all, analytics:view |
| content_manager | event:create, event:edit, event:view, guidelines:manage, notification:broadcast |
| committee_member | event:create, event:edit, event:view, registration:view, registration:approve |
| event_coordinator | Event create/edit/view, registration view/approve, attendance manage |
| organizer | Event edit/view, registration view/approve, attendance manage, ticket:scan |
| moderator | chat:moderate, feedback:manage |
| check_in_staff | ticket:scan, attendance:manage |
| volunteer | ticket:scan |
| participant | Own/member endpoints; no special seeded permission |

Seeded actions: user:list, user:view, user:ban, user:delete, role:manage, settings:manage, group:create, group:manage, fest:manage, guidelines:manage, event:create, event:edit, event:delete, event:view, registration:view, registration:approve, workflow:configure, ticket:scan, attendance:manage, chat:moderate, notification:broadcast, expense:approve, expense:manage_all, file:manage, feedback:manage, gamification:manage, analytics:view, audit:view.

## Complete HTTP endpoint list

The source controllers declare 118 HTTP endpoints.

| Method | Path | What it does / required access |
|---|---|---|
| GET | / | Greeting; global auth currently applies |
| POST | /api/v1/auth/register | Public account creation |
| POST | /api/v1/auth/login | Public login and token issue |
| POST | /api/v1/auth/logout | Revoke refresh-token family |
| POST | /api/v1/auth/refresh | Public token rotation |
| POST | /api/v1/auth/change-password | Change password |
| POST | /api/v1/auth/forgot-password | Public reset request |
| POST | /api/v1/auth/reset-password | Public reset token |
| GET | /api/v1/auth/verify-email?token=... | Public email verification |
| POST | /api/v1/auth/resend-verification | New verification token |
| GET | /api/v1/users/me | Own profile and gamification |
| PATCH | /api/v1/users/me | Update own profile |
| DELETE | /api/v1/users/me | Deactivate own account |
| GET | /api/v1/users | Search users; user:list |
| GET | /api/v1/users/:id | User detail; user:view |
| PATCH | /api/v1/users/:id/status | Status; user:ban |
| GET | /api/v1/users/:id/roles | Roles; role:manage |
| POST | /api/v1/users/:id/roles | Assign role; role:manage |
| DELETE | /api/v1/users/:id/roles/:roleId | Remove role; role:manage |
| GET | /api/v1/organizations | List organizations |
| GET | /api/v1/organizations/:id | Organization detail |
| POST | /api/v1/organizations | Create; settings:manage |
| PATCH | /api/v1/organizations/:id | Update; settings:manage |
| PUT | /api/v1/organizations/:id/reg-format | Regex format; settings:manage |
| GET | /api/v1/groups | My groups |
| GET | /api/v1/groups/:id | Member-only group detail |
| POST | /api/v1/groups | Create; group:create |
| PATCH | /api/v1/groups/:id | Member-only rename |
| DELETE | /api/v1/groups/:id | Delete; group:create |
| GET | /api/v1/groups/:id/members | Member-only list |
| POST | /api/v1/groups/:id/members | Member-only add |
| DELETE | /api/v1/groups/:id/members/:userId | Member-only remove |
| GET | /api/v1/fests | Fest editions |
| GET | /api/v1/fests/active | Active fest |
| GET | /api/v1/fests/:id | Fest detail |
| POST | /api/v1/fests | Create; fest:manage |
| PATCH | /api/v1/fests/:id | Update; fest:manage |
| GET | /api/v1/fests/:id/guidelines | Read guidelines |
| PUT | /api/v1/fests/:id/guidelines | Update; guidelines:manage |
| GET | /api/v1/events | Filtered event list |
| GET | /api/v1/events/:id | Event detail |
| POST | /api/v1/events | Create; event:create |
| PATCH | /api/v1/events/:id | Update; event:edit |
| DELETE | /api/v1/events/:id | Soft-delete; event:delete |
| PATCH | /api/v1/events/:id/status | Status; event:edit |
| GET | /api/v1/events/:id/organizers | Organizers; event:view |
| POST | /api/v1/events/:id/organizers | Add organizer; event:edit |
| DELETE | /api/v1/events/:id/organizers/:userId | Remove organizer; event:edit |
| GET | /api/v1/events/:id/stats | Statistics; event:edit |
| GET | /api/v1/events/:id/form | Read form |
| PUT | /api/v1/events/:id/form | Replace form; event:edit |
| POST | /api/v1/events/:id/register | Register current user |
| GET | /api/v1/events/:id/registrations | Registrations; registration:view |
| GET | /api/v1/registrations/my | My registrations |
| GET | /api/v1/registrations/:id | Owner/organizer detail |
| PATCH | /api/v1/registrations/:id/status | Approve/reject; registration:approve |
| POST | /api/v1/events/:id/registrations/approve-all | Bulk approve |
| DELETE | /api/v1/registrations/:id | Delete own registration |
| GET | /api/v1/events/:id/registrations/export | Registration JSON export |
| GET | /api/v1/workflows | Definitions; workflow:configure |
| POST | /api/v1/workflows | Create; workflow:configure |
| GET | /api/v1/workflows/:id | Definition; workflow:configure |
| PATCH | /api/v1/workflows/:id | Update; workflow:configure |
| POST | /api/v1/workflow-instances/:id/action | Approver action |
| GET | /api/v1/workflow-instances/:id/history | History |
| GET | /api/v1/tickets/my | My tickets |
| GET | /api/v1/tickets/:id | Owner/global ticket detail |
| POST | /api/v1/tickets/:id/refresh-qr | New five-minute QR |
| POST | /api/v1/attendance/verify | QR verify; ticket:scan |
| POST | /api/v1/attendance/check-in | Check-in; attendance:manage |
| GET | /api/v1/events/:id/attendance | Attendance; attendance:manage |
| GET | /api/v1/notifications | Notification inbox |
| POST | /api/v1/notifications/read | Mark read |
| GET | /api/v1/notifications/preferences | Preferences |
| PUT | /api/v1/notifications/preferences | Update preferences |
| POST | /api/v1/device-tokens | Register FCM token |
| DELETE | /api/v1/device-tokens/:id | Delete FCM token |
| POST | /api/v1/files/upload-url | Signed PUT URL |
| POST | /api/v1/files/confirm | Confirm upload |
| GET | /api/v1/files/:id/download-url | Signed GET URL |
| POST | /api/v1/expenses | Create expense |
| GET | /api/v1/expenses/categories | Expense categories |
| GET | /api/v1/expenses/reports | Reports; expense:manage_all |
| GET | /api/v1/expenses/export | JSON export; expense:manage_all |
| GET | /api/v1/expenses | Own/all expenses |
| GET | /api/v1/expenses/:id | Owner/global detail |
| PATCH | /api/v1/expenses/:id/status | Review/resubmit |
| POST | /api/v1/feedback | Submit feedback |
| GET | /api/v1/feedback | Own/all feedback |
| PATCH | /api/v1/feedback/:id | Update; feedback:manage |
| GET | /api/v1/gamification/me | XP profile |
| GET | /api/v1/gamification/leaderboard | Leaderboard |
| GET | /api/v1/gamification/leaderboard/my-rank | Rank context |
| GET | /api/v1/gamification/badges | Badge catalogue |
| GET | /api/v1/gamification/badges/my | Earned badges |
| POST | /api/v1/gamification/streak/check-in | Daily check-in |
| POST | /api/v1/gamification/streak/freeze | Streak freeze |
| GET | /api/v1/admin/dashboard | Dashboard; analytics:view |
| GET | /api/v1/admin/users/stats | User stats; analytics:view |
| GET | /api/v1/admin/events/stats | Event stats; analytics:view |
| GET | /api/v1/admin/finance/stats | Finance stats; analytics:view |
| GET | /api/v1/admin/audit-logs | Audit search; audit:view |
| GET | /api/v1/admin/settings | Read settings; settings:manage |
| PATCH | /api/v1/admin/settings | Update settings; settings:manage |
| PUT | /api/v1/admin/reg-number-format | Registration format |
| GET | /api/v1/admin/events/:id/winners | Winners; analytics:view |
| POST | /api/v1/admin/events/:id/winners | Replace winners; event:edit |
| GET | /api/v1/admin/export/:type | JSON export; analytics:view |
| GET | /api/v1/conversations | My conversations |
| POST | /api/v1/conversations | Create direct/group chat |
| GET | /api/v1/conversations/:id | Member-only detail |
| GET | /api/v1/conversations/:id/messages | Cursor messages |
| POST | /api/v1/conversations/:id/messages | Send message |
| PATCH | /api/v1/messages/:id | Edit own message |
| DELETE | /api/v1/messages/:id | Soft-delete own message |
| POST | /api/v1/messages/:id/reactions | Add reaction |
| DELETE | /api/v1/messages/:id/reactions/:emoji | Remove reaction |
| POST | /api/v1/conversations/:id/read | Mark read |

## 1. Auth API

POST /api/v1/auth/register:

~~~
{
  "registrationNumber": "2023ABCD1234",
  "email": "student@college.edu",
  "password": "StrongPass123!",
  "firstName": "John",
  "lastName": "Doe"
}
~~~

Registration number, password, firstName, and lastName are required. Email is optional and must be valid. Password minimum is 8 characters. Returns accessToken and refreshToken. The participant role is assigned when seeded. Active-fest registration, ticket creation, and SYSTEM-group assignment are attempted asynchronously.

POST /api/v1/auth/login accepts registrationNumber and password and returns both tokens. Inactive users receive 401.

POST /api/v1/auth/logout and POST /api/v1/auth/refresh accept:

~~~
{ "refreshToken": "<refresh-token>" }
~~~

Logout revokes the token family. Refresh revokes the submitted token and returns a replacement pair. Replace both stored tokens after refresh.

POST /api/v1/auth/change-password accepts currentPassword and newPassword. It revokes all refresh sessions after success.

POST /api/v1/auth/forgot-password accepts registrationNumber and always returns a generic response. POST /api/v1/auth/reset-password accepts token and newPassword; reset tokens expire after 30 minutes and are single-use.

GET /api/v1/auth/verify-email?token=<token> consumes a 24-hour token and activates the user. POST /api/v1/auth/resend-verification has no body and requires an email on the current profile.

## 2. Users

- GET /api/v1/users/me returns safe user, profile, roles, XP, badges, and streak data.
- PATCH /api/v1/users/me accepts optional firstName, lastName, avatarUrl, bio, and phone. avatarUrl must be a URL and phone must be valid.
- DELETE /api/v1/users/me sets status to SUSPENDED and records deletedAt.
- GET /api/v1/users?q=<text>&page=1&limit=10 requires user:list and searches registration number, email, first name, and last name. Returns items and   pagination meta.
- GET /api/v1/users/:id requires user:view and returns safe details with roles, XP, and badges.
- PATCH /api/v1/users/:id/status requires user:ban. Body field status is ACTIVE, SUSPENDED, or BANNED.
- GET /api/v1/users/:id/roles and POST /api/v1/users/:id/roles require role:manage. Assignment body:

~~~
{ "roleName": "organizer" }
~~~

- DELETE /api/v1/users/:id/roles/:roleId requires role:manage.
## 3. Files and direct object-storage uploads

The backend does not proxy file bytes. Use this flow: request a signed URL, upload directly to storage, then confirm.

POST /api/v1/files/upload-url body:

~~~
{
  "purpose": "event_banner",
  "contentType": "image/jpeg",
  "size": 245678,
  "fileName": "banner.jpg"
}
~~~

Purposes and maximum sizes: avatar 5 MB, event_banner 10 MB, chat_image 15 MB, chat_video 50 MB, document 25 MB, receipt 10 MB.

The response contains fileId, uploadUrl, key, and expiresAt. The signed PUT URL expires after approximately 10 minutes. Upload with the same Content-Type and Content-Length used in the request.

POST /api/v1/files/confirm body:

~~~
{ "fileId": "<file-id>" }
~~~

The backend checks the object with HeadObject and changes status from PENDING to CONFIRMED. It is idempotent for an already confirmed file.

GET /api/v1/files/:id/download-url returns fileId, stored url, signed downloadUrl, and an expiry approximately five minutes ahead. Use downloadUrl for private access.

Example:

~~~
const request = await fetch(API_URL + '/api/v1/files/upload-url', {
  method: 'POST',
  headers: {
    Authorization: 'Bearer ' + accessToken,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    purpose: 'avatar',
    contentType: file.type,
    size: file.size,
    fileName: file.name
  })
}).then(r => r.json());

await fetch(request.data.uploadUrl, {
  method: 'PUT',
  headers: {
    'Content-Type': file.type,
    'Content-Length': String(file.size)
  },
  body: file
});

await fetch(API_URL + '/api/v1/files/confirm', {
  method: 'POST',
  headers: {
    Authorization: 'Bearer ' + accessToken,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ fileId: request.data.fileId })
});
~~~

## 4. Expenses

POST /api/v1/expenses creates DRAFT, or PENDING when submit is true.

~~~
{
  "categoryId": "<category-id>",
  "eventId": "<optional-event-id>",
  "amount": 1500,
  "description": "Poster printing",
  "receiptFileId": "<confirmed-file-id>",
  "submit": true
}
~~~

categoryId, amount, and description are required. Amount must be positive. receiptFileId must belong to the caller and be CONFIRMED.

- GET /api/v1/expenses/categories returns categories alphabetically.
- GET /api/v1/expenses?page=1&limit=20&status=PENDING&eventId=<id>&categoryId=<id> returns own expenses, or all for expense:manage_all.
- GET /api/v1/expenses/:id is owner/global-manager only.
- PATCH /api/v1/expenses/:id/status accepts APPROVED, REJECTED, NEEDS_REVISION, or PENDING.

~~~
{ "status": "NEEDS_REVISION", "comment": "Please attach the invoice." }
~~~

Global managers review. Owners can resubmit only DRAFT or NEEDS_REVISION to PENDING. comment is required for REJECTED and NEEDS_REVISION.

- GET /api/v1/expenses/reports requires expense:manage_all and returns totals by status/category/event and approved grand total.
- GET /api/v1/expenses/export requires expense:manage_all and returns JSON rows ready for client-side CSV or Excel creation.

## 5. Feedback

POST /api/v1/feedback:

~~~
{
  "category": "EVENT",
  "content": "The schedule was easy to follow.",
  "anonymous": false
}
~~~

Categories: EVENT, APP, ORGANIZER, GENERAL, BUG. Anonymous submissions store no userId.

- GET /api/v1/feedback?status=NEW&category=BUG&page=1&limit=20 returns own feedback for normal users and all feedback for feedback:manage. Non-admin responses hide user identity.
- PATCH /api/v1/feedback/:id requires feedback:manage.

~~~
{
  "status": "RESOLVED",
  "adminResponse": "This has been fixed."
}
~~~

Allowed statuses: REVIEWED, RESOLVED, DISMISSED.

## 6. Gamification

- GET /api/v1/gamification/me returns XP, level/name, next-level threshold, rank, earned badges, and streak.
- GET /api/v1/gamification/leaderboard?page=1&limit=50 returns the cached leaderboard. Maximum limit is 100; cache refreshes every five minutes.
- GET /api/v1/gamification/leaderboard/my-rank returns rank, XP gap, and nearby entries.
- GET /api/v1/gamification/badges returns badge definitions.
- GET /api/v1/gamification/badges/my returns earned badges, totals, and completion percentage.
- POST /api/v1/gamification/streak/check-in has no body. It awards daily +10 XP, is idempotent for the UTC day, increments the streak, and applies day 7/day 30 bonuses. Midnight-to-04:00 check-ins can earn Night Owl.
- POST /api/v1/gamification/streak/freeze has no body. It consumes one freeze without increasing the streak. It returns 409 if already checked in today and 400 if no freezes remain.

Seeded badges: First Blood, Fire Starter, Event Royalty, Sharpshooter, Speedster, Night Owl, Champion, Digital Native.

## 7. Admin and analytics

All admin endpoints require a valid access token and explicitly check permissions.

- GET /api/v1/admin/dashboard requires analytics:view. Returns user, event, finance, feedback, leaderboard, and generatedAt KPIs.
- GET /api/v1/admin/users/stats?search=john&page=1&limit=50 requires analytics:view. Returns users, pagination meta, status breakdown, and newThisMonth.
- GET /api/v1/admin/events/stats requires analytics:view. Returns event registration/attendance, fill rates, attendance rates, and category/status summaries.
- GET /api/v1/admin/finance/stats requires analytics:view. Returns status/category/event aggregates and pending approvals.
- GET /api/v1/admin/audit-logs requires audit:view. Query: actorId, action, resourceType, resourceId, from, to, page, limit. Dates are ISO strings.
- GET /api/v1/admin/settings requires settings:manage. Returns a settings key-value map and updatedAt.
- PATCH /api/v1/admin/settings requires settings:manage.

~~~
{
  "settings": {
    "fest.registrationOpen": "true",
    "app.maintenanceMode": "false"
  }
}
~~~

Existing keys are updated and missing keys created.

- PUT /api/v1/admin/reg-number-format requires settings:manage.

~~~
{
  "format": "TG-{YEAR}-{BRANCH}-{SEQ:4}",
  "prefix": "TG"
}
~~~

Supported placeholders: YEAR, BRANCH, BATCH, SEQ, and SEQ:N. Returns saved values and a preview.

- GET /api/v1/admin/events/:id/winners requires analytics:view.
- POST /api/v1/admin/events/:id/winners requires event:edit and replaces all winners atomically.

~~~
{
  "winners": [
    {
      "userId": "<participant-user-id>",
      "position": 1,
      "prize": "Cash Prize INR 5000",
      "note": "Best overall project"
    }
  ]
}
~~~

Each winner must be an APPROVED or CHECKED_IN participant and positions must be unique.

- GET /api/v1/admin/export/:type requires analytics:view. Valid types: users, events, registrations, expenses, attendance, feedback. Returns structured JSON, not a file stream.

## 8. Chat REST API

All chat endpoints require authentication. Conversation and message operations require membership or ownership.

### Conversations

- GET /api/v1/conversations returns the caller's conversations sorted by latest activity. It includes members, lastMessage, lastReadAt, and unreadCount. The current service returns unreadCount as 0.
- POST /api/v1/conversations creates a direct or group conversation.

Direct body:

~~~
{
  "type": "DIRECT",
  "memberIds": ["<other-user-id>"]
}
~~~

A direct conversation must have exactly two unique members including the caller. An existing direct conversation is returned instead of creating a duplicate.

Group body:

~~~
{
  "type": "GROUP",
  "name": "Hackathon Team Alpha",
  "memberIds": ["<user-id-1>", "<user-id-2>"]
}
~~~

GROUP requires name.

- GET /api/v1/conversations/:id returns details for members.

### Messages and reactions

- GET /api/v1/conversations/:id/messages?before=<message-id>&limit=30 returns member-only cursor pages. Effective limit is capped at 100. Messages are oldest-first within the returned page and the response includes nextCursor.
- POST /api/v1/conversations/:id/messages sends a message.

~~~
{
  "content": "Hello team",
  "type": "TEXT",
  "replyToId": "<optional-message-id>",
  "attachments": [
    { "fileUrl": "https://cdn.example/file.jpg", "fileType": "image/jpeg", "fileSize": 245678 }
  ]
}
~~~

Message types: TEXT, IMAGE, VIDEO, FILE. content is required. replyToId must belong to the same conversation.

- PATCH /api/v1/messages/:id edits the owner's message; content maximum is 4096 characters.
- DELETE /api/v1/messages/:id soft-deletes the owner's message.
- POST /api/v1/messages/:id/reactions accepts an emoji.

~~~
{ "emoji": "👍" }
~~~

Emoji maximum is 10 characters. Duplicate same-user/same-emoji reactions return 409.

- DELETE /api/v1/messages/:id/reactions/:emoji removes the caller's reaction.
- POST /api/v1/conversations/:id/read updates the caller's lastReadAt.

## 9. Socket.IO real-time chat

Namespace: /ws

~~~
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000/ws', {
  transports: ['websocket', 'polling']
});

socket.emit('authenticate', { token: accessToken });
socket.on('authenticated', console.log);
socket.on('error', console.error);
~~~

Client-to-server events:

| Event | Payload | Behavior |
|---|---|---|
| authenticate | { token } | Verifies token and joins user/conversation rooms |
| message:send | { conversationId, content, type?, replyToId?, attachments? } | Stores and broadcasts message:new |
| message:typing | { conversationId, isTyping } | Sends typing state to other members |
| message:read | { conversationId, messageId } | Updates read state and broadcasts receipt |
| presence:update | { status } | Broadcasts presence |

Server-to-client events:

| Event | Payload |
|---|---|
| authenticated | { userId, joinedRooms } |
| message:new | { message } |
| message:updated | { message } |
| message:deleted | { messageId } |
| message:reaction_added | { messageId, reaction } |
| message:reaction_removed | { messageId, userId, emoji } |
| message:read | { conversationId, userId, messageId?, readAt? } |
| message:typing | { conversationId, userId, isTyping } |
| presence:changed | { userId, status, lastSeen } |
| error | { message } |

REST-created messages are also emitted to the conversation room.

## 10. Important implementation caveats

1. Root GET / is not marked Public, so the global guard may require authentication even though the e2e test expects an unauthenticated Hello World response.
2. Password-reset and email-verification email delivery is TODO. Development logs generated tokens; production delivery must be connected.
3. Form answers are stored without server-side validation against the form schema.
4. Registration, expense, and admin exports return JSON arrays; they do not stream CSV or XLSX.
5. Services reference global permissions ticket:manage_all, registration:manage_all, event:manage_all, attendance:manage_all, and workflow:manage_all, but these are not seeded. Add them if needed.
6. Config exposes storage.publicUrl, while the file service reads storage.publicBaseUrl. Align the keys before relying on returned stored URLs.
7. REST JWT creation/strategy uses JWT_ACCESS_SECRET, but Socket.IO currently verifies RS256 with jwt.publicKey, which is not configured. Align the algorithm and secret before production WebSocket authentication.
8. Signed uploads require the exact Content-Type and file size used to request the URL, and storage CORS must allow the frontend origin.


## 11. Organizations, groups, and fests

### Organizations

- GET /api/v1/organizations lists organizations with colleges and branches.
- GET /api/v1/organizations/:id returns one organization with colleges and branches.
- POST /api/v1/organizations requires settings:manage.

~~~
{ "name": "MIT Muzaffarpur", "domain": "mit.edu" }
~~~

- PATCH /api/v1/organizations/:id requires settings:manage; name and domain are optional.
- PUT /api/v1/organizations/:id/reg-format requires settings:manage.

~~~
{
  "regex": "^(\\d{4})(\\w{2})(\\w{2})(\\d{4})$",
  "formatMap": {
    "1": "batch_year",
    "2": "college_code",
    "3": "branch_code",
    "4": "roll_number"
  }
}
~~~

The regex is compiled before saving. formatMap maps capture groups to parsed registration-number fields used for SYSTEM-group auto-assignment.

### Groups

- GET /api/v1/groups returns the current user's groups, member counts, and join timestamps.
- GET /api/v1/groups/:id requires membership.
- POST /api/v1/groups requires group:create and adds the creator as a member.

~~~
{
  "name": "CSE 2024 Batch",
  "type": "CUSTOM",
  "autoAssignRule": { "branch_code": "CS", "batch_year": "2024" }
}
~~~

type is SYSTEM, CUSTOM, or EVENT. autoAssignRule is optional JSON.

- PATCH /api/v1/groups/:id requires membership and accepts optional name.
- DELETE /api/v1/groups/:id requires group:create and deletes members and the group.
- GET /api/v1/groups/:id/members requires membership.
- POST /api/v1/groups/:id/members requires membership and accepts userId.
- DELETE /api/v1/groups/:id/members/:userId requires membership.

### Fests

- GET /api/v1/fests returns fest editions with event and registration counts.
- GET /api/v1/fests/active returns the active fest or null.
- GET /api/v1/fests/:id returns one fest with counts.
- POST /api/v1/fests requires fest:manage.

~~~
{
  "name": "TechGram 2026",
  "year": 2026,
  "startDate": "2026-10-15T09:00:00Z",
  "endDate": "2026-10-17T18:00:00Z",
  "isActive": true
}
~~~

Dates must be ISO strings. Activating a fest deactivates other active fests.

- PATCH /api/v1/fests/:id requires fest:manage and accepts optional create fields.
- GET /api/v1/fests/:id/guidelines returns id, name, and guidelines.
- PUT /api/v1/fests/:id/guidelines requires guidelines:manage and accepts guidelines.

## 12. Events, forms, and registrations

### Events

GET /api/v1/events supports page, limit, search, category, status, and festId. It returns items and meta, ordered by startDate ascending, and excludes soft-deleted events.

POST /api/v1/events requires event:create:

~~~
{
  "festId": "<fest-id>",
  "name": "Hackathon 2026",
  "description": "A 24-hour hackathon.",
  "category": "Technical",
  "startDate": "2026-10-15T10:00:00Z",
  "endDate": "2026-10-16T10:00:00Z",
  "venue": "Main Auditorium",
  "maxParticipants": 100,
  "minTeamSize": 1,
  "maxTeamSize": 4,
  "isPublic": true,
  "bannerUrl": "https://example.com/banner.jpg"
}
~~~

The creator becomes PRIMARY organizer. A basic form and EVENT group are created automatically.

- GET /api/v1/events/:id returns event, fest, and safe organizer users.
- PATCH /api/v1/events/:id requires event:edit and organizer access unless event:manage_all is present. All event fields except festId are optional.
- DELETE /api/v1/events/:id requires event:delete and sets deletedAt/status ARCHIVED.
- PATCH /api/v1/events/:id/status requires event:edit and organizer access. Body has status.

Allowed statuses: DRAFT, PUBLISHED, REGISTRATION_OPEN, REGISTRATION_CLOSED, STARTED, COMPLETED, ARCHIVED.

- GET /api/v1/events/:id/organizers requires event:view.
- POST /api/v1/events/:id/organizers requires event:edit and PRIMARY organizer/global access. Body has userId and role, where role is PRIMARY or SECONDARY.
- DELETE /api/v1/events/:id/organizers/:userId requires event:edit and PRIMARY organizer/global access. The last PRIMARY organizer cannot be removed.
- GET /api/v1/events/:id/stats requires event:edit and organizer/global access. Returns totalRegistrations, statusBreakdown, and checkedIn.

### Forms

- GET /api/v1/events/:id/form returns schema, isActive, and version.
- PUT /api/v1/events/:id/form requires event:edit and organizer/global access. It replaces the schema and increments version.

~~~
{
  "schema": [
    {
      "name": "team_name",
      "label": "Team Name",
      "type": "text",
      "validation": { "required": true, "min": 3, "max": 80 }
    },
    {
      "name": "track",
      "label": "Track",
      "type": "dropdown",
      "validation": { "required": true, "options": ["AI", "Web"] }
    }
  ],
  "isActive": true
}
~~~

Supported types: text, number, email, phone, dropdown, radio, checkbox, date, file, image, textarea, url, team_member. Validation keys: required, min, max, pattern, options, allowed_types, max_size_mb.

Current limitation: registration stores answers but does not validate them against this schema.

### Registrations

POST /api/v1/events/:id/register registers the current user only when event status is REGISTRATION_OPEN.

~~~
{
  "answers": {
    "team_name": "TechTitans",
    "members": ["A", "B"]
  }
}
~~~

It checks capacity and duplicate registration, creates a form submission and PENDING registration, and starts the Event Registration Approval workflow if that definition exists.

- GET /api/v1/events/:id/registrations requires registration:view and event organizer/global registration:manage_all. Returns users, profiles, submissions, and answers.
- GET /api/v1/registrations/my returns the current user's registrations with event summaries.
- GET /api/v1/registrations/:id permits owner, organizer, or global registration manager.
- PATCH /api/v1/registrations/:id/status requires registration:approve and organizer/global access.

~~~
{
  "status": "APPROVED",
  "rejectionReason": "Does not meet minimum requirements."
}
~~~

Allowed statuses: PENDING, APPROVED, REJECTED, WAITLISTED, CANCELLED, CHECKED_IN, COMPLETED. rejectionReason is required for REJECTED.

- POST /api/v1/events/:id/registrations/approve-all requires registration:approve and changes all PENDING registrations to APPROVED.
- DELETE /api/v1/registrations/:id is owner-only and permanently deletes the registration in the current implementation.
- GET /api/v1/events/:id/registrations/export requires registration:view and returns JSON rows, not a CSV stream.

## 13. Workflows

- GET /api/v1/workflows requires workflow:configure and lists definitions/stages.
- POST /api/v1/workflows requires workflow:configure.

~~~
{
  "name": "Two-Step Approval",
  "stages": [
    { "name": "Initial Review", "orderIndex": 1, "approverRole": "PRIMARY" },
    { "name": "Final Review", "orderIndex": 2, "approverRole": "PRIMARY" }
  ]
}
~~~

- GET /api/v1/workflows/:id requires workflow:configure.
- PATCH /api/v1/workflows/:id requires workflow:configure and can replace stages.
- POST /api/v1/workflow-instances/:id/action executes an approver action.

~~~
{ "action": "APPROVE", "comments": "Looks good to me." }
~~~

Actions: APPROVE, REJECT, RETURN, ESCALATE, SKIP. Final APPROVE/SKIP completes a registration workflow and approves its registration. REJECT cancels the workflow and rejects the registration. RETURN cannot be used at the first stage. ESCALATE is recorded but has no assignment behavior yet.

- GET /api/v1/workflow-instances/:id/history returns chronological actions with actor summaries. Current service performs only a basic existence check.

## 14. Tickets and attendance

- GET /api/v1/tickets/my returns own tickets and fest summaries without qrSecret.
- GET /api/v1/tickets/:id returns detail and approvedEvents for the owner or global ticket manager.
- POST /api/v1/tickets/:id/refresh-qr returns a QR JWT and expiry approximately five minutes ahead.

~~~
{
  "qrToken": "<short-lived-jwt>",
  "expiresAt": "2026-10-15T10:05:00.000Z"
}
~~~

- POST /api/v1/attendance/verify requires ticket:scan and validates a QR without recording attendance.

~~~
{ "qrToken": "<qr-token>" }
~~~

- POST /api/v1/attendance/check-in requires attendance:manage and organizer/global access.

~~~
{
  "eventId": "<event-id>",
  "qrToken": "<qr-token>"
}
~~~

The ticket user must be registered with status APPROVED, COMPLETED, or CHECKED_IN. Duplicate scans return 409 with ALREADY_CHECKED_IN. APPROVED registrations become CHECKED_IN.

- GET /api/v1/events/:id/attendance requires attendance:manage and organizer/global access; returns newest scans first.

## 15. Notifications

- GET /api/v1/notifications?page=1&limit=20&unreadOnly=true returns items/meta with unreadCount.
- POST /api/v1/notifications/read accepts ids. Omit ids or send an empty array to mark all unread as read.
- GET /api/v1/notifications/preferences returns defaults for all supported types.
- PUT /api/v1/notifications/preferences accepts a preferences array.

~~~
{
  "preferences": [
    {
      "type": "EVENT_UPDATED",
      "inAppEnabled": true,
      "pushEnabled": false,
      "emailEnabled": true
    }
  ]
}
~~~

Supported types: REGISTRATION_APPROVED, REGISTRATION_REJECTED, EVENT_REMINDER, EVENT_UPDATED, EXPENSE_APPROVED, EXPENSE_REJECTED, ANNOUNCEMENT, CHAT_MESSAGE, BADGE_EARNED, LEVEL_UP, WORKFLOW_ACTION_REQUIRED, TICKET_GENERATED.

- POST /api/v1/device-tokens accepts token and platform. Platform is IOS, ANDROID, or WEB. The token is upserted.
- DELETE /api/v1/device-tokens/:id removes the caller's token.

Push requires FCM_SERVICE_ACCOUNT_JSON. Notification jobs use Redis/BullMQ.

