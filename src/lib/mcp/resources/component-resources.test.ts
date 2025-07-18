/**
 * Tests for Component Documentation Resources
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { documentationStore } from '../core/documentation-store';
import {
	getComponentDocumentation,
	getComponentDetails,
	getComponentsByCategory
} from './component-resources';
import type { Component, ComponentCategory } from '../core/types';

// Mock components for testing
const mockComponents: Component[] = [
	{
		name: 'Button',
		description: 'A button component',
		usage: 'Use for user interactions',
		props: [
			{ name: 'variant', type: 'string', description: 'Button style variant', required: false }
		],
		examples: [
			{
				title: 'Basic',
				description: 'Basic button',
				code: '<Button>Click me</Button>',
				type: 'basic'
			}
		],
		relatedComponents: ['IconButton'],
		cssVariables: [
			{ name: '--button-bg', description: 'Button background color', default: '#fff' }
		],
		troubleshooting: [{ issue: 'Button not clickable', solution: 'Check disabled prop' }],
		category: 'inputs'
	},
	{
		name: 'IconButton',
		description: 'A button with an icon',
		usage: 'Use for icon-only buttons',
		props: [{ name: 'icon', type: 'string', description: 'Icon name', required: true }],
		examples: [
			{
				title: 'Basic',
				description: 'Basic icon button',
				code: '<IconButton icon="settings" />',
				type: 'basic'
			}
		],
		relatedComponents: ['Button'],
		cssVariables: [{ name: '--icon-size', description: 'Icon size', default: '1rem' }],
		troubleshooting: [{ issue: 'Icon not showing', solution: 'Check icon name' }],
		category: 'inputs'
	},
	{
		name: 'Card',
		description: 'A card component',
		usage: 'Use for displaying content in a card format',
		props: [
			{ name: 'variant', type: 'string', description: 'Card style variant', required: false }
		],
		examples: [
			{ title: 'Basic', description: 'Basic card', code: '<Card>Content</Card>', type: 'basic' }
		],
		relatedComponents: [],
		cssVariables: [{ name: '--card-padding', description: 'Card padding', default: '1rem' }],
		troubleshooting: [{ issue: 'Card not rendering', solution: 'Check content' }],
		category: 'layout'
	}
];

// Mock categories for testing
const mockCategories: ComponentCategory[] = [
	{
		name: 'inputs',
		description: 'Input components',
		components: ['Button', 'IconButton']
	},
	{
		name: 'layout',
		description: 'Layout components',
		components: ['Card']
	}
];

// Mock the documentationStore
vi.mock('../core/documentation-store', () => {
	return {
		documentationStore: {
			getComponent: vi.fn((name: string) =>
				mockComponents.find((c) => c.name.toLowerCase() === name.toLowerCase())
			),
			getAllComponents: vi.fn(() => mockComponents),
			getComponentsByCategory: vi.fn((category: string) =>
				mockComponents.filter((c) => c.category?.toLowerCase() === category.toLowerCase())
			),
			getCategory: vi.fn((name: string) =>
				mockCategories.find((c) => c.name.toLowerCase() === name.toLowerCase())
			),
			getAllCategories: vi.fn(() => mockCategories),
			searchComponents: vi.fn((query: string) =>
				mockComponents.filter(
					(c) =>
						c.name.toLowerCase().includes(query.toLowerCase()) ||
						c.description.toLowerCase().includes(query.toLowerCase())
				)
			),
			searchComponentsAdvanced: vi.fn((query: any) => {
				let results = mockComponents;

				if (query.category) {
					results = results.filter(
						(c) => c.category?.toLowerCase() === query.category.toLowerCase()
					);
				}

				if (query.topic) {
					// Filter by topic logic would go here
					// For simplicity, we'll just return the current results
				}

				return results;
			})
		}
	};
});

describe('Component Documentation Resources', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('getComponentDocumentation', () => {
		it('should return all components with default pagination', async () => {
			const result = await getComponentDocumentation();

			expect(documentationStore.getAllComponents).toHaveBeenCalled();
			expect(result.data).toHaveLength(3);
			expect(result.pagination).toEqual({
				total: 3,
				page: 1,
				limit: 10,
				totalPages: 1
			});
		});

		it('should return paginated components', async () => {
			const result = await getComponentDocumentation({ page: 1, limit: 2 });

			expect(result.data).toHaveLength(2);
			expect(result.pagination).toEqual({
				total: 3,
				page: 1,
				limit: 2,
				totalPages: 2
			});
		});

		it('should return a specific component by name', async () => {
			const result = await getComponentDocumentation({ componentName: 'Button' });

			expect(documentationStore.getComponent).toHaveBeenCalledWith('Button');
			expect(result.data).toHaveLength(1);
			expect(result.data[0].name).toBe('Button');
		});

		it('should search components by query string', async () => {
			const result = await getComponentDocumentation({ search: 'icon' });

			expect(documentationStore.searchComponents).toHaveBeenCalledWith('icon');
			expect(result.data.length).toBeGreaterThan(0);
		});

		it('should filter components by category', async () => {
			const result = await getComponentDocumentation({ category: 'inputs' });

			expect(documentationStore.searchComponentsAdvanced).toHaveBeenCalledWith(
				expect.objectContaining({ category: 'inputs' })
			);
			expect(result.data.length).toBeGreaterThan(0);
		});
	});

	describe('getComponentDetails', () => {
		it('should return details for a specific component', async () => {
			const result = await getComponentDetails('Button');

			expect(documentationStore.getComponent).toHaveBeenCalledWith('Button');
			expect(result).toBeDefined();
			expect(result?.name).toBe('Button');
		});

		it('should return null for non-existent component', async () => {
			const result = await getComponentDetails('NonExistent');

			expect(documentationStore.getComponent).toHaveBeenCalledWith('NonExistent');
			expect(result).toBeNull();
		});
	});

	describe('getComponentsByCategory', () => {
		it('should return components in a specific category', async () => {
			const result = await getComponentsByCategory('inputs');

			expect(documentationStore.getComponentsByCategory).toHaveBeenCalledWith('inputs');
			expect(result.data.length).toBeGreaterThan(0);
			expect(result.data.every((c) => c.category === 'inputs')).toBe(true);
		});

		it('should return paginated components by category', async () => {
			const result = await getComponentsByCategory('inputs', { page: 1, limit: 1 });

			expect(documentationStore.getComponentsByCategory).toHaveBeenCalledWith('inputs');
			expect(result.data).toHaveLength(1);
			expect(result.pagination.limit).toBe(1);
		});
	});
});
