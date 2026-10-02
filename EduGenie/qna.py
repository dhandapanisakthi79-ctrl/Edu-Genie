"""
EduGenie Q&A Module
Handles questions across general knowledge and academic topics using Google Gemini.
"""

import os
import json
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

# Setup GenAI client
api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key) if api_key else None
MODEL_NAME = "gemini-3.8-flash"

def answer_question(question: str, level: str = "General", subject: str = "General Knowledge") -> dict:
    """
    Answers a student question with concise clarity, 3-4 key facts, and follow-up exploration questions.
    """
    if not question or not question.strip():
        return {"error": "Question cannot be empty."}

    if not client:
        return {
            "answer": f"Simulated Answer for: '{question}'. Please configure GEMINI_API_KEY in your .env file to enable live Gemini answers.",
            "keyFacts": ["Fact 1: Gemini provides contextual reasoning.", "Fact 2: Set GEMINI_API_KEY to activate live API."],
            "followUpQuestions": ["How do oceans regulate Earth's climate?", "What are the deepest ocean trenches?"]
        }

    prompt = f"""You are EduGenie's Q&A module.
Answer the following student question accurately, smartly, and concisely.
Academic Level: {level}
Subject: {subject}
Question: {question}

Provide your answer formatted as valid JSON with the following keys:
- "answer": Clear, concise, and structured answer (2-3 paragraphs with markdown).
- "keyFacts": Array of 3-4 bullet-point key facts or fast facts.
- "followUpQuestions": Array of 3 related questions to deepen learning.
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
            "error": "Failed to generate answer",
            "details": str(e)
        }
