/**
 * Tests for Health Check API Endpoint
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './+server';
import { mcpServer } from '$lib/mcp/core/init';
import { documentationStore } from '$lib/mcp/core/documentation-store';
import { config } from '$lib/mcp/core/config';

// Mock dependencies
vi.mock('$lib/mcp/core/init', () => {
	return {
		mcpServer: {
			getServerInfo: vi.fn(() => ({
				name: 'shadcn-svelte-mcp',
				version: '0.1.0',
				description: 'MCP server for shadcn-svelte component documentation',
				capabilities: ['components', 'theming', 'examples']
			})),
			log: vi.fn()
		}
	};
});

vi.mock('$lib/mcp/core/documentation-store', () => {
	return {
		documentationStore: {
			getStats: vi.fn(() => ({
				totalComponents: 10,
				totalCategories: 5,
				totalInstallationGuides: 3,
				componentsWithExamples: 8,
				componentsWithTroubleshooting: 6
			}))
		}
	};
});

vi.mock('$lib/mcp/core/config', () => {
	return {
		config: {
			deployment: {
				environment: 'test'
			}
		}
	};
});

// Mock process.uptime
const originalUptime = process.uptime;
process.uptime = vi.fn(() => 3600); // 1 hour uptime

describe('Health Check API Endpoint', () => {
	let mockRequest: Request;

	beforeEach(() => {
		// Reset mocks
		vi.clearAllMocks();

		// Create mock request
		mockRequest = new Request('https://example.com/api/health', {
			method: 'GET',
			headers: {
				'user-agent': 'test-agent',
				'x-forwarded-for': '127.0.0.1'
			}
		});
	});

	afterAll(() => {
		// Restore original process.uptime
		process.uptime = originalUptime;
	});

	it('should return healthy status with server and documentation info', async () => {
		const response = await GET({ request: mockRequest } as any);
		const data = await response.json();

		// Check response status
		expect(response.status).toBe(200);

		// Check response data
		expect(data.status).toBe('healthy');
		expect(data.timestamp).toBeDefined();

		// Check server info
		expect(data.server.name).toBe('shadcn-svelte-mcp');
		expect(data.server.version).toBe('0.1.0');
		expect(data.server.uptime).toBe(3600);
		expect(data.server.environment).toBe('test');

		// Check documentation info
		expect(data.documentation.components).toBe(10);
		expect(data.documentation.categories).toBe(5);
		expect(data.documentation.installationGuides).toBe(3);

		// Check that logging was called
		expect(mcpServer.log).toHaveBeenCalledWith(expect.anything(), 'Health check request', {
			clientIp: '127.0.0.1',
			userAgent: 'test-agent'
		});
	});

	it('should handle errors and return unhealthy status', async () => {
		// Mock getStats to throw an error
		vi.mocked(documentationStore.getStats).mockImplementationOnce(() => {
			throw new Error('Test error');
		});

		const response = await GET({ request: mockRequest } as any);
		const data = await response.json();

		// Check response status
		expect(response.status).toBe(500);

		// Check response data
		expect(data.status).toBe('unhealthy');
		expect(data.timestamp).toBeDefined();
		expect(data.error).toBe('Error: Test error');

		// Check that error was logged
		expect(mcpServer.log).toHaveBeenCalledWith(
			expect.anything(),
			'Error processing health check request',
			expect.any(Error)
		);
	});
});
