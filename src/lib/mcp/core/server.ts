/**
 * MCP Server Core Configuration
 *
 * This file contains the core configuration for the shadcn-svelte MCP server.
 * It defines the server information, capabilities, and initialization logic.
 */

export interface MCPServerConfig {
	name: string;
	version: string;
	description: string;
	capabilities: string[];
}

/**
 * Default MCP server configuration
 */
export const defaultServerConfig: MCPServerConfig = {
	name: 'shadcn-svelte-mcp',
	version: '0.1.0',
	description: 'MCP server for shadcn-svelte component documentation',
	capabilities: ['component-info', 'component-examples', 'theming', 'troubleshooting']
};

/**
 * Initialize the MCP server with the provided configuration
 * @param config Optional server configuration
 * @returns The server configuration
 */
export function initServer(config?: Partial<MCPServerConfig>): MCPServerConfig {
	return {
		...defaultServerConfig,
		...config
	};
}
