import { getAllEntryIds, getEntryById } from "@/lib/entries";
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DiaryEntry } from "@/types/diary";
import { GetStaticPropsContext } from "next";
import { useCallback, useEffect, useMemo, useState } from "react";
import { formatDate } from "@/lib/utils";
import NextImage from "next/image";

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
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [index, setIndex] = useState(0);

    const normalizeImageSrc = useCallback((src: string) => {
        if (src.startsWith("/")) return src;
        // drop any leading "images/" or "images\" before prefixing
        const cleaned = src.replace(/^images[\\/]+/i, "");
        return `/images/${cleaned}`;
    }, []);

    const images = useMemo(
        () => entry.images.map((src, i) => ({
            src: normalizeImageSrc(src),
            alt: `Image ${i + 1} from "${entry.title}"`,
        })),
        [entry.images, entry.title, normalizeImageSrc]
    );

    const visibleImages = expanded ? images : images.slice(0, 3);

    const openAt = useCallback((i: number) => {
        setIndex(i);
        setLightboxOpen(true);
    }, []);
    const close = useCallback(() => setLightboxOpen(false), []);
    const prev = useCallback(
        () => setIndex((i) => (images.length ? (i - 1 + images.length) % images.length : 0)),
        [images.length]
    );
    const next = useCallback(
        () => setIndex((i) => (images.length ? (i + 1) % images.length : 0)),
        [images.length]
    );

    // Prevent background scroll when lightbox is open
    useEffect(() => {
        if (lightboxOpen) {
            document.documentElement.style.overflow = "hidden";
            return () => { document.documentElement.style.overflow = ""; };
        }
        document.documentElement.style.overflow = "";
    }, [lightboxOpen, close, prev, next]);

    // Keyboard controls
    useEffect(() => {
        if (!lightboxOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") close();
            if (e.key === "ArrowLeft") prev();
            if (e.key === "ArrowRight") next();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [lightboxOpen]);

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

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {visibleImages.map((img, i) => (
                            <button
                                key={`${img.src}-${i}`}
                                onClick={() => openAt(i)}
                                className="group block w-full rounded-xl border border-border/70 bg-card/80 shadow-sm overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                                aria-label={`Open image ${i + 1} in lightbox`}
                            >
                                <div className="relative w-full overflow-hidden">
                                    <div className="relative w-full" style={{ paddingBottom: "133%" }}>
                                        <NextImage
                                            src={img.src}
                                            alt={img.alt}
                                            fill
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                                        />
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>

                    {entry.images.length > 3 && (
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="mt-4 text-muted-foreground underline text-sm hover:text-foreground transition-colors"
                        >
                            {expanded ? "Show Fewer" : "View All Images"}
                        </button>
                    )}
                </CardContent>
            </Card>

            {/* LIGHTBOX */}
            {lightboxOpen && images[index] && (
                <div
                    role="dialog"
                    aria-modal="true"
                    className="fixed inset-0 z-[999] bg-black/90 backdrop-blur-sm flex items-center justify-center"
                    onClick={close}
                >
                    <div
                        className="relative w-[92vw] max-w-5xl max-h-[90vh] mx-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={close}
                            aria-label="Close"
                            className="absolute -top-12 right-0 text-white/80 hover:text-white underline"
                        >
                            Close (Esc)
                        </button>

                        <div className="relative w-full h-[70vh] md:h-[80vh]">
                            <NextImage
                                key={images[index].src}
                                src={images[index].src}
                                alt={images[index].alt}
                                fill
                                priority
                                sizes="90vw"
                                className="object-contain"
                            />
                        </div>

                        <div className="mt-3 flex items-center justify-between text-white/90 text-sm">
                            <div className="flex flex-wrap gap-2">
                                <span>{index + 1} / {images.length}</span>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={prev} className="underline" aria-label="Previous image">Prev</button>
                                <button onClick={next} className="underline" aria-label="Next image">Next</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}
