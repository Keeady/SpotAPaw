import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async rewrites() {
    return {
      // beforeFiles so it wins over your real /sightings/[id] page, but only for bots
      beforeFiles: [
        {
          source: "/sightings/:id",
          has: [
            {
              type: "header",
              key: "user-agent",
              value:
                ".*(facebookexternalhit|Twitterbot|LinkedInBot|WhatsApp|Slackbot|Discordbot|TelegramBot).*",
            },
          ],
          destination: "/og/sightings/:id",
        },
      ],
    };
  },
};

export default nextConfig;
