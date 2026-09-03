import React, { useState } from 'react';
import { ExistingDocument, UserProfile, RetentionPeriod, PhysicalLocation } from '../../../types';
import { PhysicalLocationSelector } from '../../common/PhysicalLocationSelector';
import { 
  Archive, 
  UploadCloud, 
  CheckCircle, 
  FileText, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';

interface Luong1LeaderSignedModalProps {
  doc: ExistingDocument;
  currentUser: UserProfile;
  onClose: () => void;
  onArchive: (doc: ExistingDocument, data: {
    retentionPeriod: RetentionPeriod;
    physicalLocation: PhysicalLocation;
    leaderSignedInfo: {
      leaderName: string;
      signedDate: string;
      notes?: string;
      scanDauDoUrl?: string;
      scanFileName?: string;
    };
  }) => void;
}

export const Luong1LeaderSignedModal: React.FC<Luong1LeaderSignedModalProps> = ({
  doc,
  currentUser,
  onClose,
  onArchive
}) => {
  const [leaderName, setLeaderName] = useState(doc.printedInfo?.targetLeaderName || 'Hoàng Gia Khánh - Tổng Giám Đốc');
  const [signedDate, setSignedDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('Lãnh đạo Tổng công ty đã ký phê duyệt và Văn phòng đã đóng dấu đỏ ban hành.');
  const [uploadedScan, setUploadedScan] = useState<{ name: string; size: string } | null>({
    name: `${doc.soKyHieu.replace(/\//g, '_')}_Signed_Stamped_Final.pdf`,
    size: '3.6 MB'
  });

  const [retentionPeriod, setRetentionPeriod] = useState<RetentionPeriod>('VĨNH VIỄN');
  const [physicalLocation, setPhysicalLocation] = useState<PhysicalLocation>({
    kho: 'Kho Lưu trữ Trung tâm Số 1',
    ke: 'Kệ K-03',
    ngan: 'Ngăn N-02',
    hop: 'Hộp H-18',
    maVach: 'HSTL-K1-K03-N02-H18'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onArchive(doc, {
      retentionPeriod,
      physicalLocation,
      leaderSignedInfo: {
        leaderName,
        signedDate,
        notes,
        scanFileName: uploadedScan?.name,
        scanDauDoUrl: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=800&auto=format&fit=crop&q=80'
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-emerald-300 rounded-2xl w-full max-w-3xl shadow-2xl p-6 space-y-5 max-h-[92vh] overflow-y-auto text-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <div className="flex items-center gap-2 text-emerald-700">
            <Archive className="w-5 h-5" />
            <h3 className="text-sm font-bold text-slate-900">
              Cập Nhật Bản Scan Dấu Đỏ & Định Vị Kho Thư Viện HSTL
            </h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-slate-800 text-xs font-bold p-1 cursor-pointer">
            ✕
          </button>
        </div>

        {/* Doc Info */}
        <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-3 text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-500 font-medium">Hồ sơ:</span>
            <span className="font-mono font-bold text-blue-700">{doc.soKyHieu} - {doc.loaiVanBan}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 font-medium">Trích yếu:</span>
            <span className="text-slate-800 font-semibold">{doc.trichYeu}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 font-medium">Người in trình:</span>
            <span className="text-slate-700">{doc.printedInfo?.printedBy || doc.createdByName}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Step A: Leader confirmation */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase text-slate-800 tracking-wide flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              1. Thông Tin Lãnh Đạo Ký Duyệt & Đóng Dấu Đỏ Thực Tế
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Lãnh đạo đã ký duyệt:
                </label>
                <input
                  type="text"
                  required
                  value={leaderName}
                  onChange={(e) => setLeaderName(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ngày ký & Đóng dấu:
                </label>
                <input
                  type="date"
                  required
                  value={signedDate}
                  onChange={(e) => setSignedDate(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs text-slate-900 font-bold"
                />
              </div>
            </div>

            {/* Scan upload */}
            <div className="p-3 bg-white border border-dashed border-emerald-300 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <div className="font-bold text-slate-800">{uploadedScan?.name}</div>
                  <div className="text-[10px] text-gray-500">Tệp scan có con dấu đỏ tươi ({uploadedScan?.size})</div>
                </div>
              </div>
              <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                ✓ Đã xác thực dấu đỏ
              </span>
            </div>
          </div>

          {/* Step B: Retention Period */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              2. Xác lập Thời hạn bảo quản:
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {(['VĨNH VIỄN', '70 NĂM', '50 NĂM', '20 NĂM', '10 NĂM', '5 NĂM'] as RetentionPeriod[]).map((period) => (
                <button
                  key={period}
                  type="button"
                  onClick={() => setRetentionPeriod(period)}
                  className={`py-2 px-2 text-xs font-bold rounded-xl border transition cursor-pointer ${
                    retentionPeriod === period
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-800 shadow-xs'
                      : 'bg-white border-gray-200 text-slate-700 hover:bg-gray-50'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          {/* Step C: Warehouse Location */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              3. Định vị Sơ đồ Kho vật lý (Kho ➔ Kệ ➔ Ngăn ➔ Hộp):
            </label>
            <PhysicalLocationSelector
              value={physicalLocation}
              onChange={setPhysicalLocation}
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-600 hover:text-slate-900 cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition cursor-pointer"
            >
              <Archive className="w-4 h-4" />
              Hoàn Tất Nhập Thư Viện HSTL
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
