* Set up môi trường:
+ Node v22.18.0
+ Cài pnpm
+ Cài Docker
+ Cài Ollama (https://ollama.com/download), sau khi cài xong, vào cmd gõ "ollama --version" để kiểm tra đã cài thành công chưa.
+ Chạy lệnh "ollama pull nomic-embed-text", để cài đặt mô hình dùng để chuyển đổi các câu văn hoặc đoạn văn thành một chuỗi các con số (vector)




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
