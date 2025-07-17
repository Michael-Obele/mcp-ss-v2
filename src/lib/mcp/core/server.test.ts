import { describe, it, expect } from 'vitest';
import { initServer, defaultServerConfig } from './server';

describe('MCP Server', () => {
	it('should initialize with default config', () => {
		const server = initServer();
		expect(server).toEqual(defaultServerConfig);
	});

	it('should merge custom config with defaults', () => {
		const customConfig = {
			name: 'custom-server',
			version: '1.0.0'
		};
		const server = initServer(customConfig);
		expect(server).toEqual({
			...defaultServerConfig,
			...customConfig
		});
	});
});
