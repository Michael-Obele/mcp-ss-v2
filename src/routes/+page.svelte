<script lang="ts">
	import { mcpServer } from '$lib/mcp/core/init';
	import { documentationStore } from '$lib/mcp/core/documentation-store';
	import { mcpTools } from '$lib/mcp/tools';

	// Get server info
	const serverInfo = mcpServer.getServerInfo();

	// Get documentation store statistics
	const stats = documentationStore.getStats();

	// Get all components
	const components = documentationStore.getAllComponents();

	// Get all categories
	const categories = documentationStore.getAllCategories();

	// Get all installation guides
	const installationGuides = documentationStore.getAllInstallationGuides();
</script>

<svelte:head>
	<title>{serverInfo.name}</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<header class="mb-8">
		<h1 class="mb-2 text-4xl font-bold">{serverInfo.name}</h1>
		<p class="text-xl text-gray-600">{serverInfo.description}</p>
		<p class="text-sm text-gray-500">Version: {serverInfo.version}</p>
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
			<h2 class="mb-4 text-2xl font-semibold">Server Capabilities</h2>
			<div class="rounded-md bg-gray-100 p-4">
				<h3 class="mb-2 font-semibold">Supported Capabilities</h3>
				<div class="flex flex-wrap gap-2">
					{#each serverInfo.capabilities as capability}
						<span
							class="inline-block rounded bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800"
						>
							{capability}
						</span>
					{/each}
				</div>
			</div>
		</section>

		<section class="mb-8">
			<h2 class="mb-4 text-2xl font-semibold">Documentation Store</h2>
			<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
				<div class="rounded-md bg-gray-100 p-4">
					<h3 class="mb-2 font-semibold">Statistics</h3>
					<ul class="list-disc pl-6">
						<li>Total Components: {stats.totalComponents}</li>
						<li>Total Categories: {stats.totalCategories}</li>
						<li>Total Installation Guides: {stats.totalInstallationGuides}</li>
						<li>Components with Examples: {stats.componentsWithExamples}</li>
						<li>Components with Troubleshooting: {stats.componentsWithTroubleshooting}</li>
					</ul>
				</div>

				<div class="rounded-md bg-gray-100 p-4">
					<h3 class="mb-2 font-semibold">Available Components</h3>
					<div class="flex flex-wrap gap-2">
						{#each components as component}
							<span
								class="inline-block rounded bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800"
							>
								{component.name}
							</span>
						{/each}
					</div>
				</div>
			</div>

			<div class="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
				<div class="rounded-md bg-gray-100 p-4">
					<h3 class="mb-2 font-semibold">Component Categories</h3>
					<div class="flex flex-wrap gap-2">
						{#each categoryNames as name}
							<span
								class="inline-block rounded bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800"
							>
								{name}
							</span>
						{/each}
					</div>

					{#each categoryNames as categoryName}
						<div class="mt-4">
							<h4 class="text-sm font-medium">{categoryName}</h4>
							<div class="mt-1 flex flex-wrap gap-1">
								{#each documentationStore.getComponentsByCategory(categoryName) as component}
									<span class="inline-block rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
										{component.name}
									</span>
								{/each}
							</div>
						</div>
					{/each}
				</div>

				<div class="rounded-md bg-gray-100 p-4">
					<h3 class="mb-2 font-semibold">Installation Guides</h3>
					<div class="flex flex-wrap gap-2">
						{#each frameworkNames as name}
							<span
								class="inline-block rounded bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800"
							>
								{name}
							</span>
						{/each}
					</div>

					{#each frameworkNames as framework}
						{@const guide = documentationStore.getInstallationGuide(framework)}
						{#if guide}
							<div class="mt-4">
								<h4 class="text-sm font-medium">{guide.framework}</h4>
								<p class="mt-1 text-xs text-gray-600">
									Requirements: {guide.requirements.join(', ')}
								</p>
								<p class="text-xs text-gray-600">Steps: {guide.steps.length}</p>
							</div>
						{/if}
					{/each}
				</div>
			</div>
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
				{#each mcpTools as tool}
					<li class="mb-2">
						<strong>{tool.name}</strong> - {tool.description}
					</li>
				{/each}
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
