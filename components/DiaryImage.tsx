import * as React from "react";
import { useState } from "react";

export function DiaryImage({ src, alt }: { src: string; alt: string }) {
  const [error, setError] = useState(false);

  return (
    <img
      src={error ? "/images/placeholder.png" : src}
      alt={alt}
      className="rounded-md border max-w-full"
      onError={() => setError(true)}
    />
  );
}
