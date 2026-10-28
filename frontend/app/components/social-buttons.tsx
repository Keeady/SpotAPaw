import AppleSignIn from "../utils/sign-in-apple";
import { GoogleSignIn } from "../utils/sign-in-google";

export default function SocialButtons() {
  return (
    <div className="flex w-full flex-col gap-3">
      <GoogleSignIn />
      <AppleSignIn />
    </div>
  );
}
