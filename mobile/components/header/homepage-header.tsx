import { Image } from "react-native";

export default function HomePageHeader() {
  return (
    <Image
      source={require("../../assets/images/spotapaw-text-logo-large-v2.png")}
      style={{
        width: "100%",
        height: "auto",
        aspectRatio: 970 / 250,
        maxWidth: 800
      }}
      resizeMode="contain"
    />
  );
}
