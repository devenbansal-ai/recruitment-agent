export type CitationSource = {
  id: number;
  snippet: string;
  title: string;
  url?: string;
};

export type UserMessage = {
  role: "user";
  content: string;
};

export type AssistantMessage = {
  role: "assistant";
  content: string;
  sources?: CitationSource[];
};

export type Message = UserMessage | AssistantMessage;
