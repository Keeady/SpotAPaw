import LottieView from "lottie-react-native";

export const ShowHappyDogAnimation = () => (
  <LottieView
    source={require("../assets/animations/happydog.json")}
    autoPlay={true}
    loop={true}
    style={{ width: 200, height: 200 }}
  />
);
