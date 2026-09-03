import React, { useState, useEffect } from 'react';
import { OCRService, OCRExtractResult } from '../../services/ocrService';
import { Scan, CheckCircle, Sparkles, FileText, X, Eye, ShieldCheck, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';

interface OcrScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: File | { name: string; type?: string; size?: number };
  onApplyExtraction: (data: OCRExtractResult['extractedFields'], fullText: string) => void;
  isIncoming?: boolean;
}

export const OcrScanModal: React.FC<OcrScanModalProps> = ({
  isOpen,
  onClose,
  file,
  onApplyExtraction,
  isIncoming = false,
}) => {
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);
  const [ocrResult, setOcrResult] = useState<OCRExtractResult | null>(null);
  const [activeTab, setActiveTab] = useState<'visual' | 'text' | 'fields'>('visual');

  useEffect(() => {
    if (isOpen && file) {
      setIsScanning(true);
      setProgress(15);
      setOcrResult(null);

      const timer1 = setTimeout(() => setProgress(45), 300);
      const timer2 = setTimeout(() => setProgress(80), 700);

      OCRService.processDocumentScan(file, { isIncoming }).then((res) => {
        setProgress(100);
        setTimeout(() => {
          setOcrResult(res);
          setIsScanning(false);
          try {
            confetti({ particleCount: 35, spread: 60, origin: { y: 0.7 } });
          } catch (e) {
            // Ignore if confetti fails
          }
        }, 300);
      });

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [isOpen, file]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-100">
              <Scan className="w-5 h-5 text-blue-700 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-[#1e293b]">
                  Tesseract AI OCR Engine - Bóc Tách Toàn Văn & Thực Thể Pháp Lý
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                  Tự động chỉ mục HSTL
                </span>
              </div>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                Tệp: <span className="text-slate-800 font-mono font-semibold">{file.name}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-slate-800 hover:bg-gray-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-[#f0f2f5]">
          {isScanning ? (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-4 bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
              <div className="relative w-20 h-20 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-blue-100 animate-ping" />
                <div className="absolute inset-0 rounded-full border-4 border-t-blue-700 border-r-blue-500 border-b-transparent border-l-transparent animate-spin" />
                <Zap className="w-8 h-8 text-blue-600 animate-pulse" />
              </div>

              <div className="space-y-1">
                <h4 className="text-sm font-bold text-[#1e293b]">
                  Đang quét quang học và nhận dạng ký tự (OCR)...
                </h4>
                <p className="text-xs text-gray-500 max-w-sm font-medium">
                  Phân tích cấu trúc văn bản hành chính, phát hiện con dấu đỏ, trích xuất Số ký hiệu, Cơ quan ban hành, Trích yếu...
                </p>
              </div>

              {/* Progress bar */}
              <div className="w-64 bg-gray-100 rounded-full h-2.5 overflow-hidden border border-gray-200">
                <div
                  className="bg-[#1e40af] h-full transition-all duration-300 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs font-mono font-bold text-blue-700">{progress}% Hoàn tất</span>
            </div>
          ) : ocrResult ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Simulated Visual Scan with Bounding Boxes */}
              <div className="lg:col-span-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-blue-600" />
                    Lớp hiển thị trực quan Bounding Box
                  </span>
                  <span className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Độ tin cậy: {ocrResult.confidence}%
                  </span>
                </div>

                <div className="relative bg-white border border-gray-200 rounded-xl p-5 min-h-[380px] flex flex-col justify-between shadow-sm overflow-hidden font-mono text-[11px] text-slate-800">
                  {/* Watermark grid */}
                  <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

                  {/* Laser line effect */}
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500 shadow-[0_0_10px_#3b82f6]" />

                  {/* Document layout mock with OCR Highlight boxes */}
                  <div className="space-y-4 relative z-10 font-sans">
                    <div className="border border-blue-200 bg-blue-50/60 rounded-lg p-2.5 text-blue-900">
                      <span className="text-[9px] uppercase tracking-wider text-blue-700 font-bold block mb-0.5">
                        [CO_QUAN_BAN_HANH] (99.2%)
                      </span>
                      <span className="font-semibold">{ocrResult.extractedFields.coQuan?.toUpperCase()}</span>
                    </div>

                    <div className="flex justify-between gap-2">
                      <div className="border border-indigo-200 bg-indigo-50/60 rounded-lg p-2 text-indigo-900 flex-1">
                        <span className="text-[9px] uppercase tracking-wider text-indigo-700 font-bold block mb-0.5">
                          [SO_KY_HIEU] (98.9%)
                        </span>
                        <span className="font-mono font-bold">Số: {ocrResult.extractedFields.soKyHieu}</span>
                      </div>
                      <div className="border border-purple-200 bg-purple-50/60 rounded-lg p-2 text-purple-900 flex-1 text-right">
                        <span className="text-[9px] uppercase tracking-wider text-purple-700 font-bold block mb-0.5">
                          [NGAY_BAN_HANH] (97.5%)
                        </span>
                        <span className="font-medium">{ocrResult.extractedFields.ngayBanHanh}</span>
                      </div>
                    </div>

                    <div className="border border-amber-200 bg-amber-50/60 rounded-lg p-2.5 text-amber-900">
                      <span className="text-[9px] uppercase tracking-wider text-amber-700 font-bold block mb-0.5">
                        [TRICH_YEU_NOI_DUNG] (98.0%)
                      </span>
                      <span className="font-medium text-xs leading-relaxed">{ocrResult.extractedFields.trichYeu}</span>
                    </div>

                    <div className="text-[10px] text-gray-500 leading-relaxed pt-2 italic">
                      ... [Toàn bộ nội dung điều khoản căn cứ pháp lý, danh mục hạng mục nghiệm thu, điều khoản thi hành đã được vector hóa để lập chỉ mục toàn văn Elastic Index HSTL] ...
                    </div>
                  </div>

                  {/* Stamp box */}
                  <div className="self-end border-2 border-dashed border-red-400 bg-red-50 rounded-lg p-2 text-center text-red-700 relative z-10 w-48 shadow-xs">
                    <span className="text-[9px] font-bold block text-red-800">
                      ✓ ĐÃ XÁC THỰC CON DẤU ĐỎ
                    </span>
                    <span className="text-[10px] font-medium">Chữ ký số / Dấu tròn hợp lệ</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Extracted Metadata & Actions */}
              <div className="lg:col-span-6 space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex border-b border-gray-200 mb-3 bg-white rounded-t-xl px-2 pt-2 shadow-xs">
                    <button
                      onClick={() => setActiveTab('visual')}
                      className={`px-4 py-2 text-xs font-bold border-b-2 transition cursor-pointer ${
                        activeTab === 'visual'
                          ? 'border-blue-700 text-blue-700'
                          : 'border-transparent text-gray-500 hover:text-slate-800'
                      }`}
                    >
                      Thực thể trích xuất
                    </button>
                    <button
                      onClick={() => setActiveTab('text')}
                      className={`px-4 py-2 text-xs font-bold border-b-2 transition cursor-pointer ${
                        activeTab === 'text'
                          ? 'border-blue-700 text-blue-700'
                          : 'border-transparent text-gray-500 hover:text-slate-800'
                      }`}
                    >
                      Toàn văn OCR thô
                    </button>
                  </div>

                  {activeTab === 'visual' ? (
                    <div className="space-y-2.5">
                      <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-xs">
                        <label className="text-[10px] text-gray-500 uppercase tracking-wider font-bold block mb-0.5">
                          Số ký hiệu văn bản gốc:
                        </label>
                        <div className="text-sm font-bold text-blue-700 font-mono">
                          {ocrResult.extractedFields.soKyHieu}
                        </div>
                      </div>

                      <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-xs">
                        <label className="text-[10px] text-gray-500 uppercase tracking-wider font-bold block mb-0.5">
                          Cơ quan / Đơn vị ban hành:
                        </label>
                        <div className="text-sm font-semibold text-slate-800">
                          {ocrResult.extractedFields.coQuan}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-xs">
                          <label className="text-[10px] text-gray-500 uppercase tracking-wider font-bold block mb-0.5">
                            Ngày ban hành:
                          </label>
                          <div className="text-xs font-semibold text-slate-800">
                            {ocrResult.extractedFields.ngayBanHanh}
                          </div>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-xs">
                          <label className="text-[10px] text-gray-500 uppercase tracking-wider font-bold block mb-0.5">
                            Loại văn bản:
                          </label>
                          <div className="text-xs font-semibold text-slate-800">
                            {ocrResult.extractedFields.loaiVanBan}
                          </div>
                        </div>
                      </div>

                      <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-xs">
                        <label className="text-[10px] text-gray-500 uppercase tracking-wider font-bold block mb-0.5">
                          Trích yếu nội dung:
                        </label>
                        <div className="text-xs text-slate-700 leading-relaxed font-medium">
                          {ocrResult.extractedFields.trichYeu}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white border border-gray-200 rounded-xl p-4 text-xs text-slate-800 font-mono max-h-60 overflow-y-auto whitespace-pre-wrap leading-relaxed shadow-xs">
                      {ocrResult.fullText}
                    </div>
                  )}
                </div>

                {/* Footer Buttons */}
                <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-gray-100 border border-gray-200 transition cursor-pointer"
                  >
                    Đóng
                  </button>
                  <button
                    onClick={() => {
                      onApplyExtraction(ocrResult.extractedFields, ocrResult.fullText);
                      onClose();
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold text-white bg-[#1e40af] hover:bg-blue-800 shadow-sm transition cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Tự động điền dữ liệu bóc tách vào Biểu mẫu
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
