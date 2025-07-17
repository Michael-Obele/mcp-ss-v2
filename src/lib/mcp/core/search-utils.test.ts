/**
 * Tests for search utilities
 */

import { describe, it, expect } from 'vitest';
import {
	searchComponentsWithScoring,
	filterComponents,
	getSuggestions,
	findSimilarComponents,
	extractKeywords
} from './search-utils.js';
import type { Component } from './types.js';

describe('Search Utilities', () => {
	const mockComponents: Component[] = [
		{
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
				},
				{
					name: 'size',
					type: 'string',
					description: 'Button size',
					default: 'medium',
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
		},
		{
			name: 'Input',
			description: 'An input field component',
			usage: 'Use this component for form inputs',
			props: [
				{
					name: 'value',
					type: 'string',
					description: 'Input value',
					required: true
				},
				{
					name: 'placeholder',
					type: 'string',
					description: 'Input placeholder text',
					required: false
				}
			],
			examples: [
				{
					title: 'Basic Input',
					description: 'A simple input example',
					code: '<Input placeholder="Enter text" />',
					type: 'basic'
				},
				{
					title: 'Themed Input',
					description: 'A themed input example',
					code: '<Input class="themed" />',
					type: 'theming'
				}
			],
			relatedComponents: ['Button', 'Form'],
			cssVariables: [
				{
					name: '--input-border',
					description: 'Input border color',
					default: '#ccc'
				}
			],
			troubleshooting: [],
			category: 'form'
		}
	];

	describe('searchComponentsWithScoring', () => {
		it('should find components by name', () => {
			const results = searchComponentsWithScoring(mockComponents, 'button');

			expect(results).toHaveLength(1);
			expect(results[0].component.name).toBe('Button');
			expect(results[0].score).toBeGreaterThan(0);
			expect(results[0].matchedFields).toContain('name');
		});

		it('should find components by description', () => {
			const results = searchComponentsWithScoring(mockComponents, 'customizable');

			expect(results).toHaveLength(1);
			expect(results[0].component.name).toBe('Button');
			expect(results[0].matchedFields).toContain('description');
		});

		it('should find components by prop name', () => {
			const results = searchComponentsWithScoring(mockComponents, 'placeholder');

			expect(results).toHaveLength(1);
			expect(results[0].component.name).toBe('Input');
			expect(results[0].matchedFields).toContain('prop:placeholder');
		});

		it('should respect search options', () => {
			const results = searchComponentsWithScoring(mockComponents, 'button', {
				includeDescription: false,
				exactMatch: true,
				caseSensitive: true // Add case sensitivity to ensure no match
			});

			expect(results).toHaveLength(0); // No exact match for 'button' when case-sensitive
		});

		it('should sort results by score', () => {
			// Add a third component with lower relevance to 'form'
			const extendedComponents = [
				...mockComponents,
				{
					name: 'Card',
					description: 'A card component that can contain form elements',
					usage: 'Use for grouping related content',
					props: [],
					examples: [],
					relatedComponents: [],
					cssVariables: [],
					troubleshooting: []
				}
			];

			const results = searchComponentsWithScoring(extendedComponents, 'form');

			expect(results.length).toBeGreaterThan(1);
			expect(results[0].score).toBeGreaterThanOrEqual(results[1].score);
		});
	});

	describe('filterComponents', () => {
		it('should filter by category', () => {
			const results = filterComponents(mockComponents, { category: 'form' });

			expect(results).toHaveLength(2);
		});

		it('should filter by presence of props', () => {
			const results = filterComponents(mockComponents, { hasProps: true });

			expect(results).toHaveLength(2);
		});

		it('should filter by presence of troubleshooting', () => {
			const results = filterComponents(mockComponents, { hasTroubleshooting: true });

			expect(results).toHaveLength(1);
			expect(results[0].name).toBe('Button');
		});

		it('should filter by example type', () => {
			const results = filterComponents(mockComponents, { exampleType: 'theming' });

			expect(results).toHaveLength(1);
			expect(results[0].name).toBe('Input');
		});

		it('should filter by prop type', () => {
			const results = filterComponents(mockComponents, { propType: 'string' });

			expect(results).toHaveLength(2);
		});

		it('should filter by props count range', () => {
			const results = filterComponents(mockComponents, { minPropsCount: 2, maxPropsCount: 2 });

			expect(results).toHaveLength(2);
		});

		it('should combine multiple filters', () => {
			const results = filterComponents(mockComponents, {
				category: 'form',
				hasTroubleshooting: true,
				minPropsCount: 2
			});

			expect(results).toHaveLength(1);
			expect(results[0].name).toBe('Button');
		});
	});

	describe('getSuggestions', () => {
		it('should return component name suggestions', () => {
			const suggestions = getSuggestions(mockComponents, 'bu');

			expect(suggestions).toContain('Button');
		});

		it('should return prop name suggestions', () => {
			const suggestions = getSuggestions(mockComponents, 'va');

			expect(suggestions).toContain('variant');
			expect(suggestions).toContain('value');
		});

		it('should return CSS variable suggestions', () => {
			const suggestions = getSuggestions(mockComponents, '--');

			expect(suggestions).toContain('--button-bg');
			expect(suggestions).toContain('--input-border');
		});

		it('should limit the number of suggestions', () => {
			const suggestions = getSuggestions(mockComponents, '', 1);

			expect(suggestions).toHaveLength(1);
		});
	});

	describe('findSimilarComponents', () => {
		it('should find similar components based on props', () => {
			const similar = findSimilarComponents(mockComponents[0], mockComponents);

			expect(similar).toHaveLength(1);
			expect(similar[0].name).toBe('Input');
		});

		it('should find similar components based on category', () => {
			// Create a component with same category but different props
			const testComponents = [
				...mockComponents,
				{
					name: 'Select',
					description: 'A select dropdown component',
					usage: 'Use for selecting from options',
					props: [
						{
							name: 'options',
							type: 'array',
							description: 'Select options',
							required: true
						}
					],
					examples: [],
					relatedComponents: [],
					cssVariables: [],
					troubleshooting: [],
					category: 'form'
				}
			];

			const similar = findSimilarComponents(mockComponents[0], testComponents);

			expect(similar.length).toBeGreaterThan(1);
			expect(similar.some((c) => c.name === 'Select')).toBe(true);
		});

		it('should limit the number of results', () => {
			// Add more components to test limiting
			const testComponents = [
				...mockComponents,
				{
					name: 'Select',
					description: 'A select component',
					usage: 'Use for selecting options',
					props: [],
					examples: [],
					relatedComponents: ['Button'],
					cssVariables: [],
					troubleshooting: [],
					category: 'form'
				},
				{
					name: 'Checkbox',
					description: 'A checkbox component',
					usage: 'Use for boolean selections',
					props: [],
					examples: [],
					relatedComponents: ['Button'],
					cssVariables: [],
					troubleshooting: [],
					category: 'form'
				}
			];

			const similar = findSimilarComponents(mockComponents[0], testComponents, 1);

			expect(similar).toHaveLength(1);
		});
	});

	describe('extractKeywords', () => {
		it('should extract keywords from component data', () => {
			const keywords = extractKeywords(mockComponents[0]);

			expect(keywords).toContain('button');
			expect(keywords).toContain('customizable');
			expect(keywords).toContain('variant');
			expect(keywords).toContain('string');
			expect(keywords).toContain('form');
			expect(keywords).toContain('basic');
			expect(keywords).toContain('--button-bg');
		});

		it('should exclude short words', () => {
			const keywords = extractKeywords(mockComponents[0]);

			expect(keywords).not.toContain('for');
			expect(keywords).not.toContain('use');
		});
	});
});
