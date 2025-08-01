import { describe, it, expect } from 'vitest';
import {
	validateComponent,
	validateProp,
	validateExample,
	validateCSSVariable,
	validateTroubleshootingItem,
	validateComponentQuery,
	validateComponentResponse,
	validateAccessibilityInfo,
	validateAriaAttribute,
	validateKeyboardInteraction,
	validateComponentCategory,
	validateInstallationGuide,
	validateInstallationStep,
	ensureCompleteComponent
} from './validation';
import type {
	Component,
	Prop,
	Example,
	CSSVariable,
	TroubleshootingItem,
	AccessibilityInfo,
	AriaAttribute,
	KeyboardInteraction,
	ComponentCategory,
	InstallationGuide,
	InstallationStep
} from './types';

describe('Validation Functions', () => {
	describe('validateComponent', () => {
		it('should validate a valid component', () => {
			const component: Component = {
				name: 'Button',
				description: 'A button component',
				usage: 'Use for interactive elements',
				props: [
					{
						name: 'variant',
						type: 'string',
						description: 'Button variant',
						default: 'default',
						required: false
					}
				],
				examples: [
					{
						title: 'Basic Button',
						description: 'A basic button example',
						code: '<Button>Click me</Button>',
						type: 'basic'
					}
				],
				relatedComponents: ['Input', 'Form'],
				cssVariables: [
					{
						name: '--button-bg',
						description: 'Button background color',
						default: '#ffffff'
					}
				],
				troubleshooting: [
					{
						issue: 'Button not clickable',
						solution: 'Check if disabled prop is set to true',
						relatedProps: ['disabled']
					}
				]
			};

			const result = validateComponent(component);
			expect(result.isValid).toBe(true);
			expect(result.errors).toHaveLength(0);
		});

		it('should return errors for an invalid component', () => {
			const component = {
				name: '',
				description: 'A button component',
				// Missing usage
				props: 'not an array', // Invalid type
				examples: [],
				relatedComponents: [],
				cssVariables: [],
				troubleshooting: []
			};

			const result = validateComponent(component as any);
			expect(result.isValid).toBe(false);
			expect(result.errors.length).toBeGreaterThan(0);
			expect(result.errors).toContain('Component name is required');
			expect(result.errors).toContain('Component usage is required');
			expect(result.errors).toContain('Component props should be an array');
		});
	});

	describe('validateProp', () => {
		it('should validate a valid prop', () => {
			const prop: Prop = {
				name: 'variant',
				type: 'string',
				description: 'Button variant',
				default: 'default',
				required: false
			};

			const result = validateProp(prop);
			expect(result.isValid).toBe(true);
			expect(result.errors).toHaveLength(0);
		});

		it('should return errors for an invalid prop', () => {
			const prop = {
				name: '',
				// Missing type
				description: '',
				required: 'not a boolean' // Invalid type
			};

			const result = validateProp(prop as any);
			expect(result.isValid).toBe(false);
			expect(result.errors.length).toBeGreaterThan(0);
			expect(result.errors).toContain('Prop name is required');
			expect(result.errors).toContain('Prop type is required');
			expect(result.errors).toContain('Prop description is required');
			expect(result.errors).toContain('Prop required field should be a boolean');
		});
	});

	describe('validateExample', () => {
		it('should validate a valid example', () => {
			const example: Example = {
				title: 'Basic Button',
				description: 'A basic button example',
				code: '<Button>Click me</Button>',
				type: 'basic'
			};

			const result = validateExample(example);
			expect(result.isValid).toBe(true);
			expect(result.errors).toHaveLength(0);
		});

		it('should return errors for an invalid example', () => {
			const example = {
				title: '',
				// Missing description
				code: '<Button>Click me</Button>',
				type: 'invalid-type' // Invalid type
			};

			const result = validateExample(example as any);
			expect(result.isValid).toBe(false);
			expect(result.errors.length).toBeGreaterThan(0);
			expect(result.errors).toContain('Example title is required');
			expect(result.errors).toContain('Example description is required');
			expect(result.errors).toContain(
				'Example type should be one of: basic, advanced, theming, accessibility, responsive'
			);
		});
	});

	describe('validateCSSVariable', () => {
		it('should validate a valid CSS variable', () => {
			const cssVar: CSSVariable = {
				name: '--button-bg',
				description: 'Button background color',
				default: '#ffffff'
			};

			const result = validateCSSVariable(cssVar);
			expect(result.isValid).toBe(true);
			expect(result.errors).toHaveLength(0);
		});

		it('should return errors for an invalid CSS variable', () => {
			const cssVar = {
				name: 'button-bg', // Missing -- prefix
				// Missing description
				default: ''
			};

			const result = validateCSSVariable(cssVar as any);
			expect(result.isValid).toBe(false);
			expect(result.errors.length).toBeGreaterThan(0);
			expect(result.errors).toContain('CSS variable description is required');
			expect(result.errors).toContain('CSS variable name should start with --');
		});
	});

	describe('validateTroubleshootingItem', () => {
		it('should validate a valid troubleshooting item', () => {
			const item: TroubleshootingItem = {
				issue: 'Button not clickable',
				solution: 'Check if disabled prop is set to true',
				relatedProps: ['disabled']
			};

			const result = validateTroubleshootingItem(item);
			expect(result.isValid).toBe(true);
			expect(result.errors).toHaveLength(0);
		});

		it('should return errors for an invalid troubleshooting item', () => {
			const item = {
				issue: '',
				// Missing solution
				relatedProps: 'not an array' // Invalid type
			};

			const result = validateTroubleshootingItem(item as any);
			expect(result.isValid).toBe(false);
			expect(result.errors.length).toBeGreaterThan(0);
			expect(result.errors).toContain('Troubleshooting issue is required');
			expect(result.errors).toContain('Troubleshooting solution is required');
			expect(result.errors).toContain('Troubleshooting relatedProps should be an array');
		});
	});

	describe('validateComponentQuery', () => {
		it('should validate a valid component query', () => {
			const query = {
				componentName: 'Button',
				topic: 'props',
				framework: 'sveltekit'
			};

			const result = validateComponentQuery(query);
			expect(result.isValid).toBe(true);
			expect(result.errors).toHaveLength(0);
		});

		it('should return errors for an invalid component query', () => {
			const query = {
				// Empty object with no required fields
			};

			const result = validateComponentQuery(query);
			expect(result.isValid).toBe(false);
			expect(result.errors.length).toBeGreaterThan(0);
			expect(result.errors).toContain(
				'At least one of componentName, topic, or specificQuestion is required'
			);
		});

		it('should validate topic and framework fields', () => {
			const query = {
				componentName: 'Button',
				topic: 'invalid-topic',
				framework: 'invalid-framework'
			};

			const result = validateComponentQuery(query);
			expect(result.isValid).toBe(false);
			expect(result.errors.length).toBeGreaterThan(0);
			expect(result.errors).toContain(
				'Topic should be one of: usage, props, examples, theming, troubleshooting'
			);
			expect(result.errors).toContain('Framework should be one of: sveltekit, vite, astro');
		});
	});

	describe('validateComponentResponse', () => {
		it('should validate a valid component response', () => {
			const response = {
				componentName: 'Button',
				topic: 'props',
				content: 'Button component props information',
				examples: [
					{
						title: 'Basic Button',
						description: 'A basic button example',
						code: '<Button>Click me</Button>',
						type: 'basic'
					}
				]
			};

			const result = validateComponentResponse(response);
			expect(result.isValid).toBe(true);
			expect(result.errors).toHaveLength(0);
		});

		it('should return errors for an invalid component response', () => {
			const response = {
				componentName: '',
				// Missing topic
				content: '',
				examples: 'not an array' // Invalid type
			};

			const result = validateComponentResponse(response as any);
			expect(result.isValid).toBe(false);
			expect(result.errors.length).toBeGreaterThan(0);
			expect(result.errors).toContain('Response componentName is required');
			expect(result.errors).toContain('Response topic is required');
			expect(result.errors).toContain('Response content is required');
			expect(result.errors).toContain('Response examples should be an array');
		});
	});

	describe('validateAccessibilityInfo', () => {
		it('should validate valid accessibility info', () => {
			const accessibilityInfo: AccessibilityInfo = {
				ariaAttributes: [
					{
						name: 'aria-label',
						description: 'Accessible name for the button',
						required: true
					}
				],
				keyboardInteractions: [
					{
						key: 'Enter',
						description: 'Activates the button'
					}
				],
				bestPractices: ['Use descriptive labels'],
				wcagCompliance: ['WCAG 2.1 AA']
			};

			const result = validateAccessibilityInfo(accessibilityInfo);
			expect(result.isValid).toBe(true);
			expect(result.errors).toHaveLength(0);
		});

		it('should return errors for invalid accessibility info', () => {
			const accessibilityInfo = {
				ariaAttributes: 'not an array',
				keyboardInteractions: [],
				bestPractices: 'not an array',
				wcagCompliance: []
			};

			const result = validateAccessibilityInfo(accessibilityInfo as any);
			expect(result.isValid).toBe(false);
			expect(result.errors.length).toBeGreaterThan(0);
			expect(result.errors).toContain('Accessibility ariaAttributes should be an array');
			expect(result.errors).toContain('Accessibility bestPractices should be an array');
		});
	});

	describe('validateAriaAttribute', () => {
		it('should validate a valid ARIA attribute', () => {
			const ariaAttribute: AriaAttribute = {
				name: 'aria-label',
				description: 'Accessible name for the element',
				required: true
			};

			const result = validateAriaAttribute(ariaAttribute);
			expect(result.isValid).toBe(true);
			expect(result.errors).toHaveLength(0);
		});

		it('should return errors for an invalid ARIA attribute', () => {
			const ariaAttribute = {
				name: '',
				// Missing description
				required: 'not a boolean'
			};

			const result = validateAriaAttribute(ariaAttribute as any);
			expect(result.isValid).toBe(false);
			expect(result.errors.length).toBeGreaterThan(0);
			expect(result.errors).toContain('ARIA attribute name is required');
			expect(result.errors).toContain('ARIA attribute description is required');
			expect(result.errors).toContain('ARIA attribute required field should be a boolean');
		});
	});

	describe('validateKeyboardInteraction', () => {
		it('should validate a valid keyboard interaction', () => {
			const keyboardInteraction: KeyboardInteraction = {
				key: 'Enter',
				description: 'Activates the button'
			};

			const result = validateKeyboardInteraction(keyboardInteraction);
			expect(result.isValid).toBe(true);
			expect(result.errors).toHaveLength(0);
		});

		it('should return errors for an invalid keyboard interaction', () => {
			const keyboardInteraction = {
				key: ''
				// Missing description
			};

			const result = validateKeyboardInteraction(keyboardInteraction as any);
			expect(result.isValid).toBe(false);
			expect(result.errors.length).toBeGreaterThan(0);
			expect(result.errors).toContain('Keyboard interaction key is required');
			expect(result.errors).toContain('Keyboard interaction description is required');
		});
	});

	describe('validateComponentCategory', () => {
		it('should validate a valid component category', () => {
			const category: ComponentCategory = {
				name: 'Form',
				description: 'Form-related components',
				components: ['Button', 'Input', 'Select']
			};

			const result = validateComponentCategory(category);
			expect(result.isValid).toBe(true);
			expect(result.errors).toHaveLength(0);
		});

		it('should return errors for an invalid component category', () => {
			const category = {
				name: '',
				// Missing description
				components: 'not an array'
			};

			const result = validateComponentCategory(category as any);
			expect(result.isValid).toBe(false);
			expect(result.errors.length).toBeGreaterThan(0);
			expect(result.errors).toContain('Component category name is required');
			expect(result.errors).toContain('Component category description is required');
			expect(result.errors).toContain('Component category components should be an array');
		});
	});

	describe('validateInstallationGuide', () => {
		it('should validate a valid installation guide', () => {
			const guide: InstallationGuide = {
				framework: 'sveltekit',
				steps: [
					{
						order: 1,
						description: 'Install dependencies',
						command: 'npm install'
					}
				],
				requirements: ['Node.js 16+'],
				troubleshooting: [
					{
						issue: 'Installation fails',
						solution: 'Check Node.js version'
					}
				]
			};

			const result = validateInstallationGuide(guide);
			expect(result.isValid).toBe(true);
			expect(result.errors).toHaveLength(0);
		});

		it('should return errors for an invalid installation guide', () => {
			const guide = {
				framework: '',
				steps: 'not an array',
				requirements: 'not an array',
				troubleshooting: []
			};

			const result = validateInstallationGuide(guide as any);
			expect(result.isValid).toBe(false);
			expect(result.errors.length).toBeGreaterThan(0);
			expect(result.errors).toContain('Installation guide framework is required');
			expect(result.errors).toContain('Installation guide steps should be an array');
			expect(result.errors).toContain('Installation guide requirements should be an array');
		});
	});

	describe('validateInstallationStep', () => {
		it('should validate a valid installation step', () => {
			const step: InstallationStep = {
				order: 1,
				description: 'Install dependencies',
				command: 'npm install'
			};

			const result = validateInstallationStep(step);
			expect(result.isValid).toBe(true);
			expect(result.errors).toHaveLength(0);
		});

		it('should return errors for an invalid installation step', () => {
			const step = {
				order: 'not a number'
				// Missing description
			};

			const result = validateInstallationStep(step as any);
			expect(result.isValid).toBe(false);
			expect(result.errors.length).toBeGreaterThan(0);
			expect(result.errors).toContain('Installation step order should be a number');
			expect(result.errors).toContain('Installation step description is required');
		});
	});

	describe('ensureCompleteComponent', () => {
		it('should fill in missing fields with defaults', () => {
			const partialComponent = {
				name: 'Button',
				description: 'A button component'
				// Missing other fields
			};

			const result = ensureCompleteComponent(partialComponent);
			expect(result.name).toBe('Button');
			expect(result.description).toBe('A button component');
			expect(result.usage).toBe('');
			expect(Array.isArray(result.props)).toBe(true);
			expect(Array.isArray(result.examples)).toBe(true);
			expect(Array.isArray(result.relatedComponents)).toBe(true);
			expect(Array.isArray(result.cssVariables)).toBe(true);
			expect(Array.isArray(result.troubleshooting)).toBe(true);
		});
	});
});
