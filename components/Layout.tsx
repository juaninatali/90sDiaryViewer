import { ThemeToggle } from "@/components/ThemeToggle";

export function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen p-4 max-w-5xl mx-auto">
            <div className="flex justify-end mb-6">
                <ThemeToggle />
            </div>
            {children}
        </div>
    );
}
