import { Response } from "express";
import { StreamHandler } from "../llm/provider.types";

export function getStreamHandler(res: Response): StreamHandler {
  const onData = (chunk: string) => {
    res.write(`data: ${JSON.stringify({ token: chunk })}\n\n`);
  };

  const onEnd = () => {
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  };

  const onError = (err: Error) => {
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
  };

  const handler: StreamHandler = {
    onData,
    onEnd,
    onError,
  };

  return handler;
}
