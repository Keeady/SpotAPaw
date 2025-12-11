import { useConfirmDelete } from "@/components/account/delete";
import { AuthContext } from "@/components/Provider/auth-provider";
import { supabase } from "@/components/supabase-client";
import { isValidUuid } from "@/components/util";
import { Person } from "@/model/person";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useContext, useEffect, useRef, useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { showMessage } from "react-native-flash-message";
import { Button, Text, TextInput, useTheme } from "react-native-paper";

export default function OwnerList() {
  const theme = useTheme();
  const router = useRouter();

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
  const onConfirmDelete = useConfirmDelete();

  const [disableSubmitBtn, setDisableSubmitBtn] = useState(true);

  const { sightingId } = useLocalSearchParams<{ sightingId: string }>();

  useEffect(() => {
    if (user) {
      setEmail(user.email || "");
      if (user.user_metadata) {
        if (user.user_metadata["firstName"]) {
          setFirstName(user.user_metadata["firstName"])
        }

        if (user.user_metadata["lastName"]) {
          setLastName(user.user_metadata["lastName"])
        }

        if (user.user_metadata["phone"]) {
          setPhone(user.user_metadata["phone"])
        }
      }
    }
  }, [user]);

  useEffect(() => {
    if (
      (firstName && ownerInfo.current?.firstname !== firstName) ||
      (lastName && ownerInfo.current?.lastname !== lastName) ||
      (address && ownerInfo.current?.address !== address) ||
      (phone && ownerInfo.current?.phone !== phone) ||
      (email && ownerInfo.current?.email !== email)
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
        if (data && data.length > 0) {
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
    let result;
    if (id && isValidUuid(id)) {
      result = await supabase
        .from("owner")
        .update([
          {
            firstname: firstName,
            lastname: lastName,
            phone,
            address,
            email,
            id,
          },
        ])
        .eq("id", id)
        .select();
    } else {
      result = await supabase
        .from("owner")
        .insert([
          {
            firstname: firstName,
            lastname: lastName,
            phone,
            address,
            email,
          },
        ])
        .select();
    }

    const { error, data } = result;
    setLoading(false);

    if (error) {
      showMessage({
        message: "Error saving owner profile.",
        type: "warning",
        icon: "warning",
      });
    } else {
      if (data && !id) {
        setId(data[0].id);
      }
      showMessage({
        message: "Successfully saving owner profile.",
        type: "success",
        icon: "success",
      });

      if (sightingId) {
        router.replace(`/my-sightings`)
      }
    }
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Text style={styles.headerTitle}>Update your Contact Info!</Text>
        <Text style={styles.headerSubtitle}>
          Help people reach out to find your furry friend
        </Text>
      </View>
      <View style={styles.content}>
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

        {user && (
          <View style={[styles.verticallySpaced, styles.mt20]}>
            <Button
              mode="outlined"
              disabled={loading}
              onPress={async () => onConfirmDelete(user.id)}
              style={{ borderColor: "red" }}
            >
              Delete Account
            </Button>
          </View>
        )}

        <TextInput
          style={{ height: 0, opacity: 0 }}
          value={extra_info}
          onChangeText={setExtraInfo}
        />
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
    // paddingHorizontal: 24,
    // alignItems: "center",
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
  content: {
    paddingHorizontal: 24,
    alignItems: "center",
  },
  header: {
    backgroundColor: "#714ea9ff",
    paddingVertical: 16,
    paddingTop: Platform.OS === "ios" ? 50 : 16,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#BBDEFB",
    marginTop: 4,
  },
});
