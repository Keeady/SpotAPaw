import { render } from "@testing-library/react-native";
import { AIFieldAnalysisBannerOrHelperText } from "./ai-banner";
import { PaperProvider } from "react-native-paper";
import { Text } from "react-native";

const MockIcon = () => <Text testID="creation-outline">Icon</Text>;
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <PaperProvider settings={{ icon: MockIcon }}>{children}</PaperProvider>
);

describe("AI Banner", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render the banner when loading is false and aiGenerated is true", () => {
    const { getByText, getByTestId } = render(
      <TestWrapper>
        <AIFieldAnalysisBannerOrHelperText loading={false} aiGenerated={true} />
      </TestWrapper>,
    );

    expect(getByText("AI-suggested")).toBeTruthy();
    expect(getByTestId("creation-outline")).toBeTruthy();
  });

  it("should not render the banner when loading is true", () => {
    const { queryByText, queryByTestId } = render(
      <TestWrapper>
        <AIFieldAnalysisBannerOrHelperText loading={true} aiGenerated={true} />
      </TestWrapper>,
    );

    expect(queryByText("AI-suggested")).toBeNull();
    expect(queryByTestId("creation-outline")).toBeNull();
  });

  it("should not render the banner when aiGenerated is false", () => {
    const { queryByText, queryByTestId } = render(
      <TestWrapper>
        <AIFieldAnalysisBannerOrHelperText
          loading={false}
          aiGenerated={false}
        />
      </TestWrapper>,
    );

    expect(queryByText("AI-suggested")).toBeNull();
    expect(queryByTestId("creation-outline")).toBeNull();
  });

  it("should render helper text when aiGenerated is false and helperText is provided", () => {
    const helperText = "This is helper text";
    const { getByText } = render(
      <TestWrapper>
        <AIFieldAnalysisBannerOrHelperText
          loading={false}
          aiGenerated={false}
          helperText={<Text>{helperText}</Text>}
        />
      </TestWrapper>,
    );

    expect(getByText(helperText)).toBeTruthy();
  });

  it("should not render helper text when aiGenerated is false and helperText is not provided", () => {
    const { queryByText } = render(
      <TestWrapper>
        <AIFieldAnalysisBannerOrHelperText
          loading={false}
          aiGenerated={false}
        />
      </TestWrapper>,
    );

    expect(queryByText("This is helper text")).toBeNull();
  });
});
