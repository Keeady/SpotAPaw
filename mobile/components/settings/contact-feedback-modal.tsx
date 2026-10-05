import { useState } from "react";
import { View, StyleSheet } from "react-native";
import {
  Button,
  Modal,
  Portal,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import * as Sentry from "@sentry/react-native";
import { useTranslation } from "react-i18next";

interface ContactFeedbackModalProps {
  visible: boolean;
  onDismiss: () => void;
}

const ContactFeedbackModal = ({
  visible,
  onDismiss,
}: ContactFeedbackModalProps) => {
  const theme = useTheme();
  const { t } = useTranslation(["settings", "translation"]);

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
            <Text variant="headlineSmall">{t("thankyou", { ns: "translation"})}</Text>

            <Text variant="bodyMedium">{t("yourFeedback", { ns: "translation"})}</Text>

            <Button mode="contained" onPress={handleDismiss}>
              {t("done", { ns: "translation"})}
            </Button>
          </View>
        ) : (
          <>
            <Text variant="headlineSmall">{t("contactUs")}</Text>

            <Text variant="bodyMedium" style={styles.description}>
              {t("getInTouchWithUsDesc")}
            </Text>

            <TextInput
              label={t("name", { ns: "translation"})}
              value={name}
              onChangeText={(text) => setName(text)}
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label={t("email", { ns: "translation"})}
              value={email}
              onChangeText={(text) => setEmail(text)}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />

            <TextInput
              label={t("messageRequired", { ns: "translation"})}
              value={message}
              onChangeText={(text) => setMessage(text)}
              mode="outlined"
              multiline
              numberOfLines={5}
              style={styles.messageInput}
            />

            <View style={styles.actions}>
              <Button onPress={handleDismiss} disabled={submitting}>
                {t("cancel", { ns: "translation"})}
              </Button>

              <Button
                mode="contained"
                icon="send"
                onPress={handleSubmit}
                loading={submitting}
                disabled={submitting || !message.trim()}
              >
                {t("send", { ns: "translation"})}
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
