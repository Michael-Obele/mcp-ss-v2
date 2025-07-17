/**
 * MCP API Server Route
 *
 * This file handles MCP API requests and routes them to the appropriate handlers.
 */

import { json } from '@sveltejs/kit';
import { initServer } from '$lib/mcp/core/server';
import { mcpTools } from '$lib/mcp/tools';
import type { RequestHandler } from './$types';

// Initialize the MCP server
const server = initServer();

/**
 * GET handler for MCP server discovery
 */
export const GET: RequestHandler = async () => {
	// Return server information and available tools
	return json({
		server: {
			name: server.name,
			version: server.version,
			description: server.description,
			capabilities: server.capabilities
		},
		tools: mcpTools
	});
};

/**
 * POST handler for MCP tool execution
 * This will be implemented in future tasks
 */
export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();

		// For now, just return a placeholder response
		// Tool execution will be implemented in future tasks
		return json({
			status: 'success',
			message: 'MCP server is set up, but tool execution is not yet implemented',
			request: body
		});
	} catch (error) {
		return json(
			{
				status: 'error',
				message: 'Invalid request',
				error: String(error)
			},
			{ status: 400 }
		);
	}
};
