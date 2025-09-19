import { useCallback, useContext } from "react";
import { v4 as uuidv4 } from "uuid";
import { AuthContext } from "./Provider/auth-provider";
import { supabase } from "./supabase-client";
import AppConstant from "./constants";

export default function useUploadPetImageUrl() {
  const SUPABASE_URL = AppConstant.EXPO_PUBLIC_SUPABASE_URL;
  const SUPABASE_KEY = AppConstant.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  const BUCKET = "pet_photos";
  const { session } = useContext(AuthContext);

  return useCallback(
    async (uri: string, callback: (uri: string) => void) => {
      if (!uri) return;

      const response = await fetch(uri);
      const blob = await response.blob();
      const filePath = `sightings/${uuidv4()}.jpg`;

      const xhr = new XMLHttpRequest();
      xhr.open(
        "POST",
        `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${filePath}`
      );

      xhr.setRequestHeader("apikey", SUPABASE_KEY);
      xhr.setRequestHeader(
        "Authorization",
        `Bearer ${session?.access_token ?? SUPABASE_KEY}`
      );
      xhr.setRequestHeader("Content-Type", "image/jpg");

      xhr.upload.onprogress = (event) => {
        console.log("Upload happening");
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          console.log("Upload success:", xhr.responseText);
          // Get a public URL back
          const { data } = supabase.storage
            .from("pet_photos")
            .getPublicUrl(filePath);
          console.log("data", data);
          if (data.publicUrl) {
            callback(data.publicUrl);
          }
        } else {
          console.error("Upload error:", xhr.responseText);
        }
      };

      xhr.onerror = () => {
        console.error("Upload failed");
      };

      xhr.send(blob);
    },
    [SUPABASE_KEY, SUPABASE_URL, session?.access_token]
  );
}
