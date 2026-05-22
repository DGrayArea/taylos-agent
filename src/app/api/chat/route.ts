import { NextResponse } from "next/server";
import Groq from "groq-sdk";

type ChatHistoryMessage = {
  role: "system" | "user" | "assistant";
  content: string;
  name?: string;
};

type ChatBody = {
  message?: string;
  context?: unknown;
  history?: ChatHistoryMessage[];
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ChatBody;
    const { message, context, history } = body;

    if (!message || !context) {
      return NextResponse.json(
        { error: "Message and context are required." },
        { status: 400 },
      );
    }

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const systemPrompt = `You are an elite AI financial investigator assisting a human analyst.
You have just analyzed a set of financial documents and generated a report.

CONTEXT (The Report):
${JSON.stringify(context)}

Your task is to answer the user's questions strictly based on the findings in this report.
Be highly professional, concise, and analytical. If the user asks something not covered in the report, state that the data provided does not contain that information.
Format your response using markdown for readability.`;

    const messages: ChatHistoryMessage[] = [
      { role: "system", content: systemPrompt },
      ...(history ?? []),
      { role: "user", content: message },
    ];

    const completion = await groq.chat.completions.create({
      messages,
      model: "llama-3.3-70b-versatile",
      temperature: 0.2,
      max_tokens: 1024,
    });

    return NextResponse.json({
      reply:
        completion.choices[0]?.message?.content || "No response generated.",
    });
  } catch (error: unknown) {
    console.error("[/api/chat] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate AI response.",
        details: getErrorMessage(error),
      },
      { status: 500 },
    );
  }
}
