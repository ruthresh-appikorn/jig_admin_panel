/**
 * Example test/verification for API Middleware
 * 
 * This file demonstrates how to verify the middleware is working correctly.
 * You can run this in your browser console or create a proper test file.
 */

// Example 1: Verify middleware is initialized
export function checkMiddlewareInitialized() {
  if (typeof window === "undefined") {
    console.log("❌ Not in browser environment");
    return false;
  }
  
  const isInitialized = (window as any).__api_middleware_initialized__;
  console.log(
    isInitialized 
      ? "✅ Middleware is initialized" 
      : "❌ Middleware is NOT initialized"
  );
  return isInitialized;
}

// Example 2: Test that headers are injected
export async function testHeaderInjection() {
  if (typeof window === "undefined") {
    console.log("❌ Not in browser environment");
    return;
  }

  console.log("🧪 Testing header injection...");
  
  // Mock fetch to intercept and log headers
  const originalFetch = window.fetch;
  let capturedHeaders: HeadersInit | undefined;
  
  // Temporarily override to capture headers
  const testFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    capturedHeaders = init?.headers;
    console.log("📦 Captured headers:", capturedHeaders);
    
    // Restore original fetch
    window.fetch = originalFetch;
    
    // Don't actually make the request
    throw new Error("Test completed - request not sent");
  };
  
  window.fetch = testFetch as any;
  
  try {
    // Make a test request
    await fetch("https://example.com/test", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer test-token",
      },
    });
  } catch (e) {
    // Expected to throw
  }
  
  // Check if x-tenant-key was added
  if (capturedHeaders && typeof capturedHeaders === "object") {
    const headers = capturedHeaders as Record<string, string>;
    if (headers["x-tenant-key"] === "APPIKORN") {
      console.log("✅ x-tenant-key header is correctly injected!");
      return true;
    } else {
      console.log("❌ x-tenant-key header is missing or incorrect");
      return false;
    }
  }
  
  console.log("❌ Could not verify headers");
  return false;
}

// Example 3: Verify in Network tab
export function howToVerifyInNetworkTab() {
  console.log(`
📋 How to verify in Browser DevTools:

1. Open your browser DevTools (F12 or Cmd+Option+I)
2. Go to the "Network" tab
3. Make any API call in your app (e.g., login, fetch data)
4. Click on the request in the Network tab
5. Look at the "Request Headers" section
6. Verify that "x-tenant-key: APPIKORN" is present

Example requests to check:
- Login API: POST https://appikorn.site/lavql
- Get User API: POST https://appikorn.site/lavql
- Any other fetch request in your app
  `);
}

// Run all checks
export function runAllChecks() {
  console.log("🚀 Running middleware verification checks...\n");
  
  checkMiddlewareInitialized();
  console.log("\n");
  
  howToVerifyInNetworkTab();
  
  console.log("\n✨ Verification complete!");
}

// Auto-run if in browser console
if (typeof window !== "undefined") {
  console.log("💡 Tip: Run runAllChecks() to verify the middleware");
}
