import React, { useState, useEffect, useMemo } from 'react';
import { StorageService } from '../../../services/storageService';
import { UserProfile, DepartmentItem } from '../../../types';
import { 
  Building2, 
  User, 
  Users, 
  ShieldCheck, 
  Check, 
  X, 
  Search, 
  Award, 
  Shield, 
  ChevronDown, 
  ChevronUp, 
  Globe, 
  Sparkles,
  Lock,
  UserCheck
} from 'lucide-react';

interface OutgoingRecipientComboboxProps {
  selectedDepts: string[];
  onChangeDepts: (depts: string[]) => void;
  selectedUserIds: string[];
  onChangeUserIds: (ids: string[], names: string[]) => void;
  externalRecipients: string;
  onChangeExternal: (ext: string) => void;
  onFullTextGenerated?: (fullText: string) => void;
}

export const OutgoingRecipientCombobox: React.FC<OutgoingRecipientComboboxProps> = ({
  selectedDepts,
  onChangeDepts,
  selectedUserIds,
  onChangeUserIds,
  externalRecipients,
  onChangeExternal,
  onFullTextGenerated
}) => {
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'DEPTS' | 'INDIVIDUALS' | 'EXTERNAL'>('DEPTS');
  const [deptSearch, setDeptSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  useEffect(() => {
    const loadedDepts = StorageService.getDepartments();
    const loadedUsers = StorageService.getUsers();
    setDepartments(loadedDepts);
    setUsers(loadedUsers);
  }, []);

  // Leadership group (Giám đốc, Phó Giám đốc)
  const leadershipUsers = useMemo(() => {
    return users.filter(u => 
      u.role === 'LANH_DAO' || 
      u.roleTitle.toLowerCase().includes('giám đốc') || 
      u.roleTitle.toLowerCase().includes('tổng giám đốc') ||
      u.department.toLowerCase().includes('tổng giám đốc')
    );
  }, [users]);

  // Department heads (Trưởng phòng, Trưởng ban)
  const headUsers = useMemo(() => {
    return users.filter(u => 
      u.role === 'TRUONG_PHONG' && 
      !leadershipUsers.some(l => l.id === u.id)
    );
  }, [users, leadershipUsers]);

  // Other staff (Chuyên viên, Quản trị...)
  const otherUsers = useMemo(() => {
    return users.filter(u => 
      !leadershipUsers.some(l => l.id === u.id) &&
      !headUsers.some(h => h.id === u.id)
    );
  }, [users, leadershipUsers, headUsers]);

  // Selected user objects
  const selectedUserObjects = useMemo(() => {
    return users.filter(u => selectedUserIds.includes(u.id));
  }, [users, selectedUserIds]);

  // Generate combined standard text for administrative recipient section
  useEffect(() => {
    const parts: string[] = [];

    // 1. Leadership
    const selectedLeaders = selectedUserObjects.filter(u => 
      u.role === 'LANH_DAO' || 
      u.roleTitle.toLowerCase().includes('giám đốc')
    );
    if (selectedLeaders.length > 0) {
      parts.push(`Ban Tổng Giám đốc (${selectedLeaders.map(u => u.name).join(', ')})`);
    }

    // Other individuals
    const otherSelectedUsers = selectedUserObjects.filter(u => 
      !selectedLeaders.some(l => l.id === u.id)
    );
    if (otherSelectedUsers.length > 0) {
      parts.push(otherSelectedUsers.map(u => `${u.name} (${u.roleTitle.split('-')[0].trim()})`).join(', '));
    }

    // 2. Functional departments
    if (selectedDepts.length > 0) {
      parts.push(...selectedDepts);
    }

    // 3. External
    if (externalRecipients.trim()) {
      parts.push(externalRecipients.trim());
    }

    // 4. Archive fallback if not present
    const combined = parts.join('; ');
    if (onFullTextGenerated) {
      onFullTextGenerated(combined);
    }
  }, [selectedDepts, selectedUserObjects, externalRecipients, onFullTextGenerated]);

  // Toggle department selection
  const handleToggleDept = (deptName: string) => {
    if (selectedDepts.includes(deptName)) {
      onChangeDepts(selectedDepts.filter(d => d !== deptName));
    } else {
      onChangeDepts([...selectedDepts, deptName]);
    }
  };

  // Toggle user selection
  const handleToggleUser = (user: UserProfile) => {
    if (selectedUserIds.includes(user.id)) {
      const newIds = selectedUserIds.filter(id => id !== user.id);
      const newNames = users.filter(u => newIds.includes(u.id)).map(u => `${u.name} (${u.roleTitle})`);
      onChangeUserIds(newIds, newNames);
    } else {
      const newIds = [...selectedUserIds, user.id];
      const newNames = users.filter(u => newIds.includes(u.id)).map(u => `${u.name} (${u.roleTitle})`);
      onChangeUserIds(newIds, newNames);
    }
  };

  // Quick actions
  const handleSelectAllDepts = () => {
    onChangeDepts(departments.map(d => d.name));
  };

  const handleClearDepts = () => {
    onChangeDepts([]);
  };

  const handleSelectAllLeaders = () => {
    const leaderIds = leadershipUsers.map(u => u.id);
    const combinedIds = Array.from(new Set([...selectedUserIds, ...leaderIds]));
    const combinedNames = users.filter(u => combinedIds.includes(u.id)).map(u => `${u.name} (${u.roleTitle})`);
    onChangeUserIds(combinedIds, combinedNames);
  };

  const handleClearUsers = () => {
    onChangeUserIds([], []);
  };

  // Filtered lists
  const filteredDepts = departments.filter(d => 
    d.name.toLowerCase().includes(deptSearch.toLowerCase()) || 
    d.code.toLowerCase().includes(deptSearch.toLowerCase())
  );

  const filterUserPredicate = (u: UserProfile) => 
    u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.roleTitle.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.department.toLowerCase().includes(userSearch.toLowerCase());

  return (
    <div className="space-y-3 bg-slate-50/70 border border-blue-200/80 rounded-2xl p-4">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-blue-200/60">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-900 block">
              7. Thiết lập Nơi nhận & Phân quyền xem văn bản đi: <span className="text-rose-600">*</span>
            </label>
            <span className="text-[11px] text-gray-500 font-medium">
              Văn thư chọn đơn vị nội bộ và cá nhân nhận văn bản. Chỉ những đối tượng được chọn mới được xem tài liệu.
            </span>
          </div>
        </div>

        {/* Security badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-800 shrink-0">
          <Lock className="w-3 h-3 text-emerald-600" />
          <span>Kiểm soát quyền xem theo nơi nhận</span>
        </div>
      </div>

      {/* Tabs Switcher: Phòng ban nội bộ vs Cá nhân lãnh đạo vs Đơn vị ngoài */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveSubTab('DEPTS')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeSubTab === 'DEPTS'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-gray-200 hover:bg-gray-100'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Đơn vị nội bộ (Phòng ban chức năng)</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
            activeSubTab === 'DEPTS' ? 'bg-blue-800 text-white' : 'bg-blue-100 text-blue-800'
          }`}>
            {selectedDepts.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('INDIVIDUALS')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeSubTab === 'INDIVIDUALS'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-gray-200 hover:bg-gray-100'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Cá nhân (Giám đốc, Phó GĐ, Lãnh đạo)</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
            activeSubTab === 'INDIVIDUALS' ? 'bg-blue-800 text-white' : 'bg-blue-100 text-blue-800'
          }`}>
            {selectedUserIds.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('EXTERNAL')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeSubTab === 'EXTERNAL'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-gray-200 hover:bg-gray-100'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Đơn vị bên ngoài & Ghi chú lưu</span>
        </button>
      </div>

      {/* SUBTAB 1: PHÒNG BAN CHỨC NĂNG */}
      {activeSubTab === 'DEPTS' && (
        <div className="bg-white border border-gray-200 rounded-xl p-3.5 space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm phòng ban chức năng (Ban Kỹ thuật, Ban Tài chính, Văn phòng...)"
                value={deptSearch}
                onChange={(e) => setDeptSearch(e.target.value)}
                className="w-full bg-slate-50 border border-gray-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-gray-400 focus:outline-none focus:border-blue-600"
              />
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleSelectAllDepts}
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 cursor-pointer"
              >
                + Chọn tất cả ({departments.length})
              </button>
              {selectedDepts.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearDepts}
                  className="px-2 py-1 rounded-lg text-[11px] font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 cursor-pointer"
                >
                  Bỏ chọn
                </button>
              )}
            </div>
          </div>

          {/* Grid of Departments */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
            {filteredDepts.map((dept) => {
              const isSelected = selectedDepts.includes(dept.name);
              return (
                <div
                  key={dept.id}
                  onClick={() => handleToggleDept(dept.name)}
                  className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/80 border-blue-300 text-blue-950 font-medium'
                      : 'bg-white border-gray-200 hover:bg-gray-50 text-slate-700'
                  }`}
                >
                  <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center border transition shrink-0 ${
                    isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 bg-white'
                  }`}>
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <div className="min-w-0 text-xs">
                    <div className="font-semibold truncate">{dept.name}</div>
                    <div className="text-[10px] text-gray-500 flex items-center gap-2 mt-0.5">
                      <span className="font-mono font-bold text-blue-700">[{dept.code}]</span>
                      {dept.headName && <span>Trưởng ban: {dept.headName}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBTAB 2: CÁ NHÂN (GIÁM ĐỐC, PHÓ GIÁM ĐỐC, TRƯỞNG PHÒNG, CÁN BỘ) */}
      {activeSubTab === 'INDIVIDUALS' && (
        <div className="bg-white border border-gray-200 rounded-xl p-3.5 space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm theo tên cá nhân, chức vụ (Giám đốc, Phó Giám đốc, Trưởng phòng...)"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full bg-slate-50 border border-gray-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-gray-400 focus:outline-none focus:border-blue-600"
              />
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleSelectAllLeaders}
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 cursor-pointer flex items-center gap-1"
              >
                <Award className="w-3 h-3 text-rose-600" />
                <span>+ Chọn Ban Giám Đốc ({leadershipUsers.length})</span>
              </button>
              {selectedUserIds.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearUsers}
                  className="px-2 py-1 rounded-lg text-[11px] font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 cursor-pointer"
                >
                  Bỏ chọn
                </button>
              )}
            </div>
          </div>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {/* Group 1: BAN GIÁM ĐỐC / LÃNH ĐẠO */}
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-rose-800 uppercase tracking-wider mb-1.5 bg-rose-50/70 px-2 py-1 rounded-lg border border-rose-100">
                <Award className="w-3.5 h-3.5 text-rose-600" />
                <span>Ban Giám Đốc & Lãnh Đạo Cơ Quan:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {leadershipUsers.filter(filterUserPredicate).map((user) => {
                  const isSelected = selectedUserIds.includes(user.id);
                  return (
                    <div
                      key={user.id}
                      onClick={() => handleToggleUser(user)}
                      className={`flex items-center gap-2.5 p-2 rounded-xl border transition cursor-pointer ${
                        isSelected
                          ? 'bg-rose-50/70 border-rose-300 text-rose-950 font-medium'
                          : 'bg-white border-gray-200 hover:bg-gray-50 text-slate-700'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded flex items-center justify-center border transition shrink-0 ${
                        isSelected ? 'bg-rose-600 border-rose-600 text-white' : 'border-gray-300 bg-white'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-7 h-7 rounded-full object-cover border border-gray-200 shrink-0"
                      />
                      <div className="min-w-0 text-xs">
                        <div className="font-bold text-slate-900 truncate">{user.name}</div>
                        <div className="text-[10px] text-rose-700 font-semibold truncate">{user.roleTitle}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Group 2: TRƯỞNG PHÒNG & QUẢN TRỊ */}
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-800 uppercase tracking-wider mb-1.5 bg-amber-50/70 px-2 py-1 rounded-lg border border-amber-100">
                <Shield className="w-3.5 h-3.5 text-amber-600" />
                <span>Trưởng Phòng / Lãnh Đạo Đơn Vị:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {headUsers.filter(filterUserPredicate).map((user) => {
                  const isSelected = selectedUserIds.includes(user.id);
                  return (
                    <div
                      key={user.id}
                      onClick={() => handleToggleUser(user)}
                      className={`flex items-center gap-2.5 p-2 rounded-xl border transition cursor-pointer ${
                        isSelected
                          ? 'bg-amber-50/70 border-amber-300 text-amber-950 font-medium'
                          : 'bg-white border-gray-200 hover:bg-gray-50 text-slate-700'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded flex items-center justify-center border transition shrink-0 ${
                        isSelected ? 'bg-amber-600 border-amber-600 text-white' : 'border-gray-300 bg-white'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-7 h-7 rounded-full object-cover border border-gray-200 shrink-0"
                      />
                      <div className="min-w-0 text-xs">
                        <div className="font-bold text-slate-900 truncate">{user.name}</div>
                        <div className="text-[10px] text-gray-500 font-medium truncate">{user.roleTitle}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Group 3: CHUYÊN VIÊN & CÁN BỘ KHÁC */}
            {otherUsers.filter(filterUserPredicate).length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 bg-gray-100 px-2 py-1 rounded-lg border border-gray-200">
                  <UserCheck className="w-3.5 h-3.5 text-slate-600" />
                  <span>Chuyên viên & Cán bộ khác:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {otherUsers.filter(filterUserPredicate).map((user) => {
                    const isSelected = selectedUserIds.includes(user.id);
                    return (
                      <div
                        key={user.id}
                        onClick={() => handleToggleUser(user)}
                        className={`flex items-center gap-2.5 p-2 rounded-xl border transition cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50/70 border-blue-300 text-blue-950 font-medium'
                            : 'bg-white border-gray-200 hover:bg-gray-50 text-slate-700'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded flex items-center justify-center border transition shrink-0 ${
                          isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 bg-white'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-7 h-7 rounded-full object-cover border border-gray-200 shrink-0"
                        />
                        <div className="min-w-0 text-xs">
                          <div className="font-bold text-slate-900 truncate">{user.name}</div>
                          <div className="text-[10px] text-gray-500 font-medium truncate">{user.roleTitle}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 3: ĐƠN VỊ NGOÀI / GHI CHÚ */}
      {activeSubTab === 'EXTERNAL' && (
        <div className="bg-white border border-gray-200 rounded-xl p-3.5 space-y-2">
          <label className="block text-xs font-bold text-slate-800">
            Cơ quan / Đơn vị bên ngoài (nếu có) & Ghi chú nơi nhận:
          </label>
          <input
            type="text"
            placeholder="Ví dụ: Bộ Giao thông Vận tải; Cục Đường sắt Việt Nam; Các Chi nhánh Vận tải ĐS; Lưu VT-HSTL"
            value={externalRecipients}
            onChange={(e) => onChangeExternal(e.target.value)}
            className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-600"
          />
          <div className="flex flex-wrap gap-1.5 pt-1">
            <span className="text-[11px] text-gray-500 font-medium">Gợi ý nhanh:</span>
            {[
              'Bộ GTVT',
              'Cục Đường sắt VN',
              'Lưu: VT, HSTL',
              'Các Chi nhánh Khai thác ĐS',
              'Công ty CP Quản lý ĐS'
            ].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  const current = externalRecipients ? externalRecipients.trim() : '';
                  if (!current.includes(s)) {
                    onChangeExternal(current ? `${current}; ${s}` : s);
                  }
                }}
                className="text-[10px] bg-gray-100 hover:bg-gray-200 text-slate-700 px-2 py-0.5 rounded-md font-medium cursor-pointer"
              >
                + {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selected Items Badges Display */}
      <div className="bg-white border border-blue-200 rounded-xl p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-blue-600" />
            <span>Đối tượng nội bộ đã chọn nhận văn bản ({selectedDepts.length} phòng ban, {selectedUserIds.length} cá nhân):</span>
          </span>
          {(selectedDepts.length > 0 || selectedUserIds.length > 0) && (
            <button
              type="button"
              onClick={() => {
                handleClearDepts();
                handleClearUsers();
              }}
              className="text-[10px] font-bold text-rose-600 hover:underline cursor-pointer"
            >
              Xóa tất cả đã chọn
            </button>
          )}
        </div>

        {selectedDepts.length === 0 && selectedUserIds.length === 0 ? (
          <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Chưa chọn đơn vị hoặc cá nhân nội bộ nào. Vui lòng tick chọn phòng ban hoặc cá nhân (Giám đốc, Phó GĐ...) ở trên để phân quyền xem văn bản.</span>
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
            {/* Department tags */}
            {selectedDepts.map((d) => (
              <span
                key={d}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-xs font-semibold shadow-2xs"
              >
                <Building2 className="w-3 h-3 text-blue-600 shrink-0" />
                <span className="truncate max-w-[200px]">{d}</span>
                <button
                  type="button"
                  onClick={() => handleToggleDept(d)}
                  className="hover:text-rose-600 p-0.5 rounded cursor-pointer"
                  title="Bỏ chọn phòng ban này"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {/* Individual user tags */}
            {selectedUserObjects.map((u) => {
              const isLeader = u.role === 'LANH_DAO' || u.roleTitle.toLowerCase().includes('giám đốc');
              return (
                <span
                  key={u.id}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold shadow-2xs ${
                    isLeader
                      ? 'bg-rose-50 border-rose-200 text-rose-900'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  }`}
                >
                  {isLeader ? (
                    <Award className="w-3 h-3 text-rose-600 shrink-0" />
                  ) : (
                    <User className="w-3 h-3 text-emerald-600 shrink-0" />
                  )}
                  <span>{u.name} ({u.roleTitle.split('-')[0].trim()})</span>
                  <button
                    type="button"
                    onClick={() => handleToggleUser(u)}
                    className="hover:text-rose-600 p-0.5 rounded cursor-pointer"
                    title="Bỏ chọn cá nhân này"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            })}
          </div>
        )}

        {/* Security Rule Notice */}
        <div className="pt-2 border-t border-gray-100 flex items-start gap-2 text-[11px] text-gray-600">
          <Lock className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
          <div className="leading-relaxed">
            <span className="font-bold text-slate-800">Quy tắc bảo mật:</span> Khi văn bản phát hành, hệ thống sẽ tự động đối soát thông tin tài khoản người dùng đăng nhập. 
            <span className="text-blue-800 font-semibold"> Chỉ các cá nhân được chỉ định đích danh (ví dụ Giám đốc, Phó Giám đốc) hoặc cán bộ trực thuộc các phòng ban được chọn ở trên</span>, cùng bộ phận Văn thư và Quản trị viên mới được phép mở xem nội dung và tệp đính kèm.
          </div>
        </div>
      </div>
    </div>
  );
};
