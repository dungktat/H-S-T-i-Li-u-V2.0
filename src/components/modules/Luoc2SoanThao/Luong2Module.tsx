import React, { useState, useEffect } from 'react';
import { DraftDossier, UserProfile, RetentionPeriod, PhysicalLocation, AssignedTask, WorkflowTimelineEvent } from '../../../types';
import { StorageService } from '../../../services/storageService';
import { SAMPLE_USERS } from '../../../data/initialData';
import { PhysicalLocationSelector } from '../../common/PhysicalLocationSelector';
import { HighlightText, getOcrSnippet, matchesQuery } from '../../../utils/highlight';
import { TaskManagementSection } from './TaskManagementSection';
import { WorkflowTimelineModal } from './WorkflowTimelineModal';
import { DeptLeadRequestArchiveModal } from './DeptLeadRequestArchiveModal';
import { RestrictedVanThuModal } from './RestrictedVanThuModal';
import { DeptReviewDraftModal } from './DeptReviewDraftModal';
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
  ClipboardList,
  BellRing,
  ShieldCheck,
  Lock,
  Stamp,
  ArrowRight,
  History,
  UserCheck,
  AlertTriangle
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

  // Role Checks
  const isVanThu = currentUser.role === 'VAN_THU' || currentUser.role === 'ADMIN' || currentUser.roleTitle?.toLowerCase().includes('văn thư');
  const isDeptLeadOrAdmin = currentUser.role === 'TRUONG_PHONG' || currentUser.role === 'ADMIN' || currentUser.roleTitle?.toLowerCase().includes('trưởng') || currentUser.role === 'LANH_DAO';

  // Counts for Dept Lead detection & Van Thu tasks
  const pendingDeptLeadDrafts = drafts.filter(d => d.currentStep === 'PENDING_DEPT_LEAD');
  const waitingVanThuDrafts = drafts.filter(d => d.currentStep === 'WAITING_VAN_THU_ARCHIVE');

  const reloadData = () => {
    setDrafts(StorageService.getDrafts());
    setTasks(StorageService.getTasks());
  };

  useEffect(() => {
    const handleStateChange = (e: any) => {
      if (e?.detail?.type === 'tasks' || e?.detail?.type === 'drafts' || e?.detail?.type === 'user') {
        reloadData();
      }
    };
    window.addEventListener('hstl_state_change', handleStateChange);
    return () => window.removeEventListener('hstl_state_change', handleStateChange);
  }, []);

  // Step 1 Form: Draft & Initiation Evidence
  const [trichYeu, setTrichYeu] = useState('');
  const [loaiVanBan, setLoaiVanBan] = useState('Tờ trình & Đề xuất');
  const [field, setField] = useState('Kỹ thuật - Hạ tầng');
  const [draftFile, setDraftFile] = useState<{ name: string; size: string } | null>(null);
  
  // Initiation & Evidence
  const [initiationType, setInitiationType] = useState<'SOAN_THAO' | 'GIAO_VIEC'>('SOAN_THAO');
  const [startedAt, setStartedAt] = useState(new Date().toISOString().slice(0, 16));
  const [initiationComment, setInitiationComment] = useState('Căn cứ nhiệm vụ kế hoạch công tác quý và chỉ đạo tại cuộc họp giao ban đơn vị. Chuyên viên khởi tạo hồ sơ dự thảo mới.');
  const [initialDirective, setInitialDirective] = useState('');

  // Modals
  const [viewingTimelineDraft, setViewingTimelineDraft] = useState<DraftDossier | null>(null);
  const [requestingArchiveDraft, setRequestingArchiveDraft] = useState<DraftDossier | null>(null);
  const [restrictedModalOpen, setRestrictedModalOpen] = useState(false);
  const [restrictedMessage, setRestrictedMessage] = useState('');

  // Step 2 Modal: Coordination & Review (Trưởng phòng)
  const [reviewingDraft, setReviewingDraft] = useState<DraftDossier | null>(null);
  const [coordinatingDraft, setCoordinatingDraft] = useState<DraftDossier | null>(null);
  const [selectedCoordUnits, setSelectedCoordUnits] = useState<string[]>(['Ban Vận tải', 'Ban Tài chính']);
  const [coordDeadline, setCoordDeadline] = useState(
    new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0]
  );
  const [coordNote, setCoordNote] = useState('');

  // Step 3 Modal: Paper Print & Real Leader Approval
  const [printingDraft, setPrintingDraft] = useState<DraftDossier | null>(null);
  const [leaderName, setLeaderName] = useState('Ông Đặng Sỹ Mạnh - Tổng Giám Đốc');
  const [leaderDirective, setLeaderDirective] = useState('Đồng ý phê duyệt phương án. Giao Ban Kỹ thuật phối hợp Ban Vận tải triển khai kiểm tra an toàn hành lang.');

  // Step 4 Modal: Submit Resolution Report
  const [reportingDraft, setReportingDraft] = useState<DraftDossier | null>(null);
  const [reportTitle, setReportTitle] = useState('');
  const [reportSummary, setReportSummary] = useState('');
  const [reportFile, setReportFile] = useState<{ name: string; size: string } | null>(null);

  // Step 4.2 Modal: Archive Complete Case into HSTL (VĂN THƯ)
  const [archivingDraft, setArchivingDraft] = useState<DraftDossier | null>(null);
  const [retentionPeriod, setRetentionPeriod] = useState<RetentionPeriod>('VĨNH VIỄN');
  const [physicalLocation, setPhysicalLocation] = useState<PhysicalLocation>({
    phongBan: 'Ban Kỹ thuật - Hạ tầng Cơ sở',
    ke: 'Kệ K-03 (Hồ sơ Kỹ thuật & Hạ tầng)',
    ngan: 'Ngăn N-01 (Dự án Trọng điểm)',
    hop: 'Hộp / Cặp H-07',
    hoSo: 'Hồ sơ số 01 (HS-01)',
    maVach: 'BKT-K03-N01-H07-HS01',
    donVi: 'Ban Kỹ thuật - Hạ tầng Cơ sở'
  });

  // Step 1: Create & Submit to Dept Lead (with Evidence Timeline)
  const handleCreateDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trichYeu) {
      alert('Vui lòng nhập trích yếu nội dung dự thảo!');
      return;
    }

    const newCode = `HSCV-${new Date().getFullYear()}-${String(drafts.length + 1).padStart(3, '0')}`;
    const formattedStartedTime = startedAt ? new Date(startedAt).toLocaleString('vi-VN') : new Date().toLocaleString('vi-VN');

    // Build Assignment Evidence
    const evidence = {
      startedAt: startedAt ? new Date(startedAt).toISOString() : new Date().toISOString(),
      startedBy: initiationType === 'GIAO_VIEC' ? 'Lãnh đạo đơn vị / Trưởng phòng' : currentUser.name,
      startedByRole: initiationType === 'GIAO_VIEC' ? 'Lãnh đạo giao việc' : (currentUser.roleTitle || 'Chuyên viên'),
      type: initiationType,
      comment: initiationComment || (initiationType === 'GIAO_VIEC' ? 'Khởi tạo theo Lệnh giao việc của Lãnh đạo.' : 'Chuyên viên khởi tạo soạn thảo dự thảo mới.'),
      initialDirective: initiationType === 'GIAO_VIEC' ? initialDirective : undefined
    };

    // Initial Timeline Events
    const initialTimeline: WorkflowTimelineEvent[] = [
      {
        id: 'tl-' + Date.now(),
        step: initiationType === 'GIAO_VIEC' ? 'ASSIGNED_BY_LEADER' : 'DRAFT_STARTED',
        title: initiationType === 'GIAO_VIEC' ? 'Bắt đầu giao việc & Chỉ đạo khởi tạo hồ sơ' : 'Thời điểm bắt đầu soạn thảo dự thảo mới',
        time: formattedStartedTime,
        actor: currentUser.name,
        actorRole: currentUser.roleTitle || (currentUser.role === 'CHUYEN_VIEN' ? 'Chuyên viên' : 'Lãnh đạo'),
        action: initiationType === 'GIAO_VIEC' ? 'Lãnh đạo/Trưởng phòng phát lệnh giao việc kèm comment bằng chứng' : 'Khởi tạo hồ sơ công việc kèm comment bằng chứng pháp lý',
        comment: initiationComment || 'Khởi tạo dự thảo văn bản trình duyệt.',
        isEvidence: true,
        statusColor: 'emerald'
      },
      {
        id: 'tl-' + (Date.now() + 1),
        step: 'SUBMITTED_TO_LEAD',
        title: 'Trình Trưởng phòng thẩm tra & phê duyệt',
        time: new Date().toLocaleString('vi-VN'),
        actor: currentUser.name,
        actorRole: currentUser.roleTitle || 'Chuyên viên',
        action: 'Chuyển hồ sơ lên Trưởng ban Trần Thị Thu Hương phê duyệt (Hệ thống đã gửi thông báo khẩn)',
        comment: 'Hồ sơ đã được gửi và gắn cờ ưu tiên chờ Trưởng phòng kiểm tra.',
        isEvidence: false,
        statusColor: 'amber'
      }
    ];

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
      assignmentEvidence: evidence,
      timelineEvents: initialTimeline,
      coordinations: []
    };

    StorageService.addDraft(newDraft);

    // Send priority notification so Dept Lead is immediately alerted
    StorageService.addNotification({
      id: 'notif-' + Date.now(),
      title: 'DỰ THẢO MỚI CẦN DUYỆT',
      message: `Chuyên viên ${currentUser.name} vừa gửi dự thảo mới ${newCode}: "${trichYeu}". Trưởng phòng vui lòng thẩm tra và phê duyệt.`,
      timestamp: 'Vừa xong',
      type: 'warning',
      relatedFlow: 'LUONG_2',
      relatedDocId: newDraft.id,
      isRead: false
    });

    reloadData();
    setIsCreating(false);
    setTrichYeu('');
    setDraftFile(null);
    try {
      confetti({ particleCount: 35, spread: 55 });
    } catch (e) {}
  };

  // Step 2.0: Unified Department Lead Review, Coordination & Approval Handlers
  const handleDeptApprove = (draft: DraftDossier, comment: string) => {
    const updatedTimeline: WorkflowTimelineEvent[] = [
      ...(draft.timelineEvents || []),
      {
        id: 'tl-' + Date.now(),
        step: 'DEPT_APPROVED',
        title: 'Trưởng phòng phê duyệt dự thảo (Cho phép in giấy)',
        time: new Date().toLocaleString('vi-VN'),
        actor: currentUser.name,
        actorRole: currentUser.roleTitle || 'Trưởng phòng',
        action: 'Trưởng phòng kiểm tra đạt yêu cầu kỹ thuật, phê duyệt cho phép in bản giấy trình Lãnh đạo',
        comment: comment || 'Dự thảo đã tiếp thu đầy đủ ý kiến. Thống nhất in bản giấy trình Lãnh đạo ký duyệt ngoài đời thực.',
        isEvidence: true,
        statusColor: 'emerald'
      }
    ];

    StorageService.updateDraft(draft.id, {
      currentStep: 'DEPT_APPROVED',
      timelineEvents: updatedTimeline,
      rejectionReason: undefined
    });
    setReviewingDraft(null);
    reloadData();
    try {
      confetti({ particleCount: 35, spread: 60 });
    } catch (e) {}
  };

  const handleDeptSendCoordination = (
    draft: DraftDossier, 
    selectedUnits: string[], 
    selectedOfficerIds: string[], 
    deadline: string, 
    comment: string
  ) => {
    const coords = selectedUnits.map((unitName, index) => ({
      id: 'coord-' + Date.now() + '-' + index,
      unitId: 'unit-' + index,
      unitName,
      officerId: selectedOfficerIds[index] || ('officer-' + index),
      officerName: `Đại diện ${unitName}`,
      deadlineSLA: deadline,
      status: 'PENDING' as const
    }));

    const updatedTimeline: WorkflowTimelineEvent[] = [
      ...(draft.timelineEvents || []),
      {
        id: 'tl-' + Date.now(),
        step: 'COORDINATING',
        title: 'Trưởng phòng chuyển phối hợp xin ý kiến',
        time: new Date().toLocaleString('vi-VN'),
        actor: currentUser.name,
        actorRole: currentUser.roleTitle || 'Trưởng phòng',
        action: `Gửi hồ sơ lấy ý kiến ${selectedUnits.join(', ')} (Hạn SLA: ${deadline})`,
        comment: comment || 'Đề nghị các phòng ban chuyên môn cho ý kiến thẩm định trước thời hạn SLA.',
        isEvidence: true,
        statusColor: 'blue'
      }
    ];

    StorageService.updateDraft(draft.id, {
      currentStep: 'COORDINATING',
      coordinations: coords,
      timelineEvents: updatedTimeline
    });
    setReviewingDraft(null);
    reloadData();
  };

  const handleDeptReject = (draft: DraftDossier, comment: string) => {
    const updatedTimeline: WorkflowTimelineEvent[] = [
      ...(draft.timelineEvents || []),
      {
        id: 'tl-' + Date.now(),
        step: 'REJECTED',
        title: 'Trưởng phòng trả lại dự thảo (Yêu cầu chỉnh sửa)',
        time: new Date().toLocaleString('vi-VN'),
        actor: currentUser.name,
        actorRole: currentUser.roleTitle || 'Trưởng phòng',
        action: 'Trưởng phòng kiểm tra chưa đạt yêu cầu, trả lại hồ sơ yêu cầu chuyên viên rà soát, bổ sung',
        comment: comment,
        isEvidence: true,
        statusColor: 'rose'
      }
    ];

    StorageService.updateDraft(draft.id, {
      currentStep: 'REJECTED',
      rejectionReason: comment,
      timelineEvents: updatedTimeline
    });
    setReviewingDraft(null);
    reloadData();
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

    const updatedTimeline = [
      ...(draft.timelineEvents || []),
      {
        id: 'tl-' + Date.now(),
        step: 'COORDINATING',
        title: 'Trưởng phòng chuyển phối hợp xin ý kiến',
        time: new Date().toLocaleString('vi-VN'),
        actor: currentUser.name,
        actorRole: currentUser.roleTitle || 'Trưởng phòng',
        action: `Gửi hồ sơ lấy ý kiến ${selectedCoordUnits.join(', ')} (Hạn SLA: ${coordDeadline})`,
        comment: coordNote || 'Đề nghị các phòng ban chuyên môn cho ý kiến thẩm định trước thời hạn SLA.',
        isEvidence: false,
        statusColor: 'blue' as const
      }
    ];

    StorageService.updateDraft(draft.id, {
      currentStep: 'COORDINATING',
      coordinations: coords,
      timelineEvents: updatedTimeline
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

      const updatedTimeline = [
        ...(draft.timelineEvents || []),
        {
          id: 'tl-' + Date.now(),
          step: 'COORDINATING',
          title: 'Đơn vị phối hợp đã gửi ý kiến chuyên môn',
          time: new Date().toLocaleString('vi-VN'),
          actor: currentUser.name,
          actorRole: 'Đơn vị phối hợp',
          action: 'Cung cấp văn bản góp ý thẩm định dự thảo',
          comment: text,
          isEvidence: true,
          statusColor: 'emerald' as const
        }
      ];

      StorageService.updateDraft(draft.id, { 
        coordinations: updated,
        timelineEvents: updatedTimeline
      });
      reloadData();
    }
  };

  // Step 2.3: Approve Draft for Printing (Trưởng phòng)
  const handleApproveDraft = (draft: DraftDossier) => {
    const updatedTimeline = [
      ...(draft.timelineEvents || []),
      {
        id: 'tl-' + Date.now(),
        step: 'DEPT_APPROVED',
        title: 'Trưởng phòng phê duyệt dự thảo (Cho phép in giấy)',
        time: new Date().toLocaleString('vi-VN'),
        actor: currentUser.name,
        actorRole: currentUser.roleTitle || 'Trưởng phòng',
        action: 'Trưởng ban kiểm tra đạt yêu cầu kỹ thuật và phê duyệt in bản giấy trình Lãnh đạo',
        comment: 'Dự thảo đã tiếp thu đầy đủ ý kiến các ban. Thống nhất in bản giấy trình Lãnh đạo ký duyệt ngoài đời thực.',
        isEvidence: true,
        statusColor: 'blue' as const
      }
    ];

    StorageService.updateDraft(draft.id, {
      currentStep: 'DEPT_APPROVED',
      timelineEvents: updatedTimeline
    });
    reloadData();
    try {
      confetti({ particleCount: 35, spread: 60 });
    } catch (e) {}
  };

  // Step 3: Print & Confirm Leader Paper Approval (Ký duyệt bản giấy ngoài đời thực)
  const handleConfirmLeaderApproval = (draft: DraftDossier) => {
    const updatedTimeline = [
      ...(draft.timelineEvents || []),
      {
        id: 'tl-' + Date.now(),
        step: 'LEADER_ASSIGNED',
        title: 'Lãnh đạo ký duyệt bản giấy & Đóng dấu đỏ thực tế',
        time: new Date().toLocaleString('vi-VN'),
        actor: leaderName,
        actorRole: 'Lãnh đạo Tổng công ty',
        action: 'Lãnh đạo ký duyệt bản cứng ngoài đời thực, đóng dấu mộc đỏ Tổng công ty và giao việc',
        comment: leaderDirective,
        isEvidence: true,
        statusColor: 'amber' as const
      }
    ];

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
      },
      timelineEvents: updatedTimeline
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

    const updatedTimeline = [
      ...(reportingDraft.timelineEvents || []),
      {
        id: 'tl-' + Date.now(),
        step: 'REPORT_SUBMITTED',
        title: 'Nộp Báo cáo kết quả giải quyết & Hồ sơ nghiệm thu',
        time: new Date().toLocaleString('vi-VN'),
        actor: currentUser.name,
        actorRole: currentUser.roleTitle || 'Chuyên viên chủ trì',
        action: `Nộp báo cáo "${reportTitle}" kèm tệp tài liệu minh chứng`,
        comment: reportSummary || 'Đã hoàn thành toàn bộ khối lượng công việc theo đúng chỉ đạo của Lãnh đạo.',
        isEvidence: true,
        statusColor: 'emerald' as const
      }
    ];

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
      },
      timelineEvents: updatedTimeline
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

  // Bước 4.1: Theo yêu cầu của Lãnh đạo, Trưởng phòng yêu cầu Văn thư đưa vào Thư viện HSTL
  const handleDeptLeadRequestToVanThu = (note: string, leaderSignedConfirmed: boolean) => {
    if (!requestingArchiveDraft) return;

    const updatedTimeline = [
      ...(requestingArchiveDraft.timelineEvents || []),
      {
        id: 'tl-' + Date.now(),
        step: 'DEPT_REQUEST_ARCHIVE',
        title: 'Trưởng phòng yêu cầu Văn thư đưa vào Thư viện HSTL',
        time: new Date().toLocaleString('vi-VN'),
        actor: currentUser.name,
        actorRole: currentUser.roleTitle || 'Trưởng ban / Trưởng phòng',
        action: 'Trưởng phòng phát lệnh bàn giao bản cứng đã ký đóng dấu cho Văn thư cơ quan',
        comment: note,
        isEvidence: true,
        statusColor: 'purple' as const
      }
    ];

    StorageService.updateDraft(requestingArchiveDraft.id, {
      currentStep: 'WAITING_VAN_THU_ARCHIVE',
      deptLeadRequestToVanThu: {
        requestedAt: new Date().toISOString(),
        requestedBy: currentUser.name,
        requestedByRole: currentUser.roleTitle || 'Trưởng phòng',
        note,
        leaderSignedConfirmed
      },
      timelineEvents: updatedTimeline
    });

    // Notify Van Thu
    StorageService.addNotification({
      id: 'notif-vt-' + Date.now(),
      title: 'YÊU CẦU VĂN THƯ LƯU KHO HSTL',
      message: `Trưởng phòng ${currentUser.name} đã phát lệnh yêu cầu Văn thư lưu trữ hồ sơ ${requestingArchiveDraft.code} (đã in, ký duyệt & đóng dấu đỏ).`,
      timestamp: 'Vừa xong',
      type: 'info',
      relatedFlow: 'LUONG_2',
      relatedDocId: requestingArchiveDraft.id,
      isRead: false
    });

    setRequestingArchiveDraft(null);
    reloadData();
    try {
      confetti({ particleCount: 40, spread: 60 });
    } catch (e) {}
  };

  // Bước 4.2: CHỈ VĂN THƯ ĐƯỢC PHÉP NHẬP VÀO THƯ VIỆN HSTL
  const handleArchiveCaseToHSTL = (draft: DraftDossier) => {
    // Check permission strictly
    if (!isVanThu) {
      setRestrictedMessage(
        'Quy chế lưu trữ nghiêm ngặt: Tất cả việc nhập bất kể một tài liệu nào vào Thư viện HSTL chỉ văn thư được phép thực hiện. Sau khi tài liệu được in ra và có chữ ký đóng dấu thì theo yêu cầu của lãnh đạo trưởng phòng yêu cầu văn thư đưa vào Thư viện HSTL để lưu trữ.'
      );
      setRestrictedModalOpen(true);
      return;
    }

    const updatedTimeline = [
      ...(draft.timelineEvents || []),
      {
        id: 'tl-' + Date.now(),
        step: 'HSTL_ARCHIVED',
        title: 'Văn thư tiếp nhận & Hoàn tất nhập Thư viện HSTL',
        time: new Date().toLocaleString('vi-VN'),
        actor: currentUser.name,
        actorRole: currentUser.roleTitle || 'Cán bộ Văn thư - Lưu trữ Cơ quan',
        action: `Tiếp nhận bản cứng có dấu đỏ, xác lập thời hạn bảo quản ${retentionPeriod} và định vị sơ đồ kho 5 cấp`,
        comment: `Văn thư đã hoàn tất lưu kho. Tọa độ kho 5 cấp: ${physicalLocation.phongBan} ➔ ${physicalLocation.ke} ➔ ${physicalLocation.ngan} ➔ ${physicalLocation.hop} ➔ ${physicalLocation.hoSo}. Mã Barcode: ${physicalLocation.maVach || 'VNR-HSTL'}`,
        isEvidence: true,
        statusColor: 'teal' as const
      }
    ];

    StorageService.updateDraft(draft.id, {
      currentStep: 'HSTL_ARCHIVED',
      hstlArchiveInfo: {
        retentionPeriod,
        physicalLocation,
        archivedAt: new Date().toISOString(),
        archivedBy: currentUser.name,
        archivedByRole: currentUser.roleTitle || 'Cán bộ Văn thư - Lưu trữ Cơ quan',
        hstlCatalogId: `HSTL-HSCV-${draft.code}`
      },
      timelineEvents: updatedTimeline
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
              Bao gồm: Quản lý giao việc (Lãnh đạo ➔ Người chủ trì ➔ Người phối hợp ➔ Báo cáo Đã xong) và Soạn thảo Hồ sơ công việc 4 bước tinh gọn.
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
              <span>Quản lý giao việc ({tasks.length})</span>
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
              <span>Soạn thảo Hồ sơ công việc ({drafts.length})</span>
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
            <span>📋 Quản lý giao việc ({tasks.length})</span>
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
            <span>📝 Soạn thảo Hồ sơ công việc ({drafts.length})</span>
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
          {/* Dept Lead Immediate Alert Banner: Shows when new drafts are pending */}
          {pendingDeptLeadDrafts.length > 0 && (
            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-2xl p-4 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-3 border border-amber-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0 border border-white/30">
                  <BellRing className="w-5 h-5 text-white animate-bounce" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-black uppercase tracking-wider bg-white text-orange-950 px-2.5 py-0.5 rounded-full shadow-xs">
                      THÔNG BÁO CHO TRƯỞNG PHÒNG
                    </span>
                    <span className="text-xs font-bold text-amber-100">
                      Phát hiện {pendingDeptLeadDrafts.length} dự thảo mới vừa nộp lên cần kiểm tra!
                    </span>
                  </div>
                  <p className="text-xs text-white/95 mt-0.5 font-medium">
                    Chuyên viên vừa khởi tạo hồ sơ và trình duyệt. Trưởng phòng nhấn để thẩm định chuyên môn, phân công phối hợp hoặc duyệt in giấy trình Lãnh đạo.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setFilterStep('PENDING_DEPT_LEAD')}
                className="px-4 py-2 rounded-xl bg-white text-amber-950 hover:bg-amber-50 text-xs font-extrabold shadow-sm transition shrink-0 cursor-pointer flex items-center gap-1.5 self-start md:self-auto"
              >
                <span>Xem ngay {pendingDeptLeadDrafts.length} dự thảo mới</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

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
                  <div className="font-bold text-blue-900">Tạo dự thảo & Ghi nhận Timeline</div>
                  <div className="text-[10px] text-gray-500 font-medium">Bằng chứng thời điểm bắt đầu</div>
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
                  <div className="text-[10px] text-gray-500 font-medium">Lãnh đạo duyệt giấy & đóng dấu</div>
                </div>
              </div>

              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">4</span>
                <div className="text-xs">
                  <div className="font-bold text-emerald-900">Báo cáo & Nhập HSTL</div>
                  <div className="text-[10px] text-gray-500 font-medium">Văn thư lưu kho 5 cấp</div>
                </div>
              </div>
            </div>
          </div>

      {/* Step 1: Create Draft Form */}
      {isCreating && (
        <div className="bg-white border-2 border-blue-300 rounded-2xl p-6 shadow-lg space-y-5 animate-fadeIn text-slate-800">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <div className="flex items-center gap-2">
              <FileEdit className="w-5 h-5 text-blue-700" />
              <h3 className="text-sm font-bold text-slate-900">
                Bước 1: Soạn thảo Dự thảo Mới & Xác lập Bằng Chứng Timeline
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

            {/* Timeline & Evidence Section */}
            <div className="bg-amber-50/70 border-2 border-amber-200 rounded-xl p-4 space-y-3.5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                <span className="text-xs font-black text-amber-950 uppercase tracking-wider">
                  3. Thời điểm bắt đầu &amp; Bằng chứng xác thực (Timeline Evidence)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Hình thức khởi tạo:
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 text-xs text-slate-800 cursor-pointer font-medium">
                      <input
                        type="radio"
                        name="initiationType"
                        value="SOAN_THAO"
                        checked={initiationType === 'SOAN_THAO'}
                        onChange={() => {
                          setInitiationType('SOAN_THAO');
                          setInitiationComment('Chuyên viên chủ động lập hồ sơ dự thảo căn cứ kế hoạch công tác.');
                        }}
                        className="text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <span>Bắt đầu soạn thảo dự thảo</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-slate-800 cursor-pointer font-medium">
                      <input
                        type="radio"
                        name="initiationType"
                        value="GIAO_VIEC"
                        checked={initiationType === 'GIAO_VIEC'}
                        onChange={() => {
                          setInitiationType('GIAO_VIEC');
                          setInitiationComment('Khởi tạo theo Lệnh giao việc và chỉ đạo trực tiếp của Lãnh đạo.');
                        }}
                        className="text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <span>Bắt đầu giao việc (Có chỉ đạo)</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Thời điểm bắt đầu chính xác: <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={startedAt}
                    onChange={(e) => setStartedAt(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-mono"
                  />
                </div>
              </div>

              {initiationType === 'GIAO_VIEC' && (
                <div>
                  <label className="block text-[11px] font-bold text-amber-900 mb-1">
                    Chỉ đạo ban đầu của Lãnh đạo (nếu có):
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Giao Phòng Kỹ thuật chủ trì, hoàn thành dự thảo trình duyệt trước ngày 15..."
                    value={initialDirective}
                    onChange={(e) => setInitialDirective(e.target.value)}
                    className="w-full bg-white border border-amber-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-amber-600"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Ý kiến / Comment bắt đầu làm bằng chứng pháp lý: <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Ghi rõ căn cứ khởi tạo, số hiệu văn bản chỉ đạo hoặc bối cảnh bắt đầu làm bằng chứng kiểm toán..."
                  value={initiationComment}
                  onChange={(e) => setInitiationComment(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                />
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

      {/* Step 2 Modal: Unified Form Duyệt Dự Thảo (Trưởng phòng) */}
      {reviewingDraft && (
        <DeptReviewDraftModal
          draft={reviewingDraft}
          currentUser={currentUser}
          onClose={() => setReviewingDraft(null)}
          onApprove={handleDeptApprove}
          onSendCoordination={handleDeptSendCoordination}
          onReject={handleDeptReject}
        />
      )}

      {/* Step 2 Modal: Coordination Setup (Legacy / Secondary) */}
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

          <div className="flex items-center gap-1.5 overflow-x-auto text-xs w-full sm:w-auto pb-1 sm:pb-0">
            <button
              onClick={() => setFilterStep('ALL')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer shrink-0 ${
                filterStep === 'ALL' ? 'bg-blue-700 text-white shadow-xs' : 'text-gray-600 hover:text-slate-900 hover:bg-gray-100'
              }`}
            >
              Tất cả ({drafts.length})
            </button>

            {/* Prominent Tab for Dept Lead to quickly spot pending drafts */}
            <button
              onClick={() => setFilterStep('PENDING_DEPT_LEAD')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                filterStep === 'PENDING_DEPT_LEAD'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300'
              }`}
            >
              <span>Chờ TP duyệt</span>
              {pendingDeptLeadDrafts.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center animate-pulse shadow-xs">
                  {pendingDeptLeadDrafts.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setFilterStep('COORDINATING')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer shrink-0 ${
                filterStep === 'COORDINATING' ? 'bg-blue-100 text-blue-900 border border-blue-300' : 'text-gray-600 hover:text-slate-900 hover:bg-gray-100'
              }`}
            >
              Đang phối hợp
            </button>
            <button
              onClick={() => setFilterStep('LEADER_ASSIGNED')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer shrink-0 ${
                filterStep === 'LEADER_ASSIGNED' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'text-gray-600 hover:text-slate-900 hover:bg-gray-100'
              }`}
            >
              Đã giao việc
            </button>
            <button
              onClick={() => setFilterStep('REPORT_SUBMITTED')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer shrink-0 ${
                filterStep === 'REPORT_SUBMITTED' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'text-gray-600 hover:text-slate-900 hover:bg-gray-100'
              }`}
            >
              Đã nộp báo cáo
            </button>
            <button
              onClick={() => setFilterStep('WAITING_VAN_THU_ARCHIVE')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                filterStep === 'WAITING_VAN_THU_ARCHIVE'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'text-purple-900 bg-purple-50 hover:bg-purple-100 border border-purple-300'
              }`}
            >
              <span>Chờ Văn thư nhập HSTL</span>
              {waitingVanThuDrafts.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-[10px] font-black flex items-center justify-center">
                  {waitingVanThuDrafts.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setFilterStep('HSTL_ARCHIVED')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer shrink-0 ${
                filterStep === 'HSTL_ARCHIVED' ? 'bg-teal-100 text-teal-900 border border-teal-300' : 'text-gray-600 hover:text-slate-900 hover:bg-gray-100'
              }`}
            >
              Đã lưu HSTL
            </button>

            {drafts.some(d => d.currentStep === 'REJECTED') && (
              <button
                onClick={() => setFilterStep('REJECTED')}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  filterStep === 'REJECTED'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200'
                }`}
              >
                <span>Bị trả lại</span>
                <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center">
                  {drafts.filter(d => d.currentStep === 'REJECTED').length}
                </span>
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 min-w-[760px]">
            <thead className="bg-blue-50/80 text-[11px] uppercase tracking-wider text-blue-950 font-bold border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Mã Hồ sơ Công việc</th>
                <th className="py-3 px-4">Trích yếu & Bằng chứng</th>
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
                  const isNewForDeptLead = d.currentStep === 'PENDING_DEPT_LEAD';
                  const isRejected = d.currentStep === 'REJECTED';

                  return (
                    <tr 
                      key={d.id} 
                      className={`transition ${
                        isRejected
                          ? 'bg-rose-50/60 hover:bg-rose-100/50 border-l-4 border-l-rose-500'
                          : isNewForDeptLead 
                            ? 'bg-amber-50/60 hover:bg-amber-100/50 border-l-4 border-l-amber-500' 
                            : 'hover:bg-blue-50/40'
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-blue-700">
                          <HighlightText text={d.code} search={searchTerm} />
                        </span>
                        <div className="text-[10px] text-gray-500 font-medium">{d.loaiVanBan}</div>
                        {isNewForDeptLead && (
                          <div className="mt-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-200 text-amber-950 border border-amber-300 animate-pulse">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-ping"></span>
                              🔥 MỚI GỬI - CHỜ DUYỆT
                            </span>
                          </div>
                        )}
                        {isRejected && (
                          <div className="mt-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-200 text-rose-950 border border-rose-300">
                              <AlertCircle className="w-3 h-3 text-rose-600" />
                              BỊ TRẢ LẠI
                            </span>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 max-w-sm">
                        <div className="line-clamp-2 text-slate-800 font-bold">
                          <HighlightText text={d.trichYeu} search={searchTerm} />
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          <span className="text-[10px] text-gray-500 font-semibold">
                            <HighlightText text={d.field} search={searchTerm} />
                          </span>
                          {d.assignmentEvidence && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-100/70 px-1.5 py-0.5 rounded border border-emerald-200">
                              <Clock className="w-3 h-3 text-emerald-600" />
                              Bắt đầu: {new Date(d.assignmentEvidence.startedAt).toLocaleDateString('vi-VN')}
                            </span>
                          )}
                        </div>

                        {/* Lý do Trưởng phòng trả lại */}
                        {isRejected && d.rejectionReason && (
                          <div className="mt-1.5 p-2 rounded-xl bg-rose-50 border border-rose-200 text-[11px] text-rose-900">
                            <span className="font-bold text-rose-800">Ý kiến Trưởng phòng trả lại:</span> {d.rejectionReason}
                          </div>
                        )}

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
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            Chờ TP kiểm tra
                          </span>
                        )}
                        {d.currentStep === 'COORDINATING' && (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                            Đang lấy ý kiến phối hợp
                          </span>
                        )}
                        {d.currentStep === 'REJECTED' && (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-900 border border-rose-300 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 text-rose-600" />
                            Trả lại (Yêu cầu sửa)
                          </span>
                        )}
                        {d.currentStep === 'DEPT_APPROVED' && (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-cyan-50 text-cyan-800 border border-cyan-200">
                            Đã duyệt dự thảo (Chờ in)
                          </span>
                        )}
                        {d.currentStep === 'LEADER_ASSIGNED' && (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            Lãnh đạo đã ký & giao việc
                          </span>
                        )}
                        {d.currentStep === 'REPORT_SUBMITTED' && (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            Đã nộp Báo cáo KQ
                          </span>
                        )}
                        {d.currentStep === 'WAITING_VAN_THU_ARCHIVE' && (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-100 text-purple-900 border border-purple-300">
                            Chờ Văn thư nhập HSTL
                          </span>
                        )}
                        {d.currentStep === 'HSTL_ARCHIVED' && (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                            ✓ Đã lưu Thư viện HSTL
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
                        {/* Always visible: Timeline & Evidence Button */}
                        <button
                          onClick={() => setViewingTimelineDraft(d)}
                          title="Xem Timeline và Bằng chứng pháp lý"
                          className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-xs inline-flex items-center gap-1 font-bold cursor-pointer"
                        >
                          <History className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Timeline</span>
                        </button>

                        {/* Step 2 actions: Trưởng phòng Duyệt dự thảo (mở form Duyệt dự thảo) */}
                        {(d.currentStep === 'PENDING_DEPT_LEAD' || d.currentStep === 'COORDINATING' || d.currentStep === 'REJECTED') && (
                          <button
                            onClick={() => setReviewingDraft(d)}
                            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs transition"
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                            <span>Duyệt dự thảo</span>
                          </button>
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

                        {/* Step 4.1: Sau khi ký đóng dấu và nộp báo cáo, Trưởng phòng yêu cầu Văn thư nhập HSTL */}
                        {(d.currentStep === 'REPORT_SUBMITTED' || d.currentStep === 'LEADER_ASSIGNED') && (
                          <button
                            onClick={() => setRequestingArchiveDraft(d)}
                            className="px-3 py-1.5 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer shadow-xs"
                            title="Theo yêu cầu Lãnh đạo, Trưởng phòng yêu cầu Văn thư đưa vào Thư viện HSTL"
                          >
                            <Stamp className="w-3.5 h-3.5 text-amber-300" />
                            Yêu cầu Văn thư nhập HSTL
                          </button>
                        )}

                        {/* Step 4.2: Chờ Văn thư nhập HSTL - Phân quyền nghiêm ngặt chỉ Văn thư được thực hiện */}
                        {d.currentStep === 'WAITING_VAN_THU_ARCHIVE' && (
                          isVanThu ? (
                            <button
                              onClick={() => setArchivingDraft(d)}
                              className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer shadow-sm animate-pulse"
                            >
                              <Archive className="w-3.5 h-3.5" />
                              Văn thư Nhập HSTL
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setRestrictedMessage(
                                  'Tất cả việc nhập bất kể một tài liệu nào vào Thư viện HSTL chỉ văn thư được phép thực hiện. Sau khi tài liệu được in ra và có chữ ký đóng dấu thì theo yêu cầu của lãnh đạo trưởng phòng yêu cầu văn thư đưa vào Thư viện HSTL để lưu trữ.'
                                );
                                setRestrictedModalOpen(true);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-amber-100 text-slate-700 border border-gray-300 text-xs inline-flex items-center gap-1 font-semibold cursor-pointer"
                              title="Chỉ Văn thư mới có thẩm quyền nhập hồ sơ vào Thư viện HSTL"
                            >
                              <Lock className="w-3.5 h-3.5 text-amber-600" />
                              Chờ Văn thư nhập HSTL
                            </button>
                          )
                        )}

                        {/* Viewer */}
                        <button
                          onClick={() => onOpenViewer(d, searchTerm)}
                          title="Xem chi tiết hồ sơ"
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

  {/* Workflow Timeline Modal */}
  {viewingTimelineDraft && (
    <WorkflowTimelineModal
      draft={viewingTimelineDraft}
      onClose={() => setViewingTimelineDraft(null)}
    />
  )}

  {/* Department Lead Request Archive Modal */}
  {requestingArchiveDraft && (
    <DeptLeadRequestArchiveModal
      draft={requestingArchiveDraft}
      currentUser={currentUser}
      onClose={() => setRequestingArchiveDraft(null)}
      onSubmit={handleDeptLeadRequestToVanThu}
    />
  )}

  {/* Restricted Van Thu Modal */}
  {restrictedModalOpen && (
    <RestrictedVanThuModal
      currentUser={currentUser}
      customMessage={restrictedMessage}
      onClose={() => setRestrictedModalOpen(false)}
      onSwitchedToVanThu={reloadData}
    />
  )}
</div>
  );
};
