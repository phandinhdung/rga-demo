import { Pinecone } from "@pinecone-database/pinecone";
import { embeddings } from "../embeddings.js";
import { PineconeVectorStore } from "@langchain/community/vectorstores/pinecone";
import { PINECONE_INDEX_NAME } from "./constants.js";

export async function createPineconeRetriever() {
  const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY
  });

  const index = pc.Index(PINECONE_INDEX_NAME);

  const store = await PineconeVectorStore.fromExistingIndex(embeddings, {
    pineconeIndex: index
  });

  return store.asRetriever({ k: 5 });
}
