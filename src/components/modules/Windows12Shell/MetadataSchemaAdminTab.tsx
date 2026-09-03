import React, { useState, useEffect } from 'react';
import { 
  DocTypeMetadataSchema, 
  MetadataFieldDefinition, 
  MetadataFieldType 
} from '../../../types';
import { StorageService } from '../../../services/storageService';
import { DynamicMetadataFields } from '../../common/DynamicMetadataFields';
import { 
  Layers, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  Check, 
  X, 
  Search, 
  RotateCcw, 
  Sparkles, 
  Sliders, 
  Type, 
  DollarSign, 
  Hash, 
  Calendar, 
  ListFilter, 
  CheckSquare, 
  Eye, 
  FileText,
  AlertCircle,
  HelpCircle,
  FolderCog
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface MetadataSchemaAdminTabProps {
  isAdmin: boolean;
}

export const MetadataSchemaAdminTab: React.FC<MetadataSchemaAdminTabProps> = ({ isAdmin }) => {
  const [schemas, setSchemas] = useState<DocTypeMetadataSchema[]>([]);
  const [selectedSchemaId, setSelectedSchemaId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Schema Modal / Editor State
  const [isEditingSchemaModalOpen, setIsEditingSchemaModalOpen] = useState(false);
  const [editingSchemaData, setEditingSchemaData] = useState<Partial<DocTypeMetadataSchema> | null>(null);

  // Field Modal / Editor State
  const [isEditingFieldModalOpen, setIsEditingFieldModalOpen] = useState(false);
  const [editingFieldData, setEditingFieldData] = useState<Partial<MetadataFieldDefinition> | null>(null);
  const [rawOptionsText, setRawOptionsText] = useState('');

  // Live Preview Form State
  const [previewValues, setPreviewValues] = useState<Record<string, any>>({});

  const loadSchemas = () => {
    const list = StorageService.getMetadataSchemas();
    setSchemas(list);
    if (!selectedSchemaId && list.length > 0) {
      setSelectedSchemaId(list[0].id);
    }
  };

  useEffect(() => {
    loadSchemas();
  }, []);

  const selectedSchema = schemas.find(s => s.id === selectedSchemaId) || schemas[0];

  // Helper to generate a camelCase key from Vietnamese string
  const generateKey = (str: string) => {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd').replace(/Đ/g, 'D')
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .trim()
      .split(/\s+/)
      .map((word, idx) => idx === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  };

  // -------------------------------------------------------------
  // SCHEMA CRUD HANDLERS
  // -------------------------------------------------------------
  const handleOpenNewSchema = () => {
    setEditingSchemaData({
      docType: '',
      name: '',
      description: '',
      aliases: [],
      badgeColor: 'blue',
      fields: []
    });
    setIsEditingSchemaModalOpen(true);
  };

  const handleOpenEditSchema = (schema: DocTypeMetadataSchema) => {
    setEditingSchemaData({
      ...schema,
      aliases: [...(schema.aliases || [])]
    });
    setIsEditingSchemaModalOpen(true);
  };

  const handleSaveSchema = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSchemaData || !editingSchemaData.docType?.trim() || !editingSchemaData.name?.trim()) {
      alert('Vui lòng nhập Tên loại văn bản và Tiêu đề hồ sơ!');
      return;
    }

    const docType = editingSchemaData.docType.trim();
    const name = editingSchemaData.name.trim();
    const id = editingSchemaData.id || `schema-${generateKey(docType) || Date.now()}`;

    const newSchema: DocTypeMetadataSchema = {
      id,
      docType,
      name,
      description: editingSchemaData.description?.trim() || '',
      badgeColor: editingSchemaData.badgeColor || 'blue',
      aliases: editingSchemaData.aliases && editingSchemaData.aliases.length > 0 
        ? editingSchemaData.aliases 
        : [docType],
      fields: editingSchemaData.fields || [],
      isSystem: editingSchemaData.isSystem || false,
      updatedAt: new Date().toISOString()
    };

    StorageService.addOrUpdateSchema(newSchema);
    loadSchemas();
    setSelectedSchemaId(id);
    setIsEditingSchemaModalOpen(false);
    setEditingSchemaData(null);
    confetti({ particleCount: 25, spread: 50, origin: { y: 0.6 } });
  };

  const handleDeleteSchema = (id: string, name: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa cấu hình metadata của loại tài liệu "${name}"?`)) {
      StorageService.deleteSchema(id);
      const updated = StorageService.getMetadataSchemas();
      setSchemas(updated);
      if (updated.length > 0) {
        setSelectedSchemaId(updated[0].id);
      }
    }
  };

  // -------------------------------------------------------------
  // FIELD CRUD HANDLERS
  // -------------------------------------------------------------
  const handleOpenNewField = () => {
    if (!selectedSchema) return;
    setEditingFieldData({
      label: '',
      key: '',
      type: 'text',
      required: false,
      unit: '',
      placeholder: '',
      description: ''
    });
    setRawOptionsText('');
    setIsEditingFieldModalOpen(true);
  };

  const handleOpenEditField = (field: MetadataFieldDefinition) => {
    setEditingFieldData({ ...field });
    setRawOptionsText((field.options || []).join(', '));
    setIsEditingFieldModalOpen(true);
  };

  const handleSaveField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchema || !editingFieldData || !editingFieldData.label?.trim()) {
      alert('Vui lòng nhập Tên trường hiển thị!');
      return;
    }

    const label = editingFieldData.label.trim();
    const key = editingFieldData.key?.trim() || generateKey(label) || `field_${Date.now()}`;
    const id = editingFieldData.id || `field-${generateKey(label)}-${Date.now()}`;

    // Parse options
    let parsedOptions: string[] | undefined = undefined;
    if (editingFieldData.type === 'select') {
      parsedOptions = rawOptionsText
        .split(',')
        .map(o => o.trim())
        .filter(o => o.length > 0);
    }

    const updatedField: MetadataFieldDefinition = {
      id,
      key,
      label,
      type: (editingFieldData.type || 'text') as MetadataFieldType,
      required: Boolean(editingFieldData.required),
      unit: editingFieldData.unit?.trim() || undefined,
      placeholder: editingFieldData.placeholder?.trim() || undefined,
      description: editingFieldData.description?.trim() || undefined,
      options: parsedOptions
    };

    const currentFields = [...(selectedSchema.fields || [])];
    const existingIdx = currentFields.findIndex(f => f.id === updatedField.id || f.key === updatedField.key);

    if (existingIdx !== -1) {
      currentFields[existingIdx] = updatedField;
    } else {
      currentFields.push(updatedField);
    }

    const updatedSchema: DocTypeMetadataSchema = {
      ...selectedSchema,
      fields: currentFields,
      updatedAt: new Date().toISOString()
    };

    StorageService.addOrUpdateSchema(updatedSchema);
    loadSchemas();
    setIsEditingFieldModalOpen(false);
    setEditingFieldData(null);
  };

  const handleDeleteField = (fieldKey: string, fieldLabel: string) => {
    if (!selectedSchema) return;
    if (confirm(`Bạn có chắc muốn xóa trường metadata "${fieldLabel}"?`)) {
      const updatedFields = (selectedSchema.fields || []).filter(f => f.key !== fieldKey);
      const updatedSchema: DocTypeMetadataSchema = {
        ...selectedSchema,
        fields: updatedFields,
        updatedAt: new Date().toISOString()
      };
      StorageService.addOrUpdateSchema(updatedSchema);
      loadSchemas();
    }
  };

  const handleResetToDefaults = () => {
    if (confirm('Khôi phục toàn bộ cấu hình Metadata về danh mục chuẩn ban đầu của hệ thống (Hợp đồng, Quyết định, Thiết kế, Biên bản, Báo cáo, Tờ trình)?')) {
      StorageService.resetToDefault();
      loadSchemas();
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.6 } });
    }
  };

  const filteredSchemas = schemas.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.docType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getBadgeBg = (color?: string) => {
    switch (color) {
      case 'emerald': return 'bg-emerald-500 text-white';
      case 'purple': return 'bg-purple-500 text-white';
      case 'blue': return 'bg-blue-600 text-white';
      case 'amber': return 'bg-amber-500 text-white';
      case 'rose': return 'bg-rose-500 text-white';
      case 'teal': return 'bg-teal-500 text-white';
      default: return 'bg-blue-600 text-white';
    }
  };

  const renderFieldTypeBadge = (type: MetadataFieldType) => {
    switch (type) {
      case 'currency':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
            <DollarSign className="w-3 h-3" /> Tiền tệ (VNĐ)
          </span>
        );
      case 'text':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-300">
            <Type className="w-3 h-3" /> Văn bản (Text)
          </span>
        );
      case 'number':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-300">
            <Hash className="w-3 h-3" /> Số lượng (Number)
          </span>
        );
      case 'date':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-300">
            <Calendar className="w-3 h-3" /> Ngày tháng (Date)
          </span>
        );
      case 'select':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
            <ListFilter className="w-3 h-3" /> Danh sách (Select)
          </span>
        );
      case 'boolean':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-300">
            <CheckSquare className="w-3 h-3" /> Đúng/Sai (Toggle)
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 text-slate-800">
      {/* Top Banner Guide */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-700 border border-blue-100 shrink-0">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <span>Cấu Hình Metadata Động Cho Từng Loại Hồ Sơ Tài Liệu</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                Dynamic Schema Engine
              </span>
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Admin thiết lập các trường dữ liệu đặc thù (VD: <strong>Hợp đồng</strong> thêm <em>giá trị hợp đồng, bên A, bên B</em>; <strong>Quyết định</strong> thêm <em>người ký, chức vụ</em>; <strong>Thiết kế</strong> thêm <em>tên người thiết kế, tỷ lệ bản vẽ</em>). Các trường này tự động hiển thị trong form tạo/duyệt và lưu trữ HSTL.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
          <button
            onClick={handleResetToDefaults}
            className="text-xs font-semibold px-3 py-2 rounded-xl border border-gray-200 text-slate-600 hover:bg-gray-100 transition flex items-center gap-1.5 cursor-pointer"
            title="Khôi phục cấu hình chuẩn mặc định"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Mặc định</span>
          </button>

          {isAdmin && (
            <button
              onClick={handleOpenNewSchema}
              className="text-xs font-bold px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Loại Tài Liệu</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: List of Document Types */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-200 shadow-xs flex flex-col h-[520px] overflow-hidden">
          {/* Header & Search */}
          <div className="p-3.5 border-b border-gray-200 bg-gray-50/70 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                <span>Loại tài liệu ({schemas.length})</span>
              </span>
              <span className="text-[10px] text-gray-500 font-medium">Chọn để chỉnh sửa</span>
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm loại văn bản..."
                className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
          </div>

          {/* Schema List */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100 p-2 space-y-1">
            {filteredSchemas.map((schema) => {
              const isSelected = schema.id === selectedSchemaId;
              const fieldCount = schema.fields ? schema.fields.length : 0;

              return (
                <div
                  key={schema.id}
                  onClick={() => setSelectedSchemaId(schema.id)}
                  className={`p-3 rounded-xl transition cursor-pointer flex items-center justify-between gap-2 ${
                    isSelected
                      ? 'bg-blue-50/90 border border-blue-300 text-blue-950 font-bold shadow-xs'
                      : 'hover:bg-gray-50 border border-transparent text-slate-700'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${getBadgeBg(schema.badgeColor)}`}></span>
                      <span className="text-xs font-bold truncate">{schema.name}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-normal truncate mt-0.5">
                      Khớp loại: <span className="font-semibold text-slate-700">{schema.docType}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-gray-200 text-blue-700 shadow-2xs">
                      {fieldCount} trường
                    </span>
                  </div>
                </div>
              );
            })}

            {filteredSchemas.length === 0 && (
              <div className="p-6 text-center text-xs text-gray-400">
                Không tìm thấy loại văn bản nào phù hợp.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Schema Detail & Fields Management */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-200 shadow-xs flex flex-col h-[520px] overflow-hidden">
          {selectedSchema ? (
            <>
              {/* Header Details */}
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-slate-50 to-blue-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-extrabold text-slate-900">{selectedSchema.name}</h4>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                      Mã: {selectedSchema.docType}
                    </span>
                    {selectedSchema.isSystem && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200">
                        Hệ thống
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">
                    {selectedSchema.description || 'Chưa có mô tả chi tiết cho loại hồ sơ này.'}
                  </p>
                </div>

                {isAdmin && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleOpenEditSchema(selectedSchema)}
                      className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-gray-300 text-slate-700 hover:bg-gray-100 transition flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Sửa loại</span>
                    </button>
                    {!selectedSchema.isSystem && (
                      <button
                        onClick={() => handleDeleteSchema(selectedSchema.id, selectedSchema.name)}
                        className="text-xs font-semibold p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition cursor-pointer"
                        title="Xóa loại tài liệu này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={handleOpenNewField}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Thêm Trường Metadata</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Scrollable Container with Fields Table & Live Preview */}
              <div className="flex-1 overflow-y-auto p-4 space-y-5">
                {/* Fields Table */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-blue-600" />
                      <span>Danh sách các trường metadata được cấu hình ({selectedSchema.fields?.length || 0})</span>
                    </span>
                  </div>

                  <div className="border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 border-b border-gray-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
                        <tr>
                          <th className="py-2.5 px-3">Tên trường hiển thị</th>
                          <th className="py-2.5 px-3">Mã (Key)</th>
                          <th className="py-2.5 px-3">Kiểu dữ liệu</th>
                          <th className="py-2.5 px-3 text-center">Bắt buộc</th>
                          <th className="py-2.5 px-3">Đơn vị / Chi tiết</th>
                          {isAdmin && <th className="py-2.5 px-3 text-right">Thao tác</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {(selectedSchema.fields || []).map((field) => (
                          <tr key={field.id || field.key} className="hover:bg-blue-50/40 transition">
                            <td className="py-2.5 px-3 font-bold text-slate-800">
                              <div className="flex items-center gap-1.5">
                                <span>{field.label}</span>
                                {field.required && <span className="text-red-600 font-extrabold">*</span>}
                              </div>
                              {field.description && (
                                <div className="text-[10px] font-normal text-gray-500 italic mt-0.5">
                                  {field.description}
                                </div>
                              )}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-[11px] text-blue-800">
                              {field.key}
                            </td>
                            <td className="py-2.5 px-3">
                              {renderFieldTypeBadge(field.type)}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              {field.required ? (
                                <span className="text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded text-[10px] border border-red-200">
                                  Có
                                </span>
                              ) : (
                                <span className="text-gray-400 text-[10px]">Tùy chọn</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-gray-600 text-[11px]">
                              {field.unit ? (
                                <span className="font-semibold text-slate-700 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                                  {field.unit}
                                </span>
                              ) : field.type === 'select' ? (
                                <span className="text-[10px] text-amber-700 italic">
                                  {field.options?.length || 0} lựa chọn
                                </span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            {isAdmin && (
                              <td className="py-2.5 px-3 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    onClick={() => handleOpenEditField(field)}
                                    className="p-1 rounded text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition cursor-pointer"
                                    title="Sửa trường này"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteField(field.key, field.label)}
                                    className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                                    title="Xóa trường này"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            )}
                          </tr>
                        ))}

                        {(!selectedSchema.fields || selectedSchema.fields.length === 0) && (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-xs text-gray-400">
                              Chưa có trường metadata nào được cấu hình cho loại văn bản này. Bấm &quot;Thêm Trường Metadata&quot; để thiết lập.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Live Preview Box */}
                <div className="space-y-2 pt-2 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Xem trước biểu mẫu nhập liệu thực tế (Chuyên viên tương tác)</span>
                    </span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                      Live Testing Mode
                    </span>
                  </div>

                  <DynamicMetadataFields
                    docType={selectedSchema.docType}
                    values={previewValues}
                    onChange={setPreviewValues}
                    showTitle={false}
                    className="bg-slate-50/80 border-slate-200"
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-gray-400 text-xs">
              <FolderCog className="w-12 h-12 text-gray-300 mb-2" />
              <span>Vui lòng chọn một loại văn bản ở cột bên trái để quản lý trường metadata</span>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL: THÊM / SỬA LOẠI VĂN BẢN (DOC TYPE SCHEMA)         */}
      {/* ========================================================= */}
      {isEditingSchemaModalOpen && editingSchemaData && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl border border-gray-300 max-w-lg w-full shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-700 to-indigo-800 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-200" />
                <span>{editingSchemaData.id ? 'Chỉnh Sửa Loại Hồ Sơ' : 'Thêm Loại Hồ Sơ Mới'}</span>
              </h3>
              <button 
                onClick={() => setIsEditingSchemaModalOpen(false)}
                className="text-white/70 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSchema} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tên hồ sơ hiển thị <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingSchemaData.name || ''}
                  onChange={(e) => setEditingSchemaData({ ...editingSchemaData, name: e.target.value })}
                  placeholder="Ví dụ: Hợp đồng kinh tế & Phụ lục"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Mã loại văn bản khớp hệ thống <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingSchemaData.docType || ''}
                  onChange={(e) => setEditingSchemaData({ ...editingSchemaData, docType: e.target.value })}
                  placeholder="Ví dụ: Hợp đồng kinh tế (hoặc Quyết định, Bản vẽ hoàn công...)"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
                <p className="text-[10px] text-gray-500 mt-0.5">
                  Giá trị này sẽ tự động kích hoạt metadata khi chuyên viên chọn loại văn bản tương ứng.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mô tả mục đích</label>
                <textarea
                  rows={2}
                  value={editingSchemaData.description || ''}
                  onChange={(e) => setEditingSchemaData({ ...editingSchemaData, description: e.target.value })}
                  placeholder="Mô tả phạm vi áp dụng các trường metadata này..."
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Màu sắc nhận diện (Badge)</label>
                <select
                  value={editingSchemaData.badgeColor || 'blue'}
                  onChange={(e) => setEditingSchemaData({ ...editingSchemaData, badgeColor: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:outline-none font-medium"
                >
                  <option value="blue">Xanh Dương (Blue)</option>
                  <option value="emerald">Xanh Lá (Emerald)</option>
                  <option value="purple">Tím (Purple)</option>
                  <option value="amber">Hổ Phách / Vàng (Amber)</option>
                  <option value="rose">Đỏ Hồng (Rose)</option>
                  <option value="teal">Xanh Mòng Két (Teal)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-gray-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingSchemaModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-gray-300 text-slate-700 font-semibold hover:bg-gray-100 transition cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Lưu cấu hình</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: THÊM / SỬA TRƯỜNG METADATA (FIELD DEFINITION)      */}
      {/* ========================================================= */}
      {isEditingFieldModalOpen && editingFieldData && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl border border-gray-300 max-w-lg w-full shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-emerald-700 to-teal-800 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-200" />
                <span>
                  {editingFieldData.id ? 'Sửa Trường Metadata' : 'Thêm Trường Metadata Mới'} ({selectedSchema?.name})
                </span>
              </h3>
              <button 
                onClick={() => setIsEditingFieldModalOpen(false)}
                className="text-white/70 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveField} className="p-4 space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tên trường hiển thị <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingFieldData.label || ''}
                    onChange={(e) => {
                      const label = e.target.value;
                      const autoKey = editingFieldData.id ? editingFieldData.key : generateKey(label);
                      setEditingFieldData({ 
                        ...editingFieldData, 
                        label,
                        key: autoKey || editingFieldData.key 
                      });
                    }}
                    placeholder="Ví dụ: Giá trị hợp đồng"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Mã trường (Key biến) <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingFieldData.key || ''}
                    onChange={(e) => setEditingFieldData({ ...editingFieldData, key: e.target.value })}
                    placeholder="giaTriHopDong"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Kiểu dữ liệu <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={editingFieldData.type || 'text'}
                    onChange={(e) => setEditingFieldData({ ...editingFieldData, type: e.target.value as MetadataFieldType })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none font-medium"
                  >
                    <option value="currency">Tiền tệ VNĐ (Định dạng số tiền có dấu chấm)</option>
                    <option value="text">Văn bản / Chữ (Text)</option>
                    <option value="number">Số lượng / Giá trị số (Number)</option>
                    <option value="date">Ngày tháng (Date picker)</option>
                    <option value="select">Danh sách chọn (Dropdown)</option>
                    <option value="boolean">Bật / Tắt (Checkbox/Toggle)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Đơn vị tính (nếu có)</label>
                  <input
                    type="text"
                    value={editingFieldData.unit || ''}
                    onChange={(e) => setEditingFieldData({ ...editingFieldData, unit: e.target.value })}
                    placeholder="Ví dụ: VNĐ, Tháng, Trang, %"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              {editingFieldData.type === 'select' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Các mục lựa chọn (cách nhau bởi dấu phẩy)
                  </label>
                  <textarea
                    rows={2}
                    value={rawOptionsText}
                    onChange={(e) => setRawOptionsText(e.target.value)}
                    placeholder="Ví dụ: Trọn gói, Theo đơn giá cố định, Theo thời gian, Hỗn hợp"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Gợi ý nhập liệu (Placeholder)</label>
                <input
                  type="text"
                  value={editingFieldData.placeholder || ''}
                  onChange={(e) => setEditingFieldData({ ...editingFieldData, placeholder: e.target.value })}
                  placeholder="Ví dụ: 12.500.000.000 hoặc Nhập họ tên..."
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mô tả / Ghi chú cho chuyên viên</label>
                <input
                  type="text"
                  value={editingFieldData.description || ''}
                  onChange={(e) => setEditingFieldData({ ...editingFieldData, description: e.target.value })}
                  placeholder="Ví dụ: Giá trị hợp đồng đã bao gồm thuế VAT"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(editingFieldData.required)}
                    onChange={(e) => setEditingFieldData({ ...editingFieldData, required: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span className="font-bold text-slate-800">
                    Bắt buộc chuyên viên phải điền trường này khi tạo/duyệt hồ sơ
                  </span>
                </label>
              </div>

              <div className="pt-3 border-t border-gray-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingFieldModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-gray-300 text-slate-700 font-semibold hover:bg-gray-100 transition cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Lưu trường</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
