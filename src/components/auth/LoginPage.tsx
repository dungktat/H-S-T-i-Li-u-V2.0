import React, { useState, useEffect } from 'react';
import { UserProfile, BrandConfig, UserRole } from '../../types';
import { StorageService } from '../../services/storageService';
import { 
  getLoginBackgroundGradient, 
  adjustHexBrightness, 
  THEME_PRESETS 
} from '../../utils/themeUtils';
import { 
  Shield, 
  Award, 
  Users, 
  Send, 
  FileText, 
  Lock, 
  UserCheck, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Palette, 
  Check, 
  Sparkles,
  Mail
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
  const [isThemePickerOpen, setIsThemePickerOpen] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Sync state when storage changes
  useEffect(() => {
    const handleStateChange = (e: any) => {
      if (e?.detail?.type === 'brand' || e?.detail?.type === 'all_reset') {
        setBranding(StorageService.getBrandConfig());
      }
      if (e?.detail?.type === 'users' || e?.detail?.type === 'all_reset') {
        setUsers(StorageService.getUsers());
      }
    };
    window.addEventListener('hstl_state_change', handleStateChange);
    return () => window.removeEventListener('hstl_state_change', handleStateChange);
  }, []);

  // Update form inputs when selectedUser changes
  useEffect(() => {
    if (selectedUser) {
      setUsernameOrEmail(selectedUser.email);
      setPassword('vnr@2026');
      setLoginError(null);
    }
  }, [selectedUser]);

  const handlePerformLogin = (userToLogin: UserProfile) => {
    setIsLoggingIn(true);
    setLoginError(null);
    setTimeout(() => {
      onLogin(userToLogin);
    }, 250);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameOrEmail.trim()) {
      setLoginError('Vui lòng nhập Email hoặc Mã tài khoản');
      return;
    }

    const matched = users.find(
      u => u.email.toLowerCase() === usernameOrEmail.trim().toLowerCase() ||
           u.id.toLowerCase() === usernameOrEmail.trim().toLowerCase() ||
           u.name.toLowerCase() === usernameOrEmail.trim().toLowerCase()
    ) || selectedUser;

    handlePerformLogin(matched);
  };

  const handleQuickChangeColor = (hex: string, name: string) => {
    const updated: BrandConfig = {
      ...branding,
      primaryAccent: hex,
      accentName: name
    };
    StorageService.saveBrandConfig(updated);
    setBranding(updated);
    if (onUpdateBranding) onUpdateBranding(updated);
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return { label: 'Quản trị viên', color: 'bg-rose-500/20 text-rose-200 border-rose-400/40', icon: Shield };
      case 'LANH_DAO':
        return { label: 'Lãnh đạo', color: 'bg-amber-500/20 text-amber-200 border-amber-400/40', icon: Award };
      case 'TRUONG_PHONG':
        return { label: 'Trưởng phòng', color: 'bg-purple-500/20 text-purple-200 border-purple-400/40', icon: Users };
      case 'VAN_THU':
        return { label: 'Văn thư', color: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40', icon: Send };
      case 'CHUYEN_VIEN':
      default:
        return { label: 'Chuyên viên', color: 'bg-cyan-500/20 text-cyan-200 border-cyan-400/40', icon: FileText };
    }
  };

  const activeAccent = branding.primaryAccent || '#003882';
  const bgGradient = getLoginBackgroundGradient(activeAccent);
  const buttonGradient = `linear-gradient(135deg, ${adjustHexBrightness(activeAccent, 20)} 0%, ${activeAccent} 50%, ${adjustHexBrightness(activeAccent, -20)} 100%)`;

  return (
    <div 
      className="min-h-[100dvh] w-full text-white flex flex-col justify-between font-sans select-none overflow-y-auto overflow-x-hidden transition-colors duration-500 relative"
      style={{ background: bgGradient }}
    >
      {/* Ambient background glows */}
      <div 
        className="absolute -top-32 -left-32 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-700"
        style={{ backgroundColor: activeAccent }}
      />
      <div 
        className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-700"
        style={{ backgroundColor: adjustHexBrightness(activeAccent, 40) }}
      />

      {/* HEADER: Brand & Color Switcher */}
      <header className="relative z-20 px-4 sm:px-8 py-3 flex items-center justify-between border-b border-white/15 backdrop-blur-md bg-black/20 shrink-0 gap-2">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white/20 border border-white/30 flex items-center justify-center font-black text-white text-sm shadow-inner shrink-0">
            DS
          </div>
          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm font-extrabold uppercase tracking-wide text-white truncate">
              {branding.agencyName}
            </h1>
            <p className="text-[10px] sm:text-xs text-blue-100/80 font-medium truncate">
              {branding.softwareName}
            </p>
          </div>
        </div>

        {/* Change Theme Color Tool */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setIsThemePickerOpen(!isThemePickerOpen)}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/25 text-xs font-semibold text-white transition cursor-pointer backdrop-blur-xs"
            title="Đổi màu sắc nhận diện"
          >
            <div 
              className="w-3.5 h-3.5 rounded-full border border-white shadow-xs shrink-0"
              style={{ backgroundColor: activeAccent }}
            />
            <span className="hidden sm:inline text-xs font-bold">
              {branding.accentName || 'Đổi màu'}
            </span>
            <Palette className="w-3.5 h-3.5 text-blue-200" />
          </button>

          {/* Color Picker Dropdown */}
          {isThemePickerOpen && (
            <div 
              className="absolute right-0 mt-2 w-72 bg-slate-900/95 border border-white/20 rounded-2xl p-3 shadow-2xl backdrop-blur-xl z-50 animate-fadeIn"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Màu sắc nhận diện
                </span>
                <button 
                  onClick={() => setIsThemePickerOpen(false)}
                  className="text-white/60 hover:text-white text-xs cursor-pointer p-1"
                >
                  ✕
                </button>
              </div>
              <div className="grid grid-cols-2 gap-1.5 max-h-56 overflow-y-auto pr-1">
                {THEME_PRESETS.map((preset) => {
                  const isCurrent = activeAccent.toLowerCase() === preset.hex.toLowerCase();
                  return (
                    <button
                      key={preset.hex}
                      onClick={() => {
                        handleQuickChangeColor(preset.hex, preset.name);
                        setIsThemePickerOpen(false);
                      }}
                      className={`flex items-center gap-2 p-2 rounded-xl text-left transition cursor-pointer border ${
                        isCurrent 
                          ? 'bg-white/20 border-white text-white font-bold' 
                          : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/80'
                      }`}
                    >
                      <div 
                        className="w-3.5 h-3.5 rounded-full border border-white/40 shrink-0" 
                        style={{ backgroundColor: preset.hex }} 
                      />
                      <span className="text-[11px] truncate">{preset.name.split('(')[0]}</span>
                      {isCurrent && <Check className="w-3 h-3 ml-auto text-emerald-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* MAIN CONTENT: 1 Single Screen Center View */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-3 sm:p-5 w-full max-w-4xl mx-auto my-auto">
        
        {/* Central Card */}
        <div className="w-full max-w-lg bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-4">
          
          {/* Header of Form */}
          <div className="text-center">
            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
              Đăng Nhập Hệ Thống
            </h2>
            <p className="text-xs text-blue-100/80 mt-0.5">
              Thư viện Hồ sơ Tài liệu &amp; Quản trị văn bản điện tử
            </p>
          </div>

          {/* Active selected user banner */}
          <div className="bg-black/25 border border-white/15 rounded-2xl p-2.5 sm:p-3 flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <img 
                src={selectedUser.avatar} 
                alt={selectedUser.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-white/60 shadow-sm shrink-0" 
              />
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-bold text-white truncate flex items-center gap-1.5">
                  <span>{selectedUser.name}</span>
                </div>
                <div className="text-[11px] text-blue-200 truncate">
                  {selectedUser.roleTitle} &bull; {selectedUser.department}
                </div>
              </div>
            </div>
            {(() => {
              const badge = getRoleBadge(selectedUser.role);
              const Icon = badge.icon;
              return (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 flex items-center gap-1 ${badge.color}`}>
                  <Icon className="w-3 h-3" />
                  <span>{badge.label}</span>
                </span>
              );
            })()}
          </div>

          {/* Error Message */}
          {loginError && (
            <div className="p-2.5 bg-rose-500/25 border border-rose-400/40 rounded-xl text-rose-200 text-xs flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-rose-300 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleFormSubmit} className="space-y-3 text-left">
            <div>
              <label className="block text-xs font-semibold text-blue-100 mb-1">
                Tài khoản / Email:
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-white/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  placeholder="Tên đăng nhập hoặc Email"
                  className="w-full bg-white/10 border border-white/20 focus:border-white focus:bg-white/20 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-white/40 transition"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-blue-100">
                  Mật khẩu:
                </label>
                <span className="text-[10px] text-blue-200/70 font-mono">
                  Mặc định: vnr@2026
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-white/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mật khẩu"
                  className="w-full bg-white/10 border border-white/20 focus:border-white focus:bg-white/20 rounded-xl pl-9 pr-9 py-2 text-xs sm:text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-white/40 transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white cursor-pointer p-1"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoggingIn}
              style={{ background: buttonGradient }}
              className="w-full py-2.5 px-4 rounded-xl text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-black/20 hover:brightness-110 active:scale-98 transition cursor-pointer border border-white/30 mt-2"
            >
              {isLoggingIn ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Đang đăng nhập...</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>Đăng Nhập Vào Hệ Thống</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* QUICK ACCOUNT PICKER SECTION (Below the form) */}
          <div className="pt-3 border-t border-white/15 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-cyan-300" />
                Chọn tài khoản kiểm thử:
              </span>
              <span className="text-[10px] text-blue-200/80">
                Bấm để chuyển đổi
              </span>
            </div>

            {/* Horizontal or Grid Account Buttons (Name & Role Only) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2 max-h-48 overflow-y-auto pr-0.5">
              {users.map((u) => {
                const isSelected = selectedUser.id === u.id;
                const badge = getRoleBadge(u.role);
                const Icon = badge.icon;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      setSelectedUser(u);
                    }}
                    className={`p-2 rounded-xl border text-left transition cursor-pointer flex items-center gap-2 ${
                      isSelected
                        ? 'bg-white/25 border-white text-white font-bold ring-2 ring-white/40 shadow-sm'
                        : 'bg-white/10 hover:bg-white/15 border-white/15 text-white/90'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full bg-white/20 border border-white/40 flex items-center justify-center shrink-0">
                      <Icon className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] sm:text-xs font-bold truncate leading-tight">
                        {u.name}
                      </div>
                      <div className="text-[10px] text-blue-200 truncate">
                        {badge.label}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </main>

      {/* FOOTER */}
      <footer className="relative z-20 px-4 py-2.5 border-t border-white/10 backdrop-blur-md bg-black/20 text-center text-[11px] text-blue-100/70 flex flex-col sm:flex-row items-center justify-between max-w-4xl mx-auto w-full gap-1 shrink-0">
        <div>{branding.version}</div>
        <div>{branding.footerText}</div>
      </footer>
    </div>
  );
};
