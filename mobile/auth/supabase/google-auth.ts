import { SupabaseClient } from "@supabase/supabase-js";
import { SupabaseAuthHandler } from "./auth";

export class GoogleSupabaseAuthHandler extends SupabaseAuthHandler {
  constructor(supabase: SupabaseClient) {
    super(supabase);
  }

  async signInWithOAuth(credentials: any): Promise<any> {
    if (!this.supabaseClient) {
      throw new Error("Undefined supabase client");
    }
    const { error, data } = await this.supabaseClient.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: credentials,
        skipBrowserRedirect: false,
      },
    });

    if (error) {
      throw error;
    }

    if (!data?.url) {
      throw new Error("No URL returned from signInWithOAuth");
    }

    return data.url;
  }
}
