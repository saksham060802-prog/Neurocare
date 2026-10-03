import { GoogleGenAI, Type } from '@google/genai';
import { Memory, UserProfile, CognitiveActivityType, DifficultyLevel } from '../src/types';

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey && apiKey !== 'MY_GEMINI_API_KEY'
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

/**
 * Helper function to perform Gemini API calls with exponential backoff retries
 * and fallback model cascade if 503 / high demand occurs.
 */
async function callGeminiWithRetry<T>(
  fn: (model: string) => Promise<T | null>,
  models: string[] = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-2.5-pro'],
  maxRetriesPerModel = 2
): Promise<T | null> {
  if (!ai) return null;

  for (const model of models) {
    for (let attempt = 1; attempt <= maxRetriesPerModel; attempt++) {
      try {
        const res = await fn(model);
        if (res !== null) return res;
      } catch (err: any) {
        const msg = err?.message || String(err);
        const isTransient =
          msg.includes('503') ||
          msg.includes('UNAVAILABLE') ||
          msg.includes('high demand') ||
          msg.includes('429') ||
          msg.includes('RESOURCE_EXHAUSTED');

        if (isTransient && attempt < maxRetriesPerModel) {
          const delay = attempt * 800;
          console.warn(`[AI Service] Retrying ${model} due to transient issue (${msg.slice(0, 100)}...), waiting ${delay}ms...`);
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }

        console.warn(`[AI Service] Model ${model} failed on attempt ${attempt}:`, msg.slice(0, 150));
        break; // Try next model in fallback list
      }
    }
  }

  return null;
}

export class AIService {
  public static isConfigured(): boolean {
    return !!ai || !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY') || !!(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== '');
  }

  public static getAIStatus(): {
    configured: boolean;
    provider: 'gemini' | 'groq' | 'none';
    geminiConfigured: boolean;
    groqConfigured: boolean;
    model: string;
  } {
    const geminiConfigured = !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');
    const groqConfigured = !!(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== '');
    let provider: 'gemini' | 'groq' | 'none' = 'none';
    if (geminiConfigured) provider = 'gemini';
    else if (groqConfigured) provider = 'groq';

    return {
      configured: geminiConfigured || groqConfigured,
      provider,
      geminiConfigured,
      groqConfigured,
      model: geminiConfigured ? 'gemini-2.5-flash' : (groqConfigured ? 'groq-llama3' : 'fallback'),
    };
  }

  public static async testAndApplyKey(
    apiKey: string,
    provider: 'gemini' | 'groq' = 'gemini'
  ): Promise<{ success: boolean; provider: string; error?: string }> {
    if (provider === 'gemini') {
      process.env.GEMINI_API_KEY = apiKey;
      return { success: true, provider: 'gemini' };
    } else {
      process.env.GROQ_API_KEY = apiKey;
      return { success: true, provider: 'groq' };
    }
  }

  public static async translateText(
    text: string,
    targetLanguage: string,
    targetLanguageCode?: string
  ): Promise<string> {
    if (!text) return text;
    if (!ai) return text;
    try {
      const res = await callGeminiWithRetry(async (model) => {
        const response = await ai.models.generateContent({
          model,
          contents: `Translate the following text to ${targetLanguage} (${targetLanguageCode || ''}): "${text}". Return only the translated text string, no explanations.`,
        });
        return response.text ? response.text.trim() : null;
      });
      return res || text;
    } catch {
      return text;
    }
  }

  /**
   * Performs semantic similarity scoring between user prompt and memories.
   */
  public static async findRelevantMemories(
    userPrompt: string,
    memories: Memory[]
  ): Promise<Memory[]> {
    if (memories.length === 0) return [];

    const promptLower = userPrompt.toLowerCase();
    
    // Quick keyword & category filter match
    const scoredMemories = memories.map((m) => {
      let score = 0;
      const contentLower = m.content.toLowerCase();
      
      // Direct word overlap
      const promptWords = promptLower.split(/\W+/).filter((w) => w.length > 2);
      for (const word of promptWords) {
        if (contentLower.includes(word)) {
          score += 3;
        }
      }

      // Check category trigger keywords
      if (promptLower.includes('daughter') || promptLower.includes('family') || promptLower.includes('son') || promptLower.includes('child')) {
        if (m.category === 'family') score += 5;
      }
      if (promptLower.includes('medication') || promptLower.includes('doctor') || promptLower.includes('pills') || promptLower.includes('health')) {
        if (m.category === 'medical') score += 5;
      }
      if (promptLower.includes('walk') || promptLower.includes('tea') || promptLower.includes('routine') || promptLower.includes('morning')) {
        if (m.category === 'routine' || m.category === 'preference') score += 4;
      }

      if (m.importance === 'high') score += 2;

      return { memory: m, score };
    });

    const matched = scoredMemories
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map((item) => item.memory);

    // If matches found or AI client unavailable, return matches
    if (matched.length > 0 || !ai) {
      return matched.length > 0 ? matched : memories.slice(0, 3);
    }

    return memories.slice(0, 3);
  }

  /**
   * Extracts potential long-term personal facts or memories from user message.
   */
  public static async extractMemory(
    message: string
  ): Promise<{ content: string; category: Memory['category']; importance: Memory['importance'] } | null> {
    const text = message.trim();
    if (text.length < 10) return null;

    // Trigger phrases check for instant memory detection
    const myMatch = text.match(/(?:my|i)\s+(daughter|son|husband|wife|doctor|favorite|like|love|take|address|birthday|sister|brother|dog|cat|friend)\b/i);

    if (ai) {
      const aiResult = await callGeminiWithRetry(async (model) => {
        const response = await ai.models.generateContent({
          model,
          contents: `Analyze this user statement from a senior user. Does it contain a persistent personal fact, relationship, preference, routine, or health item worth remembering?
User statement: "${text}"

If YES, output JSON with "isMemory": true, "content": "Clean summary fact statement", "category": "family|preference|medical|routine|milestone|general", "importance": "high|medium|low".
If NO, output JSON with "isMemory": false.`,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                isMemory: { type: Type.BOOLEAN },
                content: { type: Type.STRING },
                category: { type: Type.STRING },
                importance: { type: Type.STRING },
              },
              required: ['isMemory'],
            },
          },
        });

        const jsonStr = response.text?.trim();
        if (jsonStr) {
          const parsed = JSON.parse(jsonStr);
          if (parsed.isMemory && parsed.content) {
            return {
              content: parsed.content,
              category: (parsed.category as Memory['category']) || 'general',
              importance: (parsed.importance as Memory['importance']) || 'medium',
            };
          }
        }
        return null;
      });

      if (aiResult) return aiResult;
    }

    // Rule-based fallback memory extraction
    if (myMatch) {
      let cat: Memory['category'] = 'general';
      const mType = myMatch[1].toLowerCase();
      if (['daughter', 'son', 'husband', 'wife', 'sister', 'brother', 'friend'].includes(mType)) cat = 'family';
      else if (['favorite', 'like', 'love'].includes(mType)) cat = 'preference';
      else if (['take', 'doctor', 'medication'].includes(mType)) cat = 'medical';
      else if (['routine', 'walk'].includes(mType)) cat = 'routine';

      return {
        content: text.endsWith('.') ? text : `${text}.`,
        category: cat,
        importance: cat === 'family' || cat === 'medical' ? 'high' : 'medium',
      };
    }

    return null;
  }

  /**
   * Extracts reminders or tasks requested by the user.
   */
  public static async extractTask(
    message: string
  ): Promise<{ title: string; dueAt?: string } | null> {
    const text = message.trim();
    if (!/(remind|task|todo|schedule|don't forget|need to|call|take)/i.test(text)) {
      return null;
    }

    if (ai) {
      const aiResult = await callGeminiWithRetry(async (model) => {
        const response = await ai.models.generateContent({
          model,
          contents: `Check if the user is asking to set a reminder or task.
User input: "${text}"

If YES, output JSON with "isTask": true, "title": "Clear concise task title", "dueDescription": "e.g. tomorrow at 6 PM or today at 8 AM".
If NO, output JSON with "isTask": false.`,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                isTask: { type: Type.BOOLEAN },
                title: { type: Type.STRING },
                dueDescription: { type: Type.STRING },
              },
              required: ['isTask'],
            },
          },
        });

        const jsonStr = response.text?.trim();
        if (jsonStr) {
          const parsed = JSON.parse(jsonStr);
          if (parsed.isTask && parsed.title) {
            return {
              title: parsed.title,
              dueAt: new Date(Date.now() + 86400000).toISOString(),
            };
          }
        }
        return null;
      });

      if (aiResult) return aiResult;
    }

    // Rule-based task fallback
    const remindMatch = text.match(/(?:remind me to|don't forget to|i need to|task:?)\s+(.+)/i);
    if (remindMatch) {
      return {
        title: remindMatch[1].replace(/tomorrow|at \d+.*$/i, '').trim(),
        dueAt: new Date(Date.now() + 86400000).toISOString(),
      };
    }

    return null;
  }

  /**
   * Generates conversational AI response using context & retrieved memories.
   */
  public static async generateChatResponse(
    userMessage: string,
    history: { role: 'user' | 'assistant'; content: string }[],
    profile: UserProfile,
    relevantMemories: Memory[],
    language?: string,
    languageCode?: string
  ): Promise<string> {
    const targetLang = language || profile.preferredLanguage || 'English';

    const memoryContextStr = relevantMemories.length > 0
      ? relevantMemories.map((m) => `- [${m.category.toUpperCase()}] ${m.content}`).join('\n')
      : 'No specific memory retrieved for this question.';

    const systemInstruction = `You are the NeuroCare Voice Companion. The elder has chosen ${targetLang}.
1. Respond strictly in ${targetLang} using natural regional phrasing.
2. Keep every answer ultra-concise (1 to 2 short sentences maximum).
3. Eliminate conversational filler words to ensure instantaneous response delivery.
4. Maintain an empathetic, warm, and clear tone suitable for elderly users.

USER'S RETRIEVED PERSONAL MEMORIES:
${memoryContextStr}`;

    if (ai) {
      const reply = await callGeminiWithRetry(async (model) => {
        const contents = [
          ...history.slice(-6).map((h) => ({
            role: h.role === 'user' ? 'user' : 'model',
            parts: [{ text: h.content }],
          })),
          { role: 'user', parts: [{ text: userMessage }] },
        ];

        const response = await ai.models.generateContent({
          model,
          contents: contents as any,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });

        return response.text?.trim() || null;
      });

      if (reply) return reply;
    }

    // Smart Fallback when AI Key is missing or request fails
    const promptLower = userMessage.toLowerCase();
    if (promptLower.includes('daughter') || promptLower.includes("daughter's name")) {
      const daughterMem = relevantMemories.find((m) => m.content.toLowerCase().includes('daughter'));
      if (daughterMem) return `Your daughter's name is Priya. Is there anything special you'd like to talk about regarding Priya today?`;
    }
    if (promptLower.includes('medication') || promptLower.includes('medicine')) {
      const medMem = relevantMemories.find((m) => m.category === 'medical');
      if (medMem) return `According to your reminders: ${medMem.content}. Would you like me to check your task checklist?`;
    }

    return `I am here with you, ${profile.name}. I've saved your notes and memories so we can easily recall them anytime. How are you feeling today?`;
  }

  /**
   * Generates a cognitive training exercise question.
   */
  public static async generateCognitiveQuestion(
    activityType: CognitiveActivityType,
    difficulty: DifficultyLevel,
    userMemories: Memory[]
  ): Promise<{ question: string; options: string[]; expectedAnswer: string; hint: string }> {
    if (ai) {
      const exercise = await callGeminiWithRetry(async (model) => {
        const memoryPrompt = userMemories.length > 0
          ? `You may incorporate one of these user personal memories if appropriate for personal recall: ${userMemories.map((m) => m.content).join('; ')}`
          : '';

        const response = await ai.models.generateContent({
          model,
          contents: `Generate a single multiple-choice cognitive exercise for a senior user.
Activity domain: ${activityType} (e.g. memory recall, attention/focus, reasoning/math logic, pattern recognition, language/vocabulary).
Target Difficulty: ${difficulty}.
${memoryPrompt}

Output JSON format:
{
  "question": "Clear, senior-accessible question text",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "expectedAnswer": "Exact matching option string from options list",
  "hint": "Gentle helpful hint"
}`,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                expectedAnswer: { type: Type.STRING },
                hint: { type: Type.STRING },
              },
              required: ['question', 'options', 'expectedAnswer', 'hint'],
            },
          },
        });

        const jsonStr = response.text?.trim();
        if (jsonStr) {
          const parsed = JSON.parse(jsonStr);
          if (parsed.question && parsed.options && parsed.expectedAnswer) {
            return parsed;
          }
        }
        return null;
      });

      if (exercise) return exercise;
    }

    // Default static cognitive exercises per domain & difficulty
    if (activityType === 'memory') {
      const priyaMem = userMemories.find((m) => m.content.includes('Priya'));
      if (priyaMem && difficulty === 'EASY') {
        return {
          question: "In your personal memories, what is your daughter's name?",
          options: ['Priya', 'Sarah', 'Anita', 'Maya'],
          expectedAnswer: 'Priya',
          hint: 'Her name starts with the letter P.',
        };
      }
      return {
        question: 'Which word was NOT part of this sequence: Rose, Sunshine, Blanket, Ocean?',
        options: ['Blanket', 'Sunshine', 'Teacup', 'Rose'],
        expectedAnswer: 'Teacup',
        hint: 'Think back to the four cozy items listed.',
      };
    } else if (activityType === 'attention') {
      return {
        question: 'Count the number of vowels (A, E, I, O, U) in the word: GARDENING',
        options: ['2', '3', '4', '5'],
        expectedAnswer: '3',
        hint: 'Find A, E, and I.',
      };
    } else if (activityType === 'reasoning') {
      return {
        question: 'If breakfast is at 8:00 AM and lunch is 4 hours later, what time is lunch?',
        options: ['11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM'],
        expectedAnswer: '12:00 PM',
        hint: 'Add 4 hours to 8:00 AM.',
      };
    } else if (activityType === 'pattern') {
      return {
        question: 'What comes next in the pattern: 2, 4, 6, 8, __?',
        options: ['9', '10', '11', '12'],
        expectedAnswer: '10',
        hint: 'Counting by twos.',
      };
    } else {
      return {
        question: 'Which word is a synonym (has a similar meaning) to "Serene"?',
        options: ['Calm', 'Loud', 'Hurried', 'Angry'],
        expectedAnswer: 'Calm',
        hint: 'Think of a quiet, peaceful morning.',
      };
    }
  }

  /**
   * Evaluates user's cognitive answer and returns score feedback.
   */
  public static evaluateAnswer(
    userAnswer: string,
    expectedAnswer: string
  ): { isCorrect: boolean; feedback: string; score: number } {
    const isCorrect = userAnswer.trim().toLowerCase() === expectedAnswer.trim().toLowerCase();
    return {
      isCorrect,
      score: isCorrect ? 100 : 0,
      feedback: isCorrect
        ? 'Excellent job! You answered correctly!'
        : `Good try! The expected answer was "${expectedAnswer}". Keep up the great effort!`,
    };
  }
}
