import { getAllEntryIds, getEntryById } from "@/lib/entries";
import { Layout } from "@/components/Layout";
import { DiaryImage } from "@/components/DiaryImage";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DiaryEntry } from "@/types/diary";
import { GetStaticPropsContext } from "next";
import { useState } from "react";
import { formatDate } from "@/lib/utils";

type EntryPageProps = {
    entry: DiaryEntry;
};

export async function getStaticPaths() {
    const paths = getAllEntryIds();
    return {
        paths,
        fallback: 'blocking', // prevents 404 for valid IDs not in the prebuilt list
    };
}

export async function getStaticProps(context: GetStaticPropsContext) {
    const { params } = context;
    const entry = getEntryById(params?.id as string);
    if (!entry) {
        return { notFound: true };
    }
    return { props: { entry } };
}

export default function EntryPage({ entry }: EntryPageProps) {
    const [expanded, setExpanded] = useState(false);
    const visibleImages = expanded ? entry.images : entry.images.slice(0, 3);

    return (
        <Layout>
            <Card className="bg-card text-card-foreground">
                <CardContent className="space-y-4 p-6">
                    <h1 className="text-3xl font-bold">{entry.title}</h1>
                    <p className="text-sm text-muted-foreground">{formatDate(entry.date)} - {entry.location}</p>
                    <div className="flex flex-wrap gap-2">
                        {[...entry.tags]
                            .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }))
                            .map((tag) => (
                                <Badge key={tag} variant="outline">
                                    {tag}
                                </Badge>
                            ))}
                    </div>
                    <p className="whitespace-pre-wrap">{entry.text}</p>

                    <div className="flex flex-wrap gap-4">
                        {visibleImages.map((src, index) => (
                            <DiaryImage key={index} src={src} alt={`Diary Scan ${index + 1}`} />
                        ))}
                    </div>

                    {entry.images.length > 3 && (
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="mt-4 text-blue-600 underline text-sm"
                        >
                            {expanded ? "Show Fewer" : "View All Images"}
                        </button>
                    )}
                </CardContent>
            </Card>
        </Layout>
    );
}
