import Link from "next/link";
import { Layout } from "@/components/Layout";
import Image from "next/image";

export default function Home() {
  return (
    <Layout>
      {/* Banner Section */}
      <div className="relative w-full h-[30vh]">
        <Image
          src="/images/banner.jpg" // your optimized 3840x648 file here
          alt="90s Buenos Aires underground scene"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <h1 className="text-white text-4xl md:text-5xl font-bold drop-shadow-lg">
            90s Diary Archive
          </h1>
        </div>
      </div>

      {/* Intro Section */}
      <main className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center mt-8">
        <p className="text-lg mb-8 max-w-2xl">
          Memorias, momentos y detalles de la escena Electrónica Underground en
          Buenos Aires en los 90s.
        </p>
        <Link href="/search" className="text-foreground underline text-lg">
          Start Browsing
        </Link>
      </main>
    </Layout>
  );
}
