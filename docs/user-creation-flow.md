# User Creation Flow

## Call Stack

```
UsersPage
  └─ AddUserForm
       └─ useCreateUser (mutation)
            └─ createUser service
                 └─ POST /api/users  (axios + cookie)
                      └─ protect middleware   → reads JWT from cookie
                      └─ authorize middleware → checks role in JWT
                      └─ createUser controller
                           └─ User.create()  → MongoDB
```

---

## Step 1 — Button click → open form

**`frontend/src/modules/users/pages/users.page.tsx`**

```ts
const canCreate = actorRole === "SUPER_ADMIN" || actorRole === "ADMIN" || actorRole === "TEAM_LEAD";
// "Add" button only renders if canCreate is true
```

The `+` button is hidden entirely for AGENT / QA.

---

## Step 2 — Form renders with filtered roles

**`frontend/src/components/add-user-form.tsx`**

```ts
const actorRole    = useAuthStore((s) => s.user?.role ?? "");
const allowedRoles = getCreatableRoles(actorRole);  // from role-permissions.ts
const canEditRole  = actorRole === "SUPER_ADMIN" || actorRole === "ADMIN";
```

The role `<select>` only shows roles from `allowedRoles`:

| Actor | Visible roles |
|---|---|
| SUPER_ADMIN | SUPER_ADMIN, ADMIN, TEAM_LEAD, AGENT, QA |
| ADMIN | TEAM_LEAD, AGENT, QA |
| TEAM_LEAD | AGENT, QA |

---

## Step 3 — Client-side validation

**`frontend/src/components/add-user-form.tsx`** — `validate()`

Checks before hitting the network:
- `fullName` — required
- `email` — required + format check
- `password` — min 8 characters
- `phone` — required

Returns early with field-level errors if invalid.

---

## Step 4 — Mutation fires

**`frontend/src/modules/users/hooks/use-users.ts`** — `useCreateUser`

```ts
createUser.mutate({ fullName, email, phone, password, role, status })
```

Wraps React Query `useMutation`. On success calls `qc.invalidateQueries(["users"])` to refresh the list automatically.

---

## Step 5 — HTTP request

**`frontend/src/modules/users/services/user.service.ts`**

```ts
api.post("/users", payload)   // axios instance with withCredentials: true
```

`api` is an `axios.create` instance pointed at `VITE_API_URL`. The browser automatically attaches the `accessToken` cookie.

---

## Step 6 — `protect` middleware (JWT check)

**`backend/src/middleware/auth.middleware.ts`**

Reads `req.cookies.accessToken`, verifies with `JWT_SECRET`, attaches `{ id, role, username }` to `req.user`.  
Returns `401` if cookie is missing or token is expired.

---

## Step 7 — `authorize` middleware (coarse role gate)

**`backend/src/modules/user/user.route.ts`**

```ts
router.post("/", protect, authorize("SUPER_ADMIN", "ADMIN", "TEAM_LEAD"), createUser);
```

Rejects AGENT / QA with `403 Forbidden` before the controller runs.

---

## Step 8 — Zod validation

**`backend/src/modules/user/user.controller.ts`** — `createUser`

Validates payload shape. `role` must be one of the 5 valid enum values or Zod returns `400`.

---

## Step 9 — RBAC fine-grain check

**`backend/src/modules/user/user.controller.ts`** — `ROLE_PERMISSIONS`

```ts
const allowed = ROLE_PERMISSIONS[actorRole]?.canCreate ?? [];
if (!allowed.includes(role)) → 403
```

Even if the actor passed `authorize`, they cannot assign a role above their tier:
- ADMIN + `role: "SUPER_ADMIN"` → `403`
- TEAM_LEAD + `role: "ADMIN"` → `403`

Permission map (also mirrored in `frontend/src/utils/role-permissions.ts`):

```ts
SUPER_ADMIN: { canCreate: ["SUPER_ADMIN", "ADMIN", "TEAM_LEAD", "AGENT", "QA"] }
ADMIN:       { canCreate: ["TEAM_LEAD", "AGENT", "QA"] }
TEAM_LEAD:   { canCreate: ["AGENT", "QA"] }
```

---

## Step 10 — Duplicate email check

Returns `409 Conflict` if the email already exists in the database.

---

## Step 11 — Username generation

```ts
baseUsername = email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "")
// "john.doe@example.com" → "johndoe"
// If taken, appends last 4 digits of Date.now()
```

---

## Step 12 — `User.create()` → MongoDB

**`backend/src/modules/user/user.model.ts`**

The `pre("save")` hook fires and bcrypt-hashes the password (cost factor 12) before writing.  
Returns `201` with the created user object — password is never included in the response.

---

## Step 13 — Cache invalidation & UI update

React Query invalidates `["users"]` on `201` success. The list refetches and the new user appears. `onClose()` closes the form panel.

---

## Error Path Summary

| Layer | HTTP | Reason |
|---|---|---|
| `protect` | 401 | No cookie / expired JWT |
| `authorize` | 403 | AGENT or QA role |
| Zod | 400 | Bad payload shape |
| RBAC map | 403 | Role above actor's tier |
| Duplicate | 409 | Email already exists |
| `pre save` | — | bcrypt hash (transparent to caller) |

---

## Key Files

| File | Role |
|---|---|
| `frontend/src/modules/users/pages/users.page.tsx` | Renders Add button, controls modal state |
| `frontend/src/components/add-user-form.tsx` | Form UI, client validation, mutation call |
| `frontend/src/utils/role-permissions.ts` | Frontend RBAC config |
| `frontend/src/modules/users/hooks/use-users.ts` | React Query mutation + cache invalidation |
| `frontend/src/modules/users/services/user.service.ts` | Axios call |
| `frontend/src/services/api.ts` | Axios instance (base URL + credentials) |
| `backend/src/middleware/auth.middleware.ts` | JWT verify + role gate |
| `backend/src/modules/user/user.route.ts` | Route + middleware chain |
| `backend/src/modules/user/user.controller.ts` | RBAC map, Zod validation, DB write |
| `backend/src/modules/user/user.model.ts` | Schema, bcrypt pre-save hook |
