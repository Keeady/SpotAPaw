// SHARED (no directive): presentational only. It has no hooks, so it needs no
// "use client" itself; it becomes part of the client bundle because
// report-list.tsx (a client component) imports it.
//
// Markup inside the clickable variant is <span>-based because block elements
// (div, h3, p) are not valid inside a <button>.

import { Sighting } from "@/lib/sightings/sighting";
import { ChevronRight, Loader2 } from "lucide-react";
import Image from "next/image";

const dateFormat = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

function formatDate(iso: string) {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : dateFormat.format(date);
}

const cardBase =
  "flex w-full items-start gap-3 rounded-2xl border border-neutral-200 bg-white p-3 text-left";

type ReportCardProps = {
  sighting: Sighting;
  /** Only active reports are clickable, matching the original behavior. */
  onOpen?: (report: Sighting) => void;
  opening?: boolean;
  disabled?: boolean;
};

export function MySightingCard({
  sighting,
  onOpen,
  opening = false,
  disabled = false,
}: ReportCardProps) {
  const clickable = sighting.isActive && !!onOpen;

  const content = (
    <>
      <span className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-neutral-100">
        {sighting.photos?.length > 0 ? (
          <img
            src={sighting.photos[0]}
            alt={`${sighting.species} report photo`}
            loading="lazy"
            className="size-full object-cover"
            width={135}
            height={40}
          />
        ) : (
          <span className="text-xs text-neutral-500">No photo</span>
        )}
      </span>

      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="flex items-center justify-between gap-2">
          <span className="min-w-0 flex-1 truncate text-sm font-semibold capitalize text-neutral-900">
            {sighting.species}
          </span>
          <span
            className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-white ${
              sighting.isActive ? "bg-[#6750A4]" : "bg-emerald-600"
            }`}
          >
            {sighting.isActive ? "ACTIVE" : "RESOLVED"}
          </span>
        </span>

        {/* Formatted in the viewer's timezone, which can differ from the
            server's, so skip the hydration text comparison for this node. */}
        <time
          dateTime={sighting.createdAt || undefined}
          suppressHydrationWarning
          className="text-xs text-neutral-600"
        >
          {formatDate(sighting.createdAt)}
        </time>

        {sighting.features ? (
          <span className="line-clamp-2 text-xs text-neutral-500">
            {sighting.features}
          </span>
        ) : null}
      </span>

      {clickable ? (
        opening ? (
          <Loader2
            className="size-5 shrink-0 animate-spin self-center text-[#6750A4]"
            aria-hidden
          />
        ) : (
          <ChevronRight
            className="size-5 shrink-0 self-center text-neutral-400"
            aria-hidden
          />
        )
      ) : null}
    </>
  );

  if (!clickable) {
    return <div className={cardBase}>{content}</div>;
  }

  return (
    <button
      type="button"
      onClick={() => onOpen?.(sighting)}
      disabled={disabled}
      aria-busy={opening}
      className={`${cardBase} transition-colors hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6750A4] disabled:cursor-wait disabled:opacity-60`}
    >
      {content}
    </button>
  );
}