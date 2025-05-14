import { Layout } from "@/components/Layout";
import DiaryViewer from "@/components/DiaryViewer";
import { getAllEntries } from "@/lib/entries";
import { DiaryEntry } from "@/types/diary";

export async function getStaticProps() {
  const entries = getAllEntries();
  return { props: { entries } };
}

type SearchPageProps = {
    entries: DiaryEntry[];
  };

export default function SearchPage({ entries }: SearchPageProps) {
  return (
    <Layout>
      <DiaryViewer entries={entries} />
    </Layout>
  );
}
