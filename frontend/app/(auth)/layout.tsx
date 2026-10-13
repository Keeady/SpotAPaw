import type { Metadata } from "next";
import "../globals.css";
import Header from "../components/header";

export const metadata: Metadata = {
  title: "SpotAPaw - Lost Pet Finder",
  description: "AI-powered app",
};

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Header showMenu={false} />
      <div className="pt-16">{children}</div>
    </>
  );
}
