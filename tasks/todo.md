# Event Layout Planner - Tasks

## Task: Setup Docker for Local Development

### Problem Analysis
The project needs Docker containerization for local development to ensure consistent environments across developers and easier setup.

**Current Stack:**
- Next.js 16 (React 19)
- PostgreSQL (currently using Supabase remote)
- Prisma ORM
- NextAuth for authentication
- pnpm package manager

### Brainstorming - Options

#### Option A: Minimal - Docker Compose with Local PostgreSQL Only (SELECTED)
- Only containerize PostgreSQL for local development
- Run Next.js app directly on host (using `pnpm dev`)
- Simplest setup, fastest development iteration
- **Pros:** Fast hot-reload, minimal Docker config
- **Cons:** Requires Node.js/pnpm installed locally

#### Option B: Full Stack - Docker Compose with App + PostgreSQL
- Containerize both Next.js app and PostgreSQL
- Complete isolated development environment
- **Pros:** No local dependencies needed (except Docker)
- **Cons:** Slower hot-reload (volume mounting), larger setup

#### Option C: Production-Ready - Multi-stage Dockerfile
- Add production-optimized Dockerfile with multi-stage builds
- Include development docker-compose with hot-reload
- Separate production docker-compose
- **Pros:** Ready for deployment
- **Cons:** More complexity

---

## Todo List

### Docker Setup
- [x] 1. Create docker-compose.yml with PostgreSQL service
- [x] 2. Create .env.example with template environment variables
- [x] 3. Create .dockerignore file
- [x] 4. Update prisma schema to use DATABASE_URL environment variable
- [x] 5. Test Docker setup works

---

## Review

### Changes Made

1. **Created `docker-compose.yml`**
   - PostgreSQL 16 Alpine image
   - Container named `event-planner-db`
   - Credentials: postgres/postgres
   - Database: event_planner
   - Port: 5432
   - Persistent volume for data

2. **Created `.env.example`**
   - Template for DATABASE_URL and DIRECT_URL pointing to local Docker PostgreSQL
   - NextAuth configuration placeholders
   - Gemini API key placeholder

3. **Created `.dockerignore`**
   - Excludes node_modules, .next, .git, env files, and logs

4. **Updated `prisma/schema.prisma`**
   - Added `url = env("DATABASE_URL")` to datasource
   - Added `directUrl = env("DIRECT_URL")` for migrations

### Usage Instructions

```bash
# 1. Start PostgreSQL container
docker-compose up -d

# 2. Copy environment variables (first time only)
cp .env.example .env
# Then edit .env with your actual NEXTAUTH_SECRET and GEMINI_API_KEY

# 3. Run Prisma migrations
pnpm prisma migrate dev

# 4. Generate Prisma client
pnpm prisma generate

# 5. Start the development server
pnpm dev
```

### Switching Between Local Docker and Supabase

To use **local Docker PostgreSQL**:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/event_planner"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/event_planner"
```

To use **Supabase** (production/remote):
```
DATABASE_URL="postgresql://...@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://...@aws-1-ap-south-1.pooler.supabase.com:5432/postgres"
```
