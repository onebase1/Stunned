"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, Loader2, Send, X } from "lucide-react";

// Lightweight Ask AI panel that talks to an agent endpoint.
// Configure via env: NEXT_PUBLIC_AGENT_FUNCTION_URL
// If not set, the panel will show a configuration hint.

const AGENT_URL = process.env.NEXT_PUBLIC_AGENT_FUNCTION_URL || "";

interface Msg {
  id: string;
  role: "user" | "assistant" | "system";
  text: string;
}

export function AskAIButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 shadow"
        title="Ask AI"
      >
        <Bot className="h-4 w-4" />
        Ask AI
      </button>
      {open && <AskAIPanel onClose={() => setOpen(false)} />}
    </>
  );
}

export function AskAIPanel({ onClose }: { onClose: () => void }) {
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([{
    id: crypto.randomUUID(),
    role: "assistant",
    text: "Hi! I can answer questions about clients, properties, and contracts. Try: ‘properties under $1M in Downtown’, ‘summary of John Smith’, or ‘contracts totals’."
  }]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  async function send() {
    if (!input.trim()) return;
    const text = input.trim();
    setInput("");
    setMessages((m) => [...m, { id: crypto.randomUUID(), role: "user", text }]);
    setBusy(true);
    setError(null);
    try {
      if (!AGENT_URL) throw new Error("Agent URL not configured. Set NEXT_PUBLIC_AGENT_FUNCTION_URL.");
      const res = await fetch(AGENT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      if (!res.ok) throw new Error(`Agent error (${res.status})`);
      const payload = await res.json();
      const answer: string = payload?.answer || "(No answer)";
      setMessages((m) => [...m, { id: crypto.randomUUID(), role: "assistant", text: answer }]);
    } catch (e: any) {
      setError(e?.message || "Failed to contact agent");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/30">
      <div className="w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-white/20 flex items-center justify-center">
              <Bot className="h-4 w-4" />
            </div>
            <div>
              <div className="font-semibold leading-tight">Ask AI</div>
              <div className="text-xs opacity-90">Heritage Assistant</div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded hover:bg-white/10">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-4 py-3 h-80 overflow-y-auto space-y-3 bg-gray-50/60">
          {!AGENT_URL && (
            <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
              Agent URL not configured. Set NEXT_PUBLIC_AGENT_FUNCTION_URL to your Supabase Edge Function URL.
            </div>
          )}

          {messages.map((m) => (
            <div key={m.id} className={m.role === "user" ? "text-right" : "text-left"}>
              <div className={
                "inline-block max-w-[85%] px-3 py-2 rounded-lg text-sm whitespace-pre-wrap " +
                (m.role === "user" ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-900")
              }>
                {m.text}
              </div>
            </div>
          ))}

          {busy && (
            <div className="text-left">
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-white border border-gray-200 text-gray-700">
                <Loader2 className="h-4 w-4 animate-spin" />
                Thinking…
              </div>
            </div>
          )}

          {error && (
            <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded p-2">
              {error}
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="flex items-center gap-2 p-3 border-t bg-white">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => (e.key === "Enter" ? send() : null)}
            placeholder="Ask anything… (e.g., properties under $1M in Downtown)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
          <button
            onClick={send}
            disabled={busy || !input.trim()}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

