import HomePageHeader from "@/components/header/homepage-header";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
import * as Linking from "expo-linking";
import Head from "expo-router/head";
import { useTranslation } from "react-i18next";

export default function PublicHome() {
  const router = useRouter();
  const { t } = useTranslation("index");

  return (
    <>
      <Head>
        <title>SpotAPaw - Lost Pet Finder</title>
        <meta
          name="description"
          content="SpotAPaw is a community-powered app that uses AI to automatically generate detailed pet descriptions from photos, so you can post a detailed lost or found pet report quickly."
        />
        <meta
          name="keywords"
          content="lost pets, found pets, pet sightings, AI pet descriptions, community pet app, pet recovery, pet profiles, real-time pet alerts"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />

        <meta name="apple-itunes-app" content="app-id=6757455715" />
        <meta name="google-play-app" content="app-id=com.bcamaria.SpotAPaw" />
        <meta name="author" content="Camaria Bevavy" />

        <meta name="og:title" content="SpotAPaw - Lost Pet Finder" />
        <meta
          name="og:description"
          content="SpotAPaw is a community-powered app that uses AI to automatically generate detailed pet descriptions from photos, so you can post a detailed lost or found pet report quickly."
        />
        <meta name="og:image" content="https://spotapaw.com/default-og.png" />
        <meta name="og:url" content="https://spotapaw.com" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:image"
          content="https://spotapaw.com/default-og.png"
        />
        <meta name="twitter:title" content="SpotAPaw - Lost Pet Finder" />
        <meta
          name="twitter:description"
          content="SpotAPaw is a community-powered app that uses AI to automatically generate detailed pet descriptions from photos, so you can post a detailed lost or found pet report quickly."
        />
      </Head>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <View style={styles.logoContainer}>
          <HomePageHeader />
          <View>
            <Text variant="titleMedium" style={styles.largeText}>
              {t("title", "A community helping lost pets find their way home.")}
            </Text>
          </View>
        </View>

        <View>
          <Button
            mode="contained"
            style={styles.button}
            onPress={() => router.push("/sightings/")}
          >
            {t(
              "browseNearbyLostPetSightings",
              "Browse Nearby Lost Pet Sightings",
            )}
          </Button>

          <View style={styles.mediaBtnsContainer}>
            <Text variant="bodyMedium" style={styles.mediaBtnsText}>
              {t(
                "lostYourPetFoundAPetDownloadTheApps",
                "Lost your pet? Found a pet? Download the apps:",
              )}
            </Text>
            <View style={styles.mediaBtns}>
              <Button
                icon={"android"}
                mode="outlined"
                onPress={() =>
                  Linking.openURL(
                    "https://play.google.com/store/apps/details?id=com.bcamaria.SpotAPaw",
                  )
                }
              >
                Android
              </Button>
              <Button
                icon={"apple"}
                mode="outlined"
                onPress={() =>
                  Linking.openURL(
                    "https://apps.apple.com/us/app/spotapaw/id6757455715",
                  )
                }
              >
                iOS
              </Button>
            </View>
          </View>

          <View style={styles.usageText}>
            <Text variant="bodySmall">{t("byUsing", "By using ")} </Text>
            <Button mode="text" onPress={() => router.push("/about")} compact>
              <Text
                variant="bodySmall"
                style={{ textDecorationLine: "underline" }}
              >
                SpotAPaw,
              </Text>
            </Button>
            <Text variant="bodySmall">
              {t("youAgreeToOur", "you agree to our")}
            </Text>
            <Button mode="text" onPress={() => router.push("/privacy")} compact>
              <Text
                variant="bodySmall"
                style={{ textDecorationLine: "underline" }}
              >
                {t("privacyPolicy", "Privacy Policy")}
              </Text>
            </Button>
            <Text variant="bodySmall">{t("and", "and")}</Text>
            <Button mode="text" onPress={() => router.push("/terms")} compact>
              <Text
                variant="bodySmall"
                style={{ textDecorationLine: "underline" }}
              >
                {t("termsOfService", "Terms of Service")}
              </Text>
            </Button>
          </View>
        </View>
      </ScrollView>
    </>
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
  mediaBtns: {
    flexDirection: "row",
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
    gap: 16,
  },
  mediaBtnsContainer: {
    marginTop: 12,
  },
  mediaBtnsText: {
    textAlign: "center",
    marginBottom: 12,
  },
});
