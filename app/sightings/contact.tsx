import HomePageHeader from "@/components/header/homepage-header";
import { supabase } from "@/components/supabase-client";
import { router } from "expo-router";
import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { Button, TextInput, Text, Snackbar } from "react-native-paper";

export default function SightingContact() {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [extra_info, setExtraInfo] = useState("");
  const { id } = useLocalSearchParams();

  async function saveSightingContact() {
    if (extra_info.trim()) {
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("sighting_contact").insert([
      {
        name,
        phone,
        sighting_id: id,
      },
    ]);
    if (error) {
      Alert.alert("Error saving sighting contact info. Please try again");
    }
    setLoading(false);
    router.navigate("/");
  }
  return (
    <View style={styles.container}>
      <HomePageHeader />
      <Text variant="bodyLarge" style={styles.title}>
        Would you like to be contacted by pet owner about this sighting?
      </Text>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <TextInput
          label="Phone Number"
          left={<TextInput.Icon icon="phone" />}
          onChangeText={(text) => setPhone(text)}
          value={phone}
          placeholder="555-555-5555"
          autoCapitalize={"none"}
          mode="outlined"
        />
      </View>
      <View style={styles.verticallySpaced}>
        <TextInput
          label="Name"
          left={<TextInput.Icon icon="account-box-outline" />}
          onChangeText={(text) => setName(text)}
          value={name}
          placeholder="First & Last Name"
          autoCapitalize={"none"}
          mode="outlined"
        />
      </View>

      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button
          mode="contained"
          disabled={loading}
          onPress={() => saveSightingContact()}
        >
          Save Contact
        </Button>
      </View>
      <View style={styles.secondary}>
        <Text>Do you want to create an account?</Text>
        <Button
          mode="text"
          disabled={loading}
          onPress={() => router.push("/(auth)/signup")}
        >
          Register
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    textAlign: "center",
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: "stretch",
  },
  mt20: {
    marginTop: 20,
  },
  container: {
    flex: 1,
    paddingTop: 80,
    paddingHorizontal: 24,
    alignItems: "center",
    backgroundColor: "#fff",
    minHeight: "100%",
  },
  logo: {
    width: "100%",
    //height: 100,
    marginBottom: 40,
    marginTop: 40,
    resizeMode: "contain",
  },
  button: {
    width: "100%",
    marginBottom: 16,
  },
  secondary: {
    flex: 1,
    flexDirection: "row",
    alignItems: "baseline",
    paddingTop: 4,
    paddingBottom: 4,
  },
});
