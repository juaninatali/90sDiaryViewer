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
    >
      {theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
    </Button>
  );
}
