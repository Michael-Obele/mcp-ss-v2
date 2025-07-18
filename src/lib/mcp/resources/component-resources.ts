/**
 * Component Documentation Resources
 *
 * This file implements resource endpoints for component documentation,
 * supporting filtering and pagination.
 */

import { documentationStore } from '../core/documentation-store';
import type { Component, ComponentQuery } from '../core/types';

/**
 * Interface for pagination parameters
 */
export interface PaginationParams {
	page?: number;
	limit?: number;
}

/**
 * Interface for component filter parameters
 */
export interface ComponentFilterParams extends PaginationParams {
	componentName?: string;
	category?: string;
	topic?: string;
	exampleType?: string;
	framework?: string;
	search?: string;
}

/**
 * Interface for paginated response
 */
export interface PaginatedResponse<T> {
	data: T[];
	pagination: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
}

/**
 * Get component documentation with filtering and pagination
 *
 * @param params Filter and pagination parameters
 * @returns Paginated component documentation
 */
export async function getComponentDocumentation(
	params?: ComponentFilterParams
): Promise<PaginatedResponse<Component>> {
	// Default pagination values
	const page = params?.page ?? 1;
	const limit = params?.limit ?? 10;

	// Apply filters to get matching components
	let components: Component[] = [];

	if (params?.componentName) {
		// Get a specific component by name
		const component = documentationStore.getComponent(params.componentName);
		components = component ? [component] : [];
	} else if (params?.search) {
		// Search components by query string
		components = documentationStore.searchComponents(params.search);
	} else if (params?.category || params?.topic || params?.exampleType || params?.framework) {
		// Apply advanced filtering
		const query: ComponentQuery = {
			category: params?.category,
			topic: params?.topic,
			exampleType: params?.exampleType,
			framework: params?.framework
		};

		components = documentationStore.searchComponentsAdvanced(query);
	} else {
		// No filters, get all components
		components = documentationStore.getAllComponents();
	}

	// Calculate pagination
	const total = components.length;
	const totalPages = Math.ceil(total / limit);

	// Apply pagination
	const startIndex = (page - 1) * limit;
	const endIndex = startIndex + limit;
	const paginatedComponents = components.slice(startIndex, endIndex);

	// Return paginated response
	return {
		data: paginatedComponents,
		pagination: {
			total,
			page,
			limit,
			totalPages
		}
	};
}

/**
 * Get detailed information about a specific component
 *
 * @param componentName Name of the component
 * @returns Component details or null if not found
 */
export async function getComponentDetails(componentName: string): Promise<Component | null> {
	const component = documentationStore.getComponent(componentName);
	return component || null;
}

/**
 * Get components by category
 *
 * @param categoryName Category name
 * @param params Pagination parameters
 * @returns Paginated components in the category
 */
export async function getComponentsByCategory(
	categoryName: string,
	params?: PaginationParams
): Promise<PaginatedResponse<Component>> {
	// Default pagination values
	const page = params?.page ?? 1;
	const limit = params?.limit ?? 10;

	// Get components in the category
	const components = documentationStore.getComponentsByCategory(categoryName);

	// Calculate pagination
	const total = components.length;
	const totalPages = Math.ceil(total / limit);

	// Apply pagination
	const startIndex = (page - 1) * limit;
	const endIndex = startIndex + limit;
	const paginatedComponents = components.slice(startIndex, endIndex);

	// Return paginated response
	return {
		data: paginatedComponents,
		pagination: {
			total,
			page,
			limit,
			totalPages
		}
	};
}
