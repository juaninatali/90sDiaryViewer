import { useEffect, useState } from "react";

export function DiaryImage({ src, alt }: { src: string; alt: string }) {
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
  }, [src]);

  return (
    <div className="w-48">
      <img
        src={error ? "/images/placeholder.png" : src}
        alt={alt}
        onError={() => setError(true)}
        className="w-72 h-auto border border-border rounded-md"
        // style={{ width: "300px", height: "auto", border: "1px solid red" }} // forcing inline style
      />
    </div>
  );
}
