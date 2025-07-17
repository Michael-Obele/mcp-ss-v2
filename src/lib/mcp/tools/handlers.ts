import type { ComponentResponse } from '../core/types';
import { documentationStore } from '../core/documentation-store';
import { MCPErrorCode } from '../core/server';

export async function getComponentInfo(
	params: Record<string, unknown>
): Promise<ComponentResponse> {
	const componentName = params.componentName as string;
	if (!componentName) {
		throw new Error(MCPErrorCode.INVALID_REQUEST + ': componentName parameter is required');
	}

	const component = documentationStore.getComponent(componentName);
	if (!component) {
		throw new Error(MCPErrorCode.COMPONENT_NOT_FOUND + `: Component ${componentName} not found`);
	}

	return {
		componentName: component.name,
		topic: 'info',
		content: component.description + '\n\nUsage: ' + component.usage,
		props: component.props,
		examples: component.examples,
		relatedComponents: component.relatedComponents,
		cssVariables: component.cssVariables,
		troubleshooting: component.troubleshooting
	};
}

export async function getComponentExample(
	params: Record<string, unknown>
): Promise<ComponentResponse> {
	const componentName = params.componentName as string;
	const exampleType = params.exampleType as string | undefined;

	if (!componentName) {
		throw new Error(MCPErrorCode.INVALID_REQUEST + ': componentName parameter is required');
	}

	const component = documentationStore.getComponent(componentName);
	if (!component) {
		throw new Error(MCPErrorCode.COMPONENT_NOT_FOUND + `: Component ${componentName} not found`);
	}

	let examples = component.examples;
	if (exampleType) {
		examples = examples.filter((example) => example.type === exampleType);
	}

	if (examples.length === 0) {
		throw new Error(
			MCPErrorCode.COMPONENT_NOT_FOUND +
				`: No examples found for ${componentName}` +
				(exampleType ? ` with type ${exampleType}` : '')
		);
	}

	return {
		componentName: component.name,
		topic: 'examples',
		content: `Examples for ${component.name}` + (exampleType ? ` (${exampleType})` : ''),
		examples: examples
	};
}

export async function searchComponents(
	params: Record<string, unknown>
): Promise<ComponentResponse[]> {
	const query = params.query as string;
	if (!query) {
		throw new Error(MCPErrorCode.INVALID_REQUEST + ': query parameter is required');
	}

	const components = documentationStore.searchComponents(query);
	if (components.length === 0) {
		return [];
	}

	return components.map((component) => ({
		componentName: component.name,
		topic: 'search',
		content: component.description,
		relatedComponents: component.relatedComponents
	}));
}

export async function getThemingInfo(params: Record<string, unknown>): Promise<ComponentResponse> {
	const componentName = params.componentName as string | undefined;

	if (componentName) {
		const component = documentationStore.getComponent(componentName);
		if (!component) {
			throw new Error(MCPErrorCode.COMPONENT_NOT_FOUND + `: Component ${componentName} not found`);
		}
		if (component.cssVariables.length === 0) {
			throw new Error(
				MCPErrorCode.COMPONENT_NOT_FOUND + `: No theming information found for ${componentName}`
			);
		}
		return {
			componentName: component.name,
			topic: 'theming',
			content: `Theming information for ${component.name}`,
			cssVariables: component.cssVariables
		};
	} else {
		// General theming information (placeholder for now)
		return {
			componentName: 'general',
			topic: 'theming',
			content:
				'General theming guidance: shadcn-svelte components are styled using Tailwind CSS and CSS variables. You can customize themes by modifying CSS variables in your global CSS file or by extending your Tailwind CSS configuration. Refer to the official shadcn-svelte documentation for detailed theming guides.'
		};
	}
}

export async function getTroubleshooting(
	params: Record<string, unknown>
): Promise<ComponentResponse> {
	const componentName = params.componentName as string;
	const issue = params.issue as string | undefined;

	if (!componentName) {
		throw new Error(MCPErrorCode.INVALID_REQUEST + ': componentName parameter is required');
	}

	const component = documentationStore.getComponent(componentName);
	if (!component) {
		throw new Error(MCPErrorCode.COMPONENT_NOT_FOUND + `: Component ${componentName} not found`);
	}

	let troubleshootingItems = component.troubleshooting;
	if (issue) {
		troubleshootingItems = troubleshootingItems.filter((item) =>
			item.issue.toLowerCase().includes(issue.toLowerCase())
		);
	}

	if (troubleshootingItems.length === 0) {
		throw new Error(
			MCPErrorCode.COMPONENT_NOT_FOUND +
				`: No troubleshooting information found for ${componentName}` +
				(issue ? ` for issue "${issue}"` : '')
		);
	}

	return {
		componentName: component.name,
		topic: 'troubleshooting',
		content:
			`Troubleshooting information for ${component.name}` + (issue ? ` related to "${issue}"` : ''),
		troubleshooting: troubleshootingItems
	};
}
