import { vi } from 'vitest';
import { mockMcpServer, mockDocumentationStore, mockMcpTools } from './page.svelte.test-setup';
import { createMockWithMissingData } from './page.svelte.test-utils';

// Mock the imported modules - these must be at the top level
vi.mock('$lib/mcp/core/init', () => ({
	mcpServer: mockMcpServer
}));

vi.mock('$lib/mcp/core/documentation-store', () => ({
	documentationStore: mockDocumentationStore
}));

vi.mock('$lib/mcp/tools', () => ({
	mcpTools: mockMcpTools
}));

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import HomePage from './+page.svelte';

describe('+page.svelte', () => {
	// Clean up after each test
	afterEach(() => {
		cleanup();
		vi.clearAllMocks();

		// Reset mocks to their original implementation
		vi.mock('$lib/mcp/core/init', () => ({
			mcpServer: mockMcpServer
		}));

		vi.mock('$lib/mcp/core/documentation-store', () => ({
			documentationStore: mockDocumentationStore
		}));

		vi.mock('$lib/mcp/tools', () => ({
			mcpTools: mockMcpTools
		}));
	});

	beforeEach(() => {
		// Render the component before each test
		render(HomePage);
	});

	// 1. Basic Home Page Rendering Tests
	describe('Server Information Display', () => {
		it('should render the page with correct title', () => {
			expect(document.title).toBe('shadcn-svelte MCP Server');
		});

		it('should display server information', () => {
			expect(screen.getByText('shadcn-svelte MCP Server')).toBeTruthy();
			expect(screen.getByText('MCP server for shadcn-svelte component documentation')).toBeTruthy();
			expect(screen.getByText('Version: 1.0.0')).toBeTruthy();
		});

		it('should call the mcpServer.getServerInfo method', () => {
			expect(mockMcpServer.getServerInfo).toHaveBeenCalled();
		});
	});

	// 2. Main Sections Presence Tests
	describe('Main Sections Presence', () => {
		it('should display the About section', () => {
			expect(screen.getByText('About')).toBeTruthy();
		});

		it('should display the Installation section', () => {
			expect(screen.getByText('Installation')).toBeTruthy();
		});

		it('should display the Usage Examples section', () => {
			expect(screen.getByText('Usage Examples')).toBeTruthy();
		});

		it('should display the Integration with AI Assistants section', () => {
			expect(screen.getByText('Integration with AI Assistants')).toBeTruthy();
		});

		it('should display the Server Capabilities section', () => {
			expect(screen.getByText('Server Capabilities')).toBeTruthy();
		});

		it('should display the Documentation Store section', () => {
			expect(screen.getByText('Documentation Store')).toBeTruthy();
		});

		it('should display the API Endpoints section', () => {
			expect(screen.getByText('API Endpoints')).toBeTruthy();
		});

		it('should display the Available Tools section', () => {
			expect(screen.getByText('Available Tools')).toBeTruthy();
		});

		it('should display the Deployment section', () => {
			expect(screen.getByText('Deployment')).toBeTruthy();
		});

		it('should display the Getting Started section', () => {
			expect(screen.getByText('Getting Started')).toBeTruthy();
		});
	});

	// 3. Component Documentation Display Tests
	describe('Component Documentation Display', () => {
		it('should display the component list', () => {
			expect(screen.getByText('Available Components')).toBeTruthy();
			expect(screen.getByText('Button')).toBeTruthy();
			expect(screen.getByText('Card')).toBeTruthy();
			expect(screen.getByText('Input')).toBeTruthy();
			expect(screen.getByText('Checkbox')).toBeTruthy();
			expect(screen.getByText('Container')).toBeTruthy();
		});

		it('should display the component categories', () => {
			expect(screen.getByText('Component Categories')).toBeTruthy();
			expect(screen.getByText('ui')).toBeTruthy();
			expect(screen.getByText('form')).toBeTruthy();
			expect(screen.getByText('layout')).toBeTruthy();
		});

		it('should display documentation statistics', () => {
			expect(screen.getByText('Statistics')).toBeTruthy();
			expect(screen.getByText(/Total Components: 5/)).toBeTruthy();
			expect(screen.getByText(/Total Categories: 3/)).toBeTruthy();
			expect(screen.getByText(/Total Installation Guides: 2/)).toBeTruthy();
		});

		it('should group components by category', () => {
			// Check that ui category contains Button and Card
			const uiSection = screen.getByText('ui').closest('div');
			expect(uiSection).toBeTruthy();
			if (uiSection) {
				expect(uiSection.textContent).toContain('Button');
				expect(uiSection.textContent).toContain('Card');
			}

			// Check that form category contains Input and Checkbox
			const formSection = screen.getByText('form').closest('div');
			expect(formSection).toBeTruthy();
			if (formSection) {
				expect(formSection.textContent).toContain('Input');
				expect(formSection.textContent).toContain('Checkbox');
			}
		});
	});

	// 4. Installation Guide Display Tests
	describe('Installation Guide Display', () => {
		it('should display the installation guides section', () => {
			expect(screen.getByText('Installation Guides')).toBeTruthy();
		});

		it('should display framework names', () => {
			expect(screen.getByText('sveltekit')).toBeTruthy();
			expect(screen.getByText('vite')).toBeTruthy();
		});

		it('should display framework requirements', () => {
			expect(screen.getByText(/Requirements: Node.js 18\+/)).toBeTruthy();
		});
	});

	// 5. Server Capabilities Display Tests
	describe('Server Capabilities Display', () => {
		it('should display the server capabilities section', () => {
			expect(screen.getByText('Supported Capabilities')).toBeTruthy();
		});

		it('should list all capabilities', () => {
			expect(screen.getByText('component-info')).toBeTruthy();
			expect(screen.getByText('examples')).toBeTruthy();
			expect(screen.getByText('search')).toBeTruthy();
		});
	});

	// 6. MCP Tools Display Tests
	describe('MCP Tools Display', () => {
		it('should display the MCP tools section', () => {
			expect(screen.getByText('Available Tools')).toBeTruthy();
		});

		it('should list all tools with their descriptions', () => {
			expect(screen.getByText(/getComponentInfo/)).toBeTruthy();
			expect(screen.getByText(/Get information about a component/)).toBeTruthy();
			expect(screen.getByText(/getComponentExample/)).toBeTruthy();
			expect(screen.getByText(/Get examples for a component/)).toBeTruthy();
			expect(screen.getByText(/searchComponents/)).toBeTruthy();
			expect(screen.getByText(/Search for components/)).toBeTruthy();
		});
	});

	// 7. Documentation Store Method Calls
	describe('Documentation Store Method Calls', () => {
		it('should call the documentationStore methods', () => {
			expect(mockDocumentationStore.getStats).toHaveBeenCalled();
			expect(mockDocumentationStore.getAllComponents).toHaveBeenCalled();
			expect(mockDocumentationStore.getAllCategories).toHaveBeenCalled();
			expect(mockDocumentationStore.getAllInstallationGuides).toHaveBeenCalled();
		});
	});

	// 8. Footer Display Test
	describe('Footer Display', () => {
		it('should display the footer with current year', () => {
			const currentYear = new Date().getFullYear();
			expect(screen.getByText(`shadcn-svelte MCP Server © ${currentYear}`)).toBeTruthy();
		});
	});

	// 9. Error Handling Tests
	describe('Error Handling', () => {
		// Test handling of missing server data
		describe('Missing Server Data', () => {
			beforeEach(() => {
				cleanup();
				// Mock server with missing data
				const mockServerWithMissingData = createMockWithMissingData('server');
				vi.mock('$lib/mcp/core/init', () => ({
					mcpServer: mockServerWithMissingData
				}));

				// Re-render with missing data
				render(HomePage);
			});

			it('should handle missing server name gracefully', () => {
				// The page should still render without errors
				expect(document.body.textContent).toBeTruthy();
				// The server description should still be displayed
				expect(
					screen.getByText('MCP server for shadcn-svelte component documentation')
				).toBeTruthy();
			});
		});

		// Test handling of empty component lists
		describe('Empty Component Lists', () => {
			beforeEach(() => {
				cleanup();
				// Mock documentation store with empty data
				const mockEmptyStore = createMockWithMissingData('store');
				vi.mock('$lib/mcp/core/documentation-store', () => ({
					documentationStore: mockEmptyStore
				}));

				// Re-render with empty data
				render(HomePage);
			});

			it('should handle empty component list gracefully', () => {
				// The page should still render without errors
				expect(document.body.textContent).toBeTruthy();
				// The component section should still be displayed
				expect(screen.getByText('Available Components')).toBeTruthy();
				// Statistics should show zero values
				expect(screen.getByText('Total Components: 0')).toBeTruthy();
				expect(screen.getByText('Total Categories: 0')).toBeTruthy();
			});
		});

		// Test handling of empty tools list
		describe('Empty Tools List', () => {
			beforeEach(() => {
				cleanup();
				// Mock empty tools list
				vi.mock('$lib/mcp/tools', () => ({
					mcpTools: []
				}));

				// Re-render with empty tools
				render(HomePage);
			});

			it('should handle empty tools list gracefully', () => {
				// The page should still render without errors
				expect(document.body.textContent).toBeTruthy();
				// The tools section should still be displayed
				expect(screen.getByText('Available Tools')).toBeTruthy();
			});
		});
	});
});
