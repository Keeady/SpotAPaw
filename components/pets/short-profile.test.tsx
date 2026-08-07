import { render } from "@testing-library/react-native";
import RenderShortProfile from "./short-profile";

jest.mock("react-i18next", () => ({
  useTranslation: () => {
    return {
      t: jest.fn((key) => key),
    };
  },
}));

describe("Short Profile", () => {
  it("renders pet profile with list of photos", () => {
    const pet = {
      photos: ["photo1.jpg", "photo2.jpg"],
      name: "Buddy",
      breed: "Golden Retriever",
      age: 3,
      photo: "photo1.jpg",
    } as any;

    const { queryByTestId, getByText } = render(
      <RenderShortProfile pet={pet} />,
    );
    expect(queryByTestId("pet-photos")).toBeTruthy();
    expect(queryByTestId("pet-photo")).toBeNull();
    expect(getByText("Buddy")).toBeTruthy();
    expect(getByText("Golden Retriever")).toBeTruthy();
    expect(getByText("ageWithCount")).toBeTruthy();
  });

  it("renders pet profile with no photos if photos array is empty", () => {
    const pet = {
      photos: [],
      name: "Buddy",
      breed: "Golden Retriever",
      age: 3,
      photo: "photo1.jpg",
    } as any;

    const { queryByTestId, getByText } = render(
      <RenderShortProfile pet={pet} />,
    );
    expect(queryByTestId("pet-photos")).toBeNull();
    expect(queryByTestId("pet-photo")).toBeNull();
    expect(getByText("Buddy")).toBeTruthy();
    expect(getByText("Golden Retriever")).toBeTruthy();
    expect(getByText("ageWithCount")).toBeTruthy();
  });

  it("renders pet profile with no photos if photos array is undefined", () => {
    const pet = {
      name: "Buddy",
      breed: "Golden Retriever",
      age: 3,
    } as any;

    const { queryByTestId, getByText } = render(
      <RenderShortProfile pet={pet} />,
    );
    expect(queryByTestId("pet-photos")).toBeNull();
    expect(queryByTestId("pet-photo")).toBeNull();
    expect(getByText("Buddy")).toBeTruthy();
    expect(getByText("Golden Retriever")).toBeTruthy();
    expect(getByText("ageWithCount")).toBeTruthy();
    expect(getByText("noPhoto")).toBeTruthy();
  });
});
