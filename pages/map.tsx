import type { GetStaticProps } from "next";
import { Layout } from "@/components/Layout";
import VenueMap from "@/components/VenueMap";
import { getMapData, reportMapDataDiagnostics } from "@/lib/server/mapData";
import type { MapLocationData } from "@/types/map";

type MapPageProps = { locations: MapLocationData[] };

export default function MapPage({ locations }: MapPageProps) {
  return (
    <Layout>
      <h1 className="mb-4 text-3xl font-bold">Archive Map</h1>
      <VenueMap locations={locations} />
    </Layout>
  );
}

export const getStaticProps: GetStaticProps<MapPageProps> = async () => {
  const mapData = getMapData();
  reportMapDataDiagnostics(mapData);
  const { locations } = mapData;
  return { props: { locations } };
};
