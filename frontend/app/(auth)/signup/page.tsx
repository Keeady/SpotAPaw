import SubHeader from "@/app/components/subheader";
import SignUpForm from "./signup";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between border-t-[3px] border-[#7a2a16] bg-white pb-8 font-sans text-neutral-900">
      <SubHeader
        title="Welcome!"
        subtitle="Join a community of pets and pet lovers"
      />
      <section className="flex flex-1 flex-col items-center justify-center gap-6">
       <div className="mx-auto w-full max-w-md px-4 py-10">
               <SignUpForm />
             </div>
      </section>
    </main>
  );
}
