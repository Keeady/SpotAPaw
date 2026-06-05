import { SightingRepository } from "@/db/repositories/sighting-repository";
import { getLastSeenLocation, isValidUuid } from "../util";
import {
  createSightingFromPet,
  saveNewSighting,
  saveSightingPhoto,
  updateSighting,
} from "./sighting-submit-handler";
import type { SightingReport } from "./wizard-interface";

// Mock dependencies
jest.mock("@/db/repositories/sighting-repository", () => ({
  SightingRepository: jest.fn().mockImplementation(() => ({
    createSighting: jest.fn(),
    updateSighting: jest.fn(),
    getSighting: jest.fn(),
    getSightings: jest.fn(),
    getSightingsByReporter: jest.fn(),
    getSightingsByPetId: jest.fn(),
    getLinkedSightings: jest.fn(),
    getSightingByLinkedSightingId: jest.fn(),
    updateSightingStatusByPet: jest.fn(),
  })),
}));
jest.mock("../util", () => ({
  getLastSeenLocation: jest.fn(),
  isValidUuid: jest.fn(),
}));
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

const mockGetLastSeenLocation = jest.mocked(getLastSeenLocation);
const mockIsValidUuid = jest.mocked(isValidUuid);

describe("Sighting Submit Handler", () => {
  const mockSightingId = "sighting-123";
  const mockPetId = "pet-456";
  const mockPhotoUrl = "https://example.com/sighting.jpg";
  const mockUploadImage = jest.fn();
  const mockUploadMultiplePetImages = jest.fn();

  const mockSightingReport: SightingReport = {
    id: mockPetId,
    createdAt: "2026-04-08T00:00:00Z",
    ownerId: "",
    name: "Buddy",
    species: "dog",
    breed: "Golden Retriever",
    gender: "male",
    age: 3,
    colors: "golden",
    features: "fluffy tail",
    isLost: true,
    lastSeenTime: "2026-04-07T12:00:00Z",
    lastSeenLat: 40.7128,
    lastSeenLong: -74.006,
    lastSeenLocation: "Central Park",
    note: "Friendly dog",
    photo: "",
    petDescriptionId: "desc-123",
    contactPhoneCountryCode: "+1",
    collarDescription: "red collar",
    aiMessage: "AI analysis complete",
    image: {
      uri: "file://sighting.jpg",
      filename: "sighting.jpg",
      filetype: "image/jpeg",
    },
    collar: "yes_collar",
    petBehavior: "playful",
    sightingId: mockSightingId,
    reporterId: "reporter-123",
    reporterName: "John Doe",
    reporterPhone: "+1234567890",
    size: "large",
    linkedSightingId: "linked-456",
    isActive: true,
    petId: mockPetId,
    photos: [],
    deletedAt: "",
    updatedAt: "2026-04-08T00:00:00Z",
    linkedSightings: [],
    images: [
      {
        uri: "file://sighting.jpg",
        filename: "sighting.jpg",
        filetype: "image/jpeg",
      },
    ],
  };

  // Get references to the mocked methods
  const mockCreateSighting = jest.fn();
  const mockUpdateSighting = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockIsValidUuid.mockReturnValue(true);
    mockGetLastSeenLocation.mockResolvedValue("Formatted Location");

    // Reset and setup the mocked repository methods
    mockCreateSighting.mockResolvedValue(mockSightingId);
    mockUpdateSighting.mockResolvedValue(undefined);
    (
      SightingRepository as jest.MockedClass<typeof SightingRepository>
    ).mockImplementation(
      () =>
        ({
          createSighting: mockCreateSighting,
          updateSighting: mockUpdateSighting,
          getSighting: jest.fn(),
          getSightings: jest.fn(),
          getSightingsByReporter: jest.fn(),
          getSightingsByPetId: jest.fn(),
          getLinkedSightings: jest.fn(),
          getSightingByLinkedSightingId: jest.fn(),
          updateSightingStatusByPet: jest.fn(),
        }) as any,
    );
  });

  describe("createSightingFromPet", () => {
    it("should create sighting when pet is lost", async () => {
      mockCreateSighting.mockResolvedValue(mockSightingId);

      const result = await createSightingFromPet(mockPetId, mockSightingReport);

      expect(mockCreateSighting).toHaveBeenCalledWith(
        expect.objectContaining({
          petId: mockPetId,
        }),
      );
      expect(result).toBe(mockSightingId);
    });

    it("should not create sighting when pet is not lost", async () => {
      const notLostSighting = { ...mockSightingReport, isLost: false };

      const result = await createSightingFromPet(mockPetId, notLostSighting);

      expect(mockCreateSighting).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
    });
  });

  describe("saveSightingPhoto", () => {
    it("should upload image and save new sighting when image is provided and action is new-sighting", async () => {
      mockCreateSighting.mockResolvedValue(mockSightingId);

      mockUploadMultiplePetImages.mockImplementation(
        async (images: any[], callback) => {
          await callback(images.map((img) => img.uri));
        },
      );

      await saveSightingPhoto(
        mockSightingReport,
        "new-sighting",
        mockUploadMultiplePetImages,
      );

      expect(mockUploadMultiplePetImages).toHaveBeenCalledWith(
        [
          {
            filename: "sighting.jpg",
            filetype: "image/jpeg",
            uri: "file://sighting.jpg",
          },
        ],
        expect.any(Function),
      );
      expect(mockCreateSighting).toHaveBeenCalled();
      expect(mockUpdateSighting).not.toHaveBeenCalled();
    });

    it("should upload image and update sighting when image is provided and action is edit-sighting", async () => {
      mockUpdateSighting.mockResolvedValue(undefined);

      mockUploadMultiplePetImages.mockImplementation(
        async (images: any[], callback) => {
          await callback(images.map((img) => img.uri));
        },
      );

      await saveSightingPhoto(
        mockSightingReport,
        "edit-sighting",
        mockUploadMultiplePetImages,
      );

      expect(mockUploadMultiplePetImages).toHaveBeenCalledWith(
        [
          {
            filename: "sighting.jpg",
            filetype: "image/jpeg",
            uri: "file://sighting.jpg",
          },
        ],
        expect.any(Function),
      );
      expect(mockUpdateSighting).toHaveBeenCalled();
      expect(mockCreateSighting).not.toHaveBeenCalled();
    });

    it("should save new sighting without uploading when no image is provided and action is new-sighting", async () => {
      mockCreateSighting.mockResolvedValue(mockSightingId);

      const sightingWithoutImage = {
        ...mockSightingReport,
        images: [],
      };

      await saveSightingPhoto(
        sightingWithoutImage,
        "new-sighting",
        mockUploadMultiplePetImages,
      );

      expect(mockUploadMultiplePetImages).not.toHaveBeenCalled();
      expect(mockCreateSighting).toHaveBeenCalled();
      expect(mockUpdateSighting).not.toHaveBeenCalled();
    });

    it("should update sighting without uploading when no image is provided and action is edit-sighting", async () => {
      mockUpdateSighting.mockResolvedValue(undefined);

      const sightingWithoutImage = {
        ...mockSightingReport,
        images: [],
      };

      await saveSightingPhoto(
        sightingWithoutImage,
        "edit-sighting",
        mockUploadMultiplePetImages,
      );

      expect(mockUploadMultiplePetImages).not.toHaveBeenCalled();
      expect(mockUpdateSighting).toHaveBeenCalled();
      expect(mockCreateSighting).not.toHaveBeenCalled();
    });
  });

  describe("saveNewSighting", () => {
    it("should create sighting with correct payload", async () => {
      mockCreateSighting.mockResolvedValue(mockSightingId);

      const result = await saveNewSighting(mockSightingReport, [mockPhotoUrl]);

      const expectedPayload = {
        age: 3,
        name: "Buddy",
        colors: "golden",
        breed: "Golden Retriever",
        size: "large",
        species: "dog",
        gender: "male",
        features: "fluffy tail",
        collarDescription: "red collar",
        photos: [mockPhotoUrl],
        note: "Friendly dog\nPet behavior: playful",
        lastSeenLocation: "Formatted Location",
        lastSeenLong: -74.006,
        lastSeenLat: 40.7128,
        lastSeenTime: "2026-04-07T12:00:00Z",
        reporterName: "John Doe",
        reporterPhone: "+1234567890",
        petDescriptionId: "desc-123",
        petId: mockPetId,
        linkedSightingId: "linked-456",
        reporterId: "reporter-123",
      };

      expect(mockGetLastSeenLocation).toHaveBeenCalledWith(
        "Central Park",
        40.7128,
        -74.006,
      );
      expect(mockCreateSighting).toHaveBeenCalledWith(expectedPayload);
      expect(result).toBe(mockSightingId);
    });

    it("should handle empty photo URL and use existing photo", async () => {
      mockCreateSighting.mockResolvedValue(mockSightingId);

      const sightingWithPhoto = {
        ...mockSightingReport,
        photos: ["existing-photo.jpg"],
      };

      await saveNewSighting(sightingWithPhoto, []);

      expect(mockCreateSighting).toHaveBeenCalledWith(
        expect.objectContaining({
          photos: ["existing-photo.jpg"],
        }),
      );
    });

    it("should handle null age", async () => {
      mockCreateSighting.mockResolvedValue(mockSightingId);

      const sightingWithoutAge = {
        ...mockSightingReport,
        age: 0,
      };

      await saveNewSighting(sightingWithoutAge, [mockPhotoUrl]);

      expect(mockCreateSighting).toHaveBeenCalledWith(
        expect.objectContaining({
          age: null,
        }),
      );
    });

    it("should build notes correctly with note and pet behavior", async () => {
      mockCreateSighting.mockResolvedValue(mockSightingId);

      await saveNewSighting(mockSightingReport, [mockPhotoUrl]);

      expect(mockCreateSighting).toHaveBeenCalledWith(
        expect.objectContaining({
          note: "Friendly dog\nPet behavior: playful",
        }),
      );
    });

    it("should build notes correctly with only pet behavior", async () => {
      mockCreateSighting.mockResolvedValue(mockSightingId);

      const sightingWithoutNote = {
        ...mockSightingReport,
        note: "",
        petBehavior: "energetic",
      };

      await saveNewSighting(sightingWithoutNote, [mockPhotoUrl]);

      expect(mockCreateSighting).toHaveBeenCalledWith(
        expect.objectContaining({
          note: "Pet behavior: energetic",
        }),
      );
    });

    it("should build notes correctly with only note", async () => {
      mockCreateSighting.mockResolvedValue(mockSightingId);

      const sightingWithoutBehavior = {
        ...mockSightingReport,
        petBehavior: "",
      };

      await saveNewSighting(sightingWithoutBehavior, [mockPhotoUrl]);

      expect(mockCreateSighting).toHaveBeenCalledWith(
        expect.objectContaining({
          note: "Friendly dog\n",
        }),
      );
    });

    it("should not include petId when id is invalid", async () => {
      mockCreateSighting.mockResolvedValue(mockSightingId);
      mockIsValidUuid.mockImplementation((id) => id !== mockPetId);

      await saveNewSighting(mockSightingReport, [mockPhotoUrl]);

      expect(mockCreateSighting).toHaveBeenCalledWith(
        expect.not.objectContaining({ petId: expect.anything() }),
      );
    });

    it("should not include linkedSightingId when linkedSightingId is invalid", async () => {
      mockCreateSighting.mockResolvedValue(mockSightingId);
      mockIsValidUuid.mockImplementation((id) => id !== "linked-456");

      await saveNewSighting(mockSightingReport, [mockPhotoUrl]);

      expect(mockCreateSighting).toHaveBeenCalledWith(
        expect.not.objectContaining({ linkedSightingId: expect.anything() }),
      );
    });

    it("should not include reporterId when reporterId is invalid", async () => {
      mockCreateSighting.mockResolvedValue(mockSightingId);
      mockIsValidUuid.mockImplementation((id) => id !== "reporter-123");

      await saveNewSighting(mockSightingReport, [mockPhotoUrl]);

      expect(mockCreateSighting).toHaveBeenCalledWith(
        expect.not.objectContaining({ reporterId: expect.anything() }),
      );
    });
  });

  describe("updateSighting", () => {
    it("should throw error when sighting id is missing", async () => {
      const sightingWithoutId = { ...mockSightingReport, sightingId: "" };

      await expect(
        updateSighting(sightingWithoutId, [mockPhotoUrl]),
      ).rejects.toThrow("Missing or invalid sighting id");
    });

    it("should throw error when sighting id is invalid", async () => {
      mockIsValidUuid.mockReturnValue(false);

      await expect(
        updateSighting(mockSightingReport, [mockPhotoUrl]),
      ).rejects.toThrow("Missing or invalid sighting id");
    });

    it("should update sighting with correct payload", async () => {
      mockUpdateSighting.mockResolvedValue(undefined);

      await updateSighting(mockSightingReport, [mockPhotoUrl]);

      const expectedPayload = {
        age: 3,
        name: "Buddy",
        colors: "golden",
        breed: "Golden Retriever",
        size: "large",
        species: "dog",
        gender: "male",
        features: "fluffy tail",
        collarDescription: "red collar",
        photos: [mockPhotoUrl],
        note: "Friendly dog\nPet behavior: playful",
        lastSeenLocation: "Formatted Location",
        lastSeenLong: -74.006,
        lastSeenLat: 40.7128,
        lastSeenTime: "2026-04-07T12:00:00Z",
        reporterName: "John Doe",
        reporterPhone: "+1234567890",
        petDescriptionId: "desc-123",
        petId: mockPetId,
        linkedSightingId: "linked-456",
        reporterId: "reporter-123",
      };

      expect(mockUpdateSighting).toHaveBeenCalledWith(
        mockSightingId,
        expectedPayload,
      );
    });
  });

  describe("Error handling", () => {
    it("should propagate repository errors in saveNewSighting", async () => {
      mockCreateSighting.mockRejectedValue(new Error("Database error"));

      await expect(
        saveNewSighting(mockSightingReport, [mockPhotoUrl]),
      ).rejects.toThrow("Database error");
    });

    it("should propagate repository errors in updateSighting", async () => {
      mockUpdateSighting.mockRejectedValue(new Error("Update failed"));

      await expect(
        updateSighting(mockSightingReport, [mockPhotoUrl]),
      ).rejects.toThrow("Update failed");
    });

    it("should handle getLastSeenLocation errors", async () => {
      mockCreateSighting.mockResolvedValue(mockSightingId);
      mockGetLastSeenLocation.mockRejectedValue(
        new Error("Location formatting failed"),
      );

      await expect(
        saveNewSighting(mockSightingReport, [mockPhotoUrl]),
      ).rejects.toThrow("Location formatting failed");
    });
  });
});
