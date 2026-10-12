import SubHeader from "@/app/components/subheader";
import SignInForm from "./signin";

export default function Home() {

  return (
    <main className="flex min-h-screen flex-col items-center justify-between border-t-[3px] border-[#7a2a16] bg-white pb-8 font-sans text-neutral-900">
      <SubHeader
        title="Welcome Back!"
        subtitle="Help find and protect our furry friends"
      />
      <section className="flex flex-1 flex-col items-center justify-center gap-6">
        <div className="mx-auto w-full max-w-md px-4 py-10">
          <SignInForm />
        </div>
      </section>
    </main>
  );
}
