import { WeaviateStore } from "@langchain/weaviate";
import { connectToLocal } from "weaviate-client";

export async function createWeaviateRetriever(embeddings) { // Nhận embeddings ở đây
  const client = await connectToLocal({
    host: "localhost",
    port: 8080,
    grpcPort: 50051,
  });

  const vectorStore = await WeaviateStore.fromExistingIndex(embeddings, {
    client,
    indexName: "VietnamDocs",
    textKey: "text",
  });

  return vectorStore.asRetriever();
}
