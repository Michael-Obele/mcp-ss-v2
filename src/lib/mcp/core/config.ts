/**
 * MCP Server Configuration
 *
 * This file provides a centralized configuration system for the MCP server,
 * loading values from environment variables and providing defaults.
 */

import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import { PUBLIC_BASE_URL } from '$env/static/public';
import { LogLevel } from './server';

/**
 * Parse a comma-separated string into an array
 * @param value The string to parse
 * @returns An array of strings
 */
function parseStringArray(value: string | undefined): string[] {
	if (!value) return [];
	return value.split(',').map((item) => item.trim());
}

/**
 * Parse a boolean string
 * @param value The string to parse
 * @param defaultValue The default value if the string is undefined
 * @returns A boolean value
 */
function parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
	if (value === undefined) return defaultValue;
	return value.toLowerCase() === 'true';
}

/**
 * Parse a number string
 * @param value The string to parse
 * @param defaultValue The default value if the string is undefined or invalid
 * @returns A number value
 */
function parseNumber(value: string | undefined, defaultValue: number): number {
	if (value === undefined) return defaultValue;
	const parsed = parseInt(value, 10);
	return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Parse a log level string
 * @param value The string to parse
 * @param defaultValue The default value if the string is undefined or invalid
 * @returns A LogLevel value
 */
function parseLogLevel(value: string | undefined, defaultValue: LogLevel): LogLevel {
	if (!value) return defaultValue;

	switch (value.toLowerCase()) {
		case 'error':
			return LogLevel.ERROR;
		case 'warn':
			return LogLevel.WARN;
		case 'info':
			return LogLevel.INFO;
		case 'debug':
			return LogLevel.DEBUG;
		default:
			return defaultValue;
	}
}

/**
 * MCP server configuration
 */
export const config = {
	server: {
		name: env.MCP_SERVER_NAME || 'shadcn-svelte-mcp',
		version: env.MCP_SERVER_VERSION || '0.1.0',
		description:
			env.MCP_SERVER_DESCRIPTION || 'MCP server for shadcn-svelte component documentation',
		baseUrl: PUBLIC_BASE_URL || '/api/mcp'
	},
	logging: {
		level: parseLogLevel(env.MCP_LOG_LEVEL, dev ? LogLevel.DEBUG : LogLevel.INFO)
	},
	rateLimit: {
		enabled: parseBoolean(env.MCP_RATE_LIMIT_ENABLED, !dev),
		maxRequests: parseNumber(env.MCP_RATE_LIMIT_MAX_REQUESTS, 100),
		timeWindow: parseNumber(env.MCP_RATE_LIMIT_TIME_WINDOW, 60 * 1000) // 1 minute default
	},
	cors: {
		enabled: parseBoolean(env.MCP_CORS_ENABLED, true),
		allowedOrigins: env.MCP_CORS_ALLOWED_ORIGINS
			? parseStringArray(env.MCP_CORS_ALLOWED_ORIGINS)
			: ['*'],
		allowedMethods: env.MCP_CORS_ALLOWED_METHODS
			? parseStringArray(env.MCP_CORS_ALLOWED_METHODS)
			: ['GET', 'POST', 'OPTIONS'],
		allowedHeaders: env.MCP_CORS_ALLOWED_HEADERS
			? parseStringArray(env.MCP_CORS_ALLOWED_HEADERS)
			: ['Content-Type', 'Authorization', 'X-Requested-With'],
		allowCredentials: parseBoolean(env.MCP_CORS_ALLOW_CREDENTIALS, true),
		maxAge: parseNumber(env.MCP_CORS_MAX_AGE, 86400) // 24 hours default
	},
	security: {
		contentSecurityPolicy: parseBoolean(env.MCP_SECURITY_CSP_ENABLED, true),
		strictTransportSecurity: parseBoolean(env.MCP_SECURITY_HSTS_ENABLED, true),
		xFrameOptions: parseBoolean(env.MCP_SECURITY_XFRAME_ENABLED, true),
		xContentTypeOptions: parseBoolean(env.MCP_SECURITY_XCONTENT_ENABLED, true)
	},
	request: {
		maxSize: parseNumber(env.MCP_MAX_REQUEST_SIZE, 1024 * 1024) // 1MB default
	},
	deployment: {
		environment: env.NODE_ENV || (dev ? 'development' : 'production'),
		port: parseNumber(env.PORT, 3000),
		host: env.HOST || 'localhost'
	}
};

/**
 * Get the full configuration object
 * @returns The configuration object
 */
export function getConfig() {
	return { ...config };
}

/**
 * Get server configuration for the MCP server
 * @returns Server configuration object
 */
export function getServerConfig() {
	return {
		name: config.server.name,
		version: config.server.version,
		description: config.server.description,
		logLevel: config.logging.level,
		maxRequestSize: config.request.maxSize,
		rateLimit: { ...config.rateLimit },
		cors: { ...config.cors },
		security: { ...config.security }
	};
}
