'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  BarChart3,
  Activity,
  Flame,
  Brain,
  CalendarCheck,
  Gamepad2,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import clsx from "clsx";
import { topics } from "../app/structured-answers/topics";

const navItems = [
  { href: "/today/", label: "Today", icon: CalendarCheck },
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/quiz/", label: "MCQ Practice", icon: Brain },
  { href: "/arcade/", label: "Retrieval Lab", icon: Gamepad2 },
  { href: "/questions/", label: "Questions", icon: FileText },
  { href: "/nelson/", label: "Nelson Analysis", icon: BookOpen },
  { href: "/subjects/", label: "Subjects", icon: BarChart3 },
  { href: "/insights/", label: "Pattern Insights", icon: Activity },
  { href: "/structured-answers/", label: "Structured Answers", icon: Flame },
];

const SIDEBAR_ID = "main-sidebar";

function useFocusTrap(
  containerRef: React.RefObject<HTMLElement | null>,
  isActive: boolean
) {
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive) return;

    previouslyFocused.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;

    const container = containerRef.current;
    if (!container) return;

    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(",");

    const getFocusable = () =>
      Array.from(container!.querySelectorAll<HTMLElement>(focusableSelectors));

    const focusable = getFocusable();
    if (focusable.length > 0) {
      focusable[0].focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      const elements = getFocusable();
      if (elements.length === 0) return;

      const first = elements[0];
      const last = elements[elements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused.current?.focus();
    };
  }, [isActive, containerRef]);
}

function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [locked]);
}

function useEscape(handler: () => void, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handler();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [enabled, handler]);
}

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);

  const closeSidebar = useCallback(() => setOpen(false), []);

  useBodyScrollLock(open);
  useEscape(closeSidebar, open);
  useFocusTrap(sidebarRef, open);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile toggle */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="no-print fixed top-4 left-4 z-[200] md:hidden w-10 h-10 rounded-xl bg-[#111] border border-white/10 flex items-center justify-center text-white hover:bg-[#1a1a1a] transition-colors"
        aria-label={open ? "Close navigation" : "Open navigation"}
        aria-expanded={open}
        aria-controls={SIDEBAR_ID}
      >
        {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
      </button>

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        id={SIDEBAR_ID}
        className={clsx(
          "fixed top-0 left-0 h-screen bg-[#0a0a0a] border-r border-white/[0.08] z-[100] flex flex-col",
          "motion-safe:transition-[width,transform] motion-safe:duration-300",
          open ? "translate-x-0 w-[280px]" : "-translate-x-full md:translate-x-0",
          !open && collapsed && "md:w-[72px]",
          !open && !collapsed && "md:w-[280px]"
        )}
        aria-label="Main navigation"
      >
        {/* Header */}
        <div className={clsx(
          "border-b border-white/[0.08] flex",
          collapsed
            ? "md:flex-col md:items-center md:justify-center md:gap-2 md:p-2 md:py-3"
            : "items-center justify-between p-4 pb-3"
        )}>
          <Link href="/" className={clsx("flex items-center gap-3 group overflow-hidden", collapsed && "md:gap-0")}>
            <div className={clsx(
              "rounded-xl bg-gradient-to-br from-[#007AFF] to-[#5856D6] flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/30 transition-shadow shrink-0",
              collapsed ? "md:w-8 md:h-8 md:text-base w-10 h-10 text-lg" : "w-10 h-10 text-lg"
            )}>
              P
            </div>
            <div
              className={clsx(
                "overflow-hidden motion-safe:transition-all motion-safe:duration-300",
                collapsed && "md:w-0 md:opacity-0",
                !collapsed && "md:w-auto md:opacity-100"
              )}
            >
              <div className="text-lg font-bold tracking-tight text-white whitespace-nowrap">PedsIQ</div>
              <div className="text-[11px] text-white/55 font-medium uppercase tracking-wider whitespace-nowrap">
                Pediatrics Learning Engine
              </div>
            </div>
          </Link>

          {/* Desktop collapse toggle */}
          <button
            type="button"
            onClick={onToggle}
            className={clsx(
              "hidden md:flex items-center justify-center rounded-lg bg-white/[0.05] border border-white/10 text-white/60 hover:text-white hover:bg-white/[0.1] transition-colors shrink-0",
              collapsed ? "md:w-6 md:h-6" : "w-7 h-7"
            )}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1" aria-label="Primary">
          {navItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={clsx(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#007AFF]/50",
                  active
                    ? "bg-[#007AFF]/15 text-white border border-[#007AFF]/20"
                    : "text-white/60 hover:text-white hover:bg-white/[0.05]",
                  collapsed && "md:justify-center md:px-2"
                )}
                aria-current={active ? "page" : undefined}
                title={item.label}
              >
                <Icon size={18} aria-hidden="true" className="shrink-0" />
                <span
                  className={clsx(
                    "overflow-hidden motion-safe:transition-all motion-safe:duration-300 whitespace-nowrap",
                    collapsed && "md:w-0 md:opacity-0",
                    !collapsed && "md:w-auto md:opacity-100"
                  )}
                >
                  {item.label}
                </span>
                {item.href === "/structured-answers/" && (
                  <span
                    className={clsx(
                      "ml-auto bg-[#FF2D55]/15 text-[#FF2D55] text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0",
                      collapsed && "md:hidden"
                    )}
                  >
                    {topics.length}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div
          className={clsx(
            "p-4 border-t border-white/[0.08] space-y-1.5 overflow-hidden motion-safe:transition-all motion-safe:duration-300",
            collapsed && "md:h-0 md:p-0 md:opacity-0 md:border-none"
          )}
        >
          <div className="text-[11px] text-white/40 text-center leading-relaxed">
            <span className="text-white/50 font-medium">© Akash Stephen</span>
            <br />
            Final Year MBBS Student
          </div>
          <div className="text-[10px] text-white/30 text-center">
            Pediatrics Learning Engine
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-[90] md:hidden motion-safe:transition-opacity motion-safe:duration-300"
          onClick={(e) => {
            e.stopPropagation();
            setOpen(false);
          }}
          aria-hidden="true"
        />
      )}
    </>
  );
}
