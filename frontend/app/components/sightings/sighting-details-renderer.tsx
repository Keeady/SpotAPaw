"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import {
  Dog,
  HelpCircle,
  ImageOff,
  List,
  Map as MapIcon,
  MapPin,
  MessageSquare,
  PawPrint,
  Phone,
  Venus,
  Mars,
  Loader2,
} from "lucide-react";
import SightingGallery from "./sighting-gallery";
import {
  AggregatedSighting,
  Sighting,
} from "@/lib/sightings/agregated-sighting";
import { SightingLocation } from "../location/location-types";
import {
  getLastSeenLocationDistance,
  getLastSeenLocationURLMap,
  getLastSeenTimeDistance,
} from "@/app/utils/sighting-distance";

// Leaflet touches `window`, so the map must only render on the client.
const DropPinOnMap = dynamic(() => import("../location/drop-pin-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[350px] w-full items-center justify-center rounded-xl bg-[#F7F2FA]">
      <Loader2 className="h-6 w-6 animate-spin text-[#6750A4]" />
    </div>
  ),
});

/* ------------------------------------------------------------------ */
/* helpers                                                            */
/* ------------------------------------------------------------------ */

function dedupPhotos(sightings: AggregatedSighting[]) {
  const seen = new Set<string>();
  const photos: string[] = [];
  sightings.forEach((s) => {
    s.photos?.forEach((url: string) => {
      if (url && !seen.has(url)) {
        seen.add(url);
        photos.push(url);
      }
    });
  });
  return photos;
}

// colors may be a comma-separated string or an array
function toColorList(colors: unknown): string[] {
  if (!colors) return [];
  if (Array.isArray(colors)) return colors.map(String).filter(Boolean);
  return String(colors)
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function GenderIcon({ gender }: { gender?: string }) {
  const cls = "h-4 w-4 text-neutral-900 dark:text-neutral-100";
  if (gender === "Male") return <Mars className={cls} />;
  if (gender === "Female") return <Venus className={cls} />;
  return <HelpCircle className={cls} />;
}

// The RN app used paper icon names; on web a small emoji map is enough.
function speciesEmoji(species?: string) {
  switch ((species || "").toLowerCase()) {
    case "dog":
      return "🐕";
    case "cat":
      return "🐈";
    case "bird":
      return "🐦";
    case "rabbit":
      return "🐇";
    default:
      return "🐾";
  }
}

/* ------------------------------------------------------------------ */
/* small building blocks                                              */
/* ------------------------------------------------------------------ */

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="block text-xs font-medium uppercase tracking-wide text-neutral-500">
      {children}
    </span>
  );
}

function Detail({
  label,
  className = "",
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`pr-2 ${className}`}>
      <Label>{label}</Label>
      <div className="mt-0.5 flex items-center text-sm text-neutral-900">
        {children}
      </div>
    </div>
  );
}

function ColorChips({ colors }: { colors: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {colors.map((c) => (
        <span
          key={c}
          className="rounded-full border border-neutral-300 bg-neutral-50 px-2.5 py-0.5 text-sm text-neutral-800"
        >
          {c}
        </span>
      ))}
    </div>
  );
}

type BtnVariant = "contained" | "tonal" | "text";

function Button({
  variant = "text",
  icon,
  disabled,
  onClick,
  children,
}: {
  variant?: BtnVariant;
  icon?: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  const styles: Record<BtnVariant, string> = {
    contained: "bg-[#65539e] text-white hover:bg-[#56468a] px-5 py-2",
    tonal: "bg-[#65539e]/10 text-[#65539e] hover:bg-[#65539e]/20 px-3 py-1.5",
    text: "text-[#65539e] hover:bg-[#65539e]/10 px-3 py-1.5",
  };
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-1.5 rounded-full text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${styles[variant]}`}
    >
      {icon}
      {children}
    </button>
  );
}

type SightingDetailRendererProps = {
  currentLocation: SightingLocation;
  sightings: Sighting[];
  summary: AggregatedSighting;
  claimed: boolean;
  onEdit?: () => void;
  onAddSighting: () => void;
  claimPet?: () => void;
  hasOwner: boolean;
  isOwner: boolean;
  onPetFound?: () => void;
  onShareSighting: () => void;
  onViewMatches?: () => void;
  onViewPoster?: () => void;
};

export default function SightingDetailRenderer({
  currentLocation,
  sightings,
  summary,
  onEdit,
  claimPet,
  claimed,
  hasOwner,
  isOwner,
  onPetFound,
  onViewMatches,
  onViewPoster,
}: SightingDetailRendererProps) {
  const [lightboxIndex, setLightboxIndex] = React.useState<number | null>(null);
  const [viewMode, setViewMode] = React.useState<"list" | "map">("list");

  const uniquePhotos = React.useMemo(() => dedupPhotos(sightings), [sightings]);

  // One pin per sighting that has coordinates; the latest sighting is highlighted
  const pins = React.useMemo(
    () =>
      sightings
        .map((s, index) => ({
          latitude: Number(s.lastSeenLat),
          longitude: Number(s.lastSeenLong),
          title: getLastSeenTimeDistance(s.lastSeenTime),
          color: index === 0 ? "#65539e" : "#9ca3af",
          description: s.features || s.note || "",
        }))
        .filter(
          (p) => Number.isFinite(p.latitude) && Number.isFinite(p.longitude),
        ),
    [sightings],
  );

  const handleCall = (phone: string) => {
    if (phone) window.location.href = `tel:${phone}`;
  };
  const handleText = (phone: string) => {
    if (phone) window.location.href = `sms:${phone}`;
  };

  const summaryColors = toColorList(summary?.colors);
  const speciesKey = summary?.species ? capitalize(summary.species) : "";
  const speciesLabel = speciesKey ? speciesKey : "";

  const hasActions = !!(
    claimed ||
    (!hasOwner && claimPet) ||
    onViewMatches ||
    onEdit ||
    onPetFound ||
    onViewPoster
  );

  // Open the lightbox on the photo that was clicked in a timeline card
  const openPhoto = (url?: string) => {
    if (!url) return;
    const i = uniquePhotos.indexOf(url);
    setLightboxIndex(i >= 0 ? i : 0);
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto w-full max-w-5xl p-4 pb-32">
        {/* ---------- Summary card ---------- */}
        <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 p-4 sm:p-5 md:flex-row md:gap-6">
            {/* Photos (left on tablets, top on phones) */}
            <div className="w-full md:w-72 md:shrink-0 md:self-start lg:w-80">
              {uniquePhotos.length > 0 ? (
                <SightingGallery
                  images={uniquePhotos}
                  mainPhoto={summary?.photos?.[0]}
                  openIndex={lightboxIndex}
                  onOpenIndexChange={setLightboxIndex}
                />
              ) : (
                <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-1 rounded-xl bg-neutral-100 text-neutral-500">
                  <ImageOff className="h-11 w-11 sm:h-14 sm:w-14" />
                  <span className="text-sm">No photos</span>
                </div>
              )}
            </div>

            {/* Details (right on tablets, below on phones) */}
            <div className="flex min-w-0 flex-1 flex-col gap-3.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="line-clamp-2 min-w-0 shrink text-xl font-bold text-neutral-900 sm:text-2xl">
                  {summary?.name || "Unknown"}
                </h1>
                {!!speciesKey && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#65539e]/10 px-2.5 py-0.5 text-sm font-semibold text-[#65539e]">
                    <PawPrint />

                    {speciesLabel}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-y-3">
                {!!summary?.breed && (
                  <Detail label={"Breed"}>{summary.breed}</Detail>
                )}
                {!!summary?.gender && (
                  <Detail label={"Gender"}>
                    <GenderIcon gender={summary.gender} />
                    <span className="ml-1">{summary.gender}</span>
                  </Detail>
                )}
                {!!summary?.age && <Detail label={"Age"}>{summary.age}</Detail>}
              </div>

              {summaryColors.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <Label>{"Colors"}</Label>
                  <ColorChips colors={summaryColors} />
                </div>
              )}

              {!!summary?.features && (
                <div className="flex flex-col gap-1.5">
                  <Label>{"Features"}</Label>
                  <p className="text-sm text-neutral-900">{summary.features}</p>
                </div>
              )}

              {!!summary?.note && (
                <div className="flex flex-col gap-1.5">
                  <Label>{"Notes"}</Label>
                  <p className="text-sm text-neutral-900">{summary.note}</p>
                </div>
              )}
            </div>
          </div>

          {/* CTA row */}
          {hasActions && (
            <div className="flex flex-wrap items-center justify-center gap-0.5 border-t border-neutral-200 p-4 sm:justify-start sm:px-5">
              {claimed && (
                <span className="rounded-full border border-neutral-300 bg-neutral-50 px-3 py-1 text-sm text-neutral-500 opacity-60">
                  {"Owner Pending"}
                </span>
              )}
              {!hasOwner && claimPet && (
                <Button variant="contained" onClick={() => claimPet()}>
                  {"This is my pet."}
                </Button>
              )}
              {onViewMatches && (
                <Button onClick={() => onViewMatches()}>
                  {"View Matches"}
                </Button>
              )}
              {onViewPoster && (
                <Button onClick={() => onViewPoster()}>{"View Poster"}</Button>
              )}
              {onPetFound && (
                <Button onClick={() => onPetFound()}>{"Pet Found"}</Button>
              )}
              {onEdit && (
                <Button onClick={() => onEdit()}>{"Edit Sighting"}</Button>
              )}
            </div>
          )}
        </section>

        {/* ---------- Sightings timeline header ---------- */}
        {sightings.length > 0 && (
          <div className="mb-4 mt-6 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-neutral-900 sm:text-2xl">
              {"Sighting Timeline"}
            </h2>
            <div
              role="tablist"
              className="inline-flex overflow-hidden rounded-full border border-neutral-300"
            >
              {(
                [
                  ["list", "List", <List key="l" className="h-4 w-4" />],
                  ["map", "Map", <MapIcon key="m" className="h-4 w-4" />],
                ] as const
              ).map(([value, label, icon]) => (
                <button
                  key={value}
                  type="button"
                  role="tab"
                  aria-selected={viewMode === value}
                  onClick={() => setViewMode(value)}
                  className={`inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium transition ${
                    viewMode === value
                      ? "bg-[#65539e]/10 text-[#65539e]"
                      : "text-neutral-700 hover:bg-neutral-100"
                  } ${value === "map" ? "border-l border-neutral-300" : ""}`}
                >
                  {icon}
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ---------- Map or list ---------- */}
        {viewMode === "map" ? (
          pins.length > 0 ? (
            <div className="relative z-0 h-[420px] overflow-hidden rounded-2xl border border-neutral-200 sm:h-[520px]">
              <DropPinOnMap
                currentLocation={{
                  latitude: pins[0].latitude,
                  longitude: pins[0].longitude,
                }}
                handleActionButton={() => void 0}
                pins={pins}
                readonly={true}
              />
            </div>
          ) : (
            <p className="text-sm text-neutral-500">
              {"No locations to show on the map."}
            </p>
          )
        ) : (
          sightings.map((sighting, index) => {
            const isLatest = index === 0; // assuming sightings sorted DESC by created_at
            const colors = toColorList(sighting.colors);
            const reporterPhone = sighting.reporterPhone;
            const hasMapLocation = !!(
              sighting.lastSeenLocation ||
              (sighting.lastSeenLat && sighting.lastSeenLong)
            );
            const isLast = index === sightings.length - 1;

            return (
              <div key={sighting.id} className="flex">
                {/* Timeline rail */}
                <div className="flex w-5 shrink-0 flex-col items-center">
                  <div
                    className={`my-1 h-3.5 w-3.5 rounded-full ${
                      isLatest ? "bg-[#65539e]" : "bg-neutral-300"
                    }`}
                  />

                  {!isLast && (
                    <div className="mt-0.5 w-0.5 flex-1 bg-neutral-300" />
                  )}
                </div>

                {/* Sighting card */}
                <div className="mb-4 ml-1.5 min-w-0 flex-1">
                  <article
                    className={`rounded-2xl bg-white shadow-sm ${
                      isLatest
                        ? "border-[1.5px] border-[#65539e]"
                        : "border border-neutral-200"
                    }`}
                  >
                    <div className="flex flex-col gap-3 p-4">
                      {/* Header: thumbnail + time + distance */}
                      <div className="flex items-center gap-3">
                        {sighting.photos && sighting.photos.length > 0 ? (
                          <button
                            type="button"
                            onClick={() => openPhoto(sighting.photos?.[0])}
                            aria-label="Open photo"
                            className="h-12 w-12 shrink-0 overflow-hidden rounded-full"
                          >
                            <img
                              src={sighting.photos[0]}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          </button>
                        ) : (
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#65539e] text-white">
                            <PawPrint className="h-6 w-6" />
                          </div>
                        )}
                        <div className="flex flex-row min-w-0 flex-1 gap-5">
                          <span className="text-sm font-bold text-neutral-900">
                            {getLastSeenTimeDistance(sighting.lastSeenTime)}
                          </span>
                          <span className="flex items-center gap-1 text-sm text-neutral-500">
                            <MapPin className="h-4 w-4 shrink-0" />

                            {currentLocation &&
                            sighting.lastSeenLat &&
                            sighting.lastSeenLong
                              ? getLastSeenLocationDistance(
                                  currentLocation.latitude,
                                  currentLocation.longitude,
                                  sighting.lastSeenLat,
                                  sighting.lastSeenLong,
                                )
                              : "No distance data"}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-3">
                        {/* Breed / gender */}
                        {(!!sighting.breed || !!sighting.gender) && (
                          <div className="flex flex-wrap gap-y-3">
                            {!!sighting.breed && (
                              <Detail label={"Breed"}>{sighting.breed}</Detail>
                            )}
                            {!!sighting.gender && (
                              <Detail label={"Gender"}>
                                <GenderIcon gender={sighting.gender} />
                                <span className="ml-1">{sighting.gender}</span>
                              </Detail>
                            )}
                          </div>
                        )}

                        {colors.length > 0 && (
                          <div className="flex flex-col gap-1.5">
                            <Label>{"Colors"}</Label>
                            <ColorChips colors={colors} />
                          </div>
                        )}

                        {!!sighting.features && (
                          <Detail label={"Features"}>
                            <p className="text-sm text-neutral-900">
                              {sighting.features}
                            </p>
                          </Detail>
                        )}
                        {!!sighting.note && (
                          <Detail label={"Notes"}>
                            <p className="text-sm text-neutral-900">
                              {sighting.note}
                            </p>
                          </Detail>
                        )}
                      </div>

                      {/* Footer: reporter contact + Google Maps link */}
                      <div className="flex flex-col items-start gap-2 border-t border-neutral-200 pt-3">
                        <Button
                          variant="tonal"
                          icon={<MapPin className="h-4 w-4" />}
                          disabled={!hasMapLocation}
                          onClick={() =>
                            window.open(
                              getLastSeenLocationURLMap(
                                sighting.lastSeenLocation,
                                sighting.lastSeenLat,
                                sighting.lastSeenLong,
                              ),
                              "_blank",
                              "noopener,noreferrer",
                            )
                          }
                        >
                          {"Open in Google Maps"}
                        </Button>

                        {isOwner && reporterPhone && (
                          <div className="flex flex-wrap items-center gap-x-1">
                            <span className="text-sm font-medium text-neutral-900">
                              {"Reported By"} {sighting.reporterName}
                            </span>
                            <Button
                              icon={<Phone className="h-4 w-4" />}
                              onClick={() => handleCall(reporterPhone)}
                            >
                              {"Call"}
                            </Button>
                            <Button
                              icon={<MessageSquare className="h-4 w-4" />}
                              onClick={() => handleText(reporterPhone)}
                            >
                              {"Text"}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
