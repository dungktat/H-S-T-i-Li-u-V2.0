import React, { useState } from 'react';
import { ExistingDocument, UserProfile, RetentionPeriod, PhysicalLocation, CoordinationFeedback, SecretAccessPermissions } from '../../../types';
import { StorageService } from '../../../services/storageService';
import { SAMPLE_USERS } from '../../../data/initialData';
import { OcrScanModal } from '../../common/OcrScanModal';
import { IssuingAgencyCombobox } from '../../common/IssuingAgencyCombobox';
import { Luong1ReviewModal } from './Luong1ReviewModal';
import { Luong1PrintLeaderModal } from './Luong1PrintLeaderModal';
import { Luong1LeaderSignedModal } from './Luong1LeaderSignedModal';
import { Luong1VanThuArchiveModal } from './Luong1VanThuArchiveModal';
import { HighlightText, getOcrSnippet, matchesQuery } from '../../../utils/highlight';
import { 
  FolderPlus, 
  UploadCloud, 
  CheckCircle2, 
  Clock, 
  Eye, 
  FileText, 
  ShieldCheck, 
  Send, 
  AlertCircle, 
  Search, 
  Sparkles,
  Archive,
  CheckCircle,
  XCircle,
  Users,
  Printer,
  FileQuestion,
  Tag,
  Lock,
  Building2,
  Filter,
  MessageSquare
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Luong1ModuleProps {
  currentUser: UserProfile;
  onOpenViewer: (doc: ExistingDocument, searchKeyword?: string) => void;
}

export const Luong1Module: React.FC<Luong1ModuleProps> = ({ currentUser, onOpenViewer }) => {
  const [docs, setDocs] = useState<ExistingDocument[]>(StorageService.getExistingDocs());
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterSecurity, setFilterSecurity] = useState<'ALL' | 'THƯỜNG' | 'MẬT'>('ALL');

  // Form State for Step 1
  const [hasStampType, setHasStampType] = useState<boolean>(false); // Default to "Chưa có dấu"
  const [soKyHieu, setSoKyHieu] = useState('');
  const [coQuanBanHanh, setCoQuanBanHanh] = useState('Ban Kỹ thuật - Hạ tầng Cơ sở');
  const [ngayBanHanh, setNgayBanHanh] = useState(new Date().toISOString().split('T')[0]);
  const [trichYeu, setTrichYeu] = useState('');
  const [loaiVanBan, setLoaiVanBan] = useState('Tờ trình');
  const [securityLevel, setSecurityLevel] = useState<'THƯỜNG' | 'MẬT'>('THƯỜNG');
  const [selectedReviewerId, setSelectedReviewerId] = useState('user_tp_1');
  const [submissionComment, setSubmissionComment] = useState(''); // Comment của người trình khi trình TP (tùy chọn)
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string; type: string } | null>(null);
  const [ocrText, setOcrText] = useState('');
  const [ocrModalOpen, setOcrModalOpen] = useState(false);
  const [ocrConfidence, setOcrConfidence] = useState<number>(0);

  // Modals
  const [reviewingDoc, setReviewingDoc] = useState<ExistingDocument | null>(null);
  const [printingDoc, setPrintingDoc] = useState<ExistingDocument | null>(null);
  const [leaderSignedDoc, setLeaderSignedDoc] = useState<ExistingDocument | null>(null);
  const [vanThuArchivingDoc, setVanThuArchivingDoc] = useState<ExistingDocument | null>(null);

  const reloadData = () => {
    setDocs(StorageService.getExistingDocs());
  };

  // Step 1: Submit Document (Chuyên viên)
  const handleSubmitStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!soKyHieu.trim() || !coQuanBanHanh.trim() || !trichYeu.trim()) {
      alert('Vui lòng điền đầy đủ các thông tin bắt buộc: Số ký hiệu/Mã hồ sơ, Đơn vị ban hành, Trích yếu!');
      return;
    }

    const reviewer = SAMPLE_USERS.find(u => u.id === selectedReviewerId) || SAMPLE_USERS[1];

    const newDoc: ExistingDocument = {
      id: 'hstl-ex-' + Date.now(),
      soKyHieu: soKyHieu.trim(),
      coQuanBanHanh: coQuanBanHanh.trim(),
      ngayBanHanh,
      trichYeu: trichYeu.trim(),
      loaiVanBan,
      hasStamp: hasStampType,
      fileScanUrl: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=800&auto=format&fit=crop&q=80',
      fileName: uploadedFile?.name || `${soKyHieu.replace(/\//g, '_')}_${hasStampType ? 'ScanDauDo' : 'ChuaDau'}.pdf`,
      fileSize: uploadedFile?.size || '3.2 MB',
      fileType: uploadedFile?.type || 'application/pdf',
      ocrText: ocrText || `Số: ${soKyHieu}\nĐơn vị: ${coQuanBanHanh}\nNgày: ${ngayBanHanh}\nTrích yếu: ${trichYeu}\n[Tài liệu ${hasStampType ? 'đã có con dấu đỏ' : 'chưa có dấu - trình duyệt'}]`,
      ocrExtracted: {
        soKyHieu,
        coQuan: coQuanBanHanh,
        ngayBanHanh,
        trichYeu,
        hasRedSeal: hasStampType,
        confidence: ocrConfidence || 98.5
      },
      createdBy: currentUser.id,
      createdByName: currentUser.name,
      createdAt: new Date().toISOString(),
      assignedReviewerId: reviewer.id,
      assignedReviewerName: reviewer.name,
      submissionComment: submissionComment.trim() || undefined,
      status: 'PENDING_REVIEW',
      securityLevel: securityLevel
    };

    StorageService.addExistingDoc(newDoc);
    reloadData();
    setIsCreating(false);
    resetForm();

    try {
      confetti({ particleCount: 30, spread: 50 });
    } catch (err) {}
  };

  const resetForm = () => {
    setSoKyHieu('');
    setCoQuanBanHanh('Ban Kỹ thuật - Hạ tầng Cơ sở');
    setTrichYeu('');
    setUploadedFile(null);
    setOcrText('');
    setOcrConfidence(0);
    setHasStampType(false);
    setSecurityLevel('THƯỜNG');
    setSubmissionComment('');
  };

  // Trưởng phòng Thẩm tra / Phê duyệt
  const handleApproveReview = (
    doc: ExistingDocument, 
    note: string, 
    extra?: { 
      securityLevel: 'THƯỜNG' | 'MẬT'; 
      secretAccessPermissions?: SecretAccessPermissions;
      forwardToVanThu?: boolean;
    }
  ) => {
    const nextStatus = extra?.forwardToVanThu ? 'PENDING_VAN_THU' : 'REVIEW_APPROVED';

    StorageService.updateExistingDoc(doc.id, {
      status: nextStatus,
      reviewNote: note,
      reviewedAt: new Date().toISOString(),
      assignedReviewerName: currentUser.name,
      securityLevel: extra?.securityLevel || doc.securityLevel || 'THƯỜNG',
      secretAccessPermissions: extra?.secretAccessPermissions
    });
    setReviewingDoc(null);
    reloadData();
    try {
      confetti({ particleCount: 40, spread: 60 });
    } catch (e) {}
  };

  // Trưởng phòng Trả lại
  const handleRejectReview = (doc: ExistingDocument, reason: string) => {
    StorageService.updateExistingDoc(doc.id, {
      status: 'REJECTED',
      reviewNote: reason,
      reviewedAt: new Date().toISOString()
    });
    setReviewingDoc(null);
    reloadData();
  };

  // Trưởng phòng Chuyển phối hợp
  const handleCoordinate = (doc: ExistingDocument, note: string, coords: CoordinationFeedback[]) => {
    StorageService.updateExistingDoc(doc.id, {
      status: 'COORDINATING',
      reviewNote: note,
      coordinations: coords,
      reviewedAt: new Date().toISOString()
    });
    setReviewingDoc(null);
    reloadData();
  };

  // Văn thư Phê duyệt & Đưa vào Thư viện HSTL
  const handleVanThuArchive = (
    doc: ExistingDocument, 
    archiveData: {
      retentionPeriod: RetentionPeriod;
      physicalLocation: PhysicalLocation;
    }
  ) => {
    StorageService.updateExistingDoc(doc.id, {
      status: 'ARCHIVED',
      retentionPeriod: archiveData.retentionPeriod,
      physicalLocation: archiveData.physicalLocation,
      archivedAt: new Date().toISOString(),
      archivedBy: currentUser.id,
      archivedByName: currentUser.name
    });
    setVanThuArchivingDoc(null);
    reloadData();
  };

  // Hoàn tất In xuất bản & Trình Lãnh đạo
  const handleConfirmPrinted = (doc: ExistingDocument, printedInfo: any) => {
    StorageService.updateExistingDoc(doc.id, {
      status: 'PRINTED_FOR_LEADER',
      printedInfo
    });
    setPrintingDoc(null);
    reloadData();
    try {
      confetti({ particleCount: 40, spread: 60 });
    } catch (e) {}
  };

  // Hoàn tất Lãnh đạo ký & Nhập HSTL
  const handleArchiveLeaderSigned = (doc: ExistingDocument, data: any) => {
    StorageService.updateExistingDoc(doc.id, {
      status: 'ARCHIVED',
      retentionPeriod: data.retentionPeriod,
      physicalLocation: data.physicalLocation,
      leaderSignedInfo: data.leaderSignedInfo,
      archivedAt: new Date().toISOString(),
      archivedBy: currentUser.id,
      archivedByName: currentUser.name
    });
    setLeaderSignedDoc(null);
    reloadData();
    try {
      confetti({ particleCount: 60, spread: 80 });
    } catch (e) {}
  };

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile({
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
        type: file.type || 'application/pdf'
      });
      if (hasStampType) {
        setOcrModalOpen(true);
      }
    }
  };

  const filteredDocs = docs.filter(doc => {
    const matchesSearch = matchesQuery(
      searchTerm,
      doc.soKyHieu,
      doc.coQuanBanHanh,
      doc.trichYeu,
      doc.loaiVanBan,
      doc.ocrText || (doc as any).ocrExtracted?.fullOcrText
    );

    const matchesStatus =
      filterStatus === 'ALL' ? true :
      filterStatus === 'UNSEALED' ? (!doc.hasStamp && doc.status !== 'ARCHIVED') :
      filterStatus === 'PENDING_REVIEW' ? doc.status === 'PENDING_REVIEW' :
      filterStatus === 'PENDING_VAN_THU' ? doc.status === 'PENDING_VAN_THU' :
      filterStatus === 'COORDINATING' ? doc.status === 'COORDINATING' :
      filterStatus === 'REVIEW_APPROVED' ? doc.status === 'REVIEW_APPROVED' :
      filterStatus === 'PRINTED_FOR_LEADER' ? doc.status === 'PRINTED_FOR_LEADER' :
      filterStatus === 'ARCHIVED' ? doc.status === 'ARCHIVED' :
      filterStatus === 'REJECTED' ? doc.status === 'REJECTED' : true;

    const matchesSec =
      filterSecurity === 'ALL' ? true : (doc.securityLevel || 'THƯỜNG') === filterSecurity;

    return matchesSearch && matchesStatus && matchesSec;
  });

  return (
    <div className="space-y-6 text-slate-800">
      
      {/* Banner / Header Controls */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-gray-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                QUẢN LÝ TÀI LIỆU
              </span>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Cập Nhật Hồ Sơ Vào Thư Viện HSTL
              </h2>
            </div>
            <p className="text-xs text-gray-500 mt-1 max-w-2xl leading-relaxed">
              Quy trình cập nhật hồ sơ: Chuyên viên lập &amp; phân loại ➔ Trưởng phòng thẩm định &amp; phân quyền ➔ Phối hợp lấy ý kiến ➔ Văn thư phê duyệt nhập Thư viện HSTL.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setIsCreating(!isCreating);
                if (!isCreating) resetForm();
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-blue-700 hover:bg-blue-800 shadow-sm transition cursor-pointer"
            >
              <FolderPlus className="w-4 h-4" />
              {isCreating ? 'Đóng form nhập hồ sơ' : 'Tạo mới hồ sơ tài liệu'}
            </button>
          </div>
        </div>

        {/* Step Flow Indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 text-xs">
          <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-200">
            <div className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Bước 1: Chuyên viên</div>
            <div className="font-bold text-slate-800 mt-0.5">Lập &amp; Trình hồ sơ</div>
            <div className="text-[11px] text-gray-500">Tải scan hoặc dự thảo, chọn Chế độ Thường (Công khai) / Chế độ Mật (Bảo mật)</div>
          </div>
          <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-200">
            <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Bước 2: Trưởng phòng</div>
            <div className="font-bold text-slate-800 mt-0.5">Thẩm định &amp; Phân quyền</div>
            <div className="text-[11px] text-gray-500">Duyệt, trả lại, phân phối hợp hoặc chọn người xem Mật</div>
          </div>
          <div className="p-3 rounded-xl bg-purple-50/50 border border-purple-200">
            <div className="text-[10px] font-bold text-purple-800 uppercase tracking-wider">Bước 3: Lãnh đạo ký</div>
            <div className="font-bold text-slate-800 mt-0.5">In phiếu &amp; Đóng dấu đỏ</div>
            <div className="text-[11px] text-gray-500">Đối với hồ sơ chưa có dấu cần trình ký</div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200">
            <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Bước 4: Văn thư</div>
            <div className="font-bold text-slate-800 mt-0.5">Phê duyệt &amp; Nhập HSTL</div>
            <div className="text-[11px] text-gray-500">Định vị kho vật lý và số hóa tra cứu toàn hệ thống</div>
          </div>
        </div>
      </div>

      {/* CREATE FORM STEP 1 */}
      {isCreating ? (
        <div className="bg-white border-2 border-blue-600/30 rounded-2xl p-6 shadow-lg space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-gray-200">
            <div className="flex items-center gap-2 text-blue-700">
              <FolderPlus className="w-5 h-5" />
              <h3 className="font-bold text-base text-slate-900">
                Bước 1: Chuyên Viên Nhập Thông Tin &amp; Trình Trưởng Phòng
              </h3>
            </div>
            <button
              onClick={() => setIsCreating(false)}
              className="text-xs text-gray-400 hover:text-slate-800 font-bold p-1 cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Document Type Selector (Chưa có dấu vs Đã có dấu) */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              Tình trạng pháp lý văn bản: <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setHasStampType(false)}
                className={`p-3.5 rounded-xl border text-left transition flex items-start gap-3 cursor-pointer ${
                  !hasStampType
                    ? 'bg-amber-50/80 border-amber-500 text-amber-950 ring-2 ring-amber-300 shadow-xs'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="w-4 h-4 rounded-full border-2 border-amber-600 mt-0.5 flex items-center justify-center shrink-0">
                  {!hasStampType && <div className="w-2 h-2 rounded-full bg-amber-600"></div>}
                </div>
                <div>
                  <div className="text-xs font-bold flex items-center gap-1.5 text-amber-900">
                    📝 Hồ sơ / Văn bản CHƯA CÓ DẤU (Trình duyệt)
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                    Hồ sơ dự thảo, tờ trình, phương án kỹ thuật... cần Trưởng phòng kiểm tra trước khi In xuất bản trình Lãnh đạo ký và đóng dấu.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setHasStampType(true)}
                className={`p-3.5 rounded-xl border text-left transition flex items-start gap-3 cursor-pointer ${
                  hasStampType
                    ? 'bg-red-50/80 border-red-500 text-red-950 ring-2 ring-red-300 shadow-xs'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="w-4 h-4 rounded-full border-2 border-red-600 mt-0.5 flex items-center justify-center shrink-0">
                  {hasStampType && <div className="w-2 h-2 rounded-full bg-red-600"></div>}
                </div>
                <div>
                  <div className="text-xs font-bold flex items-center gap-1.5 text-red-900">
                    Văn bản ĐÃ CÓ CON DẤU ĐỎ &amp; CHỮ KÝ
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                    Văn bản, quyết định, hợp đồng đã ban hành chính thức. Hệ thống tự động nhận dạng OCR bóc tách số hiệu, trích yếu và dấu đỏ.
                  </p>
                </div>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmitStep1} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  1. Số ký hiệu / Mã hồ sơ <span className="text-red-500">* (Bắt buộc)</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: TTr-KT-2026/09, BB-NT-2026/18, 158/QĐ-ĐS..."
                  value={soKyHieu}
                  onChange={(e) => setSoKyHieu(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 font-mono font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  2. Đơn vị lập / Cơ quan ban hành <span className="text-red-500">* (Combobox lựa chọn)</span>
                </label>
                <IssuingAgencyCombobox
                  value={coQuanBanHanh}
                  onChange={setCoQuanBanHanh}
                  placeholder="Chọn hoặc nhập đơn vị ban hành..."
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  3. Ngày lập hồ sơ / Ngày ban hành <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={ngayBanHanh}
                  onChange={(e) => setNgayBanHanh(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  4. Loại tài liệu / Văn bản
                </label>
                <select
                  value={loaiVanBan}
                  onChange={(e) => setLoaiVanBan(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 cursor-pointer"
                >
                  <option value="Tờ trình">Tờ trình</option>
                  <option value="Biên bản">Biên bản</option>
                  <option value="Báo cáo">Báo cáo</option>
                  <option value="Phương án kỹ thuật">Phương án kỹ thuật</option>
                  <option value="Hồ sơ hoàn công">Hồ sơ hoàn công</option>
                  <option value="Hợp đồng">Hợp đồng</option>
                  <option value="Quyết định">Quyết định</option>
                  <option value="Công văn">Công văn</option>
                  <option value="Kế hoạch">Kế hoạch</option>
                </select>
              </div>
            </div>

            {/* 2 Chế độ bảo mật Thường vs Mật */}
            <div className="bg-slate-50 border border-gray-200 rounded-xl p-4 space-y-2">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-blue-700" />
                5. Chế độ bảo mật tài liệu (Chỉ 2 chế độ): <span className="text-red-500">*</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* THƯỜNG */}
                <button
                  type="button"
                  onClick={() => setSecurityLevel('THƯỜNG')}
                  className={`p-3 rounded-xl border text-left transition flex items-start gap-3 cursor-pointer ${
                    securityLevel === 'THƯỜNG'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-300 shadow-xs'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs font-bold flex items-center gap-1.5 text-emerald-900">
                      Chế độ THƯỜNG (Công khai)
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Sau khi đưa vào Thư viện HSTL, <strong>ai cũng được xem</strong> tài liệu này.
                    </p>
                  </div>
                </button>

                {/* MẬT */}
                <button
                  type="button"
                  onClick={() => setSecurityLevel('MẬT')}
                  className={`p-3 rounded-xl border text-left transition flex items-start gap-3 cursor-pointer ${
                    securityLevel === 'MẬT'
                      ? 'bg-rose-50 border-rose-500 text-rose-950 ring-2 ring-rose-300 shadow-xs'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Lock className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs font-bold flex items-center gap-1.5 text-rose-900">
                      Chế độ MẬT (Phân quyền bảo mật)
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Khi trình Trưởng phòng, Trưởng phòng sẽ <strong>tick chọn cá nhân hoặc đơn vị phòng ban</strong> được xem.
                    </p>
                  </div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                6. Trích yếu nội dung tài liệu <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                placeholder="Nhập tóm tắt nội dung chính của hồ sơ tài liệu..."
                value={trichYeu}
                onChange={(e) => setTrichYeu(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 leading-relaxed"
              />
            </div>

            {/* Upload file */}
            <div className="border-2 border-dashed border-blue-200 hover:border-blue-500 rounded-2xl p-5 bg-blue-50/30 text-center transition">
              <input
                type="file"
                id="file-scan-upload"
                onChange={handleFileUpload}
                accept=".pdf,.docx,.xlsx,.jpg,.png"
                className="hidden"
              />
              <label htmlFor="file-scan-upload" className="cursor-pointer block space-y-2">
                <div className="w-12 h-12 mx-auto rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shadow-xs">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold text-blue-700 hover:underline">
                    {hasStampType 
                      ? 'Tải lên tệp scan có đầy đủ chữ ký và dấu đỏ (.pdf, .jpg...)'
                      : 'Tải lên tệp hồ sơ / dự thảo chưa có dấu (.docx, .pdf, .xlsx...)'}
                  </span>
                  <p className="text-[11px] text-gray-500 mt-0.5 font-medium">
                    Hỗ trợ tệp đính kèm văn bản, hồ sơ thiết kế, dự toán và biên bản kiểm tra
                  </p>
                </div>
              </label>

              {uploadedFile && (
                <div className="mt-4 p-3 rounded-xl bg-white border border-gray-200 flex items-center justify-between text-xs max-w-md mx-auto shadow-xs">
                  <div className="flex items-center gap-2 text-slate-800 truncate">
                    <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="truncate font-mono font-bold">{uploadedFile.name}</span>
                    <span className="text-gray-500">({uploadedFile.size})</span>
                  </div>
                  {hasStampType && (
                    <button
                      type="button"
                      onClick={() => setOcrModalOpen(true)}
                      className="flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200 shrink-0 transition cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Xem OCR
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Reviewer select */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                7. Chọn Trưởng phòng kiểm tra &amp; thẩm định hồ sơ:
              </label>
              <select
                value={selectedReviewerId}
                onChange={(e) => setSelectedReviewerId(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 cursor-pointer"
              >
                {SAMPLE_USERS.filter(u => u.role === 'TRUONG_PHONG' || u.role === 'ADMIN').map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} - {user.roleTitle} ({user.department})
                  </option>
                ))}
              </select>
            </div>

            {/* Submitter Comment (Optional) */}
            <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-4 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-blue-700" />
                  <span>8. Ý kiến / Lời nhắn của người trình khi gửi Trưởng phòng:</span>
                </label>
                <span className="text-[10px] text-blue-700 font-medium bg-blue-100/70 px-2 py-0.5 rounded-md">
                  Không bắt buộc (có thể nhập hoặc để trống)
                </span>
              </div>
              <textarea
                rows={2}
                placeholder="Nhập lời nhắn, nội dung cần lưu ý, tóm tắt đề xuất tới Trưởng phòng (tùy chọn)..."
                value={submissionComment}
                onChange={(e) => setSubmissionComment(e.target.value)}
                className="w-full bg-white border border-blue-200 rounded-xl p-3 text-xs text-slate-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
              <p className="text-[11px] text-slate-500">
                Ý kiến này sẽ được lưu cùng hồ sơ và hiển thị trực tiếp cho Trưởng phòng xem xét khi thẩm định.
              </p>
            </div>

            {/* Submit buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-600 hover:text-slate-900 cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 shadow-sm transition cursor-pointer"
              >
                <Send className="w-4 h-4" />
                Trình Trưởng Phòng Kiểm Tra &amp; Thẩm Định
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {/* Document Table & Filters */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
        {/* Filter bar */}
        <div className="p-4 bg-gray-50/80 border-b border-gray-200 flex flex-col lg:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full lg:w-80">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm theo số ký hiệu, đơn vị, trích yếu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto text-xs pb-1 lg:pb-0">
            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setFilterStatus('ALL')}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer whitespace-nowrap ${
                  filterStatus === 'ALL' ? 'bg-blue-700 text-white shadow-xs' : 'text-gray-600 hover:text-slate-900 hover:bg-gray-100'
                }`}
              >
                Tất cả ({docs.length})
              </button>
              <button
                onClick={() => setFilterStatus('PENDING_REVIEW')}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer whitespace-nowrap ${
                  filterStatus === 'PENDING_REVIEW' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'text-gray-600 hover:text-slate-900 hover:bg-gray-100'
                }`}
              >
                Chờ TP duyệt ({docs.filter(d => d.status === 'PENDING_REVIEW').length})
              </button>
              <button
                onClick={() => setFilterStatus('PENDING_VAN_THU')}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer whitespace-nowrap ${
                  filterStatus === 'PENDING_VAN_THU' ? 'bg-blue-100 text-blue-900 border border-blue-300' : 'text-gray-600 hover:text-slate-900 hover:bg-gray-100'
                }`}
              >
                Chờ Văn thư nhập HSTL ({docs.filter(d => d.status === 'PENDING_VAN_THU').length})
              </button>
              <button
                onClick={() => setFilterStatus('COORDINATING')}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer whitespace-nowrap ${
                  filterStatus === 'COORDINATING' ? 'bg-blue-100 text-blue-900 border border-blue-300' : 'text-gray-600 hover:text-slate-900 hover:bg-gray-100'
                }`}
              >
                Đang phối hợp ({docs.filter(d => d.status === 'COORDINATING').length})
              </button>
              <button
                onClick={() => setFilterStatus('ARCHIVED')}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer whitespace-nowrap ${
                  filterStatus === 'ARCHIVED' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'text-gray-600 hover:text-slate-900 hover:bg-gray-100'
                }`}
              >
                Đã vào HSTL ({docs.filter(d => d.status === 'ARCHIVED').length})
              </button>
            </div>

            <div className="h-4 w-px bg-gray-300 mx-1 hidden sm:block"></div>

            {/* Security Level Filter */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setFilterSecurity('ALL')}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                  filterSecurity === 'ALL' ? 'bg-slate-700 text-white' : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                Độ mật: Tất cả
              </button>
              <button
                onClick={() => setFilterSecurity('THƯỜNG')}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 ${
                  filterSecurity === 'THƯỜNG' ? 'bg-emerald-600 text-white font-bold' : 'text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Thường
              </button>
              <button
                onClick={() => setFilterSecurity('MẬT')}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 ${
                  filterSecurity === 'MẬT' ? 'bg-rose-600 text-white font-bold' : 'text-rose-700 hover:bg-rose-50'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span> Mật
              </button>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 min-w-[760px]">
            <thead className="bg-blue-50/80 text-[11px] uppercase tracking-wider text-blue-950 font-bold border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Số ký hiệu &amp; Phân loại</th>
                <th className="py-3 px-4">Đơn vị lập / Ban hành</th>
                <th className="py-3 px-4">Trích yếu nội dung</th>
                <th className="py-3 px-4">Độ mật &amp; Quyền xem</th>
                <th className="py-3 px-4">Trạng thái Xử lý</th>
                <th className="py-3 px-4 text-right">Thao tác nghiệp vụ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500 font-medium">
                    Không có hồ sơ nào phù hợp với điều kiện tìm kiếm
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => {
                  const fullOcr = doc.ocrText || (doc as any).ocrExtracted?.fullOcrText || `${doc.soKyHieu} ${doc.coQuanBanHanh} ${doc.trichYeu} ${doc.loaiVanBan}`;
                  const ocrSnippet = getOcrSnippet(fullOcr, searchTerm);
                  const matchedInOcr = searchTerm.trim() && ocrSnippet;

                  return (
                    <tr key={doc.id} className="hover:bg-blue-50/40 transition">
                      {/* 1. Số ký hiệu */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-blue-700">
                          <HighlightText text={doc.soKyHieu} search={searchTerm} />
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] text-gray-500 font-medium">
                            <HighlightText text={doc.loaiVanBan} search={searchTerm} />
                          </span>
                          {doc.hasStamp ? (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-50 text-red-700 border border-red-200 font-bold">
                              Đã có dấu
                            </span>
                          ) : (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200 font-bold">
                              Chưa có dấu
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 2. Đơn vị */}
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        <div>
                          <HighlightText text={doc.coQuanBanHanh} search={searchTerm} />
                        </div>
                        <div className="text-[10px] text-gray-400 font-normal">Ngày: {doc.ngayBanHanh}</div>
                      </td>

                      {/* 3. Trích yếu */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="line-clamp-2 text-slate-700 font-medium">
                          <HighlightText text={doc.trichYeu} search={searchTerm} />
                        </div>

                        {/* OCR Match Snippet */}
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
                        
                        {/* Note or Reject Reason badge */}
                        {doc.status === 'REJECTED' && doc.reviewNote && (
                          <div className="mt-1 p-1.5 rounded bg-red-50 border border-red-200 text-[10px] text-red-800 font-medium">
                            <strong>Lý do trả lại:</strong> {doc.reviewNote}
                          </div>
                        )}

                        {/* Submitter's comment / note */}
                        {doc.submissionComment && (
                          <div className="mt-1.5 p-1.5 rounded-lg bg-blue-50/80 border border-blue-200 text-[10px] text-blue-900 font-medium flex items-start gap-1.5 shadow-2xs">
                            <MessageSquare className="w-3.5 h-3.5 text-blue-700 shrink-0 mt-0.5" />
                            <div className="leading-relaxed">
                              <span className="font-bold text-blue-950">Ý kiến người trình:</span> {doc.submissionComment}
                            </div>
                          </div>
                        )}

                        {/* Coordination list summary */}
                        {doc.status === 'COORDINATING' && doc.coordinations && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {doc.coordinations.map(c => (
                              <span key={c.id} className={`text-[9px] px-1.5 py-0.5 rounded font-medium border ${
                                c.status === 'FEEDBACK_PROVIDED' 
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : 'bg-blue-50 text-blue-800 border-blue-200'
                              }`}>
                                {c.unitName.replace('Ban ', '')}: {c.status === 'FEEDBACK_PROVIDED' ? '✓ Đã góp ý' : '⏳ Chờ góp ý'}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* 4. Độ mật & Quyền xem */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {doc.securityLevel === 'MẬT' ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs">
                              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span> Mật
                            </span>
                            {doc.secretAccessPermissions && (
                              <div className="text-[10px] text-gray-500 flex items-center gap-1">
                                <Lock className="w-3 h-3 text-rose-600" />
                                <span>{doc.secretAccessPermissions.userIds?.length || 0} cá nhân • {doc.secretAccessPermissions.departmentNames?.length || 0} phòng ban</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Thường
                            </span>
                            <div className="text-[10px] text-gray-500">
                              Toàn cơ quan xem
                            </div>
                          </div>
                        )}
                      </td>

                      {/* 5. Trạng thái */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {doc.status === 'PENDING_REVIEW' && (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1.5 w-fit">
                            <Clock className="w-3.5 h-3.5" />
                            Chờ TP kiểm tra
                          </span>
                        )}
                        {doc.status === 'COORDINATING' && (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1.5 w-fit">
                            <Users className="w-3.5 h-3.5" />
                            Đang phối hợp
                          </span>
                        )}
                        {doc.status === 'PENDING_VAN_THU' && (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-300 flex items-center gap-1.5 w-fit animate-pulse">
                            <Archive className="w-3.5 h-3.5 text-blue-700" />
                            Chờ Văn thư nhập kho
                          </span>
                        )}
                        {doc.status === 'REVIEW_APPROVED' && (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5 w-fit">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {!doc.hasStamp ? 'Đã duyệt (Sẵn sàng in)' : 'Đã thẩm tra đạt'}
                          </span>
                        )}
                        {doc.status === 'PRINTED_FOR_LEADER' && (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-50 text-purple-800 border border-purple-200 flex items-center gap-1.5 w-fit">
                            <Printer className="w-3.5 h-3.5" />
                            Đã in trình Lãnh đạo
                          </span>
                        )}
                        {doc.status === 'ARCHIVED' && (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1.5 w-fit">
                            <Archive className="w-3.5 h-3.5" />
                            Đã vào Thư viện HSTL
                          </span>
                        )}
                        {doc.status === 'REJECTED' && (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-50 text-red-800 border border-red-200 flex items-center gap-1.5 w-fit">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Yêu cầu sửa lại
                          </span>
                        )}
                      </td>

                      {/* 6. Thao tác nghiệp vụ */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-1.5">
                        <button
                          onClick={() => onOpenViewer(doc, searchTerm)}
                          className="px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-slate-700 hover:text-slate-900 transition inline-flex items-center gap-1 font-semibold cursor-pointer"
                          title="Xem chi tiết hồ sơ"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Xem
                        </button>

                        {/* 1. Trưởng phòng kiểm tra: Thẩm định / Duyệt / Trả lại / Phối hợp */}
                        {(doc.status === 'PENDING_REVIEW' || doc.status === 'COORDINATING') && (
                          <button
                            onClick={() => setReviewingDoc(doc)}
                            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-xs transition inline-flex items-center gap-1 cursor-pointer"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            {doc.status === 'COORDINATING' ? 'Xử lý phối hợp & Duyệt' : 'TP Kiểm tra & Duyệt'}
                          </button>
                        )}

                        {/* 2. Văn thư phê duyệt & Nhập kho HSTL */}
                        {(doc.status === 'PENDING_VAN_THU' || (doc.status === 'REVIEW_APPROVED' && doc.hasStamp)) && (
                          <button
                            onClick={() => setVanThuArchivingDoc(doc)}
                            className="px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold shadow-xs transition inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Archive className="w-3.5 h-3.5" />
                            Văn Thư Duyệt &amp; Nhập HSTL
                          </button>
                        )}

                        {/* 3. Nếu đã duyệt & chưa có dấu -> Nút In Xuất Bản & Trình Lãnh Đạo */}
                        {doc.status === 'REVIEW_APPROVED' && !doc.hasStamp && (
                          <button
                            onClick={() => setPrintingDoc(doc)}
                            className="px-3 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-bold shadow-xs transition inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            In &amp; Trình Lãnh Đạo
                          </button>
                        )}

                        {/* 4. Sau khi in trình Lãnh đạo -> Nút Cập nhật Scan Dấu đỏ & Vào HSTL */}
                        {doc.status === 'PRINTED_FOR_LEADER' && (
                          <button
                            onClick={() => setLeaderSignedDoc(doc)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs transition inline-flex items-center gap-1 cursor-pointer"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Nộp Scan Dấu Đỏ &amp; Vào HSTL
                          </button>
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

      {/* Sub-Modals */}
      {reviewingDoc && (
        <Luong1ReviewModal
          doc={reviewingDoc}
          currentUser={currentUser}
          onClose={() => setReviewingDoc(null)}
          onApprove={handleApproveReview}
          onReject={handleRejectReview}
          onCoordinate={handleCoordinate}
        />
      )}

      {vanThuArchivingDoc && (
        <Luong1VanThuArchiveModal
          doc={vanThuArchivingDoc}
          currentUser={currentUser}
          onClose={() => setVanThuArchivingDoc(null)}
          onArchive={handleVanThuArchive}
        />
      )}

      {printingDoc && (
        <Luong1PrintLeaderModal
          doc={printingDoc}
          currentUser={currentUser}
          onClose={() => setPrintingDoc(null)}
          onConfirmPrinted={handleConfirmPrinted}
        />
      )}

      {leaderSignedDoc && (
        <Luong1LeaderSignedModal
          doc={leaderSignedDoc}
          currentUser={currentUser}
          onClose={() => setLeaderSignedDoc(null)}
          onArchive={handleArchiveLeaderSigned}
        />
      )}

      {/* OCR Scan Modal */}
      {uploadedFile && (
        <OcrScanModal
          isOpen={ocrModalOpen}
          onClose={() => setOcrModalOpen(false)}
          file={uploadedFile}
          onApplyExtraction={(fields, fullText) => {
            if (fields.soKyHieu) setSoKyHieu(fields.soKyHieu);
            if (fields.coQuan) setCoQuanBanHanh(fields.coQuan);
            if (fields.ngayBanHanh) setNgayBanHanh(fields.ngayBanHanh);
            if (fields.trichYeu) setTrichYeu(fields.trichYeu);
            if (fields.loaiVanBan) setLoaiVanBan(fields.loaiVanBan);
            setOcrText(fullText);
            setOcrConfidence(fields.confidence || 98.5);
          }}
        />
      )}
    </div>
  );
};
