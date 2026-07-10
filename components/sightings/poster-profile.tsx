import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Linking,
  TouchableOpacity,
  View,
  Image,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Icon, Text } from "react-native-paper";
import { createErrorLogMessage } from "../util";
import { PosterRepository } from "@/db/repositories/poster-repository";
import { Poster } from "@/db/models/poster";
import { log } from "../logs";

export default function SightingPoster({ id: posterId }: { id: string }) {
  const { t } = useTranslation("sightings");
  const [loading, setLoading] = useState(false);
  const [poster, setPoster] = useState<Poster | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!posterId) {
      return;
    }

    const repository = new PosterRepository();
    repository
      .getPoster(posterId)
      .then((poster) => {
        if (!isMountedRef.current) {
          return;
        }

        setPoster(poster);
      })
      .catch(async (error) => {
        if (!isMountedRef.current) {
          return;
        }

        const errorMessage = createErrorLogMessage(error);
        log(`Failed to generate poster: ${errorMessage}`);
      })
      .finally(() => {
        if (!isMountedRef.current) {
          return;
        }
        setLoading(false);
      });
  }, [posterId]);

  if (!poster) {
    return null;
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={{
          flex: 1,
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 12,
        }}
      >
        <View style={styles.header}>
          <Text variant="bodyMedium" style={styles.headline}>
            {poster.headline}
          </Text>
          <Text variant="bodyMedium" style={styles.subheadline}>
            {poster.subheadline}
          </Text>
        </View>
        <View style={styles.photo}>
          {poster.photo_url && (
            <Image
              source={{ uri: poster.photo_url }}
              resizeMode={"contain"}
              style={{
                width: "100%",
                height: "auto",
                borderTopLeftRadius: 12,
                borderTopRightRadius: 12,
                marginTop: 5,
                aspectRatio: 1.5,
              }}
            />
          )}
        </View>
        <View style={styles.body}>
          <Text variant="bodyMedium" style={styles.name}>
            {poster.name}
          </Text>
          <Text variant="bodyMedium" style={styles.description}>
            {poster.description}
          </Text>
        </View>
        <View style={styles.fields}>
          <View style={styles.field}>
            <Text variant="bodyMedium" style={styles.fieldLabel}>
              {t("breed", "Breed:")}
            </Text>
            <Text variant="bodyMedium" style={styles.fieldVal}>
              {poster.breed}
            </Text>
          </View>
          <View style={styles.field}>
            <Text variant="bodyMedium" style={styles.fieldLabel}>
              {t("colors", "Colors:")}
            </Text>
            <Text variant="bodyMedium" style={styles.fieldVal}>
              {poster.colors}
            </Text>
          </View>
          <View style={styles.field}>
            <Text variant="bodyMedium" style={styles.fieldLabel}>
              {t("lastSeenLocation", "Last seen location:")}
            </Text>
            <Text variant="bodyMedium" style={styles.fieldVal}>
              {poster.last_seen_location}
            </Text>
          </View>
          <View style={styles.field}>
            <Text variant="bodyMedium" style={styles.fieldLabel}>
              {t("lastSeenDate", "Last seen date:")}
            </Text>
            <Text variant="bodyMedium" style={styles.fieldVal}>
              {poster.last_seen_time}
            </Text>
          </View>
        </View>
        <View style={styles.reward}>
          <Text variant="bodyMedium">{poster.cta}</Text>
        </View>

        <View style={styles.contact}>
          <Text variant="bodyMedium" style={styles.contactRow}>
            {poster.contact_name}
          </Text>
          <Icon source="phone" size={20} color="#555" />
          <Text variant="bodyMedium" style={styles.contactRow}>
            {poster.contact_phone}
          </Text>
        </View>
        <View style={styles.footer}>
          <TouchableOpacity
            onPress={() => {
              const url = `https://spotapaw.com/sightings/${poster.sighting_id}`;
              Linking.openURL(url);
            }}
          >
            <Text variant="bodyMedium">
              https://spotapaw.com/sightings/{poster.sighting_id}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonContainer}>
          {poster.html_url && (
            <TouchableOpacity
              onPress={() => {
                const url = poster.html_url;
                Linking.openURL(url);
              }}
              style={{
                marginTop: 16,
                padding: 12,
                backgroundColor: "#0F6E56",
                borderRadius: 6,
              }}
            >
              <View style={styles.buttonContent}>
                <Icon source="open-in-new" size={20} color="#fff" />
                <Text
                  variant="bodyMedium"
                  style={{ color: "#fff", textAlign: "center" }}
                >
                  {t("viewPoster", "View in browser")}
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {poster.pdf_url && (
            <TouchableOpacity
              onPress={() => {
                const url = poster.pdf_url;
                Linking.openURL(url);
              }}
              style={{
                marginTop: 16,
                padding: 12,
                backgroundColor: "#0F6E56",
                borderRadius: 6,
              }}
            >
              <View style={styles.buttonContent}>
                <Icon source="download" size={20} color="#fff" />
                <Text
                  variant="bodyMedium"
                  style={{ color: "#fff", textAlign: "center" }}
                >
                  {t("downloadPDF", "Download PDF.")}
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {poster.png_url && (
            <TouchableOpacity
              onPress={() => {
                const url = poster.png_url;
                Linking.openURL(url);
              }}
              style={{
                marginTop: 16,
                padding: 12,
                backgroundColor: "#0F6E56",
                borderRadius: 6,
              }}
            >
              <View style={styles.buttonContent}>
                <Icon source="file-image" size={20} color="#fff" />
                <Text
                  variant="bodyMedium"
                  style={{ color: "#fff", textAlign: "center" }}
                >
                  {t("downloadPNG", "Download PNG.")}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    padding: 20,
    paddingBottom: 48,
    gap: 16,
  },
  header: {
    backgroundColor: "#0F6E56",
    color: "#fff",
    alignItems: "center",
    padding: 24,
  },
  headline: {
    fontSize: 30,
    fontWeight: "bold",
    letterSpacing: 3,
    color: "#fff",
  },
  subheadline: {
    fontSize: 14,
    marginTop: 4,
    opacity: 0.85,
    color: "#fff",
  },
  photo: {
    width: "100%",
    height: "auto",
    objectFit: "cover",
  },
  body: {
    padding: 10,
    gap: 8,
  },
  name: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#444",
    marginBottom: 16,
  },
  fields: {
    padding: 10,
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  field: {
    backgroundColor: "#f5f5f5",
    borderRadius: 6,
    padding: 5,
    minWidth: "45%",
  },
  fieldLabel: {
    fontSize: 10,
    textTransform: "uppercase",
    color: "#888",
    letterSpacing: 0.5,
  },
  fieldVal: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#222",
    marginTop: 2,
  },
  reward: {
    backgroundColor: "#FAEEDA",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#EF9F27",
    borderRadius: 6,
    padding: 12,
    textAlign: "center",
    fontWeight: "bold",
    color: "#854F0B",
    marginBottom: 16,
    fontSize: 15,
  },
  contact: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    borderStyle: "solid",
    padding: 14,
    alignItems: "center",
    alignContent: "center",
    justifyContent: "center",
    gap: 8,
  },
  contactRow: {
    fontSize: 13,
    color: "#555",
  },
  footer: {
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    fontSize: 11,
    color: "#888",
    padding: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 16,
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
