"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Book, ArrowRight, Loader2, Search, AlertCircle, BarChart3, ChevronLeft, ChevronRight, Filter } from "lucide-react";

interface Course {
  id: string;
  name: string;
  field: string[];
  about?: string;
  label?: string;
}

const getLabelColor = (label: string = "") => {
  const l = String(label).toLowerCase();
  if (["excellent", "high", "e", "h"].some(k => l.includes(k))) return "text-teal-400 bg-teal-400/10 border-teal-400/20";
  if (["good", "average", "medium", "g", "a", "m"].some(k => l.includes(k))) return "text-amber-400 bg-amber-400/10 border-amber-400/20";
  return "text-rose-400 bg-rose-400/10 border-rose-400/20";
};

export default function CoursesListPage() {
  const router = useRouter();
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State Phân trang
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // State cho Dropdown
  const [dataset, setDataset] = useState("train"); 

  const [searchQuery, setSearchQuery] = useState("");

  // Hàm hiển thị tên Phase cho đẹp
  const getDatasetName = (val: string) => {
    switch(val) {
      case 'train': return 'All Data';
      case 'test_f1': return 'Phase 1';
      case 'test_f2': return 'Phase 2';
      case 'test_f3': return 'Phase 3';
      case 'test_f4': return 'Phase 4';
      default: return 'All Data';
    }
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/courses?page=${page}&limit=12&dataset=${dataset}`); 
        
        if (!res.ok) throw new Error("Failed");
        
        const responseData = await res.json();
        
        setCourses(responseData.data);
        setTotalPages(responseData.pagination.totalPages);
        setTotalItems(responseData.pagination.totalItems);
        
      } catch (error) {
        console.error("Lỗi:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourses();
  }, [page, dataset]);

  const handleDatasetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDataset(e.target.value);
    setPage(1); // Reset về trang 1 khi đổi tập dữ liệu
  };

  const handlePrev = () => { if (page > 1) setPage(p => p - 1); };
  const handleNext = () => { if (page < totalPages) setPage(p => p + 1); };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-zinc-950 text-zinc-400 gap-2">
      <Loader2 className="animate-spin text-blue-500" /> Loading {getDatasetName(dataset)}...
    </div>
  );

  return (
    <div className="p-6 md:p-10 min-h-screen text-white bg-zinc-950">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Active Courses</h1>
          <p className="text-zinc-500 mt-1">
            Showing page {page} of {totalPages} ({totalItems} courses in {getDatasetName(dataset)})
          </p>
        </div>
        
        {/* Nhóm Filter Dropdown & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          
          <div className="relative flex items-center bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 shrink-0">
            <Filter size={16} className="text-zinc-500 mr-2" />
            <select
              value={dataset}
              onChange={handleDatasetChange}
              className="bg-transparent text-sm text-zinc-300 font-medium focus:outline-none cursor-pointer appearance-none pr-4"
            >
              <option value="train" className="bg-zinc-900 text-white">All Data</option>
              <option value="test_f1" className="bg-zinc-900 text-white">Phase 1</option>
              <option value="test_f2" className="bg-zinc-900 text-white">Phase 2</option>
              <option value="test_f3" className="bg-zinc-900 text-white">Phase 3</option>
              <option value="test_f4" className="bg-zinc-900 text-white">Phase 4</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <ChevronRight size={14} className="text-zinc-500 rotate-90" />
            </div>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input 
              type="text"
              placeholder="Search on this page..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500 text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Grid Data */}
      {courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
          <AlertCircle size={40} className="mb-2 opacity-50" />
          <p>No courses found in {getDatasetName(dataset)}.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
          {courses
            .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.id.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((course) => (
            <div 
              key={course.id}
              onClick={() => router.push(`/dashboard/courses/${course.id}`)}
              className="group relative bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 hover:border-blue-500/50 hover:bg-zinc-900 transition-all duration-300 cursor-pointer flex flex-col justify-between h-full shadow-lg"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/5 flex items-center justify-center text-blue-400">
                    <Book size={20} />
                  </div>
                  <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase border flex items-center gap-1 ${getLabelColor(course.label)}`}>
                     <BarChart3 size={10} /> {course.label}
                  </div>
                </div>

                <div className="mb-2"><span className="text-[10px] font-mono text-zinc-500">ID: {course.id}</span></div>

                <h3 className="text-lg font-bold mb-3 text-zinc-100 group-hover:text-blue-400 transition-colors line-clamp-2">
                  {course.name}
                </h3>
                
                <p className="text-sm text-zinc-400 line-clamp-2 mb-6">
                  {course.about || "No description available."}
                </p>
              </div>

              <div className="pt-4 border-t border-zinc-800/50 flex items-center justify-between text-sm">
                <span className="text-zinc-500 text-xs">View analysis</span>
                <ArrowRight size={14} className="text-blue-500 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-center gap-4 py-6 border-t border-zinc-800">
        <button 
          onClick={handlePrev} 
          disabled={page === 1}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
        >
          <ChevronLeft size={16} /> Previous
        </button>
        
        <span className="text-sm text-zinc-400 font-mono">
          Page <span className="text-white font-bold">{page}</span> of {totalPages}
        </span>

        <button 
          onClick={handleNext} 
          disabled={page === totalPages}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
        >
          Next <ChevronRight size={16} />
        </button>
      </div>

    </div>
  );
}