/**
 * MCP Transport Layer Tests
 *
 * This file contains tests for the MCP transport layer, including CORS and security settings.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MCPServer, MCPErrorCode, LogLevel } from './server';

describe('MCP Transport Layer', () => {
	let server: MCPServer;
	let mockRequest: Request;
	let mockResponse: Response;

	beforeEach(() => {
		// Initialize a test server
		server = new MCPServer({
			cors: {
				enabled: true,
				allowedOrigins: ['https://example.com', 'https://test.com'],
				allowedMethods: ['GET', 'POST', 'OPTIONS'],
				allowedHeaders: ['Content-Type', 'Authorization'],
				allowCredentials: true,
				maxAge: 3600
			},
			security: {
				contentSecurityPolicy: true,
				strictTransportSecurity: true,
				xFrameOptions: true,
				xContentTypeOptions: true
			}
		});

		// Create mock request and response
		mockRequest = new Request('https://api.example.com/mcp', {
			headers: {
				origin: 'https://example.com',
				'content-type': 'application/json'
			}
		});

		mockResponse = new Response(null, {
			status: 200,
			headers: new Headers()
		});
	});

	describe('CORS Configuration', () => {
		it('should correctly check if CORS is allowed for an origin', () => {
			expect(server.isCorsAllowed('https://example.com')).toBe(true);
			expect(server.isCorsAllowed('https://test.com')).toBe(true);
			expect(server.isCorsAllowed('https://unknown.com')).toBe(false);
		});

		it('should allow all origins when wildcard is configured', () => {
			const wildcardServer = new MCPServer({
				cors: {
					enabled: true,
					allowedOrigins: ['*'],
					allowedMethods: ['GET', 'POST'],
					allowedHeaders: ['Content-Type'],
					allowCredentials: true,
					maxAge: 3600
				}
			});
			expect(wildcardServer.isCorsAllowed('https://any-domain.com')).toBe(true);
		});

		it('should not allow CORS when disabled', () => {
			const disabledCorsServer = new MCPServer({
				cors: {
					enabled: false,
					allowedOrigins: ['https://example.com'],
					allowedMethods: ['GET', 'POST'],
					allowedHeaders: ['Content-Type'],
					allowCredentials: true,
					maxAge: 3600
				}
			});
			expect(disabledCorsServer.isCorsAllowed('https://example.com')).toBe(false);
		});

		it('should apply CORS headers to response', () => {
			const response = server.applyCorsHeaders(mockRequest, mockResponse);

			expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://example.com');
			expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET, POST, OPTIONS');
			expect(response.headers.get('Access-Control-Allow-Headers')).toBe(
				'Content-Type, Authorization'
			);
			expect(response.headers.get('Access-Control-Allow-Credentials')).toBe('true');
			expect(response.headers.get('Access-Control-Max-Age')).toBe('3600');
		});

		it('should not apply CORS headers for disallowed origins', () => {
			const disallowedRequest = new Request('https://api.example.com/mcp', {
				headers: {
					origin: 'https://disallowed.com',
					'content-type': 'application/json'
				}
			});

			const response = server.applyCorsHeaders(disallowedRequest, mockResponse);

			expect(response.headers.get('Access-Control-Allow-Origin')).toBeNull();
		});
	});

	describe('Security Headers', () => {
		it('should apply security headers to response', () => {
			const response = server.applySecurityHeaders(mockResponse);

			expect(response.headers.get('Content-Security-Policy')).toBeTruthy();
			expect(response.headers.get('Strict-Transport-Security')).toBeTruthy();
			expect(response.headers.get('X-Frame-Options')).toBe('DENY');
			expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
		});

		it('should not apply disabled security headers', () => {
			const partialSecurityServer = new MCPServer({
				security: {
					contentSecurityPolicy: false,
					strictTransportSecurity: true,
					xFrameOptions: false,
					xContentTypeOptions: true
				}
			});

			const response = partialSecurityServer.applySecurityHeaders(mockResponse);

			expect(response.headers.get('Content-Security-Policy')).toBeNull();
			expect(response.headers.get('Strict-Transport-Security')).toBeTruthy();
			expect(response.headers.get('X-Frame-Options')).toBeNull();
			expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
		});
	});

	describe('Request Validation', () => {
		it('should validate content type', () => {
			expect(server.validateContentType('application/json')).toBe(true);
			expect(server.validateContentType('application/json; charset=utf-8')).toBe(true);
			expect(server.validateContentType('text/plain')).toBe(false);
			expect(server.validateContentType(null)).toBe(false);
		});

		it('should validate init requests', () => {
			const validRequest = {
				version: '1.0',
				client: {
					name: 'test-client',
					version: '1.0'
				}
			};

			const invalidRequest1 = {
				version: 1.0, // Should be string
				client: {
					name: 'test-client',
					version: '1.0'
				}
			};

			const invalidRequest2 = {
				version: '1.0',
				client: 'not-an-object'
			};

			expect(server.validateRequest(validRequest).isValid).toBe(true);
			expect(server.validateRequest(invalidRequest1).isValid).toBe(false);
			expect(server.validateRequest(invalidRequest2).isValid).toBe(false);
		});

		it('should validate discovery requests', () => {
			const validRequest = {
				type: 'all'
			};

			const invalidRequest1 = {
				type: 123 // Should be string
			};

			const invalidRequest2 = {
				type: 'invalid-type' // Should be one of: tools, resources, all
			};

			expect(server.validateRequest(validRequest).isValid).toBe(true);
			expect(server.validateRequest(invalidRequest1).isValid).toBe(false);
			expect(server.validateRequest(invalidRequest2).isValid).toBe(false);
		});

		it('should validate tool requests', () => {
			const validRequest = {
				tool: 'test-tool',
				params: {}
			};

			const invalidRequest1 = {
				tool: 123, // Should be string
				params: {}
			};

			const invalidRequest2 = {
				tool: 'test-tool',
				params: 'not-an-object'
			};

			expect(server.validateRequest(validRequest).isValid).toBe(true);
			expect(server.validateRequest(invalidRequest1).isValid).toBe(false);
			expect(server.validateRequest(invalidRequest2).isValid).toBe(false);
		});

		it('should validate resource requests', () => {
			const validRequest1 = {
				resource: 'test-resource',
				params: {}
			};

			const validRequest2 = {
				resource: 'test-resource'
				// params is optional
			};

			const invalidRequest1 = {
				resource: 123 // Should be string
			};

			const invalidRequest2 = {
				resource: 'test-resource',
				params: 'not-an-object'
			};

			expect(server.validateRequest(validRequest1).isValid).toBe(true);
			expect(server.validateRequest(validRequest2).isValid).toBe(true);
			expect(server.validateRequest(invalidRequest1).isValid).toBe(false);
			expect(server.validateRequest(invalidRequest2).isValid).toBe(false);
		});
	});
});
