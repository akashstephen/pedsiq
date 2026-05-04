'use client';

import { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  // Persist collapsed state in localStorage
  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved) setCollapsed(saved === "true");
  }, []);

  const handleToggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("sidebar-collapsed", String(next));
  };

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar collapsed={collapsed} onToggle={handleToggle} />
      <main
        className={
          "flex-1 ml-0 pt-16 px-4 pb-6 md:pt-8 md:px-8 w-full max-w-[1400px] motion-safe:transition-[margin] motion-safe:duration-300 " +
          (collapsed ? "md:ml-[72px]" : "md:ml-[280px]")
        }
      >
        {children}
      </main>
    </div>
  );
}
