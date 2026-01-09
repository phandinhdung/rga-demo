import "dotenv/config";
import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { PineconeVectorStore } from "@langchain/community/vectorstores/pinecone";
import { OllamaEmbeddings } from "@langchain/ollama";
import { Pinecone } from "@pinecone-database/pinecone";
import { PINECONE_INDEX_NAME } from "./services/vectorstore/constants.js";
import fs from "node:fs";
import path from "node:path";

async function run() {
  try {
    console.log("🚀 Bắt đầu quá trình làm mới dữ liệu...");
    
    // Đọc các file kiến thức
    const docs = [];
    
    // Đọc file knowledge.txt
    const knowledgePath = path.resolve("data/knowledge.txt");
    if (fs.existsSync(knowledgePath)) {
      const knowledgeText = fs.readFileSync(knowledgePath, "utf8");
      if (knowledgeText.trim()) {
        docs.push(new Document({ pageContent: knowledgeText, metadata: { source: "knowledge.txt" } }));
        console.log("✅ Đã đọc file knowledge.txt");
      } else {
        console.warn("⚠️ File knowledge.txt trống, bỏ qua.");
      }
    } else {
      console.warn(`⚠️ Không tìm thấy file tại: ${knowledgePath}`);
    }
    
    // Đọc file me.txt
    const mePath = path.resolve("data/me.txt");
    if (fs.existsSync(mePath)) {
      const meText = fs.readFileSync(mePath, "utf8");
      if (meText.trim()) {
        docs.push(new Document({ pageContent: meText, metadata: { source: "me.txt" } }));
        console.log("✅ Đã đọc file me.txt");
      } else {
        console.warn("⚠️ File me.txt trống, bỏ qua.");
      }
    } else {
      console.warn(`⚠️ Không tìm thấy file tại: ${mePath}`);
    }
    
    if (docs.length === 0) {
      throw new Error("Không có file nào để nạp vào vector DB! Hãy kiểm tra lại các file trong thư mục data.");
    }
    
    console.log(`📚 Tổng cộng đã đọc ${docs.length} file(s)`);

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 150,
    });
    const chunks = await splitter.splitDocuments(docs);

  // === PHẦN KẾT NỐI VỚI PINECONE ===
  console.log("🔗 Đang kết nối đến Pinecone...");
  let pineconeIndex;

  try {
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });

    // Kiểm tra xem index có tồn tại không
    const indexList = await pinecone.listIndexes();
    const indexExists = indexList.indexes?.some(idx => idx.name === PINECONE_INDEX_NAME);

    if (!indexExists) {
      throw new Error(`Index "${PINECONE_INDEX_NAME}" không tồn tại! Hãy tạo index trước trong Pinecone dashboard.`);
    }

    pineconeIndex = pinecone.Index(PINECONE_INDEX_NAME);
    console.log("✅ Kết nối Pinecone thành công!");
  } catch (err) {
    throw new Error(`Kết nối Pinecone thất bại: ${err.message}`);
  }

  // --- XÓA DỮ LIỆU CŨ ---
  console.log(`🧹 Đang xóa toàn bộ dữ liệu cũ trong index: ${PINECONE_INDEX_NAME}...`);
  try {
    // Xóa tất cả vectors trong index (namespace mặc định "")
    // Với Pinecone v6, sử dụng delete với deleteAll: true
    await pineconeIndex.deleteAll();
    console.log("🗑️ Đã gửi yêu cầu xóa tất cả vectors cũ.");
    
    // Đợi một chút để Pinecone xử lý (eventual consistency)
    console.log("⏳ Đang đợi Pinecone xóa vectors...");
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Kiểm tra lại để đảm bảo đã xóa xong
    let stats;
    let attempts = 0;
    const maxAttempts = 10;
    
    do {
      stats = await pineconeIndex.describeIndexStats();
      // Pinecone v6 trả về totalVectorCount trong stats
      const totalVectors = stats.totalVectorCount || stats.namespaces?.[""]?.vectorCount || 0;
      
      if (totalVectors === 0) {
        console.log("✅ Đã xóa tất cả vectors cũ thành công!");
        break;
      }
      
      attempts++;
      if (attempts >= maxAttempts) {
        console.warn(`⚠️ Đã đợi ${maxAttempts} lần nhưng vẫn còn ${totalVectors} vectors. Tiếp tục nạp dữ liệu mới...`);
        break;
      }
      
      console.log(`⏳ Vẫn còn ${totalVectors} vectors, đợi thêm... (${attempts}/${maxAttempts})`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    } while (attempts < maxAttempts);
    
  } catch (e) {
    // Nếu deleteAll không hoạt động, thử cách khác với delete method
    try {
      console.log("🔄 Thử cách xóa khác với delete method...");
      // Thử với delete method và deleteAll option
      await pineconeIndex.delete({ deleteAll: true });
      console.log("🗑️ Đã xóa vectors bằng delete({ deleteAll: true }).");
      // Đợi một chút
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (e2) {
      throw new Error(`Không thể xóa dữ liệu cũ: ${e.message}. Thử cách khác cũng thất bại: ${e2.message}`);
    }
  }
  // --------------------------------

  // 4. Nạp dữ liệu mới
  console.log("🧠 Đang tạo vector và nạp lại từ đầu vào Pinecone...");
  const embeddings = new OllamaEmbeddings({
    model: process.env.EMBEDDING_MODEL_NAME,
    baseUrl: process.env.OLLAMA_BASE_URL,
  });
  
  await PineconeVectorStore.fromDocuments(chunks, embeddings, {
    pineconeIndex,
  });

      console.log("✅ HOÀN THÀNH! Dữ liệu đã được nạp vào Pinecone thành công.");
      process.exit(0);
    } catch (error) {
      console.error("❌ Lỗi thực thi:", error.message || error);
      process.exit(1);
    }
}

run();
