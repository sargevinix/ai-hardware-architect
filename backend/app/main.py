import os
import json
from dotenv import load_dotenv
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '..', '.env'))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.ai_core import design_device
from app.database import SessionLocal, Design
from groq import Groq

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class DeviceRequest(BaseModel):
    prompt: str
    budget: float

class ChatRequest(BaseModel):
    message: str
    history: list = []

@app.get("/")
def root():
    return {"status": "AI Hardware Architect running"}

@app.post("/design")
def design(request: DeviceRequest):
    result = design_device(request.prompt, request.budget)
    db = SessionLocal()
    record = Design(
        prompt=request.prompt,
        budget=request.budget,
        device_name=result.get("device_name", ""),
        description=result.get("description", ""),
        components=json.dumps(result.get("components", [])),
        total_cost=result.get("total_estimated_cost", 0),
        within_budget=str(result.get("within_budget", True)),
        assembly_steps=json.dumps(result.get("assembly_steps", [])),
        wiring_summary=result.get("wiring_summary", ""),
    )
    db.add(record)
    db.commit()
    db.close()
    return result

@app.get("/history")
def get_history():
    db = SessionLocal()
    designs = db.query(Design).order_by(Design.created_at.desc()).limit(20).all()
    db.close()
    return [
        {
            "id": d.id,
            "device_name": d.device_name,
            "prompt": d.prompt,
            "budget": d.budget,
            "total_cost": d.total_cost,
            "created_at": str(d.created_at),
            "components": json.loads(d.components),
            "description": d.description,
            "assembly_steps": json.loads(d.assembly_steps),
            "wiring_summary": d.wiring_summary,
            "within_budget": d.within_budget,
        }
        for d in designs
    ]

@app.post("/chat")
def chat(request: ChatRequest):
    db = SessionLocal()
    past = db.query(Design).order_by(Design.created_at.desc()).limit(5).all()
    db.close()

    memory = ""
    if past:
        memory = "The user has built these devices before:\n"
        for d in past:
            memory += f"- {d.device_name}: {d.description} (budget ${d.budget})\n"

    messages = [
        {
            "role": "system",
            "content": (
                "You are an AI hardware architect CTO assistant. "
                "Help users build their devices. When giving code wrap it in triple backticks. "
                "Be specific and technical about wiring, pins, and components.\n\n"
                + memory
            )
        }
    ]
    for h in request.history:
        messages.append({"role": h["role"], "content": h["content"]})
    messages.append({"role": "user", "content": request.message})

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages,
        temperature=0.5,
    )
    return {"reply": response.choices[0].message.content}