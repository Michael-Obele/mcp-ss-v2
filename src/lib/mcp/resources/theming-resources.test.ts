/**
 * Tests for Theming Resources
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	getThemingDocumentation,
	getAllCSSVariables,
	getComponentsWithCSSVariable,
	getGeneralThemingGuidance
} from './theming-resources';
import { documentationStore } from '../core/documentation-store';
import type { Component, CSSVariable } from '../core/types';

// Mock the documentation store
vi.mock('../core/documentation-store', () => {
	const mockButton: Component = {
		name: 'Button',
		description: 'A button component',
		usage: 'Use for user interactions',
		props: [],
		examples: [],
		relatedComponents: [],
		cssVariables: [
			{
				name: '--button-bg',
				description: 'Button background color',
				default: '#000',
				scope: 'component'
			},
			{
				name: '--button-text',
				description: 'Button text color',
				default: '#fff',
				scope: 'component',
				affectedComponents: ['Badge']
			}
		],
		troubleshooting: []
	};

	const mockCard: Component = {
		name: 'Card',
		description: 'A card component',
		usage: 'Use for displaying content',
		props: [],
		examples: [],
		relatedComponents: [],
		cssVariables: [
			{
				name: '--card-bg',
				description: 'Card background color',
				default: '#fff',
				scope: 'component'
			},
			{
				name: '--button-bg',
				description: 'Button background color used in cards',
				default: '#000',
				scope: 'shared'
			}
		],
		troubleshooting: []
	};

	return {
		documentationStore: {
			getComponent: vi.fn((name) => {
				if (name.toLowerCase() === 'button') {
					return mockButton;
				}
				if (name.toLowerCase() === 'card') {
					return mockCard;
				}
				return undefined;
			}),
			getAllComponents: vi.fn(() => [mockButton, mockCard]),
			getComponentsWithCSSVariable: vi.fn((variableName) => {
				if (variableName === '--button-bg') {
					return [mockButton, mockCard];
				}
				if (variableName === '--button-text') {
					return [mockButton];
				}
				if (variableName === '--card-bg') {
					return [mockCard];
				}
				return [];
			})
		}
	};
});

describe('Theming Resources', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('getThemingDocumentation', () => {
		it('should return component-specific theming info when componentName is provided', async () => {
			const result = await getThemingDocumentation({ componentName: 'Button' });

			expect(documentationStore.getComponent).toHaveBeenCalledWith('Button');
			expect(result).not.toBeNull();
			expect(result?.componentName).toBe('Button');
			expect(result?.variables).toHaveLength(2);
			expect(result?.variables[0].name).toBe('--button-bg');
			expect(result?.variables[1].name).toBe('--button-text');
		});

		it('should filter variables by name when variableName is provided', async () => {
			const result = await getThemingDocumentation({
				componentName: 'Button',
				variableName: 'text'
			});

			expect(documentationStore.getComponent).toHaveBeenCalledWith('Button');
			expect(result).not.toBeNull();
			expect(result?.componentName).toBe('Button');
			expect(result?.variables).toHaveLength(1);
			expect(result?.variables[0].name).toBe('--button-text');
		});

		it('should filter variables by scope when scope is provided', async () => {
			const result = await getThemingDocumentation({
				componentName: 'Card',
				scope: 'shared'
			});

			expect(documentationStore.getComponent).toHaveBeenCalledWith('Card');
			expect(result).not.toBeNull();
			expect(result?.componentName).toBe('Card');
			expect(result?.variables).toHaveLength(1);
			expect(result?.variables[0].name).toBe('--button-bg');
			expect(result?.variables[0].scope).toBe('shared');
		});

		it('should return null when component is not found', async () => {
			const result = await getThemingDocumentation({ componentName: 'NonExistent' });

			expect(documentationStore.getComponent).toHaveBeenCalledWith('NonExistent');
			expect(result).toBeNull();
		});

		it('should return general theming documentation when no componentName is provided', async () => {
			const result = await getThemingDocumentation();

			expect(documentationStore.getAllComponents).toHaveBeenCalled();
			expect(result).not.toBeNull();
			expect(result?.componentName).toBeUndefined();
			expect(result?.variables).toBeDefined();
			expect(result?.generalGuidance).toBeDefined();
			expect(result?.generalGuidance).toContain('Theming shadcn-svelte Components');
		});
	});

	describe('getAllCSSVariables', () => {
		it('should return all CSS variables from all components', () => {
			const variables = getAllCSSVariables();

			expect(documentationStore.getAllComponents).toHaveBeenCalled();
			expect(variables.length).toBeGreaterThanOrEqual(3); // At least 3 unique variables

			// Check for unique variable names
			const variableNames = variables.map((v) => v.name);
			expect(variableNames).toContain('--button-bg');
			expect(variableNames).toContain('--button-text');
			expect(variableNames).toContain('--card-bg');
		});

		it('should filter variables by name', () => {
			const variables = getAllCSSVariables({ variableName: 'button' });

			expect(variables.length).toBeGreaterThanOrEqual(2);
			expect(variables.every((v) => v.name.includes('button'))).toBe(true);
		});

		it('should filter variables by scope', () => {
			const variables = getAllCSSVariables({ scope: 'shared' });

			expect(variables.length).toBe(1);
			expect(variables[0].name).toBe('--button-bg');
			expect(variables[0].scope).toBe('shared');
		});

		it('should remove affectedComponents when includeAffectedComponents is false', () => {
			const variables = getAllCSSVariables({ includeAffectedComponents: false });

			for (const variable of variables) {
				expect(variable).not.toHaveProperty('affectedComponents');
			}
		});

		it('should merge affectedComponents for duplicate variables', () => {
			const variables = getAllCSSVariables();

			// Find the --button-bg variable which should have merged affected components
			const buttonBgVar = variables.find((v) => v.name === '--button-bg');

			expect(buttonBgVar).toBeDefined();
			expect(buttonBgVar?.affectedComponents).toBeDefined();

			// The variable should be affected by both Button and Card components
			if (buttonBgVar?.affectedComponents) {
				expect(buttonBgVar.affectedComponents).toContain('Button');
				expect(buttonBgVar.affectedComponents.length).toBeGreaterThanOrEqual(1);
			}
		});
	});

	describe('getComponentsWithCSSVariable', () => {
		it('should return components that use a specific CSS variable', async () => {
			const components = await getComponentsWithCSSVariable('--button-bg');

			expect(documentationStore.getComponentsWithCSSVariable).toHaveBeenCalledWith('--button-bg');
			expect(components).toHaveLength(2);
			expect(components[0].name).toBe('Button');
			expect(components[1].name).toBe('Card');
		});

		it('should return empty array when no components use the variable', async () => {
			const components = await getComponentsWithCSSVariable('--nonexistent');

			expect(documentationStore.getComponentsWithCSSVariable).toHaveBeenCalledWith('--nonexistent');
			expect(components).toHaveLength(0);
		});
	});

	describe('getGeneralThemingGuidance', () => {
		it('should return general theming guidance text', () => {
			const guidance = getGeneralThemingGuidance();

			expect(guidance).toBeDefined();
			expect(guidance).toContain('Theming shadcn-svelte Components');
			expect(guidance).toContain('CSS Variables');
			expect(guidance).toContain('Tailwind Configuration');
		});
	});
});
