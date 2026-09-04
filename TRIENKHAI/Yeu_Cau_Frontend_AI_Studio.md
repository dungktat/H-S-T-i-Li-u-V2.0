# TÀI LIỆU ĐẶC TẢ YÊU CẦU FRONTEND & MASTER PROMPT CHO GOOGLE AI STUDIO
## HỆ THỐNG QUẢN LÝ HỒ SƠ TÀI LIỆU (HSTL) - TỔNG CÔNG TY ĐƯỜNG SẮT VIỆT NAM (VNR)

---

> **Mục đích tài liệu:**  
> Tài liệu này chứa đặc tả kỹ thuật, hướng dẫn thiết kế giao diện (UI/UX) và bản **Master Prompt hoàn chỉnh**. Khi bạn sao chép tài liệu này (hoặc phần Master Prompt ở mục 7) đưa vào một Workspace **Google AI Studio** mới (hoặc tài khoản AI Studio khác), hệ thống AI sẽ dựng lại **chính xác 100% giao diện, màu sắc nhận diện, cấu trúc thư mục, luồng nghiệp vụ và tương tác người dùng** như phiên bản hiện tại.

---

## 1. TỔNG QUAN KIẾN TRÚC FRONTEND & STACK KỸ THUẬT

### 1.1. Công nghệ sử dụng
- **Framework:** React 18+ (Vite SPA template), TypeScript (Strict Mode).
- **Styling:** Tailwind CSS (áp dụng utility-first, biến CSS custom cho mã màu nhận diện thương hiệu).
- **Bộ icon:** `lucide-react` (tuyệt đối không dùng SVG tùy ý bên ngoài).
- **Hiệu ứng & Chuyển cảnh:** `motion/react` (hoặc CSS Transitions với Tailwind chuẩn).
- **Lưu trữ & Trạng thái (Persistence):**
  - Sử dụng `localStorage` kết hợp Service Pattern (`StorageService.ts`, `UserChatService.ts`).
  - Đồng bộ dữ liệu đa cửa sổ/đa tab theo cơ chế hướng sự kiện: Phát và lắng nghe CustomEvent `window.dispatchEvent(new CustomEvent('hstl_state_change', { detail: { type: '...' } }))` và sự kiện `window.addEventListener('storage', ...)`.

### 1.2. Cấu trúc thư mục chuẩn
```text
/src
├── components/
│   ├── auth/
│   │   └── LoginPage.tsx                      # Màn hình đăng nhập & chuyển vai trò nhanh
│   ├── common/
│   │   ├── DocumentViewerModal.tsx            # Trình xem tài liệu toàn diện 5 tab (PDF, OCR, Meta, Kho, Lịch sử)
│   │   ├── UnifiedChatbotAndMessengerModal.tsx # Trợ lý AI Qwen 2.5 & Tin nhắn trực tuyến
│   │   └── PhysicalLocationPicker.tsx         # Bộ chọn tọa độ vị trí kho 5 cấp
│   └── modules/
│       ├── Windows12Shell/
│       │   ├── Windows12Desktop.tsx           # Khung Desktop Shell điều khiển chính
│       │   ├── SettingsPersonalizationModal.tsx# Cài đặt nhận diện thương hiệu, Quản trị người dùng & Audit Log
│       │   └── MetadataSchemaAdminTab.tsx     # Quản lý schema metadata mở rộng
│       ├── ThuVienHSTL/
│       │   └── ThuVienTongHopModule.tsx       # Phân hệ Thư viện HSTL Tổng hợp (Cây 5 cấp, Kho 5 cấp, OCR Search)
│       ├── Luoc1CapNhat/
│       │   ├── Luong1Module.tsx               # Phân hệ Số hóa & Cập nhật HSTL đã có
│       │   ├── Luong1ReviewModal.tsx          # Modal Trưởng phòng thẩm tra & duyệt (Thường / Mật)
│       │   └── Luong1VanThuArchiveModal.tsx   # Modal Văn thư kiểm tra bản cứng & nạp Thư viện HSTL
│       ├── Luoc2SoanThao/
│       │   ├── Luong2Module.tsx               # Phân hệ Soạn thảo & Báo cáo
│       │   ├── TaskManagementSection.tsx      # Quản lý giao việc Luồng 3 & Nghiệm thu
│       │   └── Luong2SupplementSection.tsx    # Bổ sung tài liệu vào HSTL đã có (Luồng 2)
│       ├── Luoc3VanBanDen/
│       │   └── Luong3Module.tsx               # Sổ Văn bản Đến & Bút phê chỉ đạo
│       └── Luoc4VanBanDi/
│           └── Luong4Module.tsx               # Sổ Văn bản Đi & Ký số phát hành
├── data/
│   └── initialData.ts                         # Dữ liệu hạt giống (Users, Departments, Folders, Locations, Sample Docs)
├── services/
│   ├── storageService.ts                      # Xử lý CRUD LocalStorage & Đồng bộ trạng thái
│   └── userChatService.ts                     # Quản lý tin nhắn nội bộ & gửi kèm hồ sơ
├── types.ts                                   # Định nghĩa Type/Interface TypeScript toàn hệ thống
├── utils/
│   ├── themeUtils.ts                          # Bộ xử lý gradient & màu sắc động theo thương hiệu
│   └── ocrUtils.ts                            # Tiện ích giả lập bóc tách OCR tiếng Việt
├── App.tsx                                    # Điểm nhập chính quản lý phiên đăng nhập
└── main.tsx
```

---

## 2. DESIGN SYSTEM & QUY CHUẨN GIAO DIỆN DOANH NGHIỆP

### 2.1. Bảng màu chuẩn Tổng công ty Đường sắt Việt Nam (VNR Theme)
- **Màu chủ đạo (Primary Corporate Blue):** `#003882` (Xanh đường sắt truyền thống).
- **Dải Gradient Header/Active Elements:** `linear-gradient(135deg, #003882 0%, #094ba1 50%, #002b66 100%)`.
- **Màu phân hệ nghiệp vụ (Semantic Accents):**
  - *Thư viện Tổng hợp:* Indigo (`bg-indigo-50`, `text-indigo-700`, `border-indigo-200`).
  - *Cập nhật HSTL (Luồng 1):* Blue (`bg-blue-50`, `text-blue-700`, `border-blue-200`).
  - *Soạn thảo & HSCV (Luồng 2 & 3):* Purple (`bg-purple-50`, `text-purple-700`, `border-purple-200`).
  - *Sổ Văn bản Đến:* Emerald (`bg-emerald-50`, `text-emerald-700`, `border-emerald-200`).
  - *Sổ Văn bản Đi:* Rose (`bg-rose-50`, `text-rose-700`, `border-rose-200`).
  - *Trợ lý AI Qwen 2.5:* Cyan (`bg-cyan-50`, `text-cyan-700`, gradient Cyan -> Blue).
  - *Nhắn tin trao đổi:* Emerald / Teal (`bg-emerald-50`, `text-emerald-700`).

### 2.2. Khung màn hình tổng thể (Windows 12 Desktop Shell)
- **Header cố định đỉnh màn hình (`h-[56px]` hoặc `h-[60px]`):**
  - Bên trái: Nút toggle menu mobile, Logo khối vuông bo góc "DS" (Đường Sắt), Tên cơ quan ("TỔNG CÔNG TY ĐƯỜNG SẮT VIỆT NAM") và tên phần mềm ("HỆ THỐNG QUẢN LÝ HỒ SƠ TÀI LIỆU (HSTL)").
  - Giữa/Phải:
    + Bộ chọn Chuyển đổi Nhanh Vai trò (Role Switcher: ADMIN, LANH_DAO, TRUONG_PHONG, VAN_THU, CHUYEN_VIEN).
    + Huy hiệu Phòng ban hiện tại (`currentUser.department`).
    + Chuông Thông báo thông minh (Notification Bell): Hiển thị số lượng hồ sơ đang chờ duyệt theo vai trò; popup danh sách công việc cần xử lý gấp.
    + Nút Mở Cài đặt nhận diện thương hiệu & Quản trị hệ thống.
    + Avatar người dùng kèm nút Đăng xuất.
- **Thanh Điều hướng Trái (Desktop Left Sidebar, rộng 256px - 288px):**
  - Danh sách 5 phân hệ chính với icon chuyên dụng, tiêu đề, phụ đề, và huy hiệu đếm trạng thái.
  - Khối phím tắt nhanh:
    + **Trợ lý AI Qwen 2.5** (RAG AI trên máy chủ nội bộ IIS).
    + **Nhắn Tin Trực Tuyến** (Kèm chỉ báo số tin nhắn chưa đọc).
  - Chân Sidebar: Nút Cài đặt & Quản trị kèm trạng thái "Hệ thống: Trực tuyến / Sẵn sàng".
- **Thanh Điều hướng Mobile (Bottom Navigation Bar):**
  - 5 nút chạm nhanh tối ưu cảm ứng (chiều cao tối thiểu 44px) kèm Slide-over Drawer khi bấm nút Hamburger.
- **Nút Fast Launcher góc dưới bên phải (Floating Action Buttons):**
  - Nút viên thuốc gradient xanh "AI Qwen 2.5 Tra cứu".
  - Nút tròn xanh lá "Nhắn tin trực tuyến" có badge số tin chưa đọc nhảy xung động (pulse animation).

---

## 3. ĐẶC TẢ CHI TIẾT 5 PHÂN HỆ VÀ CÁC CHỨC NĂNG CỐT LÕI

### 3.1. Phân hệ 1: Thư Viện HSTL Tổng Hợp (`ThuVienTongHopModule`)
Bao gồm 3 tab chế độ xem:
1. **Tab Cây Danh Mục HSTL 5 Cấp:**
   - Cấp 1: Cơ quan / Tập thể (`Tổng công ty Đường sắt Việt Nam`).
   - Cấp 2: Ban / Đơn vị chuyên môn (Ban Kế hoạch, Ban Tài chính, Ban Hạ tầng, Ban Vận tải,...).
   - Cấp 3: Nhóm lĩnh vực / Khối hồ sơ.
   - Cấp 4: Năm lưu trữ / Hồ sơ dự án.
   - Cấp 5: Hồ sơ tài liệu chi tiết (chứa các tệp văn bản scan, OCR, file PDF có dấu đỏ).
2. **Tab Sơ Đồ Kho Vật Lý 5 Cấp:**
   - Cây vị trí lưu trữ: `Kho -> Dãy -> Kệ -> Tầng -> Hộp lưu trữ`.
   - Bấm vào Hộp sẽ hiển thị danh sách các hồ sơ tài liệu vật lý đang được bảo quản bên trong kèm mã vạch / QR và tọa độ.
3. **Tab Tìm Kiếm Toàn Văn Thông Minh (OCR Search):**
   - Khung tìm kiếm từ khóa hỗ trợ tìm trong Trích yếu, Số ký hiệu, Cơ quan ban hành, và **nội dung bóc tách OCR**.
   - Bộ lọc: Độ mật (Tất cả, THƯỜNG, MẬT), Năm ban hành, Cơ quan ban hành, Loại hồ sơ.
   - **Quy tắc bảo mật 2 cấp (THƯỜNG vs MẬT):**
     + *Tài liệu THƯỜNG:* Tất cả cán bộ trong công ty đều xem được bản scan và OCR.
     + *Tài liệu MẬT:* Chỉ người dùng hoặc phòng ban được chỉ định mới mở được tệp; các tài khoản khác hiển thị nhãn `MẬT - Bị Khóa`, bấm vào hiển thị thông báo từ chối truy cập và ghi vết vào `AuditLog`.

---

### 3.2. Phân hệ 2: Cập Nhật Hồ Sơ Số Hóa (Luồng 1 - `Luong1Module`)
Quy trình khép kín số hóa hồ sơ giấy đã có con dấu đỏ và chữ ký:
1. **Bước 1 - Chuyên viên Số hóa & Quét OCR:**
   - Tải lên tệp scan PDF, hệ thống mô phỏng bóc tách OCR tự động.
   - Nhập số ký hiệu, trích yếu, cơ quan ban hành, ngày ký, số trang, loại tài liệu.
   - Bấm "Trình duyệt Trưởng phòng" -> Trạng thái chuyển thành `PENDING_REVIEW`.
2. **Bước 2 - Trưởng phòng Thẩm tra & Phê duyệt (`Luong1ReviewModal`):**
   - Trưởng phòng xem trước bản PDF và nội dung trích xuất.
   - Chọn hành động:
     + **Phê duyệt:** Chuyển trạng thái sang `WAITING_VAN_THU`.
     + **Trả lại yêu cầu làm rõ / Scan lại:** Chuyển trạng thái sang `REJECTED`, ghi rõ ý kiến nhận xét.
     + **Chuyển phối hợp xác minh liên phòng:** Trạng thái `COORDINATING`.
   - **Chỉ định chế độ bảo mật:**
     + Nếu chọn `THƯỜNG`: Toàn bộ cán bộ cơ quan sẽ xem được khi nạp HSTL.
     + Nếu chọn `MẬT`: Bắt buộc tích chọn danh sách Phòng ban hoặc các Cán bộ cụ thể được phép tiếp cận.
3. **Bước 3 - Văn thư Kiểm tra Bản cứng & Nạp HSTL (`Luong1VanThuArchiveModal`):**
   - Văn thư đối chiếu bản scan với bản cứng gốc có dấu đỏ lưu kho.
   - Chọn Thư mục HSTL Cấp 5 đích để lưu vào cây danh mục.
   - Chọn Tọa độ Kho Vật lý 5 cấp (Kho, Dãy, Kệ, Tầng, Hộp).
   - Chọn Thời hạn bảo quản: `Vĩnh viễn`, `70 năm`, `50 năm`, `20 năm`, `10 năm`, `5 năm`.
   - Bấm "Xác nhận Nạp Thư viện HSTL" -> Tài liệu chính thức được lưu vào `DossierDocuments`.

---

### 3.3. Phân hệ 3: Soạn Thảo, Giao Việc & Báo Cáo (`Luong2Module`)
Gồm 2 khu vực nghiệp vụ:

#### Khu vực A: Quản Lý Nhiệm Vụ & Giao Việc Lãnh Đạo (Luồng 3 - `TaskManagementSection`)
- **Khởi tạo công việc:** Lãnh đạo hoặc Chuyên viên tạo việc mới: Tiêu đề, Nội dung chỉ đạo, Mức độ khẩn (Hỏa tốc, Thượng khẩn, Khẩn, Thường), Thời hạn xử lý, Cán bộ chủ trì, Cán bộ phối hợp, Tệp văn bản chỉ đạo đính kèm.
- **NGUYÊN TẮC BẢN QUYỀN TÁC GIẢ BẮT BUỘC (Strict Task Ownership):**
  - **"Nhân viên / Cán bộ soạn thảo công việc này chỉ nhân viên đó mới được quyền Sửa, Xóa công việc đó."**
  - Khi tài khoản khác mở xem, các nút `Sửa` và `Xóa` bị ẩn hoàn toàn, thay thế bằng huy hiệu `Người soạn: [Tên cán bộ]` kèm icon Khóa (`Lock`).
- **Thực hiện & Báo cáo kết quả:**
  - Cán bộ chủ trì mở nhiệm vụ, phân công nhân sự phối hợp nội bộ.
  - Soạn tóm tắt kết quả xử lý, đính kèm báo cáo / tờ trình hoàn thành, bấm "Gửi Báo cáo Hoàn thành" -> Chuyển sang `COMPLETED_PENDING_REVIEW`.
- **Lãnh đạo Nghiệm thu & Đánh giá:**
  - Lãnh đạo / Trưởng phòng mở modal Nghiệm thu:
    + Đánh giá xếp loại: `Xuất sắc`, `Hoàn thành tốt`, `Đạt yêu cầu`, `Cần bổ sung`.
    + Nhập ý kiến nhận xét / chỉ đạo.
    + Phân loại độ bảo mật Thư viện HSTL: `THƯỜNG` hoặc `MẬT` (kèm danh sách phân quyền).
    + Bấm "Duyệt nghiệm thu" -> Chuyển sang `WAITING_VAN_THU_ARCHIVE`.
- **Văn thư Tiếp nhận Bản cứng & Nạp HSTL:**
  - Cán bộ Văn thư tiếp nhận bản in báo cáo kết quả có con dấu đỏ và chữ ký.
  - Chọn Thư mục HSTL Cấp 5, gán vị trí Hộp/Kho 5 cấp, thời hạn bảo quản -> Bấm nạp vào Thư viện HSTL -> Chuyển trạng thái sang `HSTL_ARCHIVED`.

#### Khu vực B: Bổ sung tài liệu vào hồ sơ đã có (Luồng 2 - `Luong2SupplementSection`)
- Chọn một Hồ sơ cấp 5 hiện hữu trong Thư viện HSTL.
- Đề xuất bổ sung tài liệu phát sinh mới (file scan, số ký hiệu, nội dung).
- Trình Trưởng phòng duyệt bổ sung -> Văn thư xếp tệp vào hộp vật lý.

---

### 3.4. Phân hệ 4: Sổ Văn Bản Đến (`Luong3Module`)
- **Đăng ký văn bản đến:** Tiếp nhận công văn từ Bộ GTVT, Ủy ban Quản lý vốn, các đối tác bên ngoài hoặc liên đơn vị.
- **Số hóa & OCR:** Tự động điền số đến, ngày đến, cơ quan ban hành, trích yếu văn bản.
- **Bút phê chỉ đạo:** Lãnh đạo Tổng công ty ghi ý kiến chỉ đạo trực tiếp vào phiếu xử lý văn bản, chỉ định đơn vị chủ trì và đơn vị phối hợp.
- **Theo dõi tiến độ:** Cảnh báo hạn xử lý, đính kèm văn bản giải quyết.

---

### 3.5. Phân hệ 5: Sổ Văn Bản Đi (`Luong4Module`)
- **Đăng ký soạn thảo văn bản đi:** Tạo tờ trình, công văn, quyết định ban hành.
- **Quy trình ký duyệt điện tử:**
  - Ký nháy của Chuyên viên soạn thảo và Trưởng phòng thẩm tra.
  - Ký số chính thức của Lãnh đạo Tổng công ty (hiển thị chứng thư số PKI và dấu đỏ điện tử).
- **Cấp số & Phát hành:** Văn thư cấp số đi chính thức, đóng dấu số, gửi phát hành và tự động lưu bản sao số hóa vào Thư viện HSTL.

---

### 3.6. Các Bộ Công Cụ Dùng Chung & Trợ Lý Tích Hợp

#### 1. Trình Xem Hồ Sơ Đa Năng (`DocumentViewerModal`)
Hiển thị toàn diện hồ sơ tài liệu qua 5 tab:
- **Tab 1 - Xem trước PDF/Scan:** Trình xem tài liệu tương tác với công cụ phóng to, thu nhỏ, xoay trang, tải về và hiển thị con dấu đỏ.
- **Tab 2 - Toàn văn OCR:** Hiển thị văn bản trích xuất với tính năng tô sáng (highlight) từ khóa tìm kiếm, nút sao chép toàn bộ văn bản.
- **Tab 3 - Thông tin & Bảo mật (Metadata):** Hiển thị số ký hiệu, ngày ký, người ký, cơ quan, phân loại THƯỜNG / MẬT và danh sách các đơn vị/người được cấp quyền xem.
- **Tab 4 - Tọa độ Kho Lưu Trữ:** Bản đồ trực quan vị trí hộp tài liệu: `Kho -> Dãy -> Kệ -> Tầng -> Hộp`.
- **Tab 5 - Lịch sử & Phiên bản:** Nhật ký thời gian từ lúc tạo, trình duyệt, thẩm tra, ký số cho đến khi Văn thư nạp kho.

#### 2. Trợ Lý AI Qwen 2.5 & Tin Nhắn Nội Bộ (`UnifiedChatbotAndMessengerModal`)
- **Tab AI Qwen 2.5 (RAG AI trên IIS nội bộ):**
  - Trợ lý ảo hiểu rõ quy chế nội bộ Tổng công ty Đường sắt Việt Nam.
  - Tra cứu nhanh nội dung hồ sơ, điều khoản hợp đồng, quy trình bảo dưỡng đường ray, toa xe, quy định văn thư lưu trữ.
  - Trích dẫn trực tiếp tên hồ sơ, số ký hiệu kèm nút bấm mở ngay `DocumentViewerModal`.
- **Tab Nhắn Tin Trực Tuyến (Internal Messenger):**
  - Danh sách kênh trò chuyện theo Phòng ban và tin nhắn riêng giữa các cán bộ.
  - Tính năng độc quyền: **"Đính kèm Hồ sơ HSTL"** vào tin nhắn để người nhận có thể click xem ngay tài liệu mà không cần tìm kiếm thủ công.

#### 3. Cài Đặt, Cá Nhân Hóa & Nhật Ký Kiểm Toán (`SettingsPersonalizationModal`)
- Đổi màu sắc nhận diện thương hiệu thời gian thực (Primary Accent Color picker).
- Đổi tên cơ quan, khẩu hiệu hành động, logo.
- Quản lý danh mục phòng ban, danh sách cán bộ, phân bổ vai trò RBAC.
- Quản trị Metadata Schema mở rộng cho hồ sơ HSTL.
- **Xem Nhật Ký Kiểm Toán (Audit Logs):** Bảng tra cứu vết mọi hành vi trong hệ thống (Đăng nhập, Tạo việc, Sửa việc, Phê duyệt, Xem tài liệu mật, Nạp kho HSTL).

---

## 4. DỮ LIỆU HẠT GIỐNG CHUẨN (SEED DATA)

Khi khởi tạo, ứng dụng cần nạp sẵn bộ dữ liệu mẫu trong `initialData.ts`:
1. **5 Người dùng mẫu tương ứng 5 vai trò:**
   - `USR_ADMIN`: Nguyễn Quản Trị (Vai trò: `ADMIN` - Trung tâm CNTT ĐSVN).
   - `USR_LANHDAO`: Đặng Sỹ Mạnh (Vai trò: `LANH_DAO` - Chủ tịch HĐTV / Tổng Giám đốc).
   - `USR_TRUONGPHONG`: Trần Kế Hoạch (Vai trò: `TRUONG_PHONG` - Trưởng Ban Kế hoạch - Kinh doanh).
   - `USR_VANTHU`: Lê Thị Văn Thư (Vai trò: `VAN_THU` - Cán bộ Văn thư Lưu trữ Văn phòng).
   - `USR_CHUYENVIEN`: Hoàng Chuyên Viên (Vai trò: `CHUYEN_VIEN` - Chuyên viên Ban Kế hoạch).
2. **Danh mục Ban / Phòng ban:** Ban Kế hoạch - Kinh doanh, Ban Tài chính - Kế toán, Ban Quản lý Hạ tầng, Ban Vận tải - An toàn, Ban Tổ chức Cán bộ, Văn phòng Tổng công ty.
3. **Danh mục Kho lưu trữ 5 cấp:**
   - Kho A (Kho Lưu trữ Trung tâm ĐSVN - 118 Lê Duẩn, Hà Nội) -> Dãy D1 -> Kệ K03 -> Tầng T2 -> Hộp H08.
   - Kho B (Kho Lưu trữ Kỹ thuật Tháp Chàm) -> Dãy D2 -> Kệ K01 -> Tầng T3 -> Hộp H12.

---

## 5. MASTER PROMPT HOÀN CHỈNH CHO GOOGLE AI STUDIO
*(Hãy sao chép toàn bộ khối lệnh dưới đây và gửi vào ô chat của Google AI Studio mới)*

```markdown
Bạn là Kiến trúc sư phần mềm & Lập trình viên Frontend xuất sắc. Hãy xây dựng một ứng dụng Single Page Application (React 18+, Vite, TypeScript, Tailwind CSS, lucide-react, motion/react) hoàn chỉnh, chuyên nghiệp và có độ hoàn thiện tối đa mang tên:
"HỆ THỐNG QUẢN LÝ HỒ SƠ TÀI LIỆU (HSTL) - TỔNG CÔNG TY ĐƯỜNG SẮT VIỆT NAM (VNR)"

### YÊU CẦU THIẾT KẾ GIAO DIỆN & MÀU SẮC DOANH NGHIỆP:
1. Tone màu nhận diện chính: Xanh Đường Sắt Việt Nam (#003882) với gradient tiêu chuẩn: linear-gradient(135deg, #003882 0%, #094ba1 50%, #002b66 100%). Hỗ trợ đổi màu thương hiệu thời gian thực trong Settings.
2. Thiết kế giao diện phong cách "Windows 12 Corporate Shell":
   - Top Header cố định: Logo "DS", Tên cơ quan "TỔNG CÔNG TY ĐƯỜNG SẮT VIỆT NAM", Tiêu đề phần mềm, Bộ chọn nhanh 5 Vai trò (ADMIN, LANH_DAO, TRUONG_PHONG, VAN_THU, CHUYEN_VIEN), Chuông thông báo công việc chờ duyệt, Avatar và Đăng xuất.
   - Left Sidebar (Desktop) & Bottom Navigation + Drawer (Mobile) truy cập 5 Phân hệ chính:
     (1) Thư Viện Tổng Hợp (Kho số HSTL & Sơ đồ kho vật lý)
     (2) Cập Nhật Hồ Sơ (Luồng 1 - Số hóa hồ sơ đã có)
     (3) Soạn Thảo & Báo Cáo (Luồng 2 & Luồng 3 - HSCV & Giao việc)
     (4) Sổ Văn Bản Đến (Tiếp nhận, OCR & Bút phê chỉ đạo)
     (5) Sổ Văn Bản Đi (Soạn thảo, Ký số & Phát hành lưu HSTL)
   - Phím tắt tiện ích: Nút mở Trợ lý AI Qwen 2.5 và Nhắn tin trực tuyến (kèm floating action button góc phải màn hình).

### CÁC NGUYÊN TẮC NGHIỆP VỤ BẮT BUỘC (CRITICAL CONSTRAINTS):
1. NGUYÊN TẮC BẢN QUYỀN TÁC GIẢ NHIỆM VỤ (LUỒNG 3):
   - "Chỉ nhân viên / cán bộ soạn thảo công việc mới có quyền Sửa, Xóa công việc đó."
   - Khi tài khoản khác mở xem, các nút Sửa / Xóa phải bị ẩn và hiển thị huy hiệu Khóa kèm tên người soạn thảo.
2. NGUYÊN TẮC BẢO MẬT HSTL 2 CẤP (THƯỜNG vs MẬT):
   - Tài liệu THƯỜNG: Tất cả cán bộ trong cơ quan đều mở xem được bản scan và OCR.
   - Tài liệu MẬT: Bắt buộc Trưởng phòng/Lãnh đạo khi duyệt phải chỉ định danh sách Phòng ban hoặc Người dùng cụ thể được xem. Người không có quyền khi bấm xem sẽ bị chặn truy cập và ghi vết Audit Log.
3. LUỒNG 1 KHÉP KÍN (SỐ HÓA HỒ SƠ ĐÃ CÓ):
   - Chuyên viên scan & OCR -> Trình Trưởng phòng thẩm tra (Duyệt / Trả lại / Phối hợp, chỉ định Thường/Mật) -> Văn thư kiểm tra bản cứng có dấu đỏ, gán tọa độ kho vật lý 5 cấp (Kho/Dãy/Kệ/Tầng/Hộp), thời hạn bảo quản và nạp Thư viện HSTL.
4. LUỒNG 3 KHÉP KÍN (GIAO VIỆC & NGHIỆM THU):
   - Giao việc mới -> Cán bộ chủ trì tiếp nhận, phối hợp & nộp báo cáo hoàn thành -> Lãnh đạo nghiệm thu, xếp loại (Xuất sắc, Tốt, Đạt, Cần bổ sung) và chỉ định độ Mật -> Văn thư tiếp nhận bản in dấu đỏ, gán kho vật lý 5 cấp và nạp Thư viện HSTL.
5. BỘ CÔNG CỤ DÙNG CHUNG:
   - DocumentViewerModal: 5 tab toàn diện (Xem PDF/Scan con dấu, OCR toàn văn highlight từ khóa, Metadata & Quyền Mật, Tọa độ kho 5 cấp, Lịch sử phiên bản).
   - UnifiedChatbotAndMessengerModal: Tab 1 là AI Qwen 2.5 RAG tra cứu HSTL; Tab 2 là Messenger nội bộ có nút đính kèm liên kết hồ sơ HSTL.
   - SettingsPersonalizationModal: Đổi màu nhận diện, quản lý người dùng, schema metadata và xem Nhật ký kiểm toán (Audit Logs).

Toàn bộ dữ liệu được duy trì qua localStorage kết hợp CustomEvent('hstl_state_change') để đồng bộ mượt mà giữa các thành phần. Hãy đảm bảo giao diện sắc nét, chuẩn responsive, typography rõ ràng, không có lỗi linter và biên dịch build thành công.
```

---

## 6. HƯỚNG DẪN KIỂM TRA & NGHIỆM THU SAU KHI TRIỂN KHAI
Khi dự án được AI Studio dựng lại, hãy thực hiện bài kiểm tra 5 bước sau để xác nhận tính chính xác:
1. **Kiểm tra Đăng nhập & Đổi vai trò:** Thử chuyển đổi giữa 5 tài khoản trên Header; kiểm tra các quyền và số lượng thông báo thay đổi tức thì.
2. **Kiểm tra Bản quyền Nhiệm vụ (Luồng 3):** Dùng `CHUYEN_VIEN` tạo 1 công việc. Chuyển sang tài khoản `TRUONG_PHONG` hoặc `LANH_DAO` kiểm tra xem nút Sửa/Xóa có bị ẩn và hiện icon Khóa hay không.
3. **Kiểm tra Bảo mật Mật / Thường:** Tạo 1 tài liệu ở Luồng 1, Trưởng phòng duyệt và đánh dấu `MẬT` (chỉ cho Ban Kế hoạch xem). Đăng nhập bằng tài khoản thuộc phòng ban khác để kiểm tra xem hệ thống có chặn mở tài liệu hay không.
4. **Kiểm tra Trình xem tài liệu (DocumentViewerModal):** Mở xem 1 tài liệu, bấm chuyển qua lại cả 5 tab (Xem trước, OCR, Metadata, Kho vật lý, Phiên bản).
5. **Kiểm tra Trợ lý AI & Nhắn tin:** Bấm nút nổi góc phải, thử tra cứu một từ khóa trên AI Qwen 2.5 và gửi thử 1 tin nhắn kèm liên kết hồ sơ.

---
*Tài liệu được biên soạn đồng bộ với mã nguồn phiên bản chuẩn của Hệ thống Quản lý Hồ sơ Tài liệu Tổng công ty Đường sắt Việt Nam.*
