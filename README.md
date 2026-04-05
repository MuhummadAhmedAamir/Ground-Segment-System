# Ground Segment System (Simulation)

## Group 3

### Team Members

* **Muhammad Ahmed Aamir**
* **Abdul Rafay**

---

# Project Overview

This project simulates **ground segment** work for satellite mission control: managing missions and satellites, running debris checks, planning maneuvers, and coordinating passes with ground stations (dishes, communication windows, transmissions).

Main areas covered:

* Mission and satellite lifecycle
* Satellite state / status
* Debris observation (same-orbit comparisons, warnings)
* Maneuver plans and execution
* Ground communication (dish angle, window open, start/end transmission)
* Telemetry (schema / logging as in the database)

Course themes we tried to show: **transactions**, **indexes**, **RBAC**, and **relational modeling**.

---

# Tech Stack

| Part | Stack |
| :--- | :--- |
| Backend | Node.js, Express |
| Frontend | React (Vite) |
| Database | PostgreSQL |
| Auth | JWT |
| Passwords | bcrypt |

We connect to Postgres with `pg` using `DATABASE_URL`. Supabase is optional depending on how you host the DB.

---

# Architecture

Roughly three layers:

```
React (dev: port 5173)
        → REST + JWT
Express API (port 3000)
        → SQL via pg pool
PostgreSQL
```

Login hits the API; the server checks the password hash and returns a JWT. Protected routes read `Authorization: Bearer …` and enforce roles.

---

# UI (screenshots TBD)

**Login** — username/password; token kept client-side for API calls.

**Mission engineer** — missions list, satellites list (active/inactive), create mission/satellite, debris table for a selected satellite, maneuver (create plan + execute), form to send requests to ground control.

**Ground controller** — satellite list, dish select, +/− angle, window check, OPEN indicator, start/end transmission, inbox for MCE requests (load / failed / successful).

---

# Setup

**Needs:** Node 18+, PostgreSQL 14+, npm.

**Env:** `backend/.env`:

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_SECRET=your_secret_key
```

**DB:** From the repo root (adjust paths if needed):

```bash
psql "$DATABASE_URL" -f database/schema.sql
psql "$DATABASE_URL" -f database/seed.sql
```

**Run**

```bash
cd backend && npm install && node server.js
```

```bash
cd frontend && npm install && npm run dev
```

Backend: http://localhost:3000 — Frontend: http://localhost:5173 (Vite proxies API paths in dev).

---

# Roles

| Value in `users.role` | What it’s for |
| :--- | :--- |
| `MISSION_ENGINEER` | Missions, satellites, debris, plans, maneuvers, MCE→GC requests |
| `GROUND_STATION_OPERATOR` | Pass / comms UI, dishes, GC request queue |
| `DATA_ANALYST` | Placeholder for analyst features |

**Test logins** (roles in the DB must match the strings above):

| | Username | Password |
| :--- | :--- | :--- |
| Ground | Abdul Rafay | bscs24003 |
| Mission engineer | Ahmed | bscs24070 |
| Analyst | Aamir | bscs24000 |

---

# Features (main endpoints)

**Auth:** `POST /auth/login` — `{ username, password }` → `{ token }`.

**Missions:** `GET /missions`, `POST /missions`, `POST /missions/:mission_id/satellites`.

**Satellites:** `GET /satellite/:sat_id/status`, `GET /satellite/engineer/all` (engineer UI), `GET /satellite/` (ground UI).

**Debris:** `POST /debris/check/:sat_id` (engineer, JWT) — returns observation rows + warnings.

**Maneuvers:** `POST /plan` (create), `GET /plan/pending/satellite/:sat_id`, `POST /maneuver/:plan_id/execute`.

**Comms:** `POST /window/check`, `POST /window`, `POST /window/dish`, `POST /window/begin`, `POST /window/end`, `GET /ground/dishes`.

**MCE → GC:** `GET /gc-requests`, `POST /gc-requests`, `PATCH /gc-requests/:id` with `{ status: "failed" | "successful" }`.  
Note: requests are stored **in memory** for now; they disappear if you restart the server.

---

# Transactions (ACID)

Maneuvers and several ground-segment operations run inside DB transactions (`BEGIN` / `COMMIT` / `ROLLBACK`). If something fails (e.g. fuel check on a maneuver), changes are rolled back instead of leaving half-updated state.

---

# Indexes

We added indexes for heavier queries (telemetry `val`, debris by orbit/risk, satellite state, access_time, etc.). Details and before/after timings are in the SQL / performance write-up for the course.

---

# API cheat sheet

| Method | Path | Notes |
| :--- | :--- | :--- |
| POST | `/auth/login` | Public |
| GET | `/missions` | Engineer |
| POST | `/missions` | Engineer |
| POST | `/missions/:id/satellites` | Engineer |
| GET | `/satellite/:sat_id/status` | Engineer |
| GET | `/satellite/engineer/all` | Engineer |
| GET | `/satellite/` | Ground |
| POST | `/debris/check/:sat_id` | Engineer |
| POST | `/plan` | Engineer |
| GET | `/plan/pending/satellite/:sat_id` | Engineer |
| POST | `/maneuver/:plan_id/execute` | Engineer |
| POST | `/window/check` | Engineer or ground |
| POST | `/window` | Same |
| POST | `/window/dish` | Same |
| POST | `/window/begin` | Same |
| POST | `/window/end` | Same |
| GET | `/ground/dishes` | Ground |
| GET | `/gc-requests` | Engineer + ground |
| POST | `/gc-requests` | Engineer |
| PATCH | `/gc-requests/:id` | Ground |

More detail may also be in `swagger.yaml` if the group keeps it updated.

---

# Limitations

* Orbits and physics are simplified, not production-grade.
* Fuel / maneuver math is a rough model for the simulation.
* GC request queue is in-memory only until someone backs it with a real table.
* Extra design notes: see `Backend_Explanation.pdf` if included in the submission.
