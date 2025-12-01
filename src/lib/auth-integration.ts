/**
 * Authentication Integration Utilities (Legacy Compatibility Layer)
 *
 * This file provides backward-compatible exports for the authentication system.
 * The actual implementation has been migrated to the sdk
 *
 * @deprecated This file is maintained for backward compatibility.
 * New code should import directly from '@/sdk/core/auth' and '@/sdk/core/request'
 *
 * Usage in built pages:
 * 1. Include this file in your built application
 * 2. Call initializeAuthIntegration() when your app starts
 * 3. Use getAuthToken() to get the current token for API calls
 */

// Re-export all functionality from the new auth module

import * as NewAuth from "@/sdk/core/auth";
import { platformApi, platformRequest } from "@/sdk/core/request";

// ============================================================================
// Re-exported Functions - All delegate to the new implementation
// ============================================================================

/**
 * Get the current authentication token (sync version)
 */
export const getAuthToken = NewAuth.getAuthToken;

/**
 * Get the current authentication token (async - ensures initialization)
 */
export const getAuthTokenAsync = NewAuth.getAuthTokenAsync;

/**
 * Check if user is authenticated (async - validates token)
 */
export const isAuthenticated = NewAuth.isAuthenticated;

/**
 * Check if user is authenticated (sync - returns current state without validation)
 */
export const isAuthenticatedSync = NewAuth.isAuthenticatedSync;

/**
 * Get the current auth status (sync version)
 */
export const getAuthStatus = NewAuth.getAuthStatus;

/**
 * Get the current auth status (async - ensures initialization)
 */
export const getAuthStatusAsync = NewAuth.getAuthStatusAsync;

/**
 * Check if token is invalid (sync version)
 */
export const hasInvalidToken = NewAuth.hasInvalidToken;

/**
 * Check if token is invalid (async - ensures initialization)
 */
export const hasInvalidTokenAsync = NewAuth.hasInvalidTokenAsync;

/**
 * Check if no token is provided (sync version)
 */
export const hasNoToken = NewAuth.hasNoToken;

/**
 * Check if no token is provided (async - ensures initialization)
 */
export const hasNoTokenAsync = NewAuth.hasNoTokenAsync;

/**
 * Check if auth is still loading
 */
export const isLoading = NewAuth.isAuthenticating;

/**
 * Get the current auth state
 */
export const getAuthState = NewAuth.getAuthState;

/**
 * Add a listener for auth state changes
 */
export const addAuthStateListener = NewAuth.addAuthStateListener;

/**
 * Create an authenticated fetch function that automatically includes auth headers
 */
export const createAuthenticatedFetch = () => platformRequest.bind(null);

/**
 * Direct authenticated fetch function - simpler to use than createAuthenticatedFetch
 */
export const authenticatedFetch = platformRequest;

/**
 * Clear authentication
 */
export const clearAuth = NewAuth.clearAuth;

/**
 * Refresh authentication state by re-validating the current token
 */
export const refreshAuth = NewAuth.refreshAuth;

/**
 * For non-React environments, export a simple API client
 */
export const authApi = platformApi;

/**
 * Re-export the React hook
 */
export const useTratlusAuth = NewAuth.useTratlusAuth;

/**
 * Default export - for backward compatibility
 * @deprecated Use named exports instead
 */
export default {
	getAuthToken,
	getAuthTokenAsync,
	isAuthenticated,
	isAuthenticatedSync,
	getAuthStatus,
	getAuthStatusAsync,
	hasInvalidToken,
	hasInvalidTokenAsync,
	hasNoToken,
	hasNoTokenAsync,
	isLoading,
	getAuthState,
	addAuthStateListener,
	createAuthenticatedFetch,
	authenticatedFetch,
	clearAuth,
	refreshAuth,
	authApi,
	useTratlusAuth,
};
