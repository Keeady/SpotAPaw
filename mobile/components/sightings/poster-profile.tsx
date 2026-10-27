import { useCallback, useEffect, useRef, useState } from "react";
import {
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  TextInput,
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

export type PosterEditableFields = Pick<
  Poster,
  "description" | "cta" | "contact_name" | "contact_phone"
>;

export type PosterChanges = Partial<PosterEditableFields>;

/**
 * Persists changes, regenerates the PDF/PNG/HTML exports, and resolves with
 * the updated poster. Reject (throw) to surface an error in the UI.
 */
export type OnSavePoster = (
  posterId: string,
  changes: PosterChanges,
) => Promise<Poster>;

type EditGroup = "description" | "cta" | "contact";

const GROUP_FIELDS: Record<EditGroup, (keyof PosterEditableFields)[]> = {
  description: ["description"],
  cta: ["cta"],
  contact: ["contact_name", "contact_phone"],
};

type PosterFieldProps = {
  label: string;
  value?: string | number | null;
  fullWidth: boolean;
};

function PosterField({ label, value, fullWidth }: PosterFieldProps) {
  return (
    <View style={[styles.field, fullWidth && styles.fieldFullWidth]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value == null ? "" : String(value)}</Text>
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

function EditButton({
  onPress,
  label,
  light,
}: {
  onPress: () => void;
  label: string;
  light?: boolean;
}) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      style={styles.editButton}
    >
      <Icon source="pencil" size={16} color={light ? "#854F0B" : "#0F6E56"} />
    </TouchableOpacity>
  );
}

type EditControlsProps = {
  saving: boolean;
  error: string | null;
  onSave: () => void;
  onCancel: () => void;
  saveLabel: string;
  cancelLabel: string;
};

function EditControls({
  saving,
  error,
  onSave,
  onCancel,
  saveLabel,
  cancelLabel,
}: EditControlsProps) {
  return (
    <View style={styles.editControlsWrap}>
      {!!error && <Text style={styles.errorText}>{error}</Text>}
      <View style={styles.editControls}>
        <TouchableOpacity
          accessibilityRole="button"
          onPress={onCancel}
          disabled={saving}
          style={[styles.controlButton, styles.cancelButton]}
        >
          <Text style={styles.cancelText}>{cancelLabel}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityRole="button"
          onPress={onSave}
          disabled={saving}
          style={[styles.controlButton, styles.saveButton]}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveText}>{saveLabel}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
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

  // In-place editing state: only one group is edited at a time.
  const [editing, setEditing] = useState<EditGroup | null>(null);
  const [draft, setDraft] = useState<PosterChanges>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

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
        if (!isMountedRef.current) return;
        setPoster(result);
      })
      .catch((error) => {
        if (!isMountedRef.current) return;
        log(`Failed to load poster: ${createErrorLogMessage(error)}`);
      })
      .finally(() => {
        if (!isMountedRef.current) return;
        setLoading(false);
      });
  }, [posterId, sightingId]);

  const onSave = useCallback((id: string, data: PosterChanges) => {
    if (!id && !data) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const repository = new PosterRepository();
    return repository.updatePoster(id, data);
  }, []);

  const canEdit = !!poster?.id;

  const startEdit = useCallback(
    (group: EditGroup) => {
      if (!poster || saving) return;
      const next: PosterChanges = {};
      for (const key of GROUP_FIELDS[group]) {
        next[key] = (poster[key] as string | null | undefined) ?? "";
      }
      setDraft(next);
      setSaveError(null);
      setEditing(group);
    },
    [poster, saving],
  );

  const cancelEdit = useCallback(() => {
    if (saving) return;
    setEditing(null);
    setDraft({});
    setSaveError(null);
  }, [saving]);

  const commitEdit = useCallback(async () => {
    if (!poster || !editing || saving) return;

    // Send only the fields that actually changed.
    const changes: PosterChanges = {};
    for (const key of GROUP_FIELDS[editing]) {
      const before = ((poster[key] as string | null | undefined) ?? "").trim();
      const after = ((draft[key] as string | null | undefined) ?? "").trim();
      if (before !== after) {
        changes[key] = after;
      }
    }

    if (Object.keys(changes).length === 0) {
      setEditing(null);
      setDraft({});
      return;
    }

    setSaving(true);
    setSaveError(null);
    try {
      await onSave(poster.id, changes);
      if (!isMountedRef.current) return;
      //setPoster(updated);
      setEditing(null);
      setDraft({});
    } catch (error) {
      log(`Failed to save poster: ${createErrorLogMessage(error)}`);
      if (!isMountedRef.current) return;
      setSaveError(
        t("savePosterError", "Couldn't save your changes. Please try again.", {
          ns: "translation",
        }),
      );
    } finally {
      if (isMountedRef.current) setSaving(false);
    }
  }, [poster, editing, onSave, saving, draft, t]);

  const setDraftField = (key: keyof PosterEditableFields, value: string) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  // A single column prevents long translated labels and addresses from clipping.
  const singleColumn = width < 390;
  const sightingUrl = `https://spotapaw.com/sightings/${poster?.sighting_id}`;

  const saveLabel = t("save", "Save", { ns: "translation" });
  const cancelLabel = t("cancel", "Cancel", { ns: "translation" });
  const editLabel = (what: string) =>
    t("editField", "Edit {{field}}", { ns: "translation", field: what });

  const descriptionPlaceholder = t(
    "addDescription",
    "Add a description",
    { ns: "translation" },
  );
  const ctaPlaceholder = t("addCta", "Add a call to action", {
    ns: "translation",
  });
  const contactNamePlaceholder = t("addContactName", "Contact name", {
    ns: "translation",
  });
  const contactPhonePlaceholder = t("addContactPhone", "Phone number", {
    ns: "translation",
  });

  const controls = (
    <EditControls
      saving={saving}
      error={saveError}
      onSave={commitEdit}
      onCancel={cancelEdit}
      saveLabel={saveLabel}
      cancelLabel={cancelLabel}
    />
  );

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
        keyboardShouldPersistTaps="handled"
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

                {/* Description */}
                {editing === "description" ? (
                  <View>
                    <TextInput
                      value={(draft.description as string) ?? ""}
                      onChangeText={(v) => setDraftField("description", v)}
                      placeholder={descriptionPlaceholder}
                      placeholderTextColor="#999"
                      multiline
                      autoFocus
                      editable={!saving}
                      style={[styles.input, styles.descriptionInput]}
                      accessibilityLabel={editLabel(
                        t("description", "description", { ns: "translation" }),
                      )}
                    />
                    {controls}
                  </View>
                ) : (
                  <View style={styles.editableRow}>
                    <Text
                      style={[
                        styles.description,
                        styles.editableText,
                        !poster.description && styles.placeholderText,
                      ]}
                    >
                      {poster.description ||
                        (canEdit ? descriptionPlaceholder : "")}
                    </Text>
                    {canEdit && (
                      <EditButton
                        label={editLabel(
                          t("description", "description", {
                            ns: "translation",
                          }),
                        )}
                        onPress={() => startEdit("description")}
                      />
                    )}
                  </View>
                )}
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

              {/* CTA */}
              {editing === "cta" ? (
                <View style={styles.reward}>
                  <TextInput
                    value={(draft.cta as string) ?? ""}
                    onChangeText={(v) => setDraftField("cta", v)}
                    placeholder={ctaPlaceholder}
                    placeholderTextColor="#b58b4c"
                    multiline
                    autoFocus
                    editable={!saving}
                    style={[styles.input, styles.ctaInput]}
                    accessibilityLabel={editLabel(
                      t("cta", "call to action", { ns: "translation" }),
                    )}
                  />
                  {controls}
                </View>
              ) : (!!poster.cta || canEdit) ? (
                <View style={styles.reward}>
                  <View style={styles.editableRow}>
                    <Text
                      style={[
                        styles.rewardText,
                        styles.editableText,
                        !poster.cta && styles.placeholderText,
                      ]}
                    >
                      {poster.cta || ctaPlaceholder}
                    </Text>
                    {canEdit && (
                      <EditButton
                        light
                        label={editLabel(
                          t("cta", "call to action", { ns: "translation" }),
                        )}
                        onPress={() => startEdit("cta")}
                      />
                    )}
                  </View>
                </View>
              ) : null}

              {/* Contact */}
              {editing === "contact" ? (
                <View style={styles.contactEdit}>
                  <TextInput
                    value={(draft.contact_name as string) ?? ""}
                    onChangeText={(v) => setDraftField("contact_name", v)}
                    placeholder={contactNamePlaceholder}
                    placeholderTextColor="#999"
                    autoFocus
                    editable={!saving}
                    autoCapitalize="words"
                    style={styles.input}
                    accessibilityLabel={contactNamePlaceholder}
                  />
                  <TextInput
                    value={(draft.contact_phone as string) ?? ""}
                    onChangeText={(v) => setDraftField("contact_phone", v)}
                    placeholder={contactPhonePlaceholder}
                    placeholderTextColor="#999"
                    editable={!saving}
                    keyboardType="phone-pad"
                    style={styles.input}
                    accessibilityLabel={contactPhonePlaceholder}
                  />
                  {controls}
                </View>
              ) : (
                <View style={styles.contact}>
                  {!!poster.contact_name && (
                    <Text style={styles.contactText}>
                      {poster.contact_name}
                    </Text>
                  )}
                  {!!poster.contact_phone && (
                    <View style={styles.phoneRow}>
                      <Icon source="phone" size={18} color="#555" />
                      <Text style={styles.contactText}>
                        {poster.contact_phone}
                      </Text>
                    </View>
                  )}
                  {canEdit && !poster.contact_name && !poster.contact_phone && (
                    <Text style={[styles.contactText, styles.placeholderText]}>
                      {t("addContact", "Add contact info", {
                        ns: "translation",
                      })}
                    </Text>
                  )}
                  {canEdit && (
                    <EditButton
                      label={editLabel(
                        t("contact", "contact", { ns: "translation" }),
                      )}
                      onPress={() => startEdit("contact")}
                    />
                  )}
                </View>
              )}

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
    flexWrap: "wrap",
    justifyContent: "center",
  },
  contactEdit: {
    paddingHorizontal: 4,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    gap: 8,
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

  // --- Editing ---
  editableRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "center",
    gap: 8,
  },
  editableText: { flexShrink: 1 },
  placeholderText: { fontStyle: "italic", opacity: 0.6 },
  editButton: {
    padding: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#0F6E56",
    borderRadius: 6,
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    lineHeight: 20,
    color: "#222",
  },
  descriptionInput: { minHeight: 96, textAlignVertical: "top" },
  ctaInput: {
    minHeight: 56,
    textAlignVertical: "top",
    borderColor: "#EF9F27",
    fontWeight: "bold",
    color: "#854F0B",
  },
  editControlsWrap: { marginTop: 8, gap: 6 },
  editControls: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  controlButton: {
    minWidth: 84,
    minHeight: 36,
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButton: { backgroundColor: "#0F6E56" },
  saveText: { color: "#fff", fontSize: 14, fontWeight: "bold" },
  cancelButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  cancelText: { color: "#444", fontSize: 14 },
  errorText: { color: "#B3261E", fontSize: 13, lineHeight: 18 },
});