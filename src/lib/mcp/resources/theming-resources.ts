/**
 * Theming Documentation Resources
 *
 * This file implements resource endpoints for shadcn-svelte theming documentation,
 * supporting component-specific and general theming resources.
 */

import { documentationStore } from '../core/documentation-store';
import type { Component, CSSVariable } from '../core/types';

/**
 * Interface for theming filter parameters
 */
export interface ThemingParams {
	componentName?: string;
	variableName?: string;
	scope?: string;
	includeAffectedComponents?: boolean;
}

/**
 * Interface for theming response
 */
export interface ThemingResponse {
	componentName?: string;
	variables: CSSVariable[];
	generalGuidance?: string;
}

/**
 * Get theming documentation with optional filtering
 *
 * @param params Filter parameters
 * @returns Theming documentation matching the filters
 */
export async function getThemingDocumentation(
	params?: ThemingParams
): Promise<ThemingResponse | null> {
	// If a specific component is requested, return its theming info
	if (params?.componentName) {
		const component = documentationStore.getComponent(params.componentName);

		if (!component) {
			return null;
		}

		let variables = component.cssVariables;

		// Filter by variable name if specified
		if (params.variableName) {
			variables = variables.filter((v) =>
				v.name.toLowerCase().includes(params.variableName!.toLowerCase())
			);
		}

		// Filter by scope if specified
		if (params.scope) {
			variables = variables.filter((v) => v.scope?.toLowerCase() === params.scope!.toLowerCase());
		}

		return {
			componentName: component.name,
			variables
		};
	}

	// Return general theming documentation
	return {
		variables: getAllCSSVariables(params),
		generalGuidance: getGeneralThemingGuidance()
	};
}

/**
 * Get all CSS variables across all components
 *
 * @param params Filter parameters
 * @returns All CSS variables matching the filters
 */
export function getAllCSSVariables(params?: ThemingParams): CSSVariable[] {
	const components = documentationStore.getAllComponents();
	let allVariables: CSSVariable[] = [];

	// Collect all CSS variables from all components
	for (const component of components) {
		allVariables = allVariables.concat(
			component.cssVariables.map((v) => ({
				...v,
				affectedComponents: v.affectedComponents || [component.name]
			}))
		);
	}

	// Filter by variable name if specified
	if (params?.variableName) {
		allVariables = allVariables.filter((v) =>
			v.name.toLowerCase().includes(params.variableName!.toLowerCase())
		);
	}

	// Filter by scope if specified
	if (params?.scope) {
		allVariables = allVariables.filter(
			(v) => v.scope?.toLowerCase() === params.scope!.toLowerCase()
		);
	}

	// Remove duplicate variables (same name and default value)
	const uniqueVariables: CSSVariable[] = [];
	const seen = new Set<string>();

	for (const variable of allVariables) {
		const key = `${variable.name}|${variable.default}`;

		if (!seen.has(key)) {
			seen.add(key);

			// If we don't want to include affected components, remove that property
			if (params?.includeAffectedComponents === false) {
				const { affectedComponents, ...rest } = variable;
				uniqueVariables.push(rest as CSSVariable);
			} else {
				uniqueVariables.push(variable);
			}
		} else if (params?.includeAffectedComponents !== false) {
			// If this is a duplicate and we want to include affected components,
			// merge the affected components lists
			const existingVariable = uniqueVariables.find((v) => `${v.name}|${v.default}` === key);

			if (existingVariable && existingVariable.affectedComponents && variable.affectedComponents) {
				for (const component of variable.affectedComponents) {
					if (!existingVariable.affectedComponents.includes(component)) {
						existingVariable.affectedComponents.push(component);
					}
				}
			}
		}
	}

	return uniqueVariables;
}

/**
 * Get components that use a specific CSS variable
 *
 * @param variableName CSS variable name
 * @returns Components that use the variable
 */
export async function getComponentsWithCSSVariable(variableName: string): Promise<Component[]> {
	return documentationStore.getComponentsWithCSSVariable(variableName);
}

/**
 * Get general theming guidance
 *
 * @returns General theming guidance text
 */
export function getGeneralThemingGuidance(): string {
	return `
# Theming shadcn-svelte Components

shadcn-svelte components are styled using Tailwind CSS and CSS variables. You can customize the appearance of components by:

1. **Modifying CSS Variables**: Override the default CSS variables in your global CSS file.
2. **Extending Tailwind Configuration**: Customize your \`tailwind.config.js\` file to add custom colors, spacing, etc.
3. **Component-Specific Props**: Many components accept \`class\` or \`variant\` props for customization.

## CSS Variables

CSS variables are defined with sensible defaults but can be overridden. Example:

\`\`\`css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 222.2 84% 4.9%;
  --radius: 0.5rem;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --card: 222.2 84% 4.9%;
  --card-foreground: 210 40% 98%;
  --popover: 222.2 84% 4.9%;
  --popover-foreground: 210 40% 98%;
  --primary: 210 40% 98%;
  --primary-foreground: 222.2 47.4% 11.2%;
  --secondary: 217.2 32.6% 17.5%;
  --secondary-foreground: 210 40% 98%;
  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%;
  --accent: 217.2 32.6% 17.5%;
  --accent-foreground: 210 40% 98%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 210 40% 98%;
  --border: 217.2 32.6% 17.5%;
  --input: 217.2 32.6% 17.5%;
  --ring: 212.7 26.8% 83.9%;
}
\`\`\`

## Tailwind Configuration

Extend your Tailwind configuration to add custom themes:

\`\`\`js
// tailwind.config.js
module.exports = {
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
`;
}
