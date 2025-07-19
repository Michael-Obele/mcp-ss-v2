import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * Health check endpoint for monitoring server status
 * Returns 200 OK with server status information
 */
export const GET: RequestHandler = async () => {
	return json({
		status: 'ok',
		timestamp: new Date().toISOString(),
		service: 'shadcn-svelte-mcp',
		version: process.env.PUBLIC_MCP_SERVER_VERSION || '1.0.0'
	});
};
