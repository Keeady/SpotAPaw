# SpotAPaw 🐾

SpotAPaw is a mobile app built with [Expo](https://expo.dev) and React Native to help users report, track, and find lost pets in their community. Users can create pet profiles, report sightings, and contact pet owners to reunite lost pets with their families.

## Features

- **Pet Profiles:** Register your pets with details like name, breed, age, colors, and distinctive features.
- **Report Sightings:** Submit sightings of lost pets, including location, time, and photos.
- **View Sightings:** Browse recent pet sightings and filter by proximity.
- **Claim Sightings:** Owners can claim sightings related to their pets.
- **Contact:** Easily reach out to pet owners or sighting reporters.
- **Authentication:** Secure sign up and sign in for pet owners.
- **Chat with AI:** Get help extracting structured sighting info via chat. [In Progress]

## Getting Started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Start the app**

   ```bash
   npx expo start
   ```

## Project Structure

- `app/` — Main app screens and navigation
- `components/` — Reusable UI components (pet profiles, sightings, dialogs, etc.)
- `model/` — TypeScript models for pets and sightings
- `assets/` — Images and fonts
- `.env` — Environment variables (API keys, etc.)

## Technologies

- React Native
- Expo
- Supabase (backend/database)
- React Native Paper (UI)
- Date-fns (date utilities)

---

Created with ❤️ using [Expo](https://expo.dev)
