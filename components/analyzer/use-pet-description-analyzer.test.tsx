import { act, renderHook } from "@testing-library/react-native";
import { usePetDescriptionAnalyzer } from "./use-pet-description-analyzer";

const mockProcessPetDescription = jest.fn();
jest.mock("@/db/repositories/pet-repository", () => ({
  PetRepository: jest.fn().mockImplementation(() => ({
    processPetDescription: (petDescriptionId: string) =>
      mockProcessPetDescription(petDescriptionId),
  })),
}));

describe("usePetDescriptionAnalyzer", () => {
  it("should analyze pet description successfully", async () => {
    mockProcessPetDescription.mockResolvedValue(undefined);

    const mockOnSuccess = jest.fn();
    const { result } = renderHook(() =>
      usePetDescriptionAnalyzer({ onSuccess: mockOnSuccess }),
    );
    const petDescriptionId = "test-pet-description-id";

    await act(async () => {
      await result.current.analyze(petDescriptionId);
    });

    expect(mockOnSuccess).toHaveBeenCalledWith(true);
  });

  it("should handle errors during analysis", async () => {
    const errorMessage = "Analysis failed";
    mockProcessPetDescription.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() =>
      usePetDescriptionAnalyzer({ onSuccess: jest.fn() }),
    );
    const petDescriptionId = "test-pet-description-id";

    await act(async () => {
      await result.current.analyze(petDescriptionId).catch((error) => {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe(errorMessage);
      });
    });
  });

  it("should handle missing petDescriptionId", async () => {
    const { result } = renderHook(() =>
      usePetDescriptionAnalyzer({ onSuccess: jest.fn() }),
    );

    await act(async () => {
      await result.current.analyze("").catch((error) => {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe(
          "Missing required parameter petDescriptionId.",
        );
      });
    });
  });
});
