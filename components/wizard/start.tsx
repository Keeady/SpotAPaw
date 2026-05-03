import { View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { WizardHeader } from "./wizard-header";
import { HelperText, Surface, Text, useTheme } from "react-native-paper";
import { useCallback, useEffect, useState } from "react";
import { SightingReportType, SightingWizardStepData } from "./wizard-interface";
import { useTranslation } from "react-i18next";

export function Step1({
  setReportType,
  loading,
  reportType,
  isValidData,
}: SightingWizardStepData) {
  const { t } = useTranslation("wizard");
  const theme = useTheme();
  const [selected, setSelected] = useState<SightingReportType | null>();
  const [hasErrors, setHasErrors] = useState(false);

  const onClickLostOwn = useCallback(() => {
    setReportType("lost_own");
    setSelected("lost_own");
  }, [setReportType]);

  const onClickFoundStray = useCallback(() => {
    setReportType("found_stray");
    setSelected("found_stray");
  }, [setReportType]);

  useEffect(() => {
    if (!isValidData) {
      setHasErrors(true);
    } else {
      setHasErrors(false);
    }
  }, [isValidData]);

  return (
    <View style={styles.container}>
      <WizardHeader
        title={t("reportALostPet", "Report a lost pet")}
        subTitle={t("thankYouForHelping", "Thank you for helping bring our lost friends home.")}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.cardContainer}>
          <HelperText
            type="error"
            visible={hasErrors && !reportType && !selected}
            style={styles.helperText}
            padding="none"
          >
            {t("pleaseSelectAnOption", "Please select an option!")}
          </HelperText>

          <Surface
            style={[
              styles.navigationCard,
              (selected === "lost_own" || reportType === "lost_own") && {
                backgroundColor: theme.colors.primaryContainer,
              },
            ]}
            elevation={1}
          >
            <TouchableOpacity
              disabled={loading}
              onPress={onClickLostOwn}
              style={[styles.navigationItem]}
              activeOpacity={0.7}
            >
              <View style={styles.steps}>
                <Text variant="bodyLarge">
                  {t("myPetIsLost", "My pet is lost")}
                </Text>
              </View>
            </TouchableOpacity>
          </Surface>
          <Surface
            style={[
              styles.navigationCard,
              (selected === "found_stray" || reportType === "found_stray") && {
                backgroundColor: theme.colors.primaryContainer,
              },
            ]}
            elevation={1}
          >
            <TouchableOpacity
              disabled={loading}
              onPress={onClickFoundStray}
              style={styles.navigationItem}
              activeOpacity={0.7}
            >
              <View style={styles.steps}>
                <Text variant="bodyLarge">
                  {t("iFoundALostPet", "I found a lost pet")}
                </Text>
              </View>
            </TouchableOpacity>
          </Surface>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 12,
    justifyContent: "center",
  },
  navigationCard: {
    borderRadius: 16,
    marginBottom: 10,
  },
  navigationItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  steps: {
    padding: 16,
  },
  cardContainer: {
    marginBottom: 30,
  },
  disabledCard: {
    opacity: 0.6,
  },
  helperText: {
    alignSelf: "flex-end",
    fontWeight: "bold",
  },
});
