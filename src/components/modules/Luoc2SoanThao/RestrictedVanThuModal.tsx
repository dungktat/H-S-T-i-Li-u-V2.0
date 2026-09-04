import React from 'react';
import { Lock, ShieldAlert, UserCheck, X, ArrowRight } from 'lucide-react';
import { UserProfile } from '../../../types';
import { StorageService } from '../../../services/storageService';
import { SAMPLE_USERS } from '../../../data/initialData';

interface RestrictedVanThuModalProps {
  currentUser: UserProfile;
  onClose: () => void;
  onSwitchedToVanThu?: () => void;
  customMessage?: string;
}

export const RestrictedVanThuModal: React.FC<RestrictedVanThuModalProps> = ({
  currentUser,
  onClose,
  onSwitchedToVanThu,
  customMessage
}) => {
  const handleSwitchAccount = () => {
    const users = StorageService.getUsers();
    const vanThu = users.find(u => u.role === 'VAN_THU') || SAMPLE_USERS.find(u => u.role === 'VAN_THU');
    if (vanThu) {
      StorageService.setCurrentUser(vanThu);
      if (onSwitchedToVanThu) {
        onSwitchedToVanThu();
      }
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border-2 border-red-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden text-slate-800 animate-scaleUp">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-red-700 to-rose-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">
                Quy Định Phân Quyền Thư Viện HSTL
              </h3>
              <p className="text-xs text-rose-100 font-medium">
                Chỉ cán bộ Văn thư được phép nhập hồ sơ tài liệu
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-rose-900 text-sm">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Cảnh Báo Thẩm Quyền Lưu Trữ:</span>
            </div>
            <p className="text-slate-800 leading-relaxed font-medium">
              {customMessage || 'Tất cả việc nhập bất kể một tài liệu nào vào Thư viện HSTL chỉ văn thư được phép thực hiện. Sau khi tài liệu được in ra và có chữ ký đóng dấu thì theo yêu cầu của lãnh đạo trưởng phòng yêu cầu văn thư đưa vào Thư viện HSTL để lưu trữ.'}
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-700 space-y-1.5">
            <div>
              Tài khoản hiện tại của bạn: <strong>{currentUser.name}</strong> ({currentUser.roleTitle})
            </div>
            <div className="text-[11px] text-slate-500">
              * Chuyên viên và Trưởng phòng hoàn tất giai đoạn soạn thảo, in ấn, xin chữ ký mộc đỏ và nộp báo cáo. Sau đó, Trưởng phòng phát lệnh bàn giao hồ sơ giấy cho Văn thư.
            </div>
          </div>

          {/* Quick switch button for demo */}
          <div className="pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={handleSwitchAccount}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 shadow-md transition cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              <span>Chuyển sang tài khoản Văn thư (Lê Hoàng Yến)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-center text-[10px] text-gray-500 mt-1.5">
              (Nhấn vào đây để chuyển role ngay và thực hiện thao tác nhập kho HSTL)
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-gray-600 hover:text-slate-900 cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
