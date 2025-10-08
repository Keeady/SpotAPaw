import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Text, Card } from 'react-native-paper';

export default function PrivacyScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text variant="headlineMedium" style={styles.title}>
        Privacy Policy
      </Text>
      
      <Text variant="bodyMedium" style={styles.effectiveDate}>
        Effective Date: Oct 07, 2025
      </Text>

      <Text variant="bodyMedium" style={styles.intro}>
        SpotAPaw ("we," "our," or "us") respects your privacy. This Privacy Policy explains how we collect, use, and protect your information when you use our mobile application ("App").
      </Text>

      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            1. Information We Collect
          </Text>
          
          <Text variant="bodyMedium" style={styles.sectionText}>
            We collect only the minimum information needed to provide our service:
          </Text>

          <Text variant="titleSmall" style={styles.subsectionTitle}>
            Pet Sighting Reports
          </Text>

          <Text variant="bodyMedium" style={styles.bulletPoint}>
            • <Text style={styles.bold}>Photo:</Text> Only the photo you select to include in a sighting report is uploaded and stored. We do not access or store other photos from your device.
          </Text>

          <Text variant="bodyMedium" style={styles.bulletPoint}>
            • <Text style={styles.bold}>Location:</Text> Your device location is collected only when you submit a sighting report, to help identify where a pet was last seen.
          </Text>

          <Text variant="bodyMedium" style={styles.bulletPoint}>
            • <Text style={styles.bold}>Chat Input:</Text> When you describe a sighting in the chat, we may extract structured sighting details (e.g., pet description, location, time). The chat conversation itself is not saved.
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            We do not collect or store:
          </Text>

          <Text variant="bodyMedium" style={styles.bulletPoint}>
            • Your entire chat history
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            • Continuous location data
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            • Unused camera or photo data
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            2. How We Use Information
          </Text>
          
          <Text variant="bodyMedium" style={styles.sectionText}>
            The information we collect is used exclusively to:
          </Text>

          <Text variant="bodyMedium" style={styles.bulletPoint}>
            • Create and display pet sighting reports for other users
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            • Improve the accuracy of pet sightings
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            We do not use your information for targeted advertising or sell it to third parties.
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            3. Data Sharing
          </Text>
          
          <Text variant="bodyMedium" style={styles.sectionText}>
            We may share pet sighting reports (photo, location, description) with other users of the app to support reuniting pets with their owners.
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            We do not share your personal data with advertisers or unrelated third parties.
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            4. Data Retention
          </Text>
          
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            • <Text style={styles.bold}>Sightings:</Text> Stored until they are no longer relevant (e.g., after a set period or when marked resolved).
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            • <Text style={styles.bold}>Chat history:</Text> Not stored.
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            • <Text style={styles.bold}>Location data:</Text> Only stored as part of the sighting report.
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
            • <Text style={styles.bold}>Camera & Photos:</Text> To let you select a photo for your sighting report.
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            • <Text style={styles.bold}>Location:</Text> To attach a location to the sighting you report.
          </Text>

          <Text variant="bodyMedium" style={styles.sectionText}>
            You may manage these permissions in your device settings.
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            6. Security
          </Text>
          
          <Text variant="bodyMedium" style={styles.sectionText}>
            We take reasonable measures to protect your data from unauthorized access, alteration, or disclosure. However, no method of transmission or storage is completely secure.
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            7. Children's Privacy
          </Text>
          
          <Text variant="bodyMedium" style={styles.sectionText}>
            Our app is not directed to children under 13. If we learn that we have collected personal information from a child under 13, we will delete it.
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            8. Changes to this Policy
          </Text>
          
          <Text variant="bodyMedium" style={styles.sectionText}>
            We may update this Privacy Policy from time to time. We will notify you of significant changes by updating the "Effective Date" at the top of this page.
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            9. Contact Us
          </Text>
          
          <Text variant="bodyMedium" style={styles.sectionText}>
            If you have questions about this Privacy Policy, please contact us at:{'\n'}
            spotapaw_dev@gmail.com
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
    marginBottom: 24,
    lineHeight: 22,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subsectionTitle: {
    fontWeight: 'bold',
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
    fontWeight: 'bold',
  },
});