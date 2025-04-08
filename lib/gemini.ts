import { GoogleGenAI } from "@google/genai";

export const geminiAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});
