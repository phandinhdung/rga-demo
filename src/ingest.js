import "dotenv/config";
import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { WeaviateStore } from "@langchain/weaviate";
// import { embeddings } from "./services/embeddings.js";
import { OllamaEmbeddings } from "@langchain/ollama";
import weaviate from "weaviate-client";  // Đảm bảo import đúng (bạn đã có rồi)
import { WEAVIATE_INDEX_NAME } from "./services/vectorstore/constants.js";
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

  // === PHẦN KẾT NỐI CHÍNH XÁC CHO WEAVIATE CLIENT V3 ===
  console.log("🔗 Đang kết nối đến Weaviate local...");
  let client;

  try {
    client = await weaviate.connectToLocal({
      host: "localhost",
      port: 8080,
      grpcPort: 50051,
      authCredentials: new weaviate.ApiKey(process.env.WEAVIATE_API_KEY),
    });

    // Test kết nối (dùng isLive thay vì liveChecker)
    const isLive = await client.isLive();
    if (!isLive) {
      throw new Error("Weaviate không live/ready!");
    }
    console.log("✅ Kết nối Weaviate thành công!");
  } catch (err) {
    throw new Error(`Kết nối Weaviate thất bại: ${err.message}`);
  }

  // --- XÓA DỮ LIỆU CŨ ---
  console.log(`🧹 Đang xóa toàn bộ dữ liệu cũ trong collection: ${WEAVIATE_INDEX_NAME}...`);
  try {
    // Kiểm tra xem collection có tồn tại không trước khi xóa
    const exists = await client.collections.exists(WEAVIATE_INDEX_NAME);
    if (exists) {
      await client.collections.delete(WEAVIATE_INDEX_NAME);
      console.log("🗑️ Đã xóa collection cũ thành công.");
    }
  } catch (e) {
    console.warn("⚠️ Lưu ý: Không thể xóa collection (có thể nó chưa tồn tại).");
  }
  // --------------------------------

  // 4. Nạp dữ liệu mới
  console.log("🧠 Đang tạo vector và nạp lại từ đầu vào Weaviate...");
  const embeddings = new OllamaEmbeddings({
    model: process.env.EMBEDDING_MODEL_NAME,
    baseUrl: process.env.OLLAMA_BASE_URL,
  });
  
  await WeaviateStore.fromDocuments(chunks, embeddings, {
    client,
    indexName: WEAVIATE_INDEX_NAME,
    textKey: "text",
  });

      console.log("✅ HOÀN THÀNH! Toàn bộ dữ liệu cũ đã được thay thế bằng dữ liệu mới.");
      process.exit(0);
    } catch (error) {
      console.error("❌ Lỗi thực thi:", error.message || error);
      process.exit(1);
    }
}

run();
