# Maintenance Guide for shadcn-svelte MCP Server

This guide provides instructions for maintaining and updating the shadcn-svelte MCP server, including the process for updating documentation when new shadcn-svelte versions are released and troubleshooting guidance for administrators.

## Table of Contents

1. [Introduction](#introduction)
2. [Server Maintenance](#server-maintenance)
3. [Updating Documentation](#updating-documentation)
4. [Monitoring and Logging](#monitoring-and-logging)
5. [Troubleshooting](#troubleshooting)
6. [Backup and Recovery](#backup-and-recovery)
7. [Security Maintenance](#security-maintenance)

## Introduction

The shadcn-svelte MCP server requires regular maintenance to ensure it provides accurate and up-to-date information about shadcn-svelte components. This guide covers the key maintenance tasks and procedures.

## Server Maintenance

### Regular Maintenance Tasks

1. **Dependency Updates**: Regularly update dependencies to ensure security and performance:

```bash
# Check for outdated dependencies
npm outdated

# Update dependencies
npm update

# Update to latest major versions (with caution)
npx npm-check-updates -u
npm install
```

2. **Server Restarts**: Schedule regular server restarts to clear memory and ensure optimal performance:

```bash
# For PM2-managed servers
pm2 restart shadcn-svelte-mcp

# For Docker containers
docker restart shadcn-svelte-mcp-container
```

3. **Log Rotation**: Ensure logs are properly rotated to prevent disk space issues:

```bash
# Check log sizes
du -sh logs/

# Set up log rotation if not already configured
# Example logrotate configuration in /etc/logrotate.d/shadcn-svelte-mcp
```

### Performance Optimization

1. **Cache Management**: The server uses in-memory caching for documentation. Monitor memory usage and adjust cache settings if needed:

```javascript
// src/lib/mcp/core/documentation-store.ts
// Adjust cache settings as needed
const CACHE_TTL = 3600 * 1000; // 1 hour in milliseconds
```

2. **Rate Limiting**: Adjust rate limiting settings based on server load and usage patterns:

```
# .env file
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=60000
```

## Updating Documentation

### Update Process for New shadcn-svelte Versions

When a new version of shadcn-svelte is released, follow these steps to update the documentation:

1. **Check for Changes**: Review the shadcn-svelte release notes to identify new components, changes to existing components, and deprecated components.

2. **Update Component Documentation**: Update the component documentation in `src/lib/mcp/core/initial-data.ts`:

```typescript
// Example: Adding a new component
export const initialComponents: Component[] = [
	// Existing components...
	{
		name: 'NewComponent',
		description: 'Description of the new component',
		usage: "import { NewComponent } from '@shadcn/svelte'",
		props: [
			// Component props...
		],
		examples: [
			// Component examples...
		],
		relatedComponents: [],
		cssVariables: [],
		troubleshooting: []
	}
];
```

3. **Update Examples**: Update or add code examples for components:

```typescript
// Example: Adding a new example
examples: [
	{
		title: 'Basic Example',
		description: 'A basic example of the component',
		code: "<script>\n  import { NewComponent } from '@shadcn/svelte';\n</script>\n\n<NewComponent />",
		type: 'basic'
	}
];
```

4. **Update Version Information**: Update the version information in the server configuration:

```
# .env file
PUBLIC_MCP_SERVER_VERSION="1.1.0" # Update to match your server version
```

5. **Test Documentation**: Test the updated documentation to ensure it's accurate and complete:

```bash
# Run tests
npm run test

# Start the server in development mode
npm run dev

# Test specific components
curl -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"type":"tool_call","tool":"getComponentInfo","parameters":{"componentName":"NewComponent"}}'
```

6. **Deploy Updates**: Deploy the updated documentation to production:

```bash
# Build the application
npm run build

# Deploy according to your deployment process
```

### Automated Documentation Updates

For larger projects, consider implementing an automated documentation update process:

1. **Create a Script**: Create a script that extracts documentation from the shadcn-svelte source code:

```bash
# Example script location
src/scripts/update-documentation.js
```

2. **Schedule Updates**: Schedule regular runs of the update script:

```bash
# Example cron job
0 0 * * 0 cd /path/to/project && node src/scripts/update-documentation.js
```

3. **Notification System**: Implement a notification system to alert administrators when documentation updates are available or have been applied.

## Monitoring and Logging

### Setting Up Monitoring

1. **Health Checks**: Use the `/api/health` endpoint to monitor server health:

```bash
# Example health check command
curl http://your-server.com/api/health
```

2. **Performance Monitoring**: Monitor server performance using tools like Prometheus and Grafana:

```bash
# Example Prometheus configuration
scrape_configs:
  - job_name: 'shadcn-svelte-mcp'
    scrape_interval: 15s
    static_configs:
      - targets: ['your-server.com:3000']
```

3. **Error Tracking**: Set up error tracking with a service like Sentry:

```javascript
// Example Sentry integration
import * as Sentry from '@sentry/node';

Sentry.init({
	dsn: 'your-sentry-dsn',
	environment: process.env.NODE_ENV
});
```

### Log Management

1. **Log Levels**: Adjust log levels based on environment:

```
# .env file
LOG_LEVEL=info # Options: error, warn, info, debug
```

2. **Log Analysis**: Regularly review logs for errors and performance issues:

```bash
# Example log analysis command
grep -i error logs/server.log | sort | uniq -c | sort -nr
```

3. **Alerting**: Set up alerts for critical errors:

```bash
# Example alert script
if grep -q "CRITICAL" logs/server.log; then
  # Send alert
  curl -X POST https://alerts.example.com/webhook -d "Critical error detected"
fi
```

## Troubleshooting

### Common Issues and Solutions

#### Server Not Starting

**Issue**: The server fails to start after deployment or update.

**Solutions**:

1. Check for syntax errors in the code:

```bash
# Run TypeScript type checking
npm run check
```

2. Check for missing dependencies:

```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

3. Check for port conflicts:

```bash
# Check if the port is already in use
lsof -i :3000
```

#### High Memory Usage

**Issue**: The server is using excessive memory.

**Solutions**:

1. Check for memory leaks:

```bash
# Use Node.js heap snapshot
node --inspect src/index.js
# Then connect with Chrome DevTools and take heap snapshots
```

2. Adjust cache settings:

```javascript
// Reduce cache TTL or size
const CACHE_TTL = 1800 * 1000; // 30 minutes
```

#### Slow Response Times

**Issue**: The server is responding slowly to requests.

**Solutions**:

1. Check server load:

```bash
# Check system resources
top
```

2. Optimize database queries or data access:

```javascript
// Add indexing or caching for frequently accessed data
```

3. Implement or adjust rate limiting:

```
# .env file
RATE_LIMIT_MAX_REQUESTS=50 # Reduce if needed
```

#### Documentation Inconsistencies

**Issue**: Documentation is inconsistent or outdated.

**Solutions**:

1. Verify documentation sources:

```bash
# Check shadcn-svelte version
npm list @shadcn/svelte
```

2. Run the documentation update process:

```bash
# Manual update
node src/scripts/update-documentation.js
```

3. Check for errors in the documentation data:

```bash
# Validate documentation data
npm run validate-docs
```

### Diagnostic Tools

1. **Server Status**: Check server status and configuration:

```bash
# Example status command
curl http://your-server.com/api/health
```

2. **Documentation Validation**: Validate documentation data:

```bash
# Example validation script
node src/scripts/validate-documentation.js
```

3. **Performance Testing**: Test server performance under load:

```bash
# Example load testing with autocannon
npx autocannon -c 100 -d 30 -p 10 http://your-server.com/api/health
```

## Backup and Recovery

### Backup Procedures

1. **Code Backup**: Ensure the codebase is backed up in a version control system like Git.

2. **Configuration Backup**: Regularly backup environment configuration:

```bash
# Example backup command
cp .env .env.backup-$(date +%Y%m%d)
```

3. **Documentation Data Backup**: Backup documentation data:

```bash
# Example backup command
cp src/lib/mcp/core/initial-data.ts src/lib/mcp/core/initial-data.backup-$(date +%Y%m%d).ts
```

### Recovery Procedures

1. **Code Recovery**: Restore code from version control:

```bash
# Example recovery command
git checkout v1.0.0
```

2. **Configuration Recovery**: Restore environment configuration:

```bash
# Example recovery command
cp .env.backup-20230101 .env
```

3. **Server Restart**: Restart the server after recovery:

```bash
# Example restart command
pm2 restart shadcn-svelte-mcp
```

## Security Maintenance

### Regular Security Tasks

1. **Dependency Scanning**: Regularly scan dependencies for vulnerabilities:

```bash
# Example scanning command
npm audit
```

2. **Security Updates**: Apply security updates promptly:

```bash
# Example update command
npm audit fix
```

3. **Access Control Review**: Regularly review and update access controls:

```bash
# Example: Update API key
# .env file
AUTH_API_KEY="new-secure-api-key"
```

### Security Best Practices

1. **HTTPS**: Ensure the server is accessible only via HTTPS.

2. **CORS Configuration**: Regularly review and update CORS configuration:

```
# .env file
ALLOWED_ORIGINS="https://trusted-site.com,https://another-trusted-site.com"
```

3. **Rate Limiting**: Implement and maintain rate limiting to prevent abuse:

```
# .env file
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=60000
```

4. **Input Validation**: Ensure all input is properly validated:

```typescript
// Example validation function
function validateComponentName(name: string): boolean {
	return /^[a-zA-Z0-9]+$/.test(name);
}
```

5. **Error Handling**: Ensure errors are handled properly without exposing sensitive information:

```typescript
// Example error handler
function handleError(error: Error): void {
	console.error('Internal error:', error);
	return {
		error: 'An internal error occurred'
		// Don't include error.stack or detailed error information in production
	};
}
```

## Conclusion

Regular maintenance is essential to ensure the shadcn-svelte MCP server provides accurate and up-to-date information about shadcn-svelte components. By following the procedures outlined in this guide, you can keep the server running smoothly and ensure the documentation remains current.
