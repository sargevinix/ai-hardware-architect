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
    category: str = "general"

class ChatRequest(BaseModel):
    message: str
    history: list = []

@app.get("/")
def root():
    return {"status": "AI Hardware Architect running"}

@app.post("/design")
def design(request: DeviceRequest):
    result = design_device(request.prompt, request.budget, request.category)
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

class RefineRequest(BaseModel):
    component_index: int
    instruction: str
    current_design: dict

@app.post("/refine")
def refine(request: RefineRequest):
    component = request.current_design["components"][request.component_index]
    
    messages = [
        {
            "role": "system",
            "content": (
                "You are an AI hardware architect. The user wants to refine a specific component in their device. "
                "Respond ONLY with a JSON object for the updated component with these exact fields: "
                "name, purpose, estimated_price_usd, search_query. No extra text."
            )
        },
        {
            "role": "user",
            "content": (
                f"Current device: {request.current_design['device_name']}\n"
                f"Component to change: {component['name']} - {component['purpose']} (${component['estimated_price_usd']})\n"
                f"User instruction: {request.instruction}\n"
                f"Budget remaining: ${request.current_design.get('total_estimated_cost', 0)}\n"
                "Return updated component JSON only."
            )
        }
    ]
    
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages,
        temperature=0.3,
    )
    
    raw = response.choices[0].message.content
    start = raw.find("{")
    end = raw.rfind("}") + 1
    updated = json.loads(raw[start:end])
    
    new_design = dict(request.current_design)
    new_design["components"] = list(request.current_design["components"])
    new_design["components"][request.component_index] = updated
    new_design["total_estimated_cost"] = sum(c["estimated_price_usd"] for c in new_design["components"])
    new_design["within_budget"] = new_design["total_estimated_cost"] <= request.current_design.get("budget", 9999)
    
    return new_design

class FirmwareRequest(BaseModel):
    design: dict

@app.post("/firmware")
def generate_firmware(request: FirmwareRequest):
    components = request.design.get("components", [])
    device_name = request.design.get("device_name", "MyDevice")
    wiring = request.design.get("wiring_summary", "")
    
    comp_list = "\n".join([
        f"- {c['name']}: {c['purpose']}" 
        for c in components
    ])
    
    messages = [
        {
            "role": "system",
            "content": (
                "You are an expert embedded systems engineer. "
                "Generate complete, working Arduino code for the given hardware design. "
                "Include: all #include statements, pin definitions as constants, "
                "setup() function with proper initialization, loop() function with "
                "working logic, and helper functions. "
                "Add brief comments only where non-obvious. "
                "Return ONLY the code, no explanation, no markdown backticks."
            )
        },
        {
            "role": "user",
            "content": (
                f"Device: {device_name}\n"
                f"Components:\n{comp_list}\n"
                f"Wiring: {wiring}\n\n"
                "Generate complete Arduino firmware for this device."
            )
        }
    ]
    
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages,
        temperature=0.2,
        max_tokens=2000,
    )
    
    code = response.choices[0].message.content
    return {"code": code, "filename": device_name.replace(" ", "_") + ".ino"}