# \* Tóm tắt các tính năng đã làm:
## \- Chuyển dữ liệu từ file ".txt" sang dạng vector và lưu vào DB Weaviate.
## \- Dùng kỹ thuật RAG, để làm cho câu trả lời của AI chính xác hơn, do có dựa trên dữ liệu đầu vào ở trên. Nếu không tìm thấy thông tin trong dữ liệu đầu vào, AI sẽ trả lời không biết.
\- Tạo server backend (nodejs), với api "/chat", dùng để gửi câu hỏi cho AI, response trả về là câu trả lời của AI.


\* Set up môi trường:
\- Cài Node v22.18.0
\- Cài pnpm
\- Cài Docker
\- Cài Ollama (https://ollama.com/download), sau khi cài xong, vào cmd gõ "ollama --version" để kiểm tra đã cài thành công chưa.
\- Chạy lệnh:
  \+ "ollama pull nomic-embed-text" : modal bình thường, tốn ít bộ nhớ.
  \+ Hoặc "ollama pull bge-m3" : modal tốt hơn, nhưng tốn nhiều bộ nhớ hơn.
, để cài modal, dùng để chuyển đổi các câu văn hoặc đoạn văn thành một chuỗi các con số (vector). Để kiểm tra, đã cái được hay chưa, có thể chạy lệnh "ollama list" hoặc lệnh "ollama show nomic-embed-text" (hoặc "ollama show bge-m3")


* Sau khi đã set up môi trường đầy đủ, vui lòng chạy các lệnh sau theo thứ tự:
- Tạo file .env dựa trên file mẫu .env.example, điền nội dung bên trong file .env cho đầy đủ.
- Mở terminal, di chuyển vào thư mục dự án rg-demo
- pnpm i : để cài các thư viện cần thiết cho project.
- docker compose up -d : để chạy các server cần thiết trên docker
- pnpm ingest : để đọc file dữ liệu đầu vào, chuyển dữ liệu sang dạng vetor và lưu vào Weaviate DB (file dữ liệu đầu vào được lưu ở data/knowledge.txt)
- pnpm dev : chạy server backend
- Để test api /chat, có thể mở Postman, tạo request POST với link "http://localhost:3000/chat" , chọn tab Body, chọn raw, chọn JSON, nhập nội dung là 
{
  "question": "Việt Nam giao lưu với nước nào?"
}
- Sau khi gửi request, sẽ thấy AI trả lời.



* Một số lưu ý quan trọng:
- Kiểm tra dữ liệu: Sau khi chạy xong, bạn có thể kiểm tra xem dữ liệu đã vào Weaviate chưa bằng cách truy cập: http://localhost:8080/v1/objects.
- Nếu bạn sửa file knowledge.txt, hãy chạy lại lệnh "pnpm ingest" để cập nhật kiến thức mới cho AI.

=================================================================================================================
=================================================================================================================
============= TÀI LIỆU ĐỌC THÊM =================================================================================
* Mặc dù nomic-embed-text rất mạnh về hiệu suất và hỗ trợ context dài (8192 tokens), nhưng nó được huấn luyện chủ yếu trên dữ liệu tiếng Anh. Đối với tiếng Việt, đặc biệt là trong tư vấn tâm lý — nơi một từ ngữ nhỏ cũng mang sắc thái khác nhau — bạn sẽ gặp một số hạn chế sau:
- Rào cản ngôn ngữ: Nomic hiểu tiếng Việt theo dạng "đa ngôn ngữ" (multilingual) nhưng không chuyên sâu. Nó có thể nhận diện từ khóa tốt, nhưng khả năng hiểu sự tương đồng về cảm xúc hoặc các ẩn ý trong câu văn tiếng Việt sẽ kém hơn các model chuyên dụng.
- Độ chính xác trong RAG: Trong tư vấn tâm lý, việc AI trả về "Tôi không biết" là rất quan trọng để tránh tư vấn sai. Nếu model embedding không "khớp" được câu hỏi của user với tài liệu do sai biệt về ngôn ngữ, AI sẽ thường xuyên trả lời "không biết" ngay cả khi tài liệu có thông tin, hoặc tệ hơn là lấy nhầm đoạn tài liệu không liên quan.

* Bổ sung các model khác có thể thay thế nomic-embed-text:
- BGE-M3 :Khuyên dùng nhất. Đây là model đa ngôn ngữ mạnh nhất hiện nay, hỗ trợ cực tốt cho tiếng Việt và các truy vấn dài/ngắn khác nhau. (ollama pull bge-m3)
- Paraphrase-multilingual: Chuyên biệt cho việc tìm kiếm các câu có cùng ý nghĩa nhưng khác cách diễn đạt (rất hợp với tâm lý học). (ollama pull paraphrase-multilingual)
- mxbai-embed-large: Có khả năng phân loại ngữ nghĩa rất sâu, dù là model tiếng Anh nhưng xử lý đa ngôn ngữ khá ổn định. (ollama pull mxbai-embed-large)

* Cải tiến RAG: Trong lĩnh vực tư vấn, Lộ trình (Roadmap) là thứ đòi hỏi tính logic và thứ tự. Để hệ thống hoạt động hoàn hảo trên Weaviate, nên triển khai thêm các phần sau:
- Sử dụng Hybrid Search: Kết hợp dùng Vector Search (Embedding) với Keyword Search (BM25) trong Weaviate. Điều này giúp AI tìm đúng các thuật ngữ chuyên môn tâm lý mà đôi khi embedding bỏ lỡ.
- Chunking (Cắt nhỏ tài liệu) thông minh: Thay vì cắt theo độ dài, hãy cắt theo "bước" hoặc "ý chính" trong lộ trình tư vấn. Đảm bảo mỗi đoạn vector hóa đều chứa đủ ngữ cảnh để AI không bị hiểu lầm.
- Kiểm tra độ tương đồng (Similarity Threshold): Vì bạn yêu cầu "không có thông tin sẽ trả lời không biết", bạn cần thiết lập một ngưỡng (threshold) trong Weaviate (ví dụ: chỉ lấy kết quả có độ tương đồng > 0.7). Nếu không có kết quả nào đạt ngưỡng, bạn sẽ yêu cầu LLM báo "Không tìm thấy thông tin".

* Phần Bảo mật
- Kiểm tra bảo mật của weaviate server bằng lệnh:
curl http://localhost:8080/v1/meta \
  -H "Authorization: Bearer WEAVIATE_API_KEY"


============= TÀI LIỆU KIẾN THỨC CẦN BIẾT CHO RAG =================================================================================
1. RAG (Retrieval-Augmented Generation) là một kỹ thuật giúp mô hình ngôn ngữ lớn (LLM) như GPT-4 hay Gemini truy cập vào các nguồn dữ liệu bên ngoài để đưa ra câu trả lời chính xác, cập nhật và đáng tin cậy hơn.
Thay vì chỉ dựa vào "trí nhớ" có sẵn từ quá trình huấn luyện, RAG cho phép AI "tra cứu" tài liệu của bạn trước khi trả lời.

2. Tại sao cần dùng RAG?
Mặc dù các LLM rất thông minh, chúng vẫn gặp phải 3 vấn đề lớn mà RAG có thể giải quyết:
- Tránh "ảo giác" (Hallucination): LLM đôi khi tự tin đưa ra thông tin sai lệch. RAG buộc AI phải dựa trên dữ liệu thực tế được cung cấp để trả lời.
- Cập nhật dữ liệu thời gian thực: LLM bị giới hạn bởi "Knowledge Cutoff" (ngày cuối cùng nó được học dữ liệu). RAG giúp AI tiếp cận được các tin tức mới nhất hoặc dữ liệu nội bộ của doanh nghiệp mà không cần huấn luyện lại (re-training).
- Bảo mật và cá nhân hóa: Bạn có thể cho AI đọc các tài liệu riêng tư (hợp đồng, hướng dẫn sử dụng nội bộ) để hỗ trợ công việc mà không lo dữ liệu đó bị lộ ra ngoài hay dùng để huấn luyện mô hình chung.

3. RAG liên quan gì đến Vector Database (Cơ sở dữ liệu Vector)?
- Để RAG hoạt động hiệu quả, hệ thống cần tìm đúng đoạn văn bản chứa thông tin cần thiết trong hàng triệu trang tài liệu chỉ trong vài mil giây. Đây là lúc Vector DB xuất hiện.
- Mối quan hệ này hoạt động như sau:
+ Embedding: Toàn bộ dữ liệu của bạn được chia nhỏ và chuyển đổi thành các dãy số (gọi là vector) đại diện cho ý nghĩa ngữ nghĩa.
+ Lưu trữ: Các vector này được lưu vào Vector Database (như Pinecone, Milvus, hay Weaviate).
+ Truy vấn (Retrieval): Khi bạn đặt câu hỏi, câu hỏi đó cũng được chuyển thành vector. Hệ thống sẽ vào Vector DB để tìm các đoạn văn bản có "vector gần giống nhất" với câu hỏi của bạn.
+ Tổng hợp (Generation): Các đoạn văn bản tìm được sẽ được gửi kèm với câu hỏi của bạn đến LLM để nó viết thành một câu trả lời hoàn chỉnh.

Ví dụ dễ hiểu: Nếu RAG là một bài kiểm tra "sách mở", thì Vector DB chính là mục lục siêu thông minh giúp bạn lật đúng trang sách chứa câu trả lời ngay lập tức thay vì phải đọc lại cả cuốn sách.

4. Quy trình vận hành của RAG
- Bước 1: Người dùng đặt câu hỏi.
- Bước 2: Hệ thống tìm kiếm thông tin liên quan đến câu hỏi trong Vector DB.
- Bước 3: Gộp thông tin tìm được + Câu hỏi gốc đưa vào LLM.
- Bước 4: LLM trả ra câu trả lời có độ chính xác cao.
