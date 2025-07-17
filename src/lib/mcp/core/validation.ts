/**
 * Validation functions for shadcn-svelte MCP server data models
 *
 * This file contains functions to validate the integrity of data models
 * used in the shadcn-svelte MCP server.
 */

import type {
	Component,
	Prop,
	Example,
	CSSVariable,
	TroubleshootingItem,
	ComponentQuery,
	ComponentResponse,
	AccessibilityInfo,
	AriaAttribute,
	KeyboardInteraction,
	ComponentCategory,
	InstallationGuide,
	InstallationStep
} from './types';

/**
 * Validates a component object
 * @param component The component to validate
 * @returns An object with isValid flag and any validation errors
 */
export function validateComponent(component: Partial<Component>): {
	isValid: boolean;
	errors: string[];
} {
	const errors: string[] = [];

	// Required fields
	if (!component.name) errors.push('Component name is required');
	if (!component.description) errors.push('Component description is required');
	if (!component.usage) errors.push('Component usage is required');

	// Array fields should be initialized
	if (!Array.isArray(component.props)) errors.push('Component props should be an array');
	if (!Array.isArray(component.examples)) errors.push('Component examples should be an array');
	if (!Array.isArray(component.relatedComponents))
		errors.push('Component relatedComponents should be an array');
	if (!Array.isArray(component.cssVariables))
		errors.push('Component cssVariables should be an array');
	if (!Array.isArray(component.troubleshooting))
		errors.push('Component troubleshooting should be an array');

	// Validate nested objects
	if (Array.isArray(component.props)) {
		component.props.forEach((prop, index) => {
			const propValidation = validateProp(prop);
			if (!propValidation.isValid) {
				propValidation.errors.forEach((error) => {
					errors.push(`Prop at index ${index}: ${error}`);
				});
			}
		});
	}

	if (Array.isArray(component.examples)) {
		component.examples.forEach((example, index) => {
			const exampleValidation = validateExample(example);
			if (!exampleValidation.isValid) {
				exampleValidation.errors.forEach((error) => {
					errors.push(`Example at index ${index}: ${error}`);
				});
			}
		});
	}

	if (Array.isArray(component.cssVariables)) {
		component.cssVariables.forEach((cssVar, index) => {
			const cssVarValidation = validateCSSVariable(cssVar);
			if (!cssVarValidation.isValid) {
				cssVarValidation.errors.forEach((error) => {
					errors.push(`CSS Variable at index ${index}: ${error}`);
				});
			}
		});
	}

	if (Array.isArray(component.troubleshooting)) {
		component.troubleshooting.forEach((item, index) => {
			const itemValidation = validateTroubleshootingItem(item);
			if (!itemValidation.isValid) {
				itemValidation.errors.forEach((error) => {
					errors.push(`Troubleshooting item at index ${index}: ${error}`);
				});
			}
		});
	}

	return {
		isValid: errors.length === 0,
		errors
	};
}

/**
 * Validates a component property
 * @param prop The property to validate
 * @returns An object with isValid flag and any validation errors
 */
export function validateProp(prop: Partial<Prop>): { isValid: boolean; errors: string[] } {
	const errors: string[] = [];

	if (!prop.name) errors.push('Prop name is required');
	if (!prop.type) errors.push('Prop type is required');
	if (!prop.description) errors.push('Prop description is required');

	// required should be a boolean
	if (typeof prop.required !== 'boolean') errors.push('Prop required field should be a boolean');

	return {
		isValid: errors.length === 0,
		errors
	};
}

/**
 * Validates a component example
 * @param example The example to validate
 * @returns An object with isValid flag and any validation errors
 */
export function validateExample(example: Partial<Example>): { isValid: boolean; errors: string[] } {
	const errors: string[] = [];

	if (!example.title) errors.push('Example title is required');
	if (!example.description) errors.push('Example description is required');
	if (!example.code) errors.push('Example code is required');
	if (!example.type) errors.push('Example type is required');

	// Validate example type is one of the allowed values
	const validTypes = ['basic', 'advanced', 'theming', 'accessibility', 'responsive'];
	if (example.type && !validTypes.includes(example.type)) {
		errors.push(`Example type should be one of: ${validTypes.join(', ')}`);
	}

	return {
		isValid: errors.length === 0,
		errors
	};
}

/**
 * Validates a CSS variable
 * @param cssVar The CSS variable to validate
 * @returns An object with isValid flag and any validation errors
 */
export function validateCSSVariable(cssVar: Partial<CSSVariable>): {
	isValid: boolean;
	errors: string[];
} {
	const errors: string[] = [];

	if (!cssVar.name) errors.push('CSS variable name is required');
	if (!cssVar.description) errors.push('CSS variable description is required');
	if (!cssVar.default) errors.push('CSS variable default value is required');

	// CSS variable name should start with --
	if (cssVar.name && !cssVar.name.startsWith('--')) {
		errors.push('CSS variable name should start with --');
	}

	return {
		isValid: errors.length === 0,
		errors
	};
}

/**
 * Validates a troubleshooting item
 * @param item The troubleshooting item to validate
 * @returns An object with isValid flag and any validation errors
 */
export function validateTroubleshootingItem(item: Partial<TroubleshootingItem>): {
	isValid: boolean;
	errors: string[];
} {
	const errors: string[] = [];

	if (!item.issue) errors.push('Troubleshooting issue is required');
	if (!item.solution) errors.push('Troubleshooting solution is required');

	// If relatedProps is provided, it should be an array
	if (item.relatedProps !== undefined && !Array.isArray(item.relatedProps)) {
		errors.push('Troubleshooting relatedProps should be an array');
	}

	return {
		isValid: errors.length === 0,
		errors
	};
}

/**
 * Validates a component query
 * @param query The component query to validate
 * @returns An object with isValid flag and any validation errors
 */
export function validateComponentQuery(query: Partial<ComponentQuery>): {
	isValid: boolean;
	errors: string[];
} {
	const errors: string[] = [];

	// At least one of these fields should be provided
	if (!query.componentName && !query.topic && !query.specificQuestion) {
		errors.push('At least one of componentName, topic, or specificQuestion is required');
	}

	// Validate topic if provided
	const validTopics = ['usage', 'props', 'examples', 'theming', 'troubleshooting'];
	if (query.topic && !validTopics.includes(query.topic)) {
		errors.push(`Topic should be one of: ${validTopics.join(', ')}`);
	}

	// Validate framework if provided
	const validFrameworks = ['sveltekit', 'vite', 'astro'];
	if (query.framework && !validFrameworks.includes(query.framework)) {
		errors.push(`Framework should be one of: ${validFrameworks.join(', ')}`);
	}

	return {
		isValid: errors.length === 0,
		errors
	};
}

/**
 * Validates a component response
 * @param response The component response to validate
 * @returns An object with isValid flag and any validation errors
 */
export function validateComponentResponse(response: Partial<ComponentResponse>): {
	isValid: boolean;
	errors: string[];
} {
	const errors: string[] = [];

	if (!response.componentName) errors.push('Response componentName is required');
	if (!response.topic) errors.push('Response topic is required');
	if (!response.content) errors.push('Response content is required');

	// If examples is provided, it should be an array
	if (response.examples !== undefined && !Array.isArray(response.examples)) {
		errors.push('Response examples should be an array');
	}

	// If relatedComponents is provided, it should be an array
	if (response.relatedComponents !== undefined && !Array.isArray(response.relatedComponents)) {
		errors.push('Response relatedComponents should be an array');
	}

	// If additionalResources is provided, it should be an array
	if (response.additionalResources !== undefined && !Array.isArray(response.additionalResources)) {
		errors.push('Response additionalResources should be an array');
	}

	// Validate examples if provided
	if (Array.isArray(response.examples)) {
		response.examples.forEach((example, index) => {
			const exampleValidation = validateExample(example);
			if (!exampleValidation.isValid) {
				exampleValidation.errors.forEach((error) => {
					errors.push(`Example at index ${index}: ${error}`);
				});
			}
		});
	}

	return {
		isValid: errors.length === 0,
		errors
	};
}

/**
 * Helper function to ensure a component object has all required fields
 * @param component Partial component object
 * @returns A complete component object with default values for missing fields
 */
export function ensureCompleteComponent(component: Partial<Component>): Component {
	return {
		name: component.name || '',
		description: component.description || '',
		usage: component.usage || '',
		props: Array.isArray(component.props) ? component.props : [],
		examples: Array.isArray(component.examples) ? component.examples : [],
		relatedComponents: Array.isArray(component.relatedComponents)
			? component.relatedComponents
			: [],
		cssVariables: Array.isArray(component.cssVariables) ? component.cssVariables : [],
		troubleshooting: Array.isArray(component.troubleshooting) ? component.troubleshooting : []
	};
}
