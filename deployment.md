# Deployment Guide for shadcn-svelte MCP Server

This document outlines the deployment process for the shadcn-svelte MCP server in various environments.

## Environment Variables

The MCP server uses environment variables for configuration. These can be set in a `.env` file for local development or through your hosting platform's environment variable configuration for production deployments.

### Required Environment Variables

None of the environment variables are strictly required as the server has sensible defaults, but you may want to configure the following:

- `MCP_SERVER_NAME`: Name of the MCP server (default: "shadcn-svelte-mcp")
- `MCP_SERVER_VERSION`: Version of the MCP server (default: "0.1.0")
- `PUBLIC_BASE_URL`: Base URL for MCP API endpoints (default: "/api/mcp")

### Optional Environment Variables

- `MCP_LOG_LEVEL`: Log level (one of: error, warn, info, debug; default: "info" in production, "debug" in development)
- `MCP_RATE_LIMIT_ENABLED`: Enable rate limiting (default: true in production, false in development)
- `MCP_RATE_LIMIT_MAX_REQUESTS`: Maximum number of requests per time window (default: 100)
- `MCP_RATE_LIMIT_TIME_WINDOW`: Time window for rate limiting in milliseconds (default: 60000 - 1 minute)
- `MCP_CORS_ENABLED`: Enable CORS (default: true)
- `MCP_CORS_ALLOWED_ORIGINS`: Comma-separated list of allowed origins, or _ for all (default: _)
- `MCP_CORS_ALLOWED_METHODS`: Comma-separated list of allowed methods (default: GET,POST,OPTIONS)
- `MCP_CORS_ALLOW_CREDENTIALS`: Allow credentials in CORS requests (default: true)
- `MCP_CORS_MAX_AGE`: Max age for CORS preflight requests in seconds (default: 86400 - 24 hours)
- `MCP_SECURITY_CSP_ENABLED`: Enable Content Security Policy (default: true)
- `MCP_SECURITY_HSTS_ENABLED`: Enable HTTP Strict Transport Security (default: true)
- `MCP_SECURITY_XFRAME_ENABLED`: Enable X-Frame-Options (default: true)
- `MCP_SECURITY_XCONTENT_ENABLED`: Enable X-Content-Type-Options (default: true)
- `MCP_MAX_REQUEST_SIZE`: Maximum request size in bytes (default: 1048576 - 1MB)
- `BASE_PATH`: Base path for the application (default: "")
- `ASSETS_PATH`: Path for static assets (default: "")

## Deployment Options

### Vercel

1. Push your code to a Git repository (GitHub, GitLab, Bitbucket)
2. Import the project in Vercel
3. Configure environment variables in the Vercel dashboard
4. Deploy

### Netlify

1. Push your code to a Git repository
2. Import the project in Netlify
3. Configure the build command: `npm run build`
4. Configure the publish directory: `build`
5. Configure environment variables in the Netlify dashboard
6. Deploy

### Docker

1. Create a Dockerfile in the project root:

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine

WORKDIR /app
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000
CMD ["node", "build"]
```

2. Build the Docker image:

```bash
docker build -t shadcn-svelte-mcp .
```

3. Run the Docker container:

```bash
docker run -p 3000:3000 --env-file .env shadcn-svelte-mcp
```

### Self-hosted

1. Build the application:

```bash
npm run build
```

2. Set up environment variables on your server
3. Start the server:

```bash
node build
```

## Build Configuration

The build process is configured in `svelte.config.js` and `vite.config.ts`. The default configuration uses `@sveltejs/adapter-auto` which automatically selects the appropriate adapter based on the deployment environment.

### Custom Adapter

If you need to use a specific adapter for your deployment environment, you can modify `svelte.config.js` to use a different adapter:

```javascript
// For Node.js environments
import adapter from '@sveltejs/adapter-node';

// For static site generation
// import adapter from '@sveltejs/adapter-static';

// For Cloudflare Pages
// import adapter from '@sveltejs/adapter-cloudflare';

// For Vercel
// import adapter from '@sveltejs/adapter-vercel';

// For Netlify
// import adapter from '@sveltejs/adapter-netlify';
```

## Performance Optimization

For optimal performance in production:

1. Enable precompression in the adapter options:

```javascript
adapter: adapter({
	precompress: true
});
```

2. Configure appropriate cache headers for static assets on your hosting platform
3. Consider using a CDN for static assets
4. Adjust rate limiting settings based on expected traffic

## Monitoring and Logging

The MCP server includes built-in logging. In production environments:

1. Set `MCP_LOG_LEVEL` to "info" or "warn" to reduce log verbosity
2. Consider using a log aggregation service to collect and analyze logs
3. Set up monitoring for the server using your hosting platform's monitoring tools or a third-party service

## Security Considerations

1. Always use HTTPS in production
2. Configure appropriate CORS settings to restrict access to trusted origins
3. Enable rate limiting to prevent abuse
4. Consider adding authentication for private deployments

## Troubleshooting

### Common Issues

1. **CORS errors**: Check the `MCP_CORS_*` environment variables and ensure they're configured correctly for your environment
2. **Rate limiting too restrictive**: Adjust `MCP_RATE_LIMIT_MAX_REQUESTS` and `MCP_RATE_LIMIT_TIME_WINDOW` based on your traffic patterns
3. **Build failures**: Ensure all dependencies are installed and the build command is configured correctly
4. **API not accessible**: Check the `PUBLIC_BASE_URL` environment variable and ensure it matches your deployment URL structure

For additional help, check the server logs or open an issue in the project repository.
