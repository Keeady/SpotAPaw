import AppConstants from "@/components/constants";
import { supabase } from "@/components/supabase-client";

type QueryParams = Record<string, string | number | boolean | null | undefined>;

interface RequestOptions {
  headers?: Record<string, string>;
  params?: QueryParams;
}

type TokenProvider = () => string | undefined | Promise<string | undefined>;

export class ApiClient {
  constructor(
    private readonly baseUrl: string,
    private readonly getToken?: TokenProvider,
    private readonly defaultHeaders: Record<string, string> = {},
  ) {}

  async get<T>(
    path: string,
    params?: QueryParams,
    options?: Omit<RequestOptions, "params">,
  ): Promise<T> {
    return this.request<T>("GET", path, undefined, {
      ...options,
      params,
    });
  }

  async post<TResponse, TBody = unknown>(
    path: string,
    body?: TBody,
    options?: RequestOptions,
  ): Promise<string> {
    return this.request<string>("POST", path, body, options);
  }

  async patch<TResponse, TBody = unknown>(
    path: string,
    body?: TBody,
    options?: RequestOptions,
  ): Promise<TResponse> {
    return this.request<TResponse>("PATCH", path, body, options);
  }

  async delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>("DELETE", path, options);
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    options: RequestOptions = {},
  ): Promise<T> {
    const url = new URL(path, this.baseUrl);

    if (options.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      });
    }

    const headers: Record<string, string> = {
      Accept: "application/json",
      ...this.defaultHeaders,
      ...options.headers,
    };

    if (body !== undefined) {
      headers["Content-Type"] = "application/json";
    }

    // Add Authorization
    if (this.getToken) {
      const token = await this.getToken();

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    const response = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorBody = await response.text();

      throw new ApiError(response.status, response.statusText, errorBody);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  }
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly responseBody?: string,
  ) {
    super(`API request failed: ${status} ${statusText} ${responseBody}`);
    this.name = "ApiError";
  }
}

export const publicApiClient = new ApiClient(
  AppConstants.EXPO_PUBLIC_BACKEND_API_HOST ||
    process.env.EXPO_PUBLIC_BACKEND_API_HOST ||
    "",
);

export const authenticatedApiClient = new ApiClient(
  AppConstants.EXPO_PUBLIC_BACKEND_API_HOST ||
    process.env.EXPO_PUBLIC_BACKEND_API_HOST ||
    "",
  async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    return session?.access_token;
  },
);
