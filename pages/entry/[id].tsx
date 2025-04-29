import { useRouter } from "next/router";
import { diaryEntries } from "@/data/entries";
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DiaryImage } from "@/components/DiaryImage";

export default function EntryPage() {
    const router = useRouter();
    const { id } = router.query;

    const entry = diaryEntries.find((e) => e.id === id);

    if (!entry) {
        return (
            <Layout>
                <div className="p-8">Entry not found.</div>
            </Layout>
        );
    }

    return (
        <Layout>
            <Card>
                <CardContent className="space-y-4 p-6">
                    <h1 className="text-3xl font-bold">{entry.title}</h1>
                    <p className="text-sm text-muted-foreground">{entry.date} — {entry.location}</p>
                    <div className="flex flex-wrap gap-2">
                        {entry.tags.map((tag) => (
                            <Badge key={tag}>{tag}</Badge>
                        ))}
                    </div>
                    <p className="whitespace-pre-wrap">{entry.text}</p>
                    <DiaryImage src={entry.images[0] ?? "/images/placeholder.png"} alt="Diary Scan" />
                </CardContent>
            </Card>
        </Layout>
    );
}
