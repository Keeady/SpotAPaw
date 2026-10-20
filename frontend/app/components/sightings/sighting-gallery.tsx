"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, ImageOff, X } from "lucide-react";

type SightingGalleryProps = {
  images: string[];
  /** Photo shown large at first (defaults to the first image). */
  mainPhoto?: string;
  /** Index of the photo open in the lightbox, or null when closed. */
  openIndex: number | null;
  onOpenIndexChange: (index: number | null) => void;
  /** Text shown when an image fails to load. */
  errorLabel?: string;
  className?: string;
};

export default function SightingGallery({
  images,
  mainPhoto,
  openIndex,
  onOpenIndexChange,
  errorLabel = "Image unavailable",
  className = "",
}: SightingGalleryProps) {
  const initial = Math.max(0, mainPhoto ? images.indexOf(mainPhoto) : 0);
  const [active, setActive] = React.useState(initial);
  const [failed, setFailed] = React.useState<Set<string>>(new Set());

  const markFailed = (url: string) =>
    setFailed((prev) => new Set(prev).add(url));

  if (images.length === 0) return null;

  const safeActive = Math.min(active, images.length - 1);

  return (
    <div className={className}>
      {/* Main photo */}
      <button
        type="button"
        onClick={() => onOpenIndexChange(safeActive)}
        className="group relative block aspect-[4/3] w-full overflow-hidden rounded-xl bg-neutral-100"
        aria-label="Open photo"
      >
        {failed.has(images[safeActive]) ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-neutral-500">
            <ImageOff className="h-10 w-10" />
            <span className="text-sm">{errorLabel}</span>
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={images[safeActive]}
            alt=""
            onError={() => markFailed(images[safeActive])}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        )}
        {images.length > 1 && (
          <span className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-xs font-medium text-white">
            {safeActive + 1} / {images.length}
          </span>
        )}
      </button>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
          {images.map((url, i) => (
            <button
              key={url}
              type="button"
              onClick={() => setActive(i)}
              onDoubleClick={() => onOpenIndexChange(i)}
              aria-label={`Photo ${i + 1}`}
              aria-current={i === safeActive}
              className={`h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                i === safeActive
                  ? "border-[#65539e]"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {openIndex !== null && (
        <Lightbox
          images={images}
          index={openIndex}
          onIndexChange={(i) => {
            onOpenIndexChange(i);
            setActive(i);
          }}
          onClose={() => onOpenIndexChange(null)}
        />
      )}
    </div>
  );
}

function Lightbox({
  images,
  index,
  onIndexChange,
  onClose,
}: {
  images: string[];
  index: number;
  onIndexChange: (i: number) => void;
  onClose: () => void;
}) {
  const touchStartX = React.useRef<number | null>(null);
  const count = images.length;
  const safeIndex = Math.min(index, count - 1);

  const go = React.useCallback(
    (delta: number) => onIndexChange((safeIndex + delta + count) % count),
    [safeIndex, count, onIndexChange],
  );

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [go, onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/90"
      onClick={onClose}
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchStartX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        touchStartX.current = null;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
      }}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
      >
        <X className="h-6 w-6" />
      </button>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              go(-1);
            }}
            aria-label="Previous photo"
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <ChevronLeft className="h-7 w-7" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              go(1);
            }}
            aria-label="Next photo"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <ChevronRight className="h-7 w-7" />
          </button>
        </>
      )}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={images[safeIndex]}
        alt=""
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] max-w-[95vw] select-none object-contain"
        draggable={false}
      />

      {count > 1 && (
        <span className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-sm text-white">
          {safeIndex + 1} / {count}
        </span>
      )}
    </div>
  );
}