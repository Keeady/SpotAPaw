import RenderShortProfile from "@/components/pets/short-profile";
import { Pet } from "@/model/pet";
import { useRouter } from "expo-router";
import { FlatList, TouchableOpacity, View, StyleSheet } from "react-native";
import { Button, Text } from "react-native-paper";

type PetListRendererProp = {
  pets: Pet[];
};

export default function PetListRenderer({ pets }: PetListRendererProp) {
    const router = useRouter();
  
  return (
    <View style={styles.container}>
      <FlatList
        data={pets}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => router.push(`/pets/${item.id}`)}>
            <RenderShortProfile pet={item} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text
            style={{ alignSelf: "center", marginBottom: 40, marginTop: 40 }}
          >
            No Pet profile to display
          </Text>
        }
        ListFooterComponent={
          <Button
            mode="contained"
            onPress={() => router.navigate("/(app)/pets/new")}
          >
            Add a new Pet
          </Button>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    backgroundColor: "#fff",
    alignContent: "center",
  },
});
