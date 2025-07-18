import { render, screen, type RenderResult, cleanup } from '@testing-library/svelte';
import HomePage from './+page.svelte';
import { mockMcpServer, mockDocumentationStore, mockMcpTools } from './page.svelte.test-setup';
import { vi } from 'vitest';

/**
 * Setup function for rendering the home page with mocks
 * @returns RenderResult with additional utilities
 */
export function setupHomePageTest(): RenderResult<any> {
	// Mock the imported modules
	vi.mock('$lib/mcp/core/init', () => ({
		mcpServer: mockMcpServer
	}));

	vi.mock('$lib/mcp/core/documentation-store', () => ({
		documentationStore: mockDocumentationStore
	}));

	vi.mock('$lib/mcp/tools', () => ({
		mcpTools: mockMcpTools
	}));

	// Render the component
	return render(HomePage);
}

/**
 * Verify that a section exists on the page
 * @param sectionTitle The title of the section to verify
 * @returns Boolean indicating if the section exists
 */
export function verifySection(sectionTitle: string): boolean {
	try {
		const element = screen.getByText(sectionTitle);
		return !!element;
	} catch (error) {
		return false;
	}
}

/**
 * Verify that a component is displayed in a specific category
 * @param componentName The name of the component to verify
 * @param categoryName The name of the category the component should be in
 * @returns Boolean indicating if the component is in the category
 */
export function verifyComponentInCategory(componentName: string, categoryName: string): boolean {
	try {
		const categorySection = screen.getByText(categoryName).closest('div');
		if (!categorySection) return false;
		return categorySection.textContent?.includes(componentName) || false;
	} catch (error) {
		return false;
	}
}

/**
 * Verify that statistics match expected values
 * @param stats Object containing expected statistics values
 * @returns Object with boolean results for each statistic
 */
export function verifyStatistics(stats: {
	totalComponents?: number;
	totalCategories?: number;
	totalInstallationGuides?: number;
	componentsWithExamples?: number;
	componentsWithTroubleshooting?: number;
}): Record<string, boolean> {
	const results: Record<string, boolean> = {};

	if (stats.totalComponents !== undefined) {
		try {
			screen.getByText(`Total Components: ${stats.totalComponents}`);
			results.totalComponents = true;
		} catch (error) {
			results.totalComponents = false;
		}
	}

	if (stats.totalCategories !== undefined) {
		try {
			screen.getByText(`Total Categories: ${stats.totalCategories}`);
			results.totalCategories = true;
		} catch (error) {
			results.totalCategories = false;
		}
	}

	if (stats.totalInstallationGuides !== undefined) {
		try {
			screen.getByText(`Total Installation Guides: ${stats.totalInstallationGuides}`);
			results.totalInstallationGuides = true;
		} catch (error) {
			results.totalInstallationGuides = false;
		}
	}

	if (stats.componentsWithExamples !== undefined) {
		try {
			screen.getByText(`Components with Examples: ${stats.componentsWithExamples}`);
			results.componentsWithExamples = true;
		} catch (error) {
			results.componentsWithExamples = false;
		}
	}

	if (stats.componentsWithTroubleshooting !== undefined) {
		try {
			screen.getByText(`Components with Troubleshooting: ${stats.componentsWithTroubleshooting}`);
			results.componentsWithTroubleshooting = true;
		} catch (error) {
			results.componentsWithTroubleshooting = false;
		}
	}

	return results;
}

/**
 * Create a mock with missing data to test error handling
 * @param type The type of mock to create (server, store, tools)
 * @returns The mock object with missing data
 */
export function createMockWithMissingData(type: 'server' | 'store' | 'tools') {
	switch (type) {
		case 'server':
			return {
				getServerInfo: vi.fn().mockReturnValue({
					// Missing name
					description: 'MCP server for shadcn-svelte component documentation',
					// Missing version
					capabilities: []
				})
			};
		case 'store':
			return {
				getStats: vi.fn().mockReturnValue({
					totalComponents: 0,
					totalCategories: 0,
					totalInstallationGuides: 0,
					componentsWithExamples: 0,
					componentsWithTroubleshooting: 0
				}),
				getAllComponents: vi.fn().mockReturnValue([]),
				getAllCategories: vi.fn().mockReturnValue([]),
				getAllInstallationGuides: vi.fn().mockReturnValue([]),
				getComponentsByCategory: vi.fn().mockReturnValue([]),
				getInstallationGuide: vi.fn().mockReturnValue(null)
			};
		case 'tools':
			return [];
		default:
			return {};
	}
}
/**
 * Setup function for testing with custom mocks
 * @param options Options for custom mocks
 * @returns RenderResult with additional utilities
 */
export function setupCustomMockTest(options: {
	serverMock?: any;
	storeMock?: any;
	toolsMock?: any;
}): RenderResult<typeof HomePage> {
	// Clean up previous renders
	cleanup();

	// Reset mocks
	vi.clearAllMocks();

	// Apply custom mocks if provided
	if (options.serverMock) {
		vi.mock('$lib/mcp/core/init', () => ({
			mcpServer: options.serverMock
		}));
	}

	if (options.storeMock) {
		vi.mock('$lib/mcp/core/documentation-store', () => ({
			documentationStore: options.storeMock
		}));
	}

	if (options.toolsMock) {
		vi.mock('$lib/mcp/tools', () => ({
			mcpTools: options.toolsMock
		}));
	}

	// Render the component
	return render(HomePage);
}

/**
 * Verify that all sections are present on the page
 * @returns Object with boolean results for each section
 */
export function verifyAllSections(): Record<string, boolean> {
	const sections = [
		'About',
		'Installation',
		'Usage Examples',
		'Integration with AI Assistants',
		'Server Capabilities',
		'Documentation Store',
		'API Endpoints',
		'Available Tools',
		'Deployment',
		'Getting Started'
	];

	const results: Record<string, boolean> = {};

	for (const section of sections) {
		results[section] = verifySection(section);
	}

	return results;
}

/**
 * Verify that all components are displayed
 * @param components Array of component names to verify
 * @returns Boolean indicating if all components are displayed
 */
export function verifyAllComponents(components: string[]): boolean {
	for (const component of components) {
		try {
			screen.getByText(component);
		} catch (error) {
			return false;
		}
	}

	return true;
}

/**
 * Verify that all categories are displayed
 * @param categories Array of category names to verify
 * @returns Boolean indicating if all categories are displayed
 */
export function verifyAllCategories(categories: string[]): boolean {
	for (const category of categories) {
		try {
			screen.getByText(category);
		} catch (error) {
			return false;
		}
	}

	return true;
}

/**
 * Verify that all tools are displayed
 * @param tools Array of tool names to verify
 * @returns Boolean indicating if all tools are displayed
 */
export function verifyAllTools(tools: { name: string; description: string }[]): boolean {
	for (const tool of tools) {
		try {
			screen.getByText(new RegExp(tool.name));
			screen.getByText(new RegExp(tool.description));
		} catch (error) {
			return false;
		}
	}

	return true;
}
