/**
 * MCP Resource Loader
 *
 * This file provides utilities for loading documentation resources for the MCP server.
 */

import type { MCPResource } from '../core/types';
import { documentationStore } from '../core/documentation-store';
import {
	getComponentDocumentation,
	getComponentDetails,
	getComponentsByCategory,
	type ComponentFilterParams,
	type PaginationParams
} from './component-resources';
import {
	getInstallationGuides,
	getInstallationSteps,
	getInstallationTroubleshooting,
	getInstallationRequirements,
	type InstallationGuideParams
} from './installation-resources';

/**
 * List of all available documentation resources
 */
export const documentationResources: MCPResource[] = [
	{
		name: 'components',
		description: 'Component documentation with filtering and pagination',
		path: '/components'
	},
	{
		name: 'component',
		description: 'Detailed information about a specific component',
		path: '/component/:componentName'
	},
	{
		name: 'categories',
		description: 'Component categories',
		path: '/categories'
	},
	{
		name: 'category-components',
		description: 'Components in a specific category with pagination',
		path: '/categories/:categoryName/components'
	},
	{
		name: 'installation-guides',
		description: 'Installation guides',
		path: '/installation-guides'
	},
	{
		name: 'examples',
		description: 'Component examples',
		path: '/examples'
	},
	{
		name: 'theming',
		description: 'Theming documentation',
		path: '/theming'
	},
	{
		name: 'troubleshooting',
		description: 'Troubleshooting guides',
		path: '/troubleshooting'
	}
];

/**
 * Load a documentation resource
 *
 * @param resourceName Name of the resource to load
 * @param params Optional parameters for the resource
 * @returns The loaded resource content
 */
export async function loadResource(
	resourceName: string,
	params?: Record<string, unknown>
): Promise<any | null> {
	switch (resourceName) {
		case 'components':
			// Enhanced component resource with filtering and pagination
			return getComponentDocumentation(params as ComponentFilterParams);

		case 'component':
			// Get detailed information about a specific component
			const componentName = params?.componentName as string;
			if (!componentName) {
				return { error: 'Component name is required' };
			}
			return getComponentDetails(componentName);

		case 'categories':
			// Get all categories or a specific category
			const categoryName = params?.categoryName as string;
			if (categoryName) {
				return documentationStore.getCategory(categoryName);
			}
			return documentationStore.getAllCategories();

		case 'category-components':
			// Get components in a specific category with pagination
			const catName = params?.categoryName as string;
			if (!catName) {
				return { error: 'Category name is required' };
			}
			return getComponentsByCategory(catName, params as PaginationParams);

		case 'installation-guides':
			// Enhanced installation guide resource with filtering
			return getInstallationGuides(params as InstallationGuideParams);

		case 'examples':
			// This resource is meant to be used with specific component examples,
			// so componentName is required.
			const exampleComponentName = params?.componentName as string;
			const exampleType = params?.exampleType as string;
			if (exampleComponentName) {
				const component = documentationStore.getComponent(exampleComponentName);
				if (component) {
					if (exampleType) {
						return component.examples.filter((e) => e.type === exampleType);
					}
					return component.examples;
				}
			}
			return { error: 'Component name is required for examples' };

		case 'theming':
			const themingComponentName = params?.componentName as string;
			if (themingComponentName) {
				const component = documentationStore.getComponent(themingComponentName);
				return component ? component.cssVariables : null;
			}
			// Return general theming info if no component specified (placeholder)
			return 'General theming guidance: shadcn-svelte components are styled using Tailwind CSS and CSS variables. You can customize themes by modifying CSS variables in your global CSS file or by extending your Tailwind CSS configuration. Refer to the official shadcn-svelte documentation for detailed theming guides.';

		case 'troubleshooting':
			const troubleshootingComponentName = params?.componentName as string;
			const issue = params?.issue as string;
			if (troubleshootingComponentName) {
				const component = documentationStore.getComponent(troubleshootingComponentName);
				if (component) {
					if (issue) {
						return component.troubleshooting.filter((t) =>
							t.issue.toLowerCase().includes(issue.toLowerCase())
						);
					}
					return component.troubleshooting;
				}
			}
			return { error: 'Component name is required for troubleshooting' };

		default:
			return null;
	}
}
