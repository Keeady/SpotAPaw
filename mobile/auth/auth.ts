import { supabase } from "@/components/supabase-client";
import { IAuthHandler } from "./base-auth";
import { SupabaseAuthHandler } from "./supabase/auth";
import { AppleSupabaseAuthHandler } from "./supabase/apple-auth";
import { GoogleSupabaseAuthHandler } from "./supabase/google-auth";

export class AuthHandler implements IAuthHandler {
  updatePassword(password: string): Promise<any> {
    const authHandler = new SupabaseAuthHandler(supabase);
    return authHandler.updatePassword(password);
  }
  resetPasswordForEmail(email: string): Promise<void> {
    const authHandler = new SupabaseAuthHandler(supabase);
    return authHandler.resetPasswordForEmail(email);
  }
  resend(email: string): Promise<void> {
    const authHandler = new SupabaseAuthHandler(supabase);
    return authHandler.resend(email);
  }
  signInWithOtp(email: string): Promise<void> {
    const authHandler = new SupabaseAuthHandler(supabase);
    return authHandler.signInWithOtp(email);
  }
  verifyOtp(email: string, code: string): Promise<any> {
    const authHandler = new SupabaseAuthHandler(supabase);
    return authHandler.verifyOtp(email, code);
  }
  signOut(): Promise<void> {
    const authHandler = new SupabaseAuthHandler(supabase);
    return authHandler.signOut();
  }
  signUp(email: string, password: string): Promise<any> {
    const authHandler = new SupabaseAuthHandler(supabase);
    return authHandler.signUp(email, password);
  }
  signInWithPassword(email: string, password: string): Promise<any> {
    const authHandler = new SupabaseAuthHandler(supabase);
    return authHandler.signInWithPassword(email, password);
  }
  signInWithOAuth(credentials: any): Promise<any> {
    const authHandler = new GoogleSupabaseAuthHandler(supabase);
    return authHandler.signInWithOAuth(credentials);
  }
  signInWithIdToken(credentials: any): Promise<any> {
    const authHandler = new AppleSupabaseAuthHandler(supabase);
    return authHandler.signInWithIdToken(credentials);
  }
  exchangeCodeForSession(code: string): Promise<any> {
    const authHandler = new SupabaseAuthHandler(supabase);
    return authHandler.exchangeCodeForSession(code);
  }
}
