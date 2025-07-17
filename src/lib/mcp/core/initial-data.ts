/**
 * Initial Documentation Data
 *
 * This file contains the initial documentation data for shadcn-svelte components.
 * It populates the documentation store with components, categories, and installation guides.
 */

import type { Component, ComponentCategory, InstallationGuide } from './types.js';

/**
 * Sample Button component data
 */
const buttonComponent: Component = {
	name: 'Button',
	description: 'A versatile button component with multiple variants and sizes.',
	usage: 'Use buttons to trigger actions, submit forms, or navigate between pages.',
	category: 'form',
	version: '1.0.0',
	installCommand: 'npx shadcn-svelte@latest add button',
	importStatement: "import { Button } from '$lib/components/ui/button';",
	props: [
		{
			name: 'variant',
			type: 'string',
			description: 'The visual style variant of the button',
			default: 'default',
			required: false,
			validValues: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link']
		},
		{
			name: 'size',
			type: 'string',
			description: 'The size of the button',
			default: 'default',
			required: false,
			validValues: ['default', 'sm', 'lg', 'icon']
		},
		{
			name: 'disabled',
			type: 'boolean',
			description: 'Whether the button is disabled',
			default: 'false',
			required: false
		}
	],
	examples: [
		{
			title: 'Basic Button',
			description: 'A simple button with default styling',
			code: '<Button>Click me</Button>',
			type: 'basic'
		},
		{
			title: 'Button Variants',
			description: 'Different visual styles for buttons',
			code: `<Button variant="default">Default</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>`,
			type: 'advanced'
		}
	],
	relatedComponents: ['Input', 'Form'],
	cssVariables: [
		{
			name: '--primary',
			description: 'Primary button background color',
			default: 'hsl(222.2 84% 4.9%)',
			scope: 'component'
		},
		{
			name: '--primary-foreground',
			description: 'Primary button text color',
			default: 'hsl(210 40% 98%)',
			scope: 'component'
		}
	],
	troubleshooting: [
		{
			issue: 'Button not responding to clicks',
			solution: 'Check if the button is disabled or if event handlers are properly attached'
		}
	],
	accessibility: {
		ariaAttributes: [
			{
				name: 'aria-label',
				description: 'Accessible name for the button when text is not descriptive',
				required: false
			}
		],
		keyboardInteractions: [
			{
				key: 'Enter',
				description: 'Activates the button'
			},
			{
				key: 'Space',
				description: 'Activates the button'
			}
		],
		bestPractices: [
			'Use descriptive button text',
			'Ensure sufficient color contrast',
			'Provide focus indicators'
		],
		wcagCompliance: ['2.1.1', '2.4.7', '3.2.2']
	}
};

/**
 * Sample Input component data
 */
const inputComponent: Component = {
	name: 'Input',
	description: 'A form input component with validation and styling support.',
	usage: 'Use inputs to collect user data in forms and interactive interfaces.',
	category: 'form',
	version: '1.0.0',
	installCommand: 'npx shadcn-svelte@latest add input',
	importStatement: "import { Input } from '$lib/components/ui/input';",
	props: [
		{
			name: 'type',
			type: 'string',
			description: 'The input type',
			default: 'text',
			required: false,
			validValues: ['text', 'email', 'password', 'number', 'tel', 'url']
		},
		{
			name: 'placeholder',
			type: 'string',
			description: 'Placeholder text for the input',
			required: false
		},
		{
			name: 'disabled',
			type: 'boolean',
			description: 'Whether the input is disabled',
			default: 'false',
			required: false
		},
		{
			name: 'value',
			type: 'string',
			description: 'The input value',
			required: false
		}
	],
	examples: [
		{
			title: 'Basic Input',
			description: 'A simple text input',
			code: '<Input placeholder="Enter your name" />',
			type: 'basic'
		},
		{
			title: 'Email Input',
			description: 'An input specifically for email addresses',
			code: '<Input type="email" placeholder="Enter your email" />',
			type: 'basic'
		}
	],
	relatedComponents: ['Button', 'Form', 'Label'],
	cssVariables: [
		{
			name: '--input-border',
			description: 'Input border color',
			default: 'hsl(214.3 31.8% 91.4%)',
			scope: 'component'
		}
	],
	troubleshooting: [
		{
			issue: 'Input not accepting focus',
			solution: 'Ensure the input is not disabled and check for CSS pointer-events'
		}
	],
	accessibility: {
		ariaAttributes: [
			{
				name: 'aria-label',
				description: 'Accessible name for the input',
				required: false
			},
			{
				name: 'aria-describedby',
				description: 'References elements that describe the input',
				required: false
			}
		],
		keyboardInteractions: [
			{
				key: 'Tab',
				description: 'Moves focus to the input'
			}
		],
		bestPractices: [
			'Always provide labels',
			'Use appropriate input types',
			'Provide clear error messages'
		],
		wcagCompliance: ['1.3.1', '2.4.6', '3.3.2']
	}
};

/**
 * Sample Card component data
 */
const cardComponent: Component = {
	name: 'Card',
	description: 'A flexible container component for grouping related content.',
	usage: 'Use cards to display content in a structured, visually appealing way.',
	category: 'layout',
	version: '1.0.0',
	installCommand: 'npx shadcn-svelte@latest add card',
	importStatement:
		"import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card';",
	props: [
		{
			name: 'class',
			type: 'string',
			description: 'Additional CSS classes to apply',
			required: false
		}
	],
	examples: [
		{
			title: 'Basic Card',
			description: 'A simple card with header, content, and footer',
			code: `<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description goes here</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content goes here.</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>`,
			type: 'basic'
		}
	],
	relatedComponents: ['Button', 'Badge'],
	cssVariables: [
		{
			name: '--card-background',
			description: 'Card background color',
			default: 'hsl(0 0% 100%)',
			scope: 'component'
		},
		{
			name: '--card-border',
			description: 'Card border color',
			default: 'hsl(214.3 31.8% 91.4%)',
			scope: 'component'
		}
	],
	troubleshooting: [],
	accessibility: {
		ariaAttributes: [],
		keyboardInteractions: [],
		bestPractices: ['Use semantic HTML within cards', 'Ensure proper heading hierarchy'],
		wcagCompliance: ['1.3.1']
	}
};

/**
 * Checkbox component data
 */
const checkboxComponent: Component = {
	name: 'Checkbox',
	description: 'A control that allows the user to toggle between checked and not checked.',
	usage:
		'Use checkboxes to select one or more options from a list or to toggle a single option on/off.',
	category: 'form',
	version: '1.0.0',
	installCommand: 'npx shadcn-svelte@latest add checkbox',
	importStatement: "import { Checkbox } from '$lib/components/ui/checkbox';",
	props: [
		{
			name: 'checked',
			type: 'boolean',
			description: 'Whether the checkbox is checked',
			default: 'false',
			required: false
		},
		{
			name: 'disabled',
			type: 'boolean',
			description: 'Whether the checkbox is disabled',
			default: 'false',
			required: false
		},
		{
			name: 'required',
			type: 'boolean',
			description: 'Whether the checkbox is required',
			default: 'false',
			required: false
		},
		{
			name: 'name',
			type: 'string',
			description: 'The name of the checkbox',
			required: false
		},
		{
			name: 'value',
			type: 'string',
			description: 'The value of the checkbox',
			required: false
		}
	],
	examples: [
		{
			title: 'Basic Checkbox',
			description: 'A simple checkbox with a label',
			code: `<div class="flex items-center space-x-2">
  <Checkbox id="terms" />
  <label for="terms" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Accept terms and conditions</label>
</div>`,
			type: 'basic'
		},
		{
			title: 'Disabled Checkbox',
			description: 'A disabled checkbox',
			code: `<div class="flex items-center space-x-2">
  <Checkbox id="disabled" disabled />
  <label for="disabled" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Disabled</label>
</div>`,
			type: 'basic'
		},
		{
			title: 'Checkbox with Form',
			description: 'Using checkboxes in a form',
			code: `<script>
  import { Checkbox } from "$lib/components/ui/checkbox";
  let items = ["Item 1", "Item 2", "Item 3"];
  let selectedItems = [];
</script>

<form>
  <div class="space-y-2">
    {#each items as item, i}
      <div class="flex items-center space-x-2">
        <Checkbox id={item} bind:checked={selectedItems[i]} value={item} />
        <label for={item} class="text-sm font-medium leading-none">{item}</label>
      </div>
    {/each}
  </div>
  <div class="mt-4">
    <p>Selected items: {selectedItems.filter(Boolean).length}</p>
  </div>
</form>`,
			type: 'advanced',
			framework: 'sveltekit'
		}
	],
	relatedComponents: ['Radio', 'Switch', 'Form'],
	cssVariables: [
		{
			name: '--border',
			description: 'Border color',
			default: 'hsl(214.3 31.8% 91.4%)',
			scope: 'component'
		},
		{
			name: '--ring',
			description: 'Focus ring color',
			default: 'hsl(215.4 16.3% 46.9%)',
			scope: 'component'
		}
	],
	troubleshooting: [
		{
			issue: 'Checkbox not toggling when clicked',
			solution: 'Ensure the id attribute on the checkbox matches the for attribute on the label'
		},
		{
			issue: 'Checkbox state not updating in form',
			solution: 'Make sure you are using bind:checked to bind the checkbox state to a variable'
		}
	],
	accessibility: {
		ariaAttributes: [
			{
				name: 'aria-checked',
				description: 'Indicates whether the checkbox is checked, unchecked, or mixed',
				required: false
			},
			{
				name: 'aria-required',
				description: 'Indicates that the checkbox is required',
				required: false
			}
		],
		keyboardInteractions: [
			{
				key: 'Space',
				description: 'Toggles the checkbox'
			}
		],
		bestPractices: [
			'Always associate a label with the checkbox',
			'Use fieldset and legend for groups of checkboxes',
			'Ensure sufficient color contrast between the checkbox and its background'
		],
		wcagCompliance: ['1.3.1', '2.1.1', '2.4.6', '3.3.2']
	}
};

/**
 * Select component data
 */
const selectComponent: Component = {
	name: 'Select',
	description: 'Displays a list of options for the user to pick from.',
	usage: 'Use select when you need to allow users to choose one option from a list of options.',
	category: 'form',
	version: '1.0.0',
	installCommand: 'npx shadcn-svelte@latest add select',
	importStatement:
		"import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '$lib/components/ui/select';",
	props: [
		{
			name: 'value',
			type: 'string',
			description: 'The selected value',
			required: false
		},
		{
			name: 'defaultValue',
			type: 'string',
			description: 'The default selected value',
			required: false
		},
		{
			name: 'placeholder',
			type: 'string',
			description: 'The placeholder text when no value is selected',
			required: false
		},
		{
			name: 'disabled',
			type: 'boolean',
			description: 'Whether the select is disabled',
			default: 'false',
			required: false
		},
		{
			name: 'required',
			type: 'boolean',
			description: 'Whether the select is required',
			default: 'false',
			required: false
		}
	],
	examples: [
		{
			title: 'Basic Select',
			description: 'A simple select component',
			code: `<script>
  import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "$lib/components/ui/select";
  let value = "";
</script>

<Select bind:value>
  <SelectTrigger class="w-[180px]">
    <SelectValue placeholder="Theme" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="light">Light</SelectItem>
    <SelectItem value="dark">Dark</SelectItem>
    <SelectItem value="system">System</SelectItem>
  </SelectContent>
</Select>`,
			type: 'basic',
			framework: 'sveltekit'
		},
		{
			title: 'Select with Form',
			description: 'Using select in a form',
			code: `<script>
  import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "$lib/components/ui/select";
  import { Button } from "$lib/components/ui/button";
  let selectedFruit = "";
  
  function handleSubmit() {
    alert(\`You selected: \${selectedFruit}\`);
  }
</script>

<form on:submit|preventDefault={handleSubmit} class="space-y-4">
  <div class="space-y-2">
    <label for="fruit" class="text-sm font-medium">Favorite Fruit</label>
    <Select bind:value={selectedFruit} required>
      <SelectTrigger id="fruit" class="w-full">
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
        <SelectItem value="orange">Orange</SelectItem>
        <SelectItem value="strawberry">Strawberry</SelectItem>
      </SelectContent>
    </Select>
  </div>
  <Button type="submit">Submit</Button>
</form>`,
			type: 'advanced',
			framework: 'sveltekit'
		}
	],
	relatedComponents: ['Combobox', 'Input', 'Form'],
	cssVariables: [
		{
			name: '--select-trigger-height',
			description: 'Height of the select trigger',
			default: '2.5rem',
			scope: 'component'
		},
		{
			name: '--select-content-background',
			description: 'Background color of the select dropdown',
			default: 'hsl(0 0% 100%)',
			scope: 'component'
		}
	],
	troubleshooting: [
		{
			issue: 'Select dropdown not opening',
			solution: 'Check if the select is disabled or if there are CSS z-index conflicts'
		},
		{
			issue: 'Select value not updating',
			solution: 'Ensure you are using bind:value to bind the select value to a variable'
		}
	],
	accessibility: {
		ariaAttributes: [
			{
				name: 'aria-expanded',
				description: 'Indicates whether the select dropdown is expanded',
				required: false
			},
			{
				name: 'aria-haspopup',
				description: 'Indicates that the select has a popup',
				required: false
			}
		],
		keyboardInteractions: [
			{
				key: 'Enter',
				description: 'Opens the select dropdown or selects the focused option'
			},
			{
				key: 'Space',
				description: 'Opens the select dropdown or selects the focused option'
			},
			{
				key: 'Arrow Up/Down',
				description: 'Navigates through options in the dropdown'
			},
			{
				key: 'Escape',
				description: 'Closes the select dropdown'
			}
		],
		bestPractices: [
			'Always provide a visible label for the select',
			'Use descriptive option text',
			'Group related options when the list is long'
		],
		wcagCompliance: ['1.3.1', '2.1.1', '2.4.6', '3.2.1', '4.1.2']
	}
};

/**
 * Alert component data
 */
const alertComponent: Component = {
	name: 'Alert',
	description: 'Displays a callout for user attention.',
	usage: 'Use alerts to display important messages or feedback to the user.',
	category: 'feedback',
	version: '1.0.0',
	installCommand: 'npx shadcn-svelte@latest add alert',
	importStatement:
		"import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';",
	props: [
		{
			name: 'variant',
			type: 'string',
			description: 'The variant of the alert',
			default: 'default',
			required: false,
			validValues: ['default', 'destructive']
		}
	],
	examples: [
		{
			title: 'Basic Alert',
			description: 'A simple alert with title and description',
			code: `<Alert>
  <AlertTitle>Heads up!</AlertTitle>
  <AlertDescription>
    You can add components to your app using the cli.
  </AlertDescription>
</Alert>`,
			type: 'basic'
		},
		{
			title: 'Destructive Alert',
			description: 'An alert for destructive or error messages',
			code: `<Alert variant="destructive">
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>
    Your session has expired. Please log in again.
  </AlertDescription>
</Alert>`,
			type: 'basic'
		},
		{
			title: 'Alert with Icon',
			description: 'An alert with a custom icon',
			code: `<script>
  import { Alert, AlertDescription, AlertTitle } from "$lib/components/ui/alert";
  import { InfoIcon } from "lucide-svelte";
</script>

<Alert>
  <InfoIcon class="h-4 w-4" />
  <AlertTitle>Info</AlertTitle>
  <AlertDescription>
    This action cannot be undone. Please proceed with caution.
  </AlertDescription>
</Alert>`,
			type: 'advanced',
			framework: 'sveltekit',
			dependencies: ['lucide-svelte']
		}
	],
	relatedComponents: ['Toast', 'Badge'],
	cssVariables: [
		{
			name: '--background',
			description: 'Background color of the alert',
			default: 'hsl(0 0% 100%)',
			scope: 'component'
		},
		{
			name: '--foreground',
			description: 'Text color of the alert',
			default: 'hsl(222.2 84% 4.9%)',
			scope: 'component'
		},
		{
			name: '--border',
			description: 'Border color of the alert',
			default: 'hsl(214.3 31.8% 91.4%)',
			scope: 'component'
		}
	],
	troubleshooting: [
		{
			issue: 'Alert not displaying with correct styling',
			solution: 'Ensure you have imported the correct components and are using the proper variant'
		}
	],
	accessibility: {
		ariaAttributes: [
			{
				name: 'role',
				description: 'The ARIA role for the alert',
				required: false
			}
		],
		keyboardInteractions: [],
		bestPractices: [
			'Use clear and concise language',
			'Include actionable information when appropriate',
			'Use appropriate color contrast for different alert types'
		],
		wcagCompliance: ['1.4.1', '1.4.3', '2.4.4']
	}
};

/**
 * Tabs component data
 */
const tabsComponent: Component = {
	name: 'Tabs',
	description: 'A set of layered sections of content that display one panel at a time.',
	usage:
		'Use tabs to organize content into multiple sections and allow users to navigate between them.',
	category: 'navigation',
	version: '1.0.0',
	installCommand: 'npx shadcn-svelte@latest add tabs',
	importStatement:
		"import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';",
	props: [
		{
			name: 'defaultValue',
			type: 'string',
			description: 'The default selected tab',
			required: false
		},
		{
			name: 'value',
			type: 'string',
			description: 'The controlled value of the selected tab',
			required: false
		},
		{
			name: 'orientation',
			type: 'string',
			description: 'The orientation of the tabs',
			default: 'horizontal',
			required: false,
			validValues: ['horizontal', 'vertical']
		}
	],
	examples: [
		{
			title: 'Basic Tabs',
			description: 'A simple tabs component with multiple sections',
			code: `<Tabs defaultValue="account" class="w-[400px]">
  <TabsList>
    <TabsTrigger value="account">Account</TabsTrigger>
    <TabsTrigger value="password">Password</TabsTrigger>
  </TabsList>
  <TabsContent value="account">
    <p>Account tab content</p>
  </TabsContent>
  <TabsContent value="password">
    <p>Password tab content</p>
  </TabsContent>
</Tabs>`,
			type: 'basic'
		},
		{
			title: 'Tabs with Form Content',
			description: 'Tabs containing form elements',
			code: `<script>
  import { Tabs, TabsContent, TabsList, TabsTrigger } from "$lib/components/ui/tabs";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Button } from "$lib/components/ui/button";
</script>

<Tabs defaultValue="account" class="w-[400px]">
  <TabsList class="grid w-full grid-cols-2">
    <TabsTrigger value="account">Account</TabsTrigger>
    <TabsTrigger value="password">Password</TabsTrigger>
  </TabsList>
  <TabsContent value="account">
    <div class="space-y-4">
      <div class="space-y-2">
        <Label for="email">Email</Label>
        <Input id="email" type="email" placeholder="m@example.com" />
      </div>
      <div class="space-y-2">
        <Label for="username">Username</Label>
        <Input id="username" placeholder="johndoe" />
      </div>
      <Button>Save changes</Button>
    </div>
  </TabsContent>
  <TabsContent value="password">
    <div class="space-y-4">
      <div class="space-y-2">
        <Label for="current">Current password</Label>
        <Input id="current" type="password" />
      </div>
      <div class="space-y-2">
        <Label for="new">New password</Label>
        <Input id="new" type="password" />
      </div>
      <Button>Change password</Button>
    </div>
  </TabsContent>
</Tabs>`,
			type: 'advanced',
			framework: 'sveltekit'
		},
		{
			title: 'Vertical Tabs',
			description: 'Tabs with vertical orientation',
			code: `<Tabs defaultValue="music" orientation="vertical" class="w-[400px]">
  <TabsList class="w-[200px]">
    <TabsTrigger value="music">Music</TabsTrigger>
    <TabsTrigger value="videos">Videos</TabsTrigger>
    <TabsTrigger value="photos">Photos</TabsTrigger>
  </TabsList>
  <div class="ml-4">
    <TabsContent value="music">Music content</TabsContent>
    <TabsContent value="videos">Videos content</TabsContent>
    <TabsContent value="photos">Photos content</TabsContent>
  </div>
</Tabs>`,
			type: 'advanced'
		}
	],
	relatedComponents: ['Card', 'Button'],
	cssVariables: [
		{
			name: '--tabs-border',
			description: 'Border color for tabs',
			default: 'hsl(214.3 31.8% 91.4%)',
			scope: 'component'
		},
		{
			name: '--tabs-active-background',
			description: 'Background color for active tab',
			default: 'hsl(0 0% 100%)',
			scope: 'component'
		}
	],
	troubleshooting: [
		{
			issue: 'Tab content not showing when tab is selected',
			solution: 'Ensure that the value prop on TabsTrigger matches the value prop on TabsContent'
		},
		{
			issue: 'Tabs not switching properly',
			solution:
				'Check if you are using both defaultValue and value props; use defaultValue for uncontrolled components and value for controlled components'
		}
	],
	accessibility: {
		ariaAttributes: [
			{
				name: 'aria-selected',
				description: 'Indicates whether the tab is selected',
				required: false
			},
			{
				name: 'aria-controls',
				description: 'Identifies the tab panel controlled by the tab',
				required: false
			}
		],
		keyboardInteractions: [
			{
				key: 'Tab',
				description: 'Moves focus to the next focusable element'
			},
			{
				key: 'Arrow Left/Right',
				description: 'Moves focus to the previous/next tab (horizontal orientation)'
			},
			{
				key: 'Arrow Up/Down',
				description: 'Moves focus to the previous/next tab (vertical orientation)'
			},
			{
				key: 'Home',
				description: 'Moves focus to the first tab'
			},
			{
				key: 'End',
				description: 'Moves focus to the last tab'
			}
		],
		bestPractices: [
			'Use concise and descriptive tab labels',
			'Avoid using more than 7 tabs',
			'Keep content within tabs focused and related'
		],
		wcagCompliance: ['2.1.1', '2.4.3', '4.1.2']
	}
};

/**
 * Toast component data
 */
const toastComponent: Component = {
	name: 'Toast',
	description: 'A succinct message that is displayed temporarily.',
	usage: 'Use toasts to show brief notifications or feedback to the user.',
	category: 'feedback',
	version: '1.0.0',
	installCommand: 'npx shadcn-svelte@latest add toast',
	importStatement: "import { toast } from '$lib/components/ui/toast';",
	props: [
		{
			name: 'title',
			type: 'string',
			description: 'The title of the toast',
			required: false
		},
		{
			name: 'description',
			type: 'string',
			description: 'The description of the toast',
			required: false
		},
		{
			name: 'variant',
			type: 'string',
			description: 'The variant of the toast',
			default: 'default',
			required: false,
			validValues: ['default', 'destructive']
		},
		{
			name: 'duration',
			type: 'number',
			description: 'The duration of the toast in milliseconds',
			default: '5000',
			required: false
		}
	],
	examples: [
		{
			title: 'Basic Toast',
			description: 'A simple toast notification',
			code: `<script>
  import { Button } from "$lib/components/ui/button";
  import { toast } from "$lib/components/ui/toast";
  
  function showToast() {
    toast({
      title: "Scheduled",
      description: "Your meeting has been scheduled for 4:30 PM"
    });
  }
</script>

<Button on:click={showToast}>Show Toast</Button>`,
			type: 'basic',
			framework: 'sveltekit'
		},
		{
			title: 'Destructive Toast',
			description: 'A toast for destructive or error messages',
			code: `<script>
  import { Button } from "$lib/components/ui/button";
  import { toast } from "$lib/components/ui/toast";
  
  function showErrorToast() {
    toast({
      variant: "destructive",
      title: "Error",
      description: "There was a problem with your request."
    });
  }
</script>

<Button variant="destructive" on:click={showErrorToast}>Show Error Toast</Button>`,
			type: 'basic',
			framework: 'sveltekit'
		},
		{
			title: 'Custom Toast with Action',
			description: 'A toast with a custom action button',
			code: `<script>
  import { Button } from "$lib/components/ui/button";
  import { toast } from "$lib/components/ui/toast";
  
  function showToastWithAction() {
    const { update, dismiss } = toast({
      title: "File uploaded",
      description: "Your file has been uploaded successfully.",
      action: {
        label: "Undo",
        onClick: () => {
          update({
            title: "Undoing...",
            description: "Reverting the upload process."
          });
          
          setTimeout(() => {
            dismiss();
            toast({
              title: "Undone",
              description: "The file upload has been reverted."
            });
          }, 1000);
        }
      }
    });
  }
</script>

<Button on:click={showToastWithAction}>Upload File</Button>`,
			type: 'advanced',
			framework: 'sveltekit'
		}
	],
	relatedComponents: ['Alert', 'Dialog'],
	cssVariables: [
		{
			name: '--toast-background',
			description: 'Background color of the toast',
			default: 'hsl(0 0% 100%)',
			scope: 'component'
		},
		{
			name: '--toast-foreground',
			description: 'Text color of the toast',
			default: 'hsl(222.2 84% 4.9%)',
			scope: 'component'
		},
		{
			name: '--toast-border',
			description: 'Border color of the toast',
			default: 'hsl(214.3 31.8% 91.4%)',
			scope: 'component'
		}
	],
	troubleshooting: [
		{
			issue: 'Toast not appearing when triggered',
			solution: 'Ensure you have added the <Toaster /> component to your layout or page'
		},
		{
			issue: 'Toast disappearing too quickly',
			solution: 'Increase the duration property when calling the toast function'
		},
		{
			issue: 'Multiple toasts overlapping',
			solution:
				'The toast system automatically stacks toasts, but you can customize the behavior by modifying the Toaster component'
		}
	],
	accessibility: {
		ariaAttributes: [
			{
				name: 'role',
				description: 'The ARIA role for the toast',
				required: false
			},
			{
				name: 'aria-live',
				description: 'Indicates that the toast is a live region',
				required: false
			}
		],
		keyboardInteractions: [
			{
				key: 'Escape',
				description: 'Dismisses the toast'
			}
		],
		bestPractices: [
			'Keep toast messages brief and clear',
			'Use appropriate toast duration based on content length',
			'Provide a way for users to dismiss toasts manually'
		],
		wcagCompliance: ['1.4.3', '2.2.1', '4.1.3']
	}
};

/**
 * Component categories
 */
export const initialCategories: ComponentCategory[] = [
	{
		name: 'form',
		description: 'Form controls and input components',
		components: ['Button', 'Input', 'Checkbox', 'Radio', 'Select', 'Textarea', 'Switch', 'Slider']
	},
	{
		name: 'layout',
		description: 'Layout and structural components',
		components: ['Card', 'Container', 'Grid', 'Stack', 'Separator', 'Sheet', 'AspectRatio']
	},
	{
		name: 'navigation',
		description: 'Navigation and menu components',
		components: ['Breadcrumb', 'Menu', 'Tabs', 'Pagination', 'NavigationMenu', 'Dropdown']
	},
	{
		name: 'feedback',
		description: 'Feedback and status components',
		components: ['Alert', 'Toast', 'Progress', 'Spinner', 'Badge', 'Dialog', 'Tooltip']
	},
	{
		name: 'data-display',
		description: 'Components for displaying data',
		components: ['Table', 'Calendar', 'Avatar', 'Carousel', 'Accordion']
	},
	{
		name: 'overlay',
		description: 'Components that overlay the UI',
		components: ['Dialog', 'Drawer', 'Popover', 'HoverCard', 'Sheet']
	}
];

/**
 * Installation guides
 */
export const initialInstallationGuides: InstallationGuide[] = [
	{
		framework: 'sveltekit',
		requirements: ['Node.js 16+', 'SvelteKit project', 'Tailwind CSS'],
		steps: [
			{
				order: 1,
				description: 'Initialize shadcn-svelte in your project',
				command: 'npx shadcn-svelte@latest init'
			},
			{
				order: 2,
				description: 'Add components as needed',
				command: 'npx shadcn-svelte@latest add button'
			},
			{
				order: 3,
				description: 'Import and use components in your Svelte files',
				code: "import { Button } from '$lib/components/ui/button';"
			}
		],
		troubleshooting: [
			{
				issue: 'Components not found after installation',
				solution:
					'Check that the components are installed in the correct directory and imports are correct'
			},
			{
				issue: 'Tailwind CSS styles not applying',
				solution:
					'Ensure Tailwind CSS is properly configured in your project and that you have added the necessary Tailwind directives to your CSS file'
			},
			{
				issue: 'TypeScript errors with component imports',
				solution:
					'Make sure your tsconfig.json includes the proper paths and that you have installed the required dependencies'
			}
		]
	},
	{
		framework: 'vite',
		requirements: ['Node.js 16+', 'Vite + Svelte project', 'Tailwind CSS'],
		steps: [
			{
				order: 1,
				description: 'Initialize shadcn-svelte in your Vite project',
				command: 'npx shadcn-svelte@latest init'
			},
			{
				order: 2,
				description: 'Configure your vite.config.js for proper path resolution',
				code: `import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'path';

export default defineConfig({
  plugins: [svelte()],
  resolve: {
    alias: {
      '$lib': path.resolve('./src/lib')
    }
  }
});`
			},
			{
				order: 3,
				description: 'Add components to your project',
				command: 'npx shadcn-svelte@latest add button'
			}
		],
		troubleshooting: [
			{
				issue: 'Path alias not working',
				solution:
					'Ensure you have imported path in your vite.config.js and that the alias is correctly configured'
			},
			{
				issue: 'Components not showing up correctly',
				solution:
					'Make sure Tailwind CSS is properly configured and that you have added the Tailwind directives to your CSS'
			}
		]
	},
	{
		framework: 'astro',
		requirements: ['Node.js 16+', 'Astro project', 'Tailwind CSS', 'Svelte integration'],
		steps: [
			{
				order: 1,
				description: 'Add Svelte integration to your Astro project',
				command: 'npx astro add svelte'
			},
			{
				order: 2,
				description: 'Add Tailwind CSS to your Astro project',
				command: 'npx astro add tailwind'
			},
			{
				order: 3,
				description: 'Initialize shadcn-svelte in your project',
				command: 'npx shadcn-svelte@latest init'
			},
			{
				order: 4,
				description: 'Add components as needed',
				command: 'npx shadcn-svelte@latest add button'
			},
			{
				order: 5,
				description: 'Use components in your Astro files',
				code: `---
import Button from '../components/ui/button/Button.svelte';
---

<Button client:load>Click me</Button>`
			}
		],
		troubleshooting: [
			{
				issue: 'Svelte components not rendering in Astro',
				solution:
					'Make sure to add the client:load directive to your Svelte components in Astro files'
			},
			{
				issue: 'Styling issues in Astro',
				solution: 'Ensure your Tailwind configuration includes the paths to your Svelte components'
			}
		]
	}
];

/**
 * All initial components
 */
export const initialComponents: Component[] = [
	buttonComponent,
	inputComponent,
	cardComponent,
	checkboxComponent,
	selectComponent,
	alertComponent,
	tabsComponent,
	toastComponent
];

/**
 * Function to populate the documentation store with initial data
 */
export function getInitialData() {
	return {
		components: initialComponents,
		categories: initialCategories,
		installationGuides: initialInstallationGuides
	};
}
