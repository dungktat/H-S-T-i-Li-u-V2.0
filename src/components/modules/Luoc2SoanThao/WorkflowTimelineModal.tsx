import React from 'react';
import { DraftDossier, WorkflowTimelineEvent } from '../../../types';
import { 
  Clock, 
  ShieldCheck, 
  X, 
  UserCheck, 
  FileText, 
  Stamp, 
  Archive, 
  CheckCircle2, 
  AlertCircle,
  Calendar,
  Briefcase,
  Building2,
  Lock
} from 'lucide-react';

interface WorkflowTimelineModalProps {
  draft: DraftDossier;
  onClose: () => void;
}

export const WorkflowTimelineModal: React.FC<WorkflowTimelineModalProps> = ({ draft, onClose }) => {
  const evidence = draft.assignmentEvidence;
  const events = draft.timelineEvents || [];

  // If no explicit timeline events exist yet, generate default timeline based on draft data
  const displayEvents: WorkflowTimelineEvent[] = events.length > 0 ? events : [
    {
      id: 'tl-init',
      step: evidence?.type === 'GIAO_VIEC' ? 'ASSIGNED_BY_LEADER' : 'DRAFT_STARTED',
      title: evidence?.type === 'GIAO_VIEC' ? 'Thời điểm bắt đầu giao việc & Chỉ đạo' : 'Thời điểm bắt đầu soạn thảo dự thảo mới',
      time: evidence?.startedAt ? new Date(evidence.startedAt).toLocaleString('vi-VN') : new Date(draft.createdAt).toLocaleString('vi-VN'),
      actor: evidence?.startedBy || draft.creatorName,
      actorRole: evidence?.startedByRole || 'Chuyên viên khởi tạo',
      action: evidence?.type === 'GIAO_VIEC' ? 'Lãnh đạo giao việc trực tiếp kèm ý kiến chỉ đạo' : 'Chuyên viên chủ động lập hồ sơ công việc',
      comment: evidence?.comment || 'Khởi tạo hồ sơ công việc và dự thảo văn bản trình duyệt.',
      isEvidence: true,
      statusColor: 'emerald'
    },
    ...(draft.printedAt ? [{
      id: 'tl-print',
      step: 'LEADER_PAPER_SIGNED',
      title: 'In bản giấy & Lãnh đạo duyệt ký đóng dấu đỏ',
      time: new Date(draft.printedAt).toLocaleString('vi-VN'),
      actor: draft.leaderPaperApproval?.leaderName || 'Lãnh đạo Tổng công ty',
      actorRole: 'Lãnh đạo phê duyệt',
      action: 'Ký duyệt bản cứng và đóng dấu đỏ pháp lý',
      comment: draft.leaderPaperApproval?.directiveNote || 'Đã ký đóng dấu bản giấy ngoài đời thực.',
      isEvidence: true,
      statusColor: 'amber' as const
    }] : []),
    ...(draft.deptLeadRequestToVanThu ? [{
      id: 'tl-req-vt',
      step: 'DEPT_REQUEST_ARCHIVE',
      title: 'Trưởng phòng yêu cầu Văn thư đưa vào Thư viện HSTL',
      time: new Date(draft.deptLeadRequestToVanThu.requestedAt).toLocaleString('vi-VN'),
      actor: draft.deptLeadRequestToVanThu.requestedBy,
      actorRole: draft.deptLeadRequestToVanThu.requestedByRole,
      action: 'Chuyển giao hồ sơ giấy đã ký đóng dấu cho Văn thư lưu kho',
      comment: draft.deptLeadRequestToVanThu.note,
      isEvidence: true,
      statusColor: 'purple' as const
    }] : []),
    ...(draft.hstlArchiveInfo ? [{
      id: 'tl-archived',
      step: 'HSTL_ARCHIVED',
      title: 'Văn thư tiếp nhận & Hoàn tất nhập Thư viện HSTL',
      time: new Date(draft.hstlArchiveInfo.archivedAt).toLocaleString('vi-VN'),
      actor: draft.hstlArchiveInfo.archivedBy,
      actorRole: draft.hstlArchiveInfo.archivedByRole || 'Văn thư cơ quan',
      action: `Xác lập thời hạn ${draft.hstlArchiveInfo.retentionPeriod} và định vị sơ đồ kho 5 cấp`,
      comment: `Đã lưu trữ an toàn tại kho vật lý. Mã vạch/RFID: ${draft.hstlArchiveInfo.physicalLocation.maVach || 'VNR-HSTL'}`,
      isEvidence: true,
      statusColor: 'teal' as const
    }] : [])
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border border-blue-200 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-800">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center border border-white/20">
              <Clock className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-white">
                  Timeline Tiến Trình & Bằng Chứng Pháp Lý Hồ Sơ
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-blue-950 uppercase tracking-wider">
                  Audit Trail
                </span>
              </div>
              <p className="text-xs text-blue-200 font-medium">
                Mã hồ sơ: <span className="font-mono font-bold text-white">{draft.code}</span> • {draft.loaiVanBan}
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

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Summary Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Trích yếu hồ sơ công việc
            </div>
            <div className="text-sm font-bold text-slate-900 leading-snug">
              {draft.trichYeu}
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-600">
              <span className="flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                Người tạo: <strong>{draft.creatorName}</strong> ({draft.creatorDepartment})
              </span>
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                Lãnh đạo phê duyệt: <strong>{draft.deptLeadName || 'Trần Thị Thu Hương'}</strong>
              </span>
            </div>
          </div>

          {/* Special Evidence Banner */}
          {evidence && (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50/80 border-2 border-amber-300 rounded-2xl p-5 shadow-xs relative overflow-hidden">
              <div className="absolute right-3 top-3 opacity-10 pointer-events-none">
                <ShieldCheck className="w-28 h-28 text-amber-700" />
              </div>

              <div className="flex items-center gap-2 mb-2">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black bg-amber-600 text-white shadow-xs">
                  <ShieldCheck className="w-4 h-4 text-white" />
                  BẰNG CHỨNG PHÁP LÝ KHỞI TẠO HỒ SƠ
                </span>
                <span className="text-[11px] font-bold text-amber-900 bg-amber-200/60 px-2 py-0.5 rounded">
                  {evidence.type === 'GIAO_VIEC' ? 'Hình thức: Bắt đầu giao việc theo chỉ đạo' : 'Hình thức: Chuyên viên chủ động soạn thảo'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mt-3 pt-3 border-t border-amber-200/60">
                <div>
                  <span className="text-slate-500 font-semibold block text-[11px]">Thời điểm bắt đầu chính xác:</span>
                  <span className="font-mono font-bold text-amber-950 text-sm">
                    {new Date(evidence.startedAt).toLocaleString('vi-VN')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block text-[11px]">Người xác lập bằng chứng:</span>
                  <span className="font-bold text-slate-900">
                    {evidence.startedBy} ({evidence.startedByRole})
                  </span>
                </div>
              </div>

              <div className="mt-3 bg-white/80 border border-amber-200 rounded-xl p-3">
                <span className="text-[11px] font-extrabold text-amber-900 uppercase tracking-wider block mb-1">
                  Ý kiến / Comment bắt đầu làm bằng chứng pháp lý:
                </span>
                <p className="text-xs text-slate-800 font-medium italic leading-relaxed">
                  "{evidence.comment}"
                </p>
                {evidence.initialDirective && (
                  <div className="mt-2 pt-2 border-t border-amber-100 text-xs text-amber-900 font-semibold">
                    ⚡ Chỉ đạo ban đầu: {evidence.initialDirective}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Timeline Milestones */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-600" />
              Nhật Ký Tiến Trình Theo Dòng Thời Gian ({displayEvents.length} mốc ghi nhận)
            </h4>

            <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {displayEvents.map((evt, idx) => {
                const isFirst = idx === 0;
                const isLast = idx === displayEvents.length - 1;
                
                let badgeColor = 'bg-blue-600 text-white';
                let boxBg = 'bg-white border-slate-200';
                if (evt.statusColor === 'emerald') {
                  badgeColor = 'bg-emerald-600 text-white';
                  boxBg = 'bg-emerald-50/40 border-emerald-200';
                } else if (evt.statusColor === 'amber') {
                  badgeColor = 'bg-amber-600 text-white';
                  boxBg = 'bg-amber-50/40 border-amber-200';
                } else if (evt.statusColor === 'purple') {
                  badgeColor = 'bg-purple-600 text-white';
                  boxBg = 'bg-purple-50/40 border-purple-200';
                } else if (evt.statusColor === 'teal') {
                  badgeColor = 'bg-teal-600 text-white';
                  boxBg = 'bg-teal-50/40 border-teal-200';
                }

                return (
                  <div key={evt.id || idx} className="relative group">
                    {/* Bullet marker */}
                    <div className={`absolute -left-[27px] top-1.5 w-4 h-4 rounded-full border-2 border-white shadow-xs flex items-center justify-center text-[9px] font-black ${badgeColor}`}>
                      {idx + 1}
                    </div>

                    {/* Milestone Card */}
                    <div className={`rounded-xl border p-4 shadow-xs transition hover:shadow-md ${boxBg}`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                        <div className="flex items-center gap-2">
                          <h5 className="font-extrabold text-xs text-slate-900">
                            {evt.title}
                          </h5>
                          {evt.isEvidence && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300">
                              Bằng chứng
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-[11px] font-bold text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {evt.time}
                        </span>
                      </div>

                      <div className="text-xs text-slate-700 font-medium mb-2">
                        {evt.action}
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-500 font-semibold mb-2">
                        <span>Thực hiện bởi:</span>
                        <span className="text-slate-900 font-bold">{evt.actor}</span>
                        <span>•</span>
                        <span className="text-slate-600">{evt.actorRole}</span>
                      </div>

                      {evt.comment && (
                        <div className="bg-white/90 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 italic">
                          "{evt.comment}"
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5 font-medium">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            Nhật ký được bảo vệ toàn vẹn bằng chữ ký số &amp; xác thực thời gian hệ thống
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-800 transition cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
