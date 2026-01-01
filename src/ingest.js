import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { WeaviateStore } from "@langchain/weaviate";
import { embeddings } from "./services/embeddings.js";
import { connectToLocal } from "weaviate-client";
import fs from "node:fs";
import path from "node:path";
import { WEAVIATE_INDEX_NAME } from "./services/vectorstore/constants.js";

async function run() {
  try {
    console.log("🚀 Bắt đầu quá trình làm mới dữ liệu...");

    // 1. Đọc file kiến thức
    const filePath = path.resolve("data/knowledge.txt");
    if (!fs.existsSync(filePath)) {
      throw new Error(`Không tìm thấy file tại: ${filePath}. Hãy tạo thư mục data và file knowledge.txt!`);
    }

    const text = fs.readFileSync(filePath, "utf8");
    const docs = [new Document({ pageContent: text, metadata: { source: "knowledge.txt" } })];

    // 2. Chia nhỏ văn bản
    const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 500, chunkOverlap: 50 });
    const chunks = await splitter.splitDocuments(docs);

    // 3. Kết nối Weaviate V3
    const client = await connectToLocal({
      host: "localhost",
      port: 8080,
      grpcPort: 50051,
    });

    // --- BƯỚC MỚI: XÓA DỮ LIỆU CŨ ---
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
