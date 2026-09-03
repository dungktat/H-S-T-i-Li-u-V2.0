import React, { useState } from 'react';
import { ExistingDocument, UserProfile } from '../../../types';
import { 
  Printer, 
  CheckCircle2, 
  FileText, 
  Send, 
  UserCheck, 
  Sparkles,
  Layers,
  Calendar,
  Building
} from 'lucide-react';

interface Luong1PrintLeaderModalProps {
  doc: ExistingDocument;
  currentUser: UserProfile;
  onClose: () => void;
  onConfirmPrinted: (doc: ExistingDocument, printedInfo: {
    printedAt: string;
    printedBy: string;
    targetLeaderName: string;
    printNote: string;
  }) => void;
}

export const Luong1PrintLeaderModal: React.FC<Luong1PrintLeaderModalProps> = ({
  doc,
  currentUser,
  onClose,
  onConfirmPrinted
}) => {
  const [targetLeaderName, setTargetLeaderName] = useState('Hoàng Gia Khánh - Tổng Giám Đốc');
  const [printCopies, setPrintCopies] = useState(3);
  const [printNote, setPrintNote] = useState('In kèm hồ sơ thuyết minh kỹ thuật, bản vẽ thiết kế và dự toán bóc tách chi tiết');
  const [isPrinted, setIsPrinted] = useState(false);

  const handlePrint = () => {
    setIsPrinted(true);
    window.print();
  };

  const handleConfirm = () => {
    onConfirmPrinted(doc, {
      printedAt: new Date().toISOString(),
      printedBy: `${currentUser.name} (${currentUser.roleTitle})`,
      targetLeaderName,
      printNote: `Đã in ${printCopies} bộ. ${printNote}`
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-blue-300 rounded-2xl w-full max-w-3xl shadow-2xl p-6 space-y-5 text-slate-800 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <div className="flex items-center gap-2 text-blue-700">
            <Printer className="w-5 h-5" />
            <h3 className="text-sm font-bold text-slate-900">
              In Xuất Bản Hồ Sơ & Phiếu Trình Ký Lãnh Đạo
            </h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-slate-800 text-xs font-bold p-1 cursor-pointer">
            ✕
          </button>
        </div>

        {/* Thông tin trình Lãnh đạo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-blue-50/50 border border-blue-200 rounded-xl p-3.5 text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Kính gửi Lãnh đạo Tổng công ty:
            </label>
            <select
              value={targetLeaderName}
              onChange={(e) => setTargetLeaderName(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600"
            >
              <option value="Hoàng Gia Khánh - Tổng Giám Đốc">Hoàng Gia Khánh - Tổng Giám Đốc</option>
              <option value="Trần Anh Tuấn - Phó Tổng Giám Đốc phụ trách Kỹ thuật">Trần Anh Tuấn - Phó Tổng Giám Đốc (Kỹ thuật)</option>
              <option value="Đặng Sỹ Mạnh - Chủ tịch Hội đồng thành viên">Đặng Sỹ Mạnh - Chủ tịch HĐTV</option>
              <option value="Nguyễn Văn Hải - Phó Tổng Giám Đốc">Nguyễn Văn Hải - Phó Tổng Giám Đốc</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Số lượng bản in xuất bản:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={20}
                value={printCopies}
                onChange={(e) => setPrintCopies(parseInt(e.target.value) || 1)}
                className="w-24 bg-white border border-gray-200 rounded-lg p-2 text-xs font-bold text-slate-900 text-center"
              />
              <span className="text-gray-500 font-medium">bộ hồ sơ trình ký tươi</span>
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-slate-700 font-bold mb-1">
              Ghi chú danh mục tài liệu kèm theo bản in:
            </label>
            <input
              type="text"
              value={printNote}
              onChange={(e) => setPrintNote(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs text-slate-900"
            />
          </div>
        </div>

        {/* Paper Document Preview (Phiếu trình ký trang trọng) */}
        <div className="border border-gray-300 rounded-xl p-6 bg-[#fffefc] shadow-xs space-y-4 font-serif text-slate-900">
          <div className="flex justify-between items-start border-b border-gray-200 pb-3 font-sans">
            <div className="text-center text-xs">
              <div className="font-bold uppercase text-slate-800">TỔNG CÔNG TY ĐƯỜNG SẮT VIỆT NAM</div>
              <div className="font-bold text-blue-800 uppercase">{doc.coQuanBanHanh}</div>
              <div className="text-[10px] text-gray-500 mt-0.5">Số: {doc.soKyHieu}</div>
            </div>
            <div className="text-center text-xs">
              <div className="font-bold uppercase">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
              <div className="font-bold text-[11px] underline">Độc lập - Tự do - Hạnh phúc</div>
              <div className="text-[10px] italic text-gray-500 mt-0.5">
                Hà Nội, ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}
              </div>
            </div>
          </div>

          <div className="text-center py-2">
            <h2 className="text-base font-bold uppercase tracking-wide text-slate-900">
              PHIẾU TRÌNH GIẢI QUYẾT CÔNG VIỆC
            </h2>
            <p className="text-xs italic text-gray-600 font-sans">
              (V/v: {doc.trichYeu})
            </p>
          </div>

          <div className="space-y-2 text-xs leading-relaxed font-sans">
            <div className="flex gap-2">
              <span className="font-bold w-32 shrink-0">Kính gửi:</span>
              <span className="font-bold text-blue-900 uppercase">{targetLeaderName}</span>
            </div>
            <div className="flex gap-2">
              <span className="font-bold w-32 shrink-0">Đơn vị trình:</span>
              <span>{doc.coQuanBanHanh} — Người lập: <strong>{doc.createdByName}</strong></span>
            </div>
            <div className="flex gap-2">
              <span className="font-bold w-32 shrink-0">Loại hồ sơ:</span>
              <span className="font-semibold text-slate-800">{doc.loaiVanBan}</span>
            </div>
            <div className="flex gap-2 items-start">
              <span className="font-bold w-32 shrink-0">Tóm tắt nội dung:</span>
              <span className="text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-200 w-full">
                {doc.trichYeu}
              </span>
            </div>
            <div className="flex gap-2 items-start">
              <span className="font-bold w-32 shrink-0">Ý kiến Trưởng phòng:</span>
              <span className="text-emerald-800 bg-emerald-50/70 p-2 rounded-lg border border-emerald-200 w-full font-medium">
                {doc.reviewNote || 'Đã kiểm tra hồ sơ đạt tiêu chuẩn kỹ thuật & pháp lý. Kính trình Lãnh đạo xem xét phê duyệt.'}
              </span>
            </div>
          </div>

          {/* Signature Grid */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 text-center text-xs font-sans">
            <div>
              <div className="font-bold uppercase text-slate-700">TRƯỞNG ĐƠN VỊ TRÌNH</div>
              <div className="text-[10px] italic text-gray-500">(Ký, ghi rõ họ tên)</div>
              <div className="h-14 flex items-center justify-center font-script text-blue-700 font-bold text-sm italic">
                {doc.assignedReviewerName}
              </div>
              <div className="font-bold text-slate-800">{doc.assignedReviewerName}</div>
            </div>

            <div>
              <div className="font-bold uppercase text-slate-900">Ý KIẾN LÃNH ĐẠO PHÊ DUYỆT</div>
              <div className="text-[10px] italic text-gray-500">(Ký tươi và ghi rõ ý kiến chỉ đạo)</div>
              <div className="h-14 border border-dashed border-gray-300 rounded-lg m-1 flex items-center justify-center text-[10px] text-gray-400">
                [Vị trí Lãnh đạo ký duyệt & đóng dấu đỏ]
              </div>
              <div className="font-bold text-blue-900 uppercase">{targetLeaderName.split('-')[0]}</div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-gray-200">
          <button
            type="button"
            onClick={handlePrint}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition cursor-pointer"
          >
            <Printer className="w-4 h-4 text-blue-700" />
            In Phiếu Trình & Xuất Bản Hồ Sơ
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-600 hover:text-slate-900 cursor-pointer"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 shadow-sm transition cursor-pointer"
            >
              <Send className="w-4 h-4" />
              Xác Nhận Đã In Trình Lãnh Đạo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
