import { StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { HelperText, Surface, Text, useTheme } from "react-native-paper";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { SightingReportType } from "../../wizard/wizard-interface";
import type { WizardScreenProps } from "../wizard-types";

export function StartStep({
  formData,
  loading,
  onComplete,
  registerSubmit,
}: WizardScreenProps) {
  const { t } = useTranslation("wizard");
  const theme = useTheme();
  const [selected, setSelected] = useState<SightingReportType | undefined>(
    formData.reportType,
  );
  const [hasErrors, setHasErrors] = useState(false);

  // This screen's own onComplete: validate, then hand off to the base one.
  const handleComplete = useCallback(async () => {
    if (!selected) {
      setHasErrors(true);
      return;
    }
    setHasErrors(false);
    await onComplete({ reportType: selected });
  }, [selected, onComplete]);

  useEffect(() => {
    registerSubmit(handleComplete);
    return () => registerSubmit(null);
  }, [handleComplete, registerSubmit]);

  const options: { type: SightingReportType; label: string }[] = [
    { type: "lost_own", label: t("myPetIsLost", "My pet is lost") },
    { type: "found_stray", label: t("iFoundALostPet", "I found a lost pet") },
  ];

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <HelperText
        type="error"
        visible={hasErrors && !selected}
        style={styles.helperText}
        padding="none"
      >
        {t("pleaseSelectAnOption", "Please select an option!")}
      </HelperText>

      {options.map(({ type, label }) => (
        <Surface
          key={type}
          style={[
            styles.card,
            selected === type && {
              backgroundColor: theme.colors.primaryContainer,
            },
          ]}
          elevation={1}
        >
          <TouchableOpacity
            disabled={loading}
            onPress={() => {
              setSelected(type);
              setHasErrors(false);
            }}
            style={styles.item}
            activeOpacity={0.7}
          >
            <Text variant="bodyLarge">{label}</Text>
          </TouchableOpacity>
        </Surface>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 12, justifyContent: "center" },
  card: { borderRadius: 16, marginBottom: 10 },
  item: { padding: 32 },
  helperText: { alignSelf: "flex-end", fontWeight: "bold" },
});