import { WeaviateStore } from "@langchain/weaviate";
import { connectToLocal } from "weaviate-client";
import { embeddings } from "../embeddings.js";
import { WEAVIATE_INDEX_NAME } from "./constants.js";

export async function createWeaviateRetriever() {
  const client = await connectToLocal({
    host: "localhost",
    port: 8080,
    grpcPort: 50051,
  });

  const vectorStore = await WeaviateStore.fromExistingIndex(embeddings, {
    client,
    indexName: WEAVIATE_INDEX_NAME,
    textKey: "text",
  });

  return vectorStore.asRetriever({
    searchType: "hybrid",
    searchKwargs: {
      // alpha = 0: Chỉ tìm theo từ khóa (BM25)
      // alpha = 1: Chỉ tìm theo Vector (BGE-M3)
      // alpha = 0.5: Kết hợp cân bằng cả hai
      alpha: 0.5, 
    },
    k: 7,
  });

  // return vectorStore.asRetriever({ 
  //   k: 7, // Lấy 7 đoạn văn bản liên quan nhất
  //   searchType: "mmr", // kết quả đa dạng, tránh trùng lặp ý
  // });
}
