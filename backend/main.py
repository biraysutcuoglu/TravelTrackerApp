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
    
    # group dates by trip name
    grouped = {}
    for trip in trips:
        trip_name = trip[1]
        start_date = str(trip[2])
        end_date = str(trip[3])
        destination = trip[4]
        
        if trip_name not in grouped:
           grouped[trip_name] = {"entries": []}
           
        grouped[trip_name]["entries"].append({
            "start_date": start_date,
            "end_date": end_date,
            "destination": destination
        })
    
    # convert dict to list
    result = []
    for name, data in grouped.items():
        result.append({
            "trip_name": name,
            "entries": data["entries"]
        })        
    
    return result
        
        
@app.post("/trips/")
# date is optional
async def post_trip(trip_name: str, start_date_str: str | None = None, end_date_str: str | None = None, destination: str | None = None,  current_user: dict = Depends(get_current_user)):
    # validate date format (YYYY.MM.DD)
    validate_date_format(start_date_str)
    validate_date_format(end_date_str)
    
    created_at = date.today()
    trip_name = trip_name.capitalize()
     
    if start_date_str:
        trip_start_date = datetime.strptime(start_date_str, "%Y-%m-%d").date()
    else:
        trip_start_date = None
        
    if end_date_str:
        trip_end_date = datetime.strptime(end_date_str, "%Y-%m-%d").date()
    else:
        trip_end_date = None
        
    # check if there is a trip with same name and same start date and destination
    existing = db.get_trip_by_name_date_and_destination(current_user["id"], trip_name, trip_start_date, destination)
    if existing:
        raise HTTPException(status_code=400, detail=f"You already have a trip to {destination} on this date")
    
    db.insert_to_db(trip_name, start_date=trip_start_date, end_date=trip_end_date, destination=destination, user_id=current_user["id"], created_at=created_at)
    return {"trip_name": trip_name, "start_date": start_date_str, "end_date": end_date_str, "destination": destination, "created_at": str(created_at)}

@app.put("/trips/{trip_name}")
async def put_trip(trip_name: str, 
                   old_start_date_str: str | None = None, 
                   new_start_date_str: str | None = None,
                   old_end_date_str: str | None = None,
                   new_end_date_str: str | None = None,
                   destination: str | None = None,
                   current_user: dict = Depends(get_current_user)):
    
    # validate date format for the new dates (YYYY-MM-DD)
    validate_date_format(new_start_date_str)
    validate_date_format(new_end_date_str)
    
    trip_name = trip_name.capitalize()
    
    destination = destination.capitalize() if destination else None
    
    old_start_date = datetime.strptime(old_start_date_str, "%Y-%m-%d").date() if old_start_date_str else None  
    old_end_date = datetime.strptime(old_end_date_str, "%Y-%m-%d").date() if old_end_date_str else None  
    new_start_date = datetime.strptime(new_start_date_str, "%Y-%m-%d").date() if new_start_date_str else None
    new_end_date = datetime.strptime(new_end_date_str, "%Y-%m-%d").date() if new_end_date_str else None

    existing = db.get_trip_by_name_and_date(current_user["id"], trip_name, old_start_date, old_end_date)
    
    if not existing:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    db.update_trip(current_user["id"], trip_name, old_start_date, new_start_date, old_end_date, new_end_date, destination)
    return {"trip_name": trip_name, 
            "start_date": new_start_date_str, 
            "end_date": new_end_date_str,
            "destination": destination}
    
@app.delete("/trips/{trip_name}")
async def delete_trip(trip_name: str, start_date_str: str | None = None, end_date_str: str | None = None, current_user: dict = Depends(get_current_user)):
    # Deletes all records with this given trip name
    trip_name = trip_name.capitalize()
    
    num_deleted = db.delete_trip_by_name(trip_name, current_user["id"])
    if num_deleted == 0:
        raise HTTPException(status_code=404, detail="Trip not found")
    return {"message": f"{trip_name} and all its dates deleted"}

@app.delete("/trips/{trip_name}/record")
async def delete_trip_by_destination_and_date(trip_name: str, destination: str, start_date_str: str | None = None, end_date_str: str | None = None, current_user: dict = Depends(get_current_user)):
    # if all fields matching delete this record
    trip_name = trip_name.capitalize()
    
    start_date = datetime.strptime(start_date_str, "%Y-%m-%d").date() if start_date_str else None  
    end_date = datetime.strptime(end_date_str, "%Y-%m-%d").date() if end_date_str else None
    num_deleted = db.delete_trip_by_name_date_destination(trip_name, start_date, end_date, destination, current_user["id"])
    if num_deleted == 0:
        raise HTTPException(status_code=404, detail="Trip not found") 
    return {"message": f"{trip_name}: {destination}, {start_date_str} -> {end_date_str} deleted"}

def validate_date_format(date_str: str | None):
    if date_str:
        if not re.match(r"^\d{4}-\d{2}-\d{2}$", date_str):  # YYYY-MM-DD
            raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
        try:
            datetime.strptime(date_str, "%Y-%m-%d")
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date. Date does not exist")
        
        
# -------------- Recommendations using Groq ------------------
@app.get("/recommendations")
async def get_recommendations(current_user: dict = Depends(get_current_user)):
    # Get user's existing trips to personalize recommendations
    existing_trips = db.get_all_trips(current_user["id"])
    destinations = [trip[2] for trip in existing_trips]

    response = groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "user",
                "content": f"""Recommend 6 popular travel destinations similar to user's previous trips.
                The user has already been to: {destinations}.
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


