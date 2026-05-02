import os
import json
from groq import Groq

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

SYSTEM_PROMPT = (
    "You are an AI hardware architect. When given a device idea and budget, "
    "you respond ONLY with a JSON object with these fields: "
    "device_name, description, components (list of: name, purpose, estimated_price_usd, search_query), "
    "total_estimated_cost, within_budget, assembly_steps (list), wiring_summary. "
    "Only respond with valid JSON. No extra text."
)

def design_device(user_prompt: str, budget: float, category: str = "general") -> dict:
    message = (
        f"Device idea: {user_prompt}\n"
        f"Budget: ${budget}\n"
        f"Category: {category}"
    )

    response = client.chat.completions.create(
      model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": message}
        ],
        temperature=0.3,
    )

    raw = response.choices[0].message.content
    start = raw.find("{")
    end = raw.rfind("}") + 1
    return json.loads(raw[start:end])