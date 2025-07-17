/**
 * MCP Protocol Handlers
 *
 * This file contains the handlers for MCP protocol operations including
 * initialization, discovery, and request/response processing.
 */

import type { MCPTool, MCPResource } from './types.js';
import { MCPServer, MCPErrorCode, LogLevel } from './server.js';

/**
 * MCP initialization request
 */
export interface MCPInitRequest {
	version: string;
	client: {
		name: string;
		version: string;
	};
}

/**
 * MCP initialization response
 */
export interface MCPInitResponse {
	version: string;
	server: {
		name: string;
		version: string;
		description: string;
		capabilities: string[];
	};
	status: 'success' | 'error';
	error?: {
		code: string;
		message: string;
	};
}

/**
 * MCP discovery request
 */
export interface MCPDiscoveryRequest {
	type: string; // 'tools' | 'resources' | 'all'
}

/**
 * MCP discovery response
 */
export interface MCPDiscoveryResponse {
	tools?: MCPTool[];
	resources?: MCPResource[];
	status: 'success' | 'error';
	error?: {
		code: string;
		message: string;
	};
}

/**
 * MCP tool request
 */
export interface MCPToolRequest {
	tool: string;
	params: Record<string, unknown>;
}

/**
 * MCP tool response
 */
export interface MCPToolResponse {
	result: unknown;
	status: 'success' | 'error';
	error?: {
		code: string;
		message: string;
		details?: unknown;
	};
}

/**
 * MCP resource request
 */
export interface MCPResourceRequest {
	resource: string;
	params?: Record<string, unknown>;
}

/**
 * MCP resource response
 */
export interface MCPResourceResponse {
	data: unknown;
	status: 'success' | 'error';
	error?: {
		code: string;
		message: string;
		details?: unknown;
	};
}

/**
 * MCP protocol handler class
 */
export class MCPProtocolHandler {
	private server: MCPServer;
	private tools: Map<string, MCPTool> = new Map();
	private resources: Map<string, MCPResource> = new Map();
	private toolHandlers: Map<string, (params: Record<string, unknown>) => Promise<unknown>> =
		new Map();
	private resourceHandlers: Map<string, (params?: Record<string, unknown>) => Promise<unknown>> =
		new Map();

	/**
	 * Create a new MCP protocol handler
	 * @param server MCP server instance
	 */
	constructor(server: MCPServer) {
		this.server = server;
	}

	/**
	 * Register an MCP tool
	 * @param tool Tool definition
	 * @param handler Tool handler function
	 */
	registerTool(
		tool: MCPTool,
		handler: (params: Record<string, unknown>) => Promise<unknown>
	): void {
		this.tools.set(tool.name, tool);
		this.toolHandlers.set(tool.name, handler);
		this.server.log(LogLevel.INFO, `Registered tool: ${tool.name}`);
	}

	/**
	 * Register an MCP resource
	 * @param resource Resource definition
	 * @param handler Resource handler function
	 */
	registerResource(
		resource: MCPResource,
		handler: (params?: Record<string, unknown>) => Promise<unknown>
	): void {
		// Store the resource with its data
		const resourceWithData = {
			...resource,
			data: {
				name: resource.name,
				description: resource.description,
				path: resource.path
			}
		};
		this.resources.set(resource.name, resourceWithData);
		this.resourceHandlers.set(resource.name, handler);
		this.server.log(LogLevel.INFO, `Registered resource: ${resource.name}`);
	}

	/**
	 * Get all registered tools
	 * @returns Array of registered tools
	 */
	getTools(): MCPTool[] {
		return Array.from(this.tools.values());
	}

	/**
	 * Get all registered resources
	 * @returns Array of registered resources
	 */
	getResources(): MCPResource[] {
		return Array.from(this.resources.values());
	}

	/**
	 * Handle MCP initialization request
	 * @param request Initialization request
	 * @returns Initialization response
	 */
	async handleInit(request: MCPInitRequest): Promise<MCPInitResponse> {
		try {
			// Log the initialization request
			this.server.log(LogLevel.INFO, 'Handling initialization request', request);

			// Validate the request
			if (!request || !request.version || !request.client) {
				return {
					version: '1.0',
					server: this.server.getServerInfo(),
					status: 'error',
					error: {
						code: MCPErrorCode.INVALID_REQUEST,
						message: 'Invalid initialization request'
					}
				};
			}

			// Check if the client version is compatible
			// For now, we support any version, but this could be enhanced in the future

			// Return the initialization response
			return {
				version: '1.0', // MCP protocol version
				server: this.server.getServerInfo(),
				status: 'success'
			};
		} catch (error) {
			this.server.log(LogLevel.ERROR, 'Error handling initialization request', error);
			return {
				version: '1.0',
				server: this.server.getServerInfo(),
				status: 'error',
				error: {
					code: MCPErrorCode.INTERNAL_ERROR,
					message: 'Internal server error during initialization'
				}
			};
		}
	}

	/**
	 * Handle MCP discovery request
	 * @param request Discovery request
	 * @returns Discovery response
	 */
	async handleDiscovery(request: MCPDiscoveryRequest): Promise<MCPDiscoveryResponse> {
		try {
			// Log the discovery request
			this.server.log(LogLevel.INFO, 'Handling discovery request', request);

			// Validate the request
			if (!request || !request.type) {
				return {
					status: 'error',
					error: {
						code: MCPErrorCode.INVALID_REQUEST,
						message: 'Invalid discovery request'
					}
				};
			}

			// Prepare the response based on the request type
			const response: MCPDiscoveryResponse = { status: 'success' };

			if (request.type === 'tools' || request.type === 'all') {
				response.tools = this.getTools();
			}

			if (request.type === 'resources' || request.type === 'all') {
				response.resources = this.getResources();
			}

			return response;
		} catch (error) {
			this.server.log(LogLevel.ERROR, 'Error handling discovery request', error);
			return {
				status: 'error',
				error: {
					code: MCPErrorCode.INTERNAL_ERROR,
					message: 'Internal server error during discovery'
				}
			};
		}
	}

	/**
	 * Handle MCP tool request
	 * @param request Tool request
	 * @returns Tool response
	 */
	async handleToolRequest(request: MCPToolRequest): Promise<MCPToolResponse> {
		try {
			// Log the tool request
			this.server.log(LogLevel.INFO, 'Handling tool request', request);

			// Validate the request
			if (!request || !request.tool || !request.params) {
				return {
					result: null,
					status: 'error',
					error: {
						code: MCPErrorCode.INVALID_REQUEST,
						message: 'Invalid tool request'
					}
				};
			}

			// Check if the tool exists
			const handler = this.toolHandlers.get(request.tool);
			if (!handler) {
				return {
					result: null,
					status: 'error',
					error: {
						code: MCPErrorCode.TOOL_NOT_FOUND,
						message: `Tool not found: ${request.tool}`
					}
				};
			}

			// Execute the tool handler
			const result = await handler(request.params);

			// Return the tool response
			return {
				result,
				status: 'success'
			};
		} catch (error) {
			this.server.log(LogLevel.ERROR, `Error handling tool request for ${request?.tool}`, error);
			return {
				result: null,
				status: 'error',
				error: {
					code: MCPErrorCode.INTERNAL_ERROR,
					message: 'Internal server error during tool execution',
					details: error instanceof Error ? error.message : String(error)
				}
			};
		}
	}

	/**
	 * Handle MCP resource request
	 * @param request Resource request
	 * @returns Resource response
	 */
	async handleResourceRequest(request: MCPResourceRequest): Promise<MCPResourceResponse> {
		try {
			// Log the resource request
			this.server.log(LogLevel.INFO, 'Handling resource request', request);

			// Validate the request
			if (!request || !request.resource) {
				return {
					data: null,
					status: 'error',
					error: {
						code: MCPErrorCode.INVALID_REQUEST,
						message: 'Invalid resource request'
					}
				};
			}

			// Check if the resource exists
			const handler = this.resourceHandlers.get(request.resource);
			if (!handler) {
				return {
					data: null,
					status: 'error',
					error: {
						code: MCPErrorCode.TOOL_NOT_FOUND,
						message: `Resource not found: ${request.resource}`
					}
				};
			}

			// Execute the resource handler
			const data = await handler(request.params);

			// Return the resource response
			return {
				data,
				status: 'success'
			};
		} catch (error) {
			this.server.log(
				LogLevel.ERROR,
				`Error handling resource request for ${request?.resource}`,
				error
			);
			return {
				data: null,
				status: 'error',
				error: {
					code: MCPErrorCode.INTERNAL_ERROR,
					message: 'Internal server error during resource access',
					details: error instanceof Error ? error.message : String(error)
				}
			};
		}
	}

	/**
	 * Process an MCP request
	 * @param requestBody Request body
	 * @returns Response object
	 */
	async processRequest(requestBody: unknown): Promise<unknown> {
		try {
			// Basic validation
			if (!requestBody || typeof requestBody !== 'object') {
				return {
					status: 'error',
					error: {
						code: MCPErrorCode.INVALID_REQUEST,
						message: 'Invalid request format'
					}
				};
			}

			const request = requestBody as Record<string, unknown>;

			// Determine the request type and handle accordingly
			if (this.isMCPInitRequest(request)) {
				return this.handleInit(request);
			} else if (this.isMCPDiscoveryRequest(request)) {
				return this.handleDiscovery(request);
			} else if (this.isMCPToolRequest(request)) {
				return this.handleToolRequest(request);
			} else if (this.isMCPResourceRequest(request)) {
				return this.handleResourceRequest(request);
			} else {
				return {
					status: 'error',
					error: {
						code: MCPErrorCode.INVALID_REQUEST,
						message: 'Unknown request type'
					}
				};
			}
		} catch (error) {
			this.server.log(LogLevel.ERROR, 'Error processing request', error);
			return {
				status: 'error',
				error: {
					code: MCPErrorCode.INTERNAL_ERROR,
					message: 'Internal server error',
					details: error instanceof Error ? error.message : String(error)
				}
			};
		}
	}

	private isMCPInitRequest(request: unknown): request is MCPInitRequest {
		const req = request as Record<string, unknown>;
		return 'version' in req && 'client' in req && typeof req.client === 'object';
	}

	private isMCPDiscoveryRequest(request: unknown): request is MCPDiscoveryRequest {
		const req = request as Record<string, unknown>;
		return 'type' in req && typeof req.type === 'string';
	}

	private isMCPToolRequest(request: unknown): request is MCPToolRequest {
		const req = request as Record<string, unknown>;
		return (
			'tool' in req &&
			typeof req.tool === 'string' &&
			'params' in req &&
			typeof req.params === 'object'
		);
	}

	private isMCPResourceRequest(request: unknown): request is MCPResourceRequest {
		const req = request as Record<string, unknown>;
		return 'resource' in req && typeof req.resource === 'string';
	}
}

/**
 * Create a new MCP protocol handler
 * @param server MCP server instance
 * @returns MCP protocol handler instance
 */
export function createProtocolHandler(server: MCPServer): MCPProtocolHandler {
	return new MCPProtocolHandler(server);
}
