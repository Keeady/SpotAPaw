import type { Metadata } from "next";
import "../globals.css";
import Header from "../components/header";
import AuthHeader from "@/lib/auth-header";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "SpotAPaw - Lost Pet Finder",
  description: "AI-powered app",
};

export default async function MainLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Suspense fallback={<div className="fixed inset-x-0 top-0 h-16 border-b bg-white" />}>
        <AuthHeader>
          {({ isAuthenticated }: { isAuthenticated: boolean }) => (
            <Header showMenu={true} isAuthenticated={isAuthenticated} />
          )}
        </AuthHeader>
      </Suspense>
      <div className="pt-16">{children}</div>
    </>
  );
}
