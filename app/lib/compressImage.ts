/**
 * Client-side image compression utility.
 * Resizes large photos to a maximum dimension (default 1600px)
 * and converts to WebP/JPEG to drastically reduce upload size (often by 85–95%)
 * and avoid server memory spikes or multer file size limits.
 */
export async function compressImage(
  file: File,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
  } = {}
): Promise<File> {
  const { maxWidth = 1600, maxHeight = 1600, quality = 0.82 } = options;

  // If not an image (or if SVG / GIF which should not be compressed via canvas), return as is
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml" || file.type === "image/gif") {
    return file;
  }

  // If already very small (under 120KB), don't recompress
  if (file.size < 120 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;

      // Calculate new dimensions preserving aspect ratio
      if (width > maxWidth || height > maxHeight) {
        if (width / height > maxWidth / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        // Fallback: return original file if canvas context unavailable
        resolve(file);
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);

      // Attempt to encode as WebP, fallback to JPEG
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }

          // If compressed blob is somehow larger than original, use original
          if (blob.size >= file.size) {
            resolve(file);
            return;
          }

          const baseName = file.name.replace(/\.[^/.]+$/, "");
          const newFileName = `${baseName}.webp`;
          const compressedFile = new File([blob], newFileName, {
            type: "image/webp",
            lastModified: Date.now(),
          });

          resolve(compressedFile);
        },
        "image/webp",
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    img.src = objectUrl;
  });
}
