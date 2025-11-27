"use client";

export function initApiMiddleware() {
  if (typeof window === "undefined") return;
  // Avoid double-initialization
  if ((window as any).__api_middleware_initialized__) return;
  (window as any).__api_middleware_initialized__ = true;

  const originalFetch = window.fetch.bind(window);

  window.fetch = async (
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> => {
    // Extract URL for checking
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
        ? input.href
        : input.url;

    // Skip header injection for S3/presigned URLs
    // Presigned URLs have authentication in query params, not headers
    const isS3Request =
      url.includes("s3.appikorn.site") ||
      url.includes("amazonaws.com") ||
      url.includes("X-Amz-Signature"); // Presigned URL indicator

    // Inject headers into all requests (GET/POST) including GraphQL
    const headers = new Headers(init?.headers as any);

    // Only inject tenant key and authorization for non-S3 requests
    if (!isS3Request) {
      try {
        const { default: TokenManager } = await import(
          "@/core/auth/token_manager"
        );
        const tenantKey = TokenManager.getTenantKey();
        const token = TokenManager.getToken();

        if (tenantKey) {
          headers.set("x-tenant-key", tenantKey);
        }

        if (token && !headers.has("Authorization")) {
          headers.set("Authorization", token);
        }
      } catch {}
    }

    // Add JSON content-type for POST if not explicitly set
    const method = (init?.method || "GET").toUpperCase();

    if (method !== "GET") {
      if (!headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }
      if (!headers.has("Accept")) {
        headers.set("Accept", "application/json");
      }
    }

    const modifiedInit: RequestInit = {
      ...init,
      headers,
    };

    const res = await originalFetch(input as any, modifiedInit);

    // Check for GraphQL errors in successful responses (status 200 with errors array)
    if (res.ok) {
      try {
        const clonedRes = res.clone();
        const jsonData = await clonedRes.json();

        // Detect GraphQL errors
        if (jsonData && jsonData.errors && Array.isArray(jsonData.errors)) {
          const errorMessage = jsonData.errors
            .map((err: any) => err.message)
            .filter(Boolean)
            .join(", ");

          // Convert to error response so existing API error handling catches it
          const headers = new Headers(res.headers);
          headers.set("Content-Type", "application/json");

          return new Response(JSON.stringify(errorMessage), {
            status: 400, // Bad Request
            statusText: "GraphQL Error",
            headers,
          });
        }
      } catch {
        // If parsing fails, return original response
        return res;
      }
    }

    if (!res.ok) {
      let errorJson: any = null;

      try {
        // Try to read existing error JSON without consuming original stream for caller
        errorJson = await res.clone().json();
      } catch {
        errorJson = null;
      }

      const payload = errorJson ?? {
        quoteNo: "",
        respCode: String(res.status),
        errMessage: `HTTP ${res.status}`,
      };

      // Return a synthetic JSON response so downstream `response.json()` works reliably.
      const headers = new Headers(res.headers);

      headers.set("Content-Type", "application/json");

      return new Response(JSON.stringify(payload), {
        status: res.status,
        statusText: res.statusText,
        headers,
      });
    }

    return res;
  };
}
