from typing import Annotated
import re
from datetime import datetime

from fastapi import FastAPI, Path, HTTPException
from pydantic import BaseModel

app = FastAPI()

fake_travels_db = [{"travel_name": "Frankfurt", "date": "25.01.2026"}, {"travel_name": "Heidelberg", "date": "24.01.2026"}, {"travel_name": "Salzburg", "date": "10.03.2024"}]

@app.get("/travels/{travel_name}")
async def get_travel(travel_name: str):
    # get travel name and date from db
    for i in fake_travels_db:
        if i["travel_name"].lower() == travel_name.lower():
            return {"travel_name": i["travel_name"], "date": i["date"]}
    return {"error": "Travel not found"}

# lists all travels
@app.get("/travels/")
async def get_all_travels():
    return fake_travels_db

@app.post("/travels/")
# date is optional
async def post_travel(travel_name: str, date: str | None):
    # validate date format (DD.MM.YYYY)
    validate_date_format(date)
    
    travel_name = travel_name.capitalize()
    new_travel = {"travel_name": travel_name, "date": date}
    fake_travels_db.append(new_travel)
    return new_travel

@app.put("/travels/{travel_name}")
async def put_travel(travel_name: str, date: str | None):
    # validate date format (DD.MM.YYYY)
    validate_date_format(date)
    
    # Find and update existing travel, or create if doesn't exist
    for i in fake_travels_db:
        if i["travel_name"].lower() == travel_name.lower():
            i["date"] = date  # Update existing
            return i
    # Create new if not found
    new_travel = {"travel_name": travel_name.capitalize(), "date": date}
    fake_travels_db.append(new_travel)
    return new_travel

def validate_date_format(date: str | None):
    if date:
        if not re.match(r"^\d{2}\.\d{2}\.\d{4}$", date):
            raise HTTPException(status_code=400, detail="Invalid date format. Use DD.MM.YYYY")
        try:
            datetime.strptime(date, "%d.%m.%Y")
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date. Date does not exist")
    


