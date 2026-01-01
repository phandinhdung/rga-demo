import { OpenAIEmbeddings } from "@langchain/openai";

export async function createVectorStore() {
  const embeddings = new OpenAIEmbeddings({
    model: "text-embedding-3-small"
  });

  switch (process.env.VECTOR_DB) {
    case "weaviate": {
      const { WeaviateStore } = await import(
        "@langchain/community/vectorstores/weaviate"
      );
      const weaviate = (await import("weaviate-ts-client")).default;

      const client = weaviate.client({
        scheme: "http",
        host: process.env.WEAVIATE_URL.replace("http://", "")
      });

      return await WeaviateStore.fromExistingIndex(embeddings, {
        client,
        indexName: "VietnamDocs"
      });
    }

    case "pinecone": {
      const { PineconeStore } = await import(
        "@langchain/community/vectorstores/pinecone"
      );
      const { Pinecone } = await import("@pinecone-database/pinecone");

      const pc = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY
      });

      const index = pc.Index(process.env.PINECONE_INDEX);

      return await PineconeStore.fromExistingIndex(embeddings, {
        pineconeIndex: index
      });
    }

    default:
      throw new Error("Unsupported VECTOR_DB");
  }
}
