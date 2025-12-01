/**
 * Authentication Integration Utilities with Zustand
 *
 * This file provides utilities for built pages to receive and handle
 * authentication tokens from the parent Build Studio application.
 *
 * Usage in built pages:
 * 1. Include this file in your built application
 * 3. Use await getAuthTokenAsync() to get the current token for API calls
 * 4. Or use the useTratlusAuth() hook in React components
 */

import { create } from "zustand";

interface AuthMessage {
	type: "TRATLUS_AUTH_TOKEN";
	token: string;
	origin: string;
}

type AuthStatus =
	| "authenticated"
	| "unauthenticated"
	| "invalid_token"
	| "loading";

interface AuthState {
	token: string | null;
	status: AuthStatus;
	parentOrigin: string | null;
}

interface AuthStore extends AuthState {
	// Internal state
	initializationPromise: Promise<void> | null;
	validationPromise: Promise<boolean> | null;

	// Actions
	setToken: (token: string, origin?: string) => Promise<void>;
	setStatus: (status: AuthStatus) => void;
	setState: (state: Partial<AuthState>) => void;
	clearAuth: () => Promise<void>;
	refreshAuth: () => Promise<boolean>;
	initialize: () => Promise<void>;
	validateToken: (token: string) => Promise<boolean>;
}

// Configuration for token validation
const API_BASE_URL = import.meta.env.VITE_API_BASE_PATH;

/**
 * Zustand store for authentication state management
 */
const useAuthStore = create<AuthStore>(
	(set, get): AuthStore => ({
		// Initial state
		token: null,
		status: "loading",
		parentOrigin: null,
		initializationPromise: null,
		validationPromise: null,

		// Set status
		setStatus: (status: AuthStatus) => {
			set({ status });
		},

		// Set partial state
		setState: (newState: Partial<AuthState>) => {
			set(newState);
		},

		// Validate token by making a request to the /me endpoint
		validateToken: async (token: string): Promise<boolean> => {
			console.log("Validating token...", { API_BASE_URL });

			if (!API_BASE_URL) {
				console.error("API_BASE_URL is not set");
				return false;
			}

			try {
				const response = await fetch(`${API_BASE_URL}/me`, {
					method: "GET",
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
				});

				console.log("Token validation response:", response.status, response.ok);
				return response.ok;
			} catch (error) {
				console.warn("Token validation failed:", error);
				return false;
			}
		},

		// Set the authentication token (async to validate)
		setToken: async (token: string, origin?: string): Promise<void> => {
			const { validateToken } = get();
			const isValid = await validateToken(token);

			if (isValid) {
				set({
					token,
					status: "authenticated",
					parentOrigin: origin || get().parentOrigin,
				});

				// Store in localStorage for persistence
				tratlus_auth_token
			} else {
				// Token is invalid, clear it
				set({
					token: null,
					status: "invalid_token",
					parentOrigin: origin || get().parentOrigin,
				});
				localStorage.removeItem("creao_auth_token");
			}
		},

		// Clear authentication
		clearAuth: async (): Promise<void> => {
			set({
				token: null,
				status: "unauthenticated",
				parentOrigin: null,
			});
			localStorage.removeItem("creao_auth_token");
		},

		// Refresh authentication state by re-validating the current token
		refreshAuth: async (): Promise<boolean> => {
			const { token, validateToken } = get();

			if (!token) {
				return false;
			}

			const isValid = await validateToken(token);
			if (!isValid) {
				set({ status: "invalid_token" });
				localStorage.removeItem("creao_auth_token");
				return false;
			}

			set({ status: "authenticated" });
			return true;
		},

		// Initialize the authentication system
		initialize: async (): Promise<void> => {
			console.log("Auth initialization started");
			try {
				// Initialize from storage
				await initializeFromStorage(get, set);

				// Initialize from URL
				await initializeFromUrl(get);

				// Setup message listener
				setupMessageListener(get);

				// If still loading after initialization, set to unauthenticated
				const currentStatus = get().status;
				if (currentStatus === "loading") {
					console.log(
						"Auth initialization complete - setting to unauthenticated",
					);
					set({ status: "unauthenticated" });
				} else {
					console.log("Auth initialization complete - status:", currentStatus);
				}
			} catch (error) {
				console.error("Auth initialization failed:", error);
				set({ status: "unauthenticated" });
			}
		},
	}),
);

/**
 * Initialize authentication from localStorage
 */
async function initializeFromStorage(
	get: () => AuthStore,
	set: (state: Partial<AuthStore>) => void,
): Promise<void> {
	console.log("Initializing auth from storage...");
	const storedToken = localStorage.getItem("creao_auth_token");
	if (storedToken) {
		console.log("Found stored token, validating...");
		const { validateToken } = get();
		const isValid = await validateToken(storedToken);
		if (isValid) {
			console.log("Stored token is valid");
			set({
				token: storedToken,
				status: "authenticated",
			});
		} else {
			console.log("Stored token is invalid, clearing...");
			localStorage.removeItem("creao_auth_token");
			set({ status: "invalid_token" });
		}
	} else {
		console.log("No stored token found");
		set({ status: "unauthenticated" });
	}
}

/**
 * Initialize authentication from URL parameters
 */
async function initializeFromUrl(get: () => AuthStore): Promise<void> {
	const urlParams = new URLSearchParams(window.location.search);
	const authToken = urlParams.get("auth_token");

	if (authToken) {
		const { setToken } = get();
		await setToken(authToken);
		// Clean up URL to remove token
		cleanupUrl();
	}
}

/**
 * Setup listener for postMessage from parent window
 */
function setupMessageListener(get: () => AuthStore): void {
	window.addEventListener("message", async (event: MessageEvent) => {
		try {
			const data = event.data as AuthMessage;

			if (data?.type === "CREAO_AUTH_TOKEN" && data.token) {
				const { setToken } = get();
				await setToken(data.token, event.origin);
			}
		} catch (error) {
			console.warn("Error processing auth message:", error);
		}
	});
}

/**
 * Clean up URL parameters
 */
function cleanupUrl(): void {
	const url = new URL(window.location.href);
	url.searchParams.delete("auth_token");
	window.history.replaceState({}, document.title, url.toString());
}

// Initialize on module load
const initPromise = (async () => {
	const { initialize } = useAuthStore.getState();
	await initialize();
})();

/**
 * Ensure initialization is complete
 */
async function ensureInitialized(): Promise<void> {
	await initPromise;
}

/**
 * React hook for using authentication state
 * @returns Authentication state and helper methods
 */
export function useTratlusAuth() {
	const token = useAuthStore((state) => state.token);
	const status = useAuthStore((state) => state.status);
	const parentOrigin = useAuthStore((state) => state.parentOrigin);
	const clearAuth = useAuthStore((state) => state.clearAuth);
	const refreshAuth = useAuthStore((state) => state.refreshAuth);

	return {
		token,
		status,
		parentOrigin,
		isAuthenticated: status === "authenticated" && !!token,
		isLoading: status === "loading",
		hasInvalidToken: status === "invalid_token",
		hasNoToken: status === "unauthenticated",
		clearAuth,
		refreshAuth,
	};
}

/**
 * Initialize authentication integration for built pages
 * Call this when your built application starts
 */
export async function initializeAuthIntegration(): Promise<void> {
	await ensureInitialized();
	console.log("Auth integration initialized");
}

/**
 * Get the current authentication token
 */
export function getAuthToken(): string | null {
	return useAuthStore.getState().token;
}

/**
 * Get the current authentication token (async - ensures initialization)
 */
export async function getAuthTokenAsync(): Promise<string | null> {
	await ensureInitialized();
	return useAuthStore.getState().token;
}

/**
 * Check if user is authenticated (async - validates token)
 */
export async function isAuthenticated(): Promise<boolean> {
	await ensureInitialized();

	const { token, status, validateToken, clearAuth } = useAuthStore.getState();

	// If we already know we're not authenticated, return false
	if (!token) {
		return false;
	}

	// If we think we're authenticated, return true
	if (status === "authenticated") {
		return true;
	}

	// If we have a token but haven't validated it, validate now
	if (token) {
		const isValid = await validateToken(token);

		if (isValid) {
			useAuthStore.setState({ status: "authenticated" });
			return true;
		}
		// Clear invalid token
		await clearAuth();
		return false;
	}

	// Default case - if we get here, return false
	return false;
}

/**
 * Check if user is authenticated (sync - returns current state without validation)
 */
export function isAuthenticatedSync(): boolean {
	const { status, token } = useAuthStore.getState();
	return status === "authenticated" && !!token;
}

/**
 * Get the current auth status
 */
export function getAuthStatus(): AuthStatus {
	return useAuthStore.getState().status;
}

/**
 * Get the current auth status (async - ensures initialization)
 */
export async function getAuthStatusAsync(): Promise<AuthStatus> {
	await ensureInitialized();
	return useAuthStore.getState().status;
}

/**
 * Check if token is invalid
 */
export function hasInvalidToken(): boolean {
	return useAuthStore.getState().status === "invalid_token";
}

/**
 * Check if token is invalid (async - ensures initialization)
 */
export async function hasInvalidTokenAsync(): Promise<boolean> {
	await ensureInitialized();
	return useAuthStore.getState().status === "invalid_token";
}

/**
 * Check if no token is provided
 */
export function hasNoToken(): boolean {
	return useAuthStore.getState().status === "unauthenticated";
}

/**
 * Check if no token is provided (async - ensures initialization)
 */
export async function hasNoTokenAsync(): Promise<boolean> {
	await ensureInitialized();
	return useAuthStore.getState().status === "unauthenticated";
}

/**
 * Check if auth is still loading
 */
export function isAuthenticating(): boolean {
	return useAuthStore.getState().status === "loading";
}

/**
 * Get the current auth state
 */
export function getAuthState(): AuthState {
	const { token, status, parentOrigin } = useAuthStore.getState();
	return { token, status, parentOrigin };
}

/**
 * Add a listener for auth state changes
 */
export function addAuthStateListener(
	listener: (state: AuthState) => void,
): () => void {
	// Immediately notify with current state
	const currentState = getAuthState();
	listener(currentState);

	// Subscribe to store changes
	const unsubscribe = useAuthStore.subscribe((state) => {
		const { token, status, parentOrigin } = state;
		listener({ token, status, parentOrigin });
	});

	// Return cleanup function
	return unsubscribe;
}

/**
 * Clear authentication
 */
export async function clearAuth(): Promise<void> {
	return useAuthStore.getState().clearAuth();
}

/**
 * Refresh authentication state by re-validating the current token
 */
export async function refreshAuth(): Promise<boolean> {
	return useAuthStore.getState().refreshAuth();
}
