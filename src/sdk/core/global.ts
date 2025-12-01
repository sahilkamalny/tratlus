import { initializeAuthIntegration } from "./auth";

// Parse URL and set global variables
declare global {
	interface Window {
		APP_CONFIG: GlobalAppConfig;
	}
}

export const APP_CONFIG = initializeTratlusSDK();

function initializeTratlusSDK() {
	const config = parseCurrentUrl();
	window.APP_CONFIG = config;

	console.log("App Configuration:", {
		userId: config.userId,
		projectId: config.projectId,
		taskId: config.taskId,
		workspaceId: config.workspaceId,
		uploadFolder: config.uploadFolder,
		baseUrl: config.baseUrl,
		isValidBuildUrl: config.isValidBuildUrl,
		currentUrl: window.location.href,
	});

	Promise.resolve().then(() => {
		initializeAuthIntegration();
	});

	return config;
}

interface GlobalAppConfig {
	userId: string | null;
	projectId: string | null;
	taskId: string | null;
	workspaceId: string | null; // Combined projectId-taskId
	uploadFolder: string | null; // Upload folder path
	baseUrl: string | null;
	isValidBuildUrl: boolean;
}

function parseCurrentUrl(): GlobalAppConfig {
	const currentUrl = window.location.href;

	// Pattern: {base_url}/builds/{userId}/{projectId}/{taskId}/dist
	const buildUrlRegex =
		/^(https?:\/\/[^\/]+)\/builds\/([^\/]+)\/([^\/]+)\/([^\/]+)\/dist/;
	const match = currentUrl.match(buildUrlRegex);

	if (match) {
		const [, baseUrl, userId, projectId, taskId] = match;
		const workspaceId = `${projectId}-${taskId}`;
		return {
			userId,
			projectId,
			taskId,
			workspaceId,
			uploadFolder: "resources",
			baseUrl,
			isValidBuildUrl: true,
		};
	}

	// If not a build URL, return nulls
	return {
		userId: null,
		projectId: null,
		taskId: null,
		workspaceId: null,
		uploadFolder: null,
		baseUrl: null,
		isValidBuildUrl: false,
	};
}
