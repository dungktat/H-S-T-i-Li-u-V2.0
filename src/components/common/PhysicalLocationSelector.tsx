import React, { useState, useEffect } from 'react';
import { PhysicalLocation } from '../../types';
import {
  STORAGE_HIERARCHY_DEPARTMENTS,
  StorageDepartmentItem,
  StorageShelfItem,
  StorageCompartmentItem,
  StorageBoxItem
} from '../../data/initialData';
import {
  Building2,
  Layers,
  Box,
  FolderArchive,
  FileText,
  Barcode,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

interface PhysicalLocationSelectorProps {
  value?: PhysicalLocation;
  onChange: (location: PhysicalLocation) => void;
  required?: boolean;
  accentColor?: string;
}

export const PhysicalLocationSelector: React.FC<PhysicalLocationSelectorProps> = ({
  value,
  onChange
}) => {
  // State for 5 levels of hierarchy:
  // 1. Phòng / Ban / Đơn vị con -> 2. Kệ -> 3. Ngăn -> 4. Hộp / Cặp -> 5. Hồ sơ
  const [selectedDeptId, setSelectedDeptId] = useState<string>(STORAGE_HIERARCHY_DEPARTMENTS[0].id);
  const [selectedShelfId, setSelectedShelfId] = useState<string>(STORAGE_HIERARCHY_DEPARTMENTS[0].shelves[0].id);
  const [selectedCompId, setSelectedCompId] = useState<string>(STORAGE_HIERARCHY_DEPARTMENTS[0].shelves[0].compartments[0].id);
  const [selectedBoxId, setSelectedBoxId] = useState<string>(STORAGE_HIERARCHY_DEPARTMENTS[0].shelves[0].compartments[0].boxes[0].id);
  const [selectedDossierName, setSelectedDossierName] = useState<string>('Hồ sơ số 01 (HS-01)');

  // Custom inputs toggle for Box and Dossier
  const [isCustomBox, setIsCustomBox] = useState<boolean>(false);
  const [customBoxText, setCustomBoxText] = useState<string>('');
  const [isCustomDossier, setIsCustomDossier] = useState<boolean>(false);
  const [customDossierText, setCustomDossierText] = useState<string>('');

  // Resolved hierarchy objects
  const currentDept: StorageDepartmentItem =
    STORAGE_HIERARCHY_DEPARTMENTS.find(d => d.id === selectedDeptId) || STORAGE_HIERARCHY_DEPARTMENTS[0];

  const currentShelf: StorageShelfItem =
    currentDept.shelves.find(s => s.id === selectedShelfId) || currentDept.shelves[0] || {
      id: 'K-01',
      name: 'Kệ K-01',
      compartments: []
    };

  const currentComp: StorageCompartmentItem =
    currentShelf.compartments.find(c => c.id === selectedCompId) || currentShelf.compartments[0] || {
      id: 'N-01',
      name: 'Ngăn N-01',
      boxes: []
    };

  const currentBox: StorageBoxItem =
    currentComp.boxes.find(b => b.id === selectedBoxId) || currentComp.boxes[0] || {
      id: 'H-01',
      name: 'Hộp / Cặp H-01',
      dossiers: []
    };

  // Helper to generate barcode and emit change in 5 levels
  const buildAndEmitChange = (
    dept: StorageDepartmentItem,
    shelf: StorageShelfItem,
    comp: StorageCompartmentItem,
    boxName: string,
    dossierName: string
  ) => {
    const deptCode = dept.code || 'VP';
    const shelfCode = shelf.id.replace(/[^a-zA-Z0-9]/g, '');
    const compCode = comp.id.replace(/[^a-zA-Z0-9]/g, '');
    const boxCode = boxName.replace(/[^a-zA-Z0-9]/g, '') || 'H01';
    const dossierCode = (dossierName.match(/HS-[\w\d]+/i) ? dossierName.match(/HS-[\w\d]+/i)![0] : dossierName.slice(0, 8)).replace(/[^a-zA-Z0-9]/g, '') || 'HS01';

    const maVach = `${deptCode}-${shelfCode}-${compCode}-${boxCode}-${dossierCode}`.toUpperCase();

    onChange({
      phongBan: dept.name,
      ke: shelf.name,
      ngan: comp.name,
      hop: boxName,
      hoSo: dossierName,
      maVach,
      // Backward compatibility fields
      donVi: dept.name,
      khuVuc: dept.name,
      kho: dept.name
    });
  };

  // Sync initial prop value if provided
  useEffect(() => {
    if (value) {
      // Find matching Department / Unit
      const dept =
        STORAGE_HIERARCHY_DEPARTMENTS.find(
          d =>
            d.name === value.phongBan ||
            (value.donVi && d.name.includes(value.donVi)) ||
            (value.phongBan && d.name.toLowerCase().includes(value.phongBan.toLowerCase()))
        ) || STORAGE_HIERARCHY_DEPARTMENTS[0];

      setSelectedDeptId(dept.id);

      // Find matching Shelf
      const shelf =
        dept.shelves.find(
          s =>
            s.name === value.ke ||
            s.id === value.ke ||
            (value.ke && (s.name.includes(value.ke) || value.ke.includes(s.id)))
        ) || dept.shelves[0];

      if (shelf) {
        setSelectedShelfId(shelf.id);

        // Find matching Compartment
        const comp =
          shelf.compartments.find(
            c =>
              c.name === value.ngan ||
              c.id === value.ngan ||
              (value.ngan && (c.name.includes(value.ngan) || value.ngan.includes(c.id)))
          ) || shelf.compartments[0];

        if (comp) {
          setSelectedCompId(comp.id);

          // Find matching Box
          const box = comp.boxes.find(
            b => b.name === value.hop || b.id === value.hop || (value.hop && b.name.includes(value.hop))
          );
          if (box) {
            setSelectedBoxId(box.id);
            setIsCustomBox(false);
          } else if (value.hop) {
            setIsCustomBox(true);
            setCustomBoxText(value.hop);
          }

          if (value.hoSo) {
            setSelectedDossierName(value.hoSo);
          }
        }
      }
    }
  }, []);

  // Initial trigger if not already set
  useEffect(() => {
    if (!value) {
      const activeBoxName = isCustomBox ? (customBoxText || 'Hộp / Cặp H-01') : currentBox.name;
      const activeDossier = isCustomDossier ? (customDossierText || 'Hồ sơ số 01 (HS-01)') : selectedDossierName;
      buildAndEmitChange(currentDept, currentShelf, currentComp, activeBoxName, activeDossier);
    }
  }, []);

  // 1. Phòng / Ban / Đơn vị con thay đổi
  const handleDeptChange = (deptId: string) => {
    setSelectedDeptId(deptId);
    const dept = STORAGE_HIERARCHY_DEPARTMENTS.find(d => d.id === deptId) || STORAGE_HIERARCHY_DEPARTMENTS[0];
    const shelf = dept.shelves[0];
    const comp = shelf.compartments[0];
    const box = comp.boxes[0];
    const dos = box?.dossiers[0]?.name || 'Hồ sơ số 01 (HS-01)';

    setSelectedShelfId(shelf.id);
    setSelectedCompId(comp.id);
    setSelectedBoxId(box?.id || 'H-01');
    setIsCustomBox(false);
    setSelectedDossierName(dos);
    setIsCustomDossier(false);

    buildAndEmitChange(dept, shelf, comp, box?.name || 'Hộp / Cặp H-01', dos);
  };

  // 2. Kệ thay đổi
  const handleShelfChange = (shelfId: string) => {
    setSelectedShelfId(shelfId);
    const shelf = currentDept.shelves.find(s => s.id === shelfId) || currentDept.shelves[0];
    const comp = shelf.compartments[0] || { id: 'N-01', name: 'Ngăn N-01', boxes: [] };
    const box = comp.boxes[0] || { id: 'H-01', name: 'Hộp / Cặp H-01', dossiers: [] };
    const dos = box.dossiers[0]?.name || 'Hồ sơ số 01 (HS-01)';

    setSelectedCompId(comp.id);
    setSelectedBoxId(box.id);
    setIsCustomBox(false);
    setSelectedDossierName(dos);
    setIsCustomDossier(false);

    buildAndEmitChange(currentDept, shelf, comp, box.name, dos);
  };

  // 3. Ngăn thay đổi
  const handleCompChange = (compId: string) => {
    setSelectedCompId(compId);
    const comp = currentShelf.compartments.find(c => c.id === compId) || currentShelf.compartments[0];
    const box = comp.boxes[0] || { id: 'H-01', name: 'Hộp / Cặp H-01', dossiers: [] };
    const dos = box.dossiers[0]?.name || 'Hồ sơ số 01 (HS-01)';

    setSelectedBoxId(box.id);
    setIsCustomBox(false);
    setSelectedDossierName(dos);
    setIsCustomDossier(false);

    buildAndEmitChange(currentDept, currentShelf, comp, box.name, dos);
  };

  // 4. Hộp / Cặp thay đổi
  const handleBoxSelect = (boxId: string) => {
    if (boxId === '__CUSTOM__') {
      setIsCustomBox(true);
      const newBox = 'Hộp / Cặp Mới';
      setCustomBoxText(newBox);
      buildAndEmitChange(currentDept, currentShelf, currentComp, newBox, selectedDossierName);
      return;
    }

    setIsCustomBox(false);
    setSelectedBoxId(boxId);
    const box = currentComp.boxes.find(b => b.id === boxId) || currentComp.boxes[0];
    const dos = box?.dossiers[0]?.name || selectedDossierName;
    setSelectedDossierName(dos);

    buildAndEmitChange(currentDept, currentShelf, currentComp, box.name, dos);
  };

  const handleCustomBoxChange = (val: string) => {
    setCustomBoxText(val);
    buildAndEmitChange(currentDept, currentShelf, currentComp, val, selectedDossierName);
  };

  // 5. Hồ sơ thay đổi
  const handleDossierSelect = (dosName: string) => {
    if (dosName === '__CUSTOM__') {
      setIsCustomDossier(true);
      const customDos = 'Hồ sơ mới (HS-Mới)';
      setCustomDossierText(customDos);
      const activeBoxName = isCustomBox ? customBoxText : currentBox.name;
      buildAndEmitChange(currentDept, currentShelf, currentComp, activeBoxName, customDos);
      return;
    }

    setIsCustomDossier(false);
    setSelectedDossierName(dosName);
    const activeBoxName = isCustomBox ? customBoxText : currentBox.name;
    buildAndEmitChange(currentDept, currentShelf, currentComp, activeBoxName, dosName);
  };

  const handleCustomDossierChange = (val: string) => {
    setCustomDossierText(val);
    const activeBoxName = isCustomBox ? customBoxText : currentBox.name;
    buildAndEmitChange(currentDept, currentShelf, currentComp, activeBoxName, val);
  };

  const activeBoxDisplay = isCustomBox ? (customBoxText || 'Hộp / Cặp tùy chỉnh') : currentBox.name;
  const activeDossierDisplay = isCustomDossier ? (customDossierText || 'Hồ sơ tùy chỉnh') : selectedDossierName;

  const currentBarcode =
    value?.maVach ||
    `${currentDept.code}-${currentShelf.id.replace(/[^a-zA-Z0-9]/g, '')}-${currentComp.id.replace(/[^a-zA-Z0-9]/g, '')}-${currentBox.name.replace(/[^a-zA-Z0-9]/g, '')}-HS01`.toUpperCase();

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xs">
      {/* Header Info Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-3.5 border-b border-gray-200 gap-2.5">
        <div className="flex items-start gap-2.5">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Định vị Kho Lưu Trữ Vật Lý (5 Cấp)
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-300">
                Phòng / Ban / Đơn vị con → Kệ → Ngăn → Hộp / Cặp → Hồ sơ
              </span>
            </div>
            <p className="text-[11px] text-gray-500 font-medium mt-0.5">
              Chuẩn hóa 5 cấp định vị đơn giản, chính xác theo luồng nghiệp vụ Tổng công ty ĐSVN
            </p>
          </div>
        </div>

        {/* Dynamic Barcode Badge */}
        <div className="flex items-center gap-2 bg-slate-900 text-emerald-400 px-3 py-1.5 rounded-xl border border-slate-800 shadow-xs self-start md:self-auto shrink-0">
          <Barcode className="w-4 h-4 text-emerald-400" />
          <div className="text-left">
            <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider leading-none">Mã Vạch Lưu Trữ (5 Cấp)</div>
            <div className="font-mono text-xs font-bold text-emerald-300 tracking-wide">{currentBarcode}</div>
          </div>
        </div>
      </div>

      {/* 5 Hierarchical Selectors Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {/* 1. PHÒNG / BAN / ĐƠN VỊ CON */}
        <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-3 space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs text-slate-800 font-bold uppercase tracking-wide">
            <Building2 className="w-3.5 h-3.5 text-blue-700 shrink-0" />
            <span className="truncate">1. Phòng / Ban / Đơn vị con</span>
            <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedDeptId}
            onChange={(e) => handleDeptChange(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition shadow-2xs"
          >
            {STORAGE_HIERARCHY_DEPARTMENTS.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.type === 'DON_VI_CON' ? '🏢' : '🏛️'} {dept.name} ({dept.code})
              </option>
            ))}
          </select>
          <div className="text-[10px] text-gray-500 truncate">
            Mã định danh: <strong className="text-slate-700">{currentDept.code}</strong>
          </div>
        </div>

        {/* 2. KỆ */}
        <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-3 space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs text-slate-800 font-bold uppercase tracking-wide">
            <Layers className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span>2. Kệ</span>
            <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedShelfId}
            onChange={(e) => handleShelfChange(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition shadow-2xs"
          >
            {currentDept.shelves.map((shelf) => (
              <option key={shelf.id} value={shelf.id}>
                🗄️ {shelf.name}
              </option>
            ))}
          </select>
          <div className="text-[10px] text-gray-500 truncate">
            Số ngăn: <strong className="text-slate-700">{currentShelf.compartments.length} ngăn</strong>
          </div>
        </div>

        {/* 3. NGĂN */}
        <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-3 space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs text-slate-800 font-bold uppercase tracking-wide">
            <Box className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span>3. Ngăn</span>
            <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedCompId}
            onChange={(e) => handleCompChange(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition shadow-2xs"
          >
            {currentShelf.compartments.map((comp) => (
              <option key={comp.id} value={comp.id}>
                📦 {comp.name}
              </option>
            ))}
          </select>
          <div className="text-[10px] text-gray-500 truncate">
            Số hộp/cặp: <strong className="text-slate-700">{currentComp.boxes.length} hộp</strong>
          </div>
        </div>

        {/* 4. HỘP / CẶP */}
        <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-3 space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs text-slate-800 font-bold uppercase tracking-wide">
            <FolderArchive className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>4. Hộp / Cặp</span>
            <span className="text-red-500">*</span>
          </label>
          {!isCustomBox ? (
            <select
              value={selectedBoxId}
              onChange={(e) => handleBoxSelect(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition shadow-2xs"
            >
              {currentComp.boxes.map((box) => (
                <option key={box.id} value={box.id}>
                  📁 {box.name} ({box.dossiers.length} hồ sơ)
                </option>
              ))}
              <option value="__CUSTOM__">➕ Nhập hộp / cặp mới...</option>
            </select>
          ) : (
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={customBoxText}
                onChange={(e) => handleCustomBoxChange(e.target.value)}
                placeholder="Ví dụ: Hộp / Cặp H-12..."
                className="w-full bg-white border border-amber-400 rounded-lg px-2.5 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-200"
              />
              <button
                type="button"
                onClick={() => setIsCustomBox(false)}
                className="text-[10px] text-blue-700 font-bold px-1.5 py-1 hover:underline shrink-0"
              >
                Danh mục
              </button>
            </div>
          )}
          <div className="text-[10px] text-gray-500 truncate">
            Đang chọn: <strong className="text-amber-700">{activeBoxDisplay}</strong>
          </div>
        </div>

        {/* 5. HỒ SƠ */}
        <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-3 space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs text-slate-800 font-bold uppercase tracking-wide">
            <FileText className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span>5. Hồ sơ</span>
            <span className="text-red-500">*</span>
          </label>
          {!isCustomDossier ? (
            <select
              value={selectedDossierName}
              onChange={(e) => handleDossierSelect(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition shadow-2xs"
            >
              {currentBox.dossiers.length > 0 ? (
                currentBox.dossiers.map((dos) => (
                  <option key={dos.id} value={dos.name}>
                    📑 {dos.name} - {dos.title}
                  </option>
                ))
              ) : (
                <option value="Hồ sơ số 01 (HS-01)">📑 Hồ sơ số 01 (HS-01)</option>
              )}
              <option value="__CUSTOM__">➕ Nhập hồ sơ mới...</option>
            </select>
          ) : (
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={customDossierText}
                onChange={(e) => handleCustomDossierChange(e.target.value)}
                placeholder="Ví dụ: Hồ sơ số 03 (HS-03)..."
                className="w-full bg-white border border-rose-400 rounded-lg px-2.5 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-rose-200"
              />
              <button
                type="button"
                onClick={() => setIsCustomDossier(false)}
                className="text-[10px] text-blue-700 font-bold px-1.5 py-1 hover:underline shrink-0"
              >
                Danh mục
              </button>
            </div>
          )}
          <div className="text-[10px] text-gray-500 truncate" title={activeDossierDisplay}>
            Gán vào: <strong className="text-rose-700">{activeDossierDisplay}</strong>
          </div>
        </div>
      </div>

      {/* Visual Hierarchy Chain Breadcrumb (5 Cấp) */}
      <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-purple-50/70 border border-blue-200 rounded-xl p-3 text-xs space-y-2">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Chuỗi tọa độ lưu trữ đầy đủ (5 Cấp tiêu chuẩn):</span>
          </span>
          <span className="font-mono text-[10px] text-blue-800 bg-white/80 px-2 py-0.5 rounded border border-blue-200">
            Mã vạch / RFID: {currentBarcode}
          </span>
        </div>

        <div className="flex items-center flex-wrap gap-1.5 text-xs font-semibold">
          {/* 1. Phòng / Ban / Đơn vị con */}
          <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-blue-200 text-blue-900 shadow-2xs">
            <Building2 className="w-3 h-3 text-blue-700" />
            <span>{currentDept.name}</span>
          </span>

          <ArrowRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />

          {/* 2. Kệ */}
          <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-indigo-200 text-indigo-900 shadow-2xs">
            <Layers className="w-3 h-3 text-indigo-600" />
            <span>{currentShelf.name.split('(')[0]}</span>
          </span>

          <ArrowRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />

          {/* 3. Ngăn */}
          <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-teal-200 text-teal-900 shadow-2xs">
            <Box className="w-3 h-3 text-teal-600" />
            <span>{currentComp.name.split('(')[0]}</span>
          </span>

          <ArrowRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />

          {/* 4. Hộp / Cặp */}
          <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-amber-200 text-amber-900 shadow-2xs">
            <FolderArchive className="w-3 h-3 text-amber-600" />
            <span>{activeBoxDisplay}</span>
          </span>

          <ArrowRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />

          {/* 5. Hồ sơ */}
          <span className="inline-flex items-center gap-1 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-300 text-rose-900 font-bold shadow-2xs">
            <FileText className="w-3 h-3 text-rose-600" />
            <span>{activeDossierDisplay}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
