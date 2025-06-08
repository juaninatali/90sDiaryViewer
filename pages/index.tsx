import Link from "next/link";
import { Layout } from "@/components/Layout";

export default function Home() {
  return (
    <Layout>
      <main className="flex flex-col items-center justify-center min-h-[80vh]">
        <h1 className="text-4xl font-bold mb-6">📚 90s Diary Archive</h1>
        <p className="text-lg mb-8 text-center">Memorias, momentos y detalles de la escena Electrónica Underground en Buenos Aires en los 90s.</p>
        <Link href="/search" className="text-foreground underline text-lg">
          Start Browsing
        </Link>
      </main>
    </Layout>
  );
}
