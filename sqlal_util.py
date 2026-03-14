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
    
    def insert_to_db(self, name: str, trip_date: date):
        """Insert a trip record to the database"""
        insert_statement = insert(self.trips).values(name=name, date=trip_date)
        
        with self.engine.connect() as conn:
            result = conn.execute(insert_statement)
            conn.commit()
            return result
    
    def get_all_trips(self):
        """Get all trip records from the database"""
        with self.engine.connect() as conn:
            result = conn.execute(self.trips.select())
            return result.fetchall()
        
    def get_trip_by_name(self, trip_name: str):
        """Get a specific trip by name from the database"""
        with self.engine.connect() as conn:
            query = self.trips.select().where(
                self.trips.c.name.ilike(trip_name)
            )
            result = conn.execute(query)
            return result.fetchone()
        
    def delete_trip_by_name(self, trip_name: str):
        """Delete a trip record by name from the database"""
        with self.engine.connect() as conn:
            query = delete(self.trips).where(
                self.trips.c.name.ilike(trip_name)
            )
            result = conn.execute(query)
            conn.commit()
            return result.rowcount  # Returns number of rows deleted (1 or 0)
    
    def close(self):
        """Close the database connection"""
        self.engine.dispose()
