import { fireEvent, render } from "@testing-library/react-native";
import { SightingSelection } from "./sighting-selection";

const mockSetSelectedSightingId = jest.fn();
const mockSightings = [
  {
    id: "sighting-1",
    petId: "pet-1",
    linkedSightingId: "linked-sighting-1",
  },
] as any;

jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

jest.mock("../Provider/permission-provider", () => ({
  usePermission: () => ({
    location: {
      latitude: 0,
      longitude: 0,
    },
  }),
}));

jest.mock("./util", () => ({
  getLastSeenLocationDistance: jest.fn().mockReturnValue("100 feet away"),
  getLastSeenTimeDistance: jest.fn().mockReturnValue("5 minutes ago"),
}));

describe("SightingSelection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders a list of sightings with empty details", () => {
    const { getByText } = render(
      <SightingSelection
        setSelectedSightingId={mockSetSelectedSightingId}
        selectedSightingId=""
        sightings={mockSightings}
      />,
    );
    expect(getByText("Unknown")).toBeTruthy();
  });

  it("renders a list of sightings with details", () => {
    const sightingsWithDetails = [
      {
        id: "sighting-1",
        petId: "pet-1",
        name: "Buddy",
        species: "dog",
        linkedSightingId: "linked-sighting-1",
        lastSeenLocation: "Central Park",
        lastSeenTime: new Date().toISOString(),
        gender: "Female",
        breed: "Labrador",
        photo: "https://example.com/photo.jpg",
        similarityScore: 95,
      },
    ] as any;

    const { getByText } = render(
      <SightingSelection
        setSelectedSightingId={mockSetSelectedSightingId}
        selectedSightingId=""
        sightings={sightingsWithDetails}
      />,
    );
    expect(getByText("Buddy")).toBeTruthy();
    expect(getByText("Labrador Dog")).toBeTruthy();
    expect(getByText("Female")).toBeTruthy();
    expect(getByText("Central Park")).toBeTruthy();
    expect(getByText("5 minutes ago")).toBeTruthy();
    expect(getByText("95%")).toBeTruthy();
  });

  it("renders a list with location distance when user location is available", () => {
    const sightingsWithLocation = [
      {
        id: "sighting-1",
        petId: "pet-1",
        name: "Buddy",
        species: "dog",
        linkedSightingId: "linked-sighting-1",
        lastSeenLocation: "Central Park",
        lastSeenTime: new Date().toISOString(),
        gender: "Female",
        breed: "Labrador",
        photo: "https://example.com/photo.jpg",
        lastSeenLat: 40.7128,
        lastSeenLong: -74.006,
      },
    ] as any;

    const { getByText, queryByText } = render(
      <SightingSelection
        setSelectedSightingId={mockSetSelectedSightingId}
        selectedSightingId=""
        sightings={sightingsWithLocation}
      />,
    );
    expect(getByText("100 feet away")).toBeTruthy();
    expect(queryByText("Central Park")).toBeNull();
  });

  it("calls setSelectedSightingId when a sighting is selected", () => {
    const { getByText } = render(
      <SightingSelection
        setSelectedSightingId={mockSetSelectedSightingId}
        selectedSightingId=""
        sightings={mockSightings}
      />,
    );
    const sightingCard = getByText("Unknown");
    expect(sightingCard).toBeTruthy();
    if (sightingCard) {
      fireEvent.press(sightingCard);
      expect(mockSetSelectedSightingId).toHaveBeenCalledWith("sighting-1");
    }
  });
});
