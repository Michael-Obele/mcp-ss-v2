# Technology Stack

## Core Technologies

- **Framework**: SvelteKit 2.x with Svelte 5
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.x
- **Build System**: Vite 7.x
- **Package Manager**: npm/bun
- **Testing**: Vitest, Playwright

## Key Dependencies

- **SvelteKit**: `@sveltejs/kit` - Core framework
- **Tailwind CSS**: `tailwindcss` - Utility-first CSS framework
- **Markdown**: `marked` - Markdown parsing
- **Syntax Highlighting**: `highlight.js` - Code syntax highlighting

## Project Structure

The project follows the standard SvelteKit structure with additional organization for MCP-specific components:

- `src/lib/mcp/core/` - Core MCP server implementation
- `src/lib/mcp/tools/` - MCP tool implementations
- `src/lib/mcp/resources/` - MCP resource implementations
- `src/routes/api/mcp/` - API endpoints for MCP protocol

## Common Commands

### Development

```bash
# Start development server
npm run dev

# Start development server and open in browser
npm run dev -- --open
```

### Testing

```bash
# Run unit tests
npm run test:unit

# Run unit tests in watch mode
npm run test:unit -- --watch

# Run end-to-end tests
npm run test:e2e

# Run all tests
npm run test
```

### Building

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Code Quality

```bash
# Check TypeScript and Svelte files
npm run check

# Format code with Prettier
npm run format

# Lint code
npm run lint
```

## Coding Conventions

- Use TypeScript for type safety
- Follow SvelteKit conventions for routing and API endpoints
- Implement comprehensive unit tests for all functionality
- Use async/await for asynchronous operations
- Maintain clear separation between MCP protocol handling and business logic
