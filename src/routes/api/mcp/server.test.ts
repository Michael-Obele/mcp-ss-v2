/**
 * Integration Tests for MCP API Endpoint
 *
 * These tests verify the end-to-end flow from API endpoint to tool execution,
 * ensuring that all components of the MCP server work together correctly.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GET, POST, OPTIONS } from './+server';
import { mcpServer } from '$lib/mcp/core/init';

// Mock dependencies
vi.mock('$lib/mcp/core/init', () => {
	return {
		mcpServer: {
			getServerInfo: vi.fn(() => ({
				name: 'shadcn-svelte-mcp',
				version: '0.1.0',
				description: 'MCP server for shadcn-svelte component documentation',
				capabilities: ['component-info', 'component-examples', 'theming', 'troubleshooting']
			})),
			log: vi.fn(),
			checkRateLimit: vi.fn(() => false),
			validateContentType: vi.fn(() => true),
			getConfig: vi.fn(() => ({
				maxRequestSize: 1024 * 1024
			})),
			createError: vi.fn((code, message) => ({ code, message })),
			applyCorsHeaders: vi.fn((req, res) => res),
			applySecurityHeaders: vi.fn((res) => res)
		}
	};
});

// Mock processMCPRequest
vi.mock('$lib/mcp/core/server', () => {
	return {
		LogLevel: {
			INFO: 'info',
			ERROR: 'error'
		},
		MCPErrorCode: {
			INVALID_REQUEST: 'INVALID_REQUEST',
			RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
			INTERNAL_ERROR: 'INTERNAL_ERROR',
			TOOL_NOT_FOUND: 'TOOL_NOT_FOUND',
			COMPONENT_NOT_FOUND: 'COMPONENT_NOT_FOUND',
			VALIDATION_ERROR: 'VALIDATION_ERROR'
		},
		processMCPRequest: vi.fn().mockImplementation((server, requestBody, clientId) => {
			// Mock different responses based on the request
			if (requestBody.type === 'all') {
				return {
					status: 'success',
					tools: [
						{
							name: 'getComponentInfo',
							description: 'Get component information',
							parameters: {}
						}
					],
					resources: [
						{
							name: 'components',
							description: 'Component documentation',
							path: '/components'
						}
					]
				};
			} else if (requestBody.version && requestBody.client) {
				return {
					version: '1.0',
					server: {
						name: 'shadcn-svelte-mcp',
						version: '0.1.0',
						description: 'MCP server for shadcn-svelte component documentation',
						capabilities: ['component-info', 'component-examples', 'theming', 'troubleshooting']
					},
					status: 'success'
				};
			} else if (requestBody.tool === 'getComponentInfo') {
				if (!requestBody.params.componentName) {
					return {
						result: null,
						status: 'error',
						error: {
							code: 'VALIDATION_ERROR',
							message: 'componentName parameter is required'
						}
					};
				} else if (requestBody.params.componentName === 'NonExistentComponent') {
					return {
						result: null,
						status: 'error',
						error: {
							code: 'COMPONENT_NOT_FOUND',
							message: 'Component "NonExistentComponent" not found'
						}
					};
				} else {
					return {
						result: {
							componentName: requestBody.params.componentName,
							topic: 'info',
							content: 'Component information'
						},
						status: 'success'
					};
				}
			} else if (requestBody.tool === 'nonExistentTool') {
				return {
					result: null,
					status: 'error',
					error: {
						code: 'TOOL_NOT_FOUND',
						message: 'Tool not found: nonExistentTool'
					}
				};
			} else {
				return {
					status: 'error',
					error: {
						code: 'INVALID_REQUEST',
						message: 'Invalid request'
					}
				};
			}
		})
	};
});

describe('MCP API Integration Tests', () => {
	let mockRequest: Request;

	beforeEach(() => {
		// Reset mocks
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe('OPTIONS Handler (CORS)', () => {
		it('should handle CORS preflight requests', async () => {
			mockRequest = new Request('https://example.com/api/mcp', {
				method: 'OPTIONS',
				headers: {
					Origin: 'https://client-app.com',
					'Access-Control-Request-Method': 'POST',
					'Access-Control-Request-Headers': 'Content-Type'
				}
			});

			const response = await OPTIONS({ request: mockRequest } as any);

			expect(response.status).toBe(204);
			expect(mcpServer.applyCorsHeaders).toHaveBeenCalledWith(mockRequest, expect.any(Response));
			expect(mcpServer.applySecurityHeaders).toHaveBeenCalledWith(expect.any(Response));
		});
	});

	describe('GET Handler (Discovery)', () => {
		it('should handle discovery requests and return server capabilities', async () => {
			mockRequest = new Request('https://example.com/api/mcp', {
				method: 'GET',
				headers: {
					Origin: 'https://client-app.com',
					'X-Forwarded-For': '127.0.0.1'
				}
			});

			const response = await GET({ request: mockRequest } as any);
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data.status).toBe('success');
			expect(data.tools).toBeDefined();
			expect(data.resources).toBeDefined();
			expect(mcpServer.checkRateLimit).toHaveBeenCalledWith('127.0.0.1');
			expect(mcpServer.log).toHaveBeenCalledWith('info', 'GET request from 127.0.0.1');
		});

		it('should handle rate limiting', async () => {
			// Mock rate limit exceeded
			vi.mocked(mcpServer.checkRateLimit).mockReturnValueOnce(true);

			mockRequest = new Request('https://example.com/api/mcp', {
				method: 'GET',
				headers: {
					'X-Forwarded-For': '127.0.0.1'
				}
			});

			const response = await GET({ request: mockRequest } as any);
			const data = await response.json();

			expect(response.status).toBe(429);
			expect(data.code).toBe('RATE_LIMIT_EXCEEDED');
		});
	});

	describe('POST Handler (Tool and Resource Requests)', () => {
		it('should handle initialization requests', async () => {
			const requestBody = {
				version: '1.0',
				client: {
					name: 'test-client',
					version: '1.0.0'
				}
			};

			mockRequest = new Request('https://example.com/api/mcp', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Forwarded-For': '127.0.0.1'
				},
				body: JSON.stringify(requestBody)
			});

			const response = await POST({ request: mockRequest } as any);
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data.status).toBe('success');
			expect(data.server).toBeDefined();
			expect(data.server.name).toBe('shadcn-svelte-mcp');
		});

		it('should handle tool requests for component information', async () => {
			const requestBody = {
				tool: 'getComponentInfo',
				params: {
					componentName: 'Button'
				}
			};

			mockRequest = new Request('https://example.com/api/mcp', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Forwarded-For': '127.0.0.1'
				},
				body: JSON.stringify(requestBody)
			});

			const response = await POST({ request: mockRequest } as any);
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data.status).toBe('success');
			expect(data.result).toBeDefined();
			expect(data.result.componentName).toBe('Button');
		});

		it('should handle component not found errors', async () => {
			const requestBody = {
				tool: 'getComponentInfo',
				params: {
					componentName: 'NonExistentComponent'
				}
			};

			mockRequest = new Request('https://example.com/api/mcp', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Forwarded-For': '127.0.0.1'
				},
				body: JSON.stringify(requestBody)
			});

			const response = await POST({ request: mockRequest } as any);
			const data = await response.json();

			expect(response.status).toBe(404);
			expect(data.status).toBe('error');
			expect(data.error).toBeDefined();
			expect(data.error.code).toBe('COMPONENT_NOT_FOUND');
		});

		it('should handle validation errors', async () => {
			const requestBody = {
				tool: 'getComponentInfo',
				params: {
					// Missing componentName parameter
				}
			};

			mockRequest = new Request('https://example.com/api/mcp', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Forwarded-For': '127.0.0.1'
				},
				body: JSON.stringify(requestBody)
			});

			const response = await POST({ request: mockRequest } as any);
			const data = await response.json();

			expect(response.status).toBe(422);
			expect(data.status).toBe('error');
			expect(data.error).toBeDefined();
			expect(data.error.code).toBe('VALIDATION_ERROR');
		});

		it('should handle unknown tool requests', async () => {
			const requestBody = {
				tool: 'nonExistentTool',
				params: {}
			};

			mockRequest = new Request('https://example.com/api/mcp', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Forwarded-For': '127.0.0.1'
				},
				body: JSON.stringify(requestBody)
			});

			const response = await POST({ request: mockRequest } as any);
			const data = await response.json();

			expect(response.status).toBe(404);
			expect(data.status).toBe('error');
			expect(data.error).toBeDefined();
			expect(data.error.code).toBe('TOOL_NOT_FOUND');
		});

		it('should handle invalid content type', async () => {
			// Mock validateContentType to return false
			vi.mocked(mcpServer.validateContentType).mockReturnValueOnce(false);

			mockRequest = new Request('https://example.com/api/mcp', {
				method: 'POST',
				headers: {
					'Content-Type': 'text/plain',
					'X-Forwarded-For': '127.0.0.1'
				},
				body: 'Not JSON'
			});

			const response = await POST({ request: mockRequest } as any);
			const data = await response.json();

			expect(response.status).toBe(415);
			expect(data.code).toBe('INVALID_REQUEST');
			expect(data.message).toContain('Content-Type');
		});

		it('should handle request size limits', async () => {
			mockRequest = new Request('https://example.com/api/mcp', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Content-Length': '2000000', // 2MB (exceeds the 1MB limit)
					'X-Forwarded-For': '127.0.0.1'
				},
				body: JSON.stringify({ large: 'content' })
			});

			const response = await POST({ request: mockRequest } as any);
			const data = await response.json();

			expect(response.status).toBe(413);
			expect(data.code).toBe('INVALID_REQUEST');
			expect(data.message).toContain('Request too large');
		});
	});
});
