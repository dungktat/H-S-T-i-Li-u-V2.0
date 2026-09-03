import React, { useState } from 'react';
import { ExistingDocument, UserProfile, CoordinationFeedback, SecretAccessPermissions } from '../../../types';
import { StorageService } from '../../../services/storageService';
import { 
  ShieldCheck, 
  CheckCircle, 
  XCircle, 
  Users, 
  AlertCircle,
  Clock,
  Plus,
  Trash2,
  FileText,
  Lock,
  Globe,
  Building2,
  UserCheck,
  Send,
  Search,
  CheckSquare,
  Square,
  Sparkles,
  MessageSquare
} from 'lucide-react';

interface Luong1ReviewModalProps {
  doc: ExistingDocument;
  currentUser: UserProfile;
  onClose: () => void;
  onApprove: (
    doc: ExistingDocument, 
    note: string, 
    extra?: { 
      securityLevel: 'THƯỜNG' | 'MẬT'; 
      secretAccessPermissions?: SecretAccessPermissions;
      forwardToVanThu?: boolean;
    }
  ) => void;
  onReject: (doc: ExistingDocument, reason: string) => void;
  onCoordinate: (doc: ExistingDocument, note: string, coordinations: CoordinationFeedback[]) => void;
}

export const Luong1ReviewModal: React.FC<Luong1ReviewModalProps> = ({
  doc,
  currentUser,
  onClose,
  onApprove,
  onReject,
  onCoordinate
}) => {
  const allUsers = StorageService.getUsers();
  const allDepartments = StorageService.getDepartments();

  const [activeAction, setActiveAction] = useState<'APPROVE' | 'REJECT' | 'COORDINATE'>('APPROVE');
  const [note, setNote] = useState(
    doc.hasStamp 
      ? 'Bản scan có con dấu đỏ và chữ ký đầy đủ, chuẩn quy thức pháp lý. Trưởng phòng thẩm tra đạt, chuyển Văn thư phê duyệt nhập Thư viện HSTL.' 
      : 'Hồ sơ đã kiểm tra đạt yêu cầu kỹ thuật & pháp lý. Đồng ý phê duyệt, cho phép in xuất bản trình Lãnh đạo.'
  );
  const [rejectReason, setRejectReason] = useState('');

  // 2 Chế độ bảo mật: Thường & Mật
  const [securityLevel, setSecurityLevel] = useState<'THƯỜNG' | 'MẬT'>(
    doc.securityLevel === 'MẬT' ? 'MẬT' : 'THƯỜNG'
  );

  // Phân quyền xem cho tài liệu MẬT
  const [permittedUserIds, setPermittedUserIds] = useState<string[]>(
    doc.secretAccessPermissions?.userIds || [currentUser.id, doc.createdBy]
  );
  const [permittedDeptNames, setPermittedDeptNames] = useState<string[]>(
    doc.secretAccessPermissions?.departmentNames || [currentUser.department, 'Ban Kỹ thuật - Hạ tầng Cơ sở']
  );
  const [userSearchTerm, setUserSearchTerm] = useState('');

  // Phối hợp: Danh sách cá nhân / đơn vị được chọn
  const [coordinators, setCoordinators] = useState<Array<{
    userId: string;
    userName: string;
    department: string;
    deadline: string;
  }>>([
    {
      userId: 'user_at_1',
      userName: 'Đặng Quốc Huy',
      department: 'Ban An toàn Giao thông Đường sắt',
      deadline: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0]
    }
  ]);

  const [selectedCoordUserId, setSelectedCoordUserId] = useState<string>('');
  const [coordDeadline, setCoordDeadline] = useState<string>(
    new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0]
  );

  // Toggle user permission for Mật
  const toggleUserPermission = (userId: string) => {
    if (permittedUserIds.includes(userId)) {
      setPermittedUserIds(permittedUserIds.filter(id => id !== userId));
    } else {
      setPermittedUserIds([...permittedUserIds, userId]);
    }
  };

  // Toggle department permission for Mật
  const toggleDeptPermission = (deptName: string) => {
    if (permittedDeptNames.includes(deptName)) {
      setPermittedDeptNames(permittedDeptNames.filter(name => name !== deptName));
    } else {
      setPermittedDeptNames([...permittedDeptNames, deptName]);
    }
  };

  // Add coordinator
  const handleAddCoordinator = () => {
    if (!selectedCoordUserId) return;
    const user = allUsers.find(u => u.id === selectedCoordUserId);
    if (!user) return;

    if (!coordinators.some(c => c.userId === user.id)) {
      setCoordinators([
        ...coordinators,
        {
          userId: user.id,
          userName: user.name,
          department: user.department,
          deadline: coordDeadline
        }
      ]);
    }
    setSelectedCoordUserId('');
  };

  const handleRemoveCoordinator = (userId: string) => {
    setCoordinators(coordinators.filter(c => c.userId !== userId));
  };

  // Execute Action
  const handleExecute = (forwardToVanThu: boolean = true) => {
    if (activeAction === 'APPROVE') {
      const perms: SecretAccessPermissions = {
        userIds: permittedUserIds,
        departmentNames: permittedDeptNames
      };
      onApprove(doc, note, {
        securityLevel,
        secretAccessPermissions: securityLevel === 'MẬT' ? perms : undefined,
        forwardToVanThu: doc.hasStamp ? forwardToVanThu : false
      });
    } else if (activeAction === 'REJECT') {
      if (!rejectReason.trim()) {
        alert('Vui lòng nêu rõ lý do trả lại / yêu cầu chỉnh sửa hồ sơ!');
        return;
      }
      onReject(doc, rejectReason);
    } else if (activeAction === 'COORDINATE') {
      if (coordinators.length === 0) {
        alert('Vui lòng chọn ít nhất một cá nhân hoặc phòng ban để chuyển phối hợp!');
        return;
      }
      const coords: CoordinationFeedback[] = coordinators.map((c, idx) => ({
        id: `coord-${Date.now()}-${idx}`,
        unitId: `dept-${c.department}`,
        unitName: c.department,
        officerId: c.userId,
        officerName: c.userName,
        deadlineSLA: c.deadline,
        status: 'PENDING'
      }));
      onCoordinate(doc, note, coords);
    }
  };

  const filteredUsers = allUsers.filter(u => 
    u.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    u.department.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    u.roleTitle.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94dvh] my-auto text-slate-800">
        
        {/* Header Top */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-gradient-to-r from-[#003882] via-[#094ba1] to-[#002f70] text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 text-white shadow-inner">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                Thẩm Định &amp; Phê Duyệt Hồ Sơ (Trưởng Phòng)
              </h3>
              <p className="text-[11px] text-blue-100">
                Thẩm tra tính pháp lý, phân quyền độ mật và điều phối luồng văn bản
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-blue-100 hover:text-white hover:bg-white/15 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-[#f8fafc]">
          
          {/* Document Summary Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs space-y-2.5 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sm text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                  {doc.soKyHieu}
                </span>
                <span className="font-semibold text-slate-700 bg-gray-100 px-2 py-0.5 rounded">
                  {doc.loaiVanBan}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {doc.hasStamp ? (
                  <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 font-bold border border-red-200">
                    <span className="w-2 h-2 rounded-full bg-red-600"></span> Đã có dấu đỏ
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 font-bold border border-amber-200">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span> Chưa có dấu (Trình duyệt)
                  </span>
                )}
                {securityLevel === 'THƯỜNG' ? (
                  <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Thường
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold border border-rose-200">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span> Mật
                  </span>
                )}
              </div>
            </div>

            <div>
              <span className="text-gray-500 font-medium">Trích yếu nội dung:</span>
              <p className="text-slate-900 font-semibold text-xs mt-0.5 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-gray-200">
                {doc.trichYeu}
              </p>
            </div>

            {/* Submitter's comment / note */}
            {doc.submissionComment && (
              <div className="p-3 bg-blue-50/90 border border-blue-200 rounded-xl space-y-1 shadow-2xs">
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                  <MessageSquare className="w-3.5 h-3.5 text-blue-700" />
                  <span>Ý kiến / Lời nhắn của người trình ({doc.createdByName}):</span>
                </div>
                <p className="text-xs text-slate-800 leading-relaxed pl-5 italic font-medium">
                  "{doc.submissionComment}"
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-600 text-[11px] pt-1">
              <div>Đơn vị lập/ban hành: <strong className="text-slate-800">{doc.coQuanBanHanh}</strong></div>
              <div>Chuyên viên trình: <strong className="text-slate-800">{doc.createdByName}</strong> ({new Date(doc.createdAt).toLocaleDateString('vi-VN')})</div>
            </div>
          </div>

          {/* Action Choice Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-800">
              Quyết định xử lý của Trưởng phòng:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Option 1: Phê duyệt */}
              <button
                type="button"
                onClick={() => setActiveAction('APPROVE')}
                className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 cursor-pointer ${
                  activeAction === 'APPROVE'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-300 shadow-xs'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-emerald-50/40'
                }`}
              >
                <div className={`p-1.5 rounded-lg shrink-0 ${activeAction === 'APPROVE' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">1. Phê duyệt</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">
                    {doc.hasStamp ? 'Chuyển Văn thư nhập HSTL' : 'Duyệt in trình Lãnh đạo'}
                  </div>
                </div>
              </button>

              {/* Option 2: Trả lại */}
              <button
                type="button"
                onClick={() => setActiveAction('REJECT')}
                className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 cursor-pointer ${
                  activeAction === 'REJECT'
                    ? 'bg-red-50 border-red-500 text-red-950 ring-2 ring-red-300 shadow-xs'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-red-50/40'
                }`}
              >
                <div className={`p-1.5 rounded-lg shrink-0 ${activeAction === 'REJECT' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                  <XCircle className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">2. Trả lại</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">Yêu cầu chỉnh sửa / hoàn thiện</div>
                </div>
              </button>

              {/* Option 3: Phối hợp */}
              <button
                type="button"
                onClick={() => setActiveAction('COORDINATE')}
                className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 cursor-pointer ${
                  activeAction === 'COORDINATE'
                    ? 'bg-blue-50 border-blue-500 text-blue-950 ring-2 ring-blue-300 shadow-xs'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-blue-50/40'
                }`}
              >
                <div className={`p-1.5 rounded-lg shrink-0 ${activeAction === 'COORDINATE' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">3. Chuyển phối hợp</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">Lấy ý kiến cá nhân / ban khác</div>
                </div>
              </button>
            </div>
          </div>

          {/* Dynamic Content Based on Action */}
          {activeAction === 'APPROVE' && (
            <div className="space-y-4 animate-fadeIn">
              
              {/* Section: 2 Chế độ bảo mật Thường vs Mật */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-blue-700" />
                    Chế độ bảo mật &amp; Phân quyền xem (Chỉ 2 chế độ):
                  </label>
                  <span className="text-[11px] text-gray-500 font-medium">Trưởng phòng quyết định quyền xem</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Chế độ THƯỜNG */}
                  <button
                    type="button"
                    onClick={() => setSecurityLevel('THƯỜNG')}
                    className={`p-3 rounded-xl border text-left transition flex items-start gap-3 cursor-pointer ${
                      securityLevel === 'THƯỜNG'
                        ? 'bg-emerald-50/80 border-emerald-500 text-emerald-950 ring-2 ring-emerald-300 shadow-xs'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs font-bold flex items-center gap-1.5 text-emerald-900">
                        Chế độ THƯỜNG (Công khai)
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                        Sau khi đưa vào Thư viện HSTL, <strong>tất cả cán bộ nhân viên</strong> trong hệ thống đều được quyền tra cứu và xem văn bản.
                      </p>
                    </div>
                  </button>

                  {/* Chế độ MẬT */}
                  <button
                    type="button"
                    onClick={() => setSecurityLevel('MẬT')}
                    className={`p-3 rounded-xl border text-left transition flex items-start gap-3 cursor-pointer ${
                      securityLevel === 'MẬT'
                        ? 'bg-rose-50/80 border-rose-500 text-rose-950 ring-2 ring-rose-300 shadow-xs'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Lock className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs font-bold flex items-center gap-1.5 text-rose-900">
                        Chế độ MẬT (Giới hạn quyền xem)
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                        Chỉ những <strong>cá nhân hoặc đơn vị/phòng ban được tick chọn</strong> dưới đây mới có quyền xem nội dung chi tiết.
                      </p>
                    </div>
                  </button>
                </div>

                {/* Permissions Picker (Khi chọn MẬT) */}
                {securityLevel === 'MẬT' && (
                  <div className="mt-3 p-3.5 bg-rose-50/40 border border-rose-200 rounded-xl space-y-4 animate-fadeIn">
                    
                    {/* Tick chọn Đơn vị / Phòng ban */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-rose-700" />
                          1. Tick chọn Đơn vị / Phòng ban được phép xem ({permittedDeptNames.length} đã chọn):
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setPermittedDeptNames(allDepartments.map(d => d.name))}
                            className="text-[10px] text-blue-700 hover:underline font-bold"
                          >
                            Chọn tất cả
                          </button>
                          <span className="text-gray-300">|</span>
                          <button
                            type="button"
                            onClick={() => setPermittedDeptNames([])}
                            className="text-[10px] text-gray-500 hover:underline"
                          >
                            Bỏ chọn
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto p-1 bg-white rounded-lg border border-rose-200">
                        {allDepartments.map((dept) => {
                          const isChecked = permittedDeptNames.includes(dept.name);
                          return (
                            <label
                              key={dept.id}
                              className={`flex items-center gap-2 p-2 rounded text-xs transition cursor-pointer ${
                                isChecked ? 'bg-rose-50 text-rose-950 font-bold' : 'text-slate-700 hover:bg-gray-50'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleDeptPermission(dept.name)}
                                className="w-3.5 h-3.5 rounded text-rose-600 focus:ring-rose-500 border-gray-300"
                              />
                              <span className="truncate">{dept.name}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Tick chọn Cá nhân */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-rose-700" />
                          2. Tick chọn Cá nhân cụ thể được phép xem ({permittedUserIds.length} đã chọn):
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setPermittedUserIds(allUsers.map(u => u.id))}
                            className="text-[10px] text-blue-700 hover:underline font-bold"
                          >
                            Chọn tất cả
                          </button>
                          <span className="text-gray-300">|</span>
                          <button
                            type="button"
                            onClick={() => setPermittedUserIds([currentUser.id, doc.createdBy])}
                            className="text-[10px] text-gray-500 hover:underline"
                          >
                            Chỉ người lập &amp; Trưởng phòng
                          </button>
                        </div>
                      </div>

                      {/* Search box for users */}
                      <div className="mb-2">
                        <input
                          type="text"
                          value={userSearchTerm}
                          onChange={(e) => setUserSearchTerm(e.target.value)}
                          placeholder="Tìm cá nhân theo tên, chức danh hoặc phòng ban..."
                          className="w-full text-xs px-3 py-1.5 rounded-lg border border-rose-200 bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1 bg-white rounded-lg border border-rose-200">
                        {filteredUsers.map((user) => {
                          const isChecked = permittedUserIds.includes(user.id);
                          return (
                            <label
                              key={user.id}
                              className={`flex items-center gap-2 p-2 rounded text-xs transition cursor-pointer ${
                                isChecked ? 'bg-rose-50 text-rose-950 font-bold' : 'text-slate-700 hover:bg-gray-50'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleUserPermission(user.id)}
                                className="w-3.5 h-3.5 rounded text-rose-600 focus:ring-rose-500 border-gray-300"
                              />
                              <div className="min-w-0 truncate">
                                <div className="truncate font-semibold">{user.name}</div>
                                <div className="text-[10px] text-gray-500 truncate">{user.roleTitle} • {user.department}</div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Ý kiến phê duyệt */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  Ý kiến thẩm tra &amp; phê duyệt của Trưởng phòng:
                </label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  placeholder="Nhập ý kiến phê duyệt, chấp thuận chuyển Văn thư định vị xếp kho..."
                />
              </div>
            </div>
          )}

          {activeAction === 'REJECT' && (
            <div className="bg-white border border-red-200 rounded-xl p-4 shadow-xs space-y-3 animate-fadeIn">
              <label className="block text-xs font-bold text-red-800">
                Lý do trả lại &amp; Yêu cầu chỉnh sửa cho Chuyên viên: <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                required
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full bg-white border border-red-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100"
                placeholder="Nêu rõ lý do chưa đạt (thiếu bản vẽ, số liệu chưa chuẩn, căn cứ pháp lý chưa đủ...) để chuyên viên tiếp thu sửa lại..."
              />
              <div className="p-2.5 rounded-lg bg-red-50 text-red-800 text-[11px] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Hồ sơ sẽ chuyển về trạng thái <strong>Bị Trả Lại</strong> và gửi thông báo chuông đến Chuyên viên lập hồ sơ.</span>
              </div>
            </div>
          )}

          {activeAction === 'COORDINATE' && (
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs space-y-4 animate-fadeIn">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Nội dung đề nghị phối hợp / thẩm tra chéo:
                </label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  placeholder="Nêu rõ các nội dung kỹ thuật, dự toán hoặc an toàn cần các chuyên viên/đơn vị thẩm định..."
                />
              </div>

              {/* Chọn cá nhân phối hợp (trong phòng hoặc phòng khác) */}
              <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-xl space-y-3">
                <span className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-blue-700" />
                  Chọn cá nhân phối hợp (Trong phòng ban hoặc Phòng ban khác):
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <div className="sm:col-span-7">
                    <select
                      value={selectedCoordUserId}
                      onChange={(e) => setSelectedCoordUserId(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer font-medium"
                    >
                      <option value="">-- Chọn cán bộ / chuyên viên --</option>
                      {allUsers.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name} - {user.roleTitle} ({user.department})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <input
                      type="date"
                      value={coordDeadline}
                      onChange={(e) => setCoordDeadline(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-lg px-2 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      title="Hạn xử lý SLA"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <button
                      type="button"
                      onClick={handleAddCoordinator}
                      disabled={!selectedCoordUserId}
                      className="w-full h-full py-2 bg-blue-700 hover:bg-blue-800 disabled:bg-gray-300 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Thêm
                    </button>
                  </div>
                </div>

                {/* Danh sách đã chọn */}
                <div className="space-y-1.5 pt-1">
                  <div className="text-[11px] font-bold text-gray-500">
                    Danh sách cán bộ được phân công lấy ý kiến ({coordinators.length}):
                  </div>
                  {coordinators.length === 0 ? (
                    <div className="text-xs text-gray-400 italic p-3 text-center bg-white rounded-lg border border-dashed border-gray-200">
                      Chưa chọn cán bộ phối hợp nào
                    </div>
                  ) : (
                    coordinators.map((c) => (
                      <div key={c.userId} className="flex items-center justify-between p-2.5 bg-white border border-blue-200 rounded-lg text-xs shadow-xs">
                        <div>
                          <strong className="text-blue-900">{c.userName}</strong>
                          <span className="text-gray-500 text-[11px] ml-1.5">({c.department})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-blue-600" /> Hạn: {c.deadline}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveCoordinator(c.userId)}
                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded cursor-pointer"
                            title="Xóa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-3.5 bg-gray-50 border-t border-gray-200 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:text-slate-900 bg-white border border-gray-200 hover:bg-gray-100 transition cursor-pointer"
          >
            Đóng lại
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {activeAction === 'APPROVE' && (
              <>
                {doc.hasStamp ? (
                  <button
                    type="button"
                    onClick={() => handleExecute(true)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 shadow-sm transition cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    Chuyển Văn Thư Phê Duyệt Nhập HSTL
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleExecute(false)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Phê Duyệt Đạt (Cho Phép In Trình Lãnh Đạo)
                  </button>
                )}
              </>
            )}

            {activeAction === 'REJECT' && (
              <button
                type="button"
                onClick={() => handleExecute()}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-sm transition cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                Xác Nhận Trả Lại Cho Chuyên Viên
              </button>
            )}

            {activeAction === 'COORDINATE' && (
              <button
                type="button"
                onClick={() => handleExecute()}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 shadow-sm transition cursor-pointer"
              >
                <Users className="w-4 h-4" />
                Gửi Yêu Cầu Phối Hợp ({coordinators.length} Cán Bộ)
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
