import "dotenv/config";
export default ({ config }) => {
  return {
    ...config,
    extra: {
      eas: {
        projectId: "f8aec9d1-5a47-4313-90ce-b3793194513d",
      },
      EXPO_GEN_AI_KEY: process.env.EXPO_GEN_AI_KEY,
      EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
      EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    },
  };
};
