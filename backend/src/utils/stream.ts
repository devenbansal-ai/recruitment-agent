import { Response } from "express";
import { StreamHandler } from "../llm/provider.types";
import { StreamMessage } from "../types/stream";
import { TelemetryData } from "./telemetry";

export function getStreamHandler(res: Response): StreamHandler {
  const onData = (message: StreamMessage) => {
    res.write(`data: ${JSON.stringify(message)}\n\n`);
  };

  const onEnd = (telemetry?: TelemetryData) => {
    res.write(`data: ${JSON.stringify({ done: true, telemetry })}\n\n`);
    res.end();
  };

  const onError = (err: Error) => {
    res.write(`data: ${JSON.stringify({ error: err.message, done: true })}\n\n`);
  };

  const handler: StreamHandler = {
    onData,
    onEnd,
    onError,
  };

  return handler;
}
