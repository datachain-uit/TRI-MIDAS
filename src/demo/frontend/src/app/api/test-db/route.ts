import { NextResponse } from 'next/server';
import { getContainer } from '@/lib/cosmos';

export async function GET() {
  try {
    // Thử kết nối vào container 'course' và lấy 1 dòng
    const container = getContainer("course"); // Đảm bảo tên này đúng với Azure
    const { resources } = await container.items.query("SELECT TOP 1 * FROM c").fetchAll();
    
    return NextResponse.json({ 
      status: "Success", 
      message: "Kết nối thành công!",
      data: resources 
    });
  } catch (error) {
    console.error("Lỗi Test DB:", error);
    return NextResponse.json({ 
      status: "Error", 
      message: String(error),
      env_endpoint: process.env.COSMOS_ENDPOINT ? "Đã có" : "Thiếu",
      env_key: process.env.COSMOS_KEY ? "Đã có" : "Thiếu",
      env_db: process.env.COSMOS_DATABASE // Xem nó in ra tên DB gì
    }, { status: 500 });
  }
}