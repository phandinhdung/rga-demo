* Set up môi trường:
+ Node v22.18.0
+ Cài pnpm
+ Cài Docker
+ Cài Ollama (https://ollama.com/download), sau khi cài xong, vào cmd gõ "ollama --version" để kiểm tra đã cài thành công chưa.
+ Chạy lệnh "ollama pull nomic-embed-text", để cài đặt mô hình nomic-embed-text (loại nhẹ, chỉ tốn ít tài nguyên bộ nhớ để chạy) dùng để chuyển đổi các câu văn hoặc đoạn văn thành một chuỗi các con số (vector). Để kiểm tra, đã cái được hay chưa, có thể chạy lệnh "ollama list" hoặc lệnh "ollama show nomic-embed-text"



* Sau khi đã set up môi trường đầy đủ, vui lòng chạy các lệnh sau theo thứ tự:
- Tạo file .env dựa trên file mẫu .env.example, điền nội dung bên trong file .env cho đầy đủ.
- Mở terminal, di chuyển vào thư mục dự án rg-demo
- pnpm i : để cài các thư viện cần thiết cho project.
- docker compose up -d : để chạy các server cần thiết trên docker
- pnpm ingest : để tạo dữ liệu vetor và lưu vào weaviate DB. File dữ liệu được lưu ở data/knowledge.txt
- pnpm dev : chạy server backend
- Để test api /chat, có thể mở Postman, tạo request POST với link "http://localhost:3000/chat" , chọn tab Body, chọn raw, chọn JSON, nhập nội dung là 
{
  "question": "Việt Nam giao lưu với nước nào?"
}
- Sau khi gửi request, sẽ thấy AI trả lời.




* Một số lưu ý quan trọng:
- Kiểm tra dữ liệu: Sau khi chạy xong, bạn có thể kiểm tra xem dữ liệu đã vào Weaviate chưa bằng cách truy cập: http://localhost:8080/v1/objects.
- Nếu bạn sửa file knowledge.txt, hãy chạy lại lệnh "pnpm ingest" để cập nhật kiến thức mới cho AI.

==========================================================================================================
==========================================================================================================
===== TÀI LIỆU ĐỌC THÊM =====
* Mặc dù nomic-embed-text rất mạnh về hiệu suất và hỗ trợ context dài (8192 tokens), nhưng nó được huấn luyện chủ yếu trên dữ liệu tiếng Anh. Đối với tiếng Việt, đặc biệt là trong tư vấn tâm lý — nơi một từ ngữ nhỏ cũng mang sắc thái khác nhau — bạn sẽ gặp một số hạn chế sau:
- Rào cản ngôn ngữ: Nomic hiểu tiếng Việt theo dạng "đa ngôn ngữ" (multilingual) nhưng không chuyên sâu. Nó có thể nhận diện từ khóa tốt, nhưng khả năng hiểu sự tương đồng về cảm xúc hoặc các ẩn ý trong câu văn tiếng Việt sẽ kém hơn các model chuyên dụng.
- Độ chính xác trong RAG: Trong tư vấn tâm lý, việc AI trả về "Tôi không biết" là rất quan trọng để tránh tư vấn sai. Nếu model embedding không "khớp" được câu hỏi của user với tài liệu do sai biệt về ngôn ngữ, AI sẽ thường xuyên trả lời "không biết" ngay cả khi tài liệu có thông tin, hoặc tệ hơn là lấy nhầm đoạn tài liệu không liên quan.

* Bổ sung các model khác có thể thay thế nomic-embed-text:
- BGE-M3 :Khuyên dùng nhất. Đây là model đa ngôn ngữ mạnh nhất hiện nay, hỗ trợ cực tốt cho tiếng Việt và các truy vấn dài/ngắn khác nhau. (ollama pull bge-m3)
- Paraphrase-multilingual: Chuyên biệt cho việc tìm kiếm các câu có cùng ý nghĩa nhưng khác cách diễn đạt (rất hợp với tâm lý học). (ollama pull paraphrase-multilingual)
- mxbai-embed-large: Có khả năng phân loại ngữ nghĩa rất sâu, dù là model tiếng Anh nhưng xử lý đa ngôn ngữ khá ổn định. (ollama pull mxbai-embed-large)

* Cải tiến RAG: Trong lĩnh vực tư vấn, Lộ trình (Roadmap) là thứ đòi hỏi tính logic và thứ tự. Để hệ thống hoạt động hoàn hảo trên Weaviate, nên triển khai thêm các phần sau:
- Sử dụng Hybrid Search: Đừng chỉ dùng Vector Search (Embedding). Hãy kết hợp với Keyword Search (BM25) trong Weaviate. Điều này giúp AI tìm đúng các thuật ngữ chuyên môn tâm lý mà đôi khi embedding bỏ lỡ.
- Chunking (Cắt nhỏ tài liệu) thông minh: Thay vì cắt theo độ dài, hãy cắt theo "bước" hoặc "ý chính" trong lộ trình tư vấn. Đảm bảo mỗi đoạn vector hóa đều chứa đủ ngữ cảnh để AI không bị hiểu lầm.
- Kiểm tra độ tương đồng (Similarity Threshold): Vì bạn yêu cầu "không có thông tin sẽ trả lời không biết", bạn cần thiết lập một ngưỡng (threshold) trong Weaviate (ví dụ: chỉ lấy kết quả có độ tương đồng > 0.7). Nếu không có kết quả nào đạt ngưỡng, bạn sẽ yêu cầu LLM báo "Không tìm thấy thông tin".
