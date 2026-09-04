import React, { useState, useEffect } from 'react';
import { OllamaServerConfig } from '../../types';
import { OllamaQwenService, DEFAULT_OLLAMA_CONFIG } from '../../services/ollamaQwenService';
import { 
  Server, 
  Cpu, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  HelpCircle, 
  ExternalLink,
  Sliders,
  ShieldCheck,
  Terminal,
  Activity
} from 'lucide-react';

interface OllamaServerConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved?: (config: OllamaServerConfig) => void;
}

export const OllamaServerConfigModal: React.FC<OllamaServerConfigModalProps> = ({
  isOpen,
  onClose,
  onConfigSaved
}) => {
  const [config, setConfig] = useState<OllamaServerConfig>(() => OllamaQwenService.getConfig());
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string; models?: string[] } | null>(null);
  const [showIisGuide, setShowIisGuide] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setConfig(OllamaQwenService.getConfig());
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await OllamaQwenService.testConnection(config.endpointUrl);
      setTestResult(res);
      if (res.ok) {
        setConfig(prev => ({
          ...prev,
          status: 'CONNECTED',
          lastPingTime: new Date().toLocaleTimeString('vi-VN'),
          errorMessage: undefined
        }));
      }
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    OllamaQwenService.saveConfig(config);
    if (onConfigSaved) onConfigSaved(config);
    onClose();
  };

  const handleResetDefault = () => {
    setConfig(DEFAULT_OLLAMA_CONFIG);
    setTestResult(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#003882] via-[#094ba1] to-[#002f70] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/15 border border-white/20 text-white">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold flex items-center gap-2">
                <span>Cấu Hình Máy Chủ IIS &amp; Ollama Qwen 2.5</span>
              </h3>
              <p className="text-xs text-blue-100">
                Tích hợp mô hình AI Qwen 2.5 chạy qua Ollama trên máy chủ Windows IIS
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/20 text-white cursor-pointer transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-slate-800 text-xs sm:text-sm">
          {/* Status Banner */}
          <div className={`p-3 rounded-xl border flex items-center justify-between ${
            config.status === 'CONNECTED'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            <div className="flex items-center gap-2.5">
              <div className={`w-3 h-3 rounded-full shrink-0 ${
                config.status === 'CONNECTED' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`} />
              <div>
                <div className="font-bold text-xs sm:text-sm">
                  {config.status === 'CONNECTED' 
                    ? 'Máy chủ IIS - Ollama: Đã kết nối' 
                    : 'Chế độ RAG Thông minh Nội bộ (Qwen 2.5)'}
                </div>
                <div className="text-[11px] opacity-85">
                  {config.status === 'CONNECTED'
                    ? `Kết nối trực tiếp tới ${config.endpointUrl} (Model: ${config.model})`
                    : 'Hệ thống tự động tra cứu, trích xuất dữ liệu tài liệu & tổng hợp thông minh'}
                </div>
              </div>
            </div>

            <button
              onClick={handleTestConnection}
              disabled={isTesting}
              className="px-3 py-1.5 bg-white border border-slate-300 hover:border-blue-500 text-blue-800 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs hover:bg-blue-50 cursor-pointer disabled:opacity-50 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'Đang kiểm tra...' : 'Kiểm tra Ping'}</span>
            </button>
          </div>

          {/* Test Result Message */}
          {testResult && (
            <div className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
              testResult.ok 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              {testResult.ok ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="font-bold">{testResult.ok ? 'Kết nối thành công!' : 'Thông báo kết nối'}</div>
                <div className="mt-0.5">{testResult.message}</div>
                {testResult.models && testResult.models.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {testResult.models.map(m => (
                      <span key={m} className="px-1.5 py-0.5 bg-white/80 border border-emerald-200 rounded text-[10px] font-mono font-semibold">
                        {m}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-3.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            {/* Endpoint URL */}
            <div>
              <label className="block font-bold text-slate-700 text-xs mb-1">
                Địa chỉ Endpoint máy chủ IIS / Ollama:
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={config.endpointUrl}
                  onChange={(e) => setConfig({ ...config, endpointUrl: e.target.value })}
                  placeholder="http://localhost:11434 hoặc http://iis-server/ollama"
                  className="w-full pl-3 pr-24 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setConfig({ ...config, endpointUrl: 'http://localhost:11434' })}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-0.5 text-[10px] font-semibold text-slate-500 hover:text-blue-700 bg-slate-100 hover:bg-blue-50 rounded cursor-pointer"
                >
                  Localhost
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Mặc định cổng Ollama là <code className="bg-slate-200 px-1 py-0.2 rounded text-[10px]">11434</code>. Nếu chạy qua IIS Reverse Proxy, nhập URL định tuyến của IIS (ví dụ: <code className="bg-slate-200 px-1 py-0.2 rounded text-[10px]">http://your-server/ollama</code>).
              </p>
            </div>

            {/* Model Selection */}
            <div>
              <label className="block font-bold text-slate-700 text-xs mb-1">
                Tên Model Qwen 2.5 chỉ định:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-2">
                {['qwen2.5:latest', 'qwen2.5:7b', 'qwen2.5:14b', 'qwen2.5:3b'].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setConfig({ ...config, model: m })}
                    className={`py-1.5 px-2 rounded-lg text-xs font-mono font-semibold border text-center transition cursor-pointer ${
                      config.model === m
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={config.model}
                onChange={(e) => setConfig({ ...config, model: e.target.value })}
                placeholder="Hoặc nhập tên model tùy biến (e.g. qwen2.5:32b, qwen2.5-coder)"
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Temperature */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-bold text-slate-700 text-xs">
                  Nhiệt độ sáng tạo (Temperature): <span className="text-blue-600 font-mono">{config.temperature}</span>
                </label>
                <span className="text-[10px] text-slate-400">0.1 (chính xác cao) - 0.7 (sáng tạo)</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.9"
                step="0.1"
                value={config.temperature}
                onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>
          </div>

          {/* IIS Configuration Guide Collapsible */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setShowIisGuide(!showIisGuide)}
              className="w-full p-3 bg-slate-50 hover:bg-slate-100 text-left font-bold text-xs text-slate-700 flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-blue-600" />
                <span>Hướng dẫn thiết lập Ollama &amp; Máy chủ Windows IIS</span>
              </div>
              <span className="text-blue-600 text-xs">{showIisGuide ? 'Thu gọn' : 'Xem hướng dẫn'}</span>
            </button>

            {showIisGuide && (
              <div className="p-3.5 bg-white space-y-2.5 text-xs text-slate-600 border-t border-slate-200">
                <div className="space-y-1">
                  <span className="font-bold text-slate-800">1. Cài đặt Ollama &amp; Tải model Qwen 2.5 trên Windows Server:</span>
                  <div className="bg-slate-900 text-emerald-400 font-mono p-2 rounded text-[11px] select-all">
                    ollama run qwen2.5:latest
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="font-bold text-slate-800">2. Bật cờ CORS để trình duyệt Web gọi được Ollama:</span>
                  <div className="bg-slate-900 text-emerald-400 font-mono p-2 rounded text-[11px] select-all">
                    setx OLLAMA_ORIGINS "*"
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="font-bold text-slate-800">3. Cấu hình IIS làm Reverse Proxy (URL Rewrite + ARR):</span>
                  <p className="text-[11px]">
                    Trong IIS Manager, cài <strong>URL Rewrite</strong> và <strong>Application Request Routing (ARR)</strong>, tạo Rule chuyển hướng từ URL <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">/ollama/(.*)</code> tới <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">http://localhost:11434/$1</code>.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={handleResetDefault}
            className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            Khôi phục mặc định
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg cursor-pointer"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer transition"
            >
              Lưu cấu hình
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
