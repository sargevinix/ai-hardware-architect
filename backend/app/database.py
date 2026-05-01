from sqlalchemy import create_engine, Column, Integer, String, Float, Text, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import datetime

engine = create_engine("sqlite:///./hardware.db")
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

class Design(Base):
    __tablename__ = "designs"
    id = Column(Integer, primary_key=True, index=True)
    prompt = Column(String)
    budget = Column(Float)
    device_name = Column(String)
    description = Column(String)
    components = Column(Text)
    total_cost = Column(Float)
    within_budget = Column(String)
    assembly_steps = Column(Text)
    wiring_summary = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        return db
    finally:
        pass