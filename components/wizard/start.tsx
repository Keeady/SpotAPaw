import { View, StyleSheet, TouchableOpacity } from "react-native";
import { SightingReportType, SightingWizardStepData } from "./wizard-form";
import { WizardHeader } from "./wizard-header";
import { HelperText, Surface, Text, useTheme } from "react-native-paper";
import { useCallback, useEffect, useState } from "react";

export function Step1({ setReportType, loading, reportType,isValidData }: SightingWizardStepData) {
  const theme = useTheme();
  const [selected, setSelected] = useState<SightingReportType | null>();
  const [hasErrors, setHasErrors] = useState(false);

  const onClickLostOwn = useCallback(() => {
    setReportType("lost_own");
    setSelected("lost_own");
  }, []);

  const onClickFoundStray = useCallback(() => {
    setReportType("found_stray");
    setSelected("found_stray");
  }, []);

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
        title="Report a lost pet"
        subTitle="Thank you for helping bring our lost friends home."
      />
      <View style={styles.content}>
        <View style={styles.cardContainer}>
          <HelperText
            type="error"
            visible={hasErrors && !reportType && !selected}
            style={styles.helperText}
            padding="none"
          >
            Please select an option!
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
                <Text variant="bodyLarge">My pet is lost</Text>
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
                <Text variant="bodyLarge">I found a lost pet</Text>
              </View>
            </TouchableOpacity>
          </Surface>
        </View>
      </View>
    </View>
  );
}

/***
 *         {/*
 */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    justifyContent: "center",
    padding: 24,
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

  title: {
    fontSize: 22,
    marginBottom: 20,
    textAlign: "center",
  },
  cardContainer: {
    marginBottom: 30,
  },
  disabledCard: {
    opacity: 0.6,
  },
    helperText: {
    alignSelf: "flex-end",
  },
});
