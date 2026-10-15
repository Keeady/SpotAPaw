import Link from "next/link";
import Image from "next/image";
import { LogIn, UserRoundPlus } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between border-t-[3px] border-[#7a2a16] bg-white px-6 pb-8 font-sans text-neutral-900">
      <section className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
        <div
          className="flex h-36 w-[min(750px,80vw)] items-center justify-center text-3xl font-bold text-neutral-500"
          aria-label="SpotAPaw logo"
        >
          <Image
            src={"/images/spotapaw-text-logo-large-v2.png"}
            alt=""
            width={750}
            height={250}
            loading="lazy"
          />
        </div>

        <p className="text-lg font-medium">
          A community helping lost pets find their way home.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="https://play.google.com/store/apps/details?id=com.bcamaria.SpotAPaw"
            className="inline-flex h-[42px] w-[140px] items-center justify-center rounded-lg border border-neutral-400 bg-black text-sm text-white"
            aria-label="Get it on Google Play"
          >
            <Image
              src={"/images/google-play-badge.png"}
              style={{
                width: 135,
                height: 40,
              }}
              alt=""
              width={135}
              height={40}
              loading="lazy"
            />
          </a>
          <a
            href="https://apps.apple.com/us/app/spotapaw/id6757455715"
            className="inline-flex h-[42px] w-[140px] items-center justify-center rounded-lg border border-neutral-400 bg-black text-sm text-white"
            aria-label="Download on the App Store"
          >
            <Image
              src={"/images/app-store-badge.svg"}
              style={{ width: 135, height: 40 }}
              width={135}
              height={40}
              alt=""
              loading="lazy"
            />
          </a>
        </div>
      </section>

      <section className="flex w-full max-w-md flex-col gap-3.5">
        <Link
          href="/signin"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#65539e] py-4 text-base font-semibold text-white transition-colors hover:bg-[#54438a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#65539e]"
        >
          <LogIn />
          Sign In
        </Link>
        <Link
          href="/signup"
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#65539e] bg-white py-3.5 text-base font-semibold text-[#65539e] transition-colors hover:bg-[#65539e]/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#65539e]"
        >
          <UserRoundPlus />
          Create an Account
        </Link>
        <Link
          href="/aggregated-sightings"
          className="mx-auto py-2 text-base font-medium text-[#65539e] underline-offset-4 hover:underline focus-visible:underline"
        >
          Continue as Guest
        </Link>

        <p className="mt-4 text-center text-sm">
          {" "}
          By using <Link href="/about">SpotAPaw,</Link> you agree to our{" "}
          <Link href="/privacy">Privacy Policy</Link> and{" "}
          <Link href="/terms">Terms of Service</Link>
        </p>
      </section>
    </main>
  );
}
