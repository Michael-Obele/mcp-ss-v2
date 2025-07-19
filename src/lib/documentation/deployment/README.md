# Deployment Guide for shadcn-svelte MCP Server

This guide provides instructions for deploying the shadcn-svelte MCP server in various environments. The server is built as a SvelteKit application, which offers multiple deployment options.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Configuration](#environment-configuration)
3. [Deployment Options](#deployment-options)
   - [Static Adapter (Default)](#static-adapter-default)
   - [Node.js Server](#nodejs-server)
   - [Serverless Functions](#serverless-functions)
   - [Docker Container](#docker-container)
4. [Platform-Specific Guides](#platform-specific-guides)
   - [Vercel](#vercel)
   - [Netlify](#netlify)
   - [Cloudflare Pages](#cloudflare-pages)
   - [Self-Hosted](#self-hosted)
5. [Post-Deployment Verification](#post-deployment-verification)
6. [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying the shadcn-svelte MCP server, ensure you have:

- Node.js 18.x or later installed
- npm 7.x or later, or Bun 1.x or later
- Git (for version control)
- Access to your deployment platform of choice

## Environment Configuration

The MCP server uses environment variables for configuration. Create a `.env` file in the project root with the following variables:

```
# Server configuration
PUBLIC_MCP_SERVER_NAME="shadcn-svelte-mcp"
PUBLIC_MCP_SERVER_VERSION="1.0.0"
PUBLIC_MCP_SERVER_DESCRIPTION="MCP server for shadcn-svelte documentation"

# CORS configuration (comma-separated list of allowed origins)
ALLOWED_ORIGINS="*"

# Optional: Rate limiting
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=60000

# Optional: Authentication (if enabled)
AUTH_ENABLED=false
AUTH_API_KEY=""
```

For production deployments, make sure to:

1. Set `ALLOWED_ORIGINS` to a specific list of domains rather than `*`
2. Consider enabling authentication for private deployments
3. Adjust rate limiting settings based on expected traffic

## Deployment Options

### Static Adapter (Default)

The project is configured with the SvelteKit static adapter by default, which prebuilds the application into static files that can be served by any static file server.

```bash
# Build the application
npm run build

# The output will be in the 'build' directory
```

### Node.js Server

To deploy as a Node.js server, you need to switch to the Node adapter:

1. Install the Node adapter:

```bash
npm install --save-dev @sveltejs/adapter-node
```

2. Update `svelte.config.js`:

```javascript
import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter()
	}
};

export default config;
```

3. Build and run:

```bash
npm run build
node build
```

### Serverless Functions

For serverless deployment (e.g., AWS Lambda, Vercel Functions), use the appropriate adapter:

1. Install the adapter (example for Vercel):

```bash
npm install --save-dev @sveltejs/adapter-vercel
```

2. Update `svelte.config.js`:

```javascript
import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter()
	}
};

export default config;
```

3. Deploy according to your serverless platform's instructions.

### Docker Container

To deploy as a Docker container:

1. Use the provided Dockerfile in the project root:

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./
EXPOSE 3000
CMD ["node", "build"]
```

2. Build and run the Docker container:

```bash
# Build the Docker image
docker build -t shadcn-svelte-mcp .

# Run the container
docker run -p 3000:3000 --env-file .env shadcn-svelte-mcp
```

## Platform-Specific Guides

### Vercel

1. Connect your GitHub repository to Vercel
2. Configure environment variables in the Vercel dashboard
3. Deploy with default settings (Vercel will auto-detect SvelteKit)

### Netlify

1. Connect your GitHub repository to Netlify
2. Add a `netlify.toml` file to your project:

```toml
[build]
  command = "npm run build"
  publish = "build"

[functions]
  node_bundler = "esbuild"

[[redirects]]
  from = "/*"
  to = "/.netlify/functions/server"
  status = 200

[[headers]]
  for = "/api/*"
  [headers.values]
    Access-Control-Allow-Origin = "*"
    Access-Control-Allow-Methods = "GET, POST, OPTIONS"
    Access-Control-Allow-Headers = "Content-Type"
```

3. Install the Netlify adapter:

```bash
npm install --save-dev @sveltejs/adapter-netlify
```

4. Update `svelte.config.js` to use the Netlify adapter

### Cloudflare Pages

1. Install the Cloudflare adapter:

```bash
npm install --save-dev @sveltejs/adapter-cloudflare
```

2. Update `svelte.config.js`:

```javascript
import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter()
	}
};

export default config;
```

3. Connect your GitHub repository to Cloudflare Pages
4. Configure environment variables in the Cloudflare dashboard

### Self-Hosted

For self-hosting on a VPS or dedicated server:

1. Build the application with the Node adapter
2. Set up a process manager like PM2:

```bash
# Install PM2 globally
npm install -g pm2

# Start the application with PM2
pm2 start build/index.js --name "shadcn-svelte-mcp"

# Ensure PM2 restarts on system reboot
pm2 startup
pm2 save
```

3. Set up a reverse proxy with Nginx:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

4. Secure with SSL using Let's Encrypt

## Post-Deployment Verification

After deploying, verify that the MCP server is functioning correctly:

1. Visit the homepage to ensure the application is running
2. Test the MCP endpoint with a simple request:

```bash
curl -X POST https://your-domain.com/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"type":"tool_discovery"}'
```

3. Check that the response includes the available MCP tools and resources

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure the `ALLOWED_ORIGINS` environment variable is set correctly
2. **Rate Limiting**: Adjust rate limiting settings if legitimate requests are being blocked
3. **Memory Issues**: For serverless deployments, check function memory limits
4. **Cold Start Delays**: For serverless deployments, implement warming strategies if needed

### Logs and Monitoring

- Check application logs for error messages
- Set up monitoring with your platform's tools or a third-party service like Sentry
- Configure health check endpoints to monitor server status

### Getting Help

If you encounter issues not covered in this guide:

1. Check the GitHub repository issues
2. Review the SvelteKit deployment documentation
3. Consult the documentation for your specific deployment platform
