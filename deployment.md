# shadcn-svelte MCP Server Deployment

This document provides quick reference instructions for deploying the shadcn-svelte MCP server. For detailed instructions, see the [full deployment guide](src/lib/documentation/deployment/README.md).

## Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Configuration

Create a `.env` file with the following variables:

```
PUBLIC_MCP_SERVER_NAME="shadcn-svelte-mcp"
PUBLIC_MCP_SERVER_VERSION="1.0.0"
PUBLIC_MCP_SERVER_DESCRIPTION="MCP server for shadcn-svelte documentation"
ALLOWED_ORIGINS="*"
```

### Deployment Options

#### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy with default settings

#### Docker

```bash
# Build Docker image
docker build -t shadcn-svelte-mcp .

# Run container
docker run -p 3000:3000 --env-file .env shadcn-svelte-mcp
```

#### Self-Hosted Node.js

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Start server
node build
```

## Configuration Options

| Environment Variable          | Description                | Default                                      |
| ----------------------------- | -------------------------- | -------------------------------------------- |
| PUBLIC_MCP_SERVER_NAME        | Server name                | "shadcn-svelte-mcp"                          |
| PUBLIC_MCP_SERVER_VERSION     | Server version             | "1.0.0"                                      |
| PUBLIC_MCP_SERVER_DESCRIPTION | Server description         | "MCP server for shadcn-svelte documentation" |
| ALLOWED_ORIGINS               | CORS allowed origins       | "\*"                                         |
| RATE_LIMIT_MAX_REQUESTS       | Max requests per window    | 100                                          |
| RATE_LIMIT_WINDOW_MS          | Rate limit window in ms    | 60000                                        |
| AUTH_ENABLED                  | Enable authentication      | false                                        |
| AUTH_API_KEY                  | API key for authentication | ""                                           |

## System Requirements

- Node.js 18.x or later
- npm 7.x or later, or Bun 1.x or later
- 512MB RAM minimum (1GB+ recommended)
- 1GB disk space minimum

## Health Check

The server provides a health check endpoint at `/api/health` that returns a 200 OK response when the server is running properly.

## Further Information

For detailed deployment instructions, troubleshooting, and platform-specific guides, see the [full deployment guide](src/lib/documentation/deployment/README.md).
