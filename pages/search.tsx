import { Layout } from "@/components/Layout";
import DiaryViewer from "@/components/DiaryViewer";
import { getAllEntries } from "@/lib/entries";
import { DiaryEntry } from "@/types/diary";
import { useRouter } from "next/router";

export async function getStaticProps() {
  const entries = getAllEntries();
  return { props: { entries } };
}

type SearchPageProps = {
  entries: DiaryEntry[];
};

export default function SearchPage({ entries }: SearchPageProps) {
  const router = useRouter();

  return (
    <Layout>
      {/* Pass current query params down so DiaryViewer can hydrate from them */}
      <DiaryViewer entries={entries} initialQuery={router.query} />
    </Layout>
  );
}
