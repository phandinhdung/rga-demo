export async function createRetriever() {
  switch (process.env.VECTOR_DB) {
    case "weaviate":
      return (await import("./weaviate.js")).createWeaviateRetriever();

    case "pinecone":
      return (await import("./pinecone.js")).createPineconeRetriever();

    default:
      throw new Error("Unsupported VECTOR_DB");
  }
}
