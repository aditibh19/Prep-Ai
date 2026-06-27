/**
 * freeAI.js — Free AI helper
 *
 * Primary:  Groq  (console.groq.com — free, fast)
 * Fallback: Gemini free tier
 *
 * Setup:
 *   npm install groq-sdk @google/generative-ai
 *   Add GROQ_API_KEY=gsk_... to backend/.env
 */

import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

const gemini = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

if (!groq && !gemini) {
  console.warn("[freeAI] WARNING: No AI provider configured. Add GROQ_API_KEY or GEMINI_API_KEY to .env");
}

/**
 * Generate text using free AI providers.
 * @param {string} prompt
 * @param {object} options
 * @param {number} options.maxTokens - default 2048
 * @returns {Promise<string>}
 */
export async function generateText(prompt, { maxTokens = 2048 } = {}) {
  // 1. Try Groq first (free, very fast)
  if (groq) {
    try {
      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        max_tokens: maxTokens,
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant. When asked to return JSON, return ONLY raw valid JSON with no markdown, no code fences, no explanation — just the JSON object or array.",
          },
          { role: "user", content: prompt },
        ],
      });

      const text = completion.choices?.[0]?.message?.content;
      if (!text) throw new Error("Groq returned empty content");
      return text;

    } catch (err) {
      // Rate limited — fall through to Gemini immediately
      if (err.status === 429 || err.message?.includes("rate limit")) {
        console.warn("[freeAI] Groq rate-limited, falling back to Gemini");
      } else {
        console.warn("[freeAI] Groq failed:", err.status ?? "", err.message);
      }
      // Fall through to Gemini
    }
  }

  // 2. Fallback to Gemini free tier
  if (gemini) {
    try {
      const model = gemini.getGenerativeModel({
        model: "gemini-2.0-flash",
        generationConfig: { maxOutputTokens: maxTokens, temperature: 0.7 },
        systemInstruction: "You are a helpful assistant. When asked to return JSON, return ONLY raw valid JSON with no markdown, no code fences, no explanation.",
      });

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      if (!text) throw new Error("Gemini returned empty content");
      return text;

    } catch (err) {
      console.error("[freeAI] Gemini failed:", err.message);
      throw err;
    }
  }

  throw new Error(
    "No AI provider configured. Add GROQ_API_KEY or GEMINI_API_KEY to backend/.env"
  );
}

/**
 * Generate and parse a JSON response from AI.
 * Strips markdown fences automatically.
 * @param {string} prompt
 * @param {object} options
 * @returns {Promise<object|Array>}
 */
export async function generateJSON(prompt, options = {}) {
  const jsonPrompt = `${prompt}

IMPORTANT: Your response must be ONLY a valid JSON object or array. 
Do not include any text before or after the JSON.
Do not use markdown code fences or backticks.
Start your response with { or [ and end with } or ].`;

  const raw = await generateText(jsonPrompt, options);

  // Strip accidental markdown fences
  let cleaned = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  // Attempt 1: parse the whole cleaned string
  try {
    return JSON.parse(cleaned);
  } catch {
    // Attempt 2: find the first { or [ and parse from there
    const jsonStart = cleaned.search(/[{[]/);
    if (jsonStart !== -1) {
      try {
        return JSON.parse(cleaned.slice(jsonStart));
      } catch {
        // Attempt 3: find the outermost JSON block with a greedy regex
        const match = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
        if (match) {
          try {
            return JSON.parse(match[0]);
          } catch {
            // Fall through to error
          }
        }
      }
    }

    console.error("[freeAI] Failed to parse JSON. Raw response:\n", cleaned.slice(0, 500));
    throw new Error(
      `AI returned invalid JSON. Preview: ${cleaned.slice(0, 200)}`
    );
  }
}