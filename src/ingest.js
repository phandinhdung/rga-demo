import "dotenv/config";
import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { PineconeStore } from "@langchain/pinecone";
import { OllamaEmbeddings } from "@langchain/ollama";
import { Pinecone } from "@pinecone-database/pinecone";
import { PINECONE_INDEX_NAME } from "./services/vectorstore/constants.js";
import fs from "node:fs";
import path from "node:path";

async function run() {
  try {
    console.log("🚀 --- BẮT ĐẦU QUÁ TRÌNH LÀM MỚI DỮ LIỆU ---");

    // 1. ĐỌC DỮ LIỆU TỪ FILE
    const docs = [];
    const files = ["knowledge.txt", "me.txt"];

    for (const fileName of files) {
      const filePath = path.resolve(`data/${fileName}`);
      if (fs.existsSync(filePath)) {
        const text = fs.readFileSync(filePath, "utf8");
        if (text.trim()) {
          docs.push(new Document({ 
            pageContent: text, 
            metadata: { source: fileName } 
          }));
          console.log(`✅ Đã đọc file: ${fileName}`);
        }
      } else {
        console.warn(`⚠️ Không tìm thấy file: ${filePath}`);
      }
    }

    if (docs.length === 0) {
      throw new Error("Không có dữ liệu để nạp! Vui lòng kiểm tra thư mục data/");
    }

    // 2. CHIA NHỎ VĂN BẢN (CHUNKING)
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 150,
    });
    const chunks = await splitter.splitDocuments(docs);
    console.log(`📚 Tổng cộng đã chia thành ${chunks.length} đoạn nhỏ.`);

    // 3. KẾT NỐI PINECONE
    console.log("🔗 Đang kết nối đến Pinecone...");
    const pc = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });

    const indexList = await pc.listIndexes();
    const indexExists = indexList.indexes?.some(idx => idx.name === PINECONE_INDEX_NAME);

    if (!indexExists) {
      throw new Error(`Index "${PINECONE_INDEX_NAME}" chưa được tạo trên Dashboard Pinecone!`);
    }

    const pineconeIndex = pc.Index(PINECONE_INDEX_NAME);

    // 4. XÓA DỮ LIỆU CŨ (KHÔNG CHECK STATS)
    // Trên gói Serverless, việc check stats thường trả về số liệu cũ gây lỗi logic.
    // Chúng ta sẽ ra lệnh xóa thẳng tay trong namespace mặc định.
    console.log(`🧹 Đang dọn dẹp Index: ${PINECONE_INDEX_NAME}...`);
    try {
      // Cách xóa sạch nhất cho gói Free/Serverless
      await pineconeIndex.namespace("").deleteAll();
      console.log("🗑️ Đã gửi yêu cầu xóa toàn bộ vector cũ.");
      
      // Đợi một lát để Pinecone cập nhật trạng thái nội bộ
      console.log("⏳ Đợi 2 giây để hệ thống đồng bộ...");
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (e) {
      console.warn("ℹ️ Lưu ý khi xóa:", e.message);
    }

    // 5. KHỞI TẠO EMBEDDINGS (OLLAMA)
    console.log("🧠 Đang khởi tạo Embedding model...");
    const embeddings = new OllamaEmbeddings({
      model: process.env.EMBEDDING_MODEL_NAME, // vd: nomic-embed-text
      baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
    });

    // 6. NẠP DỮ LIỆU MỚI VÀO VECTOR STORE
    console.log("📤 Đang tạo vector và nạp vào Pinecone (có thể mất vài phút)...");
    
    // Sử dụng PineconeStore từ @langchain/pinecone
    await PineconeStore.fromDocuments(chunks, embeddings, {
      pineconeIndex,
      maxConcurrency: 5, // Tránh spam quá nhiều request cùng lúc lên Ollama/Pinecone
    });

    console.log("✨ --- HOÀN THÀNH THÀNH CÔNG! ---");
    process.exit(0);

  } catch (error) {
    console.error("❌ LỖI THỰC THI:");
    console.error(error.message || error);
    process.exit(1);
  }
}

run();