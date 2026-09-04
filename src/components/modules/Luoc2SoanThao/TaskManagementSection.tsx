import React, { useState, useMemo } from 'react';
import { 
  AssignedTask, 
  UserProfile, 
  TaskCollaborator, 
  TaskPriority, 
  TaskStatus, 
  RetentionPeriod, 
  PhysicalLocation, 
  SecretAccessPermissions 
} from '../../../types';
import { StorageService } from '../../../services/storageService';
import { SAMPLE_USERS } from '../../../data/initialData';
import { PhysicalLocationSelector } from '../../common/PhysicalLocationSelector';
import { 
  Briefcase, 
  UserCheck, 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  FileText, 
  Upload, 
  Paperclip, 
  Send, 
  Check, 
  CornerDownRight, 
  Plus, 
  Trash2, 
  Sparkles, 
  Star, 
  Award, 
  MessageSquare, 
  Calendar, 
  Search, 
  Filter, 
  ShieldCheck, 
  Eye,
  AlertCircle,
  ChevronRight,
  ArrowRight,
  UserPlus,
  BellRing,
  FileEdit,
  Lock,
  Archive,
  Shield,
  ShieldAlert,
  Key,
  FolderCheck,
  CheckSquare,
  Square
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TaskManagementSectionProps {
  currentUser: UserProfile;
  tasks: AssignedTask[];
  onReload: () => void;
  onOpenViewer?: (doc: any) => void;
}

export const TaskManagementSection: React.FC<TaskManagementSectionProps> = ({
  currentUser,
  tasks,
  onReload,
  onOpenViewer
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  // Modal states
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [editingTask, setEditingTask] = useState<AssignedTask | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState('');
  const [editTaskDesc, setEditTaskDesc] = useState('');
  const [editTaskPriority, setEditTaskPriority] = useState<TaskPriority>('KHAN');
  const [editTaskDeadline, setEditTaskDeadline] = useState('');
  const [editTaskLeaderDirective, setEditTaskLeaderDirective] = useState('');
  const [editPrimaryAssigneeId, setEditPrimaryAssigneeId] = useState('');
  const [editAttachedFile, setEditAttachedFile] = useState<{ name: string; size: string } | null>(null);

  const [coordinatingTask, setCoordinatingTask] = useState<AssignedTask | null>(null);
  const [reportingTask, setReportingTask] = useState<AssignedTask | null>(null);
  const [evaluatingTask, setEvaluatingTask] = useState<AssignedTask | null>(null);
  const [viewingTask, setViewingTask] = useState<AssignedTask | null>(null);

  // Danh mục phòng ban tiêu chuẩn phục vụ phân quyền tài liệu MẬT
  const ALL_DEPARTMENTS = useMemo(() => [
    'Văn phòng Tổng công ty',
    'Ban Vận tải',
    'Ban Kỹ thuật - Hạ tầng Cơ sở',
    'Ban An toàn Giao thông',
    'Ban Tài chính - Kế toán',
    'Ban Kế hoạch - Đầu tư',
    'Ban Tổ chức Cán bộ'
  ], []);

  // Kiểm tra vai trò Cán bộ Văn thư - Lưu trữ Cơ quan
  const isVanThu =
    currentUser.role === 'VAN_THU' ||
    currentUser.role === 'ADMIN' ||
    currentUser.roleTitle?.toLowerCase().includes('văn thư') ||
    currentUser.department?.toLowerCase().includes('văn thư') ||
    currentUser.department?.toLowerCase().includes('hành chính - lưu trữ');

  // Modal 4: Lãnh đạo đánh giá, nghiệm thu & phân định bảo mật chuyển HSTL
  const [evalRating, setEvalRating] = useState<'XUAT_SAC' | 'HOAN_THANH_TOT' | 'HOAN_THANH' | 'CAN_BO_SUNG'>('HOAN_THANH_TOT');
  const [evalFeedback, setEvalFeedback] = useState('');
  const [evalSecurityLevel, setEvalSecurityLevel] = useState<'THƯỜNG' | 'MẬT'>('THƯỜNG');
  const [evalPermittedDepts, setEvalPermittedDepts] = useState<string[]>([]);
  const [evalPermittedUserIds, setEvalPermittedUserIds] = useState<string[]>([]);
  const [evalUserSearchTerm, setEvalUserSearchTerm] = useState('');

  // Modal 6: Văn thư tiếp nhận & lưu kho Thư viện HSTL 5 cấp
  const [vanThuArchivingTask, setVanThuArchivingTask] = useState<AssignedTask | null>(null);
  const [archiveRetention, setArchiveRetention] = useState<RetentionPeriod>('VĨNH VIỄN');
  const [archivePhysicalLoc, setArchivePhysicalLoc] = useState<PhysicalLocation>({
    phongBan: 'Văn phòng Tổng công ty (Phòng Hành chính - Lưu trữ)',
    ke: 'Kệ K-01 (Văn bản Đến & Chỉ đạo)',
    ngan: 'Ngăn N-01',
    hop: 'Hộp / Cặp H-01',
    hoSo: 'Hồ sơ số 01 (HS-01)',
    maVach: 'VP-K01-N01-H01-GV',
    donVi: 'Văn phòng Tổng công ty'
  });
  const [archiveSignedConfirmed, setArchiveSignedConfirmed] = useState(true);

  // Cảnh báo quy chế nghiệp vụ
  const [restrictedAlertOpen, setRestrictedAlertOpen] = useState(false);
  const [restrictedAlertMessage, setRestrictedAlertMessage] = useState('');

  // Phân quyền giao việc & lựa chọn Người chủ trì:
  // - Giám đốc và Phó Giám đốc: Được chọn toàn bộ người trong công ty
  // - Trưởng phòng: Chỉ được chọn phó phòng hoặc nhân viên phòng mình
  const isCompanyLeader =
    currentUser.role === 'LANH_DAO' ||
    currentUser.role === 'ADMIN' ||
    currentUser.roleTitle?.toLowerCase().includes('giám đốc') ||
    currentUser.department?.toLowerCase().includes('tổng giám đốc');

  const isDeptLeader =
    currentUser.role === 'TRUONG_PHONG' ||
    currentUser.roleTitle?.toLowerCase().includes('trưởng phòng') ||
    currentUser.roleTitle?.toLowerCase().includes('trưởng ban');

  // Danh sách toàn bộ nhân sự trong hệ thống
  const allUsers = useMemo(() => {
    return StorageService.getUsers();
  }, []);

  // Lọc danh sách ứng viên Người chủ trì dựa trên thẩm quyền của Lãnh đạo giao việc
  const eligibleAssignees = useMemo(() => {
    if (isCompanyLeader) {
      // Giám đốc và Phó Giám đốc: Được chọn toàn bộ người trong công ty
      return allUsers;
    }
    if (isDeptLeader) {
      // Trưởng phòng: Chỉ được chọn phó phòng hoặc nhân viên/chuyên viên phòng mình
      return allUsers.filter(u => {
        const isSameDept = u.department?.trim().toLowerCase() === currentUser.department?.trim().toLowerCase();
        const isSelf = u.id === currentUser.id;
        if (!isSameDept || isSelf) return false;

        // Chỉ chọn phó phòng hoặc nhân viên / chuyên viên / kỹ sư / cán bộ
        const isViceOrStaff =
          u.role === 'CHUYEN_VIEN' ||
          u.role === 'VAN_THU' ||
          u.roleTitle.toLowerCase().includes('phó') ||
          u.roleTitle.toLowerCase().includes('chuyên viên') ||
          u.roleTitle.toLowerCase().includes('nhân viên') ||
          u.roleTitle.toLowerCase().includes('kỹ sư') ||
          u.roleTitle.toLowerCase().includes('cán bộ');

        return isViceOrStaff;
      });
    }
    // Mặc định dự phòng nếu vai trò khác
    return allUsers.filter(u => u.id !== currentUser.id);
  }, [allUsers, isCompanyLeader, isDeptLeader, currentUser]);

  // Nhóm theo phòng ban khi Giám đốc / Phó Giám đốc chọn nhân sự toàn công ty
  const assigneesByDept = useMemo<Record<string, UserProfile[]>>(() => {
    const map: Record<string, UserProfile[]> = {};
    eligibleAssignees.forEach(u => {
      const dept = u.department || 'Đơn vị khác';
      if (!map[dept]) map[dept] = [];
      map[dept].push(u);
    });
    return map;
  }, [eligibleAssignees]);

  // Form State: Create Task (Lãnh đạo giao việc - mặc định tài khoản đang đăng nhập)
  const isLeader = currentUser.role === 'LANH_DAO' || currentUser.role === 'TRUONG_PHONG' || currentUser.role === 'ADMIN';
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('KHAN');
  const [taskDeadline, setTaskDeadline] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );
  const [taskLeaderDirective, setTaskLeaderDirective] = useState('');
  const [primaryAssigneeId, setPrimaryAssigneeId] = useState('');
  const [attachedFile, setAttachedFile] = useState<{ name: string; size: string } | null>(null);

  // Form State: Primary Assignee selects Collaborators (Người chủ trì chọn người phối hợp)
  const [collabList, setCollabList] = useState<Array<{
    userId: string;
    notes: string;
    deadline?: string;
  }>>([]);
  const [assigneePlanNote, setAssigneePlanNote] = useState('');

  // Form State: Report Completion (Báo cáo Đã xong kèm comment & file)
  const [reportComment, setReportComment] = useState('');
  const [reportResultFile, setReportResultFile] = useState<{ name: string; size: string } | null>(null);
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);

  // Handle: Leader creates Task
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) {
      alert('Vui lòng nhập tên/tiêu đề công việc cần giao!');
      return;
    }
    if (!primaryAssigneeId) {
      alert('Vui lòng chọn người chủ trì thực hiện công việc!');
      return;
    }

    const leader = currentUser;
    const assignee = allUsers.find(u => u.id === primaryAssigneeId) || SAMPLE_USERS.find(u => u.id === primaryAssigneeId);

    if (!assignee) {
      alert('Không tìm thấy người chủ trì được chọn!');
      return;
    }

    const newCode = `GV-${new Date().getFullYear()}-${String(tasks.length + 1).padStart(3, '0')}`;
    const newTask: AssignedTask = {
      id: 'task-' + Date.now(),
      code: newCode,
      title: taskTitle.trim(),
      description: taskDesc.trim(),
      priority: taskPriority,
      deadline: taskDeadline,
      assignedById: leader.id,
      assignedByName: leader.name,
      assignedByRole: leader.roleTitle || 'Lãnh đạo phụ trách',
      assignedByDept: leader.department || 'Ban Lãnh đạo',
      assignedAt: new Date().toISOString(),
      leaderDirective: taskLeaderDirective.trim() || undefined,
      attachedFileName: attachedFile?.name,
      attachedFileSize: attachedFile?.size,
      primaryAssigneeId: assignee.id,
      primaryAssigneeName: assignee.name,
      primaryAssigneeDept: assignee.department,
      primaryAssigneeRole: assignee.roleTitle,
      status: 'ASSIGNED',
      collaborators: []
    };

    StorageService.addTask(newTask);
    onReload();
    setIsCreatingTask(false);

    // Reset create form
    setTaskTitle('');
    setTaskDesc('');
    setTaskLeaderDirective('');
    setPrimaryAssigneeId('');
    setAttachedFile(null);

    try {
      confetti({ particleCount: 35, spread: 60 });
    } catch (e) {}
  };

  // Open Edit Modal - CHỈ NGƯỜI SOẠN THẢO MỚI ĐƯỢC PHÉP SỬA
  const handleOpenEditTask = (task: AssignedTask) => {
    if (task.assignedById !== currentUser.id) {
      alert(`Quyền truy cập bị từ chối: Công việc này do "${task.assignedByName}" khởi tạo. Chỉ nhân viên soạn thảo công việc này mới có quyền sửa.`);
      return;
    }
    setEditingTask(task);
    setEditTaskTitle(task.title);
    setEditTaskDesc(task.description);
    setEditTaskPriority(task.priority);
    setEditTaskDeadline(task.deadline);
    setEditTaskLeaderDirective(task.leaderDirective || '');
    setEditPrimaryAssigneeId(task.primaryAssigneeId);
    setEditAttachedFile(task.attachedFileName ? { name: task.attachedFileName, size: task.attachedFileSize || '1.8 MB' } : null);
  };

  // Save Edit Task
  const handleSaveEditTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;
    if (editingTask.assignedById !== currentUser.id) {
      alert(`Quyền truy cập bị từ chối: Chỉ nhân viên soạn thảo công việc (${editingTask.assignedByName}) mới có quyền sửa.`);
      return;
    }
    if (!editTaskTitle.trim()) {
      alert('Vui lòng nhập tên/tiêu đề công việc!');
      return;
    }
    if (!editPrimaryAssigneeId) {
      alert('Vui lòng chọn người chủ trì thực hiện công việc!');
      return;
    }

    const assignee = allUsers.find(u => u.id === editPrimaryAssigneeId) || SAMPLE_USERS.find(u => u.id === editPrimaryAssigneeId);

    StorageService.updateTask(editingTask.id, {
      title: editTaskTitle.trim(),
      description: editTaskDesc.trim(),
      priority: editTaskPriority,
      deadline: editTaskDeadline,
      leaderDirective: editTaskLeaderDirective.trim() || undefined,
      primaryAssigneeId: editPrimaryAssigneeId,
      primaryAssigneeName: assignee?.name || editingTask.primaryAssigneeName,
      primaryAssigneeDept: assignee?.department || editingTask.primaryAssigneeDept,
      primaryAssigneeRole: assignee?.roleTitle || editingTask.primaryAssigneeRole,
      attachedFileName: editAttachedFile?.name,
      attachedFileSize: editAttachedFile?.size
    });

    onReload();
    setEditingTask(null);
    try {
      confetti({ particleCount: 25, spread: 50 });
    } catch (e) {}
  };

  // Delete Task - CHỈ NGƯỜI SOẠN THẢO MỚI ĐƯỢC PHÉP XOÁ
  const handleDeleteTask = (task: AssignedTask) => {
    if (task.assignedById !== currentUser.id) {
      alert(`Quyền truy cập bị từ chối: Công việc "${task.title}" do "${task.assignedByName}" soạn thảo. Chỉ nhân viên soạn thảo công việc này mới có quyền xoá!`);
      return;
    }
    if (window.confirm(`Bạn có chắc chắn muốn xoá công việc "${task.title}" (Mã: ${task.code}) không? Hành động này sẽ loại bỏ hoàn toàn nhiệm vụ khỏi hệ thống.`)) {
      StorageService.deleteTask(task.id);
      onReload();
    }
  };

  // Open Coordination Modal for Primary Assignee
  const handleOpenCoordination = (task: AssignedTask) => {
    setCoordinatingTask(task);
    setAssigneePlanNote(task.primaryAssigneeNote || '');
    if (task.collaborators && task.collaborators.length > 0) {
      setCollabList(
        task.collaborators.map(c => ({
          userId: c.userId,
          notes: c.notes || '',
          deadline: c.deadline
        }))
      );
    } else {
      // Default empty list or 1 suggestion
      setCollabList([]);
    }
  };

  // Save Collaborators (Người chủ trì lưu danh sách người phối hợp)
  const handleSaveCollaborators = () => {
    if (!coordinatingTask) return;

    const mappedCollabs: TaskCollaborator[] = collabList.map((item, idx) => {
      const user = SAMPLE_USERS.find(u => u.id === item.userId);
      return {
        id: `collab-${Date.now()}-${idx}`,
        userId: item.userId,
        userName: user?.name || 'Cán bộ phối hợp',
        department: user?.department || '',
        roleTitle: user?.roleTitle,
        assignedAt: new Date().toISOString(),
        notes: item.notes,
        deadline: item.deadline,
        status: 'PENDING'
      };
    });

    const newStatus: TaskStatus = mappedCollabs.length > 0 ? 'COORDINATING' : 'IN_PROGRESS';

    StorageService.updateTask(coordinatingTask.id, {
      acceptedAt: coordinatingTask.acceptedAt || new Date().toISOString(),
      primaryAssigneeNote: assigneePlanNote.trim() || undefined,
      collaborators: mappedCollabs,
      status: coordinatingTask.status === 'ASSIGNED' ? newStatus : coordinatingTask.status
    });

    onReload();
    setCoordinatingTask(null);

    try {
      confetti({ particleCount: 25, spread: 45 });
    } catch (e) {}
  };

  // Open Report Completion Modal (Nút ấn Báo cáo Đã xong)
  const handleOpenReportCompletion = (task: AssignedTask) => {
    setReportingTask(task);
    setReportComment(task.completionReport?.comment || '');
    setReportResultFile(task.completionReport?.attachedFileName ? {
      name: task.completionReport.attachedFileName,
      size: task.completionReport.attachedFileSize || '1.5 MB'
    } : null);
    setReportDate(new Date().toISOString().split('T')[0]);
  };

  // Submit Completion Report (Gửi báo cáo hoàn thành tới Lãnh đạo)
  const handleSubmitCompletionReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingTask) return;
    if (!reportComment.trim()) {
      alert('Vui lòng nhập nội dung comment / báo cáo kết quả hoàn thành công việc!');
      return;
    }

    StorageService.updateTask(reportingTask.id, {
      status: 'COMPLETED_PENDING_REVIEW',
      completionReport: {
        reportedAt: new Date().toISOString(),
        reportedById: currentUser.id,
        reportedByName: currentUser.name,
        comment: reportComment.trim(),
        attachedFileName: reportResultFile?.name,
        attachedFileSize: reportResultFile?.size,
        attachedFileUrl: '#'
      }
    });

    onReload();
    setReportingTask(null);

    try {
      confetti({ particleCount: 45, spread: 70 });
    } catch (e) {}
  };

  // Helper mở modal đánh giá & phê duyệt của Lãnh đạo
  const handleOpenEvaluationModal = (task: AssignedTask) => {
    setEvaluatingTask(task);
    setEvalRating('HOAN_THANH_TOT');
    setEvalFeedback('Đồng ý kết quả báo cáo. Nhiệm vụ hoàn thành đạt yêu cầu chuyên môn, đề nghị Văn thư tiếp nhận và nạp vào Thư viện HSTL.');
    setEvalSecurityLevel(task.securityLevel || 'THƯỜNG');
    setEvalPermittedDepts(task.secretAccessPermissions?.departmentNames || [task.primaryAssigneeDept, task.assignedByDept]);
    setEvalPermittedUserIds(task.secretAccessPermissions?.userIds || [task.primaryAssigneeId, task.assignedById]);
    setEvalUserSearchTerm('');
  };

  // Leader evaluates & approves Task: Trưởng phòng/Lãnh đạo đồng ý kết quả & phân định Thường / Mật -> Chuyển Văn thư
  const handleLeaderEvaluate = (approve: boolean) => {
    if (!evaluatingTask) return;

    if (approve) {
      const isMat = evalSecurityLevel === 'MẬT';
      const perms: SecretAccessPermissions | undefined = isMat ? {
        departmentNames: evalPermittedDepts,
        userIds: evalPermittedUserIds
      } : undefined;

      StorageService.updateTask(evaluatingTask.id, {
        status: 'WAITING_VAN_THU_ARCHIVE',
        securityLevel: evalSecurityLevel,
        secretAccessPermissions: perms,
        deptLeadApproval: {
          approvedAt: new Date().toISOString(),
          approvedById: currentUser.id,
          approvedByName: currentUser.name,
          note: evalFeedback.trim() || 'Đạt yêu cầu chuyên môn.',
          securityLevel: evalSecurityLevel,
          secretAccessPermissions: perms,
          forwardedToVanThu: true
        },
        evaluation: {
          evaluatedAt: new Date().toISOString(),
          leaderId: currentUser.id,
          leaderName: currentUser.name,
          feedback: evalFeedback.trim() || 'Đồng ý kết quả báo cáo.',
          rating: evalRating
        }
      });

      StorageService.addNotification({
        id: 'notif-vt-' + Date.now(),
        title: 'Lãnh đạo đã duyệt kết quả - Chờ Văn thư lưu HSTL',
        message: `Lãnh đạo ${currentUser.name} đã phê duyệt kết quả công việc [${evaluatingTask.code} - ${evaluatingTask.title}] (Độ mật: ${evalSecurityLevel}). Đề nghị Văn thư tiếp nhận bản cứng và lưu kho Thư viện HSTL.`,
        timestamp: new Date().toISOString(),
        type: 'info',
        isRead: false
      });

      try {
        confetti({ particleCount: 50, spread: 70 });
      } catch (e) {}
    } else {
      // Yêu cầu bổ sung / làm tiếp
      StorageService.updateTask(evaluatingTask.id, {
        status: 'IN_PROGRESS',
        evaluation: {
          evaluatedAt: new Date().toISOString(),
          leaderId: currentUser.id,
          leaderName: currentUser.name,
          feedback: 'YÊU CẦU BỔ SUNG / LÀM LẠI: ' + evalFeedback.trim(),
          rating: 'CAN_BO_SUNG'
        }
      });

      StorageService.addNotification({
        id: 'notif-retry-' + Date.now(),
        title: 'Yêu cầu bổ sung báo cáo kết quả',
        message: `Lãnh đạo ${currentUser.name} yêu cầu bổ sung báo cáo nhiệm vụ [${evaluatingTask.code}]. Ý kiến: ${evalFeedback.trim()}`,
        timestamp: new Date().toISOString(),
        type: 'warning',
        isRead: false
      });
    }

    onReload();
    setEvaluatingTask(null);
  };

  // Helper mở modal Văn thư tiếp nhận & nạp Thư viện HSTL
  const handleOpenVanThuArchive = (task: AssignedTask) => {
    setVanThuArchivingTask(task);
    setArchiveRetention('VĨNH VIỄN');
    setArchiveSignedConfirmed(true);
    setArchivePhysicalLoc({
      phongBan: 'Văn phòng Tổng công ty (Phòng Hành chính - Lưu trữ)',
      ke: 'Kệ K-01 (Văn bản Đến & Chỉ đạo)',
      ngan: 'Ngăn N-01',
      hop: 'Hộp / Cặp H-01',
      hoSo: `HS-GV-${task.code.replace(/[^a-zA-Z0-9]/g, '')}`,
      maVach: `VP-K01-N01-H01-${task.code.replace(/[^a-zA-Z0-9]/g, '')}`,
      donVi: 'Văn phòng Tổng công ty'
    });
  };

  // Văn thư hoàn tất lưu trữ kho HSTL 5 cấp
  const handleConfirmVanThuArchive = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vanThuArchivingTask) return;

    StorageService.updateTask(vanThuArchivingTask.id, {
      status: 'HSTL_ARCHIVED',
      hstlArchiveInfo: {
        retentionPeriod: archiveRetention,
        physicalLocation: archivePhysicalLoc,
        archivedAt: new Date().toISOString(),
        archivedBy: currentUser.name,
        archivedByRole: currentUser.roleTitle || 'Cán bộ Văn thư - Lưu trữ Cơ quan',
        hstlCatalogId: `HSTL-GV-${vanThuArchivingTask.code}`
      }
    });

    StorageService.addNotification({
      id: 'notif-archived-' + Date.now(),
      title: 'Đã hoàn tất lưu trữ Thư viện HSTL',
      message: `Văn thư ${currentUser.name} đã tiếp nhận bản cứng và chính thức lưu trữ công việc [${vanThuArchivingTask.code}] vào Thư viện HSTL (Thời hạn: ${archiveRetention}).`,
      timestamp: new Date().toISOString(),
      type: 'success',
      isRead: false
    });

    try {
      confetti({ particleCount: 60, spread: 80 });
    } catch (e) {}

    setVanThuArchivingTask(null);
    onReload();
  };

  // Filter tasks
  const filteredTasks = tasks.filter(t => {
    const matchesQuery = 
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.primaryAssigneeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.assignedByName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = 
      statusFilter === 'ALL' ? true :
      statusFilter === 'ASSIGNED' ? t.status === 'ASSIGNED' :
      statusFilter === 'IN_PROGRESS' ? (t.status === 'IN_PROGRESS' || t.status === 'COORDINATING') :
      statusFilter === 'PENDING_REVIEW' ? t.status === 'COMPLETED_PENDING_REVIEW' :
      statusFilter === 'WAITING_VAN_THU_ARCHIVE' ? t.status === 'WAITING_VAN_THU_ARCHIVE' :
      statusFilter === 'HSTL_ARCHIVED' ? (t.status === 'HSTL_ARCHIVED' || !!t.hstlArchiveInfo) :
      statusFilter === 'COMPLETED' ? (t.status === 'COMPLETED' || t.status === 'HSTL_ARCHIVED' || t.status === 'WAITING_VAN_THU_ARCHIVE') : true;

    const matchesPriority = 
      priorityFilter === 'ALL' ? true : t.priority === priorityFilter;

    return matchesQuery && matchesStatus && matchesPriority;
  });

  // Statistics
  const totalCount = tasks.length;
  const inProgressCount = tasks.filter(t => t.status === 'IN_PROGRESS' || t.status === 'COORDINATING').length;
  const pendingReviewCount = tasks.filter(t => t.status === 'COMPLETED_PENDING_REVIEW').length;
  const waitingVanThuCount = tasks.filter(t => t.status === 'WAITING_VAN_THU_ARCHIVE').length;
  const hstlArchivedCount = tasks.filter(t => t.status === 'HSTL_ARCHIVED' || !!t.hstlArchiveInfo).length;
  const completedCount = tasks.filter(t => t.status === 'COMPLETED' || t.status === 'HSTL_ARCHIVED' || t.status === 'WAITING_VAN_THU_ARCHIVE').length;

  // Kiểm tra công việc mới được giao cho tài khoản hiện tại (status === 'ASSIGNED')
  const myNewAssignedTasks = useMemo(() => {
    return tasks.filter(t => 
      (t.primaryAssigneeId === currentUser.id || t.collaborators?.some(c => c.userId === currentUser.id)) && 
      t.status === 'ASSIGNED'
    );
  }, [tasks, currentUser.id]);

  // Kiểm tra toàn bộ công việc mới được giao trong hệ thống
  const allNewAssignedTasks = useMemo(() => {
    return tasks.filter(t => t.status === 'ASSIGNED');
  }, [tasks]);

  const assignedCount = allNewAssignedTasks.length;

  return (
    <div className="space-y-5">
      {/* Banner cảnh báo trực quan khi có công việc mới được giao */}
      {myNewAssignedTasks.length > 0 ? (
        <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 rounded-2xl p-4 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-3 border-2 border-blue-300 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0 border border-white/30 shadow-inner">
              <BellRing className="w-6 h-6 text-white animate-bounce" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider bg-white text-blue-950 px-2.5 py-0.5 rounded-full shadow-xs">
                  THÔNG BÁO GIAO VIỆC CHO BẠN
                </span>
                <span className="text-xs font-bold text-blue-100">
                  Lãnh đạo vừa giao {myNewAssignedTasks.length} công việc mới cho bạn ({currentUser.name})!
                </span>
              </div>
              <p className="text-xs text-white/95 mt-1 font-medium leading-relaxed">
                Nhiệm vụ mới đang chờ tiếp nhận: <span className="font-bold underline">{myNewAssignedTasks[0]?.title}</span>{myNewAssignedTasks.length > 1 ? ` và ${myNewAssignedTasks.length - 1} nhiệm vụ khác.` : '.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setStatusFilter('ASSIGNED');
              setSearchTerm('');
            }}
            className="px-4 py-2.5 rounded-xl bg-white text-blue-950 hover:bg-blue-50 text-xs font-extrabold shadow-sm transition shrink-0 cursor-pointer flex items-center gap-2 self-start md:self-auto"
          >
            <span>Xem ngay danh sách công việc lãnh đạo giao ({myNewAssignedTasks.length})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : allNewAssignedTasks.length > 0 ? (
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-2xl p-4 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-3 border border-indigo-400/50 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center shrink-0 border border-white/20">
              <BellRing className="w-6 h-6 text-blue-300 animate-bounce" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider bg-blue-500 text-white px-2.5 py-0.5 rounded-full shadow-xs">
                  CÔNG VIỆC MỚI ĐƯỢC LÃNH ĐẠO GIAO
                </span>
                <span className="text-xs font-bold text-blue-200">
                  Có {allNewAssignedTasks.length} nhiệm vụ Lãnh đạo vừa giao trong hệ thống đang chờ cán bộ tiếp nhận!
                </span>
              </div>
              <p className="text-xs text-white/80 mt-1 font-medium leading-relaxed">
                Được giao cho: <span className="font-semibold text-white">{allNewAssignedTasks.map(t => `${t.primaryAssigneeName} (${t.code})`).slice(0, 2).join(', ')}{allNewAssignedTasks.length > 2 ? '...' : ''}</span>. (Đang xem với tài khoản: {currentUser.name} - {currentUser.roleTitle})
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setStatusFilter('ASSIGNED');
              setSearchTerm('');
            }}
            className="px-4 py-2.5 rounded-xl bg-white text-slate-950 hover:bg-blue-50 text-xs font-extrabold shadow-sm transition shrink-0 cursor-pointer flex items-center gap-2 self-start md:self-auto"
          >
            <span>Xem ngay danh sách công việc lãnh đạo giao ({allNewAssignedTasks.length})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : null}

      {/* Header & Metric Cards */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-blue-100/70 text-blue-700 rounded-xl">
                <Briefcase className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  Quản lý giao việc
                  <span className="text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">
                    Quy trình Lãnh đạo ➔ Chủ trì ➔ Phối hợp
                  </span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Lãnh đạo (Giám đốc, Trưởng phòng) tạo công việc & chọn người chủ trì; Người chủ trì duyệt và chọn người phối hợp; Khi hoàn thành, ấn nút Đã xong kèm comment và tệp đính kèm.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setPrimaryAssigneeId('');
              setIsCreatingTask(true);
            }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 shadow-sm transition cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            Lãnh đạo Giao việc Mới
          </button>
        </div>

        {/* 5 Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-4">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <div className="text-[10.5px] font-semibold text-gray-500">Tổng công việc</div>
              <div className="text-lg font-bold text-slate-900">{totalCount}</div>
            </div>
            <Briefcase className="w-4 h-4 text-slate-400" />
          </div>

          <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 flex items-center justify-between">
            <div>
              <div className="text-[10.5px] font-semibold text-blue-700">Đang làm & Phối hợp</div>
              <div className="text-lg font-bold text-blue-900">{inProgressCount}</div>
            </div>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>

          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 flex items-center justify-between">
            <div>
              <div className="text-[10.5px] font-semibold text-amber-800">Chờ Lãnh đạo duyệt</div>
              <div className="text-lg font-bold text-amber-900">{pendingReviewCount}</div>
            </div>
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>

          <div className="p-3 rounded-xl bg-teal-50/70 border border-teal-200 flex items-center justify-between">
            <div>
              <div className="text-[10.5px] font-semibold text-teal-800">Chờ Văn thư lưu HSTL</div>
              <div className="text-lg font-bold text-teal-900">{waitingVanThuCount}</div>
            </div>
            <Archive className="w-4 h-4 text-teal-600" />
          </div>

          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
            <div>
              <div className="text-[10.5px] font-semibold text-emerald-800">Đã lưu Thư viện HSTL</div>
              <div className="text-lg font-bold text-emerald-900">{hstlArchivedCount}</div>
            </div>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo mã việc, tên việc, người chủ trì..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-xs overflow-x-auto">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                statusFilter === 'ALL' ? 'bg-white text-blue-900 shadow-xs' : 'text-gray-600 hover:text-slate-900'
              }`}
            >
              Tất cả ({totalCount})
            </button>
            <button
              onClick={() => setStatusFilter('ASSIGNED')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'ASSIGNED' ? 'bg-white text-blue-900 shadow-xs' : 'text-gray-600 hover:text-slate-900'
              }`}
            >
              <span>Mới giao</span>
              <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                assignedCount > 0 ? 'bg-blue-600 text-white animate-pulse' : 'bg-gray-200 text-gray-700'
              }`}>
                {assignedCount}
              </span>
            </button>
            <button
              onClick={() => setStatusFilter('IN_PROGRESS')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                statusFilter === 'IN_PROGRESS' ? 'bg-white text-blue-900 shadow-xs' : 'text-gray-600 hover:text-slate-900'
              }`}
            >
              Đang làm ({inProgressCount})
            </button>
            <button
              onClick={() => setStatusFilter('PENDING_REVIEW')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                statusFilter === 'PENDING_REVIEW' ? 'bg-white text-amber-900 shadow-xs' : 'text-gray-600 hover:text-slate-900'
              }`}
            >
              Chờ duyệt ({pendingReviewCount})
            </button>
            <button
              onClick={() => setStatusFilter('WAITING_VAN_THU_ARCHIVE')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'WAITING_VAN_THU_ARCHIVE' ? 'bg-white text-teal-900 shadow-xs' : 'text-gray-600 hover:text-slate-900'
              }`}
            >
              <span>Chờ lưu HSTL</span>
              <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                waitingVanThuCount > 0 ? 'bg-teal-600 text-white animate-pulse' : 'bg-gray-200 text-gray-700'
              }`}>
                {waitingVanThuCount}
              </span>
            </button>
            <button
              onClick={() => setStatusFilter('HSTL_ARCHIVED')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                statusFilter === 'HSTL_ARCHIVED' ? 'bg-white text-emerald-900 shadow-xs' : 'text-gray-600 hover:text-slate-900'
              }`}
            >
              Đã lưu HSTL ({hstlArchivedCount})
            </button>
          </div>

          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-600 cursor-pointer"
          >
            <option value="ALL">Ưu tiên: Tất cả</option>
            <option value="HOA_TOC">⚡ Hỏa tốc</option>
            <option value="KHAN">🔥 Khẩn</option>
            <option value="THUONG">Thường</option>
          </select>
        </div>
      </div>

      {/* Task List Cards */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-500">
            <Briefcase className="w-10 h-10 mx-auto text-gray-300 mb-2" />
            <p className="font-semibold text-sm">Không tìm thấy nhiệm vụ giao việc nào phù hợp</p>
            <p className="text-xs text-gray-400 mt-1">Hãy thử tìm kiếm với từ khóa khác hoặc bấm nút "Lãnh đạo Giao việc Mới" để tạo nhiệm vụ.</p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const hasReport = !!task.completionReport;
            const hasCollabs = task.collaborators && task.collaborators.length > 0;
            const isCompleted = task.status === 'COMPLETED';
            const isPendingReview = task.status === 'COMPLETED_PENDING_REVIEW';
            const isNewAssigned = task.status === 'ASSIGNED';
            const isAssignedToMe = task.primaryAssigneeId === currentUser.id || task.collaborators?.some(c => c.userId === currentUser.id);

            return (
              <div 
                key={task.id}
                className={`bg-white border rounded-2xl p-5 shadow-xs transition hover:shadow-md ${
                  isNewAssigned && isAssignedToMe ? 'border-blue-400 bg-blue-50/20 border-l-4 border-l-blue-600 shadow-sm ring-1 ring-blue-300' :
                  isNewAssigned ? 'border-blue-300 bg-blue-50/10 border-l-4 border-l-blue-500' :
                  isCompleted ? 'border-emerald-200' :
                  isPendingReview ? 'border-amber-300 bg-amber-50/20' :
                  task.priority === 'HOA_TOC' ? 'border-rose-300' :
                  'border-gray-200'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Left info */}
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200">
                        {task.code}
                      </span>

                      {/* Flag for newly assigned task */}
                      {isNewAssigned && isAssignedToMe && (
                        <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-blue-600 text-white flex items-center gap-1 shadow-xs animate-pulse">
                          <BellRing className="w-3 h-3 text-white" />
                          VIỆC MỚI GIAO CHO BẠN
                        </span>
                      )}

                      {/* Priority */}
                      {task.priority === 'HOA_TOC' && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
                          ⚡ Hỏa tốc
                        </span>
                      )}
                      {task.priority === 'KHAN' && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                          🔥 Khẩn
                        </span>
                      )}
                      {task.priority === 'THUONG' && (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                          Thường
                        </span>
                      )}

                      {/* Status badge */}
                      {task.status === 'ASSIGNED' && (
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-blue-600" />
                          Mới giao việc (Chờ tiếp nhận)
                        </span>
                      )}
                      {task.status === 'IN_PROGRESS' && (
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                          Đang thực hiện
                        </span>
                      )}
                      {task.status === 'COORDINATING' && (
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                          <Users className="w-3 h-3 text-indigo-600" />
                          Đang phối hợp thực hiện
                        </span>
                      )}
                      {task.status === 'COMPLETED_PENDING_REVIEW' && (
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 animate-pulse">
                          <Clock className="w-3 h-3 text-amber-700" />
                          Đã xong - Chờ Lãnh đạo duyệt
                        </span>
                      )}
                      {task.status === 'WAITING_VAN_THU_ARCHIVE' && (
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-900 border border-teal-300 flex items-center gap-1 animate-pulse">
                          <Archive className="w-3 h-3 text-teal-700" />
                          Lãnh đạo đã duyệt - Chờ Văn thư lưu HSTL
                        </span>
                      )}
                      {(task.status === 'HSTL_ARCHIVED' || !!task.hstlArchiveInfo) && (
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                          Đã lưu Thư viện HSTL
                        </span>
                      )}
                      {task.status === 'COMPLETED' && !task.hstlArchiveInfo && (
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Đã nghiệm thu hoàn tất
                        </span>
                      )}

                      {/* Security badge */}
                      {task.securityLevel === 'MẬT' && (
                        <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                          <Lock className="w-3 h-3 text-rose-600" />
                          MẬT (Theo chỉ định)
                        </span>
                      )}
                      {task.securityLevel === 'THƯỜNG' && (
                        <span className="text-[10.5px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                          Thường
                        </span>
                      )}
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 hover:text-blue-700 transition cursor-pointer"
                        onClick={() => setViewingTask(task)}
                      >
                        {task.title}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                        {task.description}
                      </p>
                    </div>

                    {/* Leader Directive */}
                    {task.leaderDirective && (
                      <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-slate-800">
                        <span className="font-bold text-blue-900">Chỉ đạo của {task.assignedByRole} ({task.assignedByName}):</span>{' '}
                        <span className="italic">{task.leaderDirective}</span>
                      </div>
                    )}

                    {/* People & Collaborators Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1 text-xs">
                      {/* Lãnh đạo giao */}
                      <div className="bg-slate-50 p-2 rounded-xl border border-gray-100">
                        <span className="text-[10px] text-gray-500 font-medium block">Lãnh đạo giao việc:</span>
                        <div className="font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                          <span>{task.assignedByName}</span>
                        </div>
                        <div className="text-[10px] text-gray-500">{task.assignedByRole}</div>
                      </div>

                      {/* Người chủ trì */}
                      <div className="bg-blue-50/40 p-2 rounded-xl border border-blue-100">
                        <span className="text-[10px] text-blue-700 font-bold block">👤 Người chủ trì thực hiện:</span>
                        <div className="font-bold text-blue-950 flex items-center gap-1.5 mt-0.5">
                          <UserCheck className="w-3.5 h-3.5 text-blue-700" />
                          <span>{task.primaryAssigneeName}</span>
                        </div>
                        <div className="text-[10px] text-slate-600">{task.primaryAssigneeDept}</div>
                      </div>

                      {/* Hạn hoàn thành */}
                      <div className="bg-slate-50 p-2 rounded-xl border border-gray-100">
                        <span className="text-[10px] text-gray-500 font-medium block">Hạn hoàn thành:</span>
                        <div className="font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
                          <Calendar className="w-3.5 h-3.5 text-amber-600" />
                          <span>{task.deadline}</span>
                        </div>
                        <div className="text-[10px] text-gray-500">
                          Giao ngày: {new Date(task.assignedAt).toLocaleDateString('vi-VN')}
                        </div>
                      </div>
                    </div>

                    {/* Collaborators list chip */}
                    {hasCollabs && (
                      <div className="pt-1 flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-indigo-600" />
                          Cán bộ phối hợp ({task.collaborators!.length}):
                        </span>
                        {task.collaborators!.map(c => (
                          <span 
                            key={c.id} 
                            className="text-[10px] px-2 py-0.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-900 font-medium"
                            title={c.notes}
                          >
                            {c.userName} ({c.department.replace('Ban ', '')})
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Completion Report Highlight if finished */}
                    {task.completionReport && (
                      <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-emerald-900 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Báo cáo kết quả của {task.completionReport.reportedByName}:
                          </span>
                          <span className="text-[10px] text-emerald-700 font-medium">
                            {new Date(task.completionReport.reportedAt).toLocaleString('vi-VN')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-800 italic leading-relaxed pl-4">
                          "{task.completionReport.comment}"
                        </p>
                        {task.completionReport.attachedFileName && (
                          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-white px-2.5 py-1 rounded-lg border border-emerald-200 w-fit">
                            <Paperclip className="w-3 h-3 text-emerald-600" />
                            <span>Tệp kết quả: {task.completionReport.attachedFileName}</span>
                            <span className="text-[10px] text-gray-400">({task.completionReport.attachedFileSize || '1.5 MB'})</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Leader Evaluation Note */}
                    {task.evaluation && (
                      <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200 text-xs">
                        <div className="flex items-center gap-1 font-bold text-amber-900">
                          <Star className="w-3.5 h-3.5 text-amber-600" />
                          <span>Đánh giá của Lãnh đạo ({task.evaluation.leaderName}):</span>
                          <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-amber-200/80 text-amber-950 font-bold">
                            {task.evaluation.rating === 'XUAT_SAC' ? 'XUẤT SẮC' :
                             task.evaluation.rating === 'HOAN_THANH_TOT' ? 'HOÀN THÀNH TỐT' :
                             task.evaluation.rating === 'HOAN_THANH' ? 'HOÀN THÀNH' : 'CẦN BỔ SUNG'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-800 mt-0.5 italic">{task.evaluation.feedback}</p>
                      </div>
                    )}
                  </div>

                  {/* Right Action buttons */}
                  <div className="flex flex-row lg:flex-col items-center lg:items-end gap-2 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-gray-100">
                    {/* QUY TẮC BẢN QUYỀN SOẠN THẢO: Chỉ nhân viên soạn thảo công việc này mới có quyền xoá, sửa */}
                    {task.assignedById === currentUser.id ? (
                      <div className="flex items-center gap-1.5 w-full justify-end">
                        <button
                          type="button"
                          onClick={() => handleOpenEditTask(task)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 transition cursor-pointer shadow-2xs"
                          title="Bạn là người soạn thảo công việc này - Nhấn để Sửa"
                        >
                          <FileEdit className="w-3.5 h-3.5 text-amber-600" />
                          <span>Sửa việc</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTask(task)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-300 transition cursor-pointer shadow-2xs"
                          title="Bạn là người soạn thảo công việc này - Nhấn để Xoá"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                          <span>Xóa việc</span>
                        </button>
                      </div>
                    ) : (
                      <div 
                        className="flex items-center gap-1 text-[10.5px] text-gray-500 font-medium px-2 py-1 rounded-lg bg-gray-50 border border-gray-200"
                        title={`Công việc do "${task.assignedByName}" soạn thảo. Theo quy định, chỉ người soạn thảo mới có quyền sửa hoặc xóa.`}
                      >
                        <Lock className="w-3 h-3 text-gray-400" />
                        <span>Người soạn: {task.assignedByName}</span>
                      </div>
                    )}

                    {/* Quick Action: Tiếp nhận nhiệm vụ nếu mới giao */}
                    {task.status === 'ASSIGNED' && (task.primaryAssigneeId === currentUser.id || isLeader) && (
                      <button
                        type="button"
                        onClick={() => {
                          StorageService.updateTask(task.id, {
                            status: 'IN_PROGRESS',
                            acceptedAt: new Date().toISOString(),
                            primaryAssigneeNote: `Đã tiếp nhận nhiệm vụ vào lúc ${new Date().toLocaleTimeString('vi-VN')} ngày ${new Date().toLocaleDateString('vi-VN')}`
                          });
                          onReload();
                        }}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-blue-700 bg-blue-100 hover:bg-blue-200 border border-blue-300 transition cursor-pointer shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>Tiếp nhận việc</span>
                      </button>
                    )}

                    {/* Button 1: Người chủ trì chọn người phối hợp */}
                    {(task.status === 'ASSIGNED' || task.status === 'IN_PROGRESS' || task.status === 'COORDINATING') && (
                      <button
                        type="button"
                        onClick={() => handleOpenCoordination(task)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{hasCollabs ? 'Sửa Người phối hợp' : 'Chọn Người phối hợp'}</span>
                      </button>
                    )}

                    {/* Button 2: Báo cáo Đã xong (kèm comment hoặc file) */}
                    {(task.status === 'ASSIGNED' || task.status === 'IN_PROGRESS' || task.status === 'COORDINATING') && (
                      <button
                        type="button"
                        onClick={() => handleOpenReportCompletion(task)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>Báo cáo Đã xong</span>
                      </button>
                    )}

                    {/* Button 3: Lãnh đạo / Trưởng phòng Nghiệm thu & Duyệt kết quả */}
                    {(isLeader || task.assignedById === currentUser.id) && task.status === 'COMPLETED_PENDING_REVIEW' && (
                      <button
                        type="button"
                        onClick={() => handleOpenEvaluationModal(task)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-amber-950 bg-amber-100 hover:bg-amber-200 border border-amber-300 shadow-sm transition cursor-pointer animate-pulse"
                      >
                        <Star className="w-3.5 h-3.5 text-amber-700" />
                        <span>Duyệt Nghiệm Thu &amp; Chuyển HSTL</span>
                      </button>
                    )}

                    {/* Button 4: Văn thư tiếp nhận & nạp vào Thư viện HSTL */}
                    {task.status === 'WAITING_VAN_THU_ARCHIVE' && (
                      <button
                        type="button"
                        onClick={() => {
                          if (isVanThu) {
                            handleOpenVanThuArchive(task);
                          } else {
                            setRestrictedAlertMessage(`Hồ sơ công việc [${task.code}] đã được Lãnh đạo/Trưởng phòng phê duyệt và chuyển lệnh sang Văn thư cơ quan. Theo quy chế lưu trữ, chỉ Cán bộ Văn thư mới có quyền tiếp nhận bản cứng có dấu đỏ và nạp vào Thư viện HSTL.`);
                            setRestrictedAlertOpen(true);
                          }
                        }}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer shadow-sm ${
                          isVanThu
                            ? 'text-white bg-teal-600 hover:bg-teal-700 border border-teal-500 animate-pulse'
                            : 'text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-300'
                        }`}
                        title={isVanThu ? 'Nhấn để Văn thư tiếp nhận bản cứng & lưu Thư viện HSTL' : 'Chờ Văn thư tiếp nhận bản cứng & lưu Thư viện HSTL'}
                      >
                        <Archive className={`w-3.5 h-3.5 ${isVanThu ? 'text-white' : 'text-slate-500'}`} />
                        <span>{isVanThu ? 'Văn thư Lưu HSTL' : 'Chờ Văn thư Lưu HSTL'}</span>
                      </button>
                    )}

                    {/* Button 5: Xem trong Thư viện HSTL nếu đã lưu */}
                    {(task.status === 'HSTL_ARCHIVED' || !!task.hstlArchiveInfo) && (
                      <button
                        type="button"
                        onClick={() => {
                          if (onOpenViewer) {
                            onOpenViewer({
                              id: task.id,
                              soKyHieu: task.code,
                              trichYeu: task.title,
                              loaiVanBan: 'Báo cáo & Hồ sơ Giao việc',
                              coQuanBanHanh: task.assignedByDept,
                              securityLevel: task.securityLevel || 'THƯỜNG',
                              secretAccessPermissions: task.secretAccessPermissions,
                              physicalLocation: task.hstlArchiveInfo?.physicalLocation,
                              retentionPeriod: task.hstlArchiveInfo?.retentionPeriod,
                              fileUrl: task.completionReport?.attachedFileUrl || '',
                              fileName: task.completionReport?.attachedFileName || `${task.code}_BaoCaoKetQua.pdf`
                            });
                          } else {
                            setViewingTask(task);
                          }
                        }}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 shadow-sm transition cursor-pointer"
                      >
                        <Archive className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Xem Trong HSTL</span>
                      </button>
                    )}

                    {/* Button 4: Xem chi tiết */}
                    <button
                      type="button"
                      onClick={() => setViewingTask(task)}
                      className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Chi tiết</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: Lãnh đạo Giao Việc Mới */}
      {/* ========================================================================= */}
      {isCreatingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-blue-300 rounded-2xl w-full max-w-2xl shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto text-slate-800">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                  <Briefcase className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Lãnh đạo Giao Việc & Điều Hành Nhiệm Vụ Mới
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Chỉ đạo cán bộ, chuyên viên chủ trì thực hiện theo đúng thẩm quyền và thời hạn
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsCreatingTask(false)} 
                className="text-gray-400 hover:text-slate-800 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              {/* Leader who assigns - Defaults directly to logged in account */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50/60 border border-blue-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-blue-900 block">
                      1. Lãnh đạo giao việc:
                    </span>
                    <div className="font-bold text-slate-900 text-xs flex flex-wrap items-center gap-1.5 mt-0.5">
                      <span className="text-blue-950 font-extrabold">{currentUser.name}</span>
                      <span className="text-gray-400 font-normal">•</span>
                      <span className="text-blue-700 font-semibold">{currentUser.roleTitle || 'Lãnh đạo đơn vị'}</span>
                      <span className="text-gray-400 font-normal">•</span>
                      <span className="text-gray-600 font-medium">{currentUser.department}</span>
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/70 border border-emerald-300 px-2.5 py-1 rounded-lg self-start sm:self-center shrink-0">
                  ✓ Tài khoản đang đăng nhập
                </span>
              </div>

              {/* Task Title */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  2. Tên / Tiêu đề công việc giao <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Kiểm tra hiện trường đường gom dân sinh Km 104+200 tuyến Hà Nội - Đồng Đăng..."
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 font-semibold"
                />
              </div>

              {/* Task Description & Leader Directive */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    3. Nội dung yêu cầu chi tiết <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Mô tả cụ thể nội dung công việc, mục tiêu cần đạt được..."
                    value={taskDesc}
                    onChange={(e) => setTaskDesc(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs text-slate-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    4. Ý kiến chỉ đạo của Lãnh đạo (Tùy chọn)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Ghi chú chỉ đạo, lưu ý phương pháp, tiêu chuẩn cần tuân thủ..."
                    value={taskLeaderDirective}
                    onChange={(e) => setTaskLeaderDirective(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs text-slate-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Primary Assignee Selector (LỰA CHỌN NGƯỜI CHỦ TRÌ THEO THẨM QUYỀN) */}
              <div className="bg-indigo-50/60 border border-indigo-200 rounded-xl p-3.5 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <label className="block text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-indigo-700" />
                    <span>5. Chọn Người chủ trì thực hiện: <span className="text-red-500">* (Bắt buộc)</span></span>
                  </label>

                  {isCompanyLeader ? (
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 border border-emerald-300 px-2.5 py-0.5 rounded-md flex items-center gap-1 self-start sm:self-auto">
                      <ShieldCheck className="w-3 h-3 text-emerald-700" />
                      Quyền Giám đốc / Phó Giám đốc: Toàn công ty ({eligibleAssignees.length} nhân sự)
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-indigo-800 bg-indigo-100/80 border border-indigo-300 px-2.5 py-0.5 rounded-md flex items-center gap-1 self-start sm:self-auto">
                      <Users className="w-3 h-3 text-indigo-700" />
                      Quyền Trưởng phòng: Phó phòng &amp; Nhân viên phòng mình ({eligibleAssignees.length} nhân sự)
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-indigo-900 leading-relaxed">
                  {isCompanyLeader
                    ? 'Giám đốc và Phó Giám đốc được quyền lựa chọn bất kỳ cán bộ, chuyên viên trong toàn Tổng công ty làm Người chủ trì.'
                    : `Theo quy định, Trưởng phòng chỉ được lựa chọn Phó phòng hoặc nhân viên/chuyên viên thuộc ${currentUser.department}.`}
                </p>

                <select
                  value={primaryAssigneeId}
                  onChange={(e) => setPrimaryAssigneeId(e.target.value)}
                  required
                  className="w-full bg-white border border-indigo-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 cursor-pointer font-bold mt-1"
                >
                  <option value="">-- Chọn Người chủ trì thực hiện --</option>
                  {isCompanyLeader ? (
                    (Object.entries(assigneesByDept) as [string, UserProfile[]][]).map(([dept, deptUsers]) => (
                      <optgroup key={dept} label={`🏢 ${dept}`}>
                        {deptUsers.map((user) => (
                          <option key={user.id} value={user.id}>
                            👤 {user.name} — {user.roleTitle}
                          </option>
                        ))}
                      </optgroup>
                    ))
                  ) : (
                    eligibleAssignees.map((user) => (
                      <option key={user.id} value={user.id}>
                        👤 {user.name} — {user.roleTitle} ({user.department})
                      </option>
                    ))
                  )}
                </select>

                {eligibleAssignees.length === 0 && !isCompanyLeader && (
                  <p className="text-xs text-rose-600 font-semibold mt-1">
                    ⚠️ Chưa có danh sách Phó phòng hoặc nhân viên/chuyên viên thuộc {currentUser.department} để lựa chọn.
                  </p>
                )}
              </div>

              {/* Priority & Deadline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    6. Mức độ ưu tiên
                  </label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 cursor-pointer font-semibold"
                  >
                    <option value="HOA_TOC">⚡ Hỏa tốc</option>
                    <option value="KHAN">🔥 Khẩn</option>
                    <option value="THUONG">Thường</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    7. Hạn hoàn thành <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={taskDeadline}
                    onChange={(e) => setTaskDeadline(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 cursor-pointer font-mono font-bold"
                  />
                </div>
              </div>

              {/* Attach directive document */}
              <div className="border border-dashed border-blue-200 rounded-xl p-3.5 bg-blue-50/30 text-center">
                <input
                  type="file"
                  id="task-attach-file"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setAttachedFile({
                        name: f.name,
                        size: (f.size / (1024 * 1024)).toFixed(1) + ' MB'
                      });
                    }
                  }}
                  className="hidden"
                />
                <label htmlFor="task-attach-file" className="cursor-pointer block text-xs text-blue-700 font-bold hover:underline">
                  📎 Đính kèm Tệp tài liệu chỉ đạo / Văn bản căn cứ giao việc (.pdf, .docx, .xlsx...)
                </label>
                {attachedFile && (
                  <div className="mt-1 text-[11px] text-emerald-700 font-mono font-bold">
                    ✓ Đã chọn: {attachedFile.name} ({attachedFile.size})
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsCreatingTask(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-600 hover:text-slate-900 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 shadow-sm transition cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  Ban Hành Chỉ Đạo &amp; Chuyển Việc Cho Chủ Trì
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1.1: Sửa Đổi & Cập Nhật Công Việc (Chỉ Nhân Viên Soạn Thảo Có Quyền) */}
      {/* ========================================================================= */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-amber-300 rounded-2xl w-full max-w-2xl shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto text-slate-800">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                  <FileEdit className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span>Sửa Đổi &amp; Cập Nhật Công Việc</span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold border border-amber-200">
                      {editingTask.code}
                    </span>
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Quyền tác giả: <strong>{editingTask.assignedByName}</strong> (Chỉ nhân viên soạn thảo công việc này mới có quyền sửa)
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setEditingTask(null)} 
                className="text-gray-400 hover:text-slate-800 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditTask} className="space-y-4">
              {/* Creator info badge */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  <span className="text-amber-900 font-semibold">Người soạn thảo khởi tạo:</span>
                  <span className="font-bold text-slate-900">{editingTask.assignedByName} ({editingTask.assignedByRole})</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300">
                  ✓ Bạn có toàn quyền sửa/xóa
                </span>
              </div>

              {/* Task Title */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  1. Tên / Tiêu đề công việc: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editTaskTitle}
                  onChange={(e) => setEditTaskTitle(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-amber-600"
                />
              </div>

              {/* Primary Assignee */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  2. Cán bộ Chủ trì thực hiện: <span className="text-red-500">*</span>
                </label>
                <select
                  value={editPrimaryAssigneeId}
                  onChange={(e) => setEditPrimaryAssigneeId(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-amber-600 cursor-pointer"
                >
                  {eligibleAssignees.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} - {u.roleTitle} ({u.department})
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority & Deadline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    3. Mức độ ưu tiên:
                  </label>
                  <select
                    value={editTaskPriority}
                    onChange={(e) => setEditTaskPriority(e.target.value as TaskPriority)}
                    className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-amber-600 cursor-pointer"
                  >
                    <option value="HOA_TOC">🔥 HỎA TỐC (Xử lý ngay)</option>
                    <option value="THUONG_KHAN">⚡ THƯỢNG KHẨN</option>
                    <option value="KHAN">⚠️ KHẨN (Ưu tiên cao)</option>
                    <option value="THUONG">📄 BÌNH THƯỜNG</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    4. Thời hạn hoàn thành (Deadline): <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={editTaskDeadline}
                    onChange={(e) => setEditTaskDeadline(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl p-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              {/* Task Description */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  5. Nội dung &amp; Yêu cầu công việc:
                </label>
                <textarea
                  rows={3}
                  value={editTaskDesc}
                  onChange={(e) => setEditTaskDesc(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              {/* Directive */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  6. Bút phê / Ý kiến chỉ đạo:
                </label>
                <textarea
                  rows={2}
                  value={editTaskLeaderDirective}
                  onChange={(e) => setEditTaskLeaderDirective(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              {/* Attachment file */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  7. Tệp căn cứ / Tài liệu giao việc đính kèm:
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-gray-200 cursor-pointer transition">
                    <Upload className="w-3.5 h-3.5 text-slate-600" />
                    <span>Đổi tệp đính kèm (PDF, DOCX)</span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setEditAttachedFile({
                            name: file.name,
                            size: `${(file.size / 1024).toFixed(1)} KB`
                          });
                        }
                      }}
                    />
                  </label>
                  {editAttachedFile && (
                    <div className="flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                      <Paperclip className="w-3.5 h-3.5" />
                      <span>{editAttachedFile.name} ({editAttachedFile.size})</span>
                      <button
                        type="button"
                        onClick={() => setEditAttachedFile(null)}
                        className="text-red-500 hover:text-red-700 ml-1 font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-600 hover:text-slate-900 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-sm transition cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  Lưu Thay Đổi Công Việc
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: Người chủ trì duyệt & Chọn người phối hợp */}
      {/* ========================================================================= */}
      {coordinatingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-indigo-300 rounded-2xl w-full max-w-2xl shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto text-slate-800">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                  <Users className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Người Chủ Trì Phân Công Cán Bộ Phối Hợp Thực Hiện
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Chủ trì ({coordinatingTask.primaryAssigneeName}) tiếp nhận nhiệm vụ và chỉ định người phối hợp
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setCoordinatingTask(null)} 
                className="text-gray-400 hover:text-slate-800 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Task Info Summary */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5 text-xs">
              <div className="font-mono font-bold text-blue-700">{coordinatingTask.code}</div>
              <div className="font-bold text-slate-900">{coordinatingTask.title}</div>
              <div className="text-gray-600 text-[11px] leading-relaxed">{coordinatingTask.description}</div>
              <div className="flex items-center gap-4 text-[10px] text-gray-500 pt-1">
                <span>Lãnh đạo giao: <strong>{coordinatingTask.assignedByName}</strong></span>
                <span>Hạn chót: <strong className="text-amber-700">{coordinatingTask.deadline}</strong></span>
              </div>
            </div>

            {/* Plan Note of Assignee */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                1. Kế hoạch / Phương án triển khai của Người chủ trì:
              </label>
              <textarea
                rows={2}
                placeholder="Nêu tóm tắt kế hoạch, phân chia giai đoạn thực hiện công việc..."
                value={assigneePlanNote}
                onChange={(e) => setAssigneePlanNote(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs text-slate-900 placeholder:text-gray-400 focus:outline-none focus:border-indigo-600"
              />
            </div>

            {/* Collaborator Selection list */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4 text-indigo-600" />
                  <span>2. Danh sách Cán bộ phối hợp thực hiện ({collabList.length}):</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const availableUser = SAMPLE_USERS.find(
                      u => u.id !== coordinatingTask.primaryAssigneeId && !collabList.some(c => c.userId === u.id)
                    ) || SAMPLE_USERS[0];

                    setCollabList([
                      ...collabList,
                      {
                        userId: availableUser.id,
                        notes: 'Phối hợp thực hiện và báo cáo kết quả',
                        deadline: coordinatingTask.deadline
                      }
                    ]);
                  }}
                  className="flex items-center gap-1 text-[11px] font-bold text-indigo-700 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg border border-indigo-200 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  + Thêm người phối hợp
                </button>
              </div>

              {collabList.length === 0 ? (
                <div className="p-4 bg-gray-50 border border-dashed border-gray-300 rounded-xl text-center text-xs text-gray-500">
                  Chưa chọn cán bộ phối hợp nào. Nhấn "+ Thêm người phối hợp" nếu cần sự hỗ trợ từ các phòng ban, cá nhân khác.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {collabList.map((item, idx) => (
                    <div key={idx} className="p-3 bg-indigo-50/40 border border-indigo-200 rounded-xl space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-indigo-900">
                          Người phối hợp #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setCollabList(collabList.filter((_, i) => i !== idx));
                          }}
                          className="text-red-600 hover:text-red-700 text-xs font-semibold cursor-pointer p-1"
                          title="Xóa người phối hợp"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-600 mb-0.5">
                            Cán bộ phối hợp:
                          </label>
                          <select
                            value={item.userId}
                            onChange={(e) => {
                              const updated = [...collabList];
                              updated[idx].userId = e.target.value;
                              setCollabList(updated);
                            }}
                            className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium cursor-pointer"
                          >
                            {SAMPLE_USERS.filter(u => u.id !== coordinatingTask.primaryAssigneeId).map(u => (
                              <option key={u.id} value={u.id}>
                                {u.name} - {u.roleTitle} ({u.department})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-gray-600 mb-0.5">
                            Hạn phối hợp:
                          </label>
                          <input
                            type="date"
                            value={item.deadline || coordinatingTask.deadline}
                            onChange={(e) => {
                              const updated = [...collabList];
                              updated[idx].deadline = e.target.value;
                              setCollabList(updated);
                            }}
                            className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-600 mb-0.5">
                          Nhiệm vụ cụ thể giao phối hợp:
                        </label>
                        <input
                          type="text"
                          placeholder="Ví dụ: Cung cấp số liệu thống kê lượt tàu, đo kiểm hiện trường..."
                          value={item.notes}
                          onChange={(e) => {
                            const updated = [...collabList];
                            updated[idx].notes = e.target.value;
                            setCollabList(updated);
                          }}
                          className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setCoordinatingTask(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-slate-900 cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={handleSaveCollaborators}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition cursor-pointer"
              >
                <Check className="w-4 h-4" />
                Lưu &amp; Kích Hoạt Phối Hợp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: Báo cáo Hoàn thành (Nút ấn ĐÃ XONG kèm comment & file đính kèm) */}
      {/* ========================================================================= */}
      {reportingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-emerald-300 rounded-2xl w-full max-w-xl shadow-2xl p-6 space-y-5 text-slate-800">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <CheckCircle2 className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Báo Cáo Đã Xong &amp; Hoàn Thành Nhiệm Vụ
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Gửi ý kiến kết quả và tệp đính kèm để Lãnh đạo nắm bắt và nghiệm thu
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setReportingTask(null)} 
                className="text-gray-400 hover:text-slate-800 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitCompletionReport} className="space-y-4">
              <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-3 text-xs space-y-1">
                <div className="font-bold text-emerald-950">{reportingTask.code} - {reportingTask.title}</div>
                <div className="text-slate-600">
                  Lãnh đạo giao việc: <strong>{reportingTask.assignedByName}</strong> ({reportingTask.assignedByRole})
                </div>
              </div>

              {/* Comment / Report details */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  1. Ý kiến / Comment báo cáo kết quả hoàn thành: <span className="text-red-500">* (Bắt buộc)</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Nhập chi tiết nội dung đã hoàn thành, sản phẩm đạt được, số liệu kết quả, giải trình các điểm đã thực hiện..."
                  value={reportComment}
                  onChange={(e) => setReportComment(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs text-slate-900 placeholder:text-gray-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 font-medium"
                />
              </div>

              {/* Attach Result File */}
              <div className="border border-dashed border-emerald-300 rounded-xl p-4 bg-emerald-50/40 text-center">
                <input
                  type="file"
                  id="report-result-file"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setReportResultFile({
                        name: f.name,
                        size: (f.size / (1024 * 1024)).toFixed(1) + ' MB'
                      });
                    }
                  }}
                  className="hidden"
                />
                <label htmlFor="report-result-file" className="cursor-pointer block text-xs text-emerald-800 font-bold hover:underline">
                  📎 Đính kèm Tệp báo cáo kết quả / Hồ sơ minh chứng hoàn thành (.pdf, .docx, .xlsx...)
                </label>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  Tệp này sẽ được gửi trực tiếp cho Lãnh đạo xem xét khi nghiệm thu
                </p>
                {reportResultFile && (
                  <div className="mt-2 text-xs text-emerald-800 font-mono font-bold bg-white p-1.5 rounded-lg border border-emerald-200 inline-block">
                    ✓ Đã chọn: {reportResultFile.name} ({reportResultFile.size})
                  </div>
                )}
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  2. Ngày hoàn thành:
                </label>
                <input
                  type="date"
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono font-semibold"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setReportingTask(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-slate-900 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  Xác Nhận ĐÃ XONG &amp; Báo Cáo Lên Lãnh Đạo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: Lãnh đạo Nghiệm thu & Đánh giá */}
      {/* ========================================================================= */}
      {evaluatingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-amber-300 rounded-2xl w-full max-w-xl shadow-2xl p-6 space-y-5 text-slate-800">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-amber-100 text-amber-700 rounded-xl">
                  <Star className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Lãnh Đạo Đánh Giá &amp; Nghiệm Thu Kết Quả
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Dành cho Lãnh đạo ({evaluatingTask.assignedByName}) xem xét báo cáo của người chủ trì
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setEvaluatingTask(null)} 
                className="text-gray-400 hover:text-slate-800 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Submitter's report */}
            {evaluatingTask.completionReport && (
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-950">
                    Báo cáo từ: {evaluatingTask.completionReport.reportedByName} ({evaluatingTask.primaryAssigneeDept})
                  </span>
                  <span className="text-[10px] text-emerald-700">
                    {new Date(evaluatingTask.completionReport.reportedAt).toLocaleString('vi-VN')}
                  </span>
                </div>
                <div className="text-xs text-slate-800 italic bg-white p-2.5 rounded-lg border border-emerald-100 leading-relaxed">
                  "{evaluatingTask.completionReport.comment}"
                </div>
                {evaluatingTask.completionReport.attachedFileName && (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 pt-1">
                    <Paperclip className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Tệp đính kèm kết quả: {evaluatingTask.completionReport.attachedFileName}</span>
                  </div>
                )}
              </div>
            )}

            {/* Leader rating */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                1. Xếp loại đánh giá kết quả:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'XUAT_SAC', label: '⭐ Xuất sắc' },
                  { id: 'HOAN_THANH_TOT', label: '✓ Hoàn thành tốt' },
                  { id: 'HOAN_THANH', label: 'Đạt yêu cầu' },
                  { id: 'CAN_BO_SUNG', label: '⚠️ Cần bổ sung' }
                ].map((rate) => (
                  <button
                    key={rate.id}
                    type="button"
                    onClick={() => setEvalRating(rate.id as any)}
                    className={`py-2 text-xs font-bold rounded-xl border transition cursor-pointer ${
                      evalRating === rate.id
                        ? 'bg-amber-100 border-amber-400 text-amber-950 shadow-2xs'
                        : 'bg-white border-gray-200 text-slate-700 hover:bg-gray-50'
                    }`}
                  >
                    {rate.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Leader feedback note */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                2. Ý kiến nhận xét / chỉ đạo của Lãnh đạo:
              </label>
              <textarea
                rows={3}
                placeholder="Nhập nhận xét hoặc chỉ đạo tiếp theo..."
                value={evalFeedback}
                onChange={(e) => setEvalFeedback(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-amber-600"
              />
            </div>

            {/* 3. Phân định cấp độ bảo mật khi chuyển Văn thư lưu Thư viện HSTL */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-700" />
                <label className="text-xs font-bold text-slate-900">
                  3. Phân định cấp độ bảo mật khi chuyển Văn thư lưu Thư viện HSTL:
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <label className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition ${
                  evalSecurityLevel === 'THƯỜNG' ? 'bg-blue-50/80 border-blue-400 text-blue-950 shadow-2xs' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}>
                  <input
                    type="radio"
                    name="taskSecurity"
                    checked={evalSecurityLevel === 'THƯỜNG'}
                    onChange={() => setEvalSecurityLevel('THƯỜNG')}
                    className="mt-0.5 text-blue-600 cursor-pointer"
                  />
                  <div>
                    <div className="font-bold text-xs">TÀI LIỆU THƯỜNG</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      Tất cả mọi cán bộ trong toàn Tổng công ty đều có quyền xem khi lưu vào Thư viện HSTL.
                    </div>
                  </div>
                </label>

                <label className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition ${
                  evalSecurityLevel === 'MẬT' ? 'bg-rose-50/80 border-rose-400 text-rose-950 shadow-2xs' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}>
                  <input
                    type="radio"
                    name="taskSecurity"
                    checked={evalSecurityLevel === 'MẬT'}
                    onChange={() => setEvalSecurityLevel('MẬT')}
                    className="mt-0.5 text-rose-600 cursor-pointer"
                  />
                  <div>
                    <div className="font-bold text-xs flex items-center gap-1 text-rose-700">
                      <Lock className="w-3.5 h-3.5" />
                      TÀI LIỆU MẬT (Theo chỉ định)
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      Chỉ các phòng ban hoặc các user được Trưởng phòng/Lãnh đạo chỉ định mới có quyền xem trong HSTL.
                    </div>
                  </div>
                </label>
              </div>

              {/* Nếu là MẬT: Hiển thị giao diện chỉ định Phòng ban & User */}
              {evalSecurityLevel === 'MẬT' && (
                <div className="p-3 bg-white rounded-xl border border-rose-200 space-y-3 animate-fadeIn">
                  <div className="text-[11.5px] font-bold text-rose-800 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    Chỉ định quyền xem hồ sơ Mật khi nạp vào Thư viện HSTL:
                  </div>

                  {/* Chọn Phòng ban */}
                  <div>
                    <span className="text-[11px] font-bold text-slate-700 block mb-1">
                      a. Các Phòng ban được phép xem ({evalPermittedDepts.length}):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-32 overflow-y-auto p-2 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                      {ALL_DEPARTMENTS.map(dept => {
                        const checked = evalPermittedDepts.includes(dept);
                        return (
                          <label key={dept} className="flex items-center gap-2 cursor-pointer hover:bg-white p-1 rounded">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setEvalPermittedDepts([...evalPermittedDepts, dept]);
                                } else {
                                  setEvalPermittedDepts(evalPermittedDepts.filter(d => d !== dept));
                                }
                              }}
                              className="text-rose-600 rounded"
                            />
                            <span className="text-slate-800 text-[11px]">{dept}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Chọn User cụ thể */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-slate-700">
                        b. Các Cán bộ / User cụ thể được phép xem ({evalPermittedUserIds.length}):
                      </span>
                      <input
                        type="text"
                        placeholder="Lọc tên cán bộ..."
                        value={evalUserSearchTerm}
                        onChange={(e) => setEvalUserSearchTerm(e.target.value)}
                        className="text-[10px] px-2 py-0.5 rounded border border-slate-300 w-36"
                      />
                    </div>
                    <div className="max-h-32 overflow-y-auto p-2 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                      {allUsers
                        .filter(u => !evalUserSearchTerm || u.name.toLowerCase().includes(evalUserSearchTerm.toLowerCase()) || u.roleTitle.toLowerCase().includes(evalUserSearchTerm.toLowerCase()))
                        .map(u => {
                          const checked = evalPermittedUserIds.includes(u.id);
                          return (
                            <label key={u.id} className="flex items-center justify-between cursor-pointer hover:bg-white p-1 rounded">
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setEvalPermittedUserIds([...evalPermittedUserIds, u.id]);
                                    } else {
                                      setEvalPermittedUserIds(evalPermittedUserIds.filter(id => id !== u.id));
                                    }
                                  }}
                                  className="text-rose-600 rounded"
                                />
                                <span className="text-slate-900 font-medium text-[11px]">{u.name}</span>
                              </div>
                              <span className="text-[10px] text-slate-500">{u.roleTitle} ({u.department})</span>
                            </label>
                          );
                        })}
                    </div>
                  </div>

                  <div className="text-[10.5px] text-rose-700 italic bg-rose-50 p-2 rounded border border-rose-100">
                    * Ghi chú: Ban Lãnh đạo, Trưởng phòng phụ trách và người thực hiện trực tiếp mặc định có quyền xem.
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-200">
              <button
                type="button"
                onClick={() => handleLeaderEvaluate(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 cursor-pointer"
              >
                ↩ Yêu cầu làm tiếp / bổ sung
              </button>
              <button
                type="button"
                onClick={() => handleLeaderEvaluate(true)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 shadow-md cursor-pointer"
              >
                <Check className="w-4 h-4" />
                ✓ Đồng ý kết quả &amp; Chuyển Văn thư lưu HSTL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: Xem Chi Tiết Công Việc Toàn Diện */}
      {/* ========================================================================= */}
      {viewingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-blue-300 rounded-2xl w-full max-w-2xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto text-slate-800">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-700" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Chi Tiết Hồ Sơ Giao Việc &amp; Tiến Độ Nhiệm Vụ
                  </h3>
                  <p className="text-[11px] text-gray-500 font-mono">
                    Mã: {viewingTask.code}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setViewingTask(null)} 
                className="text-gray-400 hover:text-slate-800 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-blue-50/40 p-3.5 rounded-xl border border-blue-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-blue-800">Tên nhiệm vụ:</span>
                <h4 className="text-sm font-bold text-slate-900">{viewingTask.title}</h4>
                <p className="text-slate-700 text-xs mt-1 leading-relaxed">{viewingTask.description}</p>
              </div>

              {viewingTask.leaderDirective && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="font-bold text-slate-900">Chỉ đạo của Lãnh đạo:</span>
                  <p className="text-slate-700 mt-0.5 italic">{viewingTask.leaderDirective}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-[10px] text-gray-500 block">Lãnh đạo giao việc:</span>
                  <strong className="text-slate-900 block">{viewingTask.assignedByName}</strong>
                  <span className="text-gray-500 text-[11px]">{viewingTask.assignedByRole} ({viewingTask.assignedByDept})</span>
                </div>

                <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-200">
                  <span className="text-[10px] text-indigo-700 font-bold block">Người chủ trì thực hiện:</span>
                  <strong className="text-indigo-950 block">{viewingTask.primaryAssigneeName}</strong>
                  <span className="text-slate-600 text-[11px]">{viewingTask.primaryAssigneeDept}</span>
                </div>
              </div>

              {/* Collaborators */}
              {viewingTask.collaborators && viewingTask.collaborators.length > 0 && (
                <div className="p-3 bg-indigo-50/30 border border-indigo-200 rounded-xl space-y-2">
                  <span className="font-bold text-indigo-950 block">Cán bộ phối hợp thực hiện ({viewingTask.collaborators.length}):</span>
                  <div className="space-y-1.5">
                    {viewingTask.collaborators.map((c, i) => (
                      <div key={i} className="p-2 bg-white rounded-lg border border-indigo-100 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-slate-900">{c.userName}</span>{' '}
                          <span className="text-gray-500">({c.department})</span>
                          {c.notes && <div className="text-[11px] text-indigo-800 italic mt-0.5">Nhiệm vụ: {c.notes}</div>}
                        </div>
                        {c.deadline && <span className="text-[10px] text-gray-400 font-mono">Hạn: {c.deadline}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Completion report */}
              {viewingTask.completionReport && (
                <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-950">Báo cáo kết quả:</span>
                    <span className="text-[10px] text-emerald-700">
                      {new Date(viewingTask.completionReport.reportedAt).toLocaleString('vi-VN')}
                    </span>
                  </div>
                  <p className="text-slate-800 italic bg-white p-2.5 rounded-lg border border-emerald-100">
                    "{viewingTask.completionReport.comment}"
                  </p>
                  {viewingTask.completionReport.attachedFileName && (
                    <div className="text-emerald-800 font-bold flex items-center gap-1">
                      <Paperclip className="w-3.5 h-3.5" />
                      <span>{viewingTask.completionReport.attachedFileName}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Leader evaluation & Approval */}
              {viewingTask.deptLeadApproval && (
                <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-950 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-blue-700" />
                      Lãnh đạo / Trưởng phòng Phê duyệt ({viewingTask.deptLeadApproval.approvedByName}):
                    </span>
                    <span className="text-[10px] text-blue-700">
                      {new Date(viewingTask.deptLeadApproval.approvedAt).toLocaleString('vi-VN')}
                    </span>
                  </div>
                  <p className="text-slate-800 italic">"{viewingTask.deptLeadApproval.note}"</p>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[11px] font-semibold text-slate-600">Độ mật khi lưu HSTL:</span>
                    {viewingTask.deptLeadApproval.securityLevel === 'MẬT' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                        <Lock className="w-3 h-3 text-rose-600" />
                        MẬT (Theo chỉ định)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                        THƯỜNG (Tất cả user có quyền xem)
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* HSTL Archive Info */}
              {viewingTask.hstlArchiveInfo && (
                <div className="p-3 bg-teal-50/80 border border-teal-200 rounded-xl space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-teal-950 flex items-center gap-1.5">
                      <Archive className="w-4 h-4 text-teal-700" />
                      Thông tin Lưu trữ Thư viện HSTL (Văn thư thực hiện):
                    </span>
                    <span className="text-[10px] text-teal-700">
                      {new Date(viewingTask.hstlArchiveInfo.archivedAt).toLocaleString('vi-VN')}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-slate-700">
                    <div><strong>Cán bộ Văn thư:</strong> {viewingTask.hstlArchiveInfo.archivedBy}</div>
                    <div><strong>Thời hạn bảo quản:</strong> {viewingTask.hstlArchiveInfo.retentionPeriod}</div>
                    <div><strong>Mã mục lục HSTL:</strong> {viewingTask.hstlArchiveInfo.hstlCatalogId}</div>
                    <div><strong>Vị trí kho 5 cấp:</strong> {viewingTask.hstlArchiveInfo.physicalLocation ? `${viewingTask.hstlArchiveInfo.physicalLocation.ke} - ${viewingTask.hstlArchiveInfo.physicalLocation.ngan} - ${viewingTask.hstlArchiveInfo.physicalLocation.hop}` : 'Kho lưu trữ trung tâm'}</div>
                  </div>
                </div>
              )}

              {viewingTask.evaluation && !viewingTask.deptLeadApproval && (
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-950">Đánh giá nghiệm thu của Lãnh đạo:</span>
                    <span className="text-[10px] px-2 py-0.5 bg-amber-200 text-amber-900 font-bold rounded">
                      {viewingTask.evaluation.rating}
                    </span>
                  </div>
                  <p className="text-slate-800 italic">{viewingTask.evaluation.feedback}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setViewingTask(null)}
                className="px-5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-gray-100 hover:bg-gray-200 cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: Văn thư Tiếp nhận & Lưu kho Thư viện HSTL 5 cấp */}
      {/* ========================================================================= */}
      {vanThuArchivingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[94dvh] my-auto text-slate-800">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-800 text-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/20 border border-white/30 text-white shadow-inner">
                  <Archive className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Văn Thư Tiếp Nhận &amp; Lưu Trữ Thư Viện HSTL
                  </h3>
                  <p className="text-xs text-teal-100">
                    Chỉ Văn thư cơ quan mới có quyền tiếp nhận bản cứng có dấu đỏ và nạp hồ sơ vào Thư viện HSTL
                  </p>
                </div>
              </div>
              <button
                onClick={() => setVanThuArchivingTask(null)}
                className="p-1 rounded-lg text-teal-100 hover:text-white hover:bg-white/20 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleConfirmVanThuArchive} className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50">
              {/* Task Summary */}
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    {vanThuArchivingTask.code}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600">Đơn vị giao: <strong>{vanThuArchivingTask.assignedByDept}</strong></span>
                    {vanThuArchivingTask.securityLevel === 'MẬT' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                        <Lock className="w-3 h-3 text-rose-600" />
                        MẬT (Theo chỉ định)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                        THƯỜNG
                      </span>
                    )}
                  </div>
                </div>

                <div className="font-bold text-slate-900 text-sm">
                  {vanThuArchivingTask.title}
                </div>

                {vanThuArchivingTask.deptLeadApproval && (
                  <div className="p-2 rounded-lg bg-teal-50/60 border border-teal-200 text-slate-700">
                    <div className="font-bold text-teal-900 text-[11px]">
                      ✓ Ý kiến phê duyệt của Lãnh đạo ({vanThuArchivingTask.deptLeadApproval.approvedByName}):
                    </div>
                    <div className="italic text-xs mt-0.5">"{vanThuArchivingTask.deptLeadApproval.note}"</div>
                  </div>
                )}
              </div>

              {/* 1. Chọn Thời hạn bảo quản */}
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  1. Thời hạn bảo quản hồ sơ tài liệu trong Thư viện HSTL: <span className="text-red-500">*</span>
                </label>
                <select
                  value={archiveRetention}
                  onChange={(e) => setArchiveRetention(e.target.value as RetentionPeriod)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-teal-950 cursor-pointer focus:outline-none focus:border-teal-600"
                >
                  <option value="VĨNH VIỄN">VĨNH VIỄN (Tài liệu có giá trị đặc biệt / Lịch sử Tổng công ty)</option>
                  <option value="70 NĂM">70 NĂM (Hồ sơ quy hoạch đường sắt, hồ sơ tài sản lớn)</option>
                  <option value="50 NĂM">50 NĂM (Hồ sơ kỹ thuật công trình, hồ sơ thiết kế)</option>
                  <option value="20 NĂM">20 NĂM (Hồ sơ quản lý điều hành nhiệm vụ, thanh tra kiểm tra)</option>
                  <option value="10 NĂM">10 NĂM (Báo cáo tổng kết, biên bản nghiệm thu thông thường)</option>
                  <option value="5 NĂM">5 NĂM (Báo cáo định kỳ, công tác vụ việc hành chính)</option>
                </select>
              </div>

              {/* 2. Định vị lưu trữ kho vật lý 5 cấp */}
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-2">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  2. Tọa độ xếp kho lưu trữ vật lý (Chuẩn 5 cấp quy định): <span className="text-red-500">*</span>
                </label>
                <PhysicalLocationSelector
                  value={archivePhysicalLoc}
                  onChange={setArchivePhysicalLoc}
                />
              </div>

              {/* 3. Cam kết kiểm tra bản cứng có dấu đỏ */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="chkArchiveSign"
                  checked={archiveSignedConfirmed}
                  onChange={(e) => setArchiveSignedConfirmed(e.target.checked)}
                  className="mt-0.5 text-teal-600 rounded cursor-pointer"
                />
                <label htmlFor="chkArchiveSign" className="text-xs text-slate-800 cursor-pointer leading-relaxed">
                  <strong>Xác nhận của Văn thư cơ quan:</strong> Đã tiếp nhận và đối chiếu bản in báo cáo kết quả hoàn thành có đầy đủ chữ ký của Lãnh đạo giao việc và con dấu đỏ pháp lý, sẵn sàng xếp vào hộp lưu trữ và đồng bộ dữ liệu vào Thư viện HSTL điện tử.
                </label>
              </div>

              {/* Footer actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setVanThuArchivingTask(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={!archiveSignedConfirmed}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition ${
                    archiveSignedConfirmed 
                      ? 'bg-teal-700 hover:bg-teal-800 cursor-pointer' 
                      : 'bg-slate-300 cursor-not-allowed text-slate-500'
                  }`}
                >
                  <Archive className="w-4 h-4" />
                  <span>Xác Nhận Đưa Vào Thư Viện HSTL</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 7: Cảnh Báo Quy Chế Nghiệp Vụ */}
      {/* ========================================================================= */}
      {restrictedAlertOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-rose-300 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4 text-slate-800 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">Quy Định Thẩm Quyền Nghiệp Vụ</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed text-justify">
                {restrictedAlertMessage}
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setRestrictedAlertOpen(false)}
                className="px-6 py-2 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 cursor-pointer shadow-sm"
              >
                Đã hiểu &amp; Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
