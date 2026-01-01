import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { WeaviateStore } from "@langchain/weaviate";
import { embeddings } from "./services/embeddings.js";
import { connectToLocal } from "weaviate-client";
import fs from "node:fs";
import path from "node:path";

async function run() {
  try {
    console.log("🚀 Bắt đầu nạp dữ liệu (Fix path error)...");

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
    console.log(`✂️ Đã chia thành ${chunks.length} đoạn.`);

    // 3. Kết nối Weaviate V3
    const client = await connectToLocal({
      host: "localhost",
      port: 8080,
      grpcPort: 50051,
    });

    // 4. Nạp dữ liệu
    console.log("🧠 Đang tạo vector và nạp vào Weaviate...");
    await WeaviateStore.fromDocuments(chunks, embeddings, {
      client,
      indexName: "VietnamDocs",
      textKey: "text",
    });

    console.log("✅ HOÀN THÀNH! Dữ liệu đã sẵn sàng.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi thực thi:", error.message || error);
    process.exit(1);
  }
}

run();
