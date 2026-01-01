import { ChatOpenAI } from "@langchain/openai";
import { embeddings } from '../services/embeddings.js';
import { createWeaviateRetriever } from '../services/vectorstore/weaviate.js';

const llm = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0.2
});

export async function ask(question) {
   // Truyền embeddings vào hàm tạo retriever
   const retriever = await createWeaviateRetriever(embeddings);

   // Sau đó thực hiện tìm kiếm tài liệu
   const docs = await retriever.invoke(question);
   
   // Logic để gửi sang LLM (gpt-4o-mini, Llama3 (miễn phí), ...)
   const context = docs.map(d => d.pageContent).join("\n");
   console.log("context: ", context);
   
   const res = await llm.invoke([
     { role: "system", content: "Chỉ trả lời dựa trên context." },
     { role: "user", content: `Context:\n${context}\n\nQuestion:\n${question}` }
   ]);

   return res.content;
}
