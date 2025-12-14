import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Text, Card } from 'react-native-paper';

export default function TermsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text variant="headlineMedium" style={styles.title}>
        Terms of Service
      </Text>
      
      <Text variant="bodyMedium" style={styles.effectiveDate}>
        Effective Date: Oct 07, 2025
      </Text>

      <Text variant="bodyMedium" style={styles.intro}>
        Welcome to SpotAPaw ("we," "our," or "us"). These Terms of Service ("Terms") govern your use of our mobile application ("App"). By downloading or using the App, you agree to be bound by these Terms.
      </Text>

      <Text variant="bodyMedium" style={styles.warning}>
        If you do not agree, please do not use the App.
      </Text>

      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            1. Use of the App
          </Text>
          
          <Text variant="bodyMedium" style={styles.sectionText}>
            You may use the App only for lawful purposes and in accordance with these Terms. The App is designed to help users report, view, and share pet sightings to assist in reuniting lost pets with their owners.
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            You agree not to:
          </Text>

          <Text variant="bodyMedium" style={styles.bulletPoint}>
            • Submit false, misleading, or harmful information.
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            • Upload inappropriate, offensive, or infringing content.
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            • Attempt to reverse-engineer, decompile, or otherwise interfere with the App's operation.
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            2. User Content
          </Text>
          
          <Text variant="bodyMedium" style={styles.sectionText}>
            You are responsible for the content you submit, including sighting photos, descriptions, and messages.
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            By submitting a sighting, you grant SpotAPaw a non-exclusive, worldwide, royalty-free license to display, distribute, and use that content within the App for the purpose of helping locate pets.
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            You retain ownership of your content.
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            We reserve the right to remove any content that violates these Terms or applicable law.
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            3. Privacy
          </Text>
          
          <Text variant="bodyMedium" style={styles.sectionText}>
            Your privacy is important to us. Please review our Privacy Policy, which explains how we collect, use, and protect your data.
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            By using the App, you consent to the collection and use of information as described in the Privacy Policy.
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            4. Location and Camera Access
          </Text>
          
          <Text variant="bodyMedium" style={styles.sectionText}>
            The App may request access to your device's camera and location to let you upload sighting photos and attach location data.
          </Text>

          <Text variant="bodyMedium" style={styles.bulletPoint}>
            • Location data is only used when you create a pet sighting report.
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            • Camera access is used only when you select or capture a photo to include in your report.
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            You can manage these permissions in your device settings.
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            5. Disclaimer of Warranties
          </Text>
          
          <Text variant="bodyMedium" style={styles.sectionText}>
            The App is provided "as is" and "as available."
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            We make no warranties or representations about the accuracy or reliability of user-submitted sightings or any other content.
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            We are not responsible for any loss, injury, or damage resulting from reliance on information provided through the App.
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            6. Limitation of Liability
          </Text>
          
          <Text variant="bodyMedium" style={styles.sectionText}>
            To the fullest extent permitted by law, SpotAPaw and its affiliates shall not be liable for any indirect, incidental, special, or consequential damages arising from your use or inability to use the App.
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            7. Termination
          </Text>
          
          <Text variant="bodyMedium" style={styles.sectionText}>
            We may suspend or terminate your access to the App at any time if you violate these Terms or engage in misuse.
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
            We may update these Terms periodically. If we make significant changes, we will notify you within the App or by updating the "Effective Date" above. Continued use of the App after changes means you accept the new Terms.
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            9. Governing Law
          </Text>
          
          <Text variant="bodyMedium" style={styles.sectionText}>
            These Terms are governed by and construed in accordance with the laws of United States of America, without regard to its conflict of law provisions.
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            10. Contact Us
          </Text>
          
          <Text variant="bodyMedium" style={styles.sectionText}>
            If you have questions about these Terms, please contact us at:{'\n'}
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
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  effectiveDate: {
    marginBottom: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  intro: {
    marginBottom: 16,
    lineHeight: 22,
  },
  warning: {
    marginBottom: 24,
    lineHeight: 22,
    fontWeight: 'bold',
    color: '#d32f2f',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
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
