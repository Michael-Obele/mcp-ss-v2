import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/**
 * Get environment-specific configuration
 * @returns Configuration object based on environment
 */
function getEnvironmentConfig() {
	// Check if we're in a production environment
	const isProduction = process.env.NODE_ENV === 'production';

	return {
		// Set CSP headers in production
		csp: isProduction
			? {
					directives: {
						'default-src': ["'self'"],
						'script-src': ["'self'"],
						'style-src': ["'self'", "'unsafe-inline'"],
						'img-src': ["'self'", 'data:'],
						'connect-src': ["'self'"],
						'font-src': ["'self'"],
						'object-src': ["'none'"],
						'frame-ancestors': ["'none'"]
					}
				}
			: {},

		// Configure paths
		paths: {
			base: process.env.BASE_PATH || '',
			assets: process.env.ASSETS_PATH || ''
		}
	};
}

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		adapter: adapter({
			// Custom adapter options
			pages: 'build',
			assets: 'build',
			fallback: 'index.html',
			precompress: true,
			strict: true
		}),

		// Define path aliases
		alias: {
			$lib: './src/lib'
		},

		// Environment-specific configuration
		...getEnvironmentConfig(),

		// Configure output options
		output: {
			preloadStrategy: 'modulepreload'
		},

		// Configure service worker
		serviceWorker: {
			register: false // Disable service worker by default
		},

		// Configure server options
		csrf: {
			checkOrigin: true
		}

		// Headers are now configured differently in SvelteKit 2.x
		// We'll handle this in the server hooks instead
	}
};

export default config;
