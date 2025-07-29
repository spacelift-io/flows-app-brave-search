export class BraveSearchApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public response?: any,
  ) {
    super(message);
    this.name = "BraveSearchApiError";
  }
}

export interface BraveSearchConfig {
  apiKey: string;
}

export async function makeRequest(
  config: BraveSearchConfig,
  endpoint: string,
  queryParams: Record<string, any> = {},
) {
  const url = new URL(endpoint);

  // Add query parameters
  Object.entries(queryParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, String(value));
    }
  });

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Accept-Encoding": "gzip",
      "X-Subscription-Token": config.apiKey,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new BraveSearchApiError(
      `API request failed: ${response.status} ${response.statusText}`,
      response.status,
      errorText,
    );
  }

  return response.json();
}

export function validateQuery(query: string): void {
  if (!query || typeof query !== "string" || query.trim().length === 0) {
    throw new Error("Search query is required and cannot be empty");
  }
}

export function sanitizeQuery(query: string): string {
  return query.trim();
}
