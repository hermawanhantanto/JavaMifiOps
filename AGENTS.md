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

## Important Lessons Learned & Design Standards

### 1. API Response Envelope & Centralization
- **Strict Standard Structure**: Every HTTP response (success or failure) must strictly return the unified envelope:
  ```json
  {
    "status": "success" | "error",
    "message": "Human readable message",
    "data": ... | null
  }
  ```
- **Use Centralized Helpers**: Always use `sendSuccess` and `sendError` from `src/common/response.ts`. Never construct manual ad-hoc `res.status().json({...})` payloads inside handlers or middlewares.

### 2. Validation & Zod Schema Best Practices
- **No Redundant Field Aliases**:
  - Never allow dual/duplicate property fallbacks (e.g., accepting both `confirm_password` and `confirmPassword`, or `phone_number` and `phoneNumber`).
  - Stick strictly to a single, unambiguous field naming contract.
  - Explicitly mark required fields as required in the schema; do not make required fields optional with custom fallback resolvers unless backward compatibility is explicitly demanded.
- **Avoid Redundant Regex & Refinement Checks**:
  - Do not add manual string checks for characters (e.g., `!val.includes('-')` or `!val.startsWith('+')`) when a regex already enforces the character set (e.g., `/^62\d+$/` inherently rejects all non-digit characters).
  - Prefer declarative Zod chaining (`.regex()`, `.min()`, `.max()`) over verbose custom `.refine()` blocks when standard validators suffice.

### 3. Custom Error Subclassing & Prototype Chain Integrity
- **Prototype Chain Restoration**: When creating custom error classes that extend `Error` (e.g., `AppError`), always restore the prototype chain in the base constructor:
  ```typescript
  Object.setPrototypeOf(this, new.target.prototype);
  ```
- **Why**: Using `new.target.prototype` dynamically preserves the prototype chain for all derived subclasses (e.g. `ConflictError`, `BadRequestError`), guaranteeing that `err instanceof AppError` and `err instanceof SubclassError` evaluate to `true` inside Express error-handling middleware.

### 4. Centralized Environment Variable Validation (No Insecure Fallbacks)
- **Fail-Fast Startup**: Never use ad-hoc hardcoded fallbacks for secrets or infrastructure variables (e.g., `process.env.JWT_SECRET || 'dev_secret'`). If a critical secret is missing in deployment, the system must fail to start immediately rather than running with an insecure, publicly known secret.
- **Single Source of Truth**: Validate all environment variables centrally in `src/config/env.ts` using Zod (`z.object({...}).safeParse(process.env)`).
- **Type-Safe Access**: Import `env` from `src/config/env.ts` instead of directly accessing untyped `process.env` throughout controllers, services, and middlewares.

### 5. Professional Output & No Emojis/Icons (Strictly Prohibit AI Slop)
- **No Emojis or Icons**: Never use emojis, decorative icons, or ASCII art (e.g., `❌`, `✅`, `🚀`, `🔥`) in source code, log messages, console output, or error payloads. Emojis degrade log ingestion pipelines and look unprofessional.
- **Standard Text Prefixes**: Use clean, standard uppercase prefixes for logging, e.g., `[INFO]`, `[ERROR]`, `[WARN]`, `[DEBUG]`.

### 6. Single Unambiguous Endpoint per Feature (No Redundant Route Aliases)
- **Strict Endpoint Contracts**: Define strictly one route per resource/action (e.g., use `/api/auth/signin` only).
- **No Duplicate Route Aliases**: Never register duplicate route aliases (such as providing both `/signin` and `/login`) unless explicitly demanded by legacy contract requirements.

### 7. Clean Variable & Parameter Naming (No Underscore Prefixes)
- **Standard Names Without Underscores**: Do not use leading underscore prefixes for Express handler parameters, middleware arguments, or catch blocks (e.g., use `req`, `res`, `next`, and `catch (error)` instead of `_req`, `_res`, `_next`, or `_error`).
- **Consistency**: Keep parameter names standard and clean across all controllers, services, and middlewares, even when an argument is not actively read inside the function body.

### 8. Flat Conditional Guard Statements (No Nested If-Blocks)
- **Avoid Nested Ifs**: Avoid nesting `if` conditions when validating existing database resources, unique constraints, or conflict states.
- **Flat Separate Checks**: Keep checks separate and un-nested:
  ```typescript
  // Preferred:
  if (existingDevice && existingDevice.serialNumber === input.serialNumber) {
    throw new ConflictError('Device with this Serial Number already exists');
  }

  if (existingDevice && existingDevice.imei === input.imei) {
    throw new ConflictError('Device with this IMEI already exists');
  }

  // Avoid:
  if (existingDevice) {
    if (existingDevice.serialNumber === input.serialNumber) { ... }
    throw new ConflictError(...);
  }
  ```

### 9. Database-Level Projection (Never Fetch All & Map/Sanitize In-Memory)
- **Push Projections to Database**: When restricting sensitive fields based on user roles (e.g., concealing `imei` and `serialNumber` from `CUSTOMER` roles), do not fetch all columns from the database and then iterate or map in memory with a post-query sanitization function.
- **Prisma `select` by Role**: Build a Prisma `select` projection object based on role (e.g., via `buildDeviceSelect(role)`) so PostgreSQL only queries and transfers permissible columns across the wire, eliminating in-memory iteration overhead.

### 10. Query Object Separation & Variable Pre-assignment
- **Helper Separation**: Encapsulate query building logic (e.g., `where` filter objects and `select` projections) into dedicated feature helper files (e.g., `src/features/<feature>/<feature>.helper.ts`).
- **Store in Variables First**: Store query options into clear, dedicated variables first before passing them to Prisma methods, rather than inlining complex helper invocations directly inside database calls:
  ```typescript
  // Preferred:
  const where = buildDeviceWhereInput(query, role);
  const select = buildDeviceSelect(role);
  const device = await prisma.device.findUnique({ where: { id }, select });

  // Avoid:
  const device = await prisma.device.findUnique({ where: { id }, select: buildDeviceSelect(role) });
  ```

### 11. Snapshot Read Consistency with `prisma.$transaction` for Pagination
- **Use `prisma.$transaction` for `findMany` + `count`**: For paginated queries that execute `findMany` alongside `count`, use `prisma.$transaction([findMany, count])` rather than `Promise.all([findMany, count])`.
- **Why**: Guarantees database snapshot read isolation (`BEGIN ... COMMIT`) to prevent phantom record discrepancies between total count and returned items, while conserving connection pool resources by utilizing a single connection.
