/**
 * API Configuration
 *
 * These constants define the API endpoints used throughout the application.
 * They are configured to work in both development and Docker environments.
 */

// For browser-based requests, we need to use the appropriate host
// When running locally, use localhost. When deployed, use the server IP
const isProduction =
  typeof window !== "undefined" && window.location.hostname !== "localhost";

// Use the public IP in production, localhost for development
export const API_BASE_URL = isProduction
  ? "http://your-production-url.com" // Replace with your production URL
  : "http://localhost:3000"; // Localhost for development

// Specific API endpoints
export const API_ENDPOINTS = {
  // User authentication endpoints
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  PROFILE: `${API_BASE_URL}/api/auth/profile`,

  // Data endpoints
  USERS: `${API_BASE_URL}/api/users`,
  PRODUCTS: `${API_BASE_URL}/api/products`,
  ORDERS: `${API_BASE_URL}/api/orders`,

  // Dynamic endpoint generators
  USER_DETAIL: (userId: string) => `${API_BASE_URL}/api/users/${userId}`,
  PRODUCT_DETAIL: (productId: string) =>
    `${API_BASE_URL}/api/products/${productId}`,
  ORDER_DETAIL: (orderId: string) => `${API_BASE_URL}/api/orders/${orderId}`,

  // Search endpoints
  SEARCH_PRODUCTS: (query: string) =>
    `${API_BASE_URL}/api/products/search?q=${encodeURIComponent(query)}`,
  SEARCH_USERS: (query: string) =>
    `${API_BASE_URL}/api/users/search?q=${encodeURIComponent(query)}`,

  // File upload endpoints
  UPLOAD_IMAGE: `${API_BASE_URL}/api/upload/image`,
  UPLOAD_DOCUMENT: `${API_BASE_URL}/api/upload/document`,
};

// HTTP request methods
export const HTTP_METHODS = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  DELETE: "DELETE",
  PATCH: "PATCH",
};

// Common HTTP headers
export const COMMON_HEADERS = {
  JSON: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  MULTIPART: {
    Accept: "application/json",
  },
  AUTH: (token: string) => ({
    Authorization: `Bearer ${token}`,
  }),
};

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "auth_token",
  USER_PROFILE: "user_profile",
  THEME: "app_theme",
  LANGUAGE: "app_language",
};

// App routes
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  PROFILE: "/profile",
  DASHBOARD: "/dashboard",
  PRODUCTS: "/products",
  PRODUCT_DETAIL: (id: string) => `/products/${id}`,
  ORDERS: "/orders",
  ORDER_DETAIL: (id: string) => `/orders/${id}`,
  SETTINGS: "/settings",
  NOT_FOUND: "/404",
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Network error. Please check your connection and try again.",
  UNAUTHORIZED: "You are not authorized to access this resource.",
  NOT_FOUND: "The requested resource was not found.",
  SERVER_ERROR: "An unexpected server error occurred. Please try again later.",
  VALIDATION_ERROR: "Please check your input and try again.",
};

// Success messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: "You have successfully logged in.",
  LOGOUT_SUCCESS: "You have successfully logged out.",
  REGISTER_SUCCESS: "Your account has been created successfully.",
  UPDATE_SUCCESS: "Your changes have been saved successfully.",
  DELETE_SUCCESS: "The item has been deleted successfully.",
};

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  DEFAULT_SORT: "createdAt",
  DEFAULT_ORDER: "desc",
};

// export const TOKEN =
//   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGZkZmZlMzRkMjczZDVlNjU4Y2UyMTUiLCJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6IjAwMSIsImlhdCI6MTc2MTg5MDUyMCwiZXhwIjoxNzYxOTc2OTIwfQ.Gju1dimcO9NBl4hE6I1wNo1gWuIjFTb78qcGcV_ZOTY";
