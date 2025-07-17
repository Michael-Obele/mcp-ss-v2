<script lang="ts">
	import { defaultServerConfig } from '$lib/mcp/core/server';
</script>

<svelte:head>
	<title>{defaultServerConfig.name}</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<header class="mb-8">
		<h1 class="mb-2 text-4xl font-bold">{defaultServerConfig.name}</h1>
		<p class="text-xl text-gray-600">{defaultServerConfig.description}</p>
		<p class="text-sm text-gray-500">Version: {defaultServerConfig.version}</p>
	</header>

	<main>
		<section class="mb-8">
			<h2 class="mb-4 text-2xl font-semibold">About</h2>
			<p class="mb-4">
				This is an MCP (Model Context Protocol) server for shadcn-svelte component documentation. It
				provides AI assistants and language models with structured access to shadcn-svelte component
				documentation, enabling them to answer questions, provide code examples, and assist
				developers with implementing shadcn-svelte components in their projects.
			</p>
		</section>

		<section class="mb-8">
			<h2 class="mb-4 text-2xl font-semibold">API Endpoints</h2>
			<div class="rounded-md bg-gray-100 p-4">
				<h3 class="mb-2 font-semibold">GET /api/mcp</h3>
				<p class="mb-2">Returns server information and available tools.</p>

				<h3 class="mt-4 mb-2 font-semibold">POST /api/mcp</h3>
				<p class="mb-2">Executes an MCP tool.</p>
			</div>
		</section>

		<section class="mb-8">
			<h2 class="mb-4 text-2xl font-semibold">Available Tools</h2>
			<ul class="list-disc pl-6">
				<li class="mb-2">
					<strong>getComponentInfo</strong> - Retrieves general information about a specific component
				</li>
				<li class="mb-2">
					<strong>getComponentExample</strong> - Retrieves code examples for a specific component
				</li>
				<li class="mb-2">
					<strong>searchComponents</strong> - Searches for components based on keywords or functionality
				</li>
				<li class="mb-2">
					<strong>getThemingInfo</strong> - Retrieves information about theming and customizing components
				</li>
				<li class="mb-2">
					<strong>getTroubleshooting</strong> - Retrieves troubleshooting information for common issues
				</li>
			</ul>
		</section>

		<section>
			<h2 class="mb-4 text-2xl font-semibold">Getting Started</h2>
			<p class="mb-4">
				To use this MCP server with an AI assistant, configure the assistant to connect to the MCP
				server endpoint at <code class="rounded bg-gray-100 px-2 py-1">/api/mcp</code>.
			</p>
			<p>For more information on the Model Context Protocol, refer to the MCP documentation.</p>
		</section>
	</main>
</div>
