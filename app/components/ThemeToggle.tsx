"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // Avoid hydration mismatch
  useEffect(() => setMounted(true), []);

  if (!mounted)
    return (
      <div className="w-10 h-6 rounded-full bg-gray-200 dark:bg-gray-700"></div>
    );

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="flex items-center justify-center w-10 h-6 rounded-full bg-gray-200 dark:bg-gray-700 transition-colors"
      aria-label="Toggle dark mode"
    >
      <div
        className={`w-5 h-5 rounded-full transition-transform ${
          theme === "dark"
            ? "translate-x-2 bg-white"
            : "-translate-x-2 bg-gray-800"
        }`}
      ></div>
    </button>
  );
}
