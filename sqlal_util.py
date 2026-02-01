from datetime import date

from sqlalchemy import create_engine, MetaData, Table, Column, String, Date, insert

class SQLAlUtil:
    def __init__(self, username: str, host: str, port: int, database: str = 'travels'):
        self.connection_str = f'postgresql://{username}@{host}:{port}/{database}'
        self.engine = create_engine(self.connection_str, echo=True)
        self.meta = MetaData()

        self.travels = Table(
            "travels",
            self.meta,
            Column('name', String, primary_key=True), 
            Column('date', Date)
        )

        self.meta.create_all(self.engine)
    
    def insert_to_db(self, name: str, travel_date: date):
        """Insert a travel record to the database"""
        insert_statement = insert(self.travels).values(name=name, date=travel_date)
        
        with self.engine.connect() as conn:
            result = conn.execute(insert_statement)
            conn.commit()
            return result
    
    def get_all_travels(self):
        """Get all travel records from the database"""
        with self.engine.connect() as conn:
            result = conn.execute(self.travels.select())
            return result.fetchall()
        
    def get_travel_by_name(self, travel_name: str):
        """Get a specific travel by name from the database"""
        with self.engine.connect() as conn:
            query = self.travels.select().where(
                self.travels.c.name.ilike(travel_name)
            )
            result = conn.execute(query)
            return result.fetchone()
    
    def close(self):
        """Close the database connection"""
        self.engine.dispose()
