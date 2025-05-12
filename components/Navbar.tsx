"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export function Navbar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="border-b mb-6">
      <nav className="flex items-center justify-between py-4">
        <Link href="/" className="text-2xl font-bold text-primary">
          90s Diary Archive
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/search"
            className={cn(
              "text-sm font-medium hover:underline",
              mounted && pathname === "/search" && "text-primary underline"
            )}
          >
            Search
          </Link>
        </div>
      </nav>
    </header>
  );
}
