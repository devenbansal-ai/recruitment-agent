"use client";
import { useState } from "react";
import axios from "axios";
import { API_URLS } from "@/api/urls";

type Message = { role: "user" | "assistant"; content: string };

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const appendMessage = (message: Message) =>
    setMessages((m) => [...m, message]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: "user", content: input };
    appendMessage(userMsg);
    setInput("");
    setLoading(true);
    try {
      const res = await axios.post(API_URLS.AGENT_ASK, {
        query: input,
      });
      const reply = res.data?.output || res.data?.response || "No response";
      appendMessage({ role: "assistant", content: reply });
    } catch (e) {
      appendMessage({ role: "assistant", content: "❌ Error calling backend" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen p-4">
      <div className="flex-1 overflow-y-auto border rounded p-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`p-2 my-1 rounded ${
              m.role === "user"
                ? "bg-blue-100 text-right"
                : "bg-gray-100 text-left"
            }`}
          >
            {m.content}
          </div>
        ))}
      </div>
      <div className="mt-2 flex">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border p-2 rounded"
          placeholder="Ask something..."
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="ml-2 bg-green-600 text-white px-4 py-2 rounded"
        >
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}
