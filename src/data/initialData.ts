import { 
  UserProfile, 
  BrandConfig, 
  ExistingDocument, 
  DraftDossier, 
  IncomingDocument, 
  OutgoingDocument,
  SystemNotification,
  DepartmentItem,
  UnitItem,
  IssuingAgencyItem,
  DocTypeMetadataSchema,
  AssignedTask
} from '../types';

export const DEFAULT_BRAND_CONFIG: BrandConfig = {
  softwareName: 'HỆ THỐNG THƯ VIỆN HỒ SƠ TÀI LIỆU (HSTL)',
  softwareSubtitle: 'Nền tảng Lưu trữ Số & Quản lý Văn bản Thông minh 4 Luồng Tinh gọn',
  agencyName: 'TỔNG CÔNG TY ĐƯỜNG SẮT VIỆT NAM (VNR)',
  agencyUnit: 'BAN QUẢN LÝ VĂN THƯ & LƯU TRỮ TRUNG ƯƠNG',
  logoUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=160&auto=format&fit=crop&q=80',
  primaryAccent: '#0078D4', // Windows 12 Fluent Blue
  accentName: 'Windows Cobalt Blue',
  wallpaperId: 'bloom_light',
  isDarkMode: false,
  version: 'Windows 12 HSTL Enterprise v4.8',
  footerText: '© 2026 Tổng công ty Đường sắt Việt Nam - Phần mềm Quản trị Thư viện HSTL Tinh gọn',
};

export const PRESET_WALLPAPERS = [
  {
    id: 'bloom_light',
    name: 'Windows 12 Azure Flow (Chủ đạo)',
    url: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?auto=format&fit=crop&w=2000&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'crystal_blue',
    name: 'Windows 12 Crystal Blue Sky',
    url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=2000&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'railway_modern',
    name: 'Đường Sắt Hiện Đại Xanh Dương',
    url: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=2000&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'misty_cyan',
    name: 'Acrylic Cyan Luminous',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80'
  }
];

export const PRESET_ACCENTS = [
  { name: 'Cobalt Blue (Default)', hex: '#0078D4', border: '#2b88d8' },
  { name: 'Emerald Forest', hex: '#107C41', border: '#159c52' },
  { name: 'Royal Indigo', hex: '#6264A7', border: '#7b7dbd' },
  { name: 'Imperial Ruby', hex: '#C42B1C', border: '#d83b01' },
  { name: 'Deep Cyan Teal', hex: '#008272', border: '#00a38f' },
  { name: 'Obsidian Black', hex: '#242424', border: '#3a3a3a' }
];

export const SAMPLE_USERS: UserProfile[] = [
  {
    id: 'user_gd_1',
    name: 'Đặng Sỹ Mạnh',
    role: 'LANH_DAO',
    roleTitle: 'Tổng Giám Đốc',
    department: 'Ban Tổng Giám Đốc',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=120&auto=format&fit=crop&q=80',
    email: 'manh.dang@vnr.gov.vn',
    phone: '0903.888.666',
    isActive: true
  },
  {
    id: 'user_pgd_1',
    name: 'Hoàng Gia Khánh',
    role: 'LANH_DAO',
    roleTitle: 'Phó Tổng Giám Đốc',
    department: 'Ban Tổng Giám Đốc',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80',
    email: 'khanh.hoang@vnr.gov.vn',
    phone: '0903.888.777',
    isActive: true
  },
  {
    id: 'user_pgd_2',
    name: 'Trần Anh Tuấn',
    role: 'LANH_DAO',
    roleTitle: 'Phó Tổng Giám Đốc',
    department: 'Ban Tổng Giám Đốc',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
    email: 'tuan.tran@vnr.gov.vn',
    phone: '0903.888.888',
    isActive: true
  },
  {
    id: 'user_tp_1',
    name: 'Trần Thị Thu Hương',
    role: 'TRUONG_PHONG',
    roleTitle: 'Trưởng phòng Quản lý Hồ sơ & Thẩm định',
    department: 'Ban Kỹ thuật - Hạ tầng Cơ sở',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    email: 'huong.tran@vnr.gov.vn'
  },
  {
    id: 'user_pp_1',
    name: 'Đỗ Quang Vinh',
    role: 'CHUYEN_VIEN',
    roleTitle: 'Phó Trưởng phòng Kỹ thuật - Hạ tầng',
    department: 'Ban Kỹ thuật - Hạ tầng Cơ sở',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    email: 'vinh.do@vnr.gov.vn',
    phone: '0912.334.556'
  },
  {
    id: 'user_cv_1',
    name: 'Nguyễn Văn Cường',
    role: 'CHUYEN_VIEN',
    roleTitle: 'Chuyên viên Kỹ thuật & Dự án',
    department: 'Ban Kỹ thuật - Hạ tầng Cơ sở',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    email: 'cuong.nguyen@vnr.gov.vn'
  },
  {
    id: 'user_cv_2',
    name: 'Phạm Ngọc Tuấn',
    role: 'CHUYEN_VIEN',
    roleTitle: 'Kỹ sư Cầu đường & An toàn đường sắt',
    department: 'Ban Kỹ thuật - Hạ tầng Cơ sở',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80',
    email: 'tuan.pham@vnr.gov.vn'
  },
  {
    id: 'user_tp_2',
    name: 'Nguyễn Tiến Dũng',
    role: 'TRUONG_PHONG',
    roleTitle: 'Trưởng ban Quản lý Đầu tư & Xây dựng',
    department: 'Ban Quản lý Đầu tư & Xây dựng',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80',
    email: 'dung.nguyen@vnr.gov.vn'
  },
  {
    id: 'user_pp_2',
    name: 'Bùi Hoàng Long',
    role: 'CHUYEN_VIEN',
    roleTitle: 'Phó Trưởng ban QLĐT & Xây dựng',
    department: 'Ban Quản lý Đầu tư & Xây dựng',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80',
    email: 'long.bui@vnr.gov.vn'
  },
  {
    id: 'user_cv_3',
    name: 'Lê Thị Mai',
    role: 'CHUYEN_VIEN',
    roleTitle: 'Chuyên viên Thẩm định Dự án ĐTXD',
    department: 'Ban Quản lý Đầu tư & Xây dựng',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    email: 'mai.le@vnr.gov.vn'
  },
  {
    id: 'user_tp_3',
    name: 'Hoàng Minh Châu',
    role: 'TRUONG_PHONG',
    roleTitle: 'Trưởng ban Tài chính - Kế toán',
    department: 'Ban Tài chính - Kế toán',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
    email: 'chau.hoang@vnr.gov.vn'
  },
  {
    id: 'user_pp_3',
    name: 'Ngô Lan Phương',
    role: 'CHUYEN_VIEN',
    roleTitle: 'Phó Trưởng ban Tài chính - Kế toán',
    department: 'Ban Tài chính - Kế toán',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=120&auto=format&fit=crop&q=80',
    email: 'phuong.ngo@vnr.gov.vn'
  },
  {
    id: 'user_cv_4',
    name: 'Đoàn Văn Hùng',
    role: 'CHUYEN_VIEN',
    roleTitle: 'Chuyên viên Kế toán & Quản lý Ngân sách',
    department: 'Ban Tài chính - Kế toán',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=120&auto=format&fit=crop&q=80',
    email: 'hung.doan@vnr.gov.vn'
  },
  {
    id: 'user_tp_4',
    name: 'Vũ Đức Thịnh',
    role: 'TRUONG_PHONG',
    roleTitle: 'Trưởng ban Quản lý Vận tải & Đầu máy Toa xe',
    department: 'Ban Quản lý Vận tải & Đầu máy Toa xe',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    email: 'thinh.vu@vnr.gov.vn'
  },
  {
    id: 'user_cv_5',
    name: 'Chu Đình Tuấn',
    role: 'CHUYEN_VIEN',
    roleTitle: 'Kỹ sư Vận hành Đầu máy Toa xe',
    department: 'Ban Quản lý Vận tải & Đầu máy Toa xe',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
    email: 'tuan.chu@vnr.gov.vn'
  },
  {
    id: 'user_vt_1',
    name: 'Lê Hoàng Yến',
    role: 'VAN_THU',
    roleTitle: 'Cán bộ Văn thư - Lưu trữ Cơ quan',
    department: 'Văn phòng Tổng công ty',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
    email: 'yen.le@vnr.gov.vn'
  },
  {
    id: 'user_cv_6',
    name: 'Đặng Thu Trang',
    role: 'CHUYEN_VIEN',
    roleTitle: 'Chuyên viên Hành chính Tổng hợp',
    department: 'Văn phòng Tổng công ty',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    email: 'trang.dang@vnr.gov.vn'
  },
  {
    id: 'user_admin_1',
    name: 'Phan Minh Tuấn',
    role: 'ADMIN',
    roleTitle: 'Quản trị viên Hệ thống HSTL',
    department: 'Trung tâm Công nghệ Thông tin',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    email: 'admin.hstl@vnr.gov.vn',
    phone: '0903.112.889',
    isActive: true
  }
];

export const DEFAULT_DEPARTMENTS: DepartmentItem[] = [
  {
    id: 'dept-1',
    code: 'KTHT',
    name: 'Ban Kỹ thuật - Hạ tầng Cơ sở',
    description: 'Chịu trách nhiệm quản lý tiêu chuẩn kỹ thuật, hạ tầng ray, ga, cầu cống đường sắt',
    headName: 'Trần Thị Thu Hương',
    isActive: true
  },
  {
    id: 'dept-2',
    code: 'DTXD',
    name: 'Ban Quản lý Đầu tư & Xây dựng',
    description: 'Chủ trì thẩm định các dự án đầu tư nâng cấp, cải tạo mạng lưới đường sắt',
    headName: 'Nguyễn Tiến Dũng',
    isActive: true
  },
  {
    id: 'dept-3',
    code: 'VPTC',
    name: 'Văn phòng Tổng công ty',
    description: 'Bộ phận Văn thư, Lưu trữ, Hành chính tổng hợp & Điều phối nghiệp vụ',
    headName: 'Lê Hoàng Yến',
    isActive: true
  },
  {
    id: 'dept-4',
    code: 'TCKT',
    name: 'Ban Tài chính - Kế toán',
    description: 'Quản lý tài chính, thẩm định kế hoạch ngân sách, thanh quyết toán công trình',
    headName: 'Hoàng Minh Châu',
    isActive: true
  },
  {
    id: 'dept-5',
    code: 'VTDM',
    name: 'Ban Quản lý Vận tải & Đầu máy Toa xe',
    description: 'Quản lý công tác chạy tàu, phương tiện đầu máy, toa xe và vận hành khách - hàng',
    headName: 'Vũ Đức Thịnh',
    isActive: true
  },
  {
    id: 'dept-6',
    code: 'CNTT',
    name: 'Trung tâm Công nghệ Thông tin',
    description: 'Quản trị hệ thống số hóa HSTL, hạ tầng mạng, bảo mật và cơ sở dữ liệu',
    headName: 'Phan Minh Tuấn',
    isActive: true
  },
  {
    id: 'dept-7',
    code: 'PCTT',
    name: 'Ban Pháp chế - Thanh tra',
    description: 'Thẩm tra pháp lý văn bản quy phạm, xử lý tranh chấp và thanh tra nội bộ',
    headName: 'Đặng Quốc Huy',
    isActive: true
  },
  {
    id: 'dept-8',
    code: 'ATGT',
    name: 'Ban An toàn Giao thông Đường sắt',
    description: 'Giám sát an toàn chạy tàu, xử lý sự cố và kiểm tra định kỳ hành lang an toàn',
    headName: 'Bùi Văn Hùng',
    isActive: true
  }
];

export const DEFAULT_UNITS: UnitItem[] = [
  {
    id: 'unit-1',
    code: 'VNR-HQ',
    name: 'Tổng công ty Đường sắt Việt Nam (Cơ quan Tổng công ty)',
    type: 'TRUC_THUOC',
    address: '118 Lê Duẩn, Hoàn Kiếm, Hà Nội',
    isActive: true
  },
  {
    id: 'unit-2',
    code: 'DS-HAHAI',
    name: 'Công ty Cổ phần Đường sắt Hà Hải',
    type: 'TRUC_THUOC',
    address: 'Gia Lâm, Hà Nội',
    isActive: true
  },
  {
    id: 'unit-3',
    code: 'DS-SAIGON',
    name: 'Công ty Cổ phần Đường sắt Sài Gòn',
    type: 'TRUC_THUOC',
    address: 'Quận 3, TP. Hồ Chí Minh',
    isActive: true
  },
  {
    id: 'unit-4',
    code: 'TTTH-DS',
    name: 'Công ty CP Thông tin Tín hiệu Đường sắt',
    type: 'TRUC_THUOC',
    address: 'Đống Đa, Hà Nội',
    isActive: true
  },
  {
    id: 'unit-5',
    code: 'PMU-RAIL',
    name: 'Ban Quản lý Dự án Đường sắt (Bộ GTVT)',
    type: 'CO_QUAN_NGOAI',
    address: 'Bộ Giao thông Vận tải, Hà Nội',
    isActive: true
  },
  {
    id: 'unit-6',
    code: 'VNRA',
    name: 'Cục Đường sắt Việt Nam',
    type: 'CO_QUAN_NGOAI',
    address: '80 Trần Hưng Đạo, Hoàn Kiếm, Hà Nội',
    isActive: true
  }
];

export const DEFAULT_ISSUING_AGENCIES: IssuingAgencyItem[] = [
  {
    id: 'agency-1',
    code: 'KTHT',
    name: 'Ban Kỹ thuật - Hạ tầng Cơ sở',
    shortName: 'Ban KTHT',
    isActive: true
  },
  {
    id: 'agency-2',
    code: 'VNR',
    name: 'Tổng công ty Đường sắt Việt Nam',
    shortName: 'Tổng công ty ĐSVN',
    isActive: true
  },
  {
    id: 'agency-3',
    code: 'VPTC',
    name: 'Văn phòng Tổng công ty',
    shortName: 'Văn phòng TCT',
    isActive: true
  },
  {
    id: 'agency-4',
    code: 'DTXD',
    name: 'Ban Quản lý Đầu tư & Xây dựng',
    shortName: 'Ban QLĐT&XD',
    isActive: true
  },
  {
    id: 'agency-5',
    code: 'BGTVT',
    name: 'Bộ Giao thông Vận tải',
    shortName: 'Bộ GTVT',
    isActive: true
  },
  {
    id: 'agency-6',
    code: 'CDSVN',
    name: 'Cục Đường sắt Việt Nam',
    shortName: 'Cục ĐSVN',
    isActive: true
  },
  {
    id: 'agency-7',
    code: 'ATGT',
    name: 'Ban An toàn Giao thông Đường sắt',
    shortName: 'Ban ATGT',
    isActive: true
  },
  {
    id: 'agency-8',
    code: 'HDTV',
    name: 'Hội đồng Thành viên Tổng công ty',
    shortName: 'HĐTV ĐSVN',
    isActive: true
  },
  {
    id: 'agency-9',
    code: 'TCKT',
    name: 'Ban Tài chính - Kế toán',
    shortName: 'Ban TCKT',
    isActive: true
  }
];

export const DEFAULT_METADATA_SCHEMAS: DocTypeMetadataSchema[] = [
  {
    id: 'schema-hop-dong',
    docType: 'Hợp đồng kinh tế',
    aliases: ['Hợp đồng', 'Hợp đồng kinh tế', 'HĐ'],
    name: 'Hợp đồng & Phụ lục kinh tế',
    description: 'Quản lý thông tin giá trị hợp đồng, thời hạn thực hiện, đối tác các bên A và B',
    badgeColor: 'emerald',
    isSystem: true,
    updatedAt: '2026-04-01T08:00:00Z',
    fields: [
      {
        id: 'f-hd-01',
        key: 'giaTriHopDong',
        label: 'Giá trị hợp đồng',
        type: 'currency',
        required: true,
        unit: 'VNĐ',
        placeholder: '12.500.000.000',
        description: 'Tổng giá trị hợp đồng sau thuế đã ký kết'
      },
      {
        id: 'f-hd-02',
        key: 'thoiHanThucHien',
        label: 'Thời hạn thực hiện',
        type: 'text',
        required: false,
        unit: 'tháng',
        placeholder: '24 tháng (hoặc đến 31/12/2026)',
        description: 'Tiến độ hoàn thành cam kết theo hợp đồng'
      },
      {
        id: 'f-hd-03',
        key: 'benA',
        label: 'Bên A (Chủ đầu tư / Bên giao)',
        type: 'text',
        required: true,
        placeholder: 'Tổng công ty ĐSVN / Ban QLDA Đường sắt',
        description: 'Tên cơ quan, đơn vị đại diện chủ đầu tư'
      },
      {
        id: 'f-hd-04',
        key: 'benB',
        label: 'Bên B (Nhà thầu / Đối tác)',
        type: 'text',
        required: true,
        placeholder: 'Công ty CP Cơ khí Đường sắt Hà Nội',
        description: 'Tên nhà thầu hoặc bên cung ứng dịch vụ'
      },
      {
        id: 'f-hd-05',
        key: 'hinhThucHopDong',
        label: 'Hình thức hợp đồng',
        type: 'select',
        required: false,
        options: ['Trọn gói', 'Theo đơn giá cố định', 'Theo đơn giá điều chỉnh', 'Theo thời gian', 'Hỗn hợp'],
        defaultValue: 'Trọn gói'
      },
      {
        id: 'f-hd-06',
        key: 'ngayHieuLuc',
        label: 'Ngày bắt đầu hiệu lực',
        type: 'date',
        required: false
      }
    ]
  },
  {
    id: 'schema-quyet-dinh',
    docType: 'Quyết định',
    aliases: ['Quyết định', 'QĐ'],
    name: 'Quyết định ban hành',
    description: 'Quản lý thông tin người ký quyết định, chức vụ, cấp ban hành và ngày có hiệu lực',
    badgeColor: 'blue',
    isSystem: true,
    updatedAt: '2026-04-01T08:00:00Z',
    fields: [
      {
        id: 'f-qd-01',
        key: 'nguoiKy',
        label: 'Người ký quyết định',
        type: 'text',
        required: true,
        placeholder: 'Đặng Sỹ Mạnh',
        description: 'Họ và tên Lãnh đạo ký duyệt quyết định'
      },
      {
        id: 'f-qd-02',
        key: 'chucVuNguoiKy',
        label: 'Chức vụ người ký',
        type: 'text',
        required: true,
        placeholder: 'Tổng Giám Đốc',
        description: 'Chức danh của người ký duyệt văn bản'
      },
      {
        id: 'f-qd-03',
        key: 'capBanHanh',
        label: 'Cấp ban hành',
        type: 'select',
        required: false,
        options: ['Hội đồng Thành viên', 'Tổng Giám Đốc', 'Phó Tổng Giám Đốc', 'Trưởng Ban Chuyên môn', 'Giám Đốc Chi Nhánh'],
        defaultValue: 'Tổng Giám Đốc'
      },
      {
        id: 'f-qd-04',
        key: 'ngayHieuLuc',
        label: 'Ngày có hiệu lực thi hành',
        type: 'date',
        required: false
      },
      {
        id: 'f-qd-05',
        key: 'phamViApDung',
        label: 'Phạm vi áp dụng',
        type: 'text',
        required: false,
        placeholder: 'Toàn bộ các đơn vị thành viên Tổng công ty'
      }
    ]
  },
  {
    id: 'schema-thiet-ke',
    docType: 'Hồ sơ thiết kế',
    aliases: ['Hồ sơ thiết kế', 'Thiết kế', 'Bản vẽ hoàn công', 'Bản vẽ'],
    name: 'Hồ sơ Thiết kế & Bản vẽ kỹ thuật',
    description: 'Quản lý thông tin tên người thiết kế, chủ trì thiết kế, giai đoạn và tỷ lệ bản vẽ',
    badgeColor: 'purple',
    isSystem: true,
    updatedAt: '2026-04-01T08:00:00Z',
    fields: [
      {
        id: 'f-tk-01',
        key: 'nguoiThietKe',
        label: 'Tên người thiết kế / Tác giả',
        type: 'text',
        required: true,
        placeholder: 'KTS. Lê Hồng Phong',
        description: 'Kiến trúc sư / Kỹ sư trực tiếp chủ nhiệm thiết kế'
      },
      {
        id: 'f-tk-02',
        key: 'chuTriThietKe',
        label: 'Chủ trì thiết kế kết cấu',
        type: 'text',
        required: false,
        placeholder: 'KS. Trần Quốc Tuấn',
        description: 'Kỹ sư chủ trì bộ môn kết cấu / hạ tầng'
      },
      {
        id: 'f-tk-03',
        key: 'giaiDoanThietKe',
        label: 'Giai đoạn thiết kế',
        type: 'select',
        required: true,
        options: ['Thiết kế cơ sở', 'Thiết kế kỹ thuật', 'Thiết kế bản vẽ thi công', 'Bản vẽ hoàn công công trình'],
        defaultValue: 'Thiết kế bản vẽ thi công'
      },
      {
        id: 'f-tk-04',
        key: 'hangMucCongTrinh',
        label: 'Hạng mục công trình',
        type: 'text',
        required: false,
        placeholder: 'Cầu Đuống mới & Nắn chỉnh bình diện Km 9+600'
      },
      {
        id: 'f-tk-05',
        key: 'tyLeBanVe',
        label: 'Tỷ lệ bản vẽ chính',
        type: 'text',
        required: false,
        unit: 'Tỷ lệ',
        placeholder: '1/500, 1/1000, 1/50'
      }
    ]
  },
  {
    id: 'schema-bien-ban',
    docType: 'Biên bản nghiệm thu',
    aliases: ['Biên bản nghiệm thu', 'Biên bản', 'BB'],
    name: 'Biên bản nghiệm thu & Bàn giao',
    description: 'Quản lý thành phần tham gia nghiệm thu, kết luận kiểm tra và địa điểm',
    badgeColor: 'amber',
    isSystem: true,
    updatedAt: '2026-04-01T08:00:00Z',
    fields: [
      {
        id: 'f-bb-01',
        key: 'thanhPhanThamGia',
        label: 'Thành phần tham gia nghiệm thu',
        type: 'text',
        required: false,
        placeholder: 'Đại diện CĐT, Tư vấn giám sát, Đơn vị thi công'
      },
      {
        id: 'f-bb-02',
        key: 'ketLuanNghiemThu',
        label: 'Kết luận nghiệm thu',
        type: 'select',
        required: true,
        options: ['Đạt yêu cầu nghiệm thu bàn giao', 'Đạt có điều kiện (khắc phục tồn tại)', 'Chưa đạt - Yêu cầu làm lại'],
        defaultValue: 'Đạt yêu cầu nghiệm thu bàn giao'
      },
      {
        id: 'f-bb-03',
        key: 'diaDiemLap',
        label: 'Địa điểm nghiệm thu',
        type: 'text',
        required: false,
        placeholder: 'Tại hiện trường Km 830+200 tuyến Hà Nội - TP.HCM'
      }
    ]
  },
  {
    id: 'schema-bao-cao',
    docType: 'Báo cáo kỹ thuật',
    aliases: ['Báo cáo kỹ thuật', 'Báo cáo', 'BC'],
    name: 'Báo cáo chuyên môn & Báo cáo kỹ thuật',
    description: 'Quản lý kỳ báo cáo, người lập báo cáo và các chỉ tiêu số liệu chính',
    badgeColor: 'teal',
    isSystem: true,
    updatedAt: '2026-04-01T08:00:00Z',
    fields: [
      {
        id: 'f-bc-01',
        key: 'kyBaoCao',
        label: 'Kỳ báo cáo',
        type: 'select',
        required: true,
        options: ['Báo cáo Tuần', 'Báo cáo Tháng', 'Báo cáo Quý', 'Báo cáo Năm', 'Báo cáo Đột xuất / Chuyên đề'],
        defaultValue: 'Báo cáo Tháng'
      },
      {
        id: 'f-bc-02',
        key: 'nguoiLapBaoCao',
        label: 'Người lập báo cáo',
        type: 'text',
        required: false,
        placeholder: 'Nguyễn Văn Cường'
      },
      {
        id: 'f-bc-03',
        key: 'soLieuChinh',
        label: 'Chỉ tiêu số liệu chính',
        type: 'text',
        required: false,
        placeholder: 'Hoàn thành 100% kế hoạch, an toàn tuyệt đối'
      }
    ]
  },
  {
    id: 'schema-to-trinh',
    docType: 'Tờ trình',
    aliases: ['Tờ trình', 'TTr'],
    name: 'Tờ trình & Đề xuất phê duyệt',
    description: 'Quản lý kinh phí đề xuất, người ký trình và căn cứ đề xuất',
    badgeColor: 'rose',
    isSystem: true,
    updatedAt: '2026-04-01T08:00:00Z',
    fields: [
      {
        id: 'f-ttr-01',
        key: 'kinhPhiDeXuat',
        label: 'Kinh phí đề xuất phê duyệt',
        type: 'currency',
        required: false,
        unit: 'VNĐ',
        placeholder: '850.000.000'
      },
      {
        id: 'f-ttr-02',
        key: 'nguoiKyTrinh',
        label: 'Người ký tờ trình',
        type: 'text',
        required: false,
        placeholder: 'Trưởng ban Kỹ thuật - Hạ tầng'
      },
      {
        id: 'f-ttr-03',
        key: 'canCuDeXuat',
        label: 'Căn cứ đề xuất chính',
        type: 'text',
        required: false,
        placeholder: 'Quyết định số 158/QĐ-ĐS ngày 15/03/2026'
      }
    ]
  }
];

export const INITIAL_EXISTING_DOCS: ExistingDocument[] = [
  {
    id: 'hstl-ex-001',
    soKyHieu: '158/QĐ-ĐS',
    coQuanBanHanh: 'Tổng công ty Đường sắt Việt Nam',
    ngayBanHanh: '2026-03-15',
    trichYeu: 'Về việc phê duyệt kế hoạch đại tu tuyến đường sắt Bắc - Nam đoạn qua khu vực miền Trung năm 2026',
    loaiVanBan: 'Quyết định',
    fileScanUrl: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=800&auto=format&fit=crop&q=80',
    fileName: '158_QD-DS_PheDuyetDaiTu_Signed_Stamped.pdf',
    fileSize: '3.4 MB',
    fileType: 'application/pdf',
    currentVersion: 2,
    versions: [
      {
        id: 'ver-001-2',
        version: 2,
        versionLabel: 'v2.0 - Bản ký duyệt đóng dấu đỏ & Phụ lục kế hoạch vốn',
        fileName: '158_QD-DS_PheDuyetDaiTu_Signed_Stamped.pdf',
        fileSize: '3.4 MB',
        fileUrl: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=800&auto=format&fit=crop&q=80',
        uploadedAt: '2026-04-02T14:20:00Z',
        uploadedById: 'user_vt_1',
        uploadedByName: 'Lê Hoàng Yến',
        uploadedByRole: 'Văn thư Tổng công ty',
        changeNote: 'Tiếp nhận bản scan có dấu đỏ của Tổng công ty và cập nhật phụ lục danh mục lý trình đại tu 2026.',
        isCurrent: true
      },
      {
        id: 'ver-001-1',
        version: 1,
        versionLabel: 'v1.0 - Bản dự thảo ban đầu trình thẩm tra',
        fileName: '158_QD-DS_BanDuThao_TrinhDuyet.pdf',
        fileSize: '2.9 MB',
        fileUrl: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=800&auto=format&fit=crop&q=80',
        uploadedAt: '2026-04-01T08:30:00Z',
        uploadedById: 'user_cv_1',
        uploadedByName: 'Nguyễn Văn Cường',
        uploadedByRole: 'Chuyên viên kỹ thuật',
        changeNote: 'Khởi tạo hồ sơ số hóa ban đầu trình Trưởng phòng kiểm tra.',
        isCurrent: false
      }
    ],
    hasStamp: true,
    ocrText: `TỔNG CÔNG TY ĐƯỜNG SẮT VIỆT NAM
Số: 158/QĐ-ĐS
Hà Nội, ngày 15 tháng 03 năm 2026
QUYẾT ĐỊNH
Về việc phê duyệt kế hoạch đại tu tuyến đường sắt Bắc - Nam đoạn qua khu vực miền Trung năm 2026
TỔNG GIÁM ĐỐC TỔNG CÔNG TY ĐƯỜNG SẮT VIỆT NAM
Căn cứ Điều lệ tổ chức và hoạt động...
QUYẾT ĐỊNH:
Điều 1. Phê duyệt kế hoạch đại tu lý trình Km 650+00 đến Km 720+500...
[Dấu đỏ chứng thực & Chữ ký: ĐÃ PHÊ DUYỆT]`,
    ocrExtracted: {
      soKyHieu: '158/QĐ-ĐS',
      coQuan: 'Tổng công ty Đường sắt Việt Nam',
      ngayBanHanh: '2026-03-15',
      trichYeu: 'Về việc phê duyệt kế hoạch đại tu tuyến đường sắt Bắc - Nam đoạn qua khu vực miền Trung năm 2026',
      hasRedSeal: true,
      confidence: 98.6
    },
    createdBy: 'user_cv_1',
    createdByName: 'Nguyễn Văn Cường',
    createdAt: '2026-04-01T08:30:00Z',
    assignedReviewerId: 'user_tp_1',
    assignedReviewerName: 'Trần Thị Thu Hương',
    status: 'ARCHIVED',
    reviewNote: 'Bản scan có dấu đỏ sắc nét, đủ chữ ký lãnh đạo và con dấu Tổng công ty. Thông tin pháp lý chuẩn xác.',
    reviewedAt: '2026-04-02T09:15:00Z',
    retentionPeriod: 'VĨNH VIỄN',
    physicalLocation: {
      phongBan: 'Ban Kỹ thuật - Đầu tư',
      ke: 'Kệ K-03 (Hồ sơ Kỹ thuật & Dự án Hoàn công)',
      ngan: 'Ngăn N-02 (Đại tu cầu đường)',
      hop: 'Hộp / Cặp H-18',
      hoSo: 'Hồ sơ số 01 (HS-01)',
      maVach: 'BKT-K03-N02-H18-HS01',
      donVi: 'Tổng công ty Đường sắt Việt Nam',
      khuVuc: 'Khu vực B (Tầng 2 - Kho Lưu trữ Kỹ thuật & Dự án)',
      kho: 'Kho Lưu trữ Trung tâm Số 1'
    },
    archivedAt: '2026-04-02T14:20:00Z',
    archivedBy: 'user_vt_1',
    archivedByName: 'Lê Hoàng Yến',
    securityLevel: 'THƯỜNG',
    customMetadata: {
      nguoiKy: 'Đặng Sỹ Mạnh',
      chucVuNguoiKy: 'Tổng Giám Đốc',
      capBanHanh: 'Tổng Giám Đốc',
      ngayHieuLuc: '2026-03-15',
      phamViApDung: 'Khu vực đường sắt miền Trung & Các Ban kỹ thuật'
    }
  },
  {
    id: 'hstl-ex-004',
    soKyHieu: 'TTr-KT-2026/08',
    coQuanBanHanh: 'Ban Kỹ thuật - Hạ tầng Cơ sở',
    ngayBanHanh: '2026-04-20',
    trichYeu: 'Tờ trình kiểm tra & phê duyệt phương án gia cố vỏ hầm đường sắt Hải Vân Km 760',
    loaiVanBan: 'Tờ trình',
    fileScanUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&auto=format&fit=crop&q=80',
    fileName: 'TTr-KT-2026_08_GiaCoVoHamHaiVan_ChuaDau.docx',
    fileSize: '2.6 MB',
    fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    currentVersion: 2,
    versions: [
      {
        id: 'ver-004-2',
        version: 2,
        versionLabel: 'v2.0 - Bổ sung báo cáo kiểm định trắc đạc & số liệu rung chấn',
        fileName: 'TTr-KT-2026_08_GiaCoVoHamHaiVan_ChuaDau.docx',
        fileSize: '2.6 MB',
        fileUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&auto=format&fit=crop&q=80',
        uploadedAt: '2026-04-21T10:15:00Z',
        uploadedById: 'user_cv_1',
        uploadedByName: 'Nguyễn Văn Cường',
        uploadedByRole: 'Chuyên viên kỹ thuật',
        changeNote: 'Bổ sung kết quả kiểm định kết cấu vòm bê tông vỏ hầm theo góp ý của Ban An toàn Giao thông.',
        isCurrent: true
      },
      {
        id: 'ver-004-1',
        version: 1,
        versionLabel: 'v1.0 - Tờ trình khảo sát sơ bộ',
        fileName: 'TTr-KT-2026_08_GiaCoVoHam_SoBo.docx',
        fileSize: '1.8 MB',
        fileUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&auto=format&fit=crop&q=80',
        uploadedAt: '2026-04-20T09:00:00Z',
        uploadedById: 'user_cv_1',
        uploadedByName: 'Nguyễn Văn Cường',
        uploadedByRole: 'Chuyên viên kỹ thuật',
        changeNote: 'Tờ trình khảo sát ban đầu lập phương án gia cố vỏ hầm.',
        isCurrent: false
      }
    ],
    hasStamp: false,
    ocrText: `TỔNG CÔNG TY ĐƯỜNG SẮT VIỆT NAM - BAN KỸ THUẬT
Số: TTr-KT-2026/08
TỜ TRÌNH KIỂM TRA PHƯƠNG ÁN GIA CỐ HẦM HẢI VÂN
Kính gửi: Trưởng ban Kỹ thuật - Hạ tầng Cơ sở
[Hồ sơ tài liệu chưa đóng dấu - Trình kiểm tra & lấy ý kiến phối hợp]`,
    ocrExtracted: {
      soKyHieu: 'TTr-KT-2026/08',
      coQuan: 'Ban Kỹ thuật - Hạ tầng Cơ sở',
      ngayBanHanh: '2026-04-20',
      trichYeu: 'Tờ trình kiểm tra & phê duyệt phương án gia cố vỏ hầm đường sắt Hải Vân Km 760',
      hasRedSeal: false,
      confidence: 97.5
    },
    createdBy: 'user_cv_1',
    createdByName: 'Nguyễn Văn Cường',
    createdAt: '2026-04-20T09:00:00Z',
    assignedReviewerId: 'user_tp_1',
    assignedReviewerName: 'Trần Thị Thu Hương',
    status: 'PENDING_REVIEW',
    securityLevel: 'THƯỜNG'
  },
  {
    id: 'hstl-ex-005',
    soKyHieu: 'BB-NT-2026/15',
    coQuanBanHanh: 'Tổ Kiểm tra Kỹ thuật Liên hợp',
    ngayBanHanh: '2026-04-18',
    trichYeu: 'Biên bản kiểm tra kỹ thuật định kỳ hệ thống tín hiệu đường sắt tự động ga Giáp Bát',
    loaiVanBan: 'Biên bản',
    fileScanUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800&auto=format&fit=crop&q=80',
    fileName: 'BB-NT-2026_15_KiemTraTinHieu_ChuaDau.pdf',
    fileSize: '3.1 MB',
    fileType: 'application/pdf',
    hasStamp: false,
    ocrText: `BIÊN BẢN KIỂM TRA KỸ THUẬT ĐỊNH KỲ
Hệ thống tín hiệu ga Giáp Bát
Ngày kiểm tra: 18/04/2026`,
    ocrExtracted: {
      soKyHieu: 'BB-NT-2026/15',
      coQuan: 'Tổ Kiểm tra Kỹ thuật Liên hợp',
      ngayBanHanh: '2026-04-18',
      trichYeu: 'Biên bản kiểm tra kỹ thuật định kỳ hệ thống tín hiệu đường sắt tự động ga Giáp Bát',
      hasRedSeal: false,
      confidence: 96.0
    },
    createdBy: 'user_cv_1',
    createdByName: 'Nguyễn Văn Cường',
    createdAt: '2026-04-18T14:30:00Z',
    assignedReviewerId: 'user_tp_1',
    assignedReviewerName: 'Trần Thị Thu Hương',
    status: 'COORDINATING',
    coordinations: [
      {
        id: 'coord-l1-01',
        unitId: 'unit-at',
        unitName: 'Ban An toàn Giao thông Đường sắt',
        officerId: 'user_at_1',
        officerName: 'Đặng Quốc Huy',
        deadlineSLA: '2026-04-25',
        status: 'FEEDBACK_PROVIDED',
        feedbackText: 'Đã rà soát các biên bản kiểm tra rơ-le và mạch đóng đường tự động. Đề nghị bổ sung ghi nhận kiểm định rào chắn tự động.',
        feedbackDate: '2026-04-19T10:15:00Z'
      },
      {
        id: 'coord-l1-02',
        unitId: 'unit-kh',
        unitName: 'Ban Kế hoạch - Đầu tư',
        officerId: 'user_kh_1',
        officerName: 'Phạm Hồng Nhung',
        deadlineSLA: '2026-04-26',
        status: 'PENDING'
      }
    ],
    securityLevel: 'THƯỜNG'
  },
  {
    id: 'hstl-ex-006',
    soKyHieu: 'PA-KT-2026/32',
    coQuanBanHanh: 'Ban Kỹ thuật - Hạ tầng Cơ sở',
    ngayBanHanh: '2026-04-15',
    trichYeu: 'Phương án kỹ thuật nắn chỉnh bình diện đường cong bán kính nhỏ R300 đèo Hải Vân',
    loaiVanBan: 'Báo cáo',
    fileScanUrl: 'https://images.unsplash.com/photo-1618042164219-62c820f10723?w=800&auto=format&fit=crop&q=80',
    fileName: 'PA-KT-2026_32_NanChinhDuongCong_R300.docx',
    fileSize: '4.2 MB',
    fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    hasStamp: false,
    ocrText: `PHƯƠNG ÁN KỸ THUẬT NẮN CHỈNH BÌNH DIỆN ĐƯỜNG CONG
Lý trình: Km 758+200 - Km 759+800`,
    ocrExtracted: {
      soKyHieu: 'PA-KT-2026/32',
      coQuan: 'Ban Kỹ thuật - Hạ tầng Cơ sở',
      ngayBanHanh: '2026-04-15',
      trichYeu: 'Phương án kỹ thuật nắn chỉnh bình diện đường cong bán kính nhỏ R300 đèo Hải Vân',
      hasRedSeal: false,
      confidence: 98.0
    },
    createdBy: 'user_cv_1',
    createdByName: 'Nguyễn Văn Cường',
    createdAt: '2026-04-15T08:00:00Z',
    assignedReviewerId: 'user_tp_1',
    assignedReviewerName: 'Trần Thị Thu Hương',
    status: 'REVIEW_APPROVED',
    reviewNote: 'Hồ sơ tính toán kết cấu và bình diện chính xác, các ban phối hợp đã đồng thuận. Đồng ý phê duyệt, cho phép in phiếu trình và xuất bản trình Lãnh đạo Tổng công ty.',
    reviewedAt: '2026-04-16T16:20:00Z',
    securityLevel: 'THƯỜNG'
  },
  {
    id: 'hstl-ex-007',
    soKyHieu: 'TTr-VNR-2026/19',
    coQuanBanHanh: 'Ban Kỹ thuật - Hạ tầng Cơ sở',
    ngayBanHanh: '2026-04-12',
    trichYeu: 'Tờ trình phê duyệt kinh phí mua sắm thiết bị kiểm tra ray siêu âm kỹ thuật số thế hệ mới',
    loaiVanBan: 'Tờ trình',
    fileScanUrl: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=800&auto=format&fit=crop&q=80',
    fileName: 'TTr-VNR-2026_19_MuaSamSieuAmRay.pdf',
    fileSize: '3.8 MB',
    fileType: 'application/pdf',
    hasStamp: false,
    ocrText: `TỜ TRÌNH LÃNH ĐẠO TỔNG CÔNG TY
V/v Mua sắm thiết bị kiểm tra ray siêu âm kỹ thuật số`,
    ocrExtracted: {
      soKyHieu: 'TTr-VNR-2026/19',
      coQuan: 'Ban Kỹ thuật - Hạ tầng Cơ sở',
      ngayBanHanh: '2026-04-12',
      trichYeu: 'Tờ trình phê duyệt kinh phí mua sắm thiết bị kiểm tra ray siêu âm kỹ thuật số thế hệ mới',
      hasRedSeal: false,
      confidence: 99.0
    },
    createdBy: 'user_cv_1',
    createdByName: 'Nguyễn Văn Cường',
    createdAt: '2026-04-12T08:30:00Z',
    assignedReviewerId: 'user_tp_1',
    assignedReviewerName: 'Trần Thị Thu Hương',
    status: 'PRINTED_FOR_LEADER',
    reviewNote: 'Đồng ý nội dung tờ trình. Đã in xuất bản hồ sơ trình Tổng Giám Đốc ký ngoài đời thực.',
    reviewedAt: '2026-04-13T09:00:00Z',
    printedInfo: {
      printedAt: '2026-04-13T10:15:00Z',
      printedBy: 'Trần Thị Thu Hương (Trưởng phòng)',
      targetLeaderName: 'Hoàng Gia Khánh - Tổng Giám Đốc',
      printNote: 'In 03 bộ hồ sơ trình ký kèm dự thảo quyết định và phụ lục báo giá'
    },
    securityLevel: 'THƯỜNG'
  },
  {
    id: 'hstl-ex-008',
    soKyHieu: 'PA-XDCB-2026/04',
    coQuanBanHanh: 'Ban Quản lý Dự án Đường sắt Khu vực 2',
    ngayBanHanh: '2026-04-10',
    trichYeu: 'Phương án cải tạo ke ga và mái che hành khách ga Đồng Hới',
    loaiVanBan: 'Báo cáo',
    fileScanUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800&auto=format&fit=crop&q=80',
    fileName: 'PA-XDCB-2026_04_CaiTaoKeGaDongHoi.docx',
    fileSize: '2.9 MB',
    fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    hasStamp: false,
    ocrText: `PHƯƠNG ÁN CẢI TẠO KE GA HÀNH KHÁCH GA ĐỒNG HỚI`,
    ocrExtracted: {
      soKyHieu: 'PA-XDCB-2026/04',
      coQuan: 'Ban Quản lý Dự án Đường sắt Khu vực 2',
      ngayBanHanh: '2026-04-10',
      trichYeu: 'Phương án cải tạo ke ga và mái che hành khách ga Đồng Hới',
      hasRedSeal: false,
      confidence: 95.0
    },
    createdBy: 'user_cv_1',
    createdByName: 'Nguyễn Văn Cường',
    createdAt: '2026-04-10T11:00:00Z',
    assignedReviewerId: 'user_tp_1',
    assignedReviewerName: 'Trần Thị Thu Hương',
    status: 'REJECTED',
    reviewNote: 'Hồ sơ chưa có bản vẽ mặt cắt cao độ đỉnh ray so với ke ga và chưa có bảng dự toán bóc tách chi tiết. Yêu cầu chuyên viên bổ sung trước ngày 22/04.',
    reviewedAt: '2026-04-11T14:20:00Z',
    securityLevel: 'THƯỜNG'
  },
  {
    id: 'hstl-ex-009',
    soKyHieu: '09/KH-MẬT/2026',
    coQuanBanHanh: 'Hội đồng Thành viên Tổng công ty',
    ngayBanHanh: '2026-04-05',
    trichYeu: 'Kế hoạch bảo vệ an ninh trọng yếu mạng lưới viễn thông và trung tâm điều hành chạy tàu Quốc gia 2026-2030',
    loaiVanBan: 'Kế hoạch',
    fileScanUrl: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=800&auto=format&fit=crop&q=80',
    fileName: '09_KH-MAT_2026_AnNinhTrongYeu_Signed.pdf',
    fileSize: '4.5 MB',
    fileType: 'application/pdf',
    hasStamp: true,
    ocrText: `TỔNG CÔNG TY ĐƯỜNG SẮT VIỆT NAM - HỘI ĐỒNG THÀNH VIÊN\nSố: 09/KH-MẬT/2026\n[TÀI LIỆU MẬT - LƯU HÀNH NỘI BỘ]\nKế hoạch bảo vệ an ninh trọng yếu mạng lưới viễn thông và điều hành chạy tàu`,
    ocrExtracted: {
      soKyHieu: '09/KH-MẬT/2026',
      coQuan: 'Hội đồng Thành viên Tổng công ty',
      ngayBanHanh: '2026-04-05',
      trichYeu: 'Kế hoạch bảo vệ an ninh trọng yếu mạng lưới viễn thông và trung tâm điều hành chạy tàu Quốc gia 2026-2030',
      hasRedSeal: true,
      confidence: 99.2
    },
    createdBy: 'user_cv_1',
    createdByName: 'Nguyễn Văn Cường',
    createdAt: '2026-04-05T09:00:00Z',
    assignedReviewerId: 'user_tp_1',
    assignedReviewerName: 'Trần Thị Thu Hương',
    status: 'ARCHIVED',
    reviewNote: 'Tài liệu MẬT theo quy định Nhà nước. Đã phân quyền truy cập cho Ban Kỹ thuật và Lãnh đạo Tổng công ty.',
    reviewedAt: '2026-04-06T10:00:00Z',
    retentionPeriod: 'VĨNH VIỄN',
    physicalLocation: {
      phongBan: 'Văn phòng Tổng công ty (Phòng Hành chính - Lưu trữ)',
      ke: 'Kệ K-01 (Văn bản Đến & Chỉ đạo)',
      ngan: 'Ngăn N-01 (Tủ Mật)',
      hop: 'Hộp / Cặp H-01 (Niêm phong)',
      hoSo: 'Hồ sơ số 01 (HS-MAT-01)',
      maVach: 'VP-K01-N01-H01-MAT',
      donVi: 'Tổng công ty Đường sắt Việt Nam',
      khuVuc: 'Khu vực A (Tầng 1 - Kho Trụ sở)',
      kho: 'Kho Lưu trữ Trung tâm Số 1'
    },
    archivedAt: '2026-04-06T15:30:00Z',
    archivedBy: 'user_vt_1',
    archivedByName: 'Lê Hoàng Yến',
    securityLevel: 'MẬT',
    secretAccessPermissions: {
      userIds: ['user_cv_1', 'user_tp_1', 'user_admin_1'],
      departmentNames: ['Ban Kỹ thuật - Hạ tầng Cơ sở', 'Văn phòng Tổng công ty']
    }
  },
  {
    id: 'hstl-ex-002',
    soKyHieu: '24/BC-KTHUAT',
    coQuanBanHanh: 'Cục Đường sắt Việt Nam',
    ngayBanHanh: '2026-04-10',
    trichYeu: 'Báo cáo thẩm tra hồ sơ thiết kế kỹ thuật cầu đường sắt Km 830+200 tuyến Hà Nội - TP.HCM',
    loaiVanBan: 'Báo cáo',
    fileScanUrl: 'https://images.unsplash.com/photo-1618042164219-62c820f10723?w=800&auto=format&fit=crop&q=80',
    fileName: '24_BC-KTHUAT_BaoCaoThamTra_Signed.pdf',
    fileSize: '4.8 MB',
    fileType: 'application/pdf',
    hasStamp: true,
    ocrText: `BỘ GIAO THÔNG VẬN TẢI - CỤC ĐƯỜNG SẮT VIỆT NAM
Số: 24/BC-KTHUAT
Hà Nội, ngày 10 tháng 04 năm 2026
BÁO CÁO THẨM TRA HỒ SƠ THIẾT KẾ KỸ THUẬT
Công trình: Nâng cấp cầu đường sắt Km 830+200
Kính gửi: Tổng công ty Đường sắt Việt Nam
[Chữ ký Cục trưởng & Con dấu đỏ Quốc huy]`,
    ocrExtracted: {
      soKyHieu: '24/BC-KTHUAT',
      coQuan: 'Cục Đường sắt Việt Nam',
      ngayBanHanh: '2026-04-10',
      trichYeu: 'Báo cáo thẩm tra hồ sơ thiết kế kỹ thuật cầu đường sắt Km 830+200',
      hasRedSeal: true,
      confidence: 96.4
    },
    createdBy: 'user_cv_1',
    createdByName: 'Nguyễn Văn Cường',
    createdAt: '2026-04-11T10:00:00Z',
    assignedReviewerId: 'user_tp_1',
    assignedReviewerName: 'Trần Thị Thu Hương',
    status: 'PENDING_VAN_THU',
    reviewNote: 'Trưởng phòng đã thẩm tra đạt yêu cầu pháp lý. Đã chuyển Văn thư phê duyệt định vị kho và nhập Thư viện HSTL.',
    reviewedAt: '2026-04-12T08:45:00Z',
    retentionPeriod: '20 NĂM',
    securityLevel: 'THƯỜNG'
  },
  {
    id: 'hstl-ex-003',
    soKyHieu: '89/HĐ-XD2026',
    coQuanBanHanh: 'Ban Quản lý Dự án Đường sắt Khu vực 2',
    ngayBanHanh: '2026-04-18',
    trichYeu: 'Hợp đồng thi công gói thầu số 04: Cung ứng ray và tà vẹt bê tông dự ứng lực',
    loaiVanBan: 'Hợp đồng',
    fileScanUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800&auto=format&fit=crop&q=80',
    fileName: '89_HD-XD2026_HopDongThiCong.pdf',
    fileSize: '5.1 MB',
    fileType: 'application/pdf',
    hasStamp: true,
    ocrText: `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
HỢP ĐỒNG KINH TẾ
Số: 89/HĐ-XD2026
Gói thầu số 04: Cung ứng ray và tà vẹt bê tông dự ứng lực
Bên giao thầu: Ban Quản lý Dự án Đường sắt Khu vực 2
Bên nhận thầu: Công ty CP Cơ khí Đường sắt`,
    ocrExtracted: {
      soKyHieu: '89/HĐ-XD2026',
      coQuan: 'Ban Quản lý Dự án Đường sắt Khu vực 2',
      ngayBanHanh: '2026-04-18',
      trichYeu: 'Hợp đồng thi công gói thầu số 04: Cung ứng ray và tà vẹt bê tông dự ứng lực',
      hasRedSeal: true,
      confidence: 94.2
    },
    createdBy: 'user_cv_1',
    createdByName: 'Nguyễn Văn Cường',
    createdAt: '2026-04-19T14:10:00Z',
    assignedReviewerId: 'user_tp_1',
    assignedReviewerName: 'Trần Thị Thu Hương',
    status: 'PENDING_REVIEW',
    securityLevel: 'THƯỜNG',
    customMetadata: {
      giaTriHopDong: 12500000000,
      thoiHanThucHien: '18 tháng',
      benA: 'Ban Quản lý Dự án Đường sắt Khu vực 2',
      benB: 'Công ty CP Cơ khí Đường sắt',
      hinhThucHopDong: 'Theo đơn giá cố định',
      ngayHieuLuc: '2026-04-18'
    }
  },
  {
    id: 'hstl-ex-010',
    soKyHieu: 'TK-KT-2026/12',
    coQuanBanHanh: 'Công ty Cổ phần Tư vấn Đầu tư & Xây dựng GTVT',
    ngayBanHanh: '2026-04-08',
    trichYeu: 'Hồ sơ thiết kế bản vẽ thi công nâng cấp hệ thống thoát nước nền đường sắt khu vực đèo Khe Nét',
    loaiVanBan: 'Hồ sơ thiết kế',
    fileScanUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&auto=format&fit=crop&q=80',
    fileName: 'TK-KT-2026_12_ThietKeThoatNuocKheNet.pdf',
    fileSize: '8.4 MB',
    fileType: 'application/pdf',
    hasStamp: true,
    ocrText: `TỔNG CÔNG TY ĐƯỜNG SẮT VIỆT NAM\nHỒ SƠ THIẾT KẾ BẢN VẼ THI CÔNG\nCông trình: Nâng cấp thoát nước nền đường khu vực đèo Khe Nét\nĐơn vị tư vấn thiết kế: CTCP Tư vấn Đầu tư & Xây dựng GTVT`,
    ocrExtracted: {
      soKyHieu: 'TK-KT-2026/12',
      coQuan: 'CTCP Tư vấn Đầu tư & Xây dựng GTVT',
      ngayBanHanh: '2026-04-08',
      trichYeu: 'Hồ sơ thiết kế bản vẽ thi công nâng cấp hệ thống thoát nước nền đường sắt khu vực đèo Khe Nét',
      hasRedSeal: true,
      confidence: 97.8
    },
    createdBy: 'user_cv_1',
    createdByName: 'Nguyễn Văn Cường',
    createdAt: '2026-04-08T10:00:00Z',
    assignedReviewerId: 'user_tp_1',
    assignedReviewerName: 'Trần Thị Thu Hương',
    status: 'ARCHIVED',
    reviewNote: 'Hồ sơ thiết kế đã được thẩm tra độc lập, đạt tiêu chuẩn kỹ thuật đường sắt cấp II.',
    reviewedAt: '2026-04-09T14:30:00Z',
    retentionPeriod: 'VĨNH VIỄN',
    physicalLocation: {
      phongBan: 'Ban Kế hoạch - Kinh doanh',
      ke: 'Kệ K-01 (Kế hoạch SXKD & Vận tải)',
      ngan: 'Ngăn N-04 (Hồ sơ Thiết kế & Bản vẽ)',
      hop: 'Hộp / Cặp H-09',
      hoSo: 'Hồ sơ số 01 (HS-01)',
      maVach: 'BKH-K01-N04-H09-TK',
      donVi: 'Tổng công ty Đường sắt Việt Nam',
      khuVuc: 'Khu vực A (Tầng 1 - Kho Trụ sở)',
      kho: 'Kho Lưu trữ Trung tâm Số 1'
    },
    archivedAt: '2026-04-10T09:00:00Z',
    archivedBy: 'user_vt_1',
    archivedByName: 'Lê Hoàng Yến',
    securityLevel: 'THƯỜNG',
    customMetadata: {
      nguoiThietKe: 'KTS. Lê Hồng Phong',
      chuTriThietKe: 'KS. Trần Quốc Tuấn',
      giaiDoanThietKe: 'Thiết kế bản vẽ thi công',
      hangMucCongTrinh: 'Hệ thống rãnh đỉnh & cống bản chịu lực đèo Khe Nét',
      tyLeBanVe: '1/500'
    }
  }
];

export const INITIAL_DRAFTS: DraftDossier[] = [
  {
    id: 'draft-003',
    code: 'HSCV-2026-089',
    trichYeu: 'Phương án cải tạo, nâng cấp hệ thống tín hiệu điện khí tập trung ga Diêu Trì tuyến ĐS Thống Nhất',
    loaiVanBan: 'Tờ trình & Đề xuất',
    field: 'Thông tin - Tín hiệu',
    creatorId: 'user_cv_1',
    creatorName: 'Nguyễn Văn Cường',
    creatorDepartment: 'Ban Kỹ thuật - Hạ tầng Cơ sở',
    createdAt: '2026-09-03T08:15:00Z',
    draftFileUrl: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&auto=format&fit=crop&q=80',
    draftFileName: 'DuThao_ToTrinh_TinHieuGaDieuTri_2026.docx',
    draftFileSize: '3.4 MB',
    currentStep: 'PENDING_DEPT_LEAD',
    deptLeadId: 'user_tp_1',
    deptLeadName: 'Trần Thị Thu Hương',
    coordinations: [],
    assignmentEvidence: {
      startedAt: '2026-09-03T08:15:00Z',
      startedBy: 'Nguyễn Văn Cường',
      startedByRole: 'Chuyên viên Ban Kỹ thuật - Hạ tầng',
      type: 'SOAN_THAO',
      comment: 'Căn cứ Kết luận số 42/TB-ĐSVN của Tổng Giám đốc tại buổi làm việc hiện trường ga Diêu Trì. Chuyên viên khởi tạo hồ sơ và kính trình Trưởng ban thẩm tra phương án.',
      initialDirective: 'Nâng cấp bảo đảm tuyệt đối an toàn chạy tàu trong quý IV/2026.'
    },
    timelineEvents: [
      {
        id: 'tl-001',
        step: 'DRAFT_STARTED',
        title: 'Bắt đầu soạn thảo hồ sơ dự thảo mới',
        time: '08:15 03/09/2026',
        actor: 'Nguyễn Văn Cường',
        actorRole: 'Chuyên viên Ban Kỹ thuật',
        action: 'Khởi tạo hồ sơ công việc kèm comment bằng chứng căn cứ kết luận số 42/TB-ĐSVN',
        comment: 'Căn cứ Kết luận số 42/TB-ĐSVN của Tổng Giám đốc tại buổi làm việc hiện trường ga Diêu Trì. Chuyên viên khởi tạo hồ sơ và kính trình Trưởng ban thẩm định phương án.',
        isEvidence: true,
        statusColor: 'emerald'
      },
      {
        id: 'tl-002',
        step: 'SUBMITTED_TO_LEAD',
        title: 'Trình Trưởng phòng kiểm tra & phê duyệt',
        time: '08:30 03/09/2026',
        actor: 'Nguyễn Văn Cường',
        actorRole: 'Chuyên viên Ban Kỹ thuật',
        action: 'Gửi hồ sơ lên Trưởng ban Trần Thị Thu Hương kiểm tra phương án',
        comment: 'Đã đính kèm dự thảo tờ trình, bản vẽ nguyên lý và bảng khái toán kinh phí.',
        isEvidence: false,
        statusColor: 'amber'
      }
    ]
  },
  {
    id: 'draft-001',
    code: 'HSCV-2026-042',
    trichYeu: 'Đề xuất phương án vận hành chạy tàu cao điểm hè 2026 và xin ý kiến phối hợp các ban nghiệp vụ',
    loaiVanBan: 'Tờ trình & Đề xuất',
    field: 'Vận tải & Điều hành',
    creatorId: 'user_cv_1',
    creatorName: 'Nguyễn Văn Cường',
    creatorDepartment: 'Ban Kỹ thuật - Hạ tầng Cơ sở',
    createdAt: '2026-04-05T09:00:00Z',
    draftFileUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&auto=format&fit=crop&q=80',
    draftFileName: 'DuThao_ToTrinh_VanHanhTauHe2026_v2.docx',
    draftFileSize: '1.8 MB',
    currentStep: 'WAITING_VAN_THU_ARCHIVE',
    deptLeadId: 'user_tp_1',
    deptLeadName: 'Trần Thị Thu Hương',
    assignmentEvidence: {
      startedAt: '2026-04-05T09:00:00Z',
      startedBy: 'Đặng Sỹ Mạnh',
      startedByRole: 'Tổng Giám Đốc TCT ĐSVN',
      type: 'GIAO_VIEC',
      comment: 'Lãnh đạo giao việc: Giao Ban Kỹ thuật chủ trì phối hợp Ban Vận tải xây dựng khẩn trương phương án chạy tàu hè 2026 chống ùn tắc hành khách.',
      initialDirective: 'Nhiệm vụ trọng tâm bảo đảm an toàn vận tải hè.'
    },
    timelineEvents: [
      {
        id: 'tl-101',
        step: 'ASSIGNED_BY_LEADER',
        title: 'Bắt đầu giao việc & Chỉ đạo khởi tạo hồ sơ',
        time: '09:00 05/04/2026',
        actor: 'Đặng Sỹ Mạnh',
        actorRole: 'Tổng Giám Đốc TCT ĐSVN',
        action: 'Lãnh đạo phát lệnh giao việc kèm comment bằng chứng chỉ đạo',
        comment: 'Giao Ban Kỹ thuật phối hợp Ban Vận tải xây dựng khẩn trương phương án chạy tàu hè 2026 chống ùn tắc hành khách.',
        isEvidence: true,
        statusColor: 'blue'
      },
      {
        id: 'tl-102',
        step: 'LEADER_PAPER_SIGNED',
        title: 'Lãnh đạo ký duyệt bản giấy & Đóng dấu đỏ thực tế',
        time: '10:30 10/04/2026',
        actor: 'Ông Đặng Sỹ Mạnh',
        actorRole: 'Tổng Giám Đốc',
        action: 'Ký duyệt bản cứng và đóng dấu mộc đỏ Tổng công ty',
        comment: 'Đồng ý phê duyệt phương án. Giao Ban Kỹ thuật phối hợp Ban Vận tải triển khai kiểm tra an toàn hành lang trước ngày 25/04.',
        isEvidence: true,
        statusColor: 'amber'
      },
      {
        id: 'tl-103',
        step: 'REPORT_SUBMITTED',
        title: 'Nộp Báo cáo kết quả nghiệm thu',
        time: '16:00 20/04/2026',
        actor: 'Nguyễn Văn Cường',
        actorRole: 'Chuyên viên Ban Kỹ thuật',
        action: 'Nộp báo cáo kết quả kèm 2 tệp biên bản nghiệm thu và hình ảnh thực địa',
        comment: 'Đã hoàn tất kiểm tra 100% đoàn toa xe, phối hợp 3 xí nghiệp đầu máy và bàn giao hồ sơ.',
        isEvidence: true,
        statusColor: 'emerald'
      },
      {
        id: 'tl-104',
        step: 'DEPT_REQUEST_ARCHIVE',
        title: 'Trưởng phòng yêu cầu Văn thư đưa vào Thư viện HSTL',
        time: '16:30 20/04/2026',
        actor: 'Trần Thị Thu Hương',
        actorRole: 'Trưởng ban Kỹ thuật - Hạ tầng Cơ sở',
        action: 'Lập phiếu yêu cầu Văn thư cơ quan tiếp nhận hồ sơ giấy đã ký đóng dấu lưu kho HSTL',
        comment: 'Theo yêu cầu của Tổng Giám đốc, hồ sơ công việc đã hoàn thành nghiệm thu thực tế và có chữ ký đóng dấu đỏ đầy đủ. Trưởng phòng yêu cầu Văn thư cơ quan tiếp nhận số hóa và nhập vào Thư viện HSTL 5 cấp.',
        isEvidence: true,
        statusColor: 'purple'
      }
    ],
    deptLeadRequestToVanThu: {
      requestedAt: '2026-04-20T16:30:00Z',
      requestedBy: 'Trần Thị Thu Hương',
      requestedByRole: 'Trưởng ban Kỹ thuật - Hạ tầng Cơ sở',
      note: 'Theo yêu cầu của Tổng Giám đốc, hồ sơ công việc đã hoàn thành nghiệm thu thực tế và có chữ ký đóng dấu đỏ đầy đủ. Trưởng phòng yêu cầu Văn thư cơ quan tiếp nhận số hóa và nhập vào Thư viện HSTL 5 cấp.',
      leaderSignedConfirmed: true
    },
    coordinations: [
      {
        id: 'coord-01',
        unitId: 'unit-vt',
        unitName: 'Ban Vận tải Đường sắt',
        officerId: 'user_officer_2',
        officerName: 'Đặng Quốc Huy',
        deadlineSLA: '2026-04-08',
        status: 'FEEDBACK_PROVIDED',
        feedbackText: 'Thống nhất tăng 12 đôi tàu khách khu đoạn Sài Gòn - Nha Trang và Hà Nội - Vinh. Đề nghị bổ sung dự phòng đầu máy tại ga Đà Nẵng.',
        feedbackFileName: 'Ykien_BanVanTai_BoSungDauMay.pdf',
        feedbackDate: '2026-04-07T15:30:00Z'
      },
      {
        id: 'coord-02',
        unitId: 'unit-tc',
        unitName: 'Ban Tài chính - Kế toán',
        officerId: 'user_officer_3',
        officerName: 'Phạm Hồng Nhung',
        deadlineSLA: '2026-04-08',
        status: 'FEEDBACK_PROVIDED',
        feedbackText: 'Phương án cân đối doanh thu phù hợp. Đã bố trí 4.2 tỷ VNĐ ngân sách nhiên liệu dự phòng.',
        feedbackFileName: 'Ykien_BanTaiChinh_Dutoan.pdf',
        feedbackDate: '2026-04-08T10:15:00Z'
      }
    ],
    printedAt: '2026-04-09T08:30:00Z',
    printedBy: 'Nguyễn Văn Cường (In bản giấy kèm ý kiến các phòng ban)',
    leaderPaperApproval: {
      leaderName: 'Ông Đặng Sỹ Mạnh - Tổng Giám Đốc',
      approvalDate: '2026-04-10',
      directiveNote: 'Đồng ý phê duyệt phương án. Giao Ban Kỹ thuật phối hợp Ban Vận tải triển khai kiểm tra an toàn hành lang trước ngày 25/04.',
      assignedOfficer: 'Nguyễn Văn Cường (Chủ trì triển khai thực địa)',
      paperSignatureConfirmed: true
    },
    resolutionReport: {
      reportTitle: 'Báo cáo kết quả triển khai chạy thử và nghiệm thu biểu đồ chạy tàu hè 2026',
      reportSummary: 'Đã hoàn tất kiểm tra 100% đoàn toa xe, phối hợp 3 xí nghiệp đầu máy toa xe và tổ chức phân luồng giao thông an toàn.',
      reportFileUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80',
      reportFileName: 'BaoCaoKetQua_ChayTauHe2026_Final.pdf',
      proofFiles: [
        { name: 'BienBanNghiemThu_ToaXe.pdf', url: '#', size: '2.1 MB' },
        { name: 'NhatKyKiemTraThucDia.xlsx', url: '#', size: '850 KB' }
      ],
      submittedAt: '2026-04-20T16:00:00Z',
      submittedBy: 'Nguyễn Văn Cường'
    }
  },
  {
    id: 'draft-002',
    code: 'HSCV-2026-058',
    trichYeu: 'Kế hoạch kiểm tra an toàn phòng chống thiên tai và bão lũ mùa mưa 2026 trên toàn tuyến',
    loaiVanBan: 'Kế hoạch',
    field: 'An toàn - Kỹ thuật',
    creatorId: 'user_cv_1',
    creatorName: 'Nguyễn Văn Cường',
    creatorDepartment: 'Ban Kỹ thuật - Hạ tầng Cơ sở',
    createdAt: '2026-04-18T10:20:00Z',
    draftFileUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&auto=format&fit=crop&q=80',
    draftFileName: 'KeHoach_PhongChongThienTai_2026_Draft.docx',
    draftFileSize: '2.3 MB',
    currentStep: 'COORDINATING',
    deptLeadId: 'user_tp_1',
    deptLeadName: 'Trần Thị Thu Hương',
    assignmentEvidence: {
      startedAt: '2026-04-18T10:20:00Z',
      startedBy: 'Nguyễn Văn Cường',
      startedByRole: 'Chuyên viên Ban Kỹ thuật',
      type: 'SOAN_THAO',
      comment: 'Chuyên viên chủ động xây dựng kế hoạch kiểm tra phòng chống thiên tai định kỳ trước mùa mưa bão năm 2026.'
    },
    timelineEvents: [
      {
        id: 'tl-201',
        step: 'DRAFT_STARTED',
        title: 'Bắt đầu soạn thảo kế hoạch phòng chống thiên tai',
        time: '10:20 18/04/2026',
        actor: 'Nguyễn Văn Cường',
        actorRole: 'Chuyên viên Ban Kỹ thuật',
        action: 'Khởi tạo hồ sơ dự thảo kế hoạch',
        comment: 'Chuyên viên chủ động xây dựng kế hoạch kiểm tra phòng chống thiên tai định kỳ trước mùa mưa bão năm 2026.',
        isEvidence: true,
        statusColor: 'emerald'
      },
      {
        id: 'tl-202',
        step: 'COORDINATING',
        title: 'Trưởng ban chuyển phối hợp các đơn vị',
        time: '14:00 18/04/2026',
        actor: 'Trần Thị Thu Hương',
        actorRole: 'Trưởng ban Kỹ thuật - Hạ tầng',
        action: 'Chuyển xin ý kiến Ban An toàn Giao thông và Công ty CP ĐS Nghệ Tĩnh',
        comment: 'Đề nghị các đơn vị rà soát các điểm xung yếu, sạt lở đèo Khe Nét và địa bàn miền Trung.',
        isEvidence: false,
        statusColor: 'blue'
      }
    ],
    coordinations: [
      {
        id: 'coord-11',
        unitId: 'unit-at',
        unitName: 'Ban An toàn Giao thông Đường sắt',
        officerId: 'user_officer_4',
        officerName: 'Vũ Đình Trọng',
        deadlineSLA: '2026-04-24',
        status: 'PENDING'
      },
      {
        id: 'coord-12',
        unitId: 'unit-qlcs',
        unitName: 'Công ty CP Đường sắt Nghệ Tĩnh',
        officerId: 'user_officer_5',
        officerName: 'Hoàng Văn Thái',
        deadlineSLA: '2026-04-25',
        status: 'PENDING'
      }
    ]
  }
];

export const INITIAL_INCOMING_DOCS: IncomingDocument[] = [
  {
    id: 'in-001',
    soDen: 1042,
    namDen: 2026,
    soKyHieuGoc: '24/BC-KTHUAT',
    coQuanGui: 'Cục Đường sắt Việt Nam',
    ngayBanHanh: '2026-04-10',
    ngayDen: '2026-04-11',
    trichYeu: 'Báo cáo thẩm tra hồ sơ thiết kế kỹ thuật cầu đường sắt Km 830+200 tuyến Hà Nội - TP.HCM',
    loaiVanBan: 'Báo cáo',
    fileScanUrl: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=800&auto=format&fit=crop&q=80',
    fileName: 'VanBanDen_24_BC-KTHUAT_Signed.pdf',
    fileSize: '4.2 MB',
    ocrExtracted: {
      soDenSuggested: 1042,
      soKyHieuSuggested: '24/BC-KTHUAT',
      coQuanSuggested: 'Cục Đường sắt Việt Nam',
      ngayBanHanhSuggested: '2026-04-10',
      trichYeuSuggested: 'Báo cáo thẩm tra hồ sơ thiết kế kỹ thuật cầu đường sắt Km 830+200',
      fullOcrText: 'BỘ GIAO THÔNG VẬN TẢI - CỤC ĐƯỜNG SẮT VIỆT NAM\nSố: 24/BC-KTHUAT\nHà Nội, ngày 10/04/2026\nBÁO CÁO THẨM TRA HỒ SƠ THIẾT KẾ KỸ THUẬT',
      confidence: 97.8
    },
    donViChuTri: 'Ban Kỹ thuật - Hạ tầng Cơ sở',
    donViPhoiHop: ['Ban Quản lý Dự án ĐS', 'Ban Tài chính - Kế toán'],
    canBoTheoDoi: 'Nguyễn Văn Cường',
    hanXuLy: '2026-04-25',
    trangThaiXuLy: 'DANG_XU_LY',
    isArchivedToHSTL: true,
    hstlCode: 'HSTL-VBD-2026-1042',
    retentionPeriod: '20 NĂM',
    physicalLocation: {
      phongBan: 'Văn phòng Tổng công ty (Phòng Hành chính - Lưu trữ)',
      ke: 'Kệ K-01 (Văn bản Đến & Chỉ đạo)',
      ngan: 'Ngăn N-04 (VBD Quý 2/2026)',
      hop: 'Hộp / Cặp H-05',
      hoSo: 'Hồ sơ số 01 (HS-01)',
      maVach: 'VP-K01-N04-H05-HS01',
      donVi: 'Tổng công ty Đường sắt Việt Nam',
      khuVuc: 'Khu vực A (Tầng 1 - Kho Trụ sở)',
      kho: 'Kho Lưu trữ Trung tâm Số 1'
    },
    registeredBy: 'user_vt_1',
    registeredByName: 'Lê Hoàng Yến'
  },
  {
    id: 'in-002',
    soDen: 1043,
    namDen: 2026,
    soKyHieuGoc: '512/BGTVT-VT',
    coQuanGui: 'Bộ Giao thông Vận tải',
    ngayBanHanh: '2026-04-15',
    ngayDen: '2026-04-16',
    trichYeu: 'Chỉ đạo tăng cường công tác kiểm tra phòng chống ùn tắc và đảm bảo trật tự an toàn giao thông đường sắt dịp lễ 30/4 - 1/5',
    loaiVanBan: 'Công văn',
    fileScanUrl: 'https://images.unsplash.com/photo-1618042164219-62c820f10723?w=800&auto=format&fit=crop&q=80',
    fileName: '512_BGTVT-VT_ChiDaoLe30-4.pdf',
    fileSize: '2.7 MB',
    ocrExtracted: {
      soDenSuggested: 1043,
      soKyHieuSuggested: '512/BGTVT-VT',
      coQuanSuggested: 'Bộ Giao thông Vận tải',
      ngayBanHanhSuggested: '2026-04-15',
      trichYeuSuggested: 'Chỉ đạo tăng cường công tác kiểm tra an toàn dịp lễ 30/4 - 1/5',
      fullOcrText: 'BỘ GIAO THÔNG VẬN TẢI\nSố: 512/BGTVT-VT\nHà Nội, ngày 15/04/2026\nKính gửi: Tổng công ty Đường sắt Việt Nam\nV/v tăng cường kiểm tra ATGT đường sắt dịp nghỉ lễ',
      confidence: 99.1
    },
    donViChuTri: 'Ban An toàn Giao thông Đường sắt',
    donViPhoiHop: ['Ban Vận tải', 'Văn phòng Tổng công ty'],
    canBoTheoDoi: 'Trần Văn Mạnh',
    hanXuLy: '2026-04-28',
    trangThaiXuLy: 'DANG_XU_LY',
    isArchivedToHSTL: true,
    hstlCode: 'HSTL-VBD-2026-1043',
    retentionPeriod: '10 NĂM',
    physicalLocation: {
      phongBan: 'Văn phòng Tổng công ty (Phòng Hành chính - Lưu trữ)',
      ke: 'Kệ K-01 (Văn bản Đến & Chỉ đạo)',
      ngan: 'Ngăn N-04 (VBD Quý 2/2026)',
      hop: 'Hộp / Cặp H-06',
      hoSo: 'Hồ sơ số 01 (HS-01)',
      maVach: 'VP-K01-N04-H06-HS01',
      donVi: 'Tổng công ty Đường sắt Việt Nam',
      khuVuc: 'Khu vực A (Tầng 1 - Kho Trụ sở)',
      kho: 'Kho Lưu trữ Trung tâm Số 1'
    },
    registeredBy: 'user_vt_1',
    registeredByName: 'Lê Hoàng Yến'
  }
];

export const INITIAL_OUTGOING_DOCS: OutgoingDocument[] = [
  {
    id: 'out-001',
    soDiNumber: 158,
    soDiFullCode: '158/QĐ-ĐS',
    loaiVanBan: 'QUYET_DINH',
    loaiVanBanLabel: 'Quyết định',
    donViSoanThao: 'Ban Kỹ thuật - Hạ tầng Cơ sở',
    chuyenVienSoanThao: 'Nguyễn Văn Cường',
    nguoiKy: 'Đặng Sỹ Mạnh',
    chucVuNguoiKy: 'Tổng Giám Đốc',
    ngayKy: '2026-03-15',
    trichYeu: 'Về việc phê duyệt kế hoạch đại tu tuyến đường sắt Bắc - Nam đoạn qua khu vực miền Trung năm 2026',
    noiNhan: 'Ban Tổng Giám đốc (Đặng Sỹ Mạnh, Hoàng Gia Khánh); Ban Kỹ thuật - Hạ tầng Cơ sở; Ban Quản lý Đầu tư & Xây dựng; Bộ GTVT; Cục ĐSVN; Lưu VT-HSTL',
    noiNhanDepartments: ['Ban Kỹ thuật - Hạ tầng Cơ sở', 'Ban Quản lý Đầu tư & Xây dựng'],
    noiNhanUserIds: ['user_gd_1', 'user_pgd_1'],
    noiNhanUserNames: ['Đặng Sỹ Mạnh (Tổng Giám Đốc)', 'Hoàng Gia Khánh (Phó Tổng Giám Đốc)'],
    noiNhanExternal: 'Bộ GTVT; Cục ĐSVN; Lưu VT-HSTL',
    soLuongBan: 15,
    fileScanDauDoUrl: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=800&auto=format&fit=crop&q=80',
    fileName: '158_QD-DS_DauDo_Goc_ND30.pdf',
    fileSize: '3.6 MB',
    banSaoDienTuIssuedCount: 4,
    isArchivedToHSTL: true,
    hstlCode: 'HSTL-VBDI-2026-158',
    retentionPeriod: 'VĨNH VIỄN',
    physicalLocation: {
      phongBan: 'Văn phòng Tổng công ty (Phòng Hành chính - Lưu trữ)',
      ke: 'Kệ K-02 (Văn bản Đi & Quyết định NĐ30)',
      ngan: 'Ngăn N-01 (Quyết định Vĩnh viễn)',
      hop: 'Hộp / Cặp H-02',
      hoSo: 'Hồ sơ số 01 (HS-01)',
      maVach: 'VP-K02-N01-H02-HS01',
      donVi: 'Tổng công ty Đường sắt Việt Nam',
      khuVuc: 'Khu vực A (Tầng 1 - Kho Trụ sở)',
      kho: 'Kho Lưu trữ Trung tâm Số 1'
    },
    registeredBy: 'user_vt_1',
    registeredByName: 'Lê Hoàng Yến',
    registeredAt: '2026-03-15T15:40:00Z'
  },
  {
    id: 'out-002',
    soDiNumber: 199,
    soDiFullCode: '199/CV-TCHC',
    loaiVanBan: 'CONG_VAN',
    loaiVanBanLabel: 'Công văn',
    donViSoanThao: 'Ban Tổ chức Cán bộ - Lao động',
    chuyenVienSoanThao: 'Trần Mai Hoa',
    nguoiKy: 'Nguyễn Tiến Hưng',
    chucVuNguoiKy: 'Phó Tổng Giám Đốc',
    ngayKy: '2026-04-12',
    trichYeu: 'Thông báo triệu tập lớp tập huấn bồi dưỡng văn hóa an toàn và quy trình số hóa văn thư lưu trữ năm 2026',
    noiNhan: 'Ban Tổng Giám đốc (Trần Anh Tuấn); Ban Tổ chức Cán bộ - Lao động; Văn phòng Tổng công ty; Trung tâm Công nghệ Thông tin; Các Chi nhánh Vận tải ĐS',
    noiNhanDepartments: ['Ban Tổ chức Cán bộ - Lao động', 'Văn phòng Tổng công ty', 'Trung tâm Công nghệ Thông tin'],
    noiNhanUserIds: ['user_pgd_2', 'user_admin_1'],
    noiNhanUserNames: ['Trần Anh Tuấn (Phó Tổng Giám Đốc)', 'Phan Minh Tuấn (Quản trị viên Hệ thống HSTL)'],
    noiNhanExternal: 'Các Chi nhánh Vận tải ĐS',
    soLuongBan: 35,
    fileScanDauDoUrl: 'https://images.unsplash.com/photo-1618042164219-62c820f10723?w=800&auto=format&fit=crop&q=80',
    fileName: '199_CV-TCHC_TrieuTapTapHuan_Signed.pdf',
    fileSize: '2.1 MB',
    banSaoDienTuIssuedCount: 12,
    isArchivedToHSTL: true,
    hstlCode: 'HSTL-VBDI-2026-199',
    retentionPeriod: '5 NĂM',
    physicalLocation: {
      phongBan: 'Văn phòng Tổng công ty (Phòng Hành chính - Lưu trữ)',
      ke: 'Kệ K-02 (Văn bản Đi & Quyết định NĐ30)',
      ngan: 'Ngăn N-03 (Công văn 5-10 năm)',
      hop: 'Hộp / Cặp H-09',
      hoSo: 'Hồ sơ số 01 (HS-01)',
      maVach: 'VP-K02-N03-H09-HS01',
      donVi: 'Tổng công ty Đường sắt Việt Nam',
      khuVuc: 'Khu vực A (Tầng 1 - Kho Trụ sở)',
      kho: 'Kho Lưu trữ Trung tâm Số 1'
    },
    registeredBy: 'user_vt_1',
    registeredByName: 'Lê Hoàng Yến',
    registeredAt: '2026-04-12T11:00:00Z'
  },
  {
    id: 'out-003',
    soDiNumber: 210,
    soDiFullCode: '210/TB-TGĐ',
    loaiVanBan: 'THONG_BAO',
    loaiVanBanLabel: 'Thông báo',
    donViSoanThao: 'Ban Tổng Giám Đốc',
    chuyenVienSoanThao: 'Đặng Sỹ Mạnh',
    nguoiKy: 'Đặng Sỹ Mạnh',
    chucVuNguoiKy: 'Tổng Giám Đốc',
    ngayKy: '2026-05-02',
    trichYeu: 'Thông báo kết luận của Tổng Giám đốc về phương án rà soát cân đối ngân sách đầu tư trung hạn và quản trị vốn năm 2026',
    noiNhan: 'Tổng Giám Đốc (Đặng Sỹ Mạnh); Ban Tài chính - Kế toán; Ban Pháp chế - Thanh tra; Lưu VT-HSTL',
    noiNhanDepartments: ['Ban Tài chính - Kế toán', 'Ban Pháp chế - Thanh tra'],
    noiNhanUserIds: ['user_gd_1'],
    noiNhanUserNames: ['Đặng Sỹ Mạnh (Tổng Giám Đốc)'],
    noiNhanExternal: 'Lưu VT-HSTL',
    soLuongBan: 5,
    fileScanDauDoUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&auto=format&fit=crop&q=80',
    fileName: '210_TB-TGD_KetLuanNganSach_Mat.pdf',
    fileSize: '1.8 MB',
    banSaoDienTuIssuedCount: 1,
    isArchivedToHSTL: true,
    hstlCode: 'HSTL-VBDI-2026-210',
    retentionPeriod: '20 NĂM',
    physicalLocation: {
      phongBan: 'Văn phòng Tổng công ty (Phòng Hành chính - Lưu trữ)',
      ke: 'Kệ K-01 (Văn bản Đến & Chỉ đạo)',
      ngan: 'Ngăn N-02 (VBD Năm 2025)',
      hop: 'Hộp / Cặp H-05',
      hoSo: 'Hồ sơ số 01 (HS-01)',
      maVach: 'VP-K01-N02-H05-HS01',
      donVi: 'Tổng công ty Đường sắt Việt Nam',
      khuVuc: 'Khu vực A (Tầng 1 - Kho Trụ sở)',
      kho: 'Kho Lưu trữ Trung tâm Số 1'
    },
    registeredBy: 'user_vt_1',
    registeredByName: 'Lê Hoàng Yến',
    registeredAt: '2026-05-02T09:15:00Z'
  }
];

export const INITIAL_NOTIFICATIONS: SystemNotification[] = [
  {
    id: 'notif-01',
    title: 'Hồ sơ mới cần thẩm tra',
    message: 'Chuyên viên Nguyễn Văn Cường đã trình thẩm tra văn bản 89/HĐ-XD2026.',
    timestamp: '10 phút trước',
    type: 'info',
    relatedFlow: 'LUONG_1',
    relatedDocId: 'hstl-ex-003',
    isRead: false
  },
  {
    id: 'notif-02',
    title: 'Đã hoàn tất thẩm tra',
    message: 'Trưởng phòng Trần Thị Thu Hương đã thẩm tra ĐẠT văn bản 24/BC-KTHUAT. Chuyển Văn thư định vị kho.',
    timestamp: '1 giờ trước',
    type: 'success',
    relatedFlow: 'LUONG_1',
    relatedDocId: 'hstl-ex-002',
    isRead: false
  },
  {
    id: 'notif-03',
    title: 'Báo cáo kết quả dự thảo',
    message: 'Hồ sơ HSCV-2026-042 đã nộp báo cáo kết quả giải quyết kèm minh chứng.',
    timestamp: '2 giờ trước',
    type: 'info',
    relatedFlow: 'LUONG_2',
    relatedDocId: 'draft-001',
    isRead: false
  },
  {
    id: 'notif-04',
    title: 'Văn bản đến mới đã OCR',
    message: 'Đã tiếp nhận và trích xuất OCR văn bản đến số 1043 từ Bộ GTVT.',
    timestamp: 'Hôm qua',
    type: 'success',
    relatedFlow: 'LUONG_3',
    relatedDocId: 'in-002',
    isRead: true
  }
];

// =============================================================
// NGUYÊN TẮC LƯU TRỮ KHO VẬT LÝ 6 CẤP:
// Đơn vị → Khu vực → Kệ → Ngăn → Hộp → Hồ sơ
// =============================================================
export interface StorageDossierItem {
  id: string;
  name: string; // e.g. "Hồ sơ số 01 (HS-01)"
  title: string;
}

export interface StorageBoxItem {
  id: string;
  name: string; // e.g. "Hộp H-01"
  dossiers: StorageDossierItem[]; // 6. Hồ sơ
}

export interface StorageCompartmentItem {
  id: string;
  name: string; // e.g. "Ngăn N-01 (Văn bản Đến 2024)"
  boxes: StorageBoxItem[]; // 5. Hộp
}

export interface StorageShelfItem {
  id: string;
  name: string; // e.g. "Kệ K-01 (Văn bản Đến)"
  compartments: StorageCompartmentItem[]; // 4. Ngăn
}

export interface StorageDepartmentItem {
  id: string;
  name: string; // 1. Phòng / Ban / Đơn vị con (e.g. "Văn phòng Tổng công ty", "Ban Kế hoạch - Kinh doanh")
  code: string; // e.g. "VP", "BKH"
  type?: 'PHONG_BAN' | 'DON_VI_CON';
  shelves: StorageShelfItem[]; // 2. Kệ
}

export interface StorageAreaItem {
  id: string;
  name: string; // e.g. "Khu vực A (Tầng 1 - Kho Trụ sở 118 Lê Duẩn)"
  code: string; // e.g. "KVA"
  address?: string;
  shelves: StorageShelfItem[]; // 3. Kệ
}

export interface StorageUnitItem {
  id: string;
  name: string; // e.g. "Tổng công ty Đường sắt Việt Nam"
  code: string; // e.g. "VNR"
  areas: StorageAreaItem[]; // 2. Khu vực
}

// -------------------------------------------------------------
// CHUẨN ĐỊNH VỊ KHO LƯU TRỮ 5 CẤP: 
// 1. Phòng / Ban / Đơn vị con -> 2. Kệ -> 3. Ngăn -> 4. Hộp / Cặp -> 5. Hồ sơ
// -------------------------------------------------------------
export const STORAGE_HIERARCHY_DEPARTMENTS: StorageDepartmentItem[] = [
  {
    id: 'PB_VP',
    name: 'Văn phòng Tổng công ty (Phòng Hành chính - Lưu trữ)',
    code: 'VP-HCLT',
    type: 'PHONG_BAN',
    shelves: [
      {
        id: 'K-01',
        name: 'Kệ K-01 (Văn bản Đến & Chỉ đạo)',
        compartments: [
          {
            id: 'N-01',
            name: 'Ngăn N-01 (Văn bản Đến 2024)',
            boxes: [
              {
                id: 'H-01',
                name: 'Hộp / Cặp H-01',
                dossiers: [
                  { id: 'HS-01', name: 'Hồ sơ số 01 (HS-01)', title: 'Tiếp nhận Văn bản Đến Quý 1/2024' },
                  { id: 'HS-02', name: 'Hồ sơ số 02 (HS-02)', title: 'Văn bản Đến Ban Kỹ thuật 2024' },
                  { id: 'HS-03', name: 'Hồ sơ số 03 (HS-03)', title: 'Văn bản Đến Ban Vận tải 2024' }
                ]
              },
              {
                id: 'H-02',
                name: 'Hộp / Cặp H-02',
                dossiers: [
                  { id: 'HS-01', name: 'Hồ sơ số 01 (HS-01)', title: 'Văn bản Đến Bộ GTVT và Cục ĐSVN 2024' }
                ]
              },
              {
                id: 'H-03',
                name: 'Hộp / Cặp H-03',
                dossiers: [
                  { id: 'HS-01', name: 'Hồ sơ số 01 (HS-01)', title: 'Văn bản Đến Dự án Tuyến Bắc - Nam' }
                ]
              }
            ]
          },
          {
            id: 'N-02',
            name: 'Ngăn N-02 (Văn bản Đến 2025)',
            boxes: [
              {
                id: 'H-04',
                name: 'Hộp / Cặp H-04',
                dossiers: [
                  { id: 'HS-01', name: 'Hồ sơ số 01 (HS-01)', title: 'Văn bản Đến 6 tháng đầu năm 2025' },
                  { id: 'HS-02', name: 'Hồ sơ số 02 (HS-02)', title: 'Văn bản Đến 6 tháng cuối năm 2025' }
                ]
              },
              {
                id: 'H-05',
                name: 'Hộp / Cặp H-05',
                dossiers: [
                  { id: 'HS-01', name: 'Hồ sơ số 01 (HS-01)', title: 'Báo cáo Thẩm tra Kỹ thuật & An toàn 2025' }
                ]
              }
            ]
          },
          {
            id: 'N-03',
            name: 'Ngăn N-03 (Văn bản Đến Quý 1/2026)',
            boxes: [
              {
                id: 'H-06',
                name: 'Hộp / Cặp H-06',
                dossiers: [
                  { id: 'HS-01', name: 'Hồ sơ số 01 (HS-01)', title: 'Chỉ đạo Điều hành Chạy tàu Tết 2026' }
                ]
              },
              {
                id: 'H-07',
                name: 'Hộp / Cặp H-07',
                dossiers: [
                  { id: 'HS-01', name: 'Hồ sơ số 01 (HS-01)', title: 'Chỉ đạo Kiểm tra An toàn Ga Giáp Bát 2026' }
                ]
              }
            ]
          },
          {
            id: 'N-04',
            name: 'Ngăn N-04 (Văn bản Đến Quý 2/2026)',
            boxes: [
              {
                id: 'H-08',
                name: 'Hộp / Cặp H-08',
                dossiers: [
                  { id: 'HS-01', name: 'Hồ sơ số 01 (HS-01)', title: 'Kế hoạch Phục vụ Hành khách Nghỉ Lễ 30/4 - 1/5' }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'K-02',
        name: 'Kệ K-02 (Văn bản Đi & Quyết định NĐ30)',
        compartments: [
          {
            id: 'N-01',
            name: 'Ngăn N-01 (Quyết định Vĩnh viễn)',
            boxes: [
              {
                id: 'H-01',
                name: 'Hộp / Cặp H-01',
                dossiers: [
                  { id: 'HS-01', name: 'Hồ sơ số 01 (HS-01)', title: 'QĐ Thành lập & Bổ nhiệm cán bộ Tổng công ty' }
                ]
              },
              {
                id: 'H-02',
                name: 'Hộp / Cặp H-02',
                dossiers: [
                  { id: 'HS-01', name: 'Hồ sơ số 01 (HS-01)', title: 'QĐ 158/QĐ-ĐS Đại tu Đường sắt Bắc - Nam 2026' },
                  { id: 'HS-02', name: 'Hồ sơ số 02 (HS-02)', title: 'QĐ Phê duyệt Dự toán Kỹ thuật Hạ tầng 2026' }
                ]
              }
            ]
          },
          {
            id: 'N-02',
            name: 'Ngăn N-02 (Tờ trình & Biên bản)',
            boxes: [
              {
                id: 'H-04',
                name: 'Hộp / Cặp H-04',
                dossiers: [
                  { id: 'HS-01', name: 'Hồ sơ số 01 (HS-01)', title: 'Tờ trình Hội đồng Thành viên 2026' }
                ]
              }
            ]
          },
          {
            id: 'N-03',
            name: 'Ngăn N-03 (Công văn 5-10 năm)',
            boxes: [
              {
                id: 'H-07',
                name: 'Hộp / Cặp H-07',
                dossiers: [
                  { id: 'HS-01', name: 'Hồ sơ số 01 (HS-01)', title: 'Công văn Trao đổi Nghiệp vụ với Cục ĐSVN' }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'PB_BKH',
    name: 'Ban Kế hoạch - Kinh doanh',
    code: 'BKH-KD',
    type: 'PHONG_BAN',
    shelves: [
      {
        id: 'K-01',
        name: 'Kệ K-01 (Kế hoạch SXKD & Vận tải)',
        compartments: [
          {
            id: 'N-01',
            name: 'Ngăn N-01 (Kế hoạch Doanh thu Vận tải)',
            boxes: [
              {
                id: 'H-01',
                name: 'Hộp / Cặp H-01',
                dossiers: [
                  { id: 'HS-01', name: 'Hồ sơ số 01 (HS-01)', title: 'Chỉ tiêu Doanh thu Tuyến Thống Nhất 2026' }
                ]
              },
              {
                id: 'H-02',
                name: 'Hộp / Cặp H-02',
                dossiers: [
                  { id: 'HS-01', name: 'Hồ sơ số 01 (HS-01)', title: 'Phương án Giá vé và Khuyến mãi Hè 2026' }
                ]
              }
            ]
          },
          {
            id: 'N-02',
            name: 'Ngăn N-02 (Hợp đồng Hợp tác Logistics)',
            boxes: [
              {
                id: 'H-03',
                name: 'Hộp / Cặp H-03',
                dossiers: [
                  { id: 'HS-01', name: 'Hồ sơ số 01 (HS-01)', title: 'Hợp đồng Vận chuyển Container Quốc tế Ga Sóng Thần' }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'PB_BKT',
    name: 'Ban Kỹ thuật - Đầu tư',
    code: 'BKT-DT',
    type: 'PHONG_BAN',
    shelves: [
      {
        id: 'K-03',
        name: 'Kệ K-03 (Hồ sơ Kỹ thuật & Dự án Hoàn công)',
        compartments: [
          {
            id: 'N-01',
            name: 'Ngăn N-01 (Đường sắt Bắc - Nam)',
            boxes: [
              {
                id: 'H-15',
                name: 'Hộp / Cặp H-15',
                dossiers: [
                  { id: 'HS-01', name: 'Hồ sơ số 01 (HS-01)', title: 'Bản vẽ Hoàn công Đoạn Hà Nội - Vinh' },
                  { id: 'HS-02', name: 'Hồ sơ số 02 (HS-02)', title: 'Bản vẽ Trắc dọc & Bình đồ Tuyến Bắc Nam' }
                ]
              },
              {
                id: 'H-16',
                name: 'Hộp / Cặp H-16',
                dossiers: [
                  { id: 'HS-01', name: 'Hồ sơ số 01 (HS-01)', title: 'Chứng chỉ Thép Ray Hàn & Tà vẹt Bê tông' }
                ]
              }
            ]
          },
          {
            id: 'N-02',
            name: 'Ngăn N-02 (Đại tu cầu đường)',
            boxes: [
              {
                id: 'H-18',
                name: 'Hộp / Cặp H-18',
                dossiers: [
                  { id: 'HS-01', name: 'Hồ sơ số 01 (HS-01)', title: 'Hồ sơ Kiểm định Cầu Đường sắt Sông Đáy' },
                  { id: 'HS-02', name: 'Hồ sơ số 02 (HS-02)', title: 'Nghiệm thu Gia cố Taluy Chống sạt lở Miền Trung' }
                ]
              },
              {
                id: 'H-19',
                name: 'Hộp / Cặp H-19',
                dossiers: [
                  { id: 'HS-01', name: 'Hồ sơ số 01 (HS-01)', title: 'Kiểm toán Quyết toán Dự án Đại tu 2025' }
                ]
              }
            ]
          },
          {
            id: 'N-03',
            name: 'Ngăn N-03 (Đầu máy toa xe)',
            boxes: [
              {
                id: 'H-21',
                name: 'Hộp / Cặp H-21',
                dossiers: [
                  { id: 'HS-01', name: 'Hồ sơ số 01 (HS-01)', title: 'Bảo dưỡng Định kỳ Đầu máy Đổi mới D19E' }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'K-04',
        name: 'Kệ K-04 (Hồ sơ Công việc Luồng 2)',
        compartments: [
          {
            id: 'N-01',
            name: 'Ngăn N-01 (HSCV Ban Kỹ thuật)',
            boxes: [
              {
                id: 'H-01',
                name: 'Hộp / Cặp H-01',
                dossiers: [
                  { id: 'HS-01', name: 'Hồ sơ số 01 (HS-01)', title: 'Nâng cấp Hệ thống Tín hiệu Điện khí tập trung' }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'PB_BQLHT',
    name: 'Ban Quản lý Kết cấu Hạ tầng Đường sắt',
    code: 'BQL-HT',
    type: 'PHONG_BAN',
    shelves: [
      {
        id: 'K-01',
        name: 'Kệ K-01 (Hạ tầng Cầu - Hầm - Đường ngang)',
        compartments: [
          {
            id: 'N-01',
            name: 'Ngăn N-01 (Đường ngang cảnh báo tự động)',
            boxes: [
              {
                id: 'H-01',
                name: 'Hộp / Cặp H-01',
                dossiers: [
                  { id: 'HS-01', name: 'Hồ sơ số 01 (HS-01)', title: 'Hồ sơ Lắp đặt Cần chắn Tự động Khu vực Hà Nội' }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'PB_BTCKT',
    name: 'Ban Tài chính - Kế toán',
    code: 'BTC-KT',
    type: 'PHONG_BAN',
    shelves: [
      {
        id: 'K-01',
        name: 'Kệ K-01 (Chứng từ Kế toán & Quyết toán)',
        compartments: [
          {
            id: 'N-01',
            name: 'Ngăn N-01 (Chứng từ Ngân sách)',
            boxes: [
              {
                id: 'H-01',
                name: 'Hộp / Cặp H-01',
                dossiers: [
                  { id: 'HS-01', name: 'Hồ sơ số 01 (HS-01)', title: 'Quyết toán Bảo trì Kết cấu Hạ tầng 2025' }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'DVC_SGR',
    name: 'Công ty CP Vận tải Đường sắt Sài Gòn (Đơn vị con)',
    code: 'VTDS-SG',
    type: 'DON_VI_CON',
    shelves: [
      {
        id: 'K-01',
        name: 'Kệ K-01 (Hạ tầng & Toa xe Phía Nam)',
        compartments: [
          {
            id: 'N-01',
            name: 'Ngăn N-01 (Hồ sơ Toa xe Sài Gòn)',
            boxes: [
              {
                id: 'H-01',
                name: 'Hộp / Cặp H-01',
                dossiers: [
                  { id: 'HS-01', name: 'Hồ sơ số 01 (HS-01)', title: 'Bảo dưỡng Toa xe Tuyến Sài Gòn - Nha Trang' }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'DVC_HNR',
    name: 'Công ty CP Vận tải Đường sắt Hà Nội (Đơn vị con)',
    code: 'VTDS-HN',
    type: 'DON_VI_CON',
    shelves: [
      {
        id: 'K-01',
        name: 'Kệ K-01 (Hồ sơ Điều hành Tuyến Bắc & Liên vận)',
        compartments: [
          {
            id: 'N-01',
            name: 'Ngăn N-01 (Tàu Liên vận Quốc tế)',
            boxes: [
              {
                id: 'H-01',
                name: 'Hộp / Cặp H-01',
                dossiers: [
                  { id: 'HS-01', name: 'Hồ sơ số 01 (HS-01)', title: 'Điều hành Tàu Hàng Liên vận Yên Viên - Đồng Đăng' }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'DVC_BQLDA',
    name: 'Ban Quản lý Dự án Đường sắt (Đơn vị con)',
    code: 'BQLDA-DS',
    type: 'DON_VI_CON',
    shelves: [
      {
        id: 'K-01',
        name: 'Kệ K-01 (Hồ sơ Dự án Nâng cấp Trọng điểm)',
        compartments: [
          {
            id: 'N-01',
            name: 'Ngăn N-01 (Gói thầu Cải tạo Đường sắt)',
            boxes: [
              {
                id: 'H-01',
                name: 'Hộp / Cặp H-01',
                dossiers: [
                  { id: 'HS-01', name: 'Hồ sơ số 01 (HS-01)', title: 'Hồ sơ Mời thầu Gói Nâng cấp Cầu Yếu Tuyến Thống Nhất' }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
];

export const STORAGE_HIERARCHY_UNITS: StorageUnitItem[] = [
  {
    id: 'DV_VNR',
    name: 'Tổng công ty Đường sắt Việt Nam',
    code: 'VNR',
    areas: [
      {
        id: 'KV_A',
        name: 'Khu vực A (Tầng 1 - Kho Lưu trữ Trụ sở 118 Lê Duẩn)',
        code: 'KVA',
        address: '118 Lê Duẩn, Hoàn Kiếm, Hà Nội',
        shelves: [
          {
            id: 'K-01',
            name: 'Kệ K-01 (Văn bản Đến)',
            compartments: [
              {
                id: 'N-01',
                name: 'Ngăn N-01 (Văn bản Đến 2024)',
                boxes: [
                  {
                    id: 'H-01',
                    name: 'Hộp H-01',
                    dossiers: [
                      { id: 'HS-01', name: 'Hồ sơ số 01 (HS-01)', title: 'Tiếp nhận Văn bản Đến Quý 1/2024' },
                      { id: 'HS-02', name: 'Hồ sơ số 02 (HS-02)', title: 'Văn bản Đến Ban Kỹ thuật 2024' },
                      { id: 'HS-03', name: 'Hồ sơ số 03 (HS-03)', title: 'Văn bản Đến Ban Vận tải 2024' }
                    ]
                  },
                  {
                    id: 'H-02',
                    name: 'Hộp H-02',
                    dossiers: [
                      { id: 'HS-01', name: 'Hồ sơ số 01 (HS-01)', title: 'Văn bản Đến Bộ GTVT và Cục ĐSVN 2024' }
                    ]
                  },
                  {
                    id: 'H-03',
                    name: 'Hộp H-03',
                    dossiers: [
                      { id: 'HS-01', name: 'Hồ sơ số 01 (HS-01)', title: 'Văn bản Đến Dự án Tuyến Bắc - Nam' }
                    ]
                  }
                ]
              },
              {
                id: 'N-02',
                name: 'Ngăn N-02 (Văn bản Đến 2025)',
                boxes: [
                  {
                    id: 'H-04',
                    name: 'Hộp H-04',
                    dossiers: [
                      { id: 'HS-01', name: 'Hồ sơ số 01 (HS-01)', title: 'Văn bản Đến 6 tháng đầu năm 2025' },
                      { id: 'HS-02', name: 'Hồ sơ số 02 (HS-02)', title: 'Văn bản Đến 6 tháng cuối năm 2025' }
                    ]
                  },
                  {
                    id: 'H-05',
                    name: 'Hộp H-05',
                    dossiers: [
                      { id: 'HS-01', name: 'Hồ sơ số 01 (HS-01)', title: 'Báo cáo Thẩm tra Kỹ thuật & An toàn 2025' }
                    ]
                  }
                ]
              },
              {
                id: 'N-03',
                name: 'Ngăn N-03 (Văn bản Đến Quý 1/2026)',
                boxes: [
                  {
                    id: 'H-06',
                    name: 'Hộp H-06',
                    dossiers: [
                      { id: 'HS-01', name: 'Hồ sơ số 01 (HS-01)', title: 'Chỉ đạo Điều hành Chạy tàu Tết 2026' }
                    ]
                  },
                  {
                    id: 'H-07',
                    name: 'Hộp H-07',
                    dossiers: [
                      { id: 'HS-01', name: 'Hồ sơ số 01 (HS-01)', title: 'Chỉ đạo Kiểm tra An toàn Ga Giáp Bát 2026' }
                    ]
                  }
                ]
              },
              {
                id: 'N-04',
                name: 'Ngăn N-04 (Văn bản Đến Quý 2/2026)',
                boxes: [
                  {
                    id: 'H-05',
                    name: 'Hộp H-05',
                    dossiers: [
                      { id: 'HS-01', name: 'Hồ sơ số 01 (HS-01)', title: 'Văn bản Đến Quý 2/2026 Tập 1' }
                    ]
                  },
                  {
                    id: 'H-06',
                    name: 'Hộp H-06',
                    dossiers: [
                      { id: 'HS-01', name: 'Hồ sơ số 01 (HS-01)', title: 'Văn bản Bộ GTVT số 512/BGTVT-VT' }
                    ]
                  },
                  {
                    id: 'H-07',
                    name: 'Hộp H-07',
                    dossiers: [
                      { id: 'HS-01', name: 'Hồ sơ số 01 (HS-01)', title: 'Tờ trình & Đề xuất phương án vận tải' }
                    ]
                  }
                ]
              },
              {
                id: 'N-05',
                name: 'Ngăn N-05 (Dự phòng Mở rộng)',
                boxes: [
                  {
                    id: 'H-08',
                    name: 'Hộp H-08',
                    dossiers: [
                      { id: 'HS-01', name: 'Hồ sơ số 01 (HS-01)', title: 'Hồ sơ lưu trữ tạm thời' }
                    ]
                  }
                ]
              }
            ]
          },
          {
            id: 'K-02',
            name: 'Kệ K-02 (Văn bản Đi NĐ30)',
            compartments: [
              {
                id: 'N-01',
                name: 'Ngăn N-01 (Quyết định Vĩnh viễn)',
                boxes: [
                  {
                    id: 'H-01',
                    name: 'Hộp H-01',
                    dossiers: [
                      { id: 'HS-01', name: 'Hồ sơ số 01 (HS-01)', title: 'QĐ Thành lập & Bổ nhiệm cán bộ Tổng công ty' }
                    ]
                  },
                  {
                    id: 'H-02',
                    name: 'Hộp H-02',
                    dossiers: [
                      { id: 'HS-01', name: 'Hồ sơ số 01 (HS-01)', title: 'QĐ 158/QĐ-ĐS Đại tu Đường sắt Bắc - Nam 2026' },
                      { id: 'HS-02', name: 'Hồ sơ số 02 (HS-02)', title: 'QĐ Phê duyệt Dự toán Kỹ thuật Hạ tầng 2026' }
                    ]
                  },
                  {
                    id: 'H-03',
                    name: 'Hộp H-03',
                    dossiers: [
                      { id: 'HS-01', name: 'Hồ sơ số 01 (HS-01)', title: 'QĐ Ban hành Định mức Kinh tế - Kỹ thuật' }
                    ]
                  }
                ]
              },
              {
                id: 'N-02',
                name: 'Ngăn N-02 (Tờ trình & Biên bản)',
                boxes: [
                  {
                    id: 'H-04',
                    name: 'Hộp H-04',
                    dossiers: [
                      { id: 'HS-01', name: 'Hồ sơ số 01 (HS-01)', title: 'Tờ trình Hội đồng Thành viên 2026' }
                    ]
                  },
                  {
                    id: 'H-05',
                    name: 'Hộp H-05',
                    dossiers: [
                      { id: 'HS-01', name: 'Hồ sơ số 01 (HS-01)', title: 'Biên bản Họp Giao ban Ban Điều hành' }
                    ]
                  }
                ]
              },
              {
                id: 'N-03',
                name: 'Ngăn N-03 (Công văn 5-10 năm)',
                boxes: [
                  {
                    id: 'H-07',
                    name: 'Hộp H-07',
                    dossiers: [
                      { id: 'HS-01', name: 'Hồ sơ số 01 (HS-01)', title: 'Công văn Trao đổi Nghiệp vụ với Cục ĐSVN' }
                    ]
                  },
                  {
                    id: 'H-09',
                    name: 'Hộp H-09',
                    dossiers: [
                      { id: 'HS-01', name: 'Hồ sơ số 01 (HS-01)', title: 'Công văn 199/CV-TCHC Tập huấn Văn hóa An toàn' }
                    ]
                  }
                ]
              },
              {
                id: 'N-04',
                name: 'Ngăn N-04 (Thông báo Kết luận)',
                boxes: [
                  {
                    id: 'H-10',
                    name: 'Hộp H-10',
                    dossiers: [
                      { id: 'HS-01', name: 'Hồ sơ số 01 (HS-01)', title: 'Thông báo Kết luận của Tổng Giám đốc' }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'KV_B',
        name: 'Khu vực B (Tầng 2 - Kho Lưu trữ Kỹ thuật & Dự án)',
        code: 'KVB',
        address: '118 Lê Duẩn, Hoàn Kiếm, Hà Nội (Tầng 2)',
        shelves: [
          {
            id: 'K-03',
            name: 'Kệ K-03 (Hồ sơ Kỹ thuật & Dự án Hoàn công)',
            compartments: [
              {
                id: 'N-01',
                name: 'Ngăn N-01 (Đường sắt Bắc - Nam)',
                boxes: [
                  {
                    id: 'H-15',
                    name: 'Hộp H-15',
                    dossiers: [
                      { id: 'HS-01', name: 'Hồ sơ số 01 (HS-01)', title: 'Bản vẽ Hoàn công Đoạn Hà Nội - Vinh' },
                      { id: 'HS-02', name: 'Hồ sơ số 02 (HS-02)', title: 'Bản vẽ Trắc dọc & Bình đồ Tuyến Bắc Nam' }
                    ]
                  },
                  {
                    id: 'H-16',
                    name: 'Hộp H-16',
                    dossiers: [
                      { id: 'HS-01', name: 'Hồ sơ số 01 (HS-01)', title: 'Chứng chỉ Thép Ray Hàn & Tà vẹt Bê tông' }
                    ]
                  }
                ]
              },
              {
                id: 'N-02',
                name: 'Ngăn N-02 (Đại tu cầu đường)',
                boxes: [
                  {
                    id: 'H-18',
                    name: 'Hộp H-18',
                    dossiers: [
                      { id: 'HS-01', name: 'Hồ sơ số 01 (HS-01)', title: 'Hồ sơ Kiểm định Cầu Đường sắt Sông Đáy' },
                      { id: 'HS-02', name: 'Hồ sơ số 02 (HS-02)', title: 'Nghiệm thu Gia cố Taluy Chống sạt lở Miền Trung' }
                    ]
                  },
                  {
                    id: 'H-19',
                    name: 'Hộp H-19',
                    dossiers: [
                      { id: 'HS-01', name: 'Hồ sơ số 01 (HS-01)', title: 'Kiểm toán Quyết toán Dự án Đại tu 2025' }
                    ]
                  }
                ]
              },
              {
                id: 'N-03',
                name: 'Ngăn N-03 (Đầu máy toa xe)',
                boxes: [
                  {
                    id: 'H-21',
                    name: 'Hộp H-21',
                    dossiers: [
                      { id: 'HS-01', name: 'Hồ sơ số 01 (HS-01)', title: 'Bảo dưỡng Định kỳ Đầu máy Đổi mới D19E' }
                    ]
                  }
                ]
              }
            ]
          },
          {
            id: 'K-04',
            name: 'Kệ K-04 (Hồ sơ Công việc Luồng 2)',
            compartments: [
              {
                id: 'N-01',
                name: 'Ngăn N-01 (HSCV Ban Kỹ thuật)',
                boxes: [
                  {
                    id: 'H-01',
                    name: 'Hộp H-01',
                    dossiers: [
                      { id: 'HS-01', name: 'Hồ sơ số 01 (HS-01)', title: 'Nâng cấp Hệ thống Tín hiệu Điện khí tập trung' }
                    ]
                  },
                  {
                    id: 'H-02',
                    name: 'Hộp H-02',
                    dossiers: [
                      { id: 'HS-01', name: 'Hồ sơ số 01 (HS-01)', title: 'Báo cáo Kiểm tra Hiện trường Ga Giáp Bát sau Bão' }
                    ]
                  }
                ]
              },
              {
                id: 'N-02',
                name: 'Ngăn N-02 (HSCV Ban Vận tải)',
                boxes: [
                  {
                    id: 'H-03',
                    name: 'Hộp H-03',
                    dossiers: [
                      { id: 'HS-01', name: 'Hồ sơ số 01 (HS-01)', title: 'Biểu đồ Chạy tàu Mùa hè 2026' }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'DV_HNR',
    name: 'Chi nhánh Khai thác Đường sắt Hà Nội',
    code: 'HNR',
    areas: [
      {
        id: 'KV_HN',
        name: 'Khu vực Ga Hà Nội (Kho Hồ sơ Khai thác Ga)',
        code: 'KVHN',
        address: '120 Lê Duẩn, Văn Miếu, Đống Đa, Hà Nội',
        shelves: [
          {
            id: 'K-01',
            name: 'Kệ K-01 (Hồ sơ Điều hành Chạy tàu)',
            compartments: [
              {
                id: 'N-01',
                name: 'Ngăn N-01 (Nhật ký chạy tàu)',
                boxes: [
                  {
                    id: 'H-01',
                    name: 'Hộp H-01',
                    dossiers: [
                      { id: 'HS-01', name: 'Hồ sơ số 01 (HS-01)', title: 'Nhật ký Điều hành Ga Hà Nội 2026' }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'DV_SGR',
    name: 'Công ty CP Vận tải Đường sắt Sài Gòn',
    code: 'SGR',
    areas: [
      {
        id: 'KV_SG',
        name: 'Khu vực Nam Bộ (Kho 01 Nguyễn Thông, Q.3, TP.HCM)',
        code: 'KVSG',
        address: '01 Nguyễn Thông, Phường 9, Quận 3, TP. Hồ Chí Minh',
        shelves: [
          {
            id: 'K-01',
            name: 'Kệ K-01 (Hạ tầng & Đầu máy Toa xe Phía Nam)',
            compartments: [
              {
                id: 'N-01',
                name: 'Ngăn N-01 (Hồ sơ Toa xe Sài Gòn)',
                boxes: [
                  {
                    id: 'H-01',
                    name: 'Hộp H-01',
                    dossiers: [
                      { id: 'HS-01', name: 'Hồ sơ số 01 (HS-01)', title: 'Bảo dưỡng Toa xe Tuyến Sài Gòn - Nha Trang' }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
];

// Cấu trúc tương thích ngược cho các thành phần cũ
export const WAREHOUSE_STRUCTURE = [
  {
    id: 'KHO_1',
    name: 'Kho Lưu trữ Trung tâm Số 1 (Trụ sở Tổng công ty)',
    address: '118 Lê Duẩn, Hoàn Kiếm, Hà Nội',
    totalShelves: 6,
    capacityBoxes: 360,
    currentOccupancy: 278,
    shelves: [
      {
        id: 'K-01',
        name: 'Kệ K-01 (Văn bản Đến)',
        compartments: [
          { id: 'N-01', name: 'Ngăn 1 (VBD 2024)', boxes: ['H-01', 'H-02', 'H-03'] },
          { id: 'N-02', name: 'Ngăn 2 (VBD 2025)', boxes: ['H-04', 'H-05'] },
          { id: 'N-03', name: 'Ngăn 3 (VBD Quý 1/2026)', boxes: ['H-06', 'H-07'] },
          { id: 'N-04', name: 'Ngăn 4 (VBD Quý 2/2026)', boxes: ['H-05', 'H-06', 'H-07'] },
          { id: 'N-05', name: 'Ngăn 5 (Dự phòng)', boxes: ['H-08', 'H-09'] },
        ]
      },
      {
        id: 'K-02',
        name: 'Kệ K-02 (Văn bản Đi)',
        compartments: [
          { id: 'N-01', name: 'Ngăn 1 (Quyết định Vĩnh viễn)', boxes: ['H-01', 'H-02', 'H-03'] },
          { id: 'N-02', name: 'Ngăn 2 (Tờ trình & Biên bản)', boxes: ['H-04', 'H-05', 'H-06'] },
          { id: 'N-03', name: 'Ngăn 3 (Công văn 5-10 năm)', boxes: ['H-07', 'H-08', 'H-09'] },
          { id: 'N-04', name: 'Ngăn 4 (Thông báo)', boxes: ['H-10', 'H-11'] },
        ]
      },
      {
        id: 'K-03',
        name: 'Kệ K-03 (Hồ sơ Kỹ thuật & Dự án Hoàn công)',
        compartments: [
          { id: 'N-01', name: 'Ngăn 1 (Đường sắt Bắc - Nam)', boxes: ['H-15', 'H-16', 'H-17'] },
          { id: 'N-02', name: 'Ngăn 2 (Đại tu cầu đường)', boxes: ['H-18', 'H-19', 'H-20'] },
          { id: 'N-03', name: 'Ngăn 3 (Đầu máy toa xe)', boxes: ['H-21', 'H-22'] },
        ]
      },
      {
        id: 'K-04',
        name: 'Kệ K-04 (Hồ sơ Công việc Luồng 2)',
        compartments: [
          { id: 'N-01', name: 'Ngăn 1 (HSCV Ban Kỹ thuật)', boxes: ['H-01', 'H-02'] },
          { id: 'N-02', name: 'Ngăn 2 (HSCV Ban Vận tải)', boxes: ['H-03', 'H-04'] },
          { id: 'N-03', name: 'Ngăn 3 (HSCV Ban Tài chính)', boxes: ['H-05', 'H-06'] },
        ]
      }
    ]
  },
  {
    id: 'KHO_2',
    name: 'Kho Lưu trữ Chuyên ngành Phía Nam (Khu vực Sài Gòn)',
    address: '01 Nguyễn Thông, Quận 3, TP. Hồ Chí Minh',
    totalShelves: 4,
    capacityBoxes: 240,
    currentOccupancy: 165,
    shelves: [
      {
        id: 'K-01',
        name: 'Kệ K-01 (Khu vực Nam Bộ)',
        compartments: [
          { id: 'N-01', name: 'Ngăn 1 (Hồ sơ Hạ tầng Sài Gòn - Tháp Chàm)', boxes: ['H-01', 'H-02'] },
          { id: 'N-02', name: 'Ngăn 2 (Hồ sơ Xí nghiệp Toa xe Sài Gòn)', boxes: ['H-03', 'H-04'] }
        ]
      }
    ]
  }
];

export const INITIAL_ASSIGNED_TASKS: AssignedTask[] = [
  {
    id: 'task-001',
    code: 'GV-2026-001',
    title: 'Kiểm tra và báo cáo hiện trạng kỹ thuật hệ thống tín hiệu đường sắt khu vực ga Giáp Bát',
    description: 'Chỉ đạo chuyên viên phối hợp với Ban An toàn kiểm tra đột xuất hiện trạng các hộp cáp tín hiệu, ghi tự động và tủ điều khiển chạy tàu tại ga Giáp Bát sau đợt mưa bão.',
    priority: 'KHAN',
    field: 'Kỹ thuật - Hạ tầng',
    deadline: '2026-09-05',
    assignedById: 'user_gd_1',
    assignedByName: 'Đặng Sỹ Mạnh',
    assignedByRole: 'Tổng Giám Đốc',
    assignedByDept: 'Ban Tổng Giám Đốc',
    assignedAt: '2026-08-26T08:30:00Z',
    leaderDirective: 'Yêu cầu kiểm tra kỹ các mối nối cáp ngầm chống ngập và kiểm tra hệ thống nguồn dự phòng UPS. Hoàn thành báo cáo trước ngày 05/09/2026.',
    attachedFileName: 'ChiDao_KiemTra_TinHieu_MuaBao.pdf',
    attachedFileSize: '1.8 MB',
    primaryAssigneeId: 'user_cv_1',
    primaryAssigneeName: 'Nguyễn Văn Cường',
    primaryAssigneeDept: 'Ban Kỹ thuật - Hạ tầng Cơ sở',
    primaryAssigneeRole: 'Chuyên viên Kỹ thuật & Dự án',
    acceptedAt: '2026-08-26T09:15:00Z',
    primaryAssigneeNote: 'Đã lập kế hoạch kiểm tra 2 đợt vào ngày 27 và 28/08, đồng thời mời chuyên viên Ban An toàn cùng tham gia đo kiểm hiện trường.',
    collaborators: [
      {
        id: 'collab-1',
        userId: 'user_at_1',
        userName: 'Đặng Quốc Huy',
        department: 'Ban An toàn Giao thông Đường sắt',
        roleTitle: 'Chuyên viên An toàn',
        assignedAt: '2026-08-26T09:20:00Z',
        notes: 'Phối hợp đo kiểm thông số an toàn tiếp địa và mạch đóng mở ghi điện ga Giáp Bát'
      },
      {
        id: 'collab-2',
        userId: 'user_cv_2',
        userName: 'Hoàng Văn Tiến',
        department: 'Ban Kỹ thuật - Hạ tầng Cơ sở',
        roleTitle: 'Kỹ sư Thiết bị',
        assignedAt: '2026-08-26T09:20:00Z',
        notes: 'Đo kiểm thử nghiệm tủ ắc quy dự phòng trạm nguồn tín hiệu'
      }
    ],
    status: 'COMPLETED',
    completionReport: {
      reportedAt: '2026-08-29T16:45:00Z',
      reportedById: 'user_cv_1',
      reportedByName: 'Nguyễn Văn Cường',
      comment: 'Báo cáo Tổng Giám Đốc: Nhóm công tác đã phối hợp cùng Ban An toàn hoàn tất kiểm tra hiện trường ngày 28/08/2026. Toàn bộ 12 cụm ghi tự động và tủ tín hiệu hoạt động đạt chuẩn an toàn, đã thay thế 2 bình ắc quy dự phòng bị sụt áp. Biên bản kỹ thuật chi tiết đính kèm.',
      attachedFileName: 'BaoCao_KiemTra_TinHieu_GaGiapBat_So45.pdf',
      attachedFileSize: '3.4 MB',
      attachedFileUrl: '#'
    },
    evaluation: {
      evaluatedAt: '2026-08-30T10:00:00Z',
      leaderId: 'user_gd_1',
      leaderName: 'Đặng Sỹ Mạnh',
      feedback: 'Đánh giá cao tinh thần trách nhiệm và tốc độ phối hợp xử lý khẩn trương của nhóm công tác. Đồng ý kết luận kỹ thuật.',
      rating: 'XUAT_SAC'
    }
  },
  {
    id: 'task-002',
    code: 'GV-2026-002',
    title: 'Xây dựng phương án điều hành chạy tàu tăng cường dịp nghỉ lễ 2/9 tuyến Bắc - Nam',
    description: 'Chỉ đạo Ban Kỹ thuật phối hợp Ban Vận tải và Trung tâm Điều hành rà soát lượng đầu máy, toa xe khả dụng để lập biểu đồ chạy thêm 10 đôi tàu khách.',
    priority: 'HOA_TOC',
    field: 'Vận tải - Điều hành',
    deadline: '2026-09-08',
    assignedById: 'user_tp_1',
    assignedByName: 'Trần Thị Thu Hương',
    assignedByRole: 'Trưởng phòng Quản lý Hồ sơ & Thẩm định',
    assignedByDept: 'Ban Kỹ thuật - Hạ tầng Cơ sở',
    assignedAt: '2026-09-01T14:00:00Z',
    leaderDirective: 'Ưu tiên phương án giãn cách hành trình và bố trí đầu máy dự phòng tại các ga lớn (Hà Nội, Vinh, Đà Nẵng, Nha Trang, Sài Gòn).',
    attachedFileName: 'CongVan_GiaoNhiemVu_VanTai_2-9.pdf',
    attachedFileSize: '1.2 MB',
    primaryAssigneeId: 'user_cv_1',
    primaryAssigneeName: 'Nguyễn Văn Cường',
    primaryAssigneeDept: 'Ban Kỹ thuật - Hạ tầng Cơ sở',
    primaryAssigneeRole: 'Chuyên viên Kỹ thuật & Dự án',
    acceptedAt: '2026-09-01T14:40:00Z',
    primaryAssigneeNote: 'Đã nhận việc, đang phối hợp Ban Vận tải để chốt số lượng ram xe khách đạt chuẩn trước 04/09.',
    collaborators: [
      {
        id: 'collab-3',
        userId: 'user_vt_2',
        userName: 'Vũ Hải Nam',
        department: 'Ban Vận tải',
        roleTitle: 'Chuyên viên Điều độ',
        assignedAt: '2026-09-01T14:45:00Z',
        notes: 'Tính toán biểu đồ giờ chạy tàu và năng lực thông qua các khu gian trọng điểm'
      }
    ],
    status: 'IN_PROGRESS'
  },
  {
    id: 'task-003',
    code: 'GV-2026-003',
    title: 'Rà soát định mức tiêu hao nhiên liệu đoàn tàu khách SE1/SE2 quý III/2026',
    description: 'Đề nghị rà soát số liệu tiêu hao dầu Diezel thực tế của các đầu máy D19E kéo tàu SE1/SE2 so sánh với định mức kỹ thuật ban hành.',
    priority: 'THUONG',
    field: 'Đầu máy - Toa xe',
    deadline: '2026-09-15',
    assignedById: 'user_pgd_1',
    assignedByName: 'Hoàng Gia Khánh',
    assignedByRole: 'Phó Tổng Giám Đốc',
    assignedByDept: 'Ban Tổng Giám Đốc',
    assignedAt: '2026-09-02T10:15:00Z',
    leaderDirective: 'Tổng hợp số liệu từ các Xí nghiệp Đầu máy Hà Nội, Đà Nẵng, Sài Gòn để làm cơ sở điều chỉnh định mức kỹ thuật kinh tế.',
    attachedFileName: 'YeuCau_BaoCao_DinhMucDau_Q3.docx',
    attachedFileSize: '920 KB',
    primaryAssigneeId: 'user_cv_1',
    primaryAssigneeName: 'Nguyễn Văn Cường',
    primaryAssigneeDept: 'Ban Kỹ thuật - Hạ tầng Cơ sở',
    primaryAssigneeRole: 'Chuyên viên Kỹ thuật & Dự án',
    status: 'ASSIGNED'
  }
];

