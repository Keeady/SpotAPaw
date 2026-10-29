import { ImageOff } from "lucide-react";
import { Pet } from "../../../lib/pets/pet";

type ShortProfileProp = {
  pet: Pet;
};

export default function RenderShortProfile({ pet }: ShortProfileProp) {
  const hasPhoto = !!pet.photos && pet.photos.length > 0;

  return (
    <div className="mx-auto my-2.5 w-full max-w-[900px]">
      <article className="rounded-2xl border border-neutral-300 bg-white text-neutral-900 transition-shadow hover:shadow-md">
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:gap-6 sm:p-5">
          {/* Photo (top on phones, left on tablets/desktop) */}
          <div className="w-full shrink-0 self-start overflow-hidden rounded-xl sm:w-60">
            {hasPhoto ? (
              // Plain <img> so no next.config image domains are required;
              // swap for next/image if you've configured remotePatterns.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={pet.photos![0]}
                alt={pet.name ? `Photo of ${pet.name}` : "Pet photo"}
                className="aspect-[3/2] w-full object-contain"
                data-testid="pet-photos"
              />
            ) : (
              <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-1 bg-neutral-200 text-neutral-600">
                <ImageOff className="size-11 sm:size-14" />
                <span className="text-xs">No photo</span>
              </div>
            )}
          </div>

          {/* Details (centered, right on tablets/desktop, below on phones) */}
          <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-2 text-center">
            <h2 className="line-clamp-2 min-w-0 text-[22px] font-bold leading-tight">
              {pet.name}
            </h2>
            {!!pet.breed && <p className="text-sm">{pet.breed}</p>}
            {pet.age ? (
              <p className="text-sm">
                {pet.age} {Number(pet.age) === 1 ? "year" : "years"} old
              </p>
            ) : null}
          </div>
        </div>
      </article>
    </div>
  );
}
