import React from 'react';
import { 
  DocTypeMetadataSchema, 
  MetadataFieldDefinition 
} from '../../types';
import { StorageService } from '../../services/storageService';
import { 
  DollarSign, 
  Calendar, 
  Hash, 
  Type, 
  ListFilter, 
  CheckSquare, 
  Layers, 
  HelpCircle,
  Sparkles,
  Tag
} from 'lucide-react';

interface DynamicMetadataFieldsProps {
  docType: string;
  values: Record<string, any>;
  onChange: (newValues: Record<string, any>) => void;
  readOnly?: boolean;
  className?: string;
  showTitle?: boolean;
}

// Format currency number to Vietnamese Dong string
export function formatCurrencyVND(amount: number | string | undefined | null): string {
  if (amount === undefined || amount === null || amount === '') return '';
  const num = typeof amount === 'string' ? parseFloat(amount.replace(/[^\d]/g, '')) : amount;
  if (isNaN(num)) return '';
  return new Intl.NumberFormat('vi-VN').format(num) + ' VNĐ';
}

// Convert number to Vietnamese readable text (e.g. 12.500.000.000 -> 12,5 Tỷ VNĐ)
export function formatShortVND(amount: number | string | undefined | null): string {
  if (amount === undefined || amount === null || amount === '') return '';
  const num = typeof amount === 'string' ? parseFloat(amount.replace(/[^\d]/g, '')) : amount;
  if (isNaN(num)) return '';
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 2 }) + ' Tỷ VNĐ';
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 1 }) + ' Triệu VNĐ';
  }
  return new Intl.NumberFormat('vi-VN').format(num) + ' VNĐ';
}

export const DynamicMetadataFields: React.FC<DynamicMetadataFieldsProps> = ({
  docType,
  values = {},
  onChange,
  readOnly = false,
  className = '',
  showTitle = true
}) => {
  const schema = StorageService.getSchemaForDocType(docType);

  if (!schema || !schema.fields || schema.fields.length === 0) {
    return null;
  }

  const handleFieldChange = (key: string, val: any) => {
    onChange({
      ...values,
      [key]: val
    });
  };

  const getBadgeColorClasses = (color?: string) => {
    switch (color) {
      case 'emerald':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'purple':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'blue':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'amber':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'rose':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'teal':
        return 'bg-teal-50 text-teal-800 border-teal-200';
      default:
        return 'bg-blue-50 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className={`rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-white p-4 space-y-3.5 transition-all shadow-xs ${className}`}>
      {showTitle && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2.5 border-b border-blue-200/80 gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-600 text-white shadow-xs">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-blue-950 uppercase tracking-wider">
                  Thuộc tính Metadata Đặc Thù
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${getBadgeColorClasses(schema.badgeColor)}`}>
                  {schema.name}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                {schema.description || `Các trường thông tin động được Quản trị viên thiết lập riêng cho loại tài liệu "${schema.docType}"`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-700 bg-white/80 px-2.5 py-1 rounded-md border border-blue-200 shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Admin Cấu Hình ({schema.fields.length} trường)</span>
          </div>
        </div>
      )}

      {/* Dynamic Grid of Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {schema.fields.map((field: MetadataFieldDefinition) => {
          const val = values[field.key] !== undefined ? values[field.key] : (field.defaultValue ?? '');

          return (
            <div 
              key={field.id || field.key} 
              className={field.type === 'currency' || field.description ? 'sm:col-span-2' : ''}
            >
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  {field.type === 'currency' && <DollarSign className="w-3.5 h-3.5 text-emerald-600" />}
                  {field.type === 'date' && <Calendar className="w-3.5 h-3.5 text-blue-600" />}
                  {field.type === 'number' && <Hash className="w-3.5 h-3.5 text-indigo-600" />}
                  {field.type === 'select' && <ListFilter className="w-3.5 h-3.5 text-amber-600" />}
                  {field.type === 'text' && <Type className="w-3.5 h-3.5 text-slate-600" />}
                  {field.type === 'boolean' && <CheckSquare className="w-3.5 h-3.5 text-purple-600" />}
                  <span>{field.label}</span>
                  {field.required && <span className="text-red-600 font-bold">*</span>}
                </label>
                {field.unit && (
                  <span className="text-[10px] font-bold text-slate-600 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                    Đơn vị: {field.unit}
                  </span>
                )}
              </div>

              {/* Render Field By Type */}
              {field.type === 'currency' ? (
                <div className="space-y-1">
                  <div className="relative">
                    <input
                      type="text"
                      disabled={readOnly}
                      value={val !== '' ? (typeof val === 'number' ? new Intl.NumberFormat('vi-VN').format(val) : val) : ''}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^\d]/g, '');
                        const num = raw ? parseInt(raw, 10) : '';
                        handleFieldChange(field.key, num);
                      }}
                      placeholder={field.placeholder || 'Ví dụ: 12.500.000.000'}
                      className="w-full text-xs font-mono font-bold px-3 py-2 pr-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white disabled:bg-gray-100 text-emerald-900"
                    />
                    <span className="absolute right-3 top-2 text-xs font-bold text-emerald-700 pointer-events-none">
                      VNĐ
                    </span>
                  </div>
                  {val && typeof val === 'number' && val > 0 && (
                    <div className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1 pl-1">
                      <span>Quy đổi đọc nhanh:</span>
                      <strong className="bg-emerald-100/80 px-1.5 py-0.5 rounded text-emerald-900">
                        {formatShortVND(val)}
                      </strong>
                    </div>
                  )}
                </div>
              ) : field.type === 'select' ? (
                <select
                  disabled={readOnly}
                  value={val}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white disabled:bg-gray-100 font-medium"
                >
                  <option value="">-- Chọn {field.label} --</option>
                  {(field.options || []).map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : field.type === 'date' ? (
                <input
                  type="date"
                  disabled={readOnly}
                  value={val}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white disabled:bg-gray-100"
                />
              ) : field.type === 'number' ? (
                <div className="relative">
                  <input
                    type="number"
                    disabled={readOnly}
                    value={val}
                    onChange={(e) => handleFieldChange(field.key, e.target.value ? Number(e.target.value) : '')}
                    placeholder={field.placeholder || 'Nhập số lượng...'}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white disabled:bg-gray-100"
                  />
                  {field.unit && (
                    <span className="absolute right-3 top-2 text-xs font-semibold text-gray-500 pointer-events-none">
                      {field.unit}
                    </span>
                  )}
                </div>
              ) : field.type === 'boolean' ? (
                <label className="flex items-center gap-2.5 p-2 rounded-lg bg-white border border-gray-200 cursor-pointer">
                  <input
                    type="checkbox"
                    disabled={readOnly}
                    checked={Boolean(val)}
                    onChange={(e) => handleFieldChange(field.key, e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs font-medium text-slate-700">
                    {val ? 'Có / Đạt yêu cầu' : 'Không / Chưa áp dụng'}
                  </span>
                </label>
              ) : (
                <input
                  type="text"
                  disabled={readOnly}
                  value={val}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  placeholder={field.placeholder || `Nhập ${field.label.toLowerCase()}...`}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white disabled:bg-gray-100"
                />
              )}

              {field.description && (
                <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-1">
                  <HelpCircle className="w-3 h-3 text-gray-400 shrink-0" />
                  <span>{field.description}</span>
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
