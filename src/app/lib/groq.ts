// src/app/lib/groq.ts
// PURPOSE: Initialize and export the Groq AI client.
// The rest of the app imports `groq` from here to make AI calls.
//
// WHAT YOU NEED TO DO:
// 1. Run: pnpm add groq-sdk
// 2. Add GROQ_API_KEY to your .env.local file
// 3. Uncomment the code below

// import Groq from "groq-sdk";

// if (!process.env.GROQ_API_KEY) {
//   throw new Error("Missing GROQ_API_KEY environment variable");
// }

// export const groq = new Groq({
//   apiKey: process.env.GROQ_API_KEY,
// });

// Recommended model for financial analysis (fast + smart):
// "llama-3.3-70b-versatile"  ← best for complex reasoning
// "llama-3.1-8b-instant"     ← fastest, use for simple tasks

export {};
