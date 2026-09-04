import React, { useState, useMemo } from 'react';
import { AttachedDocumentRef } from '../../types';
import { StorageService } from '../../services/storageService';
import { 
  FileText, 
  Search, 
  X, 
  FolderArchive, 
  FileSignature, 
  Inbox, 
  Send,
  Check,
  Tag,
  Building2
} from 'lucide-react';

interface AttachDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDocument: (docRef: AttachedDocumentRef) => void;
}

export const AttachDocumentModal: React.FC<AttachDocumentModalProps> = ({
  isOpen,
  onClose,
  onSelectDocument
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'HSTL' | 'DRAFT' | 'INCOMING' | 'OUTGOING'>('ALL');

  const existingDocs = useMemo(() => StorageService.getExistingDocs(), [isOpen]);
  const draftDocs = useMemo(() => StorageService.getDrafts(), [isOpen]);
  const incomingDocs = useMemo(() => StorageService.getIncomingDocs(), [isOpen]);
  const outgoingDocs = useMemo(() => StorageService.getOutgoingDocs(), [isOpen]);

  const allItems = useMemo(() => {
    const list: AttachedDocumentRef[] = [];

    // Luồng 1 & Thư viện HSTL
    existingDocs.forEach(d => {
      list.push({
        id: d.id,
        code: d.soKyHieu,
        title: d.trichYeu,
        loaiVanBan: d.loaiVanBan,
        category: 'HSTL',
        rawDoc: d
      });
    });

    // Luồng 2: Dự thảo
    draftDocs.forEach(d => {
      list.push({
        id: d.id,
        code: d.code,
        title: d.trichYeu,
        loaiVanBan: d.loaiVanBan,
        category: 'DRAFT',
        rawDoc: d
      });
    });

    // Luồng 3: Văn bản đến
    incomingDocs.forEach(d => {
      list.push({
        id: d.id,
        code: `Đến: ${d.soDen} (${d.soKyHieu})`,
        title: d.trichYeu,
        loaiVanBan: d.loaiVanBan,
        category: 'INCOMING',
        rawDoc: d
      });
    });

    // Luồng 4: Văn bản đi
    outgoingDocs.forEach(d => {
      list.push({
        id: d.id,
        code: `Đi: ${d.soDi} (${d.soKyHieu})`,
        title: d.trichYeu,
        loaiVanBan: d.loaiVanBan,
        category: 'OUTGOING',
        rawDoc: d
      });
    });

    return list;
  }, [existingDocs, draftDocs, incomingDocs, outgoingDocs]);

  const filteredItems = useMemo(() => {
    let result = allItems;
    if (selectedCategory !== 'ALL') {
      result = result.filter(item => item.category === selectedCategory);
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(item => 
        item.code.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        item.loaiVanBan.toLowerCase().includes(q)
      );
    }
    return result;
  }, [allItems, selectedCategory, searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-[#003882] to-[#094ba1] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5" />
            <div>
              <h3 className="font-bold text-sm sm:text-base">Đính Kèm Hồ Sơ / Tài Liệu Vào Tin Nhắn</h3>
              <p className="text-[11px] text-blue-100">Chọn văn bản từ thư viện hồ sơ nghiệp vụ để đồng nghiệp xem trực tiếp</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/20 text-white cursor-pointer transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 space-y-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm nhanh theo số ký hiệu, trích yếu, tên tài liệu..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-2xs"
              autoFocus
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                Xóa
              </button>
            )}
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {[
              { id: 'ALL', label: 'Tất cả nguồn' },
              { id: 'HSTL', label: 'Thư viện HSTL' },
              { id: 'DRAFT', label: 'Dự thảo & HSCV' },
              { id: 'INCOMING', label: 'Sổ Văn bản Đến' },
              { id: 'OUTGOING', label: 'Sổ Văn bản Đi' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* List of Documents */}
        <div className="p-3 overflow-y-auto divide-y divide-slate-100 flex-1">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              Không tìm thấy tài liệu nào khớp với từ khóa tìm kiếm.
            </div>
          ) : (
            filteredItems.map(item => (
              <div
                key={`${item.category}-${item.id}`}
                onClick={() => {
                  onSelectDocument(item);
                  onClose();
                }}
                className="p-3 rounded-xl hover:bg-blue-50/80 transition cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                    item.category === 'HSTL' ? 'bg-indigo-100 text-indigo-700' :
                    item.category === 'DRAFT' ? 'bg-purple-100 text-purple-700' :
                    item.category === 'INCOMING' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-rose-100 text-rose-700'
                  }`}>
                    {item.category === 'HSTL' ? <FolderArchive className="w-4 h-4" /> :
                     item.category === 'DRAFT' ? <FileSignature className="w-4 h-4" /> :
                     item.category === 'INCOMING' ? <Inbox className="w-4 h-4" /> :
                     <Send className="w-4 h-4" />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-blue-900 group-hover:text-blue-700">
                        {item.code}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                        {item.loaiVanBan}
                      </span>
                    </div>

                    <div className="text-xs font-medium text-slate-700 mt-0.5 line-clamp-2 leading-relaxed">
                      {item.title}
                    </div>
                  </div>
                </div>

                <div className="ml-3 shrink-0">
                  <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 group-hover:bg-blue-600 group-hover:text-white transition">
                    Đính kèm
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-lg cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
