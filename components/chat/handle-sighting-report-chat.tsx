import { PetSightingFromChat } from "@/model/sighting";
import { GenerativeModel } from "@google/generative-ai";
import { JSX } from "react";
import { GiftedChat, IMessage } from "react-native-gifted-chat";
import { getCurrentUserLocationV3, SightingLocation } from "../get-current-location";

export function getPrompt(
  sighting: string,
  userReply: string,
  botReply: string = "",
  offenseCounter: number = 0
) {
  return `
You are a conversational assistant helping collect pet sighting reports from a user. 
So far this is the data we have: ${sighting}.
Ask the next missing piece of info in a friendly way. 
The fields we want are: species, colors, features, photo, notes, time, location, gender, breed, name.
If user says something that matches a field, update it.
Always respond ONLY with valid JSON matching this schema:
{
  "message": "string - the next question or phrase to show the user",
  "data": [
    { "field": "species | colors | time | features | location | useCurrentLocation | photo | notes | gender | breed | name | complete | offenseCounter", "value": "string or number or null" }
  ]
}

Rules:
- If user message contains offensive or inappropriate content, increment offenseCounter value.
- If user uses chat other than reporting a pet sighting, increment the offense counter.
- If offense counter exceeds 2, mark the conversation as flagged with complete and end the chat.
- "data" is an array of fields and values extracted from the user's last reply.
- If the reply mentions multiple fields, include them all in the array.
- "message" must be the next natural question or phrase guiding the user.
- Ask clarifying questions to get specific details to help locating and identifying the pet.
- Mark "field": "complete" when you have enough info for a sighting.
- If user doesn't know or doesn't have the answer, mark the field value as "unknown".
- If photo is not marked "true", Ask the user to upload a photo of the pet using the camera icon.
- Location: Ask for precise location, nearby streets or cross streets, and closest landmarks.
- Ask for specific date and time from user then convert it into a precise ISO 8601 datetime string.
For reference the user's current time is ${new Date().toLocaleString()} and user's local timezone is ${
    Intl.DateTimeFormat().resolvedOptions().timeZone
  }.
- If species is missing, ask what kind of animal it is.
- For colors: Extract all color words mentioned and format as comma-separated values (e.g., "brown,white,black"). Ask for distinguishing colors if not provided.
- If features are missing, ask for distinguishing characteristics.
- If breed is missing for dogs or cats, ask if they know the breed
Your prompt: ${botReply}
User's reply: ${userReply}
User's last offense count: ${offenseCounter}
`;
}

export function formatChatHistory(
  messages: IMessage[],
  newMessages: IMessage[]
) {
  return newMessages
    .concat(messages)
    .map((msg) => {
      const sender = msg.user._id === 1 ? "User" : "Bot";
      return `${sender}: ${msg.text}`;
    })
    .join("\n");
}

export async function sendSignalToGemini(
  pawPatrolUser: { _id: number; name: string; avatar: () => JSX.Element },
  botUser: { _id: number; name: string; avatar: () => JSX.Element },
  model: GenerativeModel,
  prompt: string,
  setMessages: React.Dispatch<React.SetStateAction<IMessage[]>>,
  setSighting: React.Dispatch<React.SetStateAction<PetSightingFromChat>>,
  setBotLastReply: React.Dispatch<React.SetStateAction<string>>,
  setChatSessionComplete: React.Dispatch<React.SetStateAction<boolean>>,
  setIsChatFlagged: React.Dispatch<React.SetStateAction<boolean>>,
  setShowLocationRequest: React.Dispatch<React.SetStateAction<Boolean>>
) {
  let result;
  try {
    result = await model.generateContent(prompt);
  } catch (error) {
    console.error("Error generating content:", error);
    setMessages((prev) =>
      GiftedChat.append(prev, [
        {
          _id: Math.random().toString(),
          text: "❗️ Sorry, there was an error processing your message. Please try again.",
          createdAt: new Date(),
          user: pawPatrolUser,
        },
      ])
    );
    return;
  }

  if (!result || !result.response) {
    console.error("No response from model");
    setMessages((prev) =>
      GiftedChat.append(prev, [
        {
          _id: Math.random().toString(),
          text: "❗️ Sorry, I didn't get a response. Could you please rephrase?",
          createdAt: new Date(),
          user: pawPatrolUser,
        },
      ])
    );
    return;
  }

  const rawResponse = result.response.text();
  // 1. Remove any ```json ... ``` wrappers if they exist
  const cleaned = rawResponse
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  // 2. Parse JSON
  let response;
  try {
    response = JSON.parse(cleaned);
  } catch (e) {
    console.error("Invalid JSON:", e);
  }

  if (!response) {
    setMessages((prev) =>
      GiftedChat.append(prev, [
        {
          _id: Math.random().toString(),
          text: "❗️ Sorry, I didn't understand that. Could you please rephrase?",
          createdAt: new Date(),
          user: pawPatrolUser,
        },
      ])
    );
    return;
  }

  const botMessage = response.message;
  setBotLastReply(botMessage);

  // convert to key-value pairs
  const dataObject = response.data.reduce(
    (acc: Record<string, string>, item: { field: string; value: string }) => {
      acc[item.field] = item.value;
      return acc;
    },
    {}
  );
    console.log(dataObject)

  // Send bot's message to chat
  setMessages((prev) =>
    GiftedChat.append(prev, [
      {
        _id: Math.random().toString(),
        text: botMessage,
        createdAt: new Date(),
        user: botUser,
      },
    ])
  );

  if (dataObject["offenseCounter"]) {
    const offenseCounter = parseInt(dataObject["offenseCounter"], 10);
    setIsChatFlagged(offenseCounter > 2);
    setMessages((prev) =>
      GiftedChat.append(prev, [
        {
          _id: Math.random().toString(),
          text: "⚠️ Your message was flagged by our content filter. Please try to keep the conversation appropriate and respectful.",
          createdAt: new Date(),
          user: pawPatrolUser,
        },
      ])
    );
  }

  if (dataObject["showLocationRequest"] === "true") {
    setShowLocationRequest(true);
    dataObject["showLocationRequest"] = "complete"
  }

  // Check if report is complete
  if (dataObject["complete"] === "true") {
    setChatSessionComplete(true);

    // ask for location data before closing the chat
    // write a message that says


    setMessages((prev) =>
      GiftedChat.append(prev, [
        {
          _id: Math.random().toString(),
          text: "🎉 Thanks! Your sighting report has been saved.",
          createdAt: new Date(),
          user: pawPatrolUser,
        },
      ])
    );
  }
  mergeSightingData(dataObject, setSighting);
}

function mergeSightingData(
  newData: Record<string, string>,
  setSighting: React.Dispatch<React.SetStateAction<PetSightingFromChat>>
) {
  setSighting((prev) => ({
    ...prev,
    ...newData, // overwrite only the fields provided
  }));
}
