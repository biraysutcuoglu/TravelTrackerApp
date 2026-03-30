from datetime import datetime
from sqlalchemy import create_engine, MetaData, Table, Column, String, Date, DateTime, Boolean, Integer, ForeignKey

def define_trips_table(meta):
    return Table(
            "trips",
            meta,
            Column('id', Integer, primary_key=True, autoincrement=True),
            Column('name', String), 
            Column('start_date', Date, nullable=True),
            Column('end_date', Date, nullable=True),
            Column('destination', String),
            Column('user_id', Integer, ForeignKey('users.id'), nullable=False),
            Column('created_at', Date))
            
            
def define_users_table(meta):
    return Table(
        "users", 
        meta,
        Column('id', Integer, primary_key=True, autoincrement=True),
        Column('username', String, unique=True, nullable=False),
        Column('email', String, unique=True, nullable=False),
        Column('hashed_password', String, nullable=False),
        Column('is_active', Boolean, default=True),
        Column('created_at', DateTime, default=datetime.utcnow)
    )