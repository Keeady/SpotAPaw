"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Download,
  ExternalLink,
  FileImage,
  Loader2,
  Pencil,
  Phone,
  X,
} from "lucide-react";
import { getPosterById } from "@/lib/posters/get-poster-by-id";
import { Poster, PosterEditableFields } from "@/lib/posters/poster";
import { PosterChanges, updatePoster } from "@/lib/posters/update-poster";

type EditGroup = "description" | "cta" | "contact";

const GROUP_FIELDS: Record<EditGroup, (keyof PosterEditableFields)[]> = {
  description: ["description"],
  cta: ["cta"],
  contact: ["contactName", "contactPhone"],
};

const inputClasses =
  "w-full rounded-lg border border-emerald-700 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 disabled:opacity-50";

// Reusable UI components
function PosterField({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div className="min-w-0 rounded-lg bg-slate-100 p-3">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-semibold text-slate-800">
        {value || "—"}
      </p>
    </div>
  );
}

function EditButton({
  onClick,
  label,
  light = false,
}: {
  onClick: () => void;
  label: string;
  light?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`inline-flex shrink-0 items-center justify-center rounded-lg p-2 transition hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 ${
        light
          ? "text-amber-800 hover:bg-amber-200"
          : "text-emerald-700 hover:bg-emerald-50"
      }`}
    >
      <Pencil className="h-4 w-4" />
    </button>
  );
}

function EditControls({
  saving,
  error,
  onSave,
  onCancel,
}: {
  saving: boolean;
  error: string | null;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="mt-3 space-y-2">
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="flex flex-wrap justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
        >
          <X className="h-4 w-4" />
          Cancel
        </button>

        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#0F6E56] px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-800 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}

function PosterAction({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: typeof Download;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0F6E56] px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
    >
      <Icon className="h-4 w-4" />
      {label}
    </a>
  );
}

// Main page
export default function PosterClient() {
  const searchParams = useSearchParams();

  const posterId = searchParams.get("posterId");
  const sightingId = searchParams.get("sightingId");

  const [poster, setPoster] = useState<Poster | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [editing, setEditing] = useState<EditGroup | null>(null);
  const [draft, setDraft] = useState<PosterChanges>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const fetchPoster = useCallback(
    async (signal?: AbortSignal) => {
      if (!posterId && !sightingId) {
        setPoster(null);
        setLoadError("No poster specified.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setLoadError(null);

      try {
        const result = await getPosterById(posterId, sightingId);

        if (result.error) {
          setLoadError("Failed to load poster");
          return;
        }

        if (result.data) {
          setPoster(result.data);
        }
      } catch (error) {
        if (signal?.aborted) return;

        setLoadError(
          error instanceof Error ? error.message : "Unable to load poster.",
        );
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [posterId, sightingId],
  );

  useEffect(() => {
    const controller = new AbortController();

    setPoster(null);
    setEditing(null);
    setDraft({});
    setSaveError(null);

    void fetchPoster(controller.signal);

    return () => controller.abort();
  }, [fetchPoster]);

  const startEdit = (group: EditGroup) => {
    if (!poster || saving || editing) return;

    const next: PosterChanges = {};

    for (const key of GROUP_FIELDS[group]) {
      next[key] = poster[key] ?? "";
    }

    setDraft(next);
    setEditing(group);
    setSaveError(null);
  };

  const cancelEdit = () => {
    if (saving) return;

    setEditing(null);
    setDraft({});
    setSaveError(null);
  };

  const setDraftField = (key: keyof PosterEditableFields, value: string) => {
    setDraft((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const commitEdit = async () => {
    if (!poster || !editing || saving) return;

    const changes: PosterChanges = {};

    for (const key of GROUP_FIELDS[editing]) {
      const before = (poster[key] ?? "").trim();
      const after = (draft[key] ?? "").trim();

      if (before !== after) {
        changes[key] = after;
      }
    }

    if (Object.keys(changes).length === 0) {
      cancelEdit();
      return;
    }

    setSaving(true);
    setSaveError(null);

    try {
      await updatePoster(poster.id, changes);

      // Immediately reflect the saved values in the UI.
      setPoster((previous) =>
        previous ? { ...previous, ...changes } : previous,
      );

      setEditing(null);
      setDraft({});
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Couldn't save changes.",
      );
    } finally {
      setSaving(false);
    }
  };

  const controls = (
    <EditControls
      saving={saving}
      error={saveError}
      onSave={commitEdit}
      onCancel={cancelEdit}
    />
  );

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50">
        <Loader2 className="h-9 w-9 animate-spin text-emerald-700" />
        <p className="text-sm text-slate-500">Loading poster...</p>
      </div>
    );
  }

  if (loadError || !poster) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Poster unavailable
          </h2>
          <p role="alert" className="mt-2 text-sm text-slate-500">
            {loadError || "No poster found."}
          </p>
          <button
            onClick={() => void fetchPoster()}
            className="mt-5 rounded-lg bg-[#0F6E56] px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-800"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-2xl">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Pet Sighting Poster
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            View your generated poster and customize its description, call to
            action, and contact information.
          </p>
        </div>

        {/* Poster card */}
        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/50">
          {/* Green header */}
          <header className="bg-[#0F6E56] px-5 py-6 text-center text-white">
            <h2 className="break-words text-3xl font-extrabold uppercase tracking-wide sm:text-4xl">
              {poster.headline}
            </h2>

            {poster.subheadline && (
              <p className="mt-2 text-sm leading-relaxed text-emerald-50 sm:text-base">
                {poster.subheadline}
              </p>
            )}
          </header>

          {/* Pet image */}
          {poster.photoUrl && (
            <div className="flex aspect-[3/2] items-center justify-center bg-slate-100">
              {/* Remote image URL provided by the backend */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={poster.photoUrl}
                alt={poster.name || "Pet photo"}
                className="h-full w-full object-contain"
              />
            </div>
          )}

          {/* Pet name and description */}
          <div className="space-y-4 px-5 py-6 sm:px-8">
            <h3 className="break-words text-center text-3xl font-bold text-slate-900">
              {poster.name}
            </h3>

            {editing === "description" ? (
              <div>
                <label
                  htmlFor="poster-description"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Description
                </label>
                <textarea
                  id="poster-description"
                  value={draft.description ?? ""}
                  onChange={(e) => setDraftField("description", e.target.value)}
                  placeholder="Add a description"
                  rows={5}
                  autoFocus
                  disabled={saving}
                  className={`${inputClasses} min-h-28 resize-y`}
                />
                {controls}
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <p
                  className={`min-w-0 flex-1 whitespace-pre-wrap break-words text-sm leading-6 ${
                    poster.description
                      ? "text-slate-600"
                      : "italic text-slate-400"
                  }`}
                >
                  {poster.description || "Add a description"}
                </p>

                <EditButton
                  label="Edit description"
                  onClick={() => startEdit("description")}
                />
              </div>
            )}
          </div>

          {/* Sighting fields */}
          <div className="grid grid-cols-1 gap-3 px-5 pb-6 sm:grid-cols-2 sm:px-8">
            <PosterField label="Breed" value={poster.breed} />
            <PosterField label="Colors" value={poster.colors} />
            <PosterField
              label="Last seen location"
              value={poster.lastSeenLocation}
            />
            <PosterField label="Last seen date" value={poster.lastSeenTime} />
          </div>

          {/* Call to action */}
          <div className="mx-5 mb-6 rounded-xl border border-amber-300 bg-[#FAEEDA] p-4 sm:mx-8">
            {editing === "cta" ? (
              <div>
                <label
                  htmlFor="poster-cta"
                  className="mb-2 block text-sm font-semibold text-amber-900"
                >
                  Call to action
                </label>
                <textarea
                  id="poster-cta"
                  value={draft.cta ?? ""}
                  onChange={(e) => setDraftField("cta", e.target.value)}
                  placeholder="Add a call to action"
                  rows={3}
                  autoFocus
                  disabled={saving}
                  className={`${inputClasses} border-amber-400 text-amber-900 focus:border-amber-500 focus:ring-amber-100`}
                />
                {controls}
              </div>
            ) : (
              <div className="flex items-start justify-center gap-2">
                <p
                  className={`min-w-0 flex-1 whitespace-pre-wrap break-words text-center text-base font-bold leading-6 ${
                    poster.cta ? "text-[#854F0B]" : "italic text-amber-700/60"
                  }`}
                >
                  {poster.cta || "Add a call to action"}
                </p>

                <EditButton
                  label="Edit call to action"
                  light
                  onClick={() => startEdit("cta")}
                />
              </div>
            )}
          </div>

          {/* Contact */}
          <div className="border-t border-slate-100 px-5 py-5 sm:px-8">
            {editing === "contact" ? (
              <div className="space-y-3">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Contact name
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    value={draft.contactName ?? ""}
                    onChange={(e) =>
                      setDraftField("contactName", e.target.value)
                    }
                    placeholder="Contact name"
                    autoFocus
                    disabled={saving}
                    className={inputClasses}
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-phone"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Phone number
                  </label>
                  <input
                    id="contact-phone"
                    type="tel"
                    value={draft.contactPhone ?? ""}
                    onChange={(e) =>
                      setDraftField("contactPhone", e.target.value)
                    }
                    placeholder="Phone number"
                    disabled={saving}
                    className={inputClasses}
                  />
                </div>

                {controls}
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3">
                <div className="min-w-0 space-y-1 text-center">
                  {poster.contactName && (
                    <p className="break-words text-sm font-semibold text-slate-700">
                      {poster.contactName}
                    </p>
                  )}

                  {poster.contactPhone && (
                    <p className="flex items-center justify-center gap-1.5 text-sm text-slate-600">
                      <Phone className="h-4 w-4 shrink-0" />
                      <span className="break-all">{poster.contactPhone}</span>
                    </p>
                  )}

                  {!poster.contactName && !poster.contactPhone && (
                    <p className="text-sm italic text-slate-400">
                      Add contact information
                    </p>
                  )}
                </div>

                <EditButton
                  label="Edit contact information"
                  onClick={() => startEdit("contact")}
                />
              </div>
            )}
          </div>
        </article>

        {/* Poster exports */}
        {poster.pdfUrl ||
          (poster.pngUrl && (
            <section className="mt-6">
              <h3 className="mb-3 text-sm font-semibold text-slate-800">
                Share or download
              </h3>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {poster.pdfUrl && (
                  <PosterAction
                    href={poster.pdfUrl}
                    label="Download PDF"
                    icon={Download}
                  />
                )}

                {poster.pngUrl && (
                  <PosterAction
                    href={poster.pngUrl}
                    label="Download PNG"
                    icon={FileImage}
                  />
                )}
              </div>
            </section>
          ))}

        <p className="mt-5 text-center text-xs text-slate-400">
          Powered by SpotAPaw · Helping pets find their way home.
        </p>
      </div>
    </main>
  );
}
