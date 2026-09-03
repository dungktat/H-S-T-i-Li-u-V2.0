import React, { useState, useEffect } from 'react';
import { ExistingDocument, UserProfile, RetentionPeriod, PhysicalLocation } from '../../types';
import { StorageService } from '../../services/storageService';
import { OcrScanModal } from './OcrScanModal';
import { PhysicalLocationSelector } from './PhysicalLocationSelector';
import { IssuingAgencyCombobox } from './IssuingAgencyCombobox';
import { DynamicMetadataFields } from './DynamicMetadataFields';
import { 
  FolderPlus, 
  UploadCloud, 
  CheckCircle2, 
  FileText, 
  ShieldCheck, 
  Sparkles, 
  X, 
  Building2, 
  Calendar, 
  Tag, 
  UserCheck, 
  Layers, 
  Archive, 
  Hash, 
  CheckCircle, 
  FileCheck2,
  FileQuestion,
  Wand2,
  Lock
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CreateNewDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onSuccess?: (doc: ExistingDocument) => void;
}

export const CreateNewDossierModal: React.FC<CreateNewDossierModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSuccess
}) => {
  // Document Type: false = Chưa có dấu (Trình duyệt), true = Đã có con dấu đỏ (Nhập HSTL)
  const [hasStamp, setHasStamp] = useState<boolean>(false);
  
  // Master Users list
  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => StorageService.getUsers());

  // Basic Metadata
  const [soKyHieu, setSoKyHieu] = useState('');
  const [coQuanBanHanh, setCoQuanBanHanh] = useState('Ban Kỹ thuật - Hạ tầng Cơ sở');
  const [ngayBanHanh, setNgayBanHanh] = useState(new Date().toISOString().split('T')[0]);
  const [loaiVanBan, setLoaiVanBan] = useState('Tờ trình');
  const [trichYeu, setTrichYeu] = useState('');
  const [securityLevel, setSecurityLevel] = useState<'THƯỜNG' | 'MẬT'>('THƯỜNG');
  const [selectedReviewerId, setSelectedReviewerId] = useState('user_tp_1');
  const [customMetadata, setCustomMetadata] = useState<Record<string, any>>({});

  useEffect(() => {
    const handleStateChange = (e: any) => {
      if (e?.detail?.type === 'users' || e?.detail?.type === 'all_reset') {
        const uList = StorageService.getUsers();
        setAllUsers(uList);
      }
    };
    window.addEventListener('hstl_state_change', handleStateChange);
    return () => window.removeEventListener('hstl_state_change', handleStateChange);
  }, []);

  // Archive metadata (for stamped documents)
  const [retentionPeriod, setRetentionPeriod] = useState<RetentionPeriod>('VĨNH VIỄN');
  const [physicalLocation, setPhysicalLocation] = useState<PhysicalLocation>({
    kho: 'Kho Lưu trữ Tổng Hợp Số 1',
    ke: 'Kệ K-01',
    ngan: 'Ngăn N-03',
    hop: 'Hộp H-08',
    maVach: 'HSTL-K1-K01-N03-H08'
  });

  // Attached File & OCR
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string; type: string } | null>(null);
  const [ocrText, setOcrText] = useState('');
  const [ocrConfidence, setOcrConfidence] = useState<number>(0);
  const [ocrModalOpen, setOcrModalOpen] = useState(false);

  if (!isOpen) return null;

  // Quick Auto Generate Code
  const handleAutoGenerateCode = () => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 899) + 100;
    const prefix = hasStamp ? 'QĐ-ĐSVN' : 'TTr-KTHT';
    setSoKyHieu(`${randomNum}/${prefix}/${year}`);
  };

  // 1-Click Sample Preset
  const handleSelectSample = (
    isStamped: boolean,
    code: string,
    org: string,
    type: string,
    summary: string,
    fileName: string,
    confidence: number,
    presetMeta?: Record<string, any>
  ) => {
    setHasStamp(isStamped);
    setSoKyHieu(code);
    setCoQuanBanHanh(org);
    setLoaiVanBan(type);
    setTrichYeu(summary);
    if (presetMeta) {
      setCustomMetadata(presetMeta);
    } else {
      setCustomMetadata({});
    }
    setUploadedFile({
      name: fileName,
      size: '3.4 MB',
      type: 'application/pdf'
    });
    setOcrConfidence(confidence);
    setOcrText(`Số: ${code}\nĐơn vị ban hành: ${org}\nNgày: ${ngayBanHanh}\nTrích yếu nội dung: ${summary}\nLoại văn bản: ${type}\n[Trích xuất OCR AI đạt độ tin cậy ${confidence}%]`);
  };

  // Handle File Change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile({
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
        type: file.type || 'application/pdf'
      });
      if (hasStamp) {
        setOcrModalOpen(true);
      }
    }
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!soKyHieu.trim() || !coQuanBanHanh.trim() || !trichYeu.trim()) {
      alert('Vui lòng điền đầy đủ các mục: Số ký hiệu/Mã hồ sơ, Đơn vị ban hành và Trích yếu nội dung!');
      return;
    }

    const reviewer = allUsers.find(u => u.id === selectedReviewerId) || allUsers[1] || allUsers[0];

    const newDoc: ExistingDocument = {
      id: 'hstl-ex-' + Date.now(),
      soKyHieu: soKyHieu.trim(),
      coQuanBanHanh: coQuanBanHanh.trim(),
      ngayBanHanh,
      trichYeu: trichYeu.trim(),
      loaiVanBan,
      hasStamp,
      fileScanUrl: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=800&auto=format&fit=crop&q=80',
      fileName: uploadedFile?.name || `${soKyHieu.replace(/\//g, '_')}_${hasStamp ? 'ScanDauDo' : 'ChuaDau'}.pdf`,
      fileSize: uploadedFile?.size || '3.2 MB',
      fileType: uploadedFile?.type || 'application/pdf',
      ocrText: ocrText || `Số: ${soKyHieu}\nĐơn vị: ${coQuanBanHanh}\nNgày: ${ngayBanHanh}\nTrích yếu: ${trichYeu}\n[Tài liệu ${hasStamp ? 'đã có con dấu đỏ' : 'chưa có dấu - trình duyệt'}]`,
      ocrExtracted: {
        soKyHieu,
        coQuan: coQuanBanHanh,
        ngayBanHanh,
        trichYeu,
        hasRedSeal: hasStamp,
        confidence: ocrConfidence || 98.5
      },
      createdBy: currentUser.id,
      createdByName: currentUser.name,
      createdAt: new Date().toISOString(),
      assignedReviewerId: reviewer.id,
      assignedReviewerName: reviewer.name,
      status: hasStamp ? 'ARCHIVED' : 'PENDING_REVIEW',
      securityLevel,
      retentionPeriod: hasStamp ? retentionPeriod : undefined,
      physicalLocation: hasStamp ? physicalLocation : undefined,
      archivedAt: hasStamp ? new Date().toISOString() : undefined,
      archivedBy: hasStamp ? currentUser.id : undefined,
      archivedByName: hasStamp ? currentUser.name : undefined,
      customMetadata: Object.keys(customMetadata).length > 0 ? customMetadata : undefined
    };

    StorageService.addExistingDoc(newDoc);
    
    try {
      confetti({ particleCount: 50, spread: 70 });
    } catch (e) {}

    if (onSuccess) {
      onSuccess(newDoc);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[94dvh] my-auto text-slate-800 animate-scaleUp">
        
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 bg-gradient-to-r from-[#003882] via-[#094ba1] to-[#002f70] text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 text-white shadow-inner">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold uppercase tracking-wide text-white">
                Cập Nhật Hồ Sơ Tài Liệu Mới (HSTL)
              </h3>
              <p className="text-[11px] sm:text-xs text-blue-100 font-medium">
                Nhập văn bản, quyết định, tờ trình vào Thư viện số hóa &amp; Lưu trữ HSTL
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-blue-100 hover:text-white hover:bg-white/15 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-[#f8fafc]">
          
          {/* Section 1: Phân loại tính pháp lý (Chưa có dấu VS Đã có con dấu đỏ) */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-blue-700" />
                1. Phân loại tính pháp lý của hồ sơ / tài liệu:
              </label>
              <span className="text-[11px] text-gray-500 italic">Bắt buộc chọn 1 trong 2 luồng</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option A: Chưa có dấu */}
              <button
                type="button"
                onClick={() => setHasStamp(false)}
                className={`p-3.5 rounded-xl border text-left transition flex items-start gap-3 cursor-pointer ${
                  !hasStamp
                    ? 'bg-amber-50/80 border-amber-400 text-slate-900 ring-2 ring-amber-400/40 shadow-xs'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className={`p-2 rounded-lg shrink-0 ${!hasStamp ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  <FileQuestion className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold flex items-center gap-1.5">
                    📝 Tài liệu CHƯA CÓ DẤU (Trình duyệt)
                  </div>
                  <div className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                    Tờ trình, phương án kỹ thuật, dự thảo biên bản... ➔ Chuyển Trưởng phòng thẩm định, in phiếu trình Lãnh đạo ký duyệt.
                  </div>
                </div>
              </button>

              {/* Option B: Đã có con dấu đỏ */}
              <button
                type="button"
                onClick={() => setHasStamp(true)}
                className={`p-3.5 rounded-xl border text-left transition flex items-start gap-3 cursor-pointer ${
                  hasStamp
                    ? 'bg-red-50/80 border-red-400 text-slate-900 ring-2 ring-red-400/40 shadow-xs'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className={`p-2 rounded-lg shrink-0 ${hasStamp ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold flex items-center gap-1.5 text-red-950">
                    Tài liệu ĐÃ CÓ CON DẤU ĐỎ
                  </div>
                  <div className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                    Văn bản đã ban hành chính thức, có chữ ký &amp; dấu mộc ➔ OCR bóc tách, chọn vị trí Kho &amp; Lưu trữ HSTL ngay.
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Quick 1-Click Samples */}
          <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                <Wand2 className="w-3.5 h-3.5 text-blue-700" />
                Gợi ý dữ liệu mẫu nhanh (1-Click Preset):
              </span>
              <span className="text-[10px] text-blue-700 font-semibold">Thử nghiệm tiện lợi</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleSelectSample(
                  false,
                  '142/TTr-KTHT',
                  'Ban Kỹ thuật - Hạ tầng Cơ sở',
                  'Tờ trình',
                  'Tờ trình về việc thẩm định phương án kỹ thuật nâng cấp ray đường sắt đoạn Hà Nội - Vinh',
                  'ToTrinh_142_ChuaDau.pdf',
                  98.2,
                  { nguoiLapToTrinh: 'Nguyễn Văn Cường', capTrinh: 'Trình Tổng Giám Đốc', yKienTrinh: 'Đề nghị xem xét phê duyệt' }
                )}
                className="text-left p-2 rounded-lg bg-white border border-blue-200 hover:border-blue-400 text-slate-800 text-[11px] hover:bg-blue-50/80 transition cursor-pointer"
              >
                <div className="font-bold text-amber-800">Mẫu 1: Tờ trình phương án</div>
                <div className="text-[10px] text-gray-500 truncate">142/TTr-KTHT • Chưa dấu</div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectSample(
                  true,
                  '89/QĐ-ĐSVN',
                  'Tổng công ty Đường sắt Việt Nam',
                  'Quyết định',
                  'Quyết định phê duyệt hồ sơ hoàn công gói thầu sửa chữa định kỳ cầu Long Biên',
                  'QuyetDinh_89_DauDo.pdf',
                  99.1,
                  { nguoiKy: 'Đặng Sỹ Mạnh', chucVuNguoiKy: 'Tổng Giám Đốc', hieuLucTuNgay: '2026-04-10' }
                )}
                className="text-left p-2 rounded-lg bg-white border border-blue-200 hover:border-blue-400 text-slate-800 text-[11px] hover:bg-blue-50/80 transition cursor-pointer"
              >
                <div className="font-bold text-red-800">Mẫu 2: Quyết định hoàn công</div>
                <div className="text-[10px] text-gray-500 truncate">89/QĐ-ĐSVN • Có dấu đỏ</div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectSample(
                  true,
                  'HĐ-2026/45-VNR',
                  'Tổng công ty Đường sắt Việt Nam',
                  'Hợp đồng kinh tế',
                  'Hợp đồng kinh tế bảo dưỡng định kỳ và cung cấp tà vẹt bê tông dự ứng lực tuyến Bắc - Nam',
                  'HopDong_2026_45_BaoDuong.pdf',
                  99.4,
                  { 
                    giaTriHopDong: 15800000000, 
                    thoiHanThucHien: '12 tháng', 
                    benA: 'Tổng công ty Đường sắt Việt Nam', 
                    benB: 'Công ty CP Cơ khí Cầu đường',
                    hinhThucHopDong: 'Trọn gói'
                  }
                )}
                className="text-left p-2 rounded-lg bg-white border border-emerald-200 hover:border-emerald-400 text-slate-800 text-[11px] hover:bg-emerald-50/80 transition cursor-pointer"
              >
                <div className="font-bold text-emerald-800">Mẫu 3: Hợp đồng kinh tế</div>
                <div className="text-[10px] text-emerald-700 truncate">💰 15.8 Tỷ VNĐ • Metadata Động</div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectSample(
                  true,
                  'TK-KT-2026/18',
                  'CTCP Tư vấn Đầu tư & Xây dựng GTVT',
                  'Hồ sơ thiết kế',
                  'Hồ sơ thiết kế bản vẽ thi công nâng cấp hệ thống tín hiệu đường ngang tự động',
                  'ThietKe_TinHieu_DuongNgang.pdf',
                  98.9,
                  { 
                    nguoiThietKe: 'KTS. Lê Hồng Phong', 
                    chuTriThietKe: 'KS. Trần Quốc Tuấn', 
                    giaiDoanThietKe: 'Thiết kế bản vẽ thi công', 
                    tyLeBanVe: '1/200' 
                  }
                )}
                className="text-left p-2 rounded-lg bg-white border border-purple-200 hover:border-purple-400 text-slate-800 text-[11px] hover:bg-purple-50/80 transition cursor-pointer"
              >
                <div className="font-bold text-purple-800">Mẫu 4: Hồ sơ thiết kế</div>
                <div className="text-[10px] text-purple-700 truncate">📐 KTS. Lê Hồng Phong</div>
              </button>
            </div>
          </div>

          {/* Section 2: Metadata Fields */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-700" />
              2. Thông tin trích yếu &amp; Cơ quan ban hành
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Số ký hiệu */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    Số ký hiệu / Mã HSTL <span className="text-red-600">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAutoGenerateCode}
                    className="text-[10px] font-bold text-blue-700 hover:underline flex items-center gap-0.5"
                  >
                    <Sparkles className="w-3 h-3" /> Tự sinh mã
                  </button>
                </div>
                <input
                  type="text"
                  value={soKyHieu}
                  onChange={(e) => setSoKyHieu(e.target.value)}
                  placeholder="Ví dụ: 142/TTr-KTHT hoặc 89/QĐ-ĐSVN"
                  className="w-full text-xs font-mono font-bold px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                  required
                />
              </div>

              {/* Loại văn bản */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Loại văn bản / Hồ sơ <span className="text-red-600">*</span>
                </label>
                <select
                  value={loaiVanBan}
                  onChange={(e) => setLoaiVanBan(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white font-medium"
                >
                  <option value="Tờ trình">Tờ trình</option>
                  <option value="Quyết định">Quyết định</option>
                  <option value="Biên bản nghiệm thu">Biên bản nghiệm thu</option>
                  <option value="Phương án kỹ thuật">Phương án kỹ thuật</option>
                  <option value="Báo cáo kỹ thuật">Báo cáo kỹ thuật</option>
                  <option value="Bản vẽ hoàn công">Bản vẽ hoàn công</option>
                  <option value="Hợp đồng kinh tế">Hợp đồng kinh tế</option>
                  <option value="Công văn">Công văn</option>
                  <option value="Hồ sơ thiết kế">Hồ sơ thiết kế</option>
                </select>
              </div>

              {/* Cơ quan ban hành */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Cơ quan / Đơn vị ban hành <span className="text-red-600">*</span>
                </label>
                <IssuingAgencyCombobox
                  value={coQuanBanHanh}
                  onChange={setCoQuanBanHanh}
                  placeholder="Chọn hoặc nhập đơn vị ban hành..."
                  required
                />
              </div>

              {/* Ngày ban hành */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ngày ban hành / Ngày lập <span className="text-red-600">*</span>
                </label>
                <input
                  type="date"
                  value={ngayBanHanh}
                  onChange={(e) => setNgayBanHanh(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                  required
                />
              </div>
            </div>

            {/* Trích yếu */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Trích yếu nội dung hồ sơ tài liệu <span className="text-red-600">*</span>
              </label>
              <textarea
                rows={3}
                value={trichYeu}
                onChange={(e) => setTrichYeu(e.target.value)}
                placeholder="Nhập tóm tắt trích yếu nội dung hồ sơ, phương án, quyết định hoặc biên bản..."
                className="w-full text-xs p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                required
              />
            </div>

            <div className="space-y-2 pt-2">
              <label className="block text-xs font-bold text-slate-700">
                Độ mật tài liệu (Chỉ 2 chế độ): <span className="text-red-600">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSecurityLevel('THƯỜNG')}
                  className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 cursor-pointer ${
                    securityLevel === 'THƯỜNG'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-300 shadow-xs'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-emerald-900">Chế độ THƯỜNG (Công khai)</div>
                    <div className="text-[10px] text-gray-500 mt-0.5">Vào Thư viện HSTL ai cũng được xem</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSecurityLevel('MẬT')}
                  className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 cursor-pointer ${
                    securityLevel === 'MẬT'
                      ? 'bg-rose-50 border-rose-500 text-rose-950 ring-2 ring-rose-300 shadow-xs'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Lock className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-rose-900">Chế độ MẬT (Phân quyền bảo mật)</div>
                    <div className="text-[10px] text-gray-500 mt-0.5">Trưởng phòng tick chọn cá nhân/đơn vị xem</div>
                  </div>
                </button>
              </div>
            </div>

            <div className="pt-2">
              {/* Người kiểm tra / Trưởng phòng (Nếu là tài liệu chưa có dấu) */}
              {!hasStamp ? (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Trưởng phòng kiểm tra / Thẩm định <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={selectedReviewerId}
                    onChange={(e) => setSelectedReviewerId(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-amber-300 bg-amber-50/50 focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold text-slate-800"
                  >
                    {allUsers.filter(u => u.role === 'TRUONG_PHONG' || u.role === 'ADMIN').map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name} — {u.roleTitle} ({u.department})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Thời hạn bảo quản hồ sơ (NĐ 30/2020)
                  </label>
                  <select
                    value={retentionPeriod}
                    onChange={(e: any) => setRetentionPeriod(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-emerald-300 bg-emerald-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-emerald-900"
                  >
                    <option value="VĨNH VIỄN">Vĩnh viễn (Hồ sơ trọng yếu)</option>
                    <option value="70 NĂM">70 Năm</option>
                    <option value="50 NĂM">50 Năm</option>
                    <option value="20 NĂM">20 Năm</option>
                    <option value="10 NĂM">10 Năm</option>
                    <option value="5 NĂM">5 Năm</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Section 2.5: Dynamic Metadata Fields (Admin-Configured Schema Engine) */}
          <DynamicMetadataFields
            docType={loaiVanBan}
            values={customMetadata}
            onChange={setCustomMetadata}
          />

          {/* Section 3: Định vị kho vật lý nếu là tài liệu có dấu đỏ */}
          {hasStamp && (
            <div className="bg-white border border-emerald-200 rounded-xl p-4 shadow-xs space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                <Archive className="w-4 h-4 text-emerald-700" />
                3. Tọa độ lưu trữ Kho vật lý (Kho ➔ Kệ ➔ Ngăn ➔ Hộp)
              </h4>
              <PhysicalLocationSelector
                value={physicalLocation}
                onChange={(loc) => setPhysicalLocation(loc)}
              />
            </div>
          )}

          {/* Section 4: File Upload & OCR */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <UploadCloud className="w-4 h-4 text-blue-700" />
              {hasStamp ? '4. Tải Tệp Scan Dấu Đỏ & Bóc Tách OCR' : '3. Tải Tệp Dự Thảo / Tờ Trình (PDF, DOCX)'}
            </h4>

            <div className="border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-xl p-4 text-center bg-gray-50/60 transition">
              <input
                type="file"
                id="modal-dossier-upload"
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              <label htmlFor="modal-dossier-upload" className="cursor-pointer block">
                <UploadCloud className="w-8 h-8 text-blue-600 mx-auto mb-1.5" />
                <span className="text-xs font-bold text-blue-700 hover:underline">
                  Bấm để chọn tệp tài liệu từ máy tính
                </span>
                <span className="text-xs text-gray-500 block mt-0.5">
                  hoặc kéo thả tệp PDF, DOCX, Ảnh scan vào đây
                </span>
              </label>

              {uploadedFile && (
                <div className="mt-3 inline-flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded-lg text-xs font-medium text-blue-900">
                  <FileText className="w-4 h-4 text-blue-700 shrink-0" />
                  <span>{uploadedFile.name} ({uploadedFile.size})</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  {hasStamp && (
                    <button
                      type="button"
                      onClick={() => setOcrModalOpen(true)}
                      className="ml-2 px-2 py-0.5 bg-blue-600 text-white rounded text-[10px] font-bold hover:bg-blue-700"
                    >
                      Bóc tách AI OCR
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

        </form>

        {/* Modal Bottom Actions */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-gray-100 border-t border-gray-200 shrink-0">
          <div className="text-[11px] text-gray-500 font-medium">
            Người cập nhật: <strong>{currentUser.name}</strong> ({currentUser.roleTitle})
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-gray-200 border border-gray-300 transition cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className={`flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md transition cursor-pointer ${
                hasStamp ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-blue-700 hover:bg-blue-800'
              }`}
            >
              <FolderPlus className="w-4 h-4" />
              {hasStamp ? 'Hoàn tất & Nhập Kho HSTL' : 'Lưu & Chuyển Trưởng Phòng Duyệt'}
            </button>
          </div>
        </div>

      </div>

      {/* OCR Scan Modal Integration */}
      <OcrScanModal
        isOpen={ocrModalOpen}
        onClose={() => setOcrModalOpen(false)}
        imageSrc={uploadedFile ? 'https://images.unsplash.com/photo-1568667256549-094345857637?w=800&auto=format&fit=crop&q=80' : ''}
        onApplyData={(data) => {
          if (data.soKyHieu) setSoKyHieu(data.soKyHieu);
          if (data.coQuanBanHanh) setCoQuanBanHanh(data.coQuanBanHanh);
          if (data.ngayBanHanh) setNgayBanHanh(data.ngayBanHanh);
          if (data.trichYeu) setTrichYeu(data.trichYeu);
          if (data.loaiVanBan) setLoaiVanBan(data.loaiVanBan);
          setOcrConfidence(data.confidence || 98.5);
          setOcrModalOpen(false);
        }}
      />
    </div>
  );
};
