import { RenderPetProfile, RenderShortProfile } from "@/components/pet-profile";
import { supabase } from "@/components/supabase-client";
import { Pet } from "@/model/pet";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, TouchableOpacity, View, StyleSheet } from "react-native";
import { Button, Text } from "react-native-paper";

export default function PetListScreen() {
  const [pets, setPets] = useState<Pet[]>([]);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    supabase
      .from("pets")
      .select(`*`)
      .then(({ data }) => {
        setPets(data ?? []);
        setLoading(false);

        /*if (pets.length === 0 && loading === false) {
          router.navigate("/(app)/pets/new");
          return;
        }*/
      });
  }, []);

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
        //style={{ marginBottom: 20 }}
        ListFooterComponent={
          <Button
            mode="contained"
            onPress={() => router.navigate("/(app)/pets/new")}
            style={styles.button}
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
    //minHeight: "100%",
    //paddingBottom: 40,
    alignContent: "center",
  },
  button: {
    //marginBottom: 20,
  },
});
