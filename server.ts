import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { dbService, SyncOperation } from './server/db';
import { AIService } from './server/aiService';
import { checkSupabaseConnection, isSupabaseConfigured } from './server/supabaseClient';

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // CORS headers
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Health check endpoint
  app.get('/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      aiStatus: AIService.getAIStatus(),
      geminiConfigured: AIService.isConfigured(),
      azureConfigured: !!(process.env.AZURE_SPEECH_KEY && process.env.AZURE_SPEECH_KEY !== ''),
      supabaseConfigured: isSupabaseConfigured(),
      elevenLabsConfigured: !!(process.env.ELEVENLABS_API_KEY && process.env.ELEVENLABS_API_KEY.trim() !== ''),
    });
  });

  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'Cognitive Companion Backend',
      aiStatus: AIService.getAIStatus(),
      geminiConfigured: AIService.isConfigured(),
      azureConfigured: !!(process.env.AZURE_SPEECH_KEY && process.env.AZURE_SPEECH_KEY !== ''),
      supabaseConfigured: isSupabaseConfigured(),
      elevenLabsConfigured: !!(process.env.ELEVENLABS_API_KEY && process.env.ELEVENLABS_API_KEY.trim() !== ''),
    });
  });

  // AI Configuration Endpoints (Live Gemini / Groq key connection)
  app.get('/api/config/ai', (req: Request, res: Response) => {
    res.json(AIService.getAIStatus());
  });

  app.post('/api/config/ai', async (req: Request, res: Response) => {
    const { apiKey, provider } = req.body;
    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length < 5) {
      return res.status(400).json({ error: 'Valid API key is required' });
    }

    const trimmed = apiKey.trim();
    const result = await AIService.testAndApplyKey(trimmed, provider || 'gemini');

    if (result.success) {
      // Persist to .env file if available
      try {
        const envPath = path.join(process.cwd(), '.env');
        if (fs.existsSync(envPath)) {
          let envContent = fs.readFileSync(envPath, 'utf-8');
          if (result.provider === 'gemini') {
            if (envContent.includes('GEMINI_API_KEY=')) {
              envContent = envContent.replace(/GEMINI_API_KEY="?[^"\r\n]*"?/, `GEMINI_API_KEY="${trimmed}"`);
            } else {
              envContent += `\nGEMINI_API_KEY="${trimmed}"\n`;
            }
          } else if (result.provider === 'groq') {
            if (envContent.includes('GROQ_API_KEY=')) {
              envContent = envContent.replace(/GROQ_API_KEY="?[^"\r\n]*"?/, `GROQ_API_KEY="${trimmed}"`);
            } else {
              envContent += `\nGROQ_API_KEY="${trimmed}"\n`;
            }
          }
          fs.writeFileSync(envPath, envContent);
        }
      } catch (e) {
        console.warn('Could not write API key to .env:', e);
      }

      return res.json({
        success: true,
        provider: result.provider,
        message: `${result.provider === 'gemini' ? 'Google Gemini AI' : 'Groq AI'} connected successfully!`,
      });
    } else {
      return res.status(400).json({
        success: false,
        error: result.error || 'Failed to connect with provided API key',
      });
    }
  });

  // Multilingual Dynamic Translation Endpoint
  app.post('/api/ai/translate', async (req: Request, res: Response) => {
    try {
      const { text, targetLanguage, targetLanguageCode } = req.body;
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: 'Text string is required' });
      }
      const translated = await AIService.translateText(
        text,
        targetLanguage || 'English',
        targetLanguageCode
      );
      res.json({ translatedText: translated, originalText: text });
    } catch (err: any) {
      console.warn('Translation error in /api/ai/translate:', err);
      res.json({ translatedText: req.body.text || '', error: err.message });
    }
  });

  // ElevenLabs Text-To-Speech (TTS) Endpoint
  const ttsRateLimitMap = new Map<string, number[]>();

  app.post('/api/tts', async (req: Request, res: Response) => {
    try {
      const apiKey = process.env.ELEVENLABS_API_KEY;
      if (!apiKey || apiKey.trim() === '') {
        return res.status(503).json({ error: 'ElevenLabs TTS service unavailable' });
      }

      const { text } = req.body;
      if (!text || typeof text !== 'string' || text.trim().length === 0) {
        return res.status(400).json({ error: 'Valid text string is required' });
      }

      // Simple sliding-window rate limit per IP (max 15 requests per 60 seconds)
      const rawIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || 'unknown';
      const now = Date.now();
      const userRequests = (ttsRateLimitMap.get(rawIp) || []).filter((t) => now - t < 60000);
      if (userRequests.length >= 15) {
        return res.status(429).json({ error: 'Rate limit exceeded for TTS. Please try again later.' });
      }
      userRequests.push(now);
      ttsRateLimitMap.set(rawIp, userRequests);

      // Clean markdown formatting & emojis, cap at 800 chars
      const cleanText = text
        .replace(/```[\s\S]*?```/g, '')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/[#*_~>|-]/g, ' ')
        .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 800);

      if (!cleanText) {
        return res.status(400).json({ error: 'Text contains no speakable characters' });
      }

      const defaultVoiceId = '21m00Tcm4TlvDq8ikWAM';
      const voiceId = (process.env.ELEVENLABS_VOICE_ID && process.env.ELEVENLABS_VOICE_ID.trim())
        ? process.env.ELEVENLABS_VOICE_ID.trim()
        : defaultVoiceId;

      const elevenRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey.trim(),
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg',
        },
        body: JSON.stringify({
          text: cleanText,
          model_id: 'eleven_multilingual_v2',
        }),
      });

      if (!elevenRes.ok) {
        console.error('[ElevenLabs TTS] Upstream error status:', elevenRes.status);
        return res.status(503).json({ error: 'ElevenLabs TTS service unavailable' });
      }

      const audioBuffer = await elevenRes.arrayBuffer();
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Content-Length', audioBuffer.byteLength.toString());
      res.send(Buffer.from(audioBuffer));
    } catch (err: any) {
      console.error('[ElevenLabs TTS] Exception:', err?.message || err);
      res.status(503).json({ error: 'ElevenLabs TTS service unavailable' });
    }
  });

  // Supabase PostgreSQL Status endpoint
  app.get('/api/supabase/status', async (req: Request, res: Response) => {
    try {
      const status = await checkSupabaseConnection();
      res.json(status);
    } catch (e: any) {
      res.status(500).json({ configured: isSupabaseConfigured(), connected: false, error: e.message });
    }
  });

  // Offline Sync Endpoints (Dexie.js IndexedDB Integration)
  app.get('/api/sync/pull', async (req: Request, res: Response) => {
    try {
      const since = req.query.since as string | undefined;
      const data = await dbService.pullSyncData(since);
      res.json(data);
    } catch (e: any) {
      console.error('Error in /api/sync/pull:', e);
      res.status(500).json({ error: 'Failed to pull sync data', details: e.message });
    }
  });

  app.post('/api/sync/push', async (req: Request, res: Response) => {
    try {
      const operations: SyncOperation[] = req.body.operations || [];
      const result = await dbService.processSyncPush(operations);
      res.json({
        success: true,
        processed: result.processed,
        errors: result.errors,
        timestamp: new Date().toISOString(),
      });
    } catch (e: any) {
      console.error('Error in /api/sync/push:', e);
      res.status(500).json({ error: 'Failed to process sync push', details: e.message });
    }
  });

  // Profile Endpoints
  app.get('/api/profile', (req: Request, res: Response) => {
    res.json(dbService.getProfile());
  });

  app.put('/api/profile', async (req: Request, res: Response) => {
    const updated = await dbService.updateProfile(req.body);
    res.json(updated);
  });

  // Chat Endpoint with RAG memory extraction & task extraction
  app.post('/api/chat', async (req: Request, res: Response) => {
    try {
      const { message, history, language, languageCode } = req.body;
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Message string is required' });
      }

      const profile = dbService.getProfile();
      const allMemories = dbService.getMemories();

      // RAG Semantic memory search
      const relevantMemories = await AIService.findRelevantMemories(message, allMemories);

      // Conversational AI response
      const aiReply = await AIService.generateChatResponse(
        message,
        history || [],
        profile,
        relevantMemories,
        language,
        languageCode
      );

      // Memory Extraction check
      const extractedMem = await AIService.extractMemory(message);
      let newMemory = null;
      if (extractedMem) {
        newMemory = await dbService.addMemory(
          extractedMem.content,
          extractedMem.category,
          extractedMem.importance,
          'chat'
        );
      }

      // Task Extraction check
      const extractedTaskData = await AIService.extractTask(message);
      let newTask = null;
      if (extractedTaskData) {
        newTask = await dbService.addTask(extractedTaskData.title, 'Created via chat assistant', extractedTaskData.dueAt);
      }

      // Save to chat history
      await dbService.addChatMessage({ role: 'user', content: message });
      const assistantMsg = await dbService.addChatMessage({
        role: 'assistant',
        content: aiReply,
        memoriesUsed: relevantMemories.map((m) => ({ id: m.id, content: m.content })),
        extractedMemory: extractedMem ? { content: extractedMem.content, category: extractedMem.category } : undefined,
        extractedTask: newTask ? { title: newTask.title, dueAt: newTask.dueAt } : undefined,
      });

      res.json({
        response: aiReply,
        sessionId: `ses_${Date.now()}`,
        memoriesUsed: relevantMemories,
        extractedMemory: newMemory,
        extractedTask: newTask,
        message: assistantMsg,
      });
    } catch (e: any) {
      console.error('Error in /api/chat:', e);
      res.status(500).json({ error: 'Failed to process chat message', details: e.message });
    }
  });

  app.get('/api/chat/history', (req: Request, res: Response) => {
    res.json(dbService.getChatHistory());
  });

  app.delete('/api/chat/history', async (req: Request, res: Response) => {
    await dbService.clearChatHistory();
    res.json({ success: true, message: 'Chat history cleared' });
  });

  // Memories Endpoints
  app.get('/api/memories', (req: Request, res: Response) => {
    const q = req.query.q as string | undefined;
    const category = req.query.category as string | undefined;
    res.json(dbService.getMemories(q, category));
  });

  app.post('/api/memories', async (req: Request, res: Response) => {
    const { content, category, importance, tags } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Memory content is required' });
    }
    const memory = await dbService.addMemory(content, category, importance, 'manual', tags || []);
    res.status(201).json(memory);
  });

  app.put('/api/memories/:id', async (req: Request, res: Response) => {
    const updated = await dbService.updateMemory(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Memory not found' });
    res.json(updated);
  });

  app.delete('/api/memories/:id', async (req: Request, res: Response) => {
    const deleted = await dbService.deleteMemory(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Memory not found' });
    res.json({ success: true });
  });

  // Tasks Endpoints
  app.get('/api/tasks', (req: Request, res: Response) => {
    const status = req.query.status as 'pending' | 'completed' | undefined;
    res.json(dbService.getTasks(status));
  });

  app.post('/api/tasks', async (req: Request, res: Response) => {
    const { title, description, dueAt, category } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Task title is required' });
    }
    const task = await dbService.addTask(title, description, dueAt, category);
    res.status(201).json(task);
  });

  app.put('/api/tasks/:id', async (req: Request, res: Response) => {
    const updated = await dbService.updateTask(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Task not found' });
    res.json(updated);
  });

  app.delete('/api/tasks/:id', async (req: Request, res: Response) => {
    const deleted = await dbService.deleteTask(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Task not found' });
    res.json({ success: true });
  });

  // Cognitive Training Endpoints
  app.get('/api/cognitive/question', async (req: Request, res: Response) => {
    const activityType = (req.query.activityType as any) || 'memory';
    const difficulty = (req.query.difficulty as any) || 'EASY';

    const memories = dbService.getMemories();
    const exercise = await AIService.generateCognitiveQuestion(activityType, difficulty, memories);
    res.json(exercise);
  });

  app.post('/api/cognitive/submit', async (req: Request, res: Response) => {
    const { activityType, difficulty, question, userAnswer, expectedAnswer, durationSeconds } = req.body;

    if (!userAnswer || !expectedAnswer) {
      return res.status(400).json({ error: 'userAnswer and expectedAnswer are required' });
    }

    const evaluation = AIService.evaluateAnswer(userAnswer, expectedAnswer);

    const session = await dbService.addCognitiveSession({
      activityType: activityType || 'memory',
      difficulty: difficulty || 'EASY',
      questionsCount: 1,
      correctCount: evaluation.isCorrect ? 1 : 0,
      score: evaluation.score,
      durationSeconds: durationSeconds || 30,
    });

    res.json({
      evaluation,
      session,
      nextDifficulty: evaluation.score >= 80 ? (difficulty === 'EASY' ? 'MEDIUM' : 'HARD') : difficulty,
    });
  });

  app.get('/api/cognitive/history', (req: Request, res: Response) => {
    res.json(dbService.getCognitiveSessions());
  });

  // Progress Endpoint
  app.get('/api/progress', (req: Request, res: Response) => {
    res.json(dbService.getProgressMetrics());
  });

  // Caregiver Endpoints
  app.get('/api/caregiver/overview', (req: Request, res: Response) => {
    res.json(dbService.getCaregiverOverview());
  });

  // Photo Memories Endpoints
  app.get('/api/photos', (req: Request, res: Response) => {
    res.json(dbService.getPhotoMemories());
  });

  app.post('/api/photos', async (req: Request, res: Response) => {
    const { photoUrl, title, relationTag, location, date, contextHint, uploadedBy, voiceNote } = req.body;
    if (!photoUrl || !title) {
      return res.status(400).json({ error: 'photoUrl and title are required' });
    }
    const profile = dbService.getProfile();
    const newPhoto = await dbService.addPhotoMemory({
      userId: profile.userId,
      photoUrl,
      title,
      relationTag: relationTag || 'Family Member',
      location,
      date,
      contextHint,
      uploadedBy: uploadedBy || 'caregiver',
      voiceNote,
    });
    res.status(201).json(newPhoto);
  });

  app.delete('/api/photos/:id', async (req: Request, res: Response) => {
    const deleted = await dbService.deletePhotoMemory(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Photo not found' });
    res.json({ success: true });
  });

  // ==========================================
  // REAL-TIME MULTI-USER GEOFENCING API
  // ==========================================

  // Get live geofence state (radius, safe-zone center, tracked user locations)
  app.get('/api/geofence', (req: Request, res: Response) => {
    res.json(dbService.getGeofenceState());
  });

  // Update geofence safe radius in real time (Caregiver control)
  app.put('/api/geofence/radius', (req: Request, res: Response) => {
    const { radiusMeters, controlledBy } = req.body;
    if (typeof radiusMeters !== 'number' || radiusMeters <= 0) {
      return res.status(400).json({ error: 'Valid radiusMeters number is required' });
    }
    const updatedState = dbService.updateGeofenceRadius(radiusMeters, controlledBy);
    res.json(updatedState);
  });

  // Update safe residence center location
  app.post('/api/geofence/center', (req: Request, res: Response) => {
    const { centerLat, centerLng, locationName } = req.body;
    if (typeof centerLat !== 'number' || typeof centerLng !== 'number') {
      return res.status(400).json({ error: 'Valid centerLat and centerLng are required' });
    }
    const updatedState = dbService.updateGeofenceCenter(centerLat, centerLng, locationName);
    res.json(updatedState);
  });

  // Post live GPS location from device (Patient or Caregiver)
  app.post('/api/geofence/location', (req: Request, res: Response) => {
    const { userId, userName, role, lat, lng, accuracyMeters, speedKmh, headingDeg, batteryPercent } = req.body;
    if (!userId || typeof lat !== 'number' || typeof lng !== 'number') {
      return res.status(400).json({ error: 'userId, lat, and lng numbers are required' });
    }
    const updatedState = dbService.updateUserLocation({
      userId,
      userName,
      role,
      lat,
      lng,
      accuracyMeters,
      speedKmh,
      headingDeg,
      batteryPercent,
    });
    res.json(updatedState);
  });

  // Vite middleware for dev / static serving for prod

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        watch: {
          ignored: ['**/data/**', '**/data/db.json', '**/*.log', '**/dist/**'],
        },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Cognitive Companion full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
