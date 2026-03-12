import HomePageHeader from "@/components/header/homepage-header";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";

export default function PublicHome() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.logoContainer}>
        <HomePageHeader />
        <View>
          <Text variant="titleMedium" style={styles.largeText}>
            A community helping lost pets find their way home.
          </Text>
        </View>
      </View>

      <View>
        <Button
          mode="contained"
          style={styles.button}
          onPress={() => router.push("/sightings/")}
        >
          Browse Nearby Lost Pet Sightings
        </Button>

        <View style={styles.usageText}>
          <Text variant="bodySmall">By continuing, you agree to our</Text>
          <Button mode="text" onPress={() => router.push("/privacy")} compact>
            <Text
              variant="bodySmall"
              style={{ textDecorationLine: "underline" }}
            >
              Privacy Policy
            </Text>
          </Button>
          <Text variant="bodySmall">and</Text>
          <Button mode="text" onPress={() => router.push("/terms")} compact>
            <Text
              variant="bodySmall"
              style={{ textDecorationLine: "underline" }}
            >
              Terms of Service
            </Text>
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: "#fff",
    flexDirection: "column",
    width: "100%",
    height: "100%",
  },
  content: {
    alignItems: "center",
    flexGrow: 1,
    width: "auto",
  },
  button: {
    width: "100%",
    marginBottom: 12,
    borderWidth: 1,
    borderRadius: 12,
  },
  logoContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    flexGrow: 2,
  },
  largeText: {
    textAlign: "center",
  },
  usageText: {
    flexDirection: "row",
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 16,
  },
});
