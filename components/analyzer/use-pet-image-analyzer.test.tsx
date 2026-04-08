import { act, renderHook } from "@testing-library/react-native";
import { uploadPhotoWithProcessing } from "../image-upload-handler";
import { usePetAnalyzer } from "./use-pet-image-analyzer";
import { AnalysisResponse } from "./types";

// Mock the image upload handler
jest.mock("../image-upload-handler", () => ({
  uploadPhotoWithProcessing: jest.fn(),
}));

const mockUploadPhotoWithProcessing =
  uploadPhotoWithProcessing as jest.MockedFunction<
    typeof uploadPhotoWithProcessing
  >;

describe("usePetAnalyzer", () => {
  const mockOnSuccess = jest.fn();
  const testUri = "file://test-image.jpg";
  const testFilename = "test-image.jpg";
  const testFiletype = "image/jpeg";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return initial state correctly", () => {
    const { result } = renderHook(() =>
      usePetAnalyzer({
        onSuccess: mockOnSuccess,
      }),
    );

    expect(result.current.loading).toBe(false);
    expect(typeof result.current.analyze).toBe("function");
  });

  it("should handle successful analysis with JSON result", async () => {
    const mockAnalysisResponse: AnalysisResponse = {
      pets: [
        {
          species: "dog",
          breed: "Golden Retriever",
          colors: ["golden", "cream"],
          size: "large",
          distinctive_features: ["fluffy tail", "friendly eyes"],
          collar_descriptions: ["red collar"],
          confidence: "high",
        },
      ],
      image_quality: "good",
      number_of_pets: 1,
    };

    const mockResponse = {
      result: JSON.stringify(mockAnalysisResponse),
      publicUrl: "https://example.com/photo.jpg",
      petDescriptionId: "pet-123",
    };

    mockUploadPhotoWithProcessing.mockResolvedValue(mockResponse);

    const { result } = renderHook(() =>
      usePetAnalyzer({
        onSuccess: mockOnSuccess,
      }),
    );

    await act(async () => {
      await result.current.analyze(testUri, testFilename, testFiletype);
    });

    expect(mockUploadPhotoWithProcessing).toHaveBeenCalledWith(
      testUri,
      testFilename,
      testFiletype,
    );
    expect(mockOnSuccess).toHaveBeenCalledWith(
      mockAnalysisResponse,
      "https://example.com/photo.jpg",
      "pet-123",
    );
    expect(result.current.loading).toBe(false);
  });

  it("should handle successful analysis with JSON result containing markdown code blocks", async () => {
    const mockAnalysisResponse: AnalysisResponse = {
      pets: [],
      image_quality: "poor",
      number_of_pets: 0,
    };

    const mockResponse = {
      result: "```json\n" + JSON.stringify(mockAnalysisResponse) + "\n```",
      publicUrl: "https://example.com/photo.jpg",
      petDescriptionId: "pet-456",
    };

    mockUploadPhotoWithProcessing.mockResolvedValue(mockResponse);

    const { result } = renderHook(() =>
      usePetAnalyzer({
        onSuccess: mockOnSuccess,
      }),
    );

    await act(async () => {
      await result.current.analyze(testUri, testFilename, testFiletype);
    });

    expect(mockOnSuccess).toHaveBeenCalledWith(
      mockAnalysisResponse,
      "https://example.com/photo.jpg",
      "pet-456",
    );
  });

  it("should handle successful analysis with only publicUrl", async () => {
    const mockResponse = {
      result: null,
      publicUrl: "https://example.com/photo.jpg",
      petDescriptionId: "pet-789",
    };

    mockUploadPhotoWithProcessing.mockResolvedValue(mockResponse);

    const { result } = renderHook(() =>
      usePetAnalyzer({
        onSuccess: mockOnSuccess,
      }),
    );

    await act(async () => {
      await result.current.analyze(testUri, testFilename, testFiletype);
    });

    expect(mockOnSuccess).toHaveBeenCalledWith(
      undefined,
      "https://example.com/photo.jpg",
      "pet-789",
    );
  });

  it("should handle successful analysis with only petDescriptionId", async () => {
    const mockResponse = {
      result: null,
      publicUrl: null,
      petDescriptionId: "pet-101",
    };

    mockUploadPhotoWithProcessing.mockResolvedValue(mockResponse);

    const { result } = renderHook(() =>
      usePetAnalyzer({
        onSuccess: mockOnSuccess,
      }),
    );

    await act(async () => {
      await result.current.analyze(testUri, testFilename, testFiletype);
    });

    expect(mockOnSuccess).toHaveBeenCalledWith(undefined, undefined, "pet-101");
  });

  it("should set loading state correctly during analysis", async () => {
    let resolveUpload: (value: any) => void;
    const uploadPromise = new Promise((resolve) => {
      resolveUpload = resolve;
    });
    mockUploadPhotoWithProcessing.mockReturnValue(uploadPromise);

    const { result } = renderHook(() =>
      usePetAnalyzer({
        onSuccess: mockOnSuccess,
      }),
    );

    expect(result.current.loading).toBe(false);

    // Start analysis
    act(() => {
      result.current.analyze(testUri, testFilename, testFiletype);
    });

    expect(result.current.loading).toBe(true);

    // Complete analysis
    await act(async () => {
      resolveUpload!({
        result: '{"pets": [], "image_quality": "good", "number_of_pets": 0}',
        publicUrl: "https://example.com/photo.jpg",
        petDescriptionId: "pet-123",
      });
      await uploadPromise;
    });

    expect(result.current.loading).toBe(false);
  });

  it("should throw error for missing uri parameter", async () => {
    const { result } = renderHook(() =>
      usePetAnalyzer({
        onSuccess: mockOnSuccess,
      }),
    );

    await expect(
      result.current.analyze("", testFilename, testFiletype),
    ).rejects.toThrow(
      "Missing required parameters uri or filename or filetype.",
    );
  });

  it("should throw error for missing filename parameter", async () => {
    const { result } = renderHook(() =>
      usePetAnalyzer({
        onSuccess: mockOnSuccess,
      }),
    );

    await expect(
      result.current.analyze(testUri, "", testFiletype),
    ).rejects.toThrow(
      "Missing required parameters uri or filename or filetype.",
    );
  });

  it("should throw error for missing filetype parameter", async () => {
    const { result } = renderHook(() =>
      usePetAnalyzer({
        onSuccess: mockOnSuccess,
      }),
    );

    await expect(
      result.current.analyze(testUri, testFilename, ""),
    ).rejects.toThrow(
      "Missing required parameters uri or filename or filetype.",
    );
  });

  it("should handle uploadPhotoWithProcessing failure", async () => {
    const mockError = new Error("Upload failed");
    mockUploadPhotoWithProcessing.mockRejectedValue(mockError);

    const { result } = renderHook(() =>
      usePetAnalyzer({
        onSuccess: mockOnSuccess,
      }),
    );

    await act(async () => {
      await expect(
        result.current.analyze(testUri, testFilename, testFiletype),
      ).rejects.toThrow("Upload failed");
    });

    expect(result.current.loading).toBe(false);
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it("should throw error when uploadPhotoWithProcessing returns no response", async () => {
    mockUploadPhotoWithProcessing.mockResolvedValue(null);

    const { result } = renderHook(() =>
      usePetAnalyzer({
        onSuccess: mockOnSuccess,
      }),
    );

    await act(async () => {
      await expect(
        result.current.analyze(testUri, testFilename, testFiletype),
      ).rejects.toThrow("Failed with no response");
    });

    expect(result.current.loading).toBe(false);
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it("should handle invalid JSON in result", async () => {
    const mockResponse = {
      result: "invalid json {",
      publicUrl: "https://example.com/photo.jpg",
      petDescriptionId: "pet-123",
    };

    mockUploadPhotoWithProcessing.mockResolvedValue(mockResponse);

    const { result } = renderHook(() =>
      usePetAnalyzer({
        onSuccess: mockOnSuccess,
      }),
    );

    await expect(
      result.current.analyze(testUri, testFilename, testFiletype),
    ).rejects.toThrow();

    expect(result.current.loading).toBe(false);
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it("should work without onSuccess callback", async () => {
    const mockResponse = {
      result: '{"pets": [], "image_quality": "good", "number_of_pets": 0}',
      publicUrl: "https://example.com/photo.jpg",
      petDescriptionId: "pet-123",
    };

    mockUploadPhotoWithProcessing.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => usePetAnalyzer({}));

    await act(async () => {
      await result.current.analyze(testUri, testFilename, testFiletype);
    });

    expect(mockUploadPhotoWithProcessing).toHaveBeenCalledWith(
      testUri,
      testFilename,
      testFiletype,
    );
    // Should not throw error when onSuccess is undefined
  });

  it("should update analyze function when onSuccess changes", () => {
    const mockOnSuccess1 = jest.fn();
    const mockOnSuccess2 = jest.fn();

    const { result, rerender } = renderHook(
      ({ onSuccess }) => usePetAnalyzer({ onSuccess }),
      {
        initialProps: { onSuccess: mockOnSuccess1 },
      },
    );

    const firstAnalyzeFunction = result.current.analyze;

    rerender({ onSuccess: mockOnSuccess2 });

    const secondAnalyzeFunction = result.current.analyze;

    // The analyze function should be different due to useCallback dependency
    expect(firstAnalyzeFunction).not.toBe(secondAnalyzeFunction);
  });

  describe("parseJsonResponse edge cases", () => {
    it("should handle JSON with triple backticks only at start", async () => {
      const mockAnalysisResponse: AnalysisResponse = {
        pets: [],
        image_quality: "good",
        number_of_pets: 0,
      };

      const mockResponse = {
        result: "```" + JSON.stringify(mockAnalysisResponse),
        publicUrl: "https://example.com/photo.jpg",
        petDescriptionId: "pet-123",
      };

      mockUploadPhotoWithProcessing.mockResolvedValue(mockResponse);

      const { result } = renderHook(() =>
        usePetAnalyzer({
          onSuccess: mockOnSuccess,
        }),
      );

      await act(async () => {
        await result.current.analyze(testUri, testFilename, testFiletype);
      });

      expect(mockOnSuccess).toHaveBeenCalledWith(
        mockAnalysisResponse,
        "https://example.com/photo.jpg",
        "pet-123",
      );
    });

    it("should handle JSON with triple backticks only at end", async () => {
      const mockAnalysisResponse: AnalysisResponse = {
        pets: [],
        image_quality: "good",
        number_of_pets: 0,
      };

      const mockResponse = {
        result: JSON.stringify(mockAnalysisResponse) + "```",
        publicUrl: "https://example.com/photo.jpg",
        petDescriptionId: "pet-123",
      };

      mockUploadPhotoWithProcessing.mockResolvedValue(mockResponse);

      const { result } = renderHook(() =>
        usePetAnalyzer({
          onSuccess: mockOnSuccess,
        }),
      );

      await act(async () => {
        await result.current.analyze(testUri, testFilename, testFiletype);
      });

      expect(mockOnSuccess).toHaveBeenCalledWith(
        mockAnalysisResponse,
        "https://example.com/photo.jpg",
        "pet-123",
      );
    });
  });
});
