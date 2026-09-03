import React, { useState, useEffect, useRef } from 'react';
import { StorageService } from '../../services/storageService';
import { IssuingAgencyItem } from '../../types';
import { Building2, ChevronDown, Check, Plus, X, Search, Sparkles, Pencil, Trash2, Settings, Shield } from 'lucide-react';

interface IssuingAgencyComboboxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  showManageButton?: boolean;
}

export const IssuingAgencyCombobox: React.FC<IssuingAgencyComboboxProps> = ({
  value,
  onChange,
  placeholder = 'Chọn hoặc nhập đơn vị ban hành...',
  required = false,
  className = '',
  showManageButton = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value);
  const [agencies, setAgencies] = useState<IssuingAgencyItem[]>([]);
  const [editingAgency, setEditingAgency] = useState<Partial<IssuingAgencyItem> | null>(null);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load agencies from storage
  const loadAgencies = () => {
    const list = StorageService.getIssuingAgencies().filter(a => a.isActive !== false);
    setAgencies(list);
  };

  useEffect(() => {
    loadAgencies();

    const handleStateChange = (e: any) => {
      if (e?.detail?.type === 'issuing_agencies' || e?.detail?.type === 'all_reset') {
        loadAgencies();
      }
    };
    window.addEventListener('hstl_state_change', handleStateChange);
    return () => window.removeEventListener('hstl_state_change', handleStateChange);
  }, []);

  // Sync internal searchTerm when external value changes
  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered agencies based on search
  const filteredAgencies = agencies.filter(a =>
    a.name.toLowerCase().includes((searchTerm || '').toLowerCase()) ||
    (a.shortName && a.shortName.toLowerCase().includes((searchTerm || '').toLowerCase())) ||
    (a.code && a.code.toLowerCase().includes((searchTerm || '').toLowerCase()))
  );

  const handleSelect = (agencyName: string) => {
    onChange(agencyName);
    setSearchTerm(agencyName);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    setSearchTerm(newVal);
    onChange(newVal);
    if (!isOpen) setIsOpen(true);
  };

  const handleClear = () => {
    setSearchTerm('');
    onChange('');
    if (inputRef.current) inputRef.current.focus();
  };

  const handleDeleteItem = (e: React.MouseEvent, agency: IssuingAgencyItem) => {
    e.stopPropagation();
    if (confirm(`Bạn có chắc muốn xóa đơn vị ban hành "${agency.name}"?`)) {
      StorageService.deleteIssuingAgency(agency.id);
      loadAgencies();
      if (value === agency.name) {
        onChange('');
        setSearchTerm('');
      }
    }
  };

  const handleStartEdit = (e: React.MouseEvent, agency: IssuingAgencyItem) => {
    e.stopPropagation();
    setEditingAgency({ ...agency });
    setIsOpen(false);
  };

  const handleSaveAgency = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAgency || !editingAgency.name?.trim() || !editingAgency.code?.trim()) {
      alert('Vui lòng nhập Mã và Tên cơ quan ban hành!');
      return;
    }

    if (editingAgency.id) {
      StorageService.updateIssuingAgency(editingAgency.id, {
        code: editingAgency.code.trim().toUpperCase(),
        name: editingAgency.name.trim(),
        shortName: editingAgency.shortName?.trim() || editingAgency.name.trim(),
        isActive: true
      });
      if (value === editingAgency.name) {
        onChange(editingAgency.name.trim());
      }
    } else {
      const newAgency: IssuingAgencyItem = {
        id: 'agency-' + Date.now(),
        code: editingAgency.code.trim().toUpperCase(),
        name: editingAgency.name.trim(),
        shortName: editingAgency.shortName?.trim() || editingAgency.name.trim(),
        isActive: true
      };
      StorageService.addIssuingAgency(newAgency);
      handleSelect(newAgency.name);
    }
    setEditingAgency(null);
    loadAgencies();
  };

  const exactMatch = agencies.find(
    a => a.name.toLowerCase().trim() === (searchTerm || '').toLowerCase().trim()
  );

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div className="relative flex items-center">
        <div className="absolute left-2.5 text-blue-600 pointer-events-none">
          <Building2 className="w-4 h-4" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          required={required}
          className="w-full text-xs font-medium pl-8 pr-20 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white text-slate-800 transition"
        />

        <div className="absolute right-1.5 flex items-center gap-0.5">
          {searchTerm && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded cursor-pointer"
              title="Xóa lựa chọn"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setEditingAgency({
                code: 'CQ-' + Math.floor(Math.random() * 900 + 100),
                name: searchTerm.trim() || '',
                shortName: searchTerm.trim() || '',
                isActive: true
              });
              setIsOpen(false);
            }}
            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded cursor-pointer transition"
            title="Thêm nhanh đơn vị ban hành mới"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 text-gray-500 hover:text-blue-700 hover:bg-blue-50 rounded cursor-pointer transition"
            title="Mở danh sách đơn vị ban hành"
          >
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-blue-200 rounded-xl shadow-xl max-h-72 overflow-y-auto divide-y divide-gray-100 animate-fadeIn text-xs">
          <div className="p-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-[11px] font-bold text-blue-900 flex items-center justify-between border-b border-blue-100">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Danh mục Đơn vị Ban hành ({agencies.length})
            </span>
            <button
              type="button"
              onClick={() => {
                setEditingAgency({
                  code: 'CQ-' + Math.floor(Math.random() * 900 + 100),
                  name: searchTerm.trim() || '',
                  shortName: searchTerm.trim() || '',
                  isActive: true
                });
                setIsOpen(false);
              }}
              className="text-[10px] text-blue-700 hover:text-blue-900 bg-white/80 hover:bg-white px-2 py-0.5 rounded border border-blue-200 font-bold flex items-center gap-1 transition shadow-2xs cursor-pointer"
            >
              <Plus className="w-3 h-3" /> Thêm đơn vị
            </button>
          </div>

          <div className="py-1">
            {filteredAgencies.length > 0 ? (
              filteredAgencies.map((agency) => {
                const isSelected = value === agency.name;
                return (
                  <div
                    key={agency.id}
                    onClick={() => handleSelect(agency.name)}
                    className={`group w-full text-left px-3 py-2 flex items-center justify-between hover:bg-blue-50/80 transition cursor-pointer ${
                      isSelected ? 'bg-blue-50 text-blue-800 font-bold' : 'text-slate-700'
                    }`}
                  >
                    <div className="min-w-0 pr-2 flex-1">
                      <div className="truncate font-medium flex items-center gap-1.5">
                        <span className="truncate">{agency.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                      </div>
                      {agency.shortName && (
                        <div className="text-[10px] text-gray-500 flex items-center gap-1.5 mt-0.5">
                          <span className="px-1.5 py-0.2 bg-gray-100 rounded text-slate-600 font-mono text-[9px]">
                            {agency.code || agency.shortName}
                          </span>
                          <span>{agency.shortName}</span>
                        </div>
                      )}
                    </div>

                    {/* Action buttons: Sửa & Xóa on each item */}
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition shrink-0 ml-2">
                      <button
                        type="button"
                        onClick={(e) => handleStartEdit(e, agency)}
                        className="px-2 py-1 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white rounded border border-blue-200 hover:border-blue-600 text-[10px] font-bold flex items-center gap-1 transition shadow-2xs cursor-pointer"
                        title="Sửa thông tin đơn vị ban hành"
                      >
                        <Pencil className="w-3 h-3" /> Sửa
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteItem(e, agency)}
                        className="px-2 py-1 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded border border-red-200 hover:border-red-600 text-[10px] font-bold flex items-center gap-1 transition shadow-2xs cursor-pointer"
                        title="Xóa đơn vị ban hành này"
                      >
                        <Trash2 className="w-3 h-3" /> Xóa
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="px-3 py-3 text-gray-500 text-center text-xs">
                Không tìm thấy đơn vị trong danh mục
              </div>
            )}

            {/* Custom option when user types something not exact match */}
            {searchTerm.trim() && !exactMatch && (
              <div className="p-2 bg-amber-50/90 border-t border-amber-200 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleSelect(searchTerm.trim())}
                  className="text-left flex-1 text-amber-900 font-medium text-xs hover:underline flex items-center gap-1.5 cursor-pointer truncate"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span className="truncate">
                    Sử dụng: <strong className="text-amber-950">"{searchTerm.trim()}"</strong>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingAgency({
                      code: 'CQ-' + Math.floor(Math.random() * 900 + 100),
                      name: searchTerm.trim(),
                      shortName: searchTerm.trim(),
                      isActive: true
                    });
                    setIsOpen(false);
                  }}
                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded font-bold text-[10px] flex items-center gap-1 shrink-0 shadow-2xs cursor-pointer"
                  title="Lưu vào danh mục chính thức"
                >
                  <Plus className="w-3 h-3" /> Lưu vào danh mục
                </button>
              </div>
            )}
          </div>

          <div className="p-2 bg-gray-50 text-[10px] text-gray-500 flex items-center justify-between border-t border-gray-100">
            <span>Admin có thể Sửa/Xóa trực tiếp trên từng mục</span>
            <button
              type="button"
              onClick={() => {
                setEditingAgency({
                  code: 'CQ-' + Math.floor(Math.random() * 900 + 100),
                  name: '',
                  shortName: '',
                  isActive: true
                });
                setIsOpen(false);
              }}
              className="text-blue-700 font-bold hover:underline cursor-pointer"
            >
              + Thêm cơ quan mới
            </button>
          </div>
        </div>
      )}

      {/* Quick Select Badges with Direct Management info */}
      <div className="flex flex-wrap items-center justify-between gap-1 mt-1.5">
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-[10px] text-gray-500 font-medium">Gợi ý nhanh:</span>
          {agencies.slice(0, 3).map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => handleSelect(a.name)}
              className={`text-[10px] px-2 py-0.5 rounded-md border transition cursor-pointer ${
                value === a.name
                  ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-xs'
                  : 'bg-gray-50 text-slate-700 border-gray-200 hover:bg-blue-50 hover:border-blue-300'
              }`}
            >
              {a.shortName || a.name}
            </button>
          ))}
        </div>

        {showManageButton && (
          <button
            type="button"
            onClick={() => {
              setEditingAgency({
                code: 'CQ-' + Math.floor(Math.random() * 900 + 100),
                name: '',
                shortName: '',
                isActive: true
              });
            }}
            className="text-[10px] text-blue-700 hover:text-blue-900 font-bold flex items-center gap-0.5 hover:underline cursor-pointer"
            title="Thêm hoặc quản lý đơn vị ban hành"
          >
            <Plus className="w-3 h-3" /> Thêm đơn vị ban hành
          </button>
        )}
      </div>

      {/* Quick Add / Edit Modal */}
      {editingAgency && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn text-slate-800">
          <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-md shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    {editingAgency.id ? 'Chỉnh Sửa Đơn Vị Ban Hành' : 'Thêm Mới Đơn Vị Ban Hành'}
                  </h3>
                  <p className="text-[10px] text-gray-500">
                    Cơ sở dữ liệu danh mục Combobox cho toàn hệ thống
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingAgency(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAgency} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Mã đơn vị / Cơ quan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: TCT-DSVN hoặc BAN-KTHT"
                  value={editingAgency.code || ''}
                  onChange={(e) => setEditingAgency({ ...editingAgency, code: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-gray-300 font-mono font-bold uppercase focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tên đầy đủ cơ quan / đơn vị ban hành <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Tổng công ty Đường sắt Việt Nam"
                  value={editingAgency.name || ''}
                  onChange={(e) => setEditingAgency({ ...editingAgency, name: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-gray-300 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tên viết tắt (hiển thị nhãn gợi ý)
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: ĐSVN, Ban KTHT, VP TCT..."
                  value={editingAgency.shortName || ''}
                  onChange={(e) => setEditingAgency({ ...editingAgency, shortName: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-3 border-t border-gray-100">
                {editingAgency.id ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (editingAgency.id && editingAgency.name) {
                        if (confirm(`Bạn có chắc muốn xóa đơn vị ban hành "${editingAgency.name}"?`)) {
                          StorageService.deleteIssuingAgency(editingAgency.id);
                          loadAgencies();
                          if (value === editingAgency.name) {
                            onChange('');
                            setSearchTerm('');
                          }
                          setEditingAgency(null);
                        }
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
                  <button
                    type="button"
                    onClick={() => setEditingAgency(null)}
                    className="px-3 py-2 rounded-xl text-slate-600 hover:bg-gray-100 font-semibold cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    {editingAgency.id ? 'Cập Nhật Đơn Vị' : 'Lưu Đơn Vị Mới'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

