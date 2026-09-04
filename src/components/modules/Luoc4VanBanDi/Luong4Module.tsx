import React, { useState } from 'react';
import { OutgoingDocument, OutgoingDocType, UserProfile, RetentionPeriod, PhysicalLocation } from '../../../types';
import { StorageService } from '../../../services/storageService';
import { PhysicalLocationSelector } from '../../common/PhysicalLocationSelector';
import { HighlightText, getOcrSnippet, matchesQuery } from '../../../utils/highlight';
import { OutgoingRecipientCombobox } from './OutgoingRecipientCombobox';
import { canUserAccessOutgoingDoc } from '../../../utils/outgoingPermission';
import { 
  SendHorizontal, 
  UploadCloud, 
  Stamp, 
  FileCheck2, 
  Share2, 
  Download, 
  Search, 
  Eye, 
  CheckCircle,
  Archive,
  BookOpen,
  Sparkles,
  FolderPlus,
  Building2,
  FileText,
  Clock,
  MapPin,
  CheckCircle2,
  Tag,
  Filter,
  Lock,
  ShieldCheck,
  ShieldAlert,
  Users,
  Award,
  Edit3,
  X,
  AlertCircle,
  UserCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Luong4ModuleProps {
  currentUser: UserProfile;
  onOpenViewer: (doc: OutgoingDocument, searchKeyword?: string) => void;
}

export const Luong4Module: React.FC<Luong4ModuleProps> = ({ currentUser, onOpenViewer }) => {
  const [outgoingDocs, setOutgoingDocs] = useState<OutgoingDocument[]>(StorageService.getOutgoingDocs());
  const [isIssuing, setIsIssuing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL');
  const [viewScopeFilter, setViewScopeFilter] = useState<'ALL' | 'ACCESSIBLE_ONLY' | 'RESTRICTED_ONLY'>('ALL');

  // Form State for Outgoing Document Registration (Văn bản đã có số, có chữ ký và đóng dấu)
  const [soKyHieu, setSoKyHieu] = useState('215/QĐ-ĐS');
  const [docType, setDocType] = useState<OutgoingDocType | string>('QUYET_DINH');
  const [donViSoanThao, setDonViSoanThao] = useState('Ban Kỹ thuật - Hạ tầng Cơ sở');
  const [chuyenVienSoanThao, setChuyenVienSoanThao] = useState(currentUser.name || 'Nguyễn Văn Cường');
  const [nguoiKy, setNguoiKy] = useState('Đặng Sỹ Mạnh');
  const [chucVuNguoiKy, setChucVuNguoiKy] = useState('Tổng Giám Đốc');
  const [ngayKy, setNgayKy] = useState(new Date().toISOString().split('T')[0]);
  const [trichYeu, setTrichYeu] = useState('');

  // Nơi nhận states for form
  const [formSelectedDepts, setFormSelectedDepts] = useState<string[]>([
    'Ban Kỹ thuật - Hạ tầng Cơ sở',
    'Ban Quản lý Đầu tư & Xây dựng'
  ]);
  const [formSelectedUserIds, setFormSelectedUserIds] = useState<string[]>(['user_gd_1']);
  const [formSelectedUserNames, setFormSelectedUserNames] = useState<string[]>(['Đặng Sỹ Mạnh (Tổng Giám Đốc)']);
  const [formExternalRecipients, setFormExternalRecipients] = useState('Bộ GTVT; Cục ĐSVN; Lưu VT-HSTL');
  const [noiNhan, setNoiNhan] = useState('Ban Tổng Giám đốc (Đặng Sỹ Mạnh); Ban Kỹ thuật - Hạ tầng Cơ sở; Ban Quản lý Đầu tư & Xây dựng; Bộ GTVT; Cục ĐSVN; Lưu VT-HSTL');
  const [soLuongBan, setSoLuongBan] = useState<number>(15);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string } | null>(null);

  // Retention & Physical Location in HSTL Library
  const [retentionPeriod, setRetentionPeriod] = useState<RetentionPeriod>('VĨNH VIỄN');
  const [physicalLocation, setPhysicalLocation] = useState<PhysicalLocation>({
    phongBan: 'Văn phòng Tổng công ty (Phòng Hành chính - Lưu trữ)',
    ke: 'Kệ K-02 (Văn bản Đi NĐ30 & Báo cáo)',
    ngan: 'Ngăn N-01 (Tầng 1 - Kệ 02)',
    hop: 'Hộp / Cặp H-04',
    hoSo: 'Hồ sơ số 01 (HS-01)',
    maVach: 'VP-K02-N01-H04-HS01',
    donVi: 'Văn phòng Tổng công ty'
  });

  // State for Editing Recipients Modal on existing document
  const [editingDocForRecipients, setEditingDocForRecipients] = useState<OutgoingDocument | null>(null);
  const [editDepts, setEditDepts] = useState<string[]>([]);
  const [editUserIds, setEditUserIds] = useState<string[]>([]);
  const [editUserNames, setEditUserNames] = useState<string[]>([]);
  const [editExternal, setEditExternal] = useState<string>('');
  const [editCombinedText, setEditCombinedText] = useState<string>('');

  // State for Access Denied Modal
  const [accessDeniedModal, setAccessDeniedModal] = useState<{
    isOpen: boolean;
    doc?: OutgoingDocument;
    reason?: string;
    allowedDepartments?: string[];
    allowedUsers?: string[];
  }>({ isOpen: false });

  const reloadData = () => {
    setOutgoingDocs(StorageService.getOutgoingDocs());
  };

  const docTypeLabels: Record<string, string> = {
    QUYET_DINH: 'Quyết định',
    CONG_VAN: 'Công văn',
    THONG_BAO: 'Thông báo',
    BIEN_BAN: 'Biên bản',
    TO_TRINH: 'Tờ trình',
    KE_HOACH: 'Kế hoạch',
    BAO_CAO: 'Báo cáo',
    HUONG_DAN: 'Hướng dẫn',
    QUY_CHE: 'Quy chế / Quy định',
    KHAC: 'Văn bản khác'
  };

  const handleSaveToRegisterAndLibrary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!soKyHieu.trim()) {
      alert('Vui lòng nhập Số ký hiệu đã có của văn bản!');
      return;
    }
    if (!trichYeu.trim()) {
      alert('Vui lòng nhập Trích yếu nội dung văn bản đi!');
      return;
    }
    if (!nguoiKy.trim()) {
      alert('Vui lòng nhập Họ tên người đã ký duyệt văn bản!');
      return;
    }

    // Extract numeric part if possible
    const matchNum = soKyHieu.match(/\d+/);
    const parsedNum = matchNum ? parseInt(matchNum[0]) : Math.floor(Math.random() * 900) + 100;

    const newDoc: OutgoingDocument = {
      id: 'out-' + Date.now(),
      soDiNumber: parsedNum,
      soDiFullCode: soKyHieu.trim(),
      loaiVanBan: docType as any,
      loaiVanBanLabel: docTypeLabels[docType] || 'Văn bản hành chính',
      donViSoanThao: donViSoanThao.trim(),
      chuyenVienSoanThao: chuyenVienSoanThao.trim(),
      nguoiKy: nguoiKy.trim(),
      chucVuNguoiKy: chucVuNguoiKy.trim(),
      ngayKy,
      trichYeu: trichYeu.trim(),
      noiNhan: noiNhan.trim(),
      noiNhanDepartments: formSelectedDepts,
      noiNhanUserIds: formSelectedUserIds,
      noiNhanUserNames: formSelectedUserNames,
      noiNhanExternal: formExternalRecipients.trim(),
      soLuongBan,
      fileScanDauDoUrl: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=800&auto=format&fit=crop&q=80',
      fileName: uploadedFile?.name || `${soKyHieu.trim().replace(/[\/\\:]/g, '_')}_DaKyDongDau.pdf`,
      fileSize: uploadedFile?.size || '3.5 MB',
      banSaoDienTuIssuedCount: 0,
      isArchivedToHSTL: true,
      hstlCode: `HSTL-VBDI-${new Date().getFullYear()}-${soKyHieu.trim().replace(/[\/\\:]/g, '-')}`,
      retentionPeriod,
      physicalLocation,
      registeredBy: currentUser.id,
      registeredByName: currentUser.name,
      registeredAt: new Date().toISOString()
    };

    StorageService.addOutgoingDoc(newDoc);
    reloadData();
    setIsIssuing(false);
    resetForm();

    // Trigger state change so other modules and library update
    window.dispatchEvent(new CustomEvent('hstl_state_change', { detail: { type: 'outgoing_docs' } }));

    try {
      confetti({ particleCount: 50, spread: 70 });
    } catch (e) {}

    alert(`Đã cập nhật thành công Văn bản đi [${soKyHieu.trim()}] với phân quyền nơi nhận bảo mật và chuyển lưu trữ vào Thư viện HSTL!`);
  };

  const resetForm = () => {
    setSoKyHieu('216/QĐ-ĐS');
    setTrichYeu('');
    setUploadedFile(null);
    setFormSelectedDepts(['Ban Kỹ thuật - Hạ tầng Cơ sở']);
    setFormSelectedUserIds(['user_gd_1']);
    setFormSelectedUserNames(['Đặng Sỹ Mạnh (Tổng Giám Đốc)']);
    setFormExternalRecipients('Bộ GTVT; Cục ĐSVN; Lưu VT-HSTL');
  };

  const handleOpenEditRecipients = (doc: OutgoingDocument) => {
    setEditingDocForRecipients(doc);
    setEditDepts(doc.noiNhanDepartments || []);
    setEditUserIds(doc.noiNhanUserIds || []);
    setEditUserNames(doc.noiNhanUserNames || []);
    setEditExternal(doc.noiNhanExternal || '');
    setEditCombinedText(doc.noiNhan || '');
  };

  const handleSaveEditedRecipients = () => {
    if (!editingDocForRecipients) return;
    StorageService.updateOutgoingDoc(editingDocForRecipients.id, {
      noiNhanDepartments: editDepts,
      noiNhanUserIds: editUserIds,
      noiNhanUserNames: editUserNames,
      noiNhanExternal: editExternal.trim(),
      noiNhan: editCombinedText.trim() || editingDocForRecipients.noiNhan
    });
    reloadData();
    setEditingDocForRecipients(null);
    window.dispatchEvent(new CustomEvent('hstl_state_change', { detail: { type: 'outgoing_docs' } }));
    alert('Đã cập nhật thành công phân quyền nơi nhận cho văn bản!');
  };

  const handleDocClick = (doc: OutgoingDocument) => {
    const access = canUserAccessOutgoingDoc(doc, currentUser);
    if (access.allowed) {
      onOpenViewer(doc, searchTerm);
    } else {
      setAccessDeniedModal({
        isOpen: true,
        doc,
        reason: access.reason,
        allowedDepartments: access.allowedDepartments,
        allowedUsers: access.allowedUsers
      });
    }
  };

  const handleIssueElectronicCopy = (doc: OutgoingDocument) => {
    StorageService.updateOutgoingDoc(doc.id, {
      banSaoDienTuIssuedCount: (doc.banSaoDienTuIssuedCount || 0) + 1
    });
    reloadData();
    window.dispatchEvent(new CustomEvent('hstl_state_change', { detail: { type: 'outgoing_docs' } }));
    alert(`Đã cấp phát Bản sao điện tử hợp lệ (Số ký hiệu: ${doc.soDiFullCode}) có đóng dấu chứng thực số của Tổng công ty!`);
  };

  const handleExportRegistry = () => {
    alert(`Đang xuất dữ liệu Sổ Văn bản Đi năm 2026 (${outgoingDocs.length} văn bản) sang định dạng Excel/PDF...`);
  };

  const accessibleCount = outgoingDocs.filter(d => canUserAccessOutgoingDoc(d, currentUser).allowed).length;
  const restrictedCount = outgoingDocs.length - accessibleCount;

  const filteredDocs = outgoingDocs.filter(d => {
    // Filter by document type
    if (selectedTypeFilter !== 'ALL' && d.loaiVanBan !== selectedTypeFilter) {
      return false;
    }

    // Filter by permission scope
    const access = canUserAccessOutgoingDoc(d, currentUser);
    if (viewScopeFilter === 'ACCESSIBLE_ONLY' && !access.allowed) {
      return false;
    }
    if (viewScopeFilter === 'RESTRICTED_ONLY' && access.allowed) {
      return false;
    }

    const fullOcr = `${d.soDiFullCode} ${d.trichYeu} ${d.donViSoanThao} ${d.nguoiKy} ${d.chucVuNguoiKy} ${d.noiNhan} ${d.loaiVanBanLabel}`;
    return matchesQuery(
      searchTerm,
      d.soDiFullCode,
      d.trichYeu,
      d.donViSoanThao,
      d.nguoiKy,
      d.chucVuNguoiKy,
      d.noiNhan,
      fullOcr
    );
  });

  return (
    <div className="p-4 sm:p-6 space-y-6 text-slate-800">
      {/* Header Banner */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-gray-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
                SỔ VĂN BẢN ĐI
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                Sổ Văn Bản Đi - Cập Nhật & Lưu Trữ Thư Viện HSTL
              </h2>
            </div>
            <p className="text-xs text-gray-500 mt-1.5 font-medium leading-relaxed">
              Tiếp nhận văn bản đi đã có sẵn số hiệu, chữ ký Lãnh đạo và đóng dấu đỏ cơ quan hoàn chỉnh. Văn thư cập nhật vào sổ và bàn giao lưu trữ vào Thư viện HSTL.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExportRegistry}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 bg-gray-100 hover:bg-gray-200 border border-gray-200 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Xuất Sổ Văn Bản Đi</span>
            </button>
            <button
              onClick={() => {
                resetForm();
                setIsIssuing(true);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 shadow-sm transition cursor-pointer"
            >
              <FolderPlus className="w-4 h-4" />
              <span>Cập Nhật Văn Bản Đi Mới</span>
            </button>
          </div>
        </div>

        {/* 3 Steps Pipeline */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4">
          <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-3 flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-rose-600 text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
              1
            </span>
            <div className="text-xs min-w-0">
              <div className="font-bold text-rose-900 truncate">Văn Bản Đã Ký & Đóng Dấu</div>
              <div className="text-[11px] text-gray-500 font-medium truncate">Đã có số hiệu, chữ ký và dấu đỏ tròn</div>
            </div>
          </div>

          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
              2
            </span>
            <div className="text-xs min-w-0">
              <div className="font-bold text-blue-900 truncate">Văn Thư Cập Nhật Vào Sổ</div>
              <div className="text-[11px] text-gray-500 font-medium truncate">Ghi nhận số, ngày, người ký & tệp scan</div>
            </div>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
              3
            </span>
            <div className="text-xs min-w-0">
              <div className="font-bold text-emerald-900 truncate">Lưu Trữ Thư Viện HSTL</div>
              <div className="text-[11px] text-gray-500 font-medium truncate">Định vị Kệ - Ngăn - Hộp & cấp bản sao</div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Cập Nhật Văn Bản Đi Mới */}
      {isIssuing && (
        <div className="bg-white border border-blue-200 rounded-2xl p-5 sm:p-6 shadow-lg space-y-6 animate-fadeIn text-slate-800">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Cập Nhật Văn Bản Đi & Bàn Giao Lưu Trữ Thư Viện HSTL
                </h3>
                <p className="text-[11px] text-gray-500 font-medium">
                  Văn thư ghi nhận văn bản đã phát hành có chữ ký và đóng dấu thực tế
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsIssuing(false)}
              className="text-xs font-semibold text-gray-600 hover:text-slate-900 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 cursor-pointer"
            >
              Hủy bỏ
            </button>
          </div>

          {/* Quick Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3 text-xs text-amber-900">
            <Stamp className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
            <div>
              <span className="font-bold">Quy ước văn bản đi:</span> Văn bản tiếp nhận ở đây đã hoàn tất chữ ký Lãnh đạo và dấu đỏ của cơ quan. Bạn chỉ cần nhập đúng số ký hiệu có trên văn bản, đính kèm tệp scan và chọn vị trí lưu trữ kho vật lý để đưa vào Thư viện.
            </div>
          </div>

          <form onSubmit={handleSaveToRegisterAndLibrary} className="space-y-4">
            {/* Row 1: Số ký hiệu, Loại văn bản, Ngày ký ban hành */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  1. Số ký hiệu văn bản đi đã có: <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: 158/QĐ-ĐS, 199/CV-TCHC..."
                  value={soKyHieu}
                  onChange={(e) => setSoKyHieu(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
                <span className="text-[10px] text-gray-500 mt-0.5 block">Nhập chính xác số và ký hiệu đã được ghi trên văn bản</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  2. Loại văn bản:
                </label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 cursor-pointer"
                >
                  <option value="QUYET_DINH">Quyết định</option>
                  <option value="CONG_VAN">Công văn</option>
                  <option value="THONG_BAO">Thông báo</option>
                  <option value="BIEN_BAN">Biên bản</option>
                  <option value="TO_TRINH">Tờ trình</option>
                  <option value="KE_HOACH">Kế hoạch</option>
                  <option value="BAO_CAO">Báo cáo</option>
                  <option value="HUONG_DAN">Hướng dẫn</option>
                  <option value="QUY_CHE">Quy chế / Quy định</option>
                  <option value="KHAC">Văn bản khác</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  3. Ngày ký duyệt ban hành: <span className="text-rose-600">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={ngayKy}
                  onChange={(e) => setNgayKy(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            {/* Row 2: Phòng ban soạn thảo & Lãnh đạo ký */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  4. Phòng Ban / Đơn vị tham mưu soạn thảo:
                </label>
                <select
                  value={donViSoanThao}
                  onChange={(e) => setDonViSoanThao(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 cursor-pointer"
                >
                  <option value="Ban Kỹ thuật - Hạ tầng Cơ sở">Ban Kỹ thuật - Hạ tầng Cơ sở</option>
                  <option value="Ban Tổ chức Cán bộ - Lao động">Ban Tổ chức Cán bộ - Lao động</option>
                  <option value="Ban Vận tải Đường sắt">Ban Vận tải Đường sắt</option>
                  <option value="Ban Tài chính - Kế toán">Ban Tài chính - Kế toán</option>
                  <option value="Ban An toàn Giao thông Đường sắt">Ban An toàn Giao thông Đường sắt</option>
                  <option value="Ban Quản lý Đầu tư & Xây dựng">Ban Quản lý Đầu tư & Xây dựng</option>
                  <option value="Văn phòng Tổng công ty">Văn phòng Tổng công ty</option>
                  <option value="Hội đồng Thành viên Tổng công ty">Hội đồng Thành viên Tổng công ty</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  5. Lãnh đạo đã ký duyệt thực tế: <span className="text-rose-600">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Họ và tên người ký"
                    value={nguoiKy}
                    onChange={(e) => setNguoiKy(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Chức vụ người ký"
                    value={chucVuNguoiKy}
                    onChange={(e) => setChucVuNguoiKy(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>
            </div>

            {/* Trích yếu */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                6. Trích yếu nội dung văn bản đi: <span className="text-rose-600">*</span>
              </label>
              <textarea
                rows={2}
                required
                placeholder="Nhập nội dung trích yếu của văn bản phát hành..."
                value={trichYeu}
                onChange={(e) => setTrichYeu(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            {/* Nơi nhận & Phân quyền bảo mật & Số lượng bản */}
            <div className="space-y-4">
              <OutgoingRecipientCombobox
                selectedDepts={formSelectedDepts}
                onChangeDepts={setFormSelectedDepts}
                selectedUserIds={formSelectedUserIds}
                onChangeUserIds={(ids, names) => {
                  setFormSelectedUserIds(ids);
                  setFormSelectedUserNames(names);
                }}
                externalRecipients={formExternalRecipients}
                onChangeExternal={setFormExternalRecipients}
                onFullTextGenerated={setNoiNhan}
              />

              <div className="w-full sm:w-64">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Số bản phát hành thực tế:
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={1}
                    value={soLuongBan}
                    onChange={(e) => setSoLuongBan(parseInt(e.target.value) || 1)}
                    className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-blue-600"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-medium">bản</span>
                </div>
              </div>
            </div>

            {/* Tệp đính kèm scan đã có chữ ký & dấu đỏ */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                8. Đính kèm bản Scan văn bản đã có chữ ký Lãnh đạo & con dấu đỏ cơ quan:
              </label>
              <div className="border border-dashed border-blue-300 rounded-xl p-4 bg-blue-50/40 text-center">
                <input
                  type="file"
                  id="out-scan-file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setUploadedFile({ name: f.name, size: (f.size / (1024 * 1024)).toFixed(1) + ' MB' });
                  }}
                  className="hidden"
                />
                <label htmlFor="out-scan-file" className="cursor-pointer block space-y-1">
                  <UploadCloud className="w-6 h-6 mx-auto text-blue-600" />
                  <span className="text-xs font-bold text-blue-800 hover:underline">
                    Nhấn để tải lên tệp scan bản có chữ ký Lãnh đạo & dấu đỏ thật (.pdf, .jpg)
                  </span>
                  <p className="text-[11px] text-gray-500 font-medium">
                    Tệp scan này sẽ được bảo quản an toàn trong Thư viện HSTL phục vụ tra cứu và cấp phát bản sao điện tử
                  </p>
                </label>

                {uploadedFile ? (
                  <div className="mt-2.5 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-mono font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Đã đính kèm bản dấu đỏ: {uploadedFile.name} ({uploadedFile.size})</span>
                  </div>
                ) : (
                  <div className="mt-2 flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setUploadedFile({ name: `${soKyHieu.replace(/[\/\\:]/g, '_')}_DauDoGoc.pdf`, size: '3.4 MB' })}
                      className="text-[11px] text-blue-700 hover:text-blue-900 bg-white border border-blue-200 px-2.5 py-1 rounded-md font-medium cursor-pointer shadow-2xs"
                    >
                      + Dùng tệp scan mẫu đã có dấu
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Lưu trữ Thư viện HSTL */}
            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/60 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <Archive className="w-4 h-4 text-blue-700" />
                <span>9. Phân loại Lưu trữ & Định vị Kho Vật lý (Thư viện HSTL):</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Thời hạn bảo quản:
                  </label>
                  <select
                    value={retentionPeriod}
                    onChange={(e) => setRetentionPeriod(e.target.value as RetentionPeriod)}
                    className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-blue-600 cursor-pointer"
                  >
                    <option value="VĨNH VIỄN">VĨNH VIỄN (Quyết định, Quy chế, Dự án)</option>
                    <option value="70 NĂM">70 NĂM (Hồ sơ cán bộ, nhân sự)</option>
                    <option value="50 NĂM">50 NĂM</option>
                    <option value="20 NĂM">20 NĂM (Hợp đồng, Báo cáo chuyên đề)</option>
                    <option value="10 NĂM">10 NĂM (Công văn chỉ đạo, kế hoạch)</option>
                    <option value="5 NĂM">5 NĂM (Thông báo, giấy mời, lịch công tác)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <span className="block text-[11px] font-bold text-slate-700 mb-1">
                    Định vị vị trí Kho 5 Cấp (Phòng/Ban/Đơn vị con - Kệ - Ngăn - Hộp/Cặp - Hồ sơ):
                  </span>
                  <PhysicalLocationSelector
                    value={physicalLocation}
                    onChange={setPhysicalLocation}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-3 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setIsIssuing(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-slate-900 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 shadow-sm cursor-pointer transition transform active:scale-98"
              >
                <CheckCircle className="w-4 h-4" />
                Lưu Vào Sổ Đi & Nhập Thư Viện HSTL
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Outgoing Register Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 bg-gray-50/80 border-b border-gray-200 space-y-3">
          {/* Top Row: Search, Type filter, Stats */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full lg:w-auto">
              {/* Search Input */}
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm số ký hiệu, trích yếu, người ký, nơi nhận..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Filter by Type */}
              <div className="w-full sm:w-auto">
                <select
                  value={selectedTypeFilter}
                  onChange={(e) => setSelectedTypeFilter(e.target.value)}
                  className="w-full sm:w-auto bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium focus:outline-none focus:border-blue-600 cursor-pointer"
                >
                  <option value="ALL">Tất cả loại văn bản</option>
                  <option value="QUYET_DINH">Quyết định</option>
                  <option value="CONG_VAN">Công văn</option>
                  <option value="THONG_BAO">Thông báo</option>
                  <option value="BIEN_BAN">Biên bản</option>
                  <option value="TO_TRINH">Tờ trình</option>
                  <option value="KE_HOACH">Kế hoạch</option>
                  <option value="BAO_CAO">Báo cáo</option>
                  <option value="HUONG_DAN">Hướng dẫn</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-600 font-medium w-full lg:w-auto justify-between lg:justify-end">
              <span>Sổ Văn bản Đi năm 2026:</span>
              <span className="text-blue-800 font-bold px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200">
                {filteredDocs.length} / {outgoingDocs.length} văn bản
              </span>
            </div>
          </div>

          {/* Bottom Row: Access Control Scope Tabs */}
          <div className="flex items-center gap-1.5 pt-1 border-t border-gray-200/70 overflow-x-auto text-xs">
            <span className="text-[11px] font-bold text-gray-500 mr-1 shrink-0 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              Lọc theo quyền xem:
            </span>
            <button
              type="button"
              onClick={() => setViewScopeFilter('ALL')}
              className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer shrink-0 ${
                viewScopeFilter === 'ALL'
                  ? 'bg-blue-700 text-white shadow-2xs'
                  : 'bg-gray-100 hover:bg-gray-200 text-slate-700'
              }`}
            >
              Tất cả ({outgoingDocs.length})
            </button>
            <button
              type="button"
              onClick={() => setViewScopeFilter('ACCESSIBLE_ONLY')}
              className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer shrink-0 flex items-center gap-1 ${
                viewScopeFilter === 'ACCESSIBLE_ONLY'
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}
            >
              <CheckCircle className="w-3 h-3" />
              <span>Được phép xem ({accessibleCount})</span>
            </button>
            {restrictedCount > 0 && (
              <button
                type="button"
                onClick={() => setViewScopeFilter('RESTRICTED_ONLY')}
                className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer shrink-0 flex items-center gap-1 ${
                  viewScopeFilter === 'RESTRICTED_ONLY'
                    ? 'bg-rose-700 text-white shadow-2xs'
                    : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200'
                }`}
              >
                <Lock className="w-3 h-3" />
                <span>Hạn chế quyền ({restrictedCount})</span>
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 min-w-[880px]">
            <thead className="bg-blue-50/80 text-[11px] uppercase tracking-wider text-blue-950 font-bold border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Số ký hiệu</th>
                <th className="py-3 px-4">Ngày ký</th>
                <th className="py-3 px-4">Trích yếu nội dung & Nơi nhận (Phân quyền)</th>
                <th className="py-3 px-4">Người ký & Đơn vị</th>
                <th className="py-3 px-4">Lưu HSTL</th>
                <th className="py-3 px-4">Bản sao</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500 font-medium">
                    Không tìm thấy văn bản đi nào phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => {
                  const access = canUserAccessOutgoingDoc(doc, currentUser);
                  const canManageRecipients = currentUser.role === 'VAN_THU' || currentUser.role === 'ADMIN';
                  const fullOcr = `${doc.soDiFullCode} ${doc.trichYeu} ${doc.donViSoanThao} ${doc.nguoiKy} ${doc.chucVuNguoiKy} ${doc.noiNhan} ${doc.loaiVanBanLabel}`;
                  const ocrSnippet = getOcrSnippet(fullOcr, searchTerm);
                  const matchedInOcr = searchTerm.trim() && ocrSnippet;

                  return (
                    <tr
                      key={doc.id}
                      className={`transition ${
                        !access.allowed
                          ? 'bg-rose-50/20 hover:bg-rose-50/40'
                          : 'hover:bg-blue-50/40'
                      }`}
                    >
                      <td className="py-3.5 px-4 whitespace-nowrap align-top">
                        <span className="font-mono font-bold text-blue-700 text-sm">
                          <HighlightText text={doc.soDiFullCode} search={searchTerm} />
                        </span>
                        <div className="text-[10px] text-gray-500 font-semibold mt-0.5">
                          {doc.loaiVanBanLabel}
                        </div>
                        {/* Access status badge */}
                        <div className="mt-1">
                          {access.allowed ? (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle className="w-2.5 h-2.5" /> Được xem
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              <Lock className="w-2.5 h-2.5" /> Hạn chế
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-700 font-medium whitespace-nowrap align-top">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span>{doc.ngayKy}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 max-w-md align-top">
                        {/* Title Display */}
                        {access.allowed ? (
                          <div className="line-clamp-2 text-slate-900 font-semibold leading-snug">
                            <HighlightText text={doc.trichYeu} search={searchTerm} />
                          </div>
                        ) : (
                          <div className="p-2 rounded-lg bg-rose-50/80 border border-rose-200/80 text-rose-950">
                            <div className="flex items-center gap-1.5 font-bold text-rose-800 text-[11px] mb-0.5">
                              <Lock className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                              <span>Nội dung giới hạn quyền truy cập</span>
                            </div>
                            <p className="text-[11px] text-gray-600 leading-relaxed">
                              Chỉ những người và đơn vị được chỉ định tại <strong>Nơi nhận</strong> mới được xem chi tiết tài liệu.
                            </p>
                          </div>
                        )}

                        {/* Nơi nhận & Structured Recipient Chips */}
                        <div className="mt-2 space-y-1">
                          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                            <Users className="w-3 h-3 text-blue-600" />
                            <span>Nơi nhận được xem:</span>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {/* Department chips */}
                            {doc.noiNhanDepartments && doc.noiNhanDepartments.length > 0 ? (
                              doc.noiNhanDepartments.map((dept, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-900 border border-blue-200 text-[10px] font-semibold"
                                  title={`Phòng ban được xem: ${dept}`}
                                >
                                  <Building2 className="w-2.5 h-2.5 text-blue-600" />
                                  <span>{dept}</span>
                                </span>
                              ))
                            ) : null}

                            {/* Individual leader chips */}
                            {doc.noiNhanUserNames && doc.noiNhanUserNames.length > 0 ? (
                              doc.noiNhanUserNames.map((uName, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-bold"
                                  title={`Cá nhân lãnh đạo được xem: ${uName}`}
                                >
                                  <Award className="w-2.5 h-2.5 text-amber-600" />
                                  <span>{uName}</span>
                                </span>
                              ))
                            ) : null}

                            {/* Legacy text if no structured chips */}
                            {(!doc.noiNhanDepartments || doc.noiNhanDepartments.length === 0) &&
                             (!doc.noiNhanUserNames || doc.noiNhanUserNames.length === 0) && doc.noiNhan ? (
                              <span className="text-[11px] text-gray-600 font-medium">
                                <HighlightText text={doc.noiNhan} search={searchTerm} />
                              </span>
                            ) : null}
                          </div>

                          {/* External recipients */}
                          {doc.noiNhanExternal && (
                            <div className="text-[10px] text-gray-500 font-medium truncate pt-0.5">
                              Ngoài cơ quan: <span className="text-gray-700">{doc.noiNhanExternal}</span>
                            </div>
                          )}
                        </div>

                        {/* OCR Match Snippet */}
                        {access.allowed && matchedInOcr && (
                          <div className="mt-2 p-1.5 rounded-lg bg-yellow-50 border border-yellow-200 text-[10px] text-slate-800 animate-fadeIn">
                            <div className="font-bold text-amber-900 flex items-center gap-1 mb-0.5">
                              <Sparkles className="w-3 h-3 text-amber-600 shrink-0" />
                              <span>Khớp nội dung văn bản:</span>
                            </div>
                            <div className="font-mono text-slate-700 leading-snug">
                              <HighlightText text={ocrSnippet} search={searchTerm} />
                            </div>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 align-top">
                        <div className="font-bold text-slate-900">
                          <HighlightText text={doc.nguoiKy} search={searchTerm} />
                        </div>
                        <span className="text-[10px] text-gray-500 font-medium block">
                          <HighlightText text={doc.chucVuNguoiKy} search={searchTerm} />
                        </span>
                        <span className="text-[10px] text-blue-700 font-medium block truncate max-w-[170px]">
                          <HighlightText text={doc.donViSoanThao} search={searchTerm} />
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap align-top">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 block w-fit mb-1">
                          {doc.retentionPeriod || 'VĨNH VIỄN'}
                        </span>
                        {doc.physicalLocation && (
                          <span className="text-[10px] text-gray-500 font-mono block">
                            {doc.physicalLocation.ke} - {doc.physicalLocation.hop}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap align-top">
                        <button
                          disabled={!access.allowed}
                          onClick={() => handleIssueElectronicCopy(doc)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition ${
                            access.allowed
                              ? 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 cursor-pointer'
                              : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed opacity-50'
                          }`}
                          title={access.allowed ? 'Cấp phát bản sao điện tử hợp lệ' : 'Bạn không có quyền cấp sao tài liệu này'}
                        >
                          <Share2 className="w-3 h-3" />
                          <span>Cấp sao ({doc.banSaoDienTuIssuedCount || 0})</span>
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap align-top space-y-1">
                        <div>
                          <button
                            onClick={() => handleDocClick(doc)}
                            className={`px-3 py-1.5 rounded-lg font-semibold text-xs inline-flex items-center gap-1 cursor-pointer transition shadow-2xs ${
                              access.allowed
                                ? 'bg-gray-100 hover:bg-gray-200 text-slate-700'
                                : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {access.allowed ? (
                              <Eye className="w-3.5 h-3.5 text-blue-600" />
                            ) : (
                              <Lock className="w-3.5 h-3.5 text-rose-600" />
                            )}
                            <span>{access.allowed ? 'Chi tiết' : 'Hạn chế xem'}</span>
                          </button>
                        </div>

                        {/* Button for Văn thư / Admin to edit recipient permissions */}
                        {canManageRecipients && (
                          <div>
                            <button
                              onClick={() => handleOpenEditRecipients(doc)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-[10px] font-bold inline-flex items-center gap-1 transition border border-gray-200 cursor-pointer"
                              title="Điều chỉnh phòng ban và cá nhân nơi nhận được phép xem"
                            >
                              <Edit3 className="w-3 h-3 text-blue-600" />
                              <span>Sửa nơi nhận</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Edit Recipients & Access Permissions (For Văn thư / Admin) */}
      {editingDocForRecipients && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-200" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">
                    Cập Nhật Nơi Nhận & Phân Quyền Xem Văn Bản Đi
                  </h3>
                  <p className="text-xs text-blue-200 font-mono">
                    Số ký hiệu: {editingDocForRecipients.soDiFullCode}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingDocForRecipients(null)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <strong>Chính sách bảo mật công tác văn thư:</strong> Chỉ những phòng ban nội bộ và các cá nhân (Giám đốc, Phó Giám đốc) được tích chọn dưới đây mới có quyền mở xem nội dung văn bản này.
                </div>
              </div>

              <div>
                <span className="block text-xs font-bold text-slate-700 mb-1">Trích yếu văn bản:</span>
                <p className="text-xs text-slate-800 bg-gray-50 p-2.5 rounded-lg border border-gray-200 font-medium">
                  {editingDocForRecipients.trichYeu}
                </p>
              </div>

              <OutgoingRecipientCombobox
                selectedDepts={editDepts}
                onChangeDepts={setEditDepts}
                selectedUserIds={editUserIds}
                onChangeUserIds={(ids, names) => {
                  setEditUserIds(ids);
                  setEditUserNames(names);
                }}
                externalRecipients={editExternal}
                onChangeExternal={setEditExternal}
                onFullTextGenerated={setEditCombinedText}
              />
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setEditingDocForRecipients(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:text-slate-900 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleSaveEditedRecipients}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 transition cursor-pointer shadow-sm flex items-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Lưu Phân Quyền Nơi Nhận</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Access Denied Alert (For Unauthorized Users) */}
      {accessDeniedModal.isOpen && accessDeniedModal.doc && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-rose-200 p-6 space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
              <Lock className="w-7 h-7" />
            </div>

            <div>
              <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200 mb-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                HẠN CHẾ QUYỀN TRUY CẬP
              </span>
              <h3 className="text-base font-bold text-slate-900">
                Không Có Quyền Xem Văn Bản Đi
              </h3>
              <p className="text-xs font-mono font-bold text-blue-700 mt-0.5">
                {accessDeniedModal.doc.soDiFullCode}
              </p>
            </div>

            <div className="text-left bg-rose-50/70 border border-rose-100 rounded-xl p-3.5 space-y-2 text-xs">
              <p className="text-rose-900 font-medium leading-relaxed">
                {accessDeniedModal.reason || 'Văn bản này chỉ phân quyền cho đơn vị và cá nhân được chọn tại Nơi nhận.'}
              </p>

              <div className="pt-2 border-t border-rose-200 space-y-1 text-[11px]">
                <div className="font-bold text-slate-800">Đối tượng được cấp phép xem:</div>
                {accessDeniedModal.allowedDepartments && accessDeniedModal.allowedDepartments.length > 0 && (
                  <div>
                    <span className="text-gray-500">Phòng ban: </span>
                    <span className="font-semibold text-blue-900">
                      {accessDeniedModal.allowedDepartments.join(', ')}
                    </span>
                  </div>
                )}
                {accessDeniedModal.allowedUsers && accessDeniedModal.allowedUsers.length > 0 && (
                  <div>
                    <span className="text-gray-500">Lãnh đạo: </span>
                    <span className="font-semibold text-rose-900">
                      {accessDeniedModal.allowedUsers.join(', ')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="text-left bg-slate-50 border border-gray-200 rounded-xl p-3 text-[11px] text-gray-600 space-y-1">
              <div className="flex items-center justify-between">
                <span>Tài khoản hiện tại:</span>
                <span className="font-bold text-slate-900">{currentUser.name} ({currentUser.roleTitle})</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Đơn vị công tác:</span>
                <span className="font-semibold text-slate-800">{currentUser.department}</span>
              </div>
              <p className="text-gray-500 pt-1 border-t border-gray-200 text-[10px]">
                💡 <em>Để kiểm tra quyền xem, bạn có thể bấm nút "Chuyển vai trò" ở thanh tiêu đề phía trên để đăng nhập với tư cách Giám đốc hoặc chuyên viên phòng ban có trong Nơi nhận.</em>
              </p>
            </div>

            <div className="pt-1 flex justify-end">
              <button
                type="button"
                onClick={() => setAccessDeniedModal({ isOpen: false })}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer"
              >
                Đã Hiểu & Đóng Lại
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
