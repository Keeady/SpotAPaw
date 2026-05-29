import React from "react";
import Auth from "../apple";
import { render, renderHook, waitFor } from "@testing-library/react-native";

const mockCredential = {
  identityToken: "mockIdentityToken",
};

const mockSignInAsync = jest.fn().mockResolvedValue(mockCredential);
jest.mock("expo-apple-authentication", () => ({
  signInAsync: (arg: any) => mockSignInAsync(arg),
  AppleAuthenticationScope: {
    EMAIL: "email",
  },
}));

const mockRouterReplace = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({
    replace: (path: string) => mockRouterReplace(path),
  }),
}));

const mockSigninWithIdToken = jest.fn().mockResolvedValue({});
jest.mock("@/auth/auth", () => ({
  AuthHandler: jest.fn().mockImplementation(() => ({
    signInWithIdToken: (credential: any) => mockSigninWithIdToken(credential),
  })),
}));

const mockLog = jest.fn();
jest.mock("@/components/logs", () => ({
  log: (message: string) => mockLog(message),
}));

jest.mock("@/components/util", () => ({
  createErrorLogMessage: jest.fn().mockReturnValue("Mock error message"),
}));

const mockShowMessage = jest.fn();
jest.mock("react-native-flash-message", () => ({
  showMessage: (message: any) => mockShowMessage(message),
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue: string) => defaultValue,
  }),
}));

describe("Apple Sign-In", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should sign in successfully with Apple", async () => {
    mockSignInAsync.mockResolvedValue(mockCredential);
    render(<Auth />);

    await waitFor(() => {
      expect(mockSignInAsync).toHaveBeenCalledWith({requestedScopes: ["email"]});
      expect(mockSigninWithIdToken).toHaveBeenCalledWith(mockCredential);
      expect(mockRouterReplace).toHaveBeenCalledWith("/(app)/my-sightings");
    });
  });

  it("should handle sign-in failure with Apple", async () => {
    const mockError = new Error("Apple sign-in failed");
    mockSignInAsync.mockRejectedValue(mockError);
    render(<Auth />);

    await waitFor(() => {
      expect(mockSignInAsync).toHaveBeenCalledWith({requestedScopes: ["email"]});
      expect(mockSigninWithIdToken).not.toHaveBeenCalled();
      expect(mockRouterReplace).not.toHaveBeenCalled();
      expect(mockLog).toHaveBeenCalledWith(
        "Apple login failed: Mock error message",
      );
      expect(mockShowMessage).toHaveBeenCalledWith({
        message: "Authentication failed. Please try again.",
        type: "warning",
        icon: "warning",
        statusBarHeight: 50,
      });
    });
  });

  it("should handle missing credentials during Apple sign-in", async () => {
    mockSignInAsync.mockResolvedValue({});
    render(<Auth />);

    await waitFor(() => {
      expect(mockSignInAsync).toHaveBeenCalledWith({requestedScopes: ["email"]});
      expect(mockSigninWithIdToken).not.toHaveBeenCalled();
      expect(mockRouterReplace).not.toHaveBeenCalled();
      expect(mockLog).toHaveBeenCalledWith("Apple login: No credential found.");
      expect(mockShowMessage).toHaveBeenCalledWith({
        message: "Authentication failed. Please try again.",
        type: "warning",
        icon: "warning",
        statusBarHeight: 50,
      });
    });
  });
});
