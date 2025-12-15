"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export function Navbar() {
  const router = useRouter();
  const pathname = router.pathname;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
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
          {mounted && pathname !== "/gallery" && (
            <Link href="/gallery" className="text-sm font-medium hover:underline">
              Gallery
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
