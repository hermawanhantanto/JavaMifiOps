# JavaMifi Backend API

Lightweight backend for the JavaMifi Ops mini-ERP, built with Express 5, TypeScript, Prisma ORM, and PostgreSQL.

## Tech Stack
- **Framework**: Express 5.x (`express@^5.0.1`)
- **ORM**: Prisma 7 (`prisma@^7.10.1`, `@prisma/client@^7.10.1`, `@prisma/adapter-pg`)
- **Database**: PostgreSQL
- **Language**: TypeScript (`typescript@^5.8.2`)
- **Dev Runner**: `tsx watch`
- **Security & Utilities**: `helmet`, `cors`, `dotenv`

## Project Structure
```
backend/
├── prisma/
│   └── schema.prisma          # Prisma schema definition
├── src/
│   ├── config/
│   │   └── prisma.ts          # Global PrismaClient singleton with Postgres adapter
│   ├── app.ts                 # Express application setup & /health route
│   └── server.ts              # Server lifecycle & graceful shutdown
├── .env.example
├── .gitignore
├── package.json
├── prisma.config.ts           # Prisma CLI configuration
└── tsconfig.json
```

## Available Scripts

- `npm run dev`: Start development server with live reload via `tsx watch`
- `npm run build`: Compile TypeScript into `dist/`
- `npm start`: Run the compiled production build from `dist/server.js`
- `npm run typecheck`: Run type verification (`tsc --noEmit`)
- `npm run prisma:generate`: Generate Prisma Client types
- `npm run prisma:migrate`: Run Prisma database migrations

## Context-7 Documentation Rule
Whenever adding libraries, database ORMs (e.g., Prisma, Drizzle), payment gateways, or updating Express middleware, query Context-7 (`context7` MCP server) first to reference the latest official documentation and breaking changes.
