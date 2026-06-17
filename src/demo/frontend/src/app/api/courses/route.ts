// File: src/app/api/courses/route.ts
import { NextResponse } from 'next/server';
import { getContainer } from '@/lib/cosmos';

function findMostFrequentLabel(labels: string[]) {
  const cleanLabels = labels.filter(l => l && l !== "N" && l !== "null");
  if (cleanLabels.length === 0) return "N/A";
  
  const frequency: Record<string, number> = {};
  let maxFreq = 0;
  let mostFrequent = "N/A";

  for (const label of cleanLabels) {
    const l = String(label).toLowerCase().trim();
    frequency[l] = (frequency[l] || 0) + 1;
    if (frequency[l] > maxFreq) {
      maxFreq = frequency[l];
      mostFrequent = label;
    }
  }
  return mostFrequent;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('limit') || '12');
    const offset = (page - 1) * pageSize;
    
    // Đọc tham số dataset từ URL (Mặc định là train)
    const dataset = searchParams.get('dataset') || 'train';
    
    // --- LỰA CHỌN ĐÚNG CONTAINER THEO PHASE ---
    let cqContainerName = "CQ-train";
    switch (dataset) {
        case 'test_f1': 
            cqContainerName = "CQ-test-f1"; 
            break;
        case 'test_f2': 
            cqContainerName = "CQ-test-f2"; 
            break;
        case 'test_f3': 
            cqContainerName = "CQ-test-f3"; 
            break;
        case 'test_f4': 
            cqContainerName = "CQ-test-f4"; 
            break;
        default: 
            cqContainerName = "CQ-train";
    }

    const countQuery = `
      SELECT VALUE COUNT(1) 
      FROM (SELECT DISTINCT c.course_id FROM c)
    `;
    const { resources: countRes } = await getContainer(cqContainerName).items.query(countQuery).fetchAll();
    const totalItems = countRes[0] || 0;
    const totalPages = Math.ceil(totalItems / pageSize);

    const dataQuery = `
      SELECT DISTINCT VALUE c.course_id 
      FROM c 
      OFFSET @offset LIMIT @limit
    `;
    
    const { resources: courseIds } = await getContainer(cqContainerName).items.query({
        query: dataQuery,
        parameters: [
            { name: "@offset", value: offset },
            { name: "@limit", value: pageSize }
        ]
    }).fetchAll();

    if (courseIds.length === 0) {
        return NextResponse.json({
            data: [],
            pagination: { page, pageSize, totalItems, totalPages }
        });
    }

    const labelQuery = {
      query: `SELECT c.course_id, c.label_f FROM c WHERE ARRAY_CONTAINS(@ids, c.course_id)`,
      parameters: [{ name: "@ids", value: courseIds }]
    };
    const { resources: labelDocs } = await getContainer(cqContainerName).items.query(labelQuery).fetchAll();

    const finalLabels: Record<string, string> = {};
    courseIds.forEach(id => {
        const labels = labelDocs.filter(d => d.course_id === id).map(d => d.label_f);
        finalLabels[id] = findMostFrequentLabel(labels);
    });

    const courseInfoQuery = {
      query: "SELECT c.id, c.name, c.field, c.about FROM c WHERE ARRAY_CONTAINS(@ids, c.id)",
      parameters: [{ name: "@ids", value: courseIds }]
    };
    const { resources: courseInfos } = await getContainer("course").items.query(courseInfoQuery).fetchAll();

    const mergedList = courseInfos.map(info => ({
      id: info.id,
      name: info.name,
      field: info.field || [],
      about: info.about,
      label: finalLabels[info.id] || "N/A"
    }));

    return NextResponse.json({
        data: mergedList,
        pagination: { page, pageSize, totalItems, totalPages }
    });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}