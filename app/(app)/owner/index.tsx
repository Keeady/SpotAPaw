import HomePageHeader from "@/components/header/homepage-header";
import { AuthContext } from "@/components/Provider/auth-provider";
import { supabase } from "@/components/supabase-client";
import { router } from "expo-router";
import { useLocalSearchParams } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { showMessage } from "react-native-flash-message";
import { Button, TextInput, Text, Snackbar } from "react-native-paper";

export default function EditOwnerInfo() {
  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [extra_info, setExtraInfo] = useState("");
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (!user) {
      return;
    }
    setLoading(true);
    supabase
      .from("owner")
      .select("*")
      .eq("owner_id", user.id)
      .single()
      .then(({ data }) => {
        console.log(data)
        setLoading(false);
        setFirstName(data.firstname);
        setLastName(data.lastname)
        setPhone(data.phone)
      });
  }, [user?.id]);

  async function saveContact() {
    if (extra_info.trim() || !user) {
      return;
    }
    setLoading(true);
    const { error } = await supabase
      .from("owner")
      .update([
        {
          firstName,
          lastName,
          phone,
        },
      ])
      .eq("id", user.id);

    if (error) {
      console.log("error updating ", error);
      showMessage({
        message: "Error updating owner profile.",
        type: "warning",
        icon: "warning",
      });
    } else {
      showMessage({
        message: "Successfully updated owner profile.",
        type: "success",
        icon: "success",
      });
      router.replace(`/(app)/owner`);
    }
  }
  return (
    <View style={styles.container}>
      <Text variant="titleLarge">Update your Contact Info!</Text>
      <Text variant="bodyLarge" style={styles.title}>
        Help people reach out to find your furry friend
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
          onChangeText={(text) => setFirstName(text)}
          value={firstName}
          placeholder="First Name"
          autoCapitalize={"none"}
          mode="outlined"
        />
      </View>
      <View style={styles.verticallySpaced}>
        <TextInput
          label="Name"
          left={<TextInput.Icon icon="account-box-outline" />}
          onChangeText={(text) => setLastName(text)}
          value={lastName}
          placeholder="Last Name"
          autoCapitalize={"none"}
          mode="outlined"
        />
      </View>

      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button
          mode="contained"
          disabled={loading}
          onPress={() => saveContact()}
        >
          Save Contact
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
