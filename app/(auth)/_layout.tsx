import { AuthContext } from "@/components/Provider/auth-provider";
import { Redirect, Stack } from "expo-router";
import { useContext } from "react";

export default function AuthLayout() {
    const auth = useContext(AuthContext);
  const user = auth.user;
      if (user) {
        return <Redirect href={"/(app)/pets"} />
      }
    return <Stack screenOptions={{headerShown: false}} />
}