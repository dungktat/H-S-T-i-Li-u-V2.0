import React, { useState, useEffect } from 'react';
import { UserProfile, BrandConfig, UserRole } from '../../types';
import { StorageService } from '../../services/storageService';
import { 
  getLoginBackgroundGradient, 
  adjustHexBrightness 
} from '../../utils/themeUtils';
import { 
  Shield, 
  Award, 
  Users, 
  Send, 
  FileText, 
  CheckCircle2, 
  Lock, 
  Unlock, 
  UserCheck, 
  Sparkles, 
  Search, 
  ArrowRight, 
  Building2, 
  Layers, 
  Eye, 
  EyeOff, 
  Palette, 
  Check, 
  Fingerprint,
  FileCheck2,
  Mail,
  HelpCircle,
  Clock
} from 'lucide-react';

interface LoginPageProps {
  branding: BrandConfig;
  onLogin: (user: UserProfile) => void;
  onUpdateBranding?: (branding: BrandConfig) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  branding: initialBranding,
  onLogin,
  onUpdateBranding
}) => {
  const [branding, setBranding] = useState<BrandConfig>(initialBranding);
  const [users, setUsers] = useState<UserProfile[]>(() => StorageService.getUsers());
  const [selectedUser, setSelectedUser] = useState<UserProfile>(() => {
    const current = StorageService.getCurrentUser();
    return current || StorageService.getUsers()[0];
  });

  const [usernameOrEmail, setUsernameOrEmail] = useState(selectedUser.email || 'admin.hstl@vnr.gov.vn');
  const [password, setPassword] = useState('vnr@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [roleFilter, setRoleFilter] = useState<'ALL' | UserRole>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Synchronize when brand changes in localStorage or by admin
  useEffect(() => {
    const handleStateChange = (e: any) => {
      if (e?.detail?.type === 'brand' || e?.detail?.type === 'all_reset') {
        setBranding(StorageService.getBrandConfig());
      }
      if (e?.detail?.type === 'users' || e?.detail?.type === 'all_reset') {
        const uList = StorageService.getUsers();
        setUsers(uList);
      }
    };
    window.addEventListener('hstl_state_change', handleStateChange);
    return () => window.removeEventListener('hstl_state_change', handleStateChange);
  }, []);

  // Update form inputs when selectedUser changes
  useEffect(() => {
    setUsernameOrEmail(selectedUser.email);
    setPassword('vnr@2026');
    setLoginError(null);
  }, [selectedUser]);

  // Handle direct login
  const handlePerformLogin = (userToLogin: UserProfile) => {
    setIsLoggingIn(true);
    setLoginError(null);
    setTimeout(() => {
      onLogin(userToLogin);
    }, 280);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameOrEmail.trim()) {
      setLoginError('Vui lòng nhập Email hoặc Mã tài khoản');
      return;
    }

    // Match entered email/id or fallback to selected user
    const matched = users.find(
      u => u.email.toLowerCase() === usernameOrEmail.trim().toLowerCase() ||
           u.id.toLowerCase() === usernameOrEmail.trim().toLowerCase() ||
           u.name.toLowerCase() === usernameOrEmail.trim().toLowerCase()
    ) || selectedUser;

    handlePerformLogin(matched);
  };

  // Role Metadata Helper
  const getRoleMeta = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return {
          label: 'Quản Trị Viên (Admin)',
          badgeColor: 'bg-rose-500/20 text-rose-200 border-rose-400/30',
          icon: Shield,
          testFeature: 'Quản trị hệ thống: Đổi màu giao diện, quản lý phòng ban, đơn vị & phân quyền'
        };
      case 'LANH_DAO':
        return {
          label: 'Lãnh Đạo Cơ Quan',
          badgeColor: 'bg-amber-500/20 text-amber-200 border-amber-400/30',
          icon: Award,
          testFeature: 'Phê duyệt & Ký số Văn bản đi (Luồng 4), cho ý kiến chỉ đạo Văn bản đến (Luồng 3)'
        };
      case 'TRUONG_PHONG':
        return {
          label: 'Trưởng Phòng Thẩm Định',
          badgeColor: 'bg-purple-500/20 text-purple-200 border-purple-400/30',
          icon: Users,
          testFeature: 'Thẩm định hồ sơ số hóa (Luồng 1), duyệt hồ sơ dự thảo (Luồng 2), phân công xử lý'
        };
      case 'VAN_THU':
        return {
          label: 'Cán Bộ Văn Thư',
          badgeColor: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30',
          icon: Send,
          testFeature: 'Vào sổ & số hóa Văn bản đến (Luồng 3), cấp số tự động & phát hành Văn bản đi (Luồng 4)'
        };
      case 'CHUYEN_VIEN':
      default:
        return {
          label: 'Chuyên Viên Nghiệp Vụ',
          badgeColor: 'bg-cyan-500/20 text-cyan-200 border-cyan-400/30',
          icon: FileText,
          testFeature: 'OCR số hóa tài liệu cũ (Luồng 1), lập hồ sơ công việc & soạn thảo văn bản (Luồng 2)'
        };
    }
  };

  // Filtered users
  const filteredUsers = users.filter(u => {
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.department.toLowerCase().includes(q) ||
        u.roleTitle.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const activeAccent = branding.primaryAccent || '#003882';
  const bgGradient = getLoginBackgroundGradient(activeAccent);
  const cardBorderLight = adjustHexBrightness(activeAccent, 25);
  const buttonGradient = `linear-gradient(135deg, ${adjustHexBrightness(activeAccent, 18)} 0%, ${activeAccent} 55%, ${adjustHexBrightness(activeAccent, -18)} 100%)`;

  return (
    <div 
      className="min-h-[100dvh] w-full text-white flex flex-col justify-between font-sans select-none overflow-x-hidden transition-colors duration-500 relative"
      style={{ background: bgGradient }}
    >
      {/* Background Decorative Ambient Circles */}
      <div 
        className="absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl opacity-25 pointer-events-none transition-all duration-700"
        style={{ backgroundColor: activeAccent }}
      />
      <div 
        className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-700"
        style={{ backgroundColor: adjustHexBrightness(activeAccent, 40) }}
      />

      {/* ========================================================= */}
      {/* TOP BAR: BRANDING & THEME SYNC CONTROLLER                 */}
      {/* ========================================================= */}
      <header className="relative z-20 px-4 sm:px-8 py-3.5 flex items-center justify-between border-b border-white/10 backdrop-blur-md bg-black/15 shrink-0 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center font-black text-white text-base shadow-inner shrink-0">
            DS
          </div>
          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-white truncate">
              {branding.agencyName}
            </h1>
            <p className="text-[10px] sm:text-xs text-blue-100/80 font-medium truncate">
              {branding.softwareName}
            </p>
          </div>
        </div>

        {/* Official Status Badge */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-white backdrop-blur-xs shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="hidden sm:inline text-[11px] text-blue-100">Cổng Quản Trị &amp; Lưu Trữ Trực Tuyến</span>
            <span className="sm:hidden text-[10px] text-blue-100">Trực Tuyến</span>
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* MAIN CONTAINER: 2-COLUMN LAYOUT                           */}
      {/* Left: Login Form | Right: Account Switcher for Testing   */}
      {/* ========================================================= */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 md:p-8 flex flex-col lg:flex-row gap-6 items-stretch justify-center">
        
        {/* ------------------------------------------------------- */}
        {/* COLUMN 1: FORM ĐĂNG NHẬP CHÍNH THỨC                     */}
        {/* ------------------------------------------------------- */}
        <div className="w-full lg:w-[420px] flex flex-col justify-center shrink-0">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            
            {/* Header / Brand Icon */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-[11px] font-semibold text-blue-100 mb-3 shadow-xs">
                <Fingerprint className="w-3.5 h-3.5 text-cyan-300" />
                <span>Cổng Đăng Nhập Một Điểm Đến (SSO)</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
                Đăng Nhập Hệ Thống
              </h2>
              <p className="text-xs text-blue-100/80 mt-1 leading-relaxed">
                Thư viện Hồ sơ Tài liệu số hóa &amp; Quản trị văn bản điện tử.
              </p>
            </div>

            {/* Currently Selected Account Preview Badge */}
            <div className="bg-black/20 border border-white/15 rounded-2xl p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <img 
                  src={selectedUser.avatar} 
                  alt={selectedUser.name}
                  className="w-11 h-11 rounded-full object-cover border-2 border-white/60 shadow-md shrink-0" 
                />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                    <span>{selectedUser.name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/20 font-mono">
                      {selectedUser.role}
                    </span>
                  </div>
                  <div className="text-[11px] text-blue-200 truncate">
                    {selectedUser.roleTitle}
                  </div>
                  <div className="text-[10px] text-blue-300/80 truncate">
                    {selectedUser.department}
                  </div>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Sẵn sàng
                </span>
              </div>
            </div>

            {/* Error Message */}
            {loginError && (
              <div className="p-3 bg-rose-500/25 border border-rose-400/40 rounded-xl text-rose-200 text-xs flex items-center gap-2">
                <Lock className="w-4 h-4 text-rose-300 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-blue-100 mb-1.5">
                  Tài khoản / Email công vụ:
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-white/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                    placeholder="name@vnr.gov.vn hoặc mã cán bộ"
                    className="w-full bg-white/10 border border-white/20 focus:border-white focus:bg-white/20 rounded-xl pl-10 pr-3 py-2.5 text-xs sm:text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 transition"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-blue-100">
                    Mật khẩu xác thực:
                  </label>
                  <span className="text-[10px] text-blue-200/70 font-mono">
                    Demo: vnr@2026
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-white/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mật khẩu"
                    className="w-full bg-white/10 border border-white/20 focus:border-white focus:bg-white/20 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white cursor-pointer p-1"
                    title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoggingIn}
                style={{ background: buttonGradient }}
                className="w-full py-3 px-4 rounded-xl text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-black/20 hover:brightness-110 active:scale-98 transition cursor-pointer border border-white/30 mt-2"
              >
                {isLoggingIn ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Đang khởi tạo phiên làm việc...</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4.5 h-4.5" />
                    <span>Đăng Nhập Vào Hệ Thống</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </form>

            {/* Quick 1-Click Tip */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-blue-200/80">
              <span className="flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5" />
                Mẹo: Bấm thẻ bên phải để đổi vai trò thử nghiệm ngay!
              </span>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------- */}
        {/* COLUMN 2: CHUYỂN ĐỔI CÁC TÀI KHOẢN ĐỂ THỬ NGHIỆM        */}
        {/* ------------------------------------------------------- */}
        <div className="flex-1 flex flex-col bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-5 sm:p-7 shadow-2xl min-w-0">
          
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/15">
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-300" />
                <h3 className="text-base sm:text-lg font-black text-white">
                  Chuyển Đổi Tài Khoản Thử Nghiệm Hệ Thống
                </h3>
              </div>
              <p className="text-xs text-blue-100/80 mt-0.5">
                Chọn tài khoản tương ứng với vai trò nghiệp vụ để kiểm tra các quyền hạn, phê duyệt và quy trình công việc.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 text-white/50 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm tên, chức danh, phòng ban..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-white/40"
              />
            </div>
          </div>

          {/* Role Filter Tabs */}
          <div className="flex items-center gap-1.5 py-3 overflow-x-auto scrollbar-none shrink-0">
            <button
              onClick={() => setRoleFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 border ${
                roleFilter === 'ALL'
                  ? 'bg-white text-blue-900 border-white shadow-sm'
                  : 'bg-white/10 hover:bg-white/20 text-blue-100 border-white/10'
              }`}
            >
              Tất Cả ({users.length})
            </button>
            <button
              onClick={() => setRoleFilter('ADMIN')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 border flex items-center gap-1.5 ${
                roleFilter === 'ADMIN'
                  ? 'bg-rose-500 text-white border-rose-300 shadow-sm'
                  : 'bg-white/10 hover:bg-white/20 text-blue-100 border-white/10'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              Quản Trị Viên (Admin)
            </button>
            <button
              onClick={() => setRoleFilter('LANH_DAO')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 border flex items-center gap-1.5 ${
                roleFilter === 'LANH_DAO'
                  ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-sm'
                  : 'bg-white/10 hover:bg-white/20 text-blue-100 border-white/10'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              Lãnh Đạo (Ký số &amp; Duyệt)
            </button>
            <button
              onClick={() => setRoleFilter('TRUONG_PHONG')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 border flex items-center gap-1.5 ${
                roleFilter === 'TRUONG_PHONG'
                  ? 'bg-purple-600 text-white border-purple-300 shadow-sm'
                  : 'bg-white/10 hover:bg-white/20 text-blue-100 border-white/10'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Trưởng Phòng (Thẩm định)
            </button>
            <button
              onClick={() => setRoleFilter('VAN_THU')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 border flex items-center gap-1.5 ${
                roleFilter === 'VAN_THU'
                  ? 'bg-emerald-600 text-white border-emerald-300 shadow-sm'
                  : 'bg-white/10 hover:bg-white/20 text-blue-100 border-white/10'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              Văn Thư (Phát hành)
            </button>
            <button
              onClick={() => setRoleFilter('CHUYEN_VIEN')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 border flex items-center gap-1.5 ${
                roleFilter === 'CHUYEN_VIEN'
                  ? 'bg-cyan-600 text-white border-cyan-300 shadow-sm'
                  : 'bg-white/10 hover:bg-white/20 text-blue-100 border-white/10'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Chuyên Viên (Soạn thảo &amp; Số hóa)
            </button>
          </div>

          {/* Accounts Grid */}
          <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-1 md:grid-cols-2 gap-3 min-h-0 py-2">
            {filteredUsers.map((user) => {
              const roleMeta = getRoleMeta(user.role);
              const RoleIcon = roleMeta.icon;
              const isSelected = selectedUser.id === user.id;

              return (
                <div
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between group ${
                    isSelected
                      ? 'bg-white/25 border-white shadow-lg ring-2 ring-white/40 scale-[1.01]'
                      : 'bg-white/10 hover:bg-white/15 border-white/15 hover:border-white/30'
                  }`}
                >
                  <div className="space-y-2">
                    {/* Top row: Avatar & Identity */}
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative shrink-0">
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-white/60 shadow-md"
                          />
                          {isSelected && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                              ✓
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-black text-sm text-white truncate leading-tight">
                              {user.name}
                            </h4>
                          </div>
                          <div className="text-xs font-semibold text-blue-100 mt-0.5 truncate">
                            {user.roleTitle}
                          </div>
                          <div className="text-[11px] text-blue-200/70 truncate flex items-center gap-1">
                            <Building2 className="w-3 h-3 shrink-0" />
                            <span>{user.department}</span>
                          </div>
                        </div>
                      </div>

                      {/* Role Pill */}
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase border shrink-0 flex items-center gap-1 ${roleMeta.badgeColor}`}>
                        <RoleIcon className="w-3 h-3" />
                        <span>{user.role}</span>
                      </span>
                    </div>

                    {/* Features Testable with this account */}
                    <div className="bg-black/20 p-2 rounded-xl border border-white/10 text-[11px] text-blue-100/90 leading-relaxed flex items-start gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white">Quyền thử nghiệm: </strong>
                        <span>{roleMeta.testFeature}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions row: Select & 1-Click Quick Login */}
                  <div className="pt-3 mt-2 border-t border-white/10 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-blue-200/80 font-mono truncate">
                      {user.email}
                    </span>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* 1-Click Login Directly Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedUser(user);
                          handlePerformLogin(user);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-blue-50 text-blue-900 font-bold text-xs flex items-center gap-1 shadow-sm transition cursor-pointer hover:scale-102 active:scale-98"
                        title="Vào hệ thống ngay với tài khoản này"
                      >
                        <span>Vào ngay</span>
                        <ArrowRight className="w-3.5 h-3.5 text-blue-700" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Notice footer */}
          <div className="pt-3 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-blue-200/80">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Tất cả tài khoản đều đã được cấp sẵn quyền và dữ liệu mẫu tương ứng để kiểm thử.
            </span>
            <span className="font-mono text-[10px] text-blue-300/80">
              Đang chọn: <strong>{selectedUser.name}</strong> ({selectedUser.role})
            </span>
          </div>

        </div>

      </main>

      {/* ========================================================= */}
      {/* FOOTER: VERSION & LEGAL COMPLIANCE                        */}
      {/* ========================================================= */}
      <footer className="relative z-20 px-4 py-3 border-t border-white/10 backdrop-blur-md bg-black/20 text-center text-xs text-blue-100/70 flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto w-full gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{branding.version}</span>
        </div>
        <div className="text-[11px]">
          {branding.footerText}
        </div>
      </footer>
    </div>
  );
};
