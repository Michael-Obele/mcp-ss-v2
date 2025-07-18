/**
 * Tests for MCP tool handlers
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	getComponentInfo,
	getComponentExample,
	searchComponents,
	getThemingInfo,
	getTroubleshooting
} from './handlers';
import { documentationStore } from '../core/documentation-store';
import { MCPErrorCode } from '../core/server';
import type { Component } from '../core/types';

// Mock the documentation store
vi.mock('../core/documentation-store', () => {
	const mockButton: Component = {
		name: 'Button',
		description: 'A versatile button component with multiple variants and sizes.',
		usage: 'Use buttons to trigger actions, submit forms, or navigate between pages.',
		props: [
			{
				name: 'variant',
				type: 'string',
				description: 'The visual style variant of the button',
				default: 'default',
				required: false,
				validValues: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link']
			}
		],
		examples: [
			{
				title: 'Basic Button',
				description: 'A simple button with default styling',
				code: '<Button>Click me</Button>',
				type: 'basic'
			},
			{
				title: 'Button Variants',
				description: 'Different visual styles for buttons',
				code: '<Button variant="destructive">Delete</Button>',
				type: 'advanced'
			},
			{
				title: 'Themed Button',
				description: 'Button with custom theming',
				code: '<Button class="custom-theme">Themed</Button>',
				type: 'theming'
			},
			{
				title: 'SvelteKit Button',
				description: 'Button with SvelteKit integration',
				code: '<Button on:click={() => goto("/home")}>Home</Button>',
				type: 'advanced',
				framework: 'sveltekit',
				dependencies: ['@sveltejs/kit']
			}
		],
		relatedComponents: ['Input', 'Form'],
		cssVariables: [
			{
				name: '--primary',
				description: 'Primary button background color',
				default: 'hsl(222.2 84% 4.9%)',
				scope: 'component'
			},
			{
				name: '--primary-foreground',
				description: 'Primary button text color',
				default: 'hsl(210 40% 98%)',
				scope: 'component',
				affectedComponents: ['Badge']
			}
		],
		troubleshooting: [
			{
				issue: 'Button not responding to clicks',
				solution: 'Check if the button is disabled or if event handlers are properly attached'
			}
		],
		category: 'form',
		version: '1.0.0',
		installCommand: 'npx shadcn-svelte@latest add button',
		importStatement: "import { Button } from '$lib/components/ui/button';",
		accessibility: {
			ariaAttributes: [],
			keyboardInteractions: [],
			bestPractices: [],
			wcagCompliance: []
		}
	};

	const mockInput: Component = {
		name: 'Input',
		description: 'A form input component with validation and styling support.',
		usage: 'Use inputs to collect user data in forms and interactive interfaces.',
		props: [
			{
				name: 'type',
				type: 'string',
				description: 'The input type',
				default: 'text',
				required: false
			}
		],
		examples: [
			{
				title: 'Basic Input',
				description: 'A simple text input',
				code: '<Input placeholder="Enter your name" />',
				type: 'basic'
			}
		],
		relatedComponents: ['Button', 'Form'],
		cssVariables: [],
		troubleshooting: [],
		category: 'form'
	};

	const mockCard: Component = {
		name: 'Card',
		description: 'A card component for displaying content in a contained manner.',
		usage: 'Use cards to group related information and actions.',
		props: [],
		examples: [],
		relatedComponents: [],
		cssVariables: [
			{
				name: '--card-background',
				description: 'Card background color',
				default: 'hsl(0 0% 100%)',
				scope: 'component'
			}
		],
		troubleshooting: [],
		category: 'layout'
	};

	const mockEmptyComponent: Component = {
		name: 'EmptyComponent',
		description: 'A component with no examples',
		usage: 'This component is for testing purposes only.',
		props: [],
		examples: [],
		relatedComponents: [],
		cssVariables: [],
		troubleshooting: []
	};

	const allComponents = [mockButton, mockInput, mockCard, mockEmptyComponent];

	return {
		documentationStore: {
			getComponent: vi.fn((name) => {
				if (name.toLowerCase() === 'button') {
					return mockButton;
				}
				if (name.toLowerCase() === 'input') {
					return mockInput;
				}
				if (name.toLowerCase() === 'card') {
					return mockCard;
				}
				if (name.toLowerCase() === 'emptycomponent') {
					return mockEmptyComponent;
				}
				return undefined;
			}),
			searchComponents: vi.fn((query) => {
				if (query.toLowerCase().includes('butt')) {
					return [mockButton];
				}
				if (query.toLowerCase().includes('form')) {
					return [mockButton, mockInput];
				}
				if (query.toLowerCase() === 'input') {
					return [mockInput];
				}
				if (query.toLowerCase() === 'card') {
					return [mockCard];
				}
				return [];
			}),
			getAllComponents: vi.fn(() => {
				return allComponents;
			})
		}
	};
});

describe('getComponentInfo', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should return component information when valid component name is provided', async () => {
		const result = await getComponentInfo({ componentName: 'Button' });

		expect(documentationStore.getComponent).toHaveBeenCalledWith('Button');
		expect(result.componentName).toBe('Button');
		expect(result.topic).toBe('info');
		expect(result.content).toContain('A versatile button component');
		expect(result.content).toContain('Usage:');
		expect(result.content).toContain('Installation:');
		expect(result.content).toContain('Import:');
		expect(result.content).toContain('Version:');
		expect(result.content).toContain('Category:');
		expect(result.props).toHaveLength(1);
		expect(result.examples).toHaveLength(4);
		expect(result.relatedComponents).toEqual(['Input', 'Form']);
	});

	it('should throw an error when componentName parameter is missing', async () => {
		await expect(getComponentInfo({})).rejects.toThrow(
			MCPErrorCode.INVALID_REQUEST + ': componentName parameter is required'
		);
	});

	it('should throw an error when componentName is not a string', async () => {
		await expect(getComponentInfo({ componentName: 123 })).rejects.toThrow(
			MCPErrorCode.INVALID_REQUEST + ': componentName must be a string'
		);
	});

	it('should throw an error when componentName is empty', async () => {
		await expect(getComponentInfo({ componentName: '' })).rejects.toThrow(
			MCPErrorCode.INVALID_REQUEST + ': componentName cannot be empty'
		);
	});

	it('should throw an error with suggestions when component is not found', async () => {
		await expect(getComponentInfo({ componentName: 'ButtonX' })).rejects.toThrow(
			MCPErrorCode.COMPONENT_NOT_FOUND + ': Component "ButtonX" not found. Did you mean: Button?'
		);

		expect(documentationStore.getComponent).toHaveBeenCalledWith('ButtonX');
		expect(documentationStore.searchComponents).toHaveBeenCalledWith('ButtonX');
	});

	it('should throw an error without suggestions when no similar components are found', async () => {
		await expect(getComponentInfo({ componentName: 'NonExistent' })).rejects.toThrow(
			MCPErrorCode.COMPONENT_NOT_FOUND +
				': Component "NonExistent" not found. Try searching for another component.'
		);

		expect(documentationStore.getComponent).toHaveBeenCalledWith('NonExistent');
		expect(documentationStore.searchComponents).toHaveBeenCalledWith('NonExistent');
	});
});

describe('getComponentExample', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should return all examples when only component name is provided', async () => {
		const result = await getComponentExample({ componentName: 'Button' });

		expect(documentationStore.getComponent).toHaveBeenCalledWith('Button');
		expect(result.componentName).toBe('Button');
		expect(result.topic).toBe('examples');
		expect(result.content).toBe('Examples for Button');
		expect(result.examples).toHaveLength(4);
		expect(result.additionalResources).toContain('Total examples: 4');
		expect(result.additionalResources).toContain('Example types: basic, advanced, theming');
		expect(result.additionalResources).toContain('Frameworks: sveltekit');
		expect(result.additionalResources).toContain(
			'Some examples may require additional dependencies'
		);
	});

	it('should return filtered examples when exampleType is provided', async () => {
		const result = await getComponentExample({ componentName: 'Button', exampleType: 'basic' });

		expect(documentationStore.getComponent).toHaveBeenCalledWith('Button');
		expect(result.componentName).toBe('Button');
		expect(result.topic).toBe('examples');
		expect(result.content).toBe('Examples for Button (basic)');
		expect(result.examples).toHaveLength(1);
		expect(result.examples[0].type).toBe('basic');
		expect(result.additionalResources).toContain('Total examples: 1');
		expect(result.additionalResources).toContain('Example types: basic');
	});

	it('should throw an error when componentName parameter is missing', async () => {
		await expect(getComponentExample({})).rejects.toThrow(
			MCPErrorCode.INVALID_REQUEST + ': componentName parameter is required'
		);
	});

	it('should throw an error when componentName is not a string', async () => {
		await expect(getComponentExample({ componentName: 123 })).rejects.toThrow(
			MCPErrorCode.INVALID_REQUEST + ': componentName must be a string'
		);
	});

	it('should throw an error when exampleType is not a string', async () => {
		await expect(
			getComponentExample({ componentName: 'Button', exampleType: 123 })
		).rejects.toThrow(MCPErrorCode.INVALID_REQUEST + ': exampleType must be a string');
	});

	it('should throw an error when component is not found', async () => {
		await expect(getComponentExample({ componentName: 'NonExistent' })).rejects.toThrow(
			MCPErrorCode.COMPONENT_NOT_FOUND +
				': Component "NonExistent" not found. Try searching for another component.'
		);
	});

	it('should throw an error when no examples match the exampleType', async () => {
		await expect(
			getComponentExample({ componentName: 'Button', exampleType: 'nonexistent' })
		).rejects.toThrow(
			MCPErrorCode.COMPONENT_NOT_FOUND +
				': No examples found for "Button" with type "nonexistent". Available example types: basic, advanced, theming'
		);
	});

	it('should throw an error when component has no examples', async () => {
		await expect(getComponentExample({ componentName: 'EmptyComponent' })).rejects.toThrow(
			MCPErrorCode.COMPONENT_NOT_FOUND +
				': No examples found for "EmptyComponent". No examples available for this component'
		);
	});
});

describe('searchComponents', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should return matching components when valid query is provided', async () => {
		const result = await searchComponents({ query: 'button' });

		expect(documentationStore.searchComponents).toHaveBeenCalledWith('button');
		expect(result).toHaveLength(1);
		expect(result[0].componentName).toBe('Button');
		expect(result[0].topic).toBe('search');
		expect(result[0].content).toContain('A versatile button component');
		expect(result[0].content).toContain('Category: form');
		expect(result[0].content).toContain('Examples: 4');
		expect(result[0].content).toContain('Props: 1');
		expect(result[0].relatedComponents).toEqual(['Input', 'Form']);
	});

	it('should return multiple matching components', async () => {
		const result = await searchComponents({ query: 'form' });

		expect(documentationStore.searchComponents).toHaveBeenCalledWith('form');
		expect(result).toHaveLength(2);
		expect(result[0].componentName).toBe('Button');
		expect(result[1].componentName).toBe('Input');
	});

	it('should return suggestions when no components match the query', async () => {
		const result = await searchComponents({ query: 'nonexistent' });

		expect(documentationStore.searchComponents).toHaveBeenCalledWith('nonexistent');
		expect(documentationStore.getAllComponents).toHaveBeenCalled();
		expect(result).toHaveLength(1);
		expect(result[0].componentName).toBe('search-results');
		expect(result[0].topic).toBe('search');
		expect(result[0].content).toContain('No components found matching "nonexistent"');
		expect(result[0].content).toContain('Try searching for:');
		expect(result[0].additionalResources).toBeDefined();
		expect(result[0].additionalResources[0]).toContain('Available categories:');
	});

	it('should throw an error when query parameter is missing', async () => {
		await expect(searchComponents({})).rejects.toThrow(
			MCPErrorCode.INVALID_REQUEST + ': query parameter is required'
		);
	});

	it('should throw an error when query is not a string', async () => {
		await expect(searchComponents({ query: 123 })).rejects.toThrow(
			MCPErrorCode.INVALID_REQUEST + ': query must be a string'
		);
	});

	it('should throw an error when query is empty', async () => {
		await expect(searchComponents({ query: '' })).rejects.toThrow(
			MCPErrorCode.INVALID_REQUEST + ': query cannot be empty'
		);
	});
});

describe('getThemingInfo', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should return component-specific theming information when component name is provided', async () => {
		const result = await getThemingInfo({ componentName: 'Button' });

		expect(documentationStore.getComponent).toHaveBeenCalledWith('Button');
		expect(result.componentName).toBe('Button');
		expect(result.topic).toBe('theming');
		expect(result.content).toContain('Theming information for Button');
		expect(result.content).toContain('CSS Variables');
		expect(result.content).toContain('Note: Some variables may affect other related components');
		expect(result.cssVariables).toHaveLength(2);
		expect(result.examples).toHaveLength(1);
		expect(result.examples?.[0].type).toBe('theming');
		expect(result.additionalResources).toBeDefined();
	});

	it('should return general theming information when no component name is provided', async () => {
		const result = await getThemingInfo({});

		expect(result.componentName).toBe('general');
		expect(result.topic).toBe('theming');
		expect(result.content).toContain('General Theming Guidance');
		expect(result.content).toContain('CSS Variables');
		expect(result.content).toContain('Tailwind CSS Configuration');
		expect(result.content).toContain('Dark Mode');
		expect(result.additionalResources).toBeDefined();
	});

	it('should return general theming information when empty component name is provided', async () => {
		const result = await getThemingInfo({ componentName: '' });

		expect(result.componentName).toBe('general');
		expect(result.topic).toBe('theming');
		expect(result.content).toContain('General Theming Guidance');
	});

	it('should throw an error when componentName is not a string', async () => {
		await expect(getThemingInfo({ componentName: 123 })).rejects.toThrow(
			MCPErrorCode.INVALID_REQUEST + ': componentName must be a string'
		);
	});

	it('should throw an error when component is not found', async () => {
		await expect(getThemingInfo({ componentName: 'NonExistent' })).rejects.toThrow(
			MCPErrorCode.COMPONENT_NOT_FOUND + ': Component "NonExistent" not found'
		);

		expect(documentationStore.getComponent).toHaveBeenCalledWith('NonExistent');
		expect(documentationStore.searchComponents).toHaveBeenCalledWith('NonExistent');
	});

	it('should throw an error when component has no theming information', async () => {
		await expect(getThemingInfo({ componentName: 'Input' })).rejects.toThrow(
			MCPErrorCode.COMPONENT_NOT_FOUND + ': No theming information found for "Input"'
		);

		expect(documentationStore.getComponent).toHaveBeenCalledWith('Input');
		expect(documentationStore.getAllComponents).toHaveBeenCalled();
	});

	it('should suggest components with theming information when component has no theming info', async () => {
		await expect(getThemingInfo({ componentName: 'Input' })).rejects.toThrow(
			/Try these components with theming information: Button, Card/
		);
	});
});

describe('getTroubleshooting', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should return troubleshooting information when component name is provided', async () => {
		const result = await getTroubleshooting({ componentName: 'Button' });

		expect(documentationStore.getComponent).toHaveBeenCalledWith('Button');
		expect(result.componentName).toBe('Button');
		expect(result.topic).toBe('troubleshooting');
		expect(result.content).toContain('Troubleshooting Button');
		expect(result.troubleshooting).toHaveLength(1);
		expect(result.troubleshooting[0].issue).toBe('Button not responding to clicks');
		expect(result.additionalResources).toBeDefined();
		expect(result.additionalResources).toContain('Total troubleshooting items: 1');
	});

	it('should filter troubleshooting items by issue when issue parameter is provided', async () => {
		const result = await getTroubleshooting({ componentName: 'Button', issue: 'responding' });

		expect(documentationStore.getComponent).toHaveBeenCalledWith('Button');
		expect(result.componentName).toBe('Button');
		expect(result.topic).toBe('troubleshooting');
		expect(result.content).toContain('Issues related to "responding"');
		expect(result.troubleshooting).toHaveLength(1);
		expect(result.troubleshooting[0].issue).toBe('Button not responding to clicks');
	});

	it('should throw an error when componentName parameter is missing', async () => {
		await expect(getTroubleshooting({})).rejects.toThrow(
			MCPErrorCode.INVALID_REQUEST + ': componentName parameter is required'
		);
	});

	it('should throw an error when componentName is not a string', async () => {
		await expect(getTroubleshooting({ componentName: 123 })).rejects.toThrow(
			MCPErrorCode.INVALID_REQUEST + ': componentName must be a string'
		);
	});

	it('should throw an error when issue is not a string', async () => {
		await expect(getTroubleshooting({ componentName: 'Button', issue: 123 })).rejects.toThrow(
			MCPErrorCode.INVALID_REQUEST + ': issue must be a string'
		);
	});

	it('should throw an error when component is not found', async () => {
		await expect(getTroubleshooting({ componentName: 'NonExistent' })).rejects.toThrow(
			MCPErrorCode.COMPONENT_NOT_FOUND + ': Component "NonExistent" not found'
		);

		expect(documentationStore.getComponent).toHaveBeenCalledWith('NonExistent');
		expect(documentationStore.searchComponents).toHaveBeenCalledWith('NonExistent');
	});

	it('should throw an error when component has no troubleshooting information', async () => {
		await expect(getTroubleshooting({ componentName: 'EmptyComponent' })).rejects.toThrow(
			MCPErrorCode.COMPONENT_NOT_FOUND +
				': No troubleshooting information found for "EmptyComponent"'
		);

		expect(documentationStore.getComponent).toHaveBeenCalledWith('EmptyComponent');
		expect(documentationStore.getAllComponents).toHaveBeenCalled();
	});

	it('should throw an error when no troubleshooting items match the issue', async () => {
		await expect(
			getTroubleshooting({ componentName: 'Button', issue: 'nonexistent' })
		).rejects.toThrow(
			MCPErrorCode.COMPONENT_NOT_FOUND +
				': No troubleshooting information found for "Button" related to "nonexistent"'
		);

		expect(documentationStore.getComponent).toHaveBeenCalledWith('Button');
	});

	it('should suggest components with troubleshooting information when component has no troubleshooting info', async () => {
		await expect(getTroubleshooting({ componentName: 'EmptyComponent' })).rejects.toThrow(
			/Try these components with troubleshooting information: Button/
		);
	});
});
