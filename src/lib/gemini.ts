// ============================================================
// VoteWise — Gemini AI Client
// Provides chat, quiz generation, text simplification,
// translation, and fact-checking using Gemini 2.0 Flash
// ============================================================

import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { ELECTION_SYSTEM_PROMPT } from './election-data';
import { GEMINI_CONFIG, CACHE_TTL } from './constants';
import { LRUCache } from './cache';

/** Singleton instances */
let genAI: GoogleGenerativeAI | null = null;
let model: GenerativeModel | null = null;

/** Response caches for deduplication and performance */
const quizCache = new LRUCache<string>(30, CACHE_TTL.QUIZ_QUESTIONS);
const chatCache = new LRUCache<string>(50, CACHE_TTL.CHAT_RESPONSES);

/**
 * Retrieves or initializes the Gemini model singleton.
 * Returns null if no API key is configured.
 */
function getModel(): GenerativeModel | null {
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your-gemini-api-key') return null;
  if (!genAI) genAI = new GoogleGenerativeAI(apiKey);
  if (!model) {
    model = genAI.getGenerativeModel({
      model: GEMINI_CONFIG.MODEL_NAME,
      systemInstruction: ELECTION_SYSTEM_PROMPT,
    });
  }
  return model;
}

/**
 * Sends a chat message to Gemini and returns the response.
 * Falls back to deterministic responses when API is unavailable.
 *
 * @param message - The user's message text
 * @param history - Previous conversation turns for context
 * @returns The AI-generated response string
 */
export async function chatWithGemini(
  message: string,
  history: { role: string; parts: { text: string }[] }[] = []
): Promise<string> {
  const geminiModel = getModel();
  if (!geminiModel) return getFallbackResponse(message);

  // Check cache for identical standalone messages (no history context)
  const cacheKey = history.length === 0 ? `chat:${message.toLowerCase().trim()}` : '';
  if (cacheKey) {
    const cached = chatCache.get(cacheKey);
    if (cached) return cached;
  }

  try {
    const chat = geminiModel.startChat({
      history: history.map(h => ({
        role: h.role as 'user' | 'model',
        parts: h.parts,
      })),
    });
    const result = await chat.sendMessage(message);
    const response = result.response.text();

    if (cacheKey) chatCache.set(cacheKey, response);
    return response;
  } catch (error) {
    console.error('Gemini API error:', error);
    return getFallbackResponse(message);
  }
}

/**
 * Generates quiz questions using Gemini AI.
 * Results are cached by topic, difficulty, and count to avoid
 * redundant API calls for identical requests.
 *
 * @param topic - The quiz topic (e.g., "voting process")
 * @param difficulty - Question difficulty level
 * @param count - Number of questions to generate
 * @returns JSON string of generated quiz questions
 */
export async function generateQuizQuestions(
  topic: string,
  difficulty: string = 'intermediate',
  count: number = 5
): Promise<string> {
  const cacheKey = `quiz:${topic}:${difficulty}:${count}`;
  const cached = quizCache.get(cacheKey);
  if (cached) return cached;

  const geminiModel = getModel();
  if (!geminiModel) return getFallbackQuizResponse();

  try {
    const prompt = `Generate ${count} multiple choice quiz questions about "${topic}" in the context of Indian elections. Difficulty: ${difficulty}.

Format each question as JSON:
[{
  "question": "...",
  "options": ["A", "B", "C", "D"],
  "correctAnswer": 0,
  "explanation": "...",
  "difficulty": "${difficulty}",
  "category": "process"
}]

Rules:
- Questions must be factually accurate about Indian elections
- Include explanations citing sources (ECI, Constitution)
- Be non-partisan and educational
- Return ONLY valid JSON array`;

    const result = await geminiModel.generateContent(prompt);
    const response = result.response.text();
    quizCache.set(cacheKey, response);
    return response;
  } catch (error) {
    console.error('Gemini quiz generation error:', error);
    return getFallbackQuizResponse();
  }
}

/**
 * Simplifies complex election text for easier understanding.
 * Adjusts reading level based on the target audience.
 *
 * @param text - The complex text to simplify
 * @param level - Target audience reading level
 * @returns Simplified version of the input text
 */
export async function simplifyText(
  text: string,
  level: 'child' | 'teenager' | 'adult' = 'teenager'
): Promise<string> {
  const geminiModel = getModel();
  if (!geminiModel) return getFallbackSimplification(text, level);

  try {
    const levelDesc = level === 'child' ? 'a 10-year-old child' : level === 'teenager' ? 'a 15-year-old teenager' : 'a general adult';
    const result = await geminiModel.generateContent(
      `Simplify the following text about Indian elections for ${levelDesc}. Keep it accurate but make it easy to understand. Use simple words and short sentences.\n\nText: "${text}"\n\nSimplified version:`
    );
    return result.response.text();
  } catch (error) {
    console.error('Gemini simplify error:', error);
    return getFallbackSimplification(text, level);
  }
}

/**
 * Translates text using Gemini AI.
 *
 * @param text - The text to translate
 * @param targetLanguage - The language to translate into
 * @returns The translated text
 */
export async function translateMessage(
  text: string,
  targetLanguage: string
): Promise<string> {
  const geminiModel = getModel();
  if (!geminiModel) return getFallbackTranslation(text, targetLanguage);

  try {
    const result = await geminiModel.generateContent(
      `Translate the following text to ${targetLanguage}. Return ONLY the translated text.\n\nText: "${text}"`
    );
    return result.response.text();
  } catch (error) {
    console.error('Gemini translation error:', error);
    return getFallbackTranslation(text, targetLanguage);
  }
}

/**
 * Fact-checks an election claim using Gemini AI.
 *
 * @param claim - The claim to fact-check
 * @returns Fact-check result with verdict, explanation, and source
 */
export async function factCheckClaim(claim: string): Promise<string> {
  const geminiModel = getModel();
  if (!geminiModel) return getFallbackFactCheck(claim);

  try {
    const result = await geminiModel.generateContent(
      `As an impartial election educator, fact-check this claim about Indian elections:\n\n"${claim}"\n\nProvide:\n1. ✅ TRUE / ❌ FALSE / ⚠️ PARTIALLY TRUE\n2. Brief explanation (2-3 sentences)\n3. Source (Constitution, ECI, or relevant law)\n\nBe strictly factual and non-partisan.`
    );
    return result.response.text();
  } catch (error) {
    console.error('Gemini fact-check error:', error);
    return getFallbackFactCheck(claim);
  }
}

/** Deterministic fallback responses for offline/demo mode */
function getFallbackResponse(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes('vote') || lower.includes('voting') || lower.includes('how to vote')) {
    return "🗳️ **How to Vote in India:**\n\n1. **Register** — Ensure you're on the electoral roll (voter list). Register at [nvsp.in](https://www.nvsp.in)\n2. **Get Voter ID** — Apply for EPIC (Electors Photo Identity Card)\n3. **Find Your Booth** — Check your assigned polling station on the ECI website\n4. **Polling Day** — Visit your booth between 7 AM - 6 PM with valid ID\n5. **Cast Your Vote** — Use the EVM to select your candidate\n6. **VVPAT Check** — Verify your vote on the paper slip\n\n✅ Remember: Voting is your fundamental right!";
  }
  if (lower.includes('evm') || lower.includes('electronic voting')) {
    return "💻 **Electronic Voting Machine (EVM):**\n\nEVMs are simple, battery-operated devices used in Indian elections since 2004 nationwide.\n\n**How it works:**\n- Each candidate has a button with party symbol\n- Press the button next to your chosen candidate\n- A light and beep confirms your vote\n- VVPAT slip shows your choice for 7 seconds\n\n**Security features:**\n- One-time programmable chips\n- No internet connectivity\n- Tamper-proof sealed units\n- Mock poll before actual voting begins";
  }
  if (lower.includes('nota')) {
    return "🚫 **NOTA (None of the Above):**\n\nNOTA was introduced in 2013 after the Supreme Court's landmark judgment in *PUCL vs Union of India*.\n\n**Key points:**\n- Allows voters to reject all candidates\n- NOTA votes are counted but don't affect results\n- Even if NOTA gets highest votes, the candidate with most votes wins\n- It's a form of negative voting / right to reject\n- Over 1.5 crore voters chose NOTA in 2019";
  }
  if (lower.includes('register') || lower.includes('voter id') || lower.includes('epic')) {
    return "📋 **Voter Registration:**\n\n**Online:**\n1. Visit [nvsp.in](https://www.nvsp.in)\n2. Fill Form 6 (new voter) or Form 6B (overseas voter)\n3. Upload ID proof and address proof\n4. Submit and track application\n\n**Eligibility:**\n- Indian citizen\n- 18+ years on qualifying date (Jan 1)\n- Not disqualified under any law\n\n**Documents needed:**\n- Age proof (birth certificate, 10th marksheet)\n- Address proof (Aadhaar, utility bill)\n- Recent passport photo";
  }
  if (lower.includes('help') || lower.includes('what can you')) {
    return "👋 I'm **Election Buddy**, your AI guide to democracy! I can help with:\n\n🗳️ **Voting Process** — How to register and vote\n📅 **Election Timeline** — Step-by-step election phases\n📋 **Rules & Rights** — Your electoral rights\n🏛️ **Institutions** — ECI, Parliament, etc.\n📜 **Constitution** — Electoral articles explained\n🧠 **Quiz** — Test your election knowledge\n🌐 **Multi-language** — I can explain in Hindi too!\n\nJust ask me anything about elections!";
  }

  return "👋 I'm **Election Buddy**, your AI-powered guide to understanding Indian elections!\n\nI can help you with:\n- 🗳️ How to vote and register\n- 📅 Election process and timeline\n- 📋 Your rights as a voter\n- 🏛️ How government is formed\n- 📊 Election facts and statistics\n\nWhat would you like to know?";
}

function getFallbackQuizResponse(): string {
  return JSON.stringify([{
    question: `What is the primary body that conducts elections in India?`,
    options: ['Supreme Court', 'Parliament', 'Election Commission of India', 'President'],
    correctAnswer: 2,
    explanation: 'The ECI is an autonomous constitutional body under Article 324.',
    difficulty: 'beginner',
    category: 'institutions',
  }]);
}

function getFallbackSimplification(text: string, level: string): string {
  if (level === 'child') return `In simple words: ${text.substring(0, 100)}... This means the rules help make elections fair for everyone! 🗳️`;
  return `Simply put: ${text.substring(0, 200)}... This is an important part of how our democracy works.`;
}

function getFallbackTranslation(text: string, lang: string): string {
  const hindiMap: Record<string, string> = {
    'How to vote?': 'वोट कैसे करें?',
    'What is EVM?': 'ईवीएम क्या है?',
    'Help': 'मदद',
  };
  if (lang === 'Hindi' && hindiMap[text]) return hindiMap[text];
  return `[${lang}] ${text} (Translation requires Gemini API key)`;
}

function getFallbackFactCheck(claim: string): string {
  return `⚠️ **Fact Check Result:**\n\nI need to verify this claim against official ECI sources. For accurate fact-checking, please configure a Gemini API key.\n\n**Claim:** "${claim.substring(0, 100)}"\n\n**Tip:** Always refer to [eci.gov.in](https://eci.gov.in) for official information.`;
}
