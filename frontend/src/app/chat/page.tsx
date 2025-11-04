"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Send, Loader } from "lucide-react";
import clsx from "clsx";
import { Message } from "@/types/chat";
import { readResponseStream } from "@/utils/stream";
import { API_URLS } from "@/api/urls";
import { StreamCallback } from "@/types/stream";
import { BlankState } from "@/components/chat/BlankState";
import MessageBubble from "@/components/chat/MessageBubble";

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const assistantRef = useRef<HTMLDivElement | null>(null);

  const updateMessage = useCallback((id: string, patch: Partial<Message>) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...patch } : m))
    );
  }, []);

  useEffect(() => {
    assistantRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const startStream = async (query: string) => {
    setLoading(true);
    const messageId = String(Date.now());
    setMessages((m) => [
      ...m,
      {
        id: messageId,
        role: "assistant",
        content: "",
        interstitialMessage: "...",
      },
    ]);

    try {
      const response = await fetch(API_URLS.AGENT_ASK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const callback: StreamCallback = {
        onData: (messageId: string, data: string) =>
          updateMessage(messageId, {
            content: data,
            interstitialMessage: undefined,
          }),
        onInterstitialMessage: (messageId: string, data: string) =>
          updateMessage(messageId, { interstitialMessage: data }),
        onDone: () => setLoading(false),
        onError: (messageId: string, error) =>
          updateMessage(messageId, { content: String(error) }),
      };

      await readResponseStream(messageId, response, callback);
    } catch (error) {}
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const query = input.trim();
    setMessages((m) => [
      ...m,
      { id: String(Date.now()), role: "user", content: query },
    ]);
    startStream(query);
    setInput("");
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      <div className="flex items-center justify-between px-6 py-3 border-b bg-white">
        <div className="flex items-center gap-3">
          <div className="text-lg font-semibold">Recruitment Agent</div>
          <div className="text-sm text-slate-500">Chat · RAG · Agent</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-500">Status</div>
          <div
            className={clsx(
              "px-2 py-1 rounded text-xs",
              loading
                ? "bg-yellow-100 text-yellow-700"
                : "bg-green-100 text-green-700"
            )}
          >
            {loading ? "Processing..." : "Idle"}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">
        {/* chat column */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-auto p-6 space-y-4">
            {messages.length === 0 ? <BlankState /> : null}
            {messages.map((m) => (
              <div key={m.id} ref={assistantRef}>
                <MessageBubble m={m} />
              </div>
            ))}
          </div>

          <div className="p-4 border-t bg-white">
            <div className="flex gap-3">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask something — e.g., 'Summarize my resume and suggest top-fit roles'"
                className="flex-1 border rounded p-3 resize-none h-14"
                disabled={loading}
              />

              <div className="flex flex-col gap-2">
                <button
                  onClick={handleSend}
                  className={clsx(
                    "px-4 py-2 rounded flex items-center gap-2",
                    loading
                      ? "bg-slate-300 text-slate-700"
                      : "bg-blue-600 text-white"
                  )}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span className="text-sm">
                    {loading ? "Running..." : "Send"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* right column: citations / details on wide screens */}
        <div className="w-80 border-l p-4 hidden lg:block">
          <h4 className="font-semibold mb-3">Citations</h4>
          <div className="text-sm text-slate-600">
            Click a citation in the assistant message to open the source.
            Sources appear after the answer completes.
          </div>
        </div>
      </div>
    </div>
  );
}
