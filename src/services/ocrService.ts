export interface OCRExtractResult {
  fullText: string;
  confidence: number;
  extractedFields: {
    soKyHieu?: string;
    coQuan?: string;
    ngayBanHanh?: string;
    trichYeu?: string;
    loaiVanBan?: string;
    hasRedSeal: boolean;
    soDen?: number;
  };
  boundingBoxes: Array<{
    id: string;
    label: string;
    text: string;
    confidence: number;
    box: { x: number; y: number; width: number; height: number }; // percentages
  }>;
}

export class OCRService {
  /**
   * Simulates high-precision Tesseract OCR / AI text extraction engine
   */
  static async processDocumentScan(
    file: File | { name: string; type?: string; size?: number },
    customContext?: { isIncoming?: boolean; isOutgoing?: boolean }
  ): Promise<OCRExtractResult> {
    // Artificial small delay for realistic scanning animation feel
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const name = file.name.toLowerCase();
    
    // Heuristic patterns based on typical Vietnamese dispatches
    let soKyHieu = '158/QĐ-ĐS';
    let coQuan = 'Tổng công ty Đường sắt Việt Nam';
    let ngayBanHanh = '2026-04-20';
    let trichYeu = 'Về việc ban hành quy chế quản lý và số hóa hồ sơ tài liệu lưu trữ điện tử';
    let loaiVanBan = 'Quyết định';
    let soDen = Math.floor(1000 + Math.random() * 500);

    if (name.includes('bctt') || name.includes('baocao') || name.includes('bc-')) {
      soKyHieu = '24/BC-KTHUAT';
      coQuan = 'Cục Đường sắt Việt Nam';
      trichYeu = 'Báo cáo thẩm tra hồ sơ thiết kế kỹ thuật công trình nâng cấp cầu đường sắt Km 830+200';
      loaiVanBan = 'Báo cáo';
    } else if (name.includes('hd') || name.includes('hopdong')) {
      soKyHieu = '89/HĐ-XD2026';
      coQuan = 'Ban Quản lý Dự án Đường sắt Khu vực 2';
      trichYeu = 'Hợp đồng thi công xây lắp gói thầu cung ứng phụ kiện liên kết ray cao tốc';
      loaiVanBan = 'Hợp đồng';
    } else if (name.includes('bgtvt') || name.includes('cv') || name.includes('congvan')) {
      soKyHieu = '512/BGTVT-VT';
      coQuan = 'Bộ Giao thông Vận tải';
      trichYeu = 'Về việc tăng cường công tác kiểm tra an toàn chạy tàu và phục vụ hành khách dịp cao điểm';
      loaiVanBan = 'Công văn';
    } else if (name.includes('qd') || name.includes('quyetdinh')) {
      soKyHieu = '306/QĐ-VNR';
      coQuan = 'Tổng công ty Đường sắt Việt Nam';
      trichYeu = 'Quyết định giao chỉ tiêu kế hoạch sản xuất kinh doanh và đầu tư phát triển năm 2026';
      loaiVanBan = 'Quyết định';
    } else if (name.includes('tb') || name.includes('thongbao')) {
      soKyHieu = '199/TB-TCHC';
      coQuan = 'Ban Tổ chức Cán bộ - Lao động';
      trichYeu = 'Thông báo triệu tập cán bộ tham gia khóa đào tạo số hóa văn thư lưu trữ NĐ 30';
      loaiVanBan = 'Thông báo';
    } else if (name.includes('bb') || name.includes('bienban')) {
      soKyHieu = '12/BB-NGHIEMTHU';
      coQuan = 'Hội đồng Nghiệm thu Cơ sở VNR';
      trichYeu = 'Biên bản nghiệm thu hoàn thành đưa vào sử dụng công trình cầu đường sắt';
      loaiVanBan = 'Biên bản';
    }

    const fullText = `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
Độc lập - Tự do - Hạnh phúc
-----------------
${coQuan.toUpperCase()}
Số: ${soKyHieu}

Hà Nội, ngày 20 tháng 04 năm 2026

${loaiVanBan.toUpperCase()}
${trichYeu}

Căn cứ Quyết định số 182/QĐ-TTg của Thủ tướng Chính phủ;
Căn cứ Nghị định số 30/2020/NĐ-CP ngày 05/03/2020 của Chính phủ về công tác văn thư;
Xét đề nghị của Trưởng phòng Quản lý Hồ sơ & Thẩm định,

QUYẾT ĐỊNH / NỘI DUNG:
1. Thông qua nội dung theo hồ sơ pháp lý kèm theo.
2. Các đơn vị liên quan căn cứ chức năng, nhiệm vụ triển khai thực hiện.
3. Hồ sơ này được lưu trữ chính thức tại Thư viện HSTL.

[Chữ ký Lãnh đạo & Dấu tròn màu đỏ đã được xác thực hợp lệ bằng OCR Vision]`;

    return {
      fullText,
      confidence: 98.4,
      extractedFields: {
        soKyHieu,
        coQuan,
        ngayBanHanh,
        trichYeu,
        loaiVanBan,
        hasRedSeal: true,
        soDen: customContext?.isIncoming ? soDen : undefined,
      },
      boundingBoxes: [
        {
          id: 'box-coquan',
          label: 'Cơ quan Ban hành',
          text: coQuan,
          confidence: 99.2,
          box: { x: 5, y: 4, width: 45, height: 8 },
        },
        {
          id: 'box-sokyhhieu',
          label: 'Số ký hiệu',
          text: soKyHieu,
          confidence: 98.9,
          box: { x: 5, y: 13, width: 35, height: 7 },
        },
        {
          id: 'box-ngay',
          label: 'Ngày ban hành',
          text: 'Ngày 20/04/2026',
          confidence: 97.5,
          box: { x: 55, y: 13, width: 40, height: 7 },
        },
        {
          id: 'box-trichyeu',
          label: 'Trích yếu nội dung',
          text: trichYeu,
          confidence: 98.0,
          box: { x: 5, y: 25, width: 90, height: 18 },
        },
        {
          id: 'box-redseal',
          label: 'Con dấu đỏ & Chữ ký',
          text: '[Dấu đỏ cơ quan & Chữ ký Lãnh đạo]',
          confidence: 99.7,
          box: { x: 58, y: 68, width: 38, height: 26 },
        },
      ],
    };
  }
}
