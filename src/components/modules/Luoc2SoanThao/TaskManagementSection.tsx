import React, { useState } from 'react';
import { AssignedTask, UserProfile, TaskCollaborator, TaskPriority, TaskStatus } from '../../../types';
import { StorageService } from '../../../services/storageService';
import { SAMPLE_USERS } from '../../../data/initialData';
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
  UserPlus
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
  const [coordinatingTask, setCoordinatingTask] = useState<AssignedTask | null>(null);
  const [reportingTask, setReportingTask] = useState<AssignedTask | null>(null);
  const [evaluatingTask, setEvaluatingTask] = useState<AssignedTask | null>(null);
  const [viewingTask, setViewingTask] = useState<AssignedTask | null>(null);

  // Form State: Create Task (Lãnh đạo giao việc - mặc định tài khoản đang đăng nhập)
  const isLeader = currentUser.role === 'LANH_DAO' || currentUser.role === 'TRUONG_PHONG' || currentUser.role === 'ADMIN';
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('KHAN');
  const [taskField, setTaskField] = useState('Kỹ thuật - Hạ tầng');
  const [taskDeadline, setTaskDeadline] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );
  const [taskLeaderDirective, setTaskLeaderDirective] = useState('');
  const [primaryAssigneeId, setPrimaryAssigneeId] = useState('user_cv_1');
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

  // Form State: Leader Evaluation (Lãnh đạo nghiệm thu & đánh giá)
  const [evalFeedback, setEvalFeedback] = useState('Đã nghiệm thu kết quả công việc. Nội dung báo cáo đạt chuẩn yêu cầu.');
  const [evalRating, setEvalRating] = useState<'XUAT_SAC' | 'HOAN_THANH_TOT' | 'HOAN_THANH' | 'CAN_BO_SUNG'>('HOAN_THANH_TOT');

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
    const assignee = SAMPLE_USERS.find(u => u.id === primaryAssigneeId);

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
      field: taskField,
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
    setAttachedFile(null);

    try {
      confetti({ particleCount: 35, spread: 60 });
    } catch (e) {}
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

  // Leader evaluates & approves Task
  const handleLeaderEvaluate = (approve: boolean) => {
    if (!evaluatingTask) return;

    if (approve) {
      StorageService.updateTask(evaluatingTask.id, {
        status: 'COMPLETED',
        evaluation: {
          evaluatedAt: new Date().toISOString(),
          leaderId: currentUser.id,
          leaderName: currentUser.name,
          feedback: evalFeedback.trim(),
          rating: evalRating
        }
      });
    } else {
      // Yêu cầu bổ sung / làm tiếp
      StorageService.updateTask(evaluatingTask.id, {
        status: 'IN_PROGRESS',
        evaluation: {
          evaluatedAt: new Date().toISOString(),
          leaderId: currentUser.id,
          leaderName: currentUser.name,
          feedback: 'YÊU CẦU BỔ SUNG: ' + evalFeedback.trim(),
          rating: 'CAN_BO_SUNG'
        }
      });
    }

    onReload();
    setEvaluatingTask(null);
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
      statusFilter === 'COMPLETED' ? t.status === 'COMPLETED' : true;

    const matchesPriority = 
      priorityFilter === 'ALL' ? true : t.priority === priorityFilter;

    return matchesQuery && matchesStatus && matchesPriority;
  });

  // Statistics
  const totalCount = tasks.length;
  const inProgressCount = tasks.filter(t => t.status === 'IN_PROGRESS' || t.status === 'COORDINATING' || t.status === 'ASSIGNED').length;
  const pendingReviewCount = tasks.filter(t => t.status === 'COMPLETED_PENDING_REVIEW').length;
  const completedCount = tasks.filter(t => t.status === 'COMPLETED').length;

  return (
    <div className="space-y-5">
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
                  Quản lý Giao việc & Điều hành Nhiệm vụ
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
            onClick={() => setIsCreatingTask(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 shadow-sm transition cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            Lãnh đạo Giao việc Mới
          </button>
        </div>

        {/* 4 Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-4">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-gray-500">Tổng công việc</div>
              <div className="text-lg font-bold text-slate-900">{totalCount}</div>
            </div>
            <Briefcase className="w-5 h-5 text-slate-400" />
          </div>

          <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-blue-700">Đang thực hiện & Phối hợp</div>
              <div className="text-lg font-bold text-blue-900">{inProgressCount}</div>
            </div>
            <Clock className="w-5 h-5 text-blue-600" />
          </div>

          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-amber-800">Chờ Lãnh đạo nghiệm thu</div>
              <div className="text-lg font-bold text-amber-900">{pendingReviewCount}</div>
            </div>
            <AlertCircle className="w-5 h-5 text-amber-600" />
          </div>

          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-emerald-800">Đã hoàn tất & Nghiệm thu</div>
              <div className="text-lg font-bold text-emerald-900">{completedCount}</div>
            </div>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
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
              Chờ nghiệm thu ({pendingReviewCount})
            </button>
            <button
              onClick={() => setStatusFilter('COMPLETED')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                statusFilter === 'COMPLETED' ? 'bg-white text-emerald-900 shadow-xs' : 'text-gray-600 hover:text-slate-900'
              }`}
            >
              Đã nghiệm thu ({completedCount})
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

            return (
              <div 
                key={task.id}
                className={`bg-white border rounded-2xl p-5 shadow-xs transition hover:shadow-md ${
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

                      <span className="text-[11px] text-gray-500 font-medium">
                        Lĩnh vực: <strong className="text-slate-700">{task.field}</strong>
                      </span>

                      {/* Status badge */}
                      {task.status === 'ASSIGNED' && (
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
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
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1 animate-pulse">
                          <Clock className="w-3 h-3 text-amber-700" />
                          Đã xong - Chờ Lãnh đạo nghiệm thu
                        </span>
                      )}
                      {task.status === 'COMPLETED' && (
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Đã nghiệm thu hoàn tất
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
                    {/* Button 1: Người chủ trì chọn người phối hợp */}
                    <button
                      type="button"
                      onClick={() => handleOpenCoordination(task)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{hasCollabs ? 'Sửa Người phối hợp' : 'Chọn Người phối hợp'}</span>
                    </button>

                    {/* Button 2: Báo cáo Đã xong (kèm comment hoặc file) */}
                    {task.status !== 'COMPLETED' && (
                      <button
                        type="button"
                        onClick={() => handleOpenReportCompletion(task)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>Báo cáo Đã xong</span>
                      </button>
                    )}

                    {/* Button 3: Lãnh đạo nghiệm thu */}
                    {(isLeader || task.assignedById === currentUser.id) && task.status === 'COMPLETED_PENDING_REVIEW' && (
                      <button
                        type="button"
                        onClick={() => {
                          setEvaluatingTask(task);
                          setEvalFeedback('Đồng ý nghiệm thu. Báo cáo đạt yêu cầu chuyên môn.');
                        }}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 shadow-sm transition cursor-pointer"
                      >
                        <Star className="w-3.5 h-3.5 text-amber-700" />
                        <span>Lãnh đạo Nghiệm thu</span>
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

              {/* Primary Assignee Selector (BẮT BUỘC CHỌN NGƯỜI CHỦ TRÌ) */}
              <div className="bg-indigo-50/60 border border-indigo-200 rounded-xl p-3.5 space-y-1">
                <label className="block text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-indigo-700" />
                  <span>5. Chọn Người chủ trì thực hiện: <span className="text-red-500">* (Bắt buộc)</span></span>
                </label>
                <p className="text-[11px] text-indigo-800">
                  Người chủ trì chịu trách nhiệm chính, tiếp nhận nhiệm vụ và có quyền chọn người phối hợp thực hiện.
                </p>
                <select
                  value={primaryAssigneeId}
                  onChange={(e) => setPrimaryAssigneeId(e.target.value)}
                  required
                  className="w-full bg-white border border-indigo-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 cursor-pointer font-bold mt-1.5"
                >
                  {SAMPLE_USERS.map((user) => (
                    <option key={user.id} value={user.id}>
                      👤 {user.name} - {user.roleTitle} ({user.department})
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority, Field, Deadline */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                    7. Lĩnh vực chuyên môn
                  </label>
                  <select
                    value={taskField}
                    onChange={(e) => setTaskField(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 cursor-pointer"
                  >
                    <option value="Kỹ thuật - Hạ tầng">Kỹ thuật - Hạ tầng Cơ sở</option>
                    <option value="Vận tải - Điều hành">Vận tải & Điều hành chạy tàu</option>
                    <option value="Tài chính - Kế toán">Tài chính - Kế toán</option>
                    <option value="An toàn giao thông">An toàn Giao thông Đường sắt</option>
                    <option value="Văn phòng - Tổ chức">Văn phòng & Hành chính</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    8. Hạn hoàn thành <span className="text-red-500">*</span>
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

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200">
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
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm cursor-pointer"
              >
                <Check className="w-4 h-4" />
                ✓ Duyệt Nghiệm Thu Hoàn Tất
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

              {/* Leader evaluation */}
              {viewingTask.evaluation && (
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
    </div>
  );
};
