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
			log: vi.fn(),
			getConfig: vi.fn(() => ({
				rateLimit: {
					enabled: true,
					maxRequests: 100,
					timeWindow: 60000
				}
			}))
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

// Mock performance.now
const originalPerformanceNow = performance.now;
let performanceCounter = 0;
performance.now = vi.fn(() => {
	// Return increasing values to simulate elapsed time
	return (performanceCounter += 10);
});

// Mock process.memoryUsage if available
if (typeof process !== 'undefined' && process.memoryUsage) {
	const originalMemoryUsage = process.memoryUsage;
	process.memoryUsage = vi.fn(() => ({
		rss: 100 * 1024 * 1024, // 100 MB
		heapTotal: 50 * 1024 * 1024, // 50 MB
		heapUsed: 30 * 1024 * 1024, // 30 MB
		external: 10 * 1024 * 1024 // 10 MB
	}));
}

describe('Health Check API Endpoint', () => {
	let mockRequest: Request;
	let mockDetailedRequest: Request;

	beforeEach(() => {
		// Reset mocks
		vi.clearAllMocks();
		performanceCounter = 0;

		// Create mock request
		mockRequest = new Request('https://example.com/api/health', {
			method: 'GET',
			headers: {
				'user-agent': 'test-agent',
				'x-forwarded-for': '127.0.0.1'
			}
		});

		// Create mock request with detailed parameter
		mockDetailedRequest = new Request('https://example.com/api/health?detailed=true', {
			method: 'GET',
			headers: {
				'user-agent': 'test-agent',
				'x-forwarded-for': '127.0.0.1'
			}
		});
	});

	afterAll(() => {
		// Restore original functions
		process.uptime = originalUptime;
		performance.now = originalPerformanceNow;

		if (typeof process !== 'undefined' && process.memoryUsage) {
			process.memoryUsage = originalMemoryUsage;
		}
	});

	it('should return healthy status with server and documentation info', async () => {
		const response = await GET({ request: mockRequest, url: new URL(mockRequest.url) } as any);
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

		// Performance metrics should not be included in basic response
		expect(data.performance).toBeUndefined();

		// Check that logging was called
		expect(mcpServer.log).toHaveBeenCalledWith(expect.anything(), 'Health check request', {
			clientIp: '127.0.0.1',
			userAgent: 'test-agent',
			detailed: false
		});
	});

	it('should include performance metrics when detailed=true', async () => {
		const response = await GET({
			request: mockDetailedRequest,
			url: new URL(mockDetailedRequest.url)
		} as any);
		const data = await response.json();

		// Check response status
		expect(response.status).toBe(200);

		// Check that performance metrics are included
		expect(data.performance).toBeDefined();
		expect(data.performance.requestCount).toBeGreaterThanOrEqual(1);
		expect(data.performance.averageResponseTime).toBeGreaterThan(0);
		expect(data.performance.lastRequestTimestamp).toBeDefined();

		// Check rate limit info
		expect(data.rateLimit).toBeDefined();
		expect(data.rateLimit.enabled).toBe(true);
		expect(data.rateLimit.maxRequests).toBe(100);
		expect(data.rateLimit.timeWindow).toBe(60000);

		// Check memory usage if available
		if (typeof process !== 'undefined' && process.memoryUsage) {
			expect(data.memory).toBeDefined();
			expect(data.memory.rss).toBe(100);
			expect(data.memory.heapTotal).toBe(50);
			expect(data.memory.heapUsed).toBe(30);
			expect(data.memory.external).toBe(10);
		}

		// Check that logging was called with detailed flag
		expect(mcpServer.log).toHaveBeenCalledWith(expect.anything(), 'Health check request', {
			clientIp: '127.0.0.1',
			userAgent: 'test-agent',
			detailed: true
		});
	});

	it('should handle errors and return unhealthy status', async () => {
		// Mock getStats to throw an error
		vi.mocked(documentationStore.getStats).mockImplementationOnce(() => {
			throw new Error('Test error');
		});

		const response = await GET({ request: mockRequest, url: new URL(mockRequest.url) } as any);
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

	it('should track performance metrics across multiple requests', async () => {
		// Make first request
		await GET({ request: mockDetailedRequest, url: new URL(mockDetailedRequest.url) } as any);

		// Make second request
		const response = await GET({
			request: mockDetailedRequest,
			url: new URL(mockDetailedRequest.url)
		} as any);
		const data = await response.json();

		// Check that request count has increased
		expect(data.performance.requestCount).toBeGreaterThanOrEqual(2);

		// Check that metrics are being tracked
		expect(data.performance.averageResponseTime).toBeGreaterThan(0);
		expect(data.performance.maxResponseTime).toBeGreaterThan(0);
	});
});
