"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button"; // Assuming you have a Button component

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    return (
        <Button
            variant="outline"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
            {theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
        </Button>
    );
}
