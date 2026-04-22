import { fireEvent, render } from "@testing-library/react-native";
import ShowProgress from "./show-progress";
import { AuthContext } from "../Provider/auth-provider";
import { Text } from "react-native-paper";

const mockRouterPush = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({
    replace: mockRouterPush,
  }),
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock("@/components/Provider/auth-provider", () => {
  const React = require("react");
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
}));

jest.mock("../logs", () => ({
  log: jest.fn(),
}));

const mockGetMatchingSightings = jest.fn();
jest.mock("@/db/repositories/sighting-repository", () => ({
  SightingRepository: jest.fn().mockImplementation(() => ({
    getSighting: jest.fn(),
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

describe("ShowProgress", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithAuthContext = (
    data: any,
    authValue: any,
    props: any = {},
  ) => {
    const defaultProps = {
      sightingFormData: data,
      ...props,
    };

    return render(
      <AuthContext.Provider value={authValue}>
        <ShowProgress {...defaultProps} />
      </AuthContext.Provider>,
    );
  };

  it("renders progress page", async () => {
    mockGetMatchingSightings.mockResolvedValue([]);

    const { getByText, findByText } = renderWithAuthContext(
      {
        species: "dog",
        lastSeenLocation: "Central Park",
        lastSeenTime: new Date("10/01/2025").toISOString(),
        sightingId: "sighting123",
        petDescriptionId: "petDesc123",
        lastSeenLat: 40.785091,
        lastSeenLong: -73.968285,
      },
      { user: { id: "user123" } },
    );
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

    expect(await findByText("Last seen location: Central Park")).toBeTruthy();
    expect(await findByText("Last seen date: 10/1/2025")).toBeTruthy();
    expect(await findByText("Date range: Last 30 days")).toBeTruthy();
    expect(await findByText("Radius: 10 miles")).toBeTruthy();
    expect(await findByText("Species: Dog")).toBeTruthy();

    expect(mockGetMatchingSightings).toHaveBeenCalledWith(
      "sighting123",
      40.785091,
      -73.968285,
      20,
    );

    expect(await findByText("View Matches")).not.toBeDisabled();
    const viewMatchesButton = getByText("View Matches");
    fireEvent.press(viewMatchesButton);

    expect(mockRouterPush).toHaveBeenCalledWith(
      "/my-sightings/match/?sightingId=sighting123&petDescriptionId=petDesc123",
    );
  });

  it("renders progress page with no matching sightings", async () => {
    mockGetMatchingSightings.mockResolvedValue([]);

    const { getByText, findByText, getByTestId } = renderWithAuthContext(
      {
        species: "dog",
        lastSeenLocation: "Central Park",
        lastSeenTime: new Date("10/01/2025").toISOString(),
        sightingId: "",
        petDescriptionId: "petDesc123",
        lastSeenLat: 40.785091,
        lastSeenLong: -73.968285,
        photo: "http://example.co/photo"
      },
      { user: { id: "user123" } },
    );
    expect(getByText("Sighting Submitted!")).toBeTruthy();
    expect(
      getByText("Hang tight — we are processing your report."),
    ).toBeTruthy();

    expect(getByText("Matching Filters")).toBeTruthy();
    expect(
      getByText("We are searching for similar pets using these parameters"),
    ).toBeTruthy();
    expect(getByTestId("sighting-photo")).toBeTruthy();
    expect(getByText("View Matches")).toBeTruthy();
    expect(getByText("View Matches")).not.toBeDisabled();

    expect(await findByText("Last seen location: Central Park")).toBeTruthy();
    expect(await findByText("Last seen date: 10/1/2025")).toBeTruthy();
    expect(await findByText("Date range: Last 30 days")).toBeTruthy();
    expect(await findByText("Radius: 10 miles")).toBeTruthy();
    expect(await findByText("Species: Dog")).toBeTruthy();

    expect(mockGetMatchingSightings).not.toHaveBeenCalled();
    expect(await findByText("View Matches")).not.toBeDisabled();

    const viewMatchesButton = getByText("View Matches");
    fireEvent.press(viewMatchesButton);

    expect(mockRouterPush).not.toHaveBeenCalled();
  });

  it("renders progress page with error", async () => {
    mockGetMatchingSightings.mockRejectedValue(new Error("Error"));

    const { getByText, findByText, getByTestId } = renderWithAuthContext(
      {
        species: "dog",
        lastSeenLocation: "Central Park",
        lastSeenTime: new Date("10/01/2025").toISOString(),
        sightingId: "sighting123",
        petDescriptionId: "petDesc123",
        lastSeenLat: 40.785091,
        lastSeenLong: -73.968285,
        photo: "http://example.co/photo"
      },
      { user: null },
    );
    expect(getByText("Sighting Submitted!")).toBeTruthy();
    expect(
      getByText("Hang tight — we are processing your report."),
    ).toBeTruthy();

    expect(getByText("Matching Filters")).toBeTruthy();
    expect(
      getByText("We are searching for similar pets using these parameters"),
    ).toBeTruthy();
    expect(getByTestId("sighting-photo")).toBeTruthy();
    expect(getByText("View Matches")).toBeTruthy();
    expect(getByText("View Matches")).toBeDisabled();

    expect(await findByText("Last seen location: Central Park")).toBeTruthy();
    expect(await findByText("Last seen date: 10/1/2025")).toBeTruthy();
    expect(await findByText("Date range: Last 30 days")).toBeTruthy();
    expect(await findByText("Radius: 10 miles")).toBeTruthy();
    expect(await findByText("Species: Dog")).toBeTruthy();

    expect(mockGetMatchingSightings).toHaveBeenCalledWith(
      "sighting123",
      40.785091,
      -73.968285,
      20,
    );

    expect(await findByText("View Matches")).not.toBeDisabled();

    const viewMatchesButton = getByText("View Matches");
    fireEvent.press(viewMatchesButton);

    expect(mockRouterPush).toHaveBeenCalledWith(
      "/sightings/match/?sightingId=sighting123&petDescriptionId=petDesc123",
    );
  });
});
