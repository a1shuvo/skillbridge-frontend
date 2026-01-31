import { toast } from "sonner";

export interface ValidationError {
  path: (string | number)[];
  message: string;
}

export interface ApiError extends Error {
  status?: number;
  data?: {
    success: boolean;
    message: string;
    errors?: Record<string, string | string[]> | ValidationError[];
  };
}

type FetchOptions = RequestInit & {
  skipErrorToast?: boolean;
};

export async function api<T>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<T> {
  const { skipErrorToast, ...fetchOptions } = options;

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const url = `${baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers: {
        "Content-Type": "application/json",
        ...fetchOptions.headers,
      },
      credentials: "include",
    });

    if (!response.ok) {
      let errorMessage = `HTTP Error ${response.status}`;
      let errorData: ApiError["data"];

      try {
        errorData = await response.json();
        errorMessage = errorData?.message || errorMessage;
      } catch {
        // Fallback for non-JSON errors
      }

      if (!skipErrorToast) {
        toast.error(errorMessage);
      }

      // Create error and assign status without using 'any'
      const error = new Error(errorMessage) as ApiError;
      error.status = response.status;
      error.data = errorData;
      throw error;
    }

    if (response.status === 204) return {} as T;

    return await response.json();
  } catch (error: unknown) {
    // If it's already our structured ApiError (thrown from the !response.ok block)
    if (error instanceof Error && "status" in error) {
      throw error;
    }

    // Handle true Network/Fetch errors
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";

    if (!skipErrorToast) {
      toast.error(errorMessage);
    }

    const finalError = new Error(errorMessage) as ApiError;
    throw finalError;
  }
}

// HTTP Method Helpers... (get, post, put, patch, del remain the same)
export const get = <T>(endpoint: string, options?: FetchOptions) =>
  api<T>(endpoint, { ...options, method: "GET" });

export const post = <T>(
  endpoint: string,
  data: unknown,
  options?: FetchOptions,
) =>
  api<T>(endpoint, { ...options, method: "POST", body: JSON.stringify(data) });

export const put = <T>(
  endpoint: string,
  data: unknown,
  options?: FetchOptions,
) =>
  api<T>(endpoint, { ...options, method: "PUT", body: JSON.stringify(data) });

export const patch = <T>(
  endpoint: string,
  data: unknown,
  options?: FetchOptions,
) =>
  api<T>(endpoint, { ...options, method: "PATCH", body: JSON.stringify(data) });

export const del = <T>(endpoint: string, options?: FetchOptions) =>
  api<T>(endpoint, { ...options, method: "DELETE" });
