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
	try {
		// Get client IP for rate limiting
		const clientIp = request.headers.get('x-forwarded-for') || 'unknown';

		// Check rate limit
		if (mcpServer.checkRateLimit(clientIp)) {
			const errorResponse = json(
				mcpServer.createError(
					MCPErrorCode.RATE_LIMIT_EXCEEDED,
					'Rate limit exceeded. Please try again later.'
				),
				{ status: 429 }
			);
			return applyResponseHeaders(request, errorResponse);
		}

		// Log the request
		mcpServer.log(LogLevel.INFO, `GET request from ${clientIp}`);

		// Create a discovery request for the protocol handler
		const discoveryRequest = {
			type: 'all'
		};

		// Process the request using the MCP protocol handler
		const response = await processMCPRequest(mcpServer, discoveryRequest, clientIp);

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
							statusCode = 400; // Bad Request
							break;
						case MCPErrorCode.RATE_LIMIT_EXCEEDED:
							statusCode = 429; // Too Many Requests
							break;
						default:
							statusCode = 500; // Internal Server Error
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
		mcpServer.log(LogLevel.ERROR, 'Error processing GET request', error);

		const errorResponse = json(
			mcpServer.createError(
				MCPErrorCode.INTERNAL_ERROR,
				'An internal error occurred while processing the request',
				String(error)
			),
			{ status: 500 } // Internal Server Error
		);
		return applyResponseHeaders(request, errorResponse);
	}
};

/**
 * POST handler for MCP protocol requests
 */
export const POST: RequestHandler = async ({ request }) => {
	try {
		// Get client IP for rate limiting
		const clientIp = request.headers.get('x-forwarded-for') || 'unknown';

		// Validate content type
		const contentType = request.headers.get('content-type');
		if (!mcpServer.validateContentType(contentType)) {
			const errorResponse = json(
				mcpServer.createError(
					MCPErrorCode.INVALID_REQUEST,
					'Invalid Content-Type. Expected application/json'
				),
				{ status: 415 } // Unsupported Media Type
			);
			return applyResponseHeaders(request, errorResponse);
		}

		// Check request size
		const contentLength = request.headers.get('content-length');
		if (contentLength) {
			const size = parseInt(contentLength, 10);
			const maxSize = mcpServer.getConfig().maxRequestSize;
			if (size > maxSize) {
				const errorResponse = json(
					mcpServer.createError(
						MCPErrorCode.INVALID_REQUEST,
						`Request too large. Maximum size is ${maxSize} bytes`
					),
					{ status: 413 } // Payload Too Large
				);
				return applyResponseHeaders(request, errorResponse);
			}
		}

		// Parse request body
		let body;
		try {
			body = await request.json();
		} catch (parseError) {
			const errorResponse = json(
				mcpServer.createError(
					MCPErrorCode.INVALID_REQUEST,
					'Invalid JSON in request body',
					String(parseError)
				),
				{ status: 400 } // Bad Request
			);
			return applyResponseHeaders(request, errorResponse);
		}

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
							statusCode = 400; // Bad Request
							break;
						case MCPErrorCode.TOOL_NOT_FOUND:
						case MCPErrorCode.COMPONENT_NOT_FOUND:
							statusCode = 404; // Not Found
							break;
						case MCPErrorCode.RATE_LIMIT_EXCEEDED:
							statusCode = 429; // Too Many Requests
							break;
						case MCPErrorCode.VALIDATION_ERROR:
							statusCode = 422; // Unprocessable Entity
							break;
						default:
							statusCode = 500; // Internal Server Error
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

		const errorResponse = json(
			mcpServer.createError(
				MCPErrorCode.INTERNAL_ERROR,
				'An internal error occurred while processing the request',
				String(error)
			),
			{ status: 500 } // Internal Server Error
		);
		return applyResponseHeaders(request, errorResponse);
	}
};
