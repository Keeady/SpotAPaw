import { fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";
import PublicHome from "../index";
import { AuthContext } from "@/components/Provider/auth-provider";
import { Text } from "react-native";

const RedirectMock = ({ href }: any) => 
{
    return <Text>{`Redirect to ${href}`}</Text>;
}

const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: (path: string) => mockPush(path),
    replace: (path: string) => mockReplace(path),
  }),
  Redirect: ({ href }: any) => <RedirectMock href={href} />,
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock("@/components/Provider/auth-provider", () => {
  const React = jest.requireActual("react");
  return {
    AuthProvider: ({ children }: any) => <>{children}</>,
    AuthContext: React.createContext({
      user: null,
      session: null,
      loading: false,
    }),
  };
});


const mockUser = {
  id: "user-123",
  email: "user@example.com",
};

const renderWithAuthContext = (user: any = null) => {
  return render(
    <AuthContext.Provider value={{ user, session: null, loading: false }}>
      <PublicHome />
    </AuthContext.Provider>,
  );
};

describe("Index", () => {
  it("renders correctly with user and navigates to my-sightings", () => {
    const { getByText } = renderWithAuthContext(mockUser);
    
    expect(getByText("Redirect to /(app)/my-sightings")).toBeTruthy();
  });

  it("renders correctly without user and handles navigations", async () => {
    const { getByText } = renderWithAuthContext(null);

    await waitFor(() => {
    expect(getByText("title")).toBeTruthy();
    expect(getByText("signIn")).toBeTruthy();
    expect(getByText("createAnAccount")).toBeTruthy();
    expect(getByText("continueAsGuest")).toBeTruthy();
    expect(getByText("byUsing")).toBeTruthy();
    expect(getByText("SpotAPaw,")).toBeTruthy();

    const about = getByText("SpotAPaw,");
    fireEvent.press(about);
    expect(mockPush).toHaveBeenCalledWith("/about");

    expect(getByText("youAgreeToOur")).toBeTruthy();
    expect(getByText("privacyPolicy")).toBeTruthy();

    const privacyPolicy = getByText("privacyPolicy");
    fireEvent.press(privacyPolicy);
    expect(mockPush).toHaveBeenCalledWith("/privacy");

    expect(getByText("and")).toBeTruthy();
    expect(getByText("termsOfService")).toBeTruthy();

    const termsOfService = getByText("termsOfService");
    fireEvent.press(termsOfService);
    expect(mockPush).toHaveBeenCalledWith("/terms");

    });
  });
});
