Set up môi trường:
+ Node v22.18.0


pnpm add weaviate/client
pnpm add @pinecone-database/pinecone
node -e "import('weaviate-client').then(()=>console.log('OK'))"
pnpm add langchain@latest

https://ollama.com/download

Chỉ thấy chạy được cli ở thư mục gốc Comman prompt:
ollama --version
ollama pull nomic-embed-text

Lỗi core: 
pnpm add @langchain/core @langchain/community @langchain/ollama

Một số lưu ý quan trọng:
Lỗi "Module not found": Nếu máy báo thiếu thư viện, hãy chạy pnpm add @langchain/weaviate @langchain/ollama

Kiểm tra dữ liệu: Sau khi chạy xong, bạn có thể kiểm tra xem dữ liệu đã vào Weaviate chưa bằng cách truy cập: http://localhost:8080/v1/objects.

Mỗi khi đổi nội dung: Nếu bạn sửa file knowledge.txt, hãy chạy lại pnpm ingest để cập nhật kiến thức mới cho AI.
