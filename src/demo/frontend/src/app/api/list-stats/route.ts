import { NextResponse } from 'next/server';
import { getContainer } from '@/lib/cosmos';

export async function GET() {
  try {
    // =====================================================================
    // PHẦN 1: LATEST COURSE ACTIVITY
    // =====================================================================
    
    const cqQuery = `SELECT TOP 5 * FROM c`; 
    // Nếu bạn muốn lấy từ Train, đổi "CQ-test-f1" thành "CQ-train" nhé
    const { resources: cqDocs } = await getContainer("CQ-test-f1").items.query(cqQuery).fetchAll();

    const cqCourseIds = Array.from(new Set(cqDocs.map(c => c.course_id).filter(id => id)));

    let cqCourseNames: any[] = [];
    if (cqCourseIds.length > 0) {
        const cqCourseNameQuery = {
            query: "SELECT c.id, c.name FROM c WHERE ARRAY_CONTAINS(@ids, c.id)",
            parameters: [{ name: "@ids", value: cqCourseIds }]
        };
        const res = await getContainer("course").items.query(cqCourseNameQuery).fetchAll();
        cqCourseNames = res.resources;
    }

    const courseList = cqDocs.map(item => {
        const info = cqCourseNames.find(n => 
            String(n.id).trim().toLowerCase() === String(item.course_id).trim().toLowerCase()
        );
        
        return {
            id: item.course_id,
            name: info?.name || `Course ${item.course_id}`, 
            views: item.video_counts || item.attempts_sum || 0,
            exercises: item.ex_counts || item.problem_count || 0,
            label: item.label || item.label_f || "N/A"
        };
    });

    return NextResponse.json({
        topCourses: courseList,
    });

  } catch (error) {
    console.error("List stats error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}