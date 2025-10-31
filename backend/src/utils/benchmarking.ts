import axios from "axios";

const RAG_URL = process.env.RAG_URL || "http://localhost:8080/api/rag"; // adjust if needed
const NUM_RUNS = 5;

const QUERIES = [
  "What are the latest trends in retrieval-augmented generation?",
  "Explain the architecture of my agent system briefly.",
  "List key challenges in chunking and embedding text for RAG.",
  "How does vector search improve contextual recall?",
  "What are cost optimization strategies for LLM inference?",
];

type BenchmarkResult = {
  query: string;
  latencyMs: number;
  tokens?: number;
  costUsd?: number;
};

async function runBenchmark() {
  console.log(`🚀 Benchmarking ${NUM_RUNS} RAG calls...\n`);

  const results: BenchmarkResult[] = [];

  for (let i = 0; i < QUERIES.length; i++) {
    const query = QUERIES[i];
    const start = performance.now();

    try {
      const response = await axios.post(RAG_URL, { query });
      const end = performance.now();

      const latencyMs = end - start;

      // If your /rag endpoint logs tokens/cost — extract it
      const tokens = response.data?.total_tokens || 0;
      const costUsd = response.data?.cost_usd;

      results.push({ query, latencyMs, tokens, costUsd });

      console.log(
        `✅ [${i + 1}] ${query}\n   → ${latencyMs.toFixed(0)} ms | ${tokens} tokens | $${costUsd.toFixed(6)}`
      );
    } catch (err: any) {
      console.error(`❌ [${i + 1}] Error for query: ${query}`);
      console.error(err.message);
    }
  }

  summarize(results);
}

function summarize(results: BenchmarkResult[]) {
  const valid = results.filter((r) => !isNaN(r.latencyMs));
  const avgLatency = valid.reduce((sum, r) => sum + r.latencyMs, 0) / valid.length;
  const avgCost = valid.reduce((sum, r) => sum + (r.costUsd || 0), 0) / valid.length;

  console.log("\n📊 === BENCHMARK SUMMARY ===");
  console.log(`Total Runs: ${valid.length}`);
  console.log(`Average Latency: ${avgLatency.toFixed(2)} ms`);
  console.log(`Average Cost: $${avgCost.toFixed(6)} per query`);
  console.log(`Throughput: ${(1000 / avgLatency).toFixed(2)} req/sec`);
  console.log("============================\n");
}

runBenchmark();
