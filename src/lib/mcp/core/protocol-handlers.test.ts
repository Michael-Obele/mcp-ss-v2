/**
 * Tests for MCP Protocol Handlers
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { MCPServer } from './server.js';
import { MCPProtocolHandler, createProtocolHandler } from './protocol-handlers.js';
import type { MCPTool, MCPResource } from './types.js';

describe('MCPProtocolHandler', () => {
	let server: MCPServer;
	let handler: MCPProtocolHandler;

	beforeEach(() => {
		// Create a new server instance for each test
		server = new MCPServer();

		// Mock server log method to prevent console output during tests
		vi.spyOn(server, 'log').mockImplementation(() => {});

		// Create a new protocol handler
		handler = createProtocolHandler(server);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe('Tool Registration', () => {
		it('should register and retrieve tools', async () => {
			// Define a sample tool
			const tool: MCPTool = {
				name: 'testTool',
				description: 'A test tool',
				parameters: {
					param1: { type: 'string', description: 'Test parameter' }
				}
			};

			// Define a handler function
			const toolHandler = async (params: Record<string, unknown>) => {
				return { result: 'success', params };
			};

			// Register the tool
			handler.registerTool(tool, toolHandler);

			// Get all tools
			const tools = handler.getTools();

			// Verify the tool was registered
			expect(tools).toHaveLength(1);
			expect(tools[0].name).toBe('testTool');
			expect(tools[0].description).toBe('A test tool');
		});
	});

	describe('Resource Registration', () => {
		it('should register and retrieve resources', async () => {
			// Define a sample resource
			const resource: MCPResource = {
				name: 'testResource',
				description: 'A test resource',
				path: '/test'
			};

			// Define a handler function
			const resourceHandler = async (params?: Record<string, unknown>) => {
				return { data: 'resource data', params };
			};

			// Register the resource
			handler.registerResource(resource, resourceHandler);

			// Get all resources
			const resources = handler.getResources();

			// Verify the resource was registered
			expect(resources).toHaveLength(1);
			expect(resources[0].data.name).toBe('testResource');
			expect(resources[0].data.description).toBe('A test resource');
		});
	});

	describe('Initialization Handling', () => {
		it('should handle valid initialization requests', async () => {
			const request = {
				version: '1.0',
				client: {
					name: 'test-client',
					version: '1.0.0'
				}
			};

			const response = await handler.handleInit(request);

			expect(response.status).toBe('success');
			expect(response.server.name).toBe('shadcn-svelte-mcp');
			expect(response.version).toBe('1.0');
		});

		it('should reject invalid initialization requests', async () => {
			const invalidRequest = {} as any;

			const response = await handler.handleInit(invalidRequest);

			expect(response.status).toBe('error');
			expect(response.error).toBeDefined();
		});
	});

	describe('Discovery Handling', () => {
		it('should handle tool discovery requests', async () => {
			// Register a sample tool
			handler.registerTool(
				{
					name: 'testTool',
					description: 'A test tool',
					parameters: {}
				},
				async () => ({ result: 'success' })
			);

			const request = {
				type: 'tools'
			};

			const response = await handler.handleDiscovery(request);

			expect(response.status).toBe('success');
			expect(response.tools).toBeDefined();
			expect(response.tools).toHaveLength(1);
			expect(response.tools![0].name).toBe('testTool');
		});

		it('should handle resource discovery requests', async () => {
			// Register a sample resource
			handler.registerResource(
				{
					name: 'testResource',
					description: 'A test resource',
					path: '/test'
				},
				async () => ({ data: 'resource data' })
			);

			const request = {
				type: 'resources'
			};

			const response = await handler.handleDiscovery(request);

			expect(response.status).toBe('success');
			expect(response.resources).toBeDefined();
			expect(response.resources).toHaveLength(1);
			expect(response.resources![0].name).toBe('testResource');
		});

		it('should handle all discovery requests', async () => {
			// Register a sample tool and resource
			handler.registerTool(
				{
					name: 'testTool',
					description: 'A test tool',
					parameters: {}
				},
				async () => ({ result: 'success' })
			);

			handler.registerResource(
				{
					name: 'testResource',
					description: 'A test resource',
					path: '/test'
				},
				async () => ({ data: 'resource data' })
			);

			const request = {
				type: 'all'
			};

			const response = await handler.handleDiscovery(request);

			expect(response.status).toBe('success');
			expect(response.tools).toBeDefined();
			expect(response.resources).toBeDefined();
			expect(response.tools).toHaveLength(1);
			expect(response.resources).toHaveLength(1);
		});

		it('should reject invalid discovery requests', async () => {
			const invalidRequest = {} as any;

			const response = await handler.handleDiscovery(invalidRequest);

			expect(response.status).toBe('error');
			expect(response.error).toBeDefined();
		});
	});

	describe('Tool Request Handling', () => {
		it('should handle valid tool requests', async () => {
			// Register a sample tool
			const toolHandler = vi.fn().mockResolvedValue({ output: 'tool result' });

			handler.registerTool(
				{
					name: 'testTool',
					description: 'A test tool',
					parameters: {
						param1: { type: 'string', description: 'Test parameter' }
					}
				},
				toolHandler
			);

			const request = {
				tool: 'testTool',
				params: { param1: 'test value' }
			};

			const response = await handler.handleToolRequest(request);

			expect(response.status).toBe('success');
			expect(response.result).toEqual({ output: 'tool result' });
			expect(toolHandler).toHaveBeenCalledWith({ param1: 'test value' });
		});

		it('should handle unknown tool requests', async () => {
			const request = {
				tool: 'unknownTool',
				params: {}
			};

			const response = await handler.handleToolRequest(request);

			expect(response.status).toBe('error');
			expect(response.error?.code).toBe('TOOL_NOT_FOUND');
		});

		it('should handle tool execution errors', async () => {
			// Register a tool that throws an error
			handler.registerTool(
				{
					name: 'errorTool',
					description: 'A tool that throws an error',
					parameters: {}
				},
				async () => {
					throw new Error('Tool execution error');
				}
			);

			const request = {
				tool: 'errorTool',
				params: {}
			};

			const response = await handler.handleToolRequest(request);

			expect(response.status).toBe('error');
			expect(response.error?.code).toBe('INTERNAL_ERROR');
			expect(response.error?.details).toBe('Tool execution error');
		});
	});

	describe('Resource Request Handling', () => {
		it('should handle valid resource requests', async () => {
			// Register a sample resource
			const resourceHandler = vi.fn().mockResolvedValue({ content: 'resource data' });

			handler.registerResource(
				{
					name: 'testResource',
					description: 'A test resource',
					path: '/test'
				},
				resourceHandler
			);

			const request = {
				resource: 'testResource',
				params: { filter: 'test' }
			};

			const response = await handler.handleResourceRequest(request);

			expect(response.status).toBe('success');
			expect(response.data).toEqual({ content: 'resource data' });
			expect(resourceHandler).toHaveBeenCalledWith({ filter: 'test' });
		});

		it('should handle unknown resource requests', async () => {
			const request = {
				resource: 'unknownResource'
			};

			const response = await handler.handleResourceRequest(request);

			expect(response.status).toBe('error');
			expect(response.error?.code).toBe('TOOL_NOT_FOUND');
		});
	});

	describe('Request Processing', () => {
		it('should process initialization requests', async () => {
			const request = {
				version: '1.0',
				client: {
					name: 'test-client',
					version: '1.0.0'
				}
			};

			const response = await handler.processRequest(request);

			expect(response).toHaveProperty('status', 'success');
			expect(response).toHaveProperty('server');
		});

		it('should process discovery requests', async () => {
			const request = {
				type: 'all'
			};

			const response = await handler.processRequest(request);

			expect(response).toHaveProperty('status', 'success');
		});

		it('should process tool requests', async () => {
			// Register a sample tool
			handler.registerTool(
				{
					name: 'testTool',
					description: 'A test tool',
					parameters: {}
				},
				async () => ({ result: 'success' })
			);

			const request = {
				tool: 'testTool',
				params: {}
			};

			const response = await handler.processRequest(request);

			expect(response).toHaveProperty('status', 'success');
		});

		it('should process resource requests', async () => {
			// Register a sample resource
			handler.registerResource(
				{
					name: 'testResource',
					description: 'A test resource',
					path: '/test'
				},
				async () => ({ data: 'resource data' })
			);

			const request = {
				resource: 'testResource'
			};

			const response = await handler.processRequest(request);

			expect(response).toHaveProperty('status', 'success');
		});

		it('should handle unknown request types', async () => {
			const request = {
				unknownType: 'value'
			};

			const response = await handler.processRequest(request);

			expect(response).toHaveProperty('status', 'error');
		});

		it('should handle invalid requests', async () => {
			const invalidRequests = [null, undefined, 'string', 123];

			for (const request of invalidRequests) {
				const response = await handler.processRequest(request);
				expect(response).toHaveProperty('status', 'error');
			}
		});
	});
});
