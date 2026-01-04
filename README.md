\* Tóm tắt các tính năng đã làm:<br/>
\- Chuyển dữ liệu từ file ".txt" sang dạng vector và lưu vào DB Weaviate.<br/>
\- Dùng kỹ thuật RAG, để làm cho câu trả lời của AI chính xác hơn, do có dựa trên dữ liệu đầu vào ở trên. Nếu không tìm thấy thông tin trong dữ liệu đầu vào, AI sẽ trả lời không biết.<br/>
\- Tạo server backend (nodejs), với api "/chat", dùng để gửi câu hỏi cho AI, response trả về là câu trả lời của AI.<br/>
<br/>
<br/>
\* Set up môi trường:<br>
\- Cài Node v22.18.0<br/>
\- Cài pnpm<br/>
\- Cài Docker<br/>
\- Cài Ollama (https://ollama.com/download), sau khi cài xong, vào cmd gõ "ollama --version" để kiểm tra đã cài thành công chưa.<br/>
\- Chạy lệnh: "ollama pull bge-m3", để cài modal dùng để chuyển đổi các câu văn hoặc đoạn văn thành một chuỗi các con số (vector). Để kiểm tra, đã cài đặt thành công hay chưa, có thể chạy lệnh "ollama list" hoặc "ollama show bge-m3"<br/>
<br/>
<br/>
\* Sau khi đã set up môi trường đầy đủ, vui lòng chạy các lệnh sau theo thứ tự:<br/>
\- Tạo file .env dựa trên file mẫu .env.example, điền nội dung bên trong file .env cho đầy đủ.<br/>
\- Mở terminal, di chuyển vào thư mục dự án rg-demo<br/>
\- pnpm i : để cài các thư viện cần thiết cho project.<br/>
\- docker compose up -d : để chạy các server cần thiết trên docker<br/>
\- pnpm ingest : để đọc file dữ liệu đầu vào, chuyển dữ liệu sang dạng vetor và lưu vào Weaviate DB (file dữ liệu đầu vào được lưu ở data/knowledge.txt)<br/>
\- pnpm dev : chạy server backend<br/>
\- Để test api /chat, có thể mở Postman, tạo request POST với link "http://localhost:3000/chat" , chọn tab Body, chọn raw, chọn JSON, nhập nội dung là <br/>
{<br/>
  "question": "Việt Nam giao lưu với nước nào?"<br/>
}<br/>
\- Sau khi gửi request, sẽ thấy AI trả lời.<br/>
<br/>
<br/>
\* Một số lưu ý quan trọng:<br/>
\- Kiểm tra dữ liệu: Sau khi chạy xong, bạn có thể kiểm tra xem dữ liệu đã vào Weaviate chưa bằng cách truy cập: http://localhost:8080/v1/objects.<br/>
\- Nếu bạn sửa file knowledge.txt, hãy chạy lại lệnh "pnpm ingest" để cập nhật kiến thức mới cho AI.<br/>

=================================================================================<br/>
============ TÀI LIỆU KIẾN THỨC CẦN BIẾT CHO RAG ==============<br/>
1. RAG (Retrieval-Augmented Generation) là một kỹ thuật giúp mô hình ngôn ngữ lớn (LLM) như GPT-4 hay Gemini truy cập vào các nguồn dữ liệu bên ngoài để đưa ra câu trả lời chính xác, cập nhật và đáng tin cậy hơn.<br/>
Thay vì chỉ dựa vào "trí nhớ" có sẵn từ quá trình huấn luyện, RAG cho phép AI "tra cứu" tài liệu của bạn trước khi trả lời.<br/>
<br/>
2. Tại sao cần dùng RAG?<br/>
Mặc dù các LLM rất thông minh, chúng vẫn gặp phải 3 vấn đề lớn mà RAG có thể giải quyết:<br/>
\- Tránh "ảo giác" (Hallucination): LLM đôi khi tự tin đưa ra thông tin sai lệch. RAG buộc AI phải dựa trên dữ liệu thực tế được cung cấp để trả lời.<br/>
\- Cập nhật dữ liệu thời gian thực: LLM bị giới hạn bởi "Knowledge Cutoff" (ngày cuối cùng nó được học dữ liệu). RAG giúp AI tiếp cận được các tin tức mới nhất hoặc dữ liệu nội bộ của doanh nghiệp mà không cần huấn luyện lại (re-training).<br/>
\- Bảo mật và cá nhân hóa: Bạn có thể cho AI đọc các tài liệu riêng tư (hợp đồng, hướng dẫn sử dụng nội bộ) để hỗ trợ công việc mà không lo dữ liệu đó bị lộ ra ngoài hay dùng để huấn luyện mô hình chung.<br/>
<br/>
3. RAG liên quan gì đến Vector Database (Cơ sở dữ liệu Vector)?<br/>
\- Để RAG hoạt động hiệu quả, hệ thống cần tìm đúng đoạn văn bản chứa thông tin cần thiết trong hàng triệu trang tài liệu chỉ trong vài mil giây. Đây là lúc Vector DB xuất hiện.<br/>
\- Mối quan hệ này hoạt động như sau:<br/>
\+ Embedding: Toàn bộ dữ liệu của bạn được chia nhỏ và chuyển đổi thành các dãy số (gọi là vector) đại diện cho ý nghĩa ngữ nghĩa.<br/>
\+ Lưu trữ: Các vector này được lưu vào Vector Database (như Pinecone, Milvus, hay Weaviate).<br/>
\+ Truy vấn (Retrieval): Khi bạn đặt câu hỏi, câu hỏi đó cũng được chuyển thành vector. Hệ thống sẽ vào Vector DB để tìm các đoạn văn bản có "vector gần giống nhất" với câu hỏi của bạn.<br/>
\+ Tổng hợp (Generation): Các đoạn văn bản tìm được sẽ được gửi kèm với câu hỏi của bạn đến LLM để nó viết thành một câu trả lời hoàn chỉnh.<br/>
<br/>
Ví dụ dễ hiểu: Nếu RAG là một bài kiểm tra "sách mở", thì Vector DB chính là mục lục siêu thông minh giúp bạn lật đúng trang sách chứa câu trả lời ngay lập tức thay vì phải đọc lại cả cuốn sách.<br/>
<br/>
4. Quy trình vận hành của RAG<br/>
\- Bước 1: Người dùng đặt câu hỏi.<br/>
\- Bước 2: Hệ thống tìm kiếm thông tin liên quan đến câu hỏi trong Vector DB.<br/>
\- Bước 3: Gộp thông tin tìm được + Câu hỏi gốc đưa vào LLM.<br/>
\- Bước 4: LLM trả ra câu trả lời có độ chính xác cao.<br/>
<br/>
<br/>
=============TÀI LIỆU THÊM ============<br/>
\* Phần Bảo mật<br/>
\- Kiểm tra bảo mật của weaviate server bằng lệnh:
curl http://localhost:8080/v1/meta \ -H "Authorization: Bearer WEAVIATE_API_KEY" <br/>
<br/>
<br/>

