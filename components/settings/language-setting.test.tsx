import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import { Text } from "react-native";
import { Provider as PaperProvider } from "react-native-paper";
import { SupportedLanguage } from "../location-request-util";
import LanguageSetting from "./language-setting";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) => key,
  }),
}));

const MockIcon = () => <Text testID="icon">Icon</Text>;
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <PaperProvider settings={{ icon: MockIcon }}>{children}</PaperProvider>
);

describe("LanguageSetting Component", () => {
  const mockLanguages: SupportedLanguage[] = [
    { code: "en", name: "English", nativeName: "English" },
    { code: "es", name: "Spanish", nativeName: "Español" },
    { code: "fr", name: "French", nativeName: "Français" },
    { code: "de", name: "German", nativeName: "Deutsch" },
  ];

  const defaultProps = {
    iconColorLanguage: "#007AFF",
    languageSelectedDescription: "English",
    onLanguagePress: jest.fn(),
    languageDialogVisible: false,
    handleLanguageChange: jest.fn(),
    selectedLanguage: "en",
    languages: mockLanguages,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly with all required elements", () => {
    const { getByText } = render(
      <TestWrapper>
        <LanguageSetting {...defaultProps} />
      </TestWrapper>,
    );

    expect(getByText("language")).toBeTruthy();
    expect(getByText("English")).toBeTruthy();
    expect(getByText("Icon")).toBeTruthy();
  });

  it("displays the correct language description", () => {
    const props = {
      ...defaultProps,
      languageSelectedDescription: "Español",
    };

    const { getByText } = render(
      <TestWrapper>
        <LanguageSetting {...props} />
      </TestWrapper>,
    );

    expect(getByText("Español")).toBeTruthy();
  });

  it("calls onLanguagePress when the List.Item is pressed", () => {
    const { getByText } = render(
      <TestWrapper>
        <LanguageSetting {...defaultProps} />
      </TestWrapper>,
    );

    const listItem = getByText("language");
    fireEvent.press(listItem);

    expect(defaultProps.onLanguagePress).toHaveBeenCalledTimes(1);
  });

  it("does not render the LanguageSelectionDialog when dialog is hidden", () => {
    const { queryByText } = render(
      <TestWrapper>
        <LanguageSetting {...defaultProps} />
      </TestWrapper>,
    );

    // Dialog should not be visible when languageDialogVisible is false
    expect(queryByText("Select Language")).toBeNull();
  });

  it("renders the LanguageSelectionDialog when dialog is visible", async () => {
    const props = {
      ...defaultProps,
      languageDialogVisible: true,
    };

    const { findByText } = render(
      <TestWrapper>
        <LanguageSetting {...props} />
      </TestWrapper>,
    );

    // Dialog should be visible when languageDialogVisible is true
    expect(await findByText("selectLanguage")).toBeTruthy();
    expect(await findByText("cancel")).toBeTruthy();
  });

  it("renders all language options in the dialog", async () => {
    const props = {
      ...defaultProps,
      languageDialogVisible: true,
    };

    const { findByText } = render(
      <TestWrapper>
        <LanguageSetting {...props} />
      </TestWrapper>,
    );

    // Check that all languages are rendered with their native names
    expect(await findByText("English (English)")).toBeTruthy();
    expect(await findByText("Spanish (Español)")).toBeTruthy();
    expect(await findByText("French (Français)")).toBeTruthy();
    expect(await findByText("German (Deutsch)")).toBeTruthy();
  });

  it("calls handleLanguageChange when a language option is selected", async () => {
    const mockHandleLanguageChange = jest.fn();
    const props = {
      ...defaultProps,
      languageDialogVisible: true,
      handleLanguageChange: mockHandleLanguageChange,
    };

    const { findByText } = render(
      <TestWrapper>
        <LanguageSetting {...props} />
      </TestWrapper>,
    );

    const spanishOption = await findByText("Spanish (Español)");
    fireEvent.press(spanishOption);

    expect(mockHandleLanguageChange).toHaveBeenCalledWith("es");
  });

  it("calls onLanguagePress when Cancel button is pressed in the dialog", async () => {
    const mockOnLanguagePress = jest.fn();
    const props = {
      ...defaultProps,
      languageDialogVisible: true,
      onLanguagePress: mockOnLanguagePress,
    };

    const { findByText } = render(
      <TestWrapper>
        <LanguageSetting {...props} />
      </TestWrapper>,
    );

    const cancelButton = await findByText("cancel");
    fireEvent.press(cancelButton);

    expect(mockOnLanguagePress).toHaveBeenCalledTimes(1);
  });

  it("renders with different selected languages", () => {
    const testCases = [
      { selectedLanguage: "es", description: "Español" },
      { selectedLanguage: "fr", description: "Français" },
      { selectedLanguage: "de", description: "Deutsch" },
    ];

    testCases.forEach(({ selectedLanguage, description }) => {
      const props = {
        ...defaultProps,
        selectedLanguage,
        languageSelectedDescription: description,
      };

      const { getByText } = render(
        <TestWrapper>
          <LanguageSetting {...props} />
        </TestWrapper>,
      );

      expect(getByText(description)).toBeTruthy();
    });
  });

  it("handles empty languages array", async () => {
    const props = {
      ...defaultProps,
      languageDialogVisible: true,
      languages: [],
    };

    const { findByText, queryByText } = render(
      <TestWrapper>
        <LanguageSetting {...props} />
      </TestWrapper>,
    );

    // Dialog should still render but with no language options
    expect(await findByText("selectLanguage")).toBeTruthy();
    expect(await findByText("cancel")).toBeTruthy();
    expect(queryByText("English (English)")).toBeNull();
  });

  it("renders with single language option", async () => {
    const singleLanguage: SupportedLanguage[] = [
      { code: "en", name: "English", nativeName: "English" },
    ];

    const props = {
      ...defaultProps,
      languageDialogVisible: true,
      languages: singleLanguage,
    };

    const { findByText, queryByText } = render(
      <TestWrapper>
        <LanguageSetting {...props} />
      </TestWrapper>,
    );

    expect(await findByText("English (English)")).toBeTruthy();
    expect(queryByText("Spanish (Español)")).toBeNull();
  });
});
