import RootLayout from "./app/(app)/_layout";
import { AuthProvider } from "./components/Provider/auth-provider";

export default function App() {
    return (
        <AuthProvider>
        <RootLayout />
      </AuthProvider>
    )
}