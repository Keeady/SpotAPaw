import { useContext } from "react";
import { ProContext, ProContextProvider } from "./pro-context-provider";
import { render, waitFor } from "@testing-library/react-native";
import { AuthContext } from "./auth-provider";

jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

const mockPets = [{ petDescriptionId: null }, { petDescriptionId: "desc456" }];

const mockGetPets = jest.fn().mockResolvedValue(mockPets);
jest.mock("@/db/repositories/pet-repository", () => ({
  PetRepository: jest.fn().mockImplementation(() => ({
    getPets: (u: any) => mockGetPets(u),
  })),
}));

jest.mock("@/components/Provider/auth-provider", () => {
  const React = require("react");
  const fakeUser = { id: "test-user-id" };
  const AuthContext = React.createContext({ user: fakeUser });

  return {
    AuthContext,
  };
});

describe("ProContextProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("does not allow AI photo analysis if user has used feature", async () => {
    let contextValue: any;
    const TestComponent = () => {
      contextValue = useContext(ProContext);
      return null;
    };

    render(
      <ProContextProvider>
        <TestComponent />
      </ProContextProvider>,
    );

    // Wait for the async operations to complete
    await waitFor(() => {
      expect(contextValue).toBeDefined();
      expect(contextValue.isProUser).toBe(false);
      expect(contextValue.aiPhotoAnalysisAllowed).toBe(false);
    });

    // Verify that getPets was called with the correct user ID
    expect(mockGetPets).toHaveBeenCalledWith("test-user-id");
  });

  it("allows AI photo analysis if user has no pets", async () => {
    mockGetPets.mockResolvedValueOnce([]); // Simulate no pets for the user
    let contextValue: any;
    const TestComponent = () => {
      contextValue = useContext(ProContext);
      return null;
    };

    render(
      <ProContextProvider>
        <TestComponent />
      </ProContextProvider>,
    );

    // Wait for the async operations to complete
    await waitFor(() => {
      expect(contextValue).toBeDefined();
      expect(contextValue.isProUser).toBe(false);
      expect(contextValue.aiPhotoAnalysisAllowed).toBe(true);
    });
  });

  it("disallows AI photo analysis if no user is logged in", async () => {
    let contextValue: any;
    const TestComponent = () => {
      contextValue = useContext(ProContext);
      return null;
    };

    render(
      <AuthContext.Provider value={{ user: null }}>
        <ProContextProvider>
          <TestComponent />
        </ProContextProvider>
      </AuthContext.Provider>,
    );

    // Wait for the async operations to complete
    await waitFor(() => {
      expect(contextValue).toBeDefined();
      expect(contextValue.isProUser).toBe(false);
      expect(contextValue.aiPhotoAnalysisAllowed).toBe(false);
    });

    expect(mockGetPets).not.toHaveBeenCalled();
  });
});
