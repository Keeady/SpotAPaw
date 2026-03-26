import { useRouter } from "expo-router";
import React from "react";
import { Linking, ScrollView, StyleSheet, View } from "react-native";
import { Card, Text } from "react-native-paper";

export default function TermsScreen() {
  const router = useRouter();
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text variant="headlineMedium" style={styles.title}>
        About SpotAPaw
      </Text>
      <Card mode="elevated" style={{ marginBottom: 16 }}>
        <Card.Content>
          <Text variant="bodyMedium" style={{ marginBottom: 8 }}>
            Lost your pet? Found a lost pet? SpotAPaw reunites pets with
            families faster — powered by AI.
          </Text>
          <Text variant="bodyMedium" style={{ marginBottom: 8 }}>
            SpotAPaw is a community-powered app that uses AI to automatically
            generate detailed pet descriptions from photos, so you can post a
            detailed lost or found pet report quickly.
          </Text>
          <View style={{ marginBottom: 8 }}>
            <Text variant="bodyMedium" style={styles.sectionText}>
              With SpotAPaw, you can:
            </Text>

            <Text variant="bodyMedium" style={styles.bulletPoint}>
              •{" "}
              <Text style={styles.bold}>🐾 AI-powered pet descriptions: </Text>{" "}
              Snap a photo and let our AI instantly describe breed, color,
              markings, and size — no guessing required.
            </Text>
            <Text variant="bodyMedium" style={styles.bulletPoint}>
              • <Text style={styles.bold}>📍 Real-time sighting: </Text>
              See lost pet reports and community sightings pinned to your
              neighborhood the moment they're posted.
            </Text>
            <Text variant="bodyMedium" style={styles.bulletPoint}>
              • <Text style={styles.bold}>🔔 Instant alerts: </Text>
              Get notified the second a pet matching your missing animal is
              spotted nearby.
            </Text>
            <Text variant="bodyMedium" style={styles.bulletPoint}>
              • <Text style={styles.bold}>👤 Smart pet profiles: </Text>
              Build a detailed profile once — photo, description, microchip, and
              contact info — ready to share in an emergency.
            </Text>
            <Text variant="bodyMedium" style={styles.bulletPoint}>
              • <Text style={styles.bold}>🤝 Community-driven network: </Text>
              Thousands of local pet lovers watching, sharing, and helping bring
              animals home.
            </Text>
            <Text variant="bodyMedium">
              When every minute counts, SpotAPaw gives your community the tools
              to act fast.
            </Text>
          </View>

          <Text variant="bodyMedium">
            Join our community today and help us create a safer world for our
            furry friends!
          </Text>
        </Card.Content>
      </Card>
      <Text variant="headlineMedium" style={styles.title}>
        Important Information
      </Text>
      <Card mode="elevated" style={{ marginBottom: 16 }}>
        <Card.Content>
          <Text variant="bodyMedium" style={{ marginBottom: 8 }}>
            Before using SpotAPaw, please review our policies:
          </Text>
          <Text variant="bodyMedium" style={{ marginBottom: 8 }}>
            <Text
              style={{ color: "#1976d2", textDecorationLine: "underline" }}
              onPress={() => router.navigate("/privacy")}
            >
              Privacy Policy
            </Text>
            {
              " - Learn how we protect your data and what information we collect"
            }
          </Text>
          <Text variant="bodyMedium">
            <Text
              style={{ color: "#1976d2", textDecorationLine: "underline" }}
              onPress={() => router.navigate("/terms")}
            >
              Terms of Service
            </Text>
            {" - Understand the rules and guidelines for using our app"}
          </Text>
        </Card.Content>
      </Card>
      <Card mode="elevated">
        <Card.Content>
          <Text variant="headlineMedium" style={styles.title}>
            Getting Started
          </Text>
          <Text variant="bodyMedium" style={{ marginBottom: 8 }}>
            Ready to reunite with your pet? Here's how to get started:
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            • <Text style={styles.bold}>Create an account: </Text> Sign up with
            your email or social media to start posting and receiving alerts.
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            • <Text style={styles.bold}>Build your pet's profile: </Text> Add a
            photo, description, and contact info to have everything ready in an
            emergency.
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            • <Text style={styles.bold}>Post a report: </Text> Lost or found a
            pet? Snap a photo, let our AI do the rest, and share it with your
            community in seconds.
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            • <Text style={styles.bold}>Stay connected: </Text> Enable
            notifications to get real-time updates on sightings and matches.
          </Text>
        </Card.Content>
      </Card>
      <Card mode="elevated" style={{ marginBottom: 16 }}>
        <Card.Content>
          <Text variant="headlineMedium" style={styles.title}>
            Contact Us
          </Text>
          <Text variant="bodyMedium" style={{ marginBottom: 8 }}>
            Have questions or feedback? We’d love to hear from you!
          </Text>
          <Text variant="bodyMedium">
            Email us at{" "}
            <Text
              style={{ color: "#1976d2", textDecorationLine: "underline" }}
              onPress={() => {
                const email = "spotapaw@gmail.com";
                const subject = "SpotAPaw App Inquiry";
                const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(
                  subject,
                )}`;
                Linking.openURL(mailtoUrl).catch((err) =>
                  console.error("Failed to open email client:", err),
                );
              }}
            >
              spotapaw@gmail.com
            </Text>
          </Text>
        </Card.Content>
      </Card>
      <Card mode="elevated" style={{ marginBottom: 16 }}>
        <Card.Content>
          <Text variant="headlineMedium" style={styles.title}>
            Data or Account Deletion
          </Text>
          <Text variant="bodyMedium" style={{ marginTop: 8 }}>
            To request deletion of your data or account:
          </Text>
          <Text variant="bodyMedium" style={{ marginTop: 8 }}>
            Send an email to{" "}
            <Text
              style={{ color: "#1976d2", textDecorationLine: "underline" }}
              onPress={() => {
                const email = "spotapaw@gmail.com";
                const subject = "DATA DELETION REQUEST";
                const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
                Linking.openURL(mailtoUrl).catch((err) =>
                  console.error("Failed to open email client:", err),
                );
              }}
            >
              spotapaw@gmail.com
            </Text>
          </Text>
          <Text variant="bodyMedium" style={{ marginTop: 8 }}>
            Please include the following information in your email:
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            • Subject: DATA DELETION REQUEST
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            • The email address associated with your SpotAPaw account
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            • A clear statement requesting deletion of your data or account
          </Text>
          <Text variant="bodyMedium" style={{ marginTop: 8 }}>
            We will process your request within 7 days and confirm once your
            data or account has been deleted.
          </Text>
        </Card.Content>
      </Card>
      <Card mode="elevated" style={{ marginBottom: 16 }}>
        <Card.Content>
          <Text variant="headlineMedium" style={styles.title}>
            Acknowledgments
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            Thank you <Text style={styles.bold}>Aubri Jonathan</Text> for his
            invaluable testing and feedback during the beta testing phase.
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            Thank you to everyone who provided feedback and suggestions to help
            us improve SpotAPaw.
          </Text>
          <Text variant="bodyMedium">
            Thank you for being part of the SpotAPaw community and helping pets
            find their way home! 🏠🐕🐱
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
  bold: {
    fontWeight: "bold",
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
