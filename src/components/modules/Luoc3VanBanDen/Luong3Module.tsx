import React, { useState } from 'react';
import { IncomingDocument, UserProfile, RetentionPeriod, PhysicalLocation } from '../../../types';
import { StorageService } from '../../../services/storageService';
import { OcrScanModal } from '../../common/OcrScanModal';
import { PhysicalLocationSelector } from '../../common/PhysicalLocationSelector';
import { HighlightText, getOcrSnippet, matchesQuery } from '../../../utils/highlight';
import { 
  Inbox, 
  Scan, 
  UploadCloud, 
  Users, 
  Calendar, 
  FileText, 
  CheckCircle, 
  Search, 
  Download, 
  Filter, 
  Eye, 
  Archive, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Luong3ModuleProps {
  currentUser: UserProfile;
  onOpenViewer: (doc: IncomingDocument, searchKeyword?: string) => void;
}

export const Luong3Module: React.FC<Luong3ModuleProps> = ({ currentUser, onOpenViewer }) => {
  const [incomingDocs, setIncomingDocs] = useState<IncomingDocument[]>(StorageService.getIncomingDocs());
  const [isRegistering, setIsRegistering] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Form Registration State
  const nextSoDen = Math.max(...incomingDocs.map(d => d.soDen), 1040) + 1;
  const [soDen, setSoDen] = useState<number>(nextSoDen);
  const [soKyHieuGoc, setSoKyHieuGoc] = useState('');
  const [coQuanGui, setCoQuanGui] = useState('');
  const [ngayBanHanh, setNgayBanHanh] = useState(new Date().toISOString().split('T')[0]);
  const [ngayDen, setNgayDen] = useState(new Date().toISOString().split('T')[0]);
  const [trichYeu, setTrichYeu] = useState('');
  const [loaiVanBan, setLoaiVanBan] = useState('Công văn');
  const [donViChuTri, setDonViChuTri] = useState('Ban Kỹ thuật - Hạ tầng Cơ sở');
  const [donViPhoiHop, setDonViPhoiHop] = useState<string[]>(['Ban Vận tải Đường sắt']);
  const [canBoTheoDoi, setCanBoTheoDoi] = useState('Nguyễn Văn Cường');
  const [hanXuLy, setHanXuLy] = useState(
    new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0]
  );
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string; type: string } | null>(null);
  const [ocrModalOpen, setOcrModalOpen] = useState(false);
  const [ocrConfidence, setOcrConfidence] = useState(0);
  const [fullOcrText, setFullOcrText] = useState('');

  // Sơ đồ kho vật lý & Thời hạn bảo quản
  const [retentionPeriod, setRetentionPeriod] = useState<RetentionPeriod>('10 NĂM');
  const [physicalLocation, setPhysicalLocation] = useState<PhysicalLocation>({
    kho: 'Kho Lưu trữ Trung tâm Số 1',
    ke: 'Kệ K-01',
    ngan: 'Ngăn N-04',
    hop: 'Hộp H-06',
    maVach: 'HSTL-K1-K01-N04-H06'
  });

  const reloadData = () => {
    setIncomingDocs(StorageService.getIncomingDocs());
  };

  const handleRegisterIncoming = (e: React.FormEvent) => {
    e.preventDefault();
    if (!soKyHieuGoc || !coQuanGui || !trichYeu) {
      alert('Vui lòng nhập đầy đủ Số hiệu gốc, Cơ quan gửi và Trích yếu văn bản đến!');
      return;
    }

    const newIncoming: IncomingDocument = {
      id: 'in-' + Date.now(),
      soDen,
      namDen: new Date().getFullYear(),
      soKyHieuGoc,
      coQuanGui,
      ngayBanHanh,
      ngayDen,
      trichYeu,
      loaiVanBan,
      fileScanUrl: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=800&auto=format&fit=crop&q=80',
      fileName: uploadedFile?.name || `${soKyHieuGoc.replace(/\//g, '_')}_Den.pdf`,
      fileSize: uploadedFile?.size || '3.5 MB',
      ocrExtracted: {
        soDenSuggested: soDen,
        soKyHieuSuggested: soKyHieuGoc,
        coQuanSuggested: coQuanGui,
        ngayBanHanhSuggested: ngayBanHanh,
        trichYeuSuggested: trichYeu,
        fullOcrText: fullOcrText || `SỔ ĐĂNG KÝ VĂN BẢN ĐẾN\nSố đến: ${soDen}\nSố hiệu gốc: ${soKyHieuGoc}\nCơ quan gửi: ${coQuanGui}\nTrích yếu: ${trichYeu}`,
        confidence: ocrConfidence || 98.8
      },
      donViChuTri,
      donViPhoiHop,
      canBoTheoDoi,
      hanXuLy,
      trangThaiXuLy: 'DANG_XU_LY',
      isArchivedToHSTL: true,
      hstlCode: `HSTL-VBD-${new Date().getFullYear()}-${soDen}`,
      retentionPeriod,
      physicalLocation,
      registeredBy: currentUser.id,
      registeredByName: currentUser.name
    };

    StorageService.addIncomingDoc(newIncoming);
    reloadData();
    setIsRegistering(false);
    resetForm();
    try {
      confetti({ particleCount: 40, spread: 60 });
    } catch (e) {}
  };

  const resetForm = () => {
    setSoKyHieuGoc('');
    setCoQuanGui('');
    setTrichYeu('');
    setUploadedFile(null);
    setFullOcrText('');
    setOcrConfidence(0);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setUploadedFile({
        name: f.name,
        size: (f.size / (1024 * 1024)).toFixed(1) + ' MB',
        type: f.type
      });
      setOcrModalOpen(true);
    }
  };

  const handleExportRegistry = () => {
    alert('Đang kết xuất Sổ Đăng ký Văn bản Đến năm 2026 chuẩn biểu mẫu Nghị định 30/2020/NĐ-CP (Excel/PDF)...');
  };

  const filteredDocs = incomingDocs.filter(d => {
    const fullOcr = d.ocrExtracted?.fullOcrText || `${d.soDen} ${d.soKyHieuGoc} ${d.coQuanGui} ${d.trichYeu} ${d.donViChuTri} ${d.loaiVanBan}`;
    const matchesSearch = matchesQuery(
      searchTerm,
      d.soDen.toString(),
      d.soKyHieuGoc,
      d.coQuanGui,
      d.trichYeu,
      d.donViChuTri,
      d.loaiVanBan,
      fullOcr
    );

    if (statusFilter === 'ALL') return matchesSearch;
    return matchesSearch && d.trangThaiXuLy === statusFilter;
  });

  return (
    <div className="p-6 space-y-6 text-slate-800">
      {/* Module Banner */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-gray-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-teal-50 text-teal-700 border border-teal-200">
                LUỒNG 3
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                Quản lý & Số hóa Sổ Văn bản Đến (Incoming Docs Archive)
              </h2>
            </div>
            <p className="text-xs text-gray-500 mt-1 font-medium">
              Bản chất: Tiếp nhận các văn bản đến từ cơ quan bên ngoài hoặc đơn vị trực thuộc (đã có chữ ký, con dấu đỏ hợp lệ).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportRegistry}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 bg-gray-100 hover:bg-gray-200 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Xuất Sổ Văn bản Đến
            </button>
            <button
              onClick={() => {
                resetForm();
                setSoDen(Math.max(...incomingDocs.map(d => d.soDen), 1040) + 1);
                setIsRegistering(true);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 shadow-sm transition cursor-pointer"
            >
              <Scan className="w-4 h-4" />
              📥 Tiếp nhận & OCR Vào Sổ Đến
            </button>
          </div>
        </div>

        {/* 3 Steps Pipeline */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4">
          <div className="bg-teal-50/70 border border-teal-200 rounded-xl p-3 flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-teal-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">1</span>
            <div className="text-xs">
              <div className="font-bold text-teal-900">Quét OCR & Vào Sổ Đến</div>
              <div className="text-[11px] text-gray-500 font-medium">Tự động trích xuất: Số đến, Số gốc, Ngày, Trích yếu</div>
            </div>
          </div>

          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">2</span>
            <div className="text-xs">
              <div className="font-bold text-blue-900">Chuyển giao Xử lý</div>
              <div className="text-[11px] text-gray-500 font-medium">Phân công đơn vị chủ trì, phối hợp & SLA</div>
            </div>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">3</span>
            <div className="text-xs">
              <div className="font-bold text-emerald-900">Lưu Thư viện HSTL</div>
              <div className="text-[11px] text-gray-500 font-medium">Lập chỉ mục toàn văn cho toàn cơ quan tra cứu</div>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Form */}
      {isRegistering && (
        <div className="bg-white border border-teal-300 rounded-2xl p-6 shadow-md space-y-6 animate-fadeIn text-slate-800">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <div className="flex items-center gap-2">
              <Inbox className="w-5 h-5 text-teal-700" />
              <h3 className="text-sm font-bold text-slate-900">
                Tiếp nhận Scan Văn bản Đến, Tự động Bóc tách OCR & Đăng ký Sổ Đến
              </h3>
            </div>
            <button
              onClick={() => setIsRegistering(false)}
              className="text-xs font-semibold text-gray-600 hover:text-slate-900 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 cursor-pointer"
            >
              Hủy
            </button>
          </div>

          {/* Upload and OCR Trigger Box */}
          <div className="border-2 border-dashed border-teal-300 hover:border-teal-500 rounded-2xl p-5 bg-teal-50/40 text-center transition">
            <input
              type="file"
              id="incoming-scan-file"
              onChange={handleFileUpload}
              accept=".pdf,.jpg,.png,.docx"
              className="hidden"
            />
            <label htmlFor="incoming-scan-file" className="cursor-pointer block space-y-1">
              <UploadCloud className="w-7 h-7 mx-auto text-teal-600" />
              <span className="text-xs font-bold text-teal-800 hover:underline">
                Tải lên bản scan văn bản đến có dấu đỏ (.pdf, .jpg, .png)
              </span>
              <p className="text-[11px] text-gray-500 font-medium">
                Tesseract OCR sẽ tự động đọc Số ký hiệu, Cơ quan gửi, Ngày ban hành và Trích yếu để điền sẵn cho Văn thư
              </p>
            </label>

            {uploadedFile && (
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-teal-200 text-xs font-mono text-teal-800 shadow-xs">
                <span className="font-bold">✓ {uploadedFile.name}</span>
                <button
                  type="button"
                  onClick={() => setOcrModalOpen(true)}
                  className="text-[10px] text-blue-600 font-bold underline font-sans cursor-pointer"
                >
                  Quét lại OCR
                </button>
              </div>
            )}
          </div>

          <form onSubmit={handleRegisterIncoming} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  1. Số đến (Tự động tăng) <span className="text-teal-600 font-mono">*</span>
                </label>
                <input
                  type="number"
                  required
                  value={soDen}
                  onChange={(e) => setSoDen(parseInt(e.target.value) || 0)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-teal-700 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  2. Số hiệu gốc văn bản <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: 512/BGTVT-VT, 24/BC-KTHUAT"
                  value={soKyHieuGoc}
                  onChange={(e) => setSoKyHieuGoc(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-teal-600 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  3. Cơ quan / Đơn vị gửi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Bộ Giao thông Vận tải, Cục Đường sắt..."
                  value={coQuanGui}
                  onChange={(e) => setCoQuanGui(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-teal-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  4. Ngày ban hành gốc
                </label>
                <input
                  type="date"
                  required
                  value={ngayBanHanh}
                  onChange={(e) => setNgayBanHanh(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  5. Ngày văn thư tiếp nhận
                </label>
                <input
                  type="date"
                  required
                  value={ngayDen}
                  onChange={(e) => setNgayDen(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  6. Loại văn bản đến
                </label>
                <select
                  value={loaiVanBan}
                  onChange={(e) => setLoaiVanBan(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-teal-600 cursor-pointer"
                >
                  <option value="Công văn">Công văn</option>
                  <option value="Báo cáo">Báo cáo</option>
                  <option value="Quyết định">Quyết định</option>
                  <option value="Tờ trình">Tờ trình</option>
                  <option value="Thông báo">Thông báo</option>
                  <option value="Giấy mời">Giấy mời</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                7. Trích yếu nội dung văn bản đến <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={2}
                required
                placeholder="Nhập tóm tắt nội dung văn bản đến..."
                value={trichYeu}
                onChange={(e) => setTrichYeu(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-teal-600"
              />
            </div>

            {/* Chuyển giao xử lý */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                Phân công Chuyển giao Xử lý & Hạn giải quyết (SLA)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Đơn vị chủ trì:
                  </label>
                  <select
                    value={donViChuTri}
                    onChange={(e) => setDonViChuTri(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 cursor-pointer"
                  >
                    <option value="Ban Kỹ thuật - Hạ tầng Cơ sở">Ban Kỹ thuật - Hạ tầng Cơ sở</option>
                    <option value="Ban Vận tải Đường sắt">Ban Vận tải Đường sắt</option>
                    <option value="Ban An toàn Giao thông">Ban An toàn Giao thông</option>
                    <option value="Ban Tài chính - Kế toán">Ban Tài chính - Kế toán</option>
                    <option value="Văn phòng Tổng công ty">Văn phòng Tổng công ty</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Cán bộ theo dõi:
                  </label>
                  <input
                    type="text"
                    value={canBoTheoDoi}
                    onChange={(e) => setCanBoTheoDoi(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Hạn xử lý SLA:
                  </label>
                  <input
                    type="date"
                    value={hanXuLy}
                    onChange={(e) => setHanXuLy(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>
            </div>

            {/* Định vị Kho vật lý */}
            <div>
              <PhysicalLocationSelector
                value={physicalLocation}
                onChange={setPhysicalLocation}
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setIsRegistering(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-slate-900 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 shadow-sm cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" />
                Đăng ký Sổ Đến & Lưu Thư Viện HSTL
              </button>
            </div>
          </form>
        </div>
      )}

      {/* OCR Scan Modal */}
      {uploadedFile && (
        <OcrScanModal
          isOpen={ocrModalOpen}
          onClose={() => setOcrModalOpen(false)}
          file={uploadedFile}
          isIncoming={true}
          onApplyExtraction={(fields, fullText) => {
            if (fields.soDen) setSoDen(fields.soDen);
            if (fields.soKyHieu) setSoKyHieuGoc(fields.soKyHieu);
            if (fields.coQuan) setCoQuanGui(fields.coQuan);
            if (fields.ngayBanHanh) setNgayBanHanh(fields.ngayBanHanh);
            if (fields.trichYeu) setTrichYeu(fields.trichYeu);
            if (fields.loaiVanBan) setLoaiVanBan(fields.loaiVanBan);
            setFullOcrText(fullText);
            setOcrConfidence(fields.confidence || 99.0);
          }}
        />
      )}

      {/* Registry Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 bg-gray-50/80 border-b border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm số đến, số gốc, cơ quan gửi, trích yếu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            <span className="text-gray-500 font-medium">Sổ năm 2026</span>
            <span className="text-teal-800 font-bold px-2 py-0.5 rounded bg-teal-50 border border-teal-200">
              Tổng: {incomingDocs.length} văn bản
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 min-w-[720px]">
            <thead className="bg-blue-50/80 text-[11px] uppercase tracking-wider text-blue-950 font-bold border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Số Đến</th>
                <th className="py-3 px-4">Số hiệu gốc & Ngày</th>
                <th className="py-3 px-4">Cơ quan gửi</th>
                <th className="py-3 px-4">Trích yếu nội dung</th>
                <th className="py-3 px-4">Đơn vị chủ trì & SLA</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500 font-medium">
                    Không tìm thấy văn bản đến nào khớp với từ khóa "{searchTerm}"
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => {
                  const fullOcr = doc.ocrExtracted?.fullOcrText || `${doc.soDen} ${doc.soKyHieuGoc} ${doc.coQuanGui} ${doc.trichYeu} ${doc.donViChuTri} ${doc.loaiVanBan}`;
                  const ocrSnippet = getOcrSnippet(fullOcr, searchTerm);
                  const matchedInOcr = searchTerm.trim() && ocrSnippet;

                  return (
                    <tr key={doc.id} className="hover:bg-blue-50/40 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-teal-700">
                        #<HighlightText text={doc.soDen.toString()} search={searchTerm} />
                        <div className="text-[10px] text-gray-500 font-medium">{doc.ngayDen}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-mono text-blue-700 font-bold">
                          <HighlightText text={doc.soKyHieuGoc} search={searchTerm} />
                        </span>
                        <div className="text-[10px] text-gray-500 font-medium">{doc.ngayBanHanh}</div>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        <HighlightText text={doc.coQuanGui} search={searchTerm} />
                      </td>

                      <td className="py-3.5 px-4 max-w-sm">
                        <div className="line-clamp-2 text-slate-800 font-medium">
                          <HighlightText text={doc.trichYeu} search={searchTerm} />
                        </div>
                        <span className="text-[10px] text-emerald-700 font-bold">
                          ✓ Đã lập chỉ mục Thư viện HSTL
                        </span>

                        {/* OCR Match Snippet */}
                        {matchedInOcr && (
                          <div className="mt-1.5 p-1.5 rounded-lg bg-yellow-50 border border-yellow-200 text-[10px] text-slate-800 animate-fadeIn">
                            <div className="font-bold text-amber-900 flex items-center gap-1 mb-0.5">
                              <Sparkles className="w-3 h-3 text-amber-600 shrink-0" />
                              <span>Khớp nội dung văn bản OCR:</span>
                            </div>
                            <div className="font-mono text-slate-700 leading-snug">
                              <HighlightText text={ocrSnippet} search={searchTerm} />
                            </div>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-xs">
                        <div className="text-slate-800 font-semibold">
                          <HighlightText text={doc.donViChuTri} search={searchTerm} />
                        </div>
                        <div className="text-[10px] text-amber-700 font-bold flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Hạn: {doc.hanXuLy}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => onOpenViewer(doc, searchTerm)}
                          className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-slate-700 font-semibold text-xs inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Chi tiết
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
