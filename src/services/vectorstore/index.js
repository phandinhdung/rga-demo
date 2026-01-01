export async function createRetriever(embeddings) {
  switch (process.env.VECTOR_DB) {
    case "weaviate":
      return (await import("./weaviate.js")).createWeaviateRetriever(embeddings);

    case "pinecone":
      return (await import("./pinecone.js")).createPineconeRetriever(embeddings);

    default:
      throw new Error("Unsupported VECTOR_DB");
  }
}
