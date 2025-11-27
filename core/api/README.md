# API Middleware

## Overview
This directory contains the global API middleware that intercepts all fetch requests in the application.

## Features

### 1. Automatic Header Injection
The middleware automatically injects the following header into **all** fetch requests:
- `x-tenant-key: APPIKORN`

This happens transparently without requiring any changes to individual API files.

### 2. Error Handling
The middleware also provides centralized error handling:
- Catches non-OK responses (status codes >= 400)
- Attempts to parse error JSON from the response
- Returns a standardized error payload format
- Ensures downstream code can reliably call `response.json()`

## How It Works

### Initialization
The middleware is initialized once when the app starts in `app/providers.tsx`:

```typescript
React.useEffect(() => {
  initApiMiddleware();
}, []);
```

### Request Interception
When any component makes a fetch request:

```typescript
const response = await fetch("https://appikorn.site/lavql", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: authToken,
  },
  body: JSON.stringify(data),
});
```

The middleware automatically transforms it to:

```typescript
const response = await fetch("https://appikorn.site/lavql", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: authToken,
    "x-tenant-key": "APPIKORN",  // ← Automatically added
  },
  body: JSON.stringify(data),
});
```

## Benefits

1. **Zero Code Changes**: No need to modify any of the 36+ existing API files
2. **Consistency**: Ensures the tenant key is always sent with every request
3. **Maintainability**: Single source of truth for global headers
4. **Flexibility**: Easy to add more global headers in the future
5. **Type Safety**: Maintains TypeScript type safety throughout

## Configuration

To modify the tenant key or add additional headers, edit `/core/api/middleware.ts`:

```typescript
const modifiedInit: RequestInit = {
  ...init,
  headers: {
    ...init?.headers,
    "x-tenant-key": "APPIKORN",
    // Add more global headers here
  },
};
```

## Important Notes

- The middleware only runs on the client side (`typeof window !== "undefined"`)
- It prevents double-initialization using a global flag
- Existing headers in individual API calls are preserved and merged
- The middleware does not interfere with request bodies or other fetch options
