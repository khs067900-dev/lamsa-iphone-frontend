"use client";
import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { isCloudinaryUrl } from "../lib/imageUrl";

export default function ProductImage(props: ImageProps) {
  const [failedSource, setFailedSource] = useState<ImageProps["src"] | null>(null);
  const failed = failedSource === props.src;
  const isCloudinary = typeof props.src === "string" && isCloudinaryUrl(props.src);

  return (
    <Image
      {...props}
      alt={props.alt}
      src={failed ? "/product-placeholder.svg" : props.src}
      unoptimized={props.unoptimized ?? (failed || isCloudinary)}
      onError={() => {
        if (!failed) setFailedSource(props.src);
      }}
    />
  );
}
