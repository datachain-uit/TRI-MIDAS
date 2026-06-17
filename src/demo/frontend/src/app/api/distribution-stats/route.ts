// File: src/app/api/distribution-stats/route.ts
import { NextResponse } from 'next/server';
import { getContainer } from '@/lib/cosmos';

export async function GET() {
  try {
    // Course quality label distribution (CQ-train)
    const courseQuery = "SELECT c.label_f as name, COUNT(1) as total FROM c GROUP BY c.label_f";

    const { resources: courseResources } =
      await getContainer("CQ-train").items.query(courseQuery).fetchAll();

    // --- HÀM MAP DỮ LIỆU ---
    // Đổi 'total' quay lại thành 'value' để Frontend hiểu
    const formatData = (items: any[]) => {
        return items.map(item => ({
            name: item.name,
            value: item.total
        }));
    };

    return NextResponse.json({
      courseDistribution: formatData(courseResources),
    });

  } catch (error) {
    console.error("Distribution API Error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}