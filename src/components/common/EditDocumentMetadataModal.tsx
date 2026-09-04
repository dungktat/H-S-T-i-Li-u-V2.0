import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Trash2, 
  Plus, 
  Sliders, 
  ShieldCheck, 
  Lock, 
  Building2, 
  Calendar, 
  FileText, 
  Tag, 
  MapPin, 
  Clock, 
  AlertTriangle,
  Layers,
  Sparkles,
  DollarSign
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { StorageService } from '../../services/storageService';
import { formatCurrencyVND } from './DynamicMetadataFields';
import { PhysicalLocation } from '../../types';
import { PhysicalLocationSelector } from './PhysicalLocationSelector';

interface EditDocumentMetadataModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: any;
  docType?: string;
  onSuccess?: (updatedDoc: any) => void;
  onDeleteDocument?: (docId: string) => void;
}

export const EditDocumentMetadataModal: React.FC<EditDocumentMetadataModalProps> = ({
  isOpen,
  onClose,
  document: doc,
  docType = 'HSTL',
  onSuccess,
  onDeleteDocument
}) => {
  if (!isOpen || !doc) return null;

  // Basic metadata states
  const [soKyHieu, setSoKyHieu] = useState(doc.soKyHieu || doc.soDiFullCode || doc.soKyHieuGoc || doc.code || '');
  const [trichYeu, setTrichYeu] = useState(doc.trichYeu || doc.title || '');
  const [coQuanBanHanh, setCoQuanBanHanh] = useState(
    doc.coQuanBanHanh || doc.coQuanGui || doc.donViSoanThao || doc.creatorDepartment || ''
  );
  const [ngayBanHanh, setNgayBanHanh] = useState(
    doc.ngayBanHanh || doc.ngayKy || (doc.createdAt ? doc.createdAt.split('T')[0] : '')
  );
  const [loaiVanBan, setLoaiVanBan] = useState(doc.loaiVanBan || doc.loaiVanBanLabel || doc.field || 'Quyết định');
  const [retentionPeriod, setRetentionPeriod] = useState(
    doc.retentionPeriod || doc.hstlArchiveInfo?.retentionPeriod || 'VĨNH VIỄN'
  );
  const [securityLevel, setSecurityLevel] = useState<'THƯỜNG' | 'MẬT'>(
    doc.securityLevel === 'MẬT' ? 'MẬT' : 'THƯỜNG'
  );

  // Physical location states (5 levels: Phòng/Ban/Đơn vị con - Kệ - Ngăn - Hộp/Cặp - Hồ sơ)
  const loc = doc.physicalLocation || doc.hstlArchiveInfo?.physicalLocation || {};
  const [physicalLocation, setPhysicalLocation] = useState<PhysicalLocation>({
    phongBan: loc.phongBan || loc.donVi || 'Văn phòng Tổng công ty (Phòng Hành chính - Lưu trữ)',
    ke: loc.ke || 'Kệ K-01 (Văn bản Đến & Chỉ đạo)',
    ngan: loc.ngan || 'Ngăn N-01',
    hop: loc.hop || 'Hộp / Cặp H-01',
    hoSo: loc.hoSo || 'Hồ sơ số 01 (HS-01)',
    maVach: loc.maVach,
    donVi: loc.donVi || 'Văn phòng Tổng công ty',
    khuVuc: loc.khuVuc,
    kho: loc.kho
  });

  // Custom metadata states
  const [customMetadata, setCustomMetadata] = useState<Record<string, any>>(() => {
    return doc.customMetadata ? { ...doc.customMetadata } : {};
  });

  // New field addition states
  const [isAddingField, setIsAddingField] = useState(false);
  const [newFieldKey, setNewFieldKey] = useState('');
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldValue, setNewFieldValue] = useState('');

  // Delete document confirmation
  const [isConfirmingDeleteDoc, setIsConfirmingDeleteDoc] = useState(false);

  // Schema for current docType
  const schema = StorageService.getSchemaForDocType(loaiVanBan);

  useEffect(() => {
    if (doc) {
      setSoKyHieu(doc.soKyHieu || doc.soDiFullCode || doc.soKyHieuGoc || doc.code || '');
      setTrichYeu(doc.trichYeu || doc.title || '');
      setCoQuanBanHanh(doc.coQuanBanHanh || doc.coQuanGui || doc.donViSoanThao || doc.creatorDepartment || '');
      setNgayBanHanh(doc.ngayBanHanh || doc.ngayKy || (doc.createdAt ? doc.createdAt.split('T')[0] : ''));
      setLoaiVanBan(doc.loaiVanBan || doc.loaiVanBanLabel || doc.field || 'Quyết định');
      setRetentionPeriod(doc.retentionPeriod || doc.hstlArchiveInfo?.retentionPeriod || 'VĨNH VIỄN');
      setSecurityLevel(doc.securityLevel === 'MẬT' ? 'MẬT' : 'THƯỜNG');
      
      const l = doc.physicalLocation || doc.hstlArchiveInfo?.physicalLocation || {};
      setPhysicalLocation({
        donVi: l.donVi || 'Tổng công ty Đường sắt Việt Nam',
        khuVuc: l.khuVuc || 'Khu vực A (Tầng 1 - Kho Lưu trữ Trụ sở 118 Lê Duẩn)',
        ke: l.ke || 'Kệ K-01 (Văn bản Đến)',
        ngan: l.ngan || 'Ngăn N-01 (Văn bản Đến 2024)',
        hop: l.hop || 'Hộp H-01',
        hoSo: l.hoSo || 'Hồ sơ số 01 (HS-01)',
        maVach: l.maVach,
        kho: l.kho || 'Kho Lưu trữ Trung tâm Số 1'
      });

      setCustomMetadata(doc.customMetadata ? { ...doc.customMetadata } : {});
      setIsConfirmingDeleteDoc(false);
      setIsAddingField(false);
    }
  }, [doc, isOpen]);

  // Handle custom metadata changes
  const handleCustomFieldChange = (key: string, val: any) => {
    setCustomMetadata(prev => ({
      ...prev,
      [key]: val
    }));
  };

  // Delete single custom metadata field
  const handleDeleteCustomField = (key: string) => {
    const copy = { ...customMetadata };
    delete copy[key];
    setCustomMetadata(copy);
  };

  // Clear all custom metadata
  const handleClearAllCustomMetadata = () => {
    if (confirm('Bạn có chắc chắn muốn xóa tất cả các trường metadata đặc thù của tài liệu này?')) {
      setCustomMetadata({});
    }
  };

  // Add new custom metadata field
  const handleAddNewCustomField = () => {
    const rawKey = newFieldKey.trim() || newFieldLabel.trim();
    if (!rawKey) {
      alert('Vui lòng nhập tên trường metadata!');
      return;
    }
    // Generate valid camelCase or sanitized key
    const key = newFieldKey.trim() || rawKey
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]/g, '_')
      .replace(/^_+|_+$/g, '');

    handleCustomFieldChange(key, newFieldValue);
    setNewFieldKey('');
    setNewFieldLabel('');
    setNewFieldValue('');
    setIsAddingField(false);
  };

  // Save all changes
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!soKyHieu.trim()) {
      alert('Vui lòng nhập Số / Ký hiệu văn bản!');
      return;
    }
    if (!trichYeu.trim()) {
      alert('Vui lòng nhập Trích yếu nội dung!');
      return;
    }

    const updates: Record<string, any> = {
      soKyHieu: soKyHieu.trim(),
      code: soKyHieu.trim(),
      trichYeu: trichYeu.trim(),
      coQuanBanHanh: coQuanBanHanh.trim(),
      ngayBanHanh: ngayBanHanh,
      loaiVanBan: loaiVanBan.trim(),
      retentionPeriod: retentionPeriod,
      securityLevel: securityLevel,
      physicalLocation: physicalLocation,
      customMetadata: Object.keys(customMetadata).length > 0 ? customMetadata : undefined,
      updatedAt: new Date().toISOString()
    };

    // Update in StorageService
    StorageService.updateUniversalDoc(doc.id, updates, docType);

    confetti({ particleCount: 30, spread: 60, origin: { y: 0.6 } });
    if (onSuccess) {
      onSuccess({ ...doc, ...updates });
    }
    onClose();
  };

  // Delete document
  const handleExecuteDeleteDocument = () => {
    StorageService.deleteDocument(doc.id, docType);
    if (onDeleteDocument) {
      onDeleteDocument(doc.id);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 backdrop-blur-xs text-white">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold">Chỉnh Sửa Metadata & Thuộc Tính Tài Liệu</h3>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                  Admin Tool
                </span>
              </div>
              <p className="text-xs text-blue-100 mt-0.5">
                Cập nhật siêu dữ liệu lưu trữ, trường pháp lý và metadata nghiệp vụ mở rộng
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: Thông tin pháp lý cơ bản */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>1. Thuộc tính Pháp lý &amp; Định danh</span>
              </span>
              <span className="text-[11px] text-gray-400">Các trường bắt buộc (*)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Số / Ký hiệu văn bản <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={soKyHieu}
                  onChange={(e) => setSoKyHieu(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold text-blue-900 bg-blue-50/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cơ quan / Đơn vị ban hành <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={coQuanBanHanh}
                  onChange={(e) => setCoQuanBanHanh(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Trích yếu nội dung văn bản <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={trichYeu}
                  onChange={(e) => setTrichYeu(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Loại văn bản / hồ sơ
                </label>
                <select
                  value={loaiVanBan}
                  onChange={(e) => setLoaiVanBan(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium"
                >
                  <option value="Quyết định">Quyết định</option>
                  <option value="Hợp đồng kinh tế">Hợp đồng kinh tế</option>
                  <option value="Hồ sơ thiết kế">Hồ sơ thiết kế</option>
                  <option value="Biên bản nghiệm thu">Biên bản nghiệm thu</option>
                  <option value="Báo cáo kỹ thuật">Báo cáo kỹ thuật</option>
                  <option value="Phương án kỹ thuật">Phương án kỹ thuật</option>
                  <option value="Tờ trình">Tờ trình</option>
                  <option value="Công văn">Công văn</option>
                  <option value="Văn bản Đến">Văn bản Đến</option>
                  <option value="Văn bản Đi">Văn bản Đi</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ngày ban hành / Ngày ký
                </label>
                <input
                  type="date"
                  value={ngayBanHanh}
                  onChange={(e) => setNgayBanHanh(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Thời hạn bảo quản HSTL
                </label>
                <select
                  value={retentionPeriod}
                  onChange={(e) => setRetentionPeriod(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium"
                >
                  <option value="VĨNH VIỄN">VĨNH VIỄN</option>
                  <option value="70 NĂM">70 NĂM</option>
                  <option value="50 NĂM">50 NĂM</option>
                  <option value="20 NĂM">20 NĂM</option>
                  <option value="10 NĂM">10 NĂM</option>
                  <option value="5 NĂM">5 NĂM</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phân loại Bảo mật
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSecurityLevel('THƯỜNG')}
                    className={`flex-1 py-1.5 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition ${
                      securityLevel === 'THƯỜNG'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800 ring-2 ring-emerald-100'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>THƯỜNG</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSecurityLevel('MẬT')}
                    className={`flex-1 py-1.5 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition ${
                      securityLevel === 'MẬT'
                        ? 'bg-rose-50 border-rose-300 text-rose-800 ring-2 ring-rose-100'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5 text-rose-600" />
                    <span>MẬT</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Vị trí kho vật lý 6 Cấp */}
          <div className="space-y-2">
            <PhysicalLocationSelector
              value={physicalLocation}
              onChange={setPhysicalLocation}
            />
          </div>

          {/* Section 3: Thuộc tính Metadata Đặc Thù (Custom Metadata) */}
          <div className="space-y-4 rounded-xl p-4 bg-gradient-to-br from-blue-50/70 via-indigo-50/30 to-white border border-blue-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-blue-200 pb-2.5 gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-600 text-white shadow-xs">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-extrabold text-blue-950 uppercase tracking-wider">
                    3. Thuộc Tính Metadata Đặc Thù ({schema?.name || loaiVanBan})
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Quản trị viên có thể sửa đổi, bổ sung hoặc xóa các trường metadata
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {Object.keys(customMetadata).length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllCustomMetadata}
                    className="text-[11px] font-semibold text-red-600 hover:text-red-800 px-2 py-1 rounded hover:bg-red-50 transition cursor-pointer"
                  >
                    Xóa tất cả metadata
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsAddingField(true)}
                  className="text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition flex items-center gap-1 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm trường mới</span>
                </button>
              </div>
            </div>

            {/* Form thêm trường metadata tùy biến mới */}
            {isAddingField && (
              <div className="p-3 bg-white rounded-xl border border-blue-300 shadow-xs space-y-2.5 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-900">Bổ sung trường Metadata tùy biến mới:</span>
                  <button
                    type="button"
                    onClick={() => setIsAddingField(false)}
                    className="text-gray-400 hover:text-slate-800 text-xs"
                  >
                    Đóng
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Mã trường (vd: diaDiemThiCong)"
                    value={newFieldKey}
                    onChange={(e) => setNewFieldKey(e.target.value)}
                    className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                  <input
                    type="text"
                    placeholder="Tên hiển thị (vd: Địa điểm thi công)"
                    value={newFieldLabel}
                    onChange={(e) => setNewFieldLabel(e.target.value)}
                    className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Giá trị ban đầu"
                    value={newFieldValue}
                    onChange={(e) => setNewFieldValue(e.target.value)}
                    className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingField(false)}
                    className="text-xs px-3 py-1 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleAddNewCustomField}
                    className="text-xs font-bold px-3 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    Xác nhận thêm
                  </button>
                </div>
              </div>
            )}

            {/* List of current custom fields */}
            {Object.keys(customMetadata).length === 0 ? (
              <div className="py-6 text-center text-xs text-gray-400 bg-white/60 rounded-xl border border-dashed border-gray-300">
                Tài liệu này chưa có trường metadata đặc thù nào. Hãy bấm &quot;Thêm trường mới&quot; để thiết lập.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(customMetadata).map(([key, value]) => {
                  const schemaField = schema?.fields?.find(f => f.key === key);
                  const isCurrency = schemaField?.type === 'currency' || key.toLowerCase().includes('giatri');

                  return (
                    <div key={key} className="p-3 bg-white rounded-xl border border-blue-100 shadow-xs space-y-1.5 relative group">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1 truncate">
                          {isCurrency && <DollarSign className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                          <span>{schemaField?.label || key}</span>
                        </label>

                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-mono text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                            {key}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteCustomField(key)}
                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition cursor-pointer"
                            title="Xóa trường metadata này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {schemaField?.type === 'boolean' ? (
                        <select
                          value={value ? 'true' : 'false'}
                          onChange={(e) => handleCustomFieldChange(key, e.target.value === 'true')}
                          className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                          <option value="true">Đạt / Đúng / Có áp dụng</option>
                          <option value="false">Không áp dụng</option>
                        </select>
                      ) : schemaField?.type === 'date' ? (
                        <input
                          type="date"
                          value={value || ''}
                          onChange={(e) => handleCustomFieldChange(key, e.target.value)}
                          className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <div>
                          <input
                            type={isCurrency || typeof value === 'number' ? 'text' : 'text'}
                            value={value !== undefined && value !== null ? value : ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (isCurrency) {
                                const num = parseFloat(val.replace(/[^\d]/g, ''));
                                handleCustomFieldChange(key, isNaN(num) ? 0 : num);
                              } else {
                                handleCustomFieldChange(key, val);
                              }
                            }}
                            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 font-medium text-slate-800"
                          />
                          {isCurrency && typeof value === 'number' && value > 0 && (
                            <div className="text-[10px] text-emerald-700 font-bold mt-0.5">
                              {formatCurrencyVND(value)}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 4: Khu vực Quản trị rủi ro (Admin Danger Zone) */}
          <div className="rounded-xl border border-red-200 bg-red-50/50 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-900 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span>Khu Vực Quản Trị Cấp Cao: Xóa Tài Liệu Khỏi HSTL</span>
              </div>
            </div>
            <p className="text-[11px] text-red-700">
              Chỉ Quản trị viên (Admin) mới có quyền xóa tài liệu và metadata này khỏi thư viện lưu trữ.
            </p>

            {!isConfirmingDeleteDoc ? (
              <button
                type="button"
                onClick={() => setIsConfirmingDeleteDoc(true)}
                className="text-xs font-bold px-3 py-1.5 rounded-lg border border-red-300 bg-white text-red-700 hover:bg-red-100 transition cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa Tài Liệu Này Khỏi Thư Viện</span>
              </button>
            ) : (
              <div className="p-3 bg-white rounded-lg border border-red-300 space-y-2 animate-fadeIn">
                <div className="text-xs font-bold text-red-900">
                  Xác nhận xóa tài liệu: <u>{soKyHieu}</u>?
                </div>
                <div className="text-[11px] text-gray-500">
                  Tất cả metadata và dữ liệu OCR của tài liệu này sẽ bị gỡ bỏ khỏi hệ thống.
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsConfirmingDeleteDoc(false)}
                    className="text-xs px-3 py-1 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="button"
                    onClick={handleExecuteDeleteDocument}
                    className="text-xs font-bold px-3 py-1 rounded-md bg-red-600 text-white hover:bg-red-700 cursor-pointer shadow-xs"
                  >
                    Đồng ý xóa vĩnh viễn
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Form Actions Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-semibold px-4 py-2 rounded-xl border border-gray-300 text-slate-700 hover:bg-gray-100 transition cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="text-xs font-bold px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Lưu Cập Nhật Metadata</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
