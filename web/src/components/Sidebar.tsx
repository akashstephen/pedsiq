'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  BarChart3,
  Target,
  Flame,
  Menu,
  X,
} from "lucide-react";
import clsx from "clsx";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/questions/", label: "Questions", icon: FileText },
  { href: "/nelson/", label: "Nelson Analysis", icon: BookOpen },
  { href: "/subjects/", label: "Subjects", icon: BarChart3 },
  { href: "/predictions/", label: "Predictions", icon: Target },
  { href: "/structured-answers/", label: "Structured Answers", icon: Flame },
];

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="no-print fixed top-4 left-4 z-[200] md:hidden w-10 h-10 rounded-xl bg-[#111] border border-white/10 flex items-center justify-center text-white"
        aria-label="Toggle navigation"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside
        className={clsx(
          "fixed top-0 left-0 h-screen w-[280px] bg-[#0a0a0a] border-r border-white/[0.08] z-[100] flex flex-col transition-transform duration-300",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="p-6 pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#007AFF] to-[#5856D6] flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/20">
              P
            </div>
            <div>
              <div className="text-lg font-bold tracking-tight text-white">PedsIQ</div>
              <div className="text-[11px] text-white/55 font-medium uppercase tracking-wider">
                KUHS PYQ Analyzer
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={clsx(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  active
                    ? "bg-[#007AFF]/15 text-white border border-[#007AFF]/20"
                    : "text-white/60 hover:text-white hover:bg-white/[0.05]"
                )}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {item.href === "/structured-answers/" && (
                  <span className="ml-auto bg-[#FF2D55]/15 text-[#FF2D55] text-[10px] font-bold px-2 py-0.5 rounded-full">
                    12
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/[0.08]">
          <div className="text-xs text-white/40 text-center">
            Built for KUHS Pediatrics
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-[90] md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
