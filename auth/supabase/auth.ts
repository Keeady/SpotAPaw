import { SupabaseClient } from "@supabase/supabase-js";
import { BaseAuthHandler } from "../base-auth";

export class SupabaseAuthHandler extends BaseAuthHandler {
  supabaseClient: SupabaseClient | undefined;
  constructor(supabase: SupabaseClient) {
    super();
    this.supabaseClient = supabase;
  }

  async exchangeCodeForSession(code: string): Promise<any> {
    if (!this.supabaseClient) {
      throw new Error("Undefined supabase client");
    }

    return this.supabaseClient.auth.exchangeCodeForSession(code);
  }

  async signInWithPassword(email: string, password: string): Promise<any> {
    if (!this.supabaseClient) {
      throw new Error("Undefined supabase client");
    }
    const {
      error,
      data: { session },
    } = await this.supabaseClient.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      throw error;
    }

    return session;
  }

  async signUp(email: string, password: string): Promise<any> {
    if (!this.supabaseClient) {
      throw new Error("Undefined supabase client");
    }

    const {
      data: { session },
      error,
    } = await this.supabaseClient.auth.signUp({
      email: email,
      password: password,
      options: {
        emailRedirectTo: "spotapaw://auth/verify",
      },
    });

    if (error) {
      throw error;
    }

    return session;
  }

  async signOut(): Promise<void> {
    if (!this.supabaseClient) {
      throw new Error("Undefined supabase client");
    }
    const { error } = await this.supabaseClient.auth.signOut();
    if (error) {
      throw error;
    }
  }

  async verifyOtp(email: string, code: string): Promise<any> {
    if (!this.supabaseClient) {
      throw new Error("Undefined supabase client");
    }
    const {
      data: { session },
      error,
    } = await this.supabaseClient.auth.verifyOtp({
      email,
      token: code,
      type: "email",
    });

    if (error) {
      throw error;
    }

    return session;
  }

  async signInWithOtp(email: string): Promise<void> {
    if (!this.supabaseClient) {
      throw new Error("Undefined supabase client");
    }

    const { error } = await this.supabaseClient.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      },
    });
    if (error) {
      throw error;
    }
  }

  async resend(email: string): Promise<void> {
    if (!this.supabaseClient) {
      throw new Error("Undefined supabase client");
    }
    const { error } = await this.supabaseClient.auth.resend({
      type: "signup",
      email,
    });

    if (error) {
      throw error;
    }
  }

  async resetPasswordForEmail(email: string): Promise<void> {
    if (!this.supabaseClient) {
      throw new Error("Undefined supabase client");
    }

    const { error } = await this.supabaseClient.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: "spotapaw://auth/reset",
      },
    );

    if (error) {
      throw error;
    }
  }

  async updatePassword(password: string): Promise<any> {
    if (!this.supabaseClient) {
      throw new Error("Undefined supabase client");
    }

    const { data, error } = await this.supabaseClient.auth.updateUser({
      password,
    });

    if (error) {
      throw error;
    }

    return data;
  }
}
