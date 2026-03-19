import { TouchableOpacity, View, Image, StyleSheet } from "react-native";
import ImageViewing from "react-native-image-viewing";
import { Text } from "react-native-paper";
import { SightingGalleryProps } from "./sighting-interface";

export default function SightingGallery({
  mainPhoto,
  images,
  isVisible,
  setIsVisible,
}: SightingGalleryProps) {
  return (
    <View>
      {mainPhoto ? (
        <TouchableOpacity onPress={() => setIsVisible(true)}>
          <Image
            source={{ uri: mainPhoto }}
            resizeMode={"contain"}
            style={{
              width: "100%",
              height: "auto",
              aspectRatio: 1.5
            }}
          />
        </TouchableOpacity>
      ) : (
        <View style={[styles.image, styles.placeholder]}>
          <Text style={styles.placeholderText}>No Photo</Text>
        </View>
      )}
      <ImageViewing
        images={images}
        imageIndex={0}
        visible={isVisible}
        onRequestClose={() => setIsVisible(false)}
        FooterComponent={({ imageIndex }) => {
          return (
            <View style={{ padding: 20, alignItems: "center" }}>
              <Text style={{ color: "#fff" }}>
                {imageIndex + 1}/{images.length}
              </Text>
            </View>
          );
        }}
        presentationStyle={"overFullScreen"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    width: "100%",
    height: 180,
  },
  placeholder: {
    backgroundColor: "#CFD8DC",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "#546E7A",
    fontSize: 14,
  }
});
