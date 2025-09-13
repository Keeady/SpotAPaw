import { AuthContext } from "@/components/Provider/auth-provider";
import { supabase } from "@/components/supabase-client";
import React, { useContext, useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { showMessage } from "react-native-flash-message";
import { Button, Text, TextInput } from "react-native-paper";
import { Person } from "@/model/person";

export default function OwnerList() {
  const ownerInfo = useRef<Person>(undefined);
  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [extra_info, setExtraInfo] = useState("");
  const [id, setId] = useState("");
  const [email, setEmail] = useState("");
  const { user } = useContext(AuthContext);

  const [disableSubmitBtn, setDisableSubmitBtn] = useState(true);

  useEffect(() => {
    if (
      firstName && ownerInfo.current?.firstname !== firstName ||
      lastName && ownerInfo.current?.lastname !== lastName ||
      address && ownerInfo.current?.address !== address ||
      phone && ownerInfo.current?.phone !== phone ||
      email && ownerInfo.current?.email !== email
    ) {
      setDisableSubmitBtn(false);
    }
  }, [firstName, lastName, address, phone, email]);

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    setLoading(true);
    supabase
      .from("owner")
      .select("*")
      .eq("owner_id", user.id)
      .then(({ data }) => {
        if (data) {
          ownerInfo.current = data[0];
          setFirstName(data[0].firstname);
          setLastName(data[0].lastname);
          setPhone(data[0].phone);
          setAddress(data[0].address);
          setId(data[0].id);
          setEmail(data[0].email);
        }
      });
    setLoading(false);
  }, [user?.id]);

  async function createContact() {
    if (extra_info.trim() || !user) {
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("owner").upsert([
      {
        firstname: firstName,
        lastname: lastName,
        phone,
        address,
        email,
        id,
      },
    ]);

    if (error) {
      showMessage({
        message: "Error saving owner profile.",
        type: "warning",
        icon: "warning",
      });
    } else {
      showMessage({
        message: "Successfully saving owner profile.",
        type: "success",
        icon: "success",
      });
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
          label="Email"
          left={<TextInput.Icon icon="account-box-outline" />}
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="youremail@email.com"
          autoCapitalize={"none"}
          mode="outlined"
        />
      </View>
      <View style={styles.verticallySpaced}>
        <TextInput
          label="First Name"
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
          label="Last Name"
          left={<TextInput.Icon icon="account-box-outline" />}
          onChangeText={(text) => setLastName(text)}
          value={lastName}
          placeholder="Last Name"
          autoCapitalize={"none"}
          mode="outlined"
        />
      </View>
      <View style={styles.verticallySpaced}>
        <TextInput
          label="Address"
          left={<TextInput.Icon icon="account-box-outline" />}
          onChangeText={(text) => setAddress(text)}
          value={address}
          placeholder="Street, City"
          autoCapitalize={"none"}
          mode="outlined"
          multiline={true}
        />
      </View>

      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button
          mode="contained"
          disabled={loading || disableSubmitBtn}
          onPress={() => createContact()}
        >
          {id ? "Save Contact" : "Create Contact"}
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
    paddingTop: 10,
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
