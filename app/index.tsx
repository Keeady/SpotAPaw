import HomePageHeader from "@/components/header/homepage-header";
import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { Button, FAB, Text } from "react-native-paper";

export default function PublicHome() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <HomePageHeader />
      </View>

      <View style={styles.buttonContainer}>
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
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          marginTop: 16,
          marginHorizontal: 24,
          alignContent: "center",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <Text variant="bodyMedium" style={{textAlign: "center"}}>By using this app, you agree to our</Text>
        <Button mode="text" onPress={() => router.push("/privacy")} compact>
          <Text variant="bodyMedium" style={{textDecorationLine: "underline"}}>Privacy Policy</Text>
        </Button>
        <Text variant="bodyMedium" style={{textAlign: "center"}}>and</Text>
        <Button mode="text" onPress={() => router.push("/terms")} compact>
          <Text variant="bodyMedium" style={{textDecorationLine: "underline"}}>Terms of Service</Text>
        </Button>
      </View>
      <FAB
        icon="message-outline"
        label="Report"
        mode="elevated"
        onPress={() => router.push("/sightings/chat-bot")}
        style={{ position: "absolute", bottom: 50, right: 50 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: "center",
    backgroundColor: "#fff",
    flexDirection: "column",
  },
  logo: {
    width: "100%",
    resizeMode: "contain",
  },
  button: {
    width: "100%",
    marginBottom: 16,
  },
  buttonContainer: {
    width: "100%",
  },
  logoContainer: {
    width: "100%",
    alignItems: "center",
  },
});
