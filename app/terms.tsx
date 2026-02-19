import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Text, Card } from "react-native-paper";

export default function TermsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text variant="headlineMedium" style={styles.title}>
        Terms of Service
      </Text>

      <Text variant="bodyMedium" style={styles.effectiveDate}>
        Effective Date: February 17, 2026
      </Text>

      <Text variant="bodyMedium" style={styles.intro}>
        Welcome to SpotAPaw (“we,” “our,” or “us”). These Terms of Service
        (“Terms”) govern your use of the SpotAPaw mobile application (the
        “App”).
      </Text>

      <Text variant="bodyMedium" style={styles.warning}>
        By downloading, accessing, or using the App, you agree to be bound by
        these Terms. If you do not agree, please do not use the App.
      </Text>

      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            1. Use of the App
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            You may use the App only for lawful purposes and in accordance with
            these Terms. The App is designed to help users report, view, and
            share pet sightings to assist in reuniting lost pets with their
            owners.{" "}
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            You agree not to:
          </Text>

          <Text variant="bodyMedium" style={styles.bulletPoint}>
            • Submit false, misleading, or harmful information.
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            • Upload inappropriate, offensive, illegal, or infringing content.
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            • Upload photos you do not have the right to share.
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            • Upload photos containing unrelated individuals or private personal
            information.
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            • Attempt to reverse-engineer, decompile, disrupt, or otherwise
            interfere with the App’s operation.
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            • Use the App to harm, harass, or impersonate others.
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            2. User Content
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            You are responsible for the content you submit, including:
          </Text>

          <Text variant="bodyMedium" style={styles.bulletPoint}>
            • Photos
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            • Descriptions
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            • Location information
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            • Any other information included in a pet sighting report
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            By submitting content, you grant SpotAPaw a non-exclusive,
            worldwide, royalty-free license to host, store, process, display,
            reproduce, and distribute that content within the App for the
            purpose of operating and improving the service.
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            You retain ownership of your content.
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            We reserve the right to remove any content that violates these Terms
            or applicable law.
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            3. AI Photo Analysis
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            The App includes an artificial intelligence (“AI”) feature that
            analyzes user-uploaded photos to help generate suggested pet
            descriptions.
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            By uploading a photo, you acknowledge and agree that:
          </Text>

          <Text variant="bodyMedium" style={styles.bulletPoint}>
            • Your photo may be processed by automated AI systems.
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            • AI-generated suggestions are provided for convenience only.
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            • AI outputs may be inaccurate, incomplete, or incorrect.
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            • You are solely responsible for reviewing and editing any
            AI-generated description before submitting your report.
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            • SpotAPaw does not guarantee the accuracy of AI-generated content
            and is not responsible for errors in AI analysis.
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            We use third-party AI services, including Google Gemini, to analyze
            uploaded images and generate suggested descriptions. By uploading a
            photo, you consent to this processing.
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            4. Privacy
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            Your privacy is important to us. Please review our Privacy Policy,
            which explains how we collect, use, store, and protect your
            information.
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            By using the App, you consent to the collection and use of your
            information, including automated processing of uploaded photos, as
            described in the Privacy Policy.
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            5. Location and Camera Access
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            The App may request access to:
          </Text>

          <Text variant="bodyMedium" style={styles.bulletPoint}>
            • Camera and Photos: Used only when you choose to upload or capture
            a photo for a sighting report.
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            • Location Data: Used only when you create a pet sighting report to
            attach relevant location information.
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            You can manage these permissions in the App or your device settings
            at any time.
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            6. Disclaimer of Warranties
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            The App is provided &#34;as is&#34; and &#34;as available&#34;.
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            We do not guarantee:
          </Text>

          <Text variant="bodyMedium" style={styles.bulletPoint}>
            • The accuracy of user-submitted sightings
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            • The accuracy of AI-generated descriptions.
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            • That reported pets will be located or reunited.
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            We are not responsible for any loss, injury, or damage resulting
            from reliance on information provided through the App.
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            To the fullest extent permitted by law, we disclaim all warranties,
            express or implied.
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            7. Limitation of Liability
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            To the fullest extent permitted by law, SpotAPaw and its affiliates
            shall not be liable for any indirect, incidental, special, or
            consequential or punitive damages arising from:
          </Text>

          <Text variant="bodyMedium" style={styles.bulletPoint}>
            • Your use of or inability to use the App.
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            • Reliance on AI-generated descriptions.
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            • Reliance on user-submitted information.
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            7. Termination
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            We may suspend or terminate your access to the App at any time if
            you violate these Terms or engage in misuse.
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            You may also stop using the App at any time.
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            8. Modifications
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            We may update these Terms periodically. If we make significant
            changes, we will notify you within the App or by updating the
            “Effective Date” above.
          </Text>
          <Text variant="bodyMedium" style={styles.sectionText}>
            Continued use of the App after changes means you accept the new Terms.
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            9. Governing Law
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            These Terms are governed by and construed in accordance with the
            laws of United States of America, without regard to its conflict of
            law provisions.
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            10. Contact Us
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            If you have questions about these Terms, please contact us at:{"\n"}
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
