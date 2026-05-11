import { SUPPORT_EMAIL } from "@/components/constants";
import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Text, Card } from "react-native-paper";
import { useTranslation } from "react-i18next";

export default function TermsScreen() {
  const { t } = useTranslation("terms");
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text variant="headlineMedium" style={styles.title}>
        {t("termsOfService")}
      </Text>

      <Text variant="bodyMedium" style={styles.effectiveDate}>
        {t("effectiveDateFebruary172026")}
      </Text>

      <Text variant="bodyMedium" style={styles.intro}>
        {t("welcomeToSpotapaw")}
      </Text>

      <Text variant="bodyMedium" style={styles.warning}>
        {t("byDownloading")}
      </Text>

      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {t("1UseOfTheApp")}
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            {t("youMayUseTheApp")}
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            {t("youAgreeNotTo")}
          </Text>

          <Text variant="bodyMedium" style={styles.bulletPoint}>
            {t("submitFalseMisleading")}
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            {t("uploadInappropriate")}
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            {t("uploadPhotosYou")}
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            {t("uploadPhotosContaining")}
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            {t("attemptToReverseengineer")}
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            {t("useTheAppToHarmHarassOrImpersonateOthers")}
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {t("2UserContent")}
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            {t("youAreResponsibleFor")}
          </Text>

          <Text variant="bodyMedium" style={styles.bulletPoint}>
            {t("photos")}
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            {t("descriptions")}
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            {t("locationInformation")}
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            {t("anyOtherInformation")}
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            {t("bySubmitting")}
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            {t("youRetainOwnershipOfYourContent")}
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            {t("weReserveTheRight")}
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {t("3AiPhotoAnalysis")}
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            {t("theAppIncludesAn")}
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            {t("byUploadingAPhotoYouAcknowledgeAndAgreeThat")}
          </Text>

          <Text variant="bodyMedium" style={styles.bulletPoint}>
            {t("yourPhotoMayBeProcessedByAutomatedAiSystems")}
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            {t("aigeneratedSuggestionsAreProvidedForConvenienceOnly")}
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            {t("aiOutputsMayBeInaccurateIncompleteOrIncorrect")}
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            {t("youAreSolelyResponsible")}
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            {t("spotapawDoesNotGuarantee")}
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            {t("weUseThirdpartyAi")}
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {t("4Privacy")}
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            {t("yourPrivacyIsImportant")}
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            {t("byUsingTheAppYouConsenta")}
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {t("5LocationAndCameraAccess")}
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            {t("theAppMayRequestAccessTo")}
          </Text>

          <Text variant="bodyMedium" style={styles.bulletPoint}>
            {t("cameraAndPhotosUsedOnly")}
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            {t("locationDataUsedOnly")}
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            {t("youCanManageThesePermissions")}
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {t("6DisclaimerOfWarranties")}
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            {t("theAppIsProvidedAsIs")}
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            {t("weDoNotGuarantee")}
          </Text>

          <Text variant="bodyMedium" style={styles.bulletPoint}>
            {t("theAccuracyOfUsersubmittedSightings")}
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            {t("theAccuracyOfAigeneratedDescriptions")}
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            {t("thatReportedPetsWillBeLocatedOrReunited")}
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            {t("weAreNotResponsibleForAny")}
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            {t("toTheFullestExtentPermitted")}
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {t("7LimitationOfLiability")}
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            {t("toTheFullestExtent")}
          </Text>

          <Text variant="bodyMedium" style={styles.bulletPoint}>
            {t("yourUseOfOrInabilityToUseTheApp")}
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            {t("relianceOnAigeneratedDescriptions")}
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            {t("relianceOnUsersubmittedInformation")}
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {t("7Termination")}
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            {t("weMaySuspendOrTerminate")}
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            {t("youMayAlsoStopUsingTheAppAtAnyTime")}
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {t("8Modifications")}
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            {t("weMayUpdateTheseTermsPeriodically")}
          </Text>
          <Text variant="bodyMedium" style={styles.sectionText}>
            {t("continuedUseOfTheApp")}
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {t("9GoverningLaw")}
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            {t("theseTermsAreGovernedBy")}
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {t("10ContactUs")}
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            {t("ifYouHaveQuestionsAbout")}
            {"\n"}
            {t("support_email", { SUPPORT_EMAIL })}
          </Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  effectiveDate: {
    marginBottom: 16,
    textAlign: "center",
    fontStyle: "italic",
  },
  intro: {
    marginBottom: 16,
    lineHeight: 22,
  },
  warning: {
    marginBottom: 24,
    lineHeight: 22,
    fontWeight: "bold",
    color: "#d32f2f",
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: "bold",
    marginBottom: 12,
  },
  sectionText: {
    marginBottom: 8,
    lineHeight: 20,
  },
  bulletPoint: {
    marginBottom: 4,
    lineHeight: 20,
  },
});
