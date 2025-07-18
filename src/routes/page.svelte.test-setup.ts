import { vi } from 'vitest';
import type { Component, ComponentCategory, InstallationGuide } from '$lib/mcp/core/types';

// Mock MCP Server
export const mockMcpServer = {
	getServerInfo: vi.fn().mockReturnValue({
		name: 'shadcn-svelte MCP Server',
		description: 'MCP server for shadcn-svelte component documentation',
		version: '1.0.0',
		capabilities: ['component-info', 'examples', 'search']
	})
};

// Mock components for testing
const mockComponents: Component[] = [
	{
		name: 'Button',
		description: 'A button component',
		usage: 'Use for interactive elements',
		props: [],
		examples: [],
		relatedComponents: [],
		cssVariables: [],
		troubleshooting: [],
		category: 'ui'
	},
	{
		name: 'Card',
		description: 'A card component',
		usage: 'Use for displaying content in a card format',
		props: [],
		examples: [],
		relatedComponents: [],
		cssVariables: [],
		troubleshooting: [],
		category: 'ui'
	},
	{
		name: 'Input',
		description: 'An input component',
		usage: 'Use for collecting user input',
		props: [],
		examples: [],
		relatedComponents: [],
		cssVariables: [],
		troubleshooting: [],
		category: 'form'
	},
	{
		name: 'Checkbox',
		description: 'A checkbox component',
		usage: 'Use for boolean input options',
		props: [],
		examples: [],
		relatedComponents: [],
		cssVariables: [],
		troubleshooting: [],
		category: 'form'
	},
	{
		name: 'Container',
		description: 'A container component',
		usage: 'Use for layout containment',
		props: [],
		examples: [],
		relatedComponents: [],
		cssVariables: [],
		troubleshooting: [],
		category: 'layout'
	}
];

// Mock categories for testing
const mockCategories: ComponentCategory[] = [
	{ name: 'ui', description: 'UI components', components: ['Button', 'Card'] },
	{ name: 'form', description: 'Form components', components: ['Input', 'Checkbox'] },
	{ name: 'layout', description: 'Layout components', components: ['Container', 'Grid'] }
];

// Mock installation guides for testing
const mockInstallationGuides: InstallationGuide[] = [
	{
		framework: 'sveltekit',
		requirements: ['Node.js 18+'],
		steps: [
			{
				order: 1,
				description: 'Create a new SvelteKit project',
				command: 'npm create svelte@latest my-app'
			},
			{ order: 2, description: 'Install dependencies', command: 'npm install' }
		],
		troubleshooting: []
	},
	{
		framework: 'vite',
		requirements: ['Node.js 18+'],
		steps: [
			{
				order: 1,
				description: 'Create a new Vite project',
				command: 'npm create vite@latest my-app -- --template svelte-ts'
			},
			{ order: 2, description: 'Install dependencies', command: 'npm install' }
		],
		troubleshooting: []
	}
];

// Mock Documentation Store
export const mockDocumentationStore = {
	getStats: vi.fn().mockReturnValue({
		totalComponents: mockComponents.length,
		totalCategories: mockCategories.length,
		totalInstallationGuides: mockInstallationGuides.length,
		componentsWithExamples: 8,
		componentsWithTroubleshooting: 5
	}),
	getAllComponents: vi.fn().mockReturnValue(mockComponents),
	getAllCategories: vi.fn().mockReturnValue(mockCategories),
	getAllInstallationGuides: vi.fn().mockReturnValue(mockInstallationGuides),
	getComponentsByCategory: vi.fn().mockImplementation((category: string) => {
		const categoryMap: Record<string, Component[]> = {
			ui: mockComponents.filter((c) => c.category === 'ui'),
			form: mockComponents.filter((c) => c.category === 'form'),
			layout: mockComponents.filter((c) => c.category === 'layout')
		};
		return categoryMap[category] || [];
	}),
	getInstallationGuide: vi.fn().mockImplementation((framework: string) => {
		const guide = mockInstallationGuides.find((g) => g.framework === framework);
		return guide || null;
	})
};

// Mock MCP Tools
export const mockMcpTools = [
	{ name: 'getComponentInfo', description: 'Get information about a component' },
	{ name: 'getComponentExample', description: 'Get examples for a component' },
	{ name: 'searchComponents', description: 'Search for components' },
	{ name: 'getThemingInfo', description: 'Get theming information for components' },
	{ name: 'getTroubleshooting', description: 'Get troubleshooting information for components' }
];
