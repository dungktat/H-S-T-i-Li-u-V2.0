import React, { useState } from 'react';
import { 
  X, 
  CheckCheck, 
  Users, 
  RotateCcw, 
  FileText, 
  Download, 
  Calendar, 
  AlertCircle, 
  MessageSquare,
  ShieldCheck,
  Building2,
  Clock,
  UserCheck,
  CheckCircle2,
  HelpCircle,
  Paperclip
} from 'lucide-react';
import { DraftDossier, UserProfile } from '../../../types';
import { SAMPLE_USERS } from '../../../data/initialData';

interface DeptReviewDraftModalProps {
  draft: DraftDossier;
  currentUser: UserProfile;
  onClose: () => void;
  onApprove: (draft: DraftDossier, comment: string) => void;
  onSendCoordination: (draft: DraftDossier, selectedUnits: string[], selectedOfficerIds: string[], deadline: string, comment: string) => void;
  onReject: (draft: DraftDossier, comment: string) => void;
}

const COMMON_UNITS = [
  { id: 'b_vt', name: 'Ban Vận tải', defaultOfficer: 'Trần Đình Hùng (Chuyên viên Điều độ)' },
  { id: 'b_tc', name: 'Ban Tài chính - Kế toán', defaultOfficer: 'Nguyễn Thị Minh Trang (Kế toán viên chính)' },
  { id: 'b_at', name: 'Ban An toàn Giao thông', defaultOfficer: 'Lê Văn Thắng (Kỹ sư An toàn)' },
  { id: 'b_kh', name: 'Ban Kế hoạch - Đầu tư', defaultOfficer: 'Vũ Quốc Bảo (Chuyên viên Thẩm định Dự án)' },
  { id: 'vp_tc', name: 'Văn phòng Tổng công ty', defaultOfficer: 'Phạm Hồng Hải (Tổng hợp Văn phòng)' },
  { id: 'b_tc_cb', name: 'Ban Tổ chức Cán bộ', defaultOfficer: 'Bùi Thu Hà (Chuyên viên Quản lý Nhân sự)' },
  { id: 'b_kt', name: 'Ban Kỹ thuật - Hạ tầng Cơ sở', defaultOfficer: 'Đỗ Quang Vinh (Phó Trưởng phòng Kỹ thuật)' },
];

export const DeptReviewDraftModal: React.FC<DeptReviewDraftModalProps> = ({
  draft,
  currentUser,
  onClose,
  onApprove,
  onSendCoordination,
  onReject
}) => {
  // Trưởng phòng comment
  const [comment, setComment] = useState(
    'Thống nhất với nội dung dự thảo. Nội dung đảm bảo đúng quy định kỹ thuật và thể thức văn bản.'
  );

  // Tab or view for coordination configuration
  const [showCoordinationSetup, setShowCoordinationSetup] = useState(false);
  const [selectedUnits, setSelectedUnits] = useState<string[]>(
    draft.coordinations && draft.coordinations.length > 0 
      ? draft.coordinations.map(c => c.unitName)
      : ['Ban Vận tải', 'Ban Tài chính - Kế toán']
  );
  const [selectedOfficerIds, setSelectedOfficerIds] = useState<string[]>([]);
  const [deadline, setDeadline] = useState(
    new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0]
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  // Quick chips for comment
  const quickComments = [
    {
      type: 'APPROVE',
      label: '✓ Đồng ý duyệt in bản giấy',
      text: 'Đồng ý phê duyệt dự thảo văn bản. Nội dung đạt yêu cầu chuyên môn, cho phép in bản giấy trình Lãnh đạo ký duyệt và đóng dấu thực tế.'
    },
    {
      type: 'COORD',
      label: '👥 Đề nghị lấy ý kiến phối hợp',
      text: 'Đề nghị các phòng ban chuyên môn được phân công khẩn trương nghiên cứu, thẩm định và cung cấp ý kiến đóng góp trước thời hạn SLA.'
    },
    {
      type: 'REJECT',
      label: '↺ Trả lại - Bổ sung căn cứ',
      text: 'Nội dung dự thảo chưa đầy đủ căn cứ pháp lý và số liệu chưa sát thực tế. Đề nghị chuyên viên rà soát, chỉnh sửa bổ sung trước khi trình lại.'
    },
    {
      type: 'REJECT',
      label: '↺ Trả lại - Chỉnh sửa thể thức',
      text: 'Yêu cầu chuyên viên chỉnh sửa lại thể thức và kỹ thuật trình bày văn bản theo đúng Nghị định 30/2020/NĐ-CP của Chính phủ.'
    }
  ];

  // Handle Approve
  const handleApproveClick = () => {
    setValidationError(null);
    onApprove(draft, comment.trim() || 'Trưởng phòng đồng ý phê duyệt dự thảo (Cho phép in giấy trình Lãnh đạo).');
  };

  // Handle Transfer Coordination
  const handleCoordinationClick = () => {
    setValidationError(null);
    if (selectedUnits.length === 0) {
      setShowCoordinationSetup(true);
      setValidationError('Vui lòng chọn ít nhất 1 đơn vị hoặc người phối hợp bên dưới trước khi bấm Chuyển phối hợp!');
      return;
    }
    onSendCoordination(
      draft, 
      selectedUnits, 
      selectedOfficerIds, 
      deadline, 
      comment.trim() || 'Đề nghị các đơn vị phối hợp cho ý kiến chuyên môn theo đúng thời hạn.'
    );
  };

  // Handle Reject
  const handleRejectClick = () => {
    setValidationError(null);
    if (!comment.trim()) {
      setValidationError('Vui lòng nhập ý kiến / lý do trả lại để chuyên viên biết nội dung cần chỉnh sửa, bổ sung!');
      return;
    }
    onReject(draft, comment.trim());
  };

  const handleDownloadDraft = () => {
    const content = `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\nĐộc lập - Tự do - Hạnh phúc\n\n` +
      `MÃ HỒ SƠ DỰ THẢO: ${draft.code}\n` +
      `TRÍCH YẾU: ${draft.trichYeu}\n` +
      `LOẠI VĂN BẢN: ${draft.loaiVanBan}\n` +
      `CHUYÊN VIÊN SOẠN THẢO: ${draft.creatorName} (${draft.creatorDepartment})\n` +
      `NGÀY TẠO: ${draft.createdAt}\n` +
      `NGƯỜI KIỂM DUYỆT: ${currentUser.name} - ${currentUser.roleTitle}\n` +
      `Ý KIẾN CHỈ ĐẠO CỦA TRƯỞNG PHÒNG: ${comment}\n\n` +
      `-----------------------------------------\n` +
      `NỘI DUNG DỰ THẢO CHI TIẾT ĐƯỢC LƯU TRỮ VÀ XÁC THỰC TRÊN HỆ THỐNG QUẢN LÝ HSTL.\n`;
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = draft.draftFileName || `${draft.code}_Du_thao.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border-2 border-indigo-200 rounded-3xl w-full max-w-4xl max-h-[92vh] shadow-2xl flex flex-col text-slate-800 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 shadow-inner">
              <ShieldCheck className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider bg-indigo-500/80 text-white px-2.5 py-0.5 rounded-full">
                  PHIẾU DUYỆT DỰ THẢO
                </span>
                <span className="font-mono text-xs font-bold text-indigo-200">
                  {draft.code}
                </span>
              </div>
              <h2 className="text-base font-extrabold text-white mt-0.5">
                Kiểm Duyệt Dự Thảo Hồ Sơ &amp; Điều Hành Phối Hợp
              </h2>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Thông báo lỗi nếu có */}
          {validationError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2.5 font-bold animate-shake">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* 1. Tóm tắt thông tin Dự thảo */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-gray-200 pb-3">
              <div>
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Trích yếu nội dung:</span>
                <h3 className="text-sm font-bold text-slate-900 mt-0.5 leading-snug">
                  {draft.trichYeu}
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-900 border border-blue-200 shrink-0 self-start">
                {draft.loaiVanBan}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-700">
              <div>
                <span className="text-[10px] text-gray-500 font-semibold block">Chuyên viên soạn thảo:</span>
                <span className="font-bold text-slate-900">{draft.creatorName}</span>
                <span className="text-[10px] text-gray-500 block truncate">{draft.creatorDepartment}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 font-semibold block">Thời điểm khởi tạo:</span>
                <span className="font-medium text-slate-900">{draft.createdAt}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 font-semibold block">Trạng thái hiện tại:</span>
                <span className="font-bold text-amber-700">
                  {draft.currentStep === 'PENDING_DEPT_LEAD' ? 'Chờ Trưởng phòng duyệt' :
                   draft.currentStep === 'COORDINATING' ? 'Đang lấy ý kiến phối hợp' :
                   draft.currentStep === 'REJECTED' ? 'Bị trả lại (Chờ sửa)' : draft.currentStep}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 font-semibold block">Người duyệt:</span>
                <span className="font-bold text-indigo-900">{currentUser.name}</span>
                <span className="text-[10px] text-gray-500 block">{currentUser.roleTitle || 'Trưởng phòng'}</span>
              </div>
            </div>

            {/* File đính kèm dự thảo */}
            <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-3 mt-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200 shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span>{draft.draftFileName || 'Du_thao_van_ban.docx'}</span>
                    <span className="text-[10px] text-gray-400 font-normal">({draft.draftFileSize || '2.4 MB'})</span>
                  </div>
                  <span className="text-[10px] text-gray-500">Bản dự thảo số hóa đầy đủ nội dung kỹ thuật</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDownloadDraft}
                className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-slate-800 font-bold flex items-center gap-1.5 cursor-pointer transition shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-gray-600" />
                <span>Tải dự thảo</span>
              </button>
            </div>

            {/* Lịch sử ý kiến phối hợp đã có (nếu có) */}
            {draft.coordinations && draft.coordinations.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5 mb-2">
                  <Users className="w-3.5 h-3.5 text-blue-600" />
                  Ý kiến thẩm định của các đơn vị phối hợp ({draft.coordinations.length} đơn vị):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {draft.coordinations.map(c => (
                    <div key={c.id} className="p-2.5 rounded-xl bg-white border border-gray-200 text-xs">
                      <div className="flex items-center justify-between font-bold text-slate-800">
                        <span>{c.unitName}</span>
                        {c.status === 'FEEDBACK_PROVIDED' ? (
                          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            ✓ Đã góp ý
                          </span>
                        ) : (
                          <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            ⏳ Chờ phản hồi
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-600 mt-1 italic">
                        "{c.feedbackText || 'Chưa gửi ý kiến phản hồi.'}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 2. Ý kiến / Comment của Trưởng phòng (Trọng tâm) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-indigo-600" />
                <span>Ý kiến &amp; Chỉ đạo của Trưởng phòng (Bằng chứng pháp lý):</span>
                <span className="text-red-500 font-bold">*</span>
              </label>
              <span className="text-[11px] text-gray-400">Ghi nhận vào Timeline xử lý</span>
            </div>

            {/* Quick Templates */}
            <div className="flex flex-wrap gap-1.5">
              <span className="text-[10px] font-bold text-gray-400 self-center mr-1">Mẫu nhanh:</span>
              {quickComments.map((qc, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setComment(qc.text);
                    if (qc.type === 'COORD') setShowCoordinationSetup(true);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition cursor-pointer ${
                    comment === qc.text
                      ? 'bg-indigo-100 text-indigo-900 border-indigo-300 font-bold shadow-2xs'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {qc.label}
                </button>
              ))}
            </div>

            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Nhập ý kiến đánh giá chất lượng dự thảo, chỉ đạo chuyên môn hoặc lý do trả lại..."
              className="w-full bg-white border border-gray-300 rounded-xl p-3 text-xs text-slate-900 placeholder:text-gray-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 leading-relaxed font-medium"
            />
          </div>

          {/* 3. Khu vực Chuyển phối hợp (Chọn người / đơn vị phối hợp) */}
          <div className="border border-blue-200 bg-blue-50/40 rounded-2xl p-4 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-blue-950">
                    Chọn Người &amp; Đơn vị Phối hợp Lấy Ý kiến
                  </h4>
                  <p className="text-[11px] text-blue-800">
                    Chỉ định các phòng ban, ban chuyên môn và cán bộ cùng tham gia thẩm định
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowCoordinationSetup(!showCoordinationSetup)}
                className="text-xs font-bold text-blue-700 hover:text-blue-900 underline cursor-pointer"
              >
                {showCoordinationSetup ? 'Thu gọn thiết lập' : 'Tùy chỉnh danh sách phối hợp'}
              </button>
            </div>

            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-800 mb-2">
                  Danh sách đơn vị được chỉ định phối hợp ({selectedUnits.length} đơn vị đã chọn):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {COMMON_UNITS.map((unit) => {
                    const isChecked = selectedUnits.includes(unit.name);
                    return (
                      <label
                        key={unit.id}
                        className={`flex items-start gap-2 p-2.5 rounded-xl border cursor-pointer transition ${
                          isChecked
                            ? 'bg-blue-100/90 border-blue-500 text-blue-950 font-bold shadow-2xs'
                            : 'bg-white border-gray-200 text-slate-700 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUnits([...selectedUnits, unit.name]);
                            } else {
                              setSelectedUnits(selectedUnits.filter(u => u !== unit.name));
                            }
                          }}
                          className="mt-0.5 rounded text-blue-600 shrink-0"
                        />
                        <div className="leading-tight">
                          <div className="text-xs">{unit.name}</div>
                          <div className="text-[10px] text-gray-500 font-normal mt-0.5 truncate max-w-[190px]">
                            {unit.defaultOfficer}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Hạn xử lý SLA */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-white p-3 rounded-xl border border-blue-100">
                <div className="flex items-center gap-2 shrink-0">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="font-bold text-slate-800">Thời hạn phản hồi (Hạn SLA):</span>
                </div>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-600"
                />
                <span className="text-[11px] text-gray-500">
                  (Các đơn vị phối hợp có trách nhiệm gửi ý kiến phản hồi trước ngày này)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions: 3 nút chính Phê duyệt, Chuyển phối hợp, Trả lại */}
        <div className="bg-slate-50 border-t border-gray-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-slate-900 hover:bg-gray-200/60 rounded-xl transition cursor-pointer self-start sm:self-auto"
          >
            Đóng
          </button>

          <div className="flex flex-wrap items-center justify-end gap-2.5">
            {/* Nút 1: Trả lại */}
            <button
              type="button"
              onClick={handleRejectClick}
              title="Trả lại dự thảo cho chuyên viên chỉnh sửa"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-300 transition cursor-pointer shadow-2xs"
            >
              <RotateCcw className="w-4 h-4 text-rose-600" />
              <span>Trả lại</span>
            </button>

            {/* Nút 2: Chuyển phối hợp */}
            <button
              type="button"
              onClick={handleCoordinationClick}
              title="Chuyển các phòng ban và người phối hợp thẩm định"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition cursor-pointer"
            >
              <Users className="w-4 h-4" />
              <span>Chuyển phối hợp ({selectedUnits.length})</span>
            </button>

            {/* Nút 3: Phê duyệt */}
            <button
              type="button"
              onClick={handleApproveClick}
              title="Phê duyệt dự thảo và cho phép in bản giấy trình Lãnh đạo"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition cursor-pointer ring-2 ring-emerald-300/50"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Phê duyệt</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
