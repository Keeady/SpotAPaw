import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import Header from "../components/header";
import { createClient } from "@/lib/auth/supabase/server";

export const metadata: Metadata = {
  title: "SpotAPaw - Lost Pet Finder",
  description: "AI-powered app",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const isAuthenticated = !!user && !user.is_anonymous;
  return (
    <>
      <Header showMenu={true} isAuthenticated={isAuthenticated} />
      <div className="pt-16">
        
        {children}
      </div>
      {/*<ChatWidget url={apiHost} />
        <Footer />*/}
    </>
  );
}
