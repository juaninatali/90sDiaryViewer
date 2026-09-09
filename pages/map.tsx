import type { GetStaticProps } from "next";
import { Layout } from "@/components/Layout";
import VenueMap from "@/components/VenueMap";
import { getAllEntries } from "@/lib/entries";
import type { DiaryEntry } from "@/types/diary";

type MapPageProps = { entries: DiaryEntry[] };

export default function MapPage({ entries }: MapPageProps) {
  return (
    <Layout>
      <h1 className="mb-4 text-3xl font-bold">Archive Map</h1>
      <VenueMap entries={entries} />
    </Layout>
  );
}

export const getStaticProps: GetStaticProps<MapPageProps> = async () => ({
  props: { entries: getAllEntries() },
});
