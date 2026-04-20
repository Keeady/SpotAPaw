import { fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";
import { AuthContext } from "../Provider/auth-provider";
import { FindMatch } from "./find-match";
import { Text } from "react-native-paper";
import { TouchableOpacity } from "react-native";

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

// Mock all dependencies
const mockRouterPush = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
}));

const mockGetMatchingSightings = jest.fn();
jest.mock("@/db/repositories/sighting-repository", () => ({
  SightingRepository: jest.fn().mockImplementation(() => ({
    getSighting: jest.fn(),
    createSighting: jest.fn(),
    updateSighting: jest.fn(),
    getMatchingSightings: () => mockGetMatchingSightings(),
  })),
}));

jest.mock("../util", () => ({
  createErrorLogMessage: jest.fn(),
}));

jest.mock("../logs", () => ({
  log: jest.fn(),
}));

const mockSightingRenderer = ({ setSelectedSightingId, sighting }: any) => {
  return (
    <TouchableOpacity
      onPress={() => setSelectedSightingId(sighting.id)}
      testID={`sighting-${sighting.id}`}
    >
      <Text>Sighting id: {sighting.id}</Text>
      <Text>Linked Sighting Id: {sighting.linkedSightingId}</Text>
      <Text>Pet Id: {sighting.petId}</Text>
    </TouchableOpacity>
  );
};
jest.mock("../sightings/sighting-selection", () => ({
  SightingSelection: jest.fn(({ setSelectedSightingId, sightings }) => {
    return (
      <div>
        {sightings?.map((sighting: any) => (
          <div key={sighting.id}>
            {mockSightingRenderer({ sighting, setSelectedSightingId })}
          </div>
        ))}
      </div>
    );
  }),
}));

const fakeUser = { id: "test-user-id" };

describe("FindMatch", () => {
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
        <FindMatch {...defaultProps} />
      </AuthContext.Provider>,
    );
  };

  it("displays empty state when there are no sightings", async () => {
    const { getByText } = renderWithAuthContext({}, { user: fakeUser });

    expect(getByText("Looking For Possible Matches")).toBeTruthy();
    expect(
      getByText("Looking for pets matching your pet's description."),
    ).toBeTruthy();
    expect(getByText("No Matches Found Yet")).toBeTruthy();
    expect(
      getByText(
        "We will keep looking. Come back soon as new sightings are reported every day.",
      ),
    ).toBeTruthy();
  });

  it("displays empty state when petDescriptionId is empty", async () => {
    const { getByText } = renderWithAuthContext(
      { sightingId: "test-sighting-id" },
      { user: fakeUser },
    );

    expect(getByText("Looking For Possible Matches")).toBeTruthy();
    expect(
      getByText("Looking for pets matching your pet's description."),
    ).toBeTruthy();
    expect(getByText("No Matches Found Yet")).toBeTruthy();
    expect(
      getByText(
        "We will keep looking. Come back soon as new sightings are reported every day.",
      ),
    ).toBeTruthy();
  });

  it("displays empty state when sightingId is empty", async () => {
    const { getByText } = renderWithAuthContext(
      { petDescriptionId: "test-pet-description-id" },
      { user: fakeUser },
    );

    expect(getByText("Looking For Possible Matches")).toBeTruthy();
    expect(
      getByText("Looking for pets matching your pet's description."),
    ).toBeTruthy();
    expect(getByText("No Matches Found Yet")).toBeTruthy();
    expect(
      getByText(
        "We will keep looking. Come back soon as new sightings are reported every day.",
      ),
    ).toBeTruthy();
  });

  it("displays empty state when there is an error", async () => {
    mockGetMatchingSightings.mockRejectedValue(new Error("Test error"));
    const { getByText, findByText } = renderWithAuthContext(
      {
        sightingId: "test-sighting-id",
        petDescriptionId: "test-pet-description-id",
      },
      { user: fakeUser },
    );

    expect(getByText("Looking For Possible Matches")).toBeTruthy();
    expect(
      getByText("Looking for pets matching your pet's description."),
    ).toBeTruthy();
    expect(await findByText("Looking for possible matches...")).toBeTruthy();

    expect(await findByText("No Matches Found Yet")).toBeTruthy();
    expect(
      await findByText(
        "We will keep looking. Come back soon as new sightings are reported every day.",
      ),
    ).toBeTruthy();
  });

  it("displays no matches when there are no matches", async () => {
    mockGetMatchingSightings.mockResolvedValue([]);
    const { getByText, findByText } = renderWithAuthContext(
      {
        sightingId: "test-sighting-id",
        petDescriptionId: "test-pet-description-id",
      },
      { user: fakeUser },
    );

    expect(getByText("Looking For Possible Matches")).toBeTruthy();
    expect(
      getByText("Looking for pets matching your pet's description."),
    ).toBeTruthy();
    expect(await findByText("No Matches Found Yet")).toBeTruthy();
    expect(
      await findByText(
        "We will keep looking. Come back soon as new sightings are reported every day.",
      ),
    ).toBeTruthy();
  });

  it("displays loading state when loading matches", async () => {
    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    mockGetMatchingSightings.mockImplementation(() =>
      delay(100).then(() => []),
    );
    const { getByText, findByText } = renderWithAuthContext(
      {
        sightingId: "test-sighting-id",
        petDescriptionId: "test-pet-description-id",
      },
      { user: fakeUser },
    );
    expect(getByText("Looking For Possible Matches")).toBeTruthy();
    expect(
      getByText("Looking for pets matching your pet's description."),
    ).toBeTruthy();

    expect(await findByText("Looking for possible matches...")).toBeTruthy();
  });

  it("displays matches when there are matches", async () => {
    const mockSightings: any[] = [
      {
        id: "sighting-1",
        petId: "pet-1",
        linkedSightingId: "linked-sighting-1",
      },
      {
        id: "sighting-2",
        petId: "",
        linkedSightingId: "linked-sighting-2",
      },
      {
        id: "sighting-3",
        petId: null,
        linkedSightingId: null,
      },
    ];

    mockGetMatchingSightings.mockResolvedValue(mockSightings);
    const { queryByText, getByText, findByText } = renderWithAuthContext(
      {
        sightingId: "test-sighting-id",
        petDescriptionId: "test-pet-description-id",
      },
      { user: fakeUser },
    );

    expect(getByText("Looking For Possible Matches")).toBeTruthy();
    expect(
      getByText("Looking for pets matching your pet's description."),
    ).toBeTruthy();

    expect(await findByText("Possible Matches Found")).toBeTruthy();
    expect(
      await findByText("These pets closely match the description."),
    ).toBeTruthy();

    expect(queryByText("Looking For Possible Matches")).toBeNull();
    expect(
      queryByText("Looking for pets matching your pet's description."),
    ).toBeNull();

    expect(await findByText("Sighting id: sighting-1")).toBeTruthy();
    expect(
      await findByText("Linked Sighting Id: linked-sighting-1"),
    ).toBeTruthy();
    expect(await findByText("Pet Id: pet-1")).toBeTruthy();

    expect(await findByText("Sighting id: sighting-2")).toBeTruthy();
    expect(
      await findByText("Linked Sighting Id: linked-sighting-2"),
    ).toBeTruthy();
    expect(await queryByText("Pet Id: sighting-2")).toBeNull();

    expect(await findByText("Sighting id: sighting-3")).toBeTruthy();
    expect(await queryByText("Linked Sighting Id: sighting-3")).toBeNull();
    expect(await queryByText("Pet Id: sighting-3")).toBeNull();
  });

  it("navigates to sighting details when a sighting is selected", async () => {
    const mockSightings: any[] = [
      {
        id: "sighting-1",
        petId: "pet-1",
        linkedSightingId: "linked-sighting-1",
      },
    ];

    mockGetMatchingSightings.mockResolvedValue(mockSightings);
    const { queryByText, findByText, findByTestId } = renderWithAuthContext(
      {
        sightingId: "test-sighting-id",
        petDescriptionId: "test-pet-description-id",
      },
      { user: fakeUser },
    );

    expect(findByText("Looking For Possible Matches")).toBeTruthy();
    expect(
      findByText("Looking for pets matching your pet's description."),
    ).toBeTruthy();
    expect(findByText(" Looking for possible matches...")).toBeTruthy();

    expect(await findByText("Possible Matches Found")).toBeTruthy();
    expect(
      await findByText("These pets closely match the description."),
    ).toBeTruthy();

    expect(queryByText("No Matches Found Yet")).toBeNull();
    expect(
      queryByText(
        "We will keep looking. Come back soon as new sightings are reported every day.",
      ),
    ).toBeNull();

    expect(await findByText("Sighting id: sighting-1")).toBeTruthy();
    expect(
      await findByText("Linked Sighting Id: linked-sighting-1"),
    ).toBeTruthy();
    expect(await findByText("Pet Id: pet-1")).toBeTruthy();

    const button = await findByTestId("sighting-sighting-1");
    fireEvent.press(button);
    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith(
        `/my-sightings/sighting-1?linkedSightingId=linked-sighting-1&petId=pet-1`,
      );
    });
  });

  it("navigates to sighting details when a sighting is selected", async () => {
    const mockSightings: any[] = [
      {
        id: "sighting-1",
        petId: "pet-1",
        linkedSightingId: "linked-sighting-1",
      },
      {
        id: "sighting-2",
        petId: "",
        linkedSightingId: "linked-sighting-2",
      },
    ];

    mockGetMatchingSightings.mockResolvedValue(mockSightings);
    const { findByTestId } = renderWithAuthContext(
      {
        sightingId: "test-sighting-id",
        petDescriptionId: "test-pet-description-id",
      },
      { user: null },
    );

    const button = await findByTestId("sighting-sighting-2");
    fireEvent.press(button);
    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith(
        `/sightings/sighting-2?linkedSightingId=linked-sighting-2`,
      );
    });
  });
});
