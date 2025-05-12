import * as React from "react";
import { useState } from "react";

export function DiaryImage({ src, alt }: { src: string; alt: string }) {
  const [error, setError] = useState(false);

  return (
    <div className="w-48">
      <img
        src={error ? "/images/placeholder.png" : src}
        alt={alt}
        // className="!w-48 !h-auto !max-w-none border rounded-md"
        onError={() => setError(true)}
        style={{ width: "300px", height: "auto", border: "1px solid red" }} // forcing inline style
      />
    </div>
  );
}
