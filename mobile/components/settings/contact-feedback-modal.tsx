import { useState } from "react";
import { View, StyleSheet } from "react-native";
import {
  Button,
  HelperText,
  Modal,
  Portal,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import * as Sentry from "@sentry/react-native";

interface ContactFeedbackModalProps {
  visible: boolean;
  onDismiss: () => void;
}

const ContactFeedbackModal = ({
  visible,
  onDismiss,
}: ContactFeedbackModalProps) => {
  const theme = useTheme();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) return;

    try {
      setSubmitting(true);

      Sentry.captureFeedback({
        name: name.trim() || undefined,
        email: email.trim() || undefined,
        message: message.trim(),
      });

      setSubmitted(true);
      setMessage("");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDismiss = () => {
    setSubmitted(false);
    onDismiss();
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={handleDismiss}
        contentContainerStyle={[
          styles.modal,
          { backgroundColor: theme.colors.surface },
        ]}
      >
        {submitted ? (
          <View style={styles.success}>
            <Text variant="headlineSmall">Thank you!</Text>

            <Text variant="bodyMedium">Your feedback has been sent.</Text>

            <Button mode="contained" onPress={handleDismiss}>
              Done
            </Button>
          </View>
        ) : (
          <>
            <Text variant="headlineSmall">Contact Us</Text>

            <Text variant="bodyMedium" style={styles.description}>
              Have a question, suggestion, or found a problem? We'd love to hear
              from you.
            </Text>

            <TextInput
              label="Name"
              value={name}
              onChangeText={setName}
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />

            <TextInput
              label="Message (Required)"
              value={message}
              onChangeText={setMessage}
              mode="outlined"
              multiline
              numberOfLines={5}
              style={styles.messageInput}
            />

            <View style={styles.actions}>
              <Button onPress={handleDismiss} disabled={submitting}>
                Cancel
              </Button>

              <Button
                mode="contained"
                icon="send"
                onPress={handleSubmit}
                loading={submitting}
                disabled={submitting || !message.trim()}
              >
                Send
              </Button>
            </View>
          </>
        )}
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 24,
    padding: 24,
    borderRadius: 16,
  },

  description: {
    marginTop: 8,
    marginBottom: 20,
  },

  input: {
    marginBottom: 12,
  },

  messageInput: {
    minHeight: 120,
  },

  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 12,
  },

  success: {
    gap: 16,
  },
});

export default ContactFeedbackModal;
