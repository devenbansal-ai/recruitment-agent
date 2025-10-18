export function chunkText(text: string, chunkSize = 500, overlap = 50) {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    if ((current + sentence).length > chunkSize) {
      chunks.push(current.trim());
      current = sentence.slice(-overlap);
    } else {
      current += sentence;
    }
  }
  if (current) chunks.push(current.trim());
  return chunks;
}
