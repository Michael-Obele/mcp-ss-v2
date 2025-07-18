/**
 * Installation Guide Resources
 *
 * This file implements resource endpoints for shadcn-svelte installation guides,
 * supporting framework-specific installation instructions.
 */

import { documentationStore } from '../core/documentation-store';
import type { InstallationGuide } from '../core/types';

/**
 * Interface for installation guide filter parameters
 */
export interface InstallationGuideParams {
	framework?: string;
	includeSteps?: boolean;
	includeTroubleshooting?: boolean;
}

/**
 * Get installation guides with optional filtering
 *
 * @param params Filter parameters
 * @returns Installation guides matching the filters
 */
export async function getInstallationGuides(
	params?: InstallationGuideParams
): Promise<InstallationGuide[] | InstallationGuide | null> {
	// If a specific framework is requested, return that guide
	if (params?.framework) {
		const guide = documentationStore.getInstallationGuide(params.framework);

		// If guide not found, return null
		if (!guide) {
			return null;
		}

		// If we need to filter the guide content
		if (params.includeSteps === false || params.includeTroubleshooting === false) {
			const filteredGuide = { ...guide };

			if (params.includeSteps === false) {
				filteredGuide.steps = [];
			}

			if (params.includeTroubleshooting === false) {
				filteredGuide.troubleshooting = [];
			}

			return filteredGuide;
		}

		return guide;
	}

	// Return all guides
	const guides = documentationStore.getAllInstallationGuides();

	// If we need to filter the guide content
	if (params && (params.includeSteps === false || params.includeTroubleshooting === false)) {
		return guides.map((guide) => {
			const filteredGuide = { ...guide };

			if (params.includeSteps === false) {
				filteredGuide.steps = [];
			}

			if (params.includeTroubleshooting === false) {
				filteredGuide.troubleshooting = [];
			}

			return filteredGuide;
		});
	}

	return guides;
}

/**
 * Get installation steps for a specific framework
 *
 * @param framework Framework name
 * @returns Installation steps or null if not found
 */
export async function getInstallationSteps(framework: string): Promise<any> {
	const guide = documentationStore.getInstallationGuide(framework);

	if (!guide) {
		return null;
	}

	return {
		framework: guide.framework,
		steps: guide.steps.sort((a, b) => a.order - b.order)
	};
}

/**
 * Get troubleshooting information for a specific framework
 *
 * @param framework Framework name
 * @param issue Optional issue to filter by
 * @returns Troubleshooting information or null if not found
 */
export async function getInstallationTroubleshooting(
	framework: string,
	issue?: string
): Promise<any> {
	const guide = documentationStore.getInstallationGuide(framework);

	if (!guide) {
		return null;
	}

	let troubleshooting = guide.troubleshooting;

	// Filter by issue if specified
	if (issue) {
		troubleshooting = troubleshooting.filter((item) =>
			item.issue.toLowerCase().includes(issue.toLowerCase())
		);
	}

	return {
		framework: guide.framework,
		troubleshooting
	};
}

/**
 * Get installation requirements for a specific framework
 *
 * @param framework Framework name
 * @returns Installation requirements or null if not found
 */
export async function getInstallationRequirements(framework: string): Promise<any> {
	const guide = documentationStore.getInstallationGuide(framework);

	if (!guide) {
		return null;
	}

	return {
		framework: guide.framework,
		requirements: guide.requirements
	};
}
