"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogIn, LogOut, Menu, X } from "lucide-react";
import Image from "next/image";
import { AuthHandler } from "@/lib/auth/auth";

type HeaderProps = {
  isAuthenticated?: boolean;
  showMenu: boolean;
};

const NAV_LINKS = [
  { href: "/aggregated-sightings", label: "Nearby Sightings", authOnly: false },
  { href: "/pets", label: "My Pets", authOnly: false },
  { href: "/profile", label: "My Profile", authOnly: false },
  { href: "/my-sightings", label: "My Sightings", authOnly: false },
  { href: "/settings", label: "My Settings", authOnly: false },
];

export default function Header({
  isAuthenticated = false,
  showMenu,
}: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const onLogout = useCallback(async () => {
    const authHandler = new AuthHandler();
    await authHandler.signOut().catch((error) => {
      console.log(`Sign out failed: ${error}`);
    });

    router.replace("/");
  }, []);
  // Close the mobile menu on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close the mobile menu on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const links = NAV_LINKS.filter((l) => !l.authOnly || isAuthenticated);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const linkClasses = (active: boolean, mobile = false) =>
    [
      "relative rounded-lg px-3 py-2 text-sm font-medium transition-colors",
      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#65539e]",
      mobile ? "block w-full py-3 text-base" : "",
      active
        ? "font-semibold text-[#65539e]"
        : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900",
      // Underline indicator on desktop for the active tab
      active && !mobile
        ? "after:absolute after:inset-x-3 after:-bottom-[13px] after:h-[3px] after:rounded-full after:bg-[#65539e]"
        : "",
    ].join(" ");

  const authButton = (mobile = false) =>
    isAuthenticated ? (
      <button
        type="button"
        onClick={onLogout}
        className={`flex items-center justify-center gap-2 rounded-xl px-4 py-1.5 text-sm font-semibold text-[#65539e] transition-colors hover:bg-[#65539e]/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#65539e] ${
          mobile ? "w-full py-3 text-base" : ""
        }`}
      >
        <LogOut />
        Log Out
      </button>
    ) : (
      <Link
        href="/signin"
        className={`flex items-center justify-center gap-2 rounded-xl bg-[#65539e] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#54438a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#65539e] ${
          mobile ? "w-full py-3 text-base" : ""
        }`}
      >
        <LogIn />
        Sign In
      </Link>
    );

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-neutral-200 bg-white/95 font-sans backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          aria-label="SpotAPaw home"
          className="flex h-10 w-32 items-center justify-center rounded-md text-sm font-bold text-neutral-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#65539e]"
        >
          <Image
            src={"/images/spotapaw-text-logo-v2.png"}
            alt=""
            width={150}
            height={50}
            loading="lazy"
          />
        </Link>

        {/* Latge screens nav */}
        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {showMenu &&
            links.map((l) => {
              const active = isActive(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={linkClasses(active)}
                >
                  {l.label}
                </Link>
              );
            })}
          <div className="ml-3">{authButton()}</div>
        </nav>

        {/* Small screen menu toggle */}
        <button
          type="button"
          className="rounded-lg p-2 text-neutral-700 hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#65539e] lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {/* Small screen menu */}
      {open && (
        <nav
          id="mobile-menu"
          aria-label="Mobile"
          className="border-t border-neutral-200 bg-white px-4 pb-5 pt-3 shadow-lg lg:hidden"
        >
          <ul className="flex flex-col gap-1">
            {showMenu &&
              links.map((l) => {
                const active = isActive(l.href);
                return (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      aria-current={active ? "page" : undefined}
                      className={linkClasses(active, true)}
                    >
                      {l.label}
                    </Link>
                  </li>
                );
              })}
          </ul>
          <div className="mt-4">{authButton(true)}</div>
        </nav>
      )}
    </header>
  );
}
