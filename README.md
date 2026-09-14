# Weekly Report Generator & Team Dashboard

A full-stack web application for managing weekly team reports. Team members can submit structured weekly reports, managers can review and request corrections, and managers can monitor team activity through a consolidated dashboard.

Built as a technical assignment submission.

## Live Demo

**Live Application:**
https://sisenco-digital.vercel.app

### Demo Accounts

All demo accounts use the password:
`password123`

| Role | Email |
|---|---|
| Manager | manager@example.com |
| Team Member | sanduni@example.com |
| Team Member | kasun@example.com |
| Team Member | nadeesha@example.com |
| Team Member | tharindu@example.com |

---

## Features

### Authentication & Role Management

- User registration and login
- JWT-based authentication
- Secure password hashing using bcrypt
- Two user roles:
  - Manager
  - Team Member
- Server-side role-based access control (RBAC)
- Protected API routes and resources

### Weekly Reports

Team members submit structured weekly reports using a consistent set of fields:

- Tasks completed
- Planned tasks
- Blockers
- Achievements
- Working hours by task type
- Additional notes

Using the same structure for every team member keeps reports consistent and easy to compare.

### Report Review Workflow

Every report moves through four statuses:

```text
Draft  →  Submitted  →  Needs Correction  →  Approved
```

If a manager requests changes, the report goes to **Needs Correction**. The
team member edits it and resubmits, which moves it back to **Submitted** for
another review — this cycle can repeat until the manager approves it:

```text
                 ┌──────────────────────────────┐
                 │                                │
                 ▼                                │
Draft  →  Submitted  →  Needs Correction ─── edit & resubmit
                 │
                 └────────────→  Approved
```

Managers can:

- Review submitted reports
- Add a review comment
- Request corrections
- Approve reports

Managers can only change a report's status and comment — never its content.
Team members can edit and resubmit reports that require correction.

### Version History

Every submission is saved as a snapshot.

This allows users to:

- View previous report versions
- Track changes between submissions
- See previous manager review outcomes, linked to the version they were made against
- Maintain a full audit trail instead of overwriting historical data

### Team Dashboard

Managers have access to a consolidated dashboard containing:

- Overall team activity
- Report status summaries
- Tasks completed over time
- Status by team member
- Workload by project
- Time spent by task type
- Recent activity feed

### Project & User Management

Managers can:

- Create, edit, and deactivate projects
- Add, deactivate, and manage team members
- Change user roles

### Role-Based Access Control

Authorization is enforced on the backend rather than relying only on frontend restrictions.

The application ensures that:

- Team members can only access permitted resources
- Manager-only operations are protected
- API endpoints validate authenticated users and roles
- Authorization logic is covered by automated tests

---

## Tech Stack

### Frontend
- React, Vite, React Router, Tailwind CSS, Recharts, Axios

### Backend
- Node.js, Express.js, JWT, bcrypt, express-validator

### Database
- MongoDB, Mongoose, MongoDB Atlas

### Testing
- Jest

---

## Architecture

```text
┌─────────────────────────────┐
│        React Frontend       │
│       Vite + Tailwind       │
└──────────────┬──────────────┘
               │
               │ REST API (JWT Bearer token)
               ▼
┌─────────────────────────────┐
│       Node.js Backend       │
│          Express.js         │
│                              │
│ Authentication               │
│ Authorization / RBAC         │
│ Report Management            │
│ Project Management           │
│ User Management               │
│ Dashboard & Analytics          │
└──────────────┬──────────────┘
               │
               │ Mongoose
               ▼
┌─────────────────────────────┐
│        MongoDB Atlas        │
└─────────────────────────────┘
```

---

## Project Structure

```text
Sisenco-Digital/
│
├── backend/
│   ├── config/          -> database connection
│   ├── controllers/     -> request handling logic
│   ├── middleware/      -> auth (protect / authorize)
│   ├── models/          -> Mongoose schemas
│   ├── routes/          -> API route definitions
│   ├── seed/
│   │   └── seed.js      -> demo data seed script
│   ├── tests/           -> Jest tests (RBAC)
│   ├── utils/           -> helpers (JWT token generation)
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/         -> one file per backend resource
│   │   ├── components/  -> reusable UI pieces
│   │   ├── context/     -> AuthContext (session state)
│   │   ├── layouts/     -> app shell (sidebar/topbar)
│   │   ├── pages/       -> one file per route
│   │   └── utils/       -> helpers
│   ├── .env.example
│   └── package.json
│
└── README.md
```

---

## Setup & Installation

### Prerequisites

- Node.js v18 or later
- npm
- A MongoDB database — either MongoDB Atlas (cloud) or MongoDB Community Server (local)

```bash
git clone https://github.com/Achira2001/Sisenco-Digital.git
cd Sisenco-Digital
```

### 1. Installing Dependencies

Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd ../frontend
npm install
```

### 2. Running Database

**Option A — MongoDB Atlas (recommended, no local install):**
1. Create a free cluster at https://www.mongodb.com/atlas
2. Under **Network Access**, allow access from anywhere (or your IP)
3. Copy the connection string (`mongodb+srv://...`) — you'll use it as
   `MONGO_URI` in the backend setup below

**Option B — Local MongoDB:**
1. Install [MongoDB Community Server](https://www.mongodb.com/try/download/community)
2. Start it: `mongod`
3. Use `mongodb://127.0.0.1:27017/weekly-report-app` as `MONGO_URI`

### 3. Running Backend

From the `backend` directory, create your environment file:

```bash
cp .env.example .env
```

Edit `backend/.env`:

```env
PORT=5000
MONGO_URI=<your MongoDB connection string from step 2>
JWT_SECRET=<your long random secret>
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

| Variable | Description |
|---|---|
| `PORT` | Backend server port |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign JWT tokens |
| `JWT_EXPIRES_IN` | JWT token expiration period |
| `CLIENT_URL` | Frontend URL used for CORS configuration |

Seed demo data — creates demo users, projects, and reports in every status:

```bash
npm run seed
```

This creates:
- **Users:** 1 manager, 4 team members
- **Projects:** Client A, Internal Tooling, R&D, Marketing
- **Reports:** sample reports across Draft, Submitted, Needs Correction, and Approved states

Start the server:

```bash
npm run dev
```

Backend runs at `http://localhost:5000`. Health check: `GET /api/health`.

### 4. Running Frontend

From the `frontend` directory, create your environment file:

```bash
cp .env.example .env
```

Edit `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Start it (the backend must already be running):

```bash
npm run dev
```

Frontend runs at `http://localhost:5173`. Open it in your browser and log in
using one of the [demo accounts](#demo-accounts).

---

## Testing

The backend uses Jest for automated testing.

```bash
cd backend
npm test
```

The tests cover authentication and role-based access control — ensuring, for
example, that a team member can never access a manager-only endpoint.

---

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Manager | manager@example.com | password123 |
| Team Member | sanduni@example.com | password123 |
| Team Member | kasun@example.com | password123 |
| Team Member | nadeesha@example.com | password123 |
| Team Member | tharindu@example.com | password123 |

