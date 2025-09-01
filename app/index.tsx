import HomePageHeader from "@/components/header/homepage-header";
import { AuthContext } from "@/components/Provider/auth-provider";
import { useRouter } from "expo-router";
import { useContext } from "react";
import { StyleSheet, View } from "react-native";
import { Button } from "react-native-paper";

export default function PublicHome() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <HomePageHeader />

      <Button
        icon="paw"
        mode="contained"
        onPress={() => router.navigate("/sightings/new")}
        contentStyle={{ width: "100%" }}
        style={styles.button}
      >
        Report a Pet Sighting
      </Button>
      <Button
        icon="paw"
        mode="outlined"
        onPress={() => router.navigate("/sightings/list")}
        contentStyle={{ width: "100%" }}
        style={styles.button}
      >
        View Lost Pet Sightings
      </Button>
      {/*<Button
        icon="paw"
        mode="contained"
        onPress={() => router.navigate("/sightings/chat")}
        contentStyle={{ width: "100%" }}
        style={styles.button}
      >
        Chat with AI
      </Button>*/}
      <Button
        icon=""
        mode="outlined"
        onPress={() => router.navigate("/(auth)/signin")}
        style={styles.button}
      >
        Sign In
      </Button>
      <Button
        icon=""
        mode="outlined"
        onPress={() => router.navigate("/(auth)/signup")}
        style={styles.button}
      >
        Register
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 80,
    paddingHorizontal: 24,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  logo: {
    width: "100%",
    //height: 100,
    marginBottom: 40,
    marginTop: 40,
    resizeMode: "contain"
  },
  button: {
    width: "100%",
    marginBottom: 16,
  },
});
