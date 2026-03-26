# 🌍 Travel Tracker App

A full-stack travel management application built with FastAPI (backend) and React (frontend).

## Features

- User authentication (signup, login, logout) with JWT
- Add, edit, delete and list your trips
- AI-powered destination recommendations based on your travel history (via Groq LLM)
- Each user only sees their own trips (user-scoped data)
- "Plan a Trip" button on recommendation cards to pre-fill the trip form

## Planned Features
- Show destinations within a given distance (select from map)
- Caching for recommendations (if same destination searched)
- Move configurations to a config file
- Bucketlist vs visited trips distinction

---

## Project Structure
```
├── backend/
│   ├── main.py          # FastAPI app with all endpoints
│   ├── security.py      # JWT token creation, validation, password hashing
│   ├── models.py        # SQLAlchemy table definitions
│   ├── sqlal_util.py    # Database operations wrapper
│   └── .env             # Environment variables (never commit this!)
├── frontend/
│   ├── src/
│   │   ├── App.js               # Main React component
│   │   ├── components/
│   │   │   ├── Login.js         # Login form
│   │   │   ├── Signup.js        # Signup form
│   │   │   ├── TripList.js      # Trip list display
│   │   │   └── TripForm.js      # Add/edit trip form
│   │   │   └── RecommendationsPage.js # AI destination recommendations view
```

---

## Authentication System

The application uses **JWT (JSON Web Tokens)** for authentication with **Argon2** password hashing.

### Endpoints

#### `POST /signup`
Register a new user.
- Request body: `{"username": "john", "email": "john@example.com", "password": "password123"}`
- Returns: User info (id, username, email, is_active)

#### `POST /login`
Login and receive a JWT token.
- Request body: `{"username": "john", "password": "password123"}`
- Returns: `{"access_token": "...", "token_type": "bearer"}`
- Token is valid for **60 minutes**

#### `GET /trips/` 🔒
Get all trips for the logged-in user.
- Requires: `Authorization: Bearer <token>`

#### `POST /trips/` 🔒
Add a new trip.
- Query params: `trip_name`, `date_str` (optional, format: DD.MM.YYYY)
- Returns error if trip with same name already exists

#### `PUT /trips/{trip_name}` 🔒
Update an existing trip's date.
- Query params: `date_str` (optional, format: DD.MM.YYYY)

#### `DELETE /trips/{trip_name}` 🔒
Delete a trip by name. Only deletes trips belonging to the logged-in user.

#### `GET /recommendations` 🔒
Get 5 AI-powered travel destination recommendations personalized based on the user's existing trips.
- Uses Groq LLM (llama-3.3-70b-versatile)
- Returns: list of `{city, country, reason, best_time}`

> 🔒 = requires JWT token in Authorization header

### Token Flow
```
User enters credentials
        ↓
POST /login validates credentials
        ↓
JWT token generated with user ID (expires in 60 min)
        ↓
Client stores token in localStorage
        ↓
Each protected request sends token in Authorization header
        ↓
Backend validates token signature and expiration
        ↓
Extracts user ID → fetches user → returns protected data
```

---

## Database

**PostgreSQL** with two tables:

### users
| Column | Type | Notes |
|---|---|---|
| id | Integer | Primary key, autoincrement |
| username | String | Unique |
| email | String | Unique |
| hashed_password | String | Argon2 hashed |
| is_active | Boolean | Default: true |
| created_at | DateTime | Auto timestamp |

### trips
| Column | Type | Notes |
|---|---|---|
| name | String | Primary key |
| date | Date | Optional |
| user_id | Integer | Foreign key → users.id |

---

## Setup & Running

### Backend

1. Create and activate a virtual environment:
```bash
python -m venv fastapivenv
source fastapivenv/bin/activate
```

2. Install dependencies:
```bash
pip install fastapi uvicorn sqlalchemy psycopg2-binary python-jose passlib[argon2] python-multipart groq python-dotenv
```

3. Create a `.env` file:
```bash
GROQ_API_KEY=your-groq-api-key-here
```

4. Run the backend:
```bash
fastapi dev main.py
```

### Frontend

1. Install dependencies:
```bash
npm install
```

2. Run the frontend:
```bash
npm start
```

### API Docs
Visit `http://localhost:8000/docs` to explore and test the API interactively.

---

## Dependencies

### Backend
- `fastapi` - Web framework
- `uvicorn` - ASGI server
- `sqlalchemy` - ORM and database toolkit
- `psycopg2-binary` - PostgreSQL adapter
- `python-jose` - JWT token handling
- `passlib[argon2]` - Password hashing
- `python-multipart` - Form data handling
- `groq` - Groq LLM API client
- `python-dotenv` - Environment variable management

### Frontend
- `react` - UI framework
- `axios` - HTTP client

### TODO


