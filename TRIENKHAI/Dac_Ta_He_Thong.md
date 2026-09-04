# TÀI LIỆU ĐẶC TẢ BÀI TOÁN & THIẾT KẾ HỆ THỐNG
## HỆ THỐNG QUẢN TRỊ THƯ VIỆN HỒ SƠ TÀI LIỆU (HSTL) VÀ VĂN BẢN ĐIỆN TỬ
### Đơn vị áp dụng: TỔNG CÔNG TY ĐƯỜNG SẮT VIỆT NAM (VNR)
**Phiên bản tài liệu:** v5.0 (Bản Đặc tả Chi tiết Quy trình Nghiệp vụ Toàn diện)  
**Ngày phát hành:** Năm 2026  
**Thư mục lưu trữ:** `/TRIENKHAI/Dac_Ta_He_Thong.md`

---

## MỤC LỤC
1. [TỔNG QUAN BÀI TOÁN & MỤC TIÊU XÂY DỰNG](#1-tổng-quan-bài-toán--mục-tiêu-xây-dựng)
2. [KIẾN TRÚC TỔNG THỂ & MÔ HÌNH HẠ TẦNG](#2-kiến-trúc-tổng-thể--mô-hình-hạ-tầng)
3. [ĐẶC TẢ CHI TIẾT CÁC LUỒNG NGHIỆP VỤ HỆ THỐNG (SYSTEM WORKFLOWS)](#3-đặc-tả-chi-tiết-các-luồng-nghiệp-vụ-hệ-thống-system-workflows)
   - 3.1. Luồng 1: Quy trình Quản lý, Số hóa và Lưu trữ Thư viện HSTL 5 cấp
   - 3.2. Luồng 2: Quy trình Cập nhật & Bổ sung Hồ sơ Tài liệu đã có
   - 3.3. Luồng 3: Quy trình Soạn thảo, Thẩm định phối hợp liên phòng ban & Báo cáo kết quả
   - 3.4. Luồng 4: Quy trình Tiếp nhận & Xử lý Sổ Văn bản Đến điện tử
   - 3.5. Luồng 5: Quy trình Soạn thảo, Ký số & Phát hành Sổ Văn bản Đi điện tử
   - 3.6. Luồng 6: Quy trình Tra cứu Trợ lý AI Qwen 2.5 (RAG nội bộ) & Trò chuyện đính kèm hồ sơ
   - 3.7. Luồng 7: Quy trình Quản trị Phân quyền (RBAC), Nhận diện thương hiệu & Kiểm toán an toàn
4. [MA TRẬN PHÂN QUYỀN TRUY CẬP (RBAC) THEO 5 VAI TRÒ](#4-ma-trận-phân-quyền-truy-cập-rbac-theo-5-vai-trò)
5. [QUY CHUẨN SỐ HÓA, OCR & TÌM KIẾM TOÀN VĂN](#5-quy-chuẩn-số-hóa-ocr--tìm-kiếm-toàn-văn)
6. [MÔ HÌNH THỰC THỂ DỮ LIỆU (ERD) & CẤU TRÚC LƯU TRỮ](#6-mô-hình-thực-thể-dữ-liệu-erd--cấu-trúc-lưu-trữ)
7. [HƯỚNG DẪN TRIỂN KHAI TRÊN MÁY CHỦ IIS & SQL SERVER](#7-hướng-dẫn-triển-khai-trên-máy-chủ-iis--sql-server)

---

## 1. TỔNG QUAN BÀI TOÁN & MỤC TIÊU XÂY DỰNG

### 1.1. Bối cảnh & Thực trạng nghiệp vụ tại Tổng công ty Đường sắt Việt Nam
Tổng công ty Đường sắt Việt Nam (VNR) là doanh nghiệp nhà nước đặc thù quản lý mạng lưới kết cấu hạ tầng đường sắt quốc gia dài hơn 3.100 km qua 34 tỉnh, thành phố. Khối lượng hồ sơ tài liệu phát sinh vô cùng lớn, bao gồm:
- Hồ sơ kỹ thuật hoàn công các công trình cầu, đường ray, hầm, hệ thống thông tin tín hiệu, nhà ga qua nhiều thời kỳ lịch sử.
- Hồ sơ đầu tư, mua sắm nâng cấp đầu máy, toa xe, phương tiện động lực và thiết bị cứu viện.
- Hệ thống văn bản quy phạm nội bộ, quy chuẩn kỹ thuật an toàn chạy tàu, biểu đồ chạy tàu hàng năm.
- Hồ sơ đất đai, giải phóng mặt bằng, hành lang an toàn giao thông đường sắt.
- Hàng chục nghìn văn bản đến, văn bản đi, hợp đồng kinh tế và hồ sơ tài chính quyết toán.

**Những tồn tại trong công tác lưu trữ truyền thống:**
1. **Phân tán & Khó định vị**: Tài liệu giấy nằm tại nhiều kho rải rác (Hà Nội, Đà Nẵng, TP. Hồ Chí Minh). Việc tra tìm tài liệu gốc phục vụ kiểm toán, thanh tra mất từ vài giờ đến nhiều ngày do thiếu định vị chính xác vị trí Hộp/Kệ lưu trữ.
2. **Khó kiểm soát cập nhật bổ sung**: Các công trình đường sắt kéo dài nhiều năm liên tục phát sinh phụ lục, biên bản kiểm tra, tài liệu bổ sung thường bị thất lạc hoặc không đồng bộ vào hồ sơ gốc.
3. **Quy trình thẩm định dự thảo thủ công**: Việc xin ý kiến thẩm định giữa các Ban (Ban Vận tải, Ban An toàn, Ban Kết cấu hạ tầng, Ban Tài chính...) luân chuyển văn bản giấy mất nhiều ngày, khó theo dõi tiến độ phản hồi và tổng hợp giải trình.
4. **Chưa số hóa toàn diện**: Tìm kiếm chỉ dựa vào tiêu đề văn bản, chưa hỗ trợ nhận dạng ký tự quang học (OCR) toàn văn và chưa có Trợ lý AI hỗ trợ trích xuất nhanh thông tin chính xác.

### 1.2. Mục tiêu hệ thống
- **Quản trị số hóa tập trung**: Quản lý toàn bộ thư viện hồ sơ theo mô hình phân cấp logic 5 cấp (Cơ quan -> Khối -> Ban/Phòng -> Hộp lưu trữ -> Hồ sơ/Văn bản) gắn liền 1-1 với tọa độ kho vật lý (Kho -> Dãy -> Kệ -> Tầng -> Hộp).
- **Quy trình thẩm định khép kín**: Xây dựng luồng phối hợp thẩm định dự thảo điện tử xuyên suốt giữa chuyên viên lập dự thảo, các phòng ban thẩm định, trưởng phòng soát xét và lãnh đạo phê duyệt.
- **Sổ Văn bản Đến & Văn bản Đi điện tử**: Tự động sinh số liên tục, quản lý toàn diện luồng bút phê chỉ đạo của Lãnh đạo, kiểm soát thời hạn thụ lý và phát hành văn bản có chữ ký số.
- **Trợ lý AI Qwen 2.5 cục bộ (RAG)**: Chạy offline hoàn toàn trên máy chủ IIS/Windows Server nội bộ, bảo mật 100% dữ liệu ngành đường sắt, tra cứu toàn văn thông minh.
- **Giao diện Windows 12 Shell**: Trực quan, tinh gọn, hỗ trợ đổi màu nhận diện tức thì và tối ưu responsive hoàn hảo trên máy tính để bàn, máy tính bảng và điện thoại thông minh.

---

## 2. KIẾN TRÚC TỔNG THỂ & MÔ HÌNH HẠ TẦNG

```
+-------------------------------------------------------------------------+
|                  GIAO DIỆN NGƯỜI DÙNG (WINDOWS 12 SHELL)                |
|  - Thiết kế Fluent Design: Mica backdrop, bo góc tinh tế, chuyển động mượt |
|  - Tùy biến màu nhận diện tức thì: Primary Accent, Theme Sync toàn hệ thống|
|  - Đáp ứng đa nền tảng: Desktop PC, Laptop, Tablet, Mobile Responsive    |
+------------------------------------+------------------------------------+
                                     | (HTTPS / RESTful API / WebSockets)
                                     v
+-------------------------------------------------------------------------+
|                CỔNG DỊCH VỤ ỨNG DỤNG (WEB SERVER IIS)                   |
|  - Internet Information Services (IIS) + URL Rewrite & ARR Proxy        |
|  - Node.js Service (Express API Backend, ESM Runtime)                   |
|  - Bộ lọc xác thực JWT & Phân quyền RBAC (Role-Based Access Control)   |
|  - Bộ xử lý lưu trữ tệp số hóa & OCR Streaming Engine                   |
|  - Kênh trao đổi trực tuyến Socket.io nội bộ                            |
+-------------------+--------------------------------+--------------------+
                    |                                |
                    v                                v
+-----------------------------------+  +----------------------------------+
|    CƠ SỞ DỮ LIỆU QUAN HỆ          |  |       MÁY CHỦ AI CỤC BỘ          |
|    MICROSOFT SQL SERVER           |  |       (OLLAMA - QWEN 2.5)        |
|  - Phân quyền & Tài khoản Users   |  |  - Host: Localhost port 11434    |
|  - Danh mục HSTL 5 cấp & Kho lưu  |  |  - Model: Qwen 2.5:7b-instruct   |
|  - Sổ Văn bản Đến & Văn bản Đi    |  |  - RAG: Tìm kiếm ngữ nghĩa tài   |
|  - Luồng Dự thảo & Thẩm định      |  |    liệu kỹ thuật, an toàn chạy tàu|
|  - Trích xuất văn bản OCR Content |  |  - Trích dẫn số ký hiệu, vị trí |
|  - Bảng AuditLogs truy vết 100%   |  |  - 100% Không gửi ra ngoài LAN   |
+-----------------------------------+  +----------------------------------+
```

---

## 3. ĐẶC TẢ CHI TIẾT CÁC LUỒNG NGHIỆP VỤ HỆ THỐNG (SYSTEM WORKFLOWS)

---

### 3.1. LUỒNG 1: QUY TRÌNH QUẢN LÝ, SỐ HÓA, PHÊ DUYỆT VÀ LƯU TRỮ THƯ VIỆN HSTL 5 CẤP

#### A. Mục đích
Thiết lập quy trình số hóa chuẩn hóa, chặt chẽ từ lúc tiếp nhận tài liệu giấy/bản scan, nhận diện ký tự quang học (OCR), lập hồ sơ, **bắt buộc qua bước Trưởng phòng chuyên môn thẩm định, phê duyệt / trả lại / chuyển phối hợp và phân định độ bảo mật**, trước khi chuyển cho Văn thư cơ quan kiểm tra bản cứng có dấu đỏ pháp lý và nạp lưu trữ Thư viện HSTL 5 cấp.

#### B. Tác nhân tham gia (Actors)
- **Chuyên viên nghiệp vụ (Lập hồ sơ)**:
  - Tiếp nhận tài liệu, thực hiện quét scan/OCR, cập nhật metadata ban đầu.
  - Phân loại bước đầu: Tài liệu đã có dấu đỏ hoặc tài liệu dự thảo chưa có dấu.
  - Chọn Trưởng phòng thẩm tra và gửi hồ sơ vào hàng đợi phê duyệt.
- **Trưởng phòng chuyên môn (Cổng kiểm soát phê duyệt - Gatekeeper)**:
  - Kiểm tra tính đầy đủ, chính xác, tính pháp lý của hồ sơ.
  - Ra quyết định: (1) Phê duyệt; (2) Trả lại yêu cầu chỉnh sửa; (3) Chuyển phối hợp thẩm định liên phòng ban.
  - **Phân định cấp độ bảo mật hồ sơ khi đưa vào Thư viện HSTL**:
    - *TÀI LIỆU THƯỜNG*: Mọi cán bộ, người dùng trong toàn Tổng công ty đều có quyền tra cứu, xem hồ sơ.
    - *TÀI LIỆU MẬT*: Bắt buộc chỉ định cụ thể danh sách Phòng ban hoặc các User đích danh được phép truy cập. Mọi tài khoản khác ngoài danh sách sẽ bị khóa quyền xem và hiển thị cảnh báo bảo mật.
- **Lãnh đạo Tổng công ty / Đơn vị**:
  - Ký tươi / ký số văn bản đối với các tài liệu dự thảo chưa có dấu sau khi Trưởng phòng đã phê duyệt.
- **Văn thư cơ quan / Thủ kho (Quyền nạp lưu HSTL duy nhất)**:
  - Tiếp nhận bản in có chữ ký Lãnh đạo và đóng dấu đỏ pháp lý.
  - Lựa chọn Thời hạn bảo quản theo quy định lưu trữ ngành đường sắt (Vĩnh viễn, 70 năm, 50 năm, 20 năm, 10 năm, 5 năm).
  - Định vị tọa độ xếp kho vật lý chuẩn 5 cấp (Kho -> Dãy -> Kệ -> Tầng -> Hộp).
  - Xác nhận nạp hồ sơ chính thức vào Thư viện HSTL điện tử.

#### C. Biểu đồ luồng nghiệp vụ chi tiết (Detailed Flowchart)
```
[CHUYÊN VIÊN: Tiếp nhận tài liệu & Số hóa Scan/OCR]
                       |
                       v
[CHUYÊN VIÊN: Nhập Metadata, chọn loại văn bản & Độ mật ban đầu]
                       |
                       v
[CHUYÊN VIÊN: Bấm "Trình Trưởng phòng Phê duyệt"]
  - Chuyển trạng thái sang: PENDING_REVIEW (Chờ Trưởng phòng duyệt)
                       |
                       v
+-----------------------------------------------------------------------------------+
|               BƯỚC KIỂM SOÁT BẮT BUỘC: TRƯỞNG PHÒNG THẨM TRA & PHÊ DUYỆT          |
|  - Trưởng phòng kiểm tra hồ sơ, nội dung trích xuất OCR, tính pháp lý            |
|  - Phân định độ bảo mật chính thức:                                              |
|      + THƯỜNG: Tất cả cán bộ toàn Tổng công ty có quyền xem trong HSTL            |
|      + MẬT: Trưởng phòng tích chọn đích danh Phòng ban hoặc các User được xem     |
+------------------------------------+----------------------------------------------+
                                     |
         +---------------------------+---------------------------+
         | (1) Trả lại               | (2) Phối hợp              | (3) Phê duyệt
         v                           v                           v
[TRẢ LẠI CHUYÊN VIÊN]       [CHUYỂN PHỐI HỢP]           [XÉT DUYỆT LOẠI TÀI LIỆU]
(Yêu cầu sửa đổi, bổ sung)  (Gửi các Ban thẩm định)              |
                                                     +-----------+-----------+
                                                     | (Có dấu)              | (Chưa có dấu)
                                                     v                       v
                                            [CHUYỂN THẲNG VĂN THƯ]  [IN PHIẾU TRÌNH LÃNH ĐẠO]
                                                     |                       |
                                                     |                       v
                                                     |              [LÃNH ĐẠO KÝ TƯƠI]
                                                     |                       |
                                                     |                       v
                                                     |              [VĂN THƯ ĐÓNG DẤU ĐỎ]
                                                     |                       |
                                                     |                       v
                                                     |              [SCAN BẢN CÓ DẤU ĐỎ]
                                                     |                       |
                                                     +-----------+-----------+
                                                                 |
                                                                 v
                                            [VĂN THƯ CƠ QUAN TIẾP NHẬN BẢN CỨNG DẤU ĐỎ]
                                              - Kiểm tra con dấu đỏ và chữ ký đầy đủ
                                              - Chọn Thời hạn bảo quản (Vĩnh viễn -> 5 năm)
                                              - Định vị Tọa độ kho 5 cấp (Kho/Dãy/Kệ/Tầng/Hộp)
                                                                 |
                                                                 v
                                            [VĂN THƯ BẤM: NẠP VÀO THƯ VIỆN HSTL]
                                              - Trạng thái chuyển sang: HSTL_ARCHIVED
                                              - Đồng bộ vào Thư viện HSTL
                                              - Áp dụng phân quyền xem Thường / Mật
                                              - Ghi vết AuditLogs hệ thống
```

#### D. Các bước thực hiện chi tiết
1. **Bước 1 - Tiếp nhận, Quét số hóa & OCR tự động**:
   - Chuyên viên tải lên tệp PDF hoặc ảnh chụp hồ sơ gốc.
   - Hệ thống tự động kích hoạt Engine OCR tiếng Việt, bóc tách Số ký hiệu, Đơn vị ban hành, Ngày ký, Trích yếu và nội dung toàn văn.
2. **Bước 2 - Lập hồ sơ & Nhập Metadata**:
   - Chuyên viên xác nhận văn bản thuộc dạng:
     - *Bản scan đã có con dấu đỏ và chữ ký* (văn bản đến, quyết định đã ban hành).
     - *Bản dự thảo chưa có dấu* (tờ trình, phương án đang xin duyệt).
   - Nhập trích yếu, chọn loại văn bản, chọn độ bảo mật ban đầu (Thường / Mật).
   - Chọn Trưởng phòng phụ trách thụ lý thẩm định và nhập ý kiến trình phê duyệt.
3. **Bước 3 - Trình duyệt (Chuyển trạng thái Chờ duyệt)**:
   - Chuyên viên bấm nút **"Gửi Trình Trưởng Phòng Phê Duyệt"**.
   - Hồ sơ được cấp mã định danh `hstl-ex-...`, trạng thái chuyển sang **`PENDING_REVIEW`** (Chờ Trưởng phòng thẩm tra).
4. **Bước 4 (CỔNG KIỂM SOÁT QUAN TRỌNG) - Trưởng phòng Thẩm tra, Phê duyệt / Trả lại / Chuyển phối hợp**:
   - Trưởng phòng đăng nhập, mở modal **"Thẩm Định & Phê Duyệt Hồ Sơ Lưu Trữ"**.
   - Trưởng phòng kiểm tra tệp PDF, nội dung OCR và trích yếu.
   - **Xử lý 3 nhánh nghiệp vụ**:
     - *Nhánh A - Phê duyệt*: Trưởng phòng nhập ý kiến phê chuẩn, tiến hành **phân định cấp độ bảo mật**:
       - Chọn **TÀI LIỆU THƯỜNG**: Hồ sơ mở cho toàn bộ người dùng tra cứu khi vào HSTL.
       - Chọn **TÀI LIỆU MẬT**: Hệ thống hiển thị danh mục các Phòng ban (Ban Kỹ thuật, Ban Vận tải, Ban An toàn...) và danh sách toàn bộ cán bộ công nhân viên. Trưởng phòng tích chọn các phòng ban hoặc tài khoản user được phép xem.
     - *Nhánh B - Trả lại*: Nhập lý do yêu cầu chỉnh sửa, hệ thống trả hồ sơ về cho Chuyên viên thụ lý.
     - *Nhánh C - Chuyển phối hợp*: Lựa chọn các phòng ban chức năng phối hợp thẩm định chuyên môn trước khi đưa ra quyết định cuối cùng.
5. **Bước 5 - Ký Lãnh đạo và Đóng dấu pháp lý (Đối với tài liệu chưa có dấu)**:
   - Nếu là tài liệu dự thảo chưa có dấu: Sau khi Trưởng phòng duyệt, Chuyên viên in phiếu trình kèm hồ sơ trình Lãnh đạo Tổng công ty ký tươi.
   - Văn thư cơ quan kiểm tra, đóng con dấu đỏ của Tổng công ty và tiến hành quét scan bản tài liệu chính thức có dấu đỏ đưa lên hệ thống.
6. **Bước 6 - Văn thư cơ quan Tiếp nhận bản cứng có dấu đỏ, Định vị kho 5 cấp & Lưu Thư viện HSTL**:
   - Cán bộ Văn thư mở modal **"Văn Thư Tiếp Nhận & Lưu Trữ Thư Viện HSTL"**.
   - Đối chiếu bản cứng có chữ ký sống và con dấu đỏ.
   - Chọn **Thời hạn bảo quản**: `VĨNH VIỄN`, `70 NĂM`, `50 NĂM`, `20 NĂM`, `10 NĂM`, `5 NĂM`.
   - Chọn **Tọa độ vị trí kho lưu trữ 5 cấp**:
     - Cấp 1: *Kho lưu trữ* (VD: Kho 118 Lê Duẩn)
     - Cấp 2: *Dãy* (VD: Dãy A)
     - Cấp 3: *Kệ* (VD: Kệ 02)
     - Cấp 4: *Tầng* (VD: Tầng 3)
     - Cấp 5: *Mã Hộp/Cặp lưu trữ* (VD: Hộp KT-2026-15)
   - Tích chọn cam kết: *"Đã tiếp nhận và đối chiếu bản in có đầy đủ chữ ký Lãnh đạo và con dấu đỏ pháp lý"*.
   - Bấm **"Xác nhận đưa vào Thư viện HSTL"**.
7. **Bước 7 - Cập nhật Thư viện & Thực thi Phân quyền Truy cập**:
   - Trạng thái chuyển thành **`HSTL_ARCHIVED`**. Hồ sơ lập tức hiển thị trong **Thư viện HSTL Tổng hợp**.
   - **Thực thi phân quyền truy cập**:
     - Nếu là `THƯỜNG`: Tất cả nhân viên tra cứu tìm kiếm đều mở xem được tệp scan và OCR.
     - Nếu là `MẬT`: Khi người dùng không thuộc danh sách được chỉ định bấm vào xem, hệ thống kích hoạt modal cảnh báo bảo mật: *"TÀI LIỆU MẬT - Bạn không có quyền truy cập văn bản này theo chỉ định của Trưởng phòng"*. Quyền tải tệp và xem trước bị chặn hoàn toàn.

---

### 3.2. LUỒNG 2: QUY TRÌNH CẬP NHẬT & BỔ SUNG HỒ SƠ TÀI LIỆU ĐÃ CÓ

#### A. Mục đích
Cho phép các phòng ban bổ sung các văn bản, phụ lục hợp đồng, biên bản kiểm tra phát sinh vào một hồ sơ đã lưu trữ từ trước mà không làm sai lệch tính nguyên bản và toàn vẹn của hồ sơ ban đầu.

#### B. Tác nhân tham gia
- **Chuyên viên đề xuất**: Người có nhu cầu bổ sung tài liệu mới vào hồ sơ.
- **Trưởng phòng chuyên môn**: Xem xét tính hợp lý và phê duyệt đề xuất bổ sung.
- **Văn thư / Thủ kho**: Tiếp nhận bản giấy phát sinh, xếp thêm vào hộp vật lý tương ứng.

#### C. Biểu đồ luồng nghiệp vụ
```
[Chuyên viên tìm hồ sơ gốc trên Thư viện]
                    |
                    v
[Nhấn "Đề xuất bổ sung tài liệu mới"]
                    |
                    v
[Tải tệp văn bản phát sinh + Nhập lý do bổ sung]
                    |
                    v
[Gửi Trưởng phòng chuyên môn phê duyệt]
        |                           |
        v (Từ chối)                 v (Phê duyệt)
[Trả lại cho Chuyên viên]   [Tự động ghép vào Hồ sơ gốc]
                            [Tăng phiên bản Version +1]
                                    |
                                    v
                            [Thông báo Thủ kho xếp bản giấy vào Hộp]
                                    |
                                    v
                            [Ghi nhận nhật ký AuditLogs: UPDATE_DOC]
```

#### D. Các bước thực hiện chi tiết
1. **Bước 1 - Tìm kiếm hồ sơ gốc**:
   - Chuyên viên vào phân hệ **Thư viện HSTL**, sử dụng thanh tìm kiếm nhanh hoặc lọc theo cây phân cấp để chọn hồ sơ cần bổ sung (Ví dụ: Hồ sơ hợp đồng bảo trì đường ray gói 04).
2. **Bước 2 - Lập yêu cầu bổ sung tài liệu**:
   - Nhấn nút **"Bổ sung tài liệu"**.
   - Nhập thông tin tài liệu phát sinh: Tên văn bản bổ sung, loại văn bản, ngày ban hành, tệp đính kèm, giải trình lý do.
3. **Bước 3 - Phê duyệt bổ sung**:
   - Yêu cầu được gửi vào hàng đợi phê duyệt của Trưởng phòng.
   - Trưởng phòng kiểm tra tệp đính kèm và lý do. Phê duyệt hoặc yêu cầu làm rõ.
4. **Bước 4 - Cập nhật dữ liệu & Quản lý phiên bản**:
   - Nâng số phiên bản hồ sơ (v1.0 -> v1.1). Thông báo Thủ kho xếp bản giấy vào hộp. Ghi nhật ký kiểm toán `UPDATE_DOC`.

---

### 3.3. LUỒNG 3: QUY TRÌNH SOẠN THẢO, GIAO VIỆC MỚI, THẨM ĐỊNH PHỐI HỢP, LÃNH ĐẠO NGHIỆM THU & VĂN THƯ LƯU THƯ VIỆN HSTL

#### A. Mục đích
Chuẩn hóa toàn bộ vòng đời công việc chỉ đạo điều hành và dự thảo văn bản: từ lúc Lãnh đạo / Người có thẩm quyền giao việc mới, cán bộ chủ trì tiếp nhận và tổ chức phối hợp thẩm định đa phòng ban, tổng hợp báo cáo hoàn thành, **bắt buộc qua bước Lãnh đạo/Trưởng phòng đánh giá nghiệm thu, phê duyệt kết quả và phân định độ bảo mật**, trước khi chuyển lệnh cho Văn thư cơ quan tiếp nhận bản cứng có dấu đỏ và đưa vào Thư viện HSTL.

> **QUY TẮC BẢO MẬT & PHÂN QUYỀN TÁC GIẢ BẮT BUỘC:**  
> **"Nhân viên/Cán bộ soạn thảo công việc này chỉ nhân viên đó mới được quyền xoá, sửa công việc đó."**  
> Mọi người dùng khác (kể cả cán bộ chủ trì hay người phối hợp) chỉ có quyền xem, phối hợp hoặc gửi báo cáo; các nút Sửa và Xóa sẽ bị khóa hoàn toàn kèm huy hiệu Khóa (`Lock`).

#### B. Phân hệ trọng tâm: Modul "Lãnh đạo Giao việc Mới" & Quản lý Nhiệm vụ
1. **Nút chức năng `+ Lãnh đạo Giao việc Mới`**:
   - Mở Form giao việc chuẩn mẫu hành chính ĐSVN:
     - Mã công việc (e.g. `CV-2026-0012`).
     - Tiêu đề công việc, cán bộ chủ trì thực hiện.
     - Mức độ ưu tiên: `HỎA TỐC`, `THƯỢNG KHẨN`, `KHẨN`, `THƯỜNG`.
     - Thời hạn hoàn thành (Deadline), nội dung chỉ đạo, tệp đính kèm.
2. **Cơ chế Phân quyền Tác giả Duy nhất (Strict Ownership)**:
   - Hệ thống tự động so khớp `assignedById` hoặc `creatorId` với `currentUser.id`.
   - Nếu là người tạo: Có quyền Sửa (`Edit`) và Xóa (`Delete`).
   - Nếu không phải người tạo: Nút Sửa/Xóa bị ẩn và hiển thị huy hiệu Khóa bảo vệ.

#### C. Tác nhân tham gia
- **Người soạn thảo công việc / Lãnh đạo giao việc**:
  - Khởi tạo nhiệm vụ, có quyền sửa/xóa duy nhất đối với công việc mình tạo.
  - Xem xét báo cáo kết quả, nghiệm thu xếp loại và phê duyệt kết quả.
  - **Phân định độ bảo mật khi chuyển lưu Thư viện HSTL** (Thường / Mật theo chỉ định).
- **Cán bộ / Phòng ban chủ trì**:
  - Tiếp nhận nhiệm vụ, mở phối hợp thực hiện, chỉ định người phối hợp.
  - Tổng hợp ý kiến, lập báo cáo kết quả kèm tệp minh chứng và nộp lên Lãnh đạo.
- **Phòng ban / Cán bộ phối hợp**:
  - Tham gia thẩm định, gửi phản hồi ý kiến và tài liệu đóng góp.
- **Văn thư cơ quan (Người lưu kho HSTL)**:
  - Tiếp nhận lệnh sau khi Lãnh đạo đã phê duyệt kết quả.
  - Tiếp nhận bản in báo cáo kết quả có con dấu đỏ và chữ ký sống.
  - Định vị tọa độ lưu kho vật lý 5 cấp, thiết lập thời hạn bảo quản và nạp vào Thư viện HSTL.

#### D. Biểu đồ luồng nghiệp vụ chi tiết (Detailed Flowchart)
```
[LÃNH ĐẠO / NGƯỜI SOẠN THẢO: Bấm "+ Lãnh đạo Giao việc Mới"]
  - Nhập mã việc, tên việc, người chủ trì, ưu tiên, deadline, chỉ đạo, tệp đính kèm
  - Lưu hệ thống (Quyền sửa/xóa vĩnh viễn thuộc về người tạo)
  - Trạng thái: ASSIGNED (Mới giao việc)
                       |
                       v
[CÁN BỘ CHỦ TRÌ: Tiếp nhận việc & Mở phối hợp thực hiện]
  - Bấm "Tiếp nhận việc" -> Trạng thái: IN_PROGRESS (Đang thực hiện)
  - Bấm "Chọn Người phối hợp" -> Chỉ định các cán bộ / phòng ban phối hợp
                       |
                       +-------------------------------------------------------+
                       |                                                       |
                       v                                                       v
[ĐƠN VỊ PHỐI HỢP 1: BAN VẬN TẢI]                        [ĐƠN VỊ PHỐI HỢP 2: BAN AN TOÀN]
  - Nghiên cứu tài liệu, thẩm định                        - Nghiên cứu tài liệu, thẩm định
  - Gửi ý kiến phản hồi + đính kèm file góp ý             - Gửi ý kiến phản hồi + đính kèm file góp ý
                       |                                                       |
                       +-------------------------------------------------------+
                                               |
                                               v
[CÁN BỘ CHỦ TRÌ: Báo cáo Đã xong & Trình Lãnh đạo]
  - Tổng hợp các ý kiến đóng góp, soạn báo cáo kết quả
  - Tải lên tệp văn bản báo cáo hoàn thành
  - Bấm "Xác Nhận ĐÃ XONG & Báo Cáo Lên Lãnh Đạo"
  - Trạng thái chuyển sang: COMPLETED_PENDING_REVIEW (Chờ Lãnh đạo nghiệm thu)
                                               |
                                               v
+--------------------------------------------------------------------------------------+
|             BƯỚC NGHIỆM THU BẮT BUỘC: LÃNH ĐẠO / TRƯỞNG PHÒNG PHÊ DUYỆT KẾT QUẢ      |
|  - Lãnh đạo mở modal "Lãnh Đạo Đánh Giá & Nghiệm Thu Kết Quả"                        |
|  - Xem xét báo cáo kết quả và tệp đính kèm của cán bộ chủ trì                        |
|  - Xếp loại đánh giá: Xuất sắc / Hoàn thành tốt / Đạt yêu cầu / Cần bổ sung          |
|  - Ghi ý kiến nhận xét / chỉ đạo của Lãnh đạo                                       |
|  - PHÂN ĐỊNH CẤP ĐỘ BẢO MẬT KHI CHUYỂN VĂN THƯ LƯU THƯ VIỆN HSTL:                   |
|      + TÀI LIỆU THƯỜNG: Mọi cán bộ trong Tổng công ty đều có quyền xem khi vào HSTL  |
|      + TÀI LIỆU MẬT (Theo chỉ định): Lãnh đạo chỉ định cụ thể các Phòng ban hoặc     |
|        các User được phép xem trong HSTL                                            |
|  - Lựa chọn:                                                                         |
|      + Bấm "↩ Yêu cầu làm tiếp / bổ sung" -> Trả về cán bộ chủ trì                   |
|      + Bấm "✓ Đồng ý kết quả & Chuyển Văn thư lưu HSTL"                             |
+----------------------------------------------+---------------------------------------+
                                               |
                                               v
[HỆ THỐNG CHUYỂN TRẠNG THÁI: WAITING_VAN_THU_ARCHIVE (Chờ Văn thư lưu HSTL)]
  - Thông báo được gửi đến Văn thư cơ quan
  - Nếu người dùng không phải Văn thư bấm nút, hệ thống hiển thị cảnh báo phân quyền
                                               |
                                               v
[VĂN THƯ CƠ QUAN: Tiếp nhận bản cứng có dấu đỏ & Nạp Thư viện HSTL]
  - Văn thư mở modal "Văn Thư Tiếp Nhận & Lưu Trữ Thư Viện HSTL"
  - Đối chiếu bản in báo cáo kết quả có chữ ký Lãnh đạo và con dấu đỏ pháp lý
  - Chọn Thời hạn bảo quản (Vĩnh viễn, 70 năm, 50 năm, 20 năm, 10 năm, 5 năm)
  - Chọn Tọa độ kho lưu trữ vật lý 5 cấp (Kho -> Dãy -> Kệ -> Tầng -> Hộp)
  - Xác nhận nạp hồ sơ -> Bấm "Xác Nhận Đưa Vào Thư Viện HSTL"
                                               |
                                               v
[HOÀN TẤT LƯU KHO: Trạng thái HSTL_ARCHIVED]
  - Hồ sơ xuất hiện trong Thư viện HSTL
  - Phân quyền bảo mật Thường / Mật được áp dụng nghiêm ngặt cho mọi người dùng
  - Ghi nhận đầy đủ lịch sử trong AuditLogs
```

#### E. Các bước thực hiện chi tiết
1. **Bước 1 - Khởi tạo Giao việc Mới & Xác lập quyền tác giả**:
   - Người soạn thảo nhấn nút **"+ Lãnh đạo Giao việc Mới"**, điền đầy đủ tiêu đề, cán bộ chủ trì, mức độ ưu tiên, hạn hoàn thành, nội dung chỉ đạo và tệp đính kèm.
   - Bấm **"Ban Hành Chỉ Đạo & Chuyển Việc Cho Chủ Trì"**. Trạng thái: `ASSIGNED`.
   - Quyền sửa/xóa vĩnh viễn gắn với tài khoản người tạo.
2. **Bước 2 - Cán bộ chủ trì tiếp nhận & Mở phối hợp**:
   - Cán bộ chủ trì bấm **"Tiếp nhận việc"** (chuyển sang `IN_PROGRESS`).
   - Bấm **"Chọn Người phối hợp"**, tích chọn các cán bộ từ các phòng ban khác (Ban Vận tải, Ban An toàn, Ban Kế hoạch...) và thiết lập hạn góp ý.
3. **Bước 3 - Các đơn vị phối hợp cho ý kiến**:
   - Cán bộ phối hợp truy cập công việc, gửi ý kiến đánh giá và tệp góp ý đính kèm.
4. **Bước 4 - Cán bộ chủ trì Báo cáo Đã xong**:
   - Cán bộ chủ trì tổng hợp kết quả, bấm nút **"Báo cáo Đã xong"**.
   - Điền tóm tắt kết quả, tải lên tệp văn bản báo cáo nghiệm thu.
   - Bấm **"Xác Nhận ĐÃ XONG & Báo Cáo Lên Lãnh Đạo"**.
   - Trạng thái công việc chuyển sang **`COMPLETED_PENDING_REVIEW`** (Chờ Lãnh đạo duyệt).
5. **Bước 5 (CỔNG KIỂM SOÁT BẮT BUỘC) - Lãnh đạo / Trưởng phòng Nghiệm thu & Phê duyệt kết quả**:
   - Lãnh đạo hoặc Trưởng phòng giao việc bấm nút **"Duyệt Nghiệm Thu & Chuyển HSTL"**.
   - Modal hiển thị chi tiết báo cáo và tệp đính kèm của cán bộ chủ trì.
   - **Thực hiện 3 nội dung thẩm quyền**:
     - *Xếp loại đánh giá*: `⭐ Xuất sắc`, `✓ Hoàn thành tốt`, `Đạt yêu cầu`, `⚠️ Cần bổ sung`.
     - *Ý kiến nhận xét*: Ghi nhận xét chuyên môn và chỉ đạo tiếp theo.
     - *Phân định cấp độ bảo mật khi chuyển lưu HSTL*:
       - Chọn **TÀI LIỆU THƯỜNG**: Mọi người dùng trong toàn Tổng công ty đều có quyền tra cứu, xem trong Thư viện HSTL.
       - Chọn **TÀI LIỆU MẬT (Theo chỉ định)**: Lãnh đạo chọn danh sách các Phòng ban hoặc các Cán bộ / User cụ thể được xem.
   - Bấm **"✓ Đồng ý kết quả & Chuyển Văn thư lưu HSTL"**.
   - Trạng thái chuyển sang **`WAITING_VAN_THU_ARCHIVE`** (Chờ Văn thư lưu HSTL).
6. **Bước 6 - Văn thư cơ quan Tiếp nhận bản in có dấu đỏ & Lưu Thư viện HSTL 5 cấp**:
   - Cán bộ Văn thư đăng nhập, thấy thẻ trạng thái teal **"Chờ lưu HSTL"**, bấm nút **"Văn thư Lưu HSTL"**.
   - (Nếu người dùng khác không có vai trò Văn thư bấm vào, hệ thống kích hoạt cảnh báo: *"Chỉ Cán bộ Văn thư mới có quyền tiếp nhận bản cứng có dấu đỏ và nạp vào Thư viện HSTL"*).
   - Văn thư chọn **Thời hạn bảo quản** (Vĩnh viễn đến 5 năm).
   - Định vị **Tọa độ kho lưu trữ vật lý 5 cấp** (Kho, Dãy, Kệ, Tầng, Hộp).
   - Tích chọn xác nhận đối chiếu bản in có chữ ký sống và con dấu đỏ pháp lý.
   - Bấm **"Xác Nhận Đưa Vào Thư Viện HSTL"**.
7. **Bước 7 - Hoàn tất lưu trữ & Kiểm soát truy cập Thư viện HSTL**:
   - Trạng thái công việc chuyển thành **`HSTL_ARCHIVED`**.
   - Toàn bộ hồ sơ báo cáo, ý kiến lãnh đạo, vị trí kho 5 cấp và thông tin lưu trữ xuất hiện trong **Thư viện HSTL Tổng hợp**.
   - **Cơ chế bảo mật Thường / Mật có hiệu lực tức thì**:
     - Tài liệu THƯỜNG: Tất cả cán bộ toàn Tổng công ty đều xem được.
     - Tài liệu MẬT: Chỉ Lãnh đạo, tác giả, và các phòng ban / user được chỉ định mới mở xem được tài liệu. Người ngoài danh sách bấm vào sẽ nhận thông báo không có quyền truy cập.

---

### 3.4. LUỒNG 4: QUY TRÌNH TIẾP NHẬN & XỬ LÝ SỔ VĂN BẢN ĐẾN ĐIỆN TỬ

#### A. Mục đích
Quản lý tập trung mọi công văn, chỉ thị, tờ trình gửi đến Tổng công ty từ các cơ quan cấp trên (Bộ Giao thông Vận tải, Ủy ban Quản lý vốn nhà nước, Cục Đường sắt...) và các đối tác bên ngoài, đảm bảo không sót việc và đúng thời hạn quy định.

#### B. Tác nhân tham gia
- **Văn thư cơ quan**: Tiếp nhận, quét scan số hóa, đăng ký vào Sổ văn bản đến, trình Lãnh đạo.
- **Lãnh đạo Tổng công ty**: Xem văn bản, cho ý kiến chỉ đạo (bút phê), phân công Ban chủ trì và Ban phối hợp.
- **Trưởng ban chủ trì**: Phân công chuyên viên thụ lý chính, đặt lịch hạn hoàn thành.
- **Chuyên viên thụ lý**: Thực hiện nhiệm vụ được giao, báo cáo kết quả hoặc soạn thảo công văn trả lời.

#### C. Biểu đồ luồng nghiệp vụ
```
[TIẾP NHẬN VĂN BẢN ĐẾN]
(Qua Trục liên thông, Bưu điện, Trực tiếp)
           |
           v
[VĂN THƯ ĐĂNG KÝ SỔ VĂN BẢN ĐẾN]
  - Sinh Số đến tự động theo năm
  - Nhập: Số ký hiệu gốc, Cơ quan gửi, Ngày văn bản, Trích yếu
  - Đính kèm tệp PDF đã quét scan
  - Chọn Độ khẩn: Hỏa tốc / Thượng khẩn / Khẩn / Thường
           |
           v
[TRÌNH LÃNH ĐẠO TỔNG CÔNG TY CHỈ ĐẠO]
  - Lãnh đạo xem tệp đính kèm trực tiếp
  - Ghi bút phê chỉ đạo xử lý
  - Chỉ định Ban chủ trì + Ban phối hợp + Hạn xử lý
           |
           v
[TRƯỞNG BAN CHỦ TRÌ PHÂN CÔNG CHUYÊN VIÊN]
  - Chọn Chuyên viên thụ lý chính
  - Ghi chú yêu cầu nghiệp vụ
           |
           v
[CHUYÊN VIÊN THỰC HIỆN XỬ LÝ]
  - Nghiên cứu, soạn thảo văn bản phản hồi (nếu có)
  - Cập nhật trạng thái: Đang xử lý -> Đã hoàn thành
           |
           v
[VĂN THƯ ĐÓNG HỒ SƠ & LƯU VÀO THƯ VIỆN HSTL]
```

#### D. Các bước thực hiện chi tiết
1. **Bước 1 - Tiếp nhận & Phân loại văn bản**:
   - Tiếp nhận văn bản đến từ Trục liên thông văn bản quốc gia hoặc bản giấy gửi qua đường bưu điện.
   - Phân loại văn bản: Mật, Thường, Hỏa tốc, Thượng khẩn.
2. **Bước 2 - Đăng ký vào Sổ Văn bản Đến**:
   - Văn thư vào phân hệ **"Sổ Văn bản Đến"**, chọn **"Vào sổ văn bản đến"**.
   - Hệ thống tự động gợi ý `Số đến` kế tiếp theo thứ tự liên tục của năm (Ví dụ: Số 245/2026).
   - Nhập thông tin:
     - `Số ký hiệu gốc`: Ví dụ: *105/BGTVT-VT*.
     - `Cơ quan gửi`: *Bộ Giao thông Vận tải*.
     - `Ngày ban hành`: Ngày ghi trên công văn gốc.
     - `Ngày đến`: Hệ thống mặc định ngày hiện tại.
     - `Trích yếu nội dung`: Tóm tắt ngắn gọn mục đích văn bản.
     - `Độ khẩn`: Chọn *Hỏa tốc* (cảnh báo đỏ nhấp nháy trên giao diện).
     - `Tệp đính kèm`: Tải tệp PDF đã scan dấu đỏ.
   - Nhấn **"Lưu và Chuyển Lãnh đạo"**.
3. **Bước 3 - Lãnh đạo cho ý kiến chỉ đạo (Bút phê)**:
   - Lãnh đạo mở giao diện Sổ Văn bản Đến, lọc danh sách *"Chờ chỉ đạo"*.
   - Mở xem trực tiếp tệp PDF trên trình đọc tích hợp sẵn.
   - Nhập nội dung chỉ đạo vào ô **"Bút phê của Lãnh đạo"** (Ví dụ: *"Giao Ban Vận tải chủ trì, phối hợp Ban An toàn kiểm tra, báo cáo phương án trước ngày 15/03/2026"*).
   - Chọn: Ban chủ trì (*Ban Vận tải*), Ban phối hợp (*Ban An toàn - An ninh*), Thời hạn xử lý.
   - Nhấn **"Chuyển phòng ban xử lý"**.
4. **Bước 4 - Trưởng ban phân công & Chuyên viên thụ lý**:
   - Trưởng ban Vận tải nhận thông báo, mở văn bản và chọn Chuyên viên thụ lý (*Trần Minh Đức*).
   - Chuyên viên Đức nhận nhiệm vụ:
     - Xem văn bản đến và bút phê chỉ đạo của Lãnh đạo.
     - Triển khai công việc chuyên môn.
     - Nếu cần soạn công văn trả lời, liên kết sang luồng Soạn thảo Văn bản Đi.
   - Khi hoàn thành, chuyên viên cập nhật trạng thái sang `Đã hoàn thành` kèm ghi chú kết quả.
5. **Bước 5 - Theo dõi hạn xử lý & Cảnh báo quá hạn**:
   - Hệ thống tự động tính toán thời gian còn lại:
     - Còn > 3 ngày: Nhãn xanh (Bình thường).
     - Còn <= 1 ngày: Nhãn vàng (Sắp đến hạn).
     - Quá hạn: Nhãn đỏ cảnh báo và gửi thông báo nhắc việc đến Trưởng ban và Chuyên viên.

---

### 3.5. LUỒNG 5: QUY TRÌNH SOẠN THẢO, KÝ SỐ & PHÁT HÀNH SỔ VĂN BẢN ĐI ĐIỆN TỬ

#### A. Mục đích
Quản lý toàn diện quy trình phát hành văn bản đi của Tổng công ty Đường sắt Việt Nam theo Nghị định 30/2020/NĐ-CP về công tác văn thư, từ khâu khởi thảo, duyệt thể thức, ký số lãnh đạo, cấp số đi tự động, đóng dấu số đến phát hành qua mạng liên thông.

#### B. Tác nhân tham gia
- **Chuyên viên soạn thảo**: Khởi tạo văn bản đi kèm tờ trình thuyết minh.
- **Trưởng phòng chuyên môn**: Soát xét nội dung, ký nháy văn bản.
- **Văn thư kiểm soát thể thức**: Kiểm tra font chữ, căn lề, tiêu ngữ, nơi nhận theo quy chuẩn hành chính.
- **Lãnh đạo ký số**: Ký điện tử bằng Token USB hoặc Chứng thư số công vụ.
- **Văn thư phát hành**: Cấp số đi tự động, đóng dấu số cơ quan (dấu tròn đỏ điện tử), gửi liên thông và lưu hồ sơ.

#### C. Biểu đồ luồng nghiệp vụ
```
[CHUYÊN VIÊN SOẠN THẢO VĂN BẢN ĐI]
  - Soạn văn bản, tờ trình
  - Nhập nơi nhận bên ngoài & nơi nhận nội bộ
           |
           v
[TRƯỞNG PHÒNG SOÁT XÉT NỘI DUNG & KÝ NHÁY]
           |
           v
[VĂN THƯ SOÁT THỂ THỨC VĂN BẢN (THEO NĐ 30/2020/NĐ-CP)]
           |
           v
[LÃNH ĐẠO TỔNG CÔNG TY KÝ SỐ CHỨNG THƯ CÔNG VỤ]
           |
           v
[VĂN THƯ THỰC HIỆN PHÁT HÀNH]
  - Hệ thống tự động cấp Số đi (Ví dụ: 128/QĐ-ĐS)
  - Đóng dấu số cơ quan (Digital Stamp)
  - Phát hành qua Trục liên thông quốc gia + Bưu điện
           |
           v
[TỰ ĐỘNG ĐỒNG BỘ VĂN BẢN ĐI VÀO THƯ VIỆN HSTL CẤP 5]
```

#### D. Các bước thực hiện chi tiết
1. **Bước 1 - Lập hồ sơ văn bản đi**:
   - Chuyên viên vào phân hệ **"Sổ Văn bản Đi"**, bấm **"Đăng ký văn bản đi mới"**.
   - Chọn loại sổ văn bản: *Sổ Quyết định*, *Sổ Công văn*, *Sổ Thông báo*, *Sổ Kế hoạch*...
   - Nhập trích yếu văn bản, nơi nhận bên ngoài (Bộ GTVT, Cục Đường sắt...), nơi nhận nội bộ (Các Ban, Các Công ty cổ phần đường sắt...).
   - Tải lên tệp dự thảo văn bản đi (Word/PDF).
2. **Bước 2 - Soát xét thể thức & Ký nháy**:
   - Trưởng phòng kiểm tra tính pháp lý và chuyên môn, thực hiện ký nháy tại vị trí cuối phần nơi nhận.
   - Cán bộ văn thư kiểm soát thể thức: Khoảng cách dòng, kiểu chữ, vị trí Quốc hiệu, Tiêu ngữ, Số ký hiệu dự kiến theo đúng quy định.
3. **Bước 3 - Lãnh đạo ký số phê duyệt**:
   - Lãnh đạo mở giao diện ký duyệt văn bản đi.
   - Cắm USB Token chữ ký số hoặc sử dụng dịch vụ ký số từ xa (Remote Signing).
   - Kiểm tra nội dung văn bản trực quan trên màn hình.
   - Bấm **"Ký số phát hành"** -> Chữ ký điện tử kèm họ tên, chức danh và con dấu chứng chỉ số được gắn vào tệp PDF.
4. **Bước 4 - Cấp số đi tự động & Đóng dấu số cơ quan**:
   - Văn thư mở hồ sơ đã được Lãnh đạo ký duyệt.
   - Nhấn nút **"Cấp số & Phát hành"**.
   - Hệ thống tự động:
     - Tăng số thứ tự trong Sổ văn bản tương ứng (Ví dụ: Số đi `842` -> Số ký hiệu đầy đủ: `842/QĐ-ĐS`).
     - Đóng dấu tròn đỏ điện tử của Tổng công ty Đường sắt Việt Nam lên vị trí 1/3 chữ ký của Lãnh đạo.
     - Tạo mã QR Code góc trên bên phải văn bản phục vụ tra cứu tính xác thực khi in ra giấy.
5. **Bước 5 - Phát hành & Đồng bộ Thư viện**:
   - Hệ thống đẩy tệp đã ký số qua Trục liên thông văn bản quốc gia tới các cơ quan bên ngoài.
   - Gửi thông báo đến hộp thư điện tử nội bộ các đơn vị trực thuộc có tên trong phần "Nơi nhận".
   - Tự động tạo bản ghi lưu trữ vào Thư viện HSTL 5 cấp thuộc Khối và Ban soạn thảo.

---

### 3.6. LUỒNG 6: QUY TRÌNH TRA CỨU TRỢ LÝ AI QWEN 2.5 (RAG NỘI BỘ) & TRÒ CHUYỆN ĐÍNH KÈM HỒ SƠ

#### A. Mục đích
Ứng dụng Trí tuệ nhân tạo mô hình ngôn ngữ lớn Qwen 2.5 chạy cục bộ trên máy chủ nội bộ để tìm kiếm thông minh, tổng hợp kiến thức từ kho tài liệu kỹ thuật đường sắt và hỗ trợ cán bộ trao đổi công việc kèm đính kèm tài liệu trực tiếp.

#### B. Tác nhân tham gia
- **Người dùng (Cán bộ nhân viên VNR)**: Đặt câu hỏi bằng ngôn ngữ tự nhiên hoặc chat với đồng nghiệp.
- **Dịch vụ Trợ lý AI Qwen 2.5**: Nhận câu hỏi, tìm kiếm ngữ nghĩa trong CSDL HSTL, OCR và sinh câu trả lời chính xác.
- **Hệ thống Tin nhắn nội bộ (Messenger)**: Chuyển phát tin nhắn tức thời và liên kết hiển thị hồ sơ đính kèm.

#### C. Biểu đồ luồng nghiệp vụ Tra cứu AI (RAG Workflow)
```
[NGƯỜI DÙNG NHẬP CÂU HỎI TỰ NHIÊN]
(VD: "Quy định về tốc độ tàu qua cầu Long Biên được quy định tại văn bản nào?")
                         |
                         v
[TRỢ LÝ AI TIẾP NHẬN & PHÂN TÍCH Ý ĐỊNH TRUY VẤN]
                         |
                         v
[MODULE RAG TÌM KIẾM TRONG KHO DỮ LIỆU CỤC BỘ]
  - Quét qua bảng DossierDocuments (Trích yếu, Loại, Ngày)
  - Quét qua trường OcrContent (Toàn văn nhận dạng tài liệu quét)
  - Lọc ra Top 3-5 đoạn văn bản có độ liên quan cao nhất
                         |
                         v
[ĐƯA CONTEXT VÀO PROMPT CỦA MODEL QWEN 2.5 LOCAL]
(Prompt: Dựa vào các tài liệu nội bộ sau đây, hãy trả lời câu hỏi...)
                         |
                         v
[MODEL QWEN 2.5 SINH CÂU TRẢ LỜI ĐẦY ĐỦ]
  - Nêu rõ nội dung câu trả lời
  - Trích dẫn Số ký hiệu: 842/QĐ-ĐS
  - Ngày ban hành: 20/12/2025
  - Tọa độ kho vật lý: Kho 118 Lê Duẩn - Dãy A / Kệ 01 / Hộp 101
  - Nút bấm xem ngay file PDF
                         |
                         v
[HIỂN THỊ KẾT QUẢ CHO NGƯỜI DÙNG CHỈ SAU 1.5 GIÂY]
```

#### D. Luồng nghiệp vụ Trò chuyện đính kèm Hồ sơ (Messenger with Dossier Attachment)
```
[CÁN BỘ A MỞ HỘP CHAT VỚI CÁN BỘ B HOẶC NHÓM]
                         |
                         v
[NHẤN BIỂU TƯỢNG "ĐÍNH KÈM HỒ SƠ TỪ THƯ VIỆN"]
                         |
                         v
[HỘP THOẠI TRA CỨU HSTL HIỂN THỊ]
  - Chọn nhanh từ danh sách hồ sơ vừa xem gần đây
  - Hoặc nhập từ khóa số hiệu (VD: "842/QĐ")
                         |
                         v
[CHỌN TÀI LIỆU CẦN CHIA SẺ VÀ BẤM GỬI]
                         |
                         v
[TIN NHẮN ĐƯỢC HIỂN THỊ KÈM CARD HỒ SƠ TƯƠNG TÁC]
  - Hiển thị Số hiệu, Trích yếu, Huy hiệu loại văn bản
  - Tọa độ kho vật lý
  - Nút "Xem văn bản trực tiếp" (Click vào mở ngay cửa sổ xem PDF & OCR)
                         |
                         v
[CÁN BỘ B BẤM XEM TRỰC TIẾP KHÔNG CẦN TÌM LẠI]
```

#### E. Đặc tả kỹ thuật bảo mật AI
- **Chế độ Offline 100%**: Tuyệt đối không gọi bất kỳ API bên ngoài (OpenAI, Claude, Google Cloud...). Mọi câu lệnh và dữ liệu lưu chuyển hoàn toàn trong mạng nội bộ Tổng công ty (Intranet IP).
- **Phân quyền truy cập tài liệu trong RAG**: Trợ lý AI chỉ tìm kiếm và trích dẫn các tài liệu mà tài khoản người dùng đang đăng nhập có quyền truy cập theo Ma trận RBAC. Tài liệu Mật chỉ hiển thị cho người có thẩm quyền.

---

### 3.7. LUỒNG 7: QUY TRÌNH QUẢN TRỊ PHÂN QUYỀN (RBAC), NHẬN DIỆN THƯƠNG HIỆU & KIỂM TOÁN AN TOÀN

#### A. Mục đích
Đảm bảo an ninh thông tin, kiểm soát chặt chẽ quyền hạn của từng vị trí công tác, cho phép cá nhân hóa trải nghiệm thương hiệu theo màu sắc nhận diện đồng bộ và lưu vết 100% thao tác người dùng phục vụ hậu kiểm.

#### B. Quy trình Đồng bộ Màu nhận diện tức thì (Instant Theme Synchronization Flow)
```
[QUẢN TRỊ VIÊN HOẶC NGƯỜI DÙNG CHỌN MÀU MỚI]
(VD: Chọn "Xanh Đường Sắt VNR #003882" hoặc "Cobalt Blue #1d4ed8")
                         |
                         v
[HỆ THỐNG CẬP NHẬT TRẠNG THÁI BRANDING STATE]
                         |
                         v
[ĐỒNG BỘ ĐỒNG THỜI ĐẾN TOÀN BỘ CÁC THÀNH PHẦN GIAO DIỆN]:
  1. Trang Đăng nhập (Hero banner gradient, nút Đăng nhập)
  2. Header chính của phần mềm (Dải màu thương hiệu phía trên)
  3. Tab đang chọn trong "Danh Mục Nghiệp Vụ" (Sidebar Desktop)
  4. Tab đang chọn trong "Menu Ngăn Kéo" (Mobile Drawer)
  5. Biểu tượng & Nhãn trong "Thanh Điều Hướng Đáy" (Bottom Navigation Mobile)
  6. Các nút bấm chính (Lưu, Thêm mới, Ký duyệt)
                         |
                         v
[LƯU VÀO CSDL BẢNG SystemBranding & LocalStorage ĐỂ DUY TRÌ KHI TẢI LẠI TRANG]
```

#### C. Quy trình Kiểm toán an toàn thông tin (Audit Logging Flow)
Mọi hành vi sau đây đều tự động kích hoạt Trigger ghi nhật ký vào bảng `AuditLogs`:
- `LOGIN / LOGOUT`: Đăng nhập, đăng xuất thành công hoặc thất bại.
- `VIEW_DOCUMENT`: Xem chi tiết hoặc tải tệp PDF văn bản.
- `CREATE_DOCUMENT`: Thêm mới hồ sơ, văn bản vào thư viện.
- `UPDATE_DOCUMENT`: Bổ sung tài liệu, sửa metadata hồ sơ.
- `DELETE_DOCUMENT`: Xóa hồ sơ (chỉ Admin có quyền).
- `APPROVE_DRAFT`: Phê duyệt thẩm định hoặc ký số văn bản.

Cấu trúc một bản ghi Audit Log:
`[Thời gian] [UserId] [Họ tên] [Địa chỉ IP] [Hành động] [Phân hệ] [Mã bản ghi] [Nội dung chi tiết]`

---

## 4. MA TRẬN PHÂN QUYỀN TRUY CẬP (RBAC) THEO 5 VAI TRÒ

### 4.1. Ma trận chức năng tổng quát
| Phân hệ / Chức năng chi tiết | Quản trị viên (ADMIN) | Lãnh đạo (LANH_DAO) | Trưởng phòng (TRUONG_PHONG) | Văn thư (VAN_THU) | Chuyên viên (CHUYEN_VIEN) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Xem danh mục Thư viện HSTL 5 cấp** | Toàn quyền | Toàn quyền | Toàn công ty | Toàn quyền | Thuộc phòng mình |
| **Xem chi tiết tài liệu THƯỜNG trong HSTL** | Toàn quyền | Toàn quyền | Toàn quyền | Toàn quyền | **Mọi cán bộ xem được** |
| **Xem chi tiết tài liệu MẬT trong HSTL** | Được chỉ định | Toàn quyền | Đơn vị / Được chỉ định | Văn thư lưu kho | **Chỉ khi được chỉ định** |
| **Luồng 1: Lập hồ sơ, quét scan, OCR ban đầu** | Toàn quyền | Xem | Hướng dẫn | Hỗ trợ scan | **Khởi tạo & Trình duyệt** |
| **Luồng 1: Thẩm tra, Phê duyệt & Phân quyền Mật/Thường** | Toàn quyền | Xem | **Thẩm quyền Phê duyệt** | Nhận kết quả | Không |
| **Luồng 1: Tiếp nhận bản cứng có dấu & Nạp HSTL** | Toàn quyền | Xem | Xem | **Thẩm quyền Nạp HSTL** | Không |
| **Luồng 3: Giao việc mới (Khởi tạo nhiệm vụ)** | Toàn quyền | **Giao việc chỉ đạo** | **Giao việc phòng** | Không | **Khởi tạo việc soạn thảo** |
| **Luồng 3: Sửa / Xóa công việc đã tạo** | Toàn quyền | **Chỉ người soạn thảo** | **Chỉ người soạn thảo** | Không | **Chỉ người soạn thảo** |
| **Luồng 3: Phối hợp & Báo cáo kết quả** | Xem | Xem | Chỉ đạo | Theo dõi | **Chủ trì & Phối hợp** |
| **Luồng 3: Nghiệm thu & Duyệt kết quả (kèm phân loại Mật/Thường)** | Toàn quyền | **Nghiệm thu chính** | **Nghiệm thu chuyên môn**| Chờ lệnh | Không |
| **Luồng 3: Văn thư nhận bản in dấu đỏ & Nạp HSTL** | Toàn quyền | Xem | Xem | **Thẩm quyền Nạp HSTL** | Không |
| **Bổ sung tài liệu vào hồ sơ đã có (Luồng 2)** | Toàn quyền | Xem tiến độ | Phê duyệt bổ sung | Xếp tệp vào hộp | Đề xuất bổ sung |
| **Xóa hồ sơ khỏi thư viện HSTL** | **Toàn quyền** | Không | Không | Không | Không |
| **Sổ Văn bản Đến: Đăng ký & Số hóa** | Toàn quyền | Không | Không | **Toàn quyền** | Không |
| **Sổ Văn bản Đến: Bút phê chỉ đạo** | Toàn quyền | **Chỉ đạo chính** | Phân công nội bộ | Xem | Xem việc được giao |
| **Sổ Văn bản Đi: Soạn thảo tờ trình** | Toàn quyền | Xem duyệt | Soát xét | Kiểm tra thể thức | **Khởi tạo soạn thảo** |
| **Sổ Văn bản Đi: Ký số Lãnh đạo** | Không | **Ký số chính thức** | Ký nháy | Không | Không |
| **Sổ Văn bản Đi: Cấp số & Đóng dấu** | Toàn quyền | Xem | Xem | **Toàn quyền** | Không |
| **Trợ lý AI Qwen 2.5: Tra cứu toàn văn**| Toàn quyền | Toàn quyền | Toàn quyền | Toàn quyền | Toàn quyền |
| **Trò chuyện Messenger & Gửi kèm HSTL**| Toàn quyền | Toàn quyền | Toàn quyền | Toàn quyền | Toàn quyền |
| **Quản trị người dùng & Phân vai trò** | **Toàn quyền** | Xem | Xem nhân sự phòng | Không | Không |
| **Quản lý danh mục Kho & Vị trí vật lý**| **Toàn quyền** | Xem | Xem | **Cập nhật tọa độ** | Xem |
| **Đổi màu sắc nhận diện & Giao diện** | Toàn quyền | Toàn quyền | Toàn quyền | Toàn quyền | Toàn quyền |
| **Xem Nhật ký kiểm toán (Audit Logs)** | **Toàn quyền** | Xem báo cáo | Xem phòng mình | Không | Không |

### 4.2. Hai nguyên tắc bảo mật tối cao của hệ thống:
1. **Nguyên tắc Quyền sở hữu Tác giả Nhiệm vụ (Strict Task Ownership)**:
   - "Nhân viên / Cán bộ soạn thảo công việc này chỉ nhân viên đó mới được quyền xoá, sửa công việc đó."
   - Khi bất kỳ tài khoản nào khác (dù cùng phòng, cán bộ chủ trì hay cán bộ phối hợp) mở xem công việc, các nút thao tác Sửa / Xóa bị ẩn hoàn toàn và thay thế bằng chỉ báo Huy hiệu Khóa (`Lock`).
2. **Nguyên tắc Bảo mật Thư viện HSTL 2 Cấp (Thường vs Mật)**:
   - **Tài liệu THƯỜNG**: Khi được đưa vào Thư viện HSTL, tất cả cán bộ, chuyên viên trong toàn Tổng công ty đều có quyền tra cứu, mở xem nội dung văn bản và bản scan OCR.
   - **TÀI LIỆU MẬT**: Khi Trưởng phòng / Lãnh đạo phê duyệt nạp lưu HSTL, hệ thống bắt buộc Trưởng phòng/Lãnh đạo chỉ định cụ thể các Phòng ban hoặc các User đích danh được phép truy cập. Mọi tài khoản khác nếu tìm thấy hồ sơ khi bấm xem sẽ bị hệ thống chặn truy cập, hiển thị cảnh báo từ chối quyền và ghi vết vào `AuditLogs`.

---

## 5. QUY CHUẨN SỐ HÓA, OCR & TÌM KIẾM TOÀN VĂN

### 5.1. Quy chuẩn định dạng tệp và độ phân giải
- **Định dạng chuẩn số hóa**: `PDF/A-1a` hoặc `PDF/A-2b` (Chuẩn ISO 19005 về bảo quản tài liệu lưu trữ dài hạn).
- **Độ phân giải quét (Scan Resolution)**:
  - Tài liệu văn bản thông thường: Tối thiểu `300 DPI` (Grayscale hoặc Black & White).
  - Bản vẽ kỹ thuật, hồ sơ hoàn công cầu đường: Tối thiểu `400 DPI` đến `600 DPI`.
  - Tài liệu có dấu đỏ, chữ ký tươi hoặc hình ảnh hiện trạng: Quét màu `24-bit True Color`, tối thiểu `300 DPI`.
- **Dung lượng tệp tối ưu**: Dưới `20 MB` cho văn bản dưới 50 trang; nén JBIG2 đối với văn bản đơn sắc.

### 5.2. Công nghệ Nhận dạng ký tự quang học (OCR)
- Bộ giải thuật OCR tiếng Việt đa tầng hỗ trợ đầy đủ các font chữ TCVN3 (ABC), VNI và Unicode UTF-8 dựng sẵn.
- Tự động hiệu chỉnh độ nghiêng (Deskew), khử nhiễu vết ố vàng trên giấy tài liệu cũ trước năm 1995.
- Lưu trữ kết quả OCR:
  - Tầng 1: Nhúng trực tiếp lớp Text ẩn vào tệp PDF (Searchable PDF) để người dùng có thể bôi đen copy chữ trực tiếp trên trình duyệt.
  - Tầng 2: Lưu trữ toàn bộ chuỗi văn bản nhận dạng vào cột `OcrContent` (`NVARCHAR(MAX)`) của bảng `DossierDocuments` trong SQL Server để hỗ trợ tìm kiếm toàn văn siêu tốc bằng Stored Procedure và Full-Text Search.

---

## 6. MÔ HÌNH THỰC THỂ DỮ LIỆU (ERD) & CẤU TRÚC LƯU TRỮ

```
+------------------+          1:N         +--------------------+
|   Departments    |--------------------->|       Users        |
|  (Phòng ban)     |                      |   (Người dùng)     |
+------------------+                      +--------------------+
        | 1:N                                     | 1:N
        v                                         v
+------------------+          1:N         +--------------------+
|  DossierFolders  |<---------------------|  DossierDocuments  |
| (Cây HSTL 5 cấp) |                      | (Văn bản, OCR & Mật)|
+------------------+                      +--------------------+
        | N:1                                     ^
        v                                         | 1:N (Liên kết hồ sơ)
+------------------+                              +--------------------+
|PhysicalLocations |                              |   ChatMessages     |
| (Vị trí Kho/Hộp) |                              |  (Tin nhắn nội bộ) |
+------------------+                              +--------------------+

+--------------------+          1:N       +-------------------------+
|   LeaderTasks      |------------------->| LeaderTaskCoordinators  |
| (Giao việc Lãnh đạo|                    |(Cán bộ / Ban phối hợp)  |
| Nghiệm thu & Mật)  |                    +-------------------------+
+--------------------+
        | 1:N (Chuyển lưu trữ)
        v
+--------------------+
|  DossierDocuments  |
+--------------------+

+--------------------+          1:N       +--------------------+
|   DraftDossiers    |------------------->|  DraftAppraisals   |
| (Hồ sơ dự thảo)    |                    |(Ý kiến thẩm định)  |
+--------------------+                    +--------------------+

+--------------------+                    +--------------------+
| IncomingDocuments  |                    | OutgoingDocuments  |
| (Sổ văn bản đến)   |                    | (Sổ văn bản đi)    |
+--------------------+                    +--------------------+

+--------------------+                    +--------------------+
|  SystemBranding    |                    |    AuditLogs       |
| (Màu nhận diện)    |                    | (Nhật ký truy vết) |
+--------------------+                    +--------------------+
```

---

## 7. HƯỚNG DẪN TRIỂN KHAI TRÊN MÁY CHỦ IIS & SQL SERVER

### 7.1. Cài đặt và cấu hình Cơ sở dữ liệu Microsoft SQL Server
1. Mở công cụ **SQL Server Management Studio (SSMS)** trên máy chủ Database.
2. Kết nối bằng quyền quản trị `sa`.
3. Mở file script `/TRIENKHAI/Script_Database_SQLServer.sql`.
4. Bấm **Execute** (F5). Script sẽ:
   - Tự động tạo Cơ sở dữ liệu `QL_HSTL_VNR` với chuẩn mã hóa `Vietnamese_CI_AS`.
   - Tạo toàn bộ 12 bảng thực thể với khóa chính, khóa ngoại, chỉ mục nonclustered tối ưu.
   - Biên dịch 2 Stored Procedures: `sp_SearchDossierDocuments` (Tra cứu toàn văn OCR) và `sp_WriteAuditLog` (Ghi vết kiểm toán).
   - Nạp bộ dữ liệu mẫu ban đầu (Seed Data) chuẩn ngành đường sắt Việt Nam.

### 7.2. Cấu hình Dịch vụ Ứng dụng trên IIS (Internet Information Services)
1. Cài đặt các thành phần trên Windows Server:
   - **IIS Web Server**: Bật các tính năng `HTTP Redirection`, `WebSockets`, `Application Development -> CGI / ISAPI`.
   - **IIS URL Rewrite Module 2.1**.
   - **Application Request Routing (ARR) 3.0**: Mở IIS Manager -> Chọn Server -> *Application Request Routing Cache* -> *Server Proxy Settings* -> Tích chọn *Enable proxy*.
2. Cài đặt **Node.js LTS** (khuyến nghị phiên bản 20.x hoặc 22.x).
3. Đặt mã nguồn ứng dụng vào thư mục: `C:\inetpub\wwwroot\QL_HSTL_VNR`.
4. Cấu hình biến môi trường trong file `.env`:
   ```env
   NODE_ENV=production
   PORT=3000
   DB_SERVER=localhost
   DB_NAME=QL_HSTL_VNR
   DB_USER=sa
   DB_PASSWORD=MatKhauBaoMat2026@VNR
   OLLAMA_HOST=http://127.0.0.1:11434
   JWT_SECRET=VNR_HSTL_SECURE_TOKEN_KEY_2026
   ```
5. Chạy ứng dụng dưới dạng Windows Service sử dụng tiện ích `pm2-windows-service` hoặc `nssm`:
   ```bash
   npm install -g pm2 pm2-windows-service
   pm2 start server.ts --name "vnr-hstl-app"
   pm2 save
   ```
6. Trong IIS, tạo một Website trỏ tới thư mục ứng dụng với cấu hình `web.config` làm Reverse Proxy chuyển hướng toàn bộ lưu lượng cổng 80/443 về `http://127.0.0.1:3000`.

### 7.3. Cài đặt và Vận hành Trợ lý AI Qwen 2.5 qua Ollama
1. Tải bộ cài Ollama cho Windows Server từ trang chủ: `https://ollama.com/download/windows`.
2. Chạy cài đặt và thiết lập biến môi trường hệ thống để Ollama lắng nghe mọi kết nối trong mạng LAN:
   - Biến môi trường: `OLLAMA_HOST=0.0.0.0:11434`
   - Biến môi trường: `OLLAMA_MODELS=D:\OllamaModels` (đặt trên ổ cứng dung lượng lớn).
3. Mở Command Prompt (Admin) và tải mô hình Qwen 2.5 tối ưu:
   ```bash
   ollama pull qwen2.5:7b-instruct
   ```
4. Kiểm tra dịch vụ hoạt động bằng cách mở trình duyệt truy cập: `http://localhost:11434/api/tags` - Nhận về JSON danh sách model `qwen2.5:7b-instruct`.
5. Hệ thống phần mềm tự động kết nối qua API endpoint `/api/generate` để phục vụ cán bộ nhân viên tra cứu 24/7.
