import { LegendProps } from "recharts";

const CustomLegend: React.FC<LegendProps> = ({ payload }) => {
  if (!payload || payload.length === 0) return null;

  // 1. Tính TỔNG số lượng của tất cả các nhãn cộng lại
  const total = payload.reduce((sum, item: any) => {
    // Recharts giấu con số 55360 trong item.payload.value
    return sum + (Number(item.payload?.value) || 0);
  }, 0);

  return (
    <div className="flex flex-col gap-3">
      {payload.map((item, index) => {
        const legendItem = item as any;
        
        // Lấy con số của nhãn hiện tại (ví dụ: 55360)
        const numericValue = Number(legendItem.payload?.value) || 0;

        // 2. Tính toán phần trăm (Giá trị / Tổng * 100). Đề phòng chia cho 0.
        const percent = total > 0 ? (numericValue / total) * 100 : 0;
        
        // Làm tròn 2 chữ số thập phân
        const displayPercent = percent.toFixed(2);

        return (
          <div
            // Dùng index kết hợp value để làm key cho chắc ăn, tránh trùng lặp
            key={`legend-${legendItem.value}-${index}`}
            className="flex items-center justify-between gap-6 text-sm pr-8"
          >
            {/* Left: icon + label */}
            <div className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-sm"
                style={{ backgroundColor: legendItem.color }}
              />
              <span className="text-zinc-300">{legendItem.value}</span>
            </div>

            {/* Right: percentage - ĐÃ ĐƯỢC TÍNH TOÁN CHUẨN XÁC */}
            <span className="text-zinc-100 font-medium">
              {displayPercent}%
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default CustomLegend;