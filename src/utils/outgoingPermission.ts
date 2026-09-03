import { OutgoingDocument, UserProfile } from '../types';

export interface OutgoingAccessCheckResult {
  allowed: boolean;
  reason: string;
  isDirectUser: boolean;
  isDepartmentRecipient: boolean;
  isLeadership: boolean;
  allowedDepartments: string[];
  allowedUsers: string[];
}

/**
 * Kiểm tra quyền truy cập xem văn bản đi:
 * "Chỉ những người và đơn vị được chọn trong nơi nhận thì mới được xem tài liệu"
 * Văn thư và Admin hoặc người soạn thảo/ký văn bản luôn có quyền quản trị/xem.
 */
export function canUserAccessOutgoingDoc(
  doc: OutgoingDocument,
  user?: UserProfile | null
): OutgoingAccessCheckResult {
  if (!doc || !user) {
    return {
      allowed: false,
      reason: 'Chưa xác định thông tin người dùng hoặc văn bản',
      isDirectUser: false,
      isDepartmentRecipient: false,
      isLeadership: false,
      allowedDepartments: [],
      allowedUsers: []
    };
  }

  const allowedDepts = doc.noiNhanDepartments || [];
  const allowedUserIds = doc.noiNhanUserIds || [];
  const allowedUserNames = doc.noiNhanUserNames || [];

  // 1. Quản trị viên hệ thống có quyền xem toàn diện
  if (user.role === 'ADMIN') {
    return {
      allowed: true,
      reason: 'Quản trị viên hệ thống (Admin) có toàn quyền tra cứu & giám sát',
      isDirectUser: false,
      isDepartmentRecipient: false,
      isLeadership: false,
      allowedDepartments: allowedDepts,
      allowedUsers: allowedUserNames
    };
  }

  // 2. Cán bộ Văn thư quản lý sổ văn bản đi và người đăng ký văn bản
  if (user.role === 'VAN_THU' || doc.registeredBy === user.id) {
    return {
      allowed: true,
      reason: 'Cán bộ Văn thư quản lý nghiệp vụ Sổ Văn Bản Đi và lưu trữ',
      isDirectUser: false,
      isDepartmentRecipient: false,
      isLeadership: false,
      allowedDepartments: allowedDepts,
      allowedUsers: allowedUserNames
    };
  }

  // 3. Tác giả soạn thảo, chuyên viên tham mưu hoặc lãnh đạo đã ký duyệt
  if (
    (doc.chuyenVienSoanThao && doc.chuyenVienSoanThao.toLowerCase() === user.name.toLowerCase()) ||
    (doc.nguoiKy && doc.nguoiKy.toLowerCase() === user.name.toLowerCase()) ||
    (doc.donViSoanThao && user.department && doc.donViSoanThao === user.department)
  ) {
    return {
      allowed: true,
      reason: 'Cán bộ / Lãnh đạo thuộc đơn vị chủ trì soạn thảo và ký duyệt văn bản',
      isDirectUser: true,
      isDepartmentRecipient: false,
      isLeadership: user.role === 'LANH_DAO',
      allowedDepartments: allowedDepts,
      allowedUsers: allowedUserNames
    };
  }

  // 4. Kiểm tra xem cá nhân có được chỉ định đích danh trong Nơi nhận hay không (ID hoặc Tên)
  const isDirectlySelectedUser = 
    allowedUserIds.includes(user.id) ||
    allowedUserNames.some(name => 
      name.toLowerCase().includes(user.name.toLowerCase()) || 
      user.name.toLowerCase().includes(name.toLowerCase())
    );

  if (isDirectlySelectedUser) {
    return {
      allowed: true,
      reason: `Được đích danh chỉ định trong Nơi nhận cá nhân (${user.name})`,
      isDirectUser: true,
      isDepartmentRecipient: false,
      isLeadership: user.role === 'LANH_DAO',
      allowedDepartments: allowedDepts,
      allowedUsers: allowedUserNames
    };
  }

  // 5. Kiểm tra xem phòng ban của người dùng có nằm trong các Đơn vị nội bộ được chọn hay không
  const isUserDeptRecipient = 
    user.department && 
    allowedDepts.some(dept => dept.trim().toLowerCase() === user.department.trim().toLowerCase());

  if (isUserDeptRecipient) {
    return {
      allowed: true,
      reason: `Đơn vị công tác (${user.department}) thuộc danh sách phòng ban nơi nhận`,
      isDirectUser: false,
      isDepartmentRecipient: true,
      isLeadership: false,
      allowedDepartments: allowedDepts,
      allowedUsers: allowedUserNames
    };
  }

  // 6. Kiểm tra nếu trong chuỗi text nơi nhận có đề cập cụ thể phòng ban hoặc tên người dùng
  if (doc.noiNhan) {
    const noiNhanLower = doc.noiNhan.toLowerCase();
    if (user.department && noiNhanLower.includes(user.department.toLowerCase())) {
      return {
        allowed: true,
        reason: `Đơn vị công tác (${user.department}) được ghi nhận trong nơi nhận văn bản`,
        isDirectUser: false,
        isDepartmentRecipient: true,
        isLeadership: false,
        allowedDepartments: allowedDepts,
        allowedUsers: allowedUserNames
      };
    }
    if (noiNhanLower.includes(user.name.toLowerCase())) {
      return {
        allowed: true,
        reason: `Cá nhân (${user.name}) được ghi nhận trong nơi nhận văn bản`,
        isDirectUser: true,
        isDepartmentRecipient: false,
        isLeadership: user.role === 'LANH_DAO',
        allowedDepartments: allowedDepts,
        allowedUsers: allowedUserNames
      };
    }
  }

  // 7. Nếu văn bản không hề thiết lập danh sách hạn chế nào (cả phòng ban lẫn cá nhân đều rỗng)
  if (allowedDepts.length === 0 && allowedUserIds.length === 0) {
    return {
      allowed: true,
      reason: 'Văn bản phát hành chung nội bộ',
      isDirectUser: false,
      isDepartmentRecipient: false,
      isLeadership: false,
      allowedDepartments: [],
      allowedUsers: []
    };
  }

  // 8. Không thuộc phạm vi nơi nhận được chọn -> KHÔNG ĐƯỢC PHÉP XEM
  return {
    allowed: false,
    reason: `Văn bản đi này chỉ cấp quyền xem cho các cá nhân (${allowedUserNames.join(', ') || 'Chỉ định riêng'}) và các đơn vị (${allowedDepts.join(', ') || 'Chỉ định riêng'}). Tài khoản của bạn (${user.name} - ${user.department}) không thuộc nơi nhận.`,
    isDirectUser: false,
    isDepartmentRecipient: false,
    isLeadership: false,
    allowedDepartments: allowedDepts,
    allowedUsers: allowedUserNames
  };
}
