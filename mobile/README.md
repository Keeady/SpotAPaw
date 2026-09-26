# SpotAPaw 🐾

SpotAPaw is a community-powered app that uses AI to automatically describe pets from photos and then semantically matches your lost pet against every sighting in your area — even when descriptions don't use the exact same words.

🐾 AI-powered pet descriptions:
Snap a photo and our AI instantly captures breed, color, coat pattern, and markings — no guessing required.

🔍 Smart semantic matching:
Our AI compares the meaning behind descriptions, not just keywords. "Golden retriever with white chest" matches "fluffy yellow dog with light belly" — so no lead gets missed.

📍 Real-time sighting — See lost and found reports pinned to your neighborhood the moment they're posted.

🔔 Instant smart alerts — Get notified when a pet semantically similar to yours is spotted nearby — even if the words are different.

👤 Smart pet profiles — Photo, AI description, microchip number, and contact info — shareable in seconds when it matters most.

🤝 Community-driven network — Local pet lovers watching, sharing, and helping bring animals home.

✨ AI-Generated Posters — Just add the details, and our AI will write clear, compelling text for your lost pet poster in seconds.

📸 Smart Photo Selection — Upload multiple photos, and AI will automatically choose the best one to feature first.

🌍 More Languages, More Reach — We now supports Arabic, English, French, and Spanish, with more languages on the way.

The smarter way to find a lost pet — because every minute counts.

## Architecture

[Pet-Sighting-Architecture-Review](./pet-sighting-architecture-review.md)

[Pet-Sighting-Rollout-Plan](./pet-sighting-rollout-plan.md)

## Releases

[Google Play](https://play.google.com/store/apps/details?id=com.bcamaria.SpotAPaw)

[App Store](https://apps.apple.com/us/app/spotapaw-lost-pet-finder/id6757455715)

[Spotapaw.com](https://spotapaw.com)

## Project Structure

- `app/` — Main app screens and navigation
- `components/` — Reusable UI components (pet profiles, sightings, dialogs, etc.)
- `model/` — TypeScript models for pets and sightings
- `assets/` — Images and fonts
- `.env` — Environment variables (API keys, etc.)
- `auth` - Third-party authentication handlers
- `db` - Database models and repositories
- `docs` - Public docs for privacy and terms of service
- `e2e_tests` - Maestro integration tests
- `functions` - Firebase functions for server side renderings
- `locales` - i18n translated json files
- `service` - Backend functions and triggers

## Technologies

- React Native
- Expo
- Supabase (backend/database)
- React Native Paper (UI)
- Date-fns (date utilities)
- TypeScript
- PostgreSQL
- Nodejs

## Getting Started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Start the app**

   ```bash
   npx expo start
   ```

## Screenshots

<img width="400" height="800" alt="Screenshot_1771561628" src="https://github.com/user-attachments/assets/4fecb915-1b7b-4dea-aefc-25ccbf3e71d3" />

<img width="400" height="800" alt="Simulator Screenshot - iPhone 17 Pro Max - 2026-03-31 at 22 33 29" src="https://github.com/user-attachments/assets/0e92740a-d8b6-4831-a180-1f9ffacd8a73" />

<img width="400" height="800" alt="Simulator Screenshot - iPhone 17 Pro Max - 2026-03-07 at 22 02 28" src="https://github.com/user-attachments/assets/c8df80d9-97df-47f8-932a-207b54d3e924" />

<img width="400" height="800" alt="Simulator Screenshot - iPhone 17 Pro Max - 2026-03-24 at 10 06 20" src="https://github.com/user-attachments/assets/a56ad8fa-60d4-49a9-a334-95577c1e9989" />

---

Created with ❤️ using [Expo](https://expo.dev)
