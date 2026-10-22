import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import fs from 'fs/promises';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Shared Gemini client instance with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper: Timeout wrapper for AI calls
async function generateWithTimeout<T>(promise: Promise<T>, ms = 4000): Promise<T> {
  let timeoutId: any;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('AI generation timed out')), ms);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timeoutId);
  }
}

// Helper: Run Python CLI command safely
function runPythonCommand(args: string[], inputStdin?: string): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(__dirname, 'server', 'python', 'alarm_ai_core.py');
    const child = spawn('python3', [pythonScript, ...args]);

    let stdout = '';
    let stderr = '';

    if (inputStdin) {
      child.stdin.write(inputStdin);
      child.stdin.end();
    }

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('close', (code) => {
      resolve({ stdout, stderr, exitCode: code ?? 0 });
    });

    child.on('error', (err) => {
      reject(err);
    });
  });
}

// 1. Natural Language Alarm Parser (Gemini AI with Python fallback)
app.post('/api/ai/parse-alarm', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Missing prompt string' });
  }

  // Attempt Gemini API parse first
  try {
    if (process.env.GEMINI_API_KEY) {
      const response = await generateWithTimeout(
        ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `You are the AI engine for 'Déjà Due', a cute, warm, calendar-integrated alarm clock app.
Analyze this user request for a date-specific alarm:
"${prompt}"

Today's reference date is 2026-10-22.
Extract or synthesize:
1. title: A cute, expressive alarm title with an emoji (e.g. "BFF's Birthday! 🎂")
2. targetDate: YYYY-MM-DD (e.g. "2026-12-22")
3. targetTime: HH:MM in 24-hr format (e.g. "08:30" or "09:00" if unspecified)
4. category: one of ["bff_birthday", "romance", "milestone", "self_care", "exam_work", "travel", "general"]
5. recurrence: one of ["once", "daily", "weekly", "monthly", "yearly"] (Birthdays are "yearly")
6. recurrenceEndDate: optional string YYYY-MM-DD or null if no end date
7. note: user's personal reminder or notes
8. cuteGreeting: An adorable, uplifting, sweet wake-up message to display when the alarm goes off.
9. suggestedMission: A fun, cute wake-up mission or task (e.g., "Send a birthday voice memo & photo collage to your bestie! 💖")
10. vibeColor: A soft hex color like "#FB7185", "#F472B6", "#F9A8D4", "#FDBA74", or "#C084FC"`,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                targetDate: { type: Type.STRING },
                targetTime: { type: Type.STRING },
                category: { type: Type.STRING },
                recurrence: { type: Type.STRING },
                recurrenceEndDate: { type: Type.STRING, nullable: true },
                note: { type: Type.STRING },
                cuteGreeting: { type: Type.STRING },
                suggestedMission: { type: Type.STRING },
                vibeColor: { type: Type.STRING },
              },
              required: ['title', 'targetDate', 'targetTime', 'category', 'recurrence', 'cuteGreeting'],
            },
          },
        }),
        3500
      );

      const parsed = JSON.parse(response.text || '{}');
      return res.json({ source: 'gemini-ai', data: parsed });
    }
  } catch (error) {
    console.warn('Gemini parse failed, falling back to Python NLP engine:', error);
  }

  // Fallback to Python Core NLP Engine
  try {
    const pyResult = await runPythonCommand(['--parse-prompt', prompt]);
    if (pyResult.exitCode === 0) {
      const data = JSON.parse(pyResult.stdout);
      data.cuteGreeting = 'Time to rise and shine! A wonderful day is waiting for you ✨';
      data.suggestedMission = 'Take a deep breath, smile, and celebrate today!';
      data.vibeColor = '#FB7185';
      return res.json({ source: 'python-nlp-engine', data });
    }
  } catch (pyErr) {
    console.error('Python NLP error:', pyErr);
  }

  // Basic deterministic fallback
  return res.json({
    source: 'local-fallback',
    data: {
      title: "BFF's Birthday! 🎂",
      targetDate: '2026-12-22',
      targetTime: '08:30',
      category: 'bff_birthday',
      recurrence: 'yearly',
      recurrenceEndDate: null,
      note: 'Call bestie and bring strawberry shortcake!',
      cuteGreeting: 'Happy Birthday to your bestie! Have the most wonderful day together 🍓✨',
      suggestedMission: 'Send a birthday hug voice note and favorite memory selfie! 🎀',
      vibeColor: '#FB7185',
    },
  });
});

// 2. AI Schedule & Preference Learner (Suggests Ideal Alarm Time & Encouraging Message)
app.post('/api/ai/suggest-time', async (req, res) => {
  const { eventTitle, targetDate, category, preferences, existingAlarms } = req.body;

  const userChronotype = preferences?.chronotype || 'early_bird';
  const bufferMinutes = preferences?.morningBufferMinutes || 45;
  const tone = preferences?.encouragementTone || 'gentle_sweet';

  try {
    if (process.env.GEMINI_API_KEY) {
      const prompt = `You are the AI Schedule & Lifestyle Assistant for 'Déjà Due', a warm, friendly alarm app designed with a cute, feminine aesthetic.
Analyze the user's profile and planned event:
- Event: "${eventTitle}"
- Target Date: ${targetDate || '2026-10-23'}
- Category: ${category || 'general'}
- User Chronotype: ${userChronotype} (e.g. early_bird or night_owl)
- User Morning Buffer: ${bufferMinutes} minutes to get ready
- Desired Encouragement Tone: ${tone}
- Existing Alarms Count: ${(existingAlarms || []).length}

Task:
1. Suggest the optimal wake-up alarm time (HH:MM in 24h format, e.g. "08:15").
2. Provide a warm, thoughtful reasoning that explains how this fits their routine and morning prep.
3. Craft a personalized, encouraging, uplifting morning message to display when this specific alarm rings.
4. Recommend 3 gentle preparation steps (e.g. "Sip warm lemon water", "Pack birthday surprise card", "5 min gentle stretch").`;

      const response = await generateWithTimeout(
        ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                suggestedTime: { type: Type.STRING },
                reasoning: { type: Type.STRING },
                personalizedGreeting: { type: Type.STRING },
                prepSteps: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ['suggestedTime', 'reasoning', 'personalizedGreeting', 'prepSteps'],
            },
          },
        }),
        3500
      );

      const parsed = JSON.parse(response.text || '{}');
      return res.json({ source: 'gemini-ai', ...parsed });
    }
  } catch (error) {
    console.warn('AI suggest time failed, using heuristic fallback:', error);
  }

  // Heuristic rule fallback based on category & chronotype
  let defaultTime = userChronotype === 'early_bird' ? '07:30' : '08:30';
  if (category === 'bff_birthday') defaultTime = '08:15';
  if (category === 'self_care') defaultTime = '09:00';
  if (category === 'exam_work') defaultTime = '07:00';
  if (category === 'travel') defaultTime = '06:00';

  return res.json({
    source: 'heuristic-learner',
    suggestedTime: defaultTime,
    reasoning: `Based on your ${bufferMinutes}m morning buffer and preference for ${tone.replace('_', ' ')} mornings, waking at ${defaultTime} ensures you have comfortable time to prep without any rush.`,
    personalizedGreeting: `Good morning beautiful! Today is your special day for "${eventTitle}". Take a peaceful breath, smile, and let your wonderful energy shine! 🌸✨`,
    prepSteps: [
      'Take 3 gentle deep breaths and stretch your shoulders',
      'Hydrate with a warm glass of water or matcha',
      'Put on your favorite comfort outfit and step into the day with confidence',
    ],
  });
});

// 3. AI Smart Snooze Challenge Generator
app.post('/api/ai/snooze-challenge', async (req, res) => {
  const { challengeType, alarmTitle } = req.body;
  const type = challengeType || 'riddle';

  try {
    if (process.env.GEMINI_API_KEY) {
      const prompt = `You are the cute Smart Snooze Assistant for 'Déjà Due'.
Generate a very simple, delightful morning snooze challenge so the user can earn a 10-minute snooze while gently waking up their brain.
Challenge type requested: ${type} (can be: 'affirmation', 'riddle', 'trivia')
Alarm Title: "${alarmTitle || 'Morning Wakeup'}"

Rules:
- Keep it cute, positive, friendly, warm, feminine aesthetic (soft emojis 🌸, ☕, 🍓, 🥐).
- Not stressful, very pleasant to answer half-awake.
- Return JSON:
  - question: the short charming challenge or riddle
  - hint: a gentle 1-word or emoji hint
  - expectedAnswerKeywords: an array of 2-4 acceptable keywords or ideas`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              hint: { type: Type.STRING },
              expectedAnswerKeywords: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ['question', 'hint', 'expectedAnswerKeywords'],
          },
        },
      });

      return res.json(JSON.parse(response.text || '{}'));
    }
  } catch (error) {
    console.warn('AI snooze challenge fallback:', error);
  }

  // Pre-crafted charming questions
  const fallbacks: Record<string, any> = {
    affirmation: {
      question: 'What is one sweet thing you want to achieve or feel today? 🌸',
      hint: 'Type anything positive, like peace, joy, or finishing your project!',
      expectedAnswerKeywords: ['happy', 'peace', 'joy', 'smile', 'love', 'done', 'fun'],
    },
    riddle: {
      question: 'Sweet Morning Riddle: I am warm, comforting, and best poured into your favorite cute mug. What am I? ☕',
      hint: 'Coffee / Tea / Matcha',
      expectedAnswerKeywords: ['coffee', 'tea', 'matcha', 'latte', 'cocoa', 'chai'],
    },
    trivia: {
      question: 'Cute Morning Spark: What is 8 + 7? 🍓',
      hint: 'A number between 10 and 20',
      expectedAnswerKeywords: ['15', 'fifteen'],
    },
  };

  return res.json(fallbacks[type] || fallbacks.riddle);
});

// 4. AI Smart Snooze Challenge Evaluator
app.post('/api/ai/evaluate-snooze-challenge', async (req, res) => {
  const { userAnswer, question } = req.body;
  if (!userAnswer || !userAnswer.trim()) {
    return res.json({
      approved: false,
      feedbackMessage: 'Type a sweet little thought or answer first! 🌸',
    });
  }

  // Any thoughtful answer or non-empty string is graciously approved
  const sweetFeedbacks = [
    'Wonderful answer! Your brain is gently waking up. Enjoy your 10 minutes of cozy extra snooze! 🛌✨',
    'So lovely! Snooze approved—snuggle in and let yourself rest a little longer 🌸',
    'Spot on! Take your extra 10 minutes of blissful calm, gorgeous! 🥐☕',
  ];
  const chosenFeedback = sweetFeedbacks[Math.floor(Math.random() * sweetFeedbacks.length)];

  return res.json({
    approved: true,
    feedbackMessage: chosenFeedback,
    snoozeMinutesGranted: 10,
  });
});

// 5. Python Diagnostics and Timeline Analysis (Runs Python 3.10 script)
app.post('/api/python/run-analyzer', async (req, res) => {
  try {
    const alarms = req.body.alarms || [];
    const result = await runPythonCommand(['--analyze-stdin'], JSON.stringify(alarms));
    if (result.exitCode === 0) {
      const parsed = JSON.parse(result.stdout);
      return res.json(parsed);
    } else {
      return res.status(500).json({ error: 'Python analyzer execution failed', details: result.stderr });
    }
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Execution error' });
  }
});

// 6. Python Unit Tests Runner
app.post('/api/python/run-tests', async (_req, res) => {
  try {
    const result = await runPythonCommand(['--test']);
    return res.json({
      success: result.exitCode === 0,
      output: result.stderr || result.stdout,
      exitCode: result.exitCode,
      runtime: 'Python 3.10.12',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 7. BFF Milestone & Celebration Plan (Python)
app.post('/api/python/bff-plan', async (req, res) => {
  try {
    const { targetDate } = req.body;
    const dateStr = targetDate || '2026-12-22';
    const result = await runPythonCommand(['--bff-plan', dateStr]);
    if (result.exitCode === 0) {
      return res.json(JSON.parse(result.stdout));
    }
    return res.status(500).json({ error: 'BFF plan failed', stderr: result.stderr });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 8. Fetch Python Source Code for In-App Project Inspection & Download
app.get('/api/python/project-files', async (_req, res) => {
  try {
    const pythonPath = path.join(__dirname, 'server', 'python', 'alarm_ai_core.py');
    const docPath = path.join(__dirname, 'server', 'python', 'README_PROJECT_SUBMISSION.md');

    const [pythonCode, documentation] = await Promise.all([
      fs.readFile(pythonPath, 'utf-8'),
      fs.readFile(docPath, 'utf-8'),
    ]);

    return res.json({
      files: [
        {
          filename: 'alarm_ai_core.py',
          language: 'python',
          description: 'Core Date-Specific Alarm engine with recurring intervals, end-date lifecycle, NLP parser, and conflict detection',
          content: pythonCode,
        },
        {
          filename: 'README_PROJECT_SUBMISSION.md',
          language: 'markdown',
          description: 'Academic project report including Problem Statement, Algorithm Analysis, and Complexity Benchmarks',
          content: documentation,
        },
      ],
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 9. AI Sweet Wish Generator for BFFs and Loved Ones
app.post('/api/ai/friendship-wishes', async (req, res) => {
  const { friendName, vibe, occasion } = req.body;
  try {
    if (process.env.GEMINI_API_KEY) {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Write 3 cute, heartwarming, personalized birthday / celebration wishes for my best friend ${friendName || 'my BFF'}.
Occasion: ${occasion || 'Birthday'}
Vibe: ${vibe || 'sweet, cute, aesthetic, humorous & loving'}
Include charming emojis (cakes, ribbons, flowers, sparkles). Format as a JSON array of 3 strings.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
      });

      const wishes = JSON.parse(response.text || '[]');
      return res.json({ wishes });
    }
  } catch (err) {
    console.warn('Wishes generation fallback:', err);
  }

  return res.json({
    wishes: [
      `Happy Birthday to my favorite human on the planet! 🎂✨ Thank you for always being the sunshine in my life, laughing at all my silly jokes, and sharing endless coffee runs. You deserve the sweetest year ahead! 💖🎀`,
      `To my dearest BFF: Another year of being utterly fabulous, kind-hearted, and unstoppable! 🌸🍰 Wishing you endless strawberry shortcakes, warm hugs, and dreams coming true today! Love you forever! 💫💌`,
      `Happy Birthday bestie! 🍓✨ May your day be filled with warm peach sunsets, sweet surprises, and all the love you give so effortlessly to the world! Let's celebrate all week long! 🎈🥂`,
    ],
  });
});

// Vite middleware integration for full-stack SPA
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌸 Déjà Due server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
