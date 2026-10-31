"use client";

import { Mail, Pencil, Phone, User } from "lucide-react";
import {
  AsYouType,
  getCountries,
  getCountryCallingCode,
  isValidPhoneNumber,
  type CountryCode,
} from "libphonenumber-js";
import { useEffect, useId, useMemo, useState, type ReactNode } from "react";
import isEmail from "validator/es/lib/isEmail";
import { Profile } from "@/lib/profile/profile";

type OwnerProfileProps = {
  profile: Profile;
  onSave: (profile: Profile) => Promise<void> | void;
};

function flagEmoji(code: string) {
  return code
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
}

function useCountryOptions() {
  return useMemo(() => {
    const names = new Intl.DisplayNames(["en"], { type: "region" });
    return getCountries()
      .map((code) => ({
        code,
        label: `${flagEmoji(code)} ${names.of(code) ?? code} (+${getCountryCallingCode(code)})`,
        name: names.of(code) ?? code,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);
}

const inputBase =
  "w-full rounded-2xl border bg-white py-3 pl-10 pr-3 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-[#6750A4] focus:ring-1 focus:ring-[#6750A4] disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-500";

function Field({
  label,
  icon,
  error,
  children,
  htmlFor,
}: {
  label: string;
  icon: ReactNode;
  error?: string;
  children: ReactNode;
  htmlFor: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={htmlFor} className="text-xs font-medium text-neutral-600">
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
          {icon}
        </span>
        {children}
      </div>
      {error ? (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export default function UserProfileRenderer({
  profile,
  onSave,
}: OwnerProfileProps) {
  const uid = useId();
  const countries = useCountryOptions();

  const [form, setForm] = useState<Profile>(profile);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [honeypot, setHoneypot] = useState("");

  // Keep the form in sync when a new profile arrives and we're not mid-edit.
  useEffect(() => {
    if (!isEditing) setForm(profile);
  }, [profile, isEditing]);

  // Debounced email validation.
  useEffect(() => {
    const timer = setTimeout(() => {
      setEmailError(form.email ? !isEmail(form.email) : false);
    }, 500);
    return () => clearTimeout(timer);
  }, [form.email]);

  const phoneValid =
    form.phone && form.phone.trim() !== "" && isValidPhoneNumber(form.phone || "", form.countryCode as CountryCode || "");
  const showPhoneError = phoneTouched && !phoneValid;

  const dirty =
    form.firstname !== profile.firstname ||
    form.lastname !== profile.lastname ||
    form.email !== profile.email ||
    form.phone !== profile.phone ||
    form.countryCode !== profile.countryCode;

  const canSubmit = dirty && !saving && !emailError && phoneValid;

  const update = <K extends keyof Profile>(key: K, value: Profile[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handlePhoneChange = (raw: string) => {
    // Only re-format while typing forward so backspacing through
    // punctuation doesn't get undone by the formatter.
    let length = 0
    if (form.phone) {
       length = form.phone.length
    }

    const next =
      raw.length > length
        ? new AsYouType(form.countryCode as CountryCode).input(raw)
        : raw;
    update("phone", next);
  };

  const handleCancel = () => {
    setForm(profile);
    setPhoneTouched(false);
    setEmailError(false);
    setSaveError("");
    setIsEditing(false);
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (honeypot.trim()) return; // bot trap

    setPhoneTouched(true);
    if (!phoneValid) return;
    if (form.email &&!isEmail(form.email)) {
      setEmailError(true);
      return;
    }

    setSaving(true);
    setSaveError("");
    try {
      await onSave(form);
      setIsEditing(false);
      setPhoneTouched(false);
    } catch {
      setSaveError("Error saving owner profile.");
    } finally {
      setSaving(false);
    }
  };

  const fullName = `${form.firstname ?? ""} ${form.lastname ?? ""}`.trim();

  return (
    <div className="flex w-full grow flex-col bg-white px-3">
      <div className="mx-auto flex w-full max-w-[900px] flex-col py-4">
        {/* Header */}
        <div className="flex flex-col items-center py-2">
          <div className="flex size-28 items-center justify-center rounded-full bg-[#EADDFF] text-[#6750A4]">
            <User className="size-14" aria-hidden />
          </div>
          <h1 className="mt-3 text-2xl font-semibold text-neutral-900">
            {fullName}
          </h1>
          <p className="mt-1 text-sm text-neutral-600">{form.email ?? ""}</p>
        </div>

        {/* Section header */}
        <div className="mt-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-neutral-900">
            My Contact Information
          </h2>
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              aria-label="Edit contact information"
              className="rounded-full p-2 text-[#6750A4] transition-colors hover:bg-[#F3EDF7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6750A4]"
            >
              <Pencil className="size-5" />
            </button>
          ) : null}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="mt-3 flex flex-col gap-4">
          <Field
            label="First Name"
            htmlFor={`${uid}-first`}
            icon={<User className="size-4" />}
          >
            <input
              id={`${uid}-first`}
              type="text"
              value={form.firstname || ""}
              onChange={(e) => update("firstname", e.target.value)}
              placeholder="First Name"
              autoComplete="given-name"
              disabled={!isEditing}
              className={`${inputBase} border-neutral-300`}
            />
          </Field>

          <Field
            label="Last Name"
            htmlFor={`${uid}-last`}
            icon={<User className="size-4" />}
          >
            <input
              id={`${uid}-last`}
              type="text"
              value={form.lastname || ""}
              onChange={(e) => update("lastname", e.target.value)}
              placeholder="Last Name"
              autoComplete="family-name"
              disabled={!isEditing}
              className={`${inputBase} border-neutral-300`}
            />
          </Field>

          <Field
            label="Email"
            htmlFor={`${uid}-email`}
            icon={<Mail className="size-4" />}
            error={emailError ? "Invalid email address." : undefined}
          >
            <input
              id={`${uid}-email`}
              type="email"
              inputMode="email"
              value={form.email || ""}
              onChange={(e) => update("email", e.target.value)}
              placeholder="youremail@email.com"
              autoComplete="email"
              autoCapitalize="none"
              aria-invalid={emailError}
              disabled={!isEditing}
              className={`${inputBase} ${
                emailError
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-neutral-300"
              }`}
            />
          </Field>

          {/* Phone: country selector + number */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor={`${uid}-phone`}
              className="text-xs font-medium text-neutral-600"
            >
              Phone
            </label>
            <div className="flex gap-3">
              <select
                aria-label="Country"
                value={form.countryCode || ""}
                onChange={(e) => {
                  const countryCode = e.target.value as CountryCode;
                  setForm((prev) => ({
                    ...prev,
                    countryCode,
                    phone: prev.phone
                      ? new AsYouType(countryCode).input(prev.phone.replace(/[^\d+]/g, ""))
                      : prev.phone,
                  }));
                }}
                disabled={!isEditing}
                className="w-40 shrink-0 truncate rounded-2xl border border-neutral-300 bg-white px-3 py-3 text-sm text-neutral-900 outline-none transition-colors focus:border-[#6750A4] focus:ring-1 focus:ring-[#6750A4] disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-500"
              >
                <option value="">Select country</option>
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>

              <div className="relative flex-1">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
                  <Phone className="size-4" />
                </span>
                <input
                  id={`${uid}-phone`}
                  type="tel"
                  inputMode="tel"
                  value={form.phone || ""}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  onBlur={() => setPhoneTouched(true)}
                  placeholder="Phone number"
                  autoComplete="tel-national"
                  aria-invalid={showPhoneError}
                  disabled={!isEditing}
                  className={`${inputBase} ${
                    showPhoneError
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "border-neutral-300"
                  }`}
                />
              </div>
            </div>
            {showPhoneError ? (
              <p role="alert" className="text-xs text-red-600">
                Invalid phone number.
              </p>
            ) : null}
          </div>

          <input
            type="text"
            name="extra_info"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            className="absolute -left-[9999px] size-0 opacity-0"
          />

          {saveError ? (
            <p role="alert" className="text-sm text-red-600">
              {saveError}
            </p>
          ) : null}

          {isEditing && (
            <div className="flex gap-3 pb-2">
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="inline-flex flex-1 items-center justify-center rounded-full border border-neutral-300 bg-white px-5 py-2.5 text-sm font-medium text-[#6750A4] transition-colors hover:bg-[#F3EDF7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6750A4] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!canSubmit}
                className="inline-flex flex-1 items-center justify-center rounded-full bg-[#6750A4] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#5a4590] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6750A4] disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-500"
              >
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
