"""
EduGenie Summary Module
Summarizes large educational passages into concise, easy-to-understand versions for quick revision.
"""

import os
import json
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key) if api_key else None

def summarize_text(text: str, focus: str = "General Revision") -> dict:
    """
    Summarizes long educational text into key takeaways and core concepts.
    """
    if not text or not text.strip():
        return {"error": "Text to summarize cannot be empty."}

    if not client:
        return {
            "title": "Passage Summary",
            "quickSummary": text[:150] + ("..." if len(text) > 150 else ""),
            "keyTakeaways": [
                "Key takeaway 1 from the passage.",
                "Key takeaway 2 highlighting primary concepts.",
                "Key takeaway 3 for review."
            ],
            "keyTerms": [
                {"term": "Core Concept", "definition": "The central idea analyzed in this text."}
            ]
        }

    prompt = f"""You are EduGenie's Summary Module.
Summarize the following educational passage into a clear, concise, high-impact revision aid.
Retain core concepts, eliminate repetitive filler, and extract key vocabulary.
Focus: {focus}

Passage:
{text}

Output JSON format:
{{
  "title": "Short title",
  "quickSummary": "2-3 concise summary sentences",
  "keyTakeaways": ["Point 1", "Point 2", "Point 3", "Point 4"],
  "keyTerms": [
    {{"term": "Term", "definition": "Simple definition"}}
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
        return json.loads(response.text)
    except Exception as e:
        return {
            "error": "Failed to summarize text",
            "details": str(e)
        }
