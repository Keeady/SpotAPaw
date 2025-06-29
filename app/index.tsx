import Auth from "@/components/auth";
import Home from "@/components/home";
import { AuthContext, AuthProvider } from "@/components/Provider/auth-provider";
import Sightings from "@/components/sightings";
import LostPetTracker from "@/components/tracker";
import { useContext } from "react";

export default function Index() {
	const auth = useContext(AuthContext);
	const user = auth.user;
  const session = auth.session
  //console.log("user", user)
  //console.log("auth", auth);
	return (
		<>
			{!user && <Auth />}
			{user && user.id && <Home />}
		</>
	);
}
