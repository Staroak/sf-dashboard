"use client";

import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Load preference from localStorage
    const saved = localStorage.getItem("dashboard-theme");
    if (saved === "light") {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    } else {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);

    if (newIsDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("dashboard-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("dashboard-theme", "light");
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "fixed bottom-4 right-4 z-50 p-3 rounded-full shadow-lg transition-all",
        "hover:scale-110 active:scale-95",
        isDark
          ? "bg-gray-800 text-yellow-400 hover:bg-gray-700"
          : "bg-white text-gray-800 hover:bg-gray-100 border border-gray-200"
      )}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <Sun className="h-6 w-6" />
      ) : (
        <Moon className="h-6 w-6" />
      )}
    </button>
  );
}
