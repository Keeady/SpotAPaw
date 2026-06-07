import React, { useContext } from "react";
import { AuthContext, AuthProvider } from "./auth-provider";
import { render, waitFor } from "@testing-library/react-native";

const mockGetSession = jest.fn().mockResolvedValue({ data: { session: null } });
const mockOnAuthStateChange = jest.fn().mockImplementation((callback) => {
  callback("SIGNED_IN", { user: { id: "123" } });
  return { data: { subscription: null } };
});

jest.mock("../supabase-client", () => ({
  supabase: {
    auth: {
      getSession: () => mockGetSession(),
      onAuthStateChange: (callback: any) => mockOnAuthStateChange(callback),
    },
  },
}));

jest.mock("../logs", () => ({
  log: jest.fn(),
}));

const mockCheckOwnerMarkedForDeletion = jest.fn().mockResolvedValue(undefined);
const mockResetOwnerMarkedForDeletion = jest.fn().mockResolvedValue(undefined);
jest.mock("./auth-provider-util", () => ({
  checkOwnerMarkedForDeletion: (s: any, session: any) =>
    mockCheckOwnerMarkedForDeletion(s, session),
  resetOwnerMarkedForDeletion: (s: any, userId: string) =>
    mockResetOwnerMarkedForDeletion(s, userId),
}));

describe("AuthProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("provides empty session and user when getSession return empty", async () => {
    let contextValue: any;
    const TestComponent = () => {
      contextValue = useContext(AuthContext);
      return null;
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(contextValue).toBeDefined();
      expect(contextValue.session).toBeNull();
      expect(contextValue.user).toBeUndefined();
    });

    expect(mockGetSession).toHaveBeenCalled();
    expect(mockOnAuthStateChange).toHaveBeenCalled();
  });

  it("provides session and user when getSession return session", async () => {
    const mockSession = { user: { id: "123" } } as any;
    mockGetSession.mockResolvedValue({ data: { session: mockSession } });

    let contextValue: any;
    const TestComponent = () => {
      contextValue = useContext(AuthContext);
      return null;
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(contextValue).toBeDefined();
      expect(contextValue.session).toEqual(mockSession);
      expect(contextValue.user).toEqual(mockSession.user);
    });

    expect(mockOnAuthStateChange).toHaveBeenCalled();
  });

  it("handles SIGNED_IN event and updates owner status", async () => {
    const mockSession = { user: { id: "123" } } as any;
    mockGetSession.mockResolvedValue({ data: { session: null } });
    mockCheckOwnerMarkedForDeletion.mockResolvedValue(true);

    let contextValue: any;
    const TestComponent = () => {
      contextValue = useContext(AuthContext);
      return null;
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(contextValue).toBeDefined();
      expect(contextValue.session).toEqual(mockSession);
      expect(contextValue.user).toEqual(mockSession.user);
    });

    expect(mockCheckOwnerMarkedForDeletion).toHaveBeenCalledWith(
      expect.anything(),
      mockSession,
    );
    expect(mockResetOwnerMarkedForDeletion).toHaveBeenCalledWith(
      expect.anything(),
      mockSession.user.id,
    );
  });

  it("handles SIGNED_IN event and does not update owner status", async () => {
    const mockSession = { user: { id: "123" } } as any;
    mockGetSession.mockResolvedValue({ data: { session: null } });
    mockCheckOwnerMarkedForDeletion.mockResolvedValue(false);

    let contextValue: any;
    const TestComponent = () => {
      contextValue = useContext(AuthContext);
      return null;
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(contextValue).toBeDefined();
      expect(contextValue.session).toEqual(mockSession);
      expect(contextValue.user).toEqual(mockSession.user);
    });

    expect(mockCheckOwnerMarkedForDeletion).toHaveBeenCalledWith(
      expect.anything(),
      mockSession,
    );
    expect(mockResetOwnerMarkedForDeletion).not.toHaveBeenCalled();
  });

  it("handles SIGNED_IN event without session", async () => {
    mockOnAuthStateChange.mockImplementation((callback) => {
      callback("SIGNED_IN", null);
      return { data: { subscription: null } };
    });
    mockGetSession.mockResolvedValue({ data: { session: null } });
    let contextValue: any;
    const TestComponent = () => {
      contextValue = useContext(AuthContext);
      return null;
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(contextValue).toBeDefined();
      expect(contextValue.session).toBeNull();
      expect(contextValue.user).toBeUndefined();
    });

    expect(mockCheckOwnerMarkedForDeletion).not.toHaveBeenCalled();
    expect(mockResetOwnerMarkedForDeletion).not.toHaveBeenCalled();
  });

  it("handles different auth events with session", async () => {
    const mockSession = { user: { id: "123" } } as any;
    mockOnAuthStateChange.mockImplementation((callback) => {
      callback("OTHER_EVENT", mockSession);
      return { data: { subscription: null } };
    });
    mockGetSession.mockResolvedValue({ data: { session: mockSession } });
    let contextValue: any;
    const TestComponent = () => {
      contextValue = useContext(AuthContext);
      return null;
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(contextValue).toBeDefined();
      expect(contextValue.session).toEqual(mockSession);
      expect(contextValue.user).toEqual(mockSession.user);
    });

    expect(mockCheckOwnerMarkedForDeletion).not.toHaveBeenCalled();
    expect(mockResetOwnerMarkedForDeletion).not.toHaveBeenCalled();
  });
});
