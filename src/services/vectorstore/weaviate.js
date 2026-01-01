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

  return vectorStore.asRetriever({ k: 5 });
}
