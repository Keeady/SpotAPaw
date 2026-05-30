import { fireEvent, render, waitFor } from "@testing-library/react-native";
import PetProfileCard from "./profile";
import { Text } from "react-native";

const GalleryMock = () => <Text>{"Gallery Mock"}</Text>;
jest.mock("../sightings/gallery", () => {
  return {
    __esModule: true,
    default: () => GalleryMock(),
  };
});

jest.mock("react-i18next", () => ({
  useTranslation: () => {
    return {
      t: jest.fn((key) => key),
    };
  },
}));

describe("PetProfile", () => {
  it("renders lost pet profile card with correct information", async () => {
    const petProfile = {
      id: "1",
      name: "Buddy",
      breed: "Golden Retriever",
      age: 3,
      colors: "Golden",
      status: "lost",
      species: "Dog",
      note: "Friendly and loves people",
      photos: ["photo1.jpg", "photo2.jpg"],
      photo: "photo1.jpg",
      gender: "Male",
      features: "Fluffy tail",
    } as any;

    const onDeletePet = jest.fn();
    const onEditPet = jest.fn();
    const onPetLost = jest.fn();
    const onPetFound = jest.fn();
    const viewPetSightings = jest.fn();

    const { getByText, queryByTestId, queryByText } = render(
      <PetProfileCard
        petProfile={petProfile}
        onDeletePet={onDeletePet}
        onEditPet={onEditPet}
        onPetLost={onPetLost}
        onPetFound={onPetFound}
        viewPetSightings={viewPetSightings}
      />,
    );

    await waitFor(() => {
      expect(getByText("Gallery Mock")).toBeTruthy();
      expect(getByText("Buddy")).toBeTruthy();
      expect(getByText("🐾 breed Golden Retriever")).toBeTruthy();
      expect(getByText("🐾 genderLabel: gender.Male")).toBeTruthy();
      expect(getByText("🎂 ageLabel: ageWithCount")).toBeTruthy();
      expect(getByText("🎨 colors Golden")).toBeTruthy();
      expect(getByText("status.lost")).toBeTruthy();
      expect(getByText("🐾 species: animal.Dog")).toBeTruthy();
      expect(getByText("📝 notes Friendly and loves people")).toBeTruthy();
      expect(getByText("⭐ features Fluffy tail")).toBeTruthy();
      expect(queryByTestId("pet-photo")).toBeNull();

      expect(getByText("edit")).toBeTruthy();
      fireEvent.press(getByText("edit"));
      expect(onEditPet).toHaveBeenCalled();

      expect(getByText("delete")).toBeTruthy();
      fireEvent.press(getByText("delete"));
      expect(onDeletePet).toHaveBeenCalled();

      expect(getByText("reportPetFound")).toBeTruthy();
      fireEvent.press(getByText("reportPetFound"));
      expect(onPetFound).toHaveBeenCalled();

      expect(queryByText("reportLostPet")).toBeNull();
      expect(onPetLost).not.toHaveBeenCalled();

      expect(queryByText("viewPetSightings")).toBeTruthy();
      fireEvent.press(queryByText("viewPetSightings"));
      expect(viewPetSightings).toHaveBeenCalled();
    });
  });

  it("renders safe pet profile card with correct information", async () => {
    const petProfile = {
      id: "1",
      name: "Bailey",
      breed: "Golden Retriever",
      age: 3,
      colors: "Golden",
      status: "safe",
      species: "Cat",
      note: "Friendly and loves people",
      photos: [],
      photo: "photo1.jpg",
      gender: "Female",
      features: "Fluffy tail",
    } as any;

    const onDeletePet = jest.fn();
    const onEditPet = jest.fn();
    const onPetLost = jest.fn();
    const onPetFound = jest.fn();
    const viewPetSightings = jest.fn();

    const { getByText, queryByTestId, queryByText } = render(
      <PetProfileCard
        petProfile={petProfile}
        onDeletePet={onDeletePet}
        onEditPet={onEditPet}
        onPetLost={onPetLost}
        onPetFound={onPetFound}
        viewPetSightings={viewPetSightings}
      />,
    );

    await waitFor(() => {
      expect(queryByText("Gallery Mock")).toBeNull();
      expect(getByText("Bailey")).toBeTruthy();
      expect(getByText("🐾 breed Golden Retriever")).toBeTruthy();
      expect(getByText("🐾 genderLabel: gender.Female")).toBeTruthy();
      expect(getByText("🎂 ageLabel: ageWithCount")).toBeTruthy();
      expect(getByText("🎨 colors Golden")).toBeTruthy();
      expect(getByText("status.safe")).toBeTruthy();
      expect(getByText("🐾 species: animal.Cat")).toBeTruthy();
      expect(getByText("📝 notes Friendly and loves people")).toBeTruthy();
      expect(getByText("⭐ features Fluffy tail")).toBeTruthy();
      expect(queryByTestId("pet-photo")).toBeTruthy();

      expect(getByText("edit")).toBeTruthy();
      fireEvent.press(getByText("edit"));
      expect(onEditPet).toHaveBeenCalled();

      expect(getByText("delete")).toBeTruthy();
      fireEvent.press(getByText("delete"));
      expect(onDeletePet).toHaveBeenCalled();

      expect(getByText("reportLostPet")).toBeTruthy();
      fireEvent.press(getByText("reportLostPet"));
      expect(onPetLost).toHaveBeenCalled();

      expect(queryByText("reportPetFound")).toBeNull();
      expect(onPetFound).not.toHaveBeenCalled();

      expect(queryByText("viewPetSightings")).toBeNull();
      expect(viewPetSightings).not.toHaveBeenCalled();
    });
  });

  it("renders safe pet profile card with missing information", async () => {
    const petProfile = {
      id: "1",
      name: "Bailey",
      breed: "Golden Retriever",
      age: 3,
      colors: "Golden",
      status: "safe",
      species: "Horse",
      gender: "Female",
      features: "Fluffy tail",
    } as any;

    const onDeletePet = jest.fn();
    const onEditPet = jest.fn();
    const onPetLost = jest.fn();
    const onPetFound = jest.fn();
    const viewPetSightings = jest.fn();

    const { getByText, queryByTestId, queryByText } = render(
      <PetProfileCard
        petProfile={petProfile}
        onDeletePet={onDeletePet}
        onEditPet={onEditPet}
        onPetLost={onPetLost}
        onPetFound={onPetFound}
        viewPetSightings={viewPetSightings}
      />,
    );

    await waitFor(() => {
      expect(queryByText("Gallery Mock")).toBeNull();
      expect(getByText("Bailey")).toBeTruthy();
      expect(getByText("🐾 breed Golden Retriever")).toBeTruthy();
      expect(getByText("🐾 genderLabel: gender.Female")).toBeTruthy();
      expect(getByText("🎂 ageLabel: ageWithCount")).toBeTruthy();
      expect(getByText("🎨 colors Golden")).toBeTruthy();
      expect(getByText("status.safe")).toBeTruthy();
      expect(getByText("🐾 species: animal.Horse")).toBeTruthy();
      expect(getByText("⭐ features Fluffy tail")).toBeTruthy();
      expect(queryByTestId("pet-photo")).toBeNull();
      expect(getByText("noPhoto")).toBeTruthy();

      expect(getByText("edit")).toBeTruthy();
      fireEvent.press(getByText("edit"));
      expect(onEditPet).toHaveBeenCalled();

      expect(getByText("delete")).toBeTruthy();
      fireEvent.press(getByText("delete"));
      expect(onDeletePet).toHaveBeenCalled();

      expect(getByText("reportLostPet")).toBeTruthy();
      fireEvent.press(getByText("reportLostPet"));
      expect(onPetLost).toHaveBeenCalled();

      expect(queryByText("reportPetFound")).toBeNull();
      expect(onPetFound).not.toHaveBeenCalled();

      expect(queryByText("viewPetSightings")).toBeNull();
      expect(viewPetSightings).not.toHaveBeenCalled();
    });
  });
});
