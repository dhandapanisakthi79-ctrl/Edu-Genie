"""
EduGenie Quiz Module
Generates 3 multiple-choice questions (MCQs) with 4 options each, plausible distractors,
correct answers, and explanations from any topic or passage.
"""

import os
import re
import json
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key) if api_key else None

def clean_json_block(text: str) -> str:
    """
    Cleans markdown code fences such as ```json or ``` from the AI response.
    """
    if not text:
        return ""
    text = text.strip()
    # Remove leading ```json or ```
    text = re.sub(r"^```(?:json)?\s*", "", text, flags=re.IGNORECASE)
    # Remove trailing ```
    text = re.sub(r"\s*```$", "", text)
    return text.strip()

def generate_quiz(passage_or_topic: str, count: int = 3) -> dict:
    """
    Generates three MCQs with 4 options each and the correct answer.
    """
    if not passage_or_topic or not passage_or_topic.strip():
        return {"error": "Passage or topic cannot be empty."}

    if not client:
        return {
            "topic": passage_or_topic[:40],
            "questions": [
                {
                    "id": 1,
                    "question": f"Sample question 1 about {passage_or_topic[:20]}?",
                    "options": ["Option A", "Option B", "Option C", "Option D"],
                    "correctAnswer": "Option A",
                    "explanation": "Option A is correct according to foundational principles."
                },
                {
                    "id": 2,
                    "question": f"Sample question 2 about {passage_or_topic[:20]}?",
                    "options": ["Choice 1", "Choice 2", "Choice 3", "Choice 4"],
                    "correctAnswer": "Choice 2",
                    "explanation": "Choice 2 provides the accurate relationship."
                },
                {
                    "id": 3,
                    "question": f"Sample question 3 about {passage_or_topic[:20]}?",
                    "options": ["Alpha", "Beta", "Gamma", "Delta"],
                    "correctAnswer": "Gamma",
                    "explanation": "Gamma accurately represents the outcome."
                }
            ]
        }

    prompt = f"""You are EduGenie's Quiz Generation module.
Generate exactly {count} multiple-choice questions (MCQs) based on the following topic or passage.
Each question must contain:
1. "id": Integer (1, 2, 3...)
2. "question": String with the question prompt
3. "options": A list of exactly 4 strings (plausible options)
4. "correctAnswer": A string that matches one of the 4 options exactly
5. "explanation": A clear explanation of why this answer is correct and why other options are wrong.

Topic / Passage:
{passage_or_topic}

Output ONLY valid JSON in this format:
{{
  "topic": "{passage_or_topic[:40]}",
  "questions": [
    {{
      "id": 1,
      "question": "...",
      "options": ["...", "...", "...", "..."],
      "correctAnswer": "...",
      "explanation": "..."
    }}
  ]
}}
"""

    try:
        response = client.models.generate_content(
            model="gemini-3.8-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json"
            )
        )
        cleaned_text = clean_json_block(response.text)
        data = json.loads(cleaned_text)
        return data
    except Exception as e:
        return {
            "error": "Failed to generate or parse quiz",
            "details": str(e)
        }
