/**
 * MCP Server Initialization
 *
 * This file initializes the MCP server and populates the documentation store
 * with initial component data. It also sets up the MCP protocol handler with
 * the available tools and resources.
 */

import { documentationStore } from './documentation-store.js';
import { getInitialData } from './initial-data.js';
import { initServer, LogLevel } from './server.js';
import { createProtocolHandler } from './protocol-handlers.js';
import {
	validateComponent,
	validateComponentCategory,
	validateInstallationGuide
} from './validation.js';
import { mcpTools } from '../tools/index.js';
import { documentationResources, loadResource } from '../resources/index.js';
import { getServerConfig } from './config.js';
import { getMetricsService } from './metrics.js';
// import { PUBLIC_BASE_URL } from '$env/static/public';

/**
 * Initialize the MCP server and documentation store
 */
export function initMCPServer() {
	// Get configuration from centralized config
	const serverConfig = getServerConfig();

	// Initialize the server with configuration
	const server = initServer(serverConfig);

	// Log server initialization
	server.log(LogLevel.INFO, 'Initializing MCP server');
	server.log(LogLevel.DEBUG, 'Server configuration:', serverConfig);
	server.log(LogLevel.DEBUG, 'Base URL:', process.env.PUBLIC_BASE_URL);

	// Get initial data
	const initialData = getInitialData();

	// Clear any existing data
	documentationStore.clear();

	// Validate and add components
	server.log(LogLevel.INFO, `Loading ${initialData.components.length} components`);
	for (const component of initialData.components) {
		const validation = validateComponent(component);
		if (validation.isValid) {
			documentationStore.addComponent(component);
		} else {
			server.log(LogLevel.ERROR, `Invalid component ${component.name}:`, validation.errors);
		}
	}

	// Validate and add categories
	server.log(LogLevel.INFO, `Loading ${initialData.categories.length} categories`);
	for (const category of initialData.categories) {
		const validation = validateComponentCategory(category);
		if (validation.isValid) {
			documentationStore.addCategory(category);
		} else {
			server.log(LogLevel.ERROR, `Invalid category ${category.name}:`, validation.errors);
		}
	}

	// Validate and add installation guides
	server.log(LogLevel.INFO, `Loading ${initialData.installationGuides.length} installation guides`);
	for (const guide of initialData.installationGuides) {
		const validation = validateInstallationGuide(guide);
		if (validation.isValid) {
			documentationStore.addInstallationGuide(guide);
		} else {
			server.log(
				LogLevel.ERROR,
				`Invalid installation guide for ${guide.framework}:`,
				validation.errors
			);
		}
	}

	// Initialize the MCP protocol handler
	const protocolHandler = createProtocolHandler(server);

	// Register MCP tools
	server.log(LogLevel.INFO, 'Registering MCP tools');
	for (const tool of mcpTools) {
		if (tool.handler) {
			protocolHandler.registerTool(tool, tool.handler);
		} else {
			server.log(LogLevel.WARN, `Tool ${tool.name} has no handler, skipping registration`);
		}
	}

	// Register MCP resources
	server.log(LogLevel.INFO, 'Registering MCP resources');
	for (const resource of documentationResources) {
		protocolHandler.registerResource(resource, async (params) => {
			return loadResource(resource.name, params);
		});
	}

	// Log initialization status
	const stats = documentationStore.getStats();
	server.log(LogLevel.INFO, 'MCP server initialized with:', {
		components: stats.totalComponents,
		categories: stats.totalCategories,
		installationGuides: stats.totalInstallationGuides
	});

	return server;
}

// Initialize metrics service
export const metricsService = getMetricsService();

// Export a singleton instance that can be imported and used
export const mcpServer = initMCPServer();
