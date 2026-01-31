import { toast } from "sonner";

type FetchOptions = RequestInit & {
  skipErrorToast?: boolean;
};

export async function api<T>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<T> {
  const { skipErrorToast, ...fetchOptions } = options;
  const url = `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`;

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
      const error = await response
        .json()
        .catch(() => ({ message: "Unknown error" }));
      if (!skipErrorToast) {
        toast.error(error.message || `Error: ${response.status}`);
      }
      throw new Error(error.message || `HTTP error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (!skipErrorToast) {
      toast.error(error instanceof Error ? error.message : "Network error");
    }
    throw error;
  }
}

// HTTP method helpers
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

export const del = <T>(endpoint: string, options?: FetchOptions) =>
  api<T>(endpoint, { ...options, method: "DELETE" });
