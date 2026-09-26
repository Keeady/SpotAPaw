import { SupabaseClient } from "@supabase/supabase-js";
import { SupabaseAuthHandler } from "./auth";

export class AppleSupabaseAuthHandler extends SupabaseAuthHandler {
  constructor(supabase: SupabaseClient) {
    super(supabase);
  }

  async signInWithIdToken(credentials: any): Promise<any> {
    if (!this.supabaseClient) {
      throw new Error("Undefined supabase client");
    }
    const { error } = await this.supabaseClient.auth.signInWithIdToken({
      provider: "apple",
      token: credentials.identityToken,
    });

    if (error) {
      throw error;
    }
  }
}
