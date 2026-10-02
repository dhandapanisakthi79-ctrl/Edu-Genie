# EduGenie: Google Gemini Powered Learning Assistant

EduGenie is a lightweight AI-powered educational assistant that simplifies learning through generative AI. Designed for students of all academic levels, EduGenie enables users to:
- **Ask questions and receive smart, concise answers (Q&A)**
- **Understand complex concepts through simplified explanations**
- **Generate quizzes from topics or passages (3 MCQs with instant feedback & grading)**
- **Receive personalized learning recommendations (Curriculum Roadmaps)**
- **Summarize large educational passages for quick revision**

---

## 🛠️ VS Code Setup & Installation Guide

### Prerequisites
1. **Python 3.10+**: Download and install from [python.org](https://www.python.org/). (Check **"Add Python to PATH"** on Windows).
2. **VS Code**: Install Visual Studio Code and the official **Python Extension** (by Microsoft).
3. **Google Gemini API Key**: Get a free API key from [Google AI Studio](https://aistudio.google.com/).

---

### Step 1: Open Project in VS Code
1. Open VS Code.
2. Select **File > Open Folder...** and choose the `EduGenie` directory.
3. Open the integrated terminal in VS Code: `Ctrl + ~` (Windows/Linux) or `Cmd + ~` (macOS).

---

### Step 2: Create and Activate Virtual Environment

**On macOS / Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

**On Windows (PowerShell):**
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```
*(If PowerShell restricts scripts, run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` first).*

---

### Step 3: Install Required Dependencies
Run the following in your active terminal:
```bash
pip install -r requirements.txt
```

---

### Step 4: Configure Gemini API Key
Create a `.env` file in the `EduGenie/` root directory:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
```
*(Replace `your_actual_gemini_api_key_here` with your key from Google AI Studio).*

---

### Step 5: Run the EduGenie Application
Start the ASGI Uvicorn server:
```bash
uvicorn main:app --reload
```

You should see:
```text
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Application startup complete.
```

Open your browser and navigate to:
👉 **`http://127.0.0.1:8000`**

To explore interactive Swagger API docs, visit:
👉 **`http://127.0.0.1:8000/docs`**

---

## 🧪 Testing the 3 Core Scenarios

### Scenario 1: Q&A Exploration
1. In the Web UI, select **"Ask a Question (QnA Module)"** (or click the quick preset button).
2. Enter: `Which is the largest ocean?`
3. Click **"Run with EduGenie"**.
4. **Expected Result**: EduGenie returns the Pacific Ocean explanation, dimensions, key facts, and follow-up exploration questions.

### Scenario 2: Quiz Generation & Interactive Grading
1. Select **"Generate Quiz (3 MCQs with Answers)"**.
2. Enter: `The Pythagoras Theorem states that in a right-angled triangle, the square of the hypotenuse is equal to the sum of the squares of the other two sides: a² + b² = c².`
3. Click **"Run with EduGenie"**.
4. **Expected Result**: EduGenie generates 3 MCQs with 4 options each. Clicking an option immediately reveals whether it is correct or incorrect, provides the correct choice if wrong, and shows the rationale!

### Scenario 3: Structured Learning Path
1. Select **"Generate Structured Learning Path"**.
2. Enter: `SQL`
3. Click **"Run with EduGenie"**.
4. **Expected Result**: EduGenie generates a comprehensive beginner to advanced roadmap with timelines, required topics, curated video/documentation resources, and a hands-on project for each stage.

---

## 📂 File Architecture
```text
EduGenie/
├── main.py                  # FastAPI app & REST endpoints
├── explanation_module.py    # Concept explanation logic
├── qna.py                   # Question answering with Gemini
├── quiz_module.py           # Quiz generation & JSON parsing
├── summary_module.py        # Educational passage summarization
├── learning_path.py         # Learning recommendations roadmap
├── templates/
│   └── index.html           # Frontend HTML interface
├── static/
│   └── style.css            # Responsive CSS styling
├── requirements.txt         # Python dependencies
└── README.md                # Installation and testing guide
```
