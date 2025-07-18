# Project Structure

## Directory Organization

The project follows a modular structure organized around the MCP server implementation within a SvelteKit application:

```
/
├── src/
│   ├── lib/
│   │   ├── mcp/
│   │   │   ├── core/           # Core MCP server implementation
│   │   │   │   ├── documentation-store.ts    # Component documentation storage
│   │   │   │   ├── init.ts                   # Server initialization
│   │   │   │   ├── initial-data.ts           # Initial documentation data
│   │   │   │   ├── protocol-handlers.ts      # MCP protocol handlers
│   │   │   │   ├── search-utils.ts           # Search utilities
│   │   │   │   ├── server.ts                 # Main server implementation
│   │   │   │   ├── types.ts                  # Type definitions
│   │   │   │   └── validation.ts             # Data validation
│   │   │   ├── tools/          # MCP tool implementations
│   │   │   │   ├── handlers.ts              # Tool handlers
│   │   │   │   └── index.ts                 # Tool definitions
│   │   │   └── resources/      # MCP resource implementations
│   │   │       └── index.ts                 # Resource definitions
│   │   └── documentation/      # Component documentation content
│   │       ├── components/     # Component-specific documentation
│   │       ├── examples/       # Code examples
│   │       ├── theming/        # Theming documentation
│   │       └── troubleshooting/ # Troubleshooting guides
│   ├── routes/
│   │   ├── api/
│   │   │   └── mcp/
│   │   │       └── +server.ts  # MCP API endpoint
│   │   └── +page.svelte        # Homepage with documentation
│   └── app.html                # SvelteKit app template
├── static/                     # Static assets
├── tests/                      # Test files
└── .kiro/
    └── specs/                  # Project specifications
        └── shadcn-svelte-mcp/  # MCP server spec
```

## Key Files

### Core MCP Implementation

- `src/lib/mcp/core/server.ts` - Main MCP server implementation
- `src/lib/mcp/core/documentation-store.ts` - Component documentation storage
- `src/lib/mcp/core/types.ts` - Type definitions for components and MCP protocol
- `src/lib/mcp/core/protocol-handlers.ts` - MCP protocol request/response handlers

### API Endpoints

- `src/routes/api/mcp/+server.ts` - HTTP endpoint for MCP protocol

### Tools and Resources

- `src/lib/mcp/tools/index.ts` - MCP tool definitions
- `src/lib/mcp/tools/handlers.ts` - Tool implementation handlers
- `src/lib/mcp/resources/index.ts` - MCP resource definitions

### Documentation

- `src/lib/documentation/` - Component documentation content

## Architecture Patterns

### Core Principles

1. **Modular Design**: Each component has a single responsibility and is designed to be testable in isolation.

2. **Type Safety**: Comprehensive TypeScript types for all data structures and interfaces.

3. **Protocol Separation**: Clear separation between MCP protocol handling and business logic.

4. **Testability**: All components designed with testing in mind, with corresponding test files.

### Data Flow

1. HTTP requests arrive at the API endpoint (`src/routes/api/mcp/+server.ts`)
2. Requests are parsed and validated by protocol handlers
3. Tool or resource requests are routed to the appropriate handlers
4. Documentation is retrieved from the documentation store
5. Responses are formatted according to the MCP protocol
6. Formatted responses are returned to the client

### Testing Strategy

- Unit tests for individual components (`.test.ts` files alongside implementation)
- Integration tests for API endpoints
- End-to-end tests for complete request/response flow
