/**
 * Token Management Utility
 * Handles localStorage token operations with error handling
 *
 * ✅ SECURITY UPDATE: Removed S3 credential storage
 * S3 credentials are NO LONGER stored in frontend - using presigned URLs instead
 */

const TOKEN_KEY = "authToken";
const TENANT_CODE_KEY = "tenantCode";
const TENANT_KEY_KEY = "tenantKey";

export class TokenManager {
  /**
   * Get token from localStorage with error handling
   */
  static getToken(): string | null {
    try {
      if (typeof window === "undefined") return null;
      return localStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.warn("Failed to get token from localStorage:", error);
      return null;
    }
  }

  /**
   * Set token in localStorage with error handling
   */
  static setToken(token: string): boolean {
    try {
      if (typeof window === "undefined") return false;
      localStorage.setItem(TOKEN_KEY, token);
      console.log("🔥 Token stored successfully");
      return true;
    } catch (error) {
      console.error("Failed to store token in localStorage:", error);
      return false;
    }
  }

  /**
   * Remove token from localStorage with error handling
   */
  static removeToken(): boolean {
    try {
      if (typeof window === "undefined") return false;
      localStorage.removeItem(TOKEN_KEY);
      console.log("🔥 Token removed successfully");
      return true;
    } catch (error) {
      console.error("Failed to remove token from localStorage:", error);
      return false;
    }
  }

  /**
   * Get tenant code from localStorage
   */
  static getTenantCode(): string | null {
    try {
      if (typeof window === "undefined") return null;
      return localStorage.getItem(TENANT_CODE_KEY);
    } catch (error) {
      console.warn("Failed to get tenant code from localStorage:", error);
      return null;
    }
  }

  /**
   * Set tenant code in localStorage
   */
  static setTenantCode(tenantCode: string): boolean {
    try {
      if (typeof window === "undefined") return false;
      localStorage.setItem(TENANT_CODE_KEY, tenantCode);
      console.log("🔥 Tenant code stored successfully");
      return true;
    } catch (error) {
      console.error("Failed to store tenant code in localStorage:", error);
      return false;
    }
  }

  /**
   * Get tenant key from localStorage
   */
  static getTenantKey(): string | null {
    try {
      if (typeof window === "undefined") return null;
      return localStorage.getItem(TENANT_KEY_KEY);
    } catch (error) {
      console.warn("Failed to get tenant key from localStorage:", error);
      return null;
    }
  }

  /**
   * Set tenant key in localStorage
   */
  static setTenantKey(tenantKey: string): boolean {
    try {
      if (typeof window === "undefined") return false;
      localStorage.setItem(TENANT_KEY_KEY, tenantKey);
      console.log("🔥 Tenant key stored successfully");
      return true;
    } catch (error) {
      console.error("Failed to store tenant key in localStorage:", error);
      return false;
    }
  }

  /**
   * Check if token exists and is valid (not empty)
   */
  static hasValidToken(): boolean {
    const token = this.getToken();
    return !!(token && token.trim() !== "");
  }

  /**
   * Clear all auth data (for logout)
   */
  static clearAll(): void {
    this.removeToken();
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem(TENANT_CODE_KEY);
        localStorage.removeItem(TENANT_KEY_KEY);
        console.log("🔥 All auth data cleared successfully");
      }
    } catch (error) {
      console.error("Failed to clear all auth data:", error);
    }
  }
}

export default TokenManager;