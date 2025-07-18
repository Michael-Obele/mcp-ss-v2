import { render, type RenderResult } from '@testing-library/svelte';
import { vi } from 'vitest';

/**
 * Custom render function that includes common testing utilities
 * @param component - The Svelte component to render
 * @param options - Options for rendering
 * @returns RenderResult with additional utilities
 */
export function renderWithUtils(component: any, options = {}): RenderResult<any> {
	const utils = render(component, options);
	return {
		...utils
		// Add any custom utilities here
	};
}

/**
 * Create a mock function that returns a promise
 * @param returnValue - The value to return from the promise
 * @returns A mock function that returns a promise
 */
export function mockPromise<T>(returnValue: T) {
	return vi.fn().mockResolvedValue(returnValue);
}

/**
 * Create a mock function that returns a rejected promise
 * @param error - The error to reject with
 * @returns A mock function that returns a rejected promise
 */
export function mockRejectedPromise(error: any) {
	return vi.fn().mockRejectedValue(error);
}

/**
 * Wait for a specified amount of time
 * @param ms - The number of milliseconds to wait
 * @returns A promise that resolves after the specified time
 */
export function wait(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Create a mock event object
 * @param overrides - Properties to override in the event object
 * @returns A mock event object
 */
export function mockEvent(overrides = {}) {
	return {
		preventDefault: vi.fn(),
		stopPropagation: vi.fn(),
		...overrides
	};
}

/**
 * Create a mock keyboard event
 * @param key - The key that was pressed
 * @param overrides - Additional properties to override
 * @returns A mock keyboard event
 */
export function mockKeyboardEvent(key: string, overrides = {}) {
	return mockEvent({
		key,
		...overrides
	});
}

/**
 * Create a mock mouse event
 * @param overrides - Properties to override in the event object
 * @returns A mock mouse event
 */
export function mockMouseEvent(overrides = {}) {
	return mockEvent({
		clientX: 0,
		clientY: 0,
		...overrides
	});
}
