"""
EduGenie Concept Explanation Module
Breaks down complex academic and scientific concepts into clear, beginner-friendly explanations
with real-world analogies, step-by-step mechanisms, and takeaways.
"""

import os
import json
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key) if api_key else None

def explain_concept(topic: str, level: str = "Beginner", context: str = "") -> dict:
    """
    Simplifies concepts using intuitive analogies, simple definitions, and step-by-step breakdowns.
    """
    if not topic or not topic.strip():
        return {"error": "Topic cannot be empty."}

    if not client:
        return {
            "title": topic,
            "simpleDefinition": f"Explanation for '{topic}'. Configure GEMINI_API_KEY for live AI responses.",
            "analogy": "Think of it like building blocks in everyday life.",
            "steps": [
                {"stepNumber": 1, "title": "Core foundation", "description": "The basic principle behind the concept."},
                {"stepNumber": 2, "title": "Real-world action", "description": "How the concept applies in practice."}
            ],
            "whyItMatters": "It forms the foundation of modern scientific and analytical thinking.",
            "commonMisconception": "Thinking it is too complicated for beginners.",
            "clarification": "With the right analogy, any concept can be broken down simply."
        }

    prompt = f"""You are EduGenie's Explanation module.
Your goal is to break down complex educational and scientific topics so that any learner can grasp them intuitively without cognitive overload.
Topic: {topic}
Target Audience Level: {level}
Context: {context}

Output must be valid JSON with keys:
- "title": string (topic title)
- "simpleDefinition": string (1-2 sentences in simple words)
- "analogy": string (intuitive real-world metaphor)
- "steps": array of objects with keys: "stepNumber" (int), "title" (string), "description" (string)
- "whyItMatters": string (practical importance)
- "commonMisconception": string (what people get wrong)
- "clarification": string (the true explanation)
"""

    try:
        response = client.models.generate_content(
            model="gemini-3.8-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json"
            )
        )
        return json.loads(response.text)
    except Exception as e:
        return {
            "error": "Failed to explain concept",
            "details": str(e)
        }
