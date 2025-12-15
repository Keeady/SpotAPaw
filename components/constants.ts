import Constants from 'expo-constants';

const AppConstants = {
    EXPO_PUBLIC_SUPABASE_ANON_KEY: Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    EXPO_PUBLIC_SUPABASE_URL: Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL,
};
export default AppConstants;

export const MAX_SIGHTINGS = 50;
export const SIGHTING_OFFSET = 50;
export const SIGHTING_RADIUSKM = 20;
