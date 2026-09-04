/**
 * Utility functions for dynamic branding, color brightness, gradients, and theme synchronization
 */

export interface ThemePreset {
  name: string;
  hex: string;
  description: string;
  isDefault?: boolean;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    name: 'Xanh Dương Đường Sắt VNR (Chính thức)',
    hex: '#003882',
    description: 'Tone xanh đậm tiêu chuẩn của Tổng công ty Đường sắt Việt Nam',
    isDefault: true
  },
  {
    name: 'Windows 12 Cobalt Blue',
    hex: '#0078D4',
    description: 'Tone xanh cobalt hiện đại theo phong cách Windows 12 Fluent'
  },
  {
    name: 'Xanh Hải Quân Royal Navy',
    hex: '#1e40af',
    description: 'Tone xanh hoàng gia sang trọng, trang nghiêm hành chính'
  },
  {
    name: 'Xanh Đại Dương Ocean Deep',
    hex: '#0f4c81',
    description: 'Tone xanh biển sâu tĩnh lặng, bảo vệ mắt khi làm việc lâu'
  },
  {
    name: 'Xanh Biển Electric Azure',
    hex: '#0284c7',
    description: 'Tone xanh tươi sáng năng động, công nghệ cao'
  },
  {
    name: 'Xanh Lam Cyan Sky',
    hex: '#0891b2',
    description: 'Tone xanh mây trời thanh lịch, tối ưu nhận diện số'
  },
  {
    name: 'Xanh Ngọc Emerald Jade',
    hex: '#057a55',
    description: 'Tone xanh lá ngọc bích vững chãi, thân thiện môi trường'
  },
  {
    name: 'Xanh Tím Royal Indigo',
    hex: '#4338ca',
    description: 'Tone xanh tím chuyển đổi số thời thượng'
  }
];

/**
 * Adjust hex color brightness by a percentage (-100 to +100)
 */
export function adjustHexBrightness(hex: string, percent: number): string {
  if (!hex) return '#003882';
  let cleanHex = hex.replace('#', '').trim();
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(c => c + c).join('');
  }
  const num = parseInt(cleanHex, 16);
  if (isNaN(num)) return '#003882';

  let r = (num >> 16) + Math.round(255 * (percent / 100));
  let g = ((num >> 8) & 0x00FF) + Math.round(255 * (percent / 100));
  let b = (num & 0x0000FF) + Math.round(255 * (percent / 100));

  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

/**
 * Generates a rich multi-stop gradient for desktop headers and modal headers
 */
export function getHeaderGradient(baseHex: string = '#003882'): string {
  const start = adjustHexBrightness(baseHex, -22);
  const mid = baseHex;
  const end = adjustHexBrightness(baseHex, -38);
  return `linear-gradient(90deg, ${start} 0%, ${mid} 52%, ${end} 100%)`;
}

/**
 * Generates a full-screen dynamic gradient for the Login page
 */
export function getLoginBackgroundGradient(baseHex: string = '#003882'): string {
  const darkBase = adjustHexBrightness(baseHex, -45);
  const midColor = adjustHexBrightness(baseHex, -15);
  const deepColor = adjustHexBrightness(baseHex, -55);
  return `radial-gradient(ellipse at 50% 10%, ${midColor} 0%, ${darkBase} 55%, ${deepColor} 100%)`;
}

/**
 * Generates a card or banner gradient for highlighting brand elements
 */
export function getBrandBannerGradient(baseHex: string = '#003882'): string {
  const c1 = adjustHexBrightness(baseHex, 10);
  const c2 = baseHex;
  const c3 = adjustHexBrightness(baseHex, -20);
  return `linear-gradient(135deg, ${c1} 0%, ${c2} 48%, ${c3} 100%)`;
}

/**
 * Generates a dynamic button gradient
 */
export function getButtonGradient(baseHex: string = '#003882'): string {
  const light = adjustHexBrightness(baseHex, 12);
  const dark = adjustHexBrightness(baseHex, -10);
  return `linear-gradient(135deg, ${light} 0%, ${dark} 100%)`;
}
