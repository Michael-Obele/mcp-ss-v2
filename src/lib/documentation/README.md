# shadcn-svelte MCP Server User Guide

This guide provides comprehensive documentation for using the shadcn-svelte MCP (Model Context Protocol) server. The server provides AI assistants and language models with structured access to shadcn-svelte component documentation.

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [MCP Protocol Overview](#mcp-protocol-overview)
4. [Available Tools](#available-tools)
5. [Available Resources](#available-resources)
6. [Integration Examples](#integration-examples)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

## Introduction

The shadcn-svelte MCP server is designed to provide AI assistants and language models with structured access to shadcn-svelte component documentation. This enables AI systems to answer questions, provide code examples, and assist developers with implementing shadcn-svelte components in their projects.

### Key Features

- Component information retrieval
- Code example access
- Theming and customization guidance
- Troubleshooting assistance
- Framework-specific integration support

## Getting Started

### Server Endpoint

The MCP server is accessible via a single HTTP endpoint:

```
POST /api/mcp
```

### Authentication

By default, the server does not require authentication. If authentication is enabled, you will need to include an API key in the request headers:

```
Authorization: Bearer YOUR_API_KEY
```

### Basic Request Structure

All requests to the MCP server should be formatted as JSON with the following structure:

```json
{
	"type": "tool_call",
	"tool": "toolName",
	"parameters": {
		"param1": "value1",
		"param2": "value2"
	}
}
```

Or for resource requests:

```json
{
	"type": "resource_request",
	"resource": "resourceName",
	"parameters": {
		"param1": "value1",
		"param2": "value2"
	}
}
```

### Basic Response Structure

Responses from the MCP server will be formatted as JSON with the following structure:

```json
{
	"type": "tool_response",
	"tool": "toolName",
	"result": {
		// Tool-specific result data
	}
}
```

Or for resource responses:

```json
{
	"type": "resource_response",
	"resource": "resourceName",
	"result": {
		// Resource-specific result data
	}
}
```

## MCP Protocol Overview

The Model Context Protocol (MCP) is a standardized protocol for AI systems to interact with external data sources and tools. The shadcn-svelte MCP server implements this protocol to provide access to shadcn-svelte documentation.

### Request Types

The MCP server supports the following request types:

1. **Tool Discovery**: Retrieve information about available tools
2. **Tool Call**: Execute a specific tool
3. **Resource Discovery**: Retrieve information about available resources
4. **Resource Request**: Request a specific resource

### Tool Discovery

To discover available tools, send a request with the type `tool_discovery`:

```json
{
	"type": "tool_discovery"
}
```

The server will respond with a list of available tools and their parameters:

```json
{
	"type": "tool_discovery_response",
	"tools": [
		{
			"name": "getComponentInfo",
			"description": "Retrieves general information about a specific component",
			"parameters": {
				"componentName": {
					"type": "string",
					"description": "Name of the component to retrieve information for"
				}
			}
		}
		// Additional tools...
	]
}
```

### Resource Discovery

To discover available resources, send a request with the type `resource_discovery`:

```json
{
	"type": "resource_discovery"
}
```

The server will respond with a list of available resources:

```json
{
	"type": "resource_discovery_response",
	"resources": [
		{
			"name": "components",
			"description": "Component documentation with filtering and pagination",
			"path": "/components"
		}
		// Additional resources...
	]
}
```

## Available Tools

The shadcn-svelte MCP server provides the following tools:

### getComponentInfo

Retrieves general information about a specific component.

**Parameters:**

- `componentName` (string, required): Name of the component to retrieve information for

**Example Request:**

```json
{
	"type": "tool_call",
	"tool": "getComponentInfo",
	"parameters": {
		"componentName": "Button"
	}
}
```

**Example Response:**

```json
{
	"type": "tool_response",
	"tool": "getComponentInfo",
	"result": {
		"name": "Button",
		"description": "A button component that can be used to trigger an action.",
		"usage": "import { Button } from '@shadcn/svelte'",
		"props": [
			{
				"name": "variant",
				"type": "string",
				"description": "Button variant (default, outline, ghost, link)",
				"default": "default",
				"required": false
			}
			// Additional props...
		],
		"relatedComponents": ["ButtonGroup", "IconButton"]
	}
}
```

### getComponentExample

Retrieves code examples for a specific component.

**Parameters:**

- `componentName` (string, required): Name of the component to retrieve examples for
- `exampleType` (string, optional): Type of example to retrieve (basic, advanced, theming, etc.)

**Example Request:**

```json
{
	"type": "tool_call",
	"tool": "getComponentExample",
	"parameters": {
		"componentName": "Button",
		"exampleType": "basic"
	}
}
```

**Example Response:**

```json
{
	"type": "tool_response",
	"tool": "getComponentExample",
	"result": [
		{
			"title": "Basic Button",
			"description": "A basic button component example",
			"code": "<script>\n  import { Button } from '@shadcn/svelte';\n</script>\n\n<Button>Click me</Button>",
			"type": "basic"
		}
	]
}
```

### searchComponents

Searches for components based on keywords or functionality.

**Parameters:**

- `query` (string, required): Search query

**Example Request:**

```json
{
	"type": "tool_call",
	"tool": "searchComponents",
	"parameters": {
		"query": "form input"
	}
}
```

**Example Response:**

```json
{
	"type": "tool_response",
	"tool": "searchComponents",
	"result": [
		{
			"name": "Input",
			"description": "A form input component.",
			"relevance": 0.95
		},
		{
			"name": "Form",
			"description": "A form component with validation.",
			"relevance": 0.9
		},
		{
			"name": "Textarea",
			"description": "A multi-line text input component.",
			"relevance": 0.8
		}
	]
}
```

### getThemingInfo

Retrieves information about theming and customizing components.

**Parameters:**

- `componentName` (string, optional): Name of the component to retrieve theming information for

**Example Request:**

```json
{
	"type": "tool_call",
	"tool": "getThemingInfo",
	"parameters": {
		"componentName": "Button"
	}
}
```

**Example Response:**

```json
{
	"type": "tool_response",
	"tool": "getThemingInfo",
	"result": {
		"cssVariables": [
			{
				"name": "--button-background",
				"description": "Button background color",
				"default": "hsl(var(--primary))"
			}
			// Additional CSS variables...
		],
		"themingGuide": "To customize the Button component, you can override the CSS variables in your global CSS file or use the variant prop to select a predefined style."
	}
}
```

### getTroubleshooting

Retrieves troubleshooting information for common issues.

**Parameters:**

- `componentName` (string, required): Name of the component to retrieve troubleshooting information for
- `issue` (string, optional): Specific issue to troubleshoot

**Example Request:**

```json
{
	"type": "tool_call",
	"tool": "getTroubleshooting",
	"parameters": {
		"componentName": "Button",
		"issue": "not rendering"
	}
}
```

**Example Response:**

```json
{
	"type": "tool_response",
	"tool": "getTroubleshooting",
	"result": [
		{
			"issue": "Button not rendering correctly",
			"solution": "Ensure you have imported the Button component correctly and that you have set up Tailwind CSS in your project.",
			"relatedProps": ["variant", "size"]
		}
	]
}
```

## Available Resources

The shadcn-svelte MCP server provides the following resources:

### components

Component documentation with filtering and pagination.

**Parameters:**

- `filter` (string, optional): Filter components by name or description
- `page` (number, optional): Page number for pagination
- `pageSize` (number, optional): Number of items per page

**Example Request:**

```json
{
	"type": "resource_request",
	"resource": "components",
	"parameters": {
		"filter": "button",
		"page": 1,
		"pageSize": 10
	}
}
```

### component

Detailed information about a specific component.

**Parameters:**

- `componentName` (string, required): Name of the component

**Example Request:**

```json
{
	"type": "resource_request",
	"resource": "component",
	"parameters": {
		"componentName": "Button"
	}
}
```

### categories

Component categories.

**Parameters:**

- `categoryName` (string, optional): Name of a specific category

**Example Request:**

```json
{
	"type": "resource_request",
	"resource": "categories"
}
```

### category-components

Components in a specific category with pagination.

**Parameters:**

- `categoryName` (string, required): Name of the category
- `page` (number, optional): Page number for pagination
- `pageSize` (number, optional): Number of items per page

**Example Request:**

```json
{
	"type": "resource_request",
	"resource": "category-components",
	"parameters": {
		"categoryName": "Form",
		"page": 1,
		"pageSize": 10
	}
}
```

### installation-guides

Installation guides.

**Parameters:**

- `framework` (string, optional): Framework name (sveltekit, vite, astro)

**Example Request:**

```json
{
	"type": "resource_request",
	"resource": "installation-guides",
	"parameters": {
		"framework": "sveltekit"
	}
}
```

### examples

Component examples.

**Parameters:**

- `componentName` (string, required): Name of the component
- `exampleType` (string, optional): Type of example

**Example Request:**

```json
{
	"type": "resource_request",
	"resource": "examples",
	"parameters": {
		"componentName": "Button",
		"exampleType": "basic"
	}
}
```

### theming

Theming documentation.

**Parameters:**

- `componentName` (string, optional): Name of the component

**Example Request:**

```json
{
	"type": "resource_request",
	"resource": "theming",
	"parameters": {
		"componentName": "Button"
	}
}
```

### troubleshooting

Troubleshooting guides.

**Parameters:**

- `componentName` (string, required): Name of the component
- `issue` (string, optional): Specific issue

**Example Request:**

```json
{
	"type": "resource_request",
	"resource": "troubleshooting",
	"parameters": {
		"componentName": "Button",
		"issue": "not rendering"
	}
}
```

## Integration Examples

### Node.js Integration

```javascript
const fetch = require('node-fetch');

async function queryMCPServer(requestData) {
	const response = await fetch('https://your-mcp-server.com/api/mcp', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
			// Include authentication if required
			// 'Authorization': 'Bearer YOUR_API_KEY'
		},
		body: JSON.stringify(requestData)
	});

	return await response.json();
}

// Example: Get component information
async function getComponentInfo(componentName) {
	const result = await queryMCPServer({
		type: 'tool_call',
		tool: 'getComponentInfo',
		parameters: {
			componentName
		}
	});

	return result;
}

// Example usage
getComponentInfo('Button')
	.then((result) => console.log(result))
	.catch((error) => console.error(error));
```

### Python Integration

```python
import requests
import json

def query_mcp_server(request_data):
    response = requests.post(
        'https://your-mcp-server.com/api/mcp',
        headers={
            'Content-Type': 'application/json',
            # Include authentication if required
            # 'Authorization': 'Bearer YOUR_API_KEY'
        },
        json=request_data
    )

    return response.json()

# Example: Get component information
def get_component_info(component_name):
    result = query_mcp_server({
        'type': 'tool_call',
        'tool': 'getComponentInfo',
        'parameters': {
            'componentName': component_name
        }
    })

    return result

# Example usage
if __name__ == '__main__':
    result = get_component_info('Button')
    print(json.dumps(result, indent=2))
```

### AI Assistant Integration

For AI assistants that support the MCP protocol, you can configure the server as an MCP provider:

```json
{
	"mcp_providers": [
		{
			"name": "shadcn-svelte-docs",
			"url": "https://your-mcp-server.com/api/mcp",
			"description": "shadcn-svelte component documentation"
		}
	]
}
```

## Best Practices

### Efficient Querying

1. **Use Specific Queries**: When searching for components, use specific terms related to the component's functionality.

2. **Combine Tools and Resources**: Use both tools and resources to get comprehensive information. For example, use `getComponentInfo` to get basic information and then request the `examples` resource for code examples.

3. **Pagination**: When requesting large collections of data, use pagination to improve performance.

### Error Handling

1. **Check Response Status**: Always check the response status and handle errors appropriately.

2. **Validate Parameters**: Ensure that required parameters are provided and have valid values.

3. **Retry Logic**: Implement retry logic for transient errors, with appropriate backoff strategies.

## Troubleshooting

### Common Issues

1. **CORS Errors**: If you encounter CORS errors, ensure that your domain is included in the server's allowed origins.

2. **Rate Limiting**: The server may implement rate limiting to prevent abuse. If you receive a 429 Too Many Requests response, reduce your request frequency.

3. **Authentication Errors**: If authentication is enabled, ensure that you are providing a valid API key in the request headers.

4. **Invalid Requests**: Ensure that your requests are properly formatted according to the MCP protocol specification.

### Getting Help

If you encounter issues not covered in this guide:

1. Check the GitHub repository issues
2. Review the MCP protocol specification
3. Contact the server administrator
