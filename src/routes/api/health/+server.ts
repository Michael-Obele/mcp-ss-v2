/**
 * Health Check API Endpoint
 *
 * This endpoint provides health status information about the MCP server.
 * It can be used for monitoring and automated health checks.
 */

import { json } from '@sveltejs/kit';
import { mcpServer } from '$lib/mcp/core/init';
import { LogLevel } from '$lib/mcp/core/server';
import { documentationStore } from '$lib/mcp/core/documentation-store';
import { config } from '$lib/mcp/core/config';
import type { RequestHandler } from './$types';

/**
 * GET handler for health check
 */
export const GET: RequestHandler = async ({ request }) => {
	try {
		// Get basic stats
		const stats = documentationStore.getStats();
		const serverInfo = mcpServer.getServerInfo();
		const uptime = process.uptime();

		// Create health status response
		const healthStatus = {
			status: 'healthy',
			timestamp: new Date().toISOString(),
			server: {
				name: serverInfo.name,
				version: serverInfo.version,
				uptime: uptime,
				environment: config.deployment.environment
			},
			documentation: {
				components: stats.totalComponents,
				categories: stats.totalCategories,
				installationGuides: stats.totalInstallationGuides
			}
		};

		// Log health check
		mcpServer.log(LogLevel.DEBUG, 'Health check request', {
			clientIp: request.headers.get('x-forwarded-for') || 'unknown',
			userAgent: request.headers.get('user-agent') || 'unknown'
		});

		return json(healthStatus, { status: 200 });
	} catch (error) {
		// Log error
		mcpServer.log(LogLevel.ERROR, 'Error processing health check request', error);

		// Return error response
		return json(
			{
				status: 'unhealthy',
				timestamp: new Date().toISOString(),
				error: String(error)
			},
			{ status: 500 }
		);
	}
};
