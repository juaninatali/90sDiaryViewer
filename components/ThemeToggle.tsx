"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent mismatched rendering on first load
  // if (!mounted) return null;

  if (!mounted) {
    return (
      <Button variant="outline" disabled>
        Loading theme...
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label={theme === "dark" ? "Light Mode" : "Dark Mode"}
    >
      {/* Full label on sm+ */}
      <span className="hidden sm:inline">
        {theme === "dark" ? "Light Mode" : "Dark Mode"}
      </span>
      {/* Icon-only on xs */}
      <span className="inline sm:hidden" aria-hidden="true">
        {theme === "dark" ? "☀️" : "🌙"}
      </span>
    </Button>
  );
}
