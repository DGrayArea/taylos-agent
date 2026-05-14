import Groq from "groq-sdk";

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "missing_key_for_build",
});

// Recommended model for financial analysis (fast + smart):
// "llama-3.3-70b-versatile"  ← best for complex reasoning
// "llama-3.1-8b-instant"     ← fastest, use for simple tasks
