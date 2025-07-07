import { Session, User } from "@supabase/supabase-js";
import React, { createContext, useEffect, useState } from "react";
import { supabase } from "../supabase-client";
type ContextProps = {
  user: null | User;
  session: Session | null;
};

const AuthContext = createContext<Partial<ContextProps>>({});

interface Props {
  children: React.ReactNode;
}

const AuthProvider = (props: Props) => {
  // user null = loading
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    }).catch((e) => {
      console.log("AuthProvider error", e)
    });
    const {data: listener} = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => listener.subscription.unsubscribe()
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user: session?.user,
        session,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
