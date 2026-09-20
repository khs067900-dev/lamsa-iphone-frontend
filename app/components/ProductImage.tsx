"use client";
import Image, { type ImageProps } from "next/image";
import { useState } from "react";
export default function ProductImage(props: ImageProps) {
  const [failedSource, setFailedSource] = useState<ImageProps["src"] | null>(null);
  const failed = failedSource === props.src;
  return <Image {...props} alt={props.alt} src={failed ? "/product-placeholder.svg" : props.src} unoptimized={failed || props.unoptimized} onError={() => { if (!failed) setFailedSource(props.src); }} />;
}
