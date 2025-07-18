/**
 * Tests for MCP Server Initialization
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { documentationStore } from './documentation-store.js';
import { initMCPServer } from './init.js';
import { getInitialData } from './initial-data.js';

// Mock console.log and console.error to avoid cluttering test output
vi.spyOn(console, 'log').mockImplementation(() => {});
vi.spyOn(console, 'error').mockImplementation(() => {});

describe('MCP Server Initialization', () => {
	// Reset the documentation store before each test
	beforeEach(() => {
		documentationStore.clear();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it('should initialize the server with the correct configuration', () => {
		const server = initMCPServer();

		expect(server).toBeDefined();
		const serverInfo = server.getServerInfo();
		expect(serverInfo.name).toBe('shadcn-svelte-mcp');
		expect(serverInfo.version).toBeDefined();
		expect(serverInfo.description).toBeDefined();
		expect(serverInfo.capabilities).toBeInstanceOf(Array);
	});

	it('should populate the documentation store with initial data', () => {
		initMCPServer();

		const initialData = getInitialData();
		const stats = documentationStore.getStats();

		// Check that all components were added
		expect(stats.totalComponents).toBe(initialData.components.length);

		// Check that all categories were added
		expect(stats.totalCategories).toBe(initialData.categories.length);

		// Check that all installation guides were added
		expect(stats.totalInstallationGuides).toBe(initialData.installationGuides.length);
	});

	it('should validate components before adding them to the store', () => {
		// Create a spy on the validateComponent function
		const validateSpy = vi.spyOn(documentationStore, 'addComponent');

		initMCPServer();

		// Check that addComponent was called for each component
		expect(validateSpy).toHaveBeenCalledTimes(getInitialData().components.length);
	});

	it('should be able to retrieve components by name', () => {
		initMCPServer();

		// Check that we can retrieve the Button component
		const button = documentationStore.getComponent('Button');
		expect(button).toBeDefined();
		expect(button?.name).toBe('Button');

		// Check that we can retrieve the Input component
		const input = documentationStore.getComponent('Input');
		expect(input).toBeDefined();
		expect(input?.name).toBe('Input');
	});

	it('should be able to retrieve components by category', () => {
		initMCPServer();

		// Check that we can retrieve form components
		const formComponents = documentationStore.getComponentsByCategory('form');
		expect(formComponents.length).toBeGreaterThan(0);
		expect(formComponents.some((c) => c.name === 'Button')).toBe(true);
		expect(formComponents.some((c) => c.name === 'Input')).toBe(true);

		// Check that we can retrieve layout components
		const layoutComponents = documentationStore.getComponentsByCategory('layout');
		expect(layoutComponents.length).toBeGreaterThan(0);
		expect(layoutComponents.some((c) => c.name === 'Card')).toBe(true);
	});

	it('should be able to retrieve installation guides by framework', () => {
		initMCPServer();

		// Check that we can retrieve the SvelteKit installation guide
		const svelteKitGuide = documentationStore.getInstallationGuide('sveltekit');
		expect(svelteKitGuide).toBeDefined();
		expect(svelteKitGuide?.framework).toBe('sveltekit');

		// Check that we can retrieve the Vite installation guide
		const viteGuide = documentationStore.getInstallationGuide('vite');
		expect(viteGuide).toBeDefined();
		expect(viteGuide?.framework).toBe('vite');
	});

	it('should be able to search components', () => {
		initMCPServer();

		// Search for components by name
		const buttonResults = documentationStore.searchComponents('Button');
		expect(buttonResults.length).toBeGreaterThan(0);
		expect(buttonResults[0].name).toBe('Button');

		// Search for components by description
		const cardResults = documentationStore.searchComponents('container');
		expect(cardResults.length).toBeGreaterThan(0);
		expect(cardResults.some((c) => c.name === 'Card')).toBe(true);
	});
});
