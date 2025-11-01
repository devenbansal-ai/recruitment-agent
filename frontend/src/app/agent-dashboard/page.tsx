"use client";
import { useState } from "react";
import axios from "axios";
import { API_URLS } from "@/api/urls";

export default function AgentDashboard() {
  const [query, setQuery] = useState("");
  const [trace, setTrace] = useState<any[]>([]);
  const [finalAnswer, setFinalAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRun = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setTrace([]);
    try {
      const res = await axios.post(API_URLS.AGENT_ASK, { query });
      setFinalAnswer(res.data.output);
      setTrace(res.data.trace || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const retryStep = async (stepIndex: number) => {
    const step = trace[stepIndex];
    if (!step) return;
    try {
      const res = await axios.post(API_URLS.AGENT_RETRY, {
        action: step.action,
        input: step.input,
      });
      const updatedTrace = [...trace];
      updatedTrace[stepIndex].output = res.data.output;
      setTrace(updatedTrace);
    } catch (e) {
      console.error("Retry failed:", e);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Agent Dashboard</h1>

      <div className="flex gap-2 mb-4">
        <input
          className="flex-1 border p-2 rounded"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask the agent..."
        />
        <button onClick={handleRun} disabled={loading}>
          {loading ? "Running..." : "Run"}
        </button>
      </div>

      {finalAnswer && (
        <div className="p-4 bg-green-100 rounded mb-6">
          <h2 className="font-semibold">Final Answer</h2>
          <p>{finalAnswer}</p>
        </div>
      )}

      <div className="space-y-4">
        {trace.map((step, i) => (
          <div key={i} className="border rounded p-3 bg-gray-50">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">
                Step {i + 1}: {step.tool}
              </h3>
              <button onClick={() => retryStep(i)}>Retry</button>
            </div>
            <div className="mt-2">
              <p className="text-sm text-gray-700">
                <strong>Input:</strong> {JSON.stringify(step.input)}
              </p>
              <p className="text-sm text-gray-700 mt-1">
                <strong>Output:</strong> {JSON.stringify(step.output)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
