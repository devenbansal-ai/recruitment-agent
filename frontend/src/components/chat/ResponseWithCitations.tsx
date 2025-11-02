import { AssistantMessage, CitationSource } from "@/types/chat";
import { useState } from "react";

export default function ResponseWithCitations({
  message,
}: {
  message: AssistantMessage;
}) {
  const [activeCitation, setActiveCitation] = useState<CitationSource | null>(
    null
  );
  const { content, sources } = message;

  return (
    <div className="relative">
      <p className="whitespace-pre-wrap">
        {content.split(/(\[\d+\])/).map((part, i) => {
          const match = part.match(/\[(\d+)\]/);
          if (match) {
            const idx = parseInt(match[1], 10) - 1;
            const src =
              sources !== undefined && sources.length > idx
                ? sources[idx]
                : undefined;
            if (src) {
              return (
                <sup
                  key={i}
                  className="text-blue-500 cursor-pointer"
                  onClick={() => setActiveCitation(src)}
                >
                  [{idx + 1}]
                </sup>
              );
            } else {
              return "";
            }
          }
          return part;
        })}
      </p>

      {activeCitation && (
        <div className="absolute bg-white border rounded-lg p-4 mt-2 w-80 shadow-lg">
          <h4 className="font-semibold">{activeCitation.title}</h4>
          <p className="text-sm text-gray-600">{activeCitation.snippet}</p>
          {activeCitation.url && (
            <a
              href={activeCitation.url}
              target="_blank"
              className="text-blue-600 text-sm mt-2 block"
            >
              View Source
            </a>
          )}
          <button
            onClick={() => setActiveCitation(null)}
            className="text-red-400 mt-2 text-xs"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
