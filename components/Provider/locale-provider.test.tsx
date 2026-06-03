import { render, waitFor } from "@testing-library/react-native";
import { LocaleContext, LocaleContextProvider } from "./locale-provider";
import { useContext } from "react";

const mockGetStorageItem = jest.fn().mockResolvedValue(null);
const mockSaveStorageItem = jest.fn();
jest.mock("../util", () => ({
  getStorageItem: () => mockGetStorageItem(),
  saveStorageItem: (key: string, value: string) =>
    mockSaveStorageItem(key, value),
}));

jest.mock("../logs", () => ({
  log: jest.fn(),
}));

const mockGetLocales = jest.fn().mockReturnValue([{ languageCode: "" }]);
jest.mock("expo-localization", () => ({
  getLocales: () => mockGetLocales(),
}));

const mockChangeLanguage = jest.fn().mockResolvedValue(undefined);
jest.mock("i18next", () => ({
  changeLanguage: (value: string) => mockChangeLanguage(value),
}));

const mockReloadAsync = jest.fn().mockResolvedValue(undefined);
jest.mock("expo-updates", () => ({
  reloadAsync: () => mockReloadAsync(),
}));

describe("LocaleProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("provides the correct preferred language from default", () => {
    let contextValue: any;
    const TestComponent = () => {
      contextValue = useContext(LocaleContext);
      return null;
    };

    render(
      <LocaleContextProvider>
        <TestComponent />
      </LocaleContextProvider>,
    );

    expect(contextValue).toBeDefined();
    expect(contextValue.preferredLanguage).toBe("en");
  });

  it("provides the correct preferred language from locale ", () => {
    mockGetLocales.mockReturnValue([{ languageCode: "it" }]);
    let contextValue: any;
    const TestComponent = () => {
      contextValue = useContext(LocaleContext);
      return null;
    };

    render(
      <LocaleContextProvider>
        <TestComponent />
      </LocaleContextProvider>,
    );

    expect(contextValue).toBeDefined();
    expect(contextValue.preferredLanguage).toBe("it");
  });

  it("provides the correct preferred language from storage", async () => {
    const storedLanguage = "fr";
    mockGetLocales.mockReturnValue([{ languageCode: "it" }]);
    mockGetStorageItem.mockResolvedValueOnce(storedLanguage);
    let contextValue: any;
    const TestComponent = () => {
      contextValue = useContext(LocaleContext);
      return null;
    };

    render(
      <LocaleContextProvider>
        <TestComponent />
      </LocaleContextProvider>,
    );

    await waitFor(() => {
      expect(contextValue).toBeDefined();
      expect(contextValue.preferredLanguage).toBe(storedLanguage);
    });
  });

  it("provides the correct preferred language from storage when storage fails", async () => {
    mockGetLocales.mockReturnValue([{ languageCode: "it" }]);
    mockGetStorageItem.mockRejectedValueOnce(new Error("Storage error"));
    let contextValue: any;
    const TestComponent = () => {
      contextValue = useContext(LocaleContext);
      return null;
    };

    render(
      <LocaleContextProvider>
        <TestComponent />
      </LocaleContextProvider>,
    );

    await waitFor(() => {
      expect(contextValue).toBeDefined();
      expect(contextValue.preferredLanguage).toBe("it");
    });
  });

  it("provides a function to save language context", async () => {
    let contextValue: any;
    const TestComponent = () => {
      contextValue = useContext(LocaleContext);
      return null;
    };

    render(
      <LocaleContextProvider>
        <TestComponent />
      </LocaleContextProvider>,
    );

    await waitFor(() => {
      expect(contextValue).toBeDefined();
      expect(typeof contextValue.saveLanguageContext).toBe("function");
      contextValue.saveLanguageContext("es");

      expect(mockSaveStorageItem).toHaveBeenCalledWith(
        "preferredLanguage",
        "es",
      );
      expect(mockChangeLanguage).toHaveBeenCalledWith("es");
      expect(mockReloadAsync).not.toHaveBeenCalled();
    });
  });

  it("switches to RTL layout when Arabic is selected", async () => {
    let contextValue: any;
    const TestComponent = () => {
      contextValue = useContext(LocaleContext);
      return null;
    };

    render(
      <LocaleContextProvider>
        <TestComponent />
      </LocaleContextProvider>,
    );

    await waitFor(() => {
      expect(contextValue).toBeDefined();
      expect(typeof contextValue.saveLanguageContext).toBe("function");
      contextValue.saveLanguageContext("ar");
      expect(mockSaveStorageItem).toHaveBeenCalledWith(
        "preferredLanguage",
        "ar",
      );
      expect(mockChangeLanguage).toHaveBeenCalledWith("ar");
      expect(mockReloadAsync).toHaveBeenCalled();
    });
  }); 
});
