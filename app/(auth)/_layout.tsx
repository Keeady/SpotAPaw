import { AuthContext } from "@/components/Provider/auth-provider";
import { Redirect, router, Stack } from "expo-router";
import { useContext, useEffect } from "react";

export default function AuthLayout() {
  const auth = useContext(AuthContext);

  useEffect(() => {
    if (auth.user) {
      return router.replace("/(app)/pets");
    }
  }, [auth.user]);
  return <Stack screenOptions={{ headerShown: false }} />;
}
