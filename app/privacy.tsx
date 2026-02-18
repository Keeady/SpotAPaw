import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Text, Card } from "react-native-paper";

export default function PrivacyScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text variant="headlineMedium" style={styles.title}>
        Privacy Policy
      </Text>
      
      <Text variant="bodyMedium" style={styles.effectiveDate}>
        Effective Date: February 17, 2026
      </Text>

      <Text variant="bodyMedium" style={styles.intro}>
        SpotAPaw (“we,” “our,” or “us”) respects your privacy. This Privacy
        Policy explains how we collect, use, process, store, and protect your
        information when you use the SpotAPaw mobile application (the “App”).
      </Text>

      <Text variant="bodyMedium" style={styles.warning}>
        By using the App, you agree to the practices described in this Privacy
        Policy.
      </Text>

      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            1. Information We Collect
          </Text>
          
          <Text variant="bodyMedium" style={styles.sectionText}>
            We collect only the information necessary to operate the App.
          </Text>

          <Text variant="titleSmall" style={styles.subsectionTitle}>
            A- Pet Sighting Reports
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            When you submit a sighting report, we collect:
          </Text>

          <Text variant="bodyMedium" style={styles.bulletPoint}>
            • <Text style={styles.bold}>Photo:</Text>The image you choose to
            upload. We do not access or collect other photos from your device.
          </Text>

          <Text variant="bodyMedium" style={styles.bulletPoint}>
            • <Text style={styles.bold}>Location Data:</Text> Collected only at
            the time you submit a sighting report to identify where the pet was
            seen.
          </Text>

          <Text variant="bodyMedium" style={styles.bulletPoint}>
            • <Text style={styles.bold}>Pet Description & Report Details:</Text>{" "}
            Information you enter into the report form (such as breed, color,
            time, and other relevant details).
          </Text>

          <Text variant="titleSmall" style={styles.subsectionTitle}>
            B- AI Photo Processing (Google Gemini)
          </Text>
          <Text variant="bodyMedium" style={styles.sectionText}>
            When you upload a photo, the image is analyzed using artificial
            intelligence technology provided by Google Gemini (a service
            operated by Google).
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            This processing is used solely to generate suggested pet description
            details to assist you in completing your sighting report.
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            In connection with this feature:
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            Uploaded photos may be transmitted securely to Google for
            processing.
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            We use the paid commercial API version of Google Gemini.
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            Data processed through this API is not used by us to train public AI
            models.
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            We do not sell or license your photos to third parties.
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            AI-generated suggestions are provided for assistance only and must
            be reviewed by you before submission.
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            Google processes data in accordance with its applicable data
            protection and security commitments.
          </Text>

          <Text variant="titleSmall" style={styles.subsectionTitle}>
            C- Information We Do NOT Collect
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            We do not collect or store:
          </Text>

          <Text variant="bodyMedium" style={styles.bulletPoint}>
            • Continuous or background location data
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            • Access to your entire photo library
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            • Private messages or chat history (chat functionality has been
            removed)
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            • Biometric identifiers
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            2. How We Use Information
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            We use collected information to:
          </Text>

          <Text variant="bodyMedium" style={styles.bulletPoint}>
            • Create and display pet sighting reports to other users
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            • Enable AI-assisted description suggestions
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            • Improve the functionality and reliability of the App
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            • Maintain safety and prevent misuse
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            We do not:
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            Sell your personal information
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            Use your data for targeted advertising
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            Share your data with advertisers
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            3. How Information Is Shared
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            We may share:
          </Text>

          <Text variant="bodyMedium" style={styles.bulletPoint}>
            With Other App Users: Pet sighting information (photo, description,
            date and time, and location) is visible within the App to help
            reunite pets with owners.
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            With Service Providers: We may share limited information with
            trusted third-party service providers who help us operate the App,
            such as cloud hosting providers and artificial intelligence
            processing providers (including Google for Gemini AI services).
            These providers process data solely on our behalf and in accordance
            with contractual data protection obligations.
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            We do not share your personal data with unrelated third parties. We
            do not share your data with advertisers.
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            We may disclose information: To comply with legal obligations To
            protect the rights, safety, or property of SpotAPaw or others.
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            4. Data Retention
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            We retain data only as long as necessary to operate the App.
          </Text>

          <Text variant="bodyMedium" style={styles.bulletPoint}>
            • <Text style={styles.bold}>Sighting Reports:</Text> Stored until
            marked resolved, or deemed no longer relevant.
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            • <Text style={styles.bold}>Location data:</Text> Stored as part of
            the sighting report.
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            • <Text style={styles.bold}>Uploaded Photos:</Text> Stored as part
            of the sighting report.
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            • <Text style={styles.bold}>AI Processing Data:</Text> Images may be
            temporarily processed for AI analysis. Any temporary processing by
            service providers is governed by contractual safeguards.
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            We may retain limited information as required to comply with legal
            obligations or resolve disputes.
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            5. Permissions
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            The App requests the following permissions:
          </Text>

          <Text variant="bodyMedium" style={styles.bulletPoint}>
            • <Text style={styles.bold}>Camera & Photos:</Text> Used only when
            you choose to upload or capture a photo for a sighting report.
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            • <Text style={styles.bold}>Location:</Text> Used only at the time
            you create a sighting report.
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            You may manage these permissions in the App or your device settings
            at any time.
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            6. Security
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            We take reasonable measures to protect your data from unauthorized
            access, alteration, or disclosure. However, no method of
            transmission or storage is completely secure.
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            7. Children's Privacy
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            Our app is not directed to children under 13. We do not knowingly
            collect personal information from children under 13. If we learn
            that we have collected personal information from a child under 13,
            we will delete it.
          </Text>
        </Card.Content>
      </Card>
      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            8. Your Rights (U.S. Users)
          </Text>
          <Text variant="bodyMedium" style={styles.sectionText}>
            Depending on your state of residence, you may have rights to:
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            • Request access to personal information we hold about you
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            • Request deletion of your information
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            • Request correction of inaccurate information
          </Text>
          <Text variant="bodyMedium" style={styles.sectionText}>
            To exercise these rights, contact us at the email below.
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            8. Changes to this Policy
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            We may update this Privacy Policy from time to time. We will notify
            you of significant changes by updating the "Effective Date" at the
            top of this page.
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            9. Contact Us
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            If you have questions about this Privacy Policy, please contact us
            at:{"\n"}
            📧 spotapaw@gmail.com
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
