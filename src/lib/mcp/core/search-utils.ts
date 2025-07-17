/**
 * Search and filtering utilities for shadcn-svelte documentation
 *
 * This module provides advanced search and filtering capabilities
 * for component documentation.
 */

import type { Component, Example, Prop, CSSVariable, TroubleshootingItem } from './types.js';

/**
 * Search scoring interface
 */
interface SearchResult {
	component: Component;
	score: number;
	matchedFields: string[];
}

/**
 * Search options interface
 */
export interface SearchOptions {
	includeDescription?: boolean;
	includeUsage?: boolean;
	includeProps?: boolean;
	includeExamples?: boolean;
	includeTroubleshooting?: boolean;
	caseSensitive?: boolean;
	exactMatch?: boolean;
	minScore?: number;
}

/**
 * Advanced search function with scoring
 */
export function searchComponentsWithScoring(
	components: Component[],
	query: string,
	options: SearchOptions = {}
): SearchResult[] {
	const {
		includeDescription = true,
		includeUsage = true,
		includeProps = true,
		includeExamples = true,
		includeTroubleshooting = true,
		caseSensitive = false,
		exactMatch = false,
		minScore = 0
	} = options;

	const searchTerm = caseSensitive ? query : query.toLowerCase();
	const results: SearchResult[] = [];

	for (const component of components) {
		let score = 0;
		const matchedFields: string[] = [];

		// Search in component name (highest weight)
		const componentName = caseSensitive ? component.name : component.name.toLowerCase();
		if (exactMatch ? componentName === searchTerm : componentName.includes(searchTerm)) {
			score += exactMatch ? 100 : 50;
			matchedFields.push('name');
		}

		// Search in description
		if (includeDescription) {
			const description = caseSensitive
				? component.description
				: component.description.toLowerCase();
			if (exactMatch ? description === searchTerm : description.includes(searchTerm)) {
				score += exactMatch ? 30 : 15;
				matchedFields.push('description');
			}
		}

		// Search in usage
		if (includeUsage) {
			const usage = caseSensitive ? component.usage : component.usage.toLowerCase();
			if (exactMatch ? usage === searchTerm : usage.includes(searchTerm)) {
				score += exactMatch ? 25 : 12;
				matchedFields.push('usage');
			}
		}

		// Search in props
		if (includeProps) {
			for (const prop of component.props) {
				const propName = caseSensitive ? prop.name : prop.name.toLowerCase();
				const propDesc = caseSensitive ? prop.description : prop.description.toLowerCase();

				if (exactMatch ? propName === searchTerm : propName.includes(searchTerm)) {
					score += exactMatch ? 20 : 10;
					matchedFields.push(`prop:${prop.name}`);
				}

				if (exactMatch ? propDesc === searchTerm : propDesc.includes(searchTerm)) {
					score += exactMatch ? 10 : 5;
					matchedFields.push(`prop-desc:${prop.name}`);
				}
			}
		}

		// Search in examples
		if (includeExamples) {
			for (const example of component.examples) {
				const exampleTitle = caseSensitive ? example.title : example.title.toLowerCase();
				const exampleDesc = caseSensitive ? example.description : example.description.toLowerCase();

				if (exactMatch ? exampleTitle === searchTerm : exampleTitle.includes(searchTerm)) {
					score += exactMatch ? 15 : 8;
					matchedFields.push(`example:${example.title}`);
				}

				if (exactMatch ? exampleDesc === searchTerm : exampleDesc.includes(searchTerm)) {
					score += exactMatch ? 10 : 5;
					matchedFields.push(`example-desc:${example.title}`);
				}
			}
		}

		// Search in troubleshooting
		if (includeTroubleshooting) {
			for (const item of component.troubleshooting) {
				const issue = caseSensitive ? item.issue : item.issue.toLowerCase();
				const solution = caseSensitive ? item.solution : item.solution.toLowerCase();

				if (exactMatch ? issue === searchTerm : issue.includes(searchTerm)) {
					score += exactMatch ? 15 : 8;
					matchedFields.push(`troubleshooting-issue`);
				}

				if (exactMatch ? solution === searchTerm : solution.includes(searchTerm)) {
					score += exactMatch ? 10 : 5;
					matchedFields.push(`troubleshooting-solution`);
				}
			}
		}

		// Add to results if score meets minimum threshold
		if (score >= minScore && matchedFields.length > 0) {
			results.push({
				component,
				score,
				matchedFields
			});
		}
	}

	// Sort by score (highest first)
	return results.sort((a, b) => b.score - a.score);
}

/**
 * Filter components by multiple criteria
 */
export function filterComponents(
	components: Component[],
	filters: {
		category?: string;
		hasProps?: boolean;
		hasExamples?: boolean;
		hasTroubleshooting?: boolean;
		hasCSSVariables?: boolean;
		exampleType?: string;
		framework?: string;
		propType?: string;
		minPropsCount?: number;
		maxPropsCount?: number;
	}
): Component[] {
	return components.filter((component) => {
		// Filter by category
		if (filters.category && component.category !== filters.category) {
			return false;
		}

		// Filter by presence of props
		if (filters.hasProps !== undefined) {
			const hasProps = component.props.length > 0;
			if (filters.hasProps !== hasProps) {
				return false;
			}
		}

		// Filter by presence of examples
		if (filters.hasExamples !== undefined) {
			const hasExamples = component.examples.length > 0;
			if (filters.hasExamples !== hasExamples) {
				return false;
			}
		}

		// Filter by presence of troubleshooting
		if (filters.hasTroubleshooting !== undefined) {
			const hasTroubleshooting = component.troubleshooting.length > 0;
			if (filters.hasTroubleshooting !== hasTroubleshooting) {
				return false;
			}
		}

		// Filter by presence of CSS variables
		if (filters.hasCSSVariables !== undefined) {
			const hasCSSVariables = component.cssVariables.length > 0;
			if (filters.hasCSSVariables !== hasCSSVariables) {
				return false;
			}
		}

		// Filter by example type
		if (filters.exampleType) {
			const hasExampleType = component.examples.some(
				(example) => example.type === filters.exampleType
			);
			if (!hasExampleType) {
				return false;
			}
		}

		// Filter by framework
		if (filters.framework) {
			const hasFramework = component.examples.some(
				(example) => !example.framework || example.framework === filters.framework
			);
			if (!hasFramework) {
				return false;
			}
		}

		// Filter by prop type
		if (filters.propType) {
			const hasPropType = component.props.some((prop) => prop.type === filters.propType);
			if (!hasPropType) {
				return false;
			}
		}

		// Filter by props count range
		if (filters.minPropsCount !== undefined && component.props.length < filters.minPropsCount) {
			return false;
		}

		if (filters.maxPropsCount !== undefined && component.props.length > filters.maxPropsCount) {
			return false;
		}

		return true;
	});
}

/**
 * Get suggestions for partial queries
 */
export function getSuggestions(
	components: Component[],
	partialQuery: string,
	maxSuggestions: number = 5
): string[] {
	const suggestions = new Set<string>();
	const query = partialQuery.toLowerCase();

	for (const component of components) {
		// Component name suggestions
		if (component.name.toLowerCase().startsWith(query)) {
			suggestions.add(component.name);
		}

		// Prop name suggestions
		for (const prop of component.props) {
			if (prop.name.toLowerCase().startsWith(query)) {
				suggestions.add(prop.name);
			}
		}

		// CSS variable suggestions
		for (const cssVar of component.cssVariables) {
			if (cssVar.name.toLowerCase().startsWith(query)) {
				suggestions.add(cssVar.name);
			}
		}

		// Stop if we have enough suggestions
		if (suggestions.size >= maxSuggestions) {
			break;
		}
	}

	return Array.from(suggestions).slice(0, maxSuggestions);
}

/**
 * Find similar components based on props and functionality
 */
export function findSimilarComponents(
	targetComponent: Component,
	allComponents: Component[],
	maxResults: number = 5
): Component[] {
	const similarities: { component: Component; score: number }[] = [];

	for (const component of allComponents) {
		if (component.name === targetComponent.name) {
			continue; // Skip the target component itself
		}

		let score = 0;

		// Compare props
		const targetPropNames = new Set(targetComponent.props.map((p) => p.name));
		const componentPropNames = new Set(component.props.map((p) => p.name));
		const commonProps = new Set([...targetPropNames].filter((x) => componentPropNames.has(x)));

		score += commonProps.size * 10;

		// Compare CSS variables
		const targetCSSVars = new Set(targetComponent.cssVariables.map((v) => v.name));
		const componentCSSVars = new Set(component.cssVariables.map((v) => v.name));
		const commonCSSVars = new Set([...targetCSSVars].filter((x) => componentCSSVars.has(x)));

		score += commonCSSVars.size * 5;

		// Compare categories
		if (targetComponent.category && component.category === targetComponent.category) {
			score += 20;
		}

		// Compare related components
		const targetRelated = new Set(targetComponent.relatedComponents);
		const componentRelated = new Set(component.relatedComponents);
		const commonRelated = new Set([...targetRelated].filter((x) => componentRelated.has(x)));

		score += commonRelated.size * 15;

		if (score > 0) {
			similarities.push({ component, score });
		}
	}

	return similarities
		.sort((a, b) => b.score - a.score)
		.slice(0, maxResults)
		.map((item) => item.component);
}

/**
 * Extract keywords from component documentation
 */
export function extractKeywords(component: Component): string[] {
	const keywords = new Set<string>();

	// Add component name
	keywords.add(component.name.toLowerCase());

	// Add category
	if (component.category) {
		keywords.add(component.category.toLowerCase());
	}

	// Add prop names and types
	for (const prop of component.props) {
		keywords.add(prop.name.toLowerCase());
		keywords.add(prop.type.toLowerCase());
	}

	// Add example types
	for (const example of component.examples) {
		keywords.add(example.type.toLowerCase());
	}

	// Add CSS variable names
	for (const cssVar of component.cssVariables) {
		keywords.add(cssVar.name.toLowerCase());
	}

	// Extract words from description and usage
	const text = `${component.description} ${component.usage}`.toLowerCase();
	const words = text.match(/\b\w+\b/g) || [];

	for (const word of words) {
		if (word.length > 3) {
			// Only include words longer than 3 characters
			keywords.add(word);
		}
	}

	return Array.from(keywords);
}
