import { useEffect, useRef, useState } from "react";
import {
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { ActivityIndicator, Icon, Text } from "react-native-paper";
import { useTranslation } from "react-i18next";

import { createErrorLogMessage } from "../util";
import { PosterRepository } from "@/db/repositories/poster-repository";
import { Poster } from "@/db/models/poster";
import { log } from "../logs";
import { WizardHeader } from "../wizard/wizard-header";

type PosterFieldProps = {
  label: string;
  value?: string | number | null;
  fullWidth: boolean;
};

function PosterField({ label, value, fullWidth }: PosterFieldProps) {
  return (
    <View style={[styles.field, fullWidth && styles.fieldFullWidth]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>
        {value == null ? "" : String(value)}
      </Text>
    </View>
  );
}

type PosterActionProps = {
  icon: string;
  label: string;
  url: string;
};

function PosterAction({ icon, label, url }: PosterActionProps) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      onPress={() => Linking.openURL(url)}
      style={styles.action}
    >
      <Icon source={icon} size={18} color="#fff" />
      <Text style={styles.actionText}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function SightingPoster({
  id: posterId,
  sightingId,
}: {
  id: string;
  sightingId: string;
}) {
  const { t } = useTranslation("sightings");
  const { width } = useWindowDimensions();
  const [loading, setLoading] = useState(true);
  const [poster, setPoster] = useState<Poster | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    if (!posterId && !sightingId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const repository = new PosterRepository();

    repository
      .getPoster(posterId, sightingId)
      .then((result) => {
        if (!isMountedRef.current) {
          return;
        }

        setPoster(result);
      })
      .catch((error) => {
        if (!isMountedRef.current) {
          return;
        }
        log(`Failed to load poster: ${createErrorLogMessage(error)}`);
      })
      .finally(() => {
        if (!isMountedRef.current) {
          return;
        }
        setLoading(false);
      });

    return () => {
      isMountedRef.current = false;
    };
  }, [posterId, sightingId]);

  // A single column prevents long translated labels and addresses from clipping.
  const singleColumn = width < 390;
  const sightingUrl = `https://spotapaw.com/sightings/${poster?.sighting_id}`;

  return (
    <View style={{ flex: 1 }}>
      <WizardHeader
        title={t("generatePosterTitle", "Pet Sighting Poster", {
          ns: "translation",
        })}
        subTitle={t(
          "generatePosterSubTitle",
          "View generated poster for this sighting.",
          { ns: "translation" },
        )}
      />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {!posterId && !sightingId ? (
          <Text variant="bodyMedium">
            {t("noPoster", "No posters to display.", { ns: "translation" })}
          </Text>
        ) : loading ? (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ActivityIndicator size="large" />
            <Text variant="bodyMedium">
              {t("generatingPoster", "Generating poster...", {
                ns: "translation",
              })}
            </Text>
          </View>
        ) : poster && poster.id ? (
          <View>
            <View style={styles.posterCard}>
              <View style={styles.header}>
                <Text style={styles.headline}>{poster.headline}</Text>
                <Text style={styles.subheadline}>{poster.subheadline}</Text>
              </View>

              {!!poster.photo_url && (
                <Image
                  source={{ uri: poster.photo_url }}
                  resizeMode="contain"
                  style={styles.photo}
                />
              )}

              <View style={styles.body}>
                <Text style={styles.name}>{poster.name}</Text>
                <Text style={styles.description}>{poster.description}</Text>
              </View>

              <View style={styles.fields}>
                <PosterField
                  label={t("breed", "Breed:")}
                  value={poster.breed}
                  fullWidth={singleColumn}
                />
                <PosterField
                  label={t("colors", "Colors:")}
                  value={poster.colors}
                  fullWidth={singleColumn}
                />
                <PosterField
                  label={t("lastSeenLocation", "Last seen location:")}
                  value={poster.last_seen_location}
                  fullWidth={singleColumn}
                />
                <PosterField
                  label={t("lastSeenDate", "Last seen date:")}
                  value={poster.last_seen_time}
                  fullWidth={singleColumn}
                />
              </View>

              {!!poster.cta && (
                <View style={styles.reward}>
                  <Text style={styles.rewardText}>{poster.cta}</Text>
                </View>
              )}

              <View style={styles.contact}>
                {!!poster.contact_name && (
                  <Text style={styles.contactText}>{poster.contact_name}</Text>
                )}
                {!!poster.contact_phone && (
                  <View style={styles.phoneRow}>
                    <Icon source="phone" size={18} color="#555" />
                    <Text style={styles.contactText}>
                      {poster.contact_phone}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.footer}>
                <Text
                  style={styles.url}
                  onPress={() => Linking.openURL(sightingUrl)}
                  accessibilityRole="link"
                >
                  {sightingUrl}
                </Text>
              </View>
            </View>

            <View style={styles.buttonContainer}>
              {!!poster.html_url && (
                <PosterAction
                  icon="open-in-new"
                  label={t("viewPoster", "View in browser")}
                  url={poster.html_url}
                />
              )}
              {!!poster.pdf_url && (
                <PosterAction
                  icon="download"
                  label={t("downloadPDF", "Download PDF")}
                  url={poster.pdf_url}
                />
              )}
              {!!poster.png_url && (
                <PosterAction
                  icon="file-image"
                  label={t("downloadPNG", "Download PNG")}
                  url={poster.png_url}
                />
              )}
            </View>
          </View>
        ) : (
          <Text variant="bodyMedium">
            {t("noPoster", "No posters found for this sighting.", {
              ns: "translation",
            })}
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff" },
  scrollContent: { padding: 16, paddingBottom: 48 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  posterCard: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    overflow: "hidden",
  },
  header: {
    backgroundColor: "#0F6E56",
    alignItems: "center",
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  headline: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "bold",
    letterSpacing: 1,
    color: "#fff",
    textAlign: "center",
    width: "100%",
  },
  subheadline: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
    color: "#fff",
    textAlign: "center",
    width: "100%",
  },
  photo: { width: "100%", aspectRatio: 1.5, backgroundColor: "#fafafa" },
  body: { paddingHorizontal: 4, paddingTop: 4, paddingBottom: 4, gap: 4 },
  name: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "bold",
    textAlign: "center",
  },
  description: { fontSize: 14, lineHeight: 21, color: "#444" },
  fields: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  field: {
    flexBasis: "47%",
    flexGrow: 1,
    minWidth: 0,
    backgroundColor: "#f5f5f5",
    borderRadius: 6,
    padding: 9,
  },
  fieldFullWidth: { flexBasis: "100%" },
  fieldLabel: {
    fontSize: 11,
    lineHeight: 16,
    textTransform: "uppercase",
    color: "#666",
    letterSpacing: 0.3,
  },
  fieldValue: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "bold",
    color: "#222",
    marginTop: 3,
  },
  reward: {
    marginHorizontal: 4,
    marginVertical: 4,
    backgroundColor: "#FAEEDA",
    borderWidth: 1,
    borderColor: "#EF9F27",
    borderRadius: 6,
    padding: 12,
  },
  rewardText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "bold",
    color: "#854F0B",
    textAlign: "center",
  },
  contact: {
    paddingHorizontal: 4,
    paddingVertical: 4,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    alignItems: "center",
    gap: 4,
    flexDirection: "row",
    justifyContent: "center",
  },
  phoneRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    maxWidth: "100%",
  },
  contactText: {
    fontSize: 13,
    lineHeight: 19,
    color: "#555",
    textAlign: "center",
  },
  footer: { backgroundColor: "#f5f5f5", padding: 4, alignItems: "center" },
  url: {
    color: "#555",
    fontSize: 11,
    lineHeight: 17,
    textAlign: "center",
    width: "100%",
    textDecorationLine: "underline",
  },
  buttonContainer: { gap: 10, marginTop: 16 },
  action: {
    width: "100%",
    backgroundColor: "#0F6E56",
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  actionText: {
    flexShrink: 1,
    fontSize: 14,
    lineHeight: 20,
    color: "#fff",
    textAlign: "center",
  },
});
