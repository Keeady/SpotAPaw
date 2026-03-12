import { View } from "react-native";
import { SightingGalleryProps } from "./sighting-interface";

export default function SightingGallery({ images }: SightingGalleryProps) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "center", gap: 8 }}>
      {images.map((img, key) => {
        return <img key={key} src={img.uri} width={350} />;
      })}
    </View>
  );
}
