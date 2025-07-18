# shadcn-svelte MCP Server

A Model Context Protocol (MCP) server for shadcn-svelte component documentation, enabling AI assistants and language models to access structured information about shadcn-svelte components.

## Overview

This project provides a standardized MCP interface for AI systems to query and retrieve information about shadcn-svelte components, their usage, configuration options, and examples. It serves as a bridge between AI assistants and the shadcn-svelte documentation, allowing for natural language queries and structured responses.

## Features

- **Component Information**: Retrieve detailed information about specific shadcn-svelte components
- **Code Examples**: Access code snippets and usage examples for components
- **Theming Guidance**: Get information about theming and customizing components
  - Advanced CSS variable filtering and discovery
  - Component-specific theming documentation
  - Cross-component variable relationships
- **Troubleshooting Help**: Find solutions for common issues with components
- **Search Functionality**: Search for components based on keywords or functionality
- **Pagination Support**: Navigate through large sets of component data efficiently
- **Advanced Filtering**: Filter components by category, topic, example type, and framework

## MCP Tools

The server provides the following MCP tools:

- `getComponentInfo`: Retrieves general information about a specific component
- `getComponentExample`: Retrieves code examples for a specific component
- `searchComponents`: Searches for components based on keywords or functionality
- `getThemingInfo`: Retrieves information about theming and customizing components
- `getTroubleshooting`: Retrieves troubleshooting information for common issues

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm, pnpm, or bun package manager
- SvelteKit project
- Tailwind CSS

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/shadcn-svelte-mcp.git
cd shadcn-svelte-mcp
```

2. Install dependencies:

```bash
npm install
# or
pnpm install
# or
bun install
```

3. Start the development server:

```bash
npm run dev
# or
npm run dev -- --open
```

4. Configure environment (optional):

Create a `.env` file in the project root based on the provided `.env.example`:

```bash
# Copy the example environment file
cp .env.example .env

# Edit the .env file with your preferred settings
nano .env
```

Key environment variables:

```bash
# Server configuration
MCP_SERVER_NAME=shadcn-svelte-mcp
MCP_SERVER_VERSION=0.1.0
MCP_SERVER_DESCRIPTION="MCP server for shadcn-svelte component documentation"
MCP_LOG_LEVEL=info
PUBLIC_BASE_URL=/api/mcp

# Rate limiting
MCP_RATE_LIMIT_ENABLED=true
MCP_RATE_LIMIT_MAX_REQUESTS=100
MCP_RATE_LIMIT_TIME_WINDOW=60000

# CORS configuration
MCP_CORS_ENABLED=true
MCP_CORS_ALLOWED_ORIGINS=*
MCP_CORS_ALLOWED_METHODS=GET,POST,OPTIONS
MCP_CORS_ALLOWED_HEADERS=Content-Type,Authorization,X-Requested-With
MCP_CORS_ALLOW_CREDENTIALS=true
MCP_CORS_MAX_AGE=86400

# Security settings
MCP_SECURITY_CSP_ENABLED=true
MCP_SECURITY_HSTS_ENABLED=true
MCP_SECURITY_XFRAME_ENABLED=true
MCP_SECURITY_XCONTENT_ENABLED=true

# Server settings
PORT=3000
HOST=localhost
```

See the [Deployment Guide](deployment.md) for a complete list of environment variables and configuration options.

## Usage

The MCP server exposes an API endpoint at `/api/mcp` that accepts MCP protocol requests. AI assistants and language models can connect to this endpoint to query shadcn-svelte component documentation.

### Example Request

```json
{
	"tool": "getComponentInfo",
	"params": {
		"componentName": "Button"
	}
}
```

### Example Response

```json
{
	"result": {
		"componentName": "Button",
		"topic": "info",
		"content": "A versatile button component with multiple variants and sizes.\n\nUsage: Use buttons to trigger actions, submit forms, or navigate between pages.",
		"props": [
			{
				"name": "variant",
				"type": "string",
				"description": "The visual style variant of the button",
				"default": "default",
				"required": false,
				"validValues": ["default", "destructive", "outline", "secondary", "ghost", "link"]
			}
			// Additional props...
		],
		"examples": [
			// Component examples...
		],
		"relatedComponents": ["Input", "Form"],
		"cssVariables": [
			// CSS variables...
		],
		"troubleshooting": [
			// Troubleshooting items...
		]
	},
	"status": "success"
}
```

## Integration with AI Assistants

To integrate this MCP server with AI assistants:

1. Deploy this MCP server to your preferred hosting environment
2. Configure your AI assistant to connect to the MCP endpoint at `/api/mcp`
3. Set up authentication if required (see documentation)
4. Test the connection by requesting server information

### Example Configuration

```json
{
	"mcpServers": {
		"shadcn-svelte": {
			"url": "https://your-server-url.com/api/mcp",
			"auth": {
				"type": "bearer",
				"token": "your-auth-token"
			}
		}
	}
}
```

## Building and Deployment

### Building for Production

To create a production version of the server:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

### Deployment Options

- **Vercel/Netlify:** Connect your repository and deploy with automatic CI/CD
- **Docker:** Use the provided Dockerfile to build and deploy as a container:

  ```bash
  # Build the Docker image
  docker build -t shadcn-svelte-mcp .

  # Run the container
  docker run -p 3000:3000 --env-file .env shadcn-svelte-mcp
  ```

- **Node.js Server:** Deploy as a standard Node.js application

For detailed deployment instructions and configuration options, see the [Deployment Guide](deployment.md).

## Testing

Run the test suite:

```bash
npm run test
```

## License

[MIT](LICENSE)
