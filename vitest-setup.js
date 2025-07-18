// Import jest-dom matchers
import '@testing-library/jest-dom/vitest';

// Configure testing-library/svelte for Svelte 5
import { configure } from '@testing-library/svelte';

configure({
	testIdAttribute: 'data-testid'
	// Add any other configuration options needed for Svelte 5
});

// Add any global mocks or setup needed for all tests
import { vi } from 'vitest';

// Mock console methods to reduce noise in test output
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleLog = console.log;

// Replace console methods with mocked versions
console.error = vi.fn((...args) => {
	// Filter out certain expected errors during testing
	const errorMessage = args.join(' ');
	if (
		errorMessage.includes('Warning:') ||
		errorMessage.includes('Error:') ||
		errorMessage.includes('Invalid prop')
	) {
		return;
	}
	originalConsoleError(...args);
});

console.warn = vi.fn((...args) => {
	// Filter out certain expected warnings during testing
	const warnMessage = args.join(' ');
	if (warnMessage.includes('Warning:') || warnMessage.includes('deprecated')) {
		return;
	}
	originalConsoleWarn(...args);
});

console.log = vi.fn((...args) => {
	// Filter out debug logs during testing
	const logMessage = args.join(' ');
	if (logMessage.includes('[DEBUG]') || logMessage.includes('[INFO]')) {
		return;
	}
	originalConsoleLog(...args);
});
