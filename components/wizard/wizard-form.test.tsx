import { PetRepository } from "@/db/repositories/pet-repository";
import { SightingRepository } from "@/db/repositories/sighting-repository";
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { showMessage } from "react-native-flash-message";
import { usePetAnalyzer } from "../analyzer/use-pet-image-analyzer";
import useUploadPetImageUrl from "../image-upload-handler";
import { useAIFeatureContext } from "../Provider/ai-context-provider";
import { AuthContext } from "../Provider/auth-provider";
import { isValidUuid } from "../util";
import { defaultSightingFormData, validate } from "./util";
import { WizardForm } from "./wizard-form";

// Mock all dependencies
jest.mock("expo-router", () => ({
  useLocalSearchParams: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock("react-native-flash-message", () => ({
  showMessage: jest.fn(),
}));

jest.mock("../analyzer/use-pet-image-analyzer", () => ({
  usePetAnalyzer: jest.fn(),
}));

jest.mock("../image-upload-handler", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("../Provider/ai-context-provider", () => ({
  useAIFeatureContext: jest.fn(),
}));

jest.mock("../Provider/auth-provider", () => {
  const React = jest.requireActual("react");
  return {
    AuthContext: React.createContext({
      user: null,
      signOut: jest.fn(),
      signIn: jest.fn(),
      session: null,
    }),
  };
});

jest.mock("@/db/repositories/sighting-repository", () => ({
  SightingRepository: jest.fn().mockImplementation(() => ({
    getSighting: jest.fn(),
    createSighting: jest.fn(),
    updateSighting: jest.fn(),
  })),
}));

jest.mock("@/db/repositories/pet-repository", () => ({
  PetRepository: jest.fn().mockImplementation(() => ({
    getPet: jest.fn(),
    createPet: jest.fn(),
    updatePet: jest.fn(),
  })),
}));

jest.mock("./util", () => ({
  ...jest.requireActual("./util"),
  validate: jest.fn(),
}));

jest.mock("../util", () => ({
  createErrorLogMessage: jest.fn().mockReturnValue("Error log message"),
  isValidUuid: jest.fn(),
}));

// Mock step components
jest.mock("./start", () => {
  const React = jest.requireActual("react");
  const { Text } = jest.requireActual("react-native");
  return {
    Step1: ({ loading }: any) => (
      <Text>{loading ? "Loading..." : "Start Step"}</Text>
    ),
  };
});

jest.mock("./upload-photo", () => {
  const React = jest.requireActual("react");
  const { Text } = jest.requireActual("react-native");
  return {
    UploadPhoto: ({ loading }: any) => (
      <Text>{loading ? "Loading..." : "Upload Photo Step"}</Text>
    ),
  };
});

jest.mock("./choose-pet", () => {
  const React = jest.requireActual("react");
  const { Text } = jest.requireActual("react-native");
  return {
    ChoosePet: ({ loading }: any) => (
      <Text>{loading ? "Loading..." : "Choose Pet Step"}</Text>
    ),
  };
});

jest.mock("./edit-pet", () => {
  const React = jest.requireActual("react");
  const { Text } = jest.requireActual("react-native");
  return {
    EditPet: ({ loading }: any) => (
      <Text>{loading ? "Loading..." : "Edit Pet Step"}</Text>
    ),
  };
});

jest.mock("./edit-pet-continued", () => {
  const React = jest.requireActual("react");
  const { Text } = jest.requireActual("react-native");
  return {
    EditPetContinued: ({ loading }: any) => (
      <Text>{loading ? "Loading..." : "Edit Pet Continued Step"}</Text>
    ),
  };
});

jest.mock("./locate-pet", () => {
  const React = jest.requireActual("react");
  const { Text } = jest.requireActual("react-native");
  return {
    LocatePet: ({ loading }: any) => (
      <Text>{loading ? "Loading..." : "Locate Pet Step"}</Text>
    ),
  };
});

jest.mock("./add-time", () => {
  const React = jest.requireActual("react");
  const { Text } = jest.requireActual("react-native");
  return {
    AddTime: ({ loading }: any) => (
      <Text>{loading ? "Loading..." : "Add Time Step"}</Text>
    ),
  };
});

jest.mock("./add-contact", () => {
  const React = jest.requireActual("react");
  const { Text } = jest.requireActual("react-native");
  return {
    AddContact: ({ loading }: any) => (
      <Text>{loading ? "Loading..." : "Add Contact Step"}</Text>
    ),
  };
});

// Mock submission handlers
jest.mock("./sighting-submit-handler", () => ({
  createSightingFromPet: jest.fn(),
  saveNewSighting: jest.fn(),
  saveSightingPhoto: jest.fn(),
  updateSighting: jest.fn(),
}));

jest.mock("./pet-submit-handler", () => ({
  saveNewPet: jest.fn(),
  saveNewPetPhoto: jest.fn(),
  updateNewPetPhoto: jest.fn(),
  updatePet: jest.fn(),
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock("../logs", () => ({
  log: jest.fn(),
}));

const mockUseLocalSearchParams = useLocalSearchParams as jest.MockedFunction<
  typeof useLocalSearchParams
>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockShowMessage = showMessage as jest.MockedFunction<typeof showMessage>;
const mockUsePetAnalyzer = usePetAnalyzer as jest.MockedFunction<
  typeof usePetAnalyzer
>;
const mockUseUploadPetImageUrl = useUploadPetImageUrl as jest.MockedFunction<
  typeof useUploadPetImageUrl
>;
const mockUseAIFeatureContext = useAIFeatureContext as jest.MockedFunction<
  typeof useAIFeatureContext
>;
const mockSightingRepository = SightingRepository as jest.MockedClass<
  typeof SightingRepository
>;
const mockPetRepository = PetRepository as jest.MockedClass<
  typeof PetRepository
>;
const mockValidate = validate as jest.MockedFunction<typeof validate>;
const mockIsValidUuid = isValidUuid as jest.MockedFunction<typeof isValidUuid>;

describe("WizardForm", () => {
  const mockRouter = {
    replace: jest.fn(),
    push: jest.fn(),
    back: jest.fn(),
  } as any;

  const mockUser = {
    id: "user-123",
    email: "test@example.com",
  };

  const mockAuthContext = {
    user: mockUser,
    signOut: jest.fn(),
    signIn: jest.fn(),
    session: null,
  } as any;

  const mockAnalyze = jest.fn();
  const mockUploadImage = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    mockUseLocalSearchParams.mockReturnValue({});
    mockUseRouter.mockReturnValue(mockRouter);
    mockUseAIFeatureContext.mockReturnValue({
      isAiFeatureEnabled: true,
      saveAIFeatureContext: jest.fn(),
    });
    mockUsePetAnalyzer.mockReturnValue({
      analyze: mockAnalyze,
      loading: false,
    });
    mockUseUploadPetImageUrl.mockReturnValue(mockUploadImage);

    // Mock repositories
    mockSightingRepository.mockImplementation(
      () =>
        ({
          getSighting: jest.fn().mockResolvedValue({
            id: "sighting-123",
            petId: "pet-456",
          }),
          createSighting: jest.fn(),
          updateSighting: jest.fn(),
        }) as any,
    );

    mockPetRepository.mockImplementation(
      () =>
        ({
          getPet: jest.fn().mockResolvedValue({
            id: "pet-456",
            name: "Fluffy",
          }),
          createPet: jest.fn(),
          updatePet: jest.fn(),
        }) as any,
    );

    // Mock validation
    mockValidate.mockReturnValue(true);
    mockIsValidUuid.mockReturnValue(true);
  });

  const renderWizardForm = (action = "new-sighting") => {
    return render(
      <AuthContext.Provider value={mockAuthContext}>
        <WizardForm action={action as any} />
      </AuthContext.Provider>,
    );
  };

  describe("Component Rendering", () => {
    it("should render start step by default for new-sighting", () => {
      const { getByText } = renderWizardForm("new-sighting");
      
      expect(getByText("Start Step")).toBeTruthy();
      expect(getByText("Continue")).toBeTruthy();
      expect(getByText("Back")).toBeTruthy();
    });

    it("should render upload photo step for edit-sighting action", async () => {
      mockUseLocalSearchParams.mockReturnValue({ id: "sighting-123" });
      mockIsValidUuid.mockReturnValue(true);

      const { findByText } = renderWizardForm("edit-sighting");
      expect(await findByText("Upload Photo Step")).toBeTruthy();
      expect(await findByText("Continue")).toBeTruthy();
    });

    it("should render upload photo step for add-pet action", () => {
      const { getByText } = renderWizardForm("add-pet");

      expect(getByText("Upload Photo Step")).toBeTruthy();
      expect(getByText("Continue")).toBeTruthy();
    });

    it("should render upload photo step for edit-pet action", () => {
      const { getByText } = renderWizardForm("edit-pet");

      expect(getByText("Upload Photo Step")).toBeTruthy();
      expect(getByText("Continue")).toBeTruthy();
    });

    it("should disable back button when no step history", () => {
      const { getByText } = renderWizardForm("new-sighting");
      const backButton = getByText("Back");

      expect(backButton).toBeDisabled();
    });
  });

  describe("Step Navigation", () => {
    beforeEach(() => {
      mockValidate.mockReturnValue(true);
    });

    it("should navigate to next step on continue button press", async () => {
      const { getByText } = renderWizardForm("new-sighting");
      const continueButton = getByText("Continue");

      await act(async () => {
        fireEvent.press(continueButton);
      });

      // Should move to upload_photo step
      await waitFor(() => {
        expect(getByText("Upload Photo Step")).toBeTruthy();
      });
    });

    it("should navigate back to previous step", async () => {
      const { getByText } = renderWizardForm("new-sighting");
      
      // First navigate forward to have history
      await act(async () => {
        fireEvent.press(getByText("Continue"));
      });

      await waitFor(() => {
        expect(getByText("Upload Photo Step")).toBeTruthy();
      });

      // Now navigate back
      await act(async () => {
        fireEvent.press(getByText("Back"));
      });

      await waitFor(() => {
        expect(getByText("Start Step")).toBeTruthy();
      });
    });

    it("should follow correct step sequence for new-sighting", async () => {
      mockUseRouter.mockReturnValue({
        ...mockRouter,
        replace: jest.fn(),
      });

      const { getByText } = renderWizardForm("new-sighting");
      
      // Start -> Upload Photo
      await act(async () => {
        fireEvent.press(getByText("Continue"));
      });
      
      await waitFor(() => {
        expect(getByText("Upload Photo Step")).toBeTruthy();
      });

      // Upload Photo -> Edit Pet
      await act(async () => {
        fireEvent.press(getByText("Continue"));
      });
      
      await waitFor(() => {
        expect(getByText("Edit Pet Step")).toBeTruthy();
      });
    });

    it("should skip steps appropriately for add-pet action", async () => {
      const { getByText } = renderWizardForm("add-pet");
      
      // Should start at upload_photo step
      expect(getByText("Upload Photo Step")).toBeTruthy();

      // Navigate to edit_pet step
      await act(async () => {
        fireEvent.press(getByText("Continue"));
      });
      
      await waitFor(() => {
        expect(getByText("Edit Pet Step")).toBeTruthy();
      });
    });
  });

  describe("Form Data Management", () => {
    it("should load existing sighting data for edit mode", async () => {
      const mockSighting = {
        id: "sighting-123",
        petId: "pet-456",
        species: "dog",
        name: "Test Pet",
        breed: "Labrador",
        lastSeenLat: 40.7128,
        lastSeenLong: -74.0060,
        lastSeenLocation: "Test Location",
      };

      const mockSightingRepo = {
        getSighting: jest.fn().mockResolvedValue(mockSighting),
      };
      mockSightingRepository.mockImplementation(() => mockSightingRepo);

      mockUseLocalSearchParams.mockReturnValue({ id: "sighting-123" });
      mockIsValidUuid.mockReturnValue(true);

      const {findByText} = renderWizardForm("edit-sighting");

      await waitFor(() => {
        expect(mockSightingRepo.getSighting).toHaveBeenCalledWith("sighting-123");
      });

      expect(await findByText("Upload Photo Step")).toBeTruthy();
      expect(await findByText("Continue")).toBeTruthy();
      expect(await findByText("Back")).toBeTruthy();
    });

    it("should load existing pet data when petId is provided", async () => {
      const mockPet = {
        id: "pet-456",
        species: "cat",
        name: "Fluffy",
        breed: "Persian",
        age: 3,
        colors: "white",
        gender: "female",
      };

      const mockPetRepo = {
        getPet: jest.fn().mockResolvedValue(mockPet),
      };
      mockPetRepository.mockImplementation(() => mockPetRepo);

      mockUseLocalSearchParams.mockReturnValue({ petId: "pet-456" });
      mockIsValidUuid.mockReturnValue(true);

      const {findByText} = renderWizardForm("edit-pet");

      await waitFor(() => {
        expect(mockPetRepo.getPet).toHaveBeenCalledWith("pet-456");
      });

      expect(await findByText("Upload Photo Step")).toBeTruthy();
      expect(await findByText("Continue")).toBeTruthy();
      expect(await findByText("Back")).toBeTruthy();
    });
  });

  describe("Validation", () => {
    it("should prevent navigation when validation fails", async () => {
      mockValidate.mockReturnValue(false);

      const { getByText } = renderWizardForm("new-sighting");
      const continueButton = getByText("Continue");

      await act(async () => {
        fireEvent.press(continueButton);
      });

      // Should stay on start step
      expect(getByText("Start Step")).toBeTruthy();
      expect(mockValidate).toHaveBeenCalled();
    });

    it("should allow navigation when validation passes", async () => {
      mockValidate.mockReturnValue(true);

      const { getByText } = renderWizardForm("new-sighting");
      const continueButton = getByText("Continue");

      await act(async () => {
        fireEvent.press(continueButton);
      });

      await waitFor(() => {
        expect(getByText("Upload Photo Step")).toBeTruthy();
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle invalid sighting ID gracefully", () => {
      mockUseLocalSearchParams.mockReturnValue({ id: "invalid-id" });
      mockIsValidUuid.mockReturnValue(false);

      const { getByText } = renderWizardForm("edit-sighting");
      
      // Should render normally despite invalid ID
      expect(getByText("Start Step")).toBeTruthy();
    });

    it("should handle repository errors when fetching sighting data", async () => {
      const mockError = new Error("Database error");
      const mockSightingRepo = {
        getSighting: jest.fn().mockRejectedValue(mockError),
      };
      mockSightingRepository.mockImplementation(() => mockSightingRepo);

      mockUseLocalSearchParams.mockReturnValue({ id: "sighting-123" });
      mockIsValidUuid.mockReturnValue(true);

      renderWizardForm("edit-sighting");

      await waitFor(() => {
        expect(mockShowMessage).toHaveBeenCalledWith({
          message: "Error fetching pet sighting.",
          type: "warning",
          icon: "warning",
          statusBarHeight: 50,
        });
      });
    });

    it("should handle repository errors when fetching pet data", async () => {
      const mockError = new Error("Database error");
      const mockPetRepo = {
        getPet: jest.fn().mockRejectedValue(mockError),
      };
      mockPetRepository.mockImplementation(() => mockPetRepo);

      mockUseLocalSearchParams.mockReturnValue({ petId: "pet-456" });
      mockIsValidUuid.mockReturnValue(true);

      renderWizardForm("edit-pet");

      await waitFor(() => {
        expect(mockShowMessage).toHaveBeenCalledWith({
          message: "Error fetching pet information.",
          type: "warning",
          icon: "warning",
          statusBarHeight: 50,
        });
      });
    });
  });
});
