import { View, Image } from "react-native";
import { SightingGalleryProps } from "./sighting-interface";

export default function SightingGallery({ images }: SightingGalleryProps) {
  const length = images.length;
  return (
    <View style={{ flexDirection: "row", justifyContent: "center", gap: 8 }}>
      {images.map((img, key) => {
        return (
          <Image
            key={key}
            source={img}
            style={{
              width: 350,
              height: "auto",
              aspectRatio: 1
            }}
            alt={`Pet sighting photo ${key} of ${length}`}    
            resizeMode="contain"

          />
        );
      })}
    </View>
  );
}
