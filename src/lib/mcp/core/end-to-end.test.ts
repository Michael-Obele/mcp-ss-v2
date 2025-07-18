/**
 * End-to-End Tests for MCP Server Protocol Handler
 *
 * These tests verify the end-to-end flow through the protocol handler,
 * ensuring that the core MCP functionality works correctly.
 */

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { mcpServer } from './init';
import { documentationStore } from './documentation-store';
import type { Component } from './types';
import { createProtocolHandler } from './protocol-handlers';

// Sample test data
const testComponent: Component = {
	name: 'EndToEndTest',
	description: 'A test component for end-to-end testing.',
	usage: 'Use the EndToEndTest component to test the complete MCP flow.',
	props: [
		{
			name: 'testProp',
			type: 'string',
			description: 'A test property',
			default: 'default',
			required: false
		}
	],
	examples: [
		{
			title: 'Basic Example',
			description: 'A simple example',
			code: '<EndToEndTest>Test</EndToEndTest>',
			type: 'basic'
		}
	],
	relatedComponents: [],
	cssVariables: [
		{
			name: '--test-color',
			description: 'Test color',
			default: 'blue'
		}
	],
	troubleshooting: [
		{
			issue: 'Test issue',
			solution: 'Test solution'
		}
	]
};

describe('MCP Protocol Handler Tests', () => {
	let originalComponents: any;
	let protocolHandler: any;

	// Set up test data
	beforeAll(() => {
		// Save original data
		originalComponents = { ...documentationStore.components };

		// Suppress console output during tests
		vi.spyOn(mcpServer, 'log').mockImplementation(() => {});

		// Add test component to documentation store
		documentationStore.addComponent(testComponent);

		// Create protocol handler
		protocolHandler = createProtocolHandler(mcpServer);
	});

	afterAll(() => {
		// Restore original data
		documentationStore.components = originalComponents;

		// Clean up
		vi.clearAllMocks();
	});

	describe('Protocol Handler Flow Tests', () => {
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
			expect(response.server.name).toBe('shadcn-svelte-mcp');
			expect(response.version).toBe('1.0');
		});

		it('should handle component info requests', async () => {
			const request = {
				tool: 'getComponentInfo',
				params: {
					componentName: 'EndToEndTest'
				}
			};

			const response = await protocolHandler.handleToolRequest(request);

			expect(response.status).toBe('success');
			expect(response.result).toBeDefined();
			expect(response.result.componentName).toBe('EndToEndTest');
			expect(response.result.content).toContain('A test component for end-to-end testing');
		});

		it('should handle component example requests', async () => {
			const request = {
				tool: 'getComponentExample',
				params: {
					componentName: 'EndToEndTest'
				}
			};

			const response = await protocolHandler.handleToolRequest(request);

			expect(response.status).toBe('success');
			expect(response.result).toBeDefined();
			expect(response.result.componentName).toBe('EndToEndTest');
			expect(response.result.examples).toHaveLength(1);
			expect(response.result.examples[0].code).toContain('<EndToEndTest>');
		});

		it('should handle search requests', async () => {
			const request = {
				tool: 'searchComponents',
				params: {
					query: 'EndToEndTest'
				}
			};

			const response = await protocolHandler.handleToolRequest(request);

			expect(response.status).toBe('success');
			expect(response.result).toBeDefined();
			expect(Array.isArray(response.result)).toBe(true);
			expect(response.result.length).toBeGreaterThan(0);
			expect(response.result[0].componentName).toBe('EndToEndTest');
		});

		it('should handle theming info requests', async () => {
			const request = {
				tool: 'getThemingInfo',
				params: {
					componentName: 'EndToEndTest'
				}
			};

			const response = await protocolHandler.handleToolRequest(request);

			expect(response.status).toBe('success');
			expect(response.result).toBeDefined();
			expect(response.result.componentName).toBe('EndToEndTest');
			expect(response.result.cssVariables).toHaveLength(1);
			expect(response.result.cssVariables[0].name).toBe('--test-color');
		});

		it('should handle troubleshooting requests', async () => {
			const request = {
				tool: 'getTroubleshooting',
				params: {
					componentName: 'EndToEndTest'
				}
			};

			const response = await protocolHandler.handleToolRequest(request);

			expect(response.status).toBe('success');
			expect(response.result).toBeDefined();
			expect(response.result.componentName).toBe('EndToEndTest');
			expect(response.result.troubleshooting).toHaveLength(1);
			expect(response.result.troubleshooting[0].issue).toBe('Test issue');
		});

		it('should handle component not found errors', async () => {
			const request = {
				tool: 'getComponentInfo',
				params: {
					componentName: 'NonExistentComponent'
				}
			};

			const response = await protocolHandler.handleToolRequest(request);

			expect(response.status).toBe('error');
			expect(response.error).toBeDefined();
			expect(response.error.details).toContain('Component "NonExistentComponent" not found');
		});

		it('should handle validation errors', async () => {
			const request = {
				tool: 'getComponentInfo',
				params: {
					// Missing componentName parameter
				}
			};

			const response = await protocolHandler.handleToolRequest(request);

			expect(response.status).toBe('error');
			expect(response.error).toBeDefined();
			expect(response.error.details).toContain('componentName parameter is required');
		});

		it('should handle unknown tool requests', async () => {
			const request = {
				tool: 'nonExistentTool',
				params: {}
			};

			const response = await protocolHandler.handleToolRequest(request);

			expect(response.status).toBe('error');
			expect(response.error).toBeDefined();
			expect(response.error.code).toBe('TOOL_NOT_FOUND');
		});
	});
});
