import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { List, Divider, Text } from "react-native-paper";

type SettingsRendererProps = {
  aboutSection: React.ReactNode;
  locationPermissionSetting: React.ReactNode;
  currentLocationSetting: React.ReactNode;
  locationResetSetting: React.ReactNode;
  notificationSetting: React.ReactNode;
  aiSetting: React.ReactNode;
  languageSetting: React.ReactNode;
  distanceSetting: React.ReactNode;
  privacySetting: React.ReactNode;
  termsSetting: React.ReactNode;
  accountSetting: React.ReactNode;
  versionText: string;
};

const SettingsRenderer = ({
  aboutSection,
  locationPermissionSetting,
  currentLocationSetting,
  locationResetSetting,
  notificationSetting,
  aiSetting,
  languageSetting,
  distanceSetting,
  privacySetting,
  termsSetting,
  accountSetting,
  versionText,
}: SettingsRendererProps) => {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* About Section */}
        {aboutSection}
        <Divider />

        {/* Location Settings Section */}
        <List.Section>
          <List.Subheader>Location</List.Subheader>
          {locationPermissionSetting}
          {currentLocationSetting}
          {locationResetSetting}
        </List.Section>
        <Divider />

        {/* Notifications Section (Future Feature) */}
        {notificationSetting}
        <Divider />

        {/* Preferences Section (Future Feature) */}
        <List.Section>
          <List.Subheader>Preferences</List.Subheader>
          {aiSetting}
          {languageSetting}
          {distanceSetting}
        </List.Section>

        <Divider />
        {/* Legal Section */}
        <List.Section>
          <List.Subheader>Legal</List.Subheader>

          {privacySetting}
          {termsSetting}
        </List.Section>

        {!!accountSetting && <Divider />}

        {accountSetting}

        <Divider />

        <View style={styles.footer}>
          <Text variant="bodySmall" style={styles.footerText}>
            Version {versionText}
          </Text>
          <Text variant="bodySmall">
            SpotAPaw &#169; {new Date().getFullYear()}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  footer: {
    padding: 20,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  footerText: {
    color: "#666",
  },
});

export default SettingsRenderer;
