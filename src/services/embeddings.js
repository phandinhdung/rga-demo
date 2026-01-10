import "dotenv/config";
import { OllamaEmbeddings } from "@langchain/ollama";

export const embeddings = new OllamaEmbeddings({
  model: process.env.EMBEDDING_MODEL_NAME,
  baseUrl: process.env.OLLAMA_BASE_URL,
  maxConcurrency: 3
});

console.log(`--- Đã khởi tạo Embedding Model: ${process.env.EMBEDDING_MODEL_NAME} ---`);