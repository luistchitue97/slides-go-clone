"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

const FALLBACK = "/templates/placeholder-fallback.svg";

/**
 * next/image that swaps to a branded placeholder if the primary src 404s or
 * throws. Used wherever a single static thumbnail is shown outside the card
 * grid (which has its own video → image → fallback chain).
 */
export function ImageWithFallback(props: ImageProps) {
  const [failed, setFailed] = useState(false);
  const { src, onError, alt, ...rest } = props;
  return (
    <Image
      {...rest}
      src={failed ? FALLBACK : src}
      alt={alt}
      onError={(e) => {
        setFailed(true);
        onError?.(e);
      }}
    />
  );
}
