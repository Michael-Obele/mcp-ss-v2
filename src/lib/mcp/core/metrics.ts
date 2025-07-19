/**
 * MCP Server Metrics Collection
 *
 * This file provides a metrics collection service for the MCP server,
 * tracking request counts, response times, error rates, and other performance metrics.
 */

/**
 * Metrics data structure
 */
export interface ServerMetrics {
	// Request metrics
	totalRequests: number;
	requestsPerMinute: number;
	requestsPerHour: number;

	// Response metrics
	averageResponseTime: number;
	maxResponseTime: number;

	// Error metrics
	totalErrors: number;
	errorRate: number;
	errorsByType: Record<string, number>;

	// Tool usage metrics
	toolUsage: Record<string, number>;

	// Resource usage metrics
	resourceUsage: Record<string, number>;

	// Component metrics
	componentQueries: Record<string, number>;

	// System metrics
	uptime: number; // in seconds
	memoryUsage: {
		rss: number;
		heapTotal: number;
		heapUsed: number;
		external: number;
	};

	// Rate limiting metrics
	rateLimitExceeded: number;

	// Last updated timestamp
	lastUpdated: string;
}

/**
 * Request timing data
 */
interface RequestTiming {
	startTime: number;
	endTime?: number;
	duration?: number;
}

/**
 * Metrics service class
 */
export class MetricsService {
	private static instance: MetricsService;

	// Core metrics
	private metrics: ServerMetrics;

	// Time windows for calculations
	private readonly MINUTE_MS = 60 * 1000;
	private readonly HOUR_MS = 60 * 60 * 1000;

	// Request history for time-based calculations
	private requestTimestamps: number[] = [];
	private requestTimings: Map<string, RequestTiming> = new Map();
	private startTime: number;

	/**
	 * Create a new metrics service instance
	 */
	private constructor() {
		this.startTime = Date.now();
		this.metrics = this.initializeMetrics();

		// Set up periodic metrics updates
		setInterval(() => this.updateMetrics(), 10000); // Update every 10 seconds
	}

	/**
	 * Get the metrics service instance (singleton)
	 * @returns The metrics service instance
	 */
	public static getInstance(): MetricsService {
		if (!MetricsService.instance) {
			MetricsService.instance = new MetricsService();
		}
		return MetricsService.instance;
	}

	/**
	 * Initialize metrics with default values
	 * @returns Initial metrics object
	 */
	private initializeMetrics(): ServerMetrics {
		return {
			totalRequests: 0,
			requestsPerMinute: 0,
			requestsPerHour: 0,

			averageResponseTime: 0,
			maxResponseTime: 0,

			totalErrors: 0,
			errorRate: 0,
			errorsByType: {},

			toolUsage: {},
			resourceUsage: {},
			componentQueries: {},

			uptime: 0,
			memoryUsage: {
				rss: 0,
				heapTotal: 0,
				heapUsed: 0,
				external: 0
			},

			rateLimitExceeded: 0,

			lastUpdated: new Date().toISOString()
		};
	}

	/**
	 * Update metrics calculations
	 */
	private updateMetrics(): void {
		const now = Date.now();

		// Update time-based metrics
		this.updateTimeBasedMetrics(now);

		// Update system metrics
		this.updateSystemMetrics();

		// Update timestamp
		this.metrics.lastUpdated = new Date().toISOString();
	}

	/**
	 * Update time-based metrics
	 * @param now Current timestamp
	 */
	private updateTimeBasedMetrics(now: number): void {
		// Filter request timestamps within the last minute and hour
		const minuteAgo = now - this.MINUTE_MS;
		const hourAgo = now - this.HOUR_MS;

		// Remove old timestamps and keep recent ones
		this.requestTimestamps = this.requestTimestamps.filter((ts) => ts >= hourAgo);

		// Calculate requests per minute and hour
		const requestsLastMinute = this.requestTimestamps.filter((ts) => ts >= minuteAgo).length;
		const requestsLastHour = this.requestTimestamps.length;

		this.metrics.requestsPerMinute = requestsLastMinute;
		this.metrics.requestsPerHour = requestsLastHour;

		// Calculate error rate
		if (this.metrics.totalRequests > 0) {
			this.metrics.errorRate = this.metrics.totalErrors / this.metrics.totalRequests;
		}
	}

	/**
	 * Update system metrics
	 */
	private updateSystemMetrics(): void {
		// Update uptime
		this.metrics.uptime = Math.floor((Date.now() - this.startTime) / 1000);

		// Update memory usage if running in Node.js environment
		if (typeof process !== 'undefined' && process.memoryUsage) {
			const memory = process.memoryUsage();
			this.metrics.memoryUsage = {
				rss: memory.rss,
				heapTotal: memory.heapTotal,
				heapUsed: memory.heapUsed,
				external: memory.external
			};
		}
	}

	/**
	 * Record the start of a request
	 * @param requestId Unique request identifier
	 * @param toolName Optional tool name
	 */
	public recordRequestStart(requestId: string, toolName?: string): void {
		// Increment total requests
		this.metrics.totalRequests++;

		// Record timestamp for time-based metrics
		const now = Date.now();
		this.requestTimestamps.push(now);

		// Record request timing
		this.requestTimings.set(requestId, { startTime: now });

		// Record tool usage if provided
		if (toolName) {
			this.recordToolUsage(toolName);
		}
	}

	/**
	 * Record the end of a request
	 * @param requestId Unique request identifier
	 * @param isError Whether the request resulted in an error
	 * @param errorType Optional error type
	 */
	public recordRequestEnd(requestId: string, isError: boolean = false, errorType?: string): void {
		const timing = this.requestTimings.get(requestId);
		if (!timing) return;

		// Record end time and calculate duration
		timing.endTime = Date.now();
		timing.duration = timing.endTime - timing.startTime;

		// Update response time metrics
		this.updateResponseTimeMetrics(timing.duration);

		// Record error if applicable
		if (isError) {
			this.recordError(errorType || 'unknown');
		}

		// Clean up request timing after a delay
		setTimeout(() => {
			this.requestTimings.delete(requestId);
		}, 60000); // Keep timing data for 1 minute for potential diagnostics
	}

	/**
	 * Update response time metrics
	 * @param duration Request duration in milliseconds
	 */
	private updateResponseTimeMetrics(duration: number): void {
		// Update max response time
		if (duration > this.metrics.maxResponseTime) {
			this.metrics.maxResponseTime = duration;
		}

		// Update average response time using a weighted approach
		if (this.metrics.totalRequests === 1) {
			// First request
			this.metrics.averageResponseTime = duration;
		} else {
			// Weighted average (gives more weight to recent requests)
			this.metrics.averageResponseTime = 0.9 * this.metrics.averageResponseTime + 0.1 * duration;
		}
	}

	/**
	 * Record an error
	 * @param errorType Error type
	 */
	public recordError(errorType: string): void {
		// Increment total errors
		this.metrics.totalErrors++;

		// Increment error type count
		if (!this.metrics.errorsByType[errorType]) {
			this.metrics.errorsByType[errorType] = 0;
		}
		this.metrics.errorsByType[errorType]++;

		// Update error rate
		if (this.metrics.totalRequests > 0) {
			this.metrics.errorRate = this.metrics.totalErrors / this.metrics.totalRequests;
		}
	}

	/**
	 * Record tool usage
	 * @param toolName Tool name
	 */
	public recordToolUsage(toolName: string): void {
		if (!this.metrics.toolUsage[toolName]) {
			this.metrics.toolUsage[toolName] = 0;
		}
		this.metrics.toolUsage[toolName]++;
	}

	/**
	 * Record resource usage
	 * @param resourceName Resource name
	 */
	public recordResourceUsage(resourceName: string): void {
		if (!this.metrics.resourceUsage[resourceName]) {
			this.metrics.resourceUsage[resourceName] = 0;
		}
		this.metrics.resourceUsage[resourceName]++;
	}

	/**
	 * Record component query
	 * @param componentName Component name
	 */
	public recordComponentQuery(componentName: string): void {
		if (!this.metrics.componentQueries[componentName]) {
			this.metrics.componentQueries[componentName] = 0;
		}
		this.metrics.componentQueries[componentName]++;
	}

	/**
	 * Record rate limit exceeded
	 */
	public recordRateLimitExceeded(): void {
		this.metrics.rateLimitExceeded++;
	}

	/**
	 * Get current metrics
	 * @returns Current metrics object
	 */
	public getMetrics(): ServerMetrics {
		// Update metrics before returning
		this.updateMetrics();
		return { ...this.metrics };
	}

	/**
	 * Reset metrics
	 */
	public resetMetrics(): void {
		this.metrics = this.initializeMetrics();
		this.requestTimestamps = [];
		this.requestTimings.clear();
	}
}

/**
 * Get the metrics service instance
 * @returns The metrics service instance
 */
export function getMetricsService(): MetricsService {
	return MetricsService.getInstance();
}
