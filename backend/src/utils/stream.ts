import { Response } from "express";
import { StreamHandler } from "../llm/provider.types";
import { StreamMessage } from "../types/stream";
import { TelemetryData } from "./telemetry";
import { StreamState } from "../llm/provider.types";
import { CitationSource } from "../types/agent";

export function getStreamHandler(res: Response): StreamHandler {
  const onData = (message: StreamMessage) => {
    res.write(`data: ${JSON.stringify(message)}\n\n`);
    handler.state = StreamState.Streaming;
  };

  const onEnd = (telemetry?: TelemetryData) => {
    res.write(`data: ${JSON.stringify({ done: true, telemetry })}\n\n`);
    res.end();
    handler.state = StreamState.Done;
  };

  const onError = (err: Error) => {
    res.write(`data: ${JSON.stringify({ error: err.message, done: true })}\n\n`);
    handler.state = StreamState.Error;
  };

  const onSources = (sources: CitationSource[]) => {
    res.write(`data: ${JSON.stringify({ sources })}\n\n`);
    handler.state = StreamState.Streaming;
  };

  const handler: StreamHandler = {
    onData,
    onEnd,
    onError,
    onSources,
    state: StreamState.Streaming,
  };

  return handler;
}
