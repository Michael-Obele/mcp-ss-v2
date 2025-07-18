/**
 * Tests for MCP Server
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { MCPServer, LogLevel, MCPErrorCode } from './server.js';

// Mock console methods
vi.spyOn(console, 'log').mockImplementation(() => {});
vi.spyOn(console, 'info').mockImplementation(() => {});
vi.spyOn(console, 'warn').mockImplementation(() => {});
vi.spyOn(console, 'error').mockImplementation(() => {});
vi.spyOn(console, 'debug').mockImplementation(() => {});

describe('MCPServer', () => {
	let server: MCPServer;

	beforeEach(() => {
		server = new MCPServer();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe('Configuration', () => {
		it('should initialize with default configuration', () => {
			const config = server.getConfig();

			expect(config.name).toBe('shadcn-svelte-mcp');
			expect(config.version).toBe('0.1.0');
			expect(config.logLevel).toBe(LogLevel.INFO);
			expect(config.rateLimit.enabled).toBe(true);
			expect(config.cors.enabled).toBe(true);
		});

		it('should allow updating configuration', () => {
			const updatedConfig = server.updateConfig({
				logLevel: LogLevel.DEBUG,
				rateLimit: {
					enabled: false,
					maxRequests: 200,
					timeWindow: 120000
				}
			});

			expect(updatedConfig.logLevel).toBe(LogLevel.DEBUG);
			expect(updatedConfig.rateLimit.enabled).toBe(false);
			expect(updatedConfig.rateLimit.maxRequests).toBe(200);
			expect(updatedConfig.rateLimit.timeWindow).toBe(120000);

			// Other properties should remain unchanged
			expect(updatedConfig.name).toBe('shadcn-svelte-mcp');
			expect(updatedConfig.version).toBe('0.1.0');
		});
	});

	describe('Logging', () => {
		it('should log messages based on log level', () => {
			// Set log level to INFO
			server.updateConfig({ logLevel: LogLevel.INFO });

			// These should be logged
			server.log(LogLevel.ERROR, 'Error message');
			server.log(LogLevel.WARN, 'Warning message');
			server.log(LogLevel.INFO, 'Info message');

			// This should not be logged
			server.log(LogLevel.DEBUG, 'Debug message');

			expect(console.error).toHaveBeenCalled();
			expect(console.warn).toHaveBeenCalled();
			expect(console.info).toHaveBeenCalled();
			expect(console.debug).not.toHaveBeenCalled();
		});

		it('should include additional data in logs', () => {
			const data = { key: 'value' };
			server.log(LogLevel.ERROR, 'Error message', data);

			expect(console.error).toHaveBeenCalledWith(expect.any(String), data);
		});
	});

	describe('Rate Limiting', () => {
		it('should allow requests within rate limit', () => {
			// Configure rate limit
			server.updateConfig({
				rateLimit: {
					enabled: true,
					maxRequests: 3,
					timeWindow: 1000
				}
			});

			// Make requests within the limit
			expect(server.checkRateLimit('client1')).toBe(false);
			expect(server.checkRateLimit('client1')).toBe(false);
			expect(server.checkRateLimit('client1')).toBe(false);
		});

		it('should block requests exceeding rate limit', () => {
			// Configure rate limit
			server.updateConfig({
				rateLimit: {
					enabled: true,
					maxRequests: 3,
					timeWindow: 1000
				}
			});

			// Make requests within the limit
			expect(server.checkRateLimit('client1')).toBe(false);
			expect(server.checkRateLimit('client1')).toBe(false);
			expect(server.checkRateLimit('client1')).toBe(false);

			// This request should exceed the limit
			expect(server.checkRateLimit('client1')).toBe(true);
		});

		it('should handle different clients separately', () => {
			// Configure rate limit
			server.updateConfig({
				rateLimit: {
					enabled: true,
					maxRequests: 2,
					timeWindow: 1000
				}
			});

			// Client 1 requests
			expect(server.checkRateLimit('client1')).toBe(false);
			expect(server.checkRateLimit('client1')).toBe(false);
			expect(server.checkRateLimit('client1')).toBe(true); // Exceeds limit

			// Client 2 requests should be tracked separately
			expect(server.checkRateLimit('client2')).toBe(false);
			expect(server.checkRateLimit('client2')).toBe(false);
			expect(server.checkRateLimit('client2')).toBe(true); // Exceeds limit
		});

		it('should not apply rate limiting when disabled', () => {
			// Disable rate limiting
			server.updateConfig({
				rateLimit: {
					enabled: false,
					maxRequests: 1,
					timeWindow: 1000
				}
			});

			// Make multiple requests
			expect(server.checkRateLimit('client1')).toBe(false);
			expect(server.checkRateLimit('client1')).toBe(false);
			expect(server.checkRateLimit('client1')).toBe(false);
		});
	});

	describe('Error Handling', () => {
		it('should create error objects with the correct format', () => {
			const error = server.createError(MCPErrorCode.COMPONENT_NOT_FOUND, 'Component not found', {
				componentName: 'Button'
			});

			expect(error.code).toBe(MCPErrorCode.COMPONENT_NOT_FOUND);
			expect(error.message).toBe('Component not found');
			expect(error.details).toEqual({ componentName: 'Button' });
		});

		it('should log errors when creating error objects', () => {
			server.createError(MCPErrorCode.INTERNAL_ERROR, 'Internal server error');

			expect(console.error).toHaveBeenCalled();
		});
	});

	describe('Request Validation', () => {
		it('should validate valid requests', () => {
			const validRequest = { tool: 'getComponentInfo', params: { componentName: 'Button' } };

			const result = server.validateRequest(validRequest);
			expect(result.isValid).toBe(true);
		});

		it('should reject invalid requests', () => {
			expect(server.validateRequest(null).isValid).toBe(false);
			expect(server.validateRequest(undefined).isValid).toBe(false);
			expect(server.validateRequest('not an object').isValid).toBe(false);
		});
	});

	describe('CORS Handling', () => {
		it('should allow all origins when wildcard is configured', () => {
			// Default configuration includes wildcard
			expect(server.isCorsAllowed('https://example.com')).toBe(true);
			expect(server.isCorsAllowed('https://another-domain.com')).toBe(true);
		});

		it('should restrict origins when specific origins are configured', () => {
			server.updateConfig({
				cors: {
					enabled: true,
					allowedOrigins: ['https://example.com']
				}
			});

			expect(server.isCorsAllowed('https://example.com')).toBe(true);
			expect(server.isCorsAllowed('https://another-domain.com')).toBe(false);
		});

		it('should reject all origins when CORS is disabled', () => {
			server.updateConfig({
				cors: {
					enabled: false,
					allowedOrigins: ['*']
				}
			});

			expect(server.isCorsAllowed('https://example.com')).toBe(false);
		});
	});

	describe('Server Info', () => {
		it('should return server information', () => {
			const info = server.getServerInfo();

			expect(info.name).toBe('shadcn-svelte-mcp');
			expect(info.version).toBe('0.1.0');
			expect(info.description).toBe('MCP server for shadcn-svelte component documentation');
			expect(info.capabilities).toBeInstanceOf(Array);
		});
	});
});
