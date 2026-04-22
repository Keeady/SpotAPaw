import { isFuture } from "date-fns";
import { isValidPhoneNumber } from "libphonenumber-js";
import { isValidUuid } from "../util";
import {
    defaultSightingFormData,
    validate,
    validateChoosePet,
    validateEditPet,
    validateEditPetContinued,
    validateEditPhoto,
    validateLastSeen,
    validateLocatePet,
    validateStart,
} from "./util";
import type { SightingReport } from "./wizard-interface";

// Mock dependencies
jest.mock("libphonenumber-js", () => ({
  isValidPhoneNumber: jest.fn(),
}));
jest.mock("date-fns", () => ({
  isFuture: jest.fn(),
}));
jest.mock("../util", () => ({
  isValidUuid: jest.fn(),
}));

const mockIsValidPhoneNumber = jest.mocked(isValidPhoneNumber);
const mockIsFuture = jest.mocked(isFuture);
const mockIsValidUuid = jest.mocked(isValidUuid);

describe("Wizard Util Functions", () => {
  const mockSightingReport: SightingReport = {
    ...defaultSightingFormData,
    id: "pet-123",
    species: "dog",
    age: 3,
    name: "Buddy",
    breed: "Golden Retriever",
    colors: "golden",
    size: "large",
    lastSeenLong: -74.006,
    lastSeenLat: 40.7128,
    lastSeenLocation: "Central Park",
    lastSeenTime: "2026-04-07T12:00:00Z",
    features: "fluffy tail",
    photo: "photo.jpg",
    reporterName: "John Doe",
    reporterPhone: "+1234567890",
    contactPhoneCountryCode: "US",
    petBehavior: "friendly",
    gender: "male",
    note: "Friendly dog",
    sightingId: "sighting-123",
    linkedSightingId: "",
    collar: "yes_collar",
    collarDescription: "red collar",
    image: {
      uri: "file://photo.jpg",
      filename: "photo.jpg",
      filetype: "image/jpeg",
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockIsValidUuid.mockReturnValue(true);
    mockIsValidPhoneNumber.mockReturnValue(true);
    mockIsFuture.mockReturnValue(false);
  });

  describe("defaultSightingFormData", () => {
    it("should have correct default values", () => {
      expect(defaultSightingFormData.id).toBe("");
      expect(defaultSightingFormData.species).toBe("");
      expect(defaultSightingFormData.age).toBe(0);
      expect(defaultSightingFormData.isLost).toBe(false);
      expect(defaultSightingFormData.collar).toBe("no");
      expect(defaultSightingFormData.contactPhoneCountryCode).toBe("US");
      expect(defaultSightingFormData.isActive).toBe(true);
      expect(defaultSightingFormData.image).toEqual({
        uri: "",
        filename: "",
        filetype: "",
      });
    });
  });

  describe("validate", () => {
    it("should return false when no current step is provided", () => {
      const result = validate(mockSightingReport);
      expect(result).toBe(false);
    });

    it("should validate start step correctly", () => {
      const resultValid = validate(mockSightingReport, "start", "lost_own");
      const resultInvalid = validate(mockSightingReport, "start", undefined);

      expect(resultValid).toBe(true);
      expect(resultInvalid).toBe(false);
    });

    it("should validate choose_pet step correctly", () => {
      mockIsValidUuid.mockReturnValue(true);

      const resultValid = validate(mockSightingReport, "choose_pet");

      const invalidSighting = { ...mockSightingReport, id: "" };
      const resultInvalid = validate(invalidSighting, "choose_pet");

      expect(resultValid).toBe(true);
      expect(resultInvalid).toBe(false);
    });

    it("should validate upload_photo step correctly", () => {
      const resultValid = validate(mockSightingReport, "upload_photo");

      const invalidSighting = {
        ...mockSightingReport,
        image: { uri: "", filename: "", filetype: "" },
        photo: "",
      };
      const resultInvalid = validate(invalidSighting, "upload_photo");

      expect(resultValid).toBe(true);
      expect(resultInvalid).toBe(false);
    });

    it("should validate edit_pet step correctly", () => {
      const resultValid = validate(mockSightingReport, "edit_pet", "lost_own");

      const invalidSighting = { ...mockSightingReport, species: "" };
      const resultInvalid = validate(invalidSighting, "edit_pet", "lost_own");

      expect(resultValid).toBe(true);
      expect(resultInvalid).toBe(false);
    });

    it("should validate edit_pet_continued step correctly", () => {
      const resultValid = validate(
        mockSightingReport,
        "edit_pet_continued",
        "lost_own",
      );

      const invalidSighting = { ...mockSightingReport, size: "" };
      const resultInvalid = validate(
        invalidSighting,
        "edit_pet_continued",
        "lost_own",
      );

      expect(resultValid).toBe(true);
      expect(resultInvalid).toBe(false);
    });

    it("should validate locate_pet step correctly", () => {
      const resultValid = validate(mockSightingReport, "locate_pet");

      const invalidSighting = {
        ...mockSightingReport,
        lastSeenLat: 0,
        lastSeenLong: 0,
      };
      const resultInvalid = validate(invalidSighting, "locate_pet");

      expect(resultValid).toBe(true);
      expect(resultInvalid).toBe(false);
    });

    it("should validate add_time step correctly", () => {
      mockIsFuture.mockReturnValue(false);

      const resultValid = validate(mockSightingReport, "add_time");
      expect(resultValid).toBe(true);

      mockIsFuture.mockReturnValue(true);
      const resultInvalid = validate(mockSightingReport, "add_time");
      expect(resultInvalid).toBe(false);
    });

    it("should validate submit step correctly", () => {
      mockIsValidPhoneNumber.mockReturnValue(true);

      const resultValid = validate(mockSightingReport, "submit");
      expect(resultValid).toBe(true);

      mockIsValidPhoneNumber.mockReturnValue(false);
      const resultInvalid = validate(mockSightingReport, "submit");
      expect(resultInvalid).toBe(false);
    });

    it("should return true for unknown step", () => {
      const result = validate(mockSightingReport, "unknown_step");
      expect(result).toBe(true);
    });
  });

  describe("validateStart", () => {
    it("should return true when report type is provided", () => {
      expect(validateStart("lost_own")).toBe(true);
      expect(validateStart("found_stray")).toBe(true);
      expect(validateStart("new_pet")).toBe(true);
      expect(validateStart("edit_pet")).toBe(true);
    });

    it("should return false when report type is not provided", () => {
      expect(validateStart(undefined as any)).toBe(false);
    });
  });

  describe("validateChoosePet", () => {
    it("should return true when valid pet id is provided", () => {
      mockIsValidUuid.mockReturnValue(true);
      const sighting = { ...mockSightingReport, id: "valid-uuid" };

      expect(validateChoosePet(sighting)).toBe(true);
    });

    it("should return false when pet id is missing", () => {
      const sighting = { ...mockSightingReport, id: "" };

      expect(validateChoosePet(sighting)).toBe(false);
    });

    it("should return false when pet id is invalid", () => {
      mockIsValidUuid.mockReturnValue(false);
      const sighting = { ...mockSightingReport, id: "invalid-uuid" };

      expect(validateChoosePet(sighting)).toBe(false);
    });
  });

  describe("validateEditPhoto", () => {
    it("should return true when image URI is provided", () => {
      const sighting = {
        ...mockSightingReport,
        image: {
          uri: "file://photo.jpg",
          filename: "photo.jpg",
          filetype: "image/jpeg",
        },
      };

      expect(validateEditPhoto(sighting)).toBe(true);
    });

    it("should return true when photo URL is provided", () => {
      const sighting = {
        ...mockSightingReport,
        photo: "photo.jpg",
        image: { uri: "", filename: "", filetype: "" },
      };

      expect(validateEditPhoto(sighting)).toBe(true);
    });

    it("should return true when linkedSightingId is provided", () => {
      const sighting = {
        ...mockSightingReport,
        linkedSightingId: "linked-123",
        photo: "",
        image: { uri: "", filename: "", filetype: "" },
      };

      expect(validateEditPhoto(sighting)).toBe(true);
    });

    it("should return false when no photo or linkedSightingId is provided", () => {
      const sighting = {
        ...mockSightingReport,
        photo: "",
        linkedSightingId: "",
        image: { uri: "", filename: "", filetype: "" },
      };

      expect(validateEditPhoto(sighting)).toBe(false);
    });
  });

  describe("validateEditPet", () => {
    it("should return true when linkedSightingId is provided", () => {
      const sighting = {
        ...mockSightingReport,
        linkedSightingId: "linked-123",
        species: "", // Even without required fields
        colors: "",
      };

      expect(validateEditPet(sighting, "lost_own")).toBe(true);
    });

    it("should validate basic fields for all report types", () => {
      const invalidSighting1 = { ...mockSightingReport, species: "" };
      const invalidSighting2 = { ...mockSightingReport, colors: "" };

      expect(validateEditPet(invalidSighting1, "lost_own")).toBe(false);
      expect(validateEditPet(invalidSighting2, "lost_own")).toBe(false);
    });

    it("should validate required fields for lost_own report type", () => {
      const validSighting = mockSightingReport;
      expect(validateEditPet(validSighting, "lost_own")).toBe(true);

      const invalidSighting1 = { ...mockSightingReport, age: 0 };
      const invalidSighting2 = { ...mockSightingReport, gender: "" };
      const invalidSighting3 = { ...mockSightingReport, name: "" };

      expect(validateEditPet(invalidSighting1, "lost_own")).toBe(false);
      expect(validateEditPet(invalidSighting2, "lost_own")).toBe(false);
      expect(validateEditPet(invalidSighting3, "lost_own")).toBe(false);
    });

    it("should validate required fields for new_pet report type", () => {
      const validSighting = mockSightingReport;
      expect(validateEditPet(validSighting, "new_pet")).toBe(true);

      const invalidSighting1 = { ...mockSightingReport, age: 0 };
      const invalidSighting2 = { ...mockSightingReport, breed: "" };

      expect(validateEditPet(invalidSighting1, "new_pet")).toBe(false);
      expect(validateEditPet(invalidSighting2, "new_pet")).toBe(false);
    });

    it("should validate required fields for edit_pet report type", () => {
      const validSighting = mockSightingReport;
      expect(validateEditPet(validSighting, "edit_pet")).toBe(true);

      const invalidSighting1 = { ...mockSightingReport, breed: "" };
      const invalidSighting2 = { ...mockSightingReport, name: "" };

      expect(validateEditPet(invalidSighting1, "edit_pet")).toBe(false);
      expect(validateEditPet(invalidSighting2, "edit_pet")).toBe(false);
    });

    it("should not require additional fields for found_stray report type", () => {
      const minimalSighting = {
        ...mockSightingReport,
        age: 0,
        gender: "",
        name: "",
        breed: "",
      };

      expect(validateEditPet(minimalSighting, "found_stray")).toBe(true);
    });
  });

  describe("validateEditPetContinued", () => {
    it("should return true when linkedSightingId is provided", () => {
      const sighting = {
        ...mockSightingReport,
        linkedSightingId: "linked-123",
        size: "", // Even without required fields
      };

      expect(validateEditPetContinued(sighting, "lost_own")).toBe(true);
    });

    it("should validate size for lost_own report type", () => {
      const validSighting = mockSightingReport;
      expect(validateEditPetContinued(validSighting, "lost_own")).toBe(true);

      const invalidSighting = { ...mockSightingReport, size: "" };
      expect(validateEditPetContinued(invalidSighting, "lost_own")).toBe(false);
    });

    it("should validate size for new_pet report type", () => {
      const validSighting = mockSightingReport;
      expect(validateEditPetContinued(validSighting, "new_pet")).toBe(true);

      const invalidSighting = { ...mockSightingReport, size: "" };
      expect(validateEditPetContinued(invalidSighting, "new_pet")).toBe(false);
    });

    it("should validate size for edit_pet report type", () => {
      const validSighting = mockSightingReport;
      expect(validateEditPetContinued(validSighting, "edit_pet")).toBe(true);

      const invalidSighting = { ...mockSightingReport, size: "" };
      expect(validateEditPetContinued(invalidSighting, "edit_pet")).toBe(false);
    });

    it("should not require size for found_stray report type", () => {
      const sighting = { ...mockSightingReport, size: "" };
      expect(validateEditPetContinued(sighting, "found_stray")).toBe(true);
    });

    it("should validate collar description when collar is yes_collar", () => {
      const validSighting = {
        ...mockSightingReport,
        collar: "yes_collar" as const,
        collarDescription: "red collar",
      };
      expect(validateEditPetContinued(validSighting, "lost_own")).toBe(true);

      const invalidSighting = {
        ...mockSightingReport,
        collar: "yes_collar" as const,
        collarDescription: "",
      };
      expect(validateEditPetContinued(invalidSighting, "lost_own")).toBe(false);
    });

    it("should not require collar description when collar is no", () => {
      const sighting = {
        ...mockSightingReport,
        collar: "no" as const,
        collarDescription: "",
      };
      expect(validateEditPetContinued(sighting, "lost_own")).toBe(true);
    });
  });

  describe("validateLocatePet", () => {
    it("should return true when both latitude and longitude are provided", () => {
      const sighting = {
        ...mockSightingReport,
        lastSeenLat: 40.7128,
        lastSeenLong: -74.006,
      };

      expect(validateLocatePet(sighting)).toBe(true);
    });

    it("should return false when latitude is missing", () => {
      const sighting = {
        ...mockSightingReport,
        lastSeenLat: 0,
        lastSeenLong: -74.006,
      };

      expect(validateLocatePet(sighting)).toBe(false);
    });

    it("should return false when longitude is missing", () => {
      const sighting = {
        ...mockSightingReport,
        lastSeenLat: 40.7128,
        lastSeenLong: 0,
      };

      expect(validateLocatePet(sighting)).toBe(false);
    });

    it("should return false when both coordinates are missing", () => {
      const sighting = {
        ...mockSightingReport,
        lastSeenLat: 0,
        lastSeenLong: 0,
      };

      expect(validateLocatePet(sighting)).toBe(false);
    });
  });

  describe("validateLastSeen", () => {
    it("should return true when lastSeenTime is provided and not in future", () => {
      mockIsFuture.mockReturnValue(false);

      const sighting = {
        ...mockSightingReport,
        lastSeenTime: "2026-04-07T12:00:00Z",
      };

      expect(validateLastSeen(sighting)).toBe(true);
      expect(mockIsFuture).toHaveBeenCalledWith("2026-04-07T12:00:00Z");
    });

    it("should return false when lastSeenTime is in the future", () => {
      mockIsFuture.mockReturnValue(true);

      const sighting = {
        ...mockSightingReport,
        lastSeenTime: "2026-04-10T12:00:00Z",
      };

      expect(validateLastSeen(sighting)).toBe(false);
      expect(mockIsFuture).toHaveBeenCalledWith("2026-04-10T12:00:00Z");
    });

    it("should return false when lastSeenTime is not provided", () => {
      const sighting = {
        ...mockSightingReport,
        lastSeenTime: "",
      };

      expect(validateLastSeen(sighting)).toBe(false);
    });
  });

  describe("validateAddContact (via validate submit step)", () => {
    it("should return true when no phone number is provided", () => {
      mockIsValidPhoneNumber.mockReturnValue(true);

      const sighting = { ...mockSightingReport, reporterPhone: "" };
      const result = validate(sighting, "submit");

      expect(result).toBe(true);
      expect(mockIsValidPhoneNumber).not.toHaveBeenCalled();
    });

    it("should validate phone number when provided", () => {
      mockIsValidPhoneNumber.mockReturnValue(true);

      const sighting = {
        ...mockSightingReport,
        reporterPhone: "+1234567890",
        contactPhoneCountryCode: "US",
      };
      const result = validate(sighting, "submit");

      expect(result).toBe(true);
      expect(mockIsValidPhoneNumber).toHaveBeenCalledWith("+1234567890", "US");
    });

    it("should return false when phone number is invalid", () => {
      mockIsValidPhoneNumber.mockReturnValue(false);

      const sighting = {
        ...mockSightingReport,
        reporterPhone: "invalid-phone",
        contactPhoneCountryCode: "US",
      };
      const result = validate(sighting, "submit");

      expect(result).toBe(false);
      expect(mockIsValidPhoneNumber).toHaveBeenCalledWith(
        "invalid-phone",
        "US",
      );
    });
  });
});
