# Ground Segment System (Simulation)
## Group 3

### Team Members
* **Muhammad Ahmed Aamir**
* **Abdul Rafay**

---

# Project Overview

The **Ground Segment System (Simulation)** is a database-driven system designed to simulate the **ground segment operations of a satellite mission control infrastructure**.

The system models how mission control centers manage satellites, perform orbital maneuvers, monitor space debris, analyze telemetry data, and coordinate communication between satellites and ground stations.

### Key Modules
* **Mission Management:** Lifecycle of satellite deployments.
* **Satellite State Monitoring:** Real-time health and position tracking.
* **Debris Observation:** Risk assessment and collision avoidance.
* **Orbital Maneuver Planning:** Fuel-constrained trajectory changes.
* **Communication Control:** Ground station dish alignment and data links.
* **Telemetry Logging:** High-frequency data ingestion and analysis.

The goal is to simulate **real-world workflows** while demonstrating core database concepts:
* **Transactions & ACID Properties**
* **Indexing & Performance Tuning**
* **Role-Based Access Control (RBAC)**
* **Relational Schema Design**

---

# Tech Stack

| Component | Technology |
| :--- | :--- |
| **Backend** | Node.js, Express.js |
| **Frontend** | React |
| **Database** | PostgreSQL |
| **Auth** | JWT (JSON Web Tokens) |
| **Security** | bcrypt (Password Hashing) |
| **API Docs** | OpenAPI (Swagger) |
| **Hosting** | Supabase |

---

# System Architecture

The system follows a **three-tier architecture**.

```
Frontend (React)
│
│  REST API (JWT Auth)
▼
Backend (Node.js + Express)
│
│  SQL Queries / Transactions
▼
PostgreSQL Database
```

## Interaction Flow
1. A user logs in through the React frontend.
2. The backend validates credentials using **bcrypt**.
3. A **JWT token** is issued for session management.
4. Backend verifies roles and permissions for every request.
5. Database queries are executed using the **pg connection pool**.

---

# UI Examples

## Login Page

**Description:** Users authenticate using their credentials. Successful login returns a JWT token.

**Reason:** Ensures secure access to sensitive mission control operations.

## Mission Control Dashboard

**Description:** Displays active missions, assigned satellites, and operational states.

**Reason:** Centralized view for mission deployment and oversight.

## Dish Communication Interface

**Description:** Allows ground controllers to open windows, adjust dish angles, and manage transmissions.

**Reason:** Essential for simulating ground-to-space communication links.

---

# Setup & Installation

### Prerequisites

| Software | Version |
| :--- | :--- |
| Node.js | 18+ |
| PostgreSQL | 14+ |
| npm | latest |

### Environment Variables

Create a `.env` file in the root directory:

```env
SUPABASE_URL=your_url
SUPABASE_ANON_KEY=your_key
DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_SECRET=your_secret_key
```

### Database Initialization

Run the schema and seed scripts:

```bash
psql $DATABASE_URL -f schema.sql
psql $DATABASE_URL -f seed.sql
```

### Running the System

* **Start Backend:** `node server.js` — Runs on port 3000
* **Start Frontend:** `cd frontend && npm install && npm run dev` — Runs on port 5173

---

# User Roles (RBAC)

| Role | Permissions |
| :--- | :--- |
| `MISSION_CONTROLLER` | Creates missions and deploys satellites |
| `GROUND_CONTROLLER` | Controls communication windows and dish transmissions |
| `SPACE_ANALYST` | Observes debris and satellite telemetry |

### Test Credentials

| Role | Username | Password |
| :--- | :--- | :--- |
| Ground Controller | Abdul Rafay | bscs24003 |
| Mission Controller | Ahmed | bscs24070 |
| Space Analyst | Aamir | bscs24000 |

---

# Feature Walkthrough

### User Authentication
* **Endpoint:** `POST /login`
* Users authenticate and receive a JWT token for secure session management.

### Mission Management
* **Create Mission:** `POST /missions` — Allows mission controllers to initialize new space missions.
* **Satellite Deployment:** `POST /missions/{mission_id}/satellites` — Adds a satellite to an existing mission.

### Monitoring & Observation
* **Satellite Status:** `GET /satellites/{sat_id}/status` — Returns telemetry including fuel level, altitude, and orbital position.
* **Debris Observation:** `POST /debris/check/{sat_id}` — Simulates debris detection near a specific satellite.

### Maneuver Operations
* **Plan Creation:** `POST /plans` — Define orbital maneuver parameters.
* **Execution:** `POST /plans/{plan_id}/execute` — Updates satellite state based on the plan.

---

# Transaction Scenarios (ACID Compliance)

### Orbital Maneuver Execution

**Trigger:** `POST /plans/{plan_id}/execute`

**Atomic Operations:**
1. Check satellite fuel level.
2. Update satellite orbit coordinates.
3. Calculate and update fuel consumption.
4. Record transaction log.

**Rollback Condition:** Insufficient fuel. If the check fails, the orbit and fuel remain unchanged.

### Communication Window Establishment

**Trigger:** `POST /`

**Operations:**
1. Validate satellite position.
2. Validate dish reachability/angle.
3. Check access schedule availability.
4. Open communication window.

**Rollback Condition:** Invalid satellite position or dish unavailability.

---

# ACID Compliance Details

| Property | Implementation |
| :--- | :--- |
| **Atomicity** | Transactions used during maneuver execution ensure all-or-nothing completion. |
| **Consistency** | Foreign keys and constraints enforce relational integrity across tables. |
| **Isolation** | PostgreSQL default transaction isolation prevents interference between concurrent ops. |
| **Durability** | Committed data is stored in PostgreSQL. |

---

# Indexing & Performance Optimization

Several indexes were created to optimize query performance.

### Telemetry Query Optimization

**Query:** `SELECT * FROM telemetry_logs WHERE val > 20`

| State | Time |
| :--- | :--- |
| Before Index | 2.936 ms |
| After Index | 0.284 ms |

**Index:** `idx_telemetry_val`

### Debris Risk Query

**Query:** `SELECT * FROM space_debris_catalog WHERE orbit_id = 101 AND danger_radius_km > 5`

| State | Time |
| :--- | :--- |
| Before Index | 0.505 ms |
| After Index | 0.264 ms |

**Index:** `idx_debris_spatial_risk`

### Satellite Communication Join

**Query:** Join across `dish`, `access_time`, and `satellite_state`

| State | Time |
| :--- | :--- |
| Before Index | 2.585 ms |
| After Index | 0.194 ms |

**Indexes:** `idx_access_time_gs`, `idx_access_time_sat`, `idx_satellite_state`

---

#  API Reference Summary

> Full documentation is available in `swagger.yaml`.

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/login` | No | User authentication |
| `POST` | `/missions` | Yes | Create mission |
| `POST` | `/missions/{id}/satellites` | Yes | Add satellite |
| `POST` | `/debris/check/{sat_id}` | Yes | Debris observation |
| `POST` | `/plans` | Yes | Create maneuver plan |
| `POST` | `/plans/{id}/execute` | Yes | Execute maneuver |
| `GET` | `/satellites/{id}/status` | Yes | Satellite status |
| `POST` | `/` | Yes | Open communication window |
| `POST` | `/dish` | Yes | Adjust dish angle |
| `POST` | `/begin` | Yes | Begin transmission |
| `POST` | `/end` | Yes | End transmission |

---

# Known Issues & Limitations
> Full documentation is available in `Backend_Explanation.pdf`
* **Physics:** Simulates satellite physics and does not model high-fidelity orbital mechanics.
* **Calculations:** Maneuver fuel calculations are based on simplified linear models.