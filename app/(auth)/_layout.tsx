import { AuthContext } from "@/components/Provider/auth-provider";
import { Stack, useRouter } from "expo-router";
import { useContext, useEffect } from "react";
import FlashMessage from "react-native-flash-message";

export default function AuthLayout() {
  const router = useRouter();
  const auth = useContext(AuthContext);

  useEffect(() => {
    if (auth.user) {
      return router.replace("/(app)/pets");
    }
  }, [auth.user]);
  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      <FlashMessage position="top" />
    </>
  );
}
