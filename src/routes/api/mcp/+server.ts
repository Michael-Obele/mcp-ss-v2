/**
 * MCP API Server Route
 *
 * This file handles MCP API requests and routes them to the appropriate handlers.
 * It uses the MCP protocol handlers to process requests according to the MCP specification.
 */

import { json } from '@sveltejs/kit';
import { mcpServer } from '$lib/mcp/core/init';
import { LogLevel, MCPErrorCode, processMCPRequest } from '$lib/mcp/core/server';
import type { RequestHandler } from './$types';

/**
 * Apply CORS and security headers to a response
 * @param request The incoming request
 * @param response The response to apply headers to
 * @returns The response with headers applied
 */
function applyResponseHeaders(request: Request, response: Response): Response {
	// Apply CORS headers
	mcpServer.applyCorsHeaders(request, response);

	// Apply security headers
	mcpServer.applySecurityHeaders(response);

	return response;
}

/**
 * OPTIONS handler for CORS preflight requests
 */
export const OPTIONS: RequestHandler = async ({ request }) => {
	const response = new Response(null, {
		status: 204 // No Content
	});
	return applyResponseHeaders(request, response);
};

/**
 * GET handler for MCP server discovery
 */
export const GET: RequestHandler = async ({ request }) => {
	// Get client IP for rate limiting
	const clientIp = request.headers.get('x-forwarded-for') || 'unknown';

	// Check rate limit
	if (mcpServer.checkRateLimit(clientIp)) {
		return json(
			mcpServer.createError(
				MCPErrorCode.RATE_LIMIT_EXCEEDED,
				'Rate limit exceeded. Please try again later.'
			),
			{ status: 429 }
		);
	}

	// Log the request
	mcpServer.log(LogLevel.INFO, `GET request from ${clientIp}`);

	// Create a discovery request for the protocol handler
	const discoveryRequest = {
		type: 'all'
	};

	// Process the request using the MCP protocol handler
	const response = await processMCPRequest(mcpServer, discoveryRequest, clientIp);

	const jsonResponse = json(response);
	return applyResponseHeaders(request, jsonResponse);
};

/**
 * POST handler for MCP protocol requests
 */
export const POST: RequestHandler = async ({ request }) => {
	try {
		// Get client IP for rate limiting
		const clientIp = request.headers.get('x-forwarded-for') || 'unknown';

		// Parse request body
		const body = await request.json();

		// Log the request (without sensitive data)
		mcpServer.log(LogLevel.INFO, `POST request from ${clientIp}`, {
			requestType: body.tool || body.type || 'unknown'
		});

		// Process the request using the MCP protocol handler
		const response = await processMCPRequest(mcpServer, body, clientIp);

		// Determine the appropriate HTTP status code
		let statusCode = 200;
		if (response && typeof response === 'object') {
			const responseObj = response as Record<string, unknown>;
			if (responseObj.status === 'error') {
				// Use appropriate status codes based on error type
				if (responseObj.error && typeof responseObj.error === 'object') {
					const errorObj = responseObj.error as Record<string, unknown>;
					switch (errorObj.code) {
						case MCPErrorCode.INVALID_REQUEST:
							statusCode = 400;
							break;
						case MCPErrorCode.TOOL_NOT_FOUND:
							statusCode = 404;
							break;
						case MCPErrorCode.RATE_LIMIT_EXCEEDED:
							statusCode = 429;
							break;
						default:
							statusCode = 500;
					}
				} else {
					statusCode = 500;
				}
			}
		}

		const jsonResponse = json(response, { status: statusCode });
		return applyResponseHeaders(request, jsonResponse);
	} catch (error) {
		// Log the error
		mcpServer.log(LogLevel.ERROR, 'Error processing request', error);

		return json(
			mcpServer.createError(
				MCPErrorCode.INTERNAL_ERROR,
				'An internal error occurred while processing the request',
				String(error)
			),
			{ status: 500 }
		);
	}
};
