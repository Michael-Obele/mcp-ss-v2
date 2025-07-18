/**
 * MCP Server Type Definitions
 *
 * This file contains the type definitions for the shadcn-svelte MCP server.
 * It defines the data models for components, documentation, and MCP protocol.
 */

/**
 * Component model representing a shadcn-svelte component
 */
export interface Component {
	name: string;
	description: string;
	usage: string;
	props: Prop[];
	examples: Example[];
	relatedComponents: string[];
	cssVariables: CSSVariable[];
	troubleshooting: TroubleshootingItem[];
	category?: string;
	version?: string;
	installCommand?: string;
	importStatement?: string;
	accessibility?: AccessibilityInfo;
}

/**
 * Component property model
 */
export interface Prop {
	name: string;
	type: string;
	description: string;
	default?: string;
	required: boolean;
	validValues?: string[];
	deprecated?: boolean;
	deprecationReason?: string;
}

/**
 * Component example model
 */
export interface Example {
	title: string;
	description: string;
	code: string;
	type: string; // "basic", "advanced", "theming", "accessibility", "responsive"
	framework?: string; // "sveltekit", "vite", "astro"
	dependencies?: string[];
	preview?: string; // URL or base64 image of the example
}

/**
 * CSS variable model for component theming
 */
export interface CSSVariable {
	name: string;
	description: string;
	default: string;
	scope?: string; // Global or component-specific
	affectedComponents?: string[]; // Which components are affected by this variable
}

/**
 * Troubleshooting item model
 */
export interface TroubleshootingItem {
	issue: string;
	solution: string;
	relatedProps?: string[];
	errorCode?: string;
	affectedVersions?: string[];
	fixedInVersion?: string;
}

/**
 * Accessibility information for a component
 */
export interface AccessibilityInfo {
	ariaAttributes: AriaAttribute[];
	keyboardInteractions: KeyboardInteraction[];
	bestPractices: string[];
	wcagCompliance: string[];
}

/**
 * ARIA attribute information
 */
export interface AriaAttribute {
	name: string;
	description: string;
	required: boolean;
}

/**
 * Keyboard interaction information
 */
export interface KeyboardInteraction {
	key: string;
	description: string;
}

/**
 * Component category information
 */
export interface ComponentCategory {
	name: string;
	description: string;
	components: string[];
}

/**
 * Installation guide information
 */
export interface InstallationGuide {
	framework: string;
	steps: InstallationStep[];
	requirements: string[];
	troubleshooting: TroubleshootingItem[];
}

/**
 * Installation step information
 */
export interface InstallationStep {
	order: number;
	description: string;
	command?: string;
	code?: string;
}

/**
 * Component query model for MCP requests
 */
export interface ComponentQuery {
	componentName?: string;
	topic?: string; // "usage", "props", "examples", "theming", "troubleshooting"
	specificQuestion?: string;
	exampleType?: string;
	framework?: string; // "sveltekit", "vite", "astro"
	category?: string;
	version?: string;
}

/**
 * Component response model for MCP responses
 */
export interface ComponentResponse {
	componentName: string;
	topic: string;
	content: string;
	examples?: Example[];
	relatedComponents?: string[];
	additionalResources?: string[];
	cssVariables?: CSSVariable[];
	props?: Prop[];
	troubleshooting?: TroubleshootingItem[];
	accessibility?: AccessibilityInfo;
}

/**
 * MCP tool definition
 */
export interface MCPTool {
	name: string;
	description: string;
	parameters: Record<string, unknown>;
	handler?: (params: Record<string, unknown>) => Promise<any>;
}

/**
 * MCP resource definition
 */
export interface MCPResource {
	name: string;
	description: string;
	path: string;
	data?: Record<string, unknown>;
}

/**
 * MCP error response
 */
export interface MCPError {
	code: string;
	message: string;
	details?: unknown;
}

/**
 * Documentation store interface
 */
export interface DocumentationStore {
	components: Record<string, Component>;
	categories: Record<string, ComponentCategory>;
	installationGuides: Record<string, InstallationGuide>;

	getComponent(name: string): Component | undefined;
	searchComponents(query: string): Component[];
	getComponentsByCategory(category: string): Component[];
	getInstallationGuide(framework: string): InstallationGuide | undefined;
}
