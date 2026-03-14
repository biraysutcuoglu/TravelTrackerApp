Travel Tracker App
- /trips endpoint shows all travels (done, in bucketlist and all database)
- /recommended: **will be implemented**  
- Features to be implemented
    - add front end for userlogin and signup
    - recommended page showing the popular destinations (extracted from internet-can be google trends)
        - move configurations to config file
        - here also show destinations in the given distance (select from map)
        - use caching here (if from the same destionation searched)
    

## Authentication System (Backend)

### How It Works

The application uses **JWT (JSON Web Tokens)** for authentication:

1. **User Registration** → `POST /signup`
   - Request body: `{"username": "john", "email": "john@example.com", "password": "password123"}`
   - Creates a new user with hashed password (using Argon2)
   - Returns: User info with id, username, email, is_active

2. **User Login** → `POST /login`
   - Request body: `{"username": "john", "password": "password123"}`
   - Validates credentials against database
   - Returns: JWT access token (valid for 60 minutes)
   - Response: `{"access_token": "...", "token_type": "bearer"}`

3. **Protected Endpoints** (e.g., `GET /trips/`)
   - Requires valid JWT token in Authorization header: `Authorization: Bearer <token>`
   - Backend validates token signature and expiration
   - If valid: returns protected data
   - If invalid/expired: returns 401 Unauthorized

### File Structure

- **main.py** - FastAPI app with endpoints (signup, login, protected routes)
- **security.py** - JWT token creation, validation, and password hashing
- **models.py** - SQLAlchemy table definitions (modular schemas)
- **sqlal_util.py** - Database operations wrapper

### Dependencies

- `python-jose` - JWT token handling
- `passlib[argon2]` - Password hashing
- `python-multipart` - Form data handling

### Database

- **PostgreSQL** with users table containing:
  - id (primary key)
  - username (unique)
  - email (unique)
  - hashed_password (Argon2 hashed)
  - is_active (boolean)
  - created_at (timestamp)

### Token Flow

```
User Input Credentials
    ↓
Login Endpoint validates credentials
    ↓
Generate JWT token with user ID
    ↓
Client stores token (localStorage/state)
    ↓
Protected endpoint receives token in header
    ↓
Validate token signature and expiration
    ↓
Extract user ID from token
    ↓
Return protected data
```

### Token Expiration

- Access tokens expire after **60 minutes**
- When expired, user must login again to get a fresh token

How to run: 
fastapi dev main.py

    