import { fireEvent, render } from "@testing-library/react-native";
import { GeneratePoster } from "./generate-poster";
import { Linking } from "react-native";

jest.mock("react-i18next", () => ({
  useTranslation: () => {
    return {
      t: (key: string, defaultValue?: string, options?: any) => {
        if (options && options.val) {
          return defaultValue?.replace("{{val}}", options.val) || key;
        }
        return defaultValue || key;
      },
    };
  },
}));

jest.mock("../util", () => ({
  getIconByAnimalSpecies: jest.fn().mockReturnValue("paw"),
  getLastSeenLocation: jest.fn().mockResolvedValue("Central Park"),
  kmToMiles: jest.fn().mockReturnValue(10),
  createErrorLogMessage: jest.fn().mockReturnValue("Error message"),
  isValidUuid: jest.fn().mockReturnValue(true),
}));

jest.mock("../logs", () => ({
  log: jest.fn(),
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

const mockGetPoster = jest.fn();
const mockGeneratePosterForSighting = jest.fn();
jest.mock("@/db/repositories/poster-repository", () => ({
  PosterRepository: jest.fn().mockImplementation(() => ({
    getPoster: (posterId: string) => mockGetPoster(posterId),
    generatePosterForSighting: (
      sightingId: string,
      isAiFeatureEnabled: boolean,
    ) => mockGeneratePosterForSighting(sightingId, isAiFeatureEnabled),
  })),
}));

describe("GeneratePoster", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly with no posterId or sightingId", () => {
    const { getByText } = render(<GeneratePoster />);

    expect(getByText("Pet Sighting Poster")).toBeTruthy();
    expect(getByText("View generated poster for this sighting.")).toBeTruthy();
    expect(getByText("No posters to display.")).toBeTruthy();
  });

  it("renders correctly when fetching poster fails by posterId", async () => {
    mockGetPoster.mockRejectedValue(new Error("Failed to fetch poster"));
    const { getByText, findByText } = render(
      <GeneratePoster posterId="invalid-poster-id" />,
    );

    expect(getByText("Pet Sighting Poster")).toBeTruthy();
    expect(getByText("View generated poster for this sighting.")).toBeTruthy();
    expect(getByText("Generating poster...")).toBeTruthy();

    expect(mockGetPoster).toHaveBeenCalledWith("invalid-poster-id");

    expect(await findByText("No posters found for this sighting.")).toBeTruthy();
  });

  it("renders correctly when fetching poster fails by sightingId", async () => {
    mockGeneratePosterForSighting.mockRejectedValue(new Error("Failed to fetch poster"));
    const { getByText, findByText } = render(
      <GeneratePoster sightingId="invalid-sighting-id" />,
    );

    expect(getByText("Pet Sighting Poster")).toBeTruthy();
    expect(getByText("View generated poster for this sighting.")).toBeTruthy();
    expect(getByText("Generating poster...")).toBeTruthy();

    expect(mockGeneratePosterForSighting).toHaveBeenCalledWith("invalid-sighting-id", false);

    expect(await findByText("No posters found for this sighting.")).toBeTruthy();
  });

  it("renders correctly with valid posterId ", async () => {
    mockGetPoster.mockResolvedValue({
      id: "valid-poster-id",
      headline: "Lost Dog",
      subheadline: "Please help us find our dog",
      description: "Our dog has been missing since yesterday.",
      cta: "Contact us if you see our dog",
      last_seen_location: "Central Park",
      last_seen_time: "2024-06-01T12:00:00Z",
      contact_name: "John Doe",
      contact_phone: "123-456-7890",
      created_at: "2024-06-01T12:00:00Z",
      name: "Buddy",
      breed: "Golden Retriever",
      colors: "Golden",
      pdf_url: "https://example.com/poster.pdf",
      png_url: "https://example.com/poster.png",
      html_url: "https://example.com/poster.html",
    });
    const { getByText, findByText } = render(
      <GeneratePoster posterId="valid-poster-id" />,
    );

    expect(getByText("Pet Sighting Poster")).toBeTruthy();
    expect(getByText("View generated poster for this sighting.")).toBeTruthy();
    expect(getByText("Generating poster...")).toBeTruthy();

    expect(mockGetPoster).toHaveBeenCalledWith("valid-poster-id");

    expect(await findByText("Lost Dog")).toBeTruthy();
    expect(await findByText("Please help us find our dog")).toBeTruthy();
    expect(
      await findByText("Our dog has been missing since yesterday."),
    ).toBeTruthy();
    expect(await findByText("Buddy")).toBeTruthy();
    expect(await findByText("Breed:")).toBeTruthy();
    expect(await findByText("Golden Retriever")).toBeTruthy();
    expect(await findByText("Colors:")).toBeTruthy();
    expect(await findByText("Golden")).toBeTruthy();
    expect(await findByText("Last seen location:")).toBeTruthy();
    expect(await findByText("Central Park")).toBeTruthy();
    expect(await findByText("Last seen date:")).toBeTruthy();
    expect(await findByText("2024-06-01T12:00:00Z")).toBeTruthy();
    expect(await findByText("Contact us if you see our dog")).toBeTruthy();

    expect(await findByText("John Doe")).toBeTruthy();
    expect(await findByText("123-456-7890")).toBeTruthy();

    expect(
      await findByText("https://spotapaw.com/posters/valid-poster-id"),
    ).toBeTruthy();
    expect(await findByText("View in browser")).toBeTruthy();
    expect(await findByText("Download PDF.")).toBeTruthy();
    expect(await findByText("Download PNG.")).toBeTruthy();

    const viewInBrowserLink = await findByText("View in browser");
    fireEvent.press(viewInBrowserLink);
    expect(Linking.openURL).toHaveBeenCalledWith(
      "https://spotapaw.com/posters/valid-poster-id",
    );

    const downloadPDFLink = await findByText("Download PDF.");
    fireEvent.press(downloadPDFLink);
    expect(Linking.openURL).toHaveBeenCalledWith(
      "https://example.com/poster.pdf",
    );

    const downloadPNGLink = await findByText("Download PNG.");
    fireEvent.press(downloadPNGLink);
    expect(Linking.openURL).toHaveBeenCalledWith(
      "https://example.com/poster.png",
    );
  });

  it("renders correctly with valid sightingId and no posterId", async () => {
    mockGeneratePosterForSighting.mockResolvedValue({
      id: "generated-poster-id",
      headline: "Lost Cat",
      subheadline: "Please help us find our cat",
      description: "Our cat has been missing since yesterday.",
      cta: "Contact us if you see our cat",
      last_seen_location: "Downtown",
      last_seen_time: "2024-06-02T12:00:00Z",
      contact_name: "Jane Doe",
      contact_phone: "987-654-3210",
      created_at: "2024-06-02T12:00:00Z",
      name: "Whiskers",
      breed: "Siamese",
      colors: "Cream and Brown",
      pdf_url: "https://example.com/generated-poster.pdf",
      png_url: "https://example.com/generated-poster.png",
      html_url: "https://example.com/generated-poster.html",
    });
    const { getByText, findByText } = render(
      <GeneratePoster sightingId="valid-sighting-id" />,
    );

    expect(getByText("Pet Sighting Poster")).toBeTruthy();
    expect(getByText("View generated poster for this sighting.")).toBeTruthy();
    expect(getByText("Generating poster...")).toBeTruthy();

    expect(mockGeneratePosterForSighting).toHaveBeenCalledWith(
      "valid-sighting-id",
      false,
    );

    expect(await findByText("Lost Cat")).toBeTruthy();
    expect(await findByText("Please help us find our cat")).toBeTruthy();
    expect(
      await findByText("Our cat has been missing since yesterday."),
    ).toBeTruthy();
    expect(await findByText("Whiskers")).toBeTruthy();
    expect(await findByText("Breed:")).toBeTruthy();
    expect(await findByText("Siamese")).toBeTruthy();
    expect(await findByText("Colors:")).toBeTruthy();
    expect(await findByText("Cream and Brown")).toBeTruthy();
    expect(await findByText("Last seen location:")).toBeTruthy();
    expect(await findByText("Downtown")).toBeTruthy();
    expect(await findByText("Last seen date:")).toBeTruthy();
    expect(await findByText("2024-06-02T12:00:00Z")).toBeTruthy();
    expect(await findByText("Contact us if you see our cat")).toBeTruthy();

    expect(await findByText("Jane Doe")).toBeTruthy();
    expect(await findByText("987-654-3210")).toBeTruthy();

    expect(
      await findByText("https://spotapaw.com/posters/generated-poster-id"),
    ).toBeTruthy();
    expect(await findByText("View in browser")).toBeTruthy();
    expect(await findByText("Download PDF.")).toBeTruthy();
    expect(await findByText("Download PNG.")).toBeTruthy();

    const viewInBrowserLink = await findByText("View in browser");
    fireEvent.press(viewInBrowserLink);
    expect(Linking.openURL).toHaveBeenCalledWith(
      "https://spotapaw.com/posters/generated-poster-id",
    );

    const downloadPDFLink = await findByText("Download PDF.");
    fireEvent.press(downloadPDFLink);
    expect(Linking.openURL).toHaveBeenCalledWith(
      "https://example.com/generated-poster.pdf",
    );

    const downloadPNGLink = await findByText("Download PNG.");
    fireEvent.press(downloadPNGLink);
    expect(Linking.openURL).toHaveBeenCalledWith(
      "https://example.com/generated-poster.png",
    );
  });

  it("renders correctly with sightingId and posterId", async () => {
    mockGeneratePosterForSighting.mockResolvedValue({
      id: "valid-poster-id",
      headline: "Lost Dog",
      subheadline: "Please help us find our dog",
      description: "Our dog has been missing since yesterday.",
      cta: "Contact us if you see our dog",
      last_seen_location: "Central Park",
      last_seen_time: "2024-06-01T12:00:00Z",
      contact_name: "John Doe",
      contact_phone: "123-456-7890",
      created_at: "2024-06-01T12:00:00Z",
      name: "Buddy",
      breed: "Golden Retriever",
      colors: "Golden",
    });

    mockGetPoster.mockResolvedValue({
      id: "valid-poster-id",
      headline: "Lost Dog",
      subheadline: "Please help us find our dog",
      description: "Our dog has been missing since yesterday.",
      cta: "Contact us if you see our dog",
      last_seen_location: "Central Park",
      last_seen_time: "2024-06-01T12:00:00Z",
      contact_name: "John Doe",
      contact_phone: "123-456-7890",
      created_at: "2024-06-01T12:00:00Z",
      name: "Buddy",
      breed: "Golden Retriever",
      colors: "Golden",
    });
    const { getByText, findByText, queryByText } = render(
      <GeneratePoster
        sightingId="valid-sighting-id"
        posterId="valid-poster-id"
      />,
    );

    expect(getByText("Pet Sighting Poster")).toBeTruthy();
    expect(getByText("View generated poster for this sighting.")).toBeTruthy();
    expect(getByText("Generating poster...")).toBeTruthy();

    expect(mockGetPoster).toHaveBeenCalledWith("valid-poster-id");
    expect(mockGeneratePosterForSighting).toHaveBeenCalledWith(
      "valid-sighting-id",
      false,
    );

    expect(await findByText("Lost Dog")).toBeTruthy();
    expect(await findByText("Please help us find our dog")).toBeTruthy();
    expect(
      await findByText("Our dog has been missing since yesterday."),
    ).toBeTruthy();
    expect(await findByText("Buddy")).toBeTruthy();
    expect(await findByText("Breed:")).toBeTruthy();
    expect(await findByText("Golden Retriever")).toBeTruthy();
    expect(await findByText("Colors:")).toBeTruthy();
    expect(await findByText("Golden")).toBeTruthy();
    expect(await findByText("Last seen location:")).toBeTruthy();
    expect(await findByText("Central Park")).toBeTruthy();
    expect(await findByText("Last seen date:")).toBeTruthy();
    expect(await findByText("2024-06-01T12:00:00Z")).toBeTruthy();
    expect(await findByText("Contact us if you see our dog")).toBeTruthy();

    expect(await findByText("John Doe")).toBeTruthy();
    expect(await findByText("123-456-7890")).toBeTruthy();

    expect(
      await findByText("https://spotapaw.com/posters/valid-poster-id"),
    ).toBeTruthy();
    expect(await findByText("View in browser")).toBeTruthy();
    expect(await queryByText("Download PDF.")).toBeNull();
    expect(await queryByText("Download PNG.")).toBeNull();
  });
});
