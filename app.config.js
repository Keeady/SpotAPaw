import "dotenv/config";
export default ({ config }) => {
  return {
    ...config,
    ...{
      android: {
        ...(config.android || {}),
        config: {
          googleMaps: {
            apiKey: process.env.EXPO_GOOGLE_MAP_API_KEY,
          },
        },
      },
      ios: {
        ...(config.ios || {}),
        config: {
          googleMapsApiKey: process.env.EXPO_GOOGLE_MAP_API_KEY_IOS
        },
      },
    },
    extra: {
      eas: {
        projectId: "f8aec9d1-5a47-4313-90ce-b3793194513d",
      },
      EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
      EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      EXPO_GOOGLE_MAP_API_KEY: process.env.EXPO_GOOGLE_MAP_API_KEY,
      EXPO_GOOGLE_GEOCODE_API_KEY: process.env.EXPO_GOOGLE_GEOCODE_API_KEY,
      EXPO_GOOGLE_MAP_API_KEY_IOS: process.env.EXPO_GOOGLE_MAP_API_KEY_IOS,
      EXPO_GOOGLE_MAP_API_KEY_WEB: process.env.EXPO_GOOGLE_MAP_API_KEY_WEB,
    },
  };
};
