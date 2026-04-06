"use client";

import Sidebar from "./sidebar";
import { useState } from "react";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex h-full min-h-screen bg-gray-50">
      <button onClick={() => setMenuOpen(!menuOpen)} className="fixed left-4 top-4 z-50 rounded-lg bg-white p-2 shadow-md md:hidden">
        <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"} />
        </svg>
      </button>
      {menuOpen && <div className="fixed inset-0 z-30 bg-black/30 md:hidden" onClick={() => setMenuOpen(false)} />}
      <div className={`fixed inset-y-0 left-0 z-40 transform transition-transform md:relative md:translate-x-0 ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <Sidebar />
      </div>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
