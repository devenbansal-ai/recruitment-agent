"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Send, Loader } from "lucide-react";
import clsx from "clsx";
import { AssistantMessage, Message, UserMessage } from "@/types/chat";
import { readResponseStream } from "@/utils/stream";
import { API_URLS } from "@/api/urls";
import { StreamCallback } from "@/types/stream";
import { BlankState } from "@/components/chat/BlankState";
import MessageBubble from "@/components/chat/MessageBubble";
import axios from "axios";
import FileAttachButton from "@/components/chat/FileAttachButton";
import { v4 as uuidv4 } from "uuid";
import { UploadingOverlay } from "@/components/chat/UploadingOverlay";
import { appStrings } from "@/common/strings";

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const assistantRef = useRef<HTMLDivElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileUploading, setFileUploading] = useState(false);

  useEffect(() => {
    // Render the welcome message, as a streaming message
    const welcomeMessageId = uuidv4();
    setMessages([
      {
        role: "assistant",
        id: welcomeMessageId,
        content: "",
        interstitialMessage: "...",
      },
    ]);

    // Loop through the words of welcome message and update welcome message
    const words = appStrings.welcomeMessage.split(" ");
    const initialInterval = 200;
    const streamingInterval = 100;
    for (let i = 0; i < words.length; i++) {
      setTimeout(
        () => {
          updateMessage(welcomeMessageId, {
            content: words.slice(0, i + 1).join(" "),
          });
        },
        i * streamingInterval + initialInterval,
      );
    }
  }, []);

  const updateMessage = useCallback((id: string, patch: Partial<Message>) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    );
  }, []);

  const addToMessage = useCallback((id: string, data: string) => {
    if (data) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === id ? { ...m, content: m.content + data } : m,
        ),
      );
    }
  }, []);

  const handleUpload = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await axios.post(API_URLS.UPLOAD, formData);
      console.log(res.data);
      return res.data.name;
    } catch (err) {
      console.log("Error uploading file");
      throw err;
    }
  };

  useEffect(() => {
    assistantRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const startStream = async (message: UserMessage) => {
    setLoading(true);

    const messageId = uuidv4();
    const newMessage: AssistantMessage = {
      role: "assistant",
      id: messageId,
      content: "",
      interstitialMessage: "...",
    };
    setMessages((m) => [...m, newMessage]);

    try {
      if (file) {
        setFile(null);
      }

      const response = await fetch(API_URLS.AGENT_ASK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: message.content, file: message.file }),
      });

      const callback: StreamCallback = {
        onData: (messageId, data) => addToMessage(messageId, data),
        onSources: (messageId, sources) =>
          updateMessage(messageId, {
            sources,
          }),
        onInterstitialMessage: (messageId, data) =>
          updateMessage(messageId, { interstitialMessage: data }),
        onDone: () => setLoading(false),
        onError: (messageId, error) =>
          updateMessage(messageId, { content: String(error) }),
      };

      await readResponseStream(messageId, response, callback);
    } catch (error) {}
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const query = input.trim();
    const userMessage = {
      id: uuidv4(),
      role: "user",
      content: query,
      file: file?.name.toString(),
    } as UserMessage;
    setMessages((m) => [...m, userMessage]);
    startStream(userMessage);
    setInput("");
  };

  const onFileSelect = async (file: File) => {
    setFile(file);
    setFileUploading(true);
    await handleUpload(file);
    setFileUploading(false);
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
                : "bg-green-100 text-green-700",
            )}
          >
            {loading ? "Processing..." : "Idle"}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">
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
            <div className="flex gap-3" style={{ alignItems: "end" }}>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask something — e.g., 'Summarize my resume and suggest top-fit roles'"
                className="flex-1 border rounded p-3 resize-none h-14"
                disabled={loading}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault(); // stop newline
                    if (!loading && input.trim()) {
                      handleSend();
                    }
                  }
                }}
              />
              <div
                className="flex flex-row gap-2"
                style={{ height: "fit-content" }}
              >
                <FileAttachButton file={file} onFileSelect={onFileSelect} />
                <button
                  onClick={handleSend}
                  className={clsx(
                    "px-4 py-2 rounded flex items-center gap-2",
                    loading
                      ? "bg-slate-300 text-slate-700"
                      : "bg-blue-600 text-white",
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
      <UploadingOverlay isVisible={fileUploading} />
    </div>
  );
}
