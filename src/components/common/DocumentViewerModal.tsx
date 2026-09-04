import React, { useState, useEffect } from 'react';
import { HighlightText } from '../../utils/highlight';
import { StorageService } from '../../services/storageService';
import { formatCurrencyVND, formatShortVND } from './DynamicMetadataFields';
import { UserProfile } from '../../types';
import { canUserAccessOutgoingDoc } from '../../utils/outgoingPermission';
import { EditDocumentMetadataModal } from './EditDocumentMetadataModal';
import { 
  FileText, 
  X, 
  Download, 
  Printer, 
  CheckCircle, 
  MapPin, 
  Clock, 
  Building2, 
  Tag, 
  ShieldCheck, 
  Share2, 
  Copy, 
  Archive,
  QrCode,
  Layers,
  Search,
  Sparkles,
  DollarSign,
  Calendar,
  Sliders,
  Lock,
  ShieldAlert,
  Users,
  Award,
  Edit3,
  Trash2,
  Plus,
  History,
  CheckCircle2,
  FileUp,
  ArrowUpRight,
  RefreshCw,
  MessageSquare,
  Eye,
  Box,
  FolderArchive,
  Barcode,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DocumentVersion } from '../../types';

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: any; // Can be ExistingDocument, DraftDossier, IncomingDocument, or OutgoingDocument
  docType: 'LUONG_1' | 'LUONG_2' | 'LUONG_3' | 'LUONG_4' | 'HSTL';
  currentUser?: UserProfile;
  onIssueElectronicCopy?: () => void;
  searchKeyword?: string;
  initialTab?: 'preview' | 'ocr' | 'meta' | 'location' | 'versions';
  onDocumentUpdated?: (updatedDoc: any) => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  isOpen,
  onClose,
  document: doc,
  docType,
  currentUser,
  onIssueElectronicCopy,
  searchKeyword = '',
  initialTab = 'preview',
  onDocumentUpdated
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'ocr' | 'meta' | 'location' | 'versions'>(initialTab);
  const [copied, setCopied] = useState(false);
  const [ocrSearchQuery, setOcrSearchQuery] = useState(searchKeyword);
  const [currentDoc, setCurrentDoc] = useState<any>(doc);
  const [isEditMetadataOpen, setIsEditMetadataOpen] = useState(false);

  // Version Management States
  const [isAddingVersion, setIsAddingVersion] = useState(false);
  const [newVersionFile, setNewVersionFile] = useState<{ name: string; size: string; url?: string } | null>(null);
  const [newVersionNote, setNewVersionNote] = useState('');
  const [newVersionCustomLabel, setNewVersionCustomLabel] = useState('');
  const [selectedVersionForPreview, setSelectedVersionForPreview] = useState<DocumentVersion | null>(null);

  useEffect(() => {
    setCurrentDoc(doc);
    setSelectedVersionForPreview(null);
  }, [doc, isOpen]);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  useEffect(() => {
    if (searchKeyword) {
      setOcrSearchQuery(searchKeyword);
    }
  }, [searchKeyword, isOpen]);

  if (!isOpen || !doc || !currentDoc) return null;

  const isAdmin = currentUser?.role === 'ADMIN';

  // Check access if this is an outgoing document
  const isOutgoingDoc = docType === 'LUONG_4' || !!currentDoc.soDiFullCode || (!!currentDoc.noiNhan && !!currentDoc.donViSoanThao);
  const outgoingAccess = (isOutgoingDoc && currentUser)
    ? canUserAccessOutgoingDoc(currentDoc, currentUser)
    : { allowed: true, reason: '', allowedDepartments: [] as string[], allowedUsers: [] as string[] };

  const title = currentDoc.trichYeu || currentDoc.title || currentDoc.soKyHieu || 'Chi tiết văn bản hồ sơ';
  const code = currentDoc.soKyHieu || currentDoc.soDiFullCode || currentDoc.soKyHieuGoc || currentDoc.code || 'HSTL-DOC';
  const issuingUnit = currentDoc.coQuanBanHanh || currentDoc.coQuanGui || currentDoc.donViSoanThao || currentDoc.creatorDepartment || 'Tổng công ty Đường sắt Việt Nam';
  const date = currentDoc.ngayBanHanh || currentDoc.ngayKy || currentDoc.createdAt || '2026-04-20';
  const retention = currentDoc.retentionPeriod || currentDoc.hstlArchiveInfo?.retentionPeriod || 'VĨNH VIỄN';
  const location = currentDoc.physicalLocation || currentDoc.hstlArchiveInfo?.physicalLocation;

  const schema = StorageService.getSchemaForDocType(currentDoc.loaiVanBan || currentDoc.loaiVanBanLabel || '');

  const handleDeleteDocument = () => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa tài liệu "${code}" và toàn bộ metadata khỏi Thư viện HSTL không? Thao tác này không thể hoàn tác.`)) {
      StorageService.deleteDocument(currentDoc.id, docType);
      try {
        confetti({ particleCount: 30, spread: 60 });
      } catch (e) {}
      onClose();
    }
  };

  const handleDeleteSingleMetadataField = (fieldKey: string) => {
    if (window.confirm(`Xóa trường metadata "${getFieldLabel(fieldKey)}" khỏi tài liệu này?`)) {
      const updatedCustom = { ...(currentDoc.customMetadata || {}) };
      delete updatedCustom[fieldKey];
      const updates = {
        customMetadata: Object.keys(updatedCustom).length > 0 ? updatedCustom : undefined
      };
      StorageService.updateUniversalDoc(currentDoc.id, updates, docType);
      setCurrentDoc({ ...currentDoc, ...updates });
    }
  };

  const handleClearAllCustomMetadata = () => {
    if (window.confirm(`Xóa toàn bộ các trường metadata đặc thù của tài liệu "${code}"?`)) {
      const updates = { customMetadata: undefined };
      StorageService.updateUniversalDoc(currentDoc.id, updates, docType);
      setCurrentDoc({ ...currentDoc, customMetadata: undefined });
    }
  };

  const formatMetaValue = (key: string, val: any) => {
    if (val === undefined || val === null || val === '') return '—';
    const fieldDef = schema?.fields?.find(f => f.key === key);
    if (fieldDef?.type === 'currency' || key.toLowerCase().includes('giatri') || (typeof val === 'number' && val > 1000000)) {
      return (
        <span className="font-mono font-bold text-emerald-700">
          {formatCurrencyVND(val)}
          <span className="text-[10px] ml-1.5 px-1.5 py-0.5 rounded bg-emerald-100/70 text-emerald-900 font-sans font-semibold">
            ({formatShortVND(val)})
          </span>
        </span>
      );
    }
    if (typeof val === 'boolean') {
      return val ? '✓ Đạt / Có áp dụng' : '✗ Không áp dụng';
    }
    return (
      <span className="font-semibold text-slate-800">
        {String(val)} {fieldDef?.unit ? <span className="text-gray-500 font-normal text-[11px]">({fieldDef.unit})</span> : null}
      </span>
    );
  };

  const getFieldLabel = (key: string) => {
    const fieldDef = schema?.fields?.find(f => f.key === key);
    if (fieldDef?.label) return fieldDef.label;
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  const fullOcrText = doc.ocrText || doc.ocrExtracted?.fullOcrText || (
    `TỔNG CÔNG TY ĐƯỜNG SẮT VIỆT NAM\nSố: ${code}\nNgày: ${date}\nĐơn vị ban hành: ${issuingUnit}\nLoại văn bản: ${doc.loaiVanBan || 'Văn bản hành chính'}\nTrích yếu: ${title}\n\nCĂN CỨ VÀ NỘI DUNG VĂN BẢN:\n- Căn cứ Điều lệ tổ chức và hoạt động của Tổng công ty Đường sắt Việt Nam;\n- Căn cứ Nghị định số 30/2020/NĐ-CP ngày 05/03/2020 của Chính phủ về công tác văn thư;\n- Căn cứ hồ sơ kỹ thuật, phương án thi công và hoàn công được các đơn vị chuyên môn thẩm định;\n\nToàn bộ hồ sơ số hóa đã được kiểm tra, công chứng điện tử và lập chỉ mục OCR phục vụ tra cứu toàn văn tức thì.`
  );

  // Calculate OCR match count
  const ocrMatchCount = ocrSearchQuery.trim()
    ? (fullOcrText.match(new RegExp(ocrSearchQuery.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')) || []).length
    : 0;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadDocument = () => {
    if (!currentDoc) return;
    const fileUrl = selectedVersionForPreview?.fileUrl || currentDoc.fileUrl || currentDoc.fileScanUrl || currentDoc.scannedFileUrl || currentDoc.draftFileUrl;
    const fileName = selectedVersionForPreview?.fileName || currentDoc.fileName || currentDoc.scannedFileName || currentDoc.draftFileName;

    if (fileUrl && (fileUrl.startsWith('data:') || fileUrl.startsWith('blob:') || fileUrl.startsWith('http'))) {
      const a = window.document.createElement('a');
      a.href = fileUrl;
      a.download = fileName || `${code.replace(/[^a-zA-Z0-9_-]/g, '_')}_HoSo.pdf`;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      return;
    }

    // Xuất tệp hồ sơ dữ liệu đầy đủ
    const exportData = `================================================================================
TỔNG CÔNG TY ĐƯỜNG SẮT VIỆT NAM (VNR)
HỆ THỐNG QUẢN LÝ VĂN BẢN VÀ LƯU TRỮ HỒ SƠ ĐIỆN TỬ (HSTL)
================================================================================
BẢN TRÍCH XUẤT DỮ LIỆU HỒ SƠ LƯU TRỮ CHÍNH THỨC

• Số / Ký hiệu hồ sơ: ${code}
• Trích yếu nội dung: ${title}
• Cơ quan / Đơn vị ban hành: ${issuingUnit}
• Ngày văn bản: ${date}
• Thời hạn bảo quản: ${retention}
• Cấp độ bảo mật: ${currentDoc.securityLevel || 'THƯỜNG'}

--------------------------------------------------------------------------------
TỌA ĐỘ KHO VẬT LÝ 5 CẤP CHUẨN HOÁ:
• Cấp 1 (Phòng / Ban / Đơn vị con): ${location?.phongBan || location?.donVi || 'Chưa định vị'}
• Cấp 2 (Dãy Kệ lưu trữ): ${location?.ke || 'N/A'}
• Cấp 3 (Ngăn Kệ): ${location?.ngan || 'N/A'}
• Cấp 4 (Hộp / Cặp hồ sơ): ${location?.hop || 'N/A'}
• Cấp 5 (Vị trí Hồ sơ): ${location?.hoSo || code}
• Mã Barcode / RFID: ${location?.maVach || 'N/A'}

--------------------------------------------------------------------------------
NỘI DUNG SỐ HÓA & OCR TOÀN VĂN:
${currentDoc.ocrExtracted?.fullOcrText || currentDoc.ocrText || title}

================================================================================
Thời điểm trích xuất: ${new Date().toLocaleString('vi-VN')}
Cán bộ trích xuất: ${currentUser?.name || 'Cán bộ'} (${currentUser?.department || 'TCT ĐSVN'} - ${currentUser?.roleTitle || ''})
Mã xác thực lưu trữ số: VNR-HSTL-VIEWER-${Date.now()}
================================================================================`;

    const blob = new Blob([exportData], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `${(fileName ? fileName.replace(/\.[^/.]+$/, '') : code.replace(/[^a-zA-Z0-9_-]/g, '_'))}_DuLieu_HSTL.txt`;
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleIssueCopy = () => {
    if (onIssueElectronicCopy) {
      onIssueElectronicCopy();
    }
    try {
      confetti({ particleCount: 40, spread: 60 });
    } catch (e) {}
  };

  // -------------------------------------------------------------
  // PHIÊN BẢN TÀI LIỆU (VERSIONING LOGIC)
  // -------------------------------------------------------------
  const docVersions: DocumentVersion[] = (currentDoc.versions && currentDoc.versions.length > 0)
    ? currentDoc.versions
    : [
        {
          id: 'ver-initial-' + (currentDoc.id || 'doc'),
          version: currentDoc.currentVersion || 1,
          versionLabel: `v${currentDoc.currentVersion || 1}.0 - Bản số hóa gốc ban đầu`,
          fileName: currentDoc.fileName || currentDoc.draftFileName || 'TaiLieu_BanGoc.pdf',
          fileSize: currentDoc.fileSize || currentDoc.draftFileSize || '3.2 MB',
          fileUrl: currentDoc.fileScanUrl || currentDoc.draftFileUrl || 'https://images.unsplash.com/photo-1568667256549-094345857637?w=800&auto=format&fit=crop&q=80',
          uploadedAt: currentDoc.createdAt || currentDoc.ngayBanHanh || new Date().toISOString(),
          uploadedById: currentDoc.createdBy || currentDoc.creatorId || 'system',
          uploadedByName: currentDoc.createdByName || currentDoc.creatorName || 'Cán bộ khởi tạo',
          uploadedByRole: 'Chuyên viên phụ trách',
          changeNote: 'Khởi tạo tài liệu số hóa ban đầu vào hệ thống HSTL.',
          isCurrent: true
        }
      ];

  const currentVersionNum = currentDoc.currentVersion || (docVersions.length > 0 ? docVersions[0].version : 1);
  const nextVersionNum = Math.max(...docVersions.map(v => v.version || 1), 1) + 1;

  const handleSaveNewVersion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVersionNote.trim()) {
      alert('Vui lòng nhập tóm tắt nội dung thay đổi / lý do cập nhật phiên bản!');
      return;
    }

    const uploadedFileName = newVersionFile?.name || `${code.replace(/\//g, '_')}_v${nextVersionNum}.pdf`;
    const uploadedFileSize = newVersionFile?.size || '3.5 MB';
    const uploadedFileUrl = newVersionFile?.url || 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&auto=format&fit=crop&q=80';
    const versionLabel = newVersionCustomLabel.trim() || `v${nextVersionNum}.0 - Bản cập nhật sửa đổi & bổ sung`;

    const newVer = StorageService.addDocumentVersion(
      currentDoc.id,
      {
        version: nextVersionNum,
        versionLabel,
        fileName: uploadedFileName,
        fileSize: uploadedFileSize,
        fileUrl: uploadedFileUrl,
        uploadedAt: new Date().toISOString(),
        uploadedById: currentUser?.id || 'user_active',
        uploadedByName: currentUser?.name || 'Cán bộ cập nhật',
        uploadedByRole: currentUser?.roleTitle || 'Chuyên viên kỹ thuật',
        changeNote: newVersionNote.trim(),
        isCurrent: true
      },
      docType
    );

    const updatedVersions = [newVer, ...docVersions.map(v => ({ ...v, isCurrent: false }))];
    const updated = {
      ...currentDoc,
      currentVersion: nextVersionNum,
      versions: updatedVersions,
      fileName: uploadedFileName,
      fileSize: uploadedFileSize,
      fileScanUrl: uploadedFileUrl
    };

    if (currentDoc.draftFileName !== undefined) {
      updated.draftFileName = uploadedFileName;
      updated.draftFileSize = uploadedFileSize;
      updated.draftFileUrl = uploadedFileUrl;
    }

    setCurrentDoc(updated);
    if (onDocumentUpdated) onDocumentUpdated(updated);

    setIsAddingVersion(false);
    setNewVersionFile(null);
    setNewVersionNote('');
    setNewVersionCustomLabel('');

    try {
      confetti({ particleCount: 50, spread: 70 });
    } catch (e) {}
  };

  const handleSwitchActiveVersion = (vNum: number) => {
    if (vNum === currentVersionNum) return;
    if (window.confirm(`Bạn có chắc chắn muốn chuyển sang áp dụng Phiên bản v${vNum} làm phiên bản hiện hành của tài liệu này không?`)) {
      StorageService.setActiveDocumentVersion(currentDoc.id, vNum, docType);
      const chosen = docVersions.find(v => v.version === vNum);
      const updatedVersions = docVersions.map(v => ({
        ...v,
        isCurrent: v.version === vNum
      }));
      const updated = {
        ...currentDoc,
        currentVersion: vNum,
        versions: updatedVersions,
        fileName: chosen?.fileName || currentDoc.fileName,
        fileSize: chosen?.fileSize || currentDoc.fileSize,
        fileScanUrl: chosen?.fileUrl || currentDoc.fileScanUrl
      };

      if (currentDoc.draftFileName !== undefined && chosen) {
        updated.draftFileName = chosen.fileName;
        updated.draftFileSize = chosen.fileSize;
        updated.draftFileUrl = chosen.fileUrl;
      }

      setCurrentDoc(updated);
      if (onDocumentUpdated) onDocumentUpdated(updated);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col h-[94dvh] sm:h-[90vh] text-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-white shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-2 sm:p-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 shrink-0">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-[10px] sm:text-xs font-mono font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 truncate">
                  <HighlightText text={code} search={ocrSearchQuery} />
                </span>
                <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold shrink-0">
                  {retention}
                </span>
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-[#1e293b] truncate max-w-[200px] sm:max-w-xl mt-0.5 sm:mt-1">
                <HighlightText text={title} search={ocrSearchQuery} />
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {isAdmin && (
              <>
                <button
                  onClick={() => setIsEditMetadataOpen(true)}
                  className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition cursor-pointer"
                  title="Chỉnh sửa toàn bộ Metadata và thông tin lưu trữ của tài liệu này"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sửa Metadata</span>
                </button>
                <button
                  onClick={handleDeleteDocument}
                  className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 transition cursor-pointer"
                  title="Xóa tài liệu và toàn bộ metadata khỏi HSTL"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Xóa</span>
                </button>
              </>
            )}
            <button
              onClick={handleDownloadDocument}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition cursor-pointer"
              title="Tải về tệp đính kèm hoặc dữ liệu hồ sơ"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tải về</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold text-slate-700 hover:text-slate-900 bg-gray-100 hover:bg-gray-200 border border-gray-200 transition cursor-pointer"
              title="In phiếu lưu trữ hồ sơ"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">In phiếu</span>
            </button>
            {onIssueElectronicCopy && (
              <button
                onClick={handleIssueCopy}
                className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold text-white bg-[#1e40af] hover:bg-blue-800 shadow-sm transition cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cấp bản sao</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-slate-800 hover:bg-gray-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation (only visible if user has access) */}
        {outgoingAccess.allowed && (
          <div className="flex items-center px-2 sm:px-6 border-b border-gray-200 bg-gray-50 text-xs overflow-x-auto whitespace-nowrap shrink-0">
            <button
              onClick={() => setActiveTab('preview')}
              className={`py-2.5 sm:py-3 px-3 sm:px-4 font-bold border-b-2 transition cursor-pointer shrink-0 ${
                activeTab === 'preview'
                  ? 'border-blue-700 text-blue-700 bg-white'
                  : 'border-transparent text-gray-600 hover:text-slate-900'
              }`}
            >
              Bản Scan & Dấu đỏ
            </button>
            <button
              onClick={() => setActiveTab('ocr')}
              className={`py-2.5 sm:py-3 px-3 sm:px-4 font-bold border-b-2 transition cursor-pointer shrink-0 ${
                activeTab === 'ocr'
                  ? 'border-blue-700 text-blue-700 bg-white'
                  : 'border-transparent text-gray-600 hover:text-slate-900'
              }`}
            >
              Nội dung OCR Toàn văn
            </button>
            <button
              onClick={() => setActiveTab('meta')}
              className={`py-2.5 sm:py-3 px-3 sm:px-4 font-bold border-b-2 transition cursor-pointer shrink-0 ${
                activeTab === 'meta'
                  ? 'border-blue-700 text-blue-700 bg-white'
                  : 'border-transparent text-gray-600 hover:text-slate-900'
              }`}
            >
              Thuộc tính Pháp lý & Quy trình
            </button>
            <button
              onClick={() => setActiveTab('location')}
              className={`py-2.5 sm:py-3 px-3 sm:px-4 font-bold border-b-2 transition cursor-pointer shrink-0 ${
                activeTab === 'location'
                  ? 'border-blue-700 text-blue-700 bg-white'
                  : 'border-transparent text-gray-600 hover:text-slate-900'
              }`}
            >
              Định vị Kho Vật Lý
            </button>
            <button
              onClick={() => setActiveTab('versions')}
              className={`py-2.5 sm:py-3 px-3 sm:px-4 font-bold border-b-2 transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                activeTab === 'versions'
                  ? 'border-blue-700 text-blue-700 bg-white'
                  : 'border-transparent text-gray-600 hover:text-slate-900'
              }`}
            >
              <History className="w-3.5 h-3.5 text-indigo-600" />
              <span>Phiên bản Tài liệu</span>
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-indigo-100 text-indigo-800 border border-indigo-200">
                v{currentVersionNum}
              </span>
            </button>
          </div>
        )}

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-[#f0f2f5]">
          {/* Outgoing Document Access Restriction Guard */}
          {!outgoingAccess.allowed ? (
            <div className="max-w-xl mx-auto my-8 bg-white border border-rose-200 rounded-2xl p-6 sm:p-8 shadow-md text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-rose-100 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
                <Lock className="w-8 h-8" />
              </div>

              <div>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200 mb-2">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  HẠN CHẾ QUYỀN TRUY CẬP VĂN BẢN ĐI
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Bạn Không Có Quyền Xem Tài Liệu Này
                </h3>
                <p className="text-xs text-gray-600 mt-2 leading-relaxed text-left bg-rose-50/60 p-3.5 rounded-xl border border-rose-100">
                  {outgoingAccess.reason}
                </p>
              </div>

              {/* Allowed recipients info */}
              <div className="text-left bg-slate-50 border border-gray-200 rounded-xl p-4 space-y-2 text-xs">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>Đối tượng được phân quyền xem tại Nơi nhận:</span>
                </div>
                {outgoingAccess.allowedDepartments.length > 0 && (
                  <div>
                    <span className="text-gray-500 font-medium">Phòng ban nội bộ: </span>
                    <span className="font-semibold text-blue-900">
                      {outgoingAccess.allowedDepartments.join('; ')}
                    </span>
                  </div>
                )}
                {outgoingAccess.allowedUsers.length > 0 && (
                  <div>
                    <span className="text-gray-500 font-medium">Cá nhân (Giám đốc, Lãnh đạo): </span>
                    <span className="font-semibold text-rose-900">
                      {outgoingAccess.allowedUsers.join('; ')}
                    </span>
                  </div>
                )}
                {currentUser && (
                  <div className="pt-2 border-t border-gray-200 text-[11px] text-gray-500 flex items-center justify-between">
                    <span>Tài khoản hiện tại của bạn:</span>
                    <span className="font-bold text-slate-800">{currentUser.name} ({currentUser.department})</span>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl bg-gray-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer"
                >
                  Đã hiểu & Đóng lại
                </button>
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'preview' && (
            <div className="flex flex-col items-center justify-center space-y-4">
              {/* Selected Version Preview Alert Banner */}
              {selectedVersionForPreview && (
                <div className="w-full max-w-2xl bg-indigo-50 border border-indigo-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-indigo-950 font-semibold shadow-2xs">
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Đang xem trước tệp của: <strong>{selectedVersionForPreview.versionLabel}</strong> (v{selectedVersionForPreview.version}.0)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedVersionForPreview(null)}
                    className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold transition cursor-pointer self-start sm:self-auto shrink-0"
                  >
                    Quay lại bản hiện hành (v{currentVersionNum})
                  </button>
                </div>
              )}

              {/* Authentic Vietnamese Document Mock */}
              <div className="relative w-full max-w-2xl bg-white text-slate-900 rounded-lg shadow-xl p-4 sm:p-8 md:p-12 font-serif min-h-auto border border-gray-300 select-text">
                {/* Header Top */}
                <div className="flex justify-between items-start text-center mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-gray-200 gap-2">
                  <div className="w-1/2 text-center">
                    <p className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-900">
                      {issuingUnit.toUpperCase()}
                    </p>
                    <p className="text-[9px] sm:text-[11px] font-bold text-slate-700">
                      Số: <span className="font-mono">{code}</span>
                    </p>
                  </div>
                  <div className="w-1/2 text-center">
                    <p className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-900">
                      CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                    </p>
                    <p className="text-[9px] sm:text-[11px] italic text-slate-800">
                      Độc lập - Tự do - Hạnh phúc
                    </p>
                    <p className="text-[8px] sm:text-[10px] italic text-slate-600 mt-0.5 sm:mt-1">
                      Hà Nội, ngày {date.split('-')[2] || '20'} tháng {date.split('-')[1] || '04'} năm {date.split('-')[0] || '2026'}
                    </p>
                  </div>
                </div>

                {/* Title */}
                <div className="text-center my-4 sm:my-6">
                  <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wide text-slate-900 leading-snug">
                    {doc.loaiVanBan || doc.loaiVanBanLabel || 'VĂN BẢN HÀNH CHÍNH'}
                  </h2>
                  <p className="text-[11px] sm:text-xs font-semibold text-slate-700 mt-1.5 sm:mt-2 italic max-w-lg mx-auto">
                    {title}
                  </p>
                </div>

                {/* Dynamic Metadata Attributes Callout (Admin Configured) */}
                {doc.customMetadata && Object.keys(doc.customMetadata).length > 0 && (
                  <div className="my-4 p-3.5 rounded-lg bg-blue-50/70 border border-blue-200 text-slate-900 font-sans text-xs">
                    <div className="flex items-center justify-between border-b border-blue-200/80 pb-1.5 mb-2">
                      <span className="font-extrabold text-blue-900 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        Thuộc tính đặc thù ({schema?.name || doc.loaiVanBan})
                      </span>
                      <span className="text-[10px] font-semibold text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
                        Admin Dynamic Engine
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-[11px]">
                      {Object.entries(doc.customMetadata).map(([k, v]) => (
                        <div key={k} className="flex items-baseline justify-between gap-2 py-0.5 border-b border-blue-100/80">
                          <span className="text-slate-600 font-medium">{getFieldLabel(k)}:</span>
                          <div className="text-right">{formatMetaValue(k, v)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Content body */}
                <div className="text-[11px] sm:text-xs leading-relaxed text-slate-800 space-y-2 sm:space-y-3 my-4 sm:my-6 font-sans">
                  <p className="indent-4 sm:indent-6">
                    Căn cứ Điều lệ tổ chức và hoạt động của Tổng công ty Đường sắt Việt Nam;
                  </p>
                  <p className="indent-4 sm:indent-6">
                    Căn cứ Nghị định số 30/2020/NĐ-CP ngày 05/03/2020 của Chính phủ về công tác văn thư;
                  </p>
                  <p className="indent-4 sm:indent-6">
                    Hồ sơ tài liệu này đã được kiểm tra, thẩm tra tính xác thực, đầy đủ giá trị pháp lý và được lưu trữ chính thức tại Thư viện Hồ sơ Tài liệu (HSTL).
                  </p>
                </div>

                {/* Bottom Signatures & Stamped Seal */}
                <div className="flex justify-between items-end mt-6 sm:mt-12 pt-4 sm:pt-6 gap-2">
                  <div className="text-[9px] sm:text-[10px] text-slate-600 font-sans space-y-0.5">
                    <p className="font-bold">Nơi nhận:</p>
                    <p>- Lãnh đạo Tổng công ty;</p>
                    <p>- Các ban nghiệp vụ liên quan;</p>
                    <p>- Lưu: VT, HSTL ({retention}).</p>
                  </div>

                  {/* Stamp Container */}
                  <div className="relative text-center w-36 sm:w-48 font-sans">
                    <p className="text-[9px] sm:text-[11px] font-bold uppercase text-slate-900 leading-tight">
                      {doc.chucVuNguoiKy || 'TRƯỞNG PHÒNG / LÃNH ĐẠO KÝ DUYỆT'}
                    </p>

                    {/* Realistic Red Seal Watermark */}
                    <div className="my-1.5 sm:my-2 py-1 sm:py-2 flex items-center justify-center">
                      <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full border-2 sm:border-4 border-red-600/80 p-0.5 sm:p-1 flex flex-col items-center justify-center text-center text-red-600 font-bold rotate-[-6deg] shadow-sm bg-red-500/5 select-none">
                        <span className="text-[6px] sm:text-[7px] uppercase tracking-tighter leading-none">
                          ★ TỔNG CÔNG TY ĐƯỜNG SẮT VIỆT NAM ★
                        </span>
                        <div className="w-10 sm:w-16 h-[1px] bg-red-600 my-0.5" />
                        <span className="text-[7px] sm:text-[8px] tracking-widest text-red-700">ĐÃ XÁC THỰC</span>
                        <span className="text-[6px] sm:text-[7px] font-mono">HSTL DẤU ĐỎ</span>
                        <div className="w-10 sm:w-16 h-[1px] bg-red-600 my-0.5" />
                        <span className="text-[5px] sm:text-[6px] tracking-tighter">BẢN GỐC PHÁP LÝ</span>
                      </div>
                    </div>

                    <p className="text-[10px] sm:text-xs font-bold text-slate-900 italic">
                      {doc.nguoiKy || doc.assignedReviewerName || 'Đã ký & đóng dấu'}
                    </p>
                  </div>
                </div>

                {/* Electronic Stamp Badge */}
                <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:py-1 bg-blue-50 border border-blue-200 rounded-md text-[9px] sm:text-[10px] text-blue-700 font-sans font-semibold">
                  <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600" />
                  Đã số hóa chuẩn HSTL
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ocr' && (
            <div className="space-y-4">
              {/* Search & Actions Bar */}
              <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                {/* Search in OCR input */}
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-blue-600 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Tìm từ khóa trong nội dung OCR (Bôi màu vàng)..."
                    value={ocrSearchQuery}
                    onChange={(e) => setOcrSearchQuery(e.target.value)}
                    className="w-full bg-blue-50/50 border border-blue-200 rounded-lg pl-9 pr-8 py-1.5 text-xs text-slate-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition"
                  />
                  {ocrSearchQuery && (
                    <button
                      onClick={() => setOcrSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {ocrSearchQuery.trim() && (
                    <span className="text-[11px] px-2.5 py-1 rounded-lg bg-yellow-100 text-yellow-900 font-bold border border-yellow-300 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-yellow-700" />
                      {ocrMatchCount > 0 ? `Tìm thấy ${ocrMatchCount} từ khóa khớp` : 'Không có từ khóa khớp'}
                    </span>
                  )}
                  
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(fullOcrText);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-xs font-bold text-blue-700 border border-blue-200 rounded-lg transition cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copied ? 'Đã sao chép!' : 'Sao chép toàn văn'}
                  </button>
                </div>
              </div>

              {/* OCR Text Box with Yellow Highlight */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 font-mono text-xs text-slate-800 leading-relaxed whitespace-pre-wrap max-h-[500px] overflow-y-auto shadow-sm select-text">
                <HighlightText text={fullOcrText} search={ocrSearchQuery} />
              </div>
            </div>
          )}

          {activeTab === 'meta' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Admin Metadata Control Toolbar */}
              {isAdmin && (
                <div className="md:col-span-2 bg-gradient-to-r from-blue-50 via-indigo-50/70 to-blue-50 border border-blue-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-blue-700 text-white shadow-xs">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                        <span>Quản Trị Viên (Admin) - Thao Tác Sửa &amp; Xóa Metadata</span>
                        <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-amber-400 text-slate-950">Admin Role</span>
                      </div>
                      <p className="text-[11px] text-blue-900/80">
                        Admin có toàn quyền chỉnh sửa các thuộc tính pháp lý, sửa/xóa các trường metadata hoặc xóa tài liệu khỏi thư viện.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setIsEditMetadataOpen(true)}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Sửa Metadata</span>
                    </button>
                    <button
                      onClick={handleDeleteDocument}
                      className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xóa tài liệu</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3 shadow-sm">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Thông tin Định danh Pháp lý
                  </h4>
                  {isAdmin && (
                    <button
                      onClick={() => setIsEditMetadataOpen(true)}
                      className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Sửa thuộc tính</span>
                    </button>
                  )}
                </div>
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-500 font-medium">Số ký hiệu:</span>
                    <span className="font-mono font-bold text-blue-700">{code}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-500 font-medium">Cơ quan ban hành:</span>
                    <span className="text-slate-800 font-semibold">{issuingUnit}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-500 font-medium">Ngày ban hành:</span>
                    <span className="text-slate-800">{date}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-500 font-medium">Thời hạn bảo quản:</span>
                    <span className="text-emerald-700 font-bold">{retention}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-500 font-medium">Độ mật:</span>
                    <span className="text-slate-800 font-semibold">{currentDoc.securityLevel || 'THƯỜNG'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3 shadow-sm">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 pb-2">
                  Quy trình & Nhân sự phụ trách
                </h4>
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-500 font-medium">Người tạo / Chuyên viên:</span>
                    <span className="text-slate-800 font-semibold">{currentDoc.createdByName || currentDoc.creatorName || currentDoc.registeredByName || 'Nguyễn Văn Cường'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-500 font-medium">Người thẩm tra / Duyệt:</span>
                    <span className="text-slate-800 font-semibold">{currentDoc.assignedReviewerName || currentDoc.deptLeadName || currentDoc.nguoiKy || 'Trần Thị Thu Hương'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-500 font-medium">Trạng thái hiện tại:</span>
                    <span className="text-blue-700 font-bold">{currentDoc.status || currentDoc.currentStep || 'ĐÃ LƯU TRỮ HSTL'}</span>
                  </div>
                  {currentDoc.hasStamp !== undefined && (
                    <div className="flex justify-between py-1 border-b border-gray-100">
                      <span className="text-gray-500 font-medium">Phân loại dấu đỏ:</span>
                      <span className={`font-bold ${currentDoc.hasStamp ? 'text-red-700' : 'text-amber-700'}`}>
                        {currentDoc.hasStamp ? 'Đã có con dấu đỏ ban hành' : '📝 Tài liệu chưa có dấu (Trình duyệt)'}
                      </span>
                    </div>
                  )}
                  {currentDoc.submissionComment && (
                    <div className="py-2 border-b border-gray-100">
                      <span className="text-gray-500 font-medium block mb-1">Ý kiến người trình ({currentDoc.createdByName}):</span>
                      <div className="p-2 rounded bg-blue-50/70 border border-blue-200 text-blue-950 text-[11px] font-medium">
                        {currentDoc.submissionComment}
                      </div>
                    </div>
                  )}
                  {currentDoc.reviewNote && (
                    <div className="py-2 border-b border-gray-100">
                      <span className="text-gray-500 font-medium block mb-1">Ý kiến Trưởng phòng:</span>
                      <div className="p-2 rounded bg-amber-50/70 border border-amber-200 text-slate-800 text-[11px] font-medium">
                        {currentDoc.reviewNote}
                      </div>
                    </div>
                  )}
                  {currentDoc.coordinations && currentDoc.coordinations.length > 0 && (
                    <div className="py-2 border-b border-gray-100">
                      <span className="text-gray-500 font-medium block mb-1">Đơn vị phối hợp lấy ý kiến ({currentDoc.coordinations.length}):</span>
                      <div className="space-y-1">
                        {currentDoc.coordinations.map((c: any) => (
                          <div key={c.id} className="p-1.5 rounded bg-blue-50 border border-blue-200 text-[11px] flex justify-between items-center">
                            <span className="font-bold text-blue-900">{c.unitName}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${c.status === 'FEEDBACK_PROVIDED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                              {c.status === 'FEEDBACK_PROVIDED' ? '✓ Đã phản hồi' : '⏳ Đang xử lý'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {currentDoc.printedInfo && (
                    <div className="py-2 border-b border-gray-100">
                      <span className="text-gray-500 font-medium block mb-1">Thông tin in xuất bản trình Lãnh đạo:</span>
                      <div className="p-2 rounded bg-purple-50 border border-purple-200 text-slate-800 text-[11px]">
                        <div>Trình: <strong>{currentDoc.printedInfo.targetLeaderName}</strong></div>
                        <div className="text-[10px] text-gray-500">Người in: {currentDoc.printedInfo.printedBy} • {currentDoc.printedInfo.printedAt?.split('T')[0]}</div>
                        <div className="text-[10px] text-purple-900 mt-0.5 italic">{currentDoc.printedInfo.printNote}</div>
                      </div>
                    </div>
                  )}
                  {currentDoc.leaderSignedInfo && (
                    <div className="py-2 border-b border-gray-100">
                      <span className="text-gray-500 font-medium block mb-1">Xác nhận Lãnh đạo phê duyệt:</span>
                      <div className="p-2 rounded bg-emerald-50 border border-emerald-200 text-slate-800 text-[11px]">
                        <div>Lãnh đạo ký: <strong className="text-emerald-900">{currentDoc.leaderSignedInfo.leaderName}</strong></div>
                        <div className="text-[10px] text-gray-500">Ngày ký: {currentDoc.leaderSignedInfo.signedDate}</div>
                        {currentDoc.leaderSignedInfo.scanFileName && (
                          <div className="text-[10px] text-emerald-800 mt-0.5 font-mono">Tệp scan dấu đỏ: {currentDoc.leaderSignedInfo.scanFileName}</div>
                        )}
                      </div>
                    </div>
                  )}
                  {currentDoc.banSaoDienTuIssuedCount !== undefined && (
                    <div className="flex justify-between py-1 border-b border-gray-100">
                      <span className="text-gray-500 font-medium">Số lần cấp bản sao điện tử:</span>
                      <span className="text-blue-700 font-mono font-bold">{currentDoc.banSaoDienTuIssuedCount} lượt</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Dynamic Metadata Attributes Card (Admin Configured per Document Type) */}
              {currentDoc.customMetadata && Object.keys(currentDoc.customMetadata).length > 0 && (
                <div className="md:col-span-2 bg-gradient-to-br from-blue-50/90 via-indigo-50/40 to-white border border-blue-200 rounded-xl p-5 space-y-3 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-blue-200/80 pb-2.5 gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-blue-600 text-white shadow-xs">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-blue-950 uppercase tracking-wider">
                          Thuộc Tính Metadata Đặc Thù ({schema?.name || currentDoc.loaiVanBan})
                        </h4>
                        <p className="text-[11px] text-slate-500 font-medium">
                          Các trường mở rộng do Quản trị viên (Admin) thiết lập trong Trang Quản trị
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                        {Object.keys(currentDoc.customMetadata).length} trường dữ liệu
                      </span>
                      {isAdmin && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setIsEditMetadataOpen(true)}
                            className="text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition flex items-center gap-1 cursor-pointer"
                            title="Chỉnh sửa hoặc bổ sung trường metadata"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Sửa</span>
                          </button>
                          <button
                            onClick={handleClearAllCustomMetadata}
                            className="text-xs font-semibold px-2 py-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition cursor-pointer"
                            title="Xóa tất cả các trường metadata đặc thù"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Xóa hết</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                    {Object.entries(currentDoc.customMetadata).map(([k, v]) => {
                      const fieldDef = schema?.fields?.find(f => f.key === k);
                      return (
                        <div key={k} className="p-3 rounded-lg bg-white border border-blue-100 shadow-2xs space-y-1 relative group">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                              {fieldDef?.type === 'currency' && <DollarSign className="w-3 h-3 text-emerald-600" />}
                              {fieldDef?.type === 'date' && <Calendar className="w-3 h-3 text-blue-600" />}
                              <span>{getFieldLabel(k)}</span>
                            </span>
                            <div className="flex items-center gap-1">
                              {fieldDef?.unit && (
                                <span className="text-[9px] font-semibold bg-gray-100 text-gray-600 px-1 py-0.5 rounded">
                                  {fieldDef.unit}
                                </span>
                              )}
                              {isAdmin && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteSingleMetadataField(k);
                                  }}
                                  className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                                  title={`Xóa trường ${getFieldLabel(k)} khỏi tài liệu này`}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="text-xs">{formatMetaValue(k, v)}</div>
                          {fieldDef?.description && (
                            <p className="text-[9px] text-gray-400 italic">{fieldDef.description}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* If no custom metadata, show prompt for Admin */}
              {isAdmin && (!currentDoc.customMetadata || Object.keys(currentDoc.customMetadata).length === 0) && (
                <div className="md:col-span-2 border border-dashed border-blue-300 rounded-xl p-4 bg-blue-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-blue-950">Tài liệu này chưa có thuộc tính metadata đặc thù</div>
                      <p className="text-[11px] text-blue-800/80">Quản trị viên có thể bấm nút bên dưới để bổ sung các trường metadata cho tài liệu.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsEditMetadataOpen(true)}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm / Sửa Metadata</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'location' && (
            <div className="space-y-4">
              {location ? (() => {
                const phongBan = location.phongBan || location.donVi || 'Văn phòng Tổng công ty (Phòng Hành chính - Lưu trữ)';
                const ke = location.ke || 'Kệ K-01 (Văn bản Đến & Chỉ đạo)';
                const ngan = location.ngan || 'Ngăn N-01';
                const hop = location.hop || 'Hộp / Cặp H-01';
                const hoSo = location.hoSo || 'Hồ sơ số 01 (HS-01)';
                const barcodeText = location.maVach || `VP-${(ke.split(' ')[0] || 'K01').replace(/[^a-zA-Z0-9]/g, '')}-${(ngan.split(' ')[0] || 'N01').replace(/[^a-zA-Z0-9]/g, '')}-${(hop.split(' ')[0] || 'H01').replace(/[^a-zA-Z0-9]/g, '')}-HS01`;

                return (
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-6 shadow-sm">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-4 gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-blue-50 text-blue-700 border border-blue-100">
                          <Archive className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-[#1e293b]">
                            Tọa độ Kho Vật lý Theo Tiêu Chuẩn Lưu Trữ 5 Cấp
                          </h4>
                          <p className="text-xs text-gray-500 font-medium mt-0.5">
                            Quy chuẩn định vị chuẩn hóa: <span className="font-bold text-blue-700">Phòng / Ban / Đơn vị con ➔ Kệ ➔ Ngăn ➔ Hộp / Cặp ➔ Hồ sơ</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <div className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
                          <Barcode className="w-3.5 h-3.5 text-emerald-700" />
                          <span>MÃ VẠCH: {barcodeText}</span>
                        </div>
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => setIsEditMetadataOpen(true)}
                            className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                            title="Điều chỉnh tọa độ kho 5 cấp"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Đổi tọa độ</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Breadcrumb Path (5 Cấp) */}
                    <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-slate-50 border border-blue-100 rounded-xl p-3 flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="text-gray-500 font-semibold text-[11px]">Đường dẫn vật lý 5 cấp:</span>
                      <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-900 font-bold flex items-center gap-1 text-[11px]">
                        <Building2 className="w-3 h-3 text-blue-700" /> {phongBan}
                      </span>
                      <ArrowRight className="w-3 h-3 text-blue-400 shrink-0" />
                      <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-900 font-bold flex items-center gap-1 text-[11px]">
                        <Layers className="w-3 h-3 text-purple-700" /> {ke}
                      </span>
                      <ArrowRight className="w-3 h-3 text-blue-400 shrink-0" />
                      <span className="px-2 py-0.5 rounded-md bg-teal-100 text-teal-900 font-bold text-[11px]">
                        {ngan}
                      </span>
                      <ArrowRight className="w-3 h-3 text-blue-400 shrink-0" />
                      <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-950 font-bold flex items-center gap-1 text-[11px]">
                        <Box className="w-3 h-3 text-amber-700" /> {hop}
                      </span>
                      <ArrowRight className="w-3 h-3 text-blue-400 shrink-0" />
                      <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-950 font-bold flex items-center gap-1 text-[11px]">
                        <FolderArchive className="w-3 h-3 text-rose-700" /> {hoSo}
                      </span>
                    </div>

                    {/* 5 Level Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                      {/* Cấp 1: Phòng / Ban / Đơn vị con */}
                      <div className="bg-gray-50/80 p-3.5 rounded-xl border border-gray-200 text-center flex flex-col justify-between hover:border-blue-300 transition">
                        <div className="flex items-center justify-center gap-1 mb-1.5">
                          <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-bold">1</span>
                          <span className="text-[10px] text-gray-600 uppercase font-bold tracking-wider">Phòng / Ban / Đơn vị con</span>
                        </div>
                        <span className="text-xs font-bold text-blue-800 line-clamp-2" title={phongBan}>
                          {phongBan}
                        </span>
                        <span className="text-[9px] text-gray-400 mt-1 font-medium">Đơn vị quản lý hồ sơ</span>
                      </div>

                      {/* Cấp 2: Kệ */}
                      <div className="bg-gray-50/80 p-3.5 rounded-xl border border-gray-200 text-center flex flex-col justify-between hover:border-purple-300 transition">
                        <div className="flex items-center justify-center gap-1 mb-1.5">
                          <span className="w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center text-[9px] font-bold">2</span>
                          <span className="text-[10px] text-gray-600 uppercase font-bold tracking-wider">Kệ Lưu Trữ</span>
                        </div>
                        <span className="text-xs font-bold text-purple-800 line-clamp-2" title={ke}>
                          {ke}
                        </span>
                        <span className="text-[9px] text-gray-400 mt-1 font-medium">Dãy giá kệ</span>
                      </div>

                      {/* Cấp 3: Ngăn */}
                      <div className="bg-gray-50/80 p-3.5 rounded-xl border border-gray-200 text-center flex flex-col justify-between hover:border-teal-300 transition">
                        <div className="flex items-center justify-center gap-1 mb-1.5">
                          <span className="w-4 h-4 rounded-full bg-teal-600 text-white flex items-center justify-center text-[9px] font-bold">3</span>
                          <span className="text-[10px] text-gray-600 uppercase font-bold tracking-wider">Ngăn Kệ</span>
                        </div>
                        <span className="text-xs font-bold text-teal-800 line-clamp-2" title={ngan}>
                          {ngan}
                        </span>
                        <span className="text-[9px] text-gray-400 mt-1 font-medium">Tầng ngăn</span>
                      </div>

                      {/* Cấp 4: Hộp / Cặp */}
                      <div className="bg-gray-50/80 p-3.5 rounded-xl border border-gray-200 text-center flex flex-col justify-between hover:border-amber-300 transition">
                        <div className="flex items-center justify-center gap-1 mb-1.5">
                          <span className="w-4 h-4 rounded-full bg-amber-600 text-white flex items-center justify-center text-[9px] font-bold">4</span>
                          <span className="text-[10px] text-gray-600 uppercase font-bold tracking-wider">Hộp / Cặp</span>
                        </div>
                        <span className="text-xs font-bold text-amber-800 line-clamp-2" title={hop}>
                          {hop}
                        </span>
                        <span className="text-[9px] text-gray-400 mt-1 font-medium">Hộp / cặp lưu trữ</span>
                      </div>

                      {/* Cấp 5: Hồ sơ */}
                      <div className="bg-gray-50/80 p-3.5 rounded-xl border border-gray-200 text-center flex flex-col justify-between hover:border-rose-300 transition">
                        <div className="flex items-center justify-center gap-1 mb-1.5">
                          <span className="w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center text-[9px] font-bold">5</span>
                          <span className="text-[10px] text-gray-600 uppercase font-bold tracking-wider">Hồ Sơ</span>
                        </div>
                        <span className="text-xs font-bold text-rose-800 line-clamp-2" title={hoSo}>
                          {hoSo}
                        </span>
                        <span className="text-[9px] text-gray-400 mt-1 font-medium">Hồ sơ tài liệu</span>
                      </div>
                    </div>

                    {/* Visual Barcode Display */}
                    <div className="bg-slate-950 text-white p-5 rounded-xl flex flex-col items-center justify-center space-y-2.5 border border-slate-800 shadow-md">
                      <div className="h-11 flex items-center justify-center gap-1 px-4 py-1 bg-white/5 rounded-lg">
                        {Array.from({ length: 48 }).map((_, i) => (
                          <div
                            key={i}
                            className={`h-full ${i % 4 === 0 ? 'w-1.5 bg-white' : i % 3 === 0 ? 'w-1 bg-white' : i % 2 === 0 ? 'w-0.5 bg-white' : 'w-1.5 bg-white'}`}
                          />
                        ))}
                      </div>
                      <span className="font-mono text-xs sm:text-sm font-bold tracking-widest text-emerald-400">
                        {barcodeText}
                      </span>
                      <div className="flex items-center gap-2 text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                        <span>TỔNG CÔNG TY ĐƯỜNG SẮT VIỆT NAM</span>
                        <span>•</span>
                        <span>ĐỊNH VỊ KHO LƯU TRỮ VẬT LÝ 5 CẤP</span>
                      </div>
                    </div>
                  </div>
                );
              })() : (
                <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-500 text-xs shadow-sm space-y-2">
                  <Archive className="w-8 h-8 text-gray-300 mx-auto" />
                  <p className="font-medium">Chưa định vị kho vật lý cho hồ sơ này (Đang trong quy trình tiếp nhận &amp; lưu trữ).</p>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => setIsEditMetadataOpen(true)}
                      className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Thiết lập định vị kho 5 cấp</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'versions' && (
            <div className="space-y-5 animate-fadeIn max-w-4xl mx-auto">
              {/* Header Control Card */}
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100">
                      <History className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm sm:text-base font-bold text-slate-900">
                          Quản lý &amp; Lịch sử Phiên bản Văn bản
                        </h4>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                          v{currentVersionNum}.0 Hiện hành
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Theo dõi toàn bộ chu kỳ chỉnh sửa, đối soát các bản cập nhật phụ lục và thay đổi tệp đính kèm ({docVersions.length} phiên bản đã lưu trữ)
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddingVersion(!isAddingVersion)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer shrink-0"
                >
                  <FileUp className="w-4 h-4" />
                  <span>{isAddingVersion ? 'Đóng form tải lên' : `+ Cập nhật Phiên bản Mới (v${nextVersionNum}.0)`}</span>
                </button>
              </div>

              {/* Upload Form Card (when isAddingVersion is active) */}
              {isAddingVersion && (
                <form
                  onSubmit={handleSaveNewVersion}
                  className="bg-gradient-to-br from-indigo-50/60 to-white border-2 border-dashed border-indigo-300 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4 animate-fadeIn"
                >
                  <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-mono font-bold text-xs flex items-center justify-center">
                        v{nextVersionNum}
                      </span>
                      <h5 className="text-sm font-bold text-indigo-950">
                        Biểu mẫu tải lên phiên bản kế tiếp: v{nextVersionNum}.0
                      </h5>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAddingVersion(false)}
                      className="text-gray-400 hover:text-slate-700 text-xs font-bold cursor-pointer"
                    >
                      ✕ Hủy
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Tên nhãn phiên bản:
                      </label>
                      <input
                        type="text"
                        value={newVersionCustomLabel}
                        onChange={(e) => setNewVersionCustomLabel(e.target.value)}
                        placeholder={`v${nextVersionNum}.0 - Bản cập nhật sửa đổi, bổ sung phụ lục`}
                        className="w-full bg-white border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 shadow-2xs outline-none"
                      />
                      <p className="text-[10px] text-gray-500 mt-1">
                        Đặt tên gợi nhớ để các phòng ban dễ nhận biết khi tra cứu.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Tệp đính kèm phiên bản mới (.pdf, .docx, .dwg):
                      </label>
                      <div className="flex items-center gap-2">
                        <label className="flex-1 flex items-center justify-between px-3 py-2 rounded-xl bg-white border border-gray-300 hover:border-indigo-400 cursor-pointer shadow-2xs text-xs">
                          <span className="truncate text-slate-700 font-medium">
                            {newVersionFile ? newVersionFile.name : 'Chọn tệp từ máy tính...'}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-bold shrink-0 ml-2">
                            Duyệt file
                          </span>
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) {
                                setNewVersionFile({
                                  name: f.name,
                                  size: (f.size / (1024 * 1024)).toFixed(1) + ' MB'
                                });
                              }
                            }}
                          />
                        </label>
                        {newVersionFile && (
                          <span className="text-[10px] font-mono text-emerald-700 font-bold shrink-0">
                            {newVersionFile.size}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                      <span>Tóm tắt nội dung thay đổi &amp; Lý do cập nhật <span className="text-red-500">*</span></span>
                      <span className="text-[10px] text-gray-400 font-normal">Bắt buộc theo chuẩn văn thư</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={newVersionNote}
                      onChange={(e) => setNewVersionNote(e.target.value)}
                      placeholder="Mô tả cụ thể các điểm sửa đổi, bổ sung so với phiên bản trước (Ví dụ: Tiếp thu ý kiến góp ý của Ban An toàn, bổ sung số liệu kiểm định vỏ hầm Km 760, cập nhật dự toán đính kèm...)"
                      className="w-full bg-white border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl p-3 text-xs text-slate-900 shadow-2xs outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-indigo-100">
                    <button
                      type="button"
                      onClick={() => setIsAddingVersion(false)}
                      className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 text-xs font-bold transition cursor-pointer"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Lưu &amp; Kích hoạt Phiên bản v{nextVersionNum}.0</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Version History List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-indigo-600" />
                    Lịch trình các phiên bản ({docVersions.length})
                  </h5>
                  <span className="text-[11px] text-slate-500">
                    Sắp xếp theo thứ tự mới nhất
                  </span>
                </div>

                {docVersions.map((v, idx) => {
                  const isCurrent = v.version === currentVersionNum;
                  return (
                    <div
                      key={v.id || `ver-${v.version}-${idx}`}
                      className={`bg-white border rounded-2xl p-4 sm:p-5 transition ${
                        isCurrent
                          ? 'border-emerald-300 shadow-sm ring-2 ring-emerald-500/10'
                          : 'border-gray-200 hover:border-indigo-200'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                        <div className="flex items-center gap-2.5">
                          <span className={`px-2.5 py-1 rounded-xl text-xs font-mono font-extrabold ${
                            isCurrent
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}>
                            v{v.version}.0
                          </span>
                          <div>
                            <h6 className="text-xs sm:text-sm font-bold text-slate-900">
                              {v.versionLabel || `Phiên bản v${v.version}.0`}
                            </h6>
                            <div className="text-[11px] text-gray-500 flex items-center gap-1.5 mt-0.5">
                              <Calendar className="w-3 h-3 text-gray-400" />
                              <span>{new Date(v.uploadedAt).toLocaleString('vi-VN')}</span>
                              <span>•</span>
                              <Users className="w-3 h-3 text-gray-400" />
                              <span className="font-semibold text-slate-700">{v.uploadedByName}</span>
                              {v.uploadedByRole && <span className="text-gray-400">({v.uploadedByRole})</span>}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          {isCurrent ? (
                            <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Đang áp dụng (Hiện hành)
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSwitchActiveVersion(v.version)}
                              className="px-3 py-1 rounded-full text-[11px] font-bold bg-gray-100 hover:bg-emerald-50 text-gray-700 hover:text-emerald-800 hover:border-emerald-300 border border-gray-300 transition flex items-center gap-1 cursor-pointer"
                              title="Đặt phiên bản này làm bản chính thức hiển thị"
                            >
                              <RefreshCw className="w-3 h-3" />
                              <span>Đặt làm bản hiện hành</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* File Details & Actions */}
                      <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70 border border-gray-100 rounded-xl p-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="p-1.5 rounded-lg bg-blue-100 text-blue-800 shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-800 truncate font-mono">
                              {v.fileName}
                            </div>
                            <div className="text-[10px] text-gray-500">
                              Dung lượng: <span className="font-semibold text-slate-700">{v.fileSize}</span> • Định dạng tệp chính thống
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedVersionForPreview(v);
                              setActiveTab('preview');
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-indigo-50 border border-gray-200 hover:border-indigo-200 text-indigo-700 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Xem tệp bản này</span>
                          </button>
                          <a
                            href={v.fileUrl || '#'}
                            download={v.fileName}
                            className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-gray-100 border border-gray-200 text-slate-700 text-[11px] font-bold transition flex items-center gap-1"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Tải về</span>
                          </a>
                        </div>
                      </div>

                      {/* Change Log Content */}
                      <div className="mt-3 p-3 rounded-xl bg-amber-50/60 border border-amber-200/80 text-xs">
                        <div className="font-bold text-amber-950 flex items-center gap-1.5 mb-1">
                          <MessageSquare className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                          <span>Ghi chú nội dung thay đổi &amp; cập nhật:</span>
                        </div>
                        <p className="text-slate-800 leading-relaxed pl-5 italic">
                          "{v.changeNote}"
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Version Comparison Table */}
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  Bảng đối chiếu tổng hợp các phiên bản
                </h5>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50/80 text-gray-600">
                        <th className="py-2.5 px-3 font-bold">Phiên bản</th>
                        <th className="py-2.5 px-3 font-bold">Thời gian cập nhật</th>
                        <th className="py-2.5 px-3 font-bold">Cán bộ thực hiện</th>
                        <th className="py-2.5 px-3 font-bold">Tên tệp</th>
                        <th className="py-2.5 px-3 font-bold">Tóm tắt thay đổi</th>
                        <th className="py-2.5 px-3 font-bold text-center">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-slate-700">
                      {docVersions.map((v) => (
                        <tr key={v.id || `row-${v.version}`} className="hover:bg-slate-50 transition">
                          <td className="py-2.5 px-3 font-mono font-bold text-indigo-700">
                            v{v.version}.0
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                            {new Date(v.uploadedAt).toLocaleDateString('vi-VN')}
                          </td>
                          <td className="py-2.5 px-3 font-medium text-slate-900 whitespace-nowrap">
                            {v.uploadedByName}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[11px] text-blue-800 max-w-[160px] truncate">
                            {v.fileName}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 max-w-xs truncate" title={v.changeNote}>
                            {v.changeNote}
                          </td>
                          <td className="py-2.5 px-3 text-center whitespace-nowrap">
                            {v.version === currentVersionNum ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                Áp dụng
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600">
                                Lưu vết
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
            </>
          )}
        </div>
      </div>

      {/* Admin Metadata Edit Modal */}
      {isAdmin && (
        <EditDocumentMetadataModal
          isOpen={isEditMetadataOpen}
          onClose={() => setIsEditMetadataOpen(false)}
          document={currentDoc}
          docType={docType}
          onSuccess={(updated) => {
            setCurrentDoc(updated);
          }}
          onDeleteDocument={() => {
            onClose();
          }}
        />
      )}
    </div>
  );
};
