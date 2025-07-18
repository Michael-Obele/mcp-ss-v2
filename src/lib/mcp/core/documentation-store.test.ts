/**
 * Tests for DocumentationStore
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DocumentationStoreImpl } from './documentation-store.js';
import type { Component, ComponentCategory, InstallationGuide } from './types.js';

describe('DocumentationStore', () => {
	let store: DocumentationStoreImpl;

	const mockComponent: Component = {
		name: 'Button',
		description: 'A customizable button component',
		usage: 'Use this component for user interactions',
		props: [
			{
				name: 'variant',
				type: 'string',
				description: 'Button variant',
				default: 'default',
				required: false
			}
		],
		examples: [
			{
				title: 'Basic Button',
				description: 'A simple button example',
				code: '<Button>Click me</Button>',
				type: 'basic'
			}
		],
		relatedComponents: ['Input', 'Form'],
		cssVariables: [
			{
				name: '--button-bg',
				description: 'Button background color',
				default: '#000'
			}
		],
		troubleshooting: [
			{
				issue: 'Button not clickable',
				solution: 'Check if disabled prop is set'
			}
		],
		category: 'form'
	};

	const mockCategory: ComponentCategory = {
		name: 'form',
		description: 'Form-related components',
		components: ['Button', 'Input', 'Form']
	};

	const mockInstallationGuide: InstallationGuide = {
		framework: 'sveltekit',
		steps: [
			{
				order: 1,
				description: 'Install dependencies',
				command: 'npm install'
			}
		],
		requirements: ['Node.js 16+'],
		troubleshooting: []
	};

	beforeEach(() => {
		store = new DocumentationStoreImpl();
	});

	describe('Component Management', () => {
		it('should add and retrieve a component', () => {
			store.addComponent(mockComponent);
			const retrieved = store.getComponent('Button');

			expect(retrieved).toEqual(mockComponent);
		});

		it('should handle case-insensitive component names', () => {
			store.addComponent(mockComponent);
			const retrieved = store.getComponent('button');

			expect(retrieved).toEqual(mockComponent);
		});

		it('should return undefined for non-existent component', () => {
			const retrieved = store.getComponent('NonExistent');

			expect(retrieved).toBeUndefined();
		});

		it('should add multiple components', () => {
			const components = [mockComponent, { ...mockComponent, name: 'Input' }];

			store.addComponents(components);

			expect(store.getComponent('Button')).toBeDefined();
			expect(store.getComponent('Input')).toBeDefined();
		});

		it('should get all component names', () => {
			store.addComponent(mockComponent);
			store.addComponent({ ...mockComponent, name: 'Input' });

			const components = store.getAllComponents();
			const names = components.map((c) => c.name.toLowerCase());

			expect(names).toContain('button');
			expect(names).toContain('input');
			expect(names).toHaveLength(2);
		});
	});

	describe('Search Functionality', () => {
		beforeEach(() => {
			store.addComponent(mockComponent);
			store.addComponent({
				...mockComponent,
				name: 'Input',
				description: 'An input field component',
				usage: 'Use this component for form inputs',
				category: 'form'
			});
		});

		it('should search components by name', () => {
			const results = store.searchComponents('Button');

			expect(results).toHaveLength(1);
			expect(results[0].name).toBe('Button');
		});

		it('should search components by description', () => {
			const results = store.searchComponents('customizable');

			expect(results).toHaveLength(1);
			expect(results[0].name).toBe('Button');
		});

		it('should search components by usage', () => {
			// Create a unique search term that only exists in the Button component
			const results = store.searchComponents('user interactions');

			expect(results).toHaveLength(1);
			expect(results[0].name).toBe('Button');
		});

		it('should search components by category', () => {
			const results = store.searchComponents('form');

			expect(results).toHaveLength(2);
		});

		it('should return empty array for no matches', () => {
			const results = store.searchComponents('nonexistent');

			expect(results).toHaveLength(0);
		});
	});

	describe('Advanced Search', () => {
		beforeEach(() => {
			store.addComponent(mockComponent);
		});

		it('should search by component name', () => {
			const results = store.searchComponentsAdvanced({ componentName: 'Button' });

			expect(results).toHaveLength(1);
			expect(results[0].name).toBe('Button');
		});

		it('should filter by topic', () => {
			const results = store.searchComponentsAdvanced({ topic: 'props' });

			expect(results).toHaveLength(1);
		});

		it('should filter by example type', () => {
			const results = store.searchComponentsAdvanced({ exampleType: 'basic' });

			expect(results).toHaveLength(1);
		});

		it('should return empty array for non-matching filters', () => {
			const results = store.searchComponentsAdvanced({ exampleType: 'advanced' });

			expect(results).toHaveLength(0);
		});
	});

	describe('Category Management', () => {
		it('should add and retrieve categories', () => {
			store.addCategory(mockCategory);
			store.addComponent(mockComponent);

			const components = store.getComponentsByCategory('form');

			expect(components).toHaveLength(1);
			expect(components[0].name).toBe('Button');
		});

		it('should return empty array for non-existent category', () => {
			const components = store.getComponentsByCategory('nonexistent');

			expect(components).toHaveLength(0);
		});

		it('should get all category names', () => {
			store.addCategory(mockCategory);

			const categories = store.getAllCategories();
			const names = categories.map((c) => c.name.toLowerCase());

			expect(names).toContain('form');
		});
	});

	describe('Installation Guide Management', () => {
		it('should add and retrieve installation guides', () => {
			store.addInstallationGuide(mockInstallationGuide);

			const guide = store.getInstallationGuide('sveltekit');

			expect(guide).toEqual(mockInstallationGuide);
		});

		it('should handle case-insensitive framework names', () => {
			store.addInstallationGuide(mockInstallationGuide);

			const guide = store.getInstallationGuide('SvelteKit');

			expect(guide).toEqual(mockInstallationGuide);
		});

		it('should get all frameworks', () => {
			store.addInstallationGuide(mockInstallationGuide);

			const guides = store.getAllInstallationGuides();
			const frameworks = guides.map((g) => g.framework.toLowerCase());

			expect(frameworks).toContain('sveltekit');
		});
	});

	describe('Utility Functions', () => {
		beforeEach(() => {
			store.addComponent(mockComponent);
		});

		it('should get components with specific prop', () => {
			const results = store.getComponentsWithProp('variant');

			expect(results).toHaveLength(1);
			expect(results[0].name).toBe('Button');
		});

		it('should get components with CSS variable', () => {
			const results = store.getComponentsWithCSSVariable('--button-bg');

			expect(results).toHaveLength(1);
			expect(results[0].name).toBe('Button');
		});

		it('should get related components', () => {
			store.addComponent({ ...mockComponent, name: 'Input' });

			const related = store.getRelatedComponents('Button');

			expect(related).toHaveLength(1);
			expect(related[0].name).toBe('Input');
		});

		it('should get store statistics', () => {
			const stats = store.getStats();

			expect(stats.totalComponents).toBe(1);
			expect(stats.componentsWithExamples).toBe(1);
			expect(stats.componentsWithTroubleshooting).toBe(1);
		});
	});

	describe('Store Management', () => {
		it('should clear all data', () => {
			store.addComponent(mockComponent);
			store.addCategory(mockCategory);
			store.addInstallationGuide(mockInstallationGuide);

			store.clear();

			expect(store.getComponent('Button')).toBeUndefined();
			expect(store.getComponentsByCategory('form')).toHaveLength(0);
			expect(store.getInstallationGuide('sveltekit')).toBeUndefined();
		});
	});
});
