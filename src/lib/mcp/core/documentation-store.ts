/**
 * Documentation Storage Service
 *
 * This service manages the storage and retrieval of shadcn-svelte component documentation.
 * It provides methods for loading, searching, and filtering documentation data.
 */

import type {
	Component,
	ComponentCategory,
	InstallationGuide,
	DocumentationStore,
	ComponentQuery
} from './types.js';

export class DocumentationStoreImpl implements DocumentationStore {
	public components: Record<string, Component> = {};
	public categories: Record<string, ComponentCategory> = {};
	public installationGuides: Record<string, InstallationGuide> = {};

	/**
	 * Get a component by name
	 */
	getComponent(name: string): Component | undefined {
		return this.components[name.toLowerCase()];
	}

	/**
	 * Search components by query string
	 * Searches in component name, description, and usage
	 */
	searchComponents(query: string): Component[] {
		const searchTerm = query.toLowerCase();
		const results: Component[] = [];

		for (const component of Object.values(this.components)) {
			// Search in name, description, and usage
			if (
				component.name.toLowerCase().includes(searchTerm) ||
				component.description.toLowerCase().includes(searchTerm) ||
				component.usage.toLowerCase().includes(searchTerm) ||
				component.category?.toLowerCase().includes(searchTerm)
			) {
				results.push(component);
			}
		}

		return results;
	}

	/**
	 * Get components by category
	 */
	getComponentsByCategory(category: string): Component[] {
		const categoryData = this.categories[category.toLowerCase()];
		if (!categoryData) {
			return [];
		}

		return categoryData.components
			.map((name) => this.getComponent(name))
			.filter((component): component is Component => component !== undefined);
	}

	/**
	 * Get installation guide for a specific framework
	 */
	getInstallationGuide(framework: string): InstallationGuide | undefined {
		return this.installationGuides[framework.toLowerCase()];
	}

	/**
	 * Get a category by name
	 */
	getCategory(name: string): ComponentCategory | undefined {
		return this.categories[name.toLowerCase()];
	}

	/**
	 * Add a component to the store
	 */
	addComponent(component: Component): void {
		this.components[component.name.toLowerCase()] = component;
	}

	/**
	 * Add multiple components to the store
	 */
	addComponents(components: Component[]): void {
		for (const component of components) {
			this.addComponent(component);
		}
	}

	/**
	 * Add a category to the store
	 */
	addCategory(category: ComponentCategory): void {
		this.categories[category.name.toLowerCase()] = category;
	}

	/**
	 * Add an installation guide to the store
	 */
	addInstallationGuide(guide: InstallationGuide): void {
		this.installationGuides[guide.framework.toLowerCase()] = guide;
	}

	/**
	 * Get all components
	 */
	getAllComponents(): Component[] {
		return Object.values(this.components);
	}

	/**
	 * Get all categories
	 */
	getAllCategories(): ComponentCategory[] {
		return Object.values(this.categories);
	}

	/**
	 * Get all installation guides
	 */
	getAllInstallationGuides(): InstallationGuide[] {
		return Object.values(this.installationGuides);
	}

	/**
	 * Advanced search with filters
	 */
	searchComponentsAdvanced(query: ComponentQuery): Component[] {
		let results = Object.values(this.components);

		// Filter by component name if specified
		if (query.componentName) {
			const component = this.getComponent(query.componentName);
			return component ? [component] : [];
		}

		// Filter by category if specified
		if (query.category) {
			results = this.getComponentsByCategory(query.category);
		}

		// Filter by topic if specified
		if (query.topic) {
			results = results.filter((component) => {
				switch (query.topic) {
					case 'props':
						return component.props.length > 0;
					case 'examples':
						return component.examples.length > 0;
					case 'theming':
						return component.cssVariables.length > 0;
					case 'troubleshooting':
						return component.troubleshooting.length > 0;
					default:
						return true;
				}
			});
		}

		// Filter by example type if specified
		if (query.exampleType) {
			results = results.filter((component) =>
				component.examples.some((example) => example.type === query.exampleType)
			);
		}

		// Filter by framework if specified
		if (query.framework) {
			results = results.filter((component) =>
				component.examples.some(
					(example) => !example.framework || example.framework === query.framework
				)
			);
		}

		return results;
	}

	/**
	 * Get components with specific props
	 */
	getComponentsWithProp(propName: string): Component[] {
		return Object.values(this.components).filter((component) =>
			component.props.some((prop) => prop.name === propName)
		);
	}

	/**
	 * Get components that use specific CSS variables
	 */
	getComponentsWithCSSVariable(variableName: string): Component[] {
		return Object.values(this.components).filter((component) =>
			component.cssVariables.some((cssVar) => cssVar.name === variableName)
		);
	}

	/**
	 * Get related components for a given component
	 */
	getRelatedComponents(componentName: string): Component[] {
		const component = this.getComponent(componentName);
		if (!component) {
			return [];
		}

		return component.relatedComponents
			.map((name) => this.getComponent(name))
			.filter((comp): comp is Component => comp !== undefined);
	}

	/**
	 * Clear all data from the store
	 */
	clear(): void {
		this.components = {};
		this.categories = {};
		this.installationGuides = {};
	}

	/**
	 * Get store statistics
	 */
	getStats(): {
		totalComponents: number;
		totalCategories: number;
		totalInstallationGuides: number;
		componentsWithExamples: number;
		componentsWithTroubleshooting: number;
	} {
		const components = Object.values(this.components);

		return {
			totalComponents: components.length,
			totalCategories: Object.keys(this.categories).length,
			totalInstallationGuides: Object.keys(this.installationGuides).length,
			componentsWithExamples: components.filter((c) => c.examples.length > 0).length,
			componentsWithTroubleshooting: components.filter((c) => c.troubleshooting.length > 0).length
		};
	}
}

// Singleton instance
export const documentationStore = new DocumentationStoreImpl();
