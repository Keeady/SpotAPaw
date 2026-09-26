import { render } from "@testing-library/react-native";
import { useLocalSearchParams } from "expo-router";
import Match from "../match";

// Mock dependencies
jest.mock("expo-router", () => ({
  useLocalSearchParams: jest.fn(),
}));

jest.mock("@/components/wizard/find-match", () => ({
  FindMatch: jest.fn(
    ({ sightingFormData, updateSightingData, loading, setReportType }) => {
      const MockFindMatch = require("react-native").View;
      return (
        <MockFindMatch
          testID="find-match"
          sightingFormData={sightingFormData}
          updateSightingData={updateSightingData}
          loading={loading}
          setReportType={setReportType}
        />
      );
    },
  ),
}));

const mockUseLocalSearchParams = useLocalSearchParams as jest.MockedFunction<
  typeof useLocalSearchParams
>;

describe("Match", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render FindMatch component with search params", () => {
    const mockParams = {
      sightingId: "sighting-123",
      petDescriptionId: "pet-456",
    };

    mockUseLocalSearchParams.mockReturnValue(mockParams);

    const { getByTestId } = render(<Match />);

    const findMatchComponent = getByTestId("find-match");
    expect(findMatchComponent).toBeTruthy();
    expect(findMatchComponent.props.sightingFormData).toEqual(mockParams);
  });

  it("should pass correct props to FindMatch component", () => {
    const mockParams = {
      sightingId: "test-sighting-id",
      petDescriptionId: "test-pet-description-id",
    };

    mockUseLocalSearchParams.mockReturnValue(mockParams);

    const { getByTestId } = render(<Match />);

    const findMatchComponent = getByTestId("find-match");

    expect(findMatchComponent.props.sightingFormData).toEqual({
      sightingId: "test-sighting-id",
      petDescriptionId: "test-pet-description-id",
    });
    expect(findMatchComponent.props.loading).toBe(false);
    expect(typeof findMatchComponent.props.updateSightingData).toBe("function");
    expect(typeof findMatchComponent.props.setReportType).toBe("function");
  });

  it("should handle missing search params", () => {
    mockUseLocalSearchParams.mockReturnValue({});

    const { getByTestId } = render(<Match />);

    const findMatchComponent = getByTestId("find-match");
    expect(findMatchComponent.props.sightingFormData).toEqual({
      sightingId: undefined,
      petDescriptionId: undefined,
    });
  });

  it("should handle partial search params", () => {
    const mockParams = {
      sightingId: "only-sighting-id",
    };

    mockUseLocalSearchParams.mockReturnValue(mockParams);

    const { getByTestId } = render(<Match />);

    const findMatchComponent = getByTestId("find-match");
    expect(findMatchComponent.props.sightingFormData).toEqual({
      sightingId: "only-sighting-id",
      petDescriptionId: undefined,
    });
  });

  it("should render without crashing when useLocalSearchParams returns null values", () => {
    mockUseLocalSearchParams.mockReturnValue({
      sightingId: null,
      petDescriptionId: null,
    });

    expect(() => render(<Match />)).not.toThrow();
  });

  it("should call updateSightingData function without errors", () => {
    const mockParams = {
      sightingId: "sighting-123",
      petDescriptionId: "pet-456",
    };

    mockUseLocalSearchParams.mockReturnValue(mockParams);

    const { getByTestId } = render(<Match />);

    const findMatchComponent = getByTestId("find-match");

    // Test that the function can be called without throwing
    expect(() => {
      findMatchComponent.props.updateSightingData();
    }).not.toThrow();
  });

  it("should call setReportType function without errors", () => {
    const mockParams = {
      sightingId: "sighting-123",
      petDescriptionId: "pet-456",
    };

    mockUseLocalSearchParams.mockReturnValue(mockParams);

    const { getByTestId } = render(<Match />);

    const findMatchComponent = getByTestId("find-match");

    // Test that the function can be called without throwing
    expect(() => {
      findMatchComponent.props.setReportType();
    }).not.toThrow();
  });
});
