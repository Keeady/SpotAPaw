import { ImageOff } from "lucide-react";
import { useState } from "react";

export default function PhotoGallery({ photos, alt }: { photos: string[]; alt: string }) {
  const [active, setActive] = useState(0);

  // 0 photos: placeholder
  if (photos.length === 0) {
    return (
      <div className="flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-xl bg-neutral-100 text-neutral-400">
        <ImageOff />
        <span className="text-sm">No photos</span>
      </div>
    );
  }

  const current = Math.min(active, photos.length - 1);

  return (
    <div className="w-full">
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-neutral-100">
        {/* Plain <img> so any photo host works; swap for next/image if you configure remotePatterns */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photos[current]}
          alt={`${alt}, photo ${current + 1} of ${photos.length}`}
          className="h-full w-full object-cover"
        />
        {photos.length > 1 && (
          <span className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-xs font-medium text-white">
            {current + 1} / {photos.length}
          </span>
        )}
      </div>

      {photos.length > 1 && (
        <ul className="mt-2 grid grid-cols-5 gap-2">
          {photos.map((src, i) => (
            <li key={`${src}-${i}`}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show photo ${i + 1}`}
                aria-pressed={i === current}
                className={[
                  "block aspect-square w-full overflow-hidden rounded-lg border-2 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#65539e]",
                  i === current
                    ? "border-[#65539e]"
                    : "border-transparent opacity-70 hover:opacity-100",
                ].join(" ")}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="h-full w-full object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}