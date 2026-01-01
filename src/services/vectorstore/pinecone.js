import { Pinecone } from "@pinecone-database/pinecone";
import { embeddings } from "../embeddings.js";
import { PineconeVectorStore } from "@langchain/community/vectorstores/pinecone";

export async function createPineconeRetriever() {
  const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY
  });

  const index = pc.Index(process.env.PINECONE_INDEX);

  const store = await PineconeVectorStore.fromExistingIndex(embeddings, {
    pineconeIndex: index
  });

  return store.asRetriever({ k: 4 });
}
