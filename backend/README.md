# JavaMifi Backend API

Lightweight backend for the JavaMifi Ops mini-ERP, built with Express 5, TypeScript, and modern Node.js tooling.

## Tech Stack
- **Framework**: Express 5.x (`express@^5.0.1`)
- **Language**: TypeScript (`typescript@^5.8.2`)
- **Dev Runner**: `tsx watch`
- **Security & Utilities**: `helmet`, `cors`, `dotenv`

## Project Structure
```
backend/
├── src/
│   ├── app.ts                 # Express application setup & /health route
│   └── server.ts              # Server lifecycle & graceful shutdown
├── .env.example
├── .gitignore
├── package.json
└── tsconfig.json
```

## Available Scripts

- `npm run dev`: Start development server with live reload via `tsx watch`
- `npm run build`: Compile TypeScript into `dist/`
- `npm start`: Run the compiled production build from `dist/server.js`
- `npm run typecheck`: Run type verification (`tsc --noEmit`)

## Context-7 Documentation Rule
Whenever adding libraries, database ORMs (e.g., Prisma, Drizzle), payment gateways, or updating Express middleware, query Context-7 (`context7` MCP server) first to reference the latest official documentation and breaking changes.
