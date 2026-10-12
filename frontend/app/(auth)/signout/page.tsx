import Link from "next/link";
import Image from "next/image";
import { LogIn, UserRoundPlus } from "lucide-react";
import SubHeader from "@/app/components/subheader";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between border-t-[3px] border-[#7a2a16] bg-white px-6 pb-8 font-sans text-neutral-900">
      <SubHeader
          title="Welcome!"
          subtitle="Join a community of pets and pet lovers"
        />
      <section className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
        <p className="text-lg font-medium">
          A community helping lost pets find their way home.
        </p>
      </section>
    </main>
  );
}
