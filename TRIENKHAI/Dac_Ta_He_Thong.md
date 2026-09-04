# TÀI LIỆU ĐẶC TẢ BÀI TOÁN & THIẾT KẾ HỆ THỐNG
## HỆ THỐNG QUẢN TRỊ THƯ VIỆN HỒ SƠ TÀI LIỆU (HSTL) VÀ VĂN BẢN ĐIỆN TỬ
### Đơn vị áp dụng: TỔNG CÔNG TY ĐƯỜNG SẮT VIỆT NĂM (VNR)
**Phiên bản tài liệu:** v4.8  
**Ngày phát hành:** Năm 2026  
**Thư mục lưu trữ:** `/TRIENKHAI/Dac_Ta_He_Thong.md`

---

## MỤC LỤC
1. [TỔNG QUAN BÀI TOÁN & MỤC TIÊU XÂY DỰNG](#1-tổng-quan-bài-toán--mục-tiêu-xây-dựng)
2. [KIẾN TRÚC TỔNG THỂ & MÔ HÌNH HẠ TẦNG](#2-kiến-trúc-tổng-thể--mô-hình-hạ-tầng)
3. [ĐẶC TẢ CÁC PHÂN HỆ NGHIỆP VỤ CỐT LÕI](#3-đặc-tả-các-phân-hệ-nghiệp-vụ-cốt-lõi)
   - 3.1. Phân hệ Thư viện Hồ sơ Tài liệu Tổng hợp (HSTL 5 cấp & Kho lưu trữ vật lý)
   - 3.2. Phân hệ Cập nhật & Bổ sung Hồ sơ Tài liệu đã có
   - 3.3. Phân hệ Soạn thảo, Thẩm định phối hợp & Báo cáo kết quả
   - 3.4. Phân hệ Quản lý Sổ Văn bản Đến điện tử
   - 3.5. Phân hệ Quản lý Sổ Văn bản Đi điện tử
   - 3.6. Phân hệ Trợ lý AI Qwen 2.5 & Trò chuyện nội bộ
   - 3.7. Phân hệ Quản trị Hệ thống, Đổi màu nhận diện & Phân quyền
4. [MA TRẬN PHÂN QUYỀN TRUY CẬP (RBAC)](#4-ma-trận-phân-quyền-truy-cập-rbac)
5. [QUY CHUẨN SỐ HÓA, OCR & TÌM KIẾM TOÀN VĂN](#5-quy-chuẩn-số-hóa-ocr--tìm-kiếm-toàn-văn)
6. [MÔ HÌNH THỰC THỂ DỮ LIỆU (ERD)](#6-mô-hình-thực-thể-dữ-liệu-erd)
7. [HƯỚNG DẪN TRIỂN KHAI TRÊN MÁY CHỦ IIS & SQL SERVER](#7-hướng-dẫn-triển-khai-trên-máy-chủ-iis--sql-server)

---

## 1. TỔNG QUAN BÀI TOÁN & MỤC TIÊU XÂY DỰNG

### 1.1. Bối cảnh & Thực trạng nghiệp vụ
Tổng công ty Đường sắt Việt Nam là doanh nghiệp nhà nước quy mô lớn với mạng lưới đường sắt trải dài cả nước, quản lý hàng chục nghìn hồ sơ kỹ thuật kết cấu hạ tầng (cầu, hầm, đường ray, ga), hồ sơ an toàn chạy tàu, hồ sơ đầu tư toa xe - đầu máy, cùng hàng loạt văn bản điều hành, hợp đồng kinh tế và quy chuẩn kỹ thuật.

Trước đây, công tác lưu trữ gặp các khó khăn:
- Hồ sơ giấy phân tán tại nhiều kho lưu trữ vật lý, việc định vị chính xác cặp/hộp/kệ mất nhiều thời gian.
- Việc bổ sung tài liệu phát sinh vào các hồ sơ công trình kéo dài chưa có quy trình kiểm soát chặt chẽ.
- Quy trình lấy ý kiến thẩm định dự thảo giữa các Ban (Ban An toàn, Ban Vận tải, Ban Tài chính, Ban Đầu tư...) qua văn bản giấy gây chậm trễ tiến độ.
- Khó khăn trong việc tra cứu nhanh nội dung số hóa (OCR) và chưa tận dụng được công nghệ AI nội bộ để giải phóng sức lao động.

### 1.2. Mục tiêu hệ thống
1. **Số hóa & Quản trị tập trung**: Quản lý toàn bộ thư viện hồ sơ theo mô hình phân cấp logic 5 cấp gắn liền với vị trí kho lưu trữ vật lý (Kho, Dãy, Kệ, Tầng, Hộp).
2. **Quy trình thẩm định khép kín**: Xây dựng luồng phối hợp thẩm định dự thảo điện tử xuyên suốt giữa chuyên viên, trưởng phòng và lãnh đạo phê duyệt.
3. **Quản lý văn bản điện tử chuyên nghiệp**: Quản lý toàn diện Sổ văn bản đến và Sổ văn bản đi, tích hợp chữ ký số và phân luồng chỉ đạo.
4. **Tích hợp Trợ lý AI Qwen 2.5 cục bộ**: Chạy trên máy chủ IIS qua Ollama, bảo mật tuyệt đối 100% dữ liệu nội bộ, cho phép tìm kiếm RAG theo từ khóa, số hiệu và trích yếu.
5. **Giao diện hiện đại phong cách Windows 12**: Tinh gọn, trực quan, hỗ trợ tùy biến màu sắc nhận diện thương hiệu tức thì và tối ưu responsive hoàn hảo trên mọi thiết bị máy tính, máy tính bảng và điện thoại di động.

---

## 2. KIẾN TRÚC TỔNG THỂ & MÔ HÌNH HẠ TẦNG

```
+-------------------------------------------------------------------------+
|                  GIAO DIỆN NGƯỜI DÙNG (WINDOWS 12 SHELL)                |
|  - Desktop / Tablet / Mobile Responsive Web App (React 18 + Tailwind)   |
|  - Tùy biến màu sắc nhận diện (Primary Accent & Dynamic Backgrounds)    |
+------------------------------------+------------------------------------+
                                     | (HTTPS / REST API / WebSockets)
                                     v
+-------------------------------------------------------------------------+
|                CỔNG DỊCH VỤ ỨNG DỤNG (WEB SERVER IIS)                   |
|  - Reverse Proxy / URL Rewrite / Application Request Routing            |
|  - Node.js Service / Express API Backend                                |
|  - Dịch vụ xác thực tập trung & Phân quyền RBAC                         |
|  - Dịch vụ Socket nhắn tin trực tuyến thời gian thực                    |
+-------------------+--------------------------------+--------------------+
                    |                                |
                    v                                v
+-----------------------------------+  +----------------------------------+
|    CƠ SỞ DỮ LIỆU QUAN HỆ          |  |       MÁY CHỦ AI CỤC BỘ          |
|    MICROSOFT SQL SERVER           |  |       (OLLAMA - QWEN 2.5)        |
|  - Bảng người dùng, phân quyền    |  |  - Mô hình ngôn ngữ lớn Qwen 2.5 |
|  - Danh mục HSTL 5 cấp & Kho lưu  |  |  - Tra cứu ngữ nghĩa & RAG HSTL  |
|  - Sổ Văn bản Đến & Văn bản Đi    |  |  - Phân tích tóm tắt hồ sơ số hóa|
|  - Hồ sơ dự thảo & Thẩm định      |  |  - Offline an toàn thông tin     |
|  - Nhật ký truy vết Audit Logs    |  +----------------------------------+
+-----------------------------------+
```

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, thiết kế lấy cảm hứng từ Windows 12 Fluent Design.
- **Backend API**: Node.js REST API chạy trên máy chủ Windows Server với Internet Information Services (IIS).
- **Database**: Microsoft SQL Server (tương thích SQL Server 2016, 2019, 2022).
- **AI Engine**: Ollama hosting model `Qwen 2.5:7b-instruct` / `Qwen 2.5:14b-instruct` tại mạng LAN nội bộ.

---

## 3. ĐẶC TẢ CÁC PHÂN HỆ NGHIỆP VỤ CỐT LÕI

### 3.1. Phân hệ Thư viện Hồ sơ Tài liệu Tổng hợp (HSTL)
- **Cấu trúc phân cấp cây thư mục 5 cấp**:
  - *Cấp 1*: Cơ quan / Tổng công ty (`agency`)
  - *Cấp 2*: Khối / Lĩnh vực nghiệp vụ (`block`: Khối Vận tải, Khối Hạ tầng, Khối Kỹ thuật, Khối Tài chính...)
  - *Cấp 3*: Ban / Phòng ban chuyên môn (`department`: Ban Vận tải, Ban Quản lý Kết cấu, Ban Kế hoạch...)
  - *Cấp 4*: Cặp / Hộp / Khay lưu trữ (`box`: Hộp tài liệu an toàn, Hộp hồ sơ nghiệm thu...)
  - *Cấp 5*: Hồ sơ / Văn bản thực tế (`document/dossier`: Chứa tệp đính kèm PDF số hóa, văn bản giấy và metadata)
- **Quản lý vị trí lưu trữ vật lý**:
  - Gắn mã vị trí: `Kho -> Dãy -> Kệ -> Tầng -> Hộp`.
  - Giúp thủ kho và văn thư tìm thấy bản gốc chỉ trong 30 giây khi cần phục vụ thanh tra, kiểm toán.
- **Xem trước tài liệu đa chế độ**:
  - Chế độ xem PDF trực quan.
  - Chế độ xem dữ liệu trích xuất văn bản OCR nhận diện tự động.
  - Chế độ xem Metadata hành chính: Số ký hiệu, ngày ban hành, độ mật, thời hạn bảo quản (Vĩnh viễn, 50 năm, 20 năm, 5 năm).
  - Quản lý lịch sử các phiên bản sửa đổi (Version History).

### 3.2. Phân hệ Cập nhật & Bổ sung Hồ sơ Tài liệu đã có
- Cho phép chuyên viên tìm kiếm hồ sơ đã có trong thư viện và gửi yêu cầu bổ sung văn bản/chứng từ mới phát sinh.
- Luồng duyệt bổ sung: Chuyên viên tải file -> Trưởng phòng phê duyệt chấp thuận -> Hệ thống tự động đồng bộ tài liệu vào hồ sơ gốc và ghi nhật ký truy vết (`AuditLogs`).

### 3.3. Phân hệ Soạn thảo, Thẩm định phối hợp & Báo cáo kết quả
- **Quy trình nghiệp vụ 4 bước**:
  1. *Khởi tạo dự thảo*: Chuyên viên phòng chủ trì nhập trích yếu, nội dung dự thảo, đính kèm file soạn thảo (DOCX, PDF) và chọn danh sách các phòng ban phối hợp thẩm định.
  2. *Thẩm định phối hợp*: Chuyên viên/Trưởng phòng các phòng ban phối hợp đăng nhập, xem hồ sơ dự thảo và nhập ý kiến thẩm định (Đồng ý, Đề nghị chỉnh sửa, Không đồng ý) kèm văn bản góp ý.
  3. *Tổng hợp & Hoàn thiện*: Chuyên viên phòng chủ trì tiếp thu ý kiến, cập nhật bản dự thảo hoàn chỉnh.
  4. *Lãnh đạo phê duyệt*: Lãnh đạo Tổng công ty xem báo cáo tổng hợp, ký duyệt điện tử và chuyển Văn thư ban hành.

### 3.4. Phân hệ Quản lý Sổ Văn bản Đến điện tử
- Tiếp nhận văn bản đến từ các cơ quan bên ngoài (Bộ Giao thông Vận tải, Ủy ban Quản lý Vốn, Cục Đường sắt...).
- Tự động sinh số đến liên tục theo năm.
- Ghi nhận đầy đủ: Số đến, Ngày đến, Số ký hiệu gốc, Ngày ban hành, Cơ quan ban hành, Trích yếu, Độ khẩn (Hỏa tốc, Thượng khẩn, Khẩn, Bình thường), Thời hạn xử lý.
- Phân công lãnh đạo chỉ đạo và phòng ban chủ trì thụ lý.
- Đính kèm file quét scan tài liệu gốc.

### 3.5. Phân hệ Quản lý Sổ Văn bản Đi điện tử
- Quản lý văn bản do Tổng công ty và các Ban phát hành.
- Cấp số đi tự động theo danh mục sổ văn bản (Quyết định, Công văn, Kế hoạch, Thông báo...).
- Theo dõi người ký duyệt, nơi nhận bên ngoài, nơi nhận nội bộ và trạng thái phát hành (Đã gửi bưu điện, Đã gửi trục liên thông, Đã lưu trữ).

### 3.6. Phân hệ Trợ lý AI Qwen 2.5 & Trò chuyện nội bộ
- **Trợ lý AI Qwen 2.5 (RAG)**:
  - Tích hợp cục bộ qua Ollama API (Zero internet leak).
  - Hỗ trợ người dùng tra cứu toàn văn: *"Tìm các quyết định về an toàn chạy tàu ban hành trong năm 2025"*, *"Hợp đồng nâng cấp tuyến Hà Nội - Hải Phòng lưu ở hộp nào?"*.
  - Tự động trích dẫn số ký hiệu, ngày ban hành và vị trí lưu trữ vật lý.
- **Trò chuyện nội bộ (Messenger)**:
  - Cho phép cán bộ trao đổi công việc theo thời gian thực.
  - Hỗ trợ tính năng đặc biệt: **Gửi đính kèm trực tiếp Hồ sơ/Văn bản** từ Thư viện vào khung trò chuyện để người nhận bấm vào xem ngay mà không cần tìm kiếm lại.

### 3.7. Phân hệ Quản trị Hệ thống, Nhận diện thương hiệu & Phân quyền
- **Đồng bộ màu sắc nhận diện tức thì (Theme Synchronization)**:
  - Quản trị viên hoặc người dùng chọn màu nhận diện (Xanh Đường Sắt VNR, Cobalt Blue, Royal Navy, Ocean Deep...).
  - Toàn bộ giao diện: Trang đăng nhập, thanh Header, các Tab đang chọn trong "Danh Mục Nghiệp Vụ", biểu tượng thanh Taskbar di động và các nút bấm chính sẽ đồng bộ cùng một sắc xanh chuyên nghiệp.
- **Quản lý danh mục**: Đơn vị ban hành, Phòng ban, Vị trí kho lưu trữ.
- **Sao lưu & Phục hồi dữ liệu**: Xuất tệp sao lưu JSON/SQL và khôi phục hệ thống khi cần.

---

## 4. MA TRẬN PHÂN QUYỀN TRUY CẬP (RBAC)

| Chức năng / Phân hệ | Quản trị viên (ADMIN) | Lãnh đạo (LANH_DAO) | Trưởng phòng (TRUONG_PHONG) | Văn thư (VAN_THU) | Chuyên viên (CHUYEN_VIEN) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Xem Thư viện HSTL** | Toàn quyền | Toàn quyền | Xem phòng & toàn công ty | Toàn quyền | Xem phòng ban mình |
| **Thêm / Sửa hồ sơ tài liệu** | Toàn quyền | Xem / Góp ý | Duyệt nội dung phòng | Cấp số / Lưu trữ | Tạo mới hồ sơ phòng |
| **Xóa hồ sơ trong thư viện** | Toàn quyền | Không | Không | Không | Không |
| **Sổ Văn bản Đến** | Quản trị | Chỉ đạo xử lý | Xem & phân công CV | Vào sổ, quét file | Xem văn bản được giao |
| **Sổ Văn bản Đi** | Quản trị | Phê duyệt ký | Soát xét dự thảo | Cấp số, đóng dấu, phát hành | Soạn thảo tờ trình |
| **Thẩm định dự thảo** | Xem audit | Phê duyệt cuối | Cho ý kiến thẩm định | Cấp số lưu | Khởi tạo, tiếp thu |
| **Quản trị người dùng & Kho**| Toàn quyền | Xem báo cáo | Xem nhân sự phòng | Xem danh mục kho | Không |
| **Cài đặt màu nhận diện** | Toàn quyền | Được chọn | Được chọn | Được chọn | Được chọn |

---

## 5. QUY CHUẨN SỐ HÓA, OCR & TÌM KIẾM TOÀN VĂN

1. **Định dạng file số hóa**:
   - File chính thức: PDF/A tiêu chuẩn lưu trữ dài hạn (ISO 19005).
   - Độ phân giải quét: Tối thiểu 300 DPI, màu đen trắng hoặc thang xám (Grayscale), quét màu đối với tài liệu có dấu đỏ và chữ ký tươi.
2. **Nhận diện ký tự quang học (OCR)**:
   - Ngôn ngữ: Tiếng Việt (bộ gõ Unicode dựng sẵn).
   - Lưu trữ văn bản thô (Raw OCR text) vào cột `OcrContent` kiểu `NVARCHAR(MAX)` trong SQL Server để hỗ trợ tìm kiếm toàn văn (`CONTAINS`, `FREETEXT` hoặc Full-Text Catalog).
3. **Mã hóa đường dẫn vật lý**:
   - Lưu file theo cấu trúc thư mục logic: `/Storage/HSTL/[Năm]/[MãKhối]/[MãPhòng]/[MãHồSơ]/[MãTàiLiệu].pdf`.

---

## 6. MÔ HÌNH THỰC THỂ DỮ LIỆU (ERD)

Các bảng chính trong Cơ sở dữ liệu SQL Server:
- `Users`: Thông tin tài khoản, vai trò, mật khẩu hash, ảnh đại diện.
- `Departments`: Danh mục phòng ban và khối trực thuộc.
- `PhysicalLocations`: Vị trí kho vật lý (Kho, Dãy, Kệ, Tầng, Hộp).
- `DossierFolders`: Cây hồ sơ tài liệu 5 cấp.
- `DossierDocuments`: Văn bản chi tiết trong hồ sơ kèm nội dung OCR.
- `IncomingDocuments`: Sổ văn bản đến.
- `OutgoingDocuments`: Sổ văn bản đi.
- `DraftDossiers`: Hồ sơ dự thảo xin ý kiến thẩm định.
- `DraftAppraisals`: Ý kiến đóng góp thẩm định của từng phòng ban.
- `ChatMessages`: Tin nhắn trao đổi công việc nội bộ và hồ sơ đính kèm.
- `AuditLogs`: Nhật ký thao tác hệ thống phục vụ an toàn an ninh.
- `SystemSettings`: Cấu hình nhận diện thương hiệu (Màu sắc chủ đạo, logo, tên cơ quan).

---

## 7. HƯỚNG DẪN TRIỂN KHAI TRÊN MÁY CHỦ IIS & SQL SERVER

### 7.1. Chuẩn bị Cơ sở dữ liệu Microsoft SQL Server
1. Mở công cụ **SQL Server Management Studio (SSMS)**.
2. Kết nối tới SQL Server instance của cơ quan.
3. Mở file script `/TRIENKHAI/Script_Database_SQLServer.sql`.
4. Bấm **Execute** (F5) để khởi tạo toàn bộ Database `QL_HSTL_VNR`, các bảng, ràng buộc khóa ngoại, chỉ mục (Indexes), Trigger và bộ dữ liệu mẫu khởi tạo.

### 7.2. Cấu hình Backend trên IIS
1. Cài đặt **Node.js (LTS)** và **IIS URL Rewrite Module** trên Windows Server.
2. Cài đặt **IIS ARR (Application Request Routing)** nếu dùng IIS làm Reverse Proxy.
3. Cấu hình chuỗi kết nối (Connection String) trong file `.env`:
   ```env
   DB_SERVER=localhost
   DB_NAME=QL_HSTL_VNR
   DB_USER=sa
   DB_PASSWORD=YourStrongPasswordHere
   PORT=3000
   OLLAMA_HOST=http://127.0.0.1:11434
   ```
4. Chạy dịch vụ Node.js qua PM2 hoặc Windows Service (`node-windows`).

### 7.3. Triển khai AI Ollama Qwen 2.5
1. Tải và cài đặt Ollama trên máy chủ Windows Server: `https://ollama.com/download`.
2. Mở Command Prompt chạy lệnh:
   ```bash
   ollama pull qwen2.5:7b-instruct
   ollama run qwen2.5:7b-instruct
   ```
3. Cấu hình biến môi trường hệ thống `OLLAMA_HOST=0.0.0.0:11434` để cho phép ứng dụng web kết nối nội bộ.
