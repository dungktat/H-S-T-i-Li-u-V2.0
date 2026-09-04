import React, { useState, useEffect, useRef } from 'react';
import { 
  UserProfile, 
  AIChatMessage, 
  MatchedDocumentItem, 
  UserChatMessage, 
  AttachedDocumentRef,
  OllamaServerConfig
} from '../../types';
import { OllamaQwenService } from '../../services/ollamaQwenService';
import { UserChatService, GENERAL_CHANNEL_ID } from '../../services/userChatService';
import { StorageService } from '../../services/storageService';
import { OllamaServerConfigModal } from './OllamaServerConfigModal';
import { AttachDocumentModal } from './AttachDocumentModal';
import { 
  Bot, 
  MessageSquare, 
  Search, 
  Send, 
  Paperclip, 
  Sparkles, 
  Server, 
  X, 
  ChevronRight, 
  ChevronLeft,
  CheckCheck, 
  Clock, 
  FolderArchive, 
  FileSignature, 
  Inbox, 
  Send as SendIcon, 
  Eye, 
  ExternalLink, 
  Users, 
  HelpCircle, 
  RotateCcw,
  Zap,
  Activity,
  Layers,
  ArrowUpRight,
  Maximize2,
  Minimize2,
  Settings
} from 'lucide-react';

interface UnifiedChatbotAndMessengerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  allUsers: UserProfile[];
  initialTab?: 'AI_CHAT' | 'USER_CHAT';
  onOpenViewer: (doc: any, searchKeyword?: string, initialTab?: any) => void;
}

const QUICK_SEARCH_CHIPS = [
  'Tìm Quyết định 842/QĐ-ĐS',
  'Hồ sơ bảo dưỡng đường sắt',
  'Dự thảo Kế hoạch tín hiệu',
  'Tìm tài liệu Kệ K-01',
  'Văn bản đến mới nhất',
  'Báo cáo doanh thu vận tải'
];

const QUICK_CHAT_TEMPLATES = [
  'Nhờ đồng chí kiểm tra giúp hồ sơ này nhé.',
  'Hồ sơ đã được phê duyệt, đồng chí xử lý bước tiếp theo.',
  'Đề nghị phối hợp cho ý kiến thẩm định trước 16h.',
  'Đã cập nhật bản scan có dấu đỏ vào Thư viện HSTL.'
];

export const UnifiedChatbotAndMessengerModal: React.FC<UnifiedChatbotAndMessengerModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  allUsers,
  initialTab = 'AI_CHAT',
  onOpenViewer
}) => {
  const [activeTab, setActiveTab] = useState<'AI_CHAT' | 'USER_CHAT'>(initialTab);
  const [isMaximized, setIsMaximized] = useState(false);

  // -------------------------------------------------------------
  // TAB 1: AI ASSISTANT (QWEN 2.5 OLLAMA / IIS)
  // -------------------------------------------------------------
  const [aiMessages, setAiMessages] = useState<AIChatMessage[]>([
    {
      id: 'ai-welcome',
      role: 'assistant',
      content: `Xin chào **${currentUser.name}**! Tôi là **Trợ lý AI Qwen 2.5** tích hợp trên máy chủ IIS (Ollama) của Tổng công ty Đường sắt Việt Nam.\n\nTôi có thể giúp bạn **tìm kiếm nhanh bất kỳ hồ sơ, tài liệu, quyết định, hợp đồng hay công văn** trên toàn hệ thống thư viện hồ sơ. Hãy nhập số ký hiệu hoặc từ khóa cần tra cứu!`,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'Qwen 2.5 (IIS / Ollama)'
    }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [ollamaConfig, setOllamaConfig] = useState<OllamaServerConfig>(() => OllamaQwenService.getConfig());
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const aiMessagesEndRef = useRef<HTMLDivElement>(null);

  // -------------------------------------------------------------
  // TAB 2: USER-TO-USER ONLINE CHAT
  // -------------------------------------------------------------
  const [activeRecipientId, setActiveRecipientId] = useState<string>(GENERAL_CHANNEL_ID);
  const [userChatInput, setUserChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<UserChatMessage[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [isAttachModalOpen, setIsAttachModalOpen] = useState(false);
  const [pendingAttachedDoc, setPendingAttachedDoc] = useState<AttachedDocumentRef | null>(null);
  const [mobileView, setMobileView] = useState<'CONTACTS' | 'CHAT'>('CHAT');
  const userMessagesEndRef = useRef<HTMLDivElement>(null);

  // Synchronize on open / initialTab change
  useEffect(() => {
    if (isOpen) {
      if (initialTab) setActiveTab(initialTab);
      setOllamaConfig(OllamaQwenService.getConfig());
      refreshChatData();
    }
  }, [isOpen, initialTab, currentUser.id]);

  // Refresh user chat data
  const refreshChatData = () => {
    const msgs = UserChatService.getMessages(currentUser.id, activeRecipientId);
    setChatMessages(msgs);
    const convs = UserChatService.getConversations(currentUser.id, allUsers);
    setConversations(convs);
    UserChatService.markAsRead(currentUser.id, activeRecipientId);
  };

  useEffect(() => {
    const handleChatUpdate = () => {
      refreshChatData();
    };
    const handleOllamaConfigUpdate = (e: any) => {
      if (e.detail) setOllamaConfig(e.detail);
    };

    window.addEventListener('hstl_user_chat_update', handleChatUpdate);
    window.addEventListener('hstl_ollama_config_changed', handleOllamaConfigUpdate);

    return () => {
      window.removeEventListener('hstl_user_chat_update', handleChatUpdate);
      window.removeEventListener('hstl_ollama_config_changed', handleOllamaConfigUpdate);
    };
  }, [currentUser.id, activeRecipientId, allUsers]);

  // Reload messages when recipient changes
  useEffect(() => {
    if (activeTab === 'USER_CHAT') {
      refreshChatData();
    }
  }, [activeRecipientId]);

  // Scroll to bottom when new AI message arrives
  useEffect(() => {
    if (activeTab === 'AI_CHAT') {
      aiMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [aiMessages, isAiThinking]);

  // Scroll to bottom when new user message arrives
  useEffect(() => {
    if (activeTab === 'USER_CHAT') {
      userMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  // Handle AI Chat Submit
  const handleSendAiMessage = async (queryText?: string) => {
    const text = (queryText || aiInput).trim();
    if (!text || isAiThinking) return;

    const userMsg: AIChatMessage = {
      id: 'msg-user-' + Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    setAiMessages(prev => [...prev, userMsg]);
    setAiInput('');
    setIsAiThinking(true);

    try {
      const response = await OllamaQwenService.queryQwen(text, aiMessages);
      const aiResponseMsg: AIChatMessage = {
        id: 'msg-ai-' + Date.now(),
        role: 'assistant',
        content: response.answer,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        matchedDocs: response.matchedDocs,
        modelUsed: response.modelUsed
      };
      setAiMessages(prev => [...prev, aiResponseMsg]);
    } catch (e: any) {
      setAiMessages(prev => [
        ...prev,
        {
          id: 'msg-ai-err-' + Date.now(),
          role: 'assistant',
          content: 'Rất tiếc, đã có lỗi xử lý truy vấn: ' + (e.message || 'Lỗi không xác định'),
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          modelUsed: 'Qwen 2.5'
        }
      ]);
    } finally {
      setIsAiThinking(false);
    }
  };

  // Handle User Chat Submit
  const handleSendUserMessage = () => {
    if ((!userChatInput.trim() && !pendingAttachedDoc)) return;

    UserChatService.sendMessage({
      sender: currentUser,
      receiverId: activeRecipientId,
      content: userChatInput.trim() || (pendingAttachedDoc ? `[Đã gửi hồ sơ đính kèm: ${pendingAttachedDoc.code}]` : ''),
      attachedDoc: pendingAttachedDoc || undefined
    });

    setUserChatInput('');
    setPendingAttachedDoc(null);
    refreshChatData();
  };

  if (!isOpen) return null;

  const totalUnreadUserChat = UserChatService.getUnreadCount(currentUser.id);
  const activeRecipient = allUsers.find(u => u.id === activeRecipientId);
  const isGeneralChannel = activeRecipientId === GENERAL_CHANNEL_ID;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-3 md:p-4 bg-black/65 backdrop-blur-xs animate-fadeIn">
      <div 
        className={`bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col transition-all duration-200 animate-scaleUp w-full ${
          isMaximized 
            ? 'fixed inset-0 z-50 h-full max-w-none rounded-none' 
            : 'h-[100dvh] sm:h-[86vh] sm:max-h-[840px] max-w-5xl rounded-none sm:rounded-2xl'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Navigation Bar with Corporate Style */}
        <div className="bg-gradient-to-r from-[#003882] via-[#094ba1] to-[#002f70] text-white px-2.5 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between shrink-0 shadow-md gap-1.5 sm:gap-2 min-w-0">
          {/* Left: Tab Switcher (AI Chatbot vs User Chat) */}
          <div className="flex items-center min-w-0 flex-1 sm:flex-none">
            <div className="flex items-center bg-black/25 p-0.5 sm:p-1 rounded-xl border border-white/15 backdrop-blur-xs max-w-full overflow-x-auto scrollbar-none">
              {/* Tab 1: AI Chatbot */}
              <button
                onClick={() => setActiveTab('AI_CHAT')}
                className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
                  activeTab === 'AI_CHAT'
                    ? 'bg-white text-blue-900 shadow-sm'
                    : 'text-blue-100 hover:text-white hover:bg-white/10'
                }`}
              >
                <Bot className="w-4 h-4 text-cyan-500 shrink-0" />
                <span className="truncate">AI Qwen 2.5</span>
                <span className="hidden lg:inline text-[11px] opacity-80 font-normal">
                  (Tìm Kiếm HSTL)
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-blue-100 text-blue-900 shrink-0">
                  IIS/Ollama
                </span>
              </button>

              {/* Tab 2: User Chat */}
              <button
                onClick={() => setActiveTab('USER_CHAT')}
                className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-bold transition cursor-pointer relative shrink-0 ${
                  activeTab === 'USER_CHAT'
                    ? 'bg-white text-blue-900 shadow-sm'
                    : 'text-blue-100 hover:text-white hover:bg-white/10'
                }`}
              >
                <MessageSquare className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="truncate">Tin Nhắn</span>
                <span className="hidden sm:inline">Trực Tuyến</span>
                {totalUnreadUserChat > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-rose-500 text-white animate-pulse shrink-0">
                    {totalUnreadUserChat}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Right: Server Status & Window Controls */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {activeTab === 'AI_CHAT' && (
              <button
                onClick={() => setIsConfigModalOpen(true)}
                className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 bg-white/15 hover:bg-white/25 rounded-lg text-xs font-semibold text-blue-100 hover:text-white border border-white/20 transition cursor-pointer shrink-0"
                title="Cấu hình máy chủ IIS & Ollama"
              >
                <div className={`w-2 h-2 rounded-full shrink-0 ${
                  ollamaConfig.status === 'CONNECTED' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-300'
                }`} />
                <span className="hidden md:inline">
                  {ollamaConfig.status === 'CONNECTED' ? 'IIS: Đã Kết Nối' : 'RAG Qwen 2.5'}
                </span>
                <Settings className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Maximize / Restore */}
            <button
              onClick={() => setIsMaximized(!isMaximized)}
              className="p-1.5 rounded-lg hover:bg-white/20 text-white cursor-pointer transition hidden sm:block shrink-0"
              title={isMaximized ? 'Thu nhỏ cửa sổ' : 'Phóng to cửa sổ'}
            >
              {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-rose-600 text-white cursor-pointer transition shrink-0"
              title="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 flex overflow-hidden min-h-0 min-w-0">
          {/* ========================================================= */}
          {/* TAB 1: AI CHATBOT & FAST DOCUMENT SEARCH                 */}
          {/* ========================================================= */}
          {activeTab === 'AI_CHAT' && (
            <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden min-h-0 min-w-0">
              {/* Messages Container */}
              <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3 sm:space-y-4 min-h-0">
                {aiMessages.map((msg) => (
                  <div 
                    key={msg.id}
                    className={`flex gap-3 max-w-3xl ${
                      msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                    }`}
                  >
                    {/* Avatar */}
                    {msg.role === 'user' ? (
                      <div className="w-8 h-8 rounded-full bg-blue-700 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                        {currentUser.name.charAt(0)}
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div className="space-y-2 min-w-0 max-w-[85%] sm:max-w-[75%]">
                      <div className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs break-words [overflow-wrap:anywhere] ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white rounded-tr-xs'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                      }`}>
                        {/* Markdown-style bullet formatting */}
                        <div className="whitespace-pre-line">
                          {msg.content}
                        </div>

                        {/* Model / Source Footer */}
                        {msg.modelUsed && (
                          <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                            <span className="flex items-center gap-1">
                              <Zap className="w-3 h-3 text-amber-500" />
                              {msg.modelUsed}
                            </span>
                            <span>{msg.timestamp}</span>
                          </div>
                        )}
                      </div>

                      {/* Matched Documents Cards (Interactive) */}
                      {msg.matchedDocs && msg.matchedDocs.length > 0 && (
                        <div className="space-y-2 animate-fadeIn pt-1">
                          <div className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                            <Search className="w-3.5 h-3.5 text-blue-600" />
                            <span>Tài liệu tìm thấy trong hệ thống ({msg.matchedDocs.length}):</span>
                          </div>

                          <div className="grid grid-cols-1 gap-2">
                            {msg.matchedDocs.map((doc) => (
                              <div
                                key={`${doc.category}-${doc.id}`}
                                className="p-3 bg-white hover:bg-blue-50/50 border border-slate-200 hover:border-blue-400 rounded-xl transition shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                              >
                                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                                  <div className={`p-2 rounded-lg shrink-0 ${
                                    doc.category === 'HSTL' ? 'bg-indigo-100 text-indigo-700' :
                                    doc.category === 'DRAFT' ? 'bg-purple-100 text-purple-700' :
                                    doc.category === 'INCOMING' ? 'bg-emerald-100 text-emerald-700' :
                                    'bg-rose-100 text-rose-700'
                                  }`}>
                                    {doc.category === 'HSTL' ? <FolderArchive className="w-4 h-4" /> :
                                     doc.category === 'DRAFT' ? <FileSignature className="w-4 h-4" /> :
                                     doc.category === 'INCOMING' ? <Inbox className="w-4 h-4" /> :
                                     <SendIcon className="w-4 h-4" />}
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-1.5">
                                      <span className="font-extrabold text-xs text-blue-900 group-hover:text-blue-700">
                                        {doc.code}
                                      </span>
                                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                        {doc.loaiVanBan}
                                      </span>
                                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold ${
                                        doc.category === 'HSTL' ? 'bg-indigo-50 text-indigo-700' :
                                        doc.category === 'DRAFT' ? 'bg-purple-50 text-purple-700' :
                                        doc.category === 'INCOMING' ? 'bg-emerald-50 text-emerald-700' :
                                        'bg-rose-50 text-rose-700'
                                      }`}>
                                        {doc.category === 'HSTL' ? 'Thư viện HSTL' :
                                         doc.category === 'DRAFT' ? 'Dự thảo Luồng 2' :
                                         doc.category === 'INCOMING' ? 'Văn bản Đến' : 'Văn bản Đi'}
                                      </span>
                                    </div>

                                    <div className="text-xs font-medium text-slate-800 mt-1 line-clamp-2">
                                      {doc.title}
                                    </div>

                                    {doc.locationSummary && (
                                      <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                                        <Layers className="w-3 h-3 text-slate-400 shrink-0" />
                                        <span className="truncate">{doc.locationSummary}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="shrink-0 flex items-center gap-1.5 self-end sm:self-center">
                                  <button
                                    onClick={() => onOpenViewer(doc.rawDoc, doc.code)}
                                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer transition"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>Xem tài liệu</span>
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isAiThinking && (
                  <div className="flex items-center gap-3 mr-auto">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 animate-spin" />
                    </div>
                    <div className="p-3 bg-white border border-slate-200 rounded-2xl rounded-tl-xs text-xs text-slate-600 flex items-center gap-2 shadow-xs">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                        <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                      </div>
                      <span className="font-semibold text-slate-700">
                        Qwen 2.5 đang quét cơ sở dữ liệu HSTL &amp; tổng hợp phản hồi...
                      </span>
                    </div>
                  </div>
                )}

                <div ref={aiMessagesEndRef} />
              </div>

              {/* Quick Search Chips */}
              <div className="p-2 px-3 sm:px-4 bg-white border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto shrink-0 min-w-0 scrollbar-thin">
                <span className="text-[11px] font-bold text-slate-400 uppercase shrink-0">Gợi ý:</span>
                {QUICK_SEARCH_CHIPS.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendAiMessage(chip)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-800 border border-slate-200 hover:border-blue-300 rounded-full text-xs font-medium whitespace-nowrap cursor-pointer transition shrink-0"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* AI Chat Input Bar */}
              <div className="p-2.5 sm:p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0 min-w-0">
                <div className="relative flex-1 min-w-0">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSendAiMessage();
                    }}
                    placeholder="Nhập tên tài liệu, số ký hiệu hoặc câu hỏi tìm kiếm cho Qwen 2.5..."
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 focus:border-blue-500 focus:bg-white rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
                  />
                </div>

                <button
                  onClick={() => handleSendAiMessage()}
                  disabled={!aiInput.trim() || isAiThinking}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm disabled:opacity-40 cursor-pointer transition shrink-0"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Tra cứu</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: ONLINE USER-TO-USER MESSAGING                     */}
          {/* ========================================================= */}
          {activeTab === 'USER_CHAT' && (
            <div className="flex-1 flex overflow-hidden min-h-0 min-w-0">
              {/* Left Sidebar: Conversations & Contacts */}
              <div className={`w-full md:w-72 lg:w-80 bg-white border-r border-slate-200 flex flex-col shrink-0 min-h-0 min-w-0 ${
                mobileView === 'CHAT' ? 'hidden md:flex' : 'flex'
              }`}>
                {/* Search contact */}
                <div className="p-2.5 sm:p-3 border-b border-slate-200 shrink-0">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={userSearchTerm}
                      onChange={(e) => setUserSearchTerm(e.target.value)}
                      placeholder="Tìm đồng nghiệp, phòng ban..."
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Contacts List */}
                <div className="flex-1 overflow-y-auto divide-y divide-slate-100 min-h-0">
                  {conversations
                    .filter(c => {
                      if (!userSearchTerm.trim()) return true;
                      const q = userSearchTerm.toLowerCase();
                      return c.name.toLowerCase().includes(q) || (c.department && c.department.toLowerCase().includes(q));
                    })
                    .map((conv) => {
                      const isActive = activeRecipientId === conv.targetId;
                      return (
                        <div
                          key={conv.targetId}
                          onClick={() => {
                            setActiveRecipientId(conv.targetId);
                            setMobileView('CHAT');
                          }}
                          className={`p-2.5 sm:p-3 transition cursor-pointer flex items-center gap-3 ${
                            isActive
                              ? 'bg-blue-50/80 border-l-4 border-l-blue-600'
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="relative shrink-0">
                            {conv.isChannel ? (
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                                <Users className="w-4 h-4" />
                              </div>
                            ) : conv.avatar ? (
                              <img
                                src={conv.avatar}
                                alt={conv.name}
                                className="w-9 h-9 rounded-full object-cover border border-slate-200"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                                {conv.name.charAt(0)}
                              </div>
                            )}

                            {/* Online Dot */}
                            {conv.isOnline && (
                              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-900 truncate">
                                {conv.name}
                              </span>
                              {conv.lastMessage && (
                                <span className="text-[10px] text-slate-400 shrink-0 ml-1">
                                  {conv.lastMessage.timestamp}
                                </span>
                              )}
                            </div>

                            <div className="text-[11px] text-slate-500 truncate">
                              {conv.title}
                            </div>

                            {conv.lastMessage ? (
                              <div className="text-[11px] text-slate-600 truncate mt-0.5 font-medium">
                                {conv.lastMessage.content}
                              </div>
                            ) : (
                              <div className="text-[10px] text-slate-400 italic mt-0.5">
                                Chưa có tin nhắn
                              </div>
                            )}
                          </div>

                          {conv.unreadCount > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black shrink-0 animate-pulse">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Right Conversation Window */}
              <div className={`flex-1 flex flex-col bg-slate-50 overflow-hidden min-h-0 min-w-0 ${
                mobileView === 'CONTACTS' ? 'hidden md:flex' : 'flex'
              }`}>
                {/* Chat Header */}
                <div className="p-2.5 sm:p-3 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 shadow-2xs gap-2 min-w-0">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    {/* Back to contacts list on mobile */}
                    <button
                      onClick={() => setMobileView('CONTACTS')}
                      className="md:hidden p-1.5 -ml-1 rounded-lg hover:bg-slate-100 text-blue-700 flex items-center gap-0.5 text-xs font-bold shrink-0 cursor-pointer"
                      title="Quay lại danh bạ"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="text-[11px]">Danh bạ</span>
                    </button>

                    <div className="relative shrink-0">
                      {isGeneralChannel ? (
                        <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                          <Users className="w-4 h-4" />
                        </div>
                      ) : activeRecipient?.avatar ? (
                        <img
                          src={activeRecipient.avatar}
                          alt={activeRecipient.name}
                          className="w-8 h-8 rounded-full object-cover border"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                          {activeRecipient?.name?.charAt(0) || 'U'}
                        </div>
                      )}
                      <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-white" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                        {isGeneralChannel ? 'Kênh Thông Tin Chung VNR' : activeRecipient?.name}
                      </div>
                      <div className="text-[10px] sm:text-[11px] text-slate-500 truncate">
                        {isGeneralChannel ? 'Toàn bộ cán bộ, chuyên viên, lãnh đạo VNR' : `${activeRecipient?.roleTitle} • ${activeRecipient?.department}`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                      <span className="hidden sm:inline">Trực tuyến</span>
                    </span>
                  </div>
                </div>

                {/* Messages List */}
                <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3 min-h-0">
                  {chatMessages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs text-center p-6">
                      <MessageSquare className="w-10 h-10 text-slate-300 mb-2" />
                      <div className="font-semibold text-slate-600">Bắt đầu cuộc trao đổi trực tuyến</div>
                      <div className="text-[11px] text-slate-400 mt-1 max-w-xs">
                        Gửi tin nhắn hoặc đính kèm hồ sơ tài liệu từ hệ thống HSTL để làm việc cùng nhau.
                      </div>
                    </div>
                  ) : (
                    chatMessages.map((msg) => {
                      const isMe = msg.senderId === currentUser.id;
                      return (
                        <div
                          key={msg.id}
                          className={`flex gap-2.5 max-w-md sm:max-w-lg ${
                            isMe ? 'ml-auto flex-row-reverse' : 'mr-auto'
                          }`}
                        >
                          {!isMe && (
                            msg.senderAvatar ? (
                              <img
                                src={msg.senderAvatar}
                                alt={msg.senderName}
                                className="w-7 h-7 rounded-full object-cover shrink-0 mt-1 border"
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-slate-300 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 mt-1">
                                {msg.senderName.charAt(0)}
                              </div>
                            )
                          )}

                          <div className="space-y-1 min-w-0">
                            {!isMe && isGeneralChannel && (
                              <div className="text-[10px] font-bold text-slate-500 ml-1">
                                {msg.senderName} ({msg.senderDepartment})
                              </div>
                            )}

                            <div className={`p-3 rounded-2xl text-xs sm:text-sm shadow-2xs break-words [overflow-wrap:anywhere] ${
                              isMe
                                ? 'bg-blue-600 text-white rounded-tr-xs'
                                : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                            }`}>
                              <div className="whitespace-pre-line leading-relaxed break-words [overflow-wrap:anywhere]">
                                {msg.content}
                              </div>

                              {/* Attached Document Card in Message */}
                              {msg.attachedDoc && (
                                <div className={`mt-2 p-2.5 rounded-xl border flex items-center justify-between gap-2 transition ${
                                  isMe 
                                    ? 'bg-blue-700/60 border-blue-500 text-white' 
                                    : 'bg-slate-50 border-slate-200 text-slate-800'
                                }`}>
                                  <div className="flex items-center gap-2 min-w-0">
                                    <div className="p-1.5 rounded-lg bg-white/20 text-current">
                                      <FolderArchive className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="min-w-0">
                                      <div className="font-extrabold text-[11px] truncate">
                                        {msg.attachedDoc.code}
                                      </div>
                                      <div className="text-[10px] opacity-90 truncate max-w-[200px]">
                                        {msg.attachedDoc.title}
                                      </div>
                                    </div>
                                  </div>

                                  <button
                                    onClick={() => onOpenViewer(msg.attachedDoc?.rawDoc, msg.attachedDoc?.code)}
                                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold shrink-0 transition flex items-center gap-1 cursor-pointer ${
                                      isMe
                                        ? 'bg-white text-blue-900 hover:bg-blue-50'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                                  >
                                    <Eye className="w-3 h-3" />
                                    <span>Mở</span>
                                  </button>
                                </div>
                              )}
                            </div>

                            <div className={`text-[10px] text-slate-400 flex items-center gap-1 px-1 ${
                              isMe ? 'justify-end' : 'justify-start'
                            }`}>
                              <span>{msg.timestamp}</span>
                              {isMe && <CheckCheck className="w-3 h-3 text-blue-500" />}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={userMessagesEndRef} />
                </div>

                {/* Attached Document Preview before sending */}
                {pendingAttachedDoc && (
                  <div className="p-2 sm:p-2.5 px-3 bg-blue-50 border-t border-blue-200 flex items-center justify-between text-xs text-blue-900 shrink-0 min-w-0 gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <Paperclip className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="font-bold shrink-0">{pendingAttachedDoc.code}:</span>
                      <span className="truncate">{pendingAttachedDoc.title}</span>
                    </div>
                    <button
                      onClick={() => setPendingAttachedDoc(null)}
                      className="p-1 hover:bg-blue-100 rounded text-blue-700 cursor-pointer shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Quick Chat Snippets */}
                <div className="p-1.5 sm:p-2 px-2.5 sm:px-3 bg-white border-t border-slate-200 flex items-center gap-1 overflow-x-auto shrink-0 min-w-0 scrollbar-thin">
                  <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">Mẫu:</span>
                  {QUICK_CHAT_TEMPLATES.map((tmpl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setUserChatInput(tmpl)}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-800 rounded-full text-[11px] whitespace-nowrap border border-slate-200 transition cursor-pointer shrink-0"
                    >
                      {tmpl}
                    </button>
                  ))}
                </div>

                {/* Chat Input Bar */}
                <div className="p-2.5 sm:p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0 min-w-0">
                  <button
                    onClick={() => setIsAttachModalOpen(true)}
                    className="p-2 sm:p-2.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 border border-slate-200 transition cursor-pointer shrink-0"
                    title="Đính kèm hồ sơ tài liệu từ hệ thống"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  <input
                    type="text"
                    value={userChatInput}
                    onChange={(e) => setUserChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSendUserMessage();
                    }}
                    placeholder={`Nhắn tin cho ${isGeneralChannel ? 'kênh chung...' : activeRecipient?.name + '...'}`}
                    className="min-w-0 flex-1 px-3 py-2 bg-slate-50 border border-slate-300 focus:border-blue-500 focus:bg-white rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />

                  <button
                    onClick={handleSendUserMessage}
                    disabled={!userChatInput.trim() && !pendingAttachedDoc}
                    className="px-3 sm:px-4 py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm disabled:opacity-40 cursor-pointer transition shrink-0"
                  >
                    <Send className="w-4 h-4" />
                    <span className="hidden sm:inline">Gửi</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sub-modals */}
      <OllamaServerConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        onConfigSaved={(cfg) => setOllamaConfig(cfg)}
      />

      <AttachDocumentModal
        isOpen={isAttachModalOpen}
        onClose={() => setIsAttachModalOpen(false)}
        onSelectDocument={(doc) => setPendingAttachedDoc(doc)}
      />
    </div>
  );
};
