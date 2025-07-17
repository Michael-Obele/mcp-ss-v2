/**
 * MCP Server Core Configuration
 *
 * This file contains the core configuration for the shadcn-svelte MCP server.
 * It defines the server information, capabilities, initialization logic, and error handling.
 *
 * The server provides the foundation for the MCP protocol implementation, which is handled
 * by the protocol handlers defined in protocol-handlers.ts.
 */

/**
 * Log levels for the MCP server
 */
export enum LogLevel {
	ERROR = 'error',
	WARN = 'warn',
	INFO = 'info',
	DEBUG = 'debug'
}

/**
 * MCP server configuration interface
 */
export interface MCPServerConfig {
	name: string;
	version: string;
	description: string;
	capabilities: string[];
	logLevel: LogLevel;
	maxRequestSize: number; // in bytes
	rateLimit: {
		enabled: boolean;
		maxRequests: number;
		timeWindow: number; // in milliseconds
	};
	cors: {
		enabled: boolean;
		allowedOrigins: string[];
		allowedMethods: string[];
		allowedHeaders: string[];
		allowCredentials: boolean;
		maxAge: number; // in seconds
	};
	security: {
		contentSecurityPolicy: boolean;
		strictTransportSecurity: boolean;
		xFrameOptions: boolean;
		xContentTypeOptions: boolean;
	};
}

/**
 * MCP server error codes
 */
export enum MCPErrorCode {
	INVALID_REQUEST = 'INVALID_REQUEST',
	COMPONENT_NOT_FOUND = 'COMPONENT_NOT_FOUND',
	TOOL_NOT_FOUND = 'TOOL_NOT_FOUND',
	INTERNAL_ERROR = 'INTERNAL_ERROR',
	RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
	VALIDATION_ERROR = 'VALIDATION_ERROR'
}

/**
 * MCP server error interface
 */
export interface MCPError {
	code: MCPErrorCode;
	message: string;
	details?: unknown;
}

/**
 * Default MCP server configuration
 */
export const defaultServerConfig: MCPServerConfig = {
	name: 'shadcn-svelte-mcp',
	version: '0.1.0',
	description: 'MCP server for shadcn-svelte component documentation',
	capabilities: ['component-info', 'component-examples', 'theming', 'troubleshooting'],
	logLevel: LogLevel.INFO,
	maxRequestSize: 1024 * 1024, // 1MB
	rateLimit: {
		enabled: true,
		maxRequests: 100,
		timeWindow: 60 * 1000 // 1 minute
	},
	cors: {
		enabled: true,
		allowedOrigins: ['*'], // Allow all origins by default
		allowedMethods: ['GET', 'POST', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
		allowCredentials: true,
		maxAge: 86400 // 24 hours
	},
	security: {
		contentSecurityPolicy: true,
		strictTransportSecurity: true,
		xFrameOptions: true,
		xContentTypeOptions: true
	}
};

/**
 * MCP server class
 */
export class MCPServer {
	private config: MCPServerConfig;
	private requestCounts: Map<string, { count: number; timestamp: number }> = new Map();

	/**
	 * Create a new MCP server instance
	 * @param config Optional server configuration
	 */
	constructor(config?: Partial<MCPServerConfig>) {
		this.config = {
			...defaultServerConfig,
			...config
		};
	}

	/**
	 * Get the server configuration
	 * @returns The server configuration
	 */
	getConfig(): MCPServerConfig {
		return { ...this.config };
	}

	/**
	 * Update the server configuration
	 * @param config Partial server configuration to update
	 * @returns The updated server configuration
	 */
	updateConfig(config: Partial<MCPServerConfig>): MCPServerConfig {
		this.config = {
			...this.config,
			...config
		};
		return this.getConfig();
	}

	/**
	 * Log a message with the specified log level
	 * @param level Log level
	 * @param message Message to log
	 * @param data Additional data to log
	 */
	log(level: LogLevel, message: string, data?: unknown): void {
		const logLevels = {
			[LogLevel.ERROR]: 0,
			[LogLevel.WARN]: 1,
			[LogLevel.INFO]: 2,
			[LogLevel.DEBUG]: 3
		};

		// Only log if the level is less than or equal to the configured log level
		if (logLevels[level] <= logLevels[this.config.logLevel]) {
			const timestamp = new Date().toISOString();
			const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

			switch (level) {
				case LogLevel.ERROR:
					console.error(formattedMessage, data || '');
					break;
				case LogLevel.WARN:
					console.warn(formattedMessage, data || '');
					break;
				case LogLevel.INFO:
					console.info(formattedMessage, data || '');
					break;
				case LogLevel.DEBUG:
					console.debug(formattedMessage, data || '');
					break;
			}
		}
	}

	/**
	 * Check if a request exceeds the rate limit
	 * @param clientId Client identifier (e.g., IP address)
	 * @returns True if the request exceeds the rate limit, false otherwise
	 */
	checkRateLimit(clientId: string): boolean {
		if (!this.config.rateLimit.enabled) {
			return false;
		}

		const now = Date.now();
		const clientData = this.requestCounts.get(clientId);

		// If no previous requests or the time window has passed, reset the count
		if (!clientData || now - clientData.timestamp > this.config.rateLimit.timeWindow) {
			this.requestCounts.set(clientId, { count: 1, timestamp: now });
			return false;
		}

		// Increment the request count
		clientData.count++;

		// Check if the rate limit is exceeded
		if (clientData.count > this.config.rateLimit.maxRequests) {
			this.log(LogLevel.WARN, `Rate limit exceeded for client ${clientId}`);
			return true;
		}

		return false;
	}

	/**
	 * Create an MCP error
	 * @param code Error code
	 * @param message Error message
	 * @param details Additional error details
	 * @returns MCP error object
	 */
	createError(code: MCPErrorCode, message: string, details?: unknown): MCPError {
		this.log(LogLevel.ERROR, message, details);
		return {
			code,
			message,
			details
		};
	}

	/**
	 * Check if a request is valid
	 * @param request Request object
	 * @returns Object with validation result and error message if invalid
	 */
	validateRequest(request: unknown): { isValid: boolean; error?: string } {
		// Check if request exists and is an object
		if (!request || typeof request !== 'object') {
			return { isValid: false, error: 'Request must be a valid JSON object' };
		}

		const req = request as Record<string, unknown>;

		// Validate based on request type
		if ('version' in req && 'client' in req) {
			// Init request validation
			if (typeof req.version !== 'string') {
				return { isValid: false, error: 'Version must be a string' };
			}
			if (!req.client || typeof req.client !== 'object') {
				return { isValid: false, error: 'Client must be an object' };
			}
			const client = req.client as Record<string, unknown>;
			if (typeof client.name !== 'string') {
				return { isValid: false, error: 'Client name must be a string' };
			}
			if (typeof client.version !== 'string') {
				return { isValid: false, error: 'Client version must be a string' };
			}
		} else if ('type' in req) {
			// Discovery request validation
			if (typeof req.type !== 'string') {
				return { isValid: false, error: 'Type must be a string' };
			}
			if (!['tools', 'resources', 'all'].includes(req.type as string)) {
				return { isValid: false, error: 'Type must be one of: tools, resources, all' };
			}
		} else if ('tool' in req) {
			// Tool request validation
			if (typeof req.tool !== 'string') {
				return { isValid: false, error: 'Tool must be a string' };
			}
			if (!req.params || typeof req.params !== 'object') {
				return { isValid: false, error: 'Params must be an object' };
			}
		} else if ('resource' in req) {
			// Resource request validation
			if (typeof req.resource !== 'string') {
				return { isValid: false, error: 'Resource must be a string' };
			}
			if (req.params !== undefined && typeof req.params !== 'object') {
				return { isValid: false, error: 'Params must be an object if provided' };
			}
		} else {
			return { isValid: false, error: 'Unknown request type' };
		}

		return { isValid: true };
	}

	/**
	 * Validate the content type of a request
	 * @param contentType Content-Type header value
	 * @returns True if the content type is valid, false otherwise
	 */
	validateContentType(contentType: string | null): boolean {
		if (!contentType) {
			return false;
		}

		// Check if content type is application/json
		return contentType.toLowerCase().includes('application/json');
	}

	/**
	 * Check if CORS is allowed for the specified origin
	 * @param origin Request origin
	 * @returns True if CORS is allowed, false otherwise
	 */
	isCorsAllowed(origin: string): boolean {
		if (!this.config.cors.enabled) {
			return false;
		}

		// Allow all origins if '*' is in the allowed origins
		if (this.config.cors.allowedOrigins.includes('*')) {
			return true;
		}

		// Check if the origin is in the allowed origins
		return this.config.cors.allowedOrigins.includes(origin);
	}

	/**
	 * Get CORS configuration for the server
	 * @returns CORS configuration object
	 */
	getCorsConfig() {
		return { ...this.config.cors };
	}

	/**
	 * Get security configuration for the server
	 * @returns Security configuration object
	 */
	getSecurityConfig() {
		return { ...this.config.security };
	}

	/**
	 * Apply CORS headers to a response
	 * @param request The incoming request
	 * @param response The response to apply headers to
	 * @returns The response with CORS headers applied
	 */
	applyCorsHeaders(request: Request, response: Response): Response {
		const origin = request.headers.get('origin');
		if (origin && this.isCorsAllowed(origin)) {
			response.headers.set('Access-Control-Allow-Origin', origin);
			response.headers.set(
				'Access-Control-Allow-Methods',
				this.config.cors.allowedMethods.join(', ')
			);
			response.headers.set(
				'Access-Control-Allow-Headers',
				this.config.cors.allowedHeaders.join(', ')
			);

			if (this.config.cors.allowCredentials) {
				response.headers.set('Access-Control-Allow-Credentials', 'true');
			}

			response.headers.set('Access-Control-Max-Age', this.config.cors.maxAge.toString());
		}
		return response;
	}

	/**
	 * Apply security headers to a response
	 * @param response The response to apply headers to
	 * @returns The response with security headers applied
	 */
	applySecurityHeaders(response: Response): Response {
		const { security } = this.config;

		if (security.contentSecurityPolicy) {
			response.headers.set(
				'Content-Security-Policy',
				"default-src 'self'; script-src 'self'; object-src 'none'; frame-ancestors 'none'"
			);
		}

		if (security.strictTransportSecurity) {
			response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
		}

		if (security.xFrameOptions) {
			response.headers.set('X-Frame-Options', 'DENY');
		}

		if (security.xContentTypeOptions) {
			response.headers.set('X-Content-Type-Options', 'nosniff');
		}

		return response;
	}

	/**
	 * Get server information
	 * @returns Server information object
	 */
	getServerInfo() {
		return {
			name: this.config.name,
			version: this.config.version,
			description: this.config.description,
			capabilities: this.config.capabilities
		};
	}
}

/**
 * Initialize the MCP server with the provided configuration
 * @param config Optional server configuration
 * @returns The MCP server instance
 */
export function initServer(config?: Partial<MCPServerConfig>): MCPServer {
	return new MCPServer(config);
}

/**
 * Process an MCP request using the server instance
 * @param server MCP server instance
 * @param requestBody Request body
 * @param clientId Client identifier (e.g., IP address)
 * @returns Response object
 */
export async function processMCPRequest(
	server: MCPServer,
	requestBody: unknown,
	clientId: string
): Promise<unknown> {
	// Check if the request exceeds the rate limit
	if (server.checkRateLimit(clientId)) {
		return {
			status: 'error',
			error: {
				code: MCPErrorCode.RATE_LIMIT_EXCEEDED,
				message: 'Rate limit exceeded'
			}
		};
	}

	// Validate the request
	const validation = server.validateRequest(requestBody);
	if (!validation.isValid) {
		return {
			status: 'error',
			error: {
				code: MCPErrorCode.INVALID_REQUEST,
				message: validation.error || 'Invalid request format'
			}
		};
	}

	// Import the protocol handler dynamically to avoid circular dependencies
	const { createProtocolHandler } = await import('./protocol-handlers.js');
	const protocolHandler = createProtocolHandler(server);

	// Process the request using the protocol handler
	return protocolHandler.processRequest(requestBody);
}
