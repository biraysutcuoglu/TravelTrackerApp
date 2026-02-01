from typing import Annotated
import re
from datetime import datetime, date

from fastapi import FastAPI, Path, HTTPException
from pydantic import BaseModel
from sqlal_util import SQLAlUtil

app = FastAPI()

db = SQLAlUtil(username='biraysutcuoglu', host='localhost', port=5432)

@app.get("/travels/{travel_name}")
async def get_travel(travel_name: str):
    # Get travel directly from database by name
    travel = db.get_travel_by_name(travel_name)
    if travel:
        return {"travel_name": travel[0], "date": str(travel[1])}
    return {"error": "Travel not found"}

# Lists all travels
@app.get("/travels/")
async def get_all_travels():
    travels = db.get_all_travels()
    return [{"travel_name": travel[0], "date": str(travel[1])} for travel in travels]

@app.post("/travels/")
# date is optional
async def post_travel(travel_name: str, date_str: str | None = None):
    # validate date format (DD.MM.YYYY)
    validate_date_format(date_str)
    
    travel_name = travel_name.capitalize()
    # Convert DD.MM.YYYY to YYYY-MM-DD format for database
    if date_str:
        travel_date = datetime.strptime(date_str, "%d.%m.%Y").date()
    else:
        travel_date = None
    
    db.insert_to_db(travel_name, travel_date)
    return {"travel_name": travel_name, "date": date_str}

@app.put("/travels/{travel_name}")
async def put_travel(travel_name: str, date_str: str | None = None):
    # validate date format (DD.MM.YYYY)
    validate_date_format(date_str)
    
    travel_name = travel_name.capitalize()
    
    # Check if travel exists
    travels = db.get_all_travels()
    exists = any(t[0].lower() == travel_name.lower() for t in travels)
    
    # Convert DD.MM.YYYY to date object for database
    if date_str:
        travel_date = datetime.strptime(date_str, "%d.%m.%Y").date()
    else:
        travel_date = None
    
    if exists:
        # Update existing travel
        db.insert_to_db(travel_name, travel_date)
        return {"travel_name": travel_name, "date": date_str}
    else:
        # Create new if not found
        db.insert_to_db(travel_name, travel_date)
        return {"travel_name": travel_name, "date": date_str}
    
@app.delete("/travels/{travel_name}")
async def delete_travel(travel_name: str):
    travel_name = travel_name.capitalize()
    num_deleted = db.delete_travel_by_name(travel_name)
    if num_deleted == 0:
        raise HTTPException(status_code=404, detail="Delete not successful. Travel not found")
    return {"message": f"{travel_name} deleted"}

def validate_date_format(date_str: str | None):
    if date_str:
        if not re.match(r"^\d{2}\.\d{2}\.\d{4}$", date_str):
            raise HTTPException(status_code=400, detail="Invalid date format. Use DD.MM.YYYY")
        try:
            datetime.strptime(date_str, "%d.%m.%Y")
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date. Date does not exist")
    


