import React, { useState } from 'react';
import { ExistingDocument, UserProfile, RetentionPeriod, PhysicalLocation } from '../../../types';
import { PhysicalLocationSelector } from '../../common/PhysicalLocationSelector';
import { 
  Archive, 
  CheckCircle2, 
  Building2, 
  MapPin, 
  Clock, 
  Tag, 
  ShieldCheck, 
  X,
  FileText
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Luong1VanThuArchiveModalProps {
  doc: ExistingDocument;
  currentUser: UserProfile;
  onClose: () => void;
  onArchive: (
    doc: ExistingDocument, 
    archiveData: {
      retentionPeriod: RetentionPeriod;
      physicalLocation: PhysicalLocation;
    }
  ) => void;
}

export const Luong1VanThuArchiveModal: React.FC<Luong1VanThuArchiveModalProps> = ({
  doc,
  currentUser,
  onClose,
  onArchive
}) => {
  const [retentionPeriod, setRetentionPeriod] = useState<RetentionPeriod>(
    doc.retentionPeriod || 'VĨNH VIỄN'
  );
  const [physicalLocation, setPhysicalLocation] = useState<PhysicalLocation>(
    doc.physicalLocation || {
      kho: 'Kho Lưu trữ Trung tâm Số 1',
      ke: 'Kệ K-01',
      ngan: 'Ngăn N-01',
      hop: 'Hộp H-01',
      maVach: `HSTL-K1-K01-N01-H01-${doc.soKyHieu.replace(/[^a-zA-Z0-9]/g, '')}`
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onArchive(doc, {
      retentionPeriod,
      physicalLocation
    });
    try {
      confetti({ particleCount: 50, spread: 70 });
    } catch (err) {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[94dvh] my-auto text-slate-800">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-gradient-to-r from-[#003882] via-[#094ba1] to-[#002f70] text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 text-white shadow-inner">
              <Archive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                Văn Thư Phê Duyệt &amp; Đưa Vào Thư Viện HSTL
              </h3>
              <p className="text-[11px] text-blue-100">
                Xác nhận thời hạn bảo quản, định vị kho vật lý và số hóa hồ sơ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-blue-100 hover:text-white hover:bg-white/15 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#f8fafc]">
          
          {/* Document Summary */}
          <div className="bg-white border border-gray-200 rounded-xl p-3.5 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {doc.soKyHieu}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">{doc.loaiVanBan}</span>
                {doc.securityLevel === 'MẬT' ? (
                  <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold border border-rose-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span> Mật
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Thường
                  </span>
                )}
              </div>
            </div>
            <p className="text-slate-800 font-semibold text-xs leading-relaxed">
              {doc.trichYeu}
            </p>
            <div className="text-[11px] text-gray-500 flex justify-between border-t border-gray-100 pt-1.5">
              <span>Đơn vị: <strong>{doc.coQuanBanHanh}</strong></span>
              <span>Trưởng phòng duyệt: <strong className="text-emerald-700">{doc.assignedReviewerName}</strong></span>
            </div>
          </div>

          {/* Retention Period */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs space-y-2">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-700" />
              1. Thời hạn bảo quản tài liệu HSTL:
            </label>
            <select
              value={retentionPeriod}
              onChange={(e) => setRetentionPeriod(e.target.value as RetentionPeriod)}
              className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="VĨNH VIỄN">VĨNH VIỄN (Hồ sơ quy hoạch, công trình trọng điểm, văn bản cốt lõi)</option>
              <option value="70 NĂM">70 NĂM (Hồ sơ nhân sự, công trình hạ tầng đường sắt cấp 1)</option>
              <option value="50 NĂM">50 NĂM (Hồ sơ thiết kế kỹ thuật, bản vẽ hoàn công)</option>
              <option value="20 NĂM">20 NĂM (Báo cáo tài chính kiểm toán, hợp đồng kinh tế lớn)</option>
              <option value="10 NĂM">10 NĂM (Biên bản nghiệm thu, kế hoạch sản xuất kinh doanh)</option>
              <option value="5 NĂM">5 NĂM (Công văn trao đổi, tờ trình hành chính định kỳ)</option>
            </select>
          </div>

          {/* Physical Location Selector */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs space-y-2">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-blue-700" />
              2. Định vị vị trí xếp kho vật lý:
            </label>
            <PhysicalLocationSelector
              value={physicalLocation}
              onChange={setPhysicalLocation}
            />
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-slate-900 bg-white border border-gray-200 rounded-xl cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-sm transition cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              Xác Nhận &amp; Đưa Vào Thư Viện HSTL
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
