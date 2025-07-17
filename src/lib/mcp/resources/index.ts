/**
 * MCP Resource Loader
 *
 * This file provides utilities for loading documentation resources for the MCP server.
 * It will be implemented in future tasks.
 */

import type { MCPResource } from '../core/types';
import { documentationStore } from '../core/documentation-store';

/**
 * List of all available documentation resources
 * These will be implemented in future tasks
 */
export const documentationResources: MCPResource[] = [
	{
		name: 'components',
		description: 'Component documentation',
		path: '/components' // Updated path to reflect API endpoint
	},
	{
		name: 'categories',
		description: 'Component categories',
		path: '/categories' // Updated path to reflect API endpoint
	},
	{
		name: 'installation-guides',
		description: 'Installation guides',
		path: '/installation-guides' // Updated path to reflect API endpoint
	},
	{
		name: 'examples',
		description: 'Component examples',
		path: '/examples' // New resource for specific example retrieval
	},
	{
		name: 'theming',
		description: 'Theming documentation',
		path: '/theming' // Updated path to reflect API endpoint
	},
	{
		name: 'troubleshooting',
		description: 'Troubleshooting guides',
		path: '/troubleshooting' // Updated path to reflect API endpoint
	}
];

/**
 * Load a documentation resource
 *
 * @param resourceName Name of the resource to load
 * @returns The loaded resource content
 */
export async function loadResource(resourceName: string, params?: Record<string, unknown>): Promise<any | null> {
    switch (resourceName) {
        case 'components':
            const componentName = params?.componentName as string;
            if (componentName) {
                return documentationStore.getComponent(componentName);
            }
            return documentationStore.getAllComponents();
        case 'categories':
            const categoryName = params?.categoryName as string;
            if (categoryName) {
                return documentationStore.getCategory(categoryName);
            }
            return documentationStore.getAllCategories();
        case 'installation-guides':
            const framework = params?.framework as string;
            if (framework) {
                return documentationStore.getInstallationGuide(framework);
            }
            return documentationStore.getAllInstallationGuides();
        case 'examples':
            // This resource is meant to be used with specific component examples,
            // so componentName is required.
            const exampleComponentName = params?.componentName as string;
            const exampleType = params?.exampleType as string;
            if (exampleComponentName) {
                const component = documentationStore.getComponent(exampleComponentName);
                if (component) {
                    if (exampleType) {
                        return component.examples.filter(e => e.type === exampleType);
                    }
                    return component.examples;
                }
            }
            return null; // Or throw an error for invalid request
        case 'theming':
            const themingComponentName = params?.componentName as string;
            if (themingComponentName) {
                const component = documentationStore.getComponent(themingComponentName);
                return component ? component.cssVariables : null;
            }
            // Return general theming info if no component specified (placeholder)
            return "General theming guidance: shadcn-svelte components are styled using Tailwind CSS and CSS variables. You can customize themes by modifying CSS variables in your global CSS file or by extending your Tailwind CSS configuration. Refer to the official shadcn-svelte documentation for detailed theming guides.";
        case 'troubleshooting':
            const troubleshootingComponentName = params?.componentName as string;
            const issue = params?.issue as string;
            if (troubleshootingComponentName) {
                const component = documentationStore.getComponent(troubleshootingComponentName);
                if (component) {
                    if (issue) {
                        return component.troubleshooting.filter(t => t.issue.toLowerCase().includes(issue.toLowerCase()));
                    }
                    return component.troubleshooting;
                }
            }
            return null; // Or throw an error for invalid request
        default:
            return null;
    }
}