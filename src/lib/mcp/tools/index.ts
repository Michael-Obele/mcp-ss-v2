/**
 * MCP Tools
 *
 * This file exports all the MCP tools available in the shadcn-svelte MCP server.
 * Tools will be implemented in future tasks.
 */

import type { MCPTool } from '../core/types';

/**
 * List of all available MCP tools
 * These will be implemented in future tasks
 */
export const mcpTools: MCPTool[] = [
	{
		name: 'getComponentInfo',
		description: 'Retrieves general information about a specific component',
		parameters: {
			componentName: {
				type: 'string',
				description: 'Name of the component to retrieve information for'
			}
		}
	},
	{
		name: 'getComponentExample',
		description: 'Retrieves code examples for a specific component',
		parameters: {
			componentName: {
				type: 'string',
				description: 'Name of the component to retrieve examples for'
			},
			exampleType: {
				type: 'string',
				description: 'Type of example to retrieve (basic, advanced, theming, etc.)',
				required: false
			}
		}
	},
	{
		name: 'searchComponents',
		description: 'Searches for components based on keywords or functionality',
		parameters: {
			query: {
				type: 'string',
				description: 'Search query'
			}
		}
	},
	{
		name: 'getThemingInfo',
		description: 'Retrieves information about theming and customizing components',
		parameters: {
			componentName: {
				type: 'string',
				description: 'Name of the component to retrieve theming information for',
				required: false
			}
		}
	},
	{
		name: 'getTroubleshooting',
		description: 'Retrieves troubleshooting information for common issues',
		parameters: {
			componentName: {
				type: 'string',
				description: 'Name of the component to retrieve troubleshooting information for'
			},
			issue: {
				type: 'string',
				description: 'Specific issue to troubleshoot',
				required: false
			}
		}
	}
];
