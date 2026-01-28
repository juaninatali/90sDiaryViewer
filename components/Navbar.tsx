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
      <nav className="mx-auto flex max-w-5xl items-center justify-center px-4 py-4">
        <div className="flex items-center gap-9">
          {mounted ? (
            pathname !== "/" ? (
              <Link href="/" className="text-xl font-medium hover:underline">
                Home
              </Link>
            ) : (
              <span className="text-xl font-medium text-foreground">Home</span>
            )
          ) : null}
          {mounted ? (
            pathname !== "/search" ? (
              <Link href="/search" className="text-xl font-medium hover:underline">
                Search
              </Link>
            ) : (
              <span className="text-xl font-medium text-foreground">Search</span>
            )
          ) : null}
          {mounted ? (
            pathname !== "/gallery" ? (
              <Link href="/gallery" className="text-xl font-medium hover:underline">
                Gallery
              </Link>
            ) : (
              <span className="text-xl font-medium text-foreground">Gallery</span>
            )
          ) : null}
        </div>
      </nav>
    </header>
  );
}
