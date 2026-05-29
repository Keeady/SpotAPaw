import { fireEvent, render, waitFor } from "@testing-library/react-native";
import SignUpScreen from "../signup";
import { Platform } from "react-native";

/*jest.mock("expo-apple-authentication", () => ({
  AppleAuthenticationButton: jest.fn(() => "AppleAuthenticationButton"),
  AppleAuthenticationButtonType: {
    SIGN_UP: "SIGN_UP",
  },
  AppleAuthenticationButtonStyle: {
    BLACK: "BLACK",
  },
}));*/

jest.mock("validator/es/lib/isEmail", () =>
  jest.fn((email: string) => email.includes("@")),
);

const mockSignup = jest.fn().mockResolvedValue(undefined);
jest.mock("@/auth/auth", () => ({
  AuthHandler: jest.fn().mockImplementation(() => ({
    signUp: (email: string, password: string) =>
      mockSignup({ email, password }),
  })),
}));

const mockLog = jest.fn();
jest.mock("@/components/logs", () => ({
  log: (message: string) => mockLog(message),
}));

jest.mock("@/components/util", () => ({
  createErrorLogMessage: jest.fn((error) => `Error: ${error.message}`),
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const mockPush = jest.fn();
const mockNavigate = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: (path: string) => mockPush(path),
    navigate: (path: string) => mockNavigate(path),
  }),
}));

const mockShowMessage = jest.fn();
jest.mock("react-native-flash-message", () => ({
  showMessage: (message: any) => mockShowMessage(message),
}));

describe("SignUpScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly", async () => {
    const { getByText, getByTestId, findByText } = render(<SignUpScreen />);

    expect(getByText("welcome")).toBeTruthy();
    expect(getByText("joinACommunityOfPetsAndPetLovers")).toBeTruthy();
    expect(getByTestId("email-input")).toBeTruthy();
    expect(getByTestId("password-input")).toBeTruthy();
    expect(getByTestId("confirm-password-input")).toBeTruthy();
    expect(getByText("passwordRequirements")).toBeTruthy();
    expect(getByText("continueWithGoogle")).toBeTruthy();

    expect(getByText("createAnAccount")).toBeTruthy();
    expect(getByText("OR")).toBeTruthy();
    expect(getByText("alreadyHaveAnAccount")).toBeTruthy();
    expect(getByText("signIn")).toBeTruthy();

    expect(await findByText("invalidEmailAddress")).not.toBeVisible();
  });

  it("renders Apple sign-up button on iOS", () => {
    Object.defineProperty(Platform, "OS", { get: jest.fn(() => "ios") });
    const { getByTestId } = render(<SignUpScreen />);

    const appleButton = getByTestId("apple-signup-button");
    expect(appleButton).toBeTruthy();
    expect(getByTestId("google-signup-button")).toBeTruthy();

    fireEvent.press(appleButton);
    expect(mockPush).toHaveBeenCalledWith("/(auth)/apple");
  });

  it("does not render Apple sign-up button on Android", () => {
    Object.defineProperty(Platform, "OS", { get: jest.fn(() => "android") });

    const { queryByTestId, getByTestId } = render(<SignUpScreen />);

    expect(queryByTestId("apple-signup-button")).toBeNull();
    const googleButton = getByTestId("google-signup-button");
    expect(googleButton).toBeTruthy();

    fireEvent.press(googleButton);
    expect(mockPush).toHaveBeenCalledWith("/(auth)/oauth");
  });

  it("calls signin when pressing sign in link", () => {
    const { getByTestId } = render(<SignUpScreen />);
    const signInLink = getByTestId("signin-button");
    expect(signInLink).toBeTruthy();
    fireEvent.press(signInLink);
    expect(mockPush).toHaveBeenCalledWith("/(auth)/signin");
  });

  it("shows error message for empty email", async () => {
    const { getByText } = render(<SignUpScreen />);

    const createAccountBtn = getByText("createAnAccount");
    expect(createAccountBtn).toBeTruthy();

    fireEvent.press(createAccountBtn);

    expect(mockShowMessage).toHaveBeenCalledWith({
      message: "emailAndPasswordAreRequiredPleaseTryAgain",
      type: "warning",
      icon: "warning",
      autoHide: true,
      statusBarHeight: 50,
    });
  });

  it("shows error message for empty password", async () => {
    const { getByText, getByTestId } = render(<SignUpScreen />);

    const createAccountBtn = getByText("createAnAccount");
    const emailInput = getByTestId("email-input");
    fireEvent.changeText(emailInput, "test@example.com");
    fireEvent.press(createAccountBtn);

    expect(mockShowMessage).toHaveBeenCalledWith({
      message: "emailAndPasswordAreRequiredPleaseTryAgain",
      type: "warning",
      icon: "warning",
      autoHide: true,
      statusBarHeight: 50,
    });
  });

  it("shows error for passwords that do not match", async () => {
    const { getByText, getByTestId } = render(<SignUpScreen />);

    const emailInput = getByTestId("email-input");
    const passwordInput = getByTestId("password-input");
    const confirmPasswordInput = getByTestId("confirm-password-input");
    const createAccountBtn = getByText("createAnAccount");

    fireEvent.changeText(emailInput, "test@example.com");
    fireEvent.changeText(passwordInput, "password123");
    fireEvent.changeText(confirmPasswordInput, "password456");

    fireEvent.press(createAccountBtn);
    expect(mockShowMessage).toHaveBeenCalledWith({
      message: "passwordsDoNotMatchPleaseTryAgain",
      type: "warning",
      icon: "warning",
      autoHide: true,
      statusBarHeight: 50,
    });
  });

  it("disables create account button for invalid email format", async () => {
    const { getByText, getByTestId } = render(<SignUpScreen />);

    const emailInput = getByTestId("email-input");
    const passwordInput = getByTestId("password-input");
    const confirmPasswordInput = getByTestId("confirm-password-input");
    const createAccountBtn = getByText("createAnAccount");

    fireEvent.changeText(emailInput, "invalid-email");
    fireEvent.changeText(passwordInput, "password123");
    fireEvent.changeText(confirmPasswordInput, "password123");

    expect(createAccountBtn).not.toBeDisabled();
    fireEvent.press(createAccountBtn);
    expect(createAccountBtn).toBeDisabled();
  });

  it("shows error message for password that does not meet requirements", async () => {
    const { getByText, getByTestId } = render(<SignUpScreen />);

    const emailInput = getByTestId("email-input");
    const passwordInput = getByTestId("password-input");
    const confirmPasswordInput = getByTestId("confirm-password-input");
    const createAccountBtn = getByText("createAnAccount");

    fireEvent.changeText(emailInput, "test@example.com");
    fireEvent.changeText(passwordInput, "short");
    fireEvent.changeText(confirmPasswordInput, "short");

    fireEvent.press(createAccountBtn);
    expect(mockShowMessage).toHaveBeenCalledWith({
      message: "pleaseUseAStrongPassword",
      type: "warning",
      icon: "warning",
      autoHide: true,
      statusBarHeight: 50,
    });
  });

  it("calls signup with correct credentials", async () => {
    const { getByText, getByTestId } = render(<SignUpScreen />);

    const emailInput = getByTestId("email-input");
    const passwordInput = getByTestId("password-input");
    const confirmPasswordInput = getByTestId("confirm-password-input");
    const createAccountBtn = getByText("createAnAccount");

    fireEvent.changeText(emailInput, "test@example.com");
    fireEvent.changeText(passwordInput, "Password123!");
    fireEvent.changeText(confirmPasswordInput, "Password123!");

    fireEvent.press(createAccountBtn);
    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "Password123!",
      });

      expect(mockShowMessage).toHaveBeenCalledWith({
        message: "pleaseCheckYourInboxForEmailVerification",
        type: "success",
        icon: "success",
        autoHide: true,
        statusBarHeight: 50,
      });

      expect(mockNavigate).toHaveBeenCalledWith("/(auth)/resend");
    });
  });

  it("shows error message when signup fails", async () => {
    const { getByText, getByTestId } = render(<SignUpScreen />);

    const emailInput = getByTestId("email-input");
    const passwordInput = getByTestId("password-input");
    const confirmPasswordInput = getByTestId("confirm-password-input");
    const createAccountBtn = getByText("createAnAccount");

    fireEvent.changeText(emailInput, "test@example.com");
    fireEvent.changeText(passwordInput, "Password123!");
    fireEvent.changeText(confirmPasswordInput, "Password123!");

    const error = new Error("Signup failed");
    mockSignup.mockRejectedValueOnce(error);

    fireEvent.press(createAccountBtn);
    await waitFor(() => {
      expect(mockShowMessage).toHaveBeenCalledWith({
        message: "anErrorOccuredPleaseTryAgain",
        type: "danger",
        icon: "danger",
        autoHide: true,
        statusBarHeight: 50,
      });
      expect(mockLog).toHaveBeenCalledWith(
        "SignUp failed: Error: Signup failed",
      );
    });
  });
});
