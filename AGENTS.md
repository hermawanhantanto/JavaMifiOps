# AI Agent Guidelines & Operating Rules

## Documentation & Library Fetch Rule (Context-7)
- **Mandatory Context-7 Documentation Rule**:
  - Whenever introducing, configuring, upgrading, or writing code for any library, framework, or tool (such as Express, Prisma/Drizzle, Zod, Cors, Helmet, etc.), agents **MUST** query Context-7 (`context7` MCP server: `resolve-library-id` followed by `query-docs`) to obtain the latest official API documentation, breaking changes, and modern TypeScript patterns.
  - Agents must explicitly mention this rule and cite the Context-7 fetched documentation for each operation that requires external library knowledge.

## Backend Architecture & Conventions
- **Runtime**: Node.js (>=18, current v24+)
- **Framework**: Express 5.x with TypeScript
- **Modularity**: Separation of concerns (`routes`, `controllers`, `services`, `middlewares`, `config`).
- **Error Handling**: Leverage Express 5 native async error propagation to the global error middleware.
- **Environment**: Strongly validated environment variables.
