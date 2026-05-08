import { fireEvent, render } from "@testing-library/react-native";
import { UploadPhoto } from "./upload-photo";
import { AuthContext } from "../Provider/auth-provider";
import { AIFeatureContext } from "../Provider/ai-context-provider";
import { ProContext } from "../Provider/pro-context-provider";

const mockUpdateSightingData = jest.fn();
const mockOnResetErrorMessage = jest.fn();
const mockOnResetAiGeneratedPhoto = jest.fn();
const defaultProps = {
  updateSightingData: mockUpdateSightingData,
  sightingFormData: {
    photo: null,
    image: null,
  } as any,
  loading: false,
  isValidData: true,
  errorMessage: "",
  onResetErrorMessage: mockOnResetErrorMessage,
  onResetAiGeneratedPhoto: mockOnResetAiGeneratedPhoto,
  setReportType: jest.fn(),
};

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) => key,
  }),
}));

jest.mock("../Provider/auth-provider", () => {
  const React = require("react");
  const AuthContext = React.createContext({ user: null });

  return {
    AuthContext,
    useAuthContext: () => React.useContext(AuthContext),
  };
});

jest.mock("../Provider/ai-context-provider", () => {
  const React = require("react");
  const AIFeatureContext = React.createContext({ isAiFeatureEnabled: false });

  return {
    AIFeatureContext,
    useAIFeatureContext: () => React.useContext(AIFeatureContext),
  };
});

jest.mock("../Provider/pro-context-provider", () => {
  const React = require("react");
  const ProContext = React.createContext({ aiPhotoAnalysisAllowed: false });

  return {
    ProContext,
    useProContext: () => React.useContext(ProContext),
  };
});

const mockUploadOrTakePhoto = jest
  .fn()
  .mockImplementation((onAddPhoto: any) => {
    onAddPhoto("test-uri", "test-file-name", "image/jpeg");
  });
jest.mock("../image-picker", () => ({
  uploadOrTakePhoto: (c: any) => mockUploadOrTakePhoto(c),
}));

const renderWithContexts = (
  props: any,
  { user, isAiFeatureEnabled, aiPhotoAnalysisAllowed }: any,
) => {
  return render(
    <AuthContext.Provider value={{ user }}>
      <AIFeatureContext.Provider value={{ isAiFeatureEnabled }}>
        <ProContext.Provider value={{ aiPhotoAnalysisAllowed }}>
          <UploadPhoto {...props} />
        </ProContext.Provider>
      </AIFeatureContext.Provider>
    </AuthContext.Provider>,
  );
};

describe("UploadPhoto Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly with all required elements", async () => {
    const { getByText, findByText, queryByText } = renderWithContexts(
      defaultProps,
      {
        user: { id: "123", name: "Test User" },
        isAiFeatureEnabled: true,
        aiPhotoAnalysisAllowed: true,
      },
    );

    expect(getByText("uploadAPhoto")).toBeTruthy();
    expect(
      getByText("aPhotoWouldReallyHelpIdentifyThisPetFaster"),
    ).toBeTruthy();
    expect(getByText("addPhoto")).toBeTruthy();
    expect(getByText("uploadPhoto")).toBeTruthy();
    expect(getByText("aiWillFillOut")).toBeTruthy();
    expect(getByText("aiSettings")).toBeTruthy();

    expect(await findByText("uploadAPhoto")).toBeTruthy();
    expect(queryByText("pleaseAddAPhoto")).toBeNull();
  });

  it("renders with AI feature turned off", async () => {
    const props = {
      ...defaultProps,
      sightingFormData: {
        photo: null,
        image: { uri: "test-uri" },
      } as any,
    };
    const { getByText, findByText, queryByText, getByTestId } =
      renderWithContexts(props, {
        user: { id: "123", name: "Test User" },
        isAiFeatureEnabled: false,
        aiPhotoAnalysisAllowed: true,
      });

    expect(getByText("uploadAPhoto")).toBeTruthy();
    expect(
      getByText("aPhotoWouldReallyHelpIdentifyThisPetFaster"),
    ).toBeTruthy();
    expect(getByTestId("imageUri")).toBeTruthy();
    expect(getByText("changePhoto")).toBeTruthy();
    expect(getByText("aiWillFillOut")).toBeTruthy();
    expect(getByText("turnAiOn")).toBeTruthy();

    expect(await findByText("uploadAPhoto")).toBeTruthy();
    expect(queryByText("pleaseAddAPhoto")).toBeNull();
  });

  it("renders with AI feature turned on but without pro", async () => {
    const props = {
      ...defaultProps,
      sightingFormData: {
        photo: { uri: "test-uri" },
        image: null,
      } as any,
    };
    const { getByText, findByText, queryByText, getByTestId } =
      renderWithContexts(props, {
        user: { id: "123", name: "Test User" },
        isAiFeatureEnabled: true,
        aiPhotoAnalysisAllowed: false,
      });

    expect(getByText("uploadAPhoto")).toBeTruthy();
    expect(
      getByText("aPhotoWouldReallyHelpIdentifyThisPetFaster"),
    ).toBeTruthy();
    expect(getByTestId("photoUri")).toBeTruthy();
    expect(getByText("changePhoto")).toBeTruthy();
    expect(getByText("aiWillFillOut")).toBeTruthy();
    expect(getByText("purchasePro")).toBeTruthy();

    expect(await findByText("uploadAPhoto")).toBeTruthy();
    expect(queryByText("pleaseAddAPhoto")).toBeNull();
  });

  it("displays error message when there is an error", async () => {
    const props = {
      ...defaultProps,
      errorMessage: "Test error message",
    };
    const { getByText } = renderWithContexts(props, {
      user: { id: "123", name: "Test User" },
      isAiFeatureEnabled: true,
      aiPhotoAnalysisAllowed: true,
    });

    expect(getByText("Test error message")).toBeTruthy();
  });

  it("displays validation error when there are errors and no photo is added", async () => {
    const props = {
      ...defaultProps,
      isValidData: false,
    };
    const { getByText } = renderWithContexts(props, {
      user: { id: "123", name: "Test User" },
      isAiFeatureEnabled: true,
      aiPhotoAnalysisAllowed: true,
    });

    expect(getByText("pleaseAddAPhoto")).toBeTruthy();
  });

  it("displays loading message when loading", async () => {
    const props = {
      ...defaultProps,
      loading: true,
    };
    const { getByText } = renderWithContexts(props, {
      user: { id: "123", name: "Test User" },
      isAiFeatureEnabled: true,
      aiPhotoAnalysisAllowed: true,
    });

    expect(getByText("analyzingPhotoWithAi")).toBeTruthy();
  });

  it("does not display loading message when loading if ai is not enabled", async () => {
    const props = {
      ...defaultProps,
      loading: true,
    };
    const { queryByText } = renderWithContexts(props, {
      user: { id: "123", name: "Test User" },
      isAiFeatureEnabled: false,
      aiPhotoAnalysisAllowed: true,
    });

    expect(queryByText("analyzingPhotoWithAi")).toBeNull();
  });

  it("does not display loading message when loading if ai is not allowed", async () => {
    const props = {
      ...defaultProps,
      loading: true,
    };
    const { queryByText } = renderWithContexts(props, {
      user: { id: "123", name: "Test User" },
      isAiFeatureEnabled: true,
      aiPhotoAnalysisAllowed: false,
    });

    expect(queryByText("analyzingPhotoWithAi")).toBeNull();
  });

  it("calls onResetErrorMessage and onResetAiGeneratedPhoto when onAddPhoto is called", () => {
    const props = {
      ...defaultProps,
    };
    const { getByTestId } = renderWithContexts(props, {
      user: { id: "123", name: "Test User" },
      isAiFeatureEnabled: true,
      aiPhotoAnalysisAllowed: true,
    });

    const addPhotoButton = getByTestId("addPhotoBtn");
    fireEvent.press(addPhotoButton);

    expect(mockUploadOrTakePhoto).toHaveBeenCalledTimes(1);
    expect(mockOnResetErrorMessage).toHaveBeenCalledTimes(1);
    expect(mockOnResetAiGeneratedPhoto).toHaveBeenCalledTimes(1);
  });
});
