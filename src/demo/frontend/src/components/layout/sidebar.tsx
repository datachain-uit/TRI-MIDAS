import Link from "next/link";
import {
  LayoutDashboard,
  Database,
  BookOpen,
  Settings,
  User,
  HelpCircle,
} from "lucide-react";

import { usePathname } from "next/navigation";

const menuItems = [
  { name: "Overview", icon: LayoutDashboard, href: "/dashboard/overview" },
  { name: "Data Quality", icon: Database, href: "/dashboard/data-quality" },
  { name: "Courses", icon: BookOpen, href: "/dashboard/courses" },
];

const bottomItems = [
  { name: "Settings", icon: Settings, href: "dashboard/settings" },
  { name: "Accounts", icon: User, href: "dashboard/accounts" },
  { name: "Help", icon: HelpCircle, href: "dashboard/help" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 h-screen bg-[#0d1320] border-r border-indigo-500/10 flex flex-col py-6 text-zinc-400 shadow-xxl shadow-black/40  ">
      {/* Logo Area */}
      <div className="mb-10 px-6 text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-teal-300 bg-clip-text text-transparent">
        TRI-MIDAS
      </div>

      {/* Main Menu */}
      <div className="space-y-6 ">
        <div>
          <h3 className="text-xs uppercase px-6 tracking-wider mb-4 font-semibold text-zinc-600">
            Overview
          </h3>
          <nav className="space-y-2 ">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="mx-3 flex items-center px-3 gap-3 py-2 rounded-lg border-l-2 border-transparent hover:bg-indigo-500/10 hover:text-teal-300 transition-colors"
                style={{
                  background: pathname == item.href ? "#1e293b" : "transparent",
                  borderLeftColor: pathname == item.href ? "#6366f1" : "transparent",
                  color: pathname == item.href ? "#e5e7eb" : undefined,
                  fontWeight: pathname == item.href ? 600 : 400,
                }}
              >
                <item.icon size={20} className="text-teal-300" />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Others Menu */}
        <div>
          <h3 className="text-xs uppercase px-6 tracking-wider mb-4 font-semibold text-zinc-600">
            Others
          </h3>
          <nav className="space-y-2">
            {bottomItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="mx-3 flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-indigo-500/10 hover:text-teal-300 transition-colors"
              >
                <item.icon size={20} className="text-teal-300" />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
