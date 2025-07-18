/**
 * Tests for Installation Guide Resources
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { documentationStore } from '../core/documentation-store';
import {
	getInstallationGuides,
	getInstallationSteps,
	getInstallationTroubleshooting,
	getInstallationRequirements
} from './installation-resources';
import type { InstallationGuide } from '../core/types';

// Mock installation guides for testing
const mockGuides: InstallationGuide[] = [
	{
		framework: 'sveltekit',
		steps: [
			{
				order: 1,
				description: 'Create a new SvelteKit project',
				command: 'npm create svelte@latest my-app'
			},
			{ order: 2, description: 'Install dependencies', command: 'npm install' },
			{ order: 3, description: 'Install shadcn-svelte', command: 'npx shadcn-svelte@latest init' }
		],
		requirements: ['Node.js 16+', 'npm or pnpm or yarn'],
		troubleshooting: [
			{ issue: 'Components not showing', solution: 'Check if styles are imported' },
			{ issue: 'Installation fails', solution: 'Check Node.js version' }
		]
	},
	{
		framework: 'vite',
		steps: [
			{
				order: 1,
				description: 'Create a new Vite project',
				command: 'npm create vite@latest my-app -- --template svelte-ts'
			},
			{ order: 2, description: 'Install dependencies', command: 'npm install' },
			{ order: 3, description: 'Install shadcn-svelte', command: 'npx shadcn-svelte@latest init' }
		],
		requirements: ['Node.js 16+', 'npm or pnpm or yarn'],
		troubleshooting: [
			{ issue: 'Components not showing', solution: 'Check if styles are imported' },
			{ issue: 'Tailwind not working', solution: 'Check tailwind.config.js' }
		]
	}
];

// Mock the documentationStore
vi.mock('../core/documentation-store', () => {
	return {
		documentationStore: {
			getInstallationGuide: vi.fn((framework: string) =>
				mockGuides.find((g) => g.framework.toLowerCase() === framework.toLowerCase())
			),
			getAllInstallationGuides: vi.fn(() => mockGuides)
		}
	};
});

describe('Installation Guide Resources', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('getInstallationGuides', () => {
		it('should return all installation guides when no framework is specified', async () => {
			const result = await getInstallationGuides();

			expect(documentationStore.getAllInstallationGuides).toHaveBeenCalled();
			expect(result).toHaveLength(2);
			expect(result).toEqual(mockGuides);
		});

		it('should return a specific installation guide by framework', async () => {
			const result = await getInstallationGuides({ framework: 'sveltekit' });

			expect(documentationStore.getInstallationGuide).toHaveBeenCalledWith('sveltekit');
			expect(result).toBeDefined();
			expect((result as InstallationGuide).framework).toBe('sveltekit');
		});

		it('should return null for non-existent framework', async () => {
			const result = await getInstallationGuides({ framework: 'nonexistent' });

			expect(documentationStore.getInstallationGuide).toHaveBeenCalledWith('nonexistent');
			expect(result).toBeNull();
		});

		it('should filter out steps when includeSteps is false', async () => {
			const result = await getInstallationGuides({ includeSteps: false });

			expect(documentationStore.getAllInstallationGuides).toHaveBeenCalled();
			expect(Array.isArray(result)).toBe(true);
			expect((result as InstallationGuide[])[0].steps).toHaveLength(0);
		});

		it('should filter out troubleshooting when includeTroubleshooting is false', async () => {
			const result = await getInstallationGuides({ includeTroubleshooting: false });

			expect(documentationStore.getAllInstallationGuides).toHaveBeenCalled();
			expect(Array.isArray(result)).toBe(true);
			expect((result as InstallationGuide[])[0].troubleshooting).toHaveLength(0);
		});
	});

	describe('getInstallationSteps', () => {
		it('should return installation steps for a specific framework', async () => {
			const result = await getInstallationSteps('sveltekit');

			expect(documentationStore.getInstallationGuide).toHaveBeenCalledWith('sveltekit');
			expect(result).toBeDefined();
			expect(result.framework).toBe('sveltekit');
			expect(result.steps).toHaveLength(3);
			expect(result.steps[0].order).toBe(1); // Check that steps are sorted
		});

		it('should return null for non-existent framework', async () => {
			const result = await getInstallationSteps('nonexistent');

			expect(documentationStore.getInstallationGuide).toHaveBeenCalledWith('nonexistent');
			expect(result).toBeNull();
		});
	});

	describe('getInstallationTroubleshooting', () => {
		it('should return troubleshooting info for a specific framework', async () => {
			const result = await getInstallationTroubleshooting('sveltekit');

			expect(documentationStore.getInstallationGuide).toHaveBeenCalledWith('sveltekit');
			expect(result).toBeDefined();
			expect(result.framework).toBe('sveltekit');
			expect(result.troubleshooting).toHaveLength(2);
		});

		it('should filter troubleshooting by issue', async () => {
			const result = await getInstallationTroubleshooting('sveltekit', 'not showing');

			expect(documentationStore.getInstallationGuide).toHaveBeenCalledWith('sveltekit');
			expect(result).toBeDefined();
			expect(result.troubleshooting).toHaveLength(1);
			expect(result.troubleshooting[0].issue).toContain('not showing');
		});

		it('should return null for non-existent framework', async () => {
			const result = await getInstallationTroubleshooting('nonexistent');

			expect(documentationStore.getInstallationGuide).toHaveBeenCalledWith('nonexistent');
			expect(result).toBeNull();
		});
	});

	describe('getInstallationRequirements', () => {
		it('should return requirements for a specific framework', async () => {
			const result = await getInstallationRequirements('sveltekit');

			expect(documentationStore.getInstallationGuide).toHaveBeenCalledWith('sveltekit');
			expect(result).toBeDefined();
			expect(result.framework).toBe('sveltekit');
			expect(result.requirements).toHaveLength(2);
			expect(result.requirements).toContain('Node.js 16+');
		});

		it('should return null for non-existent framework', async () => {
			const result = await getInstallationRequirements('nonexistent');

			expect(documentationStore.getInstallationGuide).toHaveBeenCalledWith('nonexistent');
			expect(result).toBeNull();
		});
	});
});
