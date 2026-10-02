import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google GenAI client (telemetry User-Agent required)
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper for resilient model generation with fallback on transient high-demand (503)
async function generateEducationalContent(prompt: string, schema: any) {
  const models = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
  let lastError: any = null;

  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: schema,
        },
      });
      return response;
    } catch (err: any) {
      lastError = err;
      console.warn(`Model ${model} warning: ${err?.message || err}`);
      await new Promise((resolve) => setTimeout(resolve, 400));
    }
  }

  throw lastError;
}

const GEMINI_MODEL = 'gemini-3.8-flash';

// Health check endpoint
app.get(['/api/health', '/health'], (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    appName: 'EduGenie',
    model: GEMINI_MODEL,
    hasApiKey: !!process.env.GEMINI_API_KEY,
  });
});

// 1. QnA Module (/api/qa and /qa)
const handleQA = async (req: Request, res: Response) => {
  try {
    const { question, level = 'General', subject = 'General Knowledge' } = req.body;
    if (!question || typeof question !== 'string') {
      res.status(400).json({ error: 'Please provide a valid question.' });
      return;
    }

    const prompt = `You are EduGenie's Q&A module. Answer the student's question accurately, concisely, and educationally.
Academic Level: ${level}
Subject: ${subject}
Question: ${question}

Provide:
1. A direct, clear, smart answer (2-4 concise paragraphs with clear formatting).
2. 3-4 bullet-point key facts or fast trivia.
3. 3 suggested follow-up questions for further learning.`;

    const schema = {
      type: Type.OBJECT,
      properties: {
        answer: {
          type: Type.STRING,
          description: 'The smart, concise, and structured answer to the question with markdown support.',
        },
        keyFacts: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: '3-4 concise key educational facts or statistics related to the answer.',
        },
        followUpQuestions: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: '3 relevant follow-up questions the student might explore next.',
        },
      },
      required: ['answer', 'keyFacts', 'followUpQuestions'],
    };

    const response = await generateEducationalContent(prompt, schema);
    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err: any) {
    console.error('Error in /qa endpoint:', err);
    res.status(500).json({
      error: 'Failed to process question with EduGenie QnA.',
      details: err?.message || String(err),
    });
  }
};
app.post('/api/qa', handleQA);
app.post('/qa', handleQA);

// 2. Concept Explanation Module (/api/explain and /explain)
const handleExplain = async (req: Request, res: Response) => {
  try {
    const { topic, level = 'Beginner', context = '' } = req.body;
    if (!topic || typeof topic !== 'string') {
      res.status(400).json({ error: 'Please provide a topic or concept to explain.' });
      return;
    }

    const prompt = `You are EduGenie's Concept Explanation module (inspired by the simplified, clear, intuitive approach).
Your goal is to break down complex academic or scientific concepts so anyone can understand them without feeling overwhelmed.
Topic: ${topic}
Target Audience Level: ${level}
Additional Context: ${context || 'None'}

Provide:
- A clear, simple definition.
- A real-world analogy that makes the concept click intuitively.
- Step-by-step breakdown of how it works (3-5 easy steps).
- Why this concept matters in real life.
- A common misconception and the clarification.`;

    const schema = {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        simpleDefinition: { type: Type.STRING },
        analogy: { type: Type.STRING },
        steps: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              stepNumber: { type: Type.INTEGER },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
            },
            required: ['stepNumber', 'title', 'description'],
          },
        },
        whyItMatters: { type: Type.STRING },
        commonMisconception: { type: Type.STRING },
        clarification: { type: Type.STRING },
      },
      required: ['title', 'simpleDefinition', 'analogy', 'steps', 'whyItMatters', 'commonMisconception', 'clarification'],
    };

    const response = await generateEducationalContent(prompt, schema);
    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err: any) {
    console.error('Error in /explain endpoint:', err);
    res.status(500).json({
      error: 'Failed to explain concept with EduGenie.',
      details: err?.message || String(err),
    });
  }
};
app.post('/api/explain', handleExplain);
app.post('/explain', handleExplain);

// 3. Quiz Module (/api/quiz and /quiz)
const handleQuiz = async (req: Request, res: Response) => {
  try {
    const { passage, topic, count = 3 } = req.body;
    const inputContent = passage || topic;
    if (!inputContent || typeof inputContent !== 'string') {
      res.status(400).json({ error: 'Please provide a passage or topic to generate a quiz.' });
      return;
    }

    const questionCount = Math.min(Math.max(parseInt(String(count), 10) || 3, 1), 5);

    const prompt = `You are EduGenie's Quiz Module.
Generate exactly ${questionCount} multiple-choice questions (MCQs) based on the provided topic or passage.
Each question MUST have exactly four carefully crafted options (A, B, C, D) with plausible distractors, and an accurate correctAnswer string that matches one of the options verbatim.
Also provide an educational explanation explaining why that answer is correct and why other choices are incorrect.

Topic / Passage:
"${inputContent}"`;

    const schema = {
      type: Type.OBJECT,
      properties: {
        topic: { type: Type.STRING },
        summary: { type: Type.STRING, description: 'Brief context or passage summary' },
        questions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.INTEGER },
              question: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Exactly 4 distinct answer choices',
              },
              correctAnswer: {
                type: Type.STRING,
                description: 'Must strictly match one of the 4 items in the options array verbatim',
              },
              explanation: {
                type: Type.STRING,
                description: 'Detailed explanation of why this answer is correct and helpful feedback if answered wrong.',
              },
            },
            required: ['id', 'question', 'options', 'correctAnswer', 'explanation'],
          },
        },
      },
      required: ['topic', 'questions'],
    };

    const response = await generateEducationalContent(prompt, schema);
    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err: any) {
    console.error('Error in /quiz endpoint:', err);
    res.status(500).json({
      error: 'Failed to generate quiz.',
      details: err?.message || String(err),
    });
  }
};
app.post('/api/quiz', handleQuiz);
app.post('/quiz', handleQuiz);

// 4. Summary Module (/api/summarize and /summarize)
const handleSummarize = async (req: Request, res: Response) => {
  try {
    const { text, focus = 'General revision' } = req.body;
    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Please provide educational text to summarize.' });
      return;
    }

    const prompt = `You are EduGenie's Summary Module.
Summarize the following educational passage into a concise, easy-to-understand version ideal for quick revision.
Retain core concepts while eliminating redundant fluff and complexity.
Focus: ${focus}

Text:
"${text}"`;

    const schema = {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: 'A fitting educational title for the passage' },
        quickSummary: { type: Type.STRING, description: 'Concise executive summary (2-3 sentences)' },
        keyTakeaways: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Key takeaways and revision bullet points',
        },
        keyTerms: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              term: { type: Type.STRING },
              definition: { type: Type.STRING },
            },
            required: ['term', 'definition'],
          },
          description: 'Key vocabulary or terminology found in the passage with easy definitions',
        },
        originalWordCount: { type: Type.INTEGER },
        summaryWordCount: { type: Type.INTEGER },
        timeSavedMinutes: { type: Type.STRING },
      },
      required: ['title', 'quickSummary', 'keyTakeaways', 'keyTerms'],
    };

    const response = await generateEducationalContent(prompt, schema);
    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err: any) {
    console.error('Error in /summarize endpoint:', err);
    res.status(500).json({
      error: 'Failed to generate summary.',
      details: err?.message || String(err),
    });
  }
};
app.post('/api/summarize', handleSummarize);
app.post('/summarize', handleSummarize);

// 5. Learning Path Module (/api/learn/recommendations and /learn/recommendations)
const handleLearningPath = async (req: Request, res: Response) => {
  try {
    const { topic, experienceLevel = 'Beginner', targetTimeline = '4-8 weeks' } = req.body;
    if (!topic || typeof topic !== 'string') {
      res.status(400).json({ error: 'Please provide a topic or skill for the learning path.' });
      return;
    }

    const prompt = `You are EduGenie's Learning Path Module.
Generate a structured, personalized learning path for the topic: "${topic}".
Current experience level: ${experienceLevel}
Estimated timeline goal: ${targetTimeline}

Structure the path from Beginner through Intermediate to Advanced concepts with timelines, recommended curated resources (official documentation, top free courses/videos, interactive platforms, books), hands-on practice projects for each stage, and study tips.`;

    const schema = {
      type: Type.OBJECT,
      properties: {
        topic: { type: Type.STRING },
        overview: { type: Type.STRING },
        prerequisites: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        stages: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              stageNumber: { type: Type.INTEGER },
              title: { type: Type.STRING },
              level: { type: Type.STRING, description: 'Beginner, Intermediate, or Advanced' },
              duration: { type: Type.STRING, description: 'e.g. Week 1-2' },
              description: { type: Type.STRING },
              topicsToMaster: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              handsOnProject: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  goal: { type: Type.STRING },
                },
                required: ['title', 'goal'],
              },
              resources: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    type: { type: Type.STRING, description: 'Documentation, Video, Course, Practice' },
                    recommendation: { type: Type.STRING },
                  },
                  required: ['name', 'type', 'recommendation'],
                },
              },
            },
            required: ['stageNumber', 'title', 'level', 'duration', 'description', 'topicsToMaster', 'handsOnProject', 'resources'],
          },
        },
        bestPracticeTips: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
      },
      required: ['topic', 'overview', 'prerequisites', 'stages', 'bestPracticeTips'],
    };

    const response = await generateEducationalContent(prompt, schema);
    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err: any) {
    console.error('Error in /learn/recommendations endpoint:', err);
    res.status(500).json({
      error: 'Failed to generate learning recommendations.',
      details: err?.message || String(err),
    });
  }
};
app.post('/api/learn/recommendations', handleLearningPath);
app.post('/learn/recommendations', handleLearningPath);

// Mount Vite or serve static
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EduGenie server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
