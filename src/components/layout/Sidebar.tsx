"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: "dashboard" },
  { name: "Proposals", href: "/proposals", icon: "description" },
  { name: "Modules", href: "/services", icon: "widgets" },
  { name: "Case Studies", href: "/case-studies", icon: "work_history" },
  { name: "Testimonials", href: "/testimonials", icon: "chat" },
  { name: "Users", href: "/users", icon: "group" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-[220px] bg-[#004527] text-white flex flex-col z-40">
      <div className="px-5 py-5">
        <Link href="/proposals" className="flex items-center gap-3">
          <img src="/uploads/Main Icon.png" alt="BrandAid" className="w-9 h-9 rounded-full" />
          <div>
            <h1 className="text-[15px] font-bold tracking-tight font-[family-name:var(--font-display)]">BrandAid</h1>
            <p className="text-[11px] text-white/50">Proposal Generator</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-0.5">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150",
                isActive
                  ? "bg-white/10 text-white border-r-4 border-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white/90"
              )}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        <Link
          href="/api/auth/signout"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium text-white/50 hover:bg-white/5 hover:text-white/80 transition-all duration-150"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          Sign Out
        </Link>
      </div>
    </aside>
  );
}
