import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Generate plain text from a prompt
 */
export async function generateText(prompt) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });
  return response.text;
}

/**
 * Generate and parse a JSON response from a prompt.
 * The prompt should explicitly ask for JSON output.
 */
export async function generateJson(prompt) {
  const fullPrompt = `${prompt}\n\nRespond with ONLY valid JSON. No markdown, no code fences, no explanation.`;
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: fullPrompt,
  });
  const text = response.text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  try {
    return JSON.parse(text);
  } catch {
    // Try to extract JSON from the response
    const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (match) return JSON.parse(match[0]);
    throw new Error("Gemini returned non-JSON: " + text.slice(0, 200));
  }
}
