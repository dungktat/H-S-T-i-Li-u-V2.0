import React, { useState, useEffect } from 'react';
import { 
  BrandConfig, 
  UserProfile, 
  DepartmentItem, 
  UnitItem, 
  IssuingAgencyItem, 
  UserRole 
} from '../../../types';
import { StorageService } from '../../../services/storageService';
import { 
  Palette, 
  Image as ImageIcon, 
  Building, 
  Building2,
  Users, 
  Shield, 
  RotateCcw, 
  Check, 
  Sparkles, 
  Plus, 
  Pencil, 
  Trash2, 
  Search, 
  FileText, 
  Lock, 
  Unlock, 
  UserCheck, 
  LogOut, 
  CheckCircle2, 
  AlertCircle,
  FolderPlus,
  Landmark,
  Layers,
  Phone,
  Mail,
  ShieldCheck,
  ChevronRight,
  Sliders,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MetadataSchemaAdminTab } from './MetadataSchemaAdminTab';
import { THEME_PRESETS } from '../../../utils/themeUtils';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  branding: BrandConfig;
  onUpdateBranding: (branding: BrandConfig) => void;
  currentUser: UserProfile;
  onSwitchUser?: (user: UserProfile) => void;
}

type TabType = 'DEPARTMENTS' | 'UNITS' | 'ISSUING_AGENCIES' | 'USERS' | 'BRANDING' | 'METADATA_SCHEMAS';

export const SettingsPersonalizationModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  branding,
  onUpdateBranding,
  currentUser,
  onSwitchUser
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('DEPARTMENTS');
  const [localBranding, setLocalBranding] = useState<BrandConfig>(branding);

  // Master Data States
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [units, setUnits] = useState<UnitItem[]>([]);
  const [agencies, setAgencies] = useState<IssuingAgencyItem[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');

  // Editing Modals / Inline Forms State
  const [editingDept, setEditingDept] = useState<Partial<DepartmentItem> | null>(null);
  const [editingUnit, setEditingUnit] = useState<Partial<UnitItem> | null>(null);
  const [editingAgency, setEditingAgency] = useState<Partial<IssuingAgencyItem> | null>(null);
  const [editingUser, setEditingUser] = useState<Partial<UserProfile> | null>(null);

  const isAdmin = currentUser.role === 'ADMIN';

  // Load all master data
  const loadMasterData = () => {
    setDepartments(StorageService.getDepartments());
    setUnits(StorageService.getUnits());
    setAgencies(StorageService.getIssuingAgencies());
    setUsers(StorageService.getUsers());
  };

  useEffect(() => {
    if (isOpen) {
      loadMasterData();
      setLocalBranding(branding);
    }
  }, [isOpen, branding]);

  useEffect(() => {
    const handleStateChange = (e: any) => {
      loadMasterData();
    };
    window.addEventListener('hstl_state_change', handleStateChange);
    return () => window.removeEventListener('hstl_state_change', handleStateChange);
  }, []);

  if (!isOpen) return null;

  // Wallpapers
  const wallpapers = [
    {
      id: 'bloom_light',
      name: 'Windows 12 Azure Flow (Chủ đạo)',
      url: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?auto=format&fit=crop&w=2000&q=85'
    },
    {
      id: 'crystal_blue',
      name: 'Windows 12 Crystal Blue Sky',
      url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=2000&q=85'
    },
    {
      id: 'railway_modern',
      name: 'Đường Sắt Hiện Đại Xanh Dương',
      url: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=2000&q=85'
    },
    {
      id: 'misty_cyan',
      name: 'Acrylic Cyan Luminous',
      url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=85'
    },
    {
      id: 'minimal_azure',
      name: 'Bình Minh Đại Dương Xanh',
      url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2000&q=85'
    }
  ];

  const accentColors = [
    { name: 'Windows Cobalt Blue', value: '#0078D4' },
    { name: 'Royal Navy Blue', value: '#1e40af' },
    { name: 'Electric Azure', value: '#0284c7' },
    { name: 'Cyan Sky', value: '#06b6d4' },
    { name: 'Emerald Jade', value: '#10b981' },
    { name: 'Royal Indigo', value: '#6366f1' },
    { name: 'Solar Amber', value: '#f59e0b' }
  ];

  // Switch to Admin Helper
  const handleSwitchToAdmin = () => {
    const adminUser = users.find(u => u.role === 'ADMIN') || {
      id: 'user_admin_1',
      name: 'Phan Minh Tuấn',
      role: 'ADMIN' as const,
      roleTitle: 'Quản trị viên Hệ thống HSTL',
      department: 'Trung tâm Công nghệ Thông tin',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      email: 'admin.hstl@vnr.gov.vn'
    };
    StorageService.setCurrentUser(adminUser);
    if (onSwitchUser) onSwitchUser(adminUser);
    confetti({ particleCount: 35, spread: 60, origin: { y: 0.6 } });
  };

  // -------------------------------------------------------------
  // DEPARTMENT HANDLERS
  // -------------------------------------------------------------
  const handleSaveDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDept || !editingDept.name?.trim() || !editingDept.code?.trim()) {
      alert('Vui lòng nhập đầy đủ Mã và Tên phòng ban!');
      return;
    }

    if (editingDept.id) {
      StorageService.updateDepartment(editingDept.id, {
        code: editingDept.code.trim().toUpperCase(),
        name: editingDept.name.trim(),
        headName: editingDept.headName?.trim() || '',
        description: editingDept.description?.trim() || '',
        isActive: editingDept.isActive !== false
      });
    } else {
      const newDept: DepartmentItem = {
        id: 'dept-' + Date.now(),
        code: editingDept.code.trim().toUpperCase(),
        name: editingDept.name.trim(),
        headName: editingDept.headName?.trim() || '',
        description: editingDept.description?.trim() || '',
        isActive: true
      };
      StorageService.addDepartment(newDept);
    }
    setEditingDept(null);
    loadMasterData();
  };

  const handleDeleteDepartment = (id: string, name: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa phòng ban "${name}" khỏi hệ thống?`)) {
      StorageService.deleteDepartment(id);
      loadMasterData();
    }
  };

  // -------------------------------------------------------------
  // UNIT HANDLERS
  // -------------------------------------------------------------
  const handleSaveUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUnit || !editingUnit.name?.trim() || !editingUnit.code?.trim()) {
      alert('Vui lòng nhập đầy đủ Mã và Tên đơn vị!');
      return;
    }

    if (editingUnit.id) {
      StorageService.updateUnit(editingUnit.id, {
        code: editingUnit.code.trim().toUpperCase(),
        name: editingUnit.name.trim(),
        type: editingUnit.type || 'TRUC_THUOC',
        address: editingUnit.address?.trim() || '',
        isActive: editingUnit.isActive !== false
      });
    } else {
      const newUnit: UnitItem = {
        id: 'unit-' + Date.now(),
        code: editingUnit.code.trim().toUpperCase(),
        name: editingUnit.name.trim(),
        type: editingUnit.type || 'TRUC_THUOC',
        address: editingUnit.address?.trim() || '',
        isActive: true
      };
      StorageService.addUnit(newUnit);
    }
    setEditingUnit(null);
    loadMasterData();
  };

  const handleDeleteUnit = (id: string, name: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa đơn vị "${name}" khỏi hệ thống?`)) {
      StorageService.deleteUnit(id);
      loadMasterData();
    }
  };

  // -------------------------------------------------------------
  // ISSUING AGENCY HANDLERS
  // -------------------------------------------------------------
  const handleSaveAgency = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAgency || !editingAgency.name?.trim() || !editingAgency.code?.trim()) {
      alert('Vui lòng nhập đầy đủ Mã và Tên cơ quan/đơn vị ban hành!');
      return;
    }

    if (editingAgency.id) {
      StorageService.updateIssuingAgency(editingAgency.id, {
        code: editingAgency.code.trim().toUpperCase(),
        name: editingAgency.name.trim(),
        shortName: editingAgency.shortName?.trim() || editingAgency.name.trim(),
        isActive: editingAgency.isActive !== false
      });
    } else {
      const newAgency: IssuingAgencyItem = {
        id: 'agency-' + Date.now(),
        code: editingAgency.code.trim().toUpperCase(),
        name: editingAgency.name.trim(),
        shortName: editingAgency.shortName?.trim() || editingAgency.name.trim(),
        isActive: true
      };
      StorageService.addIssuingAgency(newAgency);
    }
    setEditingAgency(null);
    loadMasterData();
  };

  const handleDeleteAgency = (id: string, name: string) => {
    if (confirm(`Bạn có chắc muốn xóa đơn vị ban hành "${name}"? Thao tác này sẽ xóa khỏi danh mục Combobox lập hồ sơ.`)) {
      StorageService.deleteIssuingAgency(id);
      loadMasterData();
    }
  };

  // -------------------------------------------------------------
  // USER HANDLERS
  // -------------------------------------------------------------
  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !editingUser.name?.trim() || !editingUser.email?.trim()) {
      alert('Vui lòng nhập đầy đủ Họ tên và Email tài khoản!');
      return;
    }

    const defaultRoleTitle = {
      ADMIN: 'Quản trị viên Hệ thống HSTL',
      TRUONG_PHONG: 'Trưởng phòng Quản lý & Thẩm định',
      CHUYEN_VIEN: 'Chuyên viên Nghiệp vụ & Dự án',
      VAN_THU: 'Cán bộ Văn thư - Lưu trữ'
    };

    const role = editingUser.role || 'CHUYEN_VIEN';
    const roleTitle = editingUser.roleTitle?.trim() || defaultRoleTitle[role];
    const dept = editingUser.department || departments[0]?.name || 'Ban Kỹ thuật - Hạ tầng Cơ sở';
    const avatar = editingUser.avatar?.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80';

    if (editingUser.id) {
      StorageService.updateUser(editingUser.id, {
        name: editingUser.name.trim(),
        email: editingUser.email.trim(),
        phone: editingUser.phone?.trim(),
        role,
        roleTitle,
        department: dept,
        avatar,
        isActive: editingUser.isActive !== false
      });
    } else {
      const newUser: UserProfile = {
        id: 'user_' + Date.now(),
        name: editingUser.name.trim(),
        email: editingUser.email.trim(),
        phone: editingUser.phone?.trim() || '0903.000.888',
        role,
        roleTitle,
        department: dept,
        avatar,
        isActive: true
      };
      StorageService.addUser(newUser);
    }
    setEditingUser(null);
    loadMasterData();
  };

  const handleDeleteUser = (id: string, name: string) => {
    if (id === currentUser.id) {
      alert('Không thể xóa tài khoản đang đăng nhập!');
      return;
    }
    if (confirm(`Bạn có chắc muốn xóa tài khoản của cán bộ "${name}"?`)) {
      StorageService.deleteUser(id);
      loadMasterData();
    }
  };

  // Save Branding
  const handleSaveBranding = () => {
    StorageService.saveBrandConfig(localBranding);
    onUpdateBranding(localBranding);
    onClose();
  };

  // Reset all
  const handleReset = () => {
    if (confirm('Khôi phục toàn bộ cấu hình phòng ban, đơn vị, đơn vị ban hành và tài khoản về mẫu ban đầu?')) {
      StorageService.resetToDefault();
      loadMasterData();
      const defaultBrand = StorageService.getBrandConfig();
      setLocalBranding(defaultBrand);
      onUpdateBranding(defaultBrand);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/65 backdrop-blur-md animate-fadeIn text-slate-800">
      <div className="bg-white border border-gray-200 rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col h-[92vh] max-h-[850px]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-200 bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 text-white shadow-inner">
              <ShieldCheck className="w-6 h-6 text-blue-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold tracking-wide">
                  Trung Tâm Quản Trị Hệ Thống &amp; Cài Đặt HSTL
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/40 text-blue-100 border border-blue-300/30">
                  Admin Control Panel
                </span>
              </div>
              <p className="text-xs text-blue-100/90 font-medium mt-0.5">
                Thiết lập danh mục Phòng ban, Đơn vị, Đơn vị ban hành (Combobox), Quản lý Tài khoản &amp; Nhận diện
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-white/80 hover:text-white p-1.5 hover:bg-white/10 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Admin Permission Status Bar */}
        <div className={`px-5 py-2.5 flex items-center justify-between text-xs border-b ${
          isAdmin ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'
        }`}>
          <div className="flex items-center gap-2">
            {isAdmin ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-bold">Quyền Quản trị viên (ADMIN) Đang Kích Hoạt:</span>
                <span className="text-emerald-800">
                  {currentUser.name} ({currentUser.roleTitle}) — Bạn có toàn quyền cấu hình, thêm/sửa/xóa tất cả danh mục.
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="font-bold">Chế độ xem cấu hình:</span>
                <span className="text-amber-800">
                  Bạn đang đăng nhập vai trò <strong>{currentUser.roleTitle}</strong> ({currentUser.name}). Cần quyền ADMIN để thêm/sửa/xóa.
                </span>
              </>
            )}
          </div>

          {!isAdmin && (
            <button
              onClick={handleSwitchToAdmin}
              className="px-3 py-1 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold text-[11px] shadow-xs flex items-center gap-1.5 transition cursor-pointer shrink-0"
            >
              <Shield className="w-3.5 h-3.5" />
              Đăng nhập tài khoản Quản trị viên (ADMIN)
            </button>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="px-5 border-b border-gray-200 bg-gray-50 flex gap-2 overflow-x-auto text-xs font-bold scrollbar-none">
          <button
            onClick={() => { setActiveTab('DEPARTMENTS'); setSearchTerm(''); }}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'DEPARTMENTS'
                ? 'border-blue-700 text-blue-700 font-extrabold bg-white shadow-xs rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-blue-700'
            }`}
          >
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>1. Phòng Ban ({departments.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('UNITS'); setSearchTerm(''); }}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'UNITS'
                ? 'border-blue-700 text-blue-700 font-extrabold bg-white shadow-xs rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-blue-700'
            }`}
          >
            <Landmark className="w-4 h-4 text-indigo-600" />
            <span>2. Đơn Vị Trực Thuộc ({units.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('ISSUING_AGENCIES'); setSearchTerm(''); }}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'ISSUING_AGENCIES'
                ? 'border-blue-700 text-blue-700 font-extrabold bg-white shadow-xs rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-blue-700'
            }`}
          >
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>3. Đơn Vị Ban Hành (Combobox) ({agencies.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('USERS'); setSearchTerm(''); }}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'USERS'
                ? 'border-blue-700 text-blue-700 font-extrabold bg-white shadow-xs rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-blue-700'
            }`}
          >
            <Users className="w-4 h-4 text-purple-600" />
            <span>4. Quản Lý Tài Khoản ({users.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('BRANDING'); setSearchTerm(''); }}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'BRANDING'
                ? 'border-blue-700 text-blue-700 font-extrabold bg-white shadow-xs rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-blue-700'
            }`}
          >
            <Palette className="w-4 h-4 text-amber-600" />
            <span>5. Nhận Diện &amp; Giao Diện</span>
          </button>

          <button
            onClick={() => { setActiveTab('METADATA_SCHEMAS'); setSearchTerm(''); }}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'METADATA_SCHEMAS'
                ? 'border-blue-700 text-blue-700 font-extrabold bg-white shadow-xs rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-blue-700'
            }`}
          >
            <Sliders className="w-4 h-4 text-emerald-600" />
            <span>6. Metadata Tài Liệu (Admin)</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-5 bg-[#f4f7fb] space-y-4">
          {/* ========================================================= */}
          {/* TAB 1: PHÒNG BAN (DEPARTMENTS)                            */}
          {/* ========================================================= */}
          {activeTab === 'DEPARTMENTS' && (
            <div className="space-y-4">
              {/* Header Actions */}
              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 w-full sm:w-80 relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3" />
                  <input
                    type="text"
                    placeholder="Tìm theo tên hoặc mã phòng ban..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  {isAdmin ? (
                    <button
                      onClick={() => setEditingDept({ code: '', name: '', headName: '', description: '', isActive: true })}
                      className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Thêm Phòng Ban Mới
                    </button>
                  ) : (
                    <button
                      onClick={handleSwitchToAdmin}
                      className="px-3 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5 text-amber-700" />
                      Chuyển sang ADMIN để thêm phòng ban
                    </button>
                  )}
                </div>
              </div>

              {/* Department List Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {departments
                  .filter(d => 
                    d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    d.code.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((dept) => (
                    <div 
                      key={dept.id} 
                      className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs hover:border-blue-300 transition space-y-3 relative group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 flex items-center justify-center font-black text-sm shrink-0">
                            {dept.code}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm leading-snug">{dept.name}</h4>
                            <div className="text-[11px] text-gray-500 font-medium mt-0.5">
                              Trưởng phòng: <strong className="text-slate-700">{dept.headName || 'Chưa phân công'}</strong>
                            </div>
                          </div>
                        </div>

                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          dept.isActive !== false ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {dept.isActive !== false ? 'Hoạt động' : 'Tạm khóa'}
                        </span>
                      </div>

                      {dept.description && (
                        <p className="text-xs text-slate-600 bg-gray-50/80 p-2 rounded-xl border border-gray-100 line-clamp-2">
                          {dept.description}
                        </p>
                      )}

                      {/* Admin Actions */}
                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                        <span className="text-[11px] text-gray-400">
                          Nhân sự: {users.filter(u => u.department === dept.name).length} thành viên
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setEditingDept(dept)}
                            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                            title="Chỉnh sửa thông tin phòng ban"
                          >
                            <Pencil className="w-3.5 h-3.5" /> Sửa
                          </button>
                          <button
                            onClick={() => handleDeleteDepartment(dept.id, dept.name)}
                            className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 hover:border-red-600 font-bold text-[11px] flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                            title="Xóa phòng ban khỏi hệ thống"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Xóa
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: ĐƠN VỊ TRỰC THUỘC (UNITS)                          */}
          {/* ========================================================= */}
          {activeTab === 'UNITS' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 w-full sm:w-80 relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3" />
                  <input
                    type="text"
                    placeholder="Tìm theo tên hoặc mã đơn vị..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  {isAdmin ? (
                    <button
                      onClick={() => setEditingUnit({ code: '', name: '', type: 'TRUC_THUOC', address: '', isActive: true })}
                      className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Thêm Đơn Vị Mới
                    </button>
                  ) : (
                    <button
                      onClick={handleSwitchToAdmin}
                      className="px-3 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5 text-amber-700" />
                      Chuyển sang ADMIN để thêm đơn vị
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {units
                  .filter(u => 
                    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    u.code.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((unit) => (
                    <div 
                      key={unit.id} 
                      className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs hover:border-blue-300 transition space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-black text-xs shrink-0">
                            {unit.code}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm leading-snug">{unit.name}</h4>
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200 font-bold inline-block mt-1">
                              {unit.type === 'TRUC_THUOC' ? 'Đơn vị trực thuộc VNR' : unit.type === 'DOI_TAC' ? 'Đối tác kinh doanh' : 'Cơ quan Ngoài / Bộ ngành'}
                            </span>
                          </div>
                        </div>

                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          unit.isActive !== false ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {unit.isActive !== false ? 'Hoạt động' : 'Khóa'}
                        </span>
                      </div>

                      {unit.address && (
                        <p className="text-xs text-slate-600 bg-gray-50/80 p-2 rounded-xl border border-gray-100">
                          Địa chỉ: {unit.address}
                        </p>
                      )}

                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-[11px] text-gray-400">
                          Mã hệ thống: <span className="font-mono text-slate-700 font-semibold">{unit.code}</span>
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setEditingUnit(unit)}
                            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                            title="Chỉnh sửa thông tin đơn vị"
                          >
                            <Pencil className="w-3.5 h-3.5" /> Sửa
                          </button>
                          <button
                            onClick={() => handleDeleteUnit(unit.id, unit.name)}
                            className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 hover:border-red-600 font-bold text-[11px] flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                            title="Xóa đơn vị khỏi hệ thống"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Xóa
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: ĐƠN VỊ BAN HÀNH (ISSUING AGENCIES)                  */}
          {/* ========================================================= */}
          {activeTab === 'ISSUING_AGENCIES' && (
            <div className="space-y-4">
              {/* Alert Guide Banner */}
              <div className="p-4 rounded-2xl bg-blue-50/90 border border-blue-200 text-xs text-blue-900 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-blue-950">
                    Cấu Hình Danh Mục Đơn Vị Ban Hành (Nguồn cấp Combobox)
                  </h4>
                  <p className="text-blue-800 text-xs mt-1">
                    Toàn bộ các đơn vị ban hành được thiết lập tại đây sẽ tự động hiển thị trong <strong>Combobox Đơn vị ban hành</strong> khi cán bộ tạo mới hồ sơ ở Luồng 1, Luồng 2, Luồng 3 và Luồng 4.
                  </p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 w-full sm:w-80 relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3" />
                  <input
                    type="text"
                    placeholder="Tìm theo tên đơn vị ban hành hoặc tên viết tắt..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  {isAdmin ? (
                    <button
                      onClick={() => setEditingAgency({ code: '', name: '', shortName: '', isActive: true })}
                      className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Thêm Đơn Vị Ban Hành
                    </button>
                  ) : (
                    <button
                      onClick={handleSwitchToAdmin}
                      className="px-3 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5 text-amber-700" />
                      Chuyển sang ADMIN để thêm đơn vị ban hành
                    </button>
                  )}
                </div>
              </div>

              {/* Agencies Table / Cards */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
                {/* Desktop Table View */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse min-w-[650px]">
                    <thead>
                      <tr className="bg-gray-50/90 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                        <th className="py-3 px-4">Mã</th>
                        <th className="py-3 px-4">Tên Cơ Quan / Đơn Vị Ban Hành</th>
                        <th className="py-3 px-4">Tên Viết Tắt</th>
                        <th className="py-3 px-4">Trạng Thái</th>
                        <th className="py-3 px-4 text-right">Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {agencies
                        .filter(a => 
                          a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (a.shortName && a.shortName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          a.code.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map((agency) => (
                          <tr key={agency.id} className="hover:bg-blue-50/40 transition">
                            <td className="py-3 px-4 font-mono font-bold text-blue-700">
                              {agency.code}
                            </td>
                            <td className="py-3 px-4 font-bold text-slate-900">
                              {agency.name}
                            </td>
                            <td className="py-3 px-4 text-slate-700 font-medium">
                              <span className="px-2 py-0.5 bg-gray-100 rounded text-slate-700 font-mono text-[11px]">
                                {agency.shortName || agency.name}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                agency.isActive !== false ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-500'
                              }`}>
                                {agency.isActive !== false ? 'Hiển thị trong Combobox' : 'Đã ẩn'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => setEditingAgency(agency)}
                                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                                  title="Chỉnh sửa đơn vị ban hành"
                                >
                                  <Pencil className="w-3.5 h-3.5" /> Sửa
                                </button>
                                <button
                                  onClick={() => handleDeleteAgency(agency.id, agency.name)}
                                  className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 hover:border-red-600 font-bold text-[11px] flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                                  title="Xóa đơn vị ban hành"
                                >
                                  <Trash2 className="w-3.5 h-3.5" /> Xóa
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card List View */}
                <div className="block sm:hidden divide-y divide-gray-100">
                  {agencies
                    .filter(a => 
                      a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      (a.shortName && a.shortName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                      a.code.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((agency) => (
                      <div key={agency.id} className="p-3.5 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-bold text-slate-900 text-xs">{agency.name}</div>
                            <div className="text-[10px] text-gray-500 flex items-center gap-1.5 mt-0.5">
                              <span className="font-mono text-blue-700 font-bold">{agency.code}</span>
                              {agency.shortName && <span>• {agency.shortName}</span>}
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold shrink-0 ${
                            agency.isActive !== false ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {agency.isActive !== false ? 'Hiển thị' : 'Đã ẩn'}
                          </span>
                        </div>

                        <div className="pt-2 border-t border-gray-100 flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingAgency(agency)}
                            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] flex items-center gap-1.5 shadow-xs cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" /> Sửa
                          </button>
                          <button
                            onClick={() => handleDeleteAgency(agency.id, agency.name)}
                            className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 hover:border-red-600 font-bold text-[11px] flex items-center gap-1.5 shadow-xs cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Xóa
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: QUẢN LÝ TÀI KHOẢN & PHÂN QUYỀN (USERS)             */}
          {/* ========================================================= */}
          {activeTab === 'USERS' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 w-full sm:w-80 relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3" />
                  <input
                    type="text"
                    placeholder="Tìm tài khoản theo tên, email, chức danh..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  {isAdmin ? (
                    <button
                      onClick={() => setEditingUser({
                        name: '',
                        email: '',
                        phone: '0903.123.456',
                        role: 'CHUYEN_VIEN',
                        roleTitle: 'Chuyên viên Kỹ thuật & Nghiệp vụ',
                        department: departments[0]?.name || 'Ban Kỹ thuật - Hạ tầng Cơ sở',
                        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
                        isActive: true
                      })}
                      className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Thêm Tài Khoản Mới
                    </button>
                  ) : (
                    <button
                      onClick={handleSwitchToAdmin}
                      className="px-3 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5 text-amber-700" />
                      Chuyển sang ADMIN để thêm tài khoản
                    </button>
                  )}
                </div>
              </div>

              {/* Users Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {users
                  .filter(u => 
                    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    u.roleTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    u.department.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((user) => {
                    const isCurrentUser = user.id === currentUser.id;
                    const roleBadge = {
                      ADMIN: { bg: 'bg-purple-100 text-purple-800 border-purple-200', label: 'Quản trị viên ADMIN' },
                      TRUONG_PHONG: { bg: 'bg-amber-100 text-amber-800 border-amber-200', label: 'Trưởng phòng Thẩm tra' },
                      CHUYEN_VIEN: { bg: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Chuyên viên Nghiệp vụ' },
                      VAN_THU: { bg: 'bg-emerald-100 text-emerald-800 border-emerald-200', label: 'Văn thư - Lưu trữ' }
                    }[user.role] || { bg: 'bg-gray-100 text-gray-800 border-gray-200', label: user.role };

                    return (
                      <div 
                        key={user.id} 
                        className={`bg-white border rounded-2xl p-4 shadow-xs transition space-y-3 relative ${
                          isCurrentUser ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-3">
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md shrink-0"
                            />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h4 className="font-bold text-slate-900 text-sm leading-snug">{user.name}</h4>
                                {isCurrentUser && (
                                  <span className="px-1.5 py-0.2 rounded bg-blue-700 text-white font-bold text-[9px]">
                                    Bạn
                                  </span>
                                )}
                              </div>
                              <div className="text-xs font-semibold text-slate-700 mt-0.5">{user.roleTitle}</div>
                              <div className="text-[11px] text-gray-500 font-medium">{user.department}</div>
                            </div>
                          </div>

                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${roleBadge.bg}`}>
                            {roleBadge.label}
                          </span>
                        </div>

                        <div className="bg-gray-50/80 p-2.5 rounded-xl border border-gray-100 text-[11px] space-y-1 text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                            <span>{user.email}</span>
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-gray-400" />
                              <span>{user.phone}</span>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                          <button
                            onClick={() => {
                              StorageService.setCurrentUser(user);
                              if (onSwitchUser) onSwitchUser(user);
                            }}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                              isCurrentUser 
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-gray-100 hover:bg-blue-50 text-slate-700 hover:text-blue-800'
                            }`}
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            {isCurrentUser ? 'Đang hoạt động' : 'Đăng nhập vai này'}
                          </button>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setEditingUser(user)}
                              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                              title="Chỉnh sửa thông tin tài khoản"
                            >
                              <Pencil className="w-3.5 h-3.5" /> Sửa
                            </button>
                            {!isCurrentUser ? (
                              <button
                                onClick={() => handleDeleteUser(user.id, user.name)}
                                className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 hover:border-red-600 font-bold text-[11px] flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                                title="Xóa tài khoản khỏi hệ thống"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Xóa
                              </button>
                            ) : (
                              <span className="text-[10px] text-gray-400 italic px-1">Đang dùng</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 5: NHẬN DIỆN & GIAO DIỆN (BRANDING)                    */}
          {/* ========================================================= */}
          {activeTab === 'BRANDING' && (
            <div className="space-y-4">
              {/* Org Name & Software Title */}
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-4">
                <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                  <Building className="w-4 h-4 text-blue-600" />
                  1. Thông Tin Nhận Diện Cơ Quan &amp; Phần Mềm
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-gray-600 font-semibold mb-1">Tên Phần Mềm / Ứng dụng:</label>
                    <input
                      type="text"
                      value={localBranding.softwareName}
                      disabled={!isAdmin}
                      onChange={(e) => setLocalBranding({ ...localBranding, softwareName: e.target.value })}
                      className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-600 font-semibold mb-1">Tên Cơ Quan Chủ Quản:</label>
                    <input
                      type="text"
                      value={localBranding.agencyName}
                      disabled={!isAdmin}
                      onChange={(e) => setLocalBranding({ ...localBranding, agencyName: e.target.value })}
                      className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>
              </div>

              {/* Wallpaper Selection */}
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-4">
                <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                  <ImageIcon className="w-4 h-4 text-blue-600" />
                  2. Chọn Hình Nền Windows 12 Desktop (Tone Xanh Sáng)
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {wallpapers.map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => setLocalBranding({ ...localBranding, wallpaperCustomUrl: w.url, wallpaperId: w.id })}
                      className={`group relative rounded-2xl overflow-hidden border-2 text-left transition cursor-pointer ${
                        (localBranding.wallpaperCustomUrl === w.url || localBranding.wallpaperId === w.id)
                          ? 'border-blue-600 ring-2 ring-blue-400/40 scale-102 shadow-md'
                          : 'border-gray-200 hover:border-blue-300 opacity-90 hover:opacity-100'
                      }`}
                    >
                      <img src={w.url} alt={w.name} className="w-full h-24 object-cover group-hover:scale-105 transition duration-300" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex items-end p-2">
                        <span className="text-[11px] font-bold text-white truncate">{w.name}</span>
                      </div>
                      {(localBranding.wallpaperCustomUrl === w.url || localBranding.wallpaperId === w.id) && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                          ✓
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Accent Colors */}
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    3. Gam Màu Điểm Nhấn &amp; Đồng Bộ Toàn Hệ Thống
                  </h3>
                  <div className="flex items-center gap-2 bg-blue-50 text-blue-800 px-2.5 py-1 rounded-full text-[11px] font-semibold">
                    <span 
                      className="w-3 h-3 rounded-full border border-white shadow-xs" 
                      style={{ backgroundColor: localBranding.primaryAccent || '#003882' }}
                    />
                    <span>Đang chọn: <strong>{localBranding.accentName || localBranding.primaryAccent}</strong></span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed bg-blue-50/60 p-2.5 rounded-xl border border-blue-100">
                  ⚡ <strong>Cơ chế đồng bộ tự động:</strong> Khi bạn thay đổi màu sắc ở đây, màu thanh tiêu đề bên trong và <strong>toàn bộ Trang Đăng Nhập (Login Page)</strong> sẽ tự động chuyển màu đồng bộ với phông chữ trắng sắc nét.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                  {THEME_PRESETS.map((preset) => {
                    const isSelected = (localBranding.primaryAccent || '').toLowerCase() === preset.hex.toLowerCase();
                    return (
                      <button
                        key={preset.hex}
                        type="button"
                        onClick={() => setLocalBranding({ 
                          ...localBranding, 
                          primaryAccent: preset.hex, 
                          accentName: preset.name 
                        })}
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50 border-blue-600 text-blue-900 font-bold shadow-xs ring-2 ring-blue-300/40'
                            : 'bg-white border-gray-200 text-slate-700 hover:bg-gray-50'
                        }`}
                      >
                        <span 
                          className="w-5 h-5 rounded-full shadow-xs border border-white/60 shrink-0" 
                          style={{ backgroundColor: preset.hex }} 
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold truncate">{preset.name.split('(')[0]}</div>
                          <div className="text-[10px] text-gray-400 font-mono">{preset.hex}</div>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Color Input */}
                <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center gap-3">
                  <span className="text-xs text-slate-600 font-medium">Hoặc chọn mã màu HEX tùy chỉnh:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={localBranding.primaryAccent || '#003882'}
                      onChange={(e) => setLocalBranding({
                        ...localBranding,
                        primaryAccent: e.target.value,
                        accentName: `Tùy chỉnh (${e.target.value.toUpperCase()})`
                      })}
                      className="w-8 h-8 rounded-lg border border-gray-300 p-0.5 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={localBranding.primaryAccent || ''}
                      onChange={(e) => setLocalBranding({
                        ...localBranding,
                        primaryAccent: e.target.value,
                        accentName: `Tùy chỉnh (${e.target.value.toUpperCase()})`
                      })}
                      placeholder="#003882"
                      className="w-24 p-1.5 rounded-lg border border-gray-300 text-xs font-mono font-bold uppercase focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 6: METADATA TÀI LIỆU (DYNAMIC METADATA SCHEMAS)       */}
          {/* ========================================================= */}
          {activeTab === 'METADATA_SCHEMAS' && (
            <MetadataSchemaAdminTab isAdmin={isAdmin} />
          )}
        </div>

        {/* Footer Bar */}
        <div className="p-4 border-t border-gray-200 bg-white flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-800 font-bold cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Khôi phục dữ liệu gốc
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-gray-100 transition cursor-pointer"
            >
              Đóng
            </button>
            {activeTab === 'BRANDING' && (
              <button
                type="button"
                onClick={handleSaveBranding}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 shadow-sm transition cursor-pointer"
              >
                <Check className="w-4 h-4" />
                Lưu Nhận Diện Giao Diện
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL / FORM: SỬA HOẶC THÊM PHÒNG BAN                     */}
      {/* ========================================================= */}
      {editingDept && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <form onSubmit={handleSaveDepartment} className="bg-white border border-gray-200 rounded-3xl w-full max-w-md shadow-2xl p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-700" />
                {editingDept.id ? 'Chỉnh Sửa Thông Tin Phòng Ban' : 'Thêm Phòng Ban Mới'}
              </h3>
              <button type="button" onClick={() => setEditingDept(null)} className="text-gray-400 hover:text-slate-800 text-sm">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Mã Viết Tắt (Code) <span className="text-red-600">*</span></label>
                <input
                  type="text"
                  placeholder="Ví dụ: KTHT, DTXD, VPTC..."
                  value={editingDept.code || ''}
                  onChange={(e) => setEditingDept({ ...editingDept, code: e.target.value })}
                  className="w-full uppercase font-mono font-bold p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên Phòng Ban <span className="text-red-600">*</span></label>
                <input
                  type="text"
                  placeholder="Ví dụ: Ban Kỹ thuật - Hạ tầng Cơ sở"
                  value={editingDept.name || ''}
                  onChange={(e) => setEditingDept({ ...editingDept, name: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Trưởng Phòng Phụ Trách</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Trần Thị Thu Hương"
                  value={editingDept.headName || ''}
                  onChange={(e) => setEditingDept({ ...editingDept, headName: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mô Tả Chức Năng Nhiệm Vụ</label>
                <textarea
                  rows={2}
                  placeholder="Nhiệm vụ quản lý kỹ thuật, quản lý hồ sơ..."
                  value={editingDept.description || ''}
                  onChange={(e) => setEditingDept({ ...editingDept, description: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="dept-active-toggle"
                  checked={editingDept.isActive !== false}
                  onChange={(e) => setEditingDept({ ...editingDept, isActive: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="dept-active-toggle" className="font-semibold text-slate-700 cursor-pointer">
                  Trạng thái: Đang hoạt động
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-3 border-t">
              {editingDept.id ? (
                <button
                  type="button"
                  onClick={() => {
                    if (editingDept.id && editingDept.name) {
                      handleDeleteDepartment(editingDept.id, editingDept.name);
                      setEditingDept(null);
                    }
                  }}
                  className="px-3 py-2 rounded-xl bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 hover:border-red-600 font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Xóa Phòng Ban Này
                </button>
              ) : (
                <div></div>
              )}

              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setEditingDept(null)} className="px-3 py-2 rounded-xl text-slate-600 hover:bg-gray-100 font-semibold cursor-pointer">
                  Hủy
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold flex items-center gap-1.5 shadow-sm cursor-pointer">
                  <Check className="w-3.5 h-3.5" />
                  Lưu Phòng Ban
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL / FORM: SỬA HOẶC THÊM ĐƠN VỊ                        */}
      {/* ========================================================= */}
      {editingUnit && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <form onSubmit={handleSaveUnit} className="bg-white border border-gray-200 rounded-3xl w-full max-w-md shadow-2xl p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Landmark className="w-4 h-4 text-indigo-700" />
                {editingUnit.id ? 'Chỉnh Sửa Thông Tin Đơn Vị' : 'Thêm Đơn Vị Mới'}
              </h3>
              <button type="button" onClick={() => setEditingUnit(null)} className="text-gray-400 hover:text-slate-800 text-sm">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Mã Đơn Vị <span className="text-red-600">*</span></label>
                <input
                  type="text"
                  placeholder="Ví dụ: VNR-HQ, DS-HAHAI..."
                  value={editingUnit.code || ''}
                  onChange={(e) => setEditingUnit({ ...editingUnit, code: e.target.value })}
                  className="w-full uppercase font-mono font-bold p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên Đơn Vị <span className="text-red-600">*</span></label>
                <input
                  type="text"
                  placeholder="Ví dụ: Công ty Cổ phần Đường sắt Hà Hải"
                  value={editingUnit.name || ''}
                  onChange={(e) => setEditingUnit({ ...editingUnit, name: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Phân Loại Đơn Vị</label>
                <select
                  value={editingUnit.type || 'TRUC_THUOC'}
                  onChange={(e: any) => setEditingUnit({ ...editingUnit, type: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                >
                  <option value="TRUC_THUOC">Đơn vị trực thuộc Tổng công ty</option>
                  <option value="DOI_TAC">Đối tác liên kết</option>
                  <option value="CO_QUAN_NGOAI">Cơ quan Ngoài / Bộ ngành</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Địa Chỉ Trụ Sở</label>
                <input
                  type="text"
                  placeholder="Ví dụ: 118 Lê Duẩn, Hoàn Kiếm, Hà Nội"
                  value={editingUnit.address || ''}
                  onChange={(e) => setEditingUnit({ ...editingUnit, address: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="unit-active-toggle"
                  checked={editingUnit.isActive !== false}
                  onChange={(e) => setEditingUnit({ ...editingUnit, isActive: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="unit-active-toggle" className="font-semibold text-slate-700 cursor-pointer">
                  Trạng thái: Đang hoạt động
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-3 border-t">
              {editingUnit.id ? (
                <button
                  type="button"
                  onClick={() => {
                    if (editingUnit.id && editingUnit.name) {
                      handleDeleteUnit(editingUnit.id, editingUnit.name);
                      setEditingUnit(null);
                    }
                  }}
                  className="px-3 py-2 rounded-xl bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 hover:border-red-600 font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Xóa Đơn Vị Này
                </button>
              ) : (
                <div></div>
              )}

              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setEditingUnit(null)} className="px-3 py-2 rounded-xl text-slate-600 hover:bg-gray-100 font-semibold cursor-pointer">
                  Hủy
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold flex items-center gap-1.5 shadow-sm cursor-pointer">
                  <Check className="w-3.5 h-3.5" />
                  Lưu Đơn Vị
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL / FORM: SỬA HOẶC THÊM ĐƠN VỊ BAN HÀNH (COMBOBOX)    */}
      {/* ========================================================= */}
      {editingAgency && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <form onSubmit={handleSaveAgency} className="bg-white border border-gray-200 rounded-3xl w-full max-w-md shadow-2xl p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-700" />
                {editingAgency.id ? 'Chỉnh Sửa Đơn Vị Ban Hành' : 'Thêm Đơn Vị Ban Hành Mới'}
              </h3>
              <button type="button" onClick={() => setEditingAgency(null)} className="text-gray-400 hover:text-slate-800 text-sm">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Mã Đơn Vị Ban Hành <span className="text-red-600">*</span></label>
                <input
                  type="text"
                  placeholder="Ví dụ: KTHT, VNR, BGTVT..."
                  value={editingAgency.code || ''}
                  onChange={(e) => setEditingAgency({ ...editingAgency, code: e.target.value })}
                  className="w-full uppercase font-mono font-bold p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên Đầy Đủ Cơ Quan / Đơn Vị Ban Hành <span className="text-red-600">*</span></label>
                <input
                  type="text"
                  placeholder="Ví dụ: Ban Kỹ thuật - Hạ tầng Cơ sở"
                  value={editingAgency.name || ''}
                  onChange={(e) => setEditingAgency({ ...editingAgency, name: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên Viết Tắt (Hiển thị nhanh trên Tag/Pill)</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Ban KTHT, Tổng công ty ĐSVN"
                  value={editingAgency.shortName || ''}
                  onChange={(e) => setEditingAgency({ ...editingAgency, shortName: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="agency-active-toggle"
                  checked={editingAgency.isActive !== false}
                  onChange={(e) => setEditingAgency({ ...editingAgency, isActive: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="agency-active-toggle" className="font-semibold text-slate-700 cursor-pointer">
                  Trạng thái: Hiển thị trong Combobox lập hồ sơ
                </label>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-[11px] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Đơn vị ban hành này sẽ lập tức sẵn sàng trong Combobox lập hồ sơ mới.</span>
            </div>

            <div className="flex items-center justify-between gap-2 pt-3 border-t">
              {editingAgency.id ? (
                <button
                  type="button"
                  onClick={() => {
                    if (editingAgency.id && editingAgency.name) {
                      handleDeleteAgency(editingAgency.id, editingAgency.name);
                      setEditingAgency(null);
                    }
                  }}
                  className="px-3 py-2 rounded-xl bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 hover:border-red-600 font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Xóa Đơn Vị Ban Hành
                </button>
              ) : (
                <div></div>
              )}

              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setEditingAgency(null)} className="px-3 py-2 rounded-xl text-slate-600 hover:bg-gray-100 font-semibold cursor-pointer">
                  Hủy
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold flex items-center gap-1.5 shadow-sm cursor-pointer">
                  <Check className="w-3.5 h-3.5" />
                  Lưu Đơn Vị Ban Hành
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL / FORM: SỬA HOẶC THÊM TÀI KHOẢN NGƯỜI DÙNG         */}
      {/* ========================================================= */}
      {editingUser && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <form onSubmit={handleSaveUser} className="bg-white border border-gray-200 rounded-3xl w-full max-w-lg shadow-2xl p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-700" />
                {editingUser.id ? 'Chỉnh Sửa Tài Khoản & Phân Quyền' : 'Thêm Tài Khoản Mới'}
              </h3>
              <button type="button" onClick={() => setEditingUser(null)} className="text-gray-400 hover:text-slate-800 text-sm">✕</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Họ Và Tên Cán Bộ <span className="text-red-600">*</span></label>
                <input
                  type="text"
                  placeholder="Ví dụ: Nguyễn Văn Cường"
                  value={editingUser.name || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Cơ Quan <span className="text-red-600">*</span></label>
                <input
                  type="email"
                  placeholder="cuong.nguyen@vnr.gov.vn"
                  value={editingUser.email || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Vai Trò / Phân Quyền Hệ Thống <span className="text-red-600">*</span></label>
                <select
                  value={editingUser.role || 'CHUYEN_VIEN'}
                  onChange={(e: any) => setEditingUser({ ...editingUser, role: e.target.value })}
                  className="w-full p-2 rounded-lg border border-purple-300 bg-purple-50/60 focus:outline-none focus:ring-2 focus:ring-purple-600 font-bold text-purple-950"
                >
                  <option value="ADMIN">Quản trị viên (ADMIN) - Toàn quyền cấu hình</option>
                  <option value="TRUONG_PHONG">Trưởng phòng (TRUONG_PHONG) - Thẩm tra &amp; Duyệt</option>
                  <option value="CHUYEN_VIEN">Chuyên viên (CHUYEN_VIEN) - Lập hồ sơ &amp; Soạn thảo</option>
                  <option value="VAN_THU">Văn thư (VAN_THU) - Cấp số VB Đi &amp; Vào sổ Đến</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Chức Danh Công Tác</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Chuyên viên Kỹ thuật & Dự án"
                  value={editingUser.roleTitle || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, roleTitle: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Thuộc Phòng Ban <span className="text-red-600">*</span></label>
                <select
                  value={editingUser.department || departments[0]?.name}
                  onChange={(e) => setEditingUser({ ...editingUser, department: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Số Điện Thoại</label>
                <input
                  type="text"
                  placeholder="0903.112.889"
                  value={editingUser.phone || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Đường Dẫn Ảnh Đại Diện (Avatar URL)</label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={editingUser.avatar || ''}
                onChange={(e) => setEditingUser({ ...editingUser, avatar: e.target.value })}
                className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="flex items-center justify-between gap-2 pt-3 border-t">
              {editingUser.id && editingUser.id !== currentUser.id ? (
                <button
                  type="button"
                  onClick={() => {
                    if (editingUser.id && editingUser.name) {
                      handleDeleteUser(editingUser.id, editingUser.name);
                      setEditingUser(null);
                    }
                  }}
                  className="px-3 py-2 rounded-xl bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 hover:border-red-600 font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Xóa Tài Khoản Này
                </button>
              ) : (
                <div></div>
              )}

              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setEditingUser(null)} className="px-3 py-2 rounded-xl text-slate-600 hover:bg-gray-100 font-semibold cursor-pointer">
                  Hủy
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold flex items-center gap-1.5 shadow-sm cursor-pointer">
                  <Check className="w-3.5 h-3.5" />
                  Lưu Tài Khoản
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
