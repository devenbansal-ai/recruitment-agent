import { AssistantMessage, Message } from "@/types/chat";
import clsx from "clsx";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import AssistantResponse from "./AssistantResponse";

export default function MessageBubble({ m }: { m: Message }) {
  const isUser = m.role === "user";
  return (
    <div
      className={clsx("flex gap-3", isUser ? "justify-end" : "justify-start")}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
          A
        </div>
      )}
      <div
        className={clsx(
          "max-w-[75%] p-3 rounded-lg",
          isUser
            ? "bg-blue-600 text-white rounded-br-none"
            : "bg-white text-slate-800 rounded-bl-none shadow-sm"
        )}
      >
        {m.content.trim() && isUser ? (
          <div className="whitespace-pre-wrap">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
            >
              {m.content.trim()}
            </ReactMarkdown>
          </div>
        ) : (
          <AssistantResponse message={m as AssistantMessage} />
        )}
        {m.role === "assistant" && m.interstitialMessage && (
          <div style={{ color: "#5f5f5f" }}>{m.interstitialMessage}</div>
        )}
        {m.role === "assistant" && m.sources && m.sources.length > 0 && (
          <div className="mt-2 text-xs text-slate-500">
            Sources:
            {m.sources.map((s: any, i: number) => (
              <button
                key={i}
                className="ml-2 underline text-blue-600"
                onClick={() => window.open(s.url || "#", "_blank")}
              >
                [{i + 1}] {s.title ?? s.source ?? "source"}
              </button>
            ))}
          </div>
        )}
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
          U
        </div>
      )}
    </div>
  );
}
