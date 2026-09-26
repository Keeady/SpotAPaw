import { fireEvent, render } from "@testing-library/react-native";
import ShowProgress from "./show-progress";
import { AuthContext } from "../Provider/auth-provider";

jest.mock("react-i18next", () => ({
  useTranslation: () => {
    return {
      t: (key: string, defaultValue?: string, options?: any) => {
        if (options && options.val) {
          return defaultValue?.replace("{{val}}", options.val) || key;
        }
        return defaultValue || key;
      },
    };
  },
}));

const mockRouterPush = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock("@/components/Provider/auth-provider", () => {
  const React = jest.requireActual("react");
  const fakeUser = { id: "test-user-id" };
  const AuthContext = React.createContext({ user: fakeUser });

  return {
    AuthContext,
  };
});

jest.mock("../util", () => ({
  getIconByAnimalSpecies: jest.fn().mockReturnValue("paw"),
  getLastSeenLocation: jest.fn().mockResolvedValue("Central Park"),
  kmToMiles: jest.fn().mockReturnValue(10),
  createErrorLogMessage: jest.fn().mockReturnValue("Error message"),
  isValidUuid: jest.fn().mockReturnValue(true),
}));

jest.mock("../logs", () => ({
  log: jest.fn(),
}));

const mockGetMatchingSightings = jest.fn();
const mockGetSighting = jest.fn();
jest.mock("@/db/repositories/sighting-repository", () => ({
  SightingRepository: jest.fn().mockImplementation(() => ({
    getSighting: (sightingId: string) => mockGetSighting(sightingId),
    createSighting: jest.fn(),
    updateSighting: jest.fn(),
    getMatchingSightings: jest.fn(),
    findMatchingSightings: (
      sightingId: string,
      lat: number,
      long: number,
      radius: number,
    ) => mockGetMatchingSightings(sightingId, lat, long, radius),
  })),
}));

const mockGetAiDescription = jest.fn();
jest.mock("@/db/repositories/ai-description-repository", () => ({
  AiDescriptionRepository: jest.fn().mockImplementation(() => ({
    getAiDescription: (id: string) => mockGetAiDescription(id),
  })),
}));

describe("ShowProgress", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithAuthContext = (authValue: any) => {
    return render(
      <AuthContext.Provider value={authValue}>
        <ShowProgress sightingId="sighting123" />
      </AuthContext.Provider>,
    );
  };

  it("renders progress page", async () => {
    mockGetSighting.mockResolvedValue({
      species: "dog",
      lastSeenLocation: "Central Park",
      lastSeenTime: new Date("10/01/2025").toISOString(),
      sightingId: "sighting123",
      petDescriptionId: "petDesc123",
      lastSeenLat: 40.785091,
      lastSeenLong: -73.968285,
    });
    mockGetAiDescription.mockResolvedValue({
      id: "petDesc123",
      narrative: "A large dog was seen near Central Park.",
      best_photo_url: "http://example.com/photo.jpg",
    });

    const { getByText, findByText, queryByTestId, findByTestId } =
      renderWithAuthContext({ user: { id: "user123" } });
    expect(getByText("Sighting Submitted!")).toBeTruthy();
    expect(
      getByText("Hang tight — we are processing your report."),
    ).toBeTruthy();

    expect(getByText("Matching Filters")).toBeTruthy();
    expect(
      getByText("We are searching for similar pets using these parameters"),
    ).toBeTruthy();

    expect(getByText("No photo")).toBeTruthy();
    expect(getByText("View Matches")).toBeTruthy();
    expect(getByText("View Matches")).toBeDisabled();
    expect(getByText("Generate Poster")).toBeTruthy();
    expect(getByText("Generate Poster")).toBeDisabled();

    expect(await findByTestId("best-photo")).toBeTruthy();
    expect(await queryByTestId("sighting-photo")).toBeNull();
    expect(await findByText("Last seen location: Central Park")).toBeTruthy();
    expect(await findByText("Last seen date: 10/1/2025")).toBeTruthy();
    expect(await findByText("Date range: Last 30 days")).toBeTruthy();
    expect(await findByText("Radius: 10 miles")).toBeTruthy();
    expect(await findByText("AI Description:")).toBeTruthy();
    expect(
      await findByText("A large dog was seen near Central Park."),
    ).toBeTruthy();

    expect(mockGetSighting).toHaveBeenCalledWith("sighting123");
    expect(mockGetAiDescription).toHaveBeenCalledWith("petDesc123");

    expect(await findByText("View Matches")).not.toBeDisabled();
    const viewMatchesButton = getByText("View Matches");
    fireEvent.press(viewMatchesButton);

    expect(mockRouterPush).toHaveBeenCalledWith(
      "/my-sightings/match/?sightingId=sighting123&petDescriptionId=petDesc123",
    );

    expect(await findByText("Generate Poster")).not.toBeDisabled();
    const generatePosterButton = getByText("Generate Poster");
    fireEvent.press(generatePosterButton);

    expect(mockRouterPush).toHaveBeenCalledWith(
      "/posters/?sightingId=sighting123",
    );
  });

  it("renders correctly when sighting is not found", async () => {
    mockGetSighting.mockResolvedValue(null);

    const { getByText, findByText } = renderWithAuthContext({
      user: { id: "user123" },
    });

    expect(getByText("Sighting Submitted!")).toBeTruthy();
    expect(
      getByText("Hang tight — we are processing your report."),
    ).toBeTruthy();

    expect(getByText("Matching Filters")).toBeTruthy();
    expect(
      getByText("We are searching for similar pets using these parameters"),
    ).toBeTruthy();

    expect(getByText("No photo")).toBeTruthy();
    expect(getByText("View Matches")).toBeTruthy();
    expect(getByText("View Matches")).toBeDisabled();
    expect(getByText("Generate Poster")).toBeTruthy();
    expect(getByText("Generate Poster")).toBeDisabled();

    expect(await findByText("Last seen location: Unknown")).toBeTruthy();
    expect(await findByText("Last seen date: Unknown")).toBeTruthy();
    expect(await findByText("Date range: Last 30 days")).toBeTruthy();
    expect(await findByText("Radius: 10 miles")).toBeTruthy();
    expect(await findByText("AI Description:")).toBeTruthy();
    expect(await findByText("No description available.")).toBeTruthy();

    expect(mockGetSighting).toHaveBeenCalledWith("sighting123");
    expect(mockGetAiDescription).not.toHaveBeenCalled();

    expect(await findByText("View Matches")).not.toBeDisabled();
    expect(await findByText("Generate Poster")).not.toBeDisabled();
  });

  it("renders correctly when AI description is not found", async () => {
    mockGetSighting.mockResolvedValue({
      species: "dog",
      lastSeenLocation: "Central Park",
      lastSeenTime: new Date("10/01/2025").toISOString(),
      sightingId: "sighting123",
      petDescriptionId: "petDesc123",
      lastSeenLat: 40.785091,
      lastSeenLong: -73.968285,
      photos: ["http://example.com/photo.jpg"],
    });
    mockGetAiDescription.mockResolvedValue(null);

    const { getByText, findByText, findByTestId, queryByTestId } =
      renderWithAuthContext({ user: { id: "user123" } });

    expect(getByText("Sighting Submitted!")).toBeTruthy();
    expect(
      getByText("Hang tight — we are processing your report."),
    ).toBeTruthy();

    expect(getByText("Matching Filters")).toBeTruthy();
    expect(
      getByText("We are searching for similar pets using these parameters"),
    ).toBeTruthy();

    expect(getByText("No photo")).toBeTruthy();
    expect(getByText("View Matches")).toBeTruthy();
    expect(getByText("View Matches")).toBeDisabled();
    expect(getByText("Generate Poster")).toBeTruthy();
    expect(getByText("Generate Poster")).toBeDisabled();

    expect(await findByTestId("sighting-photo")).toBeTruthy();
    expect(await queryByTestId("best-photo")).toBeNull();
    expect(await findByText("Last seen location: Central Park")).toBeTruthy();
    expect(await findByText("Last seen date: 10/1/2025")).toBeTruthy();
    expect(await findByText("Date range: Last 30 days")).toBeTruthy();
    expect(await findByText("Radius: 10 miles")).toBeTruthy();
    expect(await findByText("AI Description:")).toBeTruthy();
    expect(await findByText("No description available.")).toBeTruthy();

    expect(mockGetSighting).toHaveBeenCalledWith("sighting123");
    expect(mockGetAiDescription).toHaveBeenCalledWith("petDesc123");

    expect(await findByText("View Matches")).not.toBeDisabled();
    expect(await findByText("Generate Poster")).not.toBeDisabled();
  });

  it("renders correctly when user is not logged in", async () => {
    mockGetSighting.mockResolvedValue({
      species: "dog",
      lastSeenLocation: "Central Park",
      lastSeenTime: new Date("10/01/2025").toISOString(),
      sightingId: "sighting123",
      petDescriptionId: "petDesc123",
      lastSeenLat: 40.785091,
      lastSeenLong: -73.968285,
      photos: ["http://example.com/photo1.jpg"],
    });
    mockGetAiDescription.mockResolvedValue({
      id: "petDesc123",
      narrative: "A large dog was seen near Central Park.",
      best_photo_url: "http://example.com/photo2.jpg",
    });

    const { getByText, findByText, findByTestId, queryByTestId } =
      renderWithAuthContext({ user: null });

    expect(getByText("Sighting Submitted!")).toBeTruthy();
    expect(
      getByText("Hang tight — we are processing your report."),
    ).toBeTruthy();

    expect(getByText("Matching Filters")).toBeTruthy();
    expect(
      getByText("We are searching for similar pets using these parameters"),
    ).toBeTruthy();

    expect(getByText("No photo")).toBeTruthy();
    expect(getByText("View Matches")).toBeTruthy();
    expect(getByText("View Matches")).toBeDisabled();
    expect(getByText("Generate Poster")).toBeTruthy();
    expect(getByText("Generate Poster")).toBeDisabled();

    expect(await findByTestId("best-photo")).toBeTruthy();
    expect(await queryByTestId("sighting-photo")).toBeNull();

    expect(await findByText("Last seen location: Central Park")).toBeTruthy();
    expect(await findByText("Last seen date: 10/1/2025")).toBeTruthy();
    expect(await findByText("Date range: Last 30 days")).toBeTruthy();
    expect(await findByText("Radius: 10 miles")).toBeTruthy();
    expect(await findByText("AI Description:")).toBeTruthy();
    expect(
      await findByText("A large dog was seen near Central Park."),
    ).toBeTruthy();

    expect(mockGetSighting).toHaveBeenCalledWith("sighting123");
    expect(mockGetAiDescription).toHaveBeenCalledWith("petDesc123");

    expect(await findByText("View Matches")).not.toBeDisabled();
    const viewMatchesButton = getByText("View Matches");
    fireEvent.press(viewMatchesButton);

    expect(mockRouterPush).toHaveBeenCalledWith(
      "/sightings/match/?sightingId=sighting123&petDescriptionId=petDesc123",
    );

    expect(await findByText("Generate Poster")).not.toBeDisabled();
    const generatePosterButton = getByText("Generate Poster");
    fireEvent.press(generatePosterButton);

    expect(mockRouterPush).toHaveBeenCalledWith(
      "/posters/?sightingId=sighting123",
    );
  });
});
