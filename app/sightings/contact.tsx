import { AuthContext } from "@/components/Provider/auth-provider";
import { supabase } from "@/components/supabase-client";
import { isValidUuid } from "@/components/util";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { showMessage } from "react-native-flash-message";
import { Button, Text, TextInput } from "react-native-paper";

export default function SightingContact() {
  const router = useRouter();
  const { user } = useContext(AuthContext);

  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [extra_info, setExtraInfo] = useState("");
  const { sightingId } = useLocalSearchParams<{ sightingId: string }>();
  const [disableBtn, setDisabledBtn] = useState(true);

  const sightingsRoute = user ? "my-sightings" : "sightings";

  useEffect(() => {
    if (name && phone) {
      setDisabledBtn(false);
    }
  }, [name, phone]);

  async function saveSightingContact() {
    if (extra_info.trim() || !isValidUuid(sightingId)) {
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("sighting_contact").insert([
      {
        name,
        phone,
        sighting_id: sightingId,
      },
    ]);

    if (error) {
      showMessage({
        message: "Error saving sighting contact info. Please try again.",
        type: "warning",
        icon: "warning",
      });
      setLoading(false);
      return;
    } else {
      showMessage({
        message: "Successfully saved contact.",
        type: "success",
        icon: "success",
      });
    }

    setLoading(false);

    router.dismissTo(`/${sightingsRoute}`);
  }
  return (
    <View style={styles.container}>
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
          textContentType="telephoneNumber"
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
          textContentType="name"
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
          disabled={loading || disableBtn}
          onPress={() => router.push("/(auth)/signup")}
        >
          Register
        </Button>
      </View>

      <TextInput
        style={{ height: 0, opacity: 0 }}
        value={extra_info}
        onChangeText={setExtraInfo}
      />
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
