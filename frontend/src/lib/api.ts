function normalizeApiBaseUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

const API_URL = normalizeApiBaseUrl(
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000",
);

export function getApiBaseUrl(): string {
  return API_URL;
}

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

/**
 * Typed JSON requests to the NestJS API using the Fetch API.
 */
export async function apiJson<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    });
  } catch (cause) {
    throw new ApiError(
      "Unable to reach the server. Check that the API is running and NEXT_PUBLIC_API_URL is correct.",
      0,
      cause,
    );
  }

  const text = await response.text();
  const data = text ? safeJson(text) : null;

  if (!response.ok) {
    throw new ApiError(
      messageFromBody(data) || response.statusText || "Request failed",
      response.status,
      data,
    );
  }

  return data as T;
}

export function formatApiError(err: unknown): string {
  if (err instanceof ApiError) {
    return err.message;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return "Something went wrong";
}

function messageFromBody(data: unknown): string | null {
  if (!data || typeof data !== "object") {
    return null;
  }
  const record = data as Record<string, unknown>;
  const msg = record.message;
  if (Array.isArray(msg)) {
    const parts = msg.filter((m) => typeof m === "string") as string[];
    return parts.length ? parts.join(" ") : null;
  }
  if (typeof msg === "string" && msg.trim()) {
    return msg;
  }
  return null;
}

function safeJson(text: string) {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}
