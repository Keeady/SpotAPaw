"use client";

import React from "react";
import {
  AlertCircle,
  CheckCircle2,
  Check,
  CircleHelp,
  ImageOff,
  MapPinned,
  Mars,
  PawPrint,
  Pencil,
  ShieldCheck,
  Trash2,
  TriangleAlert,
  Venus,
  type LucideIcon,
} from "lucide-react";
import PhotoGallery from "../photo-gallery";

export type PetProfile = {
  id: string;
  name: string;
  breed?: string;
  gender?: string;
  age?: number;
  colors?: string | string[];
  photo?: string;
  status?: "lost" | "found" | "safe";
  features?: string;
  species?: string;
  note?: string;
  photos?: string[];
};

type PetProfileCardProps = {
  petProfile: PetProfile;
  onDeletePet: () => void;
  onEditPet: () => void;
  onPetLost: () => void;
  onPetFound: () => void;
  viewPetSightings: () => void;
};

const STATUS_STYLES: Record<
  "lost" | "found" | "safe",
  { className: string; Icon: LucideIcon }
> = {
  lost: {
    className: "bg-red-50 text-red-800",
    Icon: AlertCircle,
  },
  found: {
    className: "bg-orange-50 text-orange-800",
    Icon: CheckCircle2,
  },
  safe: {
    className: "bg-green-50 text-green-800",
    Icon: ShieldCheck,
  },
};
const STATUS_DEFAULT = {
  className: "bg-slate-100 text-slate-700",
  Icon: PawPrint,
};

// colors may be a comma-separated string or an array
function toColorList(colors: unknown): string[] {
  if (!colors) return [];
  if (Array.isArray(colors)) return colors.map(String).filter(Boolean);
  return String(colors)
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
}

function genderIcon(gender?: string): LucideIcon {
  if (gender === "Male") return Mars;
  if (gender === "Female") return Venus;
  return CircleHelp;
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="block text-xs font-medium uppercase tracking-wide text-neutral-500">
      {children}
    </span>
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
    <div className="w-1/2 pr-2 sm:w-1/4">
      <Label>{label}</Label>
      <div className="mt-0.5 flex items-center gap-1 text-sm">{children}</div>
    </div>
  );
}

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600";
const buttonPrimary = `${buttonBase} bg-[#6750A4] text-white hover:bg-[#5a4590]`;
const buttonOutlined = `${buttonBase} border border-neutral-300 text-[#6750A4] hover:bg-violet-50`;
const buttonDanger = `${buttonBase} text-red-700 hover:bg-red-50`;

export default function PetProfileCard({
  petProfile,
  onEditPet,
  onPetFound,
  onPetLost,
  onDeletePet,
  viewPetSightings,
}: PetProfileCardProps) {
  const {
    name,
    breed,
    gender,
    age,
    colors,
    status,
    features,
    species,
    note,
    photos,
  } = petProfile;

  const statusStyle = status ? STATUS_STYLES[status] : STATUS_DEFAULT;
  const StatusIcon = statusStyle.Icon;
  const GenderIcon = genderIcon(gender);
  const colorList = toColorList(colors);
  const hasPhotos = !!photos && photos.length > 0;

  return (
    <div className="p-4 pb-8">
      <article className="mx-auto w-full max-w-[900px] rounded-2xl border border-neutral-300 bg-white text-neutral-900">
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:gap-6 sm:p-5">
          {/* Photos (top on phones, left on tablets/desktop) */}
          <div className="w-full shrink-0 self-start overflow-hidden rounded-xl sm:w-60">
            {hasPhotos ? (
              <PhotoGallery photos={photos!} alt="" />
            ) : (
              <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-1 bg-neutral-200 text-neutral-600">
                <ImageOff className="size-11 sm:size-14" />
                <span className="text-xs">No photo</span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex min-w-0 flex-1 flex-col gap-3.5">
            {/* Title row: name + status chip */}
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="line-clamp-2 min-w-0 text-[22px] font-bold leading-tight">
                {name || "Unknown"}
              </h2>
              {!!status && (
                <span
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-[13px] font-bold ${statusStyle.className}`}
                >
                  <StatusIcon className="size-4" />
                  {capitalize(status)}
                </span>
              )}
            </div>

            {/* Breed / species / gender / age */}
            <div className="flex flex-wrap gap-y-3">
              {!!breed && (
                <Detail label="Breed">
                  <span>{breed}</span>
                </Detail>
              )}
              {!!species && (
                <Detail label="Species">
                  <span>{capitalize(species)}</span>
                </Detail>
              )}
              {!!gender && (
                <Detail label="Gender">
                  <GenderIcon className="size-4" />
                  <span>{gender}</span>
                </Detail>
              )}
              {age !== undefined && (
                <Detail label="Age">
                  <span>
                    {age} {age === 1 ? "year" : "years"}
                  </span>
                </Detail>
              )}
            </div>

            {/* Colors */}
            {colorList.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <Label>Colors</Label>
                <div className="flex flex-wrap gap-2">
                  {colorList.map((c) => (
                    <span
                      key={c}
                      className="rounded-lg border border-neutral-300 px-3 py-1 text-[13px]"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Features */}
            {!!features && (
              <div className="flex flex-col gap-1.5">
                <Label>Features</Label>
                <p className="text-sm">{features}</p>
              </div>
            )}

            {/* Notes */}
            {!!note && (
              <div className="flex flex-col gap-1.5">
                <Label>Notes</Label>
                <p className="text-sm">{note}</p>
              </div>
            )}
          </div>
        </div>

        {/* CTA row */}
        <div className="flex flex-col items-stretch gap-2 border-t border-neutral-200 p-4 sm:flex-row sm:flex-wrap sm:items-center sm:px-5">
          {/* Primary action depends on status */}
          {status === "lost" && (
            <button
              type="button"
              className={buttonPrimary}
              onClick={onPetFound}
            >
              <Check className="size-4" />
              Report Pet Found
            </button>
          )}
          {status === "safe" && (
            <button type="button" className={buttonPrimary} onClick={onPetLost}>
              <TriangleAlert className="size-4" />
              Report Lost Pet
            </button>
          )}

          {/* Secondary actions */}
          {status === "lost" && (
            <button
              type="button"
              className={buttonOutlined}
              onClick={viewPetSightings}
            >
              <MapPinned className="size-4" />
              View Pet Sightings
            </button>
          )}
          <button type="button" className={buttonOutlined} onClick={onEditPet}>
            <Pencil className="size-4" />
            Edit
          </button>

          {/* Destructive action */}
          <button type="button" className={buttonDanger} onClick={onDeletePet}>
            <Trash2 className="size-4" />
            Delete
          </button>
        </div>
      </article>
    </div>
  );
}
