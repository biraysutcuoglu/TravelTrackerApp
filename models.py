from datetime import datetime
from sqlalchemy import create_engine, MetaData, Table, Column, String, Date, DateTime, Boolean, Integer, ForeignKey

def define_trips_table(meta):
    return Table("trips",
            meta,
            Column('name', String, primary_key=True), 
            Column('date', Date),
            Column('user_id', Integer, ForeignKey('users.id'), nullable=False))
            
            
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