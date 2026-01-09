import { ChatOpenAI } from "@langchain/openai";
import { createWeaviateRetriever } from '../services/vectorstore/weaviate.js';
import { createPineconeRetriever } from '../services/vectorstore/pinecone.js';

const llm = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0.2,
  openAIApiKey: process.env.OPENAI_API_KEY
});

export async function ask(question) {
  //  const retriever = await createWeaviateRetriever();
  const retriever = await createPineconeRetriever();

   // Sau đó thực hiện tìm kiếm tài liệu
   const docs = await retriever.invoke(question);
   
   // Logic để gửi sang LLM (gpt-4o-mini, Llama3 (miễn phí), ...)
   const context = docs.map(d => d.pageContent).join("\n");
   
   const res = await llm.invoke([
     { role: "system", content: 'Chỉ trả lời câu hỏi dựa trên tài liệu được cung cấp. Nếu không có thông tin trong tài liệu, hãy trả lời "Tôi chưa tìm thấy thông tin nào để trả lời cho câu hỏi của bạn. Mong bạn thông cảm!"' },
     { role: "user", content: `Tài liệu:\n${context}\n\nCâu hỏi:\n${question}` }
   ]);

   return res.content;
}
