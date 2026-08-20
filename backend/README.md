# Sentinel AI — Backend

Node.js / Express / MongoDB backend for the Sentinel AI infrastructure risk-monitoring platform. Backs the existing React frontend in `../src` (dashboard, live upload demo, reports).

## Tech stack

Node.js · Express · MongoDB (Mongoose) · JWT · bcrypt · Multer · Joi

## Project structure

```
src/
├── config/       # env loading, MongoDB connection
├── models/       # Mongoose schemas (User, Asset, Inspection, PriorityItem, Report)
├── controllers/  # thin HTTP handlers
├── services/     # business logic (incl. services/ml/mockInferenceService.js)
├── routes/       # Express routers
├── middleware/   # auth, roles, upload, validation, error handling, rate limiting
├── validators/   # Joi schemas
├── utils/        # ApiError, asyncHandler, apiResponse, severity helper
├── app.js        # Express app assembly
└── server.js     # entrypoint — connects DB, starts HTTP server
uploads/inspections/  # uploaded inspection images (gitignored)
```

## Setup

```bash
cd backend
npm install
cp .env.example .env   # fill in JWT_SECRET and MONGO_URI
npm run dev
```

Requires a running MongoDB instance reachable at `MONGO_URI` (defaults to `mongodb://localhost:27017/sentinel-ai`).

There is no public admin signup — `POST /api/auth/register` only allows `inspector`/`viewer` roles. To create the first `admin`, either insert one directly in MongoDB (hash the password with bcrypt) or register a normal account and promote it via `PATCH /api/users/:id/role` from an existing admin.

## Environment variables

| Variable | Purpose | Default |
|---|---|---|
| `PORT` | HTTP port | `5000` |
| `NODE_ENV` | `development` / `production` | `development` |
| `MONGO_URI` | MongoDB connection string | — (required) |
| `JWT_SECRET` | JWT signing secret | — (required) |
| `JWT_EXPIRES_IN` | JWT lifetime | `7d` |
| `CLIENT_URL` | Allowed CORS origin (the frontend) | `http://localhost:5173` |
| `MAX_UPLOAD_SIZE_MB` | Max inspection image size | `10` |
| `UPLOAD_DIR` | Local upload storage directory | `uploads` |

## Auth & roles

JWT bearer auth (`Authorization: Bearer <token>`). Three roles:

- **admin** — full access, including user management and deletes.
- **inspector** — can create assets, upload/analyze inspections, add priority-queue items, generate reports.
- **viewer** — read-only across all resources.

All `/api/*` routes require a valid token except `POST /api/auth/register` and `POST /api/auth/login`.

## AI/ML integration

Defect detection + risk scoring is currently a **mock inference service** (`src/services/ml/mockInferenceService.js`) — it returns plausible randomized detections and a composite risk score. This is a deliberately isolated seam: swapping in a real YOLO/XGBoost model service later only requires changing `analyzeImage()` in that one file to call an external HTTP service; nothing else in the codebase needs to change.

## API reference

All responses: `{ success, message, data }` on success, `{ success: false, message, error }` on failure.

### Auth — `/api/auth`
| Method | Endpoint | Auth | Body | Purpose |
|---|---|---|---|---|
| POST | `/register` | Public | `{name, email, password, role?}` | Create inspector/viewer account |
| POST | `/login` | Public | `{email, password}` | Authenticate, get JWT |
| GET | `/me` | Any | — | Current user profile |

### Users — `/api/users` (admin management)
| Method | Endpoint | Auth | Body | Purpose |
|---|---|---|---|---|
| GET | `/` | admin | query: `role, page, limit` | List users |
| GET | `/:id` | admin or self | — | Get one user |
| PATCH | `/:id/role` | admin | `{role}` | Change a user's role |
| DELETE | `/:id` | admin | — | Delete a user |

### Assets — `/api/assets`
| Method | Endpoint | Auth | Body | Purpose |
|---|---|---|---|---|
| GET | `/` | Any | query: `type, severity, minRisk, page, limit` | List assets (heatmap/list) |
| GET | `/:id` | Any | — | Asset detail + recent inspections |
| POST | `/` | admin, inspector | `{assetId, type, location, coordinates:{x,y}}` | Register new asset |
| PATCH | `/:id` | admin | partial asset fields | Update asset |
| DELETE | `/:id` | admin | — | Delete asset (cascades inspections + priority items) |

### Inspections — `/api/inspections`
| Method | Endpoint | Auth | Body | Purpose |
|---|---|---|---|---|
| POST | `/` | admin, inspector | `multipart/form-data`: `image` file + `assetId` OR `type/location/coordinatesX/coordinatesY` | Upload image, run mock analysis, update asset risk |
| GET | `/` | Any | query: `asset, status, page, limit` | List inspections |
| GET | `/:id` | Any | — | Inspection detail (detections, bounding boxes) |
| DELETE | `/:id` | admin | — | Delete inspection (removes file, recomputes asset risk) |

### Priority Queue — `/api/priority-queue`
| Method | Endpoint | Auth | Body | Purpose |
|---|---|---|---|---|
| GET | `/` | Any | query: `status, severity, page, limit` | Ranked queue (rank computed by score desc) |
| POST | `/` | admin, inspector | `{assetId, inspectionId?, defect, severity, score, action}` | Add queue item |
| PATCH | `/:id` | admin | `{status?, assignedTo?, action?}` | Assign/update/complete |
| DELETE | `/:id` | admin | — | Remove queue item |

### Dashboard — `/api/dashboard`
| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/summary` | Any | Aggregate: summary stats, risk distribution, defects breakdown, health trend |

### Reports — `/api/reports`
| Method | Endpoint | Auth | Body | Purpose |
|---|---|---|---|---|
| GET | `/` | Any | query: `type, page, limit` | List reports |
| GET | `/:id` | Any | — | Report detail/preview |
| POST | `/` | admin, inspector | `{type, title?}` (`type`: monthly\|critical\|road\|maintenance\|custom) | Generate a report snapshot from current data |
| DELETE | `/:id` | admin | — | Delete report |

### Static files
`GET /uploads/:path` — serves uploaded inspection images.

## Verified manually

Every endpoint above was exercised end-to-end during development: register/login for all three roles, role-gated 401/403 behavior, image upload → mock analysis → asset risk recompute, dashboard aggregation reflecting live data, priority-queue ranking, report generation pulling real stats/actions, cascade delete (asset → inspections + priority items + uploaded files), and error paths (validation, duplicate email, invalid ObjectId, unsupported file type, 404, rate-limit headers on auth routes). No route returns `passwordHash`.

## Frontend integration (not yet done)

The React app in `../src` still reads from `../src/data.js` (hardcoded mock data) and has no login UI. Follow-up work: replace those reads with `fetch`/`axios` calls to this API, add Login/Register pages, and store the JWT (e.g. in memory + `localStorage`) for `Authorization` headers.
