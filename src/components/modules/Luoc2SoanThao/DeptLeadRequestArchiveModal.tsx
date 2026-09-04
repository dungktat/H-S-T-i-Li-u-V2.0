import React, { useState } from 'react';
import { DraftDossier, UserProfile } from '../../../types';
import { 
  Building2, 
  Stamp, 
  CheckCircle2, 
  Send, 
  X, 
  AlertCircle, 
  FileCheck2,
  ShieldCheck
} from 'lucide-react';

interface DeptLeadRequestArchiveModalProps {
  draft: DraftDossier;
  currentUser: UserProfile;
  onClose: () => void;
  onSubmit: (note: string, leaderSignedConfirmed: boolean) => void;
}

export const DeptLeadRequestArchiveModal: React.FC<DeptLeadRequestArchiveModalProps> = ({
  draft,
  currentUser,
  onClose,
  onSubmit
}) => {
  const [confirmedSigned, setConfirmedSigned] = useState(true);
  const [requestNote, setRequestNote] = useState(
    `Theo yêu cầu của Lãnh đạo Tổng công ty, hồ sơ công việc ${draft.code} đã hoàn tất kiểm tra nghiệm thu thực tế, có đầy đủ chữ ký của Lãnh đạo (${draft.leaderPaperApproval?.leaderName || 'Tổng Giám đốc'}) và đã đóng dấu mộc đỏ pháp lý. Yêu cầu Văn thư cơ quan tiếp nhận bản cứng, số hóa và lưu trữ vào Thư viện HSTL theo quy chuẩn 5 cấp.`
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmedSigned) {
      alert('Vui lòng tích xác nhận văn bản giấy đã có đầy đủ chữ ký và dấu mộc đỏ pháp lý!');
      return;
    }
    onSubmit(requestNote, confirmedSigned);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border border-indigo-200 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-800">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center border border-white/20">
              <Stamp className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">
                Trưởng Phòng Lập Lệnh Yêu Cầu Văn Thư Đưa Vào HSTL
              </h3>
              <p className="text-xs text-indigo-200 font-medium">
                Theo chỉ đạo của Lãnh đạo sau khi văn bản đã được in, ký duyệt &amp; đóng dấu mộc đỏ
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          {/* Dossier Summary */}
          <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-indigo-950 text-sm">{draft.code}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-200 text-indigo-900">
                {draft.loaiVanBan}
              </span>
            </div>
            <div className="font-bold text-slate-900 text-sm">
              {draft.trichYeu}
            </div>
            <div className="text-slate-600 flex items-center gap-2">
              <span>Chuyên viên soạn: <strong>{draft.creatorName}</strong></span>
              <span>•</span>
              <span>Lãnh đạo ký duyệt: <strong>{draft.leaderPaperApproval?.leaderName || 'Lãnh đạo Tổng công ty'}</strong></span>
            </div>
          </div>

          {/* Legal Stamp & Signature Confirmation */}
          <div className="border-2 border-emerald-300 bg-emerald-50/60 rounded-xl p-4 space-y-3">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="confirm-paper-signature"
                checked={confirmedSigned}
                onChange={(e) => setConfirmedSigned(e.target.checked)}
                className="mt-1 w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer"
              />
              <label htmlFor="confirm-paper-signature" className="text-xs text-slate-800 font-semibold cursor-pointer select-none">
                <span className="font-extrabold text-emerald-950 block text-xs">
                  ✓ XÁC NHẬN VĂN BẢN GIẤY ĐÃ IN VÀ CÓ ĐẦY ĐỦ CHỮ KÝ, DẤU MỘC ĐỎ PHÁP LÝ
                </span>
                Xác nhận hồ sơ giấy đã được in ra ngoài đời thực, có chữ ký của Lãnh đạo phê duyệt và con dấu mộc đỏ chính thức của Tổng công ty.
              </label>
            </div>
          </div>

          {/* Department Lead Request Note */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-indigo-600" />
              Ý kiến / Chỉ đạo của Lãnh đạo &amp; Yêu cầu của Trưởng phòng gửi Văn thư: <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              value={requestNote}
              onChange={(e) => setRequestNote(e.target.value)}
              placeholder="Nhập nội dung lệnh yêu cầu Văn thư đưa vào lưu trữ HSTL..."
              className="w-full bg-white border border-gray-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 font-medium"
            />
            <p className="text-[11px] text-gray-500 mt-1">
              * Ghi chú này sẽ được lưu trữ vĩnh viễn vào nhật ký timeline làm bằng chứng phân công nhiệm vụ lưu trữ.
            </p>
          </div>

          {/* Role Enforcement Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-900">
            <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong>Quy chế Văn thư &amp; Lưu trữ HSTL:</strong> Theo quy định bảo mật, sau khi Trưởng phòng phát lệnh này, hồ sơ sẽ chuyển sang trạng thái <em>"Chờ Văn thư nhập HSTL"</em>. Chỉ cán bộ Văn thư cơ quan mới có thẩm quyền định vị kho 5 cấp và xác nhận lưu kho chính thức.
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-slate-900 cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-700 hover:bg-indigo-800 shadow-sm transition cursor-pointer"
            >
              <Send className="w-4 h-4" />
              Gửi Lệnh Yêu Cầu Cho Văn Thư
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
