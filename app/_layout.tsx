import { AuthProvider } from "@/components/Provider/auth-provider";
import { Slot, Stack } from "expo-router";

export default function Layout() {
  return (
    <AuthProvider>
      <Slot/>
    </AuthProvider>
  );
}
