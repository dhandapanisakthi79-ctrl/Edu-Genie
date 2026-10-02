"""
EduGenie Learning Path Module
Generates personalized, structured learning paths with beginner to advanced concepts,
timelines, checkpoints, and curated resource recommendations.
"""

import os
import json
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key) if api_key else None

def get_learning_recommendations(topic: str, experience_level: str = "Beginner", target_timeline: str = "4-8 weeks") -> dict:
    """
    Creates structured learning recommendations from beginner to advanced.
    """
    if not topic or not topic.strip():
        return {"error": "Topic cannot be empty."}

    if not client:
        return {
            "topic": topic,
            "overview": f"A comprehensive learning roadmap for mastering {topic}.",
            "prerequisites": ["Basic computer literacy", "Logical thinking"],
            "stages": [
                {
                    "stageNumber": 1,
                    "title": f"Fundamentals of {topic}",
                    "level": "Beginner",
                    "duration": "Weeks 1-2",
                    "description": "Core concepts and environment setup.",
                    "topicsToMaster": ["Introduction", "Syntax & Core Rules", "Basic Operations"],
                    "handsOnProject": {"title": "Starter Project", "goal": "Build a simple prototype"},
                    "resources": [{"name": "Official Docs", "type": "Documentation", "recommendation": "Read getting started guide"}]
                },
                {
                    "stageNumber": 2,
                    "title": f"Intermediate Application & Problem Solving",
                    "level": "Intermediate",
                    "duration": "Weeks 3-5",
                    "description": "Building practical projects and mastering queries/patterns.",
                    "topicsToMaster": ["Optimization", "Complex Functions", "Integration"],
                    "handsOnProject": {"title": "Real-world App", "goal": "Solve real business scenarios"},
                    "resources": [{"name": "FreeCodeCamp", "type": "Video / Interactive", "recommendation": "Full tutorial series"}]
                },
                {
                    "stageNumber": 3,
                    "title": f"Advanced Mastery & Architecture",
                    "level": "Advanced",
                    "duration": "Weeks 6-8",
                    "description": "Scalability, performance tuning, and professional best practices.",
                    "topicsToMaster": ["Security", "Scaling & Indexing", "Industry Standards"],
                    "handsOnProject": {"title": "Portfolio Capstone", "goal": "Production-ready system"},
                    "resources": [{"name": "GitHub Repositories", "type": "Code Examples", "recommendation": "Explore open source patterns"}]
                }
            ],
            "bestPracticeTips": ["Practice daily for at least 30 minutes", "Build projects rather than just watching tutorials"]
        }

    prompt = f"""You are EduGenie's Learning Path Module.
Generate a structured, personalized learning path for: "{topic}".
Current experience level: {experience_level}
Target timeline: {target_timeline}

Organize beginner to advanced concepts with timelines, suggested resources (videos, articles, books, platforms), and hands-on projects for each stage.

Output valid JSON matching:
{{
  "topic": "{topic}",
  "overview": "Overview of this skill journey",
  "prerequisites": ["Prerequisite 1", "Prerequisite 2"],
  "stages": [
    {{
      "stageNumber": 1,
      "title": "Stage Title",
      "level": "Beginner",
      "duration": "Weeks 1-2",
      "description": "Stage objective",
      "topicsToMaster": ["Topic A", "Topic B", "Topic C"],
      "handsOnProject": {{
        "title": "Project Name",
        "goal": "What student will build"
      }},
      "resources": [
        {{
          "name": "Resource Name",
          "type": "Video / Doc / Course / Book",
          "recommendation": "Why this resource is recommended"
        }}
      ]
    }}
  ],
  "bestPracticeTips": ["Tip 1", "Tip 2", "Tip 3"]
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
            "error": "Failed to generate learning path",
            "details": str(e)
        }
