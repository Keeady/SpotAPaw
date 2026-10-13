import { createClient } from "./auth/supabase/server";
import { JSX } from "react/jsx-runtime";
import { connection } from "next/server";

type AuthHeaderProps = {
  children: ({isAuthenticated}: {isAuthenticated: boolean}) => JSX.Element;
}

export default async function AuthHeader({children}: AuthHeaderProps) {
  await connection();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isAuthenticated = !!user && !user.is_anonymous;
  return children({isAuthenticated})
}