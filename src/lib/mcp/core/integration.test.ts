/**
 * Integration Tests for MCP Server
 *
 * These tests verify the end-to-end flow of MCP requests and responses through the core server,
 * protocol handlers, and tool implementations. They test the actual implementation rather than
 * mocking responses, ensuring that all components work together correctly.
 */

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { initServer, MCPServer, MCPErrorCode } from './server';
import { createProtocolHandler } from './protocol-handlers';
import { documentationStore } from './documentation-store';
import { mcpTools } from '../tools/index';
import { documentationResources, loadResource } from '../resources/index';
import type { Component, ComponentCategory, InstallationGuide } from './types';

// Sample test data
const testButton: Component = {
	name: 'TestButton',
	description: 'A test button component for integration testing.',
	usage: 'Use the TestButton component to test MCP integration.',
	props: [
		{
			name: 'variant',
			type: 'string',
			description: 'The visual style of the button',
			default: 'default',
			required: false,
			validValues: ['default', 'destructive', 'outline']
		},
		{
			name: 'size',
			type: 'string',
			description: 'The size of the button',
			default: 'default',
			required: false,
			validValues: ['default', 'sm', 'lg']
		}
	],
	examples: [
		{
			title: 'Basic TestButton',
			description: 'A simple test button with default styling',
			code: '<TestButton>Click me</TestButton>',
			type: 'basic'
		},
		{
			title: 'TestButton Variants',
			description: 'Different test button variants',
			code: '<div><TestButton variant="default">Default</TestButton><TestButton variant="destructive">Destructive</TestButton></div>',
			type: 'variants'
		},
		{
			title: 'TestButton Theming',
			description: 'Custom themed test button',
			code: '<TestButton class="custom-theme">Themed Button</TestButton>',
			type: 'theming'
		}
	],
	relatedComponents: ['TestButtonGroup'],
	cssVariables: [
		{
			name: '--test-button-background',
			description: 'Button background color',
			default: 'hsl(var(--primary))'
		},
		{
			name: '--test-button-foreground',
			description: 'Button text color',
			default: 'hsl(var(--primary-foreground))'
		}
	],
	troubleshooting: [
		{
			issue: 'TestButton not rendering',
			solution: 'Ensure the component is properly imported.'
		},
		{
			issue: 'TestButton styles not applying',
			solution: 'Check if the CSS variables are properly defined in your theme.'
		}
	],
	category: 'Test',
	version: '1.0.0',
	installCommand: 'npm install test-button',
	importStatement: "import { TestButton } from 'test-button';"
};

const testCard: Component = {
	name: 'TestCard',
	description: 'A test card component for integration testing.',
	usage: 'Use the TestCard component to test MCP integration.',
	props: [
		{
			name: 'variant',
			type: 'string',
			description: 'The visual style of the card',
			default: 'default',
			required: false,
			validValues: ['default', 'bordered']
		}
	],
	examples: [
		{
			title: 'Basic TestCard',
			description: 'A simple test card with default styling',
			code: '<TestCard>Card content</TestCard>',
			type: 'basic'
		}
	],
	relatedComponents: ['TestButton'],
	cssVariables: [
		{
			name: '--test-card-background',
			description: 'Card background color',
			default: 'hsl(var(--background))'
		}
	],
	troubleshooting: [
		{
			issue: 'TestCard not rendering',
			solution: 'Ensure the component is properly imported.'
		}
	],
	category: 'Test'
};

const testCategory: ComponentCategory = {
	name: 'Test',
	description: 'Test components for integration testing',
	components: ['TestButton', 'TestCard']
};

const testInstallationGuide: InstallationGuide = {
	framework: 'test-framework',
	steps: [
		{
			order: 1,
			description: 'Install test components',
			command: 'npm install test-components'
		},
		{
			order: 2,
			description: 'Configure test components',
			code: "import { testConfig } from 'test-components';\n\ntestConfig();"
		}
	],
	requirements: ['Node.js 16+'],
	troubleshooting: [
		{
			issue: 'Installation fails',
			solution: 'Check your Node.js version and ensure it meets the requirements.'
		}
	]
};

describe('MCP Server Integration Tests', () => {
	let server: MCPServer;
	let protocolHandler: any;
	let originalComponents: any;
	let originalCategories: any;
	let originalInstallationGuides: any;

	// Set up a test server and populate it with test data
	beforeAll(() => {
		// Save original data
		originalComponents = { ...documentationStore.components };
		originalCategories = { ...documentationStore.categories };
		originalInstallationGuides = { ...documentationStore.installationGuides };

		// Initialize server
		server = initServer({
			name: 'test-mcp-server',
			version: '0.1.0',
			description: 'Test MCP server for integration testing',
			capabilities: ['component-info', 'component-examples', 'theming', 'troubleshooting']
		});

		// Suppress console output during tests
		vi.spyOn(server, 'log').mockImplementation(() => {});

		// Clear documentation store
		documentationStore.clear();

		// Add test components
		documentationStore.addComponent(testButton);
		documentationStore.addComponent(testCard);

		// Add test category
		documentationStore.addCategory(testCategory);

		// Add test installation guide
		documentationStore.addInstallationGuide(testInstallationGuide);

		// Set up protocol handler with tools and resources
		protocolHandler = createProtocolHandler(server);

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
		documentationStore.categories = originalCategories;
		documentationStore.installationGuides = originalInstallationGuides;

		vi.clearAllMocks();
	});

	describe('Protocol Handler Tests', () => {
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
			expect(response.version).toBe('1.0');
		});

		it('should handle discovery requests for tools', async () => {
			const request = {
				type: 'tools'
			};

			const response = await protocolHandler.handleDiscovery(request);

			expect(response.status).toBe('success');
			expect(response.tools).toBeDefined();
			expect(Array.isArray(response.tools)).toBe(true);
			expect(response.tools.length).toBeGreaterThan(0);
			expect(response.tools.some((tool) => tool.name === 'getComponentInfo')).toBe(true);
		});

		it('should handle discovery requests for resources', async () => {
			const request = {
				type: 'resources'
			};

			const response = await protocolHandler.handleDiscovery(request);

			expect(response.status).toBe('success');
			expect(response.resources).toBeDefined();
			expect(Array.isArray(response.resources)).toBe(true);
		});

		it('should handle discovery requests for all capabilities', async () => {
			const request = {
				type: 'all'
			};

			const response = await protocolHandler.handleDiscovery(request);

			expect(response.status).toBe('success');
			expect(response.tools).toBeDefined();
			expect(response.resources).toBeDefined();
			expect(Array.isArray(response.tools)).toBe(true);
			expect(Array.isArray(response.resources)).toBe(true);
		});
	});

	describe('Tool Request Tests', () => {
		it('should handle getComponentInfo tool requests', async () => {
			const request = {
				tool: 'getComponentInfo',
				params: {
					componentName: 'TestButton'
				}
			};

			const response = await protocolHandler.handleToolRequest(request);

			expect(response.status).toBe('success');
			expect(response.result).toBeDefined();
			expect(response.result.componentName).toBe('TestButton');
			expect(response.result.topic).toBe('info');
			expect(response.result.props).toHaveLength(2);
			expect(response.result.examples).toHaveLength(3);
		});

		it('should handle getComponentExample tool requests', async () => {
			const request = {
				tool: 'getComponentExample',
				params: {
					componentName: 'TestButton',
					exampleType: 'basic'
				}
			};

			const response = await protocolHandler.handleToolRequest(request);

			expect(response.status).toBe('success');
			expect(response.result).toBeDefined();
			expect(response.result.componentName).toBe('TestButton');
			expect(response.result.topic).toBe('examples');
			expect(response.result.examples).toHaveLength(1);
			expect(response.result.examples[0].type).toBe('basic');
		});

		it('should handle searchComponents tool requests', async () => {
			const request = {
				tool: 'searchComponents',
				params: {
					query: 'button'
				}
			};

			const response = await protocolHandler.handleToolRequest(request);

			expect(response.status).toBe('success');
			expect(response.result).toBeDefined();
			expect(Array.isArray(response.result)).toBe(true);
			expect(response.result.length).toBeGreaterThan(0);
			expect(response.result[0].componentName).toBe('TestButton');
		});

		it('should handle getThemingInfo tool requests', async () => {
			const request = {
				tool: 'getThemingInfo',
				params: {
					componentName: 'TestButton'
				}
			};

			const response = await protocolHandler.handleToolRequest(request);

			expect(response.status).toBe('success');
			expect(response.result).toBeDefined();
			expect(response.result.componentName).toBe('TestButton');
			expect(response.result.topic).toBe('theming');
			expect(response.result.cssVariables).toHaveLength(2);
		});

		it('should handle getTroubleshooting tool requests', async () => {
			const request = {
				tool: 'getTroubleshooting',
				params: {
					componentName: 'TestButton'
				}
			};

			const response = await protocolHandler.handleToolRequest(request);

			expect(response.status).toBe('success');
			expect(response.result).toBeDefined();
			expect(response.result.componentName).toBe('TestButton');
			expect(response.result.topic).toBe('troubleshooting');
			expect(response.result.troubleshooting).toHaveLength(2);
		});

		it('should handle getTroubleshooting tool requests with specific issue', async () => {
			const request = {
				tool: 'getTroubleshooting',
				params: {
					componentName: 'TestButton',
					issue: 'styles'
				}
			};

			const response = await protocolHandler.handleToolRequest(request);

			expect(response.status).toBe('success');
			expect(response.result).toBeDefined();
			expect(response.result.componentName).toBe('TestButton');
			expect(response.result.topic).toBe('troubleshooting');
			expect(response.result.troubleshooting).toHaveLength(1);
			expect(response.result.troubleshooting[0].issue).toBe('TestButton styles not applying');
		});
	});

	describe('Error Handling Tests', () => {
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
			expect(response.error.code).toBe(MCPErrorCode.INTERNAL_ERROR);
			expect(response.error.details).toContain('Component "NonExistentComponent" not found');
		});

		it('should handle missing required parameters', async () => {
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

		it('should handle invalid parameter types', async () => {
			const request = {
				tool: 'getComponentInfo',
				params: {
					componentName: 123 // Should be a string
				}
			};

			const response = await protocolHandler.handleToolRequest(request);

			expect(response.status).toBe('error');
			expect(response.error).toBeDefined();
			expect(response.error.details).toContain('componentName must be a string');
		});

		it('should handle unknown tool requests', async () => {
			const request = {
				tool: 'nonExistentTool',
				params: {}
			};

			const response = await protocolHandler.handleToolRequest(request);

			expect(response.status).toBe('error');
			expect(response.error).toBeDefined();
			expect(response.error.code).toBe(MCPErrorCode.TOOL_NOT_FOUND);
		});
	});

	describe('Complex Query Scenarios', () => {
		it('should handle component search with partial matches', async () => {
			const request = {
				tool: 'searchComponents',
				params: {
					query: 'test'
				}
			};

			const response = await protocolHandler.handleToolRequest(request);

			expect(response.status).toBe('success');
			expect(response.result).toBeDefined();
			expect(Array.isArray(response.result)).toBe(true);
			expect(response.result.length).toBe(2); // Should find both TestButton and TestCard
		});

		it('should handle component examples with specific type filtering', async () => {
			const request = {
				tool: 'getComponentExample',
				params: {
					componentName: 'TestButton',
					exampleType: 'theming'
				}
			};

			const response = await protocolHandler.handleToolRequest(request);

			expect(response.status).toBe('success');
			expect(response.result).toBeDefined();
			expect(response.result.examples).toHaveLength(1);
			expect(response.result.examples[0].type).toBe('theming');
			expect(response.result.examples[0].code).toContain('custom-theme');
		});

		it('should handle general theming information when no component is specified', async () => {
			const request = {
				tool: 'getThemingInfo',
				params: {}
			};

			const response = await protocolHandler.handleToolRequest(request);

			expect(response.status).toBe('success');
			expect(response.result).toBeDefined();
			expect(response.result.topic).toBe('theming');
			expect(response.result.content).toContain('General Theming Guidance');
		});
	});
});
