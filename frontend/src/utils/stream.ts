import { TelemetryData } from "@/types/telemetry";
import { StreamCallback } from "@/types/stream";

export async function readResponseStream(
  messageId: string,
  response: Response,
  callback: StreamCallback,
) {
  if (!response.ok || !response.body) {
    console.error("No response body for stream");
    callback.onError(messageId, "No response body for stream");
    return;
  }

  let isCancelled = false;

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
          const message = JSON.parse(jsonStr);
          if (message.done) {
            if (message.telemetry) {
              callback.onDone(messageId, message.telemetry as TelemetryData);
            }
            reader.cancel();
            return;
          }
          if (message.error) {
            console.error("Stream error:", message.error);
            reader.cancel();
            callback.onError(messageId, message.error);
            return;
          }
          if (message.isInterstitialMessage) {
            callback.onInterstitialMessage(messageId, message.data);
          } else {
            callback.onData(messageId, message.data);
          }
        } catch (err) {
          console.warn("Non-JSON chunk:", line);
        }
      }
    }
  } catch (err) {
    console.error("Stream read error:", err);
  } finally {
    callback.onDone(messageId);
  }
}
