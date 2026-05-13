import Groq from "groq-sdk";

if (!process.env.GROQ_API_KEY) {
  throw new Error("Missing GROQ_API_KEY environment variable");
}

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Recommended model for financial analysis (fast + smart):
// "llama-3.3-70b-versatile"  ← best for complex reasoning
// "llama-3.1-8b-instant"     ← fastest, use for simple tasks
