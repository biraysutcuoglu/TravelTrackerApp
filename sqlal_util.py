from datetime import date, datetime
from sqlalchemy import create_engine, MetaData, Table, Column, String, Date, insert, delete, Integer, Boolean, DateTime
from models import define_trips_table, define_users_table

class SQLAlUtil:
    def __init__(self, username: str, host: str, port: int, database: str = 'trips'):
        self.connection_str = f'postgresql://{username}@{host}:{port}/{database}'
        self.engine = create_engine(self.connection_str, echo=True)
        self.meta = MetaData()

        self.trips = define_trips_table(self.meta)
        self.users = define_users_table(self.meta)
        
        self.meta.create_all(self.engine)
        
    def create_user(self, username: str, email:str, hashed_password:str):
        """Create new user"""
        insert_statement = insert(self.users).values(
            username=username, 
            email=email, 
            hashed_password=hashed_password
        )
        with self.engine.connect() as conn:
            conn.execute(insert_statement)
            conn.commit()
    
    def get_user_by_username(self, username: str):
        with self.engine.connect() as conn:
            query = self.users.select().where(self.users.c.username == username)
            result = conn.execute(query)
            return result.fetchone()
        
    def get_user_by_id(self, id: int):
        with self.engine.connect() as conn:
            query = self.users.select().where(self.users.c.id == id)
            result = conn.execute(query)
            return result.fetchone()
    
    # TODO: Change this function name to insert_trip
    def insert_to_db(self, name: str, trip_date: date, user_id: int):
        """Insert a trip record to the database"""
        insert_statement = insert(self.trips).values(name=name, date=trip_date, user_id=user_id)
        
        with self.engine.connect() as conn:
            result = conn.execute(insert_statement)
            conn.commit()
            return result
    
    def update_trip(self, user_id: int, trip_name: str, old_date, new_date):
        with self.engine.connect() as conn:
            query = self.trips.update().where(
                self.trips.c.name.ilike(trip_name),
                self.trips.c.date == old_date,
                self.trips.c.user_id == user_id
            ).values(date=new_date)
            conn.execute(query)
            conn.commit()
    
    
    def get_all_trips(self, user_id):
        """Get all trip records from the database"""
        with self.engine.connect() as conn:
            query = self.trips.select().where(self.trips.c.user_id == user_id)
            result = conn.execute(query)
            return result.fetchall()
        
    def get_trip_by_name(self, user_id: int, trip_name: str):
        """Get a specific trip by name from the database"""
        with self.engine.connect() as conn:
            query = self.trips.select().where(
                self.trips.c.name.ilike(trip_name),
                self.trips.c.user_id == user_id
            )
            result = conn.execute(query)
            return result.fetchall() # return all matching rows (there can be one trip with multiple dates)
        
    def get_trip_by_name_and_date(self, user_id: int, trip_name: str, date):
        """Get specific trip by name, date and user"""
        with self.engine.connect() as conn:
            query = self.trips.select().where(
                self.trips.c.name.ilike(trip_name),
                self.trips.c.date == date, 
                self.trips.c.user_id == user_id
            )
            result = conn.execute(query)
            return result.fetchone()
        
    def delete_trip_by_name(self, trip_name: str, user_id: int):
        """Delete a trip record by name from the database"""
        with self.engine.connect() as conn:
            query = delete(self.trips).where(
                self.trips.c.name.ilike(trip_name),
                self.trips.c.user_id == user_id
            )
            result = conn.execute(query)
            conn.commit()
            return result.rowcount  # Returns number of rows deleted
        
    def delete_trip_by_name_and_date(self, trip_name: str, date, user_id: int):
        with self.engine.connect() as conn:
            query = delete(self.trips).where(
                self.trips.c.name.ilike(trip_name),
                self.trips.c.date == date,
                self.trips.c.user_id == user_id
            )
            result = conn.execute(query)
            conn.commit()
            return result.rowcount # number of rows deleted
    
    def close(self):
        """Close the database connection"""
        self.engine.dispose()
