import { SUPPORT_EMAIL } from "@/components/constants";
import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Text, Card } from "react-native-paper";
import { useTranslation } from "react-i18next";

export default function PrivacyScreen() {
  const { t } = useTranslation("privacy");
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text variant="headlineMedium" style={styles.title}>
        {t("privacyPolicy")}
      </Text>

      <Text variant="bodyMedium" style={styles.effectiveDate}>
        {t("effectiveDate")}
      </Text>

      <Text variant="bodyMedium" style={styles.intro}>
        {t("intro")}
      </Text>

      <Text variant="bodyMedium" style={styles.warning}>
        {t("byUsing")}
      </Text>

      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {t("1InformationWeCollect")}
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            {t("weCollectOnly")}
          </Text>

          <Text variant="titleSmall" style={styles.subsectionTitle}>
            {t("aPetSightingReports")}
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            {t("whenYouSubmit")}
          </Text>

          <Text variant="bodyMedium" style={styles.bulletPoint}>
            • <Text style={styles.bold}>{t("photo")}</Text>
            {t("image")}
          </Text>

          <Text variant="bodyMedium" style={styles.bulletPoint}>
            • <Text style={styles.bold}>{t("locationData")}</Text>{" "}
            {t("collectedOnly")}
          </Text>

          <Text variant="bodyMedium" style={styles.bulletPoint}>
            •{" "}
            <Text style={styles.bold}>{t("petDescriptionReportDetails")}</Text>{" "}
            {t("informationYouEnter")}
          </Text>

          <Text variant="titleSmall" style={styles.subsectionTitle}>
            {t("bAiPhotoProcessingGoogleGemini")}
          </Text>
          <Text variant="bodyMedium" style={styles.sectionText}>
            {t("whenYouUpload")}
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            {t("thisProcessing")}
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            {t("inConnectionWithThisFeature")}
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            {t("uploadedPhotosMayBeTrans")}
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            {t("weUseThePaidCommercialApiVersionOfGoogleGemini")}
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            {t("dataProcessed")}
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            {t("weDoNotSellOrLicenseYourPhotosToThirdParties")}
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            {t("aigeneratedSuggestions")}
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            {t("googleProcessesData")}
          </Text>

          <Text variant="titleSmall" style={styles.subsectionTitle}>
            {t("cInformationWeDoNotCollect")}
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            {t("weDoNotCollectOrStore")}
          </Text>

          <Text variant="bodyMedium" style={styles.bulletPoint}>
            {t("continuousOrBackgroundLocationData")}
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            {t("accessToYourEntirePhotoLibrary")}
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            {t("privateMessagesOrChatHistory")}
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            {t("biometricIdentifiers")}
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {t("2HowWeUseInformation")}
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            {t("weUseCollectedInformationTo")}
          </Text>

          <Text variant="bodyMedium" style={styles.bulletPoint}>
            {t("createAndDisplayPetSightingReportsToOtherUsers")}
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            {t("enableAiassistedDescriptionSuggestions")}
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            {t("improveTheFunctionalityAndReliabilityOfTheApp")}
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            {t("maintainSafetyAndPreventMisuse")}
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            {t("weDoNot")}
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            {t("sellYourPersonalInformation")}
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            {t("useYourDataForTargetedAdvertising")}
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            {t("shareYourDataWithAdvertisers")}
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {t("3HowInformationIsShared")}
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            {t("weMayShare")}
          </Text>

          <Text variant="bodyMedium" style={styles.bulletPoint}>
            {t("withOtherAppUsers")}
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            {t("withServiceProviders")}
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            {t("weDoNotShareYourPersonal")}
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            {t("weMayDiscloseInformation")}
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {t("4DataRetention")}
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            {t("weRetainDataOnlyAsLongAsNecessaryToOperateTheApp")}
          </Text>

          <Text variant="bodyMedium" style={styles.bulletPoint}>
            • <Text style={styles.bold}>{t("sightingReports")}</Text>{" "}
            {t("storedUntilMarkedResolvedOrDeemedNoLongerRelevant")}
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            • <Text style={styles.bold}>{t("locationData2")}</Text>{" "}
            {t("storedAsPartOfTheSightingReport")}
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            • <Text style={styles.bold}>{t("uploadedPhotos")}</Text>{" "}
            {t("storedAsPartOfTheSightingReport2")}
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            • <Text style={styles.bold}>{t("aiProcessingData")}</Text>{" "}
            {t("imagesMayBeTemporarilyProcessed")}
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            {t("weMayRetainLimitedInformation")}
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {t("5Permissions", "5. Permissions")}
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            {t("theAppRequestsTheFollowingPermissions")}
          </Text>

          <Text variant="bodyMedium" style={styles.bulletPoint}>
            •{" "}
            <Text style={styles.bold}>
              {t("cameraPhotos", "Camera & Photos:")}
            </Text>{" "}
            {t("usedOnlyWhenYouChooseToUpload")}
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            • <Text style={styles.bold}>{t("location", "Location:")}</Text>{" "}
            {t("usedOnlyAtTheTimeYouCreateASightingReport")}
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            {t("youMayManageThesePermissions")}
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {t("6Security", "6. Security")}
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            {t("weTakeReasonableMeasures")}
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {t("7Children39sPrivacy", "7. Children&#39;s Privacy")}
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            {t("ourAppIsNotDirectedToChildrenUnder13")}
          </Text>
        </Card.Content>
      </Card>
      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {t("8YourRightsUsUsers")}
          </Text>
          <Text variant="bodyMedium" style={styles.sectionText}>
            {t("dependingOnYourStateOfResidenceYouMayHaveRightsTo")}
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            {t("requestAccessToPersonalInformationWeHoldAboutYou")}
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            {t("requestDeletionOfYourInformation")}
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            {t("requestCorrectionOfInaccurateInformation")}
          </Text>
          <Text variant="bodyMedium" style={styles.sectionText}>
            {t("toExerciseTheseRightsContactUsAtTheEmailBelow")}
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {t("8ChangesToThisPolicy")}
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            {t("weMayUpdateThisPrivacyPolicy")}
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {t("9ContactUs")}
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
    marginBottom: 24,
    lineHeight: 22,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: "bold",
    marginBottom: 12,
  },
  subsectionTitle: {
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 8,
  },
  sectionText: {
    marginBottom: 8,
    lineHeight: 20,
  },
  bulletPoint: {
    marginBottom: 4,
    lineHeight: 20,
  },
  bold: {
    fontWeight: "bold",
  },
  warning: {
    marginBottom: 24,
    lineHeight: 22,
    fontWeight: "bold",
    color: "#d32f2f",
  },
});
