import { useEffect, useState } from "react";

export function DiaryImage({ src, alt }: { src: string; alt: string }) {
  const [error, setError] = useState(false);

  const normalizedSrc = src.startsWith("/")
    ? src
    : `/images/${src.replace(/^(?:images\/)+/, "")}`;

  useEffect(() => {
    setError(false);
  }, [normalizedSrc]);

  return (
    <div className="w-full sm:w-auto">
      <img
        src={error ? "/images/placeholder.png" : normalizedSrc}
        alt={alt}
        onError={() => setError(true)}
        className="w-full sm:w-40 h-auto border border-border rounded-md"
        // style={{ width: "300px", height: "auto", border: "1px solid red" }} // forcing inline style
      />
    </div>
  );
}
