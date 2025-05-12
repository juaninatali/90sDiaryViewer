import { ThemeToggle } from "@/components/ThemeToggle";
import { Navbar } from "@/components/Navbar";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 p-4 max-w-5xl mx-auto w-full">
        <div className="flex justify-end mb-6">
          <ThemeToggle />
        </div>
        {children}
      </main>
    </div>
  );
}
