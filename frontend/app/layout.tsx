import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SpotAPaw - Lost Pet Finder",
  description: "AI-powered app",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <title>SpotAPaw - Lost Pet Finder</title>
        <meta
          name="description"
          content="SpotAPaw is a community-powered app that uses AI to automatically generate detailed pet descriptions from photos, so you can post a detailed lost or found pet report quickly."
        />
        <meta
          name="keywords"
          content="lost pets, found pets, pet sightings, AI pet descriptions, community pet app, pet recovery, pet profiles, real-time pet alerts"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />

        <meta name="apple-itunes-app" content="app-id=6757455715" />
        <meta name="google-play-app" content="app-id=com.bcamaria.SpotAPaw" />
        <meta name="author" content="Camaria Bevavy" />

        <meta name="og:title" content="SpotAPaw - Lost Pet Finder" />
        <meta
          name="og:description"
          content="SpotAPaw is a community-powered app that uses AI to automatically generate detailed pet descriptions from photos, so you can post a detailed lost or found pet report quickly."
        />
        <meta name="og:image" content="https://spotapaw.com/default-og.png" />
        <meta name="og:url" content="https://spotapaw.com" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:image"
          content="https://spotapaw.com/default-og.png"
        />
        <meta name="twitter:title" content="SpotAPaw - Lost Pet Finder" />
        <meta
          name="twitter:description"
          content="SpotAPaw is a community-powered app that uses AI to automatically generate detailed pet descriptions from photos, so you can post a detailed lost or found pet report quickly."
        />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        {/*<ChatWidget url={apiHost} />
        <Footer />*/}
      </body>
    </html>
  );
}
