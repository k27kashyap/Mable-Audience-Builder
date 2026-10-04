# Mable Audience Builder

TypeScript/React frontend with a TypeScript/Express backend for building and previewing audiences using synthetic event data.

## Project Structure

```text
frontend/    React + TypeScript frontend
backend/     Express + TypeScript backend
docs/
  DESIGN.md
  AI_USAGE.md
```

## Prerequisites

* Node.js 20+
* npm

## Setup

### Backend

```bash
cd backend
npm install
npm run seed
npm run dev
```

Runs at:

```text
http://localhost:3000
```

Health check:

```text
GET /health
```

### Frontend

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

Vite will provide the local URL, usually:

```text
http://localhost:5173
```

The frontend sneds API requests to the backend at:

```text
http://localhost:3000
```

To use a different backend URL, create a `.env` file using `.env.example`:

```text
VITE_API_BASE_URL=http://localhost:3000
```

## Tests

From the backend directory:

```bash
npm test
```

This builds the backend and runs the test suite.

## Using the App

1. Start the backend and seed the database.
2. Start the frontend.
3. Enter an audience name.
4. Add conditions.
5. Configure the event type, operator, count, and time window.
6. Click **Preview audience**.

Conditions are combined using **AND**.

## Data

The application uses synthetic, anonymous event data stored in SQLite. No external services, authentication, or deployment are required.

Additional design details and AI usage are documented in:

* `docs/DESIGN.md`
* `docs/AI_USAGE.md`
