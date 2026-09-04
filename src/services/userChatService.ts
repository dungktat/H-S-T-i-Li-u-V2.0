import { UserChatMessage, UserProfile, AttachedDocumentRef } from '../types';
import { SAMPLE_USERS } from '../data/initialData';
import { StorageService } from './storageService';

const CHAT_STORAGE_KEY = 'hstl_user_chat_messages';
export const GENERAL_CHANNEL_ID = 'GENERAL_CHANNEL';

const INITIAL_MESSAGES: UserChatMessage[] = [
  {
    id: 'msg-seed-1',
    senderId: 'user_tp_1',
    senderName: 'Trần Thị Thu Hương',
    senderRole: 'Trưởng phòng Quản lý Hồ sơ & Thẩm định',
    senderDepartment: 'Ban Kỹ thuật - Hạ tầng Cơ sở',
    senderAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    receiverId: 'user_cv_1',
    content: 'Đồng chí Cường kiểm tra lại hồ sơ số 842/QĐ-ĐS và hồ sơ sửa chữa tuyến Hà Nội - Hải Phòng nhé, cần bổ sung biên bản nghiệm thu trước 16h chiều nay.',
    timestamp: '08:30',
    createdAt: Date.now() - 3600000 * 4,
    isRead: true,
    attachedDoc: {
      id: 'hstl-ex-001',
      code: '842/QĐ-ĐS',
      title: 'Quyết định phê duyệt dự án cải tạo đường sắt khu vực phía Bắc',
      loaiVanBan: 'Quyết định',
      category: 'HSTL'
    }
  },
  {
    id: 'msg-seed-2',
    senderId: 'user_cv_1',
    senderName: 'Nguyễn Văn Cường',
    senderRole: 'Chuyên viên Kỹ thuật & Dự án',
    senderDepartment: 'Ban Kỹ thuật - Hạ tầng Cơ sở',
    senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    receiverId: 'user_tp_1',
    content: 'Dạ báo cáo Trưởng phòng, em đã cập nhật đầy đủ biên bản nghiệm thu và scan lại bản có dấu đỏ vào Thư viện HSTL rồi ạ.',
    timestamp: '09:15',
    createdAt: Date.now() - 3600000 * 3,
    isRead: true
  },
  {
    id: 'msg-seed-3',
    senderId: 'user_gd_1',
    senderName: 'Đặng Sỹ Mạnh',
    senderRole: 'Tổng Giám Đốc',
    senderDepartment: 'Ban Tổng Giám Đốc',
    senderAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=120&auto=format&fit=crop&q=80',
    receiverId: GENERAL_CHANNEL_ID,
    content: 'Yêu cầu các Ban chuyên môn khẩn trương rà soát toàn bộ hồ sơ kỹ thuật an toàn chạy tàu quý 3/2026 và số hóa 100% vào hệ thống HSTL.',
    timestamp: '07:45',
    createdAt: Date.now() - 3600000 * 6,
    isRead: false
  },
  {
    id: 'msg-seed-4',
    senderId: 'user_vt_1',
    senderName: 'Phạm Thị Dung',
    senderRole: 'Văn thư Tổng công ty',
    senderDepartment: 'Văn phòng Tổng công ty',
    senderAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
    receiverId: 'user_cv_1',
    content: 'Chào anh Cường, hồ sơ dự thảo HSCV-2026-089 đã được phê duyệt in bản giấy, anh mang qua bàn văn thư để đóng dấu số đến/số đi nhé.',
    timestamp: '10:05',
    createdAt: Date.now() - 3600000,
    isRead: false,
    attachedDoc: {
      id: 'draft-001',
      code: 'HSCV-2026-089',
      title: 'Dự thảo Kế hoạch Nâng cấp Hệ thống Tín hiệu & Đóng đường Tự động Tuyến Bắc - Nam',
      loaiVanBan: 'Kế hoạch',
      category: 'DRAFT'
    }
  }
];

export class UserChatService {
  static getAllMessages(): UserChatMessage[] {
    try {
      const data = localStorage.getItem(CHAT_STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_MESSAGES;
  }

  static saveAllMessages(messages: UserChatMessage[]): void {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    window.dispatchEvent(new CustomEvent('hstl_user_chat_update'));
  }

  /**
   * Get direct conversation messages between 2 users or in General channel
   */
  static getMessages(currentUserId: string, targetId: string): UserChatMessage[] {
    const all = this.getAllMessages();
    if (targetId === GENERAL_CHANNEL_ID) {
      return all.filter(m => m.receiverId === GENERAL_CHANNEL_ID);
    }
    return all.filter(
      m => (m.senderId === currentUserId && m.receiverId === targetId) ||
           (m.senderId === targetId && m.receiverId === currentUserId)
    ).sort((a, b) => a.createdAt - b.createdAt);
  }

  /**
   * Send a new message
   */
  static sendMessage(params: {
    sender: UserProfile;
    receiverId: string;
    content: string;
    attachedDoc?: AttachedDocumentRef;
  }): UserChatMessage {
    const all = this.getAllMessages();
    const newMsg: UserChatMessage = {
      id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      senderId: params.sender.id,
      senderName: params.sender.name,
      senderRole: params.sender.roleTitle || params.sender.role,
      senderDepartment: params.sender.department,
      senderAvatar: params.sender.avatar,
      receiverId: params.receiverId,
      content: params.content.trim(),
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      createdAt: Date.now(),
      isRead: false,
      attachedDoc: params.attachedDoc
    };

    all.push(newMsg);
    this.saveAllMessages(all);
    return newMsg;
  }

  /**
   * Mark messages as read from a sender
   */
  static markAsRead(currentUserId: string, senderId: string): void {
    const all = this.getAllMessages();
    let changed = false;
    all.forEach(m => {
      if (m.receiverId === currentUserId && m.senderId === senderId && !m.isRead) {
        m.isRead = true;
        changed = true;
      }
      if (senderId === GENERAL_CHANNEL_ID && m.receiverId === GENERAL_CHANNEL_ID && !m.isRead) {
        m.isRead = true;
        changed = true;
      }
    });
    if (changed) {
      this.saveAllMessages(all);
    }
  }

  /**
   * Total unread messages for current user
   */
  static getUnreadCount(currentUserId: string): number {
    const all = this.getAllMessages();
    return all.filter(
      m => (m.receiverId === currentUserId || m.receiverId === GENERAL_CHANNEL_ID) && 
           m.senderId !== currentUserId && 
           !m.isRead
    ).length;
  }

  /**
   * List all conversations with summary
   */
  static getConversations(currentUserId: string, allUsers: UserProfile[]): Array<{
    targetId: string;
    isChannel: boolean;
    name: string;
    title: string;
    avatar?: string;
    department?: string;
    lastMessage?: UserChatMessage;
    unreadCount: number;
    isOnline: boolean;
  }> {
    const allMessages = this.getAllMessages();
    const list: any[] = [];

    // 1. Kênh Chung Toàn Cơ Quan
    const generalMessages = allMessages
      .filter(m => m.receiverId === GENERAL_CHANNEL_ID)
      .sort((a, b) => b.createdAt - a.createdAt);
    const generalUnread = generalMessages.filter(m => m.senderId !== currentUserId && !m.isRead).length;

    list.push({
      targetId: GENERAL_CHANNEL_ID,
      isChannel: true,
      name: 'Kênh Thông Tin Chung VNR',
      title: 'Toàn cơ quan Tổng công ty',
      department: 'Ban Tổng Giám Đốc',
      lastMessage: generalMessages[0],
      unreadCount: generalUnread,
      isOnline: true
    });

    // 2. Từng người dùng
    allUsers.filter(u => u.id !== currentUserId).forEach(u => {
      const userMsgs = allMessages.filter(
        m => (m.senderId === currentUserId && m.receiverId === u.id) ||
             (m.senderId === u.id && m.receiverId === currentUserId)
      ).sort((a, b) => b.createdAt - a.createdAt);

      const unread = userMsgs.filter(m => m.senderId === u.id && !m.isRead).length;

      list.push({
        targetId: u.id,
        isChannel: false,
        name: u.name,
        title: u.roleTitle || u.role,
        avatar: u.avatar,
        department: u.department,
        lastMessage: userMsgs[0],
        unreadCount: unread,
        isOnline: true // All users active in prototype
      });
    });

    // Sort by last message time
    return list.sort((a, b) => {
      const timeA = a.lastMessage?.createdAt || 0;
      const timeB = b.lastMessage?.createdAt || 0;
      return timeB - timeA;
    });
  }
}
