"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, PlayCircle, FileText, BookOpen, Loader2, Info, BarChart3 } from "lucide-react";

// Interface
interface Resource {
  titles: (string | null)[];
  resource_id: string;
  chapter: string;
}

interface QualityAnalysis {
  overall_label: string;
  chapter_details: { chapter: string; label: string }[];
}

interface Course {
  id: string;
  name: string;
  field: string[];
  about: string;
  prerequisites: string;
  resource: Resource[];
  quality_analysis?: QualityAnalysis;
}

// Hàm tô màu
const getLabelColor = (label: string) => {
  const l = String(label || "").toLowerCase().trim();
  if (l === "n/a") return "text-zinc-500 bg-zinc-800 border-zinc-700"; // Màu xám cho N/A
  if (["excellent", "high", "e", "h"].some(k => l.includes(k))) return "text-teal-400 bg-teal-400/10 border-teal-400/20";
  if (["good", "average", "medium", "g", "a", "m"].some(k => l.includes(k))) return "text-amber-400 bg-amber-400/10 border-amber-400/20";
  return "text-rose-400 bg-rose-400/10 border-rose-400/20";
};

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.id ? decodeURIComponent(params.id as string) : "";
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) return;
      try {
        setLoading(true);
        const res = await fetch(`/api/courses/${courseId}`);
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        setCourse(data);
      } catch (error) {
        console.error("Lỗi:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);

  // Logic gom nhóm Resource
  const groupedChapters = useMemo(() => {
    if (!course?.resource) return {};

    const groups = course.resource.reduce((acc, item) => {
      // Lấy tên chương từ titles (VD: "Chương 1: Giới thiệu")
      const chapterTitle = item.titles[0] || `Chapter ${item.chapter}`;
      
      // QUAN TRỌNG: Chuẩn hóa ID chương về số nguyên để khớp với API
      // Ví dụ: item.chapter có thể là "1" hoặc "1.1" -> Lấy "1"
      const mainChapterId = String(item.chapter).split('.')[0];

      if (!acc[chapterTitle]) {
        acc[chapterTitle] = { 
            lessons: [], 
            chapterId: mainChapterId // Dùng ID này để tìm nhãn
        };
      }
      acc[chapterTitle].lessons.push(item);
      return acc;
    }, {} as Record<string, { lessons: Resource[], chapterId: string }>);

    return groups;
  }, [course]);

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-zinc-950 text-white gap-2">
      <Loader2 className="animate-spin text-blue-500" /> Loading course data...
    </div>
  );

  if (!course) return <div className="p-20 text-white text-center">Course not found.</div>;

  const overallLabel = course.quality_analysis?.overall_label || "N/A";

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 md:p-10 font-sans">
      <button onClick={() => router.back()} className="flex items-center text-zinc-500 hover:text-white mb-8 transition-colors group">
        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Back to list
      </button>

      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            {course.field?.map((f, i) => (
              <span key={i} className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full border border-blue-400/20">{f}</span>
            ))}
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-bold uppercase ${getLabelColor(overallLabel)}`}>
              <BarChart3 size={12} /> Quality: {overallLabel}
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">{course.name}</h1>
          <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl">
            <h3 className="text-zinc-500 text-sm font-bold uppercase mb-2 flex items-center gap-2"><Info size={14}/> About course</h3>
            <p className="text-zinc-300 leading-relaxed italic">"{course.about}"</p>
          </div>
        </div>

        {/* List Chapters */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2"><BookOpen className="text-blue-500" /> Course Content & Quality</h2>

          <div className="grid gap-6">
            {Object.entries(groupedChapters).map(([chapterTitle, { lessons, chapterId }], idx) => {
              
              // TÌM NHÃN: So sánh chapterId (dạng số nguyên "1") với dữ liệu từ API
              const chapterQuality = course.quality_analysis?.chapter_details.find(
                c => String(c.chapter) === String(chapterId)
              );
              
              // Nếu không tìm thấy hoặc nhãn rỗng thì hiện N/A
              const label = chapterQuality?.label || "N/A";

              return (
                <div key={idx} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-lg">
                  <div className="bg-zinc-800/50 p-4 border-b border-zinc-800 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-zinc-200 text-lg">{chapterTitle}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-zinc-500 bg-zinc-950 px-2 py-1 rounded-md">{lessons.length} bài học</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded border ${getLabelColor(label)}`}>
                          Rating: {label}
                        </span>
                      </div>
                    </div>
                    {/* Hiển thị chữ cái đầu của Label nếu không phải N/A */}
                    {label !== "N/A" && (
                        <div className={`hidden md:flex items-center justify-center w-10 h-10 text-lg font-black rounded-xl border-2 ${getLabelColor(label)}`}>
                            {label.charAt(0).toUpperCase()}
                        </div>
                    )}
                  </div>

                  <div className="divide-y divide-zinc-800/40">
                    {lessons.map((lesson) => (
                      <div key={lesson.resource_id} className="p-4 flex items-center gap-4 hover:bg-zinc-800/30 transition-colors">
                        <div className="shrink-0">
                          {lesson.resource_id.startsWith("Ex") ? <FileText size={18} className="text-orange-400" /> : <PlayCircle size={18} className="text-blue-400" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-zinc-300">{lesson.titles[2] || lesson.titles[1] || "Bài học"}</p>
                          <p className="text-[10px] font-mono text-zinc-600 mt-1 uppercase">ID: {lesson.resource_id}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}