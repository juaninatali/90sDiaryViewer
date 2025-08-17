"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function Navbar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b mb-6 bg-background">
      <nav className="flex items-center justify-between py-4">
        {mounted ? (
          pathname !== "/" ? (
            <Link href="/" className="text-2xl font-bold text-foreground">
              90s Diary Archive
            </Link>
          ) : (
            <span className="text-2xl font-bold text-transparent select-none">
              90s Diary Archive
            </span>
          )
        ) : null}

        <div className="flex items-center gap-6">
          {mounted && pathname !== "/search" && (
            <Link href="/search" className="text-sm font-medium hover:underline">
              Search
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
