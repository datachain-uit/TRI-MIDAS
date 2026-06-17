// File: src/app/api/courses/[id]/route.ts
import { NextResponse } from 'next/server';
import { getContainer } from '@/lib/cosmos';

// Hàm tìm nhãn phổ biến nhất (Mode)
function findMostFrequentLabel(labels: string[]) {
  // Lọc bỏ các giá trị rác trước khi tính
  const cleanLabels = labels.filter(l => l && l !== "N" && l !== "null");
  
  if (cleanLabels.length === 0) return "N/A";
  
  const frequency: Record<string, number> = {};
  let maxFreq = 0;
  let mostFrequent = cleanLabels[0];

  for (const label of cleanLabels) {
    const l = String(label).toLowerCase();
    frequency[l] = (frequency[l] || 0) + 1;
    if (frequency[l] > maxFreq) {
      maxFreq = frequency[l];
      mostFrequent = label;
    }
  }
  return mostFrequent;
}

type Props = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, props: Props) {
  try {
    const params = await props.params;
    const rawId = params.id;
    const courseId = decodeURIComponent(rawId).trim();

    // 1. Query Course Info
    const courseQuery = {
      query: "SELECT * FROM c WHERE c.id = @id",
      parameters: [{ name: "@id", value: courseId }]
    };

    // 2. Query CQ (Quality)
    const cqQuery = {
      query: "SELECT c.chapter, c.label, c.label_f FROM c WHERE c.course_id = @id",
      parameters: [{ name: "@id", value: courseId }]
    };

    const [courseRes, cqTrainRes, cqTestRes] = await Promise.all([
      getContainer("course").items.query(courseQuery).fetchAll(),
      getContainer("CQ-train").items.query(cqQuery).fetchAll(),
      getContainer("CQ-test-f1").items.query(cqQuery).fetchAll()
    ]);

    const courseData = courseRes.resources[0];

    if (!courseData) {
      return NextResponse.json({ message: "Course not found" }, { status: 404 });
    }

    // 3. XỬ LÝ GỘP CHAPTER (2.1 -> 2)
    const allCQData = [...cqTrainRes.resources, ...cqTestRes.resources];
    
    // Tạo Map để gom nhóm label theo chương chính (Integer)
    // Ví dụ: Chapter "2.1", "2.5" -> Gom hết vào Key "2"
    const chapterMap: Record<string, string[]> = {};
    const allLabels: string[] = [];

    allCQData.forEach(item => {
      // Logic lấy nhãn: Ưu tiên label -> label_3 -> bỏ qua nếu null
      const label = item.label || item.label_f;
      if (!label) return;

      allLabels.push(label);

      // Xử lý Chapter: Chuyển "2.1" thành "2"
      // toString() -> split('.') lấy phần trước dấu chấm
      const rawChapter = String(item.chapter);
      const mainChapter = rawChapter.split('.')[0]; 

      if (!chapterMap[mainChapter]) {
        chapterMap[mainChapter] = [];
      }
      chapterMap[mainChapter].push(label);
    });

    // 4. Tính toán nhãn đại diện cho từng chương chính
    const consolidatedChapters = Object.keys(chapterMap).map(chKey => {
      const labelsInThisChapter = chapterMap[chKey];
      return {
        chapter: chKey, // Giờ nó là "1", "2", "3"... (số nguyên)
        label: findMostFrequentLabel(labelsInThisChapter)
      };
    });

    // 5. Tính nhãn chung toàn khóa học
    const overallLabel = findMostFrequentLabel(allLabels);

    const responseData = {
      ...courseData,
      quality_analysis: {
        overall_label: overallLabel,
        total_chapters_analyzed: Object.keys(chapterMap).length,
        chapter_details: consolidatedChapters // Trả về danh sách đã gộp
      }
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error("Course Detail API Error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}