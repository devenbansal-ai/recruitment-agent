"use client";
import { API_URLS } from "@/api/urls";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";

interface StreamingResponseProps {
  query: string;
  onComplete?: () => void;
}

export default function StreamingResponse({
  query,
  onComplete,
}: StreamingResponseProps) {
  const [markdown, setMarkdown] = useState("");
  const [sources, setSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) return;

    let isCancelled = false;

    const fetchStream = async () => {
      setLoading(true);
      setMarkdown("");

      const response = await fetch(API_URLS.RAG_STREAM, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      if (!response.ok || !response.body) {
        console.error("No response body for stream");
        setLoading(false);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done || isCancelled) break;

          const chunk = decoder.decode(value, { stream: true });

          // Each line in the response should be of form: `data: {...}\n\n`
          const lines = chunk
            .split("\n")
            .filter((line) => line.startsWith("data:"));
          for (const line of lines) {
            const jsonStr = line.replace(/^data:\s*/, "");
            try {
              const data = JSON.parse(jsonStr);
              if (data.token) setMarkdown((prev) => prev + data.token);
              if (data.sources) setSources(data.sources);
              if (data.done) {
                reader.cancel();
                setLoading(false);
                if (onComplete) onComplete();
                return;
              }
              if (data.error) {
                console.error("Stream error:", data.error);
                reader.cancel();
                setLoading(false);
                return;
              }
            } catch (err) {
              console.warn("Non-JSON chunk:", line);
            }
          }
        }
      } catch (err) {
        console.error("Stream read error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStream();
    return () => {
      isCancelled = true;
    };
  }, [query, onComplete]);

  return (
    <div className="p-4 border rounded-md bg-neutral-900 text-neutral-100">
      {loading && (
        <p className="text-sm text-gray-400">Streaming response...</p>
      )}
      <div className="prose prose-invert max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
        >
          {markdown}
        </ReactMarkdown>
      </div>

      {sources.length > 0 && (
        <div className="mt-4 border-t border-gray-700 pt-2">
          <h4 className="text-sm font-semibold mb-1">Sources:</h4>
          <ul className="text-sm space-y-1">
            {sources.map((s, i) => (
              <li key={i}>
                {s.title} —{" "}
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  View
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
