"use client";
import NextImage from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type GalleryImage = {
    src: string;
    alt?: string;
    entryId?: string;     // for deep-linking back to the diary entry
    date?: string;        // ISO date (YYYY-MM-DD) if you have it
    title?: string;       // optional context/title
};

export default function Gallery({ images }: { images: GalleryImage[] }) {
    const [open, setOpen] = useState(false);
    const [index, setIndex] = useState(0);

    const openAt = useCallback((i: number) => {
        setIndex(i);
        setOpen(true);
    }, []);

    const close = useCallback(() => {
        setOpen(false);
    }, []);

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
        if (open) {
            document.documentElement.style.overflow = "hidden";
            return () => {
                document.documentElement.style.overflow = "";
            };
        }
        document.documentElement.style.overflow = "";
    }, [open]);

    // Keyboard controls when lightbox is open
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") close();
            if (e.key === "ArrowLeft") prev();
            if (e.key === "ArrowRight") next();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, close, prev, next]);

    // Clamp index when images change
    useEffect(() => {
        if (images.length === 0) {
            setIndex(0);
            return;
        }
        setIndex((i) => Math.min(Math.max(0, i), images.length - 1));
    }, [images.length]);

    // Preload neighbors for snappier nav
    useEffect(() => {
        if (!open || images.length === 0) return;
        const NativeImage = (globalThis as any).Image as typeof window.Image | undefined;
        if (!NativeImage) return;
        const left = new NativeImage();
        left.src = images[(index - 1 + images.length) % images.length]?.src || "";
        const right = new NativeImage();
        right.src = images[(index + 1) % images.length]?.src || "";
    }, [open, index, images]);

    const current = images[index];

    return (
        <>
            {images.length === 0 ? (
                <div className="text-sm text-muted-foreground">No images to display.</div>
            ) : null}
            {/* Grid layout to preserve row-major visual order */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((img, i) => (
                    <button
                        key={`${img.src}-${i}`}
                        onClick={() => openAt(i)}
                        className="block w-full focus:outline-none focus:ring-2 focus:ring-ring rounded-lg overflow-hidden"
                        aria-label={`Open image ${i + 1} in lightbox`}
                    >
                        <div className="relative w-full overflow-hidden rounded-lg">
                            {/* Use a ratio box for better CLS; tweak as needed */}
                            <div className="relative w-full" style={{ paddingBottom: "133%" }}>
                                <NextImage
                                    src={img.src}
                                    alt={img.alt ?? "Diary photo"}
                                    fill
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                    className="object-cover transition-transform duration-300 hover:scale-[1.02]"
                                />
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            {/* LIGHTBOX */}
            {open && current && (
                <div
                    role="dialog"
                    aria-modal="true"
                    className="fixed inset-0 z-[999] bg-black/90 backdrop-blur-sm flex items-center justify-center"
                    onClick={close}
                >
                    {/* click shield: stop clicks inside from closing */}
                    <div
                        className="relative w-[92vw] max-w-5xl max-h-[90vh] mx-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close */}
                        <button
                            onClick={close}
                            aria-label="Close"
                            className="absolute -top-12 right-0 text-white/80 hover:text-white underline"
                        >
                            Close (Esc)
                        </button>

                        {/* Image */}
                        <div className="relative w-full h-[70vh] md:h-[80vh]">
                            <NextImage
                                key={current.src}
                                src={current.src}
                                alt={current.alt ?? "Diary photo"}
                                fill
                                priority
                                sizes="90vw"
                                className="object-contain"
                            />
                        </div>

                        {/* Meta + controls */}
                        <div className="mt-3 flex items-center justify-between text-white/90 text-sm">
                            <div className="flex flex-wrap gap-2">
                                <span>
                                    {index + 1} / {images.length}
                                </span>
                                {current.date && <span className="opacity-80">{current.date}</span>}
                                {current.title && <span className="opacity-80">• {current.title}</span>}
                                {current.entryId && (
                                    <>
                                        <span className="opacity-40">•</span>
                                        <Link href={`/entry/${current.entryId}`} className="underline">
                                            View entry
                                        </Link>
                                    </>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <button onClick={prev} className="underline" aria-label="Previous image">Prev (←)</button>
                                <button onClick={next} className="underline" aria-label="Next image">Next (→)</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
