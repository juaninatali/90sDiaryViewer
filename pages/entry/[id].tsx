import { getAllEntryIds, getEntryById } from "@/lib/entries";
import { Layout } from "@/components/Layout";
import { DiaryImage } from "@/components/DiaryImage";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DiaryEntry } from "@/types/diary";
import { GetStaticPropsContext } from "next";


type EntryPageProps = {
    entry: DiaryEntry;
};

export async function getStaticPaths() {
    const paths = getAllEntryIds();
    return { paths, fallback: false };
}

export async function getStaticProps(context: GetStaticPropsContext) {
    const { params } = context;
    const entry = getEntryById(params?.id as string);
    return { props: { entry } };
}

export default function EntryPage({ entry }: EntryPageProps) {
    return (
        <Layout>
            <Card>
                <CardContent className="space-y-4 p-6">
                    <h1 className="text-3xl font-bold">{entry.title}</h1>
                    <p className="text-sm text-muted-foreground">{entry.date} - {entry.location}</p>
                    <div className="flex flex-wrap gap-2">
                        {entry.tags.map((tag) => <Badge key={tag}>{tag}</Badge>)}
                    </div>
                    <p className="whitespace-pre-wrap">{entry.text}</p>
                    <div className="flex flex-wrap gap-4">
                        {entry.images.map((src, index) => (
                            <DiaryImage key={index} src={src} alt={`Diary Scan ${index + 1}`} />
                        ))}
                    </div>
                </CardContent>
            </Card>
        </Layout>
    );
}
