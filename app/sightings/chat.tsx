import ReportChatScreen from "@/components/chat/report-with-chat";
import { useEffect } from "react";
import {GoogleGenerativeAI} from "@google/generative-ai"

export default function Chat() {
  // The client gets the API key from the environment variable `GEMINI_API_KEY`.
  const genAI = new GoogleGenerativeAI("GEMINI_API_KEY");
  console.log(genAI)

  async function main() {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });
    const prompt = `
    You are an assistant that extracts structured pet sighting info.
    Respond only in JSON with keys: colors, breed, gender, features, location, time.

    User: I saw a small white dog near Central Park around 4pm`;
    const result = await model.generateContent(prompt);
    const response = result.response.text()
    console.log(response);
    return response;
  }

  main();
  return <ReportChatScreen />;
}
