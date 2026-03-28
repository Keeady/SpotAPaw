import { AuthError, PostgrestError } from "@supabase/supabase-js";

export type RepositoryException = PostgrestError | AuthError | Error;