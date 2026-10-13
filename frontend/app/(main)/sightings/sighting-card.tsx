"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar1, ImageOff, MapPin, PawPrint } from "lucide-react";

export type Sighting = {
  id: string;
  is_active: boolean;
  name: string;
  type: string;
  breed: string;
  species: string;
  lastSeenAt: string;
  distanceMiles: number;
  colors: string[];
  gender: string;
  age: string;
  features: string;
  photos: string[];
};

type SightingCardProps = {
  sighting: Sighting;
  /** If provided, the pet name links to the sighting detail page */
  href?: string;
};

const MAX_PHOTOS = 5;

function PhotoGallery({ photos, alt }: { photos: string[]; alt: string }) {
  const [active, setActive] = useState(0);
  const shown = photos.slice(0, MAX_PHOTOS);

  // 0 photos: placeholder
  if (shown.length === 0) {
    return (
      <div className="flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-xl bg-neutral-100 text-neutral-400">
        <ImageOff />
        <span className="text-sm">No photos</span>
      </div>
    );
  }

  const current = Math.min(active, shown.length - 1);

  return (
    <div className="w-full">
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-neutral-100">
        {/* Plain <img> so any photo host works; swap for next/image if you configure remotePatterns */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={shown[current]}
          alt={`${alt}, photo ${current + 1} of ${shown.length}`}
          className="h-full w-full object-cover"
        />
        {shown.length > 1 && (
          <span className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-xs font-medium text-white">
            {current + 1} / {shown.length}
          </span>
        )}
      </div>

      {shown.length > 1 && (
        <ul className="mt-2 grid grid-cols-5 gap-2">
          {shown.map((src, i) => (
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

function Detail({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm text-neutral-900">{children}</dd>
    </div>
  );
}

export default function SightingCard({ sighting, href }: SightingCardProps) {
  const {
    id,
    name,
    type,
    breed,
    species,
    lastSeenAt,
    distanceMiles,
    colors,
    gender,
    age,
    features,
    photos,
  } = sighting;

  const lastSeen = new Date(lastSeenAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <article key={id} className="flex w-full flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-4 font-sans shadow-sm sm:p-5 md:flex-row md:gap-6">
      {/* Gallery (left on md+, top on small screens) */}
      <div className="w-full md:w-72 md:shrink-0 lg:w-80">
        <PhotoGallery photos={photos} alt={`${name}, ${type}`} />
      </div>

      {/* Details (right on md+, below on small screens) */}
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <header>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold text-neutral-900 sm:text-2xl">
              {href ? (
                <Link
                  href={href}
                  className="hover:text-[#65539e] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#65539e]"
                >
                  {name}
                </Link>
              ) : (
                name
              )}
            </h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#65539e]/10 px-2.5 py-0.5 text-sm font-semibold text-[#65539e]">
              <PawPrint />
              {type}
            </span>
          </div>

          <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-600">
            <span className="inline-flex items-center gap-1">
              <Calendar1 />
              Last seen {lastSeen}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin />
              {distanceMiles.toFixed(1)} mi away
            </span>
          </p>
        </header>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
          <Detail label="Breed">{breed}</Detail>
          <Detail label="Species">{species}</Detail>
          <Detail label="Gender">
            <span className="inline-flex items-center gap-1">{gender}</span>
          </Detail>
          <Detail label="Age">{age}</Detail>
        </dl>

        <div>
          <h3 className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            Colors
          </h3>
          {colors.length > 0 ? (
            <ul className="mt-1.5 flex flex-wrap gap-2">
              {colors.map((c) => (
                <li
                  key={c}
                  className="rounded-full border border-neutral-300 bg-neutral-50 px-2.5 py-0.5 text-sm text-neutral-800"
                >
                  {c}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-sm text-neutral-500">Not specified</p>
          )}
        </div>

        {features && (
          <div>
            <h3 className="text-xs font-medium uppercase tracking-wide text-neutral-500">
              Features
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-neutral-800">
              {features}
            </p>
          </div>
        )}
      </div>
    </article>
  );
}
