 import * as ImagePicker from "expo-image-picker";

 const pickImage = async (  handleChange: (f: string, v: string) => void
) => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      handleChange("photo", result.assets[0].uri);
    }
  };

  export default pickImage;