import React, { useCallback, useEffect, useState } from "react";
import { GiftedChat, IMessage } from "react-native-gifted-chat";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { View, StyleSheet } from "react-native";
import { IconButton, Text } from "react-native-paper";
import { PetSighting } from "@/model/sighting";
import { Avatar } from "react-native-paper";
import {
  getPrompt,
  sendSignalToGemini,
} from "@/components/chat/handle-sighting-report-chat";
import { pickImage } from "@/components/image-picker";
import useUploadPetImageUrl from "@/components/image-upload";
import { supabase } from "@/components/supabase-client";

export default function Chat() {
  const botUser = {
    _id: 2,
    name: "Bot",
    avatar: () => <Avatar.Icon size={24} icon="paw" />,
  };
  
  const [messages, setMessages] = useState<IMessage[]>([
    {
      _id: 1,
      text: "👋 Hi! I can help you report a pet sighting. What kind of pet did you see?",
      createdAt: new Date(),
      user: botUser,
    },
  ]);

  const [sighting, setSighting] = useState({
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
  const [photoUrl, setPhotoUrl] = useState("");

  // Initialize the Google Generative AI client
  const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEN_AI_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const uploadImage = useUploadPetImageUrl();
  const handleSend = useCallback(
    async (newMessages: IMessage[] = []) => {
      setMessages((prev) => GiftedChat.append(prev, newMessages));
      let prompt = getPrompt(
        sighting,
        newMessages[0]?.text || "",
        botLastReply || ""
      );
      await sendSignalToGemini(
        model,
        prompt,
        setMessages,
        setSighting,
        setBotLastReply,
        setIsChatComplete,
        () => pickImage(setPhotoUrl)
      );
    },
    [messages]
  );

  useEffect(() => {
    if (isChatComplete) {
      console.log("Chat complete, final sighting data:", sighting);
      // Here you can handle the completed sighting, e.g., save to database
      if (photoUrl) {
        uploadImage(photoUrl, (url) => {
          saveSightingInfo(sighting, url);
        });
      } else {
        saveSightingInfo(sighting);
      }
    }
  }, [isChatComplete]);

  const saveSightingInfo = async (sighting: any, url?: string) => {
    const finalSighting: PetSighting = {
      colors: sighting.colors,
      features: sighting.features,
      note: sighting.notes,
      species: sighting.species,
      last_seen_time: sighting.time,
      last_seen_location: sighting.location,
      photo: url || "",
      name: "",
      breed: sighting.breed,
      gender: sighting.gender,
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
        GiftedChat.append(prev, [{
          _id: Math.random().toString(),
          text: "✅ Photo uploaded! Thanks! ❤️",
          createdAt: new Date(),
          user: botUser,
        }])
      );
      setBotLastReply("Photo uploaded, thanks!");
    }
  }

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
        disableComposer={isChatComplete}
        placeholder={isChatComplete ? "Chat complete!" : "Type your message..."}
        renderActions={(props) => {
          if (isChatComplete) return null;
          return (
            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                marginLeft: -16,
              }}
            >
              <IconButton
                icon={"camera"}
                size={24}
                onPress={askForPhoto}
              />
            </View>
          );
        }}
        onInputTextChanged={(text) => {
          console.log("User is typing:", text);
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
