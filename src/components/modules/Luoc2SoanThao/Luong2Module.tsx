import React, { useState, useEffect } from 'react';
import { DraftDossier, UserProfile, RetentionPeriod, PhysicalLocation, AssignedTask } from '../../../types';
import { StorageService } from '../../../services/storageService';
import { SAMPLE_USERS } from '../../../data/initialData';
import { PhysicalLocationSelector } from '../../common/PhysicalLocationSelector';
import { HighlightText, getOcrSnippet, matchesQuery } from '../../../utils/highlight';
import { TaskManagementSection } from './TaskManagementSection';
import { 
  FileEdit, 
  Send, 
  Users, 
  Printer, 
  CheckCircle, 
  Upload, 
  Archive, 
  MessageSquare, 
  FileText, 
  Clock, 
  Search, 
  AlertCircle, 
  Eye, 
  CheckCheck,
  Briefcase,
  Sparkles,
  Layers,
  ClipboardList
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Luong2ModuleProps {
  currentUser: UserProfile;
  onOpenViewer: (dossier: any, searchKeyword?: string) => void;
}

export const Luong2Module: React.FC<Luong2ModuleProps> = ({ currentUser, onOpenViewer }) => {
  const [activeMainTab, setActiveMainTab] = useState<'TASKS' | 'DRAFTS'>('TASKS');
  const [drafts, setDrafts] = useState<DraftDossier[]>(StorageService.getDrafts());
  const [tasks, setTasks] = useState<AssignedTask[]>(StorageService.getTasks());
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStep, setFilterStep] = useState('ALL');

  const reloadData = () => {
    setDrafts(StorageService.getDrafts());
    setTasks(StorageService.getTasks());
  };

  useEffect(() => {
    const handleStateChange = (e: any) => {
      if (e?.detail?.type === 'tasks' || e?.detail?.type === 'drafts') {
        reloadData();
      }
    };
    window.addEventListener('hstl_state_change', handleStateChange);
    return () => window.removeEventListener('hstl_state_change', handleStateChange);
  }, []);

  // Step 1 Form
  const [trichYeu, setTrichYeu] = useState('');
  const [loaiVanBan, setLoaiVanBan] = useState('Tờ trình & Đề xuất');
  const [field, setField] = useState('Kỹ thuật - Hạ tầng');
  const [draftFile, setDraftFile] = useState<{ name: string; size: string } | null>(null);

  // Step 2 Modal: Coordination & Review (Trưởng phòng)
  const [coordinatingDraft, setCoordinatingDraft] = useState<DraftDossier | null>(null);
  const [selectedCoordUnits, setSelectedCoordUnits] = useState<string[]>(['Ban Vận tải', 'Ban Tài chính']);
  const [coordDeadline, setCoordDeadline] = useState(
    new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0]
  );
  const [coordNote, setCoordNote] = useState('');

  // Step 3 Modal: Paper Print & Real Leader Approval
  const [printingDraft, setPrintingDraft] = useState<DraftDossier | null>(null);
  const [leaderName, setLeaderName] = useState('Ông Đặng Sỹ Mạnh - Tổng Giám Đốc');
  const [leaderDirective, setLeaderDirective] = useState('Đồng ý phê duyệt phương án. Giao chuyên viên triển khai thực hiện ngay.');

  // Step 4 Modal: Submit Resolution Report
  const [reportingDraft, setReportingDraft] = useState<DraftDossier | null>(null);
  const [reportTitle, setReportTitle] = useState('');
  const [reportSummary, setReportSummary] = useState('');
  const [reportFile, setReportFile] = useState<{ name: string; size: string } | null>(null);

  // Step 4.2 Modal: Archive Complete Case into HSTL
  const [archivingDraft, setArchivingDraft] = useState<DraftDossier | null>(null);
  const [retentionPeriod, setRetentionPeriod] = useState<RetentionPeriod>('VĨNH VIỄN');
  const [physicalLocation, setPhysicalLocation] = useState<PhysicalLocation>({
    kho: 'Kho Lưu trữ Trung tâm Số 1',
    ke: 'Kệ K-04',
    ngan: 'Ngăn N-01',
    hop: 'Hộp H-02',
    maVach: 'HSTL-K1-K04-N01-H02'
  });

  // Step 1: Create & Submit to Dept Lead
  const handleCreateDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trichYeu) {
      alert('Vui lòng nhập trích yếu nội dung dự thảo!');
      return;
    }

    const newCode = `HSCV-${new Date().getFullYear()}-${String(drafts.length + 1).padStart(3, '0')}`;
    const newDraft: DraftDossier = {
      id: 'draft-' + Date.now(),
      code: newCode,
      trichYeu,
      loaiVanBan,
      field,
      creatorId: currentUser.id,
      creatorName: currentUser.name,
      creatorDepartment: currentUser.department,
      createdAt: new Date().toISOString(),
      draftFileUrl: '#',
      draftFileName: draftFile?.name || `DuThao_${newCode}.docx`,
      draftFileSize: draftFile?.size || '2.1 MB',
      currentStep: 'PENDING_DEPT_LEAD',
      deptLeadId: 'user_tp_1',
      deptLeadName: 'Trần Thị Thu Hương',
      coordinations: []
    };

    StorageService.addDraft(newDraft);
    reloadData();
    setIsCreating(false);
    setTrichYeu('');
    setDraftFile(null);
    try {
      confetti({ particleCount: 30, spread: 50 });
    } catch (e) {}
  };

  // Step 2.1: Assign Coordination Units (Trưởng phòng)
  const handleSendCoordination = (draft: DraftDossier) => {
    const coords = selectedCoordUnits.map((unitName, index) => ({
      id: 'coord-' + Date.now() + '-' + index,
      unitId: 'unit-' + index,
      unitName,
      officerId: 'officer-' + index,
      officerName: `Đại diện ${unitName}`,
      deadlineSLA: coordDeadline,
      status: 'PENDING' as const
    }));

    StorageService.updateDraft(draft.id, {
      currentStep: 'COORDINATING',
      coordinations: coords
    });
    setCoordinatingDraft(null);
    reloadData();
  };

  // Step 2.2: Mock Provide Coordination Feedback
  const handleProvideCoordFeedback = (draft: DraftDossier, coordId: string) => {
    const text = prompt('Nhập ý kiến chuyên môn của đơn vị phối hợp:', 'Thống nhất phương án đề xuất. Đề nghị lưu ý tiến độ thi công trước mùa mưa bão.');
    if (text) {
      const updated = draft.coordinations.map((c) => {
        if (c.id === coordId) {
          return {
            ...c,
            status: 'FEEDBACK_PROVIDED' as const,
            feedbackText: text,
            feedbackFileName: 'Ykien_PhanHoi_ChuyenMon.pdf',
            feedbackDate: new Date().toISOString()
          };
        }
        return c;
      });
      StorageService.updateDraft(draft.id, { coordinations: updated });
      reloadData();
    }
  };

  // Step 2.3: Approve Draft for Printing (Trưởng phòng)
  const handleApproveDraft = (draft: DraftDossier) => {
    StorageService.updateDraft(draft.id, {
      currentStep: 'DEPT_APPROVED'
    });
    reloadData();
    try {
      confetti({ particleCount: 35, spread: 60 });
    } catch (e) {}
  };

  // Step 3: Print & Confirm Leader Paper Approval
  const handleConfirmLeaderApproval = (draft: DraftDossier) => {
    StorageService.updateDraft(draft.id, {
      currentStep: 'LEADER_ASSIGNED',
      printedAt: new Date().toISOString(),
      printedBy: currentUser.name,
      leaderPaperApproval: {
        leaderName,
        approvalDate: new Date().toISOString().split('T')[0],
        directiveNote: leaderDirective,
        assignedOfficer: `${currentUser.name} (Chủ trì triển khai trực tiếp)`,
        paperSignatureConfirmed: true
      }
    });
    setPrintingDraft(null);
    reloadData();
    try {
      confetti({ particleCount: 40, spread: 60 });
    } catch (e) {}
  };

  // Step 4: Submit Resolution Report
  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingDraft || !reportTitle) return;

    StorageService.updateDraft(reportingDraft.id, {
      currentStep: 'REPORT_SUBMITTED',
      resolutionReport: {
        reportTitle,
        reportSummary,
        reportFileUrl: '#',
        reportFileName: reportFile?.name || 'BaoCaoKetQua_Final.pdf',
        proofFiles: [
          { name: 'BienBanNghiemThu_ThucDia.pdf', url: '#', size: '2.4 MB' },
          { name: 'HinhAnhMinhChung_KetQua.jpg', url: '#', size: '1.8 MB' }
        ],
        submittedAt: new Date().toISOString(),
        submittedBy: currentUser.name
      }
    });
    setReportingDraft(null);
    setReportTitle('');
    setReportSummary('');
    setReportFile(null);
    reloadData();
    try {
      confetti({ particleCount: 45, spread: 65 });
    } catch (e) {}
  };

  // Step 4.2: Confirm & Archive full Dossier to HSTL
  const handleArchiveCaseToHSTL = (draft: DraftDossier) => {
    StorageService.updateDraft(draft.id, {
      currentStep: 'HSTL_ARCHIVED',
      hstlArchiveInfo: {
        retentionPeriod,
        physicalLocation,
        archivedAt: new Date().toISOString(),
        archivedBy: currentUser.name,
        hstlCatalogId: `HSTL-HSCV-${draft.code}`
      }
    });
    setArchivingDraft(null);
    reloadData();
    try {
      confetti({ particleCount: 60, spread: 80 });
    } catch (e) {}
  };

  const filteredDrafts = drafts.filter((d) => {
    const docOcrStrings = d.documents?.map(doc => `${doc.title} ${doc.noiDungToanVan || doc.ocrText || ''}`).join(' ') || '';
    const fullOcr = `${d.code} ${d.trichYeu} ${d.creatorDepartment} ${d.creatorName} ${d.field} ${d.resultReport?.title || ''} ${d.resultReport?.summary || ''} ${docOcrStrings}`;

    const matchesSearch = matchesQuery(
      searchTerm,
      d.code,
      d.trichYeu,
      d.creatorName,
      d.creatorDepartment,
      d.field,
      fullOcr
    );

    if (filterStep === 'ALL') return matchesSearch;
    return matchesSearch && d.currentStep === filterStep;
  });

  return (
    <div className="p-6 space-y-6 text-slate-800">
      {/* Top Header & Sub-Tab Navigation */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-gray-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                LUỒNG 2
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                Soạn thảo, Giao việc & Báo cáo Kết quả
              </h2>
            </div>
            <p className="text-xs text-gray-500 mt-1 font-medium">
              Bao gồm: Quản lý Giao việc (Lãnh đạo ➔ Người chủ trì ➔ Người phối hợp ➔ Báo cáo Đã xong) và Soạn thảo Hồ sơ công việc 4 bước tinh gọn.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveMainTab('TASKS')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeMainTab === 'TASKS'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Giao việc ({tasks.length})</span>
            </button>

            <button
              onClick={() => setActiveMainTab('DRAFTS')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeMainTab === 'DRAFTS'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FileEdit className="w-4 h-4" />
              <span>Soạn thảo ({drafts.length})</span>
            </button>
          </div>
        </div>

        {/* Sub-tabs Selector Pill */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveMainTab('TASKS')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-xs font-bold transition cursor-pointer ${
              activeMainTab === 'TASKS'
                ? 'bg-blue-50 border-blue-400 text-blue-900 shadow-xs'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Briefcase className="w-4 h-4 text-blue-600" />
            <span>📋 Quản lý Giao việc &amp; Điều hành Nhiệm vụ ({tasks.length})</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-200/70 text-blue-950 font-bold">
              Lãnh đạo ➔ Chủ trì ➔ Phối hợp
            </span>
          </button>

          <button
            onClick={() => setActiveMainTab('DRAFTS')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-xs font-bold transition cursor-pointer ${
              activeMainTab === 'DRAFTS'
                ? 'bg-blue-50 border-blue-400 text-blue-900 shadow-xs'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <FileEdit className="w-4 h-4 text-indigo-600" />
            <span>📝 Soạn thảo Hồ sơ Công việc &amp; Dự thảo Văn bản ({drafts.length})</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-900 font-bold">
              4 Bước Tinh gọn
            </span>
          </button>
        </div>
      </div>

      {/* Main Tab 1: Task Assignment Section */}
      {activeMainTab === 'TASKS' && (
        <TaskManagementSection
          currentUser={currentUser}
          tasks={tasks}
          onReload={reloadData}
          onOpenViewer={onOpenViewer}
        />
      )}

      {/* Main Tab 2: Draft Dossier Workflow */}
      {activeMainTab === 'DRAFTS' && (
        <div className="space-y-6 animate-fadeIn">
          {/* 4 Stages Visual Diagram */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
              <span className="text-xs font-bold text-slate-800">
                Quy trình 4 Bước Soạn thảo &amp; Trình duyệt Văn bản:
              </span>
              <button
                onClick={() => setIsCreating(true)}
                className="flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 shadow-sm transition cursor-pointer shrink-0"
              >
                <FileEdit className="w-4 h-4" />
                + Soạn thảo Dự thảo Mới
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3">
              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">1</span>
                <div className="text-xs">
                  <div className="font-bold text-blue-900">Tạo dự thảo</div>
                  <div className="text-[10px] text-gray-500 font-medium">Trình Trưởng phòng kiểm tra</div>
                </div>
              </div>

              <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-3 flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">2</span>
                <div className="text-xs">
                  <div className="font-bold text-indigo-900">Phối hợp & Duyệt</div>
                  <div className="text-[10px] text-gray-500 font-medium">Lấy ý kiến đơn vị bạn (SLA)</div>
                </div>
              </div>

              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-amber-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">3</span>
                <div className="text-xs">
                  <div className="font-bold text-amber-900">In trình Lãnh đạo thật</div>
                  <div className="text-[10px] text-gray-500 font-medium">Lãnh đạo duyệt giấy & giao việc</div>
                </div>
              </div>

              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">4</span>
                <div className="text-xs">
                  <div className="font-bold text-emerald-900">Báo cáo kết quả</div>
                  <div className="text-[10px] text-gray-500 font-medium">Tải file minh chứng & Vào HSTL</div>
                </div>
              </div>
            </div>
          </div>

      {/* Step 1: Create Draft Form */}
      {isCreating && (
        <div className="bg-white border border-blue-300 rounded-2xl p-6 shadow-md space-y-5 animate-fadeIn text-slate-800">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <div className="flex items-center gap-2">
              <FileEdit className="w-5 h-5 text-blue-700" />
              <h3 className="text-sm font-bold text-slate-900">
                Bước 1: Chuyên viên Soạn thảo Hồ sơ Công việc & Dự thảo Mới
              </h3>
            </div>
            <button
              onClick={() => setIsCreating(false)}
              className="text-xs font-semibold text-gray-600 hover:text-slate-900 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 cursor-pointer"
            >
              Hủy
            </button>
          </div>

          <form onSubmit={handleCreateDraft} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                1. Trích yếu nội dung dự thảo <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                placeholder="Ví dụ: Đề xuất phương án tổ chức chạy tàu Tết Nguyên Đán, kế hoạch sửa chữa nâng cấp nhà ga..."
                value={trichYeu}
                onChange={(e) => setTrichYeu(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs text-slate-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  2. Loại văn bản dự thảo
                </label>
                <select
                  value={loaiVanBan}
                  onChange={(e) => setLoaiVanBan(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 cursor-pointer"
                >
                  <option value="Tờ trình & Đề xuất">Tờ trình & Đề xuất</option>
                  <option value="Kế hoạch">Kế hoạch</option>
                  <option value="Dự thảo Quyết định">Dự thảo Quyết định</option>
                  <option value="Báo cáo chuyên môn">Báo cáo chuyên môn</option>
                  <option value="Phương án kỹ thuật">Phương án kỹ thuật</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  3. Lĩnh vực nghiệp vụ
                </label>
                <select
                  value={field}
                  onChange={(e) => setField(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 cursor-pointer"
                >
                  <option value="Kỹ thuật - Hạ tầng">Kỹ thuật - Hạ tầng Cơ sở</option>
                  <option value="Vận tải & Điều hành">Vận tải & Điều hành chạy tàu</option>
                  <option value="Tài chính - Kế toán">Tài chính - Kế toán</option>
                  <option value="Tổ chức cán bộ">Tổ chức Cán bộ - Lao động</option>
                  <option value="An toàn giao thông">An toàn Giao thông Đường sắt</option>
                </select>
              </div>
            </div>

            {/* Upload Draft file */}
            <div className="border border-dashed border-blue-200 rounded-xl p-4 bg-blue-50/30 text-center">
              <input
                type="file"
                id="draft-file"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    setDraftFile({
                      name: f.name,
                      size: (f.size / (1024 * 1024)).toFixed(1) + ' MB'
                    });
                  }
                }}
                accept=".docx,.xlsx,.pdf"
                className="hidden"
              />
              <label htmlFor="draft-file" className="cursor-pointer block space-y-1">
                <Upload className="w-5 h-5 mx-auto text-blue-600" />
                <span className="text-xs text-blue-700 font-bold hover:underline">
                  Tải lên tệp dự thảo (.docx, .xlsx, .pdf)
                </span>
                <p className="text-[10px] text-gray-500 font-medium">
                  Hồ sơ sẽ được chuyển trực tiếp cho Trưởng phòng kiểm tra & điều phối
                </p>
              </label>

              {draftFile && (
                <div className="mt-2 text-xs text-emerald-700 font-mono font-bold">
                  ✓ Đã đính kèm: {draftFile.name} ({draftFile.size})
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-slate-900 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 shadow-sm transition cursor-pointer"
              >
                <Send className="w-4 h-4" />
                Trình Trưởng phòng Kiểm tra
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Step 2 Modal: Coordination Setup */}
      {coordinatingDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-blue-300 rounded-2xl w-full max-w-2xl shadow-2xl p-6 space-y-5 text-slate-800">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div className="flex items-center gap-2 text-blue-700">
                <Users className="w-5 h-5" />
                <h3 className="text-sm font-bold text-slate-900">
                  Bước 2: Trưởng phòng Chuyển Phối hợp Lấy Ý kiến Phòng Ban
                </h3>
              </div>
              <button onClick={() => setCoordinatingDraft(null)} className="text-gray-400 hover:text-slate-800 text-xs font-bold p-1">
                ✕
              </button>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 space-y-1 text-xs">
              <div className="font-bold text-blue-700">{coordinatingDraft.code}</div>
              <div className="text-slate-800 font-medium">{coordinatingDraft.trichYeu}</div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-2">
                1. Chọn các đơn vị / phòng ban cùng phối hợp cho ý kiến chuyên môn:
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {['Ban Vận tải', 'Ban Tài chính - Kế toán', 'Ban An toàn Giao thông', 'Ban Kế hoạch - Đầu tư', 'Văn phòng Tổng công ty', 'Ban Tổ chức Cán bộ'].map((unit) => (
                  <label
                    key={unit}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition ${
                      selectedCoordUnits.includes(unit)
                        ? 'bg-blue-50 border-blue-500 text-blue-900 font-bold shadow-xs'
                        : 'bg-white border-gray-200 text-slate-700 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedCoordUnits.includes(unit)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCoordUnits([...selectedCoordUnits, unit]);
                        } else {
                          setSelectedCoordUnits(selectedCoordUnits.filter(u => u !== unit));
                        }
                      }}
                      className="rounded text-blue-600"
                    />
                    {unit}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                2. Hạn xử lý SLA (Thời hạn phản hồi ý kiến):
              </label>
              <input
                type="date"
                value={coordDeadline}
                onChange={(e) => setCoordDeadline(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setCoordinatingDraft(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-slate-900 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => handleSendCoordination(coordinatingDraft)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 shadow-sm transition cursor-pointer"
              >
                <Send className="w-4 h-4" />
                Gửi Lệnh Lấy Ý kiến Phối hợp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3 Modal: Leader Paper Approval */}
      {printingDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-amber-300 rounded-2xl w-full max-w-2xl shadow-2xl p-6 space-y-5 text-slate-800">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div className="flex items-center gap-2 text-amber-700">
                <Printer className="w-5 h-5" />
                <h3 className="text-sm font-bold text-slate-900">
                  Bước 3: In Trình Lãnh Đạo Ngoài Đời Thực & Nhận Giao Việc
                </h3>
              </div>
              <button onClick={() => setPrintingDraft(null)} className="text-gray-400 hover:text-slate-800 text-xs font-bold p-1">✕</button>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2 text-xs text-slate-700">
              <div className="font-bold text-amber-800">Quy trình thực tế:</div>
              <p>
                1. Chuyên viên in bản dự thảo giấy đã được Trưởng phòng duyệt để trình duyệt trực tiếp với Lãnh đạo ngoài đời thực.
              </p>
              <p>
                2. Lãnh đạo xem xét, phê duyệt bản giấy và giao việc trực tiếp cho chuyên viên triển khai.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Lãnh đạo ký duyệt bản giấy:
              </label>
              <input
                type="text"
                value={leaderName}
                onChange={(e) => setLeaderName(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Ý kiến chỉ đạo & giao việc của Lãnh đạo:
              </label>
              <textarea
                rows={3}
                value={leaderDirective}
                onChange={(e) => setLeaderDirective(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-600"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setPrintingDraft(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-slate-900 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => handleConfirmLeaderApproval(printingDraft)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-sm transition cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" />
                Xác nhận Lãnh đạo đã Duyệt Giấy & Giao việc
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 4 Modal: Submit Resolution Report */}
      {reportingDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-emerald-300 rounded-2xl w-full max-w-2xl shadow-2xl p-6 space-y-5 text-slate-800">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div className="flex items-center gap-2 text-emerald-700">
                <Briefcase className="w-5 h-5" />
                <h3 className="text-sm font-bold text-slate-900">
                  Bước 4: Chuyên viên Nộp Báo Cáo Kết Quả Giải Quyết
                </h3>
              </div>
              <button onClick={() => setReportingDraft(null)} className="text-gray-400 hover:text-slate-800 text-xs font-bold p-1">✕</button>
            </div>

            <form onSubmit={handleSubmitReport} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  1. Tiêu đề Báo cáo kết quả: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Báo cáo kết quả triển khai chạy thử nghiệm đoàn tàu chất lượng cao..."
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  2. Tóm tắt kết quả thực hiện:
                </label>
                <textarea
                  rows={3}
                  placeholder="Nêu tóm tắt kết quả giải quyết công việc, các khó khăn và đề xuất kiến nghị..."
                  value={reportSummary}
                  onChange={(e) => setReportSummary(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="border border-dashed border-emerald-200 rounded-xl p-3.5 bg-emerald-50/30 text-center">
                <input
                  type="file"
                  id="rep-file"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setReportFile({ name: f.name, size: (f.size / (1024 * 1024)).toFixed(1) + ' MB' });
                  }}
                  className="hidden"
                />
                <label htmlFor="rep-file" className="cursor-pointer block text-xs text-emerald-700 font-bold hover:underline">
                  📎 Tải lên Tệp Báo cáo kết quả giải quyết & Tài liệu minh chứng (.pdf, .docx, .xlsx...)
                </label>
                {reportFile && (
                  <div className="mt-1 text-[11px] text-emerald-800 font-mono font-bold">
                    ✓ Đã chọn: {reportFile.name}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setReportingDraft(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-slate-900 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  Nộp Báo Cáo Kết Quả
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Step 4.2 Modal: Archive Complete Case to HSTL */}
      {archivingDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-emerald-300 rounded-2xl w-full max-w-3xl shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto text-slate-800">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div className="flex items-center gap-2 text-emerald-700">
                <Archive className="w-5 h-5" />
                <h3 className="text-sm font-bold text-slate-900">
                  Đưa Trọn Bộ Hồ Sơ Công Việc Hoàn Chỉnh Vào Thư Viện HSTL
                </h3>
              </div>
              <button onClick={() => setArchivingDraft(null)} className="text-gray-400 hover:text-slate-800 text-xs font-bold p-1">✕</button>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 space-y-1 text-xs">
              <div className="font-bold text-blue-700">{archivingDraft.code} - {archivingDraft.trichYeu}</div>
              <div className="text-slate-600">
                Báo cáo: {archivingDraft.resolutionReport?.reportTitle} (Bởi {archivingDraft.resolutionReport?.submittedBy})
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                1. Xác lập Thời hạn bảo quản Hồ sơ:
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {(['VĨNH VIỄN', '70 NĂM', '50 NĂM', '20 NĂM', '10 NĂM', '5 NĂM'] as RetentionPeriod[]).map((period) => (
                  <button
                    key={period}
                    type="button"
                    onClick={() => setRetentionPeriod(period)}
                    className={`py-2 text-xs font-bold rounded-xl border transition cursor-pointer ${
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

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                2. Định vị Sơ đồ Kho vật lý:
              </label>
              <PhysicalLocationSelector
                value={physicalLocation}
                onChange={setPhysicalLocation}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setArchivingDraft(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-slate-900 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => handleArchiveCaseToHSTL(archivingDraft)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm cursor-pointer"
              >
                <Archive className="w-4 h-4" />
                Xác nhận Nhập Thư Viện HSTL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drafts List Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 bg-gray-50/80 border-b border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo mã HSCV, trích yếu, người tạo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-xs w-full sm:w-auto">
            <button
              onClick={() => setFilterStep('ALL')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                filterStep === 'ALL' ? 'bg-blue-700 text-white shadow-xs' : 'text-gray-600 hover:text-slate-900 hover:bg-gray-100'
              }`}
            >
              Tất cả ({drafts.length})
            </button>
            <button
              onClick={() => setFilterStep('COORDINATING')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                filterStep === 'COORDINATING' ? 'bg-blue-100 text-blue-900 border border-blue-300' : 'text-gray-600 hover:text-slate-900 hover:bg-gray-100'
              }`}
            >
              Đang phối hợp
            </button>
            <button
              onClick={() => setFilterStep('LEADER_ASSIGNED')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                filterStep === 'LEADER_ASSIGNED' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'text-gray-600 hover:text-slate-900 hover:bg-gray-100'
              }`}
            >
              Đã giao việc
            </button>
            <button
              onClick={() => setFilterStep('REPORT_SUBMITTED')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                filterStep === 'REPORT_SUBMITTED' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'text-gray-600 hover:text-slate-900 hover:bg-gray-100'
              }`}
            >
              Đã nộp báo cáo
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 min-w-[760px]">
            <thead className="bg-blue-50/80 text-[11px] uppercase tracking-wider text-blue-950 font-bold border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Mã Hồ sơ Công việc</th>
                <th className="py-3 px-4">Trích yếu nội dung</th>
                <th className="py-3 px-4">Chuyên viên soạn</th>
                <th className="py-3 px-4">Tiến trình Xử lý</th>
                <th className="py-3 px-4">Phối hợp & Phản hồi</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDrafts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500 font-medium">
                    Không tìm thấy hồ sơ công việc nào khớp với từ khóa "{searchTerm}"
                  </td>
                </tr>
              ) : (
                filteredDrafts.map((d) => {
                  const docOcrStrings = d.documents?.map(doc => `${doc.title} ${doc.noiDungToanVan || doc.ocrText || ''}`).join(' ') || '';
                  const fullOcr = `${d.code} ${d.trichYeu} ${d.creatorDepartment} ${d.creatorName} ${d.field} ${d.resultReport?.title || ''} ${d.resultReport?.summary || ''} ${docOcrStrings}`;
                  const ocrSnippet = getOcrSnippet(fullOcr, searchTerm);
                  const matchedInOcr = searchTerm.trim() && ocrSnippet;

                  return (
                    <tr key={d.id} className="hover:bg-blue-50/40 transition">
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-blue-700">
                          <HighlightText text={d.code} search={searchTerm} />
                        </span>
                        <div className="text-[10px] text-gray-500 font-medium">{d.loaiVanBan}</div>
                      </td>

                      <td className="py-3.5 px-4 max-w-sm">
                        <div className="line-clamp-2 text-slate-800 font-medium">
                          <HighlightText text={d.trichYeu} search={searchTerm} />
                        </div>
                        <span className="text-[10px] text-gray-500 font-semibold">
                          <HighlightText text={d.field} search={searchTerm} />
                        </span>

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
                      </td>

                      <td className="py-3.5 px-4 text-slate-700">
                        <div className="font-semibold text-slate-800">
                          <HighlightText text={d.creatorName} search={searchTerm} />
                        </div>
                        <span className="text-[10px] text-gray-500 font-medium">
                          <HighlightText text={d.creatorDepartment} search={searchTerm} />
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {d.currentStep === 'PENDING_DEPT_LEAD' && (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
                            Chờ TP kiểm tra
                          </span>
                        )}
                        {d.currentStep === 'COORDINATING' && (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                            Đang lấy ý kiến phối hợp
                          </span>
                        )}
                        {d.currentStep === 'DEPT_APPROVED' && (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-cyan-50 text-cyan-800 border border-cyan-200">
                            Đã duyệt dự thảo (Chờ in)
                          </span>
                        )}
                        {d.currentStep === 'LEADER_ASSIGNED' && (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            Lãnh đạo đã giao việc
                          </span>
                        )}
                        {d.currentStep === 'REPORT_SUBMITTED' && (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            Đã nộp Báo cáo KQ
                          </span>
                        )}
                        {d.currentStep === 'HSTL_ARCHIVED' && (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                            Đã lưu Thư viện HSTL
                          </span>
                        )}
                      </td>

                      {/* Coordination feedback list */}
                      <td className="py-3.5 px-4 max-w-xs">
                        {d.coordinations && d.coordinations.length > 0 ? (
                          <div className="space-y-1">
                            {d.coordinations.map((c) => (
                              <div key={c.id} className="flex items-center justify-between text-[11px] bg-gray-50 p-1.5 rounded border border-gray-200">
                                <span className="text-slate-700 font-medium truncate max-w-[120px]">{c.unitName}</span>
                                {c.status === 'FEEDBACK_PROVIDED' ? (
                                  <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-0.5">
                                    ✓ Đã góp ý
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => handleProvideCoordFeedback(d, c.id)}
                                    className="text-[10px] text-blue-700 font-bold hover:underline cursor-pointer"
                                  >
                                    + Góp ý
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400 italic text-[11px]">Chưa chuyển phối hợp</span>
                        )}
                      </td>

                      {/* Actions according to step */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-1.5">
                        {/* Step 2 actions: TP assigns coordination or approves */}
                        {(d.currentStep === 'PENDING_DEPT_LEAD' || d.currentStep === 'COORDINATING') && (
                          <>
                            <button
                              onClick={() => setCoordinatingDraft(d)}
                              className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs inline-flex items-center gap-1 font-semibold cursor-pointer"
                            >
                              <Users className="w-3.5 h-3.5" />
                              Phối hợp
                            </button>
                            <button
                              onClick={() => handleApproveDraft(d)}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                            >
                              <CheckCheck className="w-3.5 h-3.5" />
                              Duyệt dự thảo
                            </button>
                          </>
                        )}

                        {/* Step 3: Print & Leader Approval */}
                        {d.currentStep === 'DEPT_APPROVED' && (
                          <button
                            onClick={() => setPrintingDraft(d)}
                            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            In trình Lãnh đạo thật
                          </button>
                        )}

                        {/* Step 4: Submit report */}
                        {d.currentStep === 'LEADER_ASSIGNED' && (
                          <button
                            onClick={() => {
                              setReportingDraft(d);
                              setReportTitle(`Báo cáo kết quả giải quyết: ${d.trichYeu}`);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Briefcase className="w-3.5 h-3.5" />
                            Nộp Báo cáo KQ
                          </button>
                        )}

                        {/* Step 4.2: Archive into HSTL */}
                        {d.currentStep === 'REPORT_SUBMITTED' && (
                          <button
                            onClick={() => setArchivingDraft(d)}
                            className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Archive className="w-3.5 h-3.5" />
                            Nhập Thư viện HSTL
                          </button>
                        )}

                        <button
                          onClick={() => onOpenViewer(d, searchTerm)}
                          className="px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-slate-700 text-xs inline-flex items-center gap-1 font-semibold cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )}
</div>
  );
};
