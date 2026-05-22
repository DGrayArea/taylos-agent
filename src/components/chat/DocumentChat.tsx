"use client";

import { useState, useRef, useEffect } from "react";
import { FloatingCard } from "../ui/FloatingCard";
import { Button } from "../ui/Button";
import { Send, Bot, User, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export function DocumentChat({ analysisContext }: { analysisContext: any }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I am your AI financial assistant. I have reviewed the generated report. What questions do you have about the findings?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    
    // Add user message to UI immediately
    const newMessages: Message[] = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          context: analysisContext,
          history: newMessages.slice(1).map(m => ({ role: m.role, content: m.content })), // Exclude initial greeting
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");
      
      const data = await response.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an error while processing your request. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FloatingCard className="flex flex-col h-[500px] p-0 overflow-hidden border-t-4 border-t-[var(--color-gold)]">
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-[var(--color-navy)]/80 backdrop-blur-md flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[var(--color-gold)]/20 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-[var(--color-gold)]" />
        </div>
        <div>
          <h3 className="font-bold text-white text-sm">Ask AI</h3>
          <p className="text-xs text-gray-400">Interrogate your document findings</p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              "flex w-full",
              msg.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "flex gap-3 max-w-[80%]",
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
                  msg.role === "user" ? "bg-blue-500/20" : "bg-white/10"
                )}
              >
                {msg.role === "user" ? (
                  <User className="w-4 h-4 text-blue-400" />
                ) : (
                  <Bot className="w-4 h-4 text-gray-300" />
                )}
              </div>
              <div
                className={cn(
                  "p-3 rounded-2xl text-sm leading-relaxed",
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-tr-sm"
                    : "bg-white/5 text-gray-200 border border-white/10 rounded-tl-sm"
                )}
              >
                {/* Simple text rendering; in prod we'd use react-markdown */}
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-3 max-w-[80%]">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="w-4 h-4 text-gray-300" />
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 rounded-tl-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-[var(--color-gold)] animate-spin" />
                <span className="text-xs text-gray-400">Analysing report...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-white/10 bg-[var(--color-navy)]/80 backdrop-blur-md">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about specific anomalies or trends..."
            className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[var(--color-gold)]/50 focus:shadow-[var(--shadow-glow)] transition-all"
            disabled={isLoading}
          />
          <Button
            type="submit"
            variant="primary"
            disabled={!input.trim() || isLoading}
            className="px-4 py-2 h-auto rounded-xl"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </FloatingCard>
  );
}
