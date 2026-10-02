"""
EduGenie: Google Gemini Powered Learning Assistant
Main FastAPI Application Entrypoint
"""

import os
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
from typing import Optional

from qna import answer_question
from explanation_module import explain_concept
from quiz_module import generate_quiz
from summary_module import summarize_text
from learning_path import get_learning_recommendations

app = FastAPI(
    title="EduGenie API",
    description="Google Gemini Powered Educational Assistant",
    version="1.0.0"
)

# Ensure static & templates directory exist
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
static_dir = os.path.join(BASE_DIR, "static")
templates_dir = os.path.join(BASE_DIR, "templates")

if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")

templates = Jinja2Templates(directory=templates_dir) if os.path.exists(templates_dir) else None

# Pydantic Request Models
class QARequest(BaseModel):
    question: str
    level: Optional[str] = "General"
    subject: Optional[str] = "General Knowledge"

class ExplainRequest(BaseModel):
    topic: str
    level: Optional[str] = "Beginner"
    context: Optional[str] = ""

class QuizRequest(BaseModel):
    passage: Optional[str] = ""
    topic: Optional[str] = ""
    count: Optional[int] = 3

class SummaryRequest(BaseModel):
    text: str
    focus: Optional[str] = "General Revision"

class LearningPathRequest(BaseModel):
    topic: str
    experienceLevel: Optional[str] = "Beginner"
    targetTimeline: Optional[str] = "4-8 weeks"

# Web UI Route
@app.get("/", response_class=HTMLResponse)
async def serve_index(request: Request):
    if templates:
        return templates.TemplateResponse("index.html", {"request": request})
    return HTMLResponse("<h1>EduGenie API is running!</h1><p>Visit /docs for API documentation.</p>")

# 1. QnA Endpoint
@app.post("/qa")
async def api_qa(payload: QARequest):
    result = answer_question(payload.question, level=payload.level, subject=payload.subject)
    return JSONResponse(content=result)

# 2. Explain Endpoint
@app.post("/explain")
async def api_explain(payload: ExplainRequest):
    result = explain_concept(payload.topic, level=payload.level, context=payload.context)
    return JSONResponse(content=result)

# 3. Quiz Endpoint
@app.post("/quiz")
async def api_quiz(payload: QuizRequest):
    input_text = payload.passage or payload.topic
    result = generate_quiz(input_text, count=payload.count)
    return JSONResponse(content=result)

# 4. Summary Endpoint
@app.post("/summarize")
async def api_summarize(payload: SummaryRequest):
    result = summarize_text(payload.text, focus=payload.focus)
    return JSONResponse(content=result)

# 5. Learning Recommendations Endpoint
@app.post("/learn/recommendations")
async def api_learning_path(payload: LearningPathRequest):
    result = get_learning_recommendations(
        payload.topic,
        experience_level=payload.experienceLevel,
        target_timeline=payload.targetTimeline
    )
    return JSONResponse(content=result)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
