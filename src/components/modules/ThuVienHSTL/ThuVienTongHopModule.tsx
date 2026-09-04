import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile, RetentionPeriod } from '../../../types';
import { StorageService } from '../../../services/storageService';
import { CreateNewDossierModal } from '../../common/CreateNewDossierModal';
import { HighlightText, getOcrSnippet, matchesQuery } from '../../../utils/highlight';
import { formatShortVND } from '../../common/DynamicMetadataFields';
import { canUserAccessOutgoingDoc } from '../../../utils/outgoingPermission';
import { 
  Archive, 
  Search, 
  Filter, 
  MapPin, 
  FolderPlus, 
  Eye, 
  Sparkles, 
  FileText, 
  Database,
  Building2,
  Lock,
  ShieldAlert,
  AlertTriangle,
  X,
  DollarSign,
  Tag,
  Box,
  FolderArchive,
  Layers,
  Barcode,
  ArrowRight,
  CheckCircle2,
  Download
} from 'lucide-react';
import { STORAGE_HIERARCHY_DEPARTMENTS } from '../../../data/initialData';

interface ThuVienTongHopModuleProps {
  currentUser: UserProfile;
  onOpenViewer: (doc: any, searchKeyword?: string) => void;
}

export const ThuVienTongHopModule: React.FC<ThuVienTongHopModuleProps> = ({
  currentUser,
  onOpenViewer
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'EXISTING' | 'DRAFT_CASES' | 'INCOMING' | 'OUTGOING' | 'WAREHOUSE_MAP'>('ALL');
  const [selectedAgency, setSelectedAgency] = useState<string>('ALL');
  const [selectedDocType, setSelectedDocType] = useState<string>('ALL');
  const [selectedRetention, setSelectedRetention] = useState<string>('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const [restrictedDocAlert, setRestrictedDocAlert] = useState<{ isOpen: boolean; doc?: any }>({ isOpen: false });

  // 5-Level Warehouse Map Navigation State: Phòng/Ban/Đơn vị con -> Kệ -> Ngăn -> Hộp/Cặp -> Hồ sơ
  const [mapDeptId, setMapDeptId] = useState<string>(STORAGE_HIERARCHY_DEPARTMENTS[0].id);
  const [mapShelfId, setMapShelfId] = useState<string>(STORAGE_HIERARCHY_DEPARTMENTS[0].shelves[0].id);
  const [mapCompId, setMapCompId] = useState<string>(STORAGE_HIERARCHY_DEPARTMENTS[0].shelves[0].compartments[0].id);
  const [selectedMapBoxId, setSelectedMapBoxId] = useState<string | null>(STORAGE_HIERARCHY_DEPARTMENTS[0].shelves[0].compartments[0].boxes[0]?.id || null);

  // Listen to Storage updates
  useEffect(() => {
    const handleStorageChange = () => setLastUpdated(Date.now());
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('hstl_state_change', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('hstl_state_change', handleStorageChange);
    };
  }, []);

  const existingDossiers = StorageService.getExistingDocs().filter(d => d.status === 'ARCHIVED');
  const draftCases = StorageService.getDrafts().filter(d => d.currentStep === 'HSTL_ARCHIVED' || d.currentStep === 'REPORT_SUBMITTED');
  const incomingDocs = StorageService.getIncomingDocs();
  const outgoingDocs = StorageService.getOutgoingDocs();

  // Combine unified items for global search with full OCR text
  const allItems = [
    ...existingDossiers.map(d => ({
      id: d.id,
      type: 'LUONG_1',
      typeLabel: 'Hồ sơ tài liệu đã có',
      typeBadgeColor: 'from-blue-600 to-cyan-600',
      code: d.soKyHieu,
      soKyHieuGoc: d.soKyHieu,
      trichYeu: d.trichYeu,
      agency: d.coQuanBanHanh,
      date: d.ngayBanHanh,
      field: d.loaiVanBan,
      docType: d.loaiVanBan || 'Văn bản hành chính',
      retention: d.retentionPeriod,
      location: d.physicalLocation,
      securityLevel: d.securityLevel || 'THƯỜNG',
      secretAccessPermissions: d.secretAccessPermissions,
      customMetadata: d.customMetadata,
      ocrText: (d.ocrText || (d as any).ocrExtracted?.fullOcrText || `${d.soKyHieu} ${d.coQuanBanHanh} ${d.trichYeu} ${d.loaiVanBan}`) + (d.customMetadata ? ' ' + Object.values(d.customMetadata).join(' ') : ''),
      raw: d
    })),
    ...draftCases.map(d => {
      const fullOcr = `${d.code} ${d.trichYeu} ${d.creatorDepartment} ${d.creatorName} ${d.field} ${d.resolutionReport?.reportTitle || ''} ${d.resolutionReport?.reportSummary || ''} ${d.draftFileName || ''}`;
      return {
        id: d.id,
        type: 'LUONG_2' as const,
        typeLabel: 'HSCV & Báo cáo kết quả',
        typeBadgeColor: 'from-purple-600 to-indigo-600',
        code: d.code,
        soKyHieuGoc: d.code,
        trichYeu: d.trichYeu,
        agency: d.creatorDepartment,
        date: d.createdAt.split('T')[0],
        field: d.field,
        docType: d.field || 'HSCV & Báo cáo',
        retention: d.hstlArchiveInfo?.retentionPeriod || 'VĨNH VIỄN',
        location: d.hstlArchiveInfo?.physicalLocation,
        securityLevel: 'THƯỜNG' as const,
        customMetadata: (d as any).customMetadata,
        ocrText: fullOcr,
        raw: d
      };
    }),
    ...incomingDocs.map(d => ({
      id: d.id,
      type: 'LUONG_3' as const,
      typeLabel: 'Sổ Văn bản Đến',
      typeBadgeColor: 'from-teal-600 to-emerald-600',
      code: `#${d.soDen} (${d.soKyHieuGoc})`,
      soKyHieuGoc: d.soKyHieuGoc,
      trichYeu: d.trichYeu,
      agency: d.coQuanGui,
      date: d.ngayBanHanh,
      field: 'Văn bản Tiếp nhận',
      docType: (d as any).loaiVanBan || 'Văn bản Đến',
      retention: d.retentionPeriod,
      location: d.physicalLocation,
      securityLevel: 'THƯỜNG' as const,
      customMetadata: (d as any).customMetadata,
      ocrText: d.ocrExtracted?.fullOcrText || `${d.soDen} ${d.soKyHieuGoc} ${d.coQuanGui} ${d.trichYeu} ${d.donViChuTri}`,
      raw: d
    })),
    ...outgoingDocs.map(d => ({
      id: d.id,
      type: 'LUONG_4' as const,
      typeLabel: 'Sổ Văn bản Đi',
      typeBadgeColor: 'from-red-600 to-rose-600',
      code: d.soDiFullCode,
      soKyHieuGoc: d.soDiFullCode,
      trichYeu: d.trichYeu,
      agency: (d as any).donViSoanThao || 'Tổng công ty Đường sắt VN',
      date: d.ngayKy,
      field: d.donViSoanThao,
      docType: (d as any).loaiVanBanLabel || (d as any).loaiVanBan || 'Văn bản Đi',
      retention: d.retentionPeriod,
      location: d.physicalLocation,
      securityLevel: (d.noiNhanDepartments?.length || d.noiNhanUserIds?.length) ? ('MẬT' as const) : ('THƯỜNG' as const),
      isOutgoingDoc: true,
      customMetadata: (d as any).customMetadata,
      ocrText: `${d.soDiFullCode} ${d.trichYeu} ${d.donViSoanThao} ${d.nguoiKy} ${d.chucVuNguoiKy} ${d.noiNhan}`,
      raw: d
    }))
  ];

  // Dynamic filter options extracted from real repository data
  const agencyList = useMemo(() => {
    const set = new Set<string>();
    allItems.forEach(item => {
      if (item.agency && item.agency.trim()) {
        set.add(item.agency.trim());
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'vi'));
  }, [allItems]);

  const docTypeList = useMemo(() => {
    const set = new Set<string>();
    allItems.forEach(item => {
      if (item.docType && item.docType.trim()) {
        set.add(item.docType.trim());
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'vi'));
  }, [allItems]);

  // Access control checking
  const canAccessDocument = (item: any) => {
    // Văn bản đi: Kiểm tra chặt chẽ theo Nơi nhận (phòng ban + cá nhân Giám đốc/Phó GĐ)
    if (item.type === 'OUTGOING' || item.isOutgoingDoc) {
      const outCheck = canUserAccessOutgoingDoc(item.raw, currentUser);
      return outCheck.allowed;
    }

    const sec = item.securityLevel || 'THƯỜNG';
    if (sec === 'THƯỜNG') return true;
    // If MẬT:
    if (currentUser.role === 'ADMIN' || currentUser.role === 'TRUONG_PHONG') return true;
    const rawDoc = item.raw || {};
    if (rawDoc.createdBy === currentUser.id || rawDoc.creatorId === currentUser.id) return true;
    const perms = rawDoc.secretAccessPermissions || item.secretAccessPermissions;
    if (!perms) return true;
    if (perms.userIds?.includes(currentUser.id)) return true;
    if (perms.departmentNames?.includes(currentUser.department)) return true;
    return false;
  };

  const handleOpenDoc = (item: typeof allItems[0]) => {
    if (canAccessDocument(item)) {
      onOpenViewer(item.raw, searchTerm);
    } else {
      setRestrictedDocAlert({ isOpen: true, doc: item });
    }
  };

  const handleDownloadDoc = (item: typeof allItems[0]) => {
    if (!canAccessDocument(item)) {
      setRestrictedDocAlert({ isOpen: true, doc: item });
      return;
    }

    const raw: any = item.raw || {};
    const fileUrl = raw.fileUrl || raw.scannedFileUrl || raw.draftFileUrl;
    const fileName = raw.fileName || raw.scannedFileName || raw.draftFileName;

    if (fileUrl && (fileUrl.startsWith('data:') || fileUrl.startsWith('blob:') || fileUrl.startsWith('http'))) {
      const a = document.createElement('a');
      a.href = fileUrl;
      a.download = fileName || `${item.code.replace(/[^a-zA-Z0-9_-]/g, '_')}_HoSo.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    // Xuất tệp hồ sơ dữ liệu chính thức đầy đủ thông tin
    const exportData = `================================================================================
TỔNG CÔNG TY ĐƯỜNG SẮT VIỆT NAM (VNR)
HỆ THỐNG QUẢN LÝ VĂN BẢN VÀ LƯU TRỮ HỒ SƠ ĐIỆN TỬ (HSTL)
================================================================================
BẢN TRÍCH XUẤT DỮ LIỆU HỒ SƠ LƯU TRỮ CHÍNH THỨC

• Phân loại luồng: ${item.typeLabel}
• Mã hồ sơ / Số ký hiệu: ${item.code}
• Trích yếu nội dung: ${item.trichYeu}
• Cơ quan / Đơn vị quản lý: ${item.agency || 'Tổng công ty Đường sắt Việt Nam'}
• Ngày văn bản / lưu trữ: ${item.date}
• Lĩnh vực: ${item.field || 'Chuyên môn'}
• Thể loại văn bản: ${item.docType || 'Hồ sơ tài liệu'}
• Thời hạn bảo quản: ${item.retention}
• Cấp độ bảo mật: ${item.securityLevel || 'THƯỜNG'}

--------------------------------------------------------------------------------
TỌA ĐỘ LƯU TRỮ KHO VẬT LÝ (5 CẤP CHUẨN HOÁ):
• Cấp 1 (Phòng / Ban / Đơn vị con): ${item.location?.phongBan || item.location?.donVi || 'Chưa định vị'}
• Cấp 2 (Dãy Kệ lưu trữ): ${item.location?.ke || 'N/A'}
• Cấp 3 (Ngăn Kệ): ${item.location?.ngan || 'N/A'}
• Cấp 4 (Hộp / Cặp hồ sơ): ${item.location?.hop || 'N/A'}
• Cấp 5 (Vị trí Hồ sơ trong Hộp): ${item.location?.hoSo || item.code}
• Mã Barcode / RFID: ${item.location?.maVach || 'N/A'}

--------------------------------------------------------------------------------
NỘI DUNG VĂN BẢN & SỐ HÓA TOÀN VĂN (OCR):
${item.ocrText || item.trichYeu}

================================================================================
Thời điểm trích xuất: ${new Date().toLocaleString('vi-VN')}
Cán bộ trích xuất: ${currentUser.name} (${currentUser.department} - ${currentUser.position})
Mã xác thực số: VNR-HSTL-EXPORT-${Date.now()}
================================================================================`;

    const blob = new Blob([exportData], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(fileName ? fileName.replace(/\.[^/.]+$/, '') : item.code.replace(/[^a-zA-Z0-9_-]/g, '_'))}_DuLieu_HSTL.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const isFiltering =
    searchTerm.trim() !== '' ||
    selectedAgency !== 'ALL' ||
    selectedDocType !== 'ALL' ||
    selectedRetention !== 'ALL';

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedAgency('ALL');
    setSelectedDocType('ALL');
    setSelectedRetention('ALL');
  };

  const filteredItems = allItems.filter(item => {
    const matchesSearch = matchesQuery(
      searchTerm,
      item.code,
      item.soKyHieuGoc,
      item.trichYeu,
      item.agency,
      item.field,
      item.ocrText
    );

    const matchesType =
      activeTab === 'ALL' ? true :
      activeTab === 'EXISTING' ? item.type === 'LUONG_1' :
      activeTab === 'DRAFT_CASES' ? item.type === 'LUONG_2' :
      activeTab === 'INCOMING' ? item.type === 'LUONG_3' :
      activeTab === 'OUTGOING' ? item.type === 'LUONG_4' : true;

    const matchesRetention =
      selectedRetention === 'ALL' ? true : item.retention === selectedRetention;

    const matchesAgency =
      selectedAgency === 'ALL' 
        ? true 
        : (item.agency && item.agency.trim().toLowerCase() === selectedAgency.trim().toLowerCase());

    const matchesDocType =
      selectedDocType === 'ALL' 
        ? true 
        : (item.docType && item.docType.trim().toLowerCase() === selectedDocType.trim().toLowerCase());

    return matchesSearch && matchesType && matchesRetention && matchesAgency && matchesDocType;
  });

  return (
    <div className="space-y-6 text-slate-800">
      {/* Overview Banner */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-gray-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                THƯ VIỆN HSTL
              </span>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Kho Thư Viện Hồ Sơ &amp; Tài Liệu Lưu Trữ
              </h2>
            </div>
            <p className="text-xs text-gray-500 mt-1 max-w-2xl leading-relaxed">
              Thư viện dữ liệu tổng hợp tập trung. Tra cứu toàn văn OCR, định vị kho vật lý, phân quyền độ mật (Chế độ Thường công khai toàn cơ quan / Chế độ Mật theo phê duyệt Trưởng phòng).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-blue-700 hover:bg-blue-800 shadow-sm transition cursor-pointer"
            >
              <FolderPlus className="w-4 h-4" />
              Tạo mới hồ sơ tài liệu
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap gap-2 pt-4">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'ALL'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'bg-gray-100 border border-gray-200 text-slate-700 hover:text-slate-900 hover:bg-gray-200'
            }`}
          >
            Tất cả tài liệu ({allItems.length})
          </button>
          <button
            onClick={() => setActiveTab('EXISTING')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'EXISTING'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'bg-gray-100 border border-gray-200 text-slate-700 hover:text-slate-900 hover:bg-gray-200'
            }`}
          >
            📁 Hồ sơ đã có ({existingDossiers.length})
          </button>
          <button
            onClick={() => setActiveTab('DRAFT_CASES')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'DRAFT_CASES'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'bg-gray-100 border border-gray-200 text-slate-700 hover:text-slate-900 hover:bg-gray-200'
            }`}
          >
            📝 HSCV &amp; Báo cáo ({draftCases.length})
          </button>
          <button
            onClick={() => setActiveTab('INCOMING')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'INCOMING'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-gray-100 border border-gray-200 text-slate-700 hover:text-slate-900 hover:bg-gray-200'
            }`}
          >
            📥 Sổ Văn bản Đến ({incomingDocs.length})
          </button>
          <button
            onClick={() => setActiveTab('OUTGOING')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'OUTGOING'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'bg-gray-100 border border-gray-200 text-slate-700 hover:text-slate-900 hover:bg-gray-200'
            }`}
          >
            📤 Sổ Văn bản Đi ({outgoingDocs.length})
          </button>
          <button
            onClick={() => setActiveTab('WAREHOUSE_MAP')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'WAREHOUSE_MAP'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-gray-100 border border-gray-200 text-slate-700 hover:text-slate-900 hover:bg-gray-200'
            }`}
          >
            🗺️ Sơ đồ Kho Vật Lý Trực Quan
          </button>
        </div>
      </div>

      {activeTab === 'WAREHOUSE_MAP' ? (
        /* Sơ đồ kho vật lý trực quan 5 CẤP: Phòng / Ban / Đơn vị con → Kệ → Ngăn → Hộp / Cặp → Hồ sơ */
        (() => {
          const activeDept = STORAGE_HIERARCHY_DEPARTMENTS.find(d => d.id === mapDeptId) || STORAGE_HIERARCHY_DEPARTMENTS[0];
          const activeShelf = activeDept.shelves.find(s => s.id === mapShelfId) || activeDept.shelves[0] || { id: '', name: '', compartments: [] };
          const activeComp = activeShelf.compartments.find(c => c.id === mapCompId) || activeShelf.compartments[0] || { id: '', name: '', boxes: [] };
          const activeBox = (activeComp.boxes || []).find(b => b.id === selectedMapBoxId) || (activeComp.boxes && activeComp.boxes[0]);

          // Filter documents matching active box and shelf
          const docsInActiveBox = allItems.filter(item => {
            const loc = item.location;
            if (!loc) return false;
            const matchDept = !loc.phongBan || loc.phongBan === activeDept.name || (loc.donVi && activeDept.name.includes(loc.donVi));
            const matchShelf = loc.ke && (loc.ke.includes(activeShelf.id) || activeShelf.name.includes(loc.ke));
            const matchBox = loc.hop && activeBox && (loc.hop.includes(activeBox.id) || activeBox.name.includes(loc.hop) || loc.hop.replace(/[^a-zA-Z0-9]/g, '').includes(activeBox.id.replace(/[^a-zA-Z0-9]/g, '')));
            return matchDept && matchShelf && matchBox;
          });

          return (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-6">
              {/* Header with Title and Legend */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-200 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-amber-500/10 text-amber-700">
                      <MapPin className="w-5 h-5" />
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        Sơ Đồ Không Gian Kho Lưu Trữ Vật Lý 5 Cấp
                      </h3>
                      <p className="text-xs text-gray-500 font-medium mt-0.5">
                        Quy chuẩn lưu trữ: <span className="font-bold text-blue-700">Phòng / Ban / Đơn vị con → Kệ → Ngăn → Hộp / Cặp → Hồ sơ</span>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs font-semibold bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200">
                  <span className="flex items-center gap-1.5 text-emerald-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Còn chỗ trống
                  </span>
                  <span className="flex items-center gap-1.5 text-amber-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Đang chứa hồ sơ
                  </span>
                  <span className="flex items-center gap-1.5 text-blue-700">
                    <Barcode className="w-3.5 h-3.5" /> Barcode/RFID 5 Cấp
                  </span>
                </div>
              </div>

              {/* Breadcrumb Path of 5 Levels */}
              <div className="bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-slate-50 border border-blue-200 rounded-xl p-3 flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-gray-500 font-semibold">Tọa độ đang chọn (5 Cấp):</span>
                <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-900 font-bold flex items-center gap-1">
                  <Building2 className="w-3 h-3" /> {activeDept.name}
                </span>
                <ArrowRight className="w-3 h-3 text-blue-400" />
                <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-900 font-bold flex items-center gap-1">
                  <Layers className="w-3 h-3" /> {activeShelf.name}
                </span>
                <ArrowRight className="w-3 h-3 text-blue-400" />
                <span className="px-2 py-0.5 rounded-md bg-teal-100 text-teal-900 font-bold flex items-center gap-1">
                  <Box className="w-3 h-3" /> {activeComp.name}
                </span>
                {activeBox && (
                  <>
                    <ArrowRight className="w-3 h-3 text-blue-400" />
                    <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-950 font-bold flex items-center gap-1">
                      <FolderArchive className="w-3 h-3" /> {activeBox.name}
                    </span>
                  </>
                )}
              </div>

              {/* LEVEL 1: PHÒNG / BAN / ĐƠN VỊ CON */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-extrabold">1</span>
                  Cấp 1: Phòng / Ban / Đơn vị con quản lý hồ sơ
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {STORAGE_HIERARCHY_DEPARTMENTS.map(dept => {
                    const isSelected = dept.id === mapDeptId;
                    const totalShelves = dept.shelves.length;
                    const totalBoxes = dept.shelves.reduce((sum, s) => sum + s.compartments.reduce((cSum, c) => cSum + c.boxes.length, 0), 0);
                    return (
                      <button
                        key={dept.id}
                        onClick={() => {
                          setMapDeptId(dept.id);
                          const firstShelf = dept.shelves[0];
                          if (firstShelf) {
                            setMapShelfId(firstShelf.id);
                            const firstComp = firstShelf.compartments[0];
                            if (firstComp) {
                              setMapCompId(firstComp.id);
                              setSelectedMapBoxId(firstComp.boxes[0]?.id || null);
                            }
                          }
                        }}
                        className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between gap-1.5 ${
                          isSelected
                            ? 'bg-blue-50/80 border-blue-600 text-blue-950 ring-2 ring-blue-200 shadow-xs'
                            : 'bg-white border-gray-200 text-slate-700 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs line-clamp-1">{dept.name}</span>
                          <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-white border border-gray-200 text-blue-700">
                            {dept.code}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-500">
                          {totalShelves} kệ lưu trữ ({totalBoxes} hộp/cặp)
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* LEVEL 2 & 3: KỆ & NGĂN */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Level 2: Kệ */}
                <div className="lg:col-span-5 space-y-2.5">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] font-extrabold">2</span>
                    Cấp 2: Kệ lưu trữ ({activeDept.name})
                  </label>
                  <div className="space-y-2">
                    {activeDept.shelves.map((shelf, idx) => {
                      const isSelected = shelf.id === mapShelfId;
                      const totalBoxes = shelf.compartments.reduce((sum, c) => sum + c.boxes.length, 0);
                      return (
                        <div
                          key={shelf.id}
                          onClick={() => {
                            setMapShelfId(shelf.id);
                            const firstComp = shelf.compartments[0];
                            if (firstComp) {
                              setMapCompId(firstComp.id);
                              setSelectedMapBoxId(firstComp.boxes[0]?.id || null);
                            }
                          }}
                          className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
                            isSelected
                              ? 'bg-purple-50/80 border-purple-600 ring-2 ring-purple-200 shadow-xs'
                              : 'bg-gray-50 border-gray-200 hover:bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-slate-900">{shelf.name}</span>
                            <span className="font-mono text-[10px] font-bold text-purple-700 bg-white px-2 py-0.5 rounded border border-purple-200">
                              Mã: {shelf.id}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-gray-500">
                            <span>Sức chứa: {shelf.compartments.length} Ngăn x {totalBoxes} Hộp/Cặp</span>
                            <span className="text-emerald-700 font-semibold font-mono text-[10px]">
                              HSTL-K{idx + 1}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Level 3 & 4: Ngăn & Hộp/Cặp */}
                <div className="lg:col-span-7 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] font-extrabold">3-4</span>
                      Cấp 3 &amp; 4: Ngăn &amp; Hộp / Cặp chứa tài liệu ({activeShelf.name})
                    </label>
                    <span className="text-[11px] text-gray-500 font-medium">Bấm vào Hộp/Cặp để xem hồ sơ bên trong</span>
                  </div>

                  {/* Compartment Tabs (Cấp 3) */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {activeShelf.compartments.map(comp => {
                      const isSelected = comp.id === mapCompId;
                      return (
                        <button
                          key={comp.id}
                          onClick={() => {
                            setMapCompId(comp.id);
                            setSelectedMapBoxId(comp.boxes[0]?.id || null);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                            isSelected
                              ? 'bg-teal-700 text-white shadow-xs'
                              : 'bg-gray-100 hover:bg-gray-200 text-slate-700 border border-gray-200'
                          }`}
                        >
                          {comp.name} ({comp.boxes.length} Hộp/Cặp)
                        </button>
                      );
                    })}
                  </div>

                  {/* Boxes Grid (Cấp 4) */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {activeComp.boxes.map(box => {
                      const isBoxSelected = (selectedMapBoxId === box.id) || (!selectedMapBoxId && activeComp.boxes[0]?.id === box.id);
                      const dossierCount = box.dossiers ? box.dossiers.length : 1;
                      return (
                        <div
                          key={box.id}
                          onClick={() => setSelectedMapBoxId(box.id)}
                          className={`p-3 rounded-xl border text-left transition cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                            isBoxSelected
                              ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-300 shadow-sm'
                              : 'bg-white border-gray-200 hover:border-amber-300 hover:shadow-xs'
                          }`}
                        >
                          {isBoxSelected && (
                            <div className="absolute top-0 right-0 w-3 h-3 bg-amber-500 rounded-bl-lg"></div>
                          )}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold text-slate-900 flex items-center gap-1 truncate">
                                <FolderArchive className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                                {box.name}
                              </span>
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900 shrink-0">
                                {dossierCount} HS
                              </span>
                            </div>
                            <p className="text-[10px] text-gray-500 line-clamp-1 font-medium">
                              {box.dossiers?.[0]?.title || 'Hồ sơ chuyên ngành'}
                            </p>
                          </div>
                          <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] font-mono text-gray-500">
                            <span>Mã: {box.id}</span>
                            <span className="text-blue-700 font-bold flex items-center gap-0.5">
                              Chi tiết →
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* LEVEL 5: HỒ SƠ & TÀI LIỆU CHI TIẾT TRONG HỘP/CẶP */}
              {activeBox && (
                <div className="mt-4 border border-amber-200 rounded-xl p-4 bg-amber-50/40 space-y-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-amber-200 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px] font-extrabold">5</span>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-amber-700" />
                        Cấp 5: Danh mục Hồ sơ &amp; Văn bản thực tế trong [{activeBox.name}]
                      </h4>
                    </div>
                    <div className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-white border border-amber-300 text-amber-950 flex items-center gap-1.5 shadow-2xs">
                      <Barcode className="w-4 h-4 text-blue-700" />
                      <span>{activeDept.code}-{activeShelf.id.replace(/[^a-zA-Z0-9]/g, '')}-{activeComp.id.replace(/[^a-zA-Z0-9]/g, '')}-{activeBox.id.replace(/[^a-zA-Z0-9]/g, '')}</span>
                    </div>
                  </div>

                  {/* List of Dossiers defined in Box */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(activeBox.dossiers || [{ id: 'HS-01', name: 'Hồ sơ số 01 (HS-01)', title: 'Hồ sơ tài liệu số hóa' }]).map(dossier => (
                      <div
                        key={dossier.id}
                        className="bg-white border border-amber-200/90 rounded-xl p-3 flex items-start gap-3 shadow-2xs"
                      >
                        <div className="p-2 rounded-lg bg-amber-50 text-amber-700 shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-xs text-blue-900 font-mono">{dossier.name}</span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Đang lưu trữ
                            </span>
                          </div>
                          <p className="text-xs text-slate-800 font-medium mt-0.5 line-clamp-2">
                            {dossier.title}
                          </p>
                          <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-500 font-mono">
                            <span>Vị trí 5 cấp:</span>
                            <span className="font-bold text-slate-700 truncate">
                              {activeDept.code} ➔ {activeShelf.id} ➔ {activeComp.id} ➔ {activeBox.id} ➔ {dossier.id}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Cross-referenced real documents in this box */}
                  {docsInActiveBox.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-amber-200/70">
                      <span className="text-xs font-bold text-slate-900 block mb-2">
                        Văn bản thực tế liên kết với tọa độ này ({docsInActiveBox.length} tài liệu):
                      </span>
                      <div className="space-y-2">
                        {docsInActiveBox.map(docItem => (
                          <div
                            key={docItem.id}
                            className="bg-white border border-gray-200 rounded-lg p-2.5 flex items-center justify-between gap-3 text-xs hover:border-blue-300 transition"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-blue-700">{docItem.code}</span>
                                <span className="text-[10px] text-gray-500 font-sans">{docItem.agency}</span>
                              </div>
                              <div className="text-slate-800 text-xs font-medium truncate mt-0.5">
                                {docItem.trichYeu}
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={() => handleOpenDoc(docItem)}
                                className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold inline-flex items-center gap-1 cursor-pointer transition shadow-2xs"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                Xem Hồ Sơ
                              </button>
                              <button
                                onClick={() => handleDownloadDoc(docItem)}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold inline-flex items-center gap-1 cursor-pointer transition shadow-2xs"
                                title="Tải về dữ liệu / tệp tin hồ sơ này"
                              >
                                <Download className="w-3.5 h-3.5" />
                                Tải Về
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })()
      ) : (
        /* Repository Item Table */
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
          {/* Filter and Search */}
          <div className="p-4 bg-gray-50/90 border-b border-gray-200 space-y-3">
            {/* Top row: Global Search + Results Count & Reset button */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm toàn văn theo Số ký hiệu, Trích yếu, Nội dung OCR, Tên người ký, Đơn vị..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 shadow-2xs"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded cursor-pointer"
                    title="Xóa từ khóa"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2.5 shrink-0 justify-between md:justify-end">
                {isFiltering && (
                  <button
                    onClick={handleResetFilters}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition cursor-pointer shadow-2xs"
                    title="Xóa tất cả bộ lọc để xem toàn bộ"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Đặt lại bộ lọc</span>
                  </button>
                )}

                <div className="text-xs text-gray-600 font-medium whitespace-nowrap bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-2xs">
                  Hiển thị: <span className="text-blue-700 font-bold">{filteredItems.length}</span> / {allItems.length} hồ sơ
                </div>
              </div>
            </div>

            {/* Bottom row: Combobox Filters (Cơ quan / Đơn vị, Loại tài liệu, Thời hạn) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 border-t border-gray-200/70">
              {/* Combobox 1: Cơ quan / Đơn vị */}
              <div className="relative">
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-blue-600">
                  <Building2 className="w-3.5 h-3.5" />
                </div>
                <select
                  value={selectedAgency}
                  onChange={(e) => setSelectedAgency(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl pl-8 pr-7 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 cursor-pointer shadow-2xs truncate"
                  title="Lọc theo Cơ quan / Đơn vị"
                >
                  <option value="ALL">🏢 Cơ quan / Đơn vị: Tất cả ({agencyList.length})</option>
                  {agencyList.map((agency) => (
                    <option key={agency} value={agency}>
                      {agency}
                    </option>
                  ))}
                </select>
              </div>

              {/* Combobox 2: Loại tài liệu */}
              <div className="relative">
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-600">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <select
                  value={selectedDocType}
                  onChange={(e) => setSelectedDocType(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl pl-8 pr-7 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 cursor-pointer shadow-2xs truncate"
                  title="Lọc theo Loại tài liệu"
                >
                  <option value="ALL">📄 Loại tài liệu: Tất cả ({docTypeList.length})</option>
                  {docTypeList.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Combobox 3: Thời hạn bảo quản */}
              <div className="relative">
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-amber-600">
                  <Archive className="w-3.5 h-3.5" />
                </div>
                <select
                  value={selectedRetention}
                  onChange={(e) => setSelectedRetention(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl pl-8 pr-7 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 cursor-pointer shadow-2xs truncate"
                  title="Lọc theo Thời hạn bảo quản"
                >
                  <option value="ALL">⏳ Thời hạn lưu trữ: Tất cả</option>
                  <option value="VĨNH VIỄN">Vĩnh viễn</option>
                  <option value="70 NĂM">70 Năm</option>
                  <option value="50 NĂM">50 Năm</option>
                  <option value="20 NĂM">20 Năm</option>
                  <option value="10 NĂM">10 Năm</option>
                  <option value="5 NĂM">5 Năm</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 min-w-[760px]">
              <thead className="bg-blue-50/80 text-[11px] uppercase tracking-wider text-blue-950 font-bold border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Số ký hiệu / Mã HSTL</th>
                  <th className="py-3 px-4">Độ mật &amp; Quyền xem</th>
                  <th className="py-3 px-4">Phân loại Nghiệp vụ</th>
                  <th className="py-3 px-4">Trích yếu nội dung</th>
                  <th className="py-3 px-4">Cơ quan / Đơn vị</th>
                  <th className="py-3 px-4">Thời hạn &amp; Vị trí Kho</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-500 font-medium">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Filter className="w-8 h-8 text-gray-300" />
                        <p className="text-slate-800 font-bold text-sm">Không tìm thấy hồ sơ tài liệu phù hợp</p>
                        <p className="text-xs text-gray-400 max-w-md">
                          {searchTerm 
                            ? `Không có kết quả nào khớp với từ khóa "${searchTerm}".`
                            : 'Không có hồ sơ nào khớp với bộ lọc Cơ quan, Loại tài liệu hoặc Thời hạn đang chọn.'}
                        </p>
                        {isFiltering && (
                          <button
                            onClick={handleResetFilters}
                            className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                            Xóa tất cả bộ lọc
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => {
                    const ocrSnippet = getOcrSnippet(item.ocrText, searchTerm);
                    const matchedInOcr = searchTerm.trim() && ocrSnippet;
                    const hasAccess = canAccessDocument(item);

                    return (
                      <tr key={`${item.type}-${item.id}`} className="hover:bg-blue-50/40 transition">
                        <td className="py-3.5 px-4">
                          <span className="font-mono font-bold text-blue-700 text-xs block">
                            <HighlightText text={item.code} search={searchTerm} />
                          </span>
                          <span className="text-[10px] text-gray-500 font-sans font-medium">{item.date}</span>
                        </td>

                        {/* Security Level Indicator */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {item.securityLevel === 'MẬT' ? (
                            hasAccess ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs">
                                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span> Mật (Đã mở khóa)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-900 border border-rose-300 shadow-2xs">
                                <Lock className="w-3 h-3 text-rose-700" /> Mật (Khóa quyền xem)
                              </span>
                            )
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Thường (Công khai)
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1 items-start">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-800">
                              {item.docType || item.field || 'Tài liệu'}
                            </span>
                            <span className="text-[9px] font-medium text-gray-500">
                              {item.typeLabel.split('(')[0]}
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 max-w-sm">
                          <div className="line-clamp-2 text-slate-900 font-medium">
                            <HighlightText text={item.trichYeu} search={searchTerm} />
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            <span className="text-[10px] text-gray-500 font-medium">
                              <HighlightText text={item.field} search={searchTerm} />
                            </span>
                            {/* Metadata Pills */}
                            {item.customMetadata && Object.keys(item.customMetadata).length > 0 && (
                              <>
                                {item.customMetadata.giaTriHopDong !== undefined && (
                                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                                    <DollarSign className="w-2.5 h-2.5 text-emerald-600" />
                                    {formatShortVND(item.customMetadata.giaTriHopDong)}
                                  </span>
                                )}
                                {item.customMetadata.nguoiKy && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-semibold">
                                    ✍️ {item.customMetadata.nguoiKy}
                                  </span>
                                )}
                                {item.customMetadata.nguoiThietKe && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200 text-[10px] font-semibold">
                                    📐 {item.customMetadata.nguoiThietKe}
                                  </span>
                                )}
                                {item.customMetadata.nguoiLapToTrinh && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-semibold">
                                    📝 {item.customMetadata.nguoiLapToTrinh}
                                  </span>
                                )}
                                {item.customMetadata.chuNhiemBaoCao && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-200 text-[10px] font-semibold">
                                    👤 {item.customMetadata.chuNhiemBaoCao}
                                  </span>
                                )}
                              </>
                            )}
                          </div>

                          {/* Trùng khớp trong OCR toàn văn */}
                          {matchedInOcr && (
                            <div className="mt-1.5 p-1.5 rounded-lg bg-yellow-50 border border-yellow-200 text-[10px] text-slate-800 animate-fadeIn">
                              <div className="font-bold text-amber-900 flex items-center gap-1 mb-0.5">
                                <Sparkles className="w-3 h-3 text-amber-600 shrink-0" />
                                <span>Khớp nội dung văn bản OCR:</span>
                              </div>
                              <div className="font-mono text-slate-700 leading-snug">
                                <HighlightText text={ocrSnippet} search={searchTerm} />
                              </div>
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-slate-800 font-medium">
                          <HighlightText text={item.agency} search={searchTerm} />
                        </td>

                        <td className="py-3.5 px-4 text-xs whitespace-nowrap">
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-50 text-amber-800 border border-amber-200">
                            {item.retention || '10 NĂM'}
                          </span>
                          {item.location && (
                            <div className="text-[10px] text-gray-500 mt-1 flex flex-col gap-0.5 font-mono">
                              <div
                                className="flex items-center gap-1 text-slate-700 font-medium truncate max-w-[210px] cursor-help"
                                title={`[6 CẤP LƯU TRỮ VẬT LÝ]\n1. Đơn vị: ${item.location.donVi || 'TCT ĐSVN'}\n2. Khu vực: ${item.location.khuVuc || 'Khu vực A'}\n3. Kệ: ${item.location.ke || 'K-01'}\n4. Ngăn: ${item.location.ngan || 'N-01'}\n5. Hộp: ${item.location.hop || 'H-01'}\n6. Hồ sơ: ${item.location.hoSo || 'HS-01'}\nMã vạch: ${item.location.maVach || 'N/A'}`}
                              >
                                <MapPin className="w-2.5 h-2.5 text-blue-600 shrink-0" />
                                <span>{item.location.ke} · {item.location.ngan} · {item.location.hop}</span>
                              </div>
                              {item.location.hoSo && (
                                <span className="text-[9px] text-amber-800 font-semibold truncate max-w-[210px]">
                                  📁 {item.location.hoSo}
                                </span>
                              )}
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenDoc(item)}
                              className={`px-3 py-1.5 rounded-lg font-bold text-xs inline-flex items-center gap-1 cursor-pointer transition shadow-2xs ${
                                hasAccess 
                                  ? 'bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800'
                                  : 'bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-800'
                              }`}
                              title={hasAccess ? 'Xem chi tiết hồ sơ' : 'Tài liệu mật bị hạn chế quyền truy cập'}
                            >
                              {hasAccess ? <Eye className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                              {hasAccess ? 'Xem Hồ Sơ' : 'Bị Khóa Quyền Xem'}
                            </button>
                            {hasAccess && (
                              <button
                                onClick={() => handleDownloadDoc(item)}
                                className="px-2.5 py-1.5 rounded-lg font-bold text-xs inline-flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 transition cursor-pointer shadow-2xs"
                                title="Tải về dữ liệu / tệp tin hồ sơ này"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Tải Về</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Restricted Doc Permission Alert Modal */}
      {restrictedDocAlert.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-rose-300 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4 text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-rose-100">
              <div className="flex items-center gap-2 text-rose-700">
                <ShieldAlert className="w-6 h-6" />
                <h3 className="text-base font-bold text-slate-900">
                  Tài Liệu MẬT - Hạn Chế Quyền Xem
                </h3>
              </div>
              <button
                onClick={() => setRestrictedDocAlert({ isOpen: false })}
                className="text-gray-400 hover:text-slate-800 font-bold p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-2 text-xs">
              <div className="font-bold text-rose-950 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-rose-700 shrink-0" />
                <span>Số hiệu: <strong>{restrictedDocAlert.doc?.code}</strong></span>
              </div>
              {restrictedDocAlert.doc?.type === 'OUTGOING' || restrictedDocAlert.doc?.isOutgoingDoc ? (
                <div className="space-y-2">
                  <p className="text-rose-900 leading-relaxed">
                    Văn bản đi này đã được Văn thư thiết lập phân quyền theo <strong>Nơi nhận</strong>. Chỉ các cá nhân (Giám đốc, Phó Giám đốc...) và các đơn vị nội bộ được chọn tại Nơi nhận mới được xem tài liệu.
                  </p>
                  {restrictedDocAlert.doc?.raw?.noiNhan && (
                    <div className="text-[11px] text-gray-700 bg-white/80 p-2 rounded-lg border border-rose-200">
                      <div><strong>Nơi nhận được phép xem:</strong> {restrictedDocAlert.doc.raw.noiNhan}</div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-rose-900 leading-relaxed">
                  Tài liệu này được xếp vào danh mục <strong>MẬT</strong> và chỉ các cá nhân hoặc phòng ban được Trưởng phòng phê duyệt mới có quyền truy cập.
                </p>
              )}
              <div className="text-[11px] text-gray-600 border-t border-rose-200 pt-1.5">
                Tài khoản hiện tại của bạn (<strong>{currentUser.name}</strong> - <em>{currentUser.department}</em>) chưa được cấp quyền xem tài liệu này.
              </div>
            </div>

            <div className="text-[11px] text-gray-500">
              💡 <em>Bạn có thể đổi tài khoản (Giám đốc / Chuyên viên phòng nhận) ở nút Chuyển đổi tài khoản trên thanh tiêu đề để kiểm tra phân quyền.</em>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setRestrictedDocAlert({ isOpen: false })}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Đã Hiểu &amp; Đóng Lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create New Dossier Modal */}
      <CreateNewDossierModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        currentUser={currentUser}
        onSuccess={() => {
          setLastUpdated(Date.now());
        }}
      />
    </div>
  );
};
