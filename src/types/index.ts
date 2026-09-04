export type UserRole = 'CHUYEN_VIEN' | 'TRUONG_PHONG' | 'VAN_THU' | 'ADMIN' | 'LANH_DAO';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  roleTitle: string;
  department: string;
  avatar: string;
  email: string;
  phone?: string;
  isActive?: boolean;
}

export interface DepartmentItem {
  id: string;
  code: string;
  name: string;
  description?: string;
  headName?: string;
  isActive: boolean;
}

export interface UnitItem {
  id: string;
  code: string;
  name: string;
  type: 'TRUC_THUOC' | 'DOI_TAC' | 'CO_QUAN_NGOAI';
  address?: string;
  isActive: boolean;
}

export interface IssuingAgencyItem {
  id: string;
  code: string;
  name: string;
  shortName?: string;
  isActive: boolean;
}

export interface BrandConfig {
  softwareName: string;
  softwareSubtitle: string;
  agencyName: string;
  agencyUnit: string;
  logoUrl: string;
  primaryAccent: string; // HEX e.g. #0078D4
  accentName: string;
  wallpaperId: string;
  wallpaperCustomUrl?: string;
  isDarkMode: boolean;
  version: string;
  footerText: string;
}

export type RetentionPeriod = 'VĨNH VIỄN' | '70 NĂM' | '50 NĂM' | '20 NĂM' | '10 NĂM' | '5 NĂM';

export interface PhysicalLocation {
  phongBan: string; // 1. Phòng / Ban / Đơn vị con (e.g. "Văn phòng Tổng công ty", "Ban Kế hoạch - Kinh doanh"...)
  ke: string;       // 2. Kệ (e.g. "Kệ K-01 (Văn bản Đến)")
  ngan: string;     // 3. Ngăn (e.g. "Ngăn N-01")
  hop: string;      // 4. Hộp / Cặp (e.g. "Hộp / Cặp H-01")
  hoSo: string;     // 5. Hồ sơ (e.g. "Hồ sơ số 01 (HS-01)")
  maVach: string;   // Mã vạch định vị (e.g. "VP-K01-N01-H01-HS01")
  // Backward compatibility:
  donVi?: string;
  khuVuc?: string;
  kho?: string;
}

// -------------------------------------------------------------
// LUỒNG 1: CẬP NHẬT HỒ SƠ VÀO THƯ VIỆN HSTL
// -------------------------------------------------------------
export type Luong1Status = 
  | 'DRAFT' 
  | 'PENDING_REVIEW'     // Chuyên viên đã trình Trưởng phòng kiểm tra
  | 'COORDINATING'       // Trưởng phòng đã chuyển các phòng ban/cá nhân phối hợp lấy ý kiến
  | 'REVIEW_APPROVED'    // Trưởng phòng đã phê duyệt đạt
  | 'PENDING_VAN_THU'    // Trưởng phòng đã chuyển Văn thư phê duyệt nhập Thư viện HSTL
  | 'PRINTED_FOR_LEADER' // Đã in phiếu trình & xuất bản hồ sơ trình Lãnh đạo
  | 'LEADER_APPROVED'    // Lãnh đạo đã duyệt và đóng dấu đỏ
  | 'ARCHIVED'           // Đã định vị kho & hoàn tất nhập Thư viện HSTL
  | 'REJECTED';          // Trưởng phòng từ chối / trả lại yêu cầu chỉnh sửa

export interface SecretAccessPermissions {
  userIds: string[];           // Danh sách ID cá nhân được phép xem
  departmentNames: string[];   // Danh sách Tên phòng ban được phép xem
}

// -------------------------------------------------------------
// PHIÊN BẢN TÀI LIỆU (DOCUMENT VERSIONING: v1, v2, v3...)
// -------------------------------------------------------------
export interface DocumentVersion {
  id: string;
  version: number;             // 1, 2, 3...
  versionLabel: string;        // e.g. "v1.0 - Bản gốc ban đầu", "v2.0 - Bổ sung phụ lục kỹ thuật"
  fileName: string;
  fileSize: string;
  fileUrl: string;
  fileType?: string;
  uploadedAt: string;
  uploadedById: string;
  uploadedByName: string;
  uploadedByRole?: string;
  changeNote: string;          // Ghi chú lý do cập nhật / tóm tắt nội dung thay đổi
  isCurrent?: boolean;         // Đang là phiên bản áp dụng chính
}

export interface ExistingDocument {
  id: string;
  soKyHieu: string;        // Số ký hiệu văn bản (hoặc số dự thảo/tờ trình)
  coQuanBanHanh: string;   // Cơ quan / Đơn vị ban hành
  ngayBanHanh: string;     // Ngày ban hành / Ngày lập hồ sơ (YYYY-MM-DD)
  trichYeu: string;        // Trích yếu nội dung văn bản
  loaiVanBan: string;      // Quyết định, Báo cáo, Hợp đồng, Biên bản, Tờ trình, Hồ sơ hoàn công...
  fileScanUrl: string;     // Tệp đính kèm / Tệp scan
  fileName: string;
  fileSize: string;
  fileType: string;
  currentVersion?: number;     // Phiên bản hiện hành: 1, 2, 3...
  versions?: DocumentVersion[]; // Lịch sử các phiên bản tài liệu (v1, v2...)
  hasStamp?: boolean;      // true: Đã có dấu đỏ | false: Chưa có dấu (cần trình duyệt)
  ocrText: string;
  ocrExtracted: {
    soKyHieu?: string;
    coQuan?: string;
    ngayBanHanh?: string;
    trichYeu?: string;
    hasRedSeal: boolean;
    confidence: number;
  };
  createdBy: string;       // ID chuyên viên
  createdByName: string;
  createdAt: string;
  assignedReviewerId: string; // ID Trưởng phòng thẩm tra
  assignedReviewerName: string;
  submissionComment?: string; // Ý kiến / Lời nhắn của Chuyên viên khi trình Trưởng phòng (tùy chọn)
  status: Luong1Status;
  reviewNote?: string;
  reviewedAt?: string;
  
  // Chuyển phối hợp
  coordinations?: CoordinationFeedback[];
  
  // In xuất bản & Trình Lãnh đạo
  printedInfo?: {
    printedAt: string;
    printedBy: string;
    targetLeaderName: string;
    printNote?: string;
  };

  // Xác nhận sau khi Lãnh đạo ký & đóng dấu
  leaderSignedInfo?: {
    leaderName: string;
    signedDate: string;
    notes?: string;
    scanDauDoUrl?: string;
    scanFileName?: string;
  };

  retentionPeriod?: RetentionPeriod;
  physicalLocation?: PhysicalLocation;
  archivedAt?: string;
  archivedBy?: string;
  archivedByName?: string;
  securityLevel?: 'THƯỜNG' | 'MẬT';
  secretAccessPermissions?: SecretAccessPermissions;
  customMetadata?: Record<string, any>;
}

// -------------------------------------------------------------
// LUỒNG 2: SOẠN THẢO DỰ THẢO, PHỐI HỢP & BÁO CÁO KẾT QUẢ
// -------------------------------------------------------------
export type Luong2Step = 
  | 'DRAFT'                   // Chuyên viên soạn thảo
  | 'PENDING_DEPT_LEAD'       // Trình Trưởng phòng kiểm tra
  | 'COORDINATING'            // Đang lấy ý kiến phối hợp các phòng ban
  | 'DEPT_APPROVED'           // Trưởng phòng đã duyệt dự thảo
  | 'PRINTED_FOR_LEADER'      // Đã in bản giấy trình Lãnh đạo ngoài đời thực
  | 'LEADER_ASSIGNED'         // Lãnh đạo đã duyệt giấy & giao việc trực tiếp
  | 'WAITING_VAN_THU_ARCHIVE' // Trưởng phòng yêu cầu Văn thư nhập Thư viện HSTL
  | 'REPORT_SUBMITTED'        // Chuyên viên nộp Báo cáo kết quả kèm minh chứng
  | 'HSTL_ARCHIVED'           // Văn thư đã tiếp nhận & lưu trữ vào Thư viện HSTL
  | 'REJECTED';               // Bị từ chối / yêu cầu sửa lại

export interface WorkflowTimelineEvent {
  id: string;
  step: string;
  title: string;
  time: string;
  actor: string;
  actorRole: string;
  action: string;
  comment?: string;
  isEvidence?: boolean;
  statusColor?: string;
}

export interface CoordinationFeedback {
  id: string;
  unitId: string;
  unitName: string;
  officerId: string;
  officerName: string;
  deadlineSLA: string;
  status: 'PENDING' | 'FEEDBACK_PROVIDED';
  feedbackText?: string;
  feedbackFile?: string;
  feedbackFileName?: string;
  feedbackDate?: string;
}

export interface DraftDossier {
  id: string;
  code: string;               // Mã hồ sơ công việc e.g. HSCV-2026-089
  trichYeu: string;           // Trích yếu nội dung dự thảo
  loaiVanBan: string;
  field: string;              // Lĩnh vực: Kỹ thuật, Tổ chức cán bộ, Tài chính, Kế hoạch...
  creatorId: string;
  creatorName: string;
  creatorDepartment: string;
  createdAt: string;
  draftFileUrl: string;
  draftFileName: string;
  draftFileSize: string;
  currentVersion?: number;     // Phiên bản dự thảo hiện tại: 1, 2, 3...
  versions?: DocumentVersion[]; // Lịch sử các phiên bản dự thảo (v1, v2...)
  currentStep: Luong2Step;
  deptLeadId: string;
  deptLeadName: string;
  rejectionReason?: string;

  // Timeline bắt đầu soạn thảo hoặc bắt đầu giao việc kèm comment làm bằng chứng
  assignmentEvidence?: {
    startedAt: string;
    startedBy: string;
    startedByRole: string;
    type: 'SOAN_THAO' | 'GIAO_VIEC';
    comment: string;
    initialDirective?: string;
  };
  timelineEvents?: WorkflowTimelineEvent[];
  
  // Phối hợp
  coordinations: CoordinationFeedback[];
  
  // In trình Lãnh đạo thực tế
  printedAt?: string;
  printedBy?: string;
  leaderPaperApproval?: {
    leaderName: string;
    approvalDate: string;
    directiveNote: string;
    assignedOfficer: string;
    paperSignatureConfirmed: boolean;
  };

  // Trưởng phòng yêu cầu Văn thư đưa vào Thư viện HSTL
  deptLeadRequestToVanThu?: {
    requestedAt: string;
    requestedBy: string;
    requestedByRole: string;
    note: string;
    leaderSignedConfirmed: boolean;
  };

  // Báo cáo kết quả
  resolutionReport?: {
    reportTitle: string;
    reportSummary: string;
    reportFileUrl: string;
    reportFileName: string;
    proofFiles: Array<{ name: string; url: string; size: string }>;
    submittedAt: string;
    submittedBy: string;
  };

  // Lưu trữ Thư viện HSTL (Chỉ Văn thư thực hiện)
  hstlArchiveInfo?: {
    retentionPeriod: RetentionPeriod;
    physicalLocation: PhysicalLocation;
    archivedAt: string;
    archivedBy: string;
    archivedByRole?: string;
    hstlCatalogId: string;
  };
  customMetadata?: Record<string, any>;
}

// -------------------------------------------------------------
// LUỒNG 3: QUẢN LÝ & SỐ HÓA SỔ VĂN BẢN ĐẾN
// -------------------------------------------------------------
export interface IncomingDocument {
  id: string;
  soDen: number;             // Số đến tự động tăng (ví dụ: 1042)
  namDen: number;            // Năm đăng ký (ví dụ: 2026)
  soKyHieuGoc: string;       // Số hiệu gốc (ví dụ: 24/BC-KTHUAT)
  coQuanGui: string;         // Cơ quan gửi (ví dụ: Cục Đường sắt Việt Nam)
  ngayBanHanh: string;       // Ngày ban hành gốc
  ngayDen: string;           // Ngày văn thư tiếp nhận
  trichYeu: string;          // Trích yếu nội dung
  loaiVanBan: string;        // Báo cáo, Công văn, Tờ trình, Quyết định...
  fileScanUrl: string;       // Tệp scan có dấu đỏ
  fileName: string;
  fileSize: string;
  ocrExtracted: {
    soDenSuggested?: number;
    soKyHieuSuggested?: string;
    coQuanSuggested?: string;
    ngayBanHanhSuggested?: string;
    trichYeuSuggested?: string;
    fullOcrText: string;
    confidence: number;
  };
  donViChuTri: string;       // Đơn vị chủ trì giải quyết
  donViPhoiHop: string[];    // Đơn vị phối hợp
  canBoTheoDoi: string;      // Cán bộ được phân công theo dõi
  hanXuLy: string;           // Hạn xử lý SLA (YYYY-MM-DD)
  trangThaiXuLy: 'CHUA_XU_LY' | 'DANG_XU_LY' | 'DA_HOAN_THANH' | 'QUA_HAN';
  isArchivedToHSTL: boolean;
  hstlCode?: string;
  retentionPeriod?: RetentionPeriod;
  physicalLocation?: PhysicalLocation;
  registeredBy: string;
  registeredByName: string;
  customMetadata?: Record<string, any>;
}

// -------------------------------------------------------------
// SỔ VĂN BẢN ĐI (VĂN BẢN ĐÃ CÓ SỐ, CHỮ KÝ & ĐÓNG DẤU - LƯU HSTL)
// -------------------------------------------------------------
export type OutgoingDocType = 
  | 'QUYET_DINH'    // QĐ
  | 'CONG_VAN'      // CV
  | 'THONG_BAO'     // TB
  | 'BIEN_BAN'      // BB
  | 'TO_TRINH'      // TTr
  | 'KE_HOACH'      // KH
  | 'BAO_CAO'       // BC
  | 'HUONG_DAN'     // HD
  | string;

export interface OutgoingDocument {
  id: string;
  soDiNumber?: number;       // Số thứ tự trong sổ (ví dụ: 158)
  soDiFullCode: string;      // Số ký hiệu đã có của văn bản (ví dụ: "158/QĐ-ĐS", "199/CV-TCHC")
  loaiVanBan: OutgoingDocType;
  loaiVanBanLabel: string;   // Quyết định, Công văn...
  donViSoanThao: string;     // Phòng Ban tham mưu soạn thảo
  chuyenVienSoanThao: string;
  nguoiKy: string;           // Lãnh đạo ký duyệt thực tế (Tổng Giám Đốc, Phó Tổng GĐ...)
  chucVuNguoiKy: string;
  ngayKy: string;            // Ngày ký ban hành
  trichYeu: string;          // Trích yếu nội dung
  noiNhan: string;           // Nơi nhận dạng chuỗi hiển thị
  noiNhanDepartments?: string[]; // Danh sách tên các phòng ban chức năng nội bộ được nhận
  noiNhanUserIds?: string[];      // Danh sách ID cá nhân nội bộ (Giám đốc, Phó Giám đốc, cán bộ)
  noiNhanUserNames?: string[];    // Danh sách tên cá nhân nội bộ (để hiển thị và tra cứu nhanh)
  noiNhanExternal?: string;       // Đơn vị ngoài (Bộ GTVT, Cục ĐSVN,...)
  soLuongBan: number;
  fileScanDauDoUrl: string;  // Tệp scan bản có chữ ký Lãnh đạo & dấu đỏ thật
  fileName: string;
  fileSize: string;
  banSaoDienTuIssuedCount: number; // Số lần cấp phát bản sao điện tử
  isArchivedToHSTL: boolean;
  hstlCode: string;
  retentionPeriod: RetentionPeriod;
  physicalLocation: PhysicalLocation;
  registeredBy: string;
  registeredByName: string;
  registeredAt: string;
  customMetadata?: Record<string, any>;
}

// -------------------------------------------------------------
// METADATA SCHEMA CONFIGURATION FOR DOCUMENT TYPES
// -------------------------------------------------------------
export type MetadataFieldType = 'text' | 'number' | 'currency' | 'date' | 'select' | 'boolean';

export interface MetadataFieldDefinition {
  id: string;              // e.g. "field_gia_tri_hd"
  key: string;             // e.g. "giaTriHopDong"
  label: string;           // e.g. "Giá trị hợp đồng (VNĐ)"
  type: MetadataFieldType; // 'currency' | 'text' | 'number' | 'date' | 'select' | 'boolean'
  required: boolean;
  placeholder?: string;
  defaultValue?: any;
  options?: string[];      // For select type e.g. ["Trọn gói", "Theo đơn giá", "Hỗn hợp"]
  unit?: string;           // e.g. "VNĐ", "USD", "Tháng", "Trang", "%"
  description?: string;
}

export interface DocTypeMetadataSchema {
  id: string;              // e.g. "schema_hop_dong"
  docType: string;         // Matches loaiVanBan: e.g. "Hợp đồng kinh tế", "Quyết định", "Hồ sơ thiết kế"
  aliases?: string[];      // Variations for matching e.g. ["Hợp đồng", "Hợp đồng kinh tế", "HĐ"]
  name: string;            // Display title: e.g. "Hồ sơ Hợp đồng kinh tế"
  description?: string;
  badgeColor?: string;     // e.g. "emerald", "blue", "purple", "amber"
  fields: MetadataFieldDefinition[];
  isSystem?: boolean;      // Default built-in schemas
  updatedAt?: string;
}

// -------------------------------------------------------------
// WINDOWS 12 DESKTOP SYSTEM TYPES
// -------------------------------------------------------------
export type AppWindowId = 
  | 'LUONG_1'       // Cập nhật Hồ sơ Đã có
  | 'LUONG_2'       // Soạn thảo & Báo cáo
  | 'LUONG_3'       // Sổ Văn bản Đến
  | 'LUONG_4'       // Sổ Văn bản Đi (Cập nhật & Lưu trữ HSTL)
  | 'THU_VIEN_HSTL' // Thư viện HSTL Tổng Hợp
  | 'KHO_VAT_LY'    // Sơ đồ Kho Vật lý
  | 'ADMIN_BRAND'   // Cấu hình Thương hiệu Admin
  | 'OCR_LAB'       // Trình Thao tác & Quét OCR Chuyên sâu
  | 'DOCUMENT_VIEWER'; // Xem văn bản chi tiết

export interface WindowState {
  id: AppWindowId;
  title: string;
  icon: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
  initialData?: any;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  relatedFlow?: 'LUONG_1' | 'LUONG_2' | 'LUONG_3' | 'LUONG_4';
  relatedDocId?: string;
  isRead: boolean;
}

// -------------------------------------------------------------
// GIAO VIỆC & ĐIỀU HÀNH NHIỆM VỤ (LÃNH ĐẠO -> CHỦ TRÌ -> PHỐI HỢP)
// -------------------------------------------------------------
export type TaskPriority = 'THUONG' | 'KHAN' | 'HOA_TOC';
export type TaskStatus = 
  | 'ASSIGNED'                  // Mới giao việc - Chờ người chủ trì tiếp nhận
  | 'IN_PROGRESS'               // Đang thực hiện (Người chủ trì đã tiếp nhận)
  | 'COORDINATING'              // Đang phối hợp thực hiện
  | 'COMPLETED_PENDING_REVIEW'  // Đã báo cáo xong - Chờ Lãnh đạo nghiệm thu
  | 'COMPLETED'                 // Đã hoàn thành (Chủ trì đã nộp báo cáo kết quả kèm comment/file & Lãnh đạo nghiệm thu)
  | 'EVALUATED';                // Lãnh đạo đã nghiệm thu / đánh giá hoàn tất

export interface TaskCollaborator {
  id: string;
  userId: string;
  userName: string;
  department: string;
  roleTitle?: string;
  assignedAt: string;
  notes?: string;
  deadline?: string;
  status?: string;
}

export interface TaskCompletionReport {
  reportedAt: string;
  reportedById: string;
  reportedByName: string;
  comment: string;                  // Comment / Nội dung báo cáo của người thực hiện
  attachedFileName?: string;        // File đính kèm kết quả báo cáo
  attachedFileSize?: string;
  attachedFileUrl?: string;
}

export interface TaskLeaderEvaluation {
  evaluatedAt: string;
  leaderId: string;
  leaderName: string;
  feedback: string;
  rating?: 'XUAT_SAC' | 'HOAN_THANH_TOT' | 'HOAN_THANH' | 'CAN_BO_SUNG';
}

export interface AssignedTask {
  id: string;
  code: string;                     // Mã công việc: GV-2026-001
  title: string;                    // Tiêu đề / Tên nhiệm vụ giao việc
  description: string;              // Nội dung công việc chi tiết
  priority: TaskPriority;           // Mức độ ưu tiên
  field?: string;                   // Lĩnh vực (tùy chọn)
  deadline: string;                 // Hạn hoàn thành (YYYY-MM-DD)
  
  // Lãnh đạo giao việc (Giám đốc, Trưởng phòng...)
  assignedById: string;
  assignedByName: string;
  assignedByRole: string;
  assignedByDept: string;
  assignedAt: string;
  leaderDirective?: string;         // Ý kiến chỉ đạo của Lãnh đạo
  attachedFileName?: string;        // File tài liệu chỉ đạo / giao việc đính kèm
  attachedFileSize?: string;
  
  // Người chủ trì thực hiện
  primaryAssigneeId: string;        // ID người chủ trì
  primaryAssigneeName: string;      // Tên người chủ trì
  primaryAssigneeDept: string;      // Phòng ban người chủ trì
  primaryAssigneeRole?: string;
  acceptedAt?: string;              // Thời điểm người chủ trì tiếp nhận
  primaryAssigneeNote?: string;     // Ý kiến / Kế hoạch triển khai của người chủ trì
  
  // Người phối hợp thực hiện (do người chủ trì chọn)
  collaborators?: TaskCollaborator[];
  
  // Trạng thái công việc
  status: TaskStatus;
  
  // Báo cáo hoàn thành của người thực hiện
  completionReport?: TaskCompletionReport;
  
  // Đánh giá / Nghiệm thu của Lãnh đạo
  evaluation?: TaskLeaderEvaluation;
}

// -------------------------------------------------------------
// CHATBOT TÌM KIẾM TÀI LIỆU (OLLAMA QWEN 2.5 TRÊN MÁY CHỦ IIS)
// -------------------------------------------------------------
export interface OllamaServerConfig {
  endpointUrl: string; // e.g. "http://localhost:11434" or "http://iis-server/ollama"
  model: string;       // e.g. "qwen2.5:latest", "qwen2.5:7b", "qwen2.5:14b", "qwen2.5:3b"
  temperature: number;
  autoConnect: boolean;
  status: 'CONNECTED' | 'CONNECTING' | 'FALLBACK_LOCAL_RAG' | 'DISCONNECTED';
  lastPingTime?: string;
  errorMessage?: string;
}

export interface MatchedDocumentItem {
  id: string;
  title: string;
  code: string;
  loaiVanBan: string;
  category: 'HSTL' | 'DRAFT' | 'INCOMING' | 'OUTGOING';
  coQuanBanHanh?: string;
  ngayBanHanh?: string;
  locationSummary?: string;
  status?: string;
  relevanceScore?: number;
  snippet?: string;
  rawDoc: any;
}

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  matchedDocs?: MatchedDocumentItem[];
  modelUsed?: string;
  isSearching?: boolean;
}

// -------------------------------------------------------------
// NHẮN TIN TRỰC TUYẾN GIỮA CÁC USER (ONLINE USER CHAT)
// -------------------------------------------------------------
export interface AttachedDocumentRef {
  id: string;
  code: string;
  title: string;
  loaiVanBan: string;
  category: 'HSTL' | 'DRAFT' | 'INCOMING' | 'OUTGOING';
  rawDoc?: any;
}

export interface UserChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  senderDepartment?: string;
  senderAvatar?: string;
  receiverId: string; // User ID or 'GENERAL_CHANNEL'
  content: string;
  timestamp: string;
  createdAt: number;
  isRead: boolean;
  attachedDoc?: AttachedDocumentRef;
}

