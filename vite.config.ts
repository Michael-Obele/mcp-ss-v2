import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
	// Load environment variables based on mode
	const env = loadEnv(mode, process.cwd(), '');
	const isProduction = mode === 'production';

	return {
		plugins: [tailwindcss(), sveltekit()],

		// Define environment variables to expose to the client
		define: {
			'process.env.NODE_ENV': JSON.stringify(mode)
		},

		// Configure server options
		server: {
			port: parseInt(env.PORT || '5173', 10),
			strictPort: false,
			host: env.HOST || 'localhost',
			cors: true
		},

		// Configure build options
		build: {
			target: 'esnext',
			outDir: 'build',
			assetsDir: 'assets',
			emptyOutDir: true,
			sourcemap: !isProduction,
			minify: isProduction ? 'esbuild' : false,
			cssMinify: isProduction,
			reportCompressedSize: isProduction,
			chunkSizeWarningLimit: 1000, // KB
			rollupOptions: {
				output: {
					manualChunks: {
						// Split vendor code into separate chunks
						vendor: ['marked', 'highlight.js']
					}
				}
			}
		},

		// Configure optimization
		optimizeDeps: {
			exclude: [],
			include: []
		},

		// Configure resolve options
		resolve: {
			alias: {
				$lib: resolve('./src/lib')
			}
		},

		// Configure test options
		test: {
			projects: [
				{
					extends: './vite.config.ts',
					test: {
						name: 'client',
						environment: 'jsdom',
						include: ['src/**/*.svelte.{test,spec}.{js,ts}', 'src/routes/page.svelte.test.ts'],
						exclude: ['src/lib/server/**'],
						setupFiles: ['./vitest-setup-client.ts'],
						globals: true,
						css: true
					}
				},
				{
					extends: './vite.config.ts',
					test: {
						name: 'browser',
						environment: 'browser',
						browser: {
							enabled: true,
							provider: 'playwright',
							instances: [{ browser: 'chromium' }]
						},
						include: ['src/**/*.browser.{test,spec}.{js,ts}'],
						exclude: ['src/lib/server/**'],
						setupFiles: ['./vitest-setup-client.ts']
					}
				},
				{
					extends: './vite.config.ts',
					test: {
						name: 'server',
						environment: 'node',
						include: ['src/**/*.{test,spec}.{js,ts}'],
						exclude: [
							'src/**/*.svelte.{test,spec}.{js,ts}',
							'src/**/*.browser.{test,spec}.{js,ts}',
							'src/routes/page.svelte.test.ts'
						]
					}
				}
			],
			coverage: {
				provider: 'v8',
				reporter: ['text', 'json', 'html'],
				exclude: ['**/*.{test,spec}.{js,ts}', '**/node_modules/**', '**/dist/**', '**/build/**']
			},
			environment: 'jsdom',
			globals: true,
			css: true
		}
	};
});
