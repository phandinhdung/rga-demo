import { Pinecone } from "@pinecone-database/pinecone";
import { embeddings } from "../embeddings.js";
// import { PineconeVectorStore } from "@langchain/community/vectorstores/pinecone";
import { PINECONE_INDEX_NAME } from "./constants.js";
import { PineconeStore } from "@langchain/pinecone";

export async function createPineconeRetriever() {
  const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY
  });

  const index = pc.Index(PINECONE_INDEX_NAME);

  const store = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex: index
  });

  return store.asRetriever({ 
    searchType: "hybrid",
    searchKwargs: {
      // alpha = 0: Chỉ tìm theo từ khóa (BM25)
      // alpha = 1: Chỉ tìm theo Vector (BGE-M3)
      // alpha = 0.5: Kết hợp cân bằng cả hai
      alpha: 0.5, 
    },
    k: 7,
  });
}
