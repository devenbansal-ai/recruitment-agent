"use client";

import StreamingResponse from "@/components/chat/StreamingResponse";
import { useState } from "react";

export default function ChatBox() {
  const [query, setQuery] = useState("");
  const [ragQuery, setRagQuery] = useState("");

  const sendQuery = () => setRagQuery(query);

  return (
    <div className="flex flex-col space-y-4">
      <textarea
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="border p-2 rounded"
      />
      <button
        onClick={sendQuery}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Send
      </button>
      {ragQuery && <StreamingResponse query={ragQuery} />}
    </div>
  );
}
