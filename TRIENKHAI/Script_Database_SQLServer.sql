-- ==============================================================================
-- KỊCH BẢN KHỞI TẠO CƠ SỞ DỮ LIỆU MICROSOFT SQL SERVER
-- DỰ ÁN: HỆ THỐNG QUẢN TRỊ THƯ VIỆN HỒ SƠ TÀI LIỆU (HSTL) VÀ VĂN BẢN ĐIỆN TỬ
-- ĐƠN VỊ ÁP DỤNG: TỔNG CÔNG TY ĐƯỜNG SẮT VIỆT NAM (VNR)
-- PHIÊN BẢN: v4.8 (Tương thích SQL Server 2016, 2019, 2022, Azure SQL)
-- VỊ TRÍ LƯU: /TRIENKHAI/Script_Database_SQLServer.sql
-- ==============================================================================

USE master;
GO

-- 1. TẠO DATABASE (NẾU CHƯA TỒN TẠI)
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'QL_HSTL_VNR')
BEGIN
    CREATE DATABASE [QL_HSTL_VNR]
    COLLATE Vietnamese_CI_AS;
    PRINT N'>>> Đã tạo thành công cơ sở dữ liệu [QL_HSTL_VNR]';
END
GO

USE [QL_HSTL_VNR];
GO

-- ==============================================================================
-- 2. XÓA BẢNG CŨ THEO THỨ TỰ RÀNG BUỘC KHÓA NGOẠI (NẾU CẦN TẠO LẠI)
-- ==============================================================================
IF OBJECT_ID('dbo.AuditLogs', 'U') IS NOT NULL DROP TABLE dbo.AuditLogs;
IF OBJECT_ID('dbo.ChatMessages', 'U') IS NOT NULL DROP TABLE dbo.ChatMessages;
IF OBJECT_ID('dbo.DraftAppraisals', 'U') IS NOT NULL DROP TABLE dbo.DraftAppraisals;
IF OBJECT_ID('dbo.DraftDossiers', 'U') IS NOT NULL DROP TABLE dbo.DraftDossiers;
IF OBJECT_ID('dbo.OutgoingDocuments', 'U') IS NOT NULL DROP TABLE dbo.OutgoingDocuments;
IF OBJECT_ID('dbo.IncomingDocuments', 'U') IS NOT NULL DROP TABLE dbo.IncomingDocuments;
IF OBJECT_ID('dbo.DossierDocuments', 'U') IS NOT NULL DROP TABLE dbo.DossierDocuments;
IF OBJECT_ID('dbo.DossierFolders', 'U') IS NOT NULL DROP TABLE dbo.DossierFolders;
IF OBJECT_ID('dbo.PhysicalLocations', 'U') IS NOT NULL DROP TABLE dbo.PhysicalLocations;
IF OBJECT_ID('dbo.Users', 'U') IS NOT NULL DROP TABLE dbo.Users;
IF OBJECT_ID('dbo.Departments', 'U') IS NOT NULL DROP TABLE dbo.Departments;
IF OBJECT_ID('dbo.SystemBranding', 'U') IS NOT NULL DROP TABLE dbo.SystemBranding;
GO

-- ==============================================================================
-- 3. TẠO CÁC BẢNG CƠ SỞ DỮ LIỆU CHÍNH
-- ==============================================================================

-- 3.1. BẢNG CẤU HÌNH NHẬN DIỆN THƯƠNG HIỆU & MÀU SẮC HỆ THỐNG
CREATE TABLE dbo.SystemBranding (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    AgencyName NVARCHAR(250) NOT NULL DEFAULT N'Tổng công ty Đường sắt Việt Nam',
    SoftwareName NVARCHAR(250) NOT NULL DEFAULT N'Hệ Thống Thư Viện Hồ Sơ Tài Liệu (HSTL)',
    ShortName NVARCHAR(50) NOT NULL DEFAULT N'VNR',
    PrimaryAccent NVARCHAR(20) NOT NULL DEFAULT N'#003882', -- Màu xanh thương hiệu
    AccentName NVARCHAR(100) NOT NULL DEFAULT N'Xanh Đường Sắt VNR',
    WallpaperId NVARCHAR(50) NOT NULL DEFAULT N'bloom_light',
    IsDarkMode BIT NOT NULL DEFAULT 0,
    Version NVARCHAR(50) NOT NULL DEFAULT N'Windows 12 HSTL Enterprise v4.8',
    FooterText NVARCHAR(500) NOT NULL DEFAULT N'© 2026 Tổng công ty Đường sắt Việt Nam - Phần mềm Quản trị Thư viện HSTL Tinh gọn',
    UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

-- 3.2. BẢNG PHÒNG BAN & KHỐI NGHIỆP VỤ
CREATE TABLE dbo.Departments (
    DepartmentId NVARCHAR(50) PRIMARY KEY,
    DepartmentName NVARCHAR(250) NOT NULL,
    BlockName NVARCHAR(150) NOT NULL, -- Khối Vận tải, Khối Hạ tầng, Khối Kế hoạch...
    ManagerName NVARCHAR(150) NULL,
    PhoneNumber NVARCHAR(50) NULL,
    Email NVARCHAR(150) NULL,
    Description NVARCHAR(500) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

-- 3.3. BẢNG NGƯỜI DÙNG & PHÂN QUYỀN (RBAC)
CREATE TABLE dbo.Users (
    UserId NVARCHAR(50) PRIMARY KEY,
    FullName NVARCHAR(150) NOT NULL,
    Email NVARCHAR(150) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL, -- Lưu chuỗi băm mật khẩu bcrypt/argon2
    Role NVARCHAR(50) NOT NULL, -- ADMIN, LANH_DAO, TRUONG_PHONG, VAN_THU, CHUYEN_VIEN
    RoleTitle NVARCHAR(150) NOT NULL,
    DepartmentId NVARCHAR(50) NOT NULL,
    PhoneNumber NVARCHAR(50) NULL,
    AvatarUrl NVARCHAR(500) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    LastLoginAt DATETIME2 NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Users_Departments FOREIGN KEY (DepartmentId) REFERENCES dbo.Departments(DepartmentId)
);
GO

-- 3.4. BẢNG VỊ TRÍ KHO LƯU TRỮ VẬT LÝ
CREATE TABLE dbo.PhysicalLocations (
    LocationId NVARCHAR(50) PRIMARY KEY,
    WarehouseName NVARCHAR(150) NOT NULL, -- Ví dụ: Kho Lưu trữ Trung tâm (118 Lê Duẩn)
    AisleCode NVARCHAR(50) NOT NULL,      -- Dãy: Dãy A, Dãy B...
    RackCode NVARCHAR(50) NOT NULL,       -- Kệ: Kệ 01, Kệ 02...
    FloorNumber INT NOT NULL DEFAULT 1,   -- Tầng: Tầng 1..5
    BoxCode NVARCHAR(50) NOT NULL,        -- Mã Hộp/Cặp tài liệu
    FullLocationCode AS (WarehouseName + N' - Dãy ' + AisleCode + N' / Kệ ' + RackCode + N' / Tầng ' + CAST(FloorNumber AS NVARCHAR(10)) + N' / Hộp ' + BoxCode) PERSISTED,
    CapacityDocuments INT NOT NULL DEFAULT 100,
    CurrentDocumentsCount INT NOT NULL DEFAULT 0,
    Description NVARCHAR(500) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

-- 3.5. BẢNG CÂY THƯ VIỆN HỒ SƠ TÀI LIỆU 5 CẤP
CREATE TABLE dbo.DossierFolders (
    FolderId NVARCHAR(50) PRIMARY KEY,
    ParentFolderId NVARCHAR(50) NULL,
    FolderLevel INT NOT NULL, -- 1: Cơ quan, 2: Khối, 3: Ban/Phòng, 4: Cặp/Hộp, 5: Hồ sơ
    FolderName NVARCHAR(300) NOT NULL,
    FolderCode NVARCHAR(100) NOT NULL,
    DepartmentId NVARCHAR(50) NULL,
    LocationId NVARCHAR(50) NULL,
    StoragePeriod NVARCHAR(50) NOT NULL DEFAULT N'Vĩnh viễn', -- Vĩnh viễn, 50 năm, 20 năm, 5 năm...
    SecurityLevel NVARCHAR(50) NOT NULL DEFAULT N'Thường',    -- Thường, Mật, Tối mật...
    YearCreated INT NOT NULL DEFAULT YEAR(GETDATE()),
    CreatedByUserId NVARCHAR(50) NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Folders_Parent FOREIGN KEY (ParentFolderId) REFERENCES dbo.DossierFolders(FolderId),
    CONSTRAINT FK_Folders_Departments FOREIGN KEY (DepartmentId) REFERENCES dbo.Departments(DepartmentId),
    CONSTRAINT FK_Folders_Locations FOREIGN KEY (LocationId) REFERENCES dbo.PhysicalLocations(LocationId),
    CONSTRAINT FK_Folders_Users FOREIGN KEY (CreatedByUserId) REFERENCES dbo.Users(UserId)
);
GO

-- 3.6. BẢNG VĂN BẢN TRONG HỒ SƠ SỐ HÓA & OCR
CREATE TABLE dbo.DossierDocuments (
    DocumentId NVARCHAR(50) PRIMARY KEY,
    FolderId NVARCHAR(50) NOT NULL,
    DocumentCode NVARCHAR(100) NOT NULL, -- Số ký hiệu: 842/QĐ-ĐS...
    DocumentTitle NVARCHAR(500) NOT NULL, -- Trích yếu văn bản
    DocumentType NVARCHAR(100) NOT NULL, -- Quyết định, Công văn, Hợp đồng, Biên bản nghiệm thu...
    IssuingAgency NVARCHAR(250) NOT NULL, -- Cơ quan ban hành
    IssuedDate DATE NOT NULL,
    SignerName NVARCHAR(150) NULL,
    SignerPosition NVARCHAR(150) NULL,
    PageCount INT NOT NULL DEFAULT 1,
    FilePath NVARCHAR(500) NOT NULL, -- Đường dẫn tệp PDF trên máy chủ
    FileSizeKb BIGINT NOT NULL DEFAULT 0,
    FileExtension NVARCHAR(20) NOT NULL DEFAULT N'pdf',
    HasDigitalSignature BIT NOT NULL DEFAULT 0,
    OcrContent NVARCHAR(MAX) NULL, -- Nội dung trích xuất tự động qua OCR phục vụ tìm kiếm toàn văn
    Status NVARCHAR(50) NOT NULL DEFAULT N'Đang lưu trữ',
    UploadedByUserId NVARCHAR(50) NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Docs_Folders FOREIGN KEY (FolderId) REFERENCES dbo.DossierFolders(FolderId),
    CONSTRAINT FK_Docs_Users FOREIGN KEY (UploadedByUserId) REFERENCES dbo.Users(UserId)
);
GO

-- 3.7. BẢNG SỔ VĂN BẢN ĐẾN ĐIỆN TỬ
CREATE TABLE dbo.IncomingDocuments (
    IncomingId NVARCHAR(50) PRIMARY KEY,
    IncomingNumber INT NOT NULL, -- Số đến (tự tăng theo năm)
    IncomingYear INT NOT NULL DEFAULT YEAR(GETDATE()),
    OriginalCode NVARCHAR(100) NOT NULL, -- Số ký hiệu của cơ quan gửi
    SenderAgency NVARCHAR(250) NOT NULL, -- Cơ quan gửi văn bản
    IssuedDate DATE NOT NULL,             -- Ngày văn bản
    ReceivedDate DATE NOT NULL,           -- Ngày tiếp nhận
    DocumentSummary NVARCHAR(MAX) NOT NULL, -- Trích yếu nội dung
    DocumentType NVARCHAR(100) NOT NULL,
    UrgencyLevel NVARCHAR(50) NOT NULL DEFAULT N'Bình thường', -- Hỏa tốc, Thượng khẩn, Khẩn, Bình thường
    SecurityLevel NVARCHAR(50) NOT NULL DEFAULT N'Thường',
    LeaderInstructions NVARCHAR(MAX) NULL, -- Ý kiến chỉ đạo của Lãnh đạo
    AssignedDepartmentId NVARCHAR(50) NULL, -- Ban/Phòng chủ trì thụ lý
    MainHandlerUserId NVARCHAR(50) NULL,    -- Cán bộ thụ lý chính
    ProcessingDeadline DATE NULL,           -- Hạn xử lý
    Status NVARCHAR(50) NOT NULL DEFAULT N'Chờ phân công', -- Chờ phân công, Đang xử lý, Đã hoàn thành, Quá hạn
    FilePath NVARCHAR(500) NULL,
    CreatedByUserId NVARCHAR(50) NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Incoming_Dept FOREIGN KEY (AssignedDepartmentId) REFERENCES dbo.Departments(DepartmentId),
    CONSTRAINT FK_Incoming_Handler FOREIGN KEY (MainHandlerUserId) REFERENCES dbo.Users(UserId),
    CONSTRAINT FK_Incoming_Creator FOREIGN KEY (CreatedByUserId) REFERENCES dbo.Users(UserId)
);
GO

-- 3.8. BẢNG SỔ VĂN BẢN ĐI ĐIỆN TỬ
CREATE TABLE dbo.OutgoingDocuments (
    OutgoingId NVARCHAR(50) PRIMARY KEY,
    OutgoingNumber INT NOT NULL, -- Số đi (tự tăng theo loại sổ và năm)
    OutgoingYear INT NOT NULL DEFAULT YEAR(GETDATE()),
    OutgoingCode AS (CAST(OutgoingNumber AS NVARCHAR(10)) + N'/' + DocumentTypeSuffix) PERSISTED,
    DocumentTypeSuffix NVARCHAR(50) NOT NULL DEFAULT N'QĐ-ĐS',
    DocumentType NVARCHAR(100) NOT NULL,
    DraftingDepartmentId NVARCHAR(50) NOT NULL,
    SignerUserId NVARCHAR(50) NOT NULL,
    SignDate DATE NOT NULL,
    DocumentSummary NVARCHAR(MAX) NOT NULL,
    RecipientAgencies NVARCHAR(1000) NOT NULL, -- Nơi nhận bên ngoài
    InternalRecipients NVARCHAR(1000) NULL,    -- Nơi nhận nội bộ
    DistributionMethod NVARCHAR(100) NOT NULL DEFAULT N'Trục liên thông văn bản',
    HasDigitalSignature BIT NOT NULL DEFAULT 1,
    Status NVARCHAR(50) NOT NULL DEFAULT N'Đã phát hành', -- Dự thảo, Đang ký duyệt, Đã phát hành, Đã lưu trữ
    FilePath NVARCHAR(500) NULL,
    CreatedByUserId NVARCHAR(50) NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Outgoing_Dept FOREIGN KEY (DraftingDepartmentId) REFERENCES dbo.Departments(DepartmentId),
    CONSTRAINT FK_Outgoing_Signer FOREIGN KEY (SignerUserId) REFERENCES dbo.Users(UserId),
    CONSTRAINT FK_Outgoing_Creator FOREIGN KEY (CreatedByUserId) REFERENCES dbo.Users(UserId)
);
GO

-- 3.9. BẢNG HỒ SƠ SOẠN THẢO & THẨM ĐỊNH PHỐI HỢP
CREATE TABLE dbo.DraftDossiers (
    DraftId NVARCHAR(50) PRIMARY KEY,
    DraftTitle NVARCHAR(500) NOT NULL,
    DocumentType NVARCHAR(100) NOT NULL,
    LeadDepartmentId NVARCHAR(50) NOT NULL,
    CreatedByUserId NVARCHAR(50) NOT NULL,
    AppraisalDeadline DATE NOT NULL,
    Status NVARCHAR(50) NOT NULL DEFAULT N'Đang xin ý kiến', -- Đang xin ý kiến, Đã tổng hợp, Đã trình duyệt, Đã ban hành
    SummaryContent NVARCHAR(MAX) NULL,
    DraftFilePath NVARCHAR(500) NOT NULL,
    FinalApprovedFilePath NVARCHAR(500) NULL,
    ApproverUserId NVARCHAR(50) NULL,
    ApprovalDate DATETIME2 NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Draft_Dept FOREIGN KEY (LeadDepartmentId) REFERENCES dbo.Departments(DepartmentId),
    CONSTRAINT FK_Draft_Creator FOREIGN KEY (CreatedByUserId) REFERENCES dbo.Users(UserId),
    CONSTRAINT FK_Draft_Approver FOREIGN KEY (ApproverUserId) REFERENCES dbo.Users(UserId)
);
GO

-- 3.10. BẢNG Ý KIẾN THẨM ĐỊNH PHỐI HỢP ĐA PHÒNG BAN
CREATE TABLE dbo.DraftAppraisals (
    AppraisalId NVARCHAR(50) PRIMARY KEY,
    DraftId NVARCHAR(50) NOT NULL,
    DepartmentId NVARCHAR(50) NOT NULL,
    AppraiserUserId NVARCHAR(50) NOT NULL,
    DecisionStatus NVARCHAR(50) NOT NULL, -- ĐỒNG Ý, ĐỀ NGHỊ SỬA ĐỔI, KHÔNG ĐỒNG Ý
    Comments NVARCHAR(MAX) NOT NULL,
    FeedbackFilePath NVARCHAR(500) NULL,
    AppraisedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Appraisals_Draft FOREIGN KEY (DraftId) REFERENCES dbo.DraftDossiers(DraftId) ON DELETE CASCADE,
    CONSTRAINT FK_Appraisals_Dept FOREIGN KEY (DepartmentId) REFERENCES dbo.Departments(DepartmentId),
    CONSTRAINT FK_Appraisals_User FOREIGN KEY (AppraiserUserId) REFERENCES dbo.Users(UserId)
);
GO

-- 3.11. BẢNG TIN NHẮN NỘI BỘ (MESSENGER) & ĐÍNH KÈM HỒ SƠ
CREATE TABLE dbo.ChatMessages (
    MessageId NVARCHAR(50) PRIMARY KEY,
    SenderUserId NVARCHAR(50) NOT NULL,
    ReceiverUserId NVARCHAR(50) NOT NULL, -- Mã người nhận hoặc 'GROUP'
    MessageContent NVARCHAR(MAX) NOT NULL,
    AttachedDocumentId NVARCHAR(50) NULL, -- Đính kèm trực tiếp ID tài liệu thư viện
    AttachedDocumentCode NVARCHAR(100) NULL,
    AttachedDocumentTitle NVARCHAR(500) NULL,
    IsRead BIT NOT NULL DEFAULT 0,
    SentAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Chat_Sender FOREIGN KEY (SenderUserId) REFERENCES dbo.Users(UserId),
    CONSTRAINT FK_Chat_Receiver FOREIGN KEY (ReceiverUserId) REFERENCES dbo.Users(UserId)
);
GO

-- 3.12. BẢNG NHẬT KÝ TRUY VẾT HỆ THỐNG (AUDIT LOGS)
CREATE TABLE dbo.AuditLogs (
    LogId BIGINT IDENTITY(1,1) PRIMARY KEY,
    UserId NVARCHAR(50) NOT NULL,
    ActionType NVARCHAR(100) NOT NULL, -- LOGIN, VIEW_DOC, DOWNLOAD_DOC, CREATE_DOC, UPDATE_DOC, APPROVE_DRAFT
    TargetModule NVARCHAR(100) NOT NULL,
    TargetRecordId NVARCHAR(100) NULL,
    IpAddress NVARCHAR(50) NULL,
    UserAgent NVARCHAR(250) NULL,
    ActionDetail NVARCHAR(MAX) NULL,
    LoggedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

-- ==============================================================================
-- 4. TẠO CHỈ MỤC TỐI ƯU HÓA HIỆU NĂNG TRUY VẤN (INDEXES)
-- ==============================================================================
CREATE NONCLUSTERED INDEX IX_Users_Email ON dbo.Users(Email);
CREATE NONCLUSTERED INDEX IX_Users_Role ON dbo.Users(Role);
CREATE NONCLUSTERED INDEX IX_DossierDocuments_FolderId ON dbo.DossierDocuments(FolderId);
CREATE NONCLUSTERED INDEX IX_DossierDocuments_DocumentCode ON dbo.DossierDocuments(DocumentCode);
CREATE NONCLUSTERED INDEX IX_DossierDocuments_IssuedDate ON dbo.DossierDocuments(IssuedDate DESC);
CREATE NONCLUSTERED INDEX IX_IncomingDocs_Year_Number ON dbo.IncomingDocuments(IncomingYear, IncomingNumber);
CREATE NONCLUSTERED INDEX IX_OutgoingDocs_Year_Number ON dbo.OutgoingDocuments(OutgoingYear, OutgoingNumber);
CREATE NONCLUSTERED INDEX IX_DraftAppraisals_DraftId ON dbo.DraftAppraisals(DraftId);
CREATE NONCLUSTERED INDEX IX_ChatMessages_Users ON dbo.ChatMessages(SenderUserId, ReceiverUserId, SentAt DESC);
GO

-- ==============================================================================
-- 5. NẠP BỘ DỮ LIỆU MẪU BAN ĐẦU (SEED DATA CHUẨN VNR)
-- ==============================================================================

-- 5.1. Cấu hình màu sắc nhận diện ban đầu
INSERT INTO dbo.SystemBranding (AgencyName, SoftwareName, ShortName, PrimaryAccent, AccentName, Version)
VALUES (
    N'Tổng công ty Đường sắt Việt Nam',
    N'Hệ Thống Thư Viện Hồ Sơ Tài Liệu (HSTL)',
    N'VNR',
    N'#003882',
    N'Xanh Đường Sắt VNR',
    N'Windows 12 HSTL Enterprise v4.8'
);
GO

-- 5.2. Danh mục Phòng ban
INSERT INTO dbo.Departments (DepartmentId, DepartmentName, BlockName, ManagerName, Description)
VALUES
('BAN_VT', N'Ban Vận Tải', N'Khối Vận Tải', N'Nguyễn Văn A', N'Quản lý điều hành chạy tàu, doanh thu vận chuyển'),
('BAN_AT', N'Ban An Toàn - An Ninh', N'Khối Vận Tải', N'Trần Thị B', N'Kiểm soát an toàn giao thông đường sắt'),
('BAN_KTHT', N'Ban Quản Lý Kết Cấu Hạ Tầng', N'Khối Hạ Tầng', N'Lê Văn C', N'Quản lý cầu, đường ray, hầm, nhà ga'),
('BAN_TCKT', N'Ban Tài Chính - Kế Toán', N'Khối Tài Chính', N'Phạm Thị D', N'Quản lý nguồn vốn, quyết toán, ngân sách'),
('BAN_KHDT', N'Ban Kế Hoạch - Đầu Tư', N'Khối Kế Hoạch', N'Vũ Văn E', N'Quản lý dự án đầu tư nâng cấp đường sắt'),
('VAN_PHONG', N'Văn Phòng Tổng Công Ty', N'Khối Tham Mưu', N'Đỗ Thị F', N'Công tác hành chính, văn thư, lưu trữ');
GO

-- 5.3. Tài khoản Người dùng theo 5 vai trò chuẩn
INSERT INTO dbo.Users (UserId, FullName, Email, PasswordHash, Role, RoleTitle, DepartmentId, AvatarUrl)
VALUES
('USR_ADMIN', N'Nguyễn Quản Trị', 'admin.hstl@vnr.gov.vn', '$2a$12$e8YQz.EXAMPLE.HASH.OF.VNR2026', 'ADMIN', N'Quản trị viên Hệ thống', 'VAN_PHONG', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'),
('USR_LANHDAO', N'Đặng Sỹ Mạnh', 'lanhdao.vnr@vnr.gov.vn', '$2a$12$e8YQz.EXAMPLE.HASH.OF.VNR2026', 'LANH_DAO', N'Phó Tổng Giám Đốc Phụ Trách', 'VAN_PHONG', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'),
('USR_TRUONGPHONG', N'Hoàng Quốc Hưng', 'tp.vantai@vnr.gov.vn', '$2a$12$e8YQz.EXAMPLE.HASH.OF.VNR2026', 'TRUONG_PHONG', N'Trưởng Ban Vận Tải', 'BAN_VT', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'),
('USR_VANTHU', N'Nguyễn Mai Lan', 'vanthu.vnr@vnr.gov.vn', '$2a$12$e8YQz.EXAMPLE.HASH.OF.VNR2026', 'VAN_THU', N'Cán Bộ Văn Thư Tổng Hợp', 'VAN_PHONG', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'),
('USR_CHUYENVIEN', N'Trần Minh Đức', 'cv.antoan@vnr.gov.vn', '$2a$12$e8YQz.EXAMPLE.HASH.OF.VNR2026', 'CHUYEN_VIEN', N'Chuyên Viên An Toàn Chạy Tàu', 'BAN_AT', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150');
GO

-- 5.4. Vị trí kho lưu trữ vật lý
INSERT INTO dbo.PhysicalLocations (LocationId, WarehouseName, AisleCode, RackCode, FloorNumber, BoxCode, CapacityDocuments, CurrentDocumentsCount)
VALUES
('LOC_001', N'Kho Lưu trữ Trung tâm (118 Lê Duẩn)', N'A', N'Kệ 01', 1, N'Hộp 101', 120, 24),
('LOC_002', N'Kho Lưu trữ Trung tâm (118 Lê Duẩn)', N'A', N'Kệ 01', 2, N'Hộp 102', 100, 35),
('LOC_003', N'Kho Lưu trữ Trung tâm (118 Lê Duẩn)', N'B', N'Kệ 03', 3, N'Hộp 205', 150, 60),
('LOC_004', N'Kho Lưu trữ Kỹ thuật Yên Viên', N'C', N'Kệ 02', 1, N'Hộp 012', 80, 18);
GO

-- 5.5. Cây danh mục Thư viện HSTL
INSERT INTO dbo.DossierFolders (FolderId, ParentFolderId, FolderLevel, FolderName, FolderCode, DepartmentId, LocationId, StoragePeriod)
VALUES
('ROOT_VNR', NULL, 1, N'Tổng công ty Đường sắt Việt Nam', N'VNR_ROOT', 'VAN_PHONG', NULL, N'Vĩnh viễn'),
('BLK_VANTAI', 'ROOT_VNR', 2, N'Khối Quản lý & Khai thác Vận tải', N'BLK_VT', 'BAN_VT', NULL, N'Vĩnh viễn'),
('DEPT_BAN_VT', 'BLK_VANTAI', 3, N'Ban Vận Tải', N'DEPT_VT', 'BAN_VT', NULL, N'Vĩnh viễn'),
('BOX_VT_2025', 'DEPT_BAN_VT', 4, N'Hộp Hồ Sơ Kế Hoạch Chạy Tàu Năm 2025 - 2026', N'BOX_VT_25', 'BAN_VT', 'LOC_001', N'Vĩnh viễn'),
('DOS_VT_001', 'BOX_VT_2025', 5, N'Hồ sơ Nghiệm thu & Công bố Lịch trình Tàu Bắc Nam SE1/SE2', N'DOS_VT_SE12', 'BAN_VT', 'LOC_001', N'Vĩnh viễn');
GO

-- 5.6. Tài liệu mẫu kèm dữ liệu OCR
INSERT INTO dbo.DossierDocuments (DocumentId, FolderId, DocumentCode, DocumentTitle, DocumentType, IssuingAgency, IssuedDate, SignerName, SignerPosition, PageCount, FilePath, FileSizeKb, HasDigitalSignature, OcrContent, UploadedByUserId)
VALUES
('DOC_842_QD', 'DOS_VT_001', N'842/QĐ-ĐS', N'Quyết định ban hành Quy trình An toàn Kỹ thuật và Biện pháp bảo đảm an toàn chạy tàu Tết Nguyên Đán', N'Quyết định', N'Tổng công ty Đường sắt Việt Nam', '2025-12-20', N'Đặng Sỹ Mạnh', N'Phó Tổng Giám Đốc', 8, '/storage/docs/2025/842_QD_DS.pdf', 1420, 1, N'TỔNG CÔNG TY ĐƯỜNG SẮT VIỆT NAM QUYẾT ĐỊNH BAN HÀNH QUY TRÌNH AN TOÀN KỸ THUẬT VẬN TẢI ĐƯỜNG SẮT NĂM 2026. Điều 1: Áp dụng trên toàn bộ tuyến đường sắt Bắc Nam. Điều 2: Các ga, cung chắn, trạm đầu máy chấp hành nghiêm chỉnh thời gian đón tiễn tàu.', 'USR_ADMIN'),
('DOC_105_HD', 'DOS_VT_001', N'105/HĐ-VNR-VTDN', N'Hợp đồng kinh tế bảo dưỡng định kỳ hệ thống tín hiệu tự động ga Cát Linh - Hà Đông', N'Hợp đồng', N'Ban Quản Lý Kết Cấu Hạ Tầng', '2025-11-15', N'Nguyễn Văn A', N'Trưởng Ban', 15, '/storage/docs/2025/105_HD_KT.pdf', 2850, 1, N'HỢP ĐỒNG KINH TẾ BẢO DƯỠNG HỆ THỐNG TÍN HIỆU ĐƯỜNG SẮT ĐÔ THỊ CÁT LINH HÀ ĐÔNG. Đơn vị thi công: Công ty Cổ phần Thông tin Tín hiệu Đường sắt Hà Nội. Tiến độ hoàn thành: Quý II năm 2026.', 'USR_TRUONGPHONG');
GO

-- 5.7. Sổ văn bản đến mẫu
INSERT INTO dbo.IncomingDocuments (IncomingId, IncomingNumber, IncomingYear, OriginalCode, SenderAgency, IssuedDate, ReceivedDate, DocumentSummary, DocumentType, UrgencyLevel, AssignedDepartmentId, MainHandlerUserId, ProcessingDeadline, Status, CreatedByUserId)
VALUES
('INC_2026_001', 1, 2026, N'12/BGTVT-KCHT', N'Bộ Giao thông Vận tải', '2026-01-05', '2026-01-06', N'V/v phê duyệt phương án nâng cấp kết cấu hạ tầng đường sắt khu gian đèo Hải Vân', N'Công văn', N'Hỏa tốc', 'BAN_KTHT', 'USR_CHUYENVIEN', '2026-01-20', N'Đang xử lý', 'USR_VANTHU');
GO

-- 5.8. Sổ văn bản đi mẫu
INSERT INTO dbo.OutgoingDocuments (OutgoingId, OutgoingNumber, OutgoingYear, DocumentTypeSuffix, DocumentType, DraftingDepartmentId, SignerUserId, SignDate, DocumentSummary, RecipientAgencies, InternalRecipients, Status, CreatedByUserId)
VALUES
('OUT_2026_001', 1, 2026, N'QĐ-ĐS', N'Quyết định', 'BAN_VT', 'USR_LANHDAO', '2026-01-08', N'Về việc thành lập Ban chỉ đạo cao điểm vận tải hành khách Đường sắt năm 2026', N'Ủy ban Quản lý vốn nhà nước, Bộ GTVT, Cục Đường sắt', N'Hội đồng thành viên, Các Ban chuyên môn, Các Ga loại 1', N'Đã phát hành', 'USR_VANTHU');
GO

-- ==============================================================================
-- 6. STORED PROCEDURES HỖ TRỢ NGHIỆP VỤ & TÌM KIẾM TOÀN VĂN
-- ==============================================================================

-- 6.1. Stored Procedure: Tra cứu tài liệu đa tiêu chí kết hợp OCR
CREATE OR ALTER PROCEDURE dbo.sp_SearchDossierDocuments
    @Keyword NVARCHAR(250) = NULL,
    @FolderId NVARCHAR(50) = NULL,
    @DocumentType NVARCHAR(100) = NULL,
    @FromDate DATE = NULL,
    @ToDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        d.DocumentId,
        d.DocumentCode,
        d.DocumentTitle,
        d.DocumentType,
        d.IssuingAgency,
        d.IssuedDate,
        d.SignerName,
        d.PageCount,
        d.FilePath,
        d.FileSizeKb,
        d.HasDigitalSignature,
        d.Status,
        f.FolderName,
        f.FolderCode,
        loc.FullLocationCode
    FROM dbo.DossierDocuments d
    INNER JOIN dbo.DossierFolders f ON d.FolderId = f.FolderId
    LEFT JOIN dbo.PhysicalLocations loc ON f.LocationId = loc.LocationId
    WHERE (@FolderId IS NULL OR d.FolderId = @FolderId)
      AND (@DocumentType IS NULL OR d.DocumentType = @DocumentType)
      AND (@FromDate IS NULL OR d.IssuedDate >= @FromDate)
      AND (@ToDate IS NULL OR d.IssuedDate <= @ToDate)
      AND (
          @Keyword IS NULL 
          OR d.DocumentCode LIKE N'%' + @Keyword + N'%'
          OR d.DocumentTitle LIKE N'%' + @Keyword + N'%'
          OR d.IssuingAgency LIKE N'%' + @Keyword + N'%'
          OR d.OcrContent LIKE N'%' + @Keyword + N'%'
      )
    ORDER BY d.IssuedDate DESC;
END;
GO

-- 6.2. Stored Procedure: Ghi nhận nhật ký Audit Log
CREATE OR ALTER PROCEDURE dbo.sp_WriteAuditLog
    @UserId NVARCHAR(50),
    @ActionType NVARCHAR(100),
    @TargetModule NVARCHAR(100),
    @TargetRecordId NVARCHAR(100) = NULL,
    @IpAddress NVARCHAR(50) = NULL,
    @ActionDetail NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO dbo.AuditLogs (UserId, ActionType, TargetModule, TargetRecordId, IpAddress, ActionDetail)
    VALUES (@UserId, @ActionType, @TargetModule, @TargetRecordId, @IpAddress, @ActionDetail);
END;
GO

PRINT N'==============================================================================';
PRINT N'>>> ĐÃ THIẾT LẬP HOÀN TẤT CƠ SỞ DỮ LIỆU SQL SERVER CHO HỆ THỐNG HSTL VNR!';
PRINT N'==============================================================================';
GO
