import React, { useState } from 'react';
import { 
  Code2, 
  Copy, 
  Check, 
  Terminal, 
  FolderTree, 
  ExternalLink, 
  FileCode, 
  Play, 
  Settings,
  ChevronRight
} from 'lucide-react';

export const CodeViewerModal: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState('main.py');
  const [copied, setCopied] = useState(false);

  const fileContents: Record<string, { desc: string; code: string; lang: string }> = {
    'main.py': {
      desc: 'FastAPI Web Application & RESTful API Endpoints (/qa, /explain, /quiz, /summarize, /learn/recommendations)',
      lang: 'python',
      code: `"""
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

# Mount static files and templates
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

# 3. Quiz Endpoint (3 MCQs with 4 options each)
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
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)`,
    },
    'qna.py': {
      desc: 'Q&A Module with Google Gemini contextual reasoning, key facts, and follow-ups',
      lang: 'python',
      code: `"""
EduGenie Q&A Module
Handles questions across general knowledge and academic topics using Google Gemini.
"""

import os
import json
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key) if api_key else None

def answer_question(question: str, level: str = "General", subject: str = "General Knowledge") -> dict:
    if not question or not question.strip():
        return {"error": "Question cannot be empty."}

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
            model="gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json"
            )
        )
        return json.loads(response.text)
    except Exception as e:
        return {"error": "Failed to generate answer", "details": str(e)}`,
    },
    'explanation_module.py': {
      desc: 'Concept Explanation Module breaking down complex ideas with analogies and step-by-step logic',
      lang: 'python',
      code: `"""
EduGenie Concept Explanation Module
Breaks down complex academic and scientific concepts into clear, beginner-friendly explanations.
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
    if not topic or not topic.strip():
        return {"error": "Topic cannot be empty."}

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
            model="gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json"
            )
        )
        return json.loads(response.text)
    except Exception as e:
        return {"error": "Failed to explain concept", "details": str(e)}`,
    },
    'quiz_module.py': {
      desc: 'Quiz Module generating 3 MCQs with 4 options each, clean_json_block, and real-time correction',
      lang: 'python',
      code: `"""
EduGenie Quiz Module
Generates 3 multiple-choice questions (MCQs) with 4 options each and answer explanations.
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
    """Cleans markdown code fences such as \`\`\`json from the AI response."""
    if not text:
        return ""
    text = text.strip()
    text = re.sub(r"^\\\`\\\`\\\`(?:json)?\\s*", "", text, flags=re.IGNORECASE)
    text = re.sub(r"\\s*\\\`\\\`\\\`$", "", text)
    return text.strip()

def generate_quiz(passage_or_topic: str, count: int = 3) -> dict:
    if not passage_or_topic or not passage_or_topic.strip():
        return {"error": "Passage or topic cannot be empty."}

    prompt = f"""You are EduGenie's Quiz Generation module.
Generate exactly {count} multiple-choice questions (MCQs) based on the following topic or passage.
Each question must contain:
1. "id": Integer (1, 2, 3...)
2. "question": String with the question prompt
3. "options": A list of exactly 4 strings (plausible options)
4. "correctAnswer": A string that matches one of the 4 options exactly
5. "explanation": A clear explanation of why this answer is correct and why others are wrong.

Topic / Passage:
{passage_or_topic}
"""

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json"
            )
        )
        cleaned_text = clean_json_block(response.text)
        return json.loads(cleaned_text)
    except Exception as e:
        return {"error": "Failed to generate or parse quiz", "details": str(e)}`,
    },
    'summary_module.py': {
      desc: 'Summary Module distilling long texts into concise revision aids and vocabulary definitions',
      lang: 'python',
      code: `"""
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
    if not text or not text.strip():
        return {"error": "Text to summarize cannot be empty."}

    prompt = f"""You are EduGenie's Summary Module.
Summarize the following educational passage into a clear, concise, high-impact revision aid.
Retain core concepts, eliminate repetitive filler, and extract key vocabulary.
Focus: {focus}

Passage:
{text}
"""

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json"
            )
        )
        return json.loads(response.text)
    except Exception as e:
        return {"error": "Failed to summarize text", "details": str(e)}`,
    },
    'learning_path.py': {
      desc: 'Learning Path Module generating beginner to advanced curriculum roadmaps with timelines',
      lang: 'python',
      code: `"""
EduGenie Learning Path Module
Generates personalized, structured learning paths with beginner to advanced concepts, timelines, and resources.
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
    if not topic or not topic.strip():
        return {"error": "Topic cannot be empty."}

    prompt = f"""You are EduGenie's Learning Path Module.
Generate a structured, personalized learning path for: "{topic}".
Current experience level: {experience_level}
Target timeline: {target_timeline}

Organize beginner to advanced concepts with timelines, suggested resources (videos, articles, books, platforms), and hands-on projects for each stage.
"""

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json"
            )
        )
        return json.loads(response.text)
    except Exception as e:
        return {"error": "Failed to generate learning path", "details": str(e)}`,
    },
    'requirements.txt': {
      desc: 'Python pip dependencies (FastAPI, Uvicorn, Jinja2, google-genai, etc.)',
      lang: 'text',
      code: `fastapi>=0.110.0
uvicorn>=0.28.0
jinja2>=3.1.3
pydantic>=2.6.0
python-dotenv>=1.0.1
google-genai>=0.1.1
requests>=2.31.0`,
    },
    'README.md': {
      desc: 'Complete VS Code setup, installation, running with uvicorn, and scenario testing instructions',
      lang: 'markdown',
      code: `# EduGenie: VS Code Setup & Testing Guide

## 1. Prerequisites
- Python 3.10+ (ensure "Add Python to PATH" is checked)
- VS Code with Python extension
- Google Gemini API Key from Google AI Studio

## 2. Virtual Environment Setup
# macOS / Linux:
python3 -m venv venv
source venv/bin/activate

# Windows (PowerShell):
python -m venv venv
.\\venv\\Scripts\\Activate.ps1

## 3. Install Dependencies
pip install -r requirements.txt

## 4. Set Environment Variable
Create .env file:
GEMINI_API_KEY=your_gemini_api_key_here

## 5. Run the Server
uvicorn main:app --reload

Navigate to: http://127.0.0.1:8000
Interactive Swagger Docs: http://127.0.0.1:8000/docs`,
    },
  };

  const handleCopyCode = () => {
    const code = fileContents[selectedFile]?.code || '';
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Overview & Quick Instructions */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold border border-indigo-500/30">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold">EduGenie VS Code Setup & Backend Codebase</h2>
            <p className="text-xs text-slate-400">
              Run EduGenie locally with Python 3.10+ & FastAPI or inspect the modular source files
            </p>
          </div>
        </div>

        {/* 4 Step Quick Start Guide */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800 text-xs">
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
            <div className="font-bold text-indigo-400 mb-1">Step 1: Open in VS Code</div>
            <code className="text-[11px] text-slate-300 font-mono block">cd EduGenie</code>
            <p className="text-slate-400 text-[11px] mt-1">Open folder in VS Code workspace</p>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
            <div className="font-bold text-indigo-400 mb-1">Step 2: Virtual Env</div>
            <code className="text-[11px] text-slate-300 font-mono block">python -m venv venv</code>
            <code className="text-[11px] text-slate-400 font-mono block mt-0.5">source venv/bin/activate</code>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
            <div className="font-bold text-indigo-400 mb-1">Step 3: Dependencies</div>
            <code className="text-[11px] text-slate-300 font-mono block">pip install -r requirements.txt</code>
            <p className="text-slate-400 text-[11px] mt-1">Installs FastAPI & GenAI SDK</p>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
            <div className="font-bold text-emerald-400 mb-1">Step 4: Launch Server</div>
            <code className="text-[11px] text-emerald-300 font-mono block">uvicorn main:app --reload</code>
            <p className="text-slate-400 text-[11px] mt-1">Runs on http://127.0.0.1:8000</p>
          </div>
        </div>
      </div>

      {/* Code Browser */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <FolderTree className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-bold text-slate-700">EduGenie/</span>
            <span className="text-xs text-slate-400">Project Source Files</span>
          </div>

          <button
            onClick={handleCopyCode}
            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 shadow-2xs transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600 font-semibold">Copied {selectedFile}!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy File Code</span>
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4">
          {/* File Selector Sidebar */}
          <div className="border-r border-slate-200 bg-slate-50/50 p-2 space-y-1">
            {Object.keys(fileContents).map((fileName) => {
              const isSelected = selectedFile === fileName;
              return (
                <button
                  key={fileName}
                  onClick={() => setSelectedFile(fileName)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono transition-all text-left ${
                    isSelected
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <FileCode className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                    <span className="truncate">{fileName}</span>
                  </div>
                  <ChevronRight className={`w-3 h-3 ${isSelected ? 'text-white' : 'text-slate-300'}`} />
                </button>
              );
            })}
          </div>

          {/* Code Viewer Body */}
          <div className="md:col-span-3 p-4 sm:p-5 bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto min-h-[460px]">
            <div className="text-[11px] text-slate-400 pb-3 mb-3 border-b border-slate-800 flex items-center justify-between font-sans">
              <span>{fileContents[selectedFile]?.desc}</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] uppercase font-bold text-slate-300">
                {fileContents[selectedFile]?.lang}
              </span>
            </div>
            <pre className="whitespace-pre overflow-x-auto leading-relaxed">
              <code>{fileContents[selectedFile]?.code}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
