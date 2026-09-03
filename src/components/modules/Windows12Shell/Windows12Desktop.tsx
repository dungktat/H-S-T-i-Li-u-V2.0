import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, BrandConfig, AppWindowId, ExistingDocument, DraftDossier } from '../../../types';
import { SAMPLE_USERS } from '../../../data/initialData';
import { StorageService } from '../../../services/storageService';
import { Luong1Module } from '../Luoc1CapNhat/Luong1Module';
import { Luong2Module } from '../Luoc2SoanThao/Luong2Module';
import { Luong3Module } from '../Luoc3VanBanDen/Luong3Module';
import { Luong4Module } from '../Luoc4VanBanDi/Luong4Module';
import { ThuVienTongHopModule } from '../ThuVienHSTL/ThuVienTongHopModule';
import { SettingsPersonalizationModal } from './SettingsPersonalizationModal';
import { DocumentViewerModal } from '../../common/DocumentViewerModal';
import { 
  Layers, 
  FolderArchive, 
  FileSignature, 
  Inbox, 
  Send, 
  SlidersHorizontal, 
  ChevronRight,
  Menu,
  X,
  Sparkles,
  Bell,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  Archive,
  Lock,
  UserCheck,
  Building2,
  Users
} from 'lucide-react';

export const Windows12Desktop: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => StorageService.getCurrentUser());
  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => StorageService.getUsers());
  const [branding, setBranding] = useState<BrandConfig>(StorageService.getBrandConfig());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [viewerItem, setViewerItem] = useState<any | null>(null);
  const [viewerSearchKeyword, setViewerSearchKeyword] = useState<string>('');
  const [viewerInitialTab, setViewerInitialTab] = useState<'preview' | 'ocr' | 'meta' | 'location' | 'versions' | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<AppWindowId>('THU_VIEN_HSTL');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Notification Bell state
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);
  const [existingDocs, setExistingDocs] = useState<ExistingDocument[]>(() => StorageService.getExistingDocs());
  const [draftDocs, setDraftDocs] = useState<DraftDossier[]>(() => StorageService.getDrafts());
  const notifRef = useRef<HTMLDivElement>(null);

  const refreshData = () => {
    setExistingDocs(StorageService.getExistingDocs());
    setDraftDocs(StorageService.getDrafts());
  };

  useEffect(() => {
    const handleStateChange = (e: any) => {
      if (e?.detail?.type === 'users' || e?.detail?.type === 'all_reset') {
        setAllUsers(StorageService.getUsers());
        setCurrentUser(StorageService.getCurrentUser());
      }
      if (e?.detail?.type === 'user') {
        setCurrentUser(StorageService.getCurrentUser());
      }
      if (e?.detail?.type === 'brand' || e?.detail?.type === 'all_reset') {
        setBranding(StorageService.getBrandConfig());
      }
      refreshData();
    };

    window.addEventListener('hstl_state_change', handleStateChange);
    window.addEventListener('storage', handleStateChange);

    // Close notifications when clicking outside
    const handleClickOutside = (evt: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(evt.target as Node)) {
        setNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('hstl_state_change', handleStateChange);
      window.removeEventListener('storage', handleStateChange);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Compute notifications based on current role
  const getNotifications = () => {
    const list: Array<{
      id: string;
      docId: string;
      title: string;
      code: string;
      summary: string;
      sender: string;
      senderDept: string;
      time: string;
      securityLevel: 'THƯỜNG' | 'MẬT';
      status: string;
      targetTab: AppWindowId;
      isUrgent?: boolean;
    }> = [];

    // 1. Hồ sơ chờ Trưởng phòng duyệt / Phối hợp
    if (currentUser.role === 'TRUONG_PHONG' || currentUser.role === 'ADMIN') {
      existingDocs
        .filter(d => d.status === 'PENDING_REVIEW' || d.status === 'COORDINATING')
        .forEach(d => {
          list.push({
            id: `notif-ex-${d.id}`,
            docId: d.id,
            title: d.status === 'COORDINATING' ? 'Hồ sơ đang phối hợp lấy ý kiến' : 'Hồ sơ mới cần Trưởng phòng thẩm định & duyệt',
            code: d.soKyHieu,
            summary: d.trichYeu,
            sender: d.createdByName || 'Chuyên viên',
            senderDept: d.coQuanBanHanh,
            time: d.createdAt ? new Date(d.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Vừa xong',
            securityLevel: d.securityLevel || 'THƯỜNG',
            status: d.status,
            targetTab: 'LUONG_1',
            isUrgent: true
          });
        });

      // Draft HSCV chờ duyệt
      draftDocs
        .filter(d => d.currentStep === 'SUBMITTED_FOR_REVIEW' || d.currentStep === 'COORDINATION_FEEDBACK')
        .forEach(d => {
          list.push({
            id: `notif-dr-${d.id}`,
            docId: d.id,
            title: 'Hồ sơ công việc & Dự thảo cần thẩm định',
            code: d.code,
            summary: d.trichYeu,
            sender: d.creatorName,
            senderDept: d.creatorDepartment,
            time: new Date(d.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            securityLevel: 'THƯỜNG',
            status: d.currentStep,
            targetTab: 'LUONG_2',
            isUrgent: true
          });
        });
    }

    // 2. Hồ sơ chờ Văn thư phê duyệt & nhập HSTL
    if (currentUser.role === 'VAN_THU' || currentUser.role === 'ADMIN') {
      existingDocs
        .filter(d => d.status === 'PENDING_VAN_THU')
        .forEach(d => {
          list.push({
            id: `notif-vt-${d.id}`,
            docId: d.id,
            title: 'Hồ sơ đã được TP duyệt, chờ Văn thư nhập HSTL',
            code: d.soKyHieu,
            summary: d.trichYeu,
            sender: d.assignedReviewerName || 'Trưởng phòng',
            senderDept: d.coQuanBanHanh,
            time: d.reviewedAt ? new Date(d.reviewedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Vừa xong',
            securityLevel: d.securityLevel || 'THƯỜNG',
            status: d.status,
            targetTab: 'LUONG_1',
            isUrgent: true
          });
        });
    }

    // 3. Hồ sơ bị trả lại yêu cầu sửa
    if (currentUser.role === 'CHUYEN_VIEN' || currentUser.role === 'ADMIN') {
      existingDocs
        .filter(d => d.status === 'REJECTED' && (d.createdBy === currentUser.id || currentUser.role === 'ADMIN'))
        .forEach(d => {
          list.push({
            id: `notif-rej-${d.id}`,
            docId: d.id,
            title: 'Hồ sơ bị Trưởng phòng yêu cầu chỉnh sửa lại',
            code: d.soKyHieu,
            summary: d.reviewNote || d.trichYeu,
            sender: d.assignedReviewerName || 'Trưởng phòng',
            senderDept: d.coQuanBanHanh,
            time: d.reviewedAt ? new Date(d.reviewedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Gần đây',
            securityLevel: d.securityLevel || 'THƯỜNG',
            status: d.status,
            targetTab: 'LUONG_1',
            isUrgent: false
          });
        });
    }

    return list;
  };

  const notifications = getNotifications();
  const unreadCount = notifications.filter(n => !readNotificationIds.includes(n.id)).length;

  const handleMarkAllRead = () => {
    setReadNotificationIds(notifications.map(n => n.id));
  };

  const handleOpenNotification = (notif: typeof notifications[0]) => {
    if (!readNotificationIds.includes(notif.id)) {
      setReadNotificationIds(prev => [...prev, notif.id]);
    }
    setActiveTab(notif.targetTab);
    setNotificationOpen(false);
  };

  const menuItems: Array<{
    id: AppWindowId;
    title: string;
    shortTitle: string;
    subTitle: string;
    icon: any;
    badge?: string;
    iconBg: string;
    iconColor: string;
    badgeColor: string;
  }> = [
    {
      id: 'THU_VIEN_HSTL',
      title: 'Thư Viện Tổng Hợp',
      shortTitle: 'Thư viện',
      subTitle: 'Tra cứu HSTL & Sơ đồ kho số',
      icon: Layers,
      badge: 'Kho Số',
      iconBg: 'bg-indigo-50 border border-indigo-200 group-hover:bg-indigo-100',
      iconColor: 'text-indigo-600 group-hover:text-indigo-700',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200'
    },
    {
      id: 'LUONG_1',
      title: 'Cập Nhật Hồ Sơ',
      shortTitle: 'Cập nhật',
      subTitle: 'Thẩm định & Phân quyền HSTL',
      icon: FolderArchive,
      badge: unreadCount > 0 && (currentUser.role === 'TRUONG_PHONG' || currentUser.role === 'ADMIN') ? `${unreadCount} Chờ` : 'HSTL',
      iconBg: 'bg-blue-50 border border-blue-200 group-hover:bg-blue-100',
      iconColor: 'text-blue-600 group-hover:text-blue-700',
      badgeColor: unreadCount > 0 && (currentUser.role === 'TRUONG_PHONG' || currentUser.role === 'ADMIN') 
        ? 'bg-amber-100 text-amber-900 border-amber-300 font-extrabold animate-pulse'
        : 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      id: 'LUONG_2',
      title: 'Soạn Thảo & Báo Cáo',
      shortTitle: 'Soạn thảo',
      subTitle: 'Lập hồ sơ công việc & Trình ký',
      icon: FileSignature,
      badge: 'HSCV',
      iconBg: 'bg-purple-50 border border-purple-200 group-hover:bg-purple-100',
      iconColor: 'text-purple-600 group-hover:text-purple-700',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200'
    },
    {
      id: 'LUONG_3',
      title: 'Sổ Văn Bản Đến',
      shortTitle: 'VB Đến',
      subTitle: 'Tiếp nhận & OCR bóc tách số đến',
      icon: Inbox,
      badge: 'Số đến',
      iconBg: 'bg-emerald-50 border border-emerald-200 group-hover:bg-emerald-100',
      iconColor: 'text-emerald-600 group-hover:text-emerald-700',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    {
      id: 'LUONG_4',
      title: 'Sổ Văn Bản Đi',
      shortTitle: 'VB Đi',
      subTitle: 'Cập nhật & lưu trữ Thư viện HSTL',
      icon: Send,
      badge: 'Lưu HSTL',
      iconBg: 'bg-rose-50 border border-rose-200 group-hover:bg-rose-100',
      iconColor: 'text-rose-600 group-hover:text-rose-700',
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200'
    }
  ];

  return (
    <div className="relative w-screen h-[100dvh] overflow-hidden bg-[#f1f5f9] flex flex-col font-sans">
      {/* Top Corporate Blue Header */}
      <header className="relative z-30 bg-gradient-to-r from-[#003882] via-[#094ba1] to-[#002f70] text-white px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between shadow-md border-b border-blue-400/20 shrink-0">
        {/* Left: Mobile Drawer Button + Tên công ty & Tiêu đề phần mềm */}
        <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
          {/* Hamburger toggle on mobile */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 text-white md:hidden transition cursor-pointer shrink-0"
            aria-label="Mở danh mục nghiệp vụ"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center font-black text-white text-sm sm:text-base shadow-inner shrink-0">
            DS
          </div>
          <div className="min-w-0">
            <h1 className="text-xs sm:text-base font-extrabold uppercase tracking-wide text-white drop-shadow-xs leading-snug truncate">
              {branding.agencyName}
            </h1>
            <p className="text-[10px] sm:text-xs text-blue-100 font-semibold tracking-normal leading-tight truncate">
              {branding.softwareName}
            </p>
          </div>
        </div>

        {/* Right: Chuông thông báo Trưởng phòng & Thông tin tài khoản */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* 🔔 Notification Bell Button with Badge */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotificationOpen(!notificationOpen)}
              className="relative p-2 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 text-white transition cursor-pointer flex items-center justify-center"
              title="Thông báo hồ sơ mới & yêu cầu xử lý"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4.5 min-w-4.5 px-1 items-center justify-center rounded-full bg-rose-500 text-white text-[10px] font-black border-2 border-[#003882] shadow-sm animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Panel */}
            {notificationOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 text-slate-800 overflow-hidden animate-fadeIn">
                <div className="p-3.5 bg-gradient-to-r from-[#003882] to-[#094ba1] text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-amber-300" />
                    <span className="font-bold text-xs sm:text-sm">Thông Báo Nghiệp Vụ</span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-500 text-[10px] font-bold">
                        {unreadCount} mới
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[10px] text-blue-100 hover:text-white underline cursor-pointer"
                    >
                      Đọc tất cả
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-gray-400 text-xs">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1 opacity-80" />
                      <div>Không có thông báo hoặc hồ sơ mới nào cần xử lý.</div>
                    </div>
                  ) : (
                    notifications.map((notif) => {
                      const isUnread = !readNotificationIds.includes(notif.id);
                      return (
                        <div
                          key={notif.id}
                          onClick={() => handleOpenNotification(notif)}
                          className={`p-3.5 transition cursor-pointer hover:bg-blue-50/60 ${
                            isUnread ? 'bg-amber-50/40' : 'bg-white'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              {/* Security Dot */}
                              {notif.securityLevel === 'MẬT' ? (
                                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0" title="Tài liệu Mật"></span>
                              ) : (
                                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Tài liệu Thường"></span>
                              )}
                              <span className="text-xs font-bold text-slate-900 leading-tight">
                                {notif.code}
                              </span>
                            </div>
                            <span className="text-[10px] text-gray-400 whitespace-nowrap">{notif.time}</span>
                          </div>

                          <div className="text-[11px] font-medium text-slate-700 mt-1 line-clamp-2 leading-snug">
                            {notif.title}: {notif.summary}
                          </div>

                          <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-gray-100 text-[10px]">
                            <span className="text-gray-500 truncate max-w-[180px]">
                              Từ: <strong>{notif.sender}</strong> ({notif.senderDept})
                            </span>
                            <span className="text-blue-700 font-bold hover:underline flex items-center gap-0.5">
                              Xử lý ngay <ChevronRight className="w-3 h-3" />
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="p-2 bg-gray-50 border-t border-gray-100 text-center">
                  <span className="text-[10px] text-gray-500">
                    Vai trò hiện tại: <strong>{currentUser.roleTitle}</strong>
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* User Profile & Switcher */}
          <div className="flex items-center gap-1.5 bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 rounded-full sm:rounded-lg p-0.5 sm:px-2 sm:py-1 transition shadow-xs">
            {currentUser.avatar ? (
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name} 
                className="w-7 h-7 sm:w-5.5 sm:h-5.5 rounded-full object-cover border border-white/60 shadow-xs shrink-0"
              />
            ) : (
              <div className="w-7 h-7 sm:w-5.5 sm:h-5.5 rounded-full bg-white text-blue-900 font-bold text-xs sm:text-[10px] flex items-center justify-center border border-white/60 shadow-xs shrink-0">
                {currentUser.name.charAt(0)}
              </div>
            )}
            
            <div className="text-left hidden sm:block">
              <div className="text-[10px] sm:text-[11px] font-semibold text-white leading-tight truncate max-w-[110px] lg:max-w-[150px]">
                {currentUser.name}
              </div>
              <div className="text-[8px] sm:text-[9px] text-blue-200 font-normal leading-none mt-0.5 flex items-center gap-0.5 truncate max-w-[110px] lg:max-w-[150px]">
                <span>{currentUser.roleTitle}</span>
              </div>
            </div>

            {/* Switch User Helper */}
            <div className="border-l border-white/20 pl-1 ml-0.5 hidden sm:block">
              <select
                value={currentUser.id}
                onChange={(e) => {
                  const u = allUsers.find(user => user.id === e.target.value);
                  if (u) {
                    setCurrentUser(u);
                    StorageService.setCurrentUser(u);
                  }
                }}
                className="bg-white/20 hover:bg-white/30 text-[8px] sm:text-[9px] text-white font-medium rounded px-1 py-0.5 border border-white/30 focus:outline-none cursor-pointer transition shadow-xs max-w-[80px] sm:max-w-none"
                title="Chuyển đổi vai trò người dùng thử nghiệm"
              >
                {allUsers.map((u) => (
                  <option key={u.id} value={u.id} className="text-slate-900 bg-white font-medium text-xs">
                    {u.role === 'ADMIN' ? '🛡️ [ADMIN]' : u.roleTitle.split('-')[0]} ({u.name.split(' ').pop()})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Body: Desktop Left Sidebar Navigation + Right Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Desktop Left Sidebar (Visible on md+) */}
        <aside className="hidden md:flex w-64 lg:w-72 bg-white border-r border-gray-200/90 flex-col justify-between shadow-xs shrink-0 z-10">
          {/* Menu Items List */}
          <div className="p-3.5 space-y-2 overflow-y-auto">
            <div className="px-3 pt-1 pb-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Danh Mục Nghiệp Vụ</span>
              <span className="text-[9px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded-full font-mono">5 Mục</span>
            </div>

            <div className="space-y-1.5">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer group relative ${
                      isActive
                        ? 'bg-gradient-to-r from-[#003882] via-[#094ba1] to-[#0a58ca] text-white font-bold shadow-md shadow-blue-900/20'
                        : 'text-slate-700 hover:bg-slate-50/80 hover:text-blue-900 border border-transparent hover:border-gray-200/60'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`p-2 rounded-xl transition-all shrink-0 ${
                        isActive 
                          ? 'bg-white/20 text-white shadow-inner border border-white/30 backdrop-blur-xs' 
                          : `${item.iconBg} ${item.iconColor} shadow-2xs`
                      }`}>
                        <Icon className="w-4 h-4 shrink-0 stroke-[2.2]" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold truncate leading-tight">{item.title}</span>
                        </div>
                        <div className={`text-[10px] truncate leading-tight mt-0.5 ${
                          isActive ? 'text-blue-100 font-medium' : 'text-slate-400 group-hover:text-slate-500'
                        }`}>
                          {item.subTitle}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 ml-1.5">
                      {item.badge && (
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold tracking-tight ${
                          isActive 
                            ? 'bg-white/20 text-white border border-white/20' 
                            : `${item.badgeColor} border`
                        }`}>
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                        isActive ? 'text-white translate-x-0.5' : 'text-gray-300 opacity-0 group-hover:opacity-100 group-hover:text-slate-500'
                      }`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom of Sidebar: Cài đặt hệ thống */}
          <div className="p-3.5 border-t border-gray-200 bg-gray-50/80 space-y-2">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-white hover:bg-blue-50/80 border border-gray-200 hover:border-blue-300 text-slate-700 hover:text-blue-800 transition cursor-pointer shadow-xs group"
            >
              <div className="p-2 rounded-xl bg-slate-100 group-hover:bg-blue-100 text-slate-600 group-hover:text-blue-700 border border-slate-200/80 transition">
                <SlidersHorizontal className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div className="text-left min-w-0">
                <div className="text-xs font-bold text-slate-900 group-hover:text-blue-800">
                  Cài Đặt &amp; Quản Trị
                </div>
                <div className="text-[10px] text-gray-500 font-medium truncate">
                  Phòng ban, Đơn vị, Tài khoản
                </div>
              </div>
            </button>

            <div className="px-2 py-0.5 flex items-center justify-between text-[10px] text-gray-400 font-medium">
              <span>Hệ thống: Trực tuyến</span>
              <span className="flex items-center gap-1 text-emerald-600 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Sẵn sàng
              </span>
            </div>
          </div>
        </aside>

        {/* Mobile Slide-Over Drawer Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden flex">
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fadeIn"
              onClick={() => setMobileMenuOpen(false)}
            />

            <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col justify-between z-50 animate-slideRight">
              <div className="p-4 bg-gradient-to-r from-[#003882] to-[#094ba1] text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center font-black text-xs">
                    DS
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase">{branding.agencyName}</div>
                    <div className="text-[10px] text-blue-200">Danh Mục Nghiệp Vụ Hồ Sơ</div>
                  </div>
                </div>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/20 text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3 space-y-2 overflow-y-auto flex-1">
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Chọn Nghiệp Vụ
                </div>
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition cursor-pointer ${
                        isActive
                          ? 'bg-gradient-to-r from-[#003882] to-[#094ba1] text-white font-bold shadow-md'
                          : 'text-slate-700 hover:bg-blue-50 active:bg-blue-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className={`p-2 rounded-xl shrink-0 ${
                          isActive 
                            ? 'bg-white/20 text-white shadow-inner' 
                            : `${item.iconBg} ${item.iconColor}`
                        }`}>
                          <Icon className="w-4 h-4 stroke-[2.2]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold truncate">{item.title}</div>
                          <div className={`text-[10px] truncate ${isActive ? 'text-blue-100 font-medium' : 'text-gray-400'}`}>
                            {item.subTitle}
                          </div>
                        </div>
                      </div>
                      {item.badge && (
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold shrink-0 ml-1.5 ${
                          isActive ? 'bg-white/20 text-white' : `${item.badgeColor} border`
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="p-3 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => {
                    setIsSettingsOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-gray-200 text-slate-800 text-xs font-bold hover:bg-blue-50 transition shadow-2xs"
                >
                  <SlidersHorizontal className="w-4 h-4 text-blue-700" />
                  Cài Đặt &amp; Quản Trị Hệ Thống
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Right Main Content Workspace */}
        <main className="flex-1 overflow-y-auto bg-[#f8fafc] relative">
          <div className="p-3 sm:p-4 md:p-6 pb-20 md:pb-6 max-w-7xl mx-auto">
            {activeTab === 'THU_VIEN_HSTL' && (
              <ThuVienTongHopModule
                currentUser={currentUser}
                onOpenViewer={(d, kw, tab) => {
                  setViewerItem(d);
                  setViewerSearchKeyword(kw || '');
                  setViewerInitialTab(tab);
                }}
              />
            )}
            {activeTab === 'LUONG_1' && (
              <Luong1Module
                currentUser={currentUser}
                onOpenViewer={(d, kw, tab) => {
                  setViewerItem(d);
                  setViewerSearchKeyword(kw || '');
                  setViewerInitialTab(tab);
                }}
              />
            )}
            {activeTab === 'LUONG_2' && (
              <Luong2Module
                currentUser={currentUser}
                onOpenViewer={(d, kw, tab) => {
                  setViewerItem(d);
                  setViewerSearchKeyword(kw || '');
                  setViewerInitialTab(tab);
                }}
              />
            )}
            {activeTab === 'LUONG_3' && (
              <Luong3Module
                currentUser={currentUser}
                onOpenViewer={(d, kw, tab) => {
                  setViewerItem(d);
                  setViewerSearchKeyword(kw || '');
                  setViewerInitialTab(tab);
                }}
              />
            )}
            {activeTab === 'LUONG_4' && (
              <Luong4Module
                currentUser={currentUser}
                onOpenViewer={(d, kw, tab) => {
                  setViewerItem(d);
                  setViewerSearchKeyword(kw || '');
                  setViewerInitialTab(tab);
                }}
              />
            )}
          </div>
        </main>
      </div>

      {/* Mobile Ergonomic Bottom Navigation Bar (Visible on mobile screens < md) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg px-1.5 py-1.5 flex justify-around items-center pb-safe">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition cursor-pointer min-h-[44px] ${
                isActive
                  ? 'text-blue-700 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className={`p-1 rounded-lg transition-transform ${
                isActive ? 'bg-blue-100 scale-110' : ''
              }`}>
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-700' : 'text-slate-500'}`} />
              </div>
              <span className={`text-[10px] mt-0.5 tracking-tighter truncate max-w-[64px] ${
                isActive ? 'font-bold text-blue-800' : 'font-medium'
              }`}>
                {item.shortTitle}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Global Modals */}
      <SettingsPersonalizationModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        branding={branding}
        onUpdateBranding={setBranding}
        currentUser={currentUser}
        onSwitchUser={setCurrentUser}
      />

      <DocumentViewerModal
        isOpen={!!viewerItem}
        onClose={() => {
          setViewerItem(null);
          setViewerInitialTab(undefined);
        }}
        document={viewerItem}
        docType="HSTL"
        currentUser={currentUser}
        searchKeyword={viewerSearchKeyword}
        initialTab={viewerInitialTab}
        onDocumentUpdated={(updated) => {
          setViewerItem(updated);
          refreshData();
        }}
      />
    </div>
  );
};
