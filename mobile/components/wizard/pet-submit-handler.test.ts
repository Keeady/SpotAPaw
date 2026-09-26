import { PetRepository } from "@/db/repositories/pet-repository";
import { getLastSeenLocation, isValidUuid } from "../util";
import {
  saveNewPet,
  saveNewPetPhoto,
  updateNewPetPhoto,
  updatePet,
} from "./pet-submit-handler";
import type { SightingPet } from "./wizard-interface";

// Mock dependencies
jest.mock("@/db/repositories/pet-repository", () => ({
  PetRepository: jest.fn().mockImplementation(() => ({
    createPet: jest.fn(),
    updatePet: jest.fn(),
    getPet: jest.fn(),
    getPets: jest.fn(),
    deletePet: jest.fn(),
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

describe("Pet Submit Handler", () => {
  const mockUserId = "user-123";
  const mockPetId = "pet-456";
  const mockPhotoUrl = "https://example.com/photo.jpg";
  const mockOnPetCreated = jest.fn();
  const mockOnPetUpdated = jest.fn();
  const mockUploadMultiplePetImages = jest.fn();

  const mockSightingPet: SightingPet = {
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
    image: {
      uri: "file://photo.jpg",
      filename: "photo.jpg",
      filetype: "image/jpeg",
    },
    images: [
      {
        uri: "file://photo.jpg",
        filename: "photo.jpg",
        filetype: "image/jpeg",
      },
    ],
    photos: [],
    deletedAt: "",
  };

  // Get references to the mocked methods
  const mockCreatePet = jest.fn();
  const mockUpdatePet = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockIsValidUuid.mockReturnValue(true);
    mockGetLastSeenLocation.mockResolvedValue("Formatted Location");

    // Reset and setup the mocked repository methods
    mockCreatePet.mockReset();
    mockUpdatePet.mockReset();
    (
      PetRepository as jest.MockedClass<typeof PetRepository>
    ).mockImplementation(
      () =>
        ({
          createPet: mockCreatePet,
          updatePet: mockUpdatePet,
          getPet: jest.fn(),
          getPets: jest.fn(),
          deletePet: jest.fn(),
        }) as any,
    );
  });

  describe("saveNewPetPhoto", () => {
    it("should upload image and save new pet when image is provided", async () => {
      mockCreatePet.mockResolvedValue(mockPetId);
      mockOnPetCreated.mockResolvedValue(undefined);

      mockUploadMultiplePetImages.mockImplementation(
        async (images: any[], callback) => {
          await callback(images.map((img) => img.uri));
        },
      );

      await saveNewPetPhoto(
        mockSightingPet,
        mockUserId,
        mockOnPetCreated,
        mockUploadMultiplePetImages,
      );

      expect(mockUploadMultiplePetImages).toHaveBeenCalledWith(
        [
          {
            uri: "file://photo.jpg",
            filename: "photo.jpg",
            filetype: "image/jpeg",
          },
        ],
        expect.any(Function),
      );
      expect(mockCreatePet).toHaveBeenCalled();
      expect(mockOnPetCreated).toHaveBeenCalledWith(
        mockPetId,
        expect.objectContaining({ petId: mockPetId }),
      );
    });

    it("should save pet without uploading when no image is provided", async () => {
      mockCreatePet.mockResolvedValue(mockPetId);

      const sightingPetWithoutImage = {
        ...mockSightingPet,
        images: [],
      };

      await saveNewPetPhoto(
        sightingPetWithoutImage,
        mockUserId,
        undefined,
        mockUploadMultiplePetImages,
      );

      expect(mockUploadMultiplePetImages).not.toHaveBeenCalled();
      expect(mockCreatePet).toHaveBeenCalled();
    });

    it("should handle case when image has no uri", async () => {
      mockCreatePet.mockResolvedValue(mockPetId);

      const sightingPetWithNoUri = {
        ...mockSightingPet,
        images: [],
      };

      await saveNewPetPhoto(
        sightingPetWithNoUri,
        mockUserId,
        undefined,
        mockUploadMultiplePetImages,
      );

      expect(mockUploadMultiplePetImages).not.toHaveBeenCalled();
      expect(mockCreatePet).toHaveBeenCalled();
    });
  });

  describe("updateNewPetPhoto", () => {
    it("should throw error when pet id is missing", async () => {
      const sightingPetWithoutId = { ...mockSightingPet, id: "" };

      await expect(
        updateNewPetPhoto(
          sightingPetWithoutId,
          undefined,
          mockUploadMultiplePetImages,
        ),
      ).rejects.toThrow("Missing or invalid pet id");
    });

    it("should throw error when pet id is invalid", async () => {
      mockIsValidUuid.mockReturnValue(false);

      await expect(
        updateNewPetPhoto(
          mockSightingPet,
          undefined,
          mockUploadMultiplePetImages,
        ),
      ).rejects.toThrow("Missing or invalid pet id");
    });

    it("should upload image and update pet when image is provided", async () => {
      mockUpdatePet.mockResolvedValue(undefined);

      mockUploadMultiplePetImages.mockImplementation(
        async (images: any[], callback) => {
          await callback(images.map((img) => img.uri));
        },
      );

      await updateNewPetPhoto(
        mockSightingPet,
        mockOnPetUpdated,
        mockUploadMultiplePetImages,
      );

      expect(mockUploadMultiplePetImages).toHaveBeenCalledWith(
        [
          {
            uri: "file://photo.jpg",
            filename: "photo.jpg",
            filetype: "image/jpeg",
          },
        ],
        expect.any(Function),
      );
      expect(mockUpdatePet).toHaveBeenCalledWith(mockPetId, expect.any(Object));
      expect(mockOnPetUpdated).toHaveBeenCalledWith(
        mockPetId,
        expect.objectContaining({ petId: mockPetId }),
      );
    });

    it("should update pet without uploading when no image is provided", async () => {
      mockUpdatePet.mockResolvedValue(undefined);

      const sightingPetWithoutImage = {
        ...mockSightingPet,
        images: undefined,
      };

      await updateNewPetPhoto(
        sightingPetWithoutImage,
        undefined,
        mockUploadMultiplePetImages,
      );

      expect(mockUploadMultiplePetImages).not.toHaveBeenCalled();
      expect(mockUpdatePet).toHaveBeenCalled();
    });
  });

  describe("saveNewPet", () => {
    it("should create pet with correct payload and call onPetCreated", async () => {
      mockCreatePet.mockResolvedValue(mockPetId);

      await saveNewPet(mockSightingPet, mockUserId, mockOnPetCreated, [
        mockPhotoUrl,
      ]);

      const expectedPayload = {
        name: "Buddy",
        species: "dog",
        breed: "Golden Retriever",
        colors: "golden",
        photos: [mockPhotoUrl],
        gender: "male",
        age: 3,
        features: "fluffy tail",
        note: "Friendly dog",
        isLost: true,
        lastSeenTime: "2026-04-07T12:00:00Z",
        lastSeenLat: 40.7128,
        lastSeenLong: -74.006,
        lastSeenLocation: "Formatted Location",
        petDescriptionId: "desc-123",
        ownerId: mockUserId,
        id: mockPetId,
      };

      expect(mockGetLastSeenLocation).toHaveBeenCalledWith(
        "Central Park",
        40.7128,
        -74.006,
      );
      expect(mockCreatePet).toHaveBeenCalledWith(expectedPayload);
      expect(mockOnPetCreated).toHaveBeenCalledWith(
        mockPetId,
        expect.objectContaining({
          petId: mockPetId,
          isActive: true,
          reporterId: mockUserId,
        }),
      );
    });

    it("should create pet without onPetCreated callback", async () => {
      mockCreatePet.mockResolvedValue(mockPetId);

      const result = await saveNewPet(mockSightingPet, mockUserId, undefined, [
        mockPhotoUrl,
      ]);

      expect(result).toBe(mockPetId);
      expect(mockCreatePet).toHaveBeenCalled();
      expect(mockOnPetCreated).not.toHaveBeenCalled();
    });

    it("should handle empty photo URL and use existing photo", async () => {
      mockCreatePet.mockResolvedValue(mockPetId);

      const sightingPetWithPhoto = {
        ...mockSightingPet,
        photos: ["existing-photo.jpg"],
      };

      await saveNewPet(sightingPetWithPhoto, mockUserId, undefined, []);

      expect(mockCreatePet).toHaveBeenCalledWith(
        expect.objectContaining({
          photos: ["existing-photo.jpg"],
        }),
      );
    });

    it("should not include ownerId when userId is invalid", async () => {
      mockCreatePet.mockResolvedValue(mockPetId);
      mockIsValidUuid.mockReturnValue(false);

      await saveNewPet(mockSightingPet, "invalid-user-id", undefined, [
        mockPhotoUrl,
      ]);

      expect(mockCreatePet).toHaveBeenCalledWith(
        expect.not.objectContaining({ ownerId: expect.anything() }),
      );
    });

    it("should set current time when lastSeenTime is missing", async () => {
      mockCreatePet.mockResolvedValue(mockPetId);

      const sightingPetWithoutTime = {
        ...mockSightingPet,
        lastSeenTime: "",
      };

      // Mock Date.now to have consistent test results
      const mockDate = new Date("2026-04-08T10:00:00Z");
      jest.spyOn(global, "Date").mockImplementation(() => mockDate as any);

      await saveNewPet(sightingPetWithoutTime, mockUserId, undefined, [
        mockPhotoUrl,
      ]);

      expect(mockCreatePet).toHaveBeenCalledWith(
        expect.objectContaining({
          lastSeenTime: mockDate.toISOString(),
        }),
      );

      jest.restoreAllMocks();
    });
  });

  describe("updatePet", () => {
    it("should throw error when pet id is missing", async () => {
      const sightingPetWithoutId = { ...mockSightingPet, id: "" };

      await expect(
        updatePet(sightingPetWithoutId, undefined, [mockPhotoUrl]),
      ).rejects.toThrow("Missing or invalid pet id");
    });

    it("should throw error when pet id is invalid", async () => {
      mockIsValidUuid.mockReturnValue(false);

      await expect(
        updatePet(mockSightingPet, undefined, [mockPhotoUrl]),
      ).rejects.toThrow("Missing or invalid pet id");
    });

    it("should update pet with correct payload and call onPetUpdated", async () => {
      mockUpdatePet.mockResolvedValue(undefined);

      await updatePet(mockSightingPet, mockOnPetUpdated, [mockPhotoUrl]);

      const expectedPayload = {
        name: "Buddy",
        species: "dog",
        breed: "Golden Retriever",
        colors: "golden",
        photos: [mockPhotoUrl],
        gender: "male",
        age: 3,
        features: "fluffy tail",
        note: "Friendly dog",
        isLost: true,
        lastSeenTime: "2026-04-07T12:00:00Z",
        lastSeenLat: 40.7128,
        lastSeenLong: -74.006,
        lastSeenLocation: "Formatted Location",
        petDescriptionId: "desc-123",
        id: mockPetId,
      };

      expect(mockUpdatePet).toHaveBeenCalledWith(mockPetId, expectedPayload);
      expect(mockOnPetUpdated).toHaveBeenCalledWith(
        mockPetId,
        expect.objectContaining({
          petId: mockPetId,
          reporterId: "",
        }),
      );
    });

    it("should update pet without onPetUpdated callback", async () => {
      mockUpdatePet.mockResolvedValue(undefined);

      await updatePet(mockSightingPet, undefined, [mockPhotoUrl]);

      expect(mockUpdatePet).toHaveBeenCalledWith(mockPetId, expect.any(Object));
      expect(mockOnPetUpdated).not.toHaveBeenCalled();
    });
  });

  describe("Error handling", () => {
    it("should propagate repository errors in saveNewPet", async () => {
      mockCreatePet.mockRejectedValue(new Error("Database error"));

      await expect(
        saveNewPet(mockSightingPet, mockUserId, undefined, [mockPhotoUrl]),
      ).rejects.toThrow("Database error");
    });

    it("should propagate repository errors in updatePet", async () => {
      mockUpdatePet.mockRejectedValue(new Error("Update failed"));

      await expect(
        updatePet(mockSightingPet, undefined, [mockPhotoUrl]),
      ).rejects.toThrow("Update failed");
    });

    it("should handle getLastSeenLocation errors", async () => {
      mockCreatePet.mockResolvedValue(mockPetId);
      mockGetLastSeenLocation.mockRejectedValue(
        new Error("Location formatting failed"),
      );

      await expect(
        saveNewPet(mockSightingPet, mockUserId, undefined, [mockPhotoUrl]),
      ).rejects.toThrow("Location formatting failed");
    });
  });
});
