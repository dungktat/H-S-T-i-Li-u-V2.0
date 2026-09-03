import React from 'react';
import { UserRole } from '../../types';
import { Shield, UserCheck, FileText, Settings, Award } from 'lucide-react';

interface RoleBadgeProps {
  role: UserRole;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, showIcon = true, size = 'md' }) => {
  const getRoleConfig = () => {
    switch (role) {
      case 'LANH_DAO':
        return {
          label: 'Lãnh đạo cơ quan',
          bg: 'bg-rose-50 text-rose-800 border-rose-200 font-bold',
          icon: <Award className="w-3.5 h-3.5 mr-1 text-rose-600" />
        };
      case 'ADMIN':
        return {
          label: 'Quản trị viên (Admin)',
          bg: 'bg-purple-50 text-purple-700 border-purple-200 font-semibold',
          icon: <Settings className="w-3.5 h-3.5 mr-1 text-purple-600" />
        };
      case 'TRUONG_PHONG':
        return {
          label: 'Trưởng phòng',
          bg: 'bg-amber-50 text-amber-800 border-amber-200 font-semibold',
          icon: <Shield className="w-3.5 h-3.5 mr-1 text-amber-600" />
        };
      case 'VAN_THU':
        return {
          label: 'Văn thư HSTL',
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold',
          icon: <UserCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
        };
      case 'CHUYEN_VIEN':
      default:
        return {
          label: 'Chuyên viên',
          bg: 'bg-blue-50 text-blue-700 border-blue-200 font-semibold',
          icon: <FileText className="w-3.5 h-3.5 mr-1 text-blue-600" />
        };
    }
  };

  const config = getRoleConfig();
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : size === 'lg' ? 'text-sm px-3 py-1 font-bold' : 'text-xs px-2.5 py-1 font-semibold';

  return (
    <span className={`inline-flex items-center rounded-full border shadow-xs ${config.bg} ${sizeClass}`}>
      {showIcon && config.icon}
      {config.label}
    </span>
  );
};
