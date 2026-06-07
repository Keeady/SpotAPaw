import { render } from "@testing-library/react-native";
import React from "react";
import { Text } from "react-native";
import { Provider as PaperProvider } from "react-native-paper";
import ProFeatureSetting from "./pro-features-setting";
import { ProContext } from "../Provider/pro-context-provider";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) => key,
  }),
}));

jest.mock("../Provider/pro-context-provider", () => {
  const React = jest.requireActual("react");
  const ProContext = React.createContext({ isProUser: false });

  return {
    ProContext,
    useProContext: () => React.useContext(ProContext),
  };
});

const MockIcon = () => <Text testID="icon">Icon</Text>;
let mockIsProUser = true;
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <PaperProvider settings={{ icon: MockIcon }}>
    <ProContext.Provider value={{ isProUser: mockIsProUser }}>
      {children}
    </ProContext.Provider>
  </PaperProvider>
);

describe("ProFeatureSetting Component", () => {
  const defaultProps = {
    iconColorPro: "#007AFF",
    iconColorAIOn: "#007AFF",
    iconColorAIOff: "#CCCCCC",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly with all required elements", () => {
    const { getByText, getAllByText } = render(
      <TestWrapper>
        <ProFeatureSetting {...defaultProps} />
      </TestWrapper>,
    );

    expect(getByText("proFeatures")).toBeTruthy();
    expect(getByText("aiPhotoAnalysis")).toBeTruthy();
    expect(getByText("aiPhotoAnalysisDescription")).toBeTruthy();
    expect(getByText("expandedSearch")).toBeTruthy();
    expect(getByText("expandedSearchDescription")).toBeTruthy();

    const icons = getAllByText("Icon");
    expect(icons.length).toBe(6); // 3 features x 2 icons each (left and right)
  });

  it("shows lock icons when user is not a Pro user", () => {
    mockIsProUser = false;
    const { getByText, getAllByText } = render(
      <TestWrapper>
        <ProFeatureSetting {...defaultProps} />
      </TestWrapper>,
    );

    expect(getByText("proFeatures")).toBeTruthy();
    expect(getByText("aiPhotoAnalysis")).toBeTruthy();
    expect(getByText("aiPhotoAnalysisDescription")).toBeTruthy();
    expect(getByText("expandedSearch")).toBeTruthy();
    expect(getByText("expandedSearchDescription")).toBeTruthy();

    const icons = getAllByText("Icon");
    expect(icons.length).toBe(6); // 3 features x 2 icons each (left and right)
  });
});
