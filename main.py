from typing import Annotated
import re
from datetime import datetime, date, timedelta

from fastapi import FastAPI, Path, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlal_util import SQLAlUtil

from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from security import decode_access_token, hash_password, verify_password, create_access_token

import os
import json

from dotenv import load_dotenv
load_dotenv()
from groq import Groq

groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

class UserSignUp(BaseModel):
    username: str
    email: str
    password: str
    
class UserLogin(BaseModel):
    username: str
    password: str
    
class Token(BaseModel):
    access_token: str
    token_type: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    is_active: bool
    
    
app = FastAPI()

# Add CORS middleware to allow requests from React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

db = SQLAlUtil(username='biraysutcuoglu', host='localhost', port=5432)

# ------------- Authentication --------------------------------
security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Extract and validate user from JWT token"""
    token = credentials.credentials
    user_id = decode_access_token(token)
    
    if user_id is None:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    
    user = db.get_user_by_id(user_id)
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    
    return {"id": user[0], "username": user[1], "email": user[2]}

@app.post("/signup", response_model=UserResponse)
async def signup(user: UserSignUp):
    """Register new user"""
    # Check if username already exists
    existing_user = db.get_user_by_username(user.username)
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    # Check if email already exists
    existing_email = None
    try:
        with db.engine.connect() as conn:
            query = db.users.select().where(db.users.c.email == user.email)
            result = conn.execute(query)
            existing_email = result.fetchone()
    except:
        pass
    
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    # Hash password
    hashed_password = hash_password(user.password)
    db.create_user(user.username, user.email, hashed_password)
    
    # Fetch and return the created user
    new_user = db.get_user_by_username(user.username)
    return {
        "id": new_user[0],
        "username": new_user[1],
        "email": new_user[2],
        "is_active": new_user[4]
    }
    
@app.post("/login", response_model=Token)
async def login(user: UserLogin):
    """Return user and return JWT token"""
    
    # Find user in database
    db_user = db.get_user_by_username(user.username)
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Verify passwords
    if not verify_password(user.password, db_user[3]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create access token
    access_token_expires = timedelta(minutes=60)
    access_token = create_access_token(
        data={"sub": str(db_user[0])},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}
    
# -----------------------------------------------------------------------------
@app.get("/trips/")
async def get_all_trips(current_user: dict=Depends(get_current_user)):
    """List all trips (requires authentication)"""
    trips = db.get_all_trips(current_user["id"])
    return [{"trip_name": trip[0], "date": str(trip[1])} for trip in trips]

@app.post("/trips/")
# date is optional
async def post_trip(trip_name: str, date_str: str | None = None, current_user: dict = Depends(get_current_user)):
    # validate date format (DD.MM.YYYY)
    validate_date_format(date_str)
    
    trip_name = trip_name.capitalize()
    
    # check if this trip already exists for this user
    existing_trip = db.get_trip_by_name(trip_name)
    if existing_trip:
        raise HTTPException(status_code=400, detail=f"Trip '{trip_name}' already exists")
     
    # Convert DD.MM.YYYY to YYYY-MM-DD format for database
    if date_str:
        trip_date = datetime.strptime(date_str, "%d.%m.%Y").date()
    else:
        trip_date = None
    
    db.insert_to_db(trip_name, trip_date, current_user["id"])
    return {"trip_name": trip_name, "date": date_str}

@app.get("/trips/{trip_name}")
async def get_trip(trip_name: str):
    # Get trip directly from database by name
    trip = db.get_trip_by_name(trip_name)
    if trip:
        return {"trip_name": trip[0], "date": str(trip[1])}
    raise HTTPException(status_code=404, detail="trip not found")

@app.put("/trips/{trip_name}")
async def put_trip(trip_name: str, date_str: str | None = None, current_user: dict = Depends(get_current_user)):
    # validate date format (DD.MM.YYYY)
    validate_date_format(date_str)
    
    trip_name = trip_name.capitalize()
    
    trip_date = datetime.strptime(date_str, "%d.%m.%Y").date() if date_str else None

    existing = db.get_trip_by_name(trip_name)
    if not existing:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    db.update_trip(trip_name, trip_date)
    return {"trip_name": trip_name, "date": date_str}
    
@app.delete("/trips/{trip_name}")
async def delete_trip(trip_name: str, current_user: dict = Depends(get_current_user)):
    trip_name = trip_name.capitalize()
    num_deleted = db.delete_trip_by_name(trip_name, user_id=current_user["id"])
    if num_deleted == 0:
        raise HTTPException(status_code=404, detail="Delete not successful. trip not found")
    return {"message": f"{trip_name} deleted"}

def validate_date_format(date_str: str | None):
    if date_str:
        if not re.match(r"^\d{2}\.\d{2}\.\d{4}$", date_str):
            raise HTTPException(status_code=400, detail="Invalid date format. Use DD.MM.YYYY")
        try:
            datetime.strptime(date_str, "%d.%m.%Y")
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date. Date does not exist")
        
        
# -------------- Recommendations using Groq ------------------
@app.get("/recommendations")
async def get_recommendations(current_user: dict = Depends(get_current_user)):
    # Get user's existing trips to personalize recommendations
    existing_trips = db.get_all_trips(current_user["id"])
    trip_names = [trip[0] for trip in existing_trips]

    response = groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "user",
                "content": f"""Recommend 5 popular travel destinations.
                The user has already been to: {trip_names}.
                For each destination provide:
                - City and country
                - One sentence why it's popular
                - Best time to visit
                Return as JSON array only, no extra text, no markdown:
                [{{"city": "...", "country": "...", "reason": "...", "best_time": "..."}}]"""
            }
        ]
    )

    recommendations = json.loads(response.choices[0].message.content)
    return recommendations


