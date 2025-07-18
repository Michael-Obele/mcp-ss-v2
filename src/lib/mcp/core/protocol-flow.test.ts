/**
 * Protocol Flow Tests for MCP Server
 *
 * These tests verify the flow through the protocol handler,
 * ensuring that the core MCP functionality works correctly.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MCPServer } from './server';
import { MCPProtocolHandler } from './protocol-handlers';
import type { MCPTool } from './types';

describe('MCP Protocol Flow Tests', () => {
	let server: MCPServer;
	let protocolHandler: MCPProtocolHandler;

	beforeEach(() => {
		// Create a new server instance for each test
		server = new MCPServer({
			name: 'test-server',
			version: '1.0.0',
			description: 'Test MCP server',
			capabilities: ['test']
		});

		// Mock server log method to prevent console output during tests
		vi.spyOn(server, 'log').mockImplementation(() => {});

		// Create a new protocol handler
		protocolHandler = new MCPProtocolHandler(server);
	});

	describe('Initialization and Discovery', () => {
		it('should handle initialization requests', async () => {
			const request = {
				version: '1.0',
				client: {
					name: 'test-client',
					version: '1.0.0'
				}
			};

			const response = await protocolHandler.handleInit(request);

			expect(response.status).toBe('success');
			expect(response.server).toBeDefined();
			expect(response.server.name).toBe('test-server');
			expect(response.version).toBe('1.0');
		});

		it('should handle discovery requests for tools', async () => {
			// Register a sample tool
			const tool: MCPTool = {
				name: 'testTool',
				description: 'A test tool',
				parameters: {
					param1: { type: 'string', description: 'Test parameter' }
				}
			};

			const toolHandler = async () => ({ result: 'success' });
			protocolHandler.registerTool(tool, toolHandler);

			const request = {
				type: 'tools'
			};

			const response = await protocolHandler.handleDiscovery(request);

			expect(response.status).toBe('success');
			expect(response.tools).toBeDefined();
			expect(response.tools).toHaveLength(1);
			expect(response.tools![0].name).toBe('testTool');
		});

		it('should handle discovery requests for all capabilities', async () => {
			// Register a sample tool and resource
			const tool: MCPTool = {
				name: 'testTool',
				description: 'A test tool',
				parameters: {}
			};

			protocolHandler.registerTool(tool, async () => ({ result: 'success' }));

			protocolHandler.registerResource(
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

			const response = await protocolHandler.handleDiscovery(request);

			expect(response.status).toBe('success');
			expect(response.tools).toBeDefined();
			expect(response.resources).toBeDefined();
			expect(response.tools).toHaveLength(1);
			expect(response.resources).toHaveLength(1);
		});
	});

	describe('Tool and Resource Handling', () => {
		it('should handle tool requests', async () => {
			// Register a sample tool
			const tool: MCPTool = {
				name: 'testTool',
				description: 'A test tool',
				parameters: {
					param1: { type: 'string', description: 'Test parameter' }
				}
			};

			const toolHandler = vi.fn().mockResolvedValue({ output: 'tool result' });
			protocolHandler.registerTool(tool, toolHandler);

			const request = {
				tool: 'testTool',
				params: { param1: 'test value' }
			};

			const response = await protocolHandler.handleToolRequest(request);

			expect(response.status).toBe('success');
			expect(response.result).toEqual({ output: 'tool result' });
			expect(toolHandler).toHaveBeenCalledWith({ param1: 'test value' });
		});

		it('should handle unknown tool requests', async () => {
			const request = {
				tool: 'unknownTool',
				params: {}
			};

			const response = await protocolHandler.handleToolRequest(request);

			expect(response.status).toBe('error');
			expect(response.error?.code).toBe('TOOL_NOT_FOUND');
		});

		it('should handle resource requests', async () => {
			// Register a sample resource
			const resourceHandler = vi.fn().mockResolvedValue({ content: 'resource data' });

			protocolHandler.registerResource(
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

			const response = await protocolHandler.handleResourceRequest(request);

			expect(response.status).toBe('success');
			expect(response.data).toEqual({ content: 'resource data' });
			expect(resourceHandler).toHaveBeenCalledWith({ filter: 'test' });
		});

		it('should handle unknown resource requests', async () => {
			const request = {
				resource: 'unknownResource'
			};

			const response = await protocolHandler.handleResourceRequest(request);

			expect(response.status).toBe('error');
			expect(response.error?.code).toBe('TOOL_NOT_FOUND');
		});
	});

	describe('Error Handling', () => {
		it('should handle tool execution errors', async () => {
			// Register a tool that throws an error
			protocolHandler.registerTool(
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

			const response = await protocolHandler.handleToolRequest(request);

			expect(response.status).toBe('error');
			expect(response.error?.code).toBe('INTERNAL_ERROR');
			expect(response.error?.details).toBe('Tool execution error');
		});

		it('should handle invalid request formats', async () => {
			const invalidRequests = [null, undefined, 'string', 123];

			for (const request of invalidRequests) {
				const response = await protocolHandler.processRequest(request);
				expect(response).toHaveProperty('status', 'error');
			}
		});
	});
});
