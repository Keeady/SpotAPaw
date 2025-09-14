import { GenerativeModel } from "@google/generative-ai";
import { GiftedChat, IMessage } from "react-native-gifted-chat";

export function getPrompt(
  sighting: any,
  userReply: string,
  botReply: string = ""
) {
  return `
You are a conversational assistant helping collect pet sighting reports from a user. 
So far this is the data we have: ${JSON.stringify(sighting)}.
Ask the next missing piece of info in a friendly way. 
The fields we want are: species, colors, features, photo, notes, time, location, gender, breed.
If user says something that matches a field, update it.
Always respond ONLY with valid JSON matching this schema:
{
  "message": "string - the next question or phrase to show the user",
  "data": [
    { "field": "species | colors | time | features | location | photo | notes | gender | breed | complete", "value": "string or null" }
  ]
}

Rules:
- "data" is an array of fields and values extracted from the user's last reply.
- If the reply mentions multiple fields, include them all in the array.
- "message" must be the next natural question or phrase guiding the user.
- Ask clarifying questions to get specific details to help locating and identifying the pet.
- Mark "field": "complete" when you have enough info for a sighting.
- If answer is No, mark the field value as "unknown".
- Ask the user to upload a photo of the pet using the camera icon.
- Ask if the user wants to be contacted by the pet owner for info. Then prompt for name and phone number.
Your prompt: ${botReply}
User's reply: ${userReply}
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
  model: GenerativeModel,
  prompt: string,
  setMessages: React.Dispatch<React.SetStateAction<IMessage[]>>,
  setSighting: React.Dispatch<React.SetStateAction<any>>,
  setBotLastReply: React.Dispatch<React.SetStateAction<string>>,
  setChatSessionComplete: React.Dispatch<React.SetStateAction<boolean>>,
) {
  let result;
  try {
    result = await model.generateContent(prompt);
  } catch (error) {
    console.error("Error generating content:", error);
    setMessages((prev) =>
      GiftedChat.append(prev, [{
        _id: Math.random().toString(),
        text: "❗️ Sorry, there was an error processing your message. Please try again.",
        createdAt: new Date(),
        user: { _id: 2, name: "Bot" },
      }])
    );
    return;
  }

  if (!result || !result.response) {
    console.error("No response from model");
    setMessages((prev) =>
      GiftedChat.append(prev, [{
        _id: Math.random().toString(),
        text: "❗️ Sorry, I didn't get a response. Could you please rephrase?",
        createdAt: new Date(),
        user: { _id: 2, name: "Bot" },
      }])
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
      GiftedChat.append(prev, [{
        _id: Math.random().toString(),
        text: "❗️ Sorry, I didn't understand that. Could you please rephrase?",
        createdAt: new Date(),
        user: { _id: 2, name: "Bot" },
      }])
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

  // Send bot's message to chat
  setMessages((prev) =>
    GiftedChat.append(prev, [{
      _id: Math.random().toString(),
      text: botMessage,
      createdAt: new Date(),
      user: { _id: 2, name: "Bot" },
    }])
  );

  // Check if report is complete
  if (dataObject["complete"] === "true") {
    setChatSessionComplete(true);
    setMessages((prev) =>
      GiftedChat.append(prev, [{
        _id: Math.random().toString(),
        text: "🎉 Thanks! Your sighting report has been saved.",
        createdAt: new Date(),
        user: { _id: 2, name: "Bot" },
      }])
    );
  }

  mergeSightingData(dataObject, setSighting);
}

function mergeSightingData(
  newData: Record<string, string>,
  setSighting: React.Dispatch<React.SetStateAction<any>>
) {
  setSighting((prev) => ({
    ...prev,
    ...newData, // overwrite only the fields provided
  }));
}
