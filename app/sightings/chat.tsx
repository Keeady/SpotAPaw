import React, { useCallback, useEffect, useState } from "react";
import { GiftedChat, IMessage } from "react-native-gifted-chat";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { View, StyleSheet } from "react-native";
import { Avatar, IconButton, Text } from "react-native-paper";
import { PetSightingFromChat } from "@/model/sighting";
import {
  getPrompt,
  sendSignalToGemini,
} from "@/components/chat/handle-sighting-report-chat";
import { pickImage } from "@/components/image-picker";
import useUploadPetImageUrl from "@/components/image-upload";
import { supabase } from "@/components/supabase-client";
import * as chrono from "chrono-node";
import AppConstants from "@/components/constants";
import { useRouter } from "expo-router";
import {
  getCurrentUserLocationV3,
  SightingLocation,
} from "@/components/get-current-location";

export default function Chat() {
  const router = useRouter();
  const offenseCounter = React.useRef(0);
  const botUser = {
    _id: 2,
    name: "Bot",
    avatar: () => <Avatar.Icon size={24} icon="robot-excited-outline" />,
  };

  const pawPatrolUser = {
    _id: 3,
    name: "Paw Patrol",
    avatar: () => <Avatar.Icon size={24} icon="paw" color="#f16508ff" />,
  };

  const [messages, setMessages] = useState<IMessage[]>([
    {
      _id: 1,
      text: "👋 Hi! I can help you report a pet sighting. What kind of pet did you see?",
      createdAt: new Date(),
      user: pawPatrolUser,
    },
  ]);

  const [sighting, setSighting] = useState<PetSightingFromChat>({
    species: "",
    colors: "",
    features: "",
    photo: "",
    notes: "",
    time: "",
    location: "",
    gender: "",
    breed: "",
  });
  const [botLastReply, setBotLastReply] = useState("");
  const [isChatComplete, setIsChatComplete] = useState(false);
  const [isChatFlagged, setIsChatFlagged] = useState(false);
  const [photoUrl, setPhotoUrl] = useState("");
  const [location, setLocation] = useState<SightingLocation | undefined>();
  const [showLocationRequest, setShowLocationRequest] =
    useState<Boolean>(false);

  // Initialize the Google Generative AI client
  const genAI = new GoogleGenerativeAI(AppConstants.EXPO_GEN_AI_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const uploadImage = useUploadPetImageUrl();
  const handleSend = useCallback(
    async (newMessages: IMessage[] = []) => {
      setMessages((prev) => GiftedChat.append(prev, newMessages));
      let prompt = getPrompt(
        JSON.stringify(sighting) || "",
        newMessages[0]?.text || "",
        botLastReply || "",
        offenseCounter.current
      );

      await sendSignalToGemini(
        pawPatrolUser,
        botUser,
        model,
        prompt,
        setMessages,
        setSighting,
        setBotLastReply,
        setIsChatComplete,
        setIsChatFlagged,
        setShowLocationRequest
      );

      console.log("sighting", sighting);
    },
    [botLastReply, model, sighting, botUser, pawPatrolUser]
  );

  useEffect(() => {
    getCurrentUserLocationV3()
    .then(location => {
      setLocation(location);
      console.log(location)
    })
  }, []);

  const onComplete = useCallback(() => {
    // Convert time to ISO 8601 format if possible
    let lastSeenTime = sighting.time;
    if (lastSeenTime) {
      try {
        const convertedDateTime = chrono.parseDate(lastSeenTime, new Date(), {
          forwardDate: false,
        });
        lastSeenTime =
          convertedDateTime?.toISOString() || new Date().toISOString();
      } catch {
        lastSeenTime = new Date().toISOString();
      }
    }

    let petPhoto = sighting.photo;
    if (sighting.photo === "none") {
      petPhoto = ""; // No photo provided
    }

    const updatedSighting = {
      ...sighting,
      time: lastSeenTime || new Date().toISOString(),
      photo: petPhoto,
    };

    // Upload image if exists and then save sighting
    if (photoUrl) {
      uploadImage(photoUrl, (url) => {
        saveSightingInfo(updatedSighting, url);
      });
    } else {
      saveSightingInfo(updatedSighting);
    }

    router.navigate("/");
  }, [photoUrl, sighting, uploadImage]);

  useEffect(() => {
    if (isChatComplete) {
      onComplete();
    }
  }, [isChatComplete]);

  const saveSightingInfo = async (
    sighting: PetSightingFromChat,
    url?: string
  ) => {
    const finalSighting = {
      colors: sighting.colors === "uknown" ? "" : sighting.colors,
      features: sighting.features === "uknown" ? "" : sighting.features,
      note: sighting.notes === "unknown" ? "" : sighting.notes,
      species: sighting.species === "unknown" ? "" : sighting.species,
      last_seen_time: sighting.time,
      last_seen_location: sighting.location,
      last_seen_lat: location?.lat,
      last_seen_long: location?.lng,
      photo: url || "",
      name: sighting.name === "uknown" ? "" : sighting.name,
      breed: sighting.breed === "uknown" ? "" : sighting.breed,
      gender: sighting.gender === "uknown" ? "" : sighting.gender,
    };
    // Save the final sighting data here
    const { error } = await supabase.from("sightings").insert([finalSighting]);
    if (error) {
      console.error("Error saving sighting:", error);
    } else {
      console.log("Sighting saved successfully!");
    }
  };

  const askForPhoto = async () => {
    const photoUploaded = await pickImage(setPhotoUrl);
    if (!!photoUploaded) {
      setSighting((prev) => ({ ...prev, photo: "true" }));
      setMessages((prev) =>
        GiftedChat.append(prev, [
          {
            _id: Math.random().toString(),
            text: "✅ Photo uploaded! Thanks! ❤️",
            createdAt: new Date(),
            user: pawPatrolUser,
          },
        ])
      );
      setBotLastReply("Photo uploaded, thanks!");
    }
  };

  const askForLocation = async () => {
    getCurrentUserLocationV3().then((location) => {

      setLocation(location);
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.title}>
        <Text variant="titleLarge">Chat with us!</Text>
        <Text variant="titleSmall">
          Help find and protect our furry friends
        </Text>
      </View>
      <GiftedChat
        messages={messages}
        onSend={handleSend}
        user={{
          _id: 1,
          avatar: () => <Avatar.Icon size={24} icon="account" />,
        }}
        disableComposer={isChatComplete || isChatFlagged}
        placeholder={
          isChatFlagged
            ? "Chat Unavailable!"
            : isChatComplete
            ? "Chat complete!"
            : "Type your message..."
        }
        renderActions={(props) => {
          if (isChatComplete) return null;
          return (
            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                marginLeft: -16,
                gap: 1,
              }}
            >
              <IconButton icon={"camera"} size={24} onPress={askForPhoto} />
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  verticallySpaced: {
    alignSelf: "stretch",
  },
  mt20: {
    marginTop: 10,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    minHeight: "100%",
    paddingBottom: 40,
    alignContent: "center",
  },
  secondary: {
    flex: 1,
    flexDirection: "row",
    alignItems: "baseline",
    paddingTop: 4,
    paddingBottom: 4,
  },
  title: {
    marginBottom: 20,
    alignSelf: "center",
    alignItems: "center",
  },
  preview: {
    width: "100%",
    height: 300,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    marginTop: 5,
  },
  button: {
    marginTop: 20,
  },
  emptyPreview: {
    width: "100%",
    height: 300,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ddd",
    marginTop: 5,
  },
});
