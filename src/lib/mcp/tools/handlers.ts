import type { ComponentResponse } from '../core/types';
import { documentationStore } from '../core/documentation-store';
import { MCPErrorCode } from '../core/server';

/**
 * Get component information
 *
 * This tool retrieves detailed information about a specific shadcn-svelte component.
 * It returns the component's description, usage information, props, examples, and related components.
 *
 * @param params - Tool parameters
 * @param params.componentName - Name of the component to retrieve information for
 * @returns Component information response
 */
export async function getComponentInfo(
	params: Record<string, unknown>
): Promise<ComponentResponse> {
	// Validate parameters
	if (!params) {
		throw new Error(MCPErrorCode.INVALID_REQUEST + ': Parameters are required');
	}

	// Validate componentName parameter
	const componentName = params.componentName;
	if (componentName === undefined || componentName === null) {
		throw new Error(MCPErrorCode.INVALID_REQUEST + ': componentName parameter is required');
	}

	if (typeof componentName !== 'string') {
		throw new Error(MCPErrorCode.INVALID_REQUEST + ': componentName must be a string');
	}

	if (componentName.trim() === '') {
		throw new Error(MCPErrorCode.INVALID_REQUEST + ': componentName cannot be empty');
	}

	// Get component from documentation store
	const component = documentationStore.getComponent(componentName);
	if (!component) {
		// Try to find similar components for suggestion
		const similarComponents = documentationStore
			.searchComponents(componentName)
			.slice(0, 3)
			.map((c) => c.name);

		const suggestionMessage =
			similarComponents.length > 0
				? `Did you mean: ${similarComponents.join(', ')}?`
				: 'Try searching for another component.';

		throw new Error(
			MCPErrorCode.COMPONENT_NOT_FOUND +
				`: Component "${componentName}" not found. ${suggestionMessage}`
		);
	}

	// Format the response
	const response: ComponentResponse = {
		componentName: component.name,
		topic: 'info',
		content: component.description + '\n\nUsage: ' + component.usage,
		props: component.props,
		examples: component.examples,
		relatedComponents: component.relatedComponents,
		cssVariables: component.cssVariables,
		troubleshooting: component.troubleshooting
	};

	// Add additional information if available
	if (component.installCommand) {
		response.content += '\n\nInstallation: ' + component.installCommand;
	}

	if (component.importStatement) {
		response.content += '\n\nImport: ' + component.importStatement;
	}

	if (component.version) {
		response.content += '\n\nVersion: ' + component.version;
	}

	if (component.category) {
		response.content += '\n\nCategory: ' + component.category;
	}

	if (component.accessibility) {
		response.accessibility = component.accessibility;
	}

	return response;
}

/**
 * Get component examples
 *
 * This tool retrieves code examples for a specific shadcn-svelte component.
 * It can optionally filter examples by type (basic, advanced, theming, etc.).
 *
 * @param params - Tool parameters
 * @param params.componentName - Name of the component to retrieve examples for
 * @param params.exampleType - Optional type of examples to retrieve
 * @returns Component examples response
 */
export async function getComponentExample(
	params: Record<string, unknown>
): Promise<ComponentResponse> {
	// Validate parameters
	if (!params) {
		throw new Error(MCPErrorCode.INVALID_REQUEST + ': Parameters are required');
	}

	// Validate componentName parameter
	const componentName = params.componentName;
	if (componentName === undefined || componentName === null) {
		throw new Error(MCPErrorCode.INVALID_REQUEST + ': componentName parameter is required');
	}

	if (typeof componentName !== 'string') {
		throw new Error(MCPErrorCode.INVALID_REQUEST + ': componentName must be a string');
	}

	if (componentName.trim() === '') {
		throw new Error(MCPErrorCode.INVALID_REQUEST + ': componentName cannot be empty');
	}

	// Validate exampleType parameter if provided
	const exampleType = params.exampleType;
	if (exampleType !== undefined && exampleType !== null) {
		if (typeof exampleType !== 'string') {
			throw new Error(MCPErrorCode.INVALID_REQUEST + ': exampleType must be a string');
		}
	}

	// Get component from documentation store
	const component = documentationStore.getComponent(componentName);
	if (!component) {
		// Try to find similar components for suggestion
		const similarComponents = documentationStore
			.searchComponents(componentName)
			.slice(0, 3)
			.map((c) => c.name);

		const suggestionMessage =
			similarComponents.length > 0
				? `Did you mean: ${similarComponents.join(', ')}?`
				: 'Try searching for another component.';

		throw new Error(
			MCPErrorCode.COMPONENT_NOT_FOUND +
				`: Component "${componentName}" not found. ${suggestionMessage}`
		);
	}

	// Filter examples by type if specified
	let examples = component.examples;
	const exampleTypeStr = exampleType as string | undefined;

	if (exampleTypeStr && exampleTypeStr.trim() !== '') {
		examples = examples.filter((example) => example.type === exampleTypeStr);
	}

	// Check if any examples match the criteria
	if (examples.length === 0) {
		// Get available example types for this component
		const availableTypes = [...new Set(component.examples.map((ex) => ex.type))];

		const typesMessage =
			availableTypes.length > 0
				? `Available example types: ${availableTypes.join(', ')}`
				: 'No examples available for this component';

		throw new Error(
			MCPErrorCode.COMPONENT_NOT_FOUND +
				`: No examples found for "${componentName}"` +
				(exampleTypeStr ? ` with type "${exampleTypeStr}". ${typesMessage}` : `. ${typesMessage}`)
		);
	}

	// Format the response
	return {
		componentName: component.name,
		topic: 'examples',
		content: `Examples for ${component.name}` + (exampleTypeStr ? ` (${exampleTypeStr})` : ''),
		examples: examples,
		// Include additional metadata about the examples
		additionalResources: [
			`Total examples: ${examples.length}`,
			`Example types: ${[...new Set(examples.map((ex) => ex.type))].join(', ')}`,
			...(examples.some((ex) => ex.framework)
				? [
						`Frameworks: ${[...new Set(examples.filter((ex) => ex.framework).map((ex) => ex.framework))].join(', ')}`
					]
				: []),
			...(examples.some((ex) => ex.dependencies?.length)
				? ['Some examples may require additional dependencies']
				: [])
		]
	};
}

/**
 * Search components
 *
 * This tool searches for components based on keywords or functionality.
 * It returns a list of matching components with brief descriptions.
 *
 * @param params - Tool parameters
 * @param params.query - Search query
 * @returns List of matching components
 */
export async function searchComponents(
	params: Record<string, unknown>
): Promise<ComponentResponse[]> {
	// Validate parameters
	if (!params) {
		throw new Error(MCPErrorCode.INVALID_REQUEST + ': Parameters are required');
	}

	// Validate query parameter
	const query = params.query;
	if (query === undefined || query === null) {
		throw new Error(MCPErrorCode.INVALID_REQUEST + ': query parameter is required');
	}

	if (typeof query !== 'string') {
		throw new Error(MCPErrorCode.INVALID_REQUEST + ': query must be a string');
	}

	if (query.trim() === '') {
		throw new Error(MCPErrorCode.INVALID_REQUEST + ': query cannot be empty');
	}

	// Search for components
	const components = documentationStore.searchComponents(query.trim());

	// Return empty array if no components found
	if (components.length === 0) {
		// Get all available component names for suggestion
		const allComponents = documentationStore.getAllComponents();

		// If there are components in the store but none match the query,
		// provide some suggestions
		if (allComponents.length > 0) {
			const suggestions = allComponents
				.slice(0, 5)
				.map((c) => c.name)
				.join(', ');

			// Return a single response with suggestions
			return [
				{
					componentName: 'search-results',
					topic: 'search',
					content: `No components found matching "${query}". Try searching for: ${suggestions}`,
					additionalResources: [
						`Available categories: ${[...new Set(allComponents.filter((c) => c.category).map((c) => c.category))].join(', ')}`,
						'Try searching for component functionality or UI element type'
					]
				}
			];
		}

		return [];
	}

	// Format search results
	return components.map((component) => {
		const response: ComponentResponse = {
			componentName: component.name,
			topic: 'search',
			content: component.description,
			relatedComponents: component.relatedComponents
		};

		// Add category if available
		if (component.category) {
			response.content += `\n\nCategory: ${component.category}`;
		}

		// Add example count if available
		if (component.examples && component.examples.length > 0) {
			response.content += `\n\nExamples: ${component.examples.length}`;
		}

		// Add prop count if available
		if (component.props && component.props.length > 0) {
			response.content += `\n\nProps: ${component.props.length}`;
		}

		return response;
	});
}

/**
 * Get theming information
 *
 * This tool retrieves information about theming and customizing components.
 * It can provide component-specific theming information or general theming guidance.
 *
 * @param params - Tool parameters
 * @param params.componentName - Optional name of the component to retrieve theming information for
 * @returns Theming information response
 */
export async function getThemingInfo(params: Record<string, unknown>): Promise<ComponentResponse> {
	// Validate parameters
	if (!params) {
		throw new Error(MCPErrorCode.INVALID_REQUEST + ': Parameters are required');
	}

	// Validate componentName parameter if provided
	const componentName = params.componentName;
	if (componentName !== undefined && componentName !== null) {
		if (typeof componentName !== 'string') {
			throw new Error(MCPErrorCode.INVALID_REQUEST + ': componentName must be a string');
		}

		// If componentName is provided but empty, treat it as not provided
		if (componentName.trim() === '') {
			return getGeneralThemingInfo();
		}

		// Get component from documentation store
		const component = documentationStore.getComponent(componentName);
		if (!component) {
			// Try to find similar components for suggestion
			const similarComponents = documentationStore
				.searchComponents(componentName)
				.slice(0, 3)
				.map((c) => c.name);

			const suggestionMessage =
				similarComponents.length > 0
					? `Did you mean: ${similarComponents.join(', ')}?`
					: 'Try searching for another component.';

			throw new Error(
				MCPErrorCode.COMPONENT_NOT_FOUND +
					`: Component "${componentName}" not found. ${suggestionMessage}`
			);
		}

		// Check if component has theming information
		if (component.cssVariables.length === 0) {
			// Find components with theming information for suggestion
			const componentsWithTheming = documentationStore
				.getAllComponents()
				.filter((c) => c.cssVariables.length > 0)
				.slice(0, 3)
				.map((c) => c.name);

			const suggestionMessage =
				componentsWithTheming.length > 0
					? `Try these components with theming information: ${componentsWithTheming.join(', ')}`
					: '';

			throw new Error(
				MCPErrorCode.COMPONENT_NOT_FOUND +
					`: No theming information found for "${componentName}". ${suggestionMessage}`
			);
		}

		// Format component-specific theming information
		const themingExamples = component.examples.filter((ex) => ex.type === 'theming');

		let content = `# Theming information for ${component.name}\n\n`;
		content += `${component.name} can be customized using CSS variables and Tailwind CSS classes.\n\n`;

		content += `## CSS Variables\n\n`;
		content += `The following CSS variables can be customized for ${component.name}:\n\n`;

		// Add information about related components if this component's variables affect others
		const affectingOtherComponents = component.cssVariables.some(
			(v) => v.affectedComponents && v.affectedComponents.length > 0
		);
		if (affectingOtherComponents) {
			content += `Note: Some variables may affect other related components.\n\n`;
		}

		return {
			componentName: component.name,
			topic: 'theming',
			content: content,
			cssVariables: component.cssVariables,
			examples: themingExamples.length > 0 ? themingExamples : undefined,
			additionalResources: [
				'For more detailed theming information, refer to the shadcn-svelte documentation.',
				'https://shadcn-svelte.com/docs/theming'
			]
		};
	} else {
		// Return general theming information
		return getGeneralThemingInfo();
	}
}

/**
 * Get general theming information
 *
 * @returns General theming information response
 */
function getGeneralThemingInfo(): ComponentResponse {
	const content = `# General Theming Guidance for shadcn-svelte

shadcn-svelte components are styled using Tailwind CSS and CSS variables. You can customize themes by modifying CSS variables in your global CSS file or by extending your Tailwind CSS configuration.

## Theming Approaches

### 1. CSS Variables

You can customize the default theme by modifying CSS variables in your global CSS file:

\`\`\`css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 222.2 84% 4.9%;
  --radius: 0.5rem;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --card: 222.2 84% 4.9%;
  --card-foreground: 210 40% 98%;
  --popover: 222.2 84% 4.9%;
  --popover-foreground: 210 40% 98%;
  --primary: 210 40% 98%;
  --primary-foreground: 222.2 47.4% 11.2%;
  --secondary: 217.2 32.6% 17.5%;
  --secondary-foreground: 210 40% 98%;
  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%;
  --accent: 217.2 32.6% 17.5%;
  --accent-foreground: 210 40% 98%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 210 40% 98%;
  --border: 217.2 32.6% 17.5%;
  --input: 217.2 32.6% 17.5%;
  --ring: 212.7 26.8% 83.9%;
}
\`\`\`

### 2. Tailwind CSS Configuration

You can extend your Tailwind CSS configuration to add custom colors and other theme values:

\`\`\`js
// tailwind.config.js
module.exports = {
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        // Add more custom colors here
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
}
\`\`\`

## Dark Mode

shadcn-svelte supports dark mode out of the box. You can toggle between light and dark mode by adding or removing the \`dark\` class from the \`html\` element.

## Component-Specific Theming

Many components have their own specific CSS variables that can be customized. Use the \`getThemingInfo\` tool with a specific component name to get detailed theming information for that component.`;

	return {
		componentName: 'general',
		topic: 'theming',
		content: content,
		additionalResources: [
			'For more detailed theming information, refer to the shadcn-svelte documentation.',
			'https://shadcn-svelte.com/docs/theming',
			'Components with extensive theming options: Button, Card, Dialog, Input'
		]
	};
}

/**
 * Get troubleshooting information
 *
 * This tool retrieves troubleshooting information for common issues with components.
 * It can filter troubleshooting items by specific issue keywords.
 *
 * @param params - Tool parameters
 * @param params.componentName - Name of the component to retrieve troubleshooting information for
 * @param params.issue - Optional specific issue to troubleshoot
 * @returns Troubleshooting information response
 */
export async function getTroubleshooting(
	params: Record<string, unknown>
): Promise<ComponentResponse> {
	// Validate parameters
	if (!params) {
		throw new Error(MCPErrorCode.INVALID_REQUEST + ': Parameters are required');
	}

	// Validate componentName parameter
	const componentName = params.componentName;
	if (componentName === undefined || componentName === null) {
		throw new Error(MCPErrorCode.INVALID_REQUEST + ': componentName parameter is required');
	}

	if (typeof componentName !== 'string') {
		throw new Error(MCPErrorCode.INVALID_REQUEST + ': componentName must be a string');
	}

	if (componentName.trim() === '') {
		throw new Error(MCPErrorCode.INVALID_REQUEST + ': componentName cannot be empty');
	}

	// Validate issue parameter if provided
	const issue = params.issue;
	if (issue !== undefined && issue !== null) {
		if (typeof issue !== 'string') {
			throw new Error(MCPErrorCode.INVALID_REQUEST + ': issue must be a string');
		}
	}

	// Get component from documentation store
	const component = documentationStore.getComponent(componentName);
	if (!component) {
		// Try to find similar components for suggestion
		const similarComponents = documentationStore
			.searchComponents(componentName)
			.slice(0, 3)
			.map((c) => c.name);

		const suggestionMessage =
			similarComponents.length > 0
				? `Did you mean: ${similarComponents.join(', ')}?`
				: 'Try searching for another component.';

		throw new Error(
			MCPErrorCode.COMPONENT_NOT_FOUND +
				`: Component "${componentName}" not found. ${suggestionMessage}`
		);
	}

	// Filter troubleshooting items by issue if specified
	let troubleshootingItems = component.troubleshooting;
	const issueStr = issue as string | undefined;

	if (issueStr && issueStr.trim() !== '') {
		troubleshootingItems = troubleshootingItems.filter((item) =>
			item.issue.toLowerCase().includes(issueStr.toLowerCase())
		);
	}

	// Check if any troubleshooting items match the criteria
	if (troubleshootingItems.length === 0) {
		// Find components with troubleshooting information for suggestion
		const componentsWithTroubleshooting = documentationStore
			.getAllComponents()
			.filter((c) => c.troubleshooting.length > 0)
			.slice(0, 3)
			.map((c) => c.name);

		// If the component has troubleshooting items but none match the issue
		if (component.troubleshooting.length > 0 && issueStr) {
			const availableIssues = component.troubleshooting.map((item) => `"${item.issue}"`).join(', ');

			throw new Error(
				MCPErrorCode.COMPONENT_NOT_FOUND +
					`: No troubleshooting information found for "${componentName}" related to "${issueStr}". ` +
					`Available issues: ${availableIssues}`
			);
		}

		// If the component has no troubleshooting items at all
		const suggestionMessage =
			componentsWithTroubleshooting.length > 0
				? `Try these components with troubleshooting information: ${componentsWithTroubleshooting.join(', ')}`
				: 'No components have troubleshooting information available.';

		throw new Error(
			MCPErrorCode.COMPONENT_NOT_FOUND +
				`: No troubleshooting information found for "${componentName}". ${suggestionMessage}`
		);
	}

	// Format the response
	let content = `# Troubleshooting ${component.name}\n\n`;

	if (issueStr) {
		content += `Issues related to "${issueStr}":\n\n`;
	}

	// Add each troubleshooting item to the content
	troubleshootingItems.forEach((item, index) => {
		content += `## Issue ${index + 1}: ${item.issue}\n\n`;
		content += `**Solution:** ${item.solution}\n\n`;

		if (item.relatedProps && item.relatedProps.length > 0) {
			content += `**Related Props:** ${item.relatedProps.join(', ')}\n\n`;
		}

		if (item.errorCode) {
			content += `**Error Code:** ${item.errorCode}\n\n`;
		}

		if (item.affectedVersions && item.affectedVersions.length > 0) {
			content += `**Affected Versions:** ${item.affectedVersions.join(', ')}\n\n`;
		}

		if (item.fixedInVersion) {
			content += `**Fixed In Version:** ${item.fixedInVersion}\n\n`;
		}
	});

	return {
		componentName: component.name,
		topic: 'troubleshooting',
		content: content,
		troubleshooting: troubleshootingItems,
		additionalResources: [
			'For more detailed troubleshooting information, refer to the shadcn-svelte documentation.',
			'https://shadcn-svelte.com/docs/troubleshooting',
			`Total troubleshooting items: ${troubleshootingItems.length}`
		]
	};
}
