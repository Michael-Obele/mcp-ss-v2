/**
 * Performance Tests for MCP Server
 *
 * These tests evaluate the performance of the MCP server under various load conditions,
 * identify potential bottlenecks, and ensure the server can handle concurrent requests efficiently.
 */

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { mcpServer } from './init';
import { documentationStore } from './documentation-store';
import { createProtocolHandler } from './protocol-handlers';
import type { Component } from './types';
import { mcpTools } from '../tools/index';
import { documentationResources, loadResource } from '../resources/index';

// Sample test data - create a large number of components for performance testing
const generateTestComponents = (count: number): Component[] => {
	const components: Component[] = [];

	for (let i = 0; i < count; i++) {
		components.push({
			name: `TestComponent${i}`,
			description: `Test component ${i} for performance testing with a longer description to simulate real-world data sizes and complexity in the component documentation system.`,
			usage: `Use TestComponent${i} for performance testing scenario ${i % 5}.`,
			props: Array(10)
				.fill(0)
				.map((_, j) => ({
					name: `prop${j}`,
					type: j % 2 === 0 ? 'string' : 'number',
					description: `Property ${j} for component ${i}`,
					default: j % 2 === 0 ? `default${j}` : j.toString(),
					required: j % 3 === 0
				})),
			examples: Array(5)
				.fill(0)
				.map((_, j) => ({
					title: `Example ${j} for TestComponent${i}`,
					description: `Example description ${j} for component ${i}`,
					code: `<TestComponent${i} prop${j}="${j}">Example ${j}</TestComponent${i}>`,
					type: j % 3 === 0 ? 'basic' : j % 3 === 1 ? 'advanced' : 'theming'
				})),
			relatedComponents: [`TestComponent${(i + 1) % count}`, `TestComponent${(i + 2) % count}`],
			cssVariables: Array(5)
				.fill(0)
				.map((_, j) => ({
					name: `--test-component${i}-var${j}`,
					description: `CSS variable ${j} for component ${i}`,
					default: `var(--color-${j})`
				})),
			troubleshooting: Array(3)
				.fill(0)
				.map((_, j) => ({
					issue: `Issue ${j} with TestComponent${i}`,
					solution: `Solution ${j} for component ${i} issue`
				}))
		});
	}

	return components;
};

describe('MCP Server Performance Tests', () => {
	let protocolHandler: any;
	let originalComponents: any;
	let testComponents: Component[];

	// Set up test data and server
	beforeAll(() => {
		// Save original data
		originalComponents = { ...documentationStore.components };

		// Suppress console output during tests
		vi.spyOn(mcpServer, 'log').mockImplementation(() => {});

		// Generate test components (100 components for performance testing)
		testComponents = generateTestComponents(100);

		// Add test components to documentation store
		testComponents.forEach((component) => {
			documentationStore.addComponent(component);
		});

		// Set up protocol handler with tools and resources
		protocolHandler = createProtocolHandler(mcpServer);

		// Register tools
		for (const tool of mcpTools) {
			if (tool.handler) {
				protocolHandler.registerTool(tool, tool.handler);
			}
		}

		// Register resources
		for (const resource of documentationResources) {
			protocolHandler.registerResource(resource, async (params) => {
				return loadResource(resource.name, params);
			});
		}
	});

	afterAll(() => {
		// Restore original data
		documentationStore.components = originalComponents;

		vi.clearAllMocks();
	});

	describe('Response Time Tests', () => {
		it('should handle component info requests with acceptable response time', async () => {
			const componentName = testComponents[50].name;
			const request = {
				tool: 'getComponentInfo',
				params: {
					componentName
				}
			};

			const startTime = performance.now();
			const response = await protocolHandler.handleToolRequest(request);
			const endTime = performance.now();
			const responseTime = endTime - startTime;

			expect(response.status).toBe('success');
			expect(responseTime).toBeLessThan(100); // Response time should be less than 100ms

			console.log(`Component info request response time: ${responseTime.toFixed(2)}ms`);
		});

		it('should handle component search with acceptable response time', async () => {
			const request = {
				tool: 'searchComponents',
				params: {
					query: 'Test'
				}
			};

			const startTime = performance.now();
			const response = await protocolHandler.handleToolRequest(request);
			const endTime = performance.now();
			const responseTime = endTime - startTime;

			expect(response.status).toBe('success');
			expect(Array.isArray(response.result)).toBe(true);
			expect(response.result.length).toBeGreaterThan(0);
			expect(responseTime).toBeLessThan(200); // Search should be under 200ms

			console.log(`Component search request response time: ${responseTime.toFixed(2)}ms`);
		});

		it('should handle complex search queries efficiently', async () => {
			// More specific search that requires deeper processing
			const request = {
				tool: 'searchComponents',
				params: {
					query: 'prop5 string'
				}
			};

			const startTime = performance.now();
			const response = await protocolHandler.handleToolRequest(request);
			const endTime = performance.now();
			const responseTime = endTime - startTime;

			expect(response.status).toBe('success');
			expect(responseTime).toBeLessThan(300); // Complex search should be under 300ms

			console.log(`Complex search request response time: ${responseTime.toFixed(2)}ms`);
		});
	});

	describe('Concurrent Request Tests', () => {
		it('should handle multiple concurrent requests efficiently', async () => {
			const requestCount = 50;
			const requests = [];

			// Create a mix of different request types
			for (let i = 0; i < requestCount; i++) {
				if (i % 3 === 0) {
					// Component info request
					requests.push({
						tool: 'getComponentInfo',
						params: {
							componentName: testComponents[i % testComponents.length].name
						}
					});
				} else if (i % 3 === 1) {
					// Search request
					requests.push({
						tool: 'searchComponents',
						params: {
							query: `prop${i % 10}`
						}
					});
				} else {
					// Example request
					requests.push({
						tool: 'getComponentExample',
						params: {
							componentName: testComponents[i % testComponents.length].name,
							exampleType: i % 2 === 0 ? 'basic' : 'advanced'
						}
					});
				}
			}

			const startTime = performance.now();

			// Execute all requests concurrently
			const responses = await Promise.all(
				requests.map((request) => protocolHandler.handleToolRequest(request))
			);

			const endTime = performance.now();
			const totalTime = endTime - startTime;
			const averageTime = totalTime / requestCount;

			// Verify all responses were successful
			const successCount = responses.filter((r) => r.status === 'success').length;

			expect(successCount).toBe(requestCount);
			expect(averageTime).toBeLessThan(50); // Average time per request in batch should be under 50ms

			console.log(`Processed ${requestCount} concurrent requests in ${totalTime.toFixed(2)}ms`);
			console.log(`Average response time: ${averageTime.toFixed(2)}ms per request`);
		});
	});

	describe('Memory Usage Tests', () => {
		it('should maintain stable memory usage during repeated operations', async () => {
			const iterationCount = 20;
			const requestsPerIteration = 10;

			// Function to get current memory usage
			const getMemoryUsage = () => {
				if (typeof process !== 'undefined' && process.memoryUsage) {
					const memUsage = process.memoryUsage();
					return {
						rss: memUsage.rss / 1024 / 1024, // RSS in MB
						heapTotal: memUsage.heapTotal / 1024 / 1024, // Heap total in MB
						heapUsed: memUsage.heapUsed / 1024 / 1024 // Heap used in MB
					};
				}
				return null;
			};

			// Initial memory snapshot
			const initialMemory = getMemoryUsage();
			if (initialMemory) {
				console.log(
					`Initial memory usage - RSS: ${initialMemory.rss.toFixed(2)}MB, Heap used: ${initialMemory.heapUsed.toFixed(2)}MB`
				);
			}

			// Run multiple iterations of requests
			for (let iteration = 0; iteration < iterationCount; iteration++) {
				const requests = [];

				// Create a batch of requests
				for (let i = 0; i < requestsPerIteration; i++) {
					const componentIndex = (iteration * requestsPerIteration + i) % testComponents.length;
					requests.push({
						tool: 'getComponentInfo',
						params: {
							componentName: testComponents[componentIndex].name
						}
					});
				}

				// Execute all requests in this iteration
				await Promise.all(requests.map((request) => protocolHandler.handleToolRequest(request)));
			}

			// Final memory snapshot
			const finalMemory = getMemoryUsage();
			if (initialMemory && finalMemory) {
				const memoryIncrease = {
					rss: finalMemory.rss - initialMemory.rss,
					heapUsed: finalMemory.heapUsed - initialMemory.heapUsed
				};

				console.log(
					`Final memory usage - RSS: ${finalMemory.rss.toFixed(2)}MB, Heap used: ${finalMemory.heapUsed.toFixed(2)}MB`
				);
				console.log(
					`Memory increase - RSS: ${memoryIncrease.rss.toFixed(2)}MB, Heap used: ${memoryIncrease.heapUsed.toFixed(2)}MB`
				);

				// Skip this test in environments where we can't measure memory
				if (typeof process !== 'undefined' && process.memoryUsage) {
					// Memory increase should be reasonable for the operations performed
					// This is a heuristic value and may need adjustment based on the actual application
					expect(memoryIncrease.heapUsed).toBeLessThan(50); // Less than 50MB increase
				}
			}
		});
	});

	describe('Rate Limiting Tests', () => {
		it('should enforce rate limits effectively', async () => {
			// Configure rate limit for testing
			const originalConfig = mcpServer.getConfig();

			mcpServer.updateConfig({
				rateLimit: {
					enabled: true,
					maxRequests: 5,
					timeWindow: 1000 // 1 second
				}
			});

			const clientId = 'test-client-for-rate-limit';

			// First 5 requests should be allowed
			for (let i = 0; i < 5; i++) {
				const isLimited = mcpServer.checkRateLimit(clientId);
				expect(isLimited).toBe(false);
			}

			// 6th request should be rate limited
			const isLimited = mcpServer.checkRateLimit(clientId);
			expect(isLimited).toBe(true);

			// Wait for rate limit window to expire
			await new Promise((resolve) => setTimeout(resolve, 1100));

			// Should be allowed again after window expires
			const isLimitedAfterWait = mcpServer.checkRateLimit(clientId);
			expect(isLimitedAfterWait).toBe(false);

			// Restore original config
			mcpServer.updateConfig(originalConfig);
		});
	});

	describe('Load Testing', () => {
		it('should handle high load of sequential requests', async () => {
			const requestCount = 100;
			const results = [];

			const startTime = performance.now();

			// Send requests sequentially
			for (let i = 0; i < requestCount; i++) {
				const componentIndex = i % testComponents.length;
				const request = {
					tool: 'getComponentInfo',
					params: {
						componentName: testComponents[componentIndex].name
					}
				};

				const response = await protocolHandler.handleToolRequest(request);
				results.push(response);
			}

			const endTime = performance.now();
			const totalTime = endTime - startTime;
			const averageTime = totalTime / requestCount;

			const successCount = results.filter((r) => r.status === 'success').length;

			expect(successCount).toBe(requestCount);
			expect(averageTime).toBeLessThan(20); // Average time should be under 20ms per request

			console.log(`Processed ${requestCount} sequential requests in ${totalTime.toFixed(2)}ms`);
			console.log(`Average response time: ${averageTime.toFixed(2)}ms per request`);
		});

		it('should handle burst traffic efficiently', async () => {
			// Simulate burst traffic with a large number of concurrent requests
			const burstSize = 50;
			const requests = [];

			for (let i = 0; i < burstSize; i++) {
				const componentIndex = i % testComponents.length;
				requests.push({
					tool: i % 2 === 0 ? 'getComponentInfo' : 'getComponentExample',
					params: {
						componentName: testComponents[componentIndex].name,
						...(i % 2 === 1 ? { exampleType: 'basic' } : {})
					}
				});
			}

			const startTime = performance.now();

			// Execute all requests concurrently
			const responses = await Promise.all(
				requests.map((request) => protocolHandler.handleToolRequest(request))
			);

			const endTime = performance.now();
			const totalTime = endTime - startTime;

			const successCount = responses.filter((r) => r.status === 'success').length;

			expect(successCount).toBe(burstSize);

			console.log(
				`Processed burst of ${burstSize} concurrent requests in ${totalTime.toFixed(2)}ms`
			);
			console.log(`Average time per request in burst: ${(totalTime / burstSize).toFixed(2)}ms`);
		});
	});

	describe('Bottleneck Identification', () => {
		it('should identify search performance bottlenecks', async () => {
			// Test increasingly complex search queries
			const queries = [
				'Test', // Simple query
				'Component prop', // Two-word query
				'Component prop5 string', // Three-word specific query
				'Component prop5 string example basic' // Complex multi-term query
			];

			for (const query of queries) {
				const request = {
					tool: 'searchComponents',
					params: { query }
				};

				const startTime = performance.now();
				const response = await protocolHandler.handleToolRequest(request);
				const endTime = performance.now();
				const responseTime = endTime - startTime;

				expect(response.status).toBe('success');

				console.log(`Search query "${query}" response time: ${responseTime.toFixed(2)}ms`);
			}
		});

		it('should measure component retrieval performance by component complexity', async () => {
			// Test components with varying complexity (based on number of props and examples)
			const componentIndices = [0, 25, 50, 75, 99]; // Sample different components

			for (const index of componentIndices) {
				const component = testComponents[index];
				const propCount = component.props.length;
				const exampleCount = component.examples.length;

				const request = {
					tool: 'getComponentInfo',
					params: {
						componentName: component.name
					}
				};

				const startTime = performance.now();
				const response = await protocolHandler.handleToolRequest(request);
				const endTime = performance.now();
				const responseTime = endTime - startTime;

				expect(response.status).toBe('success');

				console.log(
					`Component "${component.name}" (${propCount} props, ${exampleCount} examples) response time: ${responseTime.toFixed(2)}ms`
				);
			}
		});
	});
});
