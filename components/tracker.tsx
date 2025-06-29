import * as React from "react";
import { ScrollView, View } from "react-native";
import {
  Avatar,
  Button,
  Card,
  Divider,
  IconButton,
  MD3Colors,
  Text,
  TextInput,
} from "react-native-paper";
import CreatePetProfile from "./pet-profile-create-form";
import CreateOwnerProfile from "./owner-profile-create-form";
import { useContext, useState } from "react";
import { supabase } from "./supabase-client";
import { AuthContext } from "./Provider/auth-provider";

const LeftContent = (props) => <Avatar.Icon {...props} icon="paw" />;

export default function LostPetTracker() {
  const [step, setStep] = useState(1);
  const [location, setLastSeenLocation] = React.useState("");
  const [time, setLastSeenTime] = React.useState("");
  const [loading, setLoading] = useState(false);
  const [profileInfo, setProfileInfo] = useState({});
  const auth = useContext(AuthContext);

  const handleValueChange = (fieldName: string, fieldValue: string) => {
    setProfileInfo((prev) => ({ ...prev, [fieldName]: fieldValue }));
  };
  const handleNext = () => setStep((prev) => prev + 1);
  const handleBack = () => setStep((prev) => prev - 1);
  async function handleSubmit() {
    console.log("submit", profileInfo);
    const user = auth.user;
    console.log("user", !!user);
    if (!user) throw new Error("No user on the session!");

    const { data, error } = await supabase.from("pets").insert([
      {
        name: profileInfo.name,
        species: profileInfo.species,
        breed: profileInfo.breed,
        age: profileInfo.age,
        gender: profileInfo.gender,
        colors: profileInfo.colors,
        features: profileInfo.features,
        photo: profileInfo.photo,
        owner_id: auth.user?.id,
      },
    ]).select();

    console.log("pet data", data);
    console.log("error", error)

    const { data: data2, error: error2 } = await supabase.from("owner").insert([
      {
        firstName: profileInfo.firstName,
        lastName: profileInfo.lastName,
        phone: profileInfo.phone,
        email: profileInfo.email,
        owner_id: auth.user?.id,
        address: profileInfo.address,
      },
    ]).select();
    console.log("owner data", data2);
  };

  return (
    <ScrollView>
      <Card>
        <Card.Title
          title="Pet Profile"
          subtitle="Provide your pet info to help locate your pet"
          left={LeftContent}
        />
        <Card.Content>
          {step === 1 && (
            <CreatePetProfile
              handleChange={handleValueChange}
              profileInfo={profileInfo}
            />
          )}
          {step === 2 && (
            <CreateOwnerProfile
              handleChange={handleValueChange}
              profileInfo={profileInfo}
            />
          )}

          {step === 3 && (
            <View style={{ marginVertical: 10 }}>
              <TextInput
                label={"Last Seen Location"}
                value={profileInfo.last_seen_location}
                onChangeText={(v) => handleValueChange("last_seen_location", v)}
                multiline
                placeholder="E.g., Elm Stree Park"
              />
              <TextInput
                label={"Last Seen Time"}
                value={profileInfo.last_seen_time}
                onChangeText={(v) => handleValueChange("last_seen_time", v)}
              />
            </View>
          )}
          <View>
            {step > 1 && (
              <Button mode="outlined" onPress={handleBack}>
                Back
              </Button>
            )}
            {step < 3 && (
              <Button mode="contained" onPress={handleNext}>
                Next
              </Button>
            )}
            {step === 3 && (
              <Button mode="contained" onPress={handleSubmit}>
                Submit
              </Button>
            )}
          </View>

          <Button mode="outlined" style={{ marginVertical: 10 }}>
            Generate Flyer
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}
