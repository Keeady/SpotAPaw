import HomePageHeader from "@/components/header/homepage-header";
import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { Button, FAB } from "react-native-paper";

export default function PublicHome() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <HomePageHeader />

      <Button
        icon="paw"
        mode="contained"
        onPress={() => router.push("/sightings/new")}
        contentStyle={{ width: "100%" }}
        style={styles.button}
      >
        Report a Pet Sighting
      </Button>
      <Button
        icon="paw"
        mode="outlined"
        onPress={() => router.push("/sightings/")}
        contentStyle={{ width: "100%" }}
        style={styles.button}
      >
        View Lost Pet Sightings
      </Button>
      <Button
        icon=""
        mode="outlined"
        onPress={() => router.push("/(auth)/signin")}
        style={styles.button}
      >
        Sign In
      </Button>
      <Button
        icon=""
        mode="outlined"
        onPress={() => router.push("/(auth)/signup")}
        style={styles.button}
      >
        Register
      </Button>
      <FAB
        icon="message-outline"
        label="Report"
        mode="elevated"
        onPress={() => router.push(`/sightings/chat`)}
        style={{ position: "absolute", bottom: 50, right: 50 }}
      />
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
    marginBottom: 40,
    marginTop: 40,
    resizeMode: "contain",
  },
  button: {
    width: "100%",
    marginBottom: 16,
  },
});
