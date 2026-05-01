import os
from dotenv import load_dotenv
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '..', '.env'))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.ai_core import design_device

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

@app.get("/")
def root():
    return {"status": "AI Hardware Architect running"}

@app.post("/design")
def design(request: DeviceRequest):
    result = design_device(request.prompt, request.budget)
    return result

class ChatRequest(BaseModel):
    message: str
    history: list = []

@app.post("/chat")
def chat(request: ChatRequest):
    messages = [
        {"role": "system", "content": "You are an AI hardware architect assistant. Help users build their devices. When giving code wrap it in triple backticks with the language. Be specific and technical."}
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