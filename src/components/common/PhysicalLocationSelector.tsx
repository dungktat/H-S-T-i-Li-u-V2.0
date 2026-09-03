import React, { useState, useEffect } from 'react';
import { PhysicalLocation } from '../../types';
import { WAREHOUSE_STRUCTURE } from '../../data/initialData';
import { Archive, Layers, Box, Tag, MapPin } from 'lucide-react';

interface PhysicalLocationSelectorProps {
  value?: PhysicalLocation;
  onChange: (location: PhysicalLocation) => void;
  required?: boolean;
  accentColor?: string;
}

export const PhysicalLocationSelector: React.FC<PhysicalLocationSelectorProps> = ({
  value,
  onChange,
  required = true,
  accentColor = '#0078D4'
}) => {
  const [selectedKhoId, setSelectedKhoId] = useState<string>('KHO_1');
  const [selectedKeId, setSelectedKeId] = useState<string>('K-01');
  const [selectedNganId, setSelectedNganId] = useState<string>('N-01');
  const [selectedHopId, setSelectedHopId] = useState<string>('H-01');

  const currentKho = WAREHOUSE_STRUCTURE.find(k => k.id === selectedKhoId) || WAREHOUSE_STRUCTURE[0];
  const currentKe = currentKho.shelves.find(s => s.id === selectedKeId) || currentKho.shelves[0];
  const currentNgan = currentKe.compartments.find(c => c.id === selectedNganId) || currentKe.compartments[0];

  useEffect(() => {
    if (value) {
      // Find matching
      const foundKho = WAREHOUSE_STRUCTURE.find(k => k.name === value.kho);
      if (foundKho) {
        setSelectedKhoId(foundKho.id);
        const foundKe = foundKho.shelves.find(s => s.id === value.ke || s.name.includes(value.ke));
        if (foundKe) {
          setSelectedKeId(foundKe.id);
          const foundNgan = foundKe.compartments.find(c => c.id === value.ngan || c.name.includes(value.ngan));
          if (foundNgan) {
            setSelectedNganId(foundNgan.id);
          }
        }
      }
    }
  }, []);

  const handleKhoChange = (khoId: string) => {
    setSelectedKhoId(khoId);
    const kho = WAREHOUSE_STRUCTURE.find(k => k.id === khoId) || WAREHOUSE_STRUCTURE[0];
    const ke = kho.shelves[0];
    const ngan = ke.compartments[0];
    const hop = ngan.boxes[0] || 'H-01';
    setSelectedKeId(ke.id);
    setSelectedNganId(ngan.id);
    setSelectedHopId(hop);
    emitChange(kho.name, ke.name, ngan.name, hop);
  };

  const handleKeChange = (keId: string) => {
    setSelectedKeId(keId);
    const ke = currentKho.shelves.find(s => s.id === keId) || currentKho.shelves[0];
    const ngan = ke.compartments[0];
    const hop = ngan.boxes[0] || 'H-01';
    setSelectedNganId(ngan.id);
    setSelectedHopId(hop);
    emitChange(currentKho.name, ke.name, ngan.name, hop);
  };

  const handleNganChange = (nganId: string) => {
    setSelectedNganId(nganId);
    const ngan = currentKe.compartments.find(c => c.id === nganId) || currentKe.compartments[0];
    const hop = ngan.boxes[0] || 'H-01';
    setSelectedHopId(hop);
    emitChange(currentKho.name, currentKe.name, ngan.name, hop);
  };

  const handleHopChange = (hop: string) => {
    setSelectedHopId(hop);
    emitChange(currentKho.name, currentKe.name, currentNgan.name, hop);
  };

  const emitChange = (khoName: string, keName: string, nganName: string, hopName: string) => {
    const maVach = `HSTL-${selectedKhoId === 'KHO_1' ? 'K1' : 'K2'}-${selectedKeId}-${selectedNganId}-${hopName.replace(/[^a-zA-Z0-9]/g, '')}`;
    onChange({
      kho: khoName,
      ke: keName,
      ngan: nganName,
      hop: hopName,
      maVach: maVach.toUpperCase()
    });
  };

  // Initial trigger if not already set
  useEffect(() => {
    if (!value) {
      emitChange(currentKho.name, currentKe.name, currentNgan.name, currentNgan.boxes[0] || 'H-01');
    }
  }, []);

  const generatedBarcode = value?.maVach || `HSTL-K1-${selectedKeId}-${selectedNganId}-${selectedHopId}`;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-100">
            <Archive className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#1e293b] uppercase tracking-wider">
              Định vị Sơ đồ Kho Vật Lý (Kho ➔ Kệ ➔ Ngăn ➔ Hộp)
            </h4>
            <p className="text-[11px] text-gray-500 font-medium">
              Xác lập tọa độ vật lý theo tiêu chuẩn nghiệp vụ Lưu trữ Quốc gia
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded bg-slate-900 text-emerald-400 self-start sm:self-auto shadow-xs">
          Mã vạch: {generatedBarcode}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {/* Kho */}
        <div>
          <label className="flex items-center gap-1.5 text-xs text-gray-600 font-bold uppercase tracking-wider mb-1.5">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            1. Kho Lưu trữ
          </label>
          <select
            value={selectedKhoId}
            onChange={(e) => handleKhoChange(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition shadow-xs"
          >
            {WAREHOUSE_STRUCTURE.map((kho) => (
              <option key={kho.id} value={kho.id}>
                {kho.name}
              </option>
            ))}
          </select>
        </div>

        {/* Kệ */}
        <div>
          <label className="flex items-center gap-1.5 text-xs text-gray-600 font-bold uppercase tracking-wider mb-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-600" />
            2. Kệ Lưu trữ
          </label>
          <select
            value={selectedKeId}
            onChange={(e) => handleKeChange(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition shadow-xs"
          >
            {currentKho.shelves.map((shelf) => (
              <option key={shelf.id} value={shelf.id}>
                {shelf.name}
              </option>
            ))}
          </select>
        </div>

        {/* Ngăn */}
        <div>
          <label className="flex items-center gap-1.5 text-xs text-gray-600 font-bold uppercase tracking-wider mb-1.5">
            <Box className="w-3.5 h-3.5 text-purple-600" />
            3. Ngăn Kệ
          </label>
          <select
            value={selectedNganId}
            onChange={(e) => handleNganChange(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition shadow-xs"
          >
            {currentKe.compartments.map((comp) => (
              <option key={comp.id} value={comp.id}>
                {comp.name}
              </option>
            ))}
          </select>
        </div>

        {/* Hộp */}
        <div>
          <label className="flex items-center gap-1.5 text-xs text-gray-600 font-bold uppercase tracking-wider mb-1.5">
            <Tag className="w-3.5 h-3.5 text-emerald-600" />
            4. Hộp / Cặp Hồ sơ
          </label>
          <select
            value={selectedHopId}
            onChange={(e) => handleHopChange(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition shadow-xs"
          >
            {currentNgan.boxes.map((box) => (
              <option key={box} value={box}>
                Hộp {box}
              </option>
            ))}
            <option value="H-MỚI">+ Tạo Hộp mới</option>
          </select>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-2.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-slate-700">
          <span className="text-gray-500 font-semibold">Tọa độ đầy đủ:</span>
          <span className="font-bold text-blue-700 font-mono">
            {currentKho.name.split('(')[0]} ➔ {currentKe.name} ➔ {currentNgan.name} ➔ Hộp {selectedHopId}
          </span>
        </div>
        <span className="text-[11px] text-gray-500 font-medium">Sẵn sàng dán nhãn RFID / Barcode</span>
      </div>
    </div>
  );
};
