import RenderShortProfile from "@/components/pets/short-profile";
import { useRouter } from "expo-router";
import { FlatList, TouchableOpacity, View, StyleSheet } from "react-native";
import { Button, Text } from "react-native-paper";
import { SightingPet } from "../wizard/wizard-interface";
import { useTranslation } from 'react-i18next'

type PetListRendererProp = {
  pets: SightingPet[];
};

export default function PetListRenderer({ pets }: PetListRendererProp) {
  const { t } = useTranslation("petprofile");
  const router = useRouter();
  return (
    <View style={styles.container}>
      <FlatList
        data={pets}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity activeOpacity={0.7} onPress={() => router.push(`/pets/${item.id}`)}>
            <RenderShortProfile pet={item} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text
            style={{ alignSelf: "center", marginBottom: 40, marginTop: 40 }}
          >
            {t('noPetProfileToDisplay', 'No Pet profile to display')}
          </Text>
        }
        ListFooterComponent={
          <Button
            mode="contained"
            onPress={() => router.navigate("/(app)/pets/new")}
          >
            {t('addANewPet', 'Add a new Pet')}
          </Button>
        }
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToAlignment="start"
        decelerationRate="fast"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    alignContent: "center",
  },
});
